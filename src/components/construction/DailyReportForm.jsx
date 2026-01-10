import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Cloud, Sun, CloudRain, CloudLightning,
    Users, Truck, Camera, Save, X, Plus, Trash2,
    Clock, FileText, Upload, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

const API_BASE_URL = 'http://103.189.234.15:3001/api';

// Weather icons
const WEATHER_OPTIONS = [
    { value: 'Cerah', icon: Sun, color: 'text-yellow-500' },
    { value: 'Berawan', icon: Cloud, color: 'text-gray-500' },
    { value: 'Hujan Ringan', icon: CloudRain, color: 'text-blue-400' },
    { value: 'Hujan Lebat', icon: CloudRain, color: 'text-blue-600' },
    { value: 'Badai', icon: CloudLightning, color: 'text-purple-600' }
];

// Worker types
const WORKER_TYPES = [
    'Mandor', 'Tukang Batu', 'Tukang Besi', 'Tukang Kayu',
    'Tukang Cat', 'Tukang Listrik', 'Tukang Pipa',
    'Pekerja', 'Operator Alat', 'Surveyor'
];

// Equipment types
const EQUIPMENT_TYPES = [
    'Excavator', 'Backhoe', 'Dump Truck', 'Mixer Truck',
    'Crane', 'Scaffolding', 'Concrete Pump', 'Vibrator',
    'Bar Bender', 'Bar Cutter', 'Theodolite', 'Genset'
];

