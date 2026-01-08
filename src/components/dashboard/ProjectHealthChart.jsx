import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from "framer-motion";

export default function ProjectHealthChart({ implementations }) {
  const healthCounts = implementations.reduce((acc, impl) => {
    const health = impl.health_status || 'On Track';
    acc[health] = (acc[health] || 0) + 1;
    return acc;
  }, {});

  const data = [
    { name: 'On Track', value: healthCounts['On Track'] || 0, color: '#10b981' }, // Emerald-500
    { name: 'Healthy', value: healthCounts['Healthy'] || 0, color: '#34d399' }, // Emerald-400
    { name: 'At Risk', value: healthCounts['At Risk'] || 0, color: '#f59e0b' }, // Amber-500
    { name: 'Critical', value: healthCounts['Critical'] || 0, color: '#ef4444' }, // Red-500
    { name: 'Completed', value: healthCounts['Completed'] || 0, color: '#6366f1' }, // Indigo-500
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 shadow-xl rounded-xl border border-gray-100">
          <p className="font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></span>
            {payload[0].name}
          </p>
          <p className="text-gray-500 text-sm mt-1">{payload[0].value} projects</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full"
    >
      <Card className="border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 h-full rounded-xl overflow-hidden">
        <CardHeader className="pb-0 border-b border-[#f0f2f5]">
          <CardTitle className="text-lg font-bold text-[#1a1a1a]">Project Health Distribution</CardTitle>
          <p className="text-sm text-[#999]">Live status of active engagements</p>
        </CardHeader>
        <CardContent className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={1500}
                  cornerRadius={6}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-sm font-medium text-gray-600 ml-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No project data available
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}