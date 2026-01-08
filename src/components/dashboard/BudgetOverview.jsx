import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, PieChart } from 'lucide-react';

// Format currency in billions
const formatBudget = (value) => {
    if (!value) return 'Rp 0';
    if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1)}M`;
    return `Rp ${value.toLocaleString()}`;
};

export default function BudgetOverview({ projects = [] }) {
    // Calculate totals
    const totalAllocated = projects.reduce((sum, p) => sum + (p.budget_allocated || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.budget_spent || 0), 0);
    const utilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    const remaining = totalAllocated - totalSpent;

    // Projects by budget status
    const underBudget = projects.filter(p => (p.budget_spent || 0) < (p.budget_allocated || 0) * 0.8).length;
    const onBudget = projects.filter(p => {
        const ratio = (p.budget_spent || 0) / (p.budget_allocated || 1);
        return ratio >= 0.8 && ratio <= 1;
    }).length;
    const overBudget = projects.filter(p => (p.budget_spent || 0) > (p.budget_allocated || 0)).length;

    const budgetCards = [
        {
            title: 'Total Allocated',
            value: formatBudget(totalAllocated),
            icon: DollarSign,
            color: 'blue',
            gradient: 'from-blue-50/80 via-white to-indigo-50/50'
        },
        {
            title: 'Total Spent',
            value: formatBudget(totalSpent),
            icon: TrendingDown,
            color: 'emerald',
            gradient: 'from-emerald-50/80 via-white to-green-50/50'
        },
        {
            title: 'Remaining',
            value: formatBudget(remaining),
            icon: TrendingUp,
            color: 'teal',
            gradient: 'from-teal-50/80 via-white to-cyan-50/50'
        },
        {
            title: 'Utilization',
            value: `${utilization.toFixed(1)}%`,
            icon: PieChart,
            color: utilization > 90 ? 'amber' : 'violet',
            gradient: utilization > 90 ? 'from-amber-50/80 via-white to-orange-50/50' : 'from-violet-50/80 via-white to-purple-50/50'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Budget Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {budgetCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -4 }}
                        className="group"
                    >
                        <Card className={`relative overflow-hidden border border-[#f0f2f5] shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                            <div className={`absolute top-0 left-0 bottom-0 w-1 bg-${card.color}-400 opacity-60`} />
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#888]">{card.title}</p>
                                    <p className="text-[28px] font-bold text-[#1a1a1a] mt-1 leading-tight">{card.value}</p>
                                </div>
                                <div className={`p-3 bg-${card.color}-100 text-${card.color}-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm`}>
                                    <card.icon className="w-5 h-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Budget Health Indicator */}
            <Card className="border border-[#f0f2f5] rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 py-4">
                    <CardTitle className="text-base font-semibold text-[#1a1a1a] flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-teal-600" />
                        Budget Health by Project
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    {/* Budget Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                            <span>Budget Utilization</span>
                            <span>{utilization.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(utilization, 100)}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full rounded-full ${utilization > 100 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                                        utilization > 80 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                                            'bg-gradient-to-r from-teal-500 to-cyan-400'
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Project Budget Status */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-emerald-50 rounded-xl">
                            <p className="text-2xl font-bold text-emerald-600">{underBudget}</p>
                            <p className="text-[10px] uppercase tracking-wider text-emerald-700">Under Budget</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                            <p className="text-2xl font-bold text-blue-600">{onBudget}</p>
                            <p className="text-[10px] uppercase tracking-wider text-blue-700">On Budget</p>
                        </div>
                        <div className="text-center p-3 bg-rose-50 rounded-xl">
                            <p className="text-2xl font-bold text-rose-600">{overBudget}</p>
                            <p className="text-[10px] uppercase tracking-wider text-rose-700">Over Budget</p>
                        </div>
                    </div>

                    {/* Warning if over budget */}
                    {overBudget > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3"
                        >
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <p className="text-sm text-amber-800">
                                <strong>{overBudget} project(s)</strong> are over budget. Review and take action.
                            </p>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
