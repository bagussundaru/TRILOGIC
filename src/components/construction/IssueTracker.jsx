import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Plus, X, Check, Clock, User,
    Filter, MapPin, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE = 'http://103.189.234.15:3001/api';

const STATUS_CONFIG = {
    'Open': { color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    'In Progress': { color: 'bg-blue-100 text-blue-700', icon: Clock },
    'Resolved': { color: 'bg-green-100 text-green-700', icon: Check },
    'Closed': { color: 'bg-slate-200 text-slate-600', icon: Check }
};

const SEVERITY_COLORS = {
    'Minor': 'border-l-slate-400',
    'Major': 'border-l-orange-500',
    'Critical': 'border-l-red-500'
};

const ISSUE_TYPES = ['Quality', 'Safety', 'Design', 'Material', 'Schedule', 'Other'];

export default function IssueTracker({ projectId, projectName = 'Project' }) {
    const [issues, setIssues] = useState([]);
    const [stats, setStats] = useState([]);
    const [filter, setFilter] = useState('Open');
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);

    const token = localStorage.getItem('trilogic_token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchIssues = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE}/issues/project/${projectId}?status=${filter}`, { headers });
            const data = await res.json();
            if (data.success) {
                setIssues(data.data.issues);
                setStats(data.data.stats);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId, filter]);

    useEffect(() => { fetchIssues(); }, [fetchIssues]);

    const createIssue = async (formData) => {
        try {
            const res = await fetch(`${API_BASE}/issues`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ project_id: projectId, ...formData })
            });
            if (res.ok) {
                await fetchIssues();
                setShowForm(false);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateStatus = async (issueId, status, data = {}) => {
        try {
            const res = await fetch(`${API_BASE}/issues/${issueId}/status`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ status, ...data })
            });
            if (res.ok) await fetchIssues();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const criticalCount = issues.filter(i => i.severity === 'Critical' && i.status === 'Open').length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                        Issue & NCR Tracker
                    </h2>
                    <p className="text-sm text-slate-500">
                        {projectName}
                        {criticalCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                                {criticalCount} Critical Open
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-36">
                            <Filter className="w-4 h-4 mr-1" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="w-4 h-4 mr-1" />
                        Report Issue
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const count = stats.filter(s => s.status === status).reduce((sum, s) => sum + s.count, 0);
                    const Icon = config.icon;
                    return (
                        <Card key={status} className="border border-slate-200">
                            <CardContent className="p-3 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${config.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-800">{count}</p>
                                    <p className="text-xs text-slate-500">{status}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Issue List */}
            <Card className="border border-slate-200">
                <CardHeader className="py-3 border-b">
                    <CardTitle className="text-sm">Daftar Issue</CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full" />
                        </div>
                    ) : issues.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                            <p>Tidak ada issue</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {issues.map(issue => {
                                const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG['Open'];
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div
                                        key={issue.id}
                                        className={`p-4 hover:bg-slate-50 border-l-4 ${SEVERITY_COLORS[issue.severity]}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-sm font-medium text-orange-600">{issue.issue_number}</span>
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                                        {issue.issue_type}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-xs ${issue.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                                            issue.severity === 'Major' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {issue.severity}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${statusConfig.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {issue.status}
                                                    </span>
                                                </div>
                                                <h3 className="font-medium text-slate-800">{issue.title}</h3>
                                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{issue.description}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                                    {issue.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {issue.location}
                                                        </span>
                                                    )}
                                                    {issue.assigned_to_name && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {issue.assigned_to_name}
                                                        </span>
                                                    )}
                                                    {issue.due_date && (
                                                        <span>Due: {new Date(issue.due_date).toLocaleDateString('id-ID')}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {issue.status === 'Open' && (
                                                    <Button size="sm" variant="outline" onClick={() => updateStatus(issue.id, 'In Progress')}>
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Start
                                                    </Button>
                                                )}
                                                {issue.status === 'In Progress' && (
                                                    <Button size="sm" onClick={() => setSelectedIssue(issue)}>
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Resolve
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {issue.corrective_action && (
                                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-xs text-green-600 font-medium mb-1">Corrective Action:</p>
                                                <p className="text-sm text-green-800">{issue.corrective_action}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modals */}
            <AnimatePresence>
                {showForm && (
                    <IssueFormModal onSubmit={createIssue} onClose={() => setShowForm(false)} />
                )}
                {selectedIssue && (
                    <ResolveModal
                        issue={selectedIssue}
                        onSubmit={(data) => { updateStatus(selectedIssue.id, 'Resolved', data); setSelectedIssue(null); }}
                        onClose={() => setSelectedIssue(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function IssueFormModal({ onSubmit, onClose }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        issue_type: 'Quality',
        severity: 'Minor',
        location: '',
        due_date: ''
    });

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b bg-gradient-to-r from-orange-600 to-red-500 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <CardTitle>Report Issue</CardTitle>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium">Judul Issue *</label>
                            <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Deskripsi *</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Tipe</label>
                                <Select value={form.issue_type} onValueChange={(v) => setForm(p => ({ ...p, issue_type: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ISSUE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Severity</label>
                                <Select value={form.severity} onValueChange={(v) => setForm(p => ({ ...p, severity: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Minor">Minor</SelectItem>
                                        <SelectItem value="Major">Major</SelectItem>
                                        <SelectItem value="Critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Due Date</label>
                                <Input type="date" value={form.due_date} onChange={(e) => setForm(p => ({ ...p, due_date: e.target.value }))} />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Lokasi</label>
                            <Input value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Lantai 2, Area Dapur" />
                        </div>
                    </CardContent>

                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50 rounded-b-2xl">
                        <Button variant="outline" onClick={onClose}>Batal</Button>
                        <Button onClick={() => onSubmit(form)} className="bg-orange-600">Submit</Button>
                    </div>
                </Card>
            </motion.div>
        </>
    );
}

function ResolveModal({ issue, onSubmit, onClose }) {
    const [form, setForm] = useState({ root_cause: '', corrective_action: '' });

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b">
                        <CardTitle className="text-sm">Resolve: {issue.issue_number}</CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium">{issue.title}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Root Cause</label>
                            <textarea
                                value={form.root_cause}
                                onChange={(e) => setForm(p => ({ ...p, root_cause: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                rows={2}
                                placeholder="Penyebab utama masalah..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Corrective Action *</label>
                            <textarea
                                value={form.corrective_action}
                                onChange={(e) => setForm(p => ({ ...p, corrective_action: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                rows={3}
                                placeholder="Tindakan perbaikan yang dilakukan..."
                            />
                        </div>
                    </CardContent>

                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50 rounded-b-2xl">
                        <Button variant="outline" onClick={onClose}>Batal</Button>
                        <Button onClick={() => onSubmit(form)} className="bg-green-600">Mark Resolved</Button>
                    </div>
                </Card>
            </motion.div>
        </>
    );
}
