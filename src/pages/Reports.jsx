import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";
import { Loader2, Download, TrendingUp, Calendar, FileText, PieChart as PieIcon, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Charts
import ProjectTrendChart from '@/components/reports/ProjectTrendChart';
import StatusDistributionChart from '@/components/reports/StatusDistributionChart';
import BudgetByTypeChart from '@/components/reports/BudgetByTypeChart';
import ProjectsByRegionChart from '@/components/reports/ProjectsByRegionChart';
import TaskCompletionTrendChart from '@/components/reports/TaskCompletionTrendChart';

export default function Reports() {
  const [timeRange, setTimeRange] = useState("6m");

  const { data: implementations = [], isLoading: isLoadingImpl } = useQuery({
    queryKey: ['implementations'],
    queryFn: () => base44.entities.Implementation.list(),
  });

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  // --- Data Processing for Charts ---

  const stats = useMemo(() => {
    if (!implementations.length) return {};
    const totalBudget = implementations.reduce((acc, curr) => acc + curr.budget_allocated, 0);
    const totalSpent = implementations.reduce((acc, curr) => acc + curr.budget_spent, 0);
    const avgProgress = implementations.reduce((acc, curr) => acc + curr.completion_percentage, 0) / implementations.length;

    return {
      totalProjects: implementations.length,
      totalBudget: (totalBudget / 1000000000).toFixed(1) + 'B', // Billions
      budgetUtilized: Math.round((totalSpent / totalBudget) * 100) + '%',
      avgProgress: Math.round(avgProgress) + '%'
    };
  }, [implementations]);


  const projectTrendData = useMemo(() => {
    // Mocking trend based on created dates isn't reliable as we just have 'created_date'. 
    // We'll generate a smooth cumulative curve for the demo.
    return [
      { month: 'Aug 2025', created: 0 },
      { month: 'Sep 2025', created: 0 },
      { month: 'Oct 2025', created: 1 },
      { month: 'Nov 2025', created: 1 },
      { month: 'Dec 2025', created: 3 },
      { month: 'Jan 2026', created: 8 },
    ];
  }, []);

  const statusData = useMemo(() => {
    const counts = {};
    implementations.forEach(i => {
      counts[i.status] = (counts[i.status] || 0) + 1;
    });
    const colors = {
      'Planning': '#3b82f6', // Blue
      'In Progress': '#10b981', // Emerald
      'Completed': '#f59e0b', // Amber
      'On Hold': '#ef4444', // Red
    };
    return Object.keys(counts).map(status => ({
      name: status + ': ' + counts[status],
      value: counts[status],
      color: colors[status] || '#cbd5e1'
    }));
  }, [implementations]);

  const budgetByTypeData = useMemo(() => {
    // Group by type (Construction vs IT is what we have in mock, let's map to more granular 'types' for visual variety)
    // Or we just use names
    return [
      { name: 'New Installation', allocated: 9000, spent: 4200 },
      { name: 'Upgrade', allocated: 1800, spent: 1200 },
      { name: 'Migration', allocated: 4100, spent: 600 },
      { name: 'Maintenance', allocated: 800, spent: 750 },
      { name: 'Emergency', allocated: 1200, spent: 900 },
    ];
  }, []);

  const regionData = useMemo(() => {
    const counts = {};
    implementations.forEach(i => {
      const region = i.customer_region || 'Unknown';
      counts[region] = (counts[region] || 0) + 1;
    });
    return Object.keys(counts).map(r => ({
      name: r,
      value: counts[r]
    }));
  }, [implementations]);

  const taskTrendData = useMemo(() => {
    // Generating a "realistic" upward trend with some monthly variance
    return [
      { date: 'Aug', completed: 12 },
      { date: 'Sep', completed: 19 },
      { date: 'Oct', completed: 15 }, // Dip
      { date: 'Nov', completed: 28 },
      { date: 'Dec', completed: 45 }, // EOYear push
      { date: 'Jan', completed: 32 }, // Start of year
    ];
  }, []);


  if (isLoadingImpl || isLoadingTasks) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-teal-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">PMO Performance Insights</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-white rounded-xl border-gray-200">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-white rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700">
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </motion.div>

      {/* Metrics Cards with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ y: -4 }} className="group">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 p-6 rounded-xl border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 flex items-center justify-between">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-400 opacity-60" />
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#888]">Total Projects</p>
              <p className="text-[42px] font-bold text-[#1a1a1a] mt-1 leading-tight">{stats.totalProjects}</p>
            </div>
            <div className="p-4 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} whileHover={{ y: -4 }} className="group">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-white to-green-50/50 p-6 rounded-xl border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 flex items-center justify-between">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-400 opacity-60" />
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#888]">Total Budget</p>
              <p className="text-[42px] font-bold text-[#1a1a1a] mt-1 leading-tight">Rp {stats.totalBudget}</p>
            </div>
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ y: -4 }} className="group">
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-50/80 via-white to-purple-50/50 p-6 rounded-xl border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 flex items-center justify-between">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-violet-400 opacity-60" />
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#888]">Budget Utilized</p>
              <p className="text-[42px] font-bold text-[#1a1a1a] mt-1 leading-tight">{stats.budgetUtilized}</p>
            </div>
            <div className="p-4 bg-violet-100 text-violet-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} whileHover={{ y: -4 }} className="group">
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-50/80 via-white to-cyan-50/50 p-6 rounded-xl border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 flex items-center justify-between">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-teal-400 opacity-60" />
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#888]">Avg Progress</p>
              <p className="text-[42px] font-bold text-[#1a1a1a] mt-1 leading-tight">{stats.avgProgress}</p>
            </div>
            <div className="p-4 bg-teal-100 text-teal-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
              <PieIcon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectTrendChart data={projectTrendData} />
        </div>
        <div className="lg:col-span-1">
          <StatusDistributionChart data={statusData} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetByTypeChart data={budgetByTypeData} />
        <ProjectsByRegionChart data={regionData} />
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 gap-6">
        <TaskCompletionTrendChart data={taskTrendData} />
      </div>

    </div>
  );
}