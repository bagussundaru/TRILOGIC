import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Plus, Check, X, Clock, DollarSign,
    ChevronRight, AlertCircle, CheckCircle, Send,
    Edit2, Trash2, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE_URL = 'http://103.189.234.15:3001/api';

// Status colors and labels
const STATUS_CONFIG = {
    'Draft': { color: 'bg-slate-100 text-slate-700', icon: Edit2, label: 'Draft' },
    'Submitted': { color: 'bg-blue-100 text-blue-700', icon: Send, label: 'Diajukan' },
    'Consultant Approved': { color: 'bg-purple-100 text-purple-700', icon: Check, label: 'Approved Konsultan' },
    'Owner Approved': { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Approved Owner' },
    'Paid': { color: 'bg-green-100 text-green-800', icon: DollarSign, label: 'Lunas' },
    'Rejected': { color: 'bg-red-100 text-red-700', icon: X, label: 'Ditolak' }
};

export default function PaymentCertificateManager({ projectId, projectName = 'Project' }) {
    const [certificates, setCertificates] = useState([]);
    const [totals, setTotals] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);

    // Fetch certificates
    const fetchCertificates = useCallback(async () => {
        if (!projectId) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem('trilogic_token');

            const response = await fetch(`${API_BASE_URL}/payment-certificates/project/${projectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setCertificates(data.data.certificates);
                setTotals(data.data.totals);
            }
        } catch (error) {
            console.error('Error fetching certificates:', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    // Create certificate
    const handleCreate = async (formData) => {
        try {
            const token = localStorage.getItem('trilogic_token');

            const response = await fetch(`${API_BASE_URL}/payment-certificates`, {
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
                await fetchCertificates();
                setShowForm(false);
            }
        } catch (error) {
            console.error('Error creating certificate:', error);
        }
    };

    // Update status
    const handleStatusUpdate = async (certId, newStatus) => {
        try {
            const token = localStorage.getItem('trilogic_token');

            await fetch(`${API_BASE_URL}/payment-certificates/${certId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            await fetchCertificates();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Delete certificate
    const handleDelete = async (certId) => {
        if (!confirm('Hapus sertifikat pembayaran ini?')) return;

        try {
            const token = localStorage.getItem('trilogic_token');

            await fetch(`${API_BASE_URL}/payment-certificates/${certId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            await fetchCertificates();
        } catch (error) {
            console.error('Error deleting certificate:', error);
        }
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    // Get previous certified amount
    const previousCertified = useMemo(() => {
        return certificates.reduce((sum, c) => sum + (c.this_period || 0), 0);
    }, [certificates]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-emerald-600" />
                        Sertifikat Pembayaran (MC)
                    </h2>
                    <p className="text-sm text-slate-500">{projectName}</p>
                </div>

                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Buat MC Baru
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <SummaryCard
                    label="Total Tersertifikasi"
                    value={formatCurrency(totals.total_certified)}
                    color="emerald"
                />
                <SummaryCard
                    label="Total Retensi"
                    value={formatCurrency(totals.total_retention)}
                    color="amber"
                />
                <SummaryCard
                    label="Total Dibayar"
                    value={formatCurrency(totals.total_paid)}
                    color="blue"
                />
                <SummaryCard
                    label="Jumlah MC"
                    value={totals.certificate_count || certificates.length}
                    color="slate"
                    isNumber
                />
            </div>

            {/* Certificates List */}
            <Card className="border border-slate-200">
                <CardHeader className="py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <CardTitle className="text-base font-semibold">Daftar Monthly Certificate</CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
                        </div>
                    ) : certificates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <FileText className="w-12 h-12 mb-2" />
                            <p>Belum ada sertifikat pembayaran</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {certificates.map((cert) => {
                                const statusConfig = STATUS_CONFIG[cert.status] || STATUS_CONFIG['Draft'];
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <motion.div
                                        key={cert.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-emerald-100 rounded-lg">
                                                    <FileText className="w-5 h-5 text-emerald-600" />
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-slate-800">
                                                        {cert.certificate_number}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">
                                                        Periode: {new Date(cert.period_start).toLocaleDateString('id-ID')} - {new Date(cert.period_end).toLocaleDateString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm text-slate-500">Nilai Periode</p>
                                                    <p className="font-bold text-slate-800">
                                                        {formatCurrency(cert.this_period)}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-sm text-slate-500">Net Payment</p>
                                                    <p className="font-bold text-emerald-600">
                                                        {formatCurrency(cert.net_payment)}
                                                    </p>
                                                </div>

                                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusConfig.label}
                                                </span>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1">
                                                    {cert.status === 'Draft' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleStatusUpdate(cert.id, 'Submitted')}
                                                            className="text-blue-600"
                                                        >
                                                            <Send className="w-4 h-4 mr-1" />
                                                            Submit
                                                        </Button>
                                                    )}

                                                    {cert.status === 'Submitted' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleStatusUpdate(cert.id, 'Consultant Approved')}
                                                            className="text-purple-600"
                                                        >
                                                            <Check className="w-4 h-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                    )}

                                                    {cert.status === 'Consultant Approved' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleStatusUpdate(cert.id, 'Owner Approved')}
                                                            className="text-emerald-600"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Owner OK
                                                        </Button>
                                                    )}

                                                    {cert.status === 'Owner Approved' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(cert.id, 'Paid')}
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            <DollarSign className="w-4 h-4 mr-1" />
                                                            Mark Paid
                                                        </Button>
                                                    )}

                                                    {cert.status === 'Draft' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(cert.id)}
                                                            className="text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Approval Timeline */}
                                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                            {cert.submitted_date && (
                                                <span>Submitted: {new Date(cert.submitted_date).toLocaleDateString('id-ID')}</span>
                                            )}
                                            {cert.consultant_approval_date && (
                                                <>
                                                    <ChevronRight className="w-3 h-3" />
                                                    <span>Konsultan: {new Date(cert.consultant_approval_date).toLocaleDateString('id-ID')}</span>
                                                </>
                                            )}
                                            {cert.owner_approval_date && (
                                                <>
                                                    <ChevronRight className="w-3 h-3" />
                                                    <span>Owner: {new Date(cert.owner_approval_date).toLocaleDateString('id-ID')}</span>
                                                </>
                                            )}
                                            {cert.payment_date && (
                                                <>
                                                    <ChevronRight className="w-3 h-3" />
                                                    <span className="text-green-600 font-medium">
                                                        Dibayar: {new Date(cert.payment_date).toLocaleDateString('id-ID')}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <PaymentCertificateForm
                        previousCertified={previousCertified}
                        onSubmit={handleCreate}
                        onClose={() => setShowForm(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Summary Card
function SummaryCard({ label, value, color, isNumber }) {
    const colors = {
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        blue: 'from-blue-500 to-blue-600',
        slate: 'from-slate-500 to-slate-600'
    };

    return (
        <Card className="border border-slate-200">
            <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className={`font-bold ${isNumber ? 'text-3xl' : 'text-lg'} text-slate-800`}>
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

// Payment Certificate Form
function PaymentCertificateForm({ previousCertified, onSubmit, onClose }) {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        period_start: firstDay,
        period_end: lastDay,
        previous_certified: previousCertified,
        this_period: 0,
        retention_percentage: 5,
        ppn_percentage: 11,
        pph_percentage: 2,
        notes: ''
    });

    // Calculate derived values
    const cumulative = formData.previous_certified + formData.this_period;
    const retention = cumulative * (formData.retention_percentage / 100);
    const ppn = formData.this_period * (formData.ppn_percentage / 100);
    const pph = formData.this_period * (formData.pph_percentage / 100);
    const netPayment = formData.this_period - retention + ppn - pph;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
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
                <Card className="w-full max-w-lg bg-white shadow-2xl rounded-2xl">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Buat Monthly Certificate
                            </CardTitle>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-4 space-y-4">
                            {/* Period */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Periode Mulai</label>
                                    <Input
                                        type="date"
                                        value={formData.period_start}
                                        onChange={(e) => setFormData(prev => ({ ...prev, period_start: e.target.value }))}
                                        className="mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Periode Akhir</label>
                                    <Input
                                        type="date"
                                        value={formData.period_end}
                                        onChange={(e) => setFormData(prev => ({ ...prev, period_end: e.target.value }))}
                                        className="mt-1"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Amounts */}
                            <div>
                                <label className="text-sm font-medium text-slate-700">Tersertifikasi Sebelumnya</label>
                                <Input
                                    type="number"
                                    value={formData.previous_certified}
                                    onChange={(e) => setFormData(prev => ({ ...prev, previous_certified: parseFloat(e.target.value) || 0 }))}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Nilai Periode Ini *</label>
                                <Input
                                    type="number"
                                    value={formData.this_period}
                                    onChange={(e) => setFormData(prev => ({ ...prev, this_period: parseFloat(e.target.value) || 0 }))}
                                    className="mt-1"
                                    required
                                />
                            </div>

                            {/* Tax percentages */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Retensi (%)</label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={formData.retention_percentage}
                                        onChange={(e) => setFormData(prev => ({ ...prev, retention_percentage: parseFloat(e.target.value) || 0 }))}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">PPN (%)</label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={formData.ppn_percentage}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ppn_percentage: parseFloat(e.target.value) || 0 }))}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">PPh (%)</label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={formData.pph_percentage}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pph_percentage: parseFloat(e.target.value) || 0 }))}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            {/* Calculation Summary */}
                            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Kumulatif</span>
                                    <span className="font-medium">{formatCurrency(cumulative)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Retensi ({formData.retention_percentage}%)</span>
                                    <span>-{formatCurrency(retention)}</span>
                                </div>
                                <div className="flex justify-between text-blue-600">
                                    <span>PPN ({formData.ppn_percentage}%)</span>
                                    <span>+{formatCurrency(ppn)}</span>
                                </div>
                                <div className="flex justify-between text-orange-600">
                                    <span>PPh ({formData.pph_percentage}%)</span>
                                    <span>-{formatCurrency(pph)}</span>
                                </div>
                                <hr className="border-slate-200" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span className="text-emerald-700">Net Payment</span>
                                    <span className="text-emerald-700">{formatCurrency(netPayment)}</span>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-sm font-medium text-slate-700">Catatan</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                    rows={2}
                                    placeholder="Catatan tambahan..."
                                />
                            </div>
                        </CardContent>

                        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                                Buat Certificate
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </>
    );
}
