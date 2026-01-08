import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, X, Save, Loader2, Calendar, Clock,
    User, Flag, FileText, CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TaskForm({ isOpen, onClose, onSubmit, task = null, projects = [], resources = [], isLoading = false }) {
    const isEditing = !!task;

    const [formData, setFormData] = useState({
        project_id: task?.project_id || '',
        task_name: task?.task_name || '',
        description: task?.description || '',
        status: task?.status || 'To Do',
        priority: task?.priority || 'Medium',
        assignee_id: task?.assignee_id || '',
        estimated_hours: task?.estimated_hours || '',
        start_date: task?.start_date || '',
        due_date: task?.due_date || ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    const priorityColors = {
        Low: 'bg-slate-100 text-slate-700',
        Medium: 'bg-blue-100 text-blue-700',
        High: 'bg-amber-100 text-amber-700',
        Critical: 'bg-orange-100 text-orange-700',
        Urgent: 'bg-red-100 text-red-700'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                        <Card className="w-full max-w-xl max-h-[90vh] overflow-auto bg-white shadow-2xl rounded-2xl">
                            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <CheckSquare className="w-5 h-5 text-blue-600" />
                                        {isEditing ? 'Edit Task' : 'Create New Task'}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Project Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Project *</label>
                                        <Select value={formData.project_id} onValueChange={(v) => handleChange('project_id', v)}>
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue placeholder="Select project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projects.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Task Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Task Name *</label>
                                        <Input
                                            value={formData.task_name}
                                            onChange={(e) => handleChange('task_name', e.target.value)}
                                            placeholder="Enter task name"
                                            className="rounded-xl"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            placeholder="Task description..."
                                            className="w-full h-20 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none text-sm"
                                        />
                                    </div>

                                    {/* Status & Priority */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Status</label>
                                            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="To Do">To Do</SelectItem>
                                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                                    <SelectItem value="In Review">In Review</SelectItem>
                                                    <SelectItem value="Done">Done</SelectItem>
                                                    <SelectItem value="Blocked">Blocked</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Priority</label>
                                            <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Low">🟢 Low</SelectItem>
                                                    <SelectItem value="Medium">🔵 Medium</SelectItem>
                                                    <SelectItem value="High">🟡 High</SelectItem>
                                                    <SelectItem value="Critical">🟠 Critical</SelectItem>
                                                    <SelectItem value="Urgent">🔴 Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Assignee & Hours */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                Assignee
                                            </label>
                                            <Select value={formData.assignee_id} onValueChange={(v) => handleChange('assignee_id', v)}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue placeholder="Select assignee" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {resources.filter(r => r.type === 'Human').map(r => (
                                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Estimated Hours
                                            </label>
                                            <Input
                                                type="number"
                                                value={formData.estimated_hours}
                                                onChange={(e) => handleChange('estimated_hours', e.target.value)}
                                                placeholder="0"
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Start Date
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => handleChange('start_date', e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Due Date
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.due_date}
                                                onChange={(e) => handleChange('due_date', e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={onClose}
                                            className="flex-1 rounded-xl"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            {isEditing ? 'Update Task' : 'Create Task'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
