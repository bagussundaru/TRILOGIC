import express from 'express';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get S-Curve data for a project
router.get('/project/:projectId/s-curve', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        // Get project info
        const [project] = await pool.query(`
            SELECT 
                id, name, contract_value, 
                construction_start, construction_end,
                DATEDIFF(construction_end, construction_start) as total_days
            FROM projects 
            WHERE id = ?
        `, [projectId]);

        if (!project[0]) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Get BOQ totals for PV and EV
        const [boqTotals] = await pool.query(`
            SELECT 
                SUM(contract_qty * contract_price) as planned_value,
                SUM(executed_qty * contract_price) as earned_value,
                COUNT(*) as total_items,
                SUM(CASE WHEN executed_qty > 0 THEN 1 ELSE 0 END) as items_started,
                SUM(CASE WHEN executed_qty >= contract_qty THEN 1 ELSE 0 END) as items_completed
            FROM boq_items
            WHERE project_id = ?
        `, [projectId]);

        // Get progress reports for historical data
        const [progressReports] = await pool.query(`
            SELECT 
                period_end,
                pv, ev, ac,
                planned_progress,
                actual_progress
            FROM progress_reports
            WHERE project_id = ?
            ORDER BY period_end ASC
        `, [projectId]);

        // Calculate EVM metrics
        const pv = boqTotals[0]?.planned_value || 0;
        const ev = boqTotals[0]?.earned_value || 0;
        const ac = ev * 1.05; // Simulated AC (5% over budget for demo)

        const cpi = ac > 0 ? ev / ac : 1;
        const spi = pv > 0 ? ev / pv : 1;

        // Calculate forecasts
        const bac = project[0].contract_value || pv;
        const eac = cpi > 0 ? bac / cpi : bac;
        const etc = eac - ac;
        const vac = bac - eac;

        // Generate monthly S-Curve data
        const startDate = new Date(project[0].construction_start || Date.now());
        const endDate = new Date(project[0].construction_end || Date.now());
        const totalMonths = Math.ceil((endDate - startDate) / (30 * 24 * 60 * 60 * 1000)) || 12;

        const sCurveData = {
            periods: [],
            planned: [],
            earned: [],
            actual: []
        };

        // Generate planned S-curve (typical construction profile)
        for (let i = 0; i <= Math.min(totalMonths, 24); i++) {
            const month = new Date(startDate);
            month.setMonth(month.getMonth() + i);

            // S-curve formula (sigmoid)
            const t = i / totalMonths;
            const plannedPct = 100 / (1 + Math.exp(-10 * (t - 0.5)));
            const plannedValue = (plannedPct / 100) * pv;

            // Actual progress (from reports or simulated)
            const report = progressReports.find(r => {
                const reportDate = new Date(r.period_end);
                return reportDate.getMonth() === month.getMonth() &&
                    reportDate.getFullYear() === month.getFullYear();
            });

            const earnedValue = report ? report.ev : (i <= (totalMonths * (ev / pv || 0)) ? plannedValue * 0.95 : 0);
            const actualCost = report ? report.ac : earnedValue * 1.05;

            sCurveData.periods.push(month.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }));
            sCurveData.planned.push(Math.round(plannedValue / 1e6)); // In millions
            sCurveData.earned.push(Math.round(earnedValue / 1e6));
            sCurveData.actual.push(Math.round(actualCost / 1e6));
        }

        res.json({
            success: true,
            data: {
                project: project[0],
                summary: {
                    bac: bac,
                    pv: pv,
                    ev: ev,
                    ac: ac,
                    sv: ev - pv,
                    cv: ev - ac,
                    spi: spi,
                    cpi: cpi,
                    eac: eac,
                    etc: etc,
                    vac: vac,
                    tcpi: (bac - ev) / (bac - ac),
                    progressPct: pv > 0 ? (ev / pv * 100) : 0
                },
                boqStats: boqTotals[0],
                sCurve: sCurveData,
                reports: progressReports
            }
        });
    } catch (error) {
        console.error('Error fetching S-Curve data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get category breakdown for progress
router.get('/project/:projectId/category-progress', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        const [categories] = await pool.query(`
            SELECT 
                category,
                SUM(contract_qty * contract_price) as planned,
                SUM(executed_qty * contract_price) as earned,
                COUNT(*) as item_count
            FROM boq_items
            WHERE project_id = ?
            GROUP BY category
            ORDER BY planned DESC
        `, [projectId]);

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching category progress:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get monthly progress comparison
router.get('/project/:projectId/monthly-progress', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        const [monthly] = await pool.query(`
            SELECT 
                DATE_FORMAT(period_end, '%Y-%m') as month,
                MAX(planned_progress) as planned,
                MAX(actual_progress) as actual,
                MAX(pv) as pv,
                MAX(ev) as ev,
                MAX(ac) as ac
            FROM progress_reports
            WHERE project_id = ?
            GROUP BY DATE_FORMAT(period_end, '%Y-%m')
            ORDER BY month ASC
        `, [projectId]);

        res.json({
            success: true,
            data: monthly
        });
    } catch (error) {
        console.error('Error fetching monthly progress:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
