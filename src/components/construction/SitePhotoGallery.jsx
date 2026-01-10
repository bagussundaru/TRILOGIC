import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Image, Upload, Filter, X, Calendar, MapPin,
    Tag, Maximize2, ChevronLeft, ChevronRight, Trash2,
    Folder, FileImage, Grid, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

const API_BASE_URL = 'http://103.189.234.15:3001/api';

// Photo type options
const PHOTO_TYPES = [
    { value: 'Progress', label: 'Progress', color: 'bg-blue-100 text-blue-700' },
    { value: 'Before', label: 'Before', color: 'bg-slate-100 text-slate-700' },
    { value: 'After', label: 'After', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'Issue', label: 'Issue', color: 'bg-red-100 text-red-700' },
    { value: 'Inspection', label: 'Inspection', color: 'bg-purple-100 text-purple-700' },
    { value: 'Drone', label: 'Drone', color: 'bg-cyan-100 text-cyan-700' },
    { value: 'Other', label: 'Lainnya', color: 'bg-gray-100 text-gray-700' }
];

export default function SitePhotoGallery({ projectId, projectName = 'Project' }) {
    const [photos, setPhotos] = useState([]);
    const [typeCounts, setTypeCounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Fetch photos
    const fetchPhotos = useCallback(async () => {
        if (!projectId) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem('trilogic_token');

            const response = await fetch(
                `${API_BASE_URL}/site-photos/project/${projectId}?type=${filterType}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const data = await response.json();

            if (data.success) {
                setPhotos(data.data.photos);
                setTypeCounts(data.data.typeCounts);
            }
        } catch (error) {
            console.error('Error fetching photos:', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId, filterType]);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    // Delete photo
    const handleDelete = async (photoId) => {
        if (!confirm('Hapus foto ini?')) return;

        try {
            const token = localStorage.getItem('trilogic_token');

            await fetch(`${API_BASE_URL}/site-photos/${photoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            await fetchPhotos();
            if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
        } catch (error) {
            console.error('Error deleting photo:', error);
        }
    };

    // Navigate lightbox
    const navigatePhoto = (direction) => {
        const currentIndex = photos.findIndex(p => p.id === selectedPhoto?.id);
        const newIndex = direction === 'next'
            ? (currentIndex + 1) % photos.length
            : (currentIndex - 1 + photos.length) % photos.length;
        setSelectedPhoto(photos[newIndex]);
    };

    const totalPhotos = typeCounts.reduce((sum, t) => sum + t.count, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Camera className="w-6 h-6 text-purple-600" />
                        Galeri Foto Proyek
                    </h2>
                    <p className="text-sm text-slate-500">{projectName} • {totalPhotos} foto</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="w-4 h-4" />
                    </Button>

                    <Button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 rounded-lg ml-2"
                    >
                        <Upload className="w-4 h-4 mr-1" />
                        Upload Foto
                    </Button>
                </div>
            </div>

            {/* Type Filter Pills */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterType === 'all'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    Semua ({totalPhotos})
                </button>

                {PHOTO_TYPES.map(type => {
                    const count = typeCounts.find(t => t.photo_type === type.value)?.count || 0;
                    return (
                        <button
                            key={type.value}
                            onClick={() => setFilterType(type.value)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterType === type.value
                                    ? 'bg-purple-600 text-white'
                                    : `${type.color} hover:opacity-80`
                                }`}
                        >
                            {type.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Photo Grid/List */}
            <Card className="border border-slate-200">
                <CardContent className="p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-60">
                            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full" />
                        </div>
                    ) : photos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-slate-400">
                            <Camera className="w-16 h-16 mb-4" />
                            <p>Belum ada foto</p>
                            <Button
                                variant="link"
                                onClick={() => setShowUploadModal(true)}
                                className="text-purple-600"
                            >
                                Upload foto pertama
                            </Button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-4 gap-4">
                            {photos.map((photo, index) => {
                                const typeConfig = PHOTO_TYPES.find(t => t.value === photo.photo_type) || PHOTO_TYPES[6];

                                return (
                                    <motion.div
                                        key={photo.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-slate-100"
                                        onClick={() => setSelectedPhoto(photo)}
                                    >
                                        {photo.photo_url ? (
                                            <img
                                                src={photo.thumbnail_url || photo.photo_url}
                                                alt={photo.caption || 'Site photo'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FileImage className="w-12 h-12 text-slate-300" />
                                            </div>
                                        )}

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                                <p className="text-white text-sm font-medium truncate">
                                                    {photo.caption || 'No caption'}
                                                </p>
                                                <p className="text-white/70 text-xs">
                                                    {new Date(photo.taken_date).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Type Badge */}
                                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium ${typeConfig.color}`}>
                                            {typeConfig.label}
                                        </span>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        // List View
                        <div className="divide-y divide-slate-100">
                            {photos.map((photo) => {
                                const typeConfig = PHOTO_TYPES.find(t => t.value === photo.photo_type) || PHOTO_TYPES[6];

                                return (
                                    <div
                                        key={photo.id}
                                        className="flex items-center gap-4 p-3 hover:bg-slate-50 cursor-pointer"
                                        onClick={() => setSelectedPhoto(photo)}
                                    >
                                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                            {photo.photo_url ? (
                                                <img
                                                    src={photo.thumbnail_url || photo.photo_url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FileImage className="w-8 h-8 text-slate-300" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-800 truncate">
                                                {photo.caption || 'No caption'}
                                            </p>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(photo.taken_date).toLocaleDateString('id-ID')}
                                                </span>
                                                {photo.location_tag && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {photo.location_tag}
                                                    </span>
                                                )}
                                                {photo.wbs_code && (
                                                    <span className="flex items-center gap-1">
                                                        <Folder className="w-3 h-3" />
                                                        {photo.wbs_code}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <span className={`px-2 py-1 rounded text-xs font-medium ${typeConfig.color}`}>
                                            {typeConfig.label}
                                        </span>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); navigatePhoto('prev'); }}
                            className="absolute left-4 p-2 text-white/70 hover:text-white"
                        >
                            <ChevronLeft className="w-10 h-10" />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); navigatePhoto('next'); }}
                            className="absolute right-4 p-2 text-white/70 hover:text-white"
                        >
                            <ChevronRight className="w-10 h-10" />
                        </button>

                        <div className="max-w-5xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
                            <img
                                src={selectedPhoto.photo_url}
                                alt={selectedPhoto.caption}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                            />

                            <div className="mt-4 text-white text-center">
                                <p className="text-lg font-medium">{selectedPhoto.caption || 'No caption'}</p>
                                <div className="flex items-center justify-center gap-4 mt-2 text-white/70 text-sm">
                                    <span>{new Date(selectedPhoto.taken_date).toLocaleDateString('id-ID', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                    })}</span>
                                    {selectedPhoto.location_tag && <span>📍 {selectedPhoto.location_tag}</span>}
                                    {selectedPhoto.wbs_code && <span>📁 {selectedPhoto.wbs_code}</span>}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <UploadPhotoModal
                        projectId={projectId}
                        onSuccess={() => { setShowUploadModal(false); fetchPhotos(); }}
                        onClose={() => setShowUploadModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Upload Modal
function UploadPhotoModal({ projectId, onSuccess, onClose }) {
    const [formData, setFormData] = useState({
        photo_url: '',
        caption: '',
        photo_type: 'Progress',
        taken_date: new Date().toISOString().split('T')[0],
        location_tag: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('trilogic_token');

            const response = await fetch(`${API_BASE_URL}/site-photos`, {
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

            if (response.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
        } finally {
            setIsSubmitting(false);
        }
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
                <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="w-5 h-5" />
                                Upload Foto
                            </CardTitle>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">URL Foto *</label>
                                <Input
                                    value={formData.photo_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
                                    placeholder="https://example.com/photo.jpg"
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Caption</label>
                                <Input
                                    value={formData.caption}
                                    onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                                    placeholder="Deskripsi foto..."
                                    className="mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Tipe Foto</label>
                                    <Select
                                        value={formData.photo_type}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, photo_type: value }))}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PHOTO_TYPES.map(t => (
                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Tanggal</label>
                                    <Input
                                        type="date"
                                        value={formData.taken_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, taken_date: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Lokasi</label>
                                <Input
                                    value={formData.location_tag}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location_tag: e.target.value }))}
                                    placeholder="e.g., Lantai 2, Area Dapur"
                                    className="mt-1"
                                />
                            </div>
                        </CardContent>

                        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                                {isSubmitting ? 'Menyimpan...' : 'Upload'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </>
    );
}
