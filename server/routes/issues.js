import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all issues for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status, severity } = req.query;

        let query = `
            SELECT i.*, w.wbs_code, 
                u1.full_name as reported_by_name,
                u2.full_name as assigned_to_name
            FROM issues i
            LEFT JOIN wbs_items w ON i.wbs_id = w.id
            LEFT JOIN users u1 ON i.reported_by = u1.id
            LEFT JOIN users u2 ON i.assigned_to = u2.id
            WHERE i.project_id = ?
        `;
        const params = [projectId];

        if (status && status !== 'all') {
            query += ' AND i.status = ?';
            params.push(status);
        }
        if (severity) {
            query += ' AND i.severity = ?';
            params.push(severity);
        }

        query += ' ORDER BY i.created_at DESC';

        const [issues] = await pool.query(query, params);

        // Stats
        const [stats] = await pool.query(`
            SELECT 
                status, severity, COUNT(*) as count
            FROM issues WHERE project_id = ?
            GROUP BY status, severity
        `, [projectId]);

        res.json({ success: true, data: { issues, stats } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create issue
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { project_id, title, description, issue_type, severity, wbs_id, location, assigned_to, due_date } = req.body;
        const id = uuidv4();

        // Generate issue number
        const [count] = await pool.query('SELECT COUNT(*) as cnt FROM issues WHERE project_id = ?', [project_id]);
        const issueNumber = `ISS-${String(count[0].cnt + 1).padStart(3, '0')}`;

        await pool.query(`
            INSERT INTO issues (id, project_id, issue_number, title, description, issue_type, severity, wbs_id, location, assigned_to, due_date, reported_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, project_id, issueNumber, title, description, issue_type || 'Quality', severity || 'Minor', wbs_id, location, assigned_to, due_date, req.user?.id]);

        const [newIssue] = await pool.query('SELECT * FROM issues WHERE id = ?', [id]);
        res.status(201).json({ success: true, data: newIssue[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update issue status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, root_cause, corrective_action } = req.body;

        const updates = ['status = ?'];
        const values = [status];

        if (root_cause) { updates.push('root_cause = ?'); values.push(root_cause); }
        if (corrective_action) { updates.push('corrective_action = ?'); values.push(corrective_action); }
        if (status === 'Resolved' || status === 'Closed') {
            updates.push('resolved_date = CURDATE()');
        }

        values.push(id);
        await pool.query(`UPDATE issues SET ${updates.join(', ')} WHERE id = ?`, values);

        res.json({ success: true, message: 'Issue updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete issue
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM issues WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Issue deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
