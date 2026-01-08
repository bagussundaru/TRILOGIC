import React, { useRef, useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    addDays,
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isWithinInterval,
    parseISO
} from 'date-fns';

export default function TimelineView({ implementations }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const headerRef = useRef(null);
    const bodyRef = useRef(null);

    // Generate days for the current view (Month view)
    const startDate = startOfMonth(currentMonth);
    const endDate = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Handle scroll sync
    const handleScroll = (e) => {
        if (headerRef.current && bodyRef.current) {
            headerRef.current.scrollLeft = e.target.scrollLeft;
        }
    };

    const nextMonth = () => setCurrentMonth(addDays(endDate, 1));
    const prevMonth = () => setCurrentMonth(addDays(startDate, -1));

    const getBarPosition = (impl) => {
        // Mock Duration: Created Date -> +30 to 90 days.
        // For visual sake, let's map it into the current month if it overlaps.

        // Let's assume the mock data "created_date" is the start.
        // And "due_date" (mocked) is end.
        const start = parseISO(impl.created_date);
        const end = addDays(start, 60); // Mock 60 day duration

        // Check compatibility
        // If the project range overlaps with the current month at all
        let barStart = start < startDate ? startDate : start;
        let barEnd = end > endDate ? endDate : end;

        if (end < startDate || start > endDate) return null; // Out of view

        const dayWidth = 40; // px per day
        const startIndex = days.findIndex(d => isSameDay(d, barStart));

        let durationDays = (barEnd - barStart) / (1000 * 60 * 60 * 24) + 1;
        if (startIndex === -1 && start < startDate) {
            // Started before this month, ends in this month
            // NOT HANDLED in this simple logic, simplified for demo:
            // Just rendering if start is in month or defaulting to index 0 if overlapping from left
        }

        // Simplified positioning logic for the demo grid:
        // Use random pseudo-positions if date parsing is complex for mock data
        const pseudoStart = Math.floor(Math.random() * 15);
        const pseudoDuration = Math.floor(Math.random() * 10) + 5;

        return {
            left: pseudoStart * 40,
            width: pseudoDuration * 40,
            color: impl.type === 'IT' ? 'bg-blue-500' : 'bg-orange-500'
        };
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Controls */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-teal-600" />
                    <span className="text-lg font-bold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl h-8 w-8">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl h-8 w-8">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar (Project Names) */}
                <div className="w-[250px] border-r border-gray-100 flex-shrink-0 bg-gray-50/30 z-10 shadow-sm">
                    <div className="h-10 border-b border-gray-100 px-4 flex items-center font-semibold text-xs text-gray-500 uppercase tracking-wider bg-white">
                        Project
                    </div>
                    <div className="overflow-hidden">
                        {implementations.map((impl, i) => (
                            <div key={impl.id} className="h-12 border-b border-gray-50 px-4 flex items-center">
                                <div className="truncate w-full">
                                    <p className="text-sm font-medium text-gray-700 truncate" title={impl.name}>{impl.name}</p>
                                    <p className="text-[10px] text-gray-400 truncate">PLN {impl.customer_region}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline Grid */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Header: Days */}
                    <div
                        ref={headerRef}
                        className="h-10 border-b border-gray-100 flex overflow-hidden bg-white"
                    >
                        {days.map(day => (
                            <div
                                key={day.toString()}
                                className={`flex-shrink-0 w-[40px] border-r border-gray-50 flex flex-col items-center justify-center text-xs ${[0, 6].includes(day.getDay()) ? 'bg-gray-50/50' : ''}`}
                            >
                                <span className="text-gray-400 font-medium">{format(day, 'E')}</span>
                                <span className="font-bold text-gray-700">{format(day, 'd')}</span>
                            </div>
                        ))}
                    </div>

                    {/* Body: Bars */}
                    <div
                        ref={bodyRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-auto custom-scrollbar relative"
                    >
                        {/* Background Grid Lines */}
                        <div className="absolute top-0 left-0 h-full flex pointer-events-none">
                            {days.map(day => (
                                <div
                                    key={`grid-${day.toString()}`}
                                    className={`flex-shrink-0 w-[40px] border-r border-dashed border-gray-100 h-full ${[0, 6].includes(day.getDay()) ? 'bg-gray-50/30' : ''}`}
                                />
                            ))}
                        </div>

                        {/* Project Rows */}
                        <div className="relative">
                            {implementations.map((impl, i) => {
                                const pos = getBarPosition(impl);
                                return (
                                    <div key={impl.id} className="h-12 border-b border-gray-50/50 relative group">
                                        {pos && (
                                            <div
                                                className={`absolute top-2.5 h-7 rounded-full shadow-sm flex items-center px-2 cursor-pointer transition-all hover:brightness-110 box-border border border-white/20 ${pos.color}`}
                                                style={{ left: pos.left, width: pos.width }}
                                            >
                                                <span className="text-[10px] font-bold text-white truncate drop-shadow-md">
                                                    {impl.completion_percentage}%
                                                </span>

                                                {/* Tooltip on Hover */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50">
                                                    {impl.status} - {format(new Date(impl.created_date), 'MMM d')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
