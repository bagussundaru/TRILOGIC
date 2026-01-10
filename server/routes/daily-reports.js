import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all daily reports for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { limit = 30, offset = 0 } = req.query;

        const [reports] = await pool.query(`
            SELECT 
                dr.*,
                u.full_name as created_by_name
            FROM daily_reports dr
            LEFT JOIN users u ON dr.created_by = u.id
            WHERE dr.project_id = ?
            ORDER BY dr.report_date DESC
            LIMIT ? OFFSET ?
        `, [projectId, parseInt(limit), parseInt(offset)]);

        // Parse JSON fields
        const parsedReports = reports.map(r => ({
            ...r,
            workers_detail: typeof r.workers_detail === 'string' ? JSON.parse(r.workers_detail) : r.workers_detail,
            equipment_onsite: typeof r.equipment_onsite === 'string' ? JSON.parse(r.equipment_onsite) : r.equipment_onsite,
            photos: typeof r.photos === 'string' ? JSON.parse(r.photos) : r.photos
        }));

        // Get count
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM daily_reports WHERE project_id = ?',
            [projectId]
        );

        res.json({
            success: true,
            data: {
                reports: parsedReports,
                total: countResult[0].total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('Error fetching daily reports:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single daily report
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [reports] = await pool.query(`
            SELECT dr.*, u.full_name as created_by_name
            FROM daily_reports dr
            LEFT JOIN users u ON dr.created_by = u.id
            WHERE dr.id = ?
        `, [id]);

        if (reports.length === 0) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        const report = {
            ...reports[0],
            workers_detail: typeof reports[0].workers_detail === 'string'
                ? JSON.parse(reports[0].workers_detail)
                : reports[0].workers_detail,
            equipment_onsite: typeof reports[0].equipment_onsite === 'string'
                ? JSON.parse(reports[0].equipment_onsite)
                : reports[0].equipment_onsite,
            photos: typeof reports[0].photos === 'string'
                ? JSON.parse(reports[0].photos)
                : reports[0].photos
        };

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error fetching daily report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create daily report
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            project_id,
            report_date,
            weather,
            work_start_time,
            work_end_time,
            total_workers,
            workers_detail,
            equipment_onsite,
            work_description,
            issues_encountered,
            site_engineer,
            project_manager,
            consultant_engineer
        } = req.body;

        const id = uuidv4();

        await pool.query(`
            INSERT INTO daily_reports (
                id, project_id, report_date, weather, 
                work_start_time, work_end_time, total_workers,
                workers_detail, equipment_onsite, work_description,
                issues_encountered, site_engineer, project_manager,
                consultant_engineer, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, project_id, report_date, weather || 'Cerah',
            work_start_time, work_end_time, total_workers || 0,
            workers_detail, equipment_onsite, work_description,
            issues_encountered, site_engineer, project_manager,
            consultant_engineer, req.user?.id || null
        ]);

        const [newReport] = await pool.query('SELECT * FROM daily_reports WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: newReport[0],
            message: 'Laporan harian berhasil disimpan'
        });
    } catch (error) {
        console.error('Error creating daily report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update daily report
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const allowedFields = [
            'weather', 'work_start_time', 'work_end_time', 'total_workers',
            'workers_detail', 'equipment_onsite', 'work_description',
            'issues_encountered', 'site_engineer', 'project_manager',
            'consultant_engineer', 'photos'
        ];

        const setClause = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = ?`);
                values.push(typeof value === 'object' ? JSON.stringify(value) : value);
            }
        }

        if (setClause.length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
        }

        values.push(id);

        await pool.query(`
            UPDATE daily_reports SET ${setClause.join(', ')} WHERE id = ?
        `, values);

        const [updatedReport] = await pool.query('SELECT * FROM daily_reports WHERE id = ?', [id]);

        res.json({
            success: true,
            data: updatedReport[0],
            message: 'Laporan harian berhasil diperbarui'
        });
    } catch (error) {
        console.error('Error updating daily report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete daily report
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM daily_reports WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Laporan harian berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting daily report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get daily report summary for a project
router.get('/project/:projectId/summary', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        const [summary] = await pool.query(`
            SELECT 
                COUNT(*) as total_reports,
                AVG(total_workers) as avg_workers,
                MAX(total_workers) as max_workers,
                SUM(CASE WHEN weather = 'Hujan Lebat' OR weather = 'Badai' THEN 1 ELSE 0 END) as rainy_days
            FROM daily_reports
            WHERE project_id = ?
        `, [projectId]);

        // Get recent reports
        const [recent] = await pool.query(`
            SELECT report_date, weather, total_workers, work_description
            FROM daily_reports
            WHERE project_id = ?
            ORDER BY report_date DESC
            LIMIT 5
        `, [projectId]);

        res.json({
            success: true,
            data: {
                summary: summary[0],
                recent
            }
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
