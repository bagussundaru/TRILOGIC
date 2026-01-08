import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";
import {
  Download,
  Plus,
  Table as TableIcon,
  Columns,
  Calendar,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";

// Views
import TableView from '@/components/implementations/TableView';
import KanbanView from '@/components/implementations/KanbanView';
import TimelineView from '@/components/implementations/TimelineView';

export default function Implementations() {
  const [view, setView] = useState('table'); // 'table', 'kanban', 'timeline'

  const { data: implementations = [], isLoading } = useQuery({
    queryKey: ['implementations'],
    queryFn: () => base44.entities.Implementation.list(),
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Implementations</h1>
          <p className="text-gray-500 mt-1">{implementations.length} total projects across all regions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="rounded-xl bg-teal-600 shadow-lg shadow-teal-500/20 hover:bg-teal-700">
            <Plus className="mr-2 h-4 w-4" /> New Implementation
          </Button>
        </div>
      </motion.div>

      {/* View Switcher */}
      <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl w-fit border border-gray-200/50">
        <Button
          variant={view === 'table' ? 'white' : 'ghost'}
          size="sm"
          onClick={() => setView('table')}
          className={`rounded-lg text-sm px-4 ${view === 'table' ? 'bg-white shadow-sm text-teal-700 font-semibold' : 'text-gray-500'}`}
        >
          <TableIcon className="w-4 h-4 mr-2" /> Table
        </Button>
        <Button
          variant={view === 'kanban' ? 'white' : 'ghost'}
          size="sm"
          onClick={() => setView('kanban')}
          className={`rounded-lg text-sm px-4 ${view === 'kanban' ? 'bg-white shadow-sm text-teal-700 font-semibold' : 'text-gray-500'}`}
        >
          <Columns className="w-4 h-4 mr-2" /> Kanban
        </Button>
        <Button
          variant={view === 'timeline' ? 'white' : 'ghost'}
          size="sm"
          onClick={() => setView('timeline')}
          className={`rounded-lg text-sm px-4 ${view === 'timeline' ? 'bg-white shadow-sm text-teal-700 font-semibold' : 'text-gray-500'}`}
        >
          <Calendar className="w-4 h-4 mr-2" /> Timeline
        </Button>
      </div>

      {/* Content Area */}
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-[500px]"
      >
        {view === 'table' && <TableView implementations={implementations} />}
        {view === 'kanban' && <KanbanView implementations={implementations} />}
        {view === 'timeline' && <TimelineView implementations={implementations} />}
      </motion.div>
    </div>
  );
}