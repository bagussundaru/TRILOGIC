import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { differenceInDays, parseISO } from 'date-fns';

// Automation Engine - runs in background to check and execute automation rules
export default function AutomationEngine({ 
  implementations, 
  tasks, 
  risks, 
  resources,
  allocations,
  automationRules 
}) {
  const lastCheckRef = useRef({});

  useEffect(() => {
    if (!automationRules || automationRules.length === 0) return;

    const runAutomations = async () => {
      const activeRules = automationRules.filter(rule => rule.is_active);

      for (const rule of activeRules) {
        try {
          await executeRule(rule);
        } catch (error) {
          console.error(`Automation rule ${rule.rule_name} failed:`, error);
        }
      }
    };

    // Run automations every 30 seconds
    const interval = setInterval(runAutomations, 30000);
    runAutomations(); // Run once on mount

    return () => clearInterval(interval);
  }, [automationRules, implementations, tasks, risks, resources, allocations]);

  const executeRule = async (rule) => {
    const ruleKey = rule.id;
    const now = Date.now();
    
    // Prevent duplicate execution within 1 minute
    if (lastCheckRef.current[ruleKey] && now - lastCheckRef.current[ruleKey] < 60000) {
      return;
    }

    let triggered = false;

    switch (rule.rule_type) {
      case 'Status Change':
        triggered = await checkStatusChange(rule);
        break;
      case 'Task Overdue':
        triggered = await checkOverdueTasks(rule);
        break;
      case 'Risk Escalation':
        triggered = await checkRiskEscalation(rule);
        break;
      case 'Budget Threshold':
        triggered = await checkBudgetThreshold(rule);
        break;
      case 'Milestone Alert':
        triggered = await checkMilestones(rule);
        break;
      case 'Resource Overallocation':
        triggered = await checkResourceOverallocation(rule);
        break;
    }

    if (triggered) {
      lastCheckRef.current[ruleKey] = now;
      await executeActions(rule);
      
      // Update execution stats
      await base44.entities.AutomationRule.update(rule.id, {
        last_executed: new Date().toISOString(),
        execution_count: (rule.execution_count || 0) + 1
      });
    }
  };

  const checkStatusChange = async (rule) => {
    const condition = rule.trigger_condition;
    if (!condition) return false;

    const changedImplementations = implementations.filter(impl => {
      if (condition.field === 'status' && condition.operator === 'changed_to') {
        return impl.status === condition.value && 
               impl.updated_date && 
               new Date(impl.updated_date) > new Date(Date.now() - 60000);
      }
      return false;
    });

    if (changedImplementations.length > 0) {
      rule._triggerData = { implementations: changedImplementations };
      return true;
    }
    return false;
  };

  const checkOverdueTasks = async (rule) => {
    const today = new Date();
    const overdueTasks = tasks.filter(task => {
      if (task.status === 'Done' || !task.due_date) return false;
      const dueDate = parseISO(task.due_date);
      const daysOverdue = differenceInDays(today, dueDate);
      return daysOverdue > 0;
    });

    if (overdueTasks.length > 0) {
      rule._triggerData = { tasks: overdueTasks };
      return true;
    }
    return false;
  };

  const checkRiskEscalation = async (rule) => {
    const criticalRisks = risks.filter(risk => 
      risk.status !== 'Resolved' && 
      (risk.impact === 'Critical' || risk.risk_score >= 8)
    );

    if (criticalRisks.length > 0) {
      rule._triggerData = { risks: criticalRisks };
      return true;
    }
    return false;
  };

  const checkBudgetThreshold = async (rule) => {
    const condition = rule.trigger_condition;
    const threshold = parseFloat(condition?.value) || 80;

    const exceededBudgets = implementations.filter(impl => {
      if (!impl.budget_allocated || impl.budget_allocated === 0) return false;
      const utilization = (impl.budget_spent / impl.budget_allocated) * 100;
      return utilization >= threshold;
    });

    if (exceededBudgets.length > 0) {
      rule._triggerData = { implementations: exceededBudgets };
      return true;
    }
    return false;
  };

  const checkMilestones = async (rule) => {
    const today = new Date();
    const upcomingMilestones = implementations.filter(impl => {
      if (!impl.target_end_date || impl.status === 'Completed') return false;
      const daysUntil = differenceInDays(parseISO(impl.target_end_date), today);
      return daysUntil <= 7 && daysUntil >= 0;
    });

    if (upcomingMilestones.length > 0) {
      rule._triggerData = { implementations: upcomingMilestones };
      return true;
    }
    return false;
  };

  const checkResourceOverallocation = async (rule) => {
    const overallocated = resources.filter(r => (r.current_utilization || 0) > 100);

    if (overallocated.length > 0) {
      rule._triggerData = { resources: overallocated };
      return true;
    }
    return false;
  };

  const executeActions = async (rule) => {
    if (!rule.actions || rule.actions.length === 0) return;

    for (const action of rule.actions) {
      try {
        switch (action.action_type) {
          case 'create_task':
            await createTaskAction(rule, action.parameters);
            break;
          case 'send_notification':
            await sendNotificationAction(rule, action.parameters);
            break;
          case 'update_status':
            await updateStatusAction(rule, action.parameters);
            break;
          case 'escalate':
            await escalateAction(rule, action.parameters);
            break;
          case 'log_activity':
            await logActivityAction(rule, action.parameters);
            break;
        }
      } catch (error) {
        console.error(`Action ${action.action_type} failed:`, error);
      }
    }
  };

  const createTaskAction = async (rule, parameters) => {
    const triggerData = rule._triggerData;
    if (!triggerData) return;

    if (triggerData.implementations) {
      for (const impl of triggerData.implementations) {
        const taskExists = tasks.some(
          t => t.implementation_id === impl.id && 
               t.task_name === parameters.task_name
        );
        
        if (!taskExists) {
          await base44.entities.Task.create({
            implementation_id: impl.id,
            task_name: parameters.task_name || 'Automated Task',
            description: parameters.description || `Auto-generated by ${rule.rule_name}`,
            status: parameters.status || 'To Do',
            priority: parameters.priority || 'High',
            phase: parameters.phase || 'Planning',
            due_date: parameters.due_date
          });
        }
      }
    }
  };

  const sendNotificationAction = async (rule, parameters) => {
    const triggerData = rule._triggerData;
    let message = parameters.message || 'Automation triggered';
    
    if (triggerData?.tasks) {
      message = `${triggerData.tasks.length} overdue task(s) require attention`;
    } else if (triggerData?.risks) {
      message = `${triggerData.risks.length} critical risk(s) need escalation`;
    } else if (triggerData?.implementations) {
      message = `Alert for ${triggerData.implementations.length} project(s)`;
    } else if (triggerData?.resources) {
      message = `${triggerData.resources.length} resource(s) overallocated`;
    }

    await base44.entities.Notification.create({
      title: parameters.title || rule.rule_name,
      message: message,
      notification_type: parameters.notification_type || 'Warning',
      priority: rule.priority,
      automation_rule_id: rule.id,
      recipient: parameters.recipient
    });
  };

  const escalateAction = async (rule, parameters) => {
    const triggerData = rule._triggerData;
    
    await base44.entities.Notification.create({
      title: `🚨 ESCALATION: ${rule.rule_name}`,
      message: parameters.escalation_message || 'Critical issue requires immediate attention',
      notification_type: 'Escalation',
      priority: 'Critical',
      automation_rule_id: rule.id,
      recipient: parameters.escalate_to || 'admin@trilogic.com'
    });
  };

  const logActivityAction = async (rule, parameters) => {
    await base44.entities.ActivityLog.create({
      action_type: 'Updated',
      entity_type: 'AutomationRule',
      description: `Automation executed: ${rule.rule_name}`,
      performed_by: 'system'
    });
  };

  return null; // This is a background component
}