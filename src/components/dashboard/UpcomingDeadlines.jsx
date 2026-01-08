import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, isPast } from 'date-fns';
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function UpcomingDeadlines({ implementations, tasks }) {
  // Combine implementations and tasks with due dates
  const deadlines = [
    ...implementations
      .filter(i => i.target_end_date && i.status !== 'Completed' && i.status !== 'Cancelled')
      .map(i => ({
        id: i.id,
        title: i.project_name,
        type: 'Project',
        date: i.target_end_date,
        status: i.status,
        priority: i.priority
      })),
    ...tasks
      .filter(t => t.due_date && t.status !== 'Done')
      .map(t => ({
        id: t.id,
        title: t.task_name,
        type: 'Task',
        date: t.due_date,
        status: t.status,
        priority: t.priority
      }))
  ]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  const getDaysUntil = (date) => {
    const days = differenceInDays(new Date(date), new Date());
    if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: 'text-rose-600 bg-rose-50 border-rose-200', urgent: true };
    if (days === 0) return { text: 'Due today', color: 'text-amber-600 bg-amber-50 border-amber-200', urgent: true };
    if (days <= 3) return { text: `${days}d left`, color: 'text-amber-600 bg-amber-50 border-amber-200', urgent: false };
    if (days <= 7) return { text: `${days}d left`, color: 'text-blue-600 bg-blue-50 border-blue-200', urgent: false };
    return { text: `${days}d left`, color: 'text-slate-600 bg-slate-50 border-slate-200', urgent: false };
  };

  const priorityColors = {
    'Low': 'bg-slate-100 text-slate-700',
    'Medium': 'bg-blue-100 text-blue-700',
    'High': 'bg-amber-100 text-amber-700',
    'Critical': 'bg-rose-100 text-rose-700',
    'Urgent': 'bg-rose-100 text-rose-700',
  };

  // QCLAY stagger animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <Card className="border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 h-full rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-[#f0f2f5]">
        <CardTitle className="text-lg font-bold text-[#1a1a1a] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {deadlines.length > 0 ? (
          <motion.div
            className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {deadlines.map((item, index) => {
              const daysInfo = getDaysUntil(item.date);
              const isOverdue = isPast(new Date(item.date));
              return (
                <motion.div
                  key={item.id || index}
                  variants={itemVariants}
                  className={`group p-3 rounded-lg border transition-all duration-300 cursor-pointer ${isOverdue
                      ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-50'
                      : 'border-[#f0f2f5] bg-[#fafafa] hover:bg-white hover:border-teal-200 hover:shadow-sm'
                    }`}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1a1a1a] text-sm truncate group-hover:text-teal-700 transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[11px] px-2 py-0 font-medium">
                          {item.type}
                        </Badge>
                        <Badge className={`text-[11px] px-2 py-0 font-medium ${priorityColors[item.priority] || priorityColors['Medium']}`}>
                          {item.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${daysInfo.color}`}>
                        {daysInfo.urgent && <AlertCircle className="w-3 h-3 inline mr-1" />}
                        {daysInfo.text}
                      </span>
                      <p className="text-xs text-[#999] mt-1.5">
                        {format(new Date(item.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-[#999]">
            <Clock className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">No upcoming deadlines</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}