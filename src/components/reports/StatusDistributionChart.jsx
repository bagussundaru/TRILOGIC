import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatusDistributionChart({ data }) {
    // Data format: [{ name: 'In Progress', value: 4, color: '#10b981' }, ...]

    // Default colors if not provided in data
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#cbd5e1'];

    return (
        <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-800">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text (Optional) - Total count could go here */}
                </div>
            </CardContent>
        </Card>
    );
}