export default function DailyReportForm({ projectId, projectName = 'Project', onClose, onSuccess }) {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        report_date: today,
        weather: 'Cerah',
        work_start_time: '08:00',
        work_end_time: '17:00',
        workers_detail: [
            { type: 'Mandor', count: 1 },
            { type: 'Tukang Batu', count: 0 },
            { type: 'Pekerja', count: 0 }
        ],
        equipment_onsite: [
            { name: 'Mixer Truck', qty: 0, status: 'Standby' }
        ],
        work_description: '',
        issues_encountered: '',
        site_engineer: '',
        project_manager: '',
        consultant_engineer: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate total workers
    const totalWorkers = formData.workers_detail.reduce((sum, w) => sum + (w.count || 0), 0);

    // Add worker type
    const addWorkerType = () => {
        setFormData(prev => ({
            ...prev,
            workers_detail: [...prev.workers_detail, { type: 'Pekerja', count: 0 }]
        }));
    };

    // Remove worker type
    const removeWorkerType = (index) => {
        setFormData(prev => ({
            ...prev,
            workers_detail: prev.workers_detail.filter((_, i) => i !== index)
        }));
    };

    // Update worker
    const updateWorker = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            workers_detail: prev.workers_detail.map((w, i) =>
                i === index ? { ...w, [field]: field === 'count' ? parseInt(value) || 0 : value } : w
            )
        }));
    };

    // Add equipment
    const addEquipment = () => {
        setFormData(prev => ({
            ...prev,
            equipment_onsite: [...prev.equipment_onsite, { name: 'Excavator', qty: 1, status: 'Operating' }]
        }));
    };

    // Remove equipment
    const removeEquipment = (index) => {
        setFormData(prev => ({
            ...prev,
            equipment_onsite: prev.equipment_onsite.filter((_, i) => i !== index)
        }));
    };

    // Update equipment
    const updateEquipment = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            equipment_onsite: prev.equipment_onsite.map((e, i) =>
                i === index ? { ...e, [field]: field === 'qty' ? parseInt(value) || 0 : value } : e
            )
        }));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('trilogic_token');

            const response = await fetch(`${API_BASE_URL}/daily-reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    project_id: projectId,
                    ...formData,
                    total_workers: totalWorkers,
                    workers_detail: JSON.stringify(formData.workers_detail),
                    equipment_onsite: JSON.stringify(formData.equipment_onsite)
                })
            });

            const data = await response.json();

            if (data.success) {
                onSuccess?.();
                onClose?.();
            } else {
                alert('Gagal menyimpan: ' + data.error);
            }
        } catch (error) {
            console.error('Error submitting daily report:', error);
            alert('Terjadi kesalahan saat menyimpan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const WeatherIcon = WEATHER_OPTIONS.find(w => w.value === formData.weather)?.icon || Sun;

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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed inset-4 flex items-start justify-center z-50 overflow-auto py-8"
            >
                <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Laporan Harian Proyek
                            </CardTitle>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <p className="text-sm text-orange-100 mt-1">{projectName}</p>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Date & Weather */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Tanggal
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.report_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, report_date: e.target.value }))}
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                        <WeatherIcon className={`w-4 h-4 ${WEATHER_OPTIONS.find(w => w.value === formData.weather)?.color}`} />
                                        Cuaca
                                    </label>
                                    <Select
                                        value={formData.weather}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, weather: value }))}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {WEATHER_OPTIONS.map(w => (
                                                <SelectItem key={w.value} value={w.value}>
                                                    <span className="flex items-center gap-2">
                                                        <w.icon className={`w-4 h-4 ${w.color}`} />
                                                        {w.value}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            Mulai
                                        </label>
                                        <Input
                                            type="time"
                                            value={formData.work_start_time}
                                            onChange={(e) => setFormData(prev => ({ ...prev, work_start_time: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Selesai</label>
                                        <Input
                                            type="time"
                                            value={formData.work_end_time}
                                            onChange={(e) => setFormData(prev => ({ ...prev, work_end_time: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Workers Section */}
                            <div className="p-4 bg-blue-50 rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-slate-700 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        Tenaga Kerja
                                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                            Total: {totalWorkers} orang
                                        </span>
                                    </h3>
                                    <Button type="button" size="sm" variant="outline" onClick={addWorkerType}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Tambah
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {formData.workers_detail.map((worker, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Select
                                                value={worker.type}
                                                onValueChange={(value) => updateWorker(index, 'type', value)}
                                            >
                                                <SelectTrigger className="flex-1 bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {WORKER_TYPES.map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={worker.count}
                                                onChange={(e) => updateWorker(index, 'count', e.target.value)}
                                                className="w-20 bg-white"
                                                placeholder="Jml"
                                            />
                                            <span className="text-sm text-slate-500">orang</span>
                                            {formData.workers_detail.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeWorkerType(index)}
                                                    className="text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Equipment Section */}
                            <div className="p-4 bg-amber-50 rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-slate-700 flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-amber-600" />
                                        Peralatan di Lokasi
                                    </h3>
                                    <Button type="button" size="sm" variant="outline" onClick={addEquipment}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Tambah
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {formData.equipment_onsite.map((equip, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Select
                                                value={equip.name}
                                                onValueChange={(value) => updateEquipment(index, 'name', value)}
                                            >
                                                <SelectTrigger className="flex-1 bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EQUIPMENT_TYPES.map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={equip.qty}
                                                onChange={(e) => updateEquipment(index, 'qty', e.target.value)}
                                                className="w-16 bg-white"
                                                placeholder="Qty"
                                            />
                                            <Select
                                                value={equip.status}
                                                onValueChange={(value) => updateEquipment(index, 'status', value)}
                                            >
                                                <SelectTrigger className="w-28 bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Operating">Operating</SelectItem>
                                                    <SelectItem value="Standby">Standby</SelectItem>
                                                    <SelectItem value="Breakdown">Breakdown</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeEquipment(index)}
                                                className="text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Work Description */}
                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Pekerjaan Hari Ini *
                                </label>
                                <textarea
                                    value={formData.work_description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, work_description: e.target.value }))}
                                    placeholder="Jelaskan pekerjaan yang dilakukan hari ini..."
                                    required
                                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                    rows={4}
                                />
                            </div>

                            {/* Issues */}
                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Kendala / Masalah
                                </label>
                                <textarea
                                    value={formData.issues_encountered}
                                    onChange={(e) => setFormData(prev => ({ ...prev, issues_encountered: e.target.value }))}
                                    placeholder="Kendala yang dihadapi (opsional)..."
                                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                    rows={2}
                                />
                            </div>

                            {/* Signatures */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Site Engineer</label>
                                    <Input
                                        value={formData.site_engineer}
                                        onChange={(e) => setFormData(prev => ({ ...prev, site_engineer: e.target.value }))}
                                        placeholder="Nama SE"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Project Manager</label>
                                    <Input
                                        value={formData.project_manager}
                                        onChange={(e) => setFormData(prev => ({ ...prev, project_manager: e.target.value }))}
                                        placeholder="Nama PM"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Konsultan</label>
                                    <Input
                                        value={formData.consultant_engineer}
                                        onChange={(e) => setFormData(prev => ({ ...prev, consultant_engineer: e.target.value }))}
                                        placeholder="Nama Konsultan"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-orange-600 hover:bg-orange-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-1" />
                                        Simpan Laporan
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </>
    );
}
