import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, X, Save, Loader2, Calendar, DollarSign,
    MapPin, Users, AlertTriangle, FolderKanban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProjectForm({ isOpen, onClose, onSubmit, project = null, isLoading = false }) {
    const isEditing = !!project;

    const [formData, setFormData] = useState({
        project_code: project?.project_code || '',
        name: project?.name || '',
        description: project?.description || '',
        type: project?.type || 'IT',
        status: project?.status || 'Planning',
        priority: project?.priority || 'Medium',
        budget_allocated: project?.budget_allocated || '',
        start_date: project?.start_date || '',
        target_end_date: project?.target_end_date || '',
        customer_region: project?.customer_region || ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

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
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white shadow-2xl rounded-2xl">
                            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-teal-50 to-cyan-50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <FolderKanban className="w-5 h-5 text-teal-600" />
                                        {isEditing ? 'Edit Project' : 'Create New Project'}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Project Code & Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Project Code *</label>
                                            <Input
                                                value={formData.project_code}
                                                onChange={(e) => handleChange('project_code', e.target.value)}
                                                placeholder="PRJ-001"
                                                className="rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Project Name *</label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                placeholder="Enter project name"
                                                className="rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            placeholder="Project description..."
                                            className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none resize-none text-sm"
                                        />
                                    </div>

                                    {/* Type, Status, Priority */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Type</label>
                                            <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="IT">IT</SelectItem>
                                                    <SelectItem value="Construction">Construction</SelectItem>
                                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Status</label>
                                            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Planning">Planning</SelectItem>
                                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                                    <SelectItem value="On Hold">On Hold</SelectItem>
                                                    <SelectItem value="Completed">Completed</SelectItem>
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
                                                    <SelectItem value="Low">Low</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="High">High</SelectItem>
                                                    <SelectItem value="Critical">Critical</SelectItem>
                                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Budget & Region */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                Budget Allocated (IDR)
                                            </label>
                                            <Input
                                                type="number"
                                                value={formData.budget_allocated}
                                                onChange={(e) => handleChange('budget_allocated', e.target.value)}
                                                placeholder="0"
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Customer Region
                                            </label>
                                            <Select value={formData.customer_region} onValueChange={(v) => handleChange('customer_region', v)}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue placeholder="Select region" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
                                                    <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                                                    <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                                                    <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                                                    <SelectItem value="Sumatra">Sumatra</SelectItem>
                                                    <SelectItem value="Kalimantan">Kalimantan</SelectItem>
                                                    <SelectItem value="Sulawesi">Sulawesi</SelectItem>
                                                    <SelectItem value="Papua">Papua</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                Target End Date
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.target_end_date}
                                                onChange={(e) => handleChange('target_end_date', e.target.value)}
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
                                            className="flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 shadow-lg"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            {isEditing ? 'Update Project' : 'Create Project'}
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
