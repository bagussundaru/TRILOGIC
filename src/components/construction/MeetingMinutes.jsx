import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Plus, X, Check, Clock, Users, FileText,
    ChevronDown, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE = 'http://103.189.234.15:3001/api';

const MEETING_TYPES = [
    'Kick-off', 'Progress Weekly', 'Progress Monthly', 'Site',
    'Technical', 'Coordination', 'Handover', 'Other'
];

export default function MeetingMinutes({ projectId, projectName = 'Project' }) {
    const [meetings, setMeetings] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    const token = localStorage.getItem('trilogic_token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchMeetings = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE}/meetings/project/${projectId}`, { headers });
            const data = await res.json();
            if (data.success) setMeetings(data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

    const createMeeting = async (formData) => {
        try {
            const res = await fetch(`${API_BASE}/meetings`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ project_id: projectId, ...formData })
            });
            if (res.ok) {
                await fetchMeetings();
                setShowForm(false);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateMeeting = async (id, data) => {
        try {
            const res = await fetch(`${API_BASE}/meetings/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data)
            });
            if (res.ok) await fetchMeetings();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const addActionItem = async (meetingId, data) => {
        try {
            const res = await fetch(`${API_BASE}/meetings/${meetingId}/actions`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            });
            if (res.ok) await fetchMeetings();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-purple-600" />
                        Meeting Minutes
                    </h2>
                    <p className="text-sm text-slate-500">{projectName}</p>
                </div>

                <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Jadwalkan Meeting
                </Button>
            </div>

            {/* Meeting List */}
            <Card className="border border-slate-200">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full" />
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Calendar className="w-12 h-12 mx-auto mb-2" />
                            <p>Belum ada meeting</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {meetings.map(meeting => (
                                <div key={meeting.id} className="p-4">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => setExpandedId(expandedId === meeting.id ? null : meeting.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {expandedId === meeting.id ?
                                                <ChevronDown className="w-5 h-5 text-slate-400" /> :
                                                <ChevronRight className="w-5 h-5 text-slate-400" />
                                            }
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                                        {meeting.meeting_type} #{meeting.meeting_number}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-xs ${meeting.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                            meeting.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {meeting.status}
                                                    </span>
                                                </div>
                                                <h3 className="font-medium text-slate-800 mt-1">{meeting.title}</h3>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(meeting.meeting_date).toLocaleDateString('id-ID', {
                                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                    {meeting.start_time && ` • ${meeting.start_time}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-slate-700">
                                                    {meeting.completed_count || 0}/{meeting.action_count || 0}
                                                </p>
                                                <p className="text-xs text-slate-400">Action Items</p>
                                            </div>

                                            {meeting.status === 'Scheduled' && (
                                                <Button size="sm" onClick={(e) => { e.stopPropagation(); setSelectedMeeting(meeting); }}>
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    Isi Notulen
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedId === meeting.id && (
                                            <MeetingDetail
                                                meeting={meeting}
                                                headers={headers}
                                                onAddAction={(data) => addActionItem(meeting.id, data)}
                                                onRefresh={fetchMeetings}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modals */}
            <AnimatePresence>
                {showForm && (
                    <MeetingFormModal onSubmit={createMeeting} onClose={() => setShowForm(false)} />
                )}
                {selectedMeeting && (
                    <MinutesModal
                        meeting={selectedMeeting}
                        onSubmit={(data) => { updateMeeting(selectedMeeting.id, { ...data, status: 'Completed' }); setSelectedMeeting(null); }}
                        onClose={() => setSelectedMeeting(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function MeetingDetail({ meeting, headers, onAddAction, onRefresh }) {
    const [details, setDetails] = useState(null);
    const [showActionForm, setShowActionForm] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            const res = await fetch(`${API_BASE}/meetings/${meeting.id}`, { headers });
            const data = await res.json();
            if (data.success) setDetails(data.data);
        };
        fetchDetails();
    }, [meeting.id]);

    const updateActionStatus = async (actionId, status) => {
        await fetch(`${API_BASE}/meetings/actions/${actionId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status })
        });
        onRefresh();
    };

    if (!details) return <div className="p-4 text-center text-slate-400">Loading...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pl-8 space-y-4"
        >
            {details.meeting.minutes && (
                <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 font-medium mb-1">Notulen:</p>
                    <p className="text-sm text-slate-700 whitespace-pre-line">{details.meeting.minutes}</p>
                </div>
            )}

            {details.meeting.decisions && (
                <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium mb-1">Keputusan:</p>
                    <p className="text-sm text-purple-800 whitespace-pre-line">{details.meeting.decisions}</p>
                </div>
            )}

            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">Action Items</p>
                    <Button size="sm" variant="outline" onClick={() => setShowActionForm(!showActionForm)}>
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                    </Button>
                </div>

                {showActionForm && (
                    <ActionItemForm onSubmit={(data) => { onAddAction(data); setShowActionForm(false); }} />
                )}

                <div className="space-y-2">
                    {details.actionItems.map(action => (
                        <div key={action.id} className="flex items-center justify-between p-2 bg-white border rounded">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateActionStatus(action.id, action.status === 'Completed' ? 'Open' : 'Completed')}
                                    className={`w-5 h-5 rounded border flex items-center justify-center ${action.status === 'Completed' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'
                                        }`}
                                >
                                    {action.status === 'Completed' && <Check className="w-3 h-3" />}
                                </button>
                                <div>
                                    <p className={`text-sm ${action.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                        {action.description}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {action.assigned_to_name || 'Unassigned'}
                                        {action.due_date && ` • Due: ${new Date(action.due_date).toLocaleDateString('id-ID')}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function ActionItemForm({ onSubmit }) {
    const [form, setForm] = useState({ description: '', assigned_to_name: '', due_date: '' });

    return (
        <div className="flex gap-2 mb-2 p-2 bg-slate-50 rounded">
            <Input
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Deskripsi action item..."
                className="flex-1"
            />
            <Input
                value={form.assigned_to_name}
                onChange={(e) => setForm(p => ({ ...p, assigned_to_name: e.target.value }))}
                placeholder="PIC"
                className="w-32"
            />
            <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm(p => ({ ...p, due_date: e.target.value }))}
                className="w-36"
            />
            <Button size="sm" onClick={() => onSubmit(form)}>Add</Button>
        </div>
    );
}

function MeetingFormModal({ onSubmit, onClose }) {
    const [form, setForm] = useState({
        meeting_type: 'Progress Weekly',
        title: '',
        meeting_date: new Date().toISOString().split('T')[0],
        start_time: '10:00',
        location: ''
    });

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <CardTitle>Jadwalkan Meeting</CardTitle>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium">Tipe Meeting</label>
                            <Select value={form.meeting_type} onValueChange={(v) => setForm(p => ({ ...p, meeting_type: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {MEETING_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Judul *</label>
                            <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Tanggal</label>
                                <Input type="date" value={form.meeting_date} onChange={(e) => setForm(p => ({ ...p, meeting_date: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Waktu</label>
                                <Input type="time" value={form.start_time} onChange={(e) => setForm(p => ({ ...p, start_time: e.target.value }))} />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Lokasi</label>
                            <Input value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Site Office / Online" />
                        </div>
                    </CardContent>

                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50 rounded-b-2xl">
                        <Button variant="outline" onClick={onClose}>Batal</Button>
                        <Button onClick={() => onSubmit(form)} className="bg-purple-600">Simpan</Button>
                    </div>
                </Card>
            </motion.div>
        </>
    );
}

function MinutesModal({ meeting, onSubmit, onClose }) {
    const [form, setForm] = useState({ minutes: '', decisions: '' });

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b">
                        <CardTitle className="text-sm">Notulen: {meeting.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium">Notulen/Minutes *</label>
                            <textarea
                                value={form.minutes}
                                onChange={(e) => setForm(p => ({ ...p, minutes: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                rows={5}
                                placeholder="Tulis notulen meeting..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Keputusan</label>
                            <textarea
                                value={form.decisions}
                                onChange={(e) => setForm(p => ({ ...p, decisions: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                rows={3}
                                placeholder="Keputusan yang diambil..."
                            />
                        </div>
                    </CardContent>

                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-slate-50 rounded-b-2xl">
                        <Button variant="outline" onClick={onClose}>Batal</Button>
                        <Button onClick={() => onSubmit(form)} className="bg-purple-600">Complete Meeting</Button>
                    </div>
                </Card>
            </motion.div>
        </>
    );
}
