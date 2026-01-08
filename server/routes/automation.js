import express from 'express';
import { query } from '../db/connection.js';
import { authMiddleware, authorize, ROLES } from '../middleware/auth.js';
import { sendNotification } from '../services/emailService.js';

const router = express.Router();

// GET /api/automation/rules - List all rules
router.get('/rules', authMiddleware, async (req, res) => {
    try {
        const rules = await query(`
            SELECT ar.*, u.full_name as created_by_name
            FROM automation_rules ar
            LEFT JOIN users u ON ar.created_by = u.id
            ORDER BY ar.priority DESC, ar.created_at DESC
        `);

        // Parse JSON fields
        const parsed = rules.map(r => ({
            ...r,
            trigger_conditions: JSON.parse(r.trigger_conditions || '{}'),
            action_config: JSON.parse(r.action_config || '{}'),
            tags: r.tags ? JSON.parse(r.tags) : []
        }));

        res.json({ success: true, data: parsed });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/automation/rules - Create rule
router.post('/rules', authMiddleware, authorize(ROLES.CEO, ROLES.CTO, ROLES.PMO_DIRECTOR), async (req, res) => {
    try {
        const {
            name,
            description,
            trigger_type,
            trigger_conditions,
            action_type,
            action_config,
            priority = 'Medium',
            tags = []
        } = req.body;

        const id = crypto.randomUUID();

        await query(`
            INSERT INTO automation_rules (id, name, description, trigger_type, trigger_conditions, action_type, action_config, priority, tags, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, name, description, trigger_type,
            JSON.stringify(trigger_conditions),
            action_type,
            JSON.stringify(action_config),
            priority,
            JSON.stringify(tags),
            req.user.id
        ]);

        const [rule] = await query('SELECT * FROM automation_rules WHERE id = ?', [id]);

        res.status(201).json({ success: true, data: rule });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/automation/rules/:id/toggle - Toggle rule active status
router.put('/rules/:id/toggle', authMiddleware, async (req, res) => {
    try {
        const [rule] = await query('SELECT is_active FROM automation_rules WHERE id = ?', [req.params.id]);

        if (!rule) {
            return res.status(404).json({ success: false, error: 'Rule not found' });
        }

        await query('UPDATE automation_rules SET is_active = ? WHERE id = ?', [!rule.is_active, req.params.id]);

        res.json({ success: true, data: { is_active: !rule.is_active } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/automation/execute - Manually execute automation checks
router.post('/execute', authMiddleware, authorize(ROLES.CEO, ROLES.CTO, ROLES.PMO_DIRECTOR), async (req, res) => {
    try {
        const results = await executeAutomationRules();
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Main automation engine function
async function executeAutomationRules() {
    const results = [];

    // Get active rules
    const rules = await query('SELECT * FROM automation_rules WHERE is_active = true');

    for (const rule of rules) {
        const conditions = JSON.parse(rule.trigger_conditions || '{}');
        const actionConfig = JSON.parse(rule.action_config || '{}');

        try {
            let triggered = false;
            let affectedEntities = [];

            switch (rule.trigger_type) {
                case 'Budget Threshold':
                    // Check projects exceeding budget threshold
                    const threshold = conditions.percentage || 80;
                    const overBudgetProjects = await query(`
                        SELECT * FROM projects 
                        WHERE (budget_spent / NULLIF(budget_allocated, 0)) * 100 >= ?
                        AND status IN ('Planning', 'In Progress')
                    `, [threshold]);

                    if (overBudgetProjects.length > 0) {
                        triggered = true;
                        affectedEntities = overBudgetProjects;
                    }
                    break;

                case 'Deadline Approaching':
                    // Check tasks with approaching deadlines
                    const daysAhead = conditions.days || 3;
                    const upcomingTasks = await query(`
                        SELECT * FROM tasks
                        WHERE due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
                        AND status NOT IN ('Done', 'Blocked')
                    `, [daysAhead]);

                    if (upcomingTasks.length > 0) {
                        triggered = true;
                        affectedEntities = upcomingTasks;
                    }
                    break;

                case 'Risk Level':
                    // Check high-risk projects
                    const minScore = conditions.min_score || 15;
                    const highRisks = await query(`
                        SELECT r.*, p.name as project_name FROM risks r
                        JOIN projects p ON r.project_id = p.id
                        WHERE r.risk_score >= ? AND r.status NOT IN ('Resolved', 'Closed')
                    `, [minScore]);

                    if (highRisks.length > 0) {
                        triggered = true;
                        affectedEntities = highRisks;
                    }
                    break;

                case 'Resource Overload':
                    // Check overloaded resources
                    const loadThreshold = conditions.load_percentage || 100;
                    const overloadedResources = await query(`
                        SELECT r.*, 
                               COALESCE(SUM(ra.allocation_percentage), 0) as total_allocation
                        FROM resources r
                        LEFT JOIN resource_allocations ra ON r.id = ra.resource_id AND ra.status = 'Active'
                        WHERE r.type = 'Human'
                        GROUP BY r.id
                        HAVING total_allocation >= ?
                    `, [loadThreshold]);

                    if (overloadedResources.length > 0) {
                        triggered = true;
                        affectedEntities = overloadedResources;
                    }
                    break;

                case 'Status Change':
                    // This would typically be triggered by webhooks/events
                    break;
            }

            // Execute action if triggered
            if (triggered && affectedEntities.length > 0) {
                await executeAction(rule, actionConfig, affectedEntities);

                // Update execution count
                await query(`
                    UPDATE automation_rules 
                    SET execution_count = execution_count + 1, last_executed_at = NOW()
                    WHERE id = ?
                `, [rule.id]);

                results.push({
                    rule_id: rule.id,
                    rule_name: rule.name,
                    triggered: true,
                    affected_count: affectedEntities.length
                });
            }
        } catch (error) {
            console.error(`Automation rule ${rule.id} error:`, error);
            results.push({
                rule_id: rule.id,
                rule_name: rule.name,
                error: error.message
            });
        }
    }

    return results;
}

// Execute action based on rule configuration
async function executeAction(rule, config, entities) {
    switch (rule.action_type) {
        case 'Send Notification':
            // Send in-app notification
            const recipientIds = config.recipient_ids || [];
            for (const recipientId of recipientIds) {
                await sendNotification(
                    recipientId,
                    `Automation Alert: ${rule.name}`,
                    `${entities.length} item(s) triggered this rule. Please review.`,
                    'Warning',
                    { severity: config.severity || 'High' }
                );
            }
            break;

        case 'Update Status':
            // Update entity status
            if (config.entity_type === 'Project') {
                for (const entity of entities) {
                    await query('UPDATE projects SET status = ? WHERE id = ?', [config.new_status, entity.id]);
                }
            } else if (config.entity_type === 'Task') {
                for (const entity of entities) {
                    await query('UPDATE tasks SET status = ? WHERE id = ?', [config.new_status, entity.id]);
                }
            }
            break;

        case 'Escalate':
            // Create escalation notification
            const escalateTo = config.escalate_to_role || 'PMO_Director';
            const managers = await query('SELECT id FROM users WHERE role = ?', [escalateTo]);

            for (const manager of managers) {
                await sendNotification(
                    manager.id,
                    `🚨 Escalation: ${rule.name}`,
                    `${entities.length} item(s) require your attention.`,
                    'Alert',
                    { severity: 'Critical' }
                );
            }
            break;
    }
}

export default router;
