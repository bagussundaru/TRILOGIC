import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    TrendingUp, TrendingDown, Activity, Target,
    CheckCircle2, Clock, AlertTriangle, Zap,
    BarChart3, PieChart
} from 'lucide-react';

// Analytics card with trend indicator
function AnalyticsCard({ title, value, change, trend, icon: Icon, color }) {
    const isPositive = trend === 'up';
    const gradients = {
        teal: 'from-teal-50/80 via-white to-cyan-50/50',
        emerald: 'from-emerald-50/80 via-white to-green-50/50',
        blue: 'from-blue-50/80 via-white to-indigo-50/50',
        amber: 'from-amber-50/80 via-white to-orange-50/50',
        violet: 'from-violet-50/80 via-white to-purple-50/50'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group"
        >
            <Card className={`relative overflow-hidden border border-[#f0f2f5] shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl bg-gradient-to-br ${gradients[color]}`}>
                <div className={`absolute top-0 left-0 bottom-0 w-1 bg-${color}-400 opacity-60`} />
                <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#888]">{title}</p>
                            <p className="text-[32px] font-bold text-[#1a1a1a] mt-1 leading-tight">{value}</p>
                            {change && (
                                <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    <span className="font-medium">{change}</span>
                                    <span className="text-slate-400 text-xs">vs last month</span>
                                </div>
                            )}
                        </div>
                        <div className={`p-3 bg-${color}-100 text-${color}-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm`}>
                            <Icon className="w-5 h-5" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Performance gauge component
function PerformanceGauge({ label, value, target, color = 'teal' }) {
    const percentage = Math.min((value / target) * 100, 100);
    const isOnTrack = percentage >= 80;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <span className={`text-sm font-bold ${isOnTrack ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {value} / {target}
                </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${isOnTrack ? 'from-emerald-500 to-teal-400' : 'from-amber-500 to-orange-400'}`}
                />
            </div>
        </div>
    );
}

export default function AdvancedAnalytics({ data = {} }) {
    const {
        projects = [],
        tasks = [],
        resources = []
    } = data;

    // Calculate analytics
    const activeProjects = projects.filter(p => ['Planning', 'In Progress'].includes(p.status)).length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const avgProjectProgress = projects.length > 0
        ? Math.round(projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / projects.length)
        : 0;

    // Team velocity (mock)
    const teamVelocity = 42;
    const velocityChange = '+8%';

    // Resource utilization
    const humanResources = resources.filter(r => r.type === 'Human').length;

    const analyticsCards = [
        { title: 'Team Velocity', value: teamVelocity, change: velocityChange, trend: 'up', icon: Zap, color: 'teal' },
        { title: 'Task Completion', value: `${taskCompletionRate}%`, change: '+5%', trend: 'up', icon: CheckCircle2, color: 'emerald' },
        { title: 'On-Time Delivery', value: '87%', change: '+3%', trend: 'up', icon: Clock, color: 'blue' },
        { title: 'Risk Score', value: '12', change: '-2', trend: 'down', icon: AlertTriangle, color: 'amber' }
    ];

    return (
        <div className="space-y-6">
            {/* Analytics Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analyticsCards.map((card, i) => (
                    <AnalyticsCard key={i} {...card} />
                ))}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* KPI Progress */}
                <Card className="border border-[#f0f2f5] rounded-xl">
                    <CardHeader className="py-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Target className="w-4 h-4 text-teal-600" />
                            KPI Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <PerformanceGauge label="Projects Completed" value={completedProjects} target={projects.length || 1} />
                        <PerformanceGauge label="Tasks Completed" value={completedTasks} target={totalTasks || 1} />
                        <PerformanceGauge label="Budget On Track" value={7} target={8} />
                        <PerformanceGauge label="Team Capacity Used" value={humanResources * 0.75} target={humanResources} color="blue" />
                    </CardContent>
                </Card>

                {/* Activity Trends */}
                <Card className="border border-[#f0f2f5] rounded-xl">
                    <CardHeader className="py-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Activity className="w-4 h-4 text-violet-600" />
                            Weekly Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Mini bar chart visualization */}
                        <div className="flex items-end justify-between gap-2 h-32">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                                const height = Math.random() * 80 + 20;
                                return (
                                    <div key={day} className="flex flex-col items-center flex-1">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ delay: i * 0.1, duration: 0.5 }}
                                            className="w-full bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t-sm"
                                        />
                                        <span className="text-[10px] text-slate-500 mt-2">{day}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <div className="w-3 h-3 rounded bg-gradient-to-r from-teal-500 to-cyan-400" />
                                Tasks Completed
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Project Health Matrix */}
            <Card className="border border-[#f0f2f5] rounded-xl">
                <CardHeader className="py-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        Project Health Matrix
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <HealthCell status="Healthy" count={projects.filter(p => p.health_status === 'Healthy').length} color="emerald" />
                        <HealthCell status="On Track" count={projects.filter(p => p.health_status === 'On Track').length} color="blue" />
                        <HealthCell status="At Risk" count={projects.filter(p => p.health_status === 'At Risk').length} color="amber" />
                        <HealthCell status="Critical" count={projects.filter(p => p.health_status === 'Critical').length} color="rose" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Health status cell
function HealthCell({ status, count, color }) {
    const colors = {
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        amber: 'bg-amber-50 border-amber-200 text-amber-700',
        rose: 'bg-rose-50 border-rose-200 text-rose-700'
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-4 rounded-xl border ${colors[color]} text-center`}
        >
            <p className="text-3xl font-bold">{count}</p>
            <p className="text-xs font-medium mt-1">{status}</p>
        </motion.div>
    );
}
