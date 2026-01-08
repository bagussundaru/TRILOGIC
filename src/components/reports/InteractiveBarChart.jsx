import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function InteractiveBarChart({ data }) {
    const [activeIndex, setActiveIndex] = useState(null);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm px-4 py-3 shadow-xl rounded-xl border border-gray-100">
                    <p className="font-bold text-gray-800 mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500" />
                        <span className="text-sm font-medium text-gray-600">Revenue:</span>
                        <span className="text-sm font-bold text-gray-900">Rp {payload[0].value}B</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="p-6 border-0 shadow-lg shadow-gray-200/50 rounded-2xl bg-white h-full relative overflow-hidden group">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Financial Growth</h3>
                <p className="text-sm text-gray-500">Monthly revenue actuals vs targets</p>
            </div>

            {/* Chart Container */}
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        onMouseMove={(state) => {
                            if (state.isTooltipActive) {
                                setActiveIndex(state.activeTooltipIndex);
                            } else {
                                setActiveIndex(null);
                            }
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            tickFormatter={(val) => `${val}B`}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar
                            dataKey="value"
                            radius={[6, 6, 0, 0]}
                            animationDuration={1500}
                            animationEasing="ease-out"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={activeIndex === index ? '#0d9488' : '#14b8a6'} // Teal-600 vs Teal-500
                                    className="transition-all duration-300 cursor-pointer hover:filter hover:brightness-110"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Interaction Hint */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {/* Could add subtle guided overlays here if needed */}
            </div>
        </Card>
    );
}
