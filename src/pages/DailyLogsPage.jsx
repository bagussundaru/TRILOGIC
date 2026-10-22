import React, { useState } from 'react';
import { useCivil } from '@/contexts/CivilContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, Calendar, CloudSun, Users, Wrench, Package,
    Plus, Trash2, Camera, AlertCircle, Building2, FileText,
    HardHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function DailyLogsPage() {
    const { projects, dailyLogs, addDailyLog, deleteDailyLog } = useCivil();
    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 'all');
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        projectId: projects[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        weatherMorning: 'Cerah',
        weatherAfternoon: 'Cerah',
        weatherEvening: 'Cerah',
        mandor: 2,
        tukangBatu: 6,
        tukangBesi: 8,
        tukangKayu: 4,
        pekerja: 15,
        equipmentText: 'Excavator PC200 (1 Unit, 8 Jam)\nConcrete Vibrator (2 Unit, 5 Jam)',
        materialText: 'Beton Ready Mix K-350 (30 m³)\nBesi Beton D16 (100 Batang)',
        workDetails: '',
        issues: '',
        supervisor: 'Ir. Ahmad Zaelani, ST.',
        photoUrl: '',
        photoTitle: ''
    });

    const filteredLogs = dailyLogs.filter(log =>
        selectedProjectId === 'all' ? true : log.projectId === selectedProjectId
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.projectId || !formData.workDetails) return;

        const newLog = {
            projectId: formData.projectId,
            date: formData.date,
            weather: {
                morning: formData.weatherMorning,
                afternoon: formData.weatherAfternoon,
                evening: formData.weatherEvening
            },
            manpower: {
                mandor: parseInt(formData.mandor) || 0,
                tukangBatu: parseInt(formData.tukangBatu) || 0,
                tukangBesi: parseInt(formData.tukangBesi) || 0,
                tukangKayu: parseInt(formData.tukangKayu) || 0,
                pekerja: parseInt(formData.pekerja) || 0
            },
            equipment: formData.equipmentText.split('\n').filter(Boolean).map(line => ({
                name: line.trim(),
                status: 'Aktif'
            })),
            materials: formData.materialText.split('\n').filter(Boolean).map(line => ({
                name: line.trim(),
                qty: ''
            })),
            workDetails: formData.workDetails,
            issues: formData.issues,
            supervisor: formData.supervisor,
            photos: formData.photoUrl ? [{
                id: `p-${Date.now()}`,
                title: formData.photoTitle || 'Dokumentasi Harian',
                category: 'In Progress',
                url: formData.photoUrl
            }] : []
        };

        addDailyLog(newLog);
        setShowModal(false);
        setFormData({
            projectId: projects[0]?.id || '',
            date: new Date().toISOString().split('T')[0],
            weatherMorning: 'Cerah',
            weatherAfternoon: 'Cerah',
            weatherEvening: 'Cerah',
            mandor: 2,
            tukangBatu: 6,
            tukangBesi: 8,
            tukangKayu: 4,
            pekerja: 15,
            equipmentText: '',
            materialText: '',
            workDetails: '',
            issues: '',
            supervisor: 'Ir. Ahmad Zaelani, ST.',
            photoUrl: '',
            photoTitle: ''
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10 space-y-6 max-w-[1700px] mx-auto">
            {/* CLEAN HERO CARD: ONLY INFO (LEFT) & ACTION BUTTON (RIGHT) */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 py-6 px-8 rounded-3xl text-white shadow-xl border border-slate-800/80">
                <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    {/* KIRI: INFO */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="p-3.5 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl text-white shadow-lg shadow-amber-500/30 flex-shrink-0">
                            <ClipboardList className="w-7 h-7" />
                        </div>
                        <div className="space-y-1 min-w-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                                <HardHat className="w-3 h-3" /> Day-to-Day Operations Log
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight truncate">
                                Laporan Harian Pekerjaan Sipil (Day-to-Day)
                            </h1>
                            <p className="text-slate-300 text-xs truncate max-w-xl font-medium">
                                Catatan detail lapangan: cuaca, tenaga kerja, alat berat, material & progres fisik.
                            </p>
                        </div>
                    </div>

                    {/* KANAN: AKSI UTAMA ONLY */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                            onClick={() => setShowModal(true)}
                            className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-xl font-bold text-xs h-11 px-5 shadow-lg shadow-orange-500/30 border border-amber-400/30 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Input Laporan Harian
                        </Button>
                    </div>
                </div>
            </div>

            {/* DROPDOWN FILTER DI LUAR CARD (BERSIH & TERPISAH) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-amber-500" /> Filter Proyek Sipil:
                    </span>
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="all">Semua Proyek Sipil</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                        ))}
                    </select>
                </div>
                <span className="text-xs text-slate-400 font-semibold">Total Log Terdaftar: {filteredLogs.length} Hari</span>
            </div>

            {/* Daily Logs Timeline */}
            <div className="space-y-6">
                {filteredLogs.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-white rounded-2xl">
                        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-700">Belum Ada Laporan Harian</h3>
                        <p className="text-slate-400 text-sm mt-1">Silakan klik "Input Laporan Harian" untuk menambahkan laporan pekerjaan fisik hari ini.</p>
                    </Card>
                ) : (
                    filteredLogs.map(log => {
                        const project = projects.find(p => p.id === log.projectId);
                        const totalWorkers = (log.manpower.mandor || 0) + (log.manpower.tukangBatu || 0) + (log.manpower.tukangBesi || 0) + (log.manpower.tukangKayu || 0) + (log.manpower.pekerja || 0);

                        return (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                            >
                                {/* Log Top Bar */}
                                <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                                            <Calendar className="w-4 h-4 text-orange-400" />
                                            <span className="font-semibold text-sm">{log.date}</span>
                                        </div>
                                        <span className="text-slate-400 text-sm">|</span>
                                        <span className="font-bold text-amber-400 text-sm">[{project?.code}] {project?.name}</span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-slate-300">
                                        <span>Supervisor: <strong className="text-white">{log.supervisor}</strong></span>
                                        <button
                                            onClick={() => deleteDailyLog(log.id)}
                                            className="text-slate-400 hover:text-rose-400 p-1"
                                            title="Hapus Log"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Log Body */}
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                                    {/* Column 1: Weather & Manpower */}
                                    <div className="space-y-4 lg:col-span-1 border-r border-slate-100 pr-6">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <CloudSun className="w-4 h-4 text-amber-500" /> Cuaca Lapangan
                                            </h4>
                                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                                                    <span className="block text-slate-400">Pagi</span>
                                                    <span className="font-semibold text-amber-800">{log.weather?.morning || '-'}</span>
                                                </div>
                                                <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                                                    <span className="block text-slate-400">Siang</span>
                                                    <span className="font-semibold text-amber-800">{log.weather?.afternoon || '-'}</span>
                                                </div>
                                                <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                                                    <span className="block text-slate-400">Sore</span>
                                                    <span className="font-semibold text-amber-800">{log.weather?.evening || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-blue-500" /> Tenaga Kerja</span>
                                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-extrabold">{totalWorkers} Orang</span>
                                            </h4>
                                            <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                                                <div className="flex justify-between"><span>Mandor:</span> <strong className="text-slate-900">{log.manpower?.mandor || 0} orang</strong></div>
                                                <div className="flex justify-between"><span>Tukang Batu:</span> <strong className="text-slate-900">{log.manpower?.tukangBatu || 0} orang</strong></div>
                                                <div className="flex justify-between"><span>Tukang Besi:</span> <strong className="text-slate-900">{log.manpower?.tukangBesi || 0} orang</strong></div>
                                                <div className="flex justify-between"><span>Tukang Kayu:</span> <strong className="text-slate-900">{log.manpower?.tukangKayu || 0} orang</strong></div>
                                                <div className="flex justify-between"><span>Pekerja / Kuli:</span> <strong className="text-slate-900">{log.manpower?.pekerja || 0} orang</strong></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2 & 3: Work Details, Equipment & Materials */}
                                    <div className="space-y-4 lg:col-span-2">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <FileText className="w-4 h-4 text-emerald-600" /> Uraian Pekerjaan Fisik Hari Ini
                                            </h4>
                                            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-800 leading-relaxed font-medium">
                                                {log.workDetails}
                                            </div>
                                        </div>

                                        {log.issues && (
                                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <strong className="font-bold">Kendala Lapangan:</strong> {log.issues}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <h5 className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                                                    <Wrench className="w-3.5 h-3.5 text-purple-600" /> Alat Berat & Peralatan
                                                </h5>
                                                <ul className="space-y-1 text-xs text-slate-700">
                                                    {log.equipment?.map((eq, idx) => (
                                                        <li key={idx} className="truncate">• {eq.name}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <h5 className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                                                    <Package className="w-3.5 h-3.5 text-teal-600" /> Material Masuk / Dipakai
                                                </h5>
                                                <ul className="space-y-1 text-xs text-slate-700">
                                                    {log.materials?.map((mat, idx) => (
                                                        <li key={idx} className="truncate">• {mat.name} {mat.qty ? `(${mat.qty})` : ''}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 4: Photo Attachments */}
                                    <div className="space-y-3 lg:col-span-1 border-l border-slate-100 pl-6">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Camera className="w-4 h-4 text-rose-500" /> Dokumentasi Pekerjaan
                                        </h4>

                                        {log.photos && log.photos.length > 0 ? (
                                            <div className="space-y-3">
                                                {log.photos.map(photo => (
                                                    <div key={photo.id} className="group relative rounded-xl overflow-hidden shadow-sm border border-slate-200">
                                                        <img src={photo.url} alt={photo.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 flex flex-col justify-end">
                                                            <span className="text-xs font-bold text-white truncate">{photo.title}</span>
                                                            <span className="text-[10px] text-amber-300 font-semibold">{photo.category}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-36 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs">
                                                <Camera className="w-6 h-6 mb-1 opacity-50" />
                                                <span>Tidak ada foto lampiran</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Input Daily Log Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-orange-400" />
                                <h3 className="font-bold text-lg">Input Laporan Harian Pekerjaan Sipil</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
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

                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Tanggal Pekerjaan</label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Weather */}
                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Kondisi Cuaca Lapangan</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Pagi (08:00 - 12:00)</span>
                                        <select
                                            value={formData.weatherMorning}
                                            onChange={(e) => setFormData({ ...formData, weatherMorning: e.target.value })}
                                            className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                                        >
                                            <option value="Cerah">Cerah</option>
                                            <option value="Berawan">Berawan</option>
                                            <option value="Hujan Gerimis">Hujan Gerimis</option>
                                            <option value="Hujan Lebat">Hujan Lebat</option>
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Siang (12:00 - 16:00)</span>
                                        <select
                                            value={formData.weatherAfternoon}
                                            onChange={(e) => setFormData({ ...formData, weatherAfternoon: e.target.value })}
                                            className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                                        >
                                            <option value="Cerah">Cerah</option>
                                            <option value="Berawan">Berawan</option>
                                            <option value="Hujan Gerimis">Hujan Gerimis</option>
                                            <option value="Hujan Lebat">Hujan Lebat</option>
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Sore (16:00 - 18:00)</span>
                                        <select
                                            value={formData.weatherEvening}
                                            onChange={(e) => setFormData({ ...formData, weatherEvening: e.target.value })}
                                            className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                                        >
                                            <option value="Cerah">Cerah</option>
                                            <option value="Berawan">Berawan</option>
                                            <option value="Hujan Gerimis">Hujan Gerimis</option>
                                            <option value="Hujan Lebat">Hujan Lebat</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Manpower */}
                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Jumlah Tenaga Kerja (Orang)</label>
                                <div className="grid grid-cols-5 gap-2">
                                    <div>
                                        <span className="text-[10px] text-slate-500">Mandor</span>
                                        <Input type="number" min="0" value={formData.mandor} onChange={e => setFormData({ ...formData, mandor: e.target.value })} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500">Tukang Batu</span>
                                        <Input type="number" min="0" value={formData.tukangBatu} onChange={e => setFormData({ ...formData, tukangBatu: e.target.value })} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500">Tukang Besi</span>
                                        <Input type="number" min="0" value={formData.tukangBesi} onChange={e => setFormData({ ...formData, tukangBesi: e.target.value })} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500">Tukang Kayu</span>
                                        <Input type="number" min="0" value={formData.tukangKayu} onChange={e => setFormData({ ...formData, tukangKayu: e.target.value })} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500">Pekerja/Kuli</span>
                                        <Input type="number" min="0" value={formData.pekerja} onChange={e => setFormData({ ...formData, pekerja: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Work details */}
                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Uraian Pekerjaan Fisik Hari Ini *</label>
                                <Textarea
                                    rows={3}
                                    value={formData.workDetails}
                                    onChange={e => setFormData({ ...formData, workDetails: e.target.value })}
                                    placeholder="Contoh: Pengecoran kolom lantai 3 as A1-C4 volume 35m³. Perakitan besi pembesian balok..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Alat Berat / Peralatan (1 per baris)</label>
                                    <Textarea
                                        rows={3}
                                        value={formData.equipmentText}
                                        onChange={e => setFormData({ ...formData, equipmentText: e.target.value })}
                                        placeholder="Excavator PC200 (1 Unit, 8 Jam)&#10;Tower Crane (1 Unit)"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Material Masuk / Digunakan (1 per baris)</label>
                                    <Textarea
                                        rows={3}
                                        value={formData.materialText}
                                        onChange={e => setFormData({ ...formData, materialText: e.target.value })}
                                        placeholder="Beton Ready Mix K-350 (45 m³)&#10;Besi D16 (150 Batang)"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Kendala Lapangan / Catatan K3 (Opsional)</label>
                                <Input
                                    value={formData.issues}
                                    onChange={e => setFormData({ ...formData, issues: e.target.value })}
                                    placeholder="Contoh: Hujan jam 14.00-15.30 menunda pemadatan tanah"
                                />
                            </div>

                            {/* Photo Upload */}
                            <div className="border-t border-slate-100 pt-4">
                                <label className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Camera className="w-4 h-4 text-rose-500" /> Lampirkan Foto Lapangan (URL / Image Link)
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Judul Foto (contoh: Pengecoran Kolom Lt 4)"
                                        value={formData.photoTitle}
                                        onChange={e => setFormData({ ...formData, photoTitle: e.target.value })}
                                    />
                                    <Input
                                        placeholder="URL Foto (https://...)"
                                        value={formData.photoUrl}
                                        onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">Simpan Laporan Harian</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
