import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function GanttView({ implementations }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => setCurrentMonth(addDays(monthStart, -1));
  const nextMonth = () => setCurrentMonth(addDays(monthEnd, 1));

  const healthColors = {
    'On Track': 'bg-emerald-500',
    'At Risk': 'bg-amber-500',
    'Critical': 'bg-red-500',
    'Completed': 'bg-indigo-500',
  };

  const getProjectBar = (impl) => {
    if (!impl.start_date || !impl.target_end_date) return null;
    
    const projectStart = parseISO(impl.start_date);
    const projectEnd = parseISO(impl.target_end_date);
    
    // Calculate position within the month
    const monthInterval = { start: monthStart, end: monthEnd };
    
    // Check if project overlaps with current month
    const startsInMonth = isWithinInterval(projectStart, monthInterval);
    const endsInMonth = isWithinInterval(projectEnd, monthInterval);
    const spansMonth = projectStart <= monthStart && projectEnd >= monthEnd;
    
    if (!startsInMonth && !endsInMonth && !spansMonth) return null;
    
    const effectiveStart = projectStart < monthStart ? monthStart : projectStart;
    const effectiveEnd = projectEnd > monthEnd ? monthEnd : projectEnd;
    
    const startOffset = differenceInDays(effectiveStart, monthStart);
    const duration = differenceInDays(effectiveEnd, effectiveStart) + 1;
    
    const startPercent = (startOffset / days.length) * 100;
    const widthPercent = (duration / days.length) * 100;
    
    return { startPercent, widthPercent, effectiveStart, effectiveEnd };
  };

  const activeImplementations = implementations.filter(impl => 
    impl.start_date && impl.target_end_date && impl.status !== 'Cancelled'
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Timeline View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium text-gray-700 min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Header - Days */}
          <div className="flex border-b border-gray-200 mb-2">
            <div className="w-64 flex-shrink-0 pr-4 font-medium text-gray-600 text-sm">
              Project
            </div>
            <div className="flex-1 flex">
              {days.map((day, i) => (
                <div 
                  key={i} 
                  className={`flex-1 text-center text-xs py-2 ${
                    day.getDay() === 0 || day.getDay() === 6 
                      ? 'bg-gray-50 text-gray-400' 
                      : 'text-gray-500'
                  }`}
                  style={{ minWidth: '28px' }}
                >
                  <div>{format(day, 'd')}</div>
                  {i === 0 && <div className="text-[10px]">{format(day, 'EEE')}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-2">
            {activeImplementations.map((impl, index) => {
              const bar = getProjectBar(impl);
              return (
                <motion.div
                  key={impl.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center min-h-[48px] hover:bg-gray-50 rounded-lg"
                >
                  <div className="w-64 flex-shrink-0 pr-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${healthColors[impl.health_status] || healthColors['On Track']}`} />
                      <div className="truncate">
                        <span className="text-sm font-medium text-gray-800">{impl.project_name}</span>
                        <p className="text-xs text-gray-400 truncate">{impl.customer_name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 relative h-8">
                    {/* Background grid */}
                    <div className="absolute inset-0 flex">
                      {days.map((day, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 border-l border-gray-100 ${
                            day.getDay() === 0 || day.getDay() === 6 ? 'bg-gray-50/50' : ''
                          }`}
                          style={{ minWidth: '28px' }}
                        />
                      ))}
                    </div>
                    {/* Project bar */}
                    {bar && (
                      <div
                        className={`absolute top-1 h-6 rounded-full ${healthColors[impl.health_status] || healthColors['On Track']} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                        style={{
                          left: `${bar.startPercent}%`,
                          width: `${Math.max(bar.widthPercent, 2)}%`,
                        }}
                        title={`${impl.project_name}: ${format(bar.effectiveStart, 'MMM d')} - ${format(bar.effectiveEnd, 'MMM d')}`}
                      >
                        <div className="px-2 text-white text-xs font-medium truncate leading-6">
                          {impl.progress_percentage || 0}%
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {activeImplementations.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No projects with timeline data</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Health Status:</span>
          {Object.entries(healthColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-sm text-gray-600">{status}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}