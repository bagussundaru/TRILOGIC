import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './db/connection.js';

// Import routes
import projectsRouter from './routes/projects.js';
import tasksRouter from './routes/tasks.js';
import resourcesRouter from './routes/resources.js';
import aiRouter from './routes/ai.js';
import authRouter from './routes/auth.js';
import automationRouter from './routes/automation.js';
import wbsRouter from './routes/wbs.js';
import boqRouter from './routes/boq.js';
import progressRouter from './routes/progress.js';
import dailyReportsRouter from './routes/daily-reports.js';
import paymentCertificatesRouter from './routes/payment-certificates.js';
import sitePhotosRouter from './routes/site-photos.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173', 'http://103.189.234.15:4173'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/api/health', async (req, res) => {
    const dbConnected = await testConnection();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'connected' : 'disconnected',
        version: '2.0.0 - Construction PMO'
    });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/automation', automationRouter);
app.use('/api/wbs', wbsRouter);
app.use('/api/boq', boqRouter);
app.use('/api/progress', progressRouter);
app.use('/api/daily-reports', dailyReportsRouter);
app.use('/api/payment-certificates', paymentCertificatesRouter);
app.use('/api/site-photos', sitePhotosRouter);

// Dashboard summary endpoint
app.get('/api/dashboard', async (req, res) => {
    try {
        const { query } = await import('./db/connection.js');

        // Projects summary
        const [projectStats] = await query(`
            SELECT 
                COUNT(*) as total_projects,
                SUM(CASE WHEN status IN ('Planning', 'In Progress') THEN 1 ELSE 0 END) as active_projects,
                SUM(CASE WHEN health_status IN ('At Risk', 'Critical') THEN 1 ELSE 0 END) as at_risk_projects,
                SUM(budget_allocated) as total_budget,
                SUM(budget_spent) as total_spent,
                AVG(completion_percentage) as avg_completion
            FROM projects
        `);

        // Tasks summary
        const [taskStats] = await query(`
            SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as completed_tasks
            FROM tasks
        `);

        // Recent activity
        const activities = await query(`
            SELECT * FROM activity_logs 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        // Projects by status
        const projectsByStatus = await query(`
            SELECT status, COUNT(*) as count 
            FROM projects 
            GROUP BY status
        `);

        res.json({
            success: true,
            data: {
                metrics: {
                    active_projects: projectStats.active_projects || 0,
                    at_risk_projects: projectStats.at_risk_projects || 0,
                    total_budget: projectStats.total_budget || 0,
                    total_spent: projectStats.total_spent || 0,
                    budget_utilization: projectStats.total_budget > 0
                        ? Math.round((projectStats.total_spent / projectStats.total_budget) * 100)
                        : 0,
                    avg_completion: Math.round(projectStats.avg_completion || 0),
                    total_tasks: taskStats.total_tasks || 0,
                    completed_tasks: taskStats.completed_tasks || 0,
                    task_completion_rate: taskStats.total_tasks > 0
                        ? Math.round((taskStats.completed_tasks / taskStats.total_tasks) * 100)
                        : 0
                },
                projects_by_status: projectsByStatus,
                recent_activities: activities
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        error: err.message
    });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║     Smart TRILOGIC PMO Backend Server                     ║
╠═══════════════════════════════════════════════════════════╣
║  🚀 Server running on http://0.0.0.0:${PORT}               ║
║  📊 API Docs: http://localhost:${PORT}/api/health          ║
║  🤖 AI Endpoint: http://localhost:${PORT}/api/ai/chat      ║
╚═══════════════════════════════════════════════════════════╝
    `);

    // Test database connection
    await testConnection();
});

export default app;
