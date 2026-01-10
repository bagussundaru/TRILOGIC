import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all RAB versions for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        const [versions] = await pool.query(`
            SELECT 
                rv.*,
                u.full_name as created_by_name,
                (SELECT COUNT(*) FROM rab_items WHERE rab_version_id = rv.id) as item_count
            FROM rab_versions rv
            LEFT JOIN users u ON rv.created_by = u.id
            WHERE rv.project_id = ?
            ORDER BY rv.version_number DESC
        `, [projectId]);

        res.json({ success: true, data: versions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get RAB details with items
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [version] = await pool.query('SELECT * FROM rab_versions WHERE id = ?', [id]);

        if (!version[0]) {
            return res.status(404).json({ success: false, error: 'RAB not found' });
        }

        const [items] = await pool.query(`
            SELECT ri.*, w.wbs_code, w.name as wbs_name
            FROM rab_items ri
            LEFT JOIN wbs_items w ON ri.wbs_id = w.id
            WHERE ri.rab_version_id = ?
            ORDER BY ri.category, ri.item_code
        `, [id]);

        // Summary by category
        const [summary] = await pool.query(`
            SELECT category, SUM(final_price) as total
            FROM rab_items WHERE rab_version_id = ?
            GROUP BY category
        `, [id]);

        res.json({
            success: true,
            data: {
                version: version[0],
                items,
                summary
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new RAB version
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { project_id, version_name, notes, copy_from_version } = req.body;

        const id = uuidv4();

        // Get next version number
        const [lastVersion] = await pool.query(
            'SELECT MAX(version_number) as max_ver FROM rab_versions WHERE project_id = ?',
            [project_id]
        );
        const versionNumber = (lastVersion[0]?.max_ver || 0) + 1;

        await pool.query(`
            INSERT INTO rab_versions (id, project_id, version_number, version_name, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id, project_id, versionNumber, version_name || `Versi ${versionNumber}`, notes, req.user?.id]);

        // Copy items from previous version if specified
        if (copy_from_version) {
            const [prevItems] = await pool.query('SELECT * FROM rab_items WHERE rab_version_id = ?', [copy_from_version]);

            for (const item of prevItems) {
                await pool.query(`
                    INSERT INTO rab_items (id, rab_version_id, wbs_id, category, item_code, description, 
                        specification, unit, volume, unit_price, total_price, markup_pct, final_price)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [uuidv4(), id, item.wbs_id, item.category, item.item_code, item.description,
                item.specification, item.unit, item.volume, item.unit_price, item.total_price,
                item.markup_pct, item.final_price]);
            }
        }

        const [newRab] = await pool.query('SELECT * FROM rab_versions WHERE id = ?', [id]);

        res.status(201).json({ success: true, data: newRab[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add item to RAB
router.post('/:id/items', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { wbs_id, category, item_code, description, specification, unit, volume, unit_price, markup_pct } = req.body;

        const itemId = uuidv4();
        const total_price = volume * unit_price;
        const final_price = total_price * (1 + (markup_pct || 0) / 100);

        await pool.query(`
            INSERT INTO rab_items (id, rab_version_id, wbs_id, category, item_code, description, 
                specification, unit, volume, unit_price, total_price, markup_pct, final_price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [itemId, id, wbs_id, category || 'Material', item_code, description,
            specification, unit, volume, unit_price, total_price, markup_pct || 0, final_price]);

        // Update totals
        await updateRabTotals(id);

        const [newItem] = await pool.query('SELECT * FROM rab_items WHERE id = ?', [itemId]);

        res.status(201).json({ success: true, data: newItem[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update RAB item
router.put('/items/:itemId', authenticateToken, async (req, res) => {
    try {
        const { itemId } = req.params;
        const { volume, unit_price, markup_pct, ...rest } = req.body;

        // Recalculate
        const total_price = (volume || 0) * (unit_price || 0);
        const final_price = total_price * (1 + (markup_pct || 0) / 100);

        await pool.query(`
            UPDATE rab_items SET volume = ?, unit_price = ?, total_price = ?, markup_pct = ?, final_price = ?
            WHERE id = ?
        `, [volume, unit_price, total_price, markup_pct || 0, final_price, itemId]);

        // Get rab_version_id and update totals
        const [item] = await pool.query('SELECT rab_version_id FROM rab_items WHERE id = ?', [itemId]);
        if (item[0]) await updateRabTotals(item[0].rab_version_id);

        res.json({ success: true, message: 'Item updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete RAB item
router.delete('/items/:itemId', authenticateToken, async (req, res) => {
    try {
        const { itemId } = req.params;

        const [item] = await pool.query('SELECT rab_version_id FROM rab_items WHERE id = ?', [itemId]);
        await pool.query('DELETE FROM rab_items WHERE id = ?', [itemId]);

        if (item[0]) await updateRabTotals(item[0].rab_version_id);

        res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update RAB status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updates = { status };
        if (status === 'Approved') {
            updates.approved_by = req.user?.id;
            updates.approved_date = new Date().toISOString().split('T')[0];
        }

        const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        await pool.query(`UPDATE rab_versions SET ${setClause} WHERE id = ?`, [...Object.values(updates), id]);

        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Compare RAB vs Actual (from BOQ)
router.get('/:id/comparison', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [version] = await pool.query('SELECT project_id FROM rab_versions WHERE id = ?', [id]);
        if (!version[0]) return res.status(404).json({ success: false, error: 'RAB not found' });

        // RAB totals
        const [rabTotals] = await pool.query(`
            SELECT SUM(final_price) as rab_total FROM rab_items WHERE rab_version_id = ?
        `, [id]);

        // Actual from BOQ
        const [boqTotals] = await pool.query(`
            SELECT 
                SUM(contract_qty * contract_price) as contract_total,
                SUM(executed_qty * contract_price) as executed_total
            FROM boq_items WHERE project_id = ?
        `, [version[0].project_id]);

        res.json({
            success: true,
            data: {
                rab: rabTotals[0]?.rab_total || 0,
                contract: boqTotals[0]?.contract_total || 0,
                executed: boqTotals[0]?.executed_total || 0,
                variance: (rabTotals[0]?.rab_total || 0) - (boqTotals[0]?.contract_total || 0)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper: Update RAB totals
async function updateRabTotals(rabId) {
    const [totals] = await pool.query(`
        SELECT 
            category,
            SUM(final_price) as total
        FROM rab_items
        WHERE rab_version_id = ?
        GROUP BY category
    `, [rabId]);

    const categoryTotals = {
        total_material: 0,
        total_labor: 0,
        total_equipment: 0,
        total_overhead: 0,
        total_profit: 0
    };

    totals.forEach(t => {
        if (t.category === 'Material') categoryTotals.total_material = t.total;
        else if (t.category === 'Upah') categoryTotals.total_labor = t.total;
        else if (t.category === 'Alat') categoryTotals.total_equipment = t.total;
        else if (t.category === 'Overhead') categoryTotals.total_overhead = t.total;
        else if (t.category === 'Profit') categoryTotals.total_profit = t.total;
    });

    const grand_total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    await pool.query(`
        UPDATE rab_versions SET 
            total_material = ?, total_labor = ?, total_equipment = ?,
            total_overhead = ?, total_profit = ?, grand_total = ?
        WHERE id = ?
    `, [...Object.values(categoryTotals), grand_total, rabId]);
}

export default router;
