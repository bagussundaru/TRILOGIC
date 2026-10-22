import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Trash2, FileSpreadsheet, Search, Filter, DollarSign, Package,
    TrendingUp, CheckCircle, Building2
} from 'lucide-react';
import { useCivil } from '@/contexts/CivilContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CATEGORY_COLORS = {
    'Pekerjaan Persiapan': { bg: 'bg-slate-100', text: 'text-slate-700' },
    'Pekerjaan Tanah': { bg: 'bg-amber-100', text: 'text-amber-700' },
    'Pekerjaan Struktur': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Pekerjaan Arsitektur': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'Pekerjaan MEP': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    'Furnitur': { bg: 'bg-pink-100', text: 'text-pink-700' },
    'Fasilitas & Kontingensi': { bg: 'bg-indigo-100', text: 'text-indigo-700' }
};

export default function BOQManager({ projectId, projectName }) {
    const { projects, boqItems, addBoqItem, deleteBoqItem } = useCivil();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        category: 'Pekerjaan Struktur',
        code: '3.4',
        item: '',
        volume: '',
        unit: 'm³',
        price: '',
        progress: 0
    });

    const project = projects[0];

    const filteredItems = boqItems.filter(item => {
        const matchCategory = filterCategory === 'all' ? true : item.category === filterCategory;
        const matchSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.includes(searchTerm);
        return matchCategory && matchSearch;
    });

    const grandTotal = boqItems.reduce((sum, item) => sum + (item.volume * item.price), 0);
    const weightedProgress = boqItems.reduce((sum, item) => {
        const itemTotal = item.volume * item.price;
        const weight = grandTotal > 0 ? (itemTotal / grandTotal) : 0;
        return sum + (weight * item.progress);
    }, 0);

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.item || !formData.volume || !formData.price) return;

        addBoqItem({
            category: formData.category,
            code: formData.code,
            item: formData.item,
            volume: parseFloat(formData.volume),
            unit: formData.unit,
            price: parseFloat(formData.price),
            progress: parseFloat(formData.progress) || 0
        });

        setShowModal(false);
        setFormData({ category: 'Pekerjaan Struktur', code: '3.4', item: '', volume: '', unit: 'm³', price: '', progress: 0 });
    };

    return (
        <div className="space-y-6">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase text-slate-400">Total Volume & Nilai BOQ</span>
                            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{formatIDR(grandTotal)}</h3>
                            <p className="text-xs text-slate-500 font-semibold mt-1">100% Sesuai RAB Proposal</p>
                        </div>
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase text-slate-400">Progres Fisik Tertimbang</span>
                            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{weightedProgress.toFixed(1)}%</h3>
                            <p className="text-xs text-amber-700 font-semibold mt-1">Fase 1 (6 Kamar Lt 1 Selesai)</p>
                        </div>
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase text-slate-400">Jumlah Item Pekerjaan</span>
                            <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{boqItems.length} Item</h3>
                            <p className="text-xs text-blue-700 font-semibold mt-1">Struktur, Arsitektur, MEP & Furnitur</p>
                        </div>
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <Package className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter & Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Cari item BOQ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 rounded-xl text-xs"
                        />
                    </div>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-slate-100 text-xs font-semibold text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200"
                    >
                        <option value="all">Semua Kategori</option>
                        <option value="Pekerjaan Persiapan">Pekerjaan Persiapan</option>
                        <option value="Pekerjaan Tanah">Pekerjaan Tanah</option>
                        <option value="Pekerjaan Struktur">Pekerjaan Struktur</option>
                        <option value="Pekerjaan Arsitektur">Pekerjaan Arsitektur</option>
                        <option value="Pekerjaan MEP">Pekerjaan MEP</option>
                        <option value="Furnitur">Furnitur</option>
                        <option value="Fasilitas & Kontingensi">Fasilitas & Kontingensi</option>
                    </select>
                </div>

                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-4 h-10 shadow-md shadow-emerald-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Item BOQ
                </Button>
            </div>

            {/* Table BOQ */}
            <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold tracking-wider">
                            <tr>
                                <th className="p-3.5">Kode</th>
                                <th className="p-3.5">Kategori</th>
                                <th className="p-3.5">Uraian Pekerjaan Sipil</th>
                                <th className="p-3.5 text-right">Volume</th>
                                <th className="p-3.5 text-center">Satuan</th>
                                <th className="p-3.5 text-right">Harga Satuan (IDR)</th>
                                <th className="p-3.5 text-right">Total Biaya (IDR)</th>
                                <th className="p-3.5 text-center">Progres Lapangan</th>
                                <th className="p-3.5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.map(item => {
                                const total = item.volume * item.price;
                                const catStyle = CATEGORY_COLORS[item.category] || { bg: 'bg-slate-100', text: 'text-slate-700' };

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="p-3.5 font-bold text-slate-800">{item.code}</td>
                                        <td className="p-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${catStyle.bg} ${catStyle.text}`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="p-3.5 font-semibold text-slate-900">{item.item}</td>
                                        <td className="p-3.5 text-right font-bold text-slate-800">{item.volume.toLocaleString('id-ID')}</td>
                                        <td className="p-3.5 text-center text-slate-500 font-semibold">{item.unit}</td>
                                        <td className="p-3.5 text-right font-medium text-slate-700">{formatIDR(item.price)}</td>
                                        <td className="p-3.5 text-right font-extrabold text-slate-900">{formatIDR(total)}</td>
                                        <td className="p-3.5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.progress}%` }} />
                                                </div>
                                                <span className="font-extrabold text-slate-800 text-[11px]">{item.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <button onClick={() => deleteBoqItem(item.id)} className="text-slate-400 hover:text-rose-600 p-1" title="Hapus Item">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
