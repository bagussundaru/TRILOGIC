import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all WBS items for a project (hierarchical)
router.get('/project/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        const [items] = await pool.query(`
            SELECT 
                w.*,
                (w.planned_qty * w.unit_price) as total_budget,
                (w.actual_qty * w.unit_price) as actual_cost
            FROM wbs_items w
            WHERE w.project_id = ?
            ORDER BY w.wbs_code
        `, [projectId]);

        // Build hierarchical tree
        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.parent_id === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id)
                }));
        };

        const tree = buildTree(items);

        res.json({
            success: true,
            data: {
                items: tree,
                flat: items,
                summary: {
                    total: items.length,
                    totalBudget: items.reduce((sum, i) => sum + (i.planned_qty * i.unit_price || 0), 0),
                    avgProgress: items.length > 0
                        ? items.reduce((sum, i) => sum + (i.progress_percentage || 0), 0) / items.length
                        : 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching WBS:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create WBS item
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            project_id,
            parent_id,
            name,
            description,
            item_type,
            unit,
            planned_qty,
            unit_price,
            planned_start,
            planned_finish
        } = req.body;

        const id = uuidv4();

        // Generate WBS code
        let wbs_code = '1';
        let level = 1;

        if (parent_id) {
            // Get parent's WBS code and count siblings
            const [parent] = await pool.query(
                'SELECT wbs_code, level FROM wbs_items WHERE id = ?',
                [parent_id]
            );

            if (parent.length > 0) {
                const [siblings] = await pool.query(
                    'SELECT COUNT(*) as count FROM wbs_items WHERE parent_id = ?',
                    [parent_id]
                );

                wbs_code = `${parent[0].wbs_code}.${siblings[0].count + 1}`;
                level = parent[0].level + 1;
            }
        } else {
            // Count root level items
            const [roots] = await pool.query(
                'SELECT COUNT(*) as count FROM wbs_items WHERE project_id = ? AND parent_id IS NULL',
                [project_id]
            );
            wbs_code = `${roots[0].count + 1}`;
        }

        await pool.query(`
            INSERT INTO wbs_items (
                id, project_id, parent_id, wbs_code, name, description,
                level, item_type, unit, planned_qty, unit_price,
                planned_start, planned_finish, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Started')
        `, [
            id, project_id, parent_id || null, wbs_code, name, description,
            level, item_type || 'Work Package', unit, planned_qty || 0, unit_price || 0,
            planned_start, planned_finish
        ]);

        const [newItem] = await pool.query('SELECT * FROM wbs_items WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: newItem[0],
            message: 'WBS item created successfully'
        });
    } catch (error) {
        console.error('Error creating WBS item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update WBS item
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Build dynamic update query
        const allowedFields = [
            'name', 'description', 'item_type', 'unit', 'planned_qty',
            'actual_qty', 'unit_price', 'planned_start', 'planned_finish',
            'actual_start', 'actual_finish', 'progress_percentage', 'status',
            'weight_percentage'
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
            UPDATE wbs_items SET ${setClause.join(', ')} WHERE id = ?
        `, values);

        // Update parent progress (roll-up)
        const [item] = await pool.query('SELECT parent_id FROM wbs_items WHERE id = ?', [id]);
        if (item[0]?.parent_id) {
            await updateParentProgress(item[0].parent_id);
        }

        const [updatedItem] = await pool.query('SELECT * FROM wbs_items WHERE id = ?', [id]);

        res.json({
            success: true,
            data: updatedItem[0],
            message: 'WBS item updated successfully'
        });
    } catch (error) {
        console.error('Error updating WBS item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete WBS item (and children)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Delete will cascade to children due to FK constraint
        await pool.query('DELETE FROM wbs_items WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'WBS item and children deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting WBS item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update progress for a WBS item
router.patch('/:id/progress', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { progress_percentage, actual_qty } = req.body;

        const updates = [];
        const values = [];

        if (progress_percentage !== undefined) {
            updates.push('progress_percentage = ?');
            values.push(progress_percentage);

            if (progress_percentage > 0 && progress_percentage < 100) {
                updates.push("status = 'In Progress'");
            } else if (progress_percentage >= 100) {
                updates.push("status = 'Completed'");
            }
        }

        if (actual_qty !== undefined) {
            updates.push('actual_qty = ?');
            values.push(actual_qty);
        }

        if (updates.length > 0) {
            values.push(id);
            await pool.query(`
                UPDATE wbs_items SET ${updates.join(', ')} WHERE id = ?
            `, values);

            // Update parent progress
            const [item] = await pool.query('SELECT parent_id FROM wbs_items WHERE id = ?', [id]);
            if (item[0]?.parent_id) {
                await updateParentProgress(item[0].parent_id);
            }
        }

        const [updatedItem] = await pool.query('SELECT * FROM wbs_items WHERE id = ?', [id]);

        res.json({
            success: true,
            data: updatedItem[0]
        });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper: Roll-up progress to parent
async function updateParentProgress(parentId) {
    const [children] = await pool.query(`
        SELECT progress_percentage, weight_percentage 
        FROM wbs_items 
        WHERE parent_id = ?
    `, [parentId]);

    if (children.length > 0) {
        // Calculate weighted average or simple average
        const totalWeight = children.reduce((sum, c) => sum + (c.weight_percentage || 1), 0);
        const weightedProgress = children.reduce((sum, c) => {
            const weight = c.weight_percentage || 1;
            return sum + (c.progress_percentage * weight);
        }, 0);

        const avgProgress = weightedProgress / totalWeight;

        await pool.query(`
            UPDATE wbs_items SET progress_percentage = ? WHERE id = ?
        `, [avgProgress, parentId]);

        // Recursively update grandparent
        const [parent] = await pool.query('SELECT parent_id FROM wbs_items WHERE id = ?', [parentId]);
        if (parent[0]?.parent_id) {
            await updateParentProgress(parent[0].parent_id);
        }
    }
}

// Get WBS statistics for a project
router.get('/project/:projectId/stats', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_items,
                SUM(CASE WHEN status = 'Not Started' THEN 1 ELSE 0 END) as not_started,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'On Hold' THEN 1 ELSE 0 END) as on_hold,
                SUM(planned_qty * unit_price) as total_budget,
                SUM(actual_qty * unit_price) as total_actual,
                AVG(progress_percentage) as avg_progress
            FROM wbs_items
            WHERE project_id = ?
        `, [projectId]);

        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        console.error('Error fetching WBS stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
