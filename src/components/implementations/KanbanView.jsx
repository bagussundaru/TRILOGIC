import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MoreHorizontal, User } from "lucide-react";

export default function KanbanView({ implementations }) {
    // Kanban columns with smooth gradient fills
    const columns = [
        {
            id: 'Planning',
            label: 'Planning',
            gradient: 'from-indigo-100/80 via-indigo-50/50 to-violet-50/30',
            headerGradient: 'from-indigo-500 to-violet-500',
            borderColor: 'border-indigo-200/50',
            textColor: 'text-indigo-700',
            badgeBg: 'bg-indigo-100',
            badgeText: 'text-indigo-600'
        },
        {
            id: 'In Progress',
            label: 'In Progress',
            gradient: 'from-blue-100/80 via-blue-50/50 to-cyan-50/30',
            headerGradient: 'from-blue-500 to-cyan-500',
            borderColor: 'border-blue-200/50',
            textColor: 'text-blue-700',
            badgeBg: 'bg-blue-100',
            badgeText: 'text-blue-600'
        },
        {
            id: 'On Hold',
            label: 'On Hold',
            gradient: 'from-amber-100/80 via-amber-50/50 to-orange-50/30',
            headerGradient: 'from-amber-500 to-orange-500',
            borderColor: 'border-amber-200/50',
            textColor: 'text-amber-700',
            badgeBg: 'bg-amber-100',
            badgeText: 'text-amber-600'
        },
        {
            id: 'Completed',
            label: 'Completed',
            gradient: 'from-emerald-100/80 via-emerald-50/50 to-teal-50/30',
            headerGradient: 'from-emerald-500 to-teal-500',
            borderColor: 'border-emerald-200/50',
            textColor: 'text-emerald-700',
            badgeBg: 'bg-emerald-100',
            badgeText: 'text-emerald-600'
        }
    ];

    const getColumnItems = (status) => implementations.filter(i => i.status === status);

    // Stagger animation for items
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        }
    };

    return (
        <div className="flex h-full gap-5 overflow-x-auto pb-4 items-start min-h-[600px]">
            {columns.map((col, colIndex) => {
                const items = getColumnItems(col.id);
                return (
                    <motion.div
                        key={col.id}
                        className="min-w-[300px] w-full max-w-[350px] flex flex-col gap-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: colIndex * 0.1 }}
                    >
                        {/* Column Header with Gradient */}
                        <div className={`relative overflow-hidden p-4 rounded-xl bg-gradient-to-br ${col.gradient} border ${col.borderColor} shadow-sm`}>
                            {/* Top gradient accent bar */}
                            <div
                                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                                style={{ background: `linear-gradient(90deg, var(--tw-gradient-from), var(--tw-gradient-to))` }}
                            />
                            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r ${col.headerGradient}`} />

                            <div className="flex items-center justify-between">
                                <span className={`font-bold ${col.textColor}`}>{col.label}</span>
                                <Badge className={`${col.badgeBg} ${col.badgeText} border-0 shadow-sm font-semibold`}>
                                    {items.length}
                                </Badge>
                            </div>
                        </div>

                        {/* Cards Container with Stagger Animation */}
                        <motion.div
                            className="flex flex-col gap-3"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <AnimatePresence>
                                {items.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        layoutId={item.id}
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02, y: -3, transition: { duration: 0.2 } }}
                                        className="cursor-pointer"
                                    >
                                        {/* Card with subtle gradient based on column */}
                                        <Card className={`overflow-hidden border ${col.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-white ${col.gradient.split(' ')[0].replace('from-', 'to-')}/20`}>
                                            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                                                <Badge variant="outline" className={`text-[10px] ${col.badgeText} ${col.badgeBg} border-0 px-2 py-0.5 rounded-md font-semibold`}>
                                                    {item.id.toUpperCase().replace('IMPL_', 'PMO-')}
                                                </Badge>
                                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-2">
                                                <h4 className="font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">
                                                    {item.name}
                                                </h4>
                                                <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                                                    <Building className="w-3 h-3" />
                                                    <span>PLN {item.customer_region}</span>
                                                </div>

                                                {/* Meta Footer */}
                                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                                    <div className="flex -space-x-2">
                                                        <Avatar className="w-6 h-6 border-2 border-white shadow-sm">
                                                            <AvatarFallback className="bg-orange-100 text-orange-600 text-[10px]">AD</AvatarFallback>
                                                        </Avatar>
                                                        <Avatar className="w-6 h-6 border-2 border-white shadow-sm">
                                                            <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px]">JS</AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-400 gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(item.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>

                                                {/* Progress Bar for In Progress */}
                                                {item.status === 'In Progress' && (
                                                    <div className="mt-3">
                                                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                                            <span>Progress</span>
                                                            <span className="font-semibold">{item.completion_percentage}%</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className={`h-full rounded-full ${item.health_status === 'Critical' ? 'bg-gradient-to-r from-red-500 to-rose-400' : 'bg-gradient-to-r from-teal-500 to-cyan-400'}`}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${item.completion_percentage}%` }}
                                                                transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                );
            })}
        </div>
    );
}

// Helper icon
function Building({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" />
        </svg>
    )
}
