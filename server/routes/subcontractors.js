import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all subcontractors
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [subcons] = await pool.query('SELECT * FROM subcontractors WHERE is_active = TRUE ORDER BY overall_rating DESC');
        res.json({ success: true, data: subcons });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create subcontractor
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, company_name, npwp, contact_person, phone, email, address, specialization } = req.body;
        const id = uuidv4();

        await pool.query(`
            INSERT INTO subcontractors (id, name, company_name, npwp, contact_person, phone, email, address, specialization)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, name, company_name, npwp, contact_person, phone, email, address, specialization || 'Lainnya']);

        const [newSubcon] = await pool.query('SELECT * FROM subcontractors WHERE id = ?', [id]);
        res.status(201).json({ success: true, data: newSubcon[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get assignments for project
router.get('/project/:projectId/assignments', authenticateToken, async (req, res) => {
    try {
        const [assignments] = await pool.query(`
            SELECT sa.*, s.name as subcon_name, s.specialization, s.overall_rating, w.wbs_code
            FROM subcontractor_assignments sa
            JOIN subcontractors s ON sa.subcontractor_id = s.id
            LEFT JOIN wbs_items w ON sa.wbs_id = w.id
            WHERE sa.project_id = ?
        `, [req.params.projectId]);
        res.json({ success: true, data: assignments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create assignment
router.post('/assignments', authenticateToken, async (req, res) => {
    try {
        const { project_id, subcontractor_id, wbs_id, scope_description, contract_value, start_date, end_date } = req.body;
        const id = uuidv4();

        await pool.query(`
            INSERT INTO subcontractor_assignments (id, project_id, subcontractor_id, wbs_id, scope_description, contract_value, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, project_id, subcontractor_id, wbs_id, scope_description, contract_value, start_date, end_date]);

        res.status(201).json({ success: true, message: 'Assignment created' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add rating
router.post('/assignments/:assignmentId/rate', authenticateToken, async (req, res) => {
    try {
        const { quality_score, schedule_score, safety_score, cooperation_score, comments } = req.body;
        const id = uuidv4();
        const overall = (quality_score + schedule_score + safety_score + cooperation_score) / 4;

        await pool.query(`
            INSERT INTO subcontractor_ratings (id, assignment_id, rating_date, quality_score, schedule_score, safety_score, cooperation_score, overall_score, comments, rated_by)
            VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?)
        `, [id, req.params.assignmentId, quality_score, schedule_score, safety_score, cooperation_score, overall, comments, req.user?.id]);

        res.status(201).json({ success: true, message: 'Rating recorded' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
