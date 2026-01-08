import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";
import {
  Zap,
  PlayCircle,
  ToggleRight,
  Plus,
  CheckCircle2,
  Activity,
  Clock,
  Bell,
  AlertTriangle,
  AlertCircle,
  Check,
  MoreHorizontal,
  Edit2,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

export default function Automation() {
  const { data: rules = [], isLoading: isLoadingRules } = useQuery({
    queryKey: ['automationRules'],
    queryFn: () => base44.entities.AutomationRule.list(),
  });

  const { data: notifications = [], isLoading: isLoadingNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list(),
  });

  const isLoading = isLoadingRules || isLoadingNotifs;

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;

  // Stats derivation
  const activeRules = rules.filter(r => r.active).length;
  const totalExecutions = rules.reduce((acc, curr) => acc + (curr.executions || 0), 0);
  const totalNotifs = notifications.length;

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Automation Rules</h1>
          <p className="text-gray-500 mt-1">Automate workflows and notifications.</p>
        </div>
        <Button className="rounded-xl bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20">
          <Plus className="mr-2 h-4 w-4" /> Create Rule
        </Button>
      </motion.div>

      {/* Stats Cards with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ y: -4 }} className="group">
          <Card className="relative overflow-hidden border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-xl bg-gradient-to-br from-teal-50/80 via-white to-cyan-50/50">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-teal-400 opacity-60" />
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#888]">Total Rules</p>
                <p className="text-[42px] font-bold text-[#1a1a1a] mt-1 leading-tight">{rules.length}</p>
              </div>
              <div className="p-4 bg-teal-100 text-teal-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} whileHover={{ y: -4 }} className="group">
          <Card className="relative overflow-hidden border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-xl bg-gradient-to-br from-emerald-50/80 via-white to-green-50/50">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-400 opacity-60" />
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#888]">Active Rules</p>
                <p className="text-[42px] font-bold text-[#1a1a1a] mt-1 leading-tight">{activeRules}</p>
              </div>
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ y: -4 }} className="group">
          <Card className="relative overflow-hidden border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-400 opacity-60" />
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#888]">Total Executions</p>
                <p className="text-[42px] font-bold text-[#1a1a1a] mt-1 leading-tight">{totalExecutions}</p>
              </div>
              <div className="p-4 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                <Activity className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} whileHover={{ y: -4 }} className="group">
          <Card className="relative overflow-hidden border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-xl bg-gradient-to-br from-violet-50/80 via-white to-purple-50/50">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-violet-400 opacity-60" />
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#888]">Notifications</p>
                <p className="text-[42px] font-bold text-[#1a1a1a] mt-1 leading-tight">{totalNotifs}</p>
              </div>
              <div className="p-4 bg-violet-100 text-violet-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Automation Rules</h2>
          <div className="space-y-4">
            {rules.map((rule, i) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-900 text-lg">{rule.name}</h3>
                          <div className="flex gap-2">
                            {rule.tags?.map(tag => (
                              <Badge key={tag} variant="secondary"
                                className={`rounded-md font-normal px-2 py-0.5 text-xs ${tag === 'Critical' ? 'bg-red-100 text-red-600' :
                                  tag === 'High' ? 'bg-orange-100 text-orange-600' :
                                    'bg-purple-100 text-purple-600'
                                  }`}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm max-w-xl">{rule.description}</p>

                        <div className="flex items-center gap-6 mt-4 pt-2">
                          <span className="text-xs text-gray-400 font-medium">Executed {rule.executions} times</span>
                          {rule.last_run && <span className="text-xs text-gray-400 font-medium">Last: {rule.last_run}</span>}
                          {rule.actions && <span className="text-xs text-gray-400 font-medium">{rule.actions} action(s)</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Switch checked={rule.active} className="data-[state=checked]:bg-gray-900" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Notifications Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              <Badge className="bg-red-500 hover:bg-red-600 border-0">{totalNotifs}</Badge>
            </div>
            <Button variant="ghost" className="text-sm text-gray-500 h-auto p-0 hover:bg-transparent hover:text-teal-600">
              <Check className="w-4 h-4 mr-1" /> Mark all read
            </Button>
          </div>

          <div className="space-y-4">
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Card className={`border-0 shadow-sm rounded-2xl ${notif.severity === 'critical' ? 'bg-red-50' :
                  notif.severity === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
                  }`}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="mt-0.5">
                      {notif.severity === 'critical' && <AlertCircle className="w-5 h-5 text-red-500" />}
                      {notif.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                      {notif.severity === 'info' && <Bell className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-bold ${notif.severity === 'critical' ? 'text-red-900' :
                          notif.severity === 'warning' ? 'text-amber-900' : 'text-blue-900'
                          }`}>
                          {notif.title}
                        </h4>
                        {/* Check/Read indicator */}
                        <Check className={`w-3 h-3 ${notif.read ? 'text-gray-400' : 'text-red-500'}`} />
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${notif.severity === 'critical' ? 'text-red-700' :
                        notif.severity === 'warning' ? 'text-amber-700' : 'text-blue-700'
                        }`}>
                        {notif.message}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-medium">{notif.time}</span>
                        <Badge variant="outline" className={`text-[10px] h-5 border-0 font-bold ${notif.severity === 'critical' ? 'bg-red-200 text-red-800' :
                          notif.severity === 'warning' ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800'
                          }`}>
                          {notif.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}