import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all meetings for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        const [meetings] = await pool.query(`
            SELECT m.*, 
                (SELECT COUNT(*) FROM action_items WHERE meeting_id = m.id) as action_count,
                (SELECT COUNT(*) FROM action_items WHERE meeting_id = m.id AND status = 'Completed') as completed_count
            FROM meetings m
            WHERE m.project_id = ?
            ORDER BY m.meeting_date DESC
        `, [projectId]);

        res.json({ success: true, data: meetings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get meeting with action items
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [meetings] = await pool.query('SELECT * FROM meetings WHERE id = ?', [id]);
        if (!meetings[0]) return res.status(404).json({ success: false, error: 'Meeting not found' });

        const [actionItems] = await pool.query(`
            SELECT ai.*, u.full_name as assigned_to_full_name
            FROM action_items ai
            LEFT JOIN users u ON ai.assigned_to = u.id
            WHERE ai.meeting_id = ?
            ORDER BY ai.due_date
        `, [id]);

        res.json({
            success: true,
            data: {
                meeting: {
                    ...meetings[0],
                    attendees: typeof meetings[0].attendees === 'string' ? JSON.parse(meetings[0].attendees) : meetings[0].attendees
                },
                actionItems
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create meeting
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { project_id, meeting_type, title, meeting_date, start_time, end_time, location, attendees, agenda } = req.body;
        const id = uuidv4();

        // Get meeting number
        const [count] = await pool.query(
            'SELECT COUNT(*) as cnt FROM meetings WHERE project_id = ? AND meeting_type = ?',
            [project_id, meeting_type]
        );

        await pool.query(`
            INSERT INTO meetings (id, project_id, meeting_type, meeting_number, title, meeting_date, start_time, end_time, location, attendees, agenda, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, project_id, meeting_type || 'Progress Weekly', count[0].cnt + 1, title, meeting_date, start_time, end_time, location,
            JSON.stringify(attendees || []), agenda, req.user?.id]);

        const [newMeeting] = await pool.query('SELECT * FROM meetings WHERE id = ?', [id]);
        res.status(201).json({ success: true, data: newMeeting[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update meeting (add minutes, decisions)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { minutes, decisions, status, attendees } = req.body;

        const updates = [];
        const values = [];

        if (minutes !== undefined) { updates.push('minutes = ?'); values.push(minutes); }
        if (decisions !== undefined) { updates.push('decisions = ?'); values.push(decisions); }
        if (status !== undefined) { updates.push('status = ?'); values.push(status); }
        if (attendees !== undefined) { updates.push('attendees = ?'); values.push(JSON.stringify(attendees)); }

        if (updates.length > 0) {
            values.push(id);
            await pool.query(`UPDATE meetings SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        res.json({ success: true, message: 'Meeting updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add action item
router.post('/:id/actions', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { description, assigned_to, assigned_to_name, due_date } = req.body;
        const actionId = uuidv4();

        // Get project_id from meeting
        const [meeting] = await pool.query('SELECT project_id FROM meetings WHERE id = ?', [id]);

        await pool.query(`
            INSERT INTO action_items (id, meeting_id, project_id, description, assigned_to, assigned_to_name, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [actionId, id, meeting[0]?.project_id, description, assigned_to, assigned_to_name, due_date]);

        const [newAction] = await pool.query('SELECT * FROM action_items WHERE id = ?', [actionId]);
        res.status(201).json({ success: true, data: newAction[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update action item status
router.patch('/actions/:actionId', authenticateToken, async (req, res) => {
    try {
        const { actionId } = req.params;
        const { status, remarks } = req.body;

        const updates = ['status = ?'];
        const values = [status];

        if (remarks) { updates.push('remarks = ?'); values.push(remarks); }
        if (status === 'Completed') { updates.push('completed_date = CURDATE()'); }

        values.push(actionId);
        await pool.query(`UPDATE action_items SET ${updates.join(', ')} WHERE id = ?`, values);

        res.json({ success: true, message: 'Action item updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all open action items for a project
router.get('/project/:projectId/open-actions', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        const [actions] = await pool.query(`
            SELECT ai.*, m.title as meeting_title, m.meeting_date
            FROM action_items ai
            JOIN meetings m ON ai.meeting_id = m.id
            WHERE ai.project_id = ? AND ai.status NOT IN ('Completed', 'Cancelled')
            ORDER BY ai.due_date
        `, [projectId]);

        res.json({ success: true, data: actions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
