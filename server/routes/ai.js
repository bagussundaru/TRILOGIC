import express from 'express';
import { chat, generateProjectSummary, analyzePortfolioRisks } from '../services/nebiusAI.js';
import { query } from '../db/connection.js';

const router = express.Router();

// POST /api/ai/chat - Chat with AI Assistant
router.post('/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        // Get dashboard context
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

        const [taskStats] = await query(`
            SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN due_date < CURDATE() AND status != 'Done' THEN 1 ELSE 0 END) as overdue_tasks
            FROM tasks
        `);

        const recentProjects = await query(`
            SELECT name, status, health_status, completion_percentage, budget_allocated, budget_spent
            FROM projects
            ORDER BY updated_at DESC
            LIMIT 5
        `);

        const context = {
            dashboard: {
                ...projectStats,
                ...taskStats,
                budget_utilization: projectStats.total_budget > 0
                    ? Math.round((projectStats.total_spent / projectStats.total_budget) * 100)
                    : 0
            },
            recent_projects: recentProjects
        };

        // Get AI response
        const response = await chat(message, context, history);

        res.json({
            success: true,
            data: {
                message: response,
                context_used: true
            }
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/ai/project-summary - Generate project summary
router.post('/project-summary', async (req, res) => {
    try {
        const { project_id } = req.body;

        if (!project_id) {
            return res.status(400).json({ success: false, error: 'project_id is required' });
        }

        const [project] = await query('SELECT * FROM projects WHERE id = ?', [project_id]);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const summary = await generateProjectSummary(project);

        res.json({
            success: true,
            data: {
                project_id,
                project_name: project.name,
                summary
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/ai/portfolio-risks - Analyze portfolio risks
router.post('/portfolio-risks', async (req, res) => {
    try {
        const projects = await query('SELECT * FROM projects WHERE status IN (?, ?)', ['Planning', 'In Progress']);

        const analysis = await analyzePortfolioRisks(projects);

        res.json({
            success: true,
            data: {
                total_projects: projects.length,
                analysis
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
