import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GridStack } from 'gridstack';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, X, Settings, Maximize2, Minimize2, GripVertical,
    BarChart3, PieChart, TrendingUp, Users, DollarSign,
    AlertTriangle, Clock, Target, Activity, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Widget Registry - All available widgets
const WIDGET_REGISTRY = {
    'metric-card': {
        name: 'Metric Card',
        icon: Target,
        minW: 2, minH: 2,
        category: 'KPI'
    },
    'trend-chart': {
        name: 'Trend Chart',
        icon: TrendingUp,
        minW: 4, minH: 3,
        category: 'Charts'
    },
    'pie-chart': {
        name: 'Pie Chart',
        icon: PieChart,
        minW: 3, minH: 3,
        category: 'Charts'
    },
    'bar-chart': {
        name: 'Bar Chart',
        icon: BarChart3,
        minW: 4, minH: 3,
        category: 'Charts'
    },
    'risk-matrix': {
        name: 'Risk Matrix',
        icon: AlertTriangle,
        minW: 4, minH: 4,
        category: 'Risk'
    },
    'resource-heatmap': {
        name: 'Resource Heatmap',
        icon: Users,
        minW: 4, minH: 3,
        category: 'Resources'
    },
    'budget-gauge': {
        name: 'Budget Gauge',
        icon: DollarSign,
        minW: 2, minH: 2,
        category: 'Financial'
    },
    'activity-feed': {
        name: 'Activity Feed',
        icon: Activity,
        minW: 3, minH: 4,
        category: 'Activity'
    },
    'deadline-list': {
        name: 'Deadline List',
        icon: Clock,
        minW: 3, minH: 3,
        category: 'Tasks'
    },
    'ai-insights': {
        name: 'AI Insights',
        icon: Zap,
        minW: 4, minH: 3,
        category: 'AI'
    }
};

// Default layouts by role
const ROLE_LAYOUTS = {
    CEO: [
        { id: 'w1', type: 'metric-card', x: 0, y: 0, w: 2, h: 2, config: { title: 'Total Portfolio Value', color: 'teal' } },
        { id: 'w2', type: 'metric-card', x: 2, y: 0, w: 2, h: 2, config: { title: 'ROI', color: 'emerald' } },
        { id: 'w3', type: 'metric-card', x: 4, y: 0, w: 2, h: 2, config: { title: 'At Risk Projects', color: 'amber' } },
        { id: 'w4', type: 'trend-chart', x: 0, y: 2, w: 6, h: 3, config: { title: 'Portfolio Performance' } },
        { id: 'w5', type: 'pie-chart', x: 6, y: 0, w: 3, h: 3, config: { title: 'Budget Distribution' } },
        { id: 'w6', type: 'ai-insights', x: 6, y: 3, w: 3, h: 2, config: { title: 'AI Recommendations' } }
    ],
    PMO_Director: [
        { id: 'w1', type: 'metric-card', x: 0, y: 0, w: 2, h: 2, config: { title: 'Active Projects' } },
        { id: 'w2', type: 'metric-card', x: 2, y: 0, w: 2, h: 2, config: { title: 'Task Completion' } },
        { id: 'w3', type: 'resource-heatmap', x: 4, y: 0, w: 5, h: 3, config: { title: 'Team Capacity' } },
        { id: 'w4', type: 'risk-matrix', x: 0, y: 2, w: 4, h: 4, config: { title: 'Risk Overview' } },
        { id: 'w5', type: 'deadline-list', x: 0, y: 6, w: 4, h: 3, config: { title: 'Upcoming Deadlines' } }
    ],
    Project_Manager: [
        { id: 'w1', type: 'metric-card', x: 0, y: 0, w: 3, h: 2, config: { title: 'My Tasks' } },
        { id: 'w2', type: 'bar-chart', x: 3, y: 0, w: 4, h: 3, config: { title: 'Sprint Velocity' } },
        { id: 'w3', type: 'activity-feed', x: 7, y: 0, w: 3, h: 4, config: { title: 'Recent Activity' } },
        { id: 'w4', type: 'deadline-list', x: 0, y: 2, w: 4, h: 3, config: { title: 'My Deadlines' } }
    ]
};

