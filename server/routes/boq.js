import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all BOQ items for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { category } = req.query;

        let query = `
            SELECT 
                b.*,
                (b.contract_qty * b.contract_price) as contract_amount,
                (b.executed_qty * b.contract_price) as executed_amount,
                (b.executed_qty / NULLIF(b.contract_qty, 0) * 100) as progress_pct,
                w.wbs_code,
                w.name as wbs_name
            FROM boq_items b
            LEFT JOIN wbs_items w ON b.wbs_id = w.id
            WHERE b.project_id = ?
        `;

        const params = [projectId];

        if (category) {
            query += ' AND b.category = ?';
            params.push(category);
        }

        query += ' ORDER BY b.category, b.boq_code';

        const [items] = await pool.query(query, params);

        // Calculate summary by category
        const [summary] = await pool.query(`
            SELECT 
                category,
                COUNT(*) as item_count,
                SUM(contract_qty * contract_price) as contract_total,
                SUM(executed_qty * contract_price) as executed_total,
                AVG(executed_qty / NULLIF(contract_qty, 0) * 100) as avg_progress
            FROM boq_items
            WHERE project_id = ?
            GROUP BY category
        `, [projectId]);

        // Grand totals
        const [totals] = await pool.query(`
            SELECT 
                SUM(contract_qty * contract_price) as grand_contract,
                SUM(executed_qty * contract_price) as grand_executed,
                SUM(variation_qty * COALESCE(variation_price, contract_price)) as grand_variation
            FROM boq_items
            WHERE project_id = ?
        `, [projectId]);

        res.json({
            success: true,
            data: {
                items,
                byCategory: summary,
                totals: totals[0]
            }
        });
    } catch (error) {
        console.error('Error fetching BOQ:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create BOQ item
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            project_id,
            wbs_id,
            boq_code,
            description,
            specification,
            unit,
            contract_qty,
            contract_price,
            category,
            remarks
        } = req.body;

        const id = uuidv4();

        await pool.query(`
            INSERT INTO boq_items (
                id, project_id, wbs_id, boq_code, description, specification,
                unit, contract_qty, contract_price, category, remarks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, project_id, wbs_id || null, boq_code, description, specification,
            unit, contract_qty || 0, contract_price || 0,
            category || 'Pekerjaan Struktur', remarks
        ]);

        const [newItem] = await pool.query('SELECT * FROM boq_items WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: newItem[0],
            message: 'BOQ item created successfully'
        });
    } catch (error) {
        console.error('Error creating BOQ item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Bulk import BOQ items (for Excel import)
router.post('/bulk-import', authenticateToken, async (req, res) => {
    try {
        const { project_id, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, error: 'No items to import' });
        }

        const insertedIds = [];

        for (const item of items) {
            const id = uuidv4();

            await pool.query(`
                INSERT INTO boq_items (
                    id, project_id, boq_code, description, specification,
                    unit, contract_qty, contract_price, category
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id, project_id,
                item.boq_code || '',
                item.description || '',
                item.specification || '',
                item.unit || 'ls',
                item.contract_qty || 0,
                item.contract_price || 0,
                item.category || 'Pekerjaan Lainnya'
            ]);

            insertedIds.push(id);
        }

        res.status(201).json({
            success: true,
            message: `${insertedIds.length} BOQ items imported successfully`,
            data: { count: insertedIds.length }
        });
    } catch (error) {
        console.error('Error bulk importing BOQ:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update BOQ item (executed qty)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const allowedFields = [
            'description', 'specification', 'unit', 'contract_qty',
            'contract_price', 'executed_qty', 'variation_qty',
            'variation_price', 'category', 'remarks', 'wbs_id'
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

        await pool.query(`
            UPDATE boq_items SET ${setClause.join(', ')} WHERE id = ?
        `, values);

        const [updatedItem] = await pool.query('SELECT * FROM boq_items WHERE id = ?', [id]);

        res.json({
            success: true,
            data: updatedItem[0],
            message: 'BOQ item updated successfully'
        });
    } catch (error) {
        console.error('Error updating BOQ item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update executed quantity for a BOQ item
router.patch('/:id/progress', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { executed_qty } = req.body;

        await pool.query(`
            UPDATE boq_items SET executed_qty = ? WHERE id = ?
        `, [executed_qty, id]);

        const [updatedItem] = await pool.query(`
            SELECT 
                *,
                (contract_qty * contract_price) as contract_amount,
                (executed_qty * contract_price) as executed_amount,
                (executed_qty / NULLIF(contract_qty, 0) * 100) as progress_pct
            FROM boq_items WHERE id = ?
        `, [id]);

        res.json({
            success: true,
            data: updatedItem[0]
        });
    } catch (error) {
        console.error('Error updating BOQ progress:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete BOQ item
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM boq_items WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'BOQ item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting BOQ item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get BOQ summary for S-Curve calculation
router.get('/project/:projectId/s-curve', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        // Get project timeline
        const [project] = await pool.query(`
            SELECT construction_start, construction_end, contract_value
            FROM projects WHERE id = ?
        `, [projectId]);

        if (!project[0]) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Get total contract and executed values
        const [totals] = await pool.query(`
            SELECT 
                SUM(contract_qty * contract_price) as pv_total,
                SUM(executed_qty * contract_price) as ev_total
            FROM boq_items
            WHERE project_id = ?
        `, [projectId]);

        res.json({
            success: true,
            data: {
                project: project[0],
                pv: totals[0]?.pv_total || 0,
                ev: totals[0]?.ev_total || 0,
                progress: totals[0]?.pv_total > 0
                    ? (totals[0].ev_total / totals[0].pv_total * 100)
                    : 0
            }
        });
    } catch (error) {
        console.error('Error fetching S-Curve data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
