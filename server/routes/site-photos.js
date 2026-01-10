import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all photos for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { type, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT 
                sp.*,
                w.wbs_code,
                w.name as wbs_name,
                u.full_name as uploaded_by_name
            FROM site_photos sp
            LEFT JOIN wbs_items w ON sp.wbs_id = w.id
            LEFT JOIN users u ON sp.uploaded_by = u.id
            WHERE sp.project_id = ?
        `;

        const params = [projectId];

        if (type && type !== 'all') {
            query += ' AND sp.photo_type = ?';
            params.push(type);
        }

        query += ' ORDER BY sp.taken_date DESC, sp.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [photos] = await pool.query(query, params);

        // Get count by type
        const [typeCounts] = await pool.query(`
            SELECT photo_type, COUNT(*) as count
            FROM site_photos
            WHERE project_id = ?
            GROUP BY photo_type
        `, [projectId]);

        res.json({
            success: true,
            data: {
                photos,
                typeCounts,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching site photos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload photo metadata (URL-based, actual upload handled by frontend)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            project_id,
            wbs_id,
            daily_report_id,
            photo_url,
            thumbnail_url,
            caption,
            photo_type,
            taken_date,
            location_tag
        } = req.body;

        const id = uuidv4();

        await pool.query(`
            INSERT INTO site_photos (
                id, project_id, wbs_id, daily_report_id,
                photo_url, thumbnail_url, caption, photo_type,
                taken_date, location_tag, uploaded_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, project_id, wbs_id || null, daily_report_id || null,
            photo_url, thumbnail_url, caption, photo_type || 'Progress',
            taken_date || new Date().toISOString().split('T')[0],
            location_tag, req.user?.id || null
        ]);

        const [newPhoto] = await pool.query('SELECT * FROM site_photos WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: newPhoto[0],
            message: 'Foto berhasil diunggah'
        });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update photo metadata
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { caption, photo_type, location_tag, wbs_id } = req.body;

        const updates = [];
        const values = [];

        if (caption !== undefined) { updates.push('caption = ?'); values.push(caption); }
        if (photo_type !== undefined) { updates.push('photo_type = ?'); values.push(photo_type); }
        if (location_tag !== undefined) { updates.push('location_tag = ?'); values.push(location_tag); }
        if (wbs_id !== undefined) { updates.push('wbs_id = ?'); values.push(wbs_id || null); }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }

        values.push(id);

        await pool.query(`UPDATE site_photos SET ${updates.join(', ')} WHERE id = ?`, values);

        const [updatedPhoto] = await pool.query('SELECT * FROM site_photos WHERE id = ?', [id]);

        res.json({
            success: true,
            data: updatedPhoto[0]
        });
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete photo
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM site_photos WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Foto berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
