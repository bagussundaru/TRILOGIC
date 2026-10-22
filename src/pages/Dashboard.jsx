import React from 'react';
import { useCivil } from '@/contexts/CivilContext';
import { motion } from 'framer-motion';
import {
    HardHat, TrendingUp, DollarSign, ClipboardList, Camera,
    ArrowUpRight, ArrowDownLeft, Building2, Calendar, Users,
    Wrench, Wallet, AlertTriangle, CheckCircle2, ChevronRight, Plus,
    ShieldCheck, Sparkles, Layers, FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { projects, dailyLogs, cashFlow, sitePhotos } = useCivil();

    const activeProject = projects[0] || {};
    const totalContractValue = activeProject.contractValue || 2580000000;
    const totalCashIn = cashFlow.filter(c => c.type === 'IN').reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalCashOut = cashFlow.filter(c => c.type === 'OUT').reduce((sum, c) => sum + (c.amount || 0), 0);
    const netCashBalance = totalCashIn - totalCashOut;

    const todayLog = dailyLogs[0] || null;
    const totalWorkersToday = todayLog ? (todayLog.manpower.mandor + todayLog.manpower.tukangBatu + todayLog.manpower.tukangBesi + todayLog.manpower.tukangKayu + todayLog.manpower.pekerja) : 35;

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 space-y-8 max-w-[1700px] mx-auto">
            {/* EXECUTIVE OWNER HERO BANNER */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 p-8 lg:p-10 rounded-3xl text-white shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden border border-slate-800/80">
                <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-3 z-10">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" /> Project Owner Command Center
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Safe Investor Buffer Active (+10%)
                        </span>
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                        {activeProject.name || 'Pembangunan Rumah Kos Eksekutif Tembalang 3 Lantai'}
                    </h1>
                    <p className="text-slate-300 text-sm max-w-3xl leading-relaxed font-medium">
                        Monitoring terpadu khusus Pemilik Proyek (Owner): Kepastian Jadwal Kurva S, Arus Kas Real-time, Biaya Bangun per m², dan Bukti Laporan Harian Fisik Lapangan.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 z-10 flex-shrink-0">
                    <Link to="/construction?module=s-curve">
                        <Button className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white rounded-xl font-bold text-xs h-11 px-5 shadow-lg shadow-orange-500/30">
                            <TrendingUp className="w-4 h-4 mr-2" /> Pantau Kurva S
                        </Button>
                    </Link>
                    <Link to="/cashflow">
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-bold text-xs h-11 px-5 shadow-lg shadow-emerald-500/30">
                            <Wallet className="w-4 h-4 mr-2" /> Laporan Arus Kas
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 4 PRIMARY OWNER METRICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Nilai Investasi (CAPEX Safe)</span>
                            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
                                <Building2 className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-4">{formatIDR(totalContractValue)}</h3>
                        <p className="text-xs text-indigo-600 font-semibold mt-1">Rp 5.500.000 / m² (384 m², 24 Kamar)</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Progres Fisik Lapangan</span>
                            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-emerald-700 mt-4">43.7% Selesai</h3>
                        <p className="text-xs text-emerald-600 font-semibold mt-1">On Schedule (Deviasi 0.0% vs Target)</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pengeluaran Lapangan Realisasi</span>
                            <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-rose-700 mt-4">{formatIDR(totalCashOut)}</h3>
                        <p className="text-xs text-rose-600 font-semibold mt-1">Struktur Bawah & Finishing 6 Kamar</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sisa Saldo Kas Safe Buffer</span>
                            <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl">
                                <Wallet className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-teal-700 mt-4">{formatIDR(netCashBalance)}</h3>
                        <p className="text-xs text-teal-600 font-semibold mt-1">Siap untuk Lanjutan Struktur Lt 2</p>
                    </CardContent>
                </Card>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT 2 COLUMNS: PROJECT SUMMARY & PHASE STATUS */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Status Card */}
                    <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-extrabold text-amber-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 uppercase">
                                    Status Penahapan Proyek
                                </span>
                                <h3 className="text-xl font-bold mt-2 text-white">Ringkasan Eksekutif 3 Fase Pembangunan</h3>
                            </div>
                            <Link to="/construction?module=wbs">
                                <Button variant="outline" className="text-xs border-slate-700 text-white hover:bg-slate-800">
                                    Detail WBS <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Phase Progress Bar */}
                            <div className="space-y-4">
                                <div className="border border-slate-200 p-4 rounded-2xl bg-emerald-50/60 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[10px]">FASE 1</span>
                                            <h4 className="font-bold text-slate-900 text-sm">Struktur Utama & 6 Kamar Aktif Lt 1</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium">CAPEX: Rp 1.150.000.000 (Bobot 43.7%) — Telah Beroperasi 6 Kamar Mandi Dalam</p>
                                    </div>
                                    <span className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">100% SELESAI</span>
                                </div>

                                <div className="border border-slate-200 p-4 rounded-2xl bg-amber-50/60 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded bg-amber-500 text-white font-extrabold text-[10px]">FASE 2</span>
                                            <h4 className="font-bold text-slate-900 text-sm">Struktur & Finishing 9 Kamar Lt 2</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium">CAPEX: Rp 740.000.000 (Bobot 28.7%) — Pekerjaan Stek Kolom D14 (600mm)</p>
                                    </div>
                                    <span className="bg-amber-500 text-white text-xs font-extrabold px-3 py-1 rounded-full">IN PROGRESS</span>
                                </div>

                                <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50 flex items-center justify-between opacity-80">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded bg-slate-400 text-white font-extrabold text-[10px]">FASE 3</span>
                                            <h4 className="font-bold text-slate-800 text-sm">9 Kamar Lt 3, Rooftop & Jemuran</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">CAPEX: Rp 690.000.000 (Bobot 27.6%) — Persiapan Tahun 2027</p>
                                    </div>
                                    <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">RENCANA</span>
                                </div>
                            </div>

                            {/* Technical Specs Checklist */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                                <div className="bg-slate-50 p-3 rounded-xl">
                                    <span className="text-slate-400 font-semibold block">Spesifikasi Beton</span>
                                    <strong className="text-slate-900 font-bold block mt-0.5">Ready Mix K-250 (126.9 m³)</strong>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl">
                                    <span className="text-slate-400 font-semibold block">Spesifikasi Pembesian</span>
                                    <strong className="text-slate-900 font-bold block mt-0.5">Ulir D12 & D14 (12.7 Ton)</strong>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl">
                                    <span className="text-slate-400 font-semibold block">Tipe Pondasi</span>
                                    <strong className="text-slate-900 font-bold block mt-0.5">24 Titik Telapak 160x160cm</strong>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Daily Field Log Summary Card */}
                    <Card className="border border-slate-200 bg-white shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-900">Laporan Harian Lapangan Terakhir</CardTitle>
                                <CardDescription>Catatan cuaca, jumlah tukang, dan aktivitas fisik proyek hari ini</CardDescription>
                            </div>
                            <Link to="/daily-logs">
                                <Button variant="outline" className="text-xs">Lihat Semua Log</Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {todayLog && (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                                        <span className="font-bold text-slate-800">Tanggal: {todayLog.date}</span>
                                        <span className="text-amber-700 font-semibold">Cuaca Pagi/Siang: {todayLog.weather?.morning || 'Cerah'} / {todayLog.weather?.afternoon || 'Berawan'}</span>
                                        <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">{totalWorkersToday} Pekerja Aktif</span>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-800 leading-relaxed font-medium">
                                        <strong className="font-bold text-slate-900 block mb-1">Uraian Fisik Hari Ini:</strong>
                                        {todayLog.workDetails}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT 1 COLUMN: PHOTO GALLERY & QUICK ACTIONS */}
                <div className="space-y-6">
                    {/* Photos Preview Card */}
                    <Card className="border border-slate-200 bg-white shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900">Foto Fisik Proyek Sipil</CardTitle>
                                <CardDescription className="text-xs">Bukti visual lapangan terbaru</CardDescription>
                            </div>
                            <Link to="/photo-gallery">
                                <Button variant="ghost" size="sm" className="text-xs text-rose-600 font-bold">
                                    Galeri Foto <ChevronRight className="w-4 h-4 ml-0.5" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                            {sitePhotos.slice(0, 3).map(photo => (
                                <div key={photo.id} className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200 group">
                                    <img src={photo.url} alt={photo.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                                        <span className="text-xs font-bold text-white truncate">{photo.title}</span>
                                        <span className="text-[10px] text-amber-300 font-semibold">{photo.category}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick Access Submodules for Owner */}
                    <Card className="border border-slate-200 bg-white shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold text-slate-900">Modul Teknik Sipil Utama</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2 text-xs">
                            <Link to="/construction?module=s-curve" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between font-bold text-slate-800 transition-colors">
                                <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-600" /> Kurva S & Progress Fisik</span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </Link>
                            <Link to="/construction?module=boq" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between font-bold text-slate-800 transition-colors">
                                <span className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-emerald-600" /> BOQ & Volume Pekerjaan</span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </Link>
                            <Link to="/construction?module=rab" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between font-bold text-slate-800 transition-colors">
                                <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-indigo-600" /> RAB & Biaya per m²</span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </Link>
                            <Link to="/construction?module=materials" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between font-bold text-slate-800 transition-colors">
                                <span className="flex items-center gap-2"><Wrench className="w-4 h-4 text-green-600" /> Harga Pasar Material Semarang</span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}