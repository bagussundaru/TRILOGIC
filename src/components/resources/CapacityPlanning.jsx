import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Users } from 'lucide-react';

export default function CapacityPlanning({ resources }) {

  // Prepare chart data
  const data = resources.map(r => ({
    name: r.name.split(' ')[0], // First name for chart
    capacity: r.capacity,
    load: r.load,
    available: Math.max(0, r.capacity - r.load),
    overload: Math.max(0, r.load - r.capacity),
    role: r.role
  }));

  // Stats
  const totalCapacity = data.reduce((acc, curr) => acc + curr.capacity, 0);
  const totalLoad = data.reduce((acc, curr) => acc + curr.load, 0);
  const avgUtilization = Math.round((totalLoad / totalCapacity) * 100);
  const overAllocatedCount = data.filter(d => d.overload > 0).length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 shadow-xl rounded-xl border border-gray-100 text-sm">
          <p className="font-bold text-gray-800 mb-1">{label}</p>
          <p className="text-gray-500 text-xs mb-2">{payload[0].payload.role}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-blue-500 font-medium">Load:</span>
            <span className="font-bold">{payload[0].payload.load} hrs</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400 font-medium">Capacity:</span>
            <span className="font-bold">{payload[0].payload.capacity} hrs</span>
          </div>
          {payload[0].payload.overload > 0 && (
            <div className="mt-2 text-red-600 font-bold bg-red-50 px-2 py-1 rounded text-center">
              ⚠ Overloaded
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Mini Stat Cards for Capacity Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-blue-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Team Capacity</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(avgUtilization)}%</p>
              <p className="text-xs text-gray-400">{totalLoad} / {totalCapacity} Hrs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-purple-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg Utilization</p>
              {/* Mock Trend */}
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-gray-900">{avgUtilization}%</p>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-1 rounded">↑ 5%</span>
              </div>
              <p className="text-xs text-gray-400">across all resources</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`border-0 shadow-sm ${overAllocatedCount > 0 ? 'bg-red-50/50' : 'bg-green-50/50'}`}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <AlertTriangle className={`w-5 h-5 ${overAllocatedCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Bottlenecks</p>
              <p className="text-2xl font-bold text-gray-900">{overAllocatedCount}</p>
              <p className="text-xs text-gray-400">overallocated resources</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Resource Capacity & Utilization</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {/* Background bar for Capacity */}
              <Bar dataKey="capacity" name="Capacity" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
              {/* Foreground bar for Load, color coded? Recharts simple usage: just simple bar */}
              {/* To do overlapping "thermometer" style in Recharts is tricky without custom shape. 
                                We'll use a simpler 'Load' bar next to it or stick to mocked visually distinct logic if possible.
                                A better way for Capacity vs Load is usually side-by-side or composed. 
                                Let's do simple side-by-side for clarity in this MVP.
                            */}
            </BarChart>

            {/* 
                            Revising Strategy: Vertical Bar Chart where Y-axis is % Utilization might be better 
                            OR a simple composed chart.
                            Let's try a standard Composed Chart where Bar = Load, Line/Area = Capacity? No, resource specific.
                            Let's stick to the user's mockup logic: Horizontal bars.
                            The user mockup shows single bars. Let's do a trick: 
                            Render the bars.
                         */}
          </ResponsiveContainer>

          {/* 
                        Let's re-render simpler div-based charts for perfect visual match to the mockup 
                        since Recharts vertical stacking behavior can be finicky for "Target line".
                    */}
          <div className="mt-4 space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-4">
                <span className="w-20 text-sm text-gray-500 font-medium text-right truncate" title={item.role}>{item.name}</span>
                <div className="flex-1 relative h-6 bg-gray-100 rounded-full overflow-hidden">
                  {/* Capacity Marker (100% usually) */}
                  {/* Load Bar */}
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full ${item.load > item.capacity ? 'bg-red-500' : 'bg-teal-500'}`}
                    style={{ width: `${Math.min((item.load / 200) * 100, 100)}%` }} // Assuming 200 is max scale for viz
                  />
                  {/* Capacity Line Marker if we assume 160 is standard */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10" style={{ left: `${(item.capacity / 200) * 100}%` }} />
                </div>
                <span className="w-12 text-xs font-bold text-gray-700 text-right">{Math.round((item.load / item.capacity) * 100)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
