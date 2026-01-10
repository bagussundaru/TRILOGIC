import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all payment certificates for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        const [certificates] = await pool.query(`
            SELECT 
                pc.*,
                u.full_name as created_by_name,
                (pc.previous_certified + pc.this_period) as cumulative,
                p.contract_value,
                p.retention_percentage
            FROM payment_certificates pc
            LEFT JOIN users u ON pc.created_by = u.id
            LEFT JOIN projects p ON pc.project_id = p.id
            WHERE pc.project_id = ?
            ORDER BY pc.period_end DESC
        `, [projectId]);

        // Calculate totals
        const [totals] = await pool.query(`
            SELECT 
                SUM(this_period) as total_certified,
                SUM(retention_amount) as total_retention,
                SUM(net_payment) as total_paid,
                COUNT(*) as certificate_count
            FROM payment_certificates
            WHERE project_id = ? AND status = 'Paid'
        `, [projectId]);

        res.json({
            success: true,
            data: {
                certificates,
                totals: totals[0]
            }
        });
    } catch (error) {
        console.error('Error fetching payment certificates:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create payment certificate
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            project_id,
            period_start,
            period_end,
            previous_certified,
            this_period,
            retention_percentage = 5,
            ppn_percentage = 11,
            pph_percentage = 2,
            notes
        } = req.body;

        const id = uuidv4();

        // Calculate amounts
        const cumulative = (previous_certified || 0) + (this_period || 0);
        const retention_amount = cumulative * (retention_percentage / 100);
        const ppn_amount = this_period * (ppn_percentage / 100);
        const pph_amount = this_period * (pph_percentage / 100);
        const net_payment = this_period - retention_amount + ppn_amount - pph_amount;

        // Generate certificate number
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as cnt FROM payment_certificates WHERE project_id = ?',
            [project_id]
        );
        const certNumber = `MC-${String(countResult[0].cnt + 1).padStart(3, '0')}`;

        await pool.query(`
            INSERT INTO payment_certificates (
                id, project_id, certificate_number, period_start, period_end,
                previous_certified, this_period, retention_amount,
                ppn_amount, pph_amount, net_payment,
                status, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?, ?)
        `, [
            id, project_id, certNumber, period_start, period_end,
            previous_certified || 0, this_period || 0, retention_amount,
            ppn_amount, pph_amount, net_payment,
            notes, req.user?.id || null
        ]);

        const [newCert] = await pool.query('SELECT * FROM payment_certificates WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: newCert[0],
            message: 'Sertifikat pembayaran berhasil dibuat'
        });
    } catch (error) {
        console.error('Error creating payment certificate:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update payment certificate status (approval workflow)
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['Draft', 'Submitted', 'Consultant Approved', 'Owner Approved', 'Paid', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const updates = { status };
        const today = new Date().toISOString().split('T')[0];

        // Set approval dates based on status
        if (status === 'Submitted') {
            updates.submitted_date = today;
        } else if (status === 'Consultant Approved') {
            updates.consultant_approval_date = today;
        } else if (status === 'Owner Approved') {
            updates.owner_approval_date = today;
        } else if (status === 'Paid') {
            updates.payment_date = today;
        }

        if (notes) {
            updates.notes = notes;
        }

        const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), id];

        await pool.query(`UPDATE payment_certificates SET ${setClause} WHERE id = ?`, values);

        const [updatedCert] = await pool.query('SELECT * FROM payment_certificates WHERE id = ?', [id]);

        res.json({
            success: true,
            data: updatedCert[0],
            message: `Status diubah ke "${status}"`
        });
    } catch (error) {
        console.error('Error updating certificate status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update payment certificate
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Recalculate if amounts changed
        if (updates.this_period !== undefined) {
            const retention_pct = updates.retention_percentage || 5;
            const ppn_pct = updates.ppn_percentage || 11;
            const pph_pct = updates.pph_percentage || 2;

            const cumulative = (updates.previous_certified || 0) + updates.this_period;
            updates.retention_amount = cumulative * (retention_pct / 100);
            updates.ppn_amount = updates.this_period * (ppn_pct / 100);
            updates.pph_amount = updates.this_period * (pph_pct / 100);
            updates.net_payment = updates.this_period - updates.retention_amount + updates.ppn_amount - updates.pph_amount;
        }

        const allowedFields = [
            'period_start', 'period_end', 'previous_certified', 'this_period',
            'retention_amount', 'ppn_amount', 'pph_amount', 'net_payment', 'notes'
        ];

        const setClause = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (setClause.length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
        }

        values.push(id);

        await pool.query(`UPDATE payment_certificates SET ${setClause.join(', ')} WHERE id = ?`, values);

        const [updatedCert] = await pool.query('SELECT * FROM payment_certificates WHERE id = ?', [id]);

        res.json({
            success: true,
            data: updatedCert[0]
        });
    } catch (error) {
        console.error('Error updating certificate:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete payment certificate
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM payment_certificates WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Sertifikat pembayaran berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting certificate:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
