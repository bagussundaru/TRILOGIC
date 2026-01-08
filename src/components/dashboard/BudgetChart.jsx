import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { motion } from "framer-motion";
import { format, subMonths, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

export default function BudgetChart({ implementations }) {
    // Process data to show monthly spending trend over last 12 months
    const chartData = useMemo(() => {
        const today = new Date();
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const date = subMonths(today, i);
            months.push({
                date: date,
                label: format(date, 'MMM yyyy'),
                rawAllocated: 0,
                rawSpent: 0,
                IT_Spent: 0,
                Const_Spent: 0
            });
        }

        implementations.forEach(impl => {
            const created = parseISO(impl.created_date);
            months.forEach(month => {
                // Simplistic logic: assign spending to the month created (cumulative for chart visual)
                // In reality, spending is spread, but for mock purposes we stack it.
                // Better Viz: Cumulative Budget vs Current Spend

                // Let's do: Sum of budgets for projects active in that month? 
                // Or just aggregate projects created in that month to show "New Projects Value".

                // Let's show: Monthly Financial Flow (Projects Initiated vs Spend)
                if (isWithinInterval(created, { start: startOfMonth(month.date), end: endOfMonth(month.date) })) {
                    month.rawAllocated += (impl.budget_allocated || 0);
                    month.rawSpent += (impl.budget_spent || 0);

                    if (impl.type === 'IT') month.IT_Spent += (impl.budget_spent || 0);
                    else month.Const_Spent += (impl.budget_spent || 0);
                }
            });
        });

        // Convert to Billions for easier reading
        return months.map(m => ({
            name: m.label,
            "Total Allocated": Number((m.rawAllocated / 1000000000).toFixed(2)),
            "IT Spend": Number((m.IT_Spent / 1000000000).toFixed(2)),
            "Construction Spend": Number((m.Const_Spent / 1000000000).toFixed(2)),
        }));
    }, [implementations]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm px-4 py-3 shadow-xl rounded-xl border border-gray-100 min-w-[200px]">
                    <p className="font-bold text-gray-800 mb-2">{label}</p>
                    {payload.map((p, i) => (
                        <div key={i} className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500 font-medium" style={{ color: p.color }}>
                                {p.name}
                            </span>
                            <span className="font-mono text-sm font-semibold">
                                Rp {p.value}B
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full"
        >
            <Card className="border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 h-full rounded-xl overflow-hidden">
                <CardHeader className="pb-0 border-b border-[#f0f2f5]">
                    <CardTitle className="text-lg font-bold text-[#1a1a1a]">Annual Financial Overview</CardTitle>
                    <p className="text-sm text-[#999]">Monthly spend by sector (Billions IDR)</p>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorIT" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorConst" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                tickMargin={10}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `${value}B`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ top: -40, right: 0 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="Total Allocated"
                                stroke="#94a3b8"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                fillOpacity={1}
                                fill="url(#colorAllocated)"
                                animationDuration={2000}
                            />
                            <Area
                                type="monotone"
                                dataKey="IT Spend"
                                stackId="1"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorIT)"
                                animationDuration={2500}
                            />
                            <Area
                                type="monotone"
                                dataKey="Construction Spend"
                                stackId="1"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorConst)"
                                animationDuration={3000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>
    );
}