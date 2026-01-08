import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectTrendChart({ data }) {
    return (
        <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-800">Project Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="month"
                                check={{ fontSize: 10, fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                check={{ fontSize: 10, fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="created"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorCreated)"
                                name="Created"
                            />
                            {/* Optional: Add Completed line if data exists, keeping it simple to match screenshot's blue fill */}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div> Created
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
