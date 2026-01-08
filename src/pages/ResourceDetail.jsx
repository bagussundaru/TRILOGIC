import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { 
  FileText, 
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

export default function Reports() {
  const [timeRange, setTimeRange] = useState('6months');
  const [reportType, setReportType] = useState('overview');

  const { data: implementations = [], isLoading: loadingImpl } = useQuery({
    queryKey: ['implementations'],
    queryFn: () => base44.entities.Implementation.list('-created_date'),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date'),
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-created_date'),
  });

  // Generate monthly data
  const getMonthlyData = () => {
    const months = timeRange === '6months' ? 6 : timeRange === '12months' ? 12 : 3;
    const startDate = subMonths(new Date(), months - 1);
    const monthsInterval = eachMonthOfInterval({
      start: startOfMonth(startDate),
      end: endOfMonth(new Date())
    });

    return monthsInterval.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const created = implementations.filter(i => {
        const date = new Date(i.created_date);
        return date >= monthStart && date <= monthEnd;
      }).length;

      const completed = implementations.filter(i => {
        if (!i.actual_end_date) return false;
        const date = new Date(i.actual_end_date);
        return date >= monthStart && date <= monthEnd && i.status === 'Completed';
      }).length;

      return {
        month: format(month, 'MMM yyyy'),
        created,
        completed,
        active: implementations.filter(i => 
          i.status === 'In Progress' && new Date(i.start_date) <= monthEnd
        ).length
      };
    });
  };

  // Status distribution
  const getStatusDistribution = () => {
    const counts = {};
    implementations.forEach(i => {
      counts[i.status] = (counts[i.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // Region distribution
  const getRegionDistribution = () => {
    const counts = {};
    implementations.forEach(i => {
      const region = i.customer_region || 'Other';
      counts[region] = (counts[region] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Budget by type
  const getBudgetByType = () => {
    const data = {};
    implementations.forEach(i => {
      const type = i.project_type || 'Other';
      if (!data[type]) data[type] = { allocated: 0, spent: 0 };
      data[type].allocated += i.budget_allocated || 0;
      data[type].spent += i.budget_spent || 0;
    });
    return Object.entries(data).map(([type, values]) => ({
      type,
      allocated: Math.round(values.allocated / 1000000),
      spent: Math.round(values.spent / 1000000),
    }));
  };

  // Task completion trend
  const getTaskTrend = () => {
    const months = timeRange === '6months' ? 6 : timeRange === '12months' ? 12 : 3;
    const startDate = subMonths(new Date(), months - 1);
    const monthsInterval = eachMonthOfInterval({
      start: startOfMonth(startDate),
      end: endOfMonth(new Date())
    });

    return monthsInterval.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const completed = tasks.filter(t => {
        if (!t.completed_date) return false;
        const date = new Date(t.completed_date);
        return date >= monthStart && date <= monthEnd;
      }).length;

      return {
        month: format(month, 'MMM'),
        completed
      };
    });
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loadingImpl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const monthlyData = getMonthlyData();
  const statusData = getStatusDistribution();
  const regionData = getRegionDistribution();
  const budgetData = getBudgetByType();
  const taskTrend = getTaskTrend();

  // Calculate summary stats
  const totalBudget = implementations.reduce((sum, i) => sum + (i.budget_allocated || 0), 0);
  const totalSpent = implementations.reduce((sum, i) => sum + (i.budget_spent || 0), 0);
  const avgProgress = implementations.length > 0 
    ? Math.round(implementations.reduce((sum, i) => sum + (i.progress_percentage || 0), 0) / implementations.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-500 mt-1">PMO Performance Insights</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{implementations.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Budget</p>
                  <p className="text-3xl font-bold text-gray-900">Rp {(totalBudget / 1000000000).toFixed(1)}B</p>
                </div>
                <div className="p-3 rounded-xl bg-teal-50">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Budget Utilized</p>
                  <p className="text-3xl font-bold text-gray-900">{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Progress</p>
                  <p className="text-3xl font-bold text-gray-900">{avgProgress}%</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50">
                  <PieChartIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Trend */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Project Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="created" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Created" />
                  <Area type="monotone" dataKey="completed" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget by Type */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Budget by Project Type (in Millions IDR)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="spent" fill="#10b981" name="Spent" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Region Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Projects by Region</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Projects" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Task Completion Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Task Completion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={taskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                  name="Tasks Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}