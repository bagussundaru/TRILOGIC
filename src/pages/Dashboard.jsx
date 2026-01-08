import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Loader2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

import MetricCard from '../components/dashboard/MetricCard';
import ProjectHealthChart from '../components/dashboard/ProjectHealthChart';
import BudgetChart from '../components/dashboard/BudgetChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import AIChatPanel from '../components/ai/AIChatPanel';
import AutomationEngine from '../components/automation/AutomationEngine';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data: implementations = [], isLoading: loadingImpl } = useQuery({
    queryKey: ['implementations'],
    queryFn: () => base44.entities.Implementation.list('-created_date'),
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date'),
  });

  const { data: risks = [], isLoading: loadingRisks } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-created_date'),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 20),
  });

  const { data: automationRules = [] } = useQuery({
    queryKey: ['automationRules'],
    queryFn: () => base44.entities.AutomationRule.list(),
  });

  const { data: allocations = [] } = useQuery({
    queryKey: ['allocations'],
    queryFn: () => base44.entities.ResourceAllocation.list(),
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list(),
  });

  const isLoading = loadingImpl || loadingTasks || loadingRisks;

  // Calculate metrics
  const activeProjects = implementations.filter(i => i.status === 'In Progress' || i.status === 'Planning').length;
  const completedProjects = implementations.filter(i => i.status === 'Completed').length;
  const atRiskProjects = implementations.filter(i => i.health_status === 'At Risk' || i.health_status === 'Critical').length;
  const totalBudget = implementations.reduce((sum, i) => sum + (i.budget_allocated || 0), 0);
  const spentBudget = implementations.reduce((sum, i) => sum + (i.budget_spent || 0), 0);
  const budgetUtilization = totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0;

  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatCurrency = (value) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}M`;
    return `Rp ${value.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/30 mx-auto mb-6">
              <Sparkles className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-teal-500/20 animate-ping" />
          </div>
          <p className="text-slate-500 font-medium">Synchronizing Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50">
      <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto">
        {/* Background Automation Engine */}
        <AutomationEngine
          implementations={implementations}
          tasks={tasks}
          risks={risks}
          resources={resources}
          allocations={allocations}
          automationRules={automationRules}
        />

        {/* Hero Header Section - Maximum Visual Impact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
        >
          <div className="space-y-3">
            {/* Breadcrumb/Context */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Dashboard</span>
              <span className="text-slate-300">/</span>
              <span className="text-teal-600 font-medium">Overview</span>
            </div>

            {/* Main Headline - Large Typography */}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Command Center
            </h1>

            {/* Subtitle - Secondary Information */}
            <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
              Managing <span className="font-semibold text-teal-600">{implementations.length} Active Projects</span> across
              <span className="font-semibold text-slate-700"> IT & Construction</span> divisions.
            </p>
          </div>

          {/* Action Buttons - Clear CTAs */}
          <div className="flex gap-3 flex-shrink-0">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 shadow-sm hover:border-teal-200 hover:shadow-md transition-all duration-200 px-5"
            >
              Export Data
            </Button>
            <Button
              className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-200 px-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </motion.div>

        {/* Metrics Row - Card Grid with Visual Hierarchy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Active Engagements"
            value={activeProjects}
            subtitle={<span className="text-emerald-600 flex items-center gap-1 font-medium"><TrendingUp className="w-3.5 h-3.5" /> +3 this week</span>}
            icon={FolderKanban}
            color="blue"
            delay={0.1}
          />
          <MetricCard
            title="Task Completion"
            value={`${taskCompletionRate}%`}
            subtitle={`${completedTasks} of ${totalTasks} completed`}
            icon={CheckCircle2}
            color="green"
            delay={0.15}
          />
          <MetricCard
            title="Risk Exposure"
            value={atRiskProjects}
            subtitle={<span className={atRiskProjects > 0 ? "text-rose-500 font-semibold" : "text-emerald-500 font-medium"}>{atRiskProjects > 0 ? "Requires Attention" : "All Clear"}</span>}
            icon={AlertTriangle}
            color={atRiskProjects > 0 ? "orange" : "green"}
            delay={0.2}
          />
          <MetricCard
            title="Capital Deployed"
            value={formatCurrency(spentBudget)}
            subtitle={`${budgetUtilization}% of ${formatCurrency(totalBudget)}`}
            icon={DollarSign}
            color="teal"
            delay={0.25}
          />
        </div>

        {/* Charts Section - Asymmetric Grid for Visual Interest */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 h-[440px]"
          >
            <BudgetChart implementations={implementations} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="h-[440px]"
          >
            <ProjectHealthChart implementations={implementations} />
          </motion.div>
        </div>

        {/* Activity & Deadlines Row - Information Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-800 text-lg">Live Feed</h3>
              </div>
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                Real-time
              </span>
            </div>
            <RecentActivity activities={activities} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="lg:col-span-1"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-lg">Critical Deadlines</h3>
              </div>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                {tasks.filter(t => t.status !== 'Done').length} Pending
              </span>
            </div>
            <UpcomingDeadlines implementations={implementations} tasks={tasks} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1 h-[500px]"
          >
            <AIChatPanel
              implementations={implementations}
              tasks={tasks}
              risks={risks}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}