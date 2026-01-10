import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ChevronDown, Plus, Edit2, Trash2, Save, X,
    FolderTree, FileText, Activity, MoreHorizontal,
    Calendar, DollarSign, Percent, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

const API_BASE_URL = 'http://103.189.234.15:3001/api';

// Status colors following QCLAY design
const STATUS_COLORS = {
    'Not Started': { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    'In Progress': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    'On Hold': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' }
};

export default function WBSBuilder({ projectId, projectName = 'Project' }) {
    const [wbsData, setWbsData] = useState([]);
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [selectedNode, setSelectedNode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingNode, setEditingNode] = useState(null);
    const [stats, setStats] = useState(null);

    // Fetch WBS data
    const fetchWBS = useCallback(async () => {
        if (!projectId) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem('trilogic_token');

            const response = await fetch(`${API_BASE_URL}/wbs/project/${projectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setWbsData(data.data.items);
                // Auto-expand first level
                const rootIds = data.data.items.map(item => item.id);
                setExpandedNodes(new Set(rootIds));
            }
        } catch (error) {
            console.error('Error fetching WBS:', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        if (!projectId) return;

        try {
            const token = localStorage.getItem('trilogic_token');
            const response = await fetch(`${API_BASE_URL}/wbs/project/${projectId}/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [projectId]);

    useEffect(() => {
        fetchWBS();
        fetchStats();
    }, [fetchWBS, fetchStats]);

    // Toggle expand/collapse
    const toggleNode = (nodeId) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    };

    // Create new WBS item
    const handleCreate = async (formData) => {
        try {
            const token = localStorage.getItem('trilogic_token');

            const response = await fetch(`${API_BASE_URL}/wbs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    project_id: projectId,
                    ...formData
                })
            });

            const data = await response.json();

            if (data.success) {
                await fetchWBS();
                await fetchStats();
                setShowForm(false);
                setEditingNode(null);
            }
        } catch (error) {
            console.error('Error creating WBS:', error);
        }
    };

    // Update WBS item
    const handleUpdate = async (id, formData) => {
        try {
            const token = localStorage.getItem('trilogic_token');

            const response = await fetch(`${API_BASE_URL}/wbs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                await fetchWBS();
                await fetchStats();
                setShowForm(false);
                setEditingNode(null);
            }
        } catch (error) {
            console.error('Error updating WBS:', error);
        }
    };

    // Delete WBS item
    const handleDelete = async (id) => {
        if (!confirm('Hapus item WBS ini dan semua sub-itemnya?')) return;

        try {
            const token = localStorage.getItem('trilogic_token');

            await fetch(`${API_BASE_URL}/wbs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            await fetchWBS();
            await fetchStats();
            setSelectedNode(null);
        } catch (error) {
            console.error('Error deleting WBS:', error);
        }
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FolderTree className="w-6 h-6 text-teal-600" />
                        Work Breakdown Structure
                    </h2>
                    <p className="text-sm text-slate-500">{projectName}</p>
                </div>

                <Button
                    onClick={() => { setShowForm(true); setEditingNode(null); }}
                    className="bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Item
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <StatCard
                        label="Total Item"
                        value={stats.total_items}
                        icon={FileText}
                        color="slate"
                    />
                    <StatCard
                        label="Dalam Proses"
                        value={stats.in_progress}
                        icon={Activity}
                        color="blue"
                    />
                    <StatCard
                        label="Selesai"
                        value={stats.completed}
                        icon={Percent}
                        color="emerald"
                    />
                    <StatCard
                        label="Total Budget"
                        value={formatCurrency(stats.total_budget)}
                        icon={DollarSign}
                        color="amber"
                        isText
                    />
                </div>
            )}

            {/* WBS Tree */}
            <Card className="flex-1 overflow-hidden">
                <CardHeader className="py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Hierarki Pekerjaan
                        </CardTitle>
                        <div className="text-xs text-slate-500">
                            Progress: {stats?.avg_progress?.toFixed(1) || 0}%
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0 overflow-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full" />
                        </div>
                    ) : wbsData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <FolderTree className="w-12 h-12 mb-2" />
                            <p>Belum ada item WBS</p>
                            <Button
                                variant="link"
                                onClick={() => setShowForm(true)}
                                className="text-teal-600"
                            >
                                Tambah item pertama
                            </Button>
                        </div>
                    ) : (
                        <div className="py-2">
                            {wbsData.map((item, index) => (
                                <WBSTreeNode
                                    key={item.id}
                                    item={item}
                                    level={0}
                                    expandedNodes={expandedNodes}
                                    selectedNode={selectedNode}
                                    onToggle={toggleNode}
                                    onSelect={setSelectedNode}
                                    onEdit={(node) => { setEditingNode(node); setShowForm(true); }}
                                    onDelete={handleDelete}
                                    onAddChild={(parentId) => {
                                        setEditingNode({ parent_id: parentId });
                                        setShowForm(true);
                                    }}
                                    formatCurrency={formatCurrency}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <WBSFormModal
                        editingNode={editingNode}
                        onSubmit={editingNode?.id ?
                            (data) => handleUpdate(editingNode.id, data) :
                            handleCreate
                        }
                        onClose={() => { setShowForm(false); setEditingNode(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Stat Card Component
function StatCard({ label, value, icon: Icon, color, isText }) {
    const colors = {
        slate: 'from-slate-500 to-slate-600',
        blue: 'from-blue-500 to-blue-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600'
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]} text-white`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className={`font-bold ${isText ? 'text-sm' : 'text-xl'} text-slate-800`}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

// WBS Tree Node Component
function WBSTreeNode({
    item, level, expandedNodes, selectedNode,
    onToggle, onSelect, onEdit, onDelete, onAddChild, formatCurrency
}) {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedNodes.has(item.id);
    const isSelected = selectedNode === item.id;
    const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS['Not Started'];

    return (
        <>
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group flex items-center gap-2 px-4 py-2 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${isSelected ? 'bg-teal-50 border-l-2 border-l-teal-500' : ''
                    }`}
                style={{ paddingLeft: `${16 + level * 24}px` }}
                onClick={() => onSelect(item.id)}
            >
                {/* Expand/Collapse */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                    className="w-5 h-5 flex items-center justify-center"
                >
                    {hasChildren ? (
                        isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        )
                    ) : (
                        <span className="w-2 h-2 bg-slate-200 rounded-full" />
                    )}
                </button>

                {/* WBS Code */}
                <span className="text-xs font-mono text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                    {item.wbs_code}
                </span>

                {/* Name */}
                <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                    {item.name}
                </span>

                {/* Status */}
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                    {item.status}
                </span>

                {/* Progress */}
                <div className="w-20 flex items-center gap-1">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-teal-500 rounded-full transition-all"
                            style={{ width: `${item.progress_percentage || 0}%` }}
                        />
                    </div>
                    <span className="text-xs text-slate-500 w-8 text-right">
                        {item.progress_percentage?.toFixed(0) || 0}%
                    </span>
                </div>

                {/* Budget */}
                <span className="text-xs text-slate-600 w-28 text-right">
                    {formatCurrency(item.planned_qty * item.unit_price)}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddChild(item.id); }}
                        className="p-1 hover:bg-teal-100 rounded"
                        title="Tambah Sub-Item"
                    >
                        <Plus className="w-3 h-3 text-teal-600" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                        className="p-1 hover:bg-blue-100 rounded"
                        title="Edit"
                    >
                        <Edit2 className="w-3 h-3 text-blue-600" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="p-1 hover:bg-red-100 rounded"
                        title="Hapus"
                    >
                        <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                </div>
            </motion.div>

            {/* Children */}
            <AnimatePresence>
                {hasChildren && isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        {item.children.map((child) => (
                            <WBSTreeNode
                                key={child.id}
                                item={child}
                                level={level + 1}
                                expandedNodes={expandedNodes}
                                selectedNode={selectedNode}
                                onToggle={onToggle}
                                onSelect={onSelect}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onAddChild={onAddChild}
                                formatCurrency={formatCurrency}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// WBS Form Modal
function WBSFormModal({ editingNode, onSubmit, onClose }) {
    const [formData, setFormData] = useState({
        name: editingNode?.name || '',
        description: editingNode?.description || '',
        item_type: editingNode?.item_type || 'Work Package',
        unit: editingNode?.unit || 'ls',
        planned_qty: editingNode?.planned_qty || 0,
        unit_price: editingNode?.unit_price || 0,
        planned_start: editingNode?.planned_start?.split('T')[0] || '',
        planned_finish: editingNode?.planned_finish?.split('T')[0] || '',
        parent_id: editingNode?.parent_id || null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

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
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FolderTree className="w-5 h-5" />
                                {editingNode?.id ? 'Edit Item WBS' : 'Tambah Item WBS'}
                            </CardTitle>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-4 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="text-sm font-medium text-slate-700">Nama Pekerjaan *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Pekerjaan Pondasi"
                                    required
                                    className="mt-1"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium text-slate-700">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Detail pekerjaan..."
                                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                    rows={2}
                                />
                            </div>

                            {/* Type & Unit */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Tipe Item</label>
                                    <Select
                                        value={formData.item_type}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, item_type: value }))}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Summary">Summary (Ringkasan)</SelectItem>
                                            <SelectItem value="Work Package">Work Package (Paket Kerja)</SelectItem>
                                            <SelectItem value="Activity">Activity (Aktivitas)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Satuan</label>
                                    <Select
                                        value={formData.unit}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ls">Lump Sum (ls)</SelectItem>
                                            <SelectItem value="m3">Meter Kubik (m³)</SelectItem>
                                            <SelectItem value="m2">Meter Persegi (m²)</SelectItem>
                                            <SelectItem value="m">Meter (m')</SelectItem>
                                            <SelectItem value="kg">Kilogram (kg)</SelectItem>
                                            <SelectItem value="unit">Unit</SelectItem>
                                            <SelectItem value="set">Set</SelectItem>
                                            <SelectItem value="titik">Titik</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Quantity & Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Volume Rencana</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.planned_qty}
                                        onChange={(e) => setFormData(prev => ({ ...prev, planned_qty: parseFloat(e.target.value) || 0 }))}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Harga Satuan (Rp)</label>
                                    <Input
                                        type="number"
                                        step="1"
                                        value={formData.unit_price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            {/* Total */}
                            <div className="p-3 bg-teal-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-teal-700">Total Budget</span>
                                    <span className="text-lg font-bold text-teal-800">
                                        {new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 0
                                        }).format(formData.planned_qty * formData.unit_price)}
                                    </span>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Mulai Rencana</label>
                                    <Input
                                        type="date"
                                        value={formData.planned_start}
                                        onChange={(e) => setFormData(prev => ({ ...prev, planned_start: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Selesai Rencana</label>
                                    <Input
                                        type="date"
                                        value={formData.planned_finish}
                                        onChange={(e) => setFormData(prev => ({ ...prev, planned_finish: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                                <Save className="w-4 h-4 mr-1" />
                                {editingNode?.id ? 'Simpan Perubahan' : 'Tambah Item'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </>
    );
}
