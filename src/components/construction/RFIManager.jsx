import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HelpCircle, Plus, X, Send, Check, Clock, MessageSquare,
    AlertTriangle, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE = 'http://103.189.234.15:3001/api';

const STATUS_CONFIG = {
    'Draft': { color: 'bg-slate-100 text-slate-700', icon: Clock },
    'Submitted': { color: 'bg-blue-100 text-blue-700', icon: Send },
    'Under Review': { color: 'bg-purple-100 text-purple-700', icon: MessageSquare },
    'Answered': { color: 'bg-green-100 text-green-700', icon: Check },
    'Closed': { color: 'bg-slate-200 text-slate-600', icon: Check }
};

const PRIORITY_COLORS = {
    'Low': 'bg-slate-100 text-slate-600',
    'Medium': 'bg-blue-100 text-blue-600',
    'High': 'bg-orange-100 text-orange-600',
    'Urgent': 'bg-red-100 text-red-600'
};

export default function RFIManager({ projectId, projectName = 'Project' }) {
    const [rfis, setRfis] = useState([]);
    const [stats, setStats] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedRfi, setSelectedRfi] = useState(null);

    const token = localStorage.getItem('trilogic_token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchRfis = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE}/rfi/project/${projectId}?status=${filter}`, { headers });
            const data = await res.json();
            if (data.success) {
                setRfis(data.data.rfis);
                setStats(data.data.stats);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId, filter]);

    useEffect(() => { fetchRfis(); }, [fetchRfis]);

    const createRfi = async (formData) => {
        try {
            const res = await fetch(`${API_BASE}/rfi`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ project_id: projectId, ...formData })
            });
            if (res.ok) {
                await fetchRfis();
                setShowForm(false);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateStatus = async (rfiId, action, data = {}) => {
        try {
            const res = await fetch(`${API_BASE}/rfi/${rfiId}/${action}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(data)
            });
            if (res.ok) await fetchRfis();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const openCount = rfis.filter(r => !['Answered', 'Closed'].includes(r.status)).length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-blue-600" />
                        RFI Management
                    </h2>
                    <p className="text-sm text-slate-500">{projectName} • {openCount} Open</p>
                </div>

                <div className="flex gap-2">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-36">
                            <Filter className="w-4 h-4 mr-1" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Submitted">Submitted</SelectItem>
                            <SelectItem value="Answered">Answered</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-1" />
                        Buat RFI
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-3">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const stat = stats.find(s => s.status === status);
                    const Icon = config.icon;
                    return (
                        <Card key={status} className="border border-slate-200">
                            <CardContent className="p-3 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${config.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-800">{stat?.count || 0}</p>
                                    <p className="text-xs text-slate-500">{status}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* RFI List */}
            <Card className="border border-slate-200">
                <CardHeader className="py-3 border-b">
                    <CardTitle className="text-sm">Daftar RFI</CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
                        </div>
                    ) : rfis.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <HelpCircle className="w-12 h-12 mx-auto mb-2" />
                            <p>Belum ada RFI</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {rfis.map(rfi => {
                                const statusConfig = STATUS_CONFIG[rfi.status] || STATUS_CONFIG['Draft'];
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div key={rfi.id} className="p-4 hover:bg-slate-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-sm font-medium text-blue-600">{rfi.rfi_number}</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs ${PRIORITY_COLORS[rfi.priority]}`}>
                                                        {rfi.priority}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${statusConfig.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {rfi.status}
                                                    </span>
                                                </div>
                                                <h3 className="font-medium text-slate-800">{rfi.subject}</h3>
                                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{rfi.description}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                                    <span>Kepada: {rfi.submitted_to}</span>
                                                    {rfi.due_date && <span>Due: {new Date(rfi.due_date).toLocaleDateString('id-ID')}</span>}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {rfi.status === 'Draft' && (
                                                    <Button size="sm" onClick={() => updateStatus(rfi.id, 'submit')}>
                                                        <Send className="w-3 h-3 mr-1" />
                                                        Submit
                                                    </Button>
                                                )}
                                                {rfi.status === 'Submitted' && (
                                                    <Button size="sm" variant="outline" onClick={() => setSelectedRfi(rfi)}>
                                                        <MessageSquare className="w-3 h-3 mr-1" />
                                                        Answer
                                                    </Button>
                                                )}
                                                {rfi.status === 'Answered' && (
                                                    <Button size="sm" variant="outline" onClick={() => updateStatus(rfi.id, 'close')}>
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Close
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {rfi.response && (
                                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-xs text-green-600 font-medium mb-1">Response:</p>
                                                <p className="text-sm text-green-800">{rfi.response}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <RFIFormModal onSubmit={createRfi} onClose={() => setShowForm(false)} />
                )}
                {selectedRfi && (
                    <AnswerModal
                        rfi={selectedRfi}
                        onSubmit={(response) => { updateStatus(selectedRfi.id, 'answer', { response }); setSelectedRfi(null); }}
                        onClose={() => setSelectedRfi(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function RFIFormModal({ onSubmit, onClose }) {
    const [form, setForm] = useState({
        subject: '',
        description: '',
        priority: 'Medium',
        submitted_to: 'Konsultan',
        due_date: ''
    });

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <CardTitle>Buat RFI Baru</CardTitle>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium">Subject *</label>
                            <Input value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Judul pertanyaan" />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Deskripsi *</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Jelaskan pertanyaan secara detail..."
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={form.priority} onValueChange={(v) => setForm(p => ({ ...p, priority: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Kepada</label>
                                <Select value={form.submitted_to} onValueChange={(v) => setForm(p => ({ ...p, submitted_to: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Arsitek">Arsitek</SelectItem>
                                        <SelectItem value="Struktur">Struktur</SelectItem>
                                        <SelectItem value="MEP">MEP</SelectItem>
                                        <SelectItem value="Owner">Owner</SelectItem>
                                        <SelectItem value="Konsultan">Konsultan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Due Date</label>
                                <Input type="date" value={form.due_date} onChange={(e) => setForm(p => ({ ...p, due_date: e.target.value }))} />
                            </div>
                        </div>
                    </CardContent>

                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50 rounded-b-2xl">
                        <Button variant="outline" onClick={onClose}>Batal</Button>
                        <Button onClick={() => onSubmit(form)} className="bg-blue-600">Simpan</Button>
                    </div>
                </Card>
            </motion.div>
        </>
    );
}

function AnswerModal({ rfi, onSubmit, onClose }) {
    const [response, setResponse] = useState('');

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b">
                        <CardTitle className="text-sm">Jawab RFI: {rfi.rfi_number}</CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium">{rfi.subject}</p>
                            <p className="text-sm text-slate-600 mt-1">{rfi.description}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Response *</label>
                            <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Tulis jawaban..."
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                rows={4}
                            />
                        </div>
                    </CardContent>

                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50 rounded-b-2xl">
                        <Button variant="outline" onClick={onClose}>Batal</Button>
                        <Button onClick={() => onSubmit(response)} className="bg-green-600">Submit Answer</Button>
                    </div>
                </Card>
            </motion.div>
        </>
    );
}
