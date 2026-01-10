import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ==================== SUPPLIERS ====================

// Get all suppliers
router.get('/suppliers', authenticateToken, async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM suppliers WHERE is_active = TRUE';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY name';

        const [suppliers] = await pool.query(query, params);
        res.json({ success: true, data: suppliers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create supplier
router.post('/suppliers', authenticateToken, async (req, res) => {
    try {
        const { name, contact_person, phone, whatsapp_number, email, address, city, category, notes } = req.body;
        const id = uuidv4();

        await pool.query(`
            INSERT INTO suppliers (id, name, contact_person, phone, whatsapp_number, email, address, city, category, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, name, contact_person, phone, whatsapp_number, email, address, city, category || 'Material', notes]);

        const [newSupplier] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
        res.status(201).json({ success: true, data: newSupplier[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update supplier
router.put('/suppliers/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const allowedFields = ['name', 'contact_person', 'phone', 'whatsapp_number', 'email', 'address', 'city', 'category', 'rating', 'notes', 'is_active'];
        const setClause = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (setClause.length > 0) {
            values.push(id);
            await pool.query(`UPDATE suppliers SET ${setClause.join(', ')} WHERE id = ?`, values);
        }

        const [updated] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
        res.json({ success: true, data: updated[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== MATERIAL MASTER ====================

// Get all materials
router.get('/materials', authenticateToken, async (req, res) => {
    try {
        const { category } = req.query;
        let query = `
            SELECT m.*, s.name as supplier_name
            FROM material_master m
            LEFT JOIN suppliers s ON m.default_supplier_id = s.id
        `;
        const params = [];

        if (category) {
            query += ' WHERE m.category = ?';
            params.push(category);
        }

        query += ' ORDER BY m.category, m.name';

        const [materials] = await pool.query(query, params);
        res.json({ success: true, data: materials });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create material
router.post('/materials', authenticateToken, async (req, res) => {
    try {
        const { code, name, unit, category, specifications, min_stock, default_supplier_id } = req.body;
        const id = uuidv4();

        await pool.query(`
            INSERT INTO material_master (id, code, name, unit, category, specifications, min_stock, default_supplier_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, code, name, unit, category || 'Lainnya', specifications, min_stock || 0, default_supplier_id]);

        const [newMaterial] = await pool.query('SELECT * FROM material_master WHERE id = ?', [id]);
        res.status(201).json({ success: true, data: newMaterial[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== PRICE TRACKING ====================

// Get price history for a material
router.get('/materials/:materialId/prices', authenticateToken, async (req, res) => {
    try {
        const { materialId } = req.params;
        const { days = 30 } = req.query;

        const [prices] = await pool.query(`
            SELECT mp.*, s.name as supplier_name
            FROM material_prices mp
            JOIN suppliers s ON mp.supplier_id = s.id
            WHERE mp.material_id = ?
            AND mp.effective_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            ORDER BY mp.effective_date DESC
        `, [materialId, parseInt(days)]);

        // Get price trend
        const [trend] = await pool.query(`
            SELECT effective_date, AVG(price) as avg_price
            FROM material_prices
            WHERE material_id = ?
            AND effective_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY effective_date
            ORDER BY effective_date
        `, [materialId, parseInt(days)]);

        res.json({
            success: true,
            data: {
                prices,
                trend,
                latest: prices[0] || null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add price entry
router.post('/prices', authenticateToken, async (req, res) => {
    try {
        const { material_id, supplier_id, price, effective_date, source, notes } = req.body;
        const id = uuidv4();

        await pool.query(`
            INSERT INTO material_prices (id, material_id, supplier_id, price, effective_date, source, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [id, material_id, supplier_id, price, effective_date || new Date().toISOString().split('T')[0], source || 'Manual', notes]);

        // Update last_price in material_master
        await pool.query(`
            UPDATE material_master SET last_price = ?, last_price_date = ? WHERE id = ?
        `, [price, effective_date || new Date().toISOString().split('T')[0], material_id]);

        res.status(201).json({ success: true, message: 'Price recorded' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get best prices for all materials (comparison)
router.get('/best-prices', authenticateToken, async (req, res) => {
    try {
        const [bestPrices] = await pool.query(`
            SELECT 
                m.id as material_id,
                m.code,
                m.name,
                m.unit,
                m.category,
                (
                    SELECT MIN(mp.price)
                    FROM material_prices mp
                    WHERE mp.material_id = m.id
                    AND mp.effective_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                ) as best_price,
                (
                    SELECT s.name
                    FROM material_prices mp2
                    JOIN suppliers s ON mp2.supplier_id = s.id
                    WHERE mp2.material_id = m.id
                    AND mp2.effective_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                    ORDER BY mp2.price ASC
                    LIMIT 1
                ) as best_supplier
            FROM material_master m
            ORDER BY m.category, m.name
        `);

        res.json({ success: true, data: bestPrices });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get price alerts (significant changes)
router.get('/price-alerts', authenticateToken, async (req, res) => {
    try {
        const [alerts] = await pool.query(`
            SELECT 
                m.name as material_name,
                m.unit,
                mp1.price as current_price,
                mp2.price as previous_price,
                ((mp1.price - mp2.price) / mp2.price * 100) as change_pct,
                s.name as supplier_name,
                mp1.effective_date
            FROM material_prices mp1
            JOIN material_master m ON mp1.material_id = m.id
            JOIN suppliers s ON mp1.supplier_id = s.id
            JOIN material_prices mp2 ON mp2.material_id = mp1.material_id 
                AND mp2.supplier_id = mp1.supplier_id
                AND mp2.effective_date < mp1.effective_date
            WHERE mp1.effective_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            AND ABS((mp1.price - mp2.price) / mp2.price * 100) > 10
            ORDER BY mp1.effective_date DESC
            LIMIT 20
        `);

        res.json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
