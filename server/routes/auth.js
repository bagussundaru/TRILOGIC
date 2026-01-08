import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/connection.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, role = 'Viewer', department } = req.body;

        // Validation
        if (!email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and full_name are required'
            });
        }

        // Check if user exists
        const [existingUser] = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const id = crypto.randomUUID();
        await query(`
            INSERT INTO users (id, email, password_hash, full_name, role, department)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id, email, password_hash, full_name, role, department]);

        // Get created user
        const [user] = await query('SELECT id, email, full_name, role, department FROM users WHERE id = ?', [id]);

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    department: user.department
                },
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user
        const [user] = await query('SELECT * FROM users WHERE email = ? AND is_active = true', [email]);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last login
        await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        // Generate token
        const token = generateToken(user);

        // Log activity
        await query(`
            INSERT INTO activity_logs (id, user_id, action_type, entity_type, description)
            VALUES (UUID(), ?, 'Login', 'User', ?)
        `, [user.id, `User ${user.full_name} logged in`]);

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    department: user.department,
                    avatar_url: user.avatar_url
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const [user] = await query(`
            SELECT id, email, full_name, role, department, avatar_url, phone, created_at
            FROM users WHERE id = ?
        `, [req.user.id]);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/auth/profile - Update profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { full_name, phone, avatar_url } = req.body;

        await query(`
            UPDATE users SET full_name = ?, phone = ?, avatar_url = ?
            WHERE id = ?
        `, [full_name, phone, avatar_url, req.user.id]);

        const [user] = await query('SELECT id, email, full_name, role, department, avatar_url, phone FROM users WHERE id = ?', [req.user.id]);

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/auth/password - Change password
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }

        // Get user with password
        const [user] = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);

        // Verify current password
        const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const new_hash = await bcrypt.hash(new_password, 10);

        await query('UPDATE users SET password_hash = ? WHERE id = ?', [new_hash, req.user.id]);

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/auth/users - List all users (admin only)
router.get('/users', authMiddleware, async (req, res) => {
    try {
        // Check if user has admin privileges
        const adminRoles = ['CEO', 'PMO_Director', 'CTO'];
        if (!adminRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            });
        }

        const users = await query(`
            SELECT id, email, full_name, role, department, is_active, last_login, created_at
            FROM users
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
