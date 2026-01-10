import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as echarts from 'echarts';
import {
    TrendingUp, TrendingDown, Store, Package, Plus, X,
    MessageCircle, Send, AlertTriangle, DollarSign, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE = 'http://103.189.234.15:3001/api';

const MATERIAL_CATEGORIES = [
    'Beton', 'Besi', 'Pasir Agregat', 'Semen', 'Bata',
    'Keramik', 'Sanitair', 'MEP', 'Cat', 'Kayu', 'Atap', 'Pintu Jendela', 'Lainnya'
];

export default function MaterialPriceTracker() {
    const [materials, setMaterials] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(null); // 'material' or 'supplier'

    const token = localStorage.getItem('trilogic_token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matRes, supRes, alertRes] = await Promise.all([
                    fetch(`${API_BASE}/materials/materials`, { headers }),
                    fetch(`${API_BASE}/materials/suppliers`, { headers }),
                    fetch(`${API_BASE}/materials/price-alerts`, { headers })
                ]);

                const [matData, supData, alertData] = await Promise.all([
                    matRes.json(), supRes.json(), alertRes.json()
                ]);

                if (matData.success) setMaterials(matData.data);
                if (supData.success) setSuppliers(supData.data);
                if (alertData.success) setAlerts(alertData.data);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchData();
    }, []);

    // Fetch price history for selected material
    useEffect(() => {
        if (!selectedMaterial) return;

        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_BASE}/materials/materials/${selectedMaterial.id}/prices?days=90`, { headers });
                const data = await res.json();
                if (data.success) setPriceHistory(data.data);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchHistory();
    }, [selectedMaterial]);

    // Render price chart
    useEffect(() => {
        if (!chartRef.current || !priceHistory.trend?.length) return;

        chartInstance.current = echarts.init(chartRef.current);

        const option = {
            tooltip: { trigger: 'axis', formatter: (p) => `${p[0].axisValue}<br/>Rp ${p[0].value?.toLocaleString()}` },
            grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
            xAxis: {
                type: 'category',
                data: priceHistory.trend.map(t => new Date(t.effective_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })),
                axisLabel: { fontSize: 10 }
            },
            yAxis: {
                type: 'value',
                axisLabel: { formatter: (v) => `${(v / 1000).toFixed(0)}K` }
            },
            series: [{
                type: 'line',
                data: priceHistory.trend.map(t => t.avg_price),
                smooth: true,
                lineStyle: { color: '#6366f1', width: 2 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
                        { offset: 1, color: 'rgba(99, 102, 241, 0)' }
                    ])
                }
            }]
        };

        chartInstance.current.setOption(option);
        return () => chartInstance.current?.dispose();
    }, [priceHistory]);

    // Send WhatsApp inquiry
    const sendInquiry = async (supplierId) => {
        if (!selectedMaterial) return alert('Pilih material dulu');

        try {
            const res = await fetch(`${API_BASE}/whatsapp/send-price-inquiry`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    supplier_id: supplierId,
                    materials: [{ name: selectedMaterial.name, unit: selectedMaterial.unit }]
                })
            });
            const data = await res.json();
            alert(data.message || 'Pesan terkirim!');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                        Material Price Tracker
                    </h2>
                    <p className="text-sm text-slate-500">Pantau harga material real-time</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddModal('supplier')}>
                        <Store className="w-4 h-4 mr-1" />
                        Tambah Supplier
                    </Button>
                    <Button onClick={() => setShowAddModal('material')} className="bg-green-600 hover:bg-green-700">
                        <Package className="w-4 h-4 mr-1" />
                        Tambah Material
                    </Button>
                </div>
            </div>

            {/* Price Alerts */}
            {alerts.length > 0 && (
                <Card className="border-2 border-amber-200 bg-amber-50">
                    <CardHeader className="py-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                            <AlertTriangle className="w-4 h-4" />
                            Perubahan Harga Signifikan (>10%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="flex flex-wrap gap-2">
                            {alerts.slice(0, 5).map((a, i) => (
                                <span key={i} className={`px-2 py-1 rounded text-xs ${a.change_pct > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {a.material_name}: {a.change_pct > 0 ? '+' : ''}{a.change_pct?.toFixed(1)}%
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-3 gap-4">
                {/* Material List */}
                <Card className="border border-slate-200 col-span-1">
                    <CardHeader className="py-3 border-b">
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Cari material..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-8"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 max-h-96 overflow-y-auto">
                        {filteredMaterials.map(m => (
                            <div
                                key={m.id}
                                onClick={() => setSelectedMaterial(m)}
                                className={`p-3 border-b cursor-pointer hover:bg-slate-50 ${selectedMaterial?.id === m.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
                            >
                                <p className="font-medium text-sm">{m.name}</p>
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>{m.code}</span>
                                    <span className="font-medium text-green-600">
                                        Rp {formatCurrency(m.last_price)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Price Chart & Details */}
                <Card className="border border-slate-200 col-span-2">
                    <CardHeader className="py-3 border-b">
                        <CardTitle className="text-sm">
                            {selectedMaterial ? `Trend Harga: ${selectedMaterial.name}` : 'Pilih Material'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        {selectedMaterial ? (
                            <div className="space-y-4">
                                <div ref={chartRef} style={{ height: '200px', width: '100%' }} />

                                {/* Price from suppliers */}
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Harga dari Supplier</h4>
                                    <div className="space-y-2">
                                        {priceHistory.prices?.slice(0, 5).map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                                <div>
                                                    <p className="font-medium text-sm">{p.supplier_name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(p.effective_date).toLocaleDateString('id-ID')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">Rp {formatCurrency(p.price)}</p>
                                                    <span className={`text-xs ${p.source === 'WhatsApp' ? 'text-blue-500' : 'text-slate-400'}`}>
                                                        via {p.source}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick inquiry buttons */}
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Tanya Harga via WhatsApp</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {suppliers.slice(0, 4).map(s => (
                                            <Button key={s.id} size="sm" variant="outline" onClick={() => sendInquiry(s.id)}>
                                                <MessageCircle className="w-3 h-3 mr-1 text-green-500" />
                                                {s.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <Package className="w-12 h-12 mb-2" />
                                <p>Pilih material untuk melihat trend harga</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddModal
                        type={showAddModal}
                        onClose={() => setShowAddModal(null)}
                        onSuccess={() => window.location.reload()}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function AddModal({ type, onClose, onSuccess }) {
    const [form, setForm] = useState(
        type === 'material'
            ? { code: '', name: '', unit: '', category: 'Lainnya' }
            : { name: '', contact_person: '', phone: '', whatsapp_number: '', address: '' }
    );

    const token = localStorage.getItem('trilogic_token');

    const handleSubmit = async () => {
        try {
            const endpoint = type === 'material' ? '/materials/materials' : '/materials/suppliers';
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) onSuccess();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b bg-gradient-to-r from-green-600 to-teal-500 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <CardTitle>{type === 'material' ? 'Tambah Material' : 'Tambah Supplier'}</CardTitle>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        {type === 'material' ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Kode *</label>
                                        <Input value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value }))} placeholder="BES-001" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Satuan</label>
                                        <Input value={form.unit} onChange={(e) => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="kg, m³, btg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Nama Material *</label>
                                    <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Besi 10mm SNI" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Kategori</label>
                                    <Select value={form.category} onValueChange={(v) => setForm(p => ({ ...p, category: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {MATERIAL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm font-medium">Nama Toko/Supplier *</label>
                                    <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Contact Person</label>
                                    <Input value={form.contact_person} onChange={(e) => setForm(p => ({ ...p, contact_person: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Telepon</label>
                                        <Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">WhatsApp *</label>
                                        <Input value={form.whatsapp_number} onChange={(e) => setForm(p => ({ ...p, whatsapp_number: e.target.value }))} placeholder="628xxx" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Alamat</label>
                                    <Input value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} />
                                </div>
                            </>
                        )}
                    </CardContent>

                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50 rounded-b-2xl">
                        <Button variant="outline" onClick={onClose}>Batal</Button>
                        <Button onClick={handleSubmit} className="bg-green-600">Simpan</Button>
                    </div>
                </Card>
            </motion.div>
        </>
    );
}
