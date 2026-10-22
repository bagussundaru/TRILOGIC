import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, FileText, CheckCircle2, TrendingUp, Building2, Layers } from 'lucide-react';
import { useCivil } from '@/contexts/CivilContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function RABBuilder({ projectId, projectName }) {
    const { projects, boqItems } = useCivil();

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const categories = ['Pekerjaan Persiapan', 'Pekerjaan Tanah', 'Pekerjaan Struktur', 'Pekerjaan Arsitektur', 'Pekerjaan MEP', 'Furnitur', 'Fasilitas & Kontingensi'];

    const totalRAB = boqItems.reduce((sum, item) => sum + (item.volume * item.price), 0);

    return (
        <div className="space-y-6">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase text-slate-400">Total CAPEX / RAB Konstruksi</span>
                            <h3 className="text-2xl font-extrabold text-indigo-700 mt-1">{formatIDR(totalRAB)}</h3>
                            <p className="text-xs text-indigo-600 font-semibold mt-1">Proposal Tembalang Rev 2.0</p>
                        </div>
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase text-slate-400">Biaya Bangun per Meter²</span>
                            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Rp 5.000.000 / m²</h3>
                            <p className="text-xs text-slate-500 font-semibold mt-1">Luas Bangunan 384 m² (3 Lt)</p>
                        </div>
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                            <Building2 className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase text-slate-400">Alokasi Modal Awal Fase 1</span>
                            <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">Rp 1.025.000.000</h3>
                            <p className="text-xs text-emerald-600 font-semibold mt-1">43.7% dari Total CAPEX</p>
                        </div>
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* RAB Category Breakdown Table */}
            <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-600" />
                        Rencana Anggaran Biaya (RAB) per Kelompok Pekerjaan
                    </CardTitle>
                    <CardDescription>Analisis Harga Satuan Pekerjaan (AHSP) proyek Tembalang Semarang</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold tracking-wider">
                            <tr>
                                <th className="p-4">No</th>
                                <th className="p-4">Kelompok Pekerjaan</th>
                                <th className="p-4 text-center">Jumlah Item</th>
                                <th className="p-4 text-right">Subtotal Biaya (IDR)</th>
                                <th className="p-4 text-right">Bobot (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {categories.map((cat, idx) => {
                                const catItems = boqItems.filter(item => item.category === cat);
                                const subtotal = catItems.reduce((sum, item) => sum + (item.volume * item.price), 0);
                                const weight = totalRAB > 0 ? ((subtotal / totalRAB) * 100).toFixed(2) : 0;

                                return (
                                    <tr key={cat} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold text-slate-500">{idx + 1}</td>
                                        <td className="p-4 font-bold text-slate-900">{cat}</td>
                                        <td className="p-4 text-center font-semibold text-slate-600">{catItems.length} Item</td>
                                        <td className="p-4 text-right font-extrabold text-slate-900">{formatIDR(subtotal)}</td>
                                        <td className="p-4 text-right font-bold text-indigo-600">{weight}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                            <tr>
                                <td colSpan="3" className="p-4 font-extrabold text-slate-900 text-sm">TOTAL RENCANA ANGGARAN BIAYA (RAB)</td>
                                <td className="p-4 text-right font-extrabold text-indigo-700 text-base">{formatIDR(totalRAB)}</td>
                                <td className="p-4 text-right font-extrabold text-indigo-700 text-base">100.00%</td>
                            </tr>
                        </tfoot>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
