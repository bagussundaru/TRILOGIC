import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// GET /api/projects - List all projects
router.get('/', async (req, res) => {
    try {
        const { status, health, limit = 50 } = req.query;

        let sql = 'SELECT * FROM projects WHERE 1=1';
        const params = [];

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (health) {
            sql += ' AND health_status = ?';
            params.push(health);
        }

        sql += ' ORDER BY created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const projects = await query(sql, params);

        res.json({
            success: true,
            data: projects,
            count: projects.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
    try {
        const [project] = await query('SELECT * FROM projects WHERE id = ?', [req.params.id]);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Get related tasks
        const tasks = await query('SELECT * FROM tasks WHERE project_id = ?', [req.params.id]);

        // Get related risks
        const risks = await query('SELECT * FROM risks WHERE project_id = ?', [req.params.id]);

        res.json({
            success: true,
            data: { ...project, tasks, risks }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/projects - Create project
router.post('/', async (req, res) => {
    try {
        const {
            project_code,
            name,
            description,
            type = 'IT',
            status = 'Planning',
            priority = 'Medium',
            budget_allocated = 0,
            start_date,
            target_end_date,
            customer_region,
            pm_id
        } = req.body;

        const id = crypto.randomUUID();

        await query(`
            INSERT INTO projects (id, project_code, name, description, type, status, priority, budget_allocated, start_date, target_end_date, customer_region, pm_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, project_code, name, description, type, status, priority, budget_allocated, start_date, target_end_date, customer_region, pm_id]);

        const [project] = await query('SELECT * FROM projects WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const fields = Object.keys(updates).filter(k => k !== 'id');

        if (fields.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => updates[f]);
        values.push(req.params.id);

        await query(`UPDATE projects SET ${setClause} WHERE id = ?`, values);

        const [project] = await query('SELECT * FROM projects WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
    try {
        await query('DELETE FROM projects WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Project deleted'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/projects/stats/summary - Dashboard summary
router.get('/stats/summary', async (req, res) => {
    try {
        const [stats] = await query(`
            SELECT 
                COUNT(*) as total_projects,
                SUM(CASE WHEN status IN ('Planning', 'In Progress') THEN 1 ELSE 0 END) as active_projects,
                SUM(CASE WHEN health_status IN ('At Risk', 'Critical') THEN 1 ELSE 0 END) as at_risk_projects,
                SUM(budget_allocated) as total_budget,
                SUM(budget_spent) as total_spent,
                AVG(completion_percentage) as avg_completion
            FROM projects
        `);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
