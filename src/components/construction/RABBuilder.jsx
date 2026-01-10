import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileSpreadsheet, Plus, Copy, Check, X, Edit2, Trash2,
    DollarSign, Package, Users, Wrench, Percent, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE = 'http://103.189.234.15:3001/api';

const CATEGORIES = [
    { value: 'Material', label: 'Material', icon: Package, color: 'bg-blue-500' },
    { value: 'Upah', label: 'Upah/Tenaga', icon: Users, color: 'bg-green-500' },
    { value: 'Alat', label: 'Alat/Sewa', icon: Wrench, color: 'bg-orange-500' },
    { value: 'Overhead', label: 'Overhead', icon: TrendingUp, color: 'bg-purple-500' },
    { value: 'Profit', label: 'Profit', icon: Percent, color: 'bg-emerald-500' }
];

export default function RABBuilder({ projectId, projectName = 'Project' }) {
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [items, setItems] = useState([]);
    const [summary, setSummary] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showItemForm, setShowItemForm] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const token = localStorage.getItem('trilogic_token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Fetch versions
    const fetchVersions = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/rab/project/${projectId}`, { headers });
            const data = await res.json();
            if (data.success) {
                setVersions(data.data);
                if (data.data.length > 0 && !selectedVersion) {
                    setSelectedVersion(data.data[0]);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }, [projectId]);

    // Fetch version details
    const fetchVersionDetails = useCallback(async () => {
        if (!selectedVersion) return;

        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE}/rab/${selectedVersion.id}`, { headers });
            const data = await res.json();
            if (data.success) {
                setItems(data.data.items);
                setSummary(data.data.summary);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedVersion]);

    useEffect(() => { fetchVersions(); }, [fetchVersions]);
    useEffect(() => { fetchVersionDetails(); }, [fetchVersionDetails]);

    // Create new version
    const createVersion = async (copyFrom = null) => {
        try {
            const res = await fetch(`${API_BASE}/rab`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ project_id: projectId, copy_from_version: copyFrom })
            });
            const data = await res.json();
            if (data.success) {
                await fetchVersions();
                setSelectedVersion(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Add/Update item
    const saveItem = async (formData) => {
        try {
            const url = editItem
                ? `${API_BASE}/rab/items/${editItem.id}`
                : `${API_BASE}/rab/${selectedVersion.id}/items`;

            const res = await fetch(url, {
                method: editItem ? 'PUT' : 'POST',
                headers,
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchVersionDetails();
                setShowItemForm(false);
                setEditItem(null);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Delete item
    const deleteItem = async (itemId) => {
        if (!confirm('Hapus item ini?')) return;

        try {
            await fetch(`${API_BASE}/rab/items/${itemId}`, { method: 'DELETE', headers });
            await fetchVersionDetails();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
                        RAB Builder
                    </h2>
                    <p className="text-sm text-slate-500">{projectName}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={selectedVersion?.id}
                        onValueChange={(v) => setSelectedVersion(versions.find(ver => ver.id === v))}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Pilih Versi" />
                        </SelectTrigger>
                        <SelectContent>
                            {versions.map(v => (
                                <SelectItem key={v.id} value={v.id}>
                                    Versi {v.version_number} - {v.status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={() => createVersion(selectedVersion?.id)}>
                        <Copy className="w-4 h-4 mr-1" />
                        Duplikat
                    </Button>

                    <Button onClick={() => createVersion()} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-1" />
                        Versi Baru
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-6 gap-3">
                {CATEGORIES.map(cat => {
                    const catSummary = summary.find(s => s.category === cat.value);
                    const Icon = cat.icon;
                    return (
                        <Card key={cat.value} className="border border-slate-200">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`p-1.5 rounded ${cat.color}`}>
                                        <Icon className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-xs text-slate-500">{cat.label}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-800">
                                    Rp {formatCurrency(catSummary?.total)}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}

                <Card className="border-2 border-indigo-200 bg-indigo-50">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded bg-indigo-600">
                                <DollarSign className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs text-indigo-600 font-medium">GRAND TOTAL</span>
                        </div>
                        <p className="text-sm font-bold text-indigo-700">
                            Rp {formatCurrency(selectedVersion?.grand_total)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Items Table */}
            <Card className="border border-slate-200">
                <CardHeader className="py-3 border-b flex-row items-center justify-between">
                    <CardTitle className="text-sm">Daftar Item RAB</CardTitle>
                    <Button size="sm" onClick={() => { setEditItem(null); setShowItemForm(true); }}>
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah Item
                    </Button>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <FileSpreadsheet className="w-12 h-12 mx-auto mb-2" />
                            <p>Belum ada item RAB</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="text-left p-3">Kode</th>
                                    <th className="text-left p-3">Deskripsi</th>
                                    <th className="text-left p-3">Kategori</th>
                                    <th className="text-right p-3">Volume</th>
                                    <th className="text-left p-3">Satuan</th>
                                    <th className="text-right p-3">Harga Satuan</th>
                                    <th className="text-right p-3">Total</th>
                                    <th className="text-right p-3">Markup</th>
                                    <th className="text-right p-3">Final</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="p-3 font-mono text-xs">{item.item_code}</td>
                                        <td className="p-3">{item.description}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-xs text-white ${CATEGORIES.find(c => c.value === item.category)?.color}`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">{formatCurrency(item.volume)}</td>
                                        <td className="p-3">{item.unit}</td>
                                        <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                                        <td className="p-3 text-right">{formatCurrency(item.total_price)}</td>
                                        <td className="p-3 text-right">{item.markup_pct}%</td>
                                        <td className="p-3 text-right font-medium">{formatCurrency(item.final_price)}</td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="ghost" onClick={() => { setEditItem(item); setShowItemForm(true); }}>
                                                    <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => deleteItem(item.id)} className="text-red-500">
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Item Form Modal */}
            <AnimatePresence>
                {showItemForm && (
                    <ItemFormModal
                        item={editItem}
                        onSave={saveItem}
                        onClose={() => { setShowItemForm(false); setEditItem(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ItemFormModal({ item, onSave, onClose }) {
    const [form, setForm] = useState({
        category: item?.category || 'Material',
        item_code: item?.item_code || '',
        description: item?.description || '',
        unit: item?.unit || '',
        volume: item?.volume || 0,
        unit_price: item?.unit_price || 0,
        markup_pct: item?.markup_pct || 0
    });

    const total = form.volume * form.unit_price;
    const final = total * (1 + form.markup_pct / 100);

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <CardTitle>{item ? 'Edit Item' : 'Tambah Item RAB'}</CardTitle>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Kategori</label>
                                <Select value={form.category} onValueChange={(v) => setForm(p => ({ ...p, category: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(c => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Kode Item</label>
                                <Input value={form.item_code} onChange={(e) => setForm(p => ({ ...p, item_code: e.target.value }))} />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Deskripsi *</label>
                            <Input value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} required />
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium">Volume</label>
                                <Input type="number" step="0.01" value={form.volume} onChange={(e) => setForm(p => ({ ...p, volume: parseFloat(e.target.value) || 0 }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Satuan</label>
                                <Input value={form.unit} onChange={(e) => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="m³, kg, ls" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Harga Satuan</label>
                                <Input type="number" value={form.unit_price} onChange={(e) => setForm(p => ({ ...p, unit_price: parseFloat(e.target.value) || 0 }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Markup %</label>
                                <Input type="number" step="0.1" value={form.markup_pct} onChange={(e) => setForm(p => ({ ...p, markup_pct: parseFloat(e.target.value) || 0 }))} />
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500">Total:</span>
                                <span className="ml-2 font-medium">Rp {new Intl.NumberFormat('id-ID').format(total)}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Final:</span>
                                <span className="ml-2 font-bold text-indigo-600">Rp {new Intl.NumberFormat('id-ID').format(final)}</span>
                            </div>
                        </div>
                    </CardContent>

                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50 rounded-b-2xl">
                        <Button variant="outline" onClick={onClose}>Batal</Button>
                        <Button onClick={() => onSave(form)} className="bg-indigo-600">Simpan</Button>
                    </div>
                </Card>
            </motion.div>
        </>
    );
}
