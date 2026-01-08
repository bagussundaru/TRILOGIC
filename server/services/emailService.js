import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter (using Gmail or any SMTP)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
});

// Email templates
const templates = {
    projectAssigned: (data) => ({
        subject: `[Smart TRILOGIC] You've been assigned to project: ${data.projectName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Smart TRILOGIC</h1>
                </div>
                <div style="padding: 30px; background: #f8fafc;">
                    <h2 style="color: #1e293b;">New Project Assignment</h2>
                    <p style="color: #475569;">Hello ${data.userName},</p>
                    <p style="color: #475569;">You have been assigned to a new project:</p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #0d9488; margin-top: 0;">${data.projectName}</h3>
                        <p style="color: #64748b; margin: 5px 0;"><strong>Role:</strong> ${data.role}</p>
                        <p style="color: #64748b; margin: 5px 0;"><strong>Start Date:</strong> ${data.startDate}</p>
                        <p style="color: #64748b; margin: 5px 0;"><strong>Target End:</strong> ${data.targetEnd}</p>
                    </div>
                    <a href="${data.dashboardUrl}" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Project</a>
                </div>
                <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                    © 2026 Smart TRILOGIC PMO Dashboard
                </div>
            </div>
        `
    }),

    taskAssigned: (data) => ({
        subject: `[Smart TRILOGIC] New task assigned: ${data.taskName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Smart TRILOGIC</h1>
                </div>
                <div style="padding: 30px; background: #f8fafc;">
                    <h2 style="color: #1e293b;">New Task Assigned</h2>
                    <p style="color: #475569;">Hello ${data.userName},</p>
                    <p style="color: #475569;">A new task has been assigned to you:</p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #0d9488; margin-top: 0;">${data.taskName}</h3>
                        <p style="color: #64748b; margin: 5px 0;"><strong>Project:</strong> ${data.projectName}</p>
                        <p style="color: #64748b; margin: 5px 0;"><strong>Priority:</strong> ${data.priority}</p>
                        <p style="color: #64748b; margin: 5px 0;"><strong>Due Date:</strong> ${data.dueDate}</p>
                    </div>
                    <a href="${data.taskUrl}" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Task</a>
                </div>
            </div>
        `
    }),

    deadlineReminder: (data) => ({
        subject: `[Smart TRILOGIC] ⚠️ Deadline approaching: ${data.taskName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">⏰ Deadline Reminder</h1>
                </div>
                <div style="padding: 30px; background: #fffbeb;">
                    <h2 style="color: #92400e;">Task Due Soon!</h2>
                    <p style="color: #78350f;">Hello ${data.userName},</p>
                    <p style="color: #78350f;">This task is due in <strong>${data.daysLeft} days</strong>:</p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <h3 style="color: #92400e; margin-top: 0;">${data.taskName}</h3>
                        <p style="color: #a16207;"><strong>Due Date:</strong> ${data.dueDate}</p>
                    </div>
                    <a href="${data.taskUrl}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Complete Task</a>
                </div>
            </div>
        `
    }),

    riskAlert: (data) => ({
        subject: `[Smart TRILOGIC] 🚨 Risk Alert: ${data.riskTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🚨 Risk Alert</h1>
                </div>
                <div style="padding: 30px; background: #fef2f2;">
                    <h2 style="color: #991b1b;">New Risk Identified</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                        <h3 style="color: #dc2626; margin-top: 0;">${data.riskTitle}</h3>
                        <p style="color: #991b1b;"><strong>Project:</strong> ${data.projectName}</p>
                        <p style="color: #991b1b;"><strong>Impact:</strong> ${data.impact}</p>
                        <p style="color: #991b1b;"><strong>Probability:</strong> ${data.probability}</p>
                        <p style="color: #7f1d1d; margin-top: 15px;">${data.description}</p>
                    </div>
                    <a href="${data.riskUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Risk Details</a>
                </div>
            </div>
        `
    }),

    weeklyReport: (data) => ({
        subject: `[Smart TRILOGIC] Weekly PMO Report - ${data.weekDate}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Weekly PMO Report</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">${data.weekDate}</p>
                </div>
                <div style="padding: 30px; background: #f8fafc;">
                    <h2 style="color: #1e293b;">Portfolio Summary</h2>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
                        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                            <p style="color: #64748b; margin: 0; font-size: 14px;">Active Projects</p>
                            <p style="color: #0d9488; font-size: 32px; font-weight: bold; margin: 5px 0;">${data.activeProjects}</p>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                            <p style="color: #64748b; margin: 0; font-size: 14px;">Tasks Completed</p>
                            <p style="color: #0d9488; font-size: 32px; font-weight: bold; margin: 5px 0;">${data.tasksCompleted}</p>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                            <p style="color: #64748b; margin: 0; font-size: 14px;">At Risk</p>
                            <p style="color: #f59e0b; font-size: 32px; font-weight: bold; margin: 5px 0;">${data.atRiskProjects}</p>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                            <p style="color: #64748b; margin: 0; font-size: 14px;">Budget Utilization</p>
                            <p style="color: #0d9488; font-size: 32px; font-weight: bold; margin: 5px 0;">${data.budgetUtilization}%</p>
                        </div>
                    </div>
                    <a href="${data.dashboardUrl}" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Full Dashboard</a>
                </div>
            </div>
        `
    })
};

/**
 * Send email notification
 */
export async function sendEmail(to, templateName, data) {
    try {
        // Skip if SMTP not configured
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log(`📧 Email skipped (SMTP not configured): ${templateName} to ${to}`);
            return { success: true, skipped: true };
        }

        const template = templates[templateName];
        if (!template) {
            throw new Error(`Email template '${templateName}' not found`);
        }

        const { subject, html } = template(data);

        const info = await transporter.sendMail({
            from: `"Smart TRILOGIC" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });

        console.log(`📧 Email sent: ${templateName} to ${to}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send notification to user (creates DB record + optional email)
 */
export async function sendNotification(userId, title, message, type = 'Info', options = {}) {
    try {
        const { query } = await import('../db/connection.js');

        // Create notification record
        await query(`
            INSERT INTO notifications (id, user_id, title, message, type, severity, related_entity_type, related_entity_id, action_url)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            title,
            message,
            type,
            options.severity || 'Medium',
            options.entityType || null,
            options.entityId || null,
            options.actionUrl || null
        ]);

        // Send email if email address provided
        if (options.email && options.templateName) {
            await sendEmail(options.email, options.templateName, options.templateData);
        }

        return { success: true };
    } catch (error) {
        console.error('Notification error:', error);
        return { success: false, error: error.message };
    }
}

export default { sendEmail, sendNotification, templates };
