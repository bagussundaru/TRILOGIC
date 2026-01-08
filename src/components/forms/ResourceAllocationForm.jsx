import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Save, Loader2, Calendar,
    Users, FolderKanban, Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ResourceAllocationForm({
    isOpen,
    onClose,
    onSubmit,
    allocation = null,
    projects = [],
    resources = [],
    isLoading = false
}) {
    const isEditing = !!allocation;

    const [formData, setFormData] = useState({
        resource_id: allocation?.resource_id || '',
        project_id: allocation?.project_id || '',
        allocated_hours: allocation?.allocated_hours || '',
        allocation_percentage: allocation?.allocation_percentage || 100,
        start_date: allocation?.start_date || '',
        end_date: allocation?.end_date || '',
        notes: allocation?.notes || ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    const humanResources = resources.filter(r => r.type === 'Human');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                        <Card className="w-full max-w-lg bg-white shadow-2xl rounded-2xl">
                            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Users className="w-5 h-5 text-violet-600" />
                                        {isEditing ? 'Edit Allocation' : 'Allocate Resource'}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Resource Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Resource *
                                        </label>
                                        <Select value={formData.resource_id} onValueChange={(v) => handleChange('resource_id', v)}>
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue placeholder="Select resource" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {humanResources.map(r => (
                                                    <SelectItem key={r.id} value={r.id}>
                                                        <div className="flex items-center gap-2">
                                                            <span>{r.name}</span>
                                                            <span className="text-xs text-slate-400">({r.role || 'Engineer'})</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Project Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FolderKanban className="w-4 h-4" />
                                            Project *
                                        </label>
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

                                    {/* Hours & Percentage */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Allocated Hours</label>
                                            <Input
                                                type="number"
                                                value={formData.allocated_hours}
                                                onChange={(e) => handleChange('allocated_hours', e.target.value)}
                                                placeholder="160"
                                                className="rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Percent className="w-4 h-4" />
                                                Allocation %
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.allocation_percentage}
                                                onChange={(e) => handleChange('allocation_percentage', e.target.value)}
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
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                End Date
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => handleChange('end_date', e.target.value)}
                                                className="rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => handleChange('notes', e.target.value)}
                                            placeholder="Additional notes..."
                                            className="w-full h-16 px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none resize-none text-sm"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                                        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 shadow-lg"
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                            {isEditing ? 'Update' : 'Allocate'}
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
