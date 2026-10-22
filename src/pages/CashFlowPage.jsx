import React, { useState } from 'react';
import { useCivil } from '@/contexts/CivilContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign, ArrowUpRight, ArrowDownLeft, Wallet, Building2,
    Plus, Trash2, FileText, CheckCircle2, TrendingUp, TrendingDown,
    Receipt, PieChart as PieIcon, Filter, Calendar, HardHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CashFlowPage() {
    const { projects, cashFlow, addCashFlow, deleteCashFlow } = useCivil();
    const [selectedProjectId, setSelectedProjectId] = useState('all');
    const [filterType, setFilterType] = useState('ALL'); // ALL, IN, OUT
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        projectId: projects[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        type: 'OUT',
        category: 'Pembelian Material',
        amount: '',
        description: '',
        status: 'Lunas',
        proof: 'Invoice.pdf'
    });

    const filteredCashflow = cashFlow.filter(item => {
        const matchProject = selectedProjectId === 'all' ? true : item.projectId === selectedProjectId;
        const matchType = filterType === 'ALL' ? true : item.type === filterType;
        return matchProject && matchType;
    });

    // Calculated Financial Metrics
    const totalCashIn = filteredCashflow
        .filter(item => item.type === 'IN')
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const totalCashOut = filteredCashflow
        .filter(item => item.type === 'OUT')
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const netCashBalance = totalCashIn - totalCashOut;
    const profitMargin = totalCashIn > 0 ? ((netCashBalance / totalCashIn) * 100).toFixed(1) : '0';

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.description) return;

        addCashFlow({
            ...formData,
            amount: parseFloat(formData.amount)
        });

        setShowModal(false);
        setFormData({
            projectId: projects[0]?.id || '',
            date: new Date().toISOString().split('T')[0],
            type: 'OUT',
            category: 'Pembelian Material',
            amount: '',
            description: '',
            status: 'Lunas',
            proof: 'Invoice.pdf'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10 space-y-6 max-w-[1700px] mx-auto">
            {/* CLEAN HERO CARD: ONLY INFO (LEFT) & ACTION BUTTON (RIGHT) */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 py-6 px-8 rounded-3xl text-white shadow-xl border border-slate-800/80">
                <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    {/* KIRI: INFO */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="p-3.5 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30 flex-shrink-0">
                            <Wallet className="w-7 h-7" />
                        </div>
                        <div className="space-y-1 min-w-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                                <DollarSign className="w-3 h-3" /> Real-Time Financial Management
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight truncate">
                                Arus Kas & Keuangan Proyek (Cashflow)
                            </h1>
                            <p className="text-slate-300 text-xs truncate max-w-xl font-medium">
                                Monitoring Pemasukan Termyn/MC & Pengeluaran Lapangan Real-time.
                            </p>
                        </div>
                    </div>

                    {/* KANAN: AKSI UTAMA ONLY */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                            onClick={() => setShowModal(true)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-bold text-xs h-11 px-5 shadow-lg shadow-emerald-500/30 border border-emerald-400/30 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Tambah Transaksi Keuangan
                        </Button>
                    </div>
                </div>
            </div>

            {/* DROPDOWN FILTER DI LUAR CARD (BERSIH & TERPISAH) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-500" /> Filter Proyek Sipil:
                    </span>
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">Semua Proyek Sipil</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                        ))}
                    </select>
                </div>
                <span className="text-xs text-slate-400 font-semibold">Total Transaksi: {filteredCashflow.length} Data</span>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pemasukan (Cash In)</span>
                            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                                <ArrowDownLeft className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-3">{formatIDR(totalCashIn)}</h3>
                        <p className="text-xs text-emerald-600 font-semibold mt-1">Termyn / MC / Uang Muka</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pengeluaran (Cash Out)</span>
                            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-3">{formatIDR(totalCashOut)}</h3>
                        <p className="text-xs text-rose-600 font-semibold mt-1">Material, Upah, Alat Berat, K3</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Saldo Kas Net (Cash Balance)</span>
                            <div className={`p-2.5 rounded-xl ${netCashBalance >= 0 ? 'bg-teal-100 text-teal-600' : 'bg-rose-100 text-rose-600'}`}>
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className={`text-2xl font-extrabold mt-3 ${netCashBalance >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
                            {formatIDR(netCashBalance)}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Cash On Hand Proyek</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Margin Keuntungan Real-Time</span>
                            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-indigo-700 mt-3">{profitMargin}%</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Rasio Margin Laba Net</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs & Transactions Table */}
            <Card className="border border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-800">Rincian Transaksi Keuangan Proyek</CardTitle>
                        <CardDescription>Daftar histori pemasukan termyn dan pengeluaran operasional proyek sipil</CardDescription>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setFilterType('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'ALL' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                        >
                            Semua ({cashFlow.length})
                        </button>
                        <button
                            onClick={() => setFilterType('IN')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'IN' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'}`}
                        >
                            Pemasukan (Cash In)
                        </button>
                        <button
                            onClick={() => setFilterType('OUT')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'OUT' ? 'bg-rose-600 text-white shadow' : 'text-slate-500'}`}
                        >
                            Pengeluaran (Cash Out)
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Proyek Sipil</th>
                                <th className="p-4">Tipe</th>
                                <th className="p-4">Kategori Transaksi</th>
                                <th className="p-4">Uraian / Keterangan</th>
                                <th className="p-4 text-right">Jumlah (IDR)</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCashflow.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400">
                                        Tidak ada transaksi keuangan yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredCashflow.map(item => {
                                    const project = projects.find(p => p.id === item.projectId);
                                    const isIncome = item.type === 'IN';

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">{item.date}</td>
                                            <td className="p-4 text-xs font-bold text-slate-800">[{project?.code}] {project?.name}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                    {isIncome ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                                    {isIncome ? 'PEMASUKAN' : 'PENGELUARAN'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium text-slate-700 text-xs">{item.category}</td>
                                            <td className="p-4 text-slate-800 font-medium text-xs max-w-xs">{item.description}</td>
                                            <td className={`p-4 text-right font-extrabold text-sm ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                {isIncome ? '+' : '-'}{formatIDR(item.amount)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">
                                                    {item.status || 'Lunas'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => deleteCashFlow(item.id)}
                                                    className="text-slate-400 hover:text-rose-500 p-1"
                                                    title="Hapus Transaksi"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Modal Input Transaksi Keuangan */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full"
                    >
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-emerald-400" />
                                <h3 className="font-bold text-lg">Tambah Transaksi Keuangan Sipil</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Proyek Sipil</label>
                                <select
                                    value={formData.projectId}
                                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                                    required
                                >
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Jenis Transaksi</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                                    >
                                        <option value="OUT">PENGELUARAN (Cash Out)</option>
                                        <option value="IN">PEMASUKAN (Cash In / Termyn)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Tanggal Transaksi</label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Kategori Transaksi</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                                >
                                    <option value="Pemasukan Termyn / MC">Pemasukan Termyn / MC</option>
                                    <option value="Uang Muka Proyek (DP)">Uang Muka Proyek (DP)</option>
                                    <option value="Pembelian Material">Pembelian Material (Semen, Besi, Ready Mix)</option>
                                    <option value="Gaji Pekerja & Mandor">Gaji Pekerja, Tukang & Mandor</option>
                                    <option value="Sewa Alat Berat & BBM">Sewa Alat Berat & BBM (Excavator, TC, Vibrator)</option>
                                    <option value="Operasional K3 & Direksi Keet">Operasional K3 & Direksi Keet Lapangan</option>
                                    <option value="Pembayaran Subkontraktor">Pembayaran Subkontraktor</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Jumlah Uang (Rupiah) *</label>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="Contoh: 150000000"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Uraian / Keterangan Transaksi *</label>
                                <Input
                                    placeholder="Contoh: Pengadaan Besi Beton D16 200 batang CV Krakatau"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Simpan Transaksi</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
