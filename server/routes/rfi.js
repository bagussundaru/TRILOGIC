import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all RFIs for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status } = req.query;

        let query = `
            SELECT r.*, w.wbs_code, u.full_name as created_by_name
            FROM rfis r
            LEFT JOIN wbs_items w ON r.wbs_id = w.id
            LEFT JOIN users u ON r.created_by = u.id
            WHERE r.project_id = ?
        `;
        const params = [projectId];

        if (status && status !== 'all') {
            query += ' AND r.status = ?';
            params.push(status);
        }

        query += ' ORDER BY r.created_at DESC';

        const [rfis] = await pool.query(query, params);

        // Get stats
        const [stats] = await pool.query(`
            SELECT 
                status, COUNT(*) as count,
                AVG(CASE WHEN answered_date IS NOT NULL 
                    THEN DATEDIFF(answered_date, submitted_date) 
                    ELSE NULL END) as avg_response_days
            FROM rfis WHERE project_id = ?
            GROUP BY status
        `, [projectId]);

        res.json({ success: true, data: { rfis, stats } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create RFI
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { project_id, subject, description, wbs_id, priority, submitted_to, due_date } = req.body;
        const id = uuidv4();

        // Generate RFI number
        const [count] = await pool.query('SELECT COUNT(*) as cnt FROM rfis WHERE project_id = ?', [project_id]);
        const rfiNumber = `RFI-${String(count[0].cnt + 1).padStart(3, '0')}`;

        await pool.query(`
            INSERT INTO rfis (id, project_id, rfi_number, subject, description, wbs_id, priority, submitted_to, due_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, project_id, rfiNumber, subject, description, wbs_id, priority || 'Medium', submitted_to || 'Konsultan', due_date, req.user?.id]);

        const [newRfi] = await pool.query('SELECT * FROM rfis WHERE id = ?', [id]);
        res.status(201).json({ success: true, data: newRfi[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit RFI
router.patch('/:id/submit', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(`
            UPDATE rfis SET status = 'Submitted', submitted_date = CURDATE() WHERE id = ?
        `, [id]);

        res.json({ success: true, message: 'RFI submitted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Answer RFI
router.patch('/:id/answer', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        await pool.query(`
            UPDATE rfis SET status = 'Answered', response = ?, answered_date = CURDATE(), answered_by = ?
            WHERE id = ?
        `, [response, req.user?.id, id]);

        res.json({ success: true, message: 'RFI answered' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Close RFI
router.patch('/:id/close', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('UPDATE rfis SET status = ? WHERE id = ?', ['Closed', id]);
        res.json({ success: true, message: 'RFI closed' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
