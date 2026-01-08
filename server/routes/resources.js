import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// GET /api/resources - List all resources
router.get('/', async (req, res) => {
    try {
        const { type, status, limit = 100 } = req.query;

        let sql = 'SELECT * FROM resources WHERE 1=1';
        const params = [];

        if (type) {
            sql += ' AND type = ?';
            params.push(type);
        }

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        sql += ' ORDER BY name ASC LIMIT ?';
        params.push(parseInt(limit));

        const resources = await query(sql, params);

        // Parse JSON fields
        const parsed = resources.map(r => ({
            ...r,
            skills: r.skills ? JSON.parse(r.skills) : [],
            certifications: r.certifications ? JSON.parse(r.certifications) : []
        }));

        res.json({
            success: true,
            data: parsed,
            count: parsed.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/resources - Create resource
router.post('/', async (req, res) => {
    try {
        const {
            name,
            type = 'Human',
            role,
            department,
            email,
            phone,
            capacity_hours_per_month = 160,
            hourly_rate,
            skills = [],
            status = 'Available'
        } = req.body;

        const id = crypto.randomUUID();

        await query(`
            INSERT INTO resources (id, name, type, role, department, email, phone, capacity_hours_per_month, hourly_rate, skills, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, name, type, role, department, email, phone, capacity_hours_per_month, hourly_rate, JSON.stringify(skills), status]);

        const [resource] = await query('SELECT * FROM resources WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: {
                ...resource,
                skills: JSON.parse(resource.skills || '[]')
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/resources/:id - Update resource
router.put('/:id', async (req, res) => {
    try {
        const updates = { ...req.body };

        // Stringify JSON fields
        if (updates.skills) updates.skills = JSON.stringify(updates.skills);
        if (updates.certifications) updates.certifications = JSON.stringify(updates.certifications);

        const fields = Object.keys(updates).filter(k => k !== 'id');

        if (fields.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => updates[f]);
        values.push(req.params.id);

        await query(`UPDATE resources SET ${setClause} WHERE id = ?`, values);

        const [resource] = await query('SELECT * FROM resources WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            data: {
                ...resource,
                skills: JSON.parse(resource.skills || '[]')
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/resources/:id - Delete resource
router.delete('/:id', async (req, res) => {
    try {
        await query('DELETE FROM resources WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Resource deleted'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/resources/stats/capacity - Capacity statistics
router.get('/stats/capacity', async (req, res) => {
    try {
        // Get resource allocations
        const allocations = await query(`
            SELECT 
                r.id,
                r.name,
                r.capacity_hours_per_month,
                COALESCE(SUM(ra.allocated_hours), 0) as allocated_hours
            FROM resources r
            LEFT JOIN resource_allocations ra ON r.id = ra.resource_id AND ra.status = 'Active'
            WHERE r.type = 'Human'
            GROUP BY r.id
        `);

        const stats = {
            total_resources: allocations.length,
            available: allocations.filter(r => r.allocated_hours < r.capacity_hours_per_month * 0.5).length,
            busy: allocations.filter(r => r.allocated_hours >= r.capacity_hours_per_month * 0.5 && r.allocated_hours < r.capacity_hours_per_month).length,
            overloaded: allocations.filter(r => r.allocated_hours >= r.capacity_hours_per_month).length
        };

        res.json({
            success: true,
            data: stats,
            details: allocations
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