export default function DashboardBuilder({
    userRole = 'PMO_Director',
    initialWidgets = null,
    onLayoutChange = null,
    editable = true
}) {
    const gridContainerRef = useRef(null);
    const gridInstanceRef = useRef(null);
    const [widgets, setWidgets] = useState(initialWidgets || ROLE_LAYOUTS[userRole] || []);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showWidgetPicker, setShowWidgetPicker] = useState(false);

    // Initialize GridStack
    useEffect(() => {
        if (!gridContainerRef.current) return;

        const grid = GridStack.init({
            column: 12,
            cellHeight: 80,
            margin: 8,
            float: true,
            animate: true,
            draggable: {
                handle: '.widget-handle'
            },
            resizable: {
                handles: 'se'
            },
            disableDrag: !isEditMode,
            disableResize: !isEditMode
        }, gridContainerRef.current);

        gridInstanceRef.current = grid;

        // Listen for changes
        grid.on('change', (event, items) => {
            if (onLayoutChange && items) {
                const updatedWidgets = items.map(item => ({
                    id: item.id,
                    x: item.x,
                    y: item.y,
                    w: item.w,
                    h: item.h
                }));
                onLayoutChange(updatedWidgets);
            }
        });

        return () => {
            grid.destroy(false);
        };
    }, [isEditMode, onLayoutChange]);

    // Add widget
    const addWidget = useCallback((widgetType) => {
        const widgetConfig = WIDGET_REGISTRY[widgetType];
        if (!widgetConfig) return;

        const newWidget = {
            id: `widget-${Date.now()}`,
            type: widgetType,
            x: 0,
            y: 0,
            w: widgetConfig.minW,
            h: widgetConfig.minH,
            config: { title: widgetConfig.name }
        };

        setWidgets(prev => [...prev, newWidget]);
        setShowWidgetPicker(false);

        // Add to GridStack
        if (gridInstanceRef.current) {
            gridInstanceRef.current.addWidget({
                id: newWidget.id,
                x: newWidget.x,
                y: newWidget.y,
                w: newWidget.w,
                h: newWidget.h,
                content: `<div id="${newWidget.id}"></div>`
            });
        }
    }, []);

    // Remove widget
    const removeWidget = useCallback((widgetId) => {
        setWidgets(prev => prev.filter(w => w.id !== widgetId));

        if (gridInstanceRef.current) {
            const el = gridContainerRef.current?.querySelector(`[gs-id="${widgetId}"]`);
            if (el) {
                gridInstanceRef.current.removeWidget(el);
            }
        }
    }, []);

    return (
        <div className="relative h-full">
            {/* Toolbar */}
            {editable && (
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-semibold text-slate-800">Dashboard</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={isEditMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsEditMode(!isEditMode)}
                            className="rounded-lg"
                        >
                            <Settings className="w-4 h-4 mr-1" />
                            {isEditMode ? 'Done Editing' : 'Edit Layout'}
                        </Button>

                        {isEditMode && (
                            <Button
                                size="sm"
                                onClick={() => setShowWidgetPicker(true)}
                                className="rounded-lg bg-teal-600 hover:bg-teal-700"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Widget
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Grid Container */}
            <div
                ref={gridContainerRef}
                className={`grid-stack ${isEditMode ? 'edit-mode' : ''}`}
                style={{ minHeight: '600px' }}
            >
                {widgets.map(widget => (
                    <div
                        key={widget.id}
                        className="grid-stack-item"
                        gs-id={widget.id}
                        gs-x={widget.x}
                        gs-y={widget.y}
                        gs-w={widget.w}
                        gs-h={widget.h}
                        gs-min-w={WIDGET_REGISTRY[widget.type]?.minW || 2}
                        gs-min-h={WIDGET_REGISTRY[widget.type]?.minH || 2}
                    >
                        <div className="grid-stack-item-content">
                            <WidgetContainer
                                widget={widget}
                                isEditMode={isEditMode}
                                onRemove={() => removeWidget(widget.id)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Widget Picker Modal */}
            <AnimatePresence>
                {showWidgetPicker && (
                    <WidgetPickerModal
                        onSelect={addWidget}
                        onClose={() => setShowWidgetPicker(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Widget Container
function WidgetContainer({ widget, isEditMode, onRemove }) {
    const WidgetIcon = WIDGET_REGISTRY[widget.type]?.icon || Target;

    return (
        <Card className="h-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="py-2 px-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isEditMode && (
                            <GripVertical className="w-4 h-4 text-slate-400 cursor-move widget-handle" />
                        )}
                        <WidgetIcon className="w-4 h-4 text-teal-600" />
                        <CardTitle className="text-sm font-medium text-slate-700">
                            {widget.config?.title || WIDGET_REGISTRY[widget.type]?.name}
                        </CardTitle>
                    </div>

                    {isEditMode && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRemove}
                            className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-3 h-[calc(100%-40px)] overflow-auto">
                <WidgetContent type={widget.type} config={widget.config} />
            </CardContent>
        </Card>
    );
}

// Widget Content Renderer
function WidgetContent({ type, config }) {
    // Placeholder content based on widget type
    switch (type) {
        case 'metric-card':
            return (
                <div className="flex flex-col justify-center h-full">
                    <p className="text-3xl font-bold text-slate-800">42</p>
                    <p className="text-xs text-slate-500 mt-1">{config?.subtitle || 'Current value'}</p>
                </div>
            );
        case 'trend-chart':
            return (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-slate-300" />
                </div>
            );
        case 'pie-chart':
            return (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg">
                    <PieChart className="w-8 h-8 text-slate-300" />
                </div>
            );
        case 'bar-chart':
            return (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-slate-300" />
                </div>
            );
        case 'risk-matrix':
            return (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg">
                    <AlertTriangle className="w-8 h-8 text-slate-300" />
                </div>
            );
        case 'ai-insights':
            return (
                <div className="space-y-2">
                    <div className="p-2 bg-teal-50 rounded-lg text-xs text-teal-700">
                        💡 3 projects showing early warning signs
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                        ⚠️ Resource bottleneck predicted in Week 3
                    </div>
                </div>
            );
        default:
            return (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    Widget: {type}
                </div>
            );
    }
}

// Widget Picker Modal
function WidgetPickerModal({ onSelect, onClose }) {
    const categories = [...new Set(Object.values(WIDGET_REGISTRY).map(w => w.category))];

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
                <Card className="w-full max-w-lg bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <CardTitle>Add Widget</CardTitle>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 max-h-[60vh] overflow-auto">
                        {categories.map(category => (
                            <div key={category} className="mb-4">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    {category}
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(WIDGET_REGISTRY)
                                        .filter(([_, w]) => w.category === category)
                                        .map(([key, widget]) => {
                                            const Icon = widget.icon;
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => onSelect(key)}
                                                    className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-colors text-left"
                                                >
                                                    <Icon className="w-5 h-5 text-teal-600" />
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {widget.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>
        </>
    );
}
