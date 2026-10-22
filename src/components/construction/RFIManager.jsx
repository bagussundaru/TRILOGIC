import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Plus, Send, Check, Clock, MessageSquare, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const INITIAL_RFIS = [
    {
        id: 'rfi-1',
        number: 'RFI-TBL-001',
        subject: 'Klarifikasi Dimensi Pondasi Telapak (Revisi 100x100cm ke 160x160cm)',
        question: 'Hasil analisis beban lempung Tembalang menunjukkan tekanan 243 kPa pada telapak 100x100cm. Mohon konfirmasi revisi dimensi pondasi telapak.',
        answer: 'Disetujui revisi dimensi pondasi telapak menjadi 160 x 160 x 30 cm (24 titik) untuk menjaga tegangan tanah di bawah 150 kPa sesuai SNI 1726:2019.',
        askedBy: 'Ir. Ahmad Zaelani, ST. (Site Engineer)',
        answeredBy: 'Tim Perencana Struktur Tembalang',
        date: '2026-05-02',
        status: 'Closed',
        priority: 'High'
    },
    {
        id: 'rfi-2',
        number: 'RFI-TBL-002',
        subject: 'Panjang & Perlindungan Stek Kolom D14 Sambungan Fase 2',
        question: 'Berapa panjang lewatan stek tulangan kolom D14 yang ditinggalkan di pelat lantai 2 untuk persiapan penyambungan struktur Fase 2?',
        answer: 'Panjang stek minimal 40D (600 mm untuk D14), dipasang selang-seling max 50% per penampang. Stek wajib dilapisi epoksi anti-korosi & diselubungi mortar.',
        askedBy: 'Budi Santoso, ST. (Pelaksana Sipil)',
        answeredBy: 'Konsultan Struktur',
        date: '2026-06-15',
        status: 'Closed',
        priority: 'Medium'
    },
    {
        id: 'rfi-3',
        number: 'RFI-TBL-003',
        subject: 'Prosedur Uji Genang Waterproofing Pelat Lt 2 (Atap Sementara)',
        question: 'Mohon konfirmasi durasi dan kriteria kelulusan uji genang pelat lantai 2 sebagai atap sementara selama 1 tahun menunggu Fase 2.',
        answer: 'Wajib waterproofing elastomeric 2 lapis bersilangan, kemiringan 1% ke drain, dan uji genang air 24 jam tanpa ada rembesan ke ceiling 6 kamar lantai 1.',
        askedBy: 'Mandor Utama Teknis',
        answeredBy: 'Site Manager',
        date: '2026-07-20',
        status: 'Answered',
        priority: 'High'
    }
];

export default function RFIManager({ projectId, projectName }) {
    const [rfis, setRfis] = useState(INITIAL_RFIS);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        question: '',
        askedBy: 'Pelaksana Sipil',
        priority: 'Medium'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.subject || !formData.question) return;

        const newRfi = {
            id: `rfi-${Date.now()}`,
            number: `RFI-TBL-00${rfis.length + 1}`,
            subject: formData.subject,
            question: formData.question,
            answer: 'Belum dijawab oleh Konsultan Perencana',
            askedBy: formData.askedBy,
            answeredBy: '-',
            date: new Date().toISOString().split('T')[0],
            status: 'Submitted',
            priority: formData.priority
        };

        setRfis([newRfi, ...rfis]);
        setShowModal(false);
        setFormData({ subject: '', question: '', askedBy: 'Pelaksana Sipil', priority: 'Medium' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-100 text-cyan-700 rounded-2xl">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Request for Information (RFI) - Tembalang</h3>
                        <p className="text-xs text-slate-500 font-semibold">Klarifikasi Spesifikasi Gambar Kerja & Perencanaan Struktur Sipil</p>
                    </div>
                </div>

                <Button onClick={() => setShowModal(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold px-4 h-10 shadow-md">
                    <Plus className="w-4 h-4 mr-2" /> Ajukan RFI Baru
                </Button>
            </div>

            {/* RFI Cards */}
            <div className="space-y-4">
                {rfis.map(rfi => (
                    <Card key={rfi.id} className="border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white p-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-extrabold text-cyan-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">{rfi.number}</span>
                                <h4 className="font-bold text-sm">{rfi.subject}</h4>
                            </div>
                            <span className="text-xs text-slate-300 font-semibold">{rfi.date}</span>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3 text-xs">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <span className="font-bold text-slate-500 block mb-1">Pertanyaan Lapangan ({rfi.askedBy}):</span>
                                <p className="text-slate-800 font-medium">{rfi.question}</p>
                            </div>

                            <div className="bg-cyan-50/80 p-3 rounded-xl border border-cyan-100">
                                <span className="font-bold text-cyan-900 block mb-1">Jawaban Konsultan / Owner ({rfi.answeredBy}):</span>
                                <p className="text-cyan-950 font-medium">{rfi.answer}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                        <h3 className="font-bold text-slate-900 text-lg">Ajukan Klarifikasi RFI Baru</h3>
                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 mb-1 block">Subjek / Judul Klarifikasi</label>
                                <Input placeholder="Contoh: Detail Tulangan Sengkang Balok B1" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required />
                            </div>
                            <div>
                                <label className="font-semibold text-slate-700 mb-1 block">Rincian Pertanyaan Teknis</label>
                                <Textarea rows={3} placeholder="Jelaskan kendala gambar atau item yang butuh kepastian..." value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })} required />
                            </div>
                            <div className="flex justify-end gap-2 border-t pt-3">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
                                <Button type="submit" className="bg-cyan-600 text-white">Kirim RFI</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
