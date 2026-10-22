import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ChevronDown, TreePine, Calendar, DollarSign,
    Percent, CheckCircle2, Clock, AlertCircle, Plus, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const INITIAL_WBS = [
    {
        id: 'wbs-1',
        code: 'WBS 1.0',
        name: 'FASE 1: Inisiasi, Struktur Bawah & 6 Kamar Aktif Lt 1',
        capex: 1025000000,
        weight: 43.7,
        status: 'Completed',
        startDate: '2026-05-01',
        endDate: '2026-08-01',
        children: [
            { id: 'wbs-1.1', code: '1.1', name: 'Soil Test (2 Titik Sondir + 1 Boring Dangkal)', capex: 7000000, weight: 0.3, status: 'Completed' },
            { id: 'wbs-1.2', code: '1.2', name: 'Legalitas KRK & PBG SIMBG Kota Semarang', capex: 28000000, weight: 1.2, status: 'Completed' },
            { id: 'wbs-1.3', code: '1.3', name: 'Galian Tanah & 24 Titik Pondasi Telapak 160x160cm', capex: 61240000, weight: 2.6, status: 'Completed' },
            { id: 'wbs-1.4', code: '1.4', name: 'Struktur Utama K-250 Lt 1 & Slab Lt 2 (Atap Sementara)', capex: 450000000, weight: 19.2, status: 'Completed' },
            { id: 'wbs-1.5', code: '1.5', name: 'Finishing Arsitektur & Plumbing 6 Kamar Lt 1', capex: 314000000, weight: 13.4, status: 'Completed' },
            { id: 'wbs-1.6', code: '1.6', name: 'Furnitur & Smart Lock RFID 6 Unit Lt 1', capex: 48000000, weight: 2.0, status: 'Completed' },
            { id: 'wbs-1.7', code: '1.7', name: 'Waterproofing 2 Lapis Pelat Lt 2 & Uji Genang 24 Jam', capex: 24320000, weight: 1.0, status: 'Completed' },
            { id: 'wbs-1.8', code: '1.8', name: 'Parkir Motor 45m², Pos Jaga, & Lobi Penerima', capex: 92440000, weight: 4.0, status: 'Completed' }
        ]
    },
    {
        id: 'wbs-2',
        code: 'WBS 2.0',
        name: 'FASE 2: Penambahan Struktur & Finishing 9 Kamar Lt 2',
        capex: 672600000,
        weight: 28.7,
        status: 'In Progress',
        startDate: '2026-08-01',
        endDate: '2026-12-31',
        children: [
            { id: 'wbs-2.1', code: '2.1', name: 'Penyambungan Stek Kolom D14 (500mm) & Balok Lt 2', capex: 185000000, weight: 7.9, status: 'In Progress' },
            { id: 'wbs-2.2', code: '2.2', name: 'Pasangan Dinding AAC 100mm & Plesteran Lt 2', capex: 160000000, weight: 6.8, status: 'Not Started' },
            { id: 'wbs-2.3', code: '2.3', name: 'Finishing Arsitektur & Plumbing 9 Kamar Lt 2', capex: 200600000, weight: 8.6, status: 'Not Started' },
            { id: 'wbs-2.4', code: '2.4', name: 'Furnitur & Smart Lock 9 Unit Lt 2', capex: 72000000, weight: 3.1, status: 'Not Started' },
            { id: 'wbs-2.5', code: '2.5', name: 'Sudut Belajar Komunal Lt 2', capex: 8000000, weight: 0.3, status: 'Not Started' },
            { id: 'wbs-2.6', code: '2.6', name: 'Kontingensi Fase 2 (8%)', capex: 47000000, weight: 2.0, status: 'Not Started' }
        ]
    },
    {
        id: 'wbs-3',
        code: 'WBS 3.0',
        name: 'FASE 3: Struktur & Finishing 9 Kamar Lt 3, Rooftop & Jemuran',
        capex: 648400000,
        weight: 27.6,
        status: 'Not Started',
        startDate: '2027-01-01',
        endDate: '2027-04-30',
        children: [
            { id: 'wbs-3.1', code: '3.1', name: 'Struktur Kolom & Balok Lt 3 & Pelat Rooftop', capex: 175000000, weight: 7.5, status: 'Not Started' },
            { id: 'wbs-3.2', code: '3.2', name: 'Pasangan Dinding AAC & Finishing 9 Kamar Lt 3', capex: 210400000, weight: 9.0, status: 'Not Started' },
            { id: 'wbs-3.3', code: '3.3', name: 'Furnitur & Smart Lock 9 Unit Lt 3', capex: 72000000, weight: 3.1, status: 'Not Started' },
            { id: 'wbs-3.4', code: '3.4', name: 'Laundry & Area Jemur Beratap Lt 3', capex: 14000000, weight: 0.6, status: 'Not Started' },
            { id: 'wbs-3.5', code: '3.5', name: 'Secondary Skin Fasad Kawat Anyam Baja & Roster', capex: 35000000, weight: 1.5, status: 'Not Started' },
            { id: 'wbs-3.6', code: '3.6', name: 'Kontingensi Fase 3 (8%)', capex: 142000000, weight: 5.9, status: 'Not Started' }
        ]
    }
];

