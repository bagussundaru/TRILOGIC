import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit,
  Upload,
  Flag
} from "lucide-react";
import { motion } from "framer-motion";

export default function RecentActivity({ activities }) {
  const getIcon = (type) => {
    const icons = {
      'Created': Plus,
      'Updated': Edit,
      'Status Changed': CheckCircle2,
      'Document Uploaded': Upload,
      'Risk Added': AlertTriangle,
      'Task Completed': CheckCircle2,
      'Milestone Reached': Flag,
    };
    return icons[type] || FileText;
  };

  const getIconColor = (type) => {
    const colors = {
      'Created': 'bg-blue-50 text-blue-600',
      'Updated': 'bg-violet-50 text-violet-600',
      'Status Changed': 'bg-emerald-50 text-emerald-600',
      'Document Uploaded': 'bg-amber-50 text-amber-600',
      'Risk Added': 'bg-rose-50 text-rose-600',
      'Task Completed': 'bg-green-50 text-green-600',
      'Milestone Reached': 'bg-teal-50 text-teal-600',
    };
    return colors[type] || 'bg-slate-50 text-slate-600';
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
    hidden: {
      opacity: 0,
      x: 20
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <Card className="border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 h-full rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-[#f0f2f5]">
        <CardTitle className="text-lg font-bold text-[#1a1a1a]">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {activities && activities.length > 0 ? (
          <motion.div
            className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {activities.slice(0, 8).map((activity, index) => {
              const Icon = getIcon(activity.action_type);
              return (
                <motion.div
                  key={activity.id || index}
                  variants={itemVariants}
                  className="group flex items-start gap-3 p-3 rounded-lg border-l-3 border-l-[#f0f2f5] bg-[#fafafa] hover:bg-white hover:border-l-teal-500 hover:shadow-sm transition-all duration-300 cursor-pointer"
                  style={{ borderLeftWidth: '3px' }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                >
                  {/* Icon Container - QCLAY style */}
                  <div className={`p-2 rounded-lg ${getIconColor(activity.action_type)} group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] line-clamp-2 group-hover:text-teal-700 transition-colors">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-[#999] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        {activity.created_date
                          ? formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })
                          : 'Just now'
                        }
                      </span>
                      {activity.performed_by && (
                        <span className="text-xs text-[#666]">• {activity.performed_by}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-[#999]">
            <FileText className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}