import React, { useState } from 'react';
import { useCivil } from '@/contexts/CivilContext';
import { motion } from 'framer-motion';
import {
    Camera, Building2, Plus, Trash2, Tag, Calendar, MapPin,
    Filter, Image as ImageIcon, ExternalLink, HardHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function PhotoGalleryPage() {
    const { projects, sitePhotos, addSitePhoto, deleteSitePhoto } = useCivil();
    const [selectedProjectId, setSelectedProjectId] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStage, setSelectedStage] = useState('all');
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        projectId: projects[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        title: '',
        category: 'Struktur Beton',
        stage: 'In Progress',
        location: 'Lantai 1 - Zona Utama',
        description: '',
        url: ''
    });

    const filteredPhotos = sitePhotos.filter(p => {
        const matchProject = selectedProjectId === 'all' ? true : p.projectId === selectedProjectId;
        const matchCategory = selectedCategory === 'all' ? true : p.category === selectedCategory;
        const matchStage = selectedStage === 'all' ? true : p.stage === selectedStage;
        return matchProject && matchCategory && matchStage;
    });

    const categories = ['Struktur Beton', 'Pekerjaan Pembesian', 'Pekerjaan Tanah', 'Pekerjaan Bekisting', 'K3 & Safety'];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.url) return;

        addSitePhoto(formData);
        setShowModal(false);
        setFormData({
            projectId: projects[0]?.id || '',
            date: new Date().toISOString().split('T')[0],
            title: '',
            category: 'Struktur Beton',
            stage: 'In Progress',
            location: 'Lantai 1 - Zona Utama',
            description: '',
            url: ''
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10 space-y-6 max-w-[1700px] mx-auto">
            {/* CLEAN HERO CARD: ONLY INFO (LEFT) & ACTION BUTTON (RIGHT) */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 py-6 px-8 rounded-3xl text-white shadow-xl border border-slate-800/80">
                <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    {/* KIRI: INFO */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="p-3.5 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-2xl text-white shadow-lg shadow-rose-500/30 flex-shrink-0">
                            <Camera className="w-7 h-7" />
                        </div>
                        <div className="space-y-1 min-w-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-extrabold uppercase tracking-wider">
                                <HardHat className="w-3 h-3" /> 360° Site Documentation
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight truncate">
                                Dokumentasi & Foto Pekerjaan Lapangan
                            </h1>
                            <p className="text-slate-300 text-xs truncate max-w-xl font-medium">
                                Galeri foto fisik proyek sipil berdasar tahapan (Before, In Progress, After).
                            </p>
                        </div>
                    </div>

                    {/* KANAN: AKSI UTAMA ONLY */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                            onClick={() => setShowModal(true)}
                            className="bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white rounded-xl font-bold text-xs h-10 px-4 shadow-lg shadow-rose-500/30 border border-rose-400/30 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Upload Foto Pekerjaan
                        </Button>
                    </div>
                </div>
            </div>

            {/* DROPDOWN FILTER DI LUAR CARD (BERSIH & TERPISAH) */}
            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200 items-center justify-between shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-rose-500" /> Proyek:
                        </span>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                            <option value="all">Semua Proyek Sipil</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                            ))}
                        </select>
                    </div>

                    <span className="text-slate-300">|</span>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Kategori:</span>
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            Semua Kategori
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Tahapan:</span>
                    {['all', 'Before', 'In Progress', 'After'].map(stage => (
                        <button
                            key={stage}
                            onClick={() => setSelectedStage(stage)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${selectedStage === stage ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {stage === 'all' ? 'Semua Tahap' : stage}
                        </button>
                    ))}
                </div>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPhotos.length === 0 ? (
                    <div className="col-span-full p-12 text-center border-dashed border-2 border-slate-200 bg-white rounded-2xl">
                        <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-700">Belum Ada Foto Dokumentasi</h3>
                        <p className="text-slate-400 text-sm mt-1">Klik "Upload Foto Pekerjaan" untuk menambahkan foto laporan fisik lapangan.</p>
                    </div>
                ) : (
                    filteredPhotos.map(photo => {
                        const project = projects.find(p => p.id === photo.projectId);

                        return (
                            <motion.div
                                key={photo.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group flex flex-col justify-between"
                            >
                                <div>
                                    {/* Image Container */}
                                    <div className="relative h-56 bg-slate-100 overflow-hidden">
                                        <img
                                            src={photo.url}
                                            alt={photo.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80';
                                            }}
                                        />

                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shadow-md ${photo.stage === 'After' ? 'bg-emerald-600 text-white' : photo.stage === 'In Progress' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}>
                                                {photo.stage}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => deleteSitePhoto(photo.id)}
                                            className="absolute top-3 right-3 p-2 bg-slate-900/70 hover:bg-rose-600 text-white rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Hapus Foto"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-3 pt-6">
                                            <span className="text-xs text-rose-300 font-semibold block">{photo.category}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-2">
                                        <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">{photo.title}</h4>
                                        <p className="text-xs text-slate-500 font-semibold truncate">[{project?.code}] {project?.name}</p>

                                        {photo.location && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                <span className="truncate">{photo.location}</span>
                                            </div>
                                        )}

                                        {photo.description && (
                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1 border-t border-slate-100">
                                                {photo.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {photo.date}</span>
                                    <a href={photo.url} target="_blank" rel="noreferrer" className="text-rose-600 font-semibold flex items-center gap-1 hover:underline">
                                        Lihat HD <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full"
                    >
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-rose-400" />
                                <h3 className="font-bold text-lg">Upload Foto Dokumentasi Pekerjaan</h3>
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

                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Judul Foto / Uraian Singkat *</label>
                                <Input
                                    placeholder="Contoh: Pengecoran Slab Lantai 4 As B2-C5"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Kategori Pekerjaan</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                                    >
                                        {categories.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Tahapan Progres</label>
                                    <select
                                        value={formData.stage}
                                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                                    >
                                        <option value="Before">Before (Sebelum Pekerjaan)</option>
                                        <option value="In Progress">In Progress (Saat Pengerjaan)</option>
                                        <option value="After">After (Setelah Selesai)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Lokasi Spasial / Grid / Lantai</label>
                                    <Input
                                        placeholder="Contoh: Lantai 4 As B2-C5"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Tanggal Foto</label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">URL Link Foto / Gambar *</label>
                                <Input
                                    placeholder="https://..."
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Catatan / Detail Teknis (Opsional)</label>
                                <Textarea
                                    rows={2}
                                    placeholder="Deskripsi teknis material, metode pengerjaan, dsb."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
                                <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">Simpan Foto Pekerjaan</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
