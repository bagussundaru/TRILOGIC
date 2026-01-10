import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Save, X, Upload, Download,
    FileSpreadsheet, Search, Filter, DollarSign, Package,
    TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

const API_BASE_URL = 'http://103.189.234.15:3001/api';

// Category colors
const CATEGORY_COLORS = {
    'Pekerjaan Persiapan': { bg: 'bg-slate-100', text: 'text-slate-700' },
    'Pekerjaan Tanah': { bg: 'bg-amber-100', text: 'text-amber-700' },
    'Pekerjaan Struktur': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Pekerjaan Arsitektur': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'Pekerjaan MEP': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    'Pekerjaan Landscape': { bg: 'bg-green-100', text: 'text-green-700' },
    'Pekerjaan Lainnya': { bg: 'bg-gray-100', text: 'text-gray-700' }
};

export default function BOQManager({ projectId, projectName = 'Project' }) {
    const [boqItems, setBoqItems] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [totals, setTotals] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Fetch BOQ data
    const fetchBOQ = useCallback(async () => {
        if (!projectId) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem('trilogic_token');

            const response = await fetch(`${API_BASE_URL}/boq/project/${projectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setBoqItems(data.data.items);
                setCategoryData(data.data.byCategory);
                setTotals(data.data.totals);
            }
        } catch (error) {
            console.error('Error fetching BOQ:', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchBOQ();
    }, [fetchBOQ]);

    // Create BOQ item
    const handleCreate = async (formData) => {
        try {
            const token = localStorage.getItem('trilogic_token');

            const response = await fetch(`${API_BASE_URL}/boq`, {
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
                await fetchBOQ();
                setShowForm(false);
                setEditingItem(null);
            }
        } catch (error) {
            console.error('Error creating BOQ:', error);
        }
    };

    // Update BOQ item
    const handleUpdate = async (id, formData) => {
        try {
            const token = localStorage.getItem('trilogic_token');

            const response = await fetch(`${API_BASE_URL}/boq/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchBOQ();
                setShowForm(false);
                setEditingItem(null);
            }
        } catch (error) {
            console.error('Error updating BOQ:', error);
        }
    };

    // Delete BOQ item
    const handleDelete = async (id) => {
        if (!confirm('Hapus item BOQ ini?')) return;

        try {
            const token = localStorage.getItem('trilogic_token');

            await fetch(`${API_BASE_URL}/boq/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            await fetchBOQ();
        } catch (error) {
            console.error('Error deleting BOQ:', error);
        }
    };

    // Update progress (executed qty)
    const handleProgressUpdate = async (id, executed_qty) => {
        try {
            const token = localStorage.getItem('trilogic_token');

            await fetch(`${API_BASE_URL}/boq/${id}/progress`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ executed_qty })
            });

            await fetchBOQ();
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    // Filter items
    const filteredItems = useMemo(() => {
        return boqItems.filter(item => {
            const matchesSearch = searchTerm === '' ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.boq_code?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = filterCategory === 'all' || item.category === filterCategory;

            return matchesSearch && matchesCategory;
        });
    }, [boqItems, searchTerm, filterCategory]);

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
                        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                        Bill of Quantity (BOQ)
                    </h2>
                    <p className="text-sm text-slate-500">{projectName}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-lg">
                        <Upload className="w-4 h-4 mr-1" />
                        Import Excel
                    </Button>
                    <Button variant="outline" className="rounded-lg">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                    </Button>
                    <Button
                        onClick={() => { setShowForm(true); setEditingItem(null); }}
                        className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah Item
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-4">
                <SummaryCard
                    label="Nilai Kontrak"
                    value={formatCurrency(totals.grand_contract)}
                    icon={DollarSign}
                    color="blue"
                />
                <SummaryCard
                    label="Terealisasi"
                    value={formatCurrency(totals.grand_executed)}
                    icon={TrendingUp}
                    color="emerald"
                />
                <SummaryCard
                    label="Sisa"
                    value={formatCurrency((totals.grand_contract || 0) - (totals.grand_executed || 0))}
                    icon={Package}
                    color="amber"
                />
                <SummaryCard
                    label="Progress"
                    value={`${totals.grand_contract > 0
                        ? ((totals.grand_executed / totals.grand_contract) * 100).toFixed(1)
                        : 0}%`}
                    icon={CheckCircle}
                    color="purple"
                    isText
                />
            </div>

            {/* Category Summary */}
            {categoryData.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {categoryData.map(cat => {
                        const style = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Pekerjaan Lainnya'];
                        return (
                            <div
                                key={cat.category}
                                className={`px-3 py-1.5 rounded-lg ${style.bg} ${style.text} text-xs font-medium`}
                            >
                                {cat.category}: {formatCurrency(cat.contract_total)}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari kode atau deskripsi..."
                        className="pl-10"
                    />
                </div>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-56">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        <SelectItem value="Pekerjaan Persiapan">Pekerjaan Persiapan</SelectItem>
                        <SelectItem value="Pekerjaan Tanah">Pekerjaan Tanah</SelectItem>
                        <SelectItem value="Pekerjaan Struktur">Pekerjaan Struktur</SelectItem>
                        <SelectItem value="Pekerjaan Arsitektur">Pekerjaan Arsitektur</SelectItem>
                        <SelectItem value="Pekerjaan MEP">Pekerjaan MEP</SelectItem>
                        <SelectItem value="Pekerjaan Landscape">Pekerjaan Landscape</SelectItem>
                        <SelectItem value="Pekerjaan Lainnya">Pekerjaan Lainnya</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* BOQ Table */}
            <Card className="flex-1 overflow-hidden">
                <CardContent className="p-0 overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <FileSpreadsheet className="w-12 h-12 mb-2" />
                            <p>Belum ada item BOQ</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr className="border-b border-slate-200">
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Kode</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Deskripsi</th>
                                    <th className="text-center px-4 py-3 font-medium text-slate-600">Satuan</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600">Volume</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600">Harga Satuan</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600">Jumlah</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600">Realisasi</th>
                                    <th className="text-center px-4 py-3 font-medium text-slate-600">Progress</th>
                                    <th className="text-center px-4 py-3 font-medium text-slate-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item, index) => {
                                    const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Pekerjaan Lainnya'];
                                    const progress = item.contract_qty > 0
                                        ? (item.executed_qty / item.contract_qty * 100)
                                        : 0;

                                    return (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                                                    {item.boq_code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-slate-700">{item.description}</p>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${catStyle.bg} ${catStyle.text}`}>
                                                        {item.category}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-slate-600">{item.unit}</td>
                                            <td className="px-4 py-3 text-right font-mono">{item.contract_qty?.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-mono">{formatCurrency(item.contract_price)}</td>
                                            <td className="px-4 py-3 text-right font-mono font-medium">{formatCurrency(item.contract_amount)}</td>
                                            <td className="px-4 py-3 text-right font-mono text-emerald-600">{formatCurrency(item.executed_amount)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' :
                                                                    progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                                                                }`}
                                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-slate-600 w-10 text-right">
                                                        {progress.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => { setEditingItem(item); setShowForm(true); }}
                                                        className="p-1.5 hover:bg-blue-100 rounded"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 hover:bg-red-100 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <BOQFormModal
                        editingItem={editingItem}
                        onSubmit={editingItem?.id ?
                            (data) => handleUpdate(editingItem.id, data) :
                            handleCreate
                        }
                        onClose={() => { setShowForm(false); setEditingItem(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Summary Card
function SummaryCard({ label, value, icon: Icon, color, isText }) {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        purple: 'from-purple-500 to-purple-600'
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]} text-white`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className={`font-bold ${isText ? 'text-xl' : 'text-sm'} text-slate-800`}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

// BOQ Form Modal
function BOQFormModal({ editingItem, onSubmit, onClose }) {
    const [formData, setFormData] = useState({
        boq_code: editingItem?.boq_code || '',
        description: editingItem?.description || '',
        specification: editingItem?.specification || '',
        unit: editingItem?.unit || 'm2',
        contract_qty: editingItem?.contract_qty || 0,
        contract_price: editingItem?.contract_price || 0,
        executed_qty: editingItem?.executed_qty || 0,
        category: editingItem?.category || 'Pekerjaan Struktur',
        remarks: editingItem?.remarks || ''
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
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5" />
                                {editingItem?.id ? 'Edit Item BOQ' : 'Tambah Item BOQ'}
                            </CardTitle>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Code & Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Kode BOQ *</label>
                                    <Input
                                        value={formData.boq_code}
                                        onChange={(e) => setFormData(prev => ({ ...prev, boq_code: e.target.value }))}
                                        placeholder="e.g., A.1.1"
                                        required
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Kategori</label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pekerjaan Persiapan">Pekerjaan Persiapan</SelectItem>
                                            <SelectItem value="Pekerjaan Tanah">Pekerjaan Tanah</SelectItem>
                                            <SelectItem value="Pekerjaan Struktur">Pekerjaan Struktur</SelectItem>
                                            <SelectItem value="Pekerjaan Arsitektur">Pekerjaan Arsitektur</SelectItem>
                                            <SelectItem value="Pekerjaan MEP">Pekerjaan MEP</SelectItem>
                                            <SelectItem value="Pekerjaan Landscape">Pekerjaan Landscape</SelectItem>
                                            <SelectItem value="Pekerjaan Lainnya">Pekerjaan Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium text-slate-700">Deskripsi Pekerjaan *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Uraian pekerjaan..."
                                    required
                                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    rows={2}
                                />
                            </div>

                            {/* Unit & Qty & Price */}
                            <div className="grid grid-cols-3 gap-4">
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
                                            <SelectItem value="ls">Lump Sum</SelectItem>
                                            <SelectItem value="m3">m³</SelectItem>
                                            <SelectItem value="m2">m²</SelectItem>
                                            <SelectItem value="m">m'</SelectItem>
                                            <SelectItem value="kg">kg</SelectItem>
                                            <SelectItem value="unit">unit</SelectItem>
                                            <SelectItem value="set">set</SelectItem>
                                            <SelectItem value="bh">buah</SelectItem>
                                            <SelectItem value="titik">titik</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Volume Kontrak</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.contract_qty}
                                        onChange={(e) => setFormData(prev => ({ ...prev, contract_qty: parseFloat(e.target.value) || 0 }))}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Harga Satuan</label>
                                    <Input
                                        type="number"
                                        step="1"
                                        value={formData.contract_price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, contract_price: parseFloat(e.target.value) || 0 }))}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            {/* Executed Qty */}
                            {editingItem?.id && (
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Volume Terlaksana</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.executed_qty}
                                        onChange={(e) => setFormData(prev => ({ ...prev, executed_qty: parseFloat(e.target.value) || 0 }))}
                                        className="mt-1"
                                    />
                                </div>
                            )}

                            {/* Total */}
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-blue-700">Jumlah Harga</span>
                                    <span className="text-lg font-bold text-blue-800">
                                        {new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 0
                                        }).format(formData.contract_qty * formData.contract_price)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>

                        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                <Save className="w-4 h-4 mr-1" />
                                {editingItem?.id ? 'Simpan' : 'Tambah'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </>
    );
}
