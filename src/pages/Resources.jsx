import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";
import {
    Loader2,
    Plus,
    UserPlus,
    Users,
    UserCheck,
    BarChart3,
    Grid,
    Briefcase
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Sub-components
import TeamList from '@/components/resources/TeamList';
import CapacityPlanning from '@/components/resources/CapacityPlanning';
import SkillsMatrix from '@/components/resources/SkillsMatrix';

export default function Resources() {
    const [view, setView] = useState('list'); // 'list', 'capacity', 'matrix'

    const { data: resources = [], isLoading } = useQuery({
        queryKey: ['resources'],
        queryFn: () => base44.entities.Resource.list(),
    });

    // KPI Calcs
    const humanResources = resources.filter(r => r.type === 'Human');
    const totalHumans = humanResources.length;
    const availableHumans = humanResources.filter(r => r.status === 'Available' || r.status === 'Partially Available').length;
    const activeAllocations = humanResources.filter(r => r.load > 0).length; // Mock
    const uniqueSkills = new Set(humanResources.flatMap(r => r.skills || [])).size;

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;

    // Enhanced Gradient Summary Card Component
    const SummaryCard = ({ title, value, icon: Icon, gradient, iconBg, iconColor, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
        >
            <Card className={`relative overflow-hidden border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-xl bg-gradient-to-br ${gradient}`}>
                {/* Left accent stripe */}
                <div className={`absolute top-0 left-0 bottom-0 w-1 ${iconBg} opacity-60`} />

                <CardContent className="p-6 flex items-center justify-between relative">
                    <div>
                        <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#888]">{title}</p>
                        <p className="text-[42px] font-bold text-[#1a1a1a] mt-1 leading-tight">{value}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a]">Resource Management</h1>
                    <p className="text-[#666] mt-1">Team capacity, detailed skills, and allocation tracking.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-gray-50">
                        <UserPlus className="mr-2 h-4 w-4" /> Allocate Resource
                    </Button>
                    <Button className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Add Resource
                    </Button>
                </div>
            </motion.div>

            {/* Summary Cards with Gradients */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Total Resources"
                    value={resources.length}
                    icon={Users}
                    gradient="from-teal-50/80 via-white to-cyan-50/50"
                    iconBg="bg-teal-100"
                    iconColor="text-teal-600"
                    delay={0.1}
                />
                <SummaryCard
                    title="Available Now"
                    value={availableHumans}
                    icon={UserCheck}
                    gradient="from-emerald-50/80 via-white to-green-50/50"
                    iconBg="bg-emerald-100"
                    iconColor="text-emerald-600"
                    delay={0.15}
                />
                <SummaryCard
                    title="Active Allocations"
                    value={activeAllocations}
                    icon={BarChart3}
                    gradient="from-blue-50/80 via-white to-indigo-50/50"
                    iconBg="bg-blue-100"
                    iconColor="text-blue-600"
                    delay={0.2}
                />
                <SummaryCard
                    title="Unique Skills"
                    value={uniqueSkills}
                    icon={Grid}
                    gradient="from-violet-50/80 via-white to-purple-50/50"
                    iconBg="bg-violet-100"
                    iconColor="text-violet-600"
                    delay={0.25}
                />
            </div>

            {/* Content Tabs */}
            <div className="space-y-6">
                {/* Tabs Header */}
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl w-fit border border-gray-200 shadow-sm">
                    <Button
                        variant={view === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('list')}
                        className={`rounded-lg px-4 transition-all ${view === 'list' ? 'bg-teal-50 text-teal-700 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users className="w-4 h-4 mr-2" /> Team List
                    </Button>
                    <Button
                        variant={view === 'capacity' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('capacity')}
                        className={`rounded-lg px-4 transition-all ${view === 'capacity' ? 'bg-teal-50 text-teal-700 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <BarChart3 className="w-4 h-4 mr-2" /> Capacity Planning
                    </Button>
                    <Button
                        variant={view === 'matrix' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('matrix')}
                        className={`rounded-lg px-4 transition-all ${view === 'matrix' ? 'bg-teal-50 text-teal-700 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Grid className="w-4 h-4 mr-2" /> Skills Matrix
                    </Button>
                </div>

                {/* Tab Content */}
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {view === 'list' && <TeamList resources={resources} />}
                    {view === 'capacity' && <CapacityPlanning resources={humanResources} />}
                    {view === 'matrix' && <SkillsMatrix resources={humanResources} />}
                </motion.div>
            </div>
        </div>
    );
}