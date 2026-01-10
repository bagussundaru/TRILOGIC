import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import fetch from 'node-fetch';

const router = express.Router();

// Fonnte API config
const FONNTE_API = 'https://api.fonnte.com/send';
const FONNTE_TOKEN = process.env.FONNTE_TOKEN;

// Send price inquiry to supplier
router.post('/send-price-inquiry', authenticateToken, async (req, res) => {
    try {
        const { supplier_id, materials } = req.body;

        const [supplier] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [supplier_id]);
        if (!supplier[0]?.whatsapp_number) {
            return res.status(400).json({ success: false, error: 'Supplier tidak punya nomor WhatsApp' });
        }

        // Build message
        const materialList = materials.map((m, i) => `${i + 1}. ${m.name} (${m.unit})`).join('\n');
        const message = `Selamat pagi Pak/Bu,\n\nMohon info harga terbaru:\n${materialList}\n\nTerima kasih 🙏`;

        // Send via Fonnte
        if (FONNTE_TOKEN) {
            const response = await fetch(FONNTE_API, {
                method: 'POST',
                headers: {
                    'Authorization': FONNTE_TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    target: supplier[0].whatsapp_number,
                    message: message
                })
            });

            const result = await response.json();

            // Log message
            await pool.query(`
                INSERT INTO whatsapp_messages (id, supplier_id, direction, phone_number, message, status)
                VALUES (?, ?, 'Outgoing', ?, ?, ?)
            `, [uuidv4(), supplier_id, supplier[0].whatsapp_number, message, result.status ? 'Sent' : 'Failed']);

            res.json({ success: true, message: 'Pesan terkirim', result });
        } else {
            // Demo mode - just log
            await pool.query(`
                INSERT INTO whatsapp_messages (id, supplier_id, direction, phone_number, message, status)
                VALUES (?, ?, 'Outgoing', ?, ?, 'Sent')
            `, [uuidv4(), supplier_id, supplier[0].whatsapp_number, message]);

            res.json({ success: true, message: 'Demo mode - message logged', demo: true });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Webhook for incoming WhatsApp messages
router.post('/webhook', async (req, res) => {
    try {
        const { sender, message } = req.body;

        // Find supplier by phone
        const [supplier] = await pool.query(
            'SELECT id FROM suppliers WHERE whatsapp_number LIKE ?',
            [`%${sender.slice(-10)}%`]
        );

        // Log incoming message
        const msgId = uuidv4();
        await pool.query(`
            INSERT INTO whatsapp_messages (id, supplier_id, direction, phone_number, message, status)
            VALUES (?, ?, 'Incoming', ?, ?, 'Delivered')
        `, [msgId, supplier[0]?.id || null, sender, message]);

        // Parse price from message using AI
        const parsedPrices = await parsePrice(message);

        if (parsedPrices.length > 0 && supplier[0]?.id) {
            for (const price of parsedPrices) {
                // Find material
                const [material] = await pool.query(
                    'SELECT id FROM material_master WHERE name LIKE ? LIMIT 1',
                    [`%${price.material}%`]
                );

                if (material[0]) {
                    await pool.query(`
                        INSERT INTO material_prices (id, material_id, supplier_id, price, effective_date, source)
                        VALUES (?, ?, ?, ?, CURDATE(), 'WhatsApp')
                    `, [uuidv4(), material[0].id, supplier[0].id, price.price]);
                }
            }

            // Update message with parsed data
            await pool.query('UPDATE whatsapp_messages SET parsed_data = ? WHERE id = ?',
                [JSON.stringify(parsedPrices), msgId]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// AI price parser using Nebius
async function parsePrice(message) {
    try {
        const response = await fetch('https://api.studio.nebius.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NEBIUS_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
                messages: [{
                    role: 'system',
                    content: 'Extract material prices from this WhatsApp message. Return JSON array: [{"material": "name", "price": number, "unit": "unit"}]. Only return valid JSON.'
                }, {
                    role: 'user',
                    content: message
                }],
                max_tokens: 500
            })
        });

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '[]';

        // Parse JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
        console.error('AI parse error:', error);
        return [];
    }
}

// Get message history
router.get('/messages', authenticateToken, async (req, res) => {
    try {
        const { supplier_id, limit = 50 } = req.query;

        let query = `
            SELECT wm.*, s.name as supplier_name
            FROM whatsapp_messages wm
            LEFT JOIN suppliers s ON wm.supplier_id = s.id
        `;
        const params = [];

        if (supplier_id) {
            query += ' WHERE wm.supplier_id = ?';
            params.push(supplier_id);
        }

        query += ' ORDER BY wm.sent_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const [messages] = await pool.query(query, params);
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Schedule price check
router.post('/schedule-check', authenticateToken, async (req, res) => {
    try {
        const { material_id, supplier_id, frequency } = req.body;
        const id = uuidv4();

        await pool.query(`
            INSERT INTO price_check_schedules (id, material_id, supplier_id, frequency, next_check)
            VALUES (?, ?, ?, ?, CURDATE())
        `, [id, material_id, supplier_id, frequency || 'Weekly']);

        res.status(201).json({ success: true, message: 'Schedule created' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
