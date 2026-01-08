import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import { Calendar, User, Building2 } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from "framer-motion";

export default function ImplementationKanban({ implementations }) {
  const columns = [
    { id: 'Planning', title: 'Planning', color: 'border-t-slate-400 bg-slate-50' },
    { id: 'In Progress', title: 'In Progress', color: 'border-t-blue-500 bg-blue-50' },
    { id: 'On Hold', title: 'On Hold', color: 'border-t-amber-500 bg-amber-50' },
    { id: 'Completed', title: 'Completed', color: 'border-t-emerald-500 bg-emerald-50' },
  ];

  const healthDots = {
    'On Track': 'bg-emerald-500',
    'At Risk': 'bg-amber-500',
    'Critical': 'bg-red-500',
    'Completed': 'bg-indigo-500',
  };

  const getColumnItems = (status) => {
    return implementations.filter(impl => impl.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => (
        <div key={column.id} className={`rounded-xl border-t-4 ${column.color} p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{column.title}</h3>
            <Badge variant="outline" className="text-xs">
              {getColumnItems(column.id).length}
            </Badge>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {getColumnItems(column.id).map((impl, index) => (
              <motion.div
                key={impl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={createPageUrl(`ImplementationDetail?id=${impl.id}`)}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-mono text-blue-600">{impl.project_code}</span>
                        <div className={`w-2.5 h-2.5 rounded-full ${healthDots[impl.health_status] || healthDots['On Track']}`} />
                      </div>
                      <h4 className="font-medium text-gray-800 text-sm mb-2 line-clamp-2">{impl.project_name}</h4>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">{impl.customer_name}</span>
                        </div>
                        {impl.project_manager && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            <span className="truncate">{impl.project_manager}</span>
                          </div>
                        )}
                        {impl.target_end_date && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(impl.target_end_date), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Progress value={impl.progress_percentage || 0} className="h-1.5 flex-1" />
                        <span className="text-xs text-gray-500">{impl.progress_percentage || 0}%</span>
                      </div>

                      {impl.priority && impl.priority !== 'Medium' && (
                        <Badge 
                          className={`mt-2 text-xs ${
                            impl.priority === 'High' || impl.priority === 'Critical' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {impl.priority}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
            {getColumnItems(column.id).length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No projects
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}