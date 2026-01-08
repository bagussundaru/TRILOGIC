import React from 'react';
import { useAuth, ROLES } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    DollarSign,
    FolderKanban,
    Users,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Target,
    PieChart,
    BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// CEO Executive Dashboard - High-level portfolio view
export function CEODashboard({ data }) {
    const metrics = [
        {
            title: 'Total Portfolio Value',
            value: `Rp ${(data.total_budget / 1e9 || 0).toFixed(1)}B`,
            icon: DollarSign,
            color: 'teal',
            gradient: 'from-teal-50/80 via-white to-cyan-50/50'
        },
        {
            title: 'ROI This Year',
            value: '+15.2%',
            icon: TrendingUp,
            color: 'emerald',
            gradient: 'from-emerald-50/80 via-white to-green-50/50'
        },
        {
            title: 'Active Projects',
            value: data.active_projects || 0,
            icon: FolderKanban,
            color: 'blue',
            gradient: 'from-blue-50/80 via-white to-indigo-50/50'
        },
        {
            title: 'At Risk',
            value: data.at_risk_projects || 0,
            icon: AlertTriangle,
            color: 'amber',
            gradient: 'from-amber-50/80 via-white to-orange-50/50'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 text-xl font-bold text-[#1a1a1a]">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                </div>
                Executive Overview
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -4 }}
                        className="group"
                    >
                        <Card className={`relative overflow-hidden border border-[#f0f2f5] shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl bg-gradient-to-br ${metric.gradient}`}>
                            <div className={`absolute top-0 left-0 bottom-0 w-1 bg-${metric.color}-400 opacity-60`} />
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#888]">{metric.title}</p>
                                    <p className="text-[42px] font-bold text-[#1a1a1a] mt-1 leading-tight">{metric.value}</p>
                                </div>
                                <div className={`p-4 bg-${metric.color}-100 text-${metric.color}-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm`}>
                                    <metric.icon className="w-6 h-6" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// PMO Director Dashboard - Operational view
export function PMODashboard({ data }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 text-xl font-bold text-[#1a1a1a]">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                </div>
                PMO Operations Dashboard
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <QuickStat label="Active Projects" value={data.active_projects || 0} color="teal" />
                <QuickStat label="Task Completion" value={`${data.task_completion_rate || 0}%`} color="emerald" />
                <QuickStat label="Budget Utilized" value={`${data.budget_utilization || 0}%`} color="blue" />
                <QuickStat label="At Risk" value={data.at_risk_projects || 0} color="rose" isAlert={data.at_risk_projects > 0} />
            </div>
        </div>
    );
}

// Project Manager Dashboard - Project-focused view
export function PMDashboard({ data }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 text-xl font-bold text-[#1a1a1a]">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                    <FolderKanban className="w-5 h-5 text-white" />
                </div>
                My Projects Dashboard
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <QuickStat label="Assigned Projects" value={data.active_projects || 0} color="blue" />
                <QuickStat label="Tasks Pending" value={data.total_tasks - data.completed_tasks || 0} color="amber" />
                <QuickStat label="Completed Today" value={data.completed_tasks || 0} color="emerald" />
                <QuickStat label="Overdue Tasks" value={0} color="rose" />
            </div>
        </div>
    );
}

// Quick Stat Component
function QuickStat({ label, value, color, isAlert = false }) {
    const colors = {
        teal: 'from-teal-50 to-cyan-50 border-teal-200 text-teal-700',
        emerald: 'from-emerald-50 to-green-50 border-emerald-200 text-emerald-700',
        blue: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-700',
        amber: 'from-amber-50 to-orange-50 border-amber-200 text-amber-700',
        rose: 'from-rose-50 to-red-50 border-rose-200 text-rose-700'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-4 bg-gradient-to-br ${colors[color]} border ${isAlert ? 'animate-pulse' : ''}`}
        >
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
        </motion.div>
    );
}

// Role-based dashboard selector
export default function RoleBasedDashboard({ data }) {
    const { user } = useAuth();

    if (!user) {
        return <PMODashboard data={data} />;
    }

    switch (user.role) {
        case ROLES.CEO:
        case ROLES.CFO:
            return <CEODashboard data={data} />;
        case ROLES.PMO_DIRECTOR:
        case ROLES.CTO:
            return <PMODashboard data={data} />;
        case ROLES.PROJECT_MANAGER:
        case ROLES.TEAM_LEAD:
            return <PMDashboard data={data} />;
        default:
            return <PMODashboard data={data} />;
    }
}
