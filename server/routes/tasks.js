import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// GET /api/tasks - List all tasks
router.get('/', async (req, res) => {
    try {
        const { project_id, status, assignee_id, limit = 100 } = req.query;

        let sql = 'SELECT t.*, p.name as project_name FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE 1=1';
        const params = [];

        if (project_id) {
            sql += ' AND t.project_id = ?';
            params.push(project_id);
        }

        if (status) {
            sql += ' AND t.status = ?';
            params.push(status);
        }

        if (assignee_id) {
            sql += ' AND t.assignee_id = ?';
            params.push(assignee_id);
        }

        sql += ' ORDER BY t.due_date ASC LIMIT ?';
        params.push(parseInt(limit));

        const tasks = await query(sql, params);

        res.json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/tasks - Create task
router.post('/', async (req, res) => {
    try {
        const {
            project_id,
            task_name,
            description,
            status = 'To Do',
            priority = 'Medium',
            assignee_id,
            estimated_hours,
            start_date,
            due_date
        } = req.body;

        const id = crypto.randomUUID();
        const task_code = `TSK-${Date.now().toString(36).toUpperCase()}`;

        await query(`
            INSERT INTO tasks (id, project_id, task_code, task_name, description, status, priority, assignee_id, estimated_hours, start_date, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, project_id, task_code, task_name, description, status, priority, assignee_id, estimated_hours, start_date, due_date]);

        const [task] = await query('SELECT * FROM tasks WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/tasks/:id - Update task
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

        await query(`UPDATE tasks SET ${setClause} WHERE id = ?`, values);

        const [task] = await query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
    try {
        await query('DELETE FROM tasks WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Task deleted'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/tasks/stats/summary - Task statistics  
router.get('/stats/summary', async (req, res) => {
    try {
        const [stats] = await query(`
            SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                SUM(CASE WHEN status = 'Blocked' THEN 1 ELSE 0 END) as blocked_tasks,
                SUM(CASE WHEN due_date < CURDATE() AND status != 'Done' THEN 1 ELSE 0 END) as overdue_tasks
            FROM tasks
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