export default function WBSBuilder({ projectId, projectName }) {
    const [wbsList, setWbsList] = useState(INITIAL_WBS);
    const [expanded, setExpanded] = useState(new Set(['wbs-1', 'wbs-2']));

    const toggleExpand = (id) => {
        const next = new Set(expanded);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpanded(next);
    };

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const totalCAPEX = wbsList.reduce((sum, parent) => sum + parent.capex, 0);

    return (
        <div className="space-y-6">
            {/* Header Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase text-slate-400">Total Anggaran WBS (3 Fase)</span>
                            <h3 className="text-2xl font-extrabold text-blue-700 mt-1">{formatIDR(totalCAPEX)}</h3>
                            <p className="text-xs text-blue-600 font-semibold mt-1">24 Kamar En-Suite + Parkir</p>
                        </div>
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <TreePine className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase text-slate-400">Progres Fase 1</span>
                            <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">100% Selesai</h3>
                            <p className="text-xs text-emerald-600 font-semibold mt-1">6 Kamar Aktif Beroperasi</p>
                        </div>
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase text-slate-400">Status Fase 2</span>
                            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">Dalam Pengerjaan</h3>
                            <p className="text-xs text-amber-700 font-semibold mt-1">Stek Kolom D14 Lt 2</p>
                        </div>
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                            <Clock className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tree WBS Card */}
            <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <TreePine className="w-5 h-5 text-blue-600" />
                        Work Breakdown Structure (WBS) Proyek Tembalang
                    </CardTitle>
                    <CardDescription>Rincian alokasi pekerjaan, bobot %, dan anggaran per fase pembangunan</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                    {wbsList.map(parent => (
                        <div key={parent.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                            {/* Parent Header */}
                            <div
                                onClick={() => toggleExpand(parent.id)}
                                className="p-4 bg-slate-900 text-white flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {expanded.has(parent.id) ? <ChevronDown className="w-5 h-5 text-amber-400" /> : <ChevronRight className="w-5 h-5 text-amber-400" />}
                                    <div>
                                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{parent.code}</span>
                                        <h4 className="font-extrabold text-sm">{parent.name}</h4>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-xs">
                                    <span className="text-slate-300">Bobot: <strong className="text-amber-400 font-bold">{parent.weight}%</strong></span>
                                    <span className="text-slate-300">CAPEX: <strong className="text-white font-bold">{formatIDR(parent.capex)}</strong></span>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${parent.status === 'Completed' ? 'bg-emerald-600 text-white' : parent.status === 'In Progress' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                        {parent.status}
                                    </span>
                                </div>
                            </div>

                            {/* Sub-items */}
                            {expanded.has(parent.id) && (
                                <div className="divide-y divide-slate-200/80 bg-white">
                                    {parent.children.map(child => (
                                        <div key={child.id} className="p-3.5 pl-12 flex items-center justify-between hover:bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-slate-400 w-8">{child.code}</span>
                                                <span className="text-xs font-semibold text-slate-800">{child.name}</span>
                                            </div>

                                            <div className="flex items-center gap-6 text-xs">
                                                <span className="text-slate-500 w-20 text-right">Bobot: <strong>{child.weight}%</strong></span>
                                                <span className="font-bold text-slate-900 w-32 text-right">{formatIDR(child.capex)}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${child.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : child.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                                    {child.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
