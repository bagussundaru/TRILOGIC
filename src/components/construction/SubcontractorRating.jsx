import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Plus, X, Star, Award, TrendingUp, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE = 'http://103.189.234.15:3001/api';

const SPECIALIZATIONS = [
    'Struktur', 'Arsitektur', 'MEP Elektrikal', 'MEP Plumbing',
    'MEP HVAC', 'Landscape', 'Interior', 'Lainnya'
];

export default function SubcontractorRating({ projectId, projectName = 'Project' }) {
    const [subcontractors, setSubcontractors] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(null); // 'subcon' or 'assign' or 'rate'
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const token = localStorage.getItem('trilogic_token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [subRes, assRes] = await Promise.all([
                fetch(`${API_BASE}/subcontractors`, { headers }),
                fetch(`${API_BASE}/subcontractors/project/${projectId}/assignments`, { headers })
            ]);

            const [subData, assData] = await Promise.all([subRes.json(), assRes.json()]);

            if (subData.success) setSubcontractors(subData.data);
            if (assData.success) setAssignments(assData.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const createSubcon = async (formData) => {
        try {
            const res = await fetch(`${API_BASE}/subcontractors`, {
                method: 'POST',
                headers,
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                await fetchData();
                setShowForm(null);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const createAssignment = async (formData) => {
        try {
            const res = await fetch(`${API_BASE}/subcontractors/assignments`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ project_id: projectId, ...formData })
            });
            if (res.ok) {
                await fetchData();
                setShowForm(null);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const submitRating = async (assignmentId, formData) => {
        try {
            const res = await fetch(`${API_BASE}/subcontractors/assignments/${assignmentId}/rate`, {
                method: 'POST',
                headers,
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                await fetchData();
                setSelectedAssignment(null);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
            />
        ));
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-teal-600" />
                        Subcontractor Performance
                    </h2>
                    <p className="text-sm text-slate-500">{projectName}</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowForm('subcon')}>
                        <Building className="w-4 h-4 mr-1" />
                        Tambah Subkon
                    </Button>
                    <Button onClick={() => setShowForm('assign')} className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="w-4 h-4 mr-1" />
                        Assign ke Proyek
                    </Button>
                </div>
            </div>

            {/* Active Assignments */}
            <Card className="border border-slate-200">
                <CardHeader className="py-3 border-b">
                    <CardTitle className="text-sm">Subkon Aktif di Proyek Ini</CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full" />
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-2" />
                            <p>Belum ada subkon di proyek ini</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {assignments.map(ass => (
                                <div key={ass.id} className="p-4 hover:bg-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                                {ass.subcon_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-800">{ass.subcon_name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-xs">
                                                        {ass.specialization}
                                                    </span>
                                                    {ass.wbs_code && (
                                                        <span className="text-xs text-slate-500">WBS: {ass.wbs_code}</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{ass.scope_description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1">
                                                    {renderStars(Math.round(ass.project_rating || ass.overall_rating || 0))}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {(ass.project_rating || ass.overall_rating || 0).toFixed(1)} / 5.0
                                                </p>
                                            </div>

                                            <Button size="sm" onClick={() => setSelectedAssignment(ass)}>
                                                <Award className="w-3 h-3 mr-1" />
                                                Rate
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="border border-slate-200">
                <CardHeader className="py-3 border-b">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Top Performers (Semua Proyek)
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-3">
                        {subcontractors.filter(s => s.overall_rating >= 4).slice(0, 4).map((s, i) => (
                            <div key={s.id} className="p-3 bg-gradient-to-br from-slate-50 to-white border rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    {i === 0 && <span className="text-2xl">🥇</span>}
                                    {i === 1 && <span className="text-2xl">🥈</span>}
                                    {i === 2 && <span className="text-2xl">🥉</span>}
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                                        {s.name?.charAt(0)}
                                    </div>
                                </div>
                                <p className="font-medium text-sm text-slate-800 truncate">{s.name}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    {renderStars(Math.round(s.overall_rating))}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{s.total_projects} proyek</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            <AnimatePresence>
                {showForm === 'subcon' && (
                    <SubconFormModal onSubmit={createSubcon} onClose={() => setShowForm(null)} />
                )}
                {showForm === 'assign' && (
                    <AssignFormModal
                        subcontractors={subcontractors}
                        onSubmit={createAssignment}
                        onClose={() => setShowForm(null)}
                    />
                )}
                {selectedAssignment && (
                    <RatingModal
                        assignment={selectedAssignment}
                        onSubmit={(data) => submitRating(selectedAssignment.id, data)}
                        onClose={() => setSelectedAssignment(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function SubconFormModal({ onSubmit, onClose }) {
    const [form, setForm] = useState({
        name: '',
        company_name: '',
        contact_person: '',
        phone: '',
        specialization: 'Lainnya'
    });

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <CardTitle>Tambah Subkon Baru</CardTitle>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium">Nama Subkon *</label>
                            <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Nama Perusahaan</label>
                            <Input value={form.company_name} onChange={(e) => setForm(p => ({ ...p, company_name: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Contact Person</label>
                                <Input value={form.contact_person} onChange={(e) => setForm(p => ({ ...p, contact_person: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Telepon</label>
                                <Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Spesialisasi</label>
                            <Select value={form.specialization} onValueChange={(v) => setForm(p => ({ ...p, specialization: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>

                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50 rounded-b-2xl">
                        <Button variant="outline" onClick={onClose}>Batal</Button>
                        <Button onClick={() => onSubmit(form)} className="bg-teal-600">Simpan</Button>
                    </div>
                </Card>
            </motion.div>
        </>
    );
}

function AssignFormModal({ subcontractors, onSubmit, onClose }) {
    const [form, setForm] = useState({
        subcontractor_id: '',
        scope_description: '',
        contract_value: 0,
        start_date: '',
        end_date: ''
    });

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b">
                        <CardTitle className="text-sm">Assign Subkon ke Proyek</CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium">Pilih Subkon *</label>
                            <Select value={form.subcontractor_id} onValueChange={(v) => setForm(p => ({ ...p, subcontractor_id: v }))}>
                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                <SelectContent>
                                    {subcontractors.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name} - {s.specialization}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Scope Pekerjaan</label>
                            <Input value={form.scope_description} onChange={(e) => setForm(p => ({ ...p, scope_description: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Nilai Kontrak</label>
                            <Input type="number" value={form.contract_value} onChange={(e) => setForm(p => ({ ...p, contract_value: parseFloat(e.target.value) || 0 }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Mulai</label>
                                <Input type="date" value={form.start_date} onChange={(e) => setForm(p => ({ ...p, start_date: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Selesai</label>
                                <Input type="date" value={form.end_date} onChange={(e) => setForm(p => ({ ...p, end_date: e.target.value }))} />
                            </div>
                        </div>
                    </CardContent>

                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50 rounded-b-2xl">
                        <Button variant="outline" onClick={onClose}>Batal</Button>
                        <Button onClick={() => onSubmit(form)} className="bg-teal-600">Assign</Button>
                    </div>
                </Card>
            </motion.div>
        </>
    );
}

function RatingModal({ assignment, onSubmit, onClose }) {
    const [form, setForm] = useState({
        quality_score: 0,
        schedule_score: 0,
        safety_score: 0,
        cooperation_score: 0,
        comments: ''
    });

    const criteria = [
        { key: 'quality_score', label: 'Kualitas Kerja' },
        { key: 'schedule_score', label: 'Ketepatan Waktu' },
        { key: 'safety_score', label: 'Keselamatan Kerja' },
        { key: 'cooperation_score', label: 'Kerjasama/Komunikasi' }
    ];

    const overall = (form.quality_score + form.schedule_score + form.safety_score + form.cooperation_score) / 4;

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-2xl">
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Rate: {assignment.subcon_name}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        {criteria.map(c => (
                            <div key={c.key}>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-sm font-medium">{c.label}</label>
                                    <span className="text-sm text-slate-500">{form[c.key]}/5</span>
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setForm(p => ({ ...p, [c.key]: n }))}
                                            className="flex-1"
                                        >
                                            <Star className={`w-8 h-8 mx-auto ${n <= form[c.key] ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="p-3 bg-slate-50 rounded-lg text-center">
                            <p className="text-sm text-slate-500">Overall Score</p>
                            <p className="text-2xl font-bold text-slate-800">{overall.toFixed(1)}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Komentar</label>
                            <textarea
                                value={form.comments}
                                onChange={(e) => setForm(p => ({ ...p, comments: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                rows={2}
                            />
                        </div>
                    </CardContent>

                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50 rounded-b-2xl">
                        <Button variant="outline" onClick={onClose}>Batal</Button>
                        <Button onClick={() => onSubmit(form)} className="bg-yellow-500 hover:bg-yellow-600">Submit Rating</Button>
                    </div>
                </Card>
            </motion.div>
        </>
    );
}
