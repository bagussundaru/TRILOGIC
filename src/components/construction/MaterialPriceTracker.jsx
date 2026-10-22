import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Package, TrendingUp, TrendingDown, Minus, Search, Filter,
    Building2, RefreshCw, AlertCircle
} from 'lucide-react';
import { useCivil } from '@/contexts/CivilContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function MaterialPriceTracker() {
    const { materials } = useCivil();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMaterials = materials.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl text-white shadow-md">
                        <Package className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Tracker Harga Material Bangunan (Semarang 2026)</h2>
                        <p className="text-xs text-slate-500 font-semibold">Survei Pasar Bahan Bangunan Proyek Tembalang (Terverifikasi Juli 2026)</p>
                    </div>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Cari material (Semen, Besi, Ready Mix)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 rounded-xl text-xs"
                    />
                </div>
            </div>

            {/* Material Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map(mat => {
                    const priceDiff = mat.currentPrice - mat.prevPrice;
                    const isUp = mat.trend === 'up';
                    const isDown = mat.trend === 'down';

                    return (
                        <Card key={mat.id} className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase">
                                        {mat.category}
                                    </span>
                                    <div className={`flex items-center gap-1 text-xs font-bold ${isUp ? 'text-rose-600' : isDown ? 'text-emerald-600' : 'text-slate-500'}`}>
                                        {isUp ? <TrendingUp className="w-4 h-4" /> : isDown ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                        <span>{isUp ? 'Naik' : isDown ? 'Turun' : 'Stabil'}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900 text-base">{mat.name}</h4>
                                    <p className="text-xs text-slate-400 font-semibold">Satuan: {mat.unit}</p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block font-semibold">Harga Pasar Saat Ini</span>
                                        <span className="text-xl font-extrabold text-slate-900">{formatIDR(mat.currentPrice)}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">Sebelumnya: {formatIDR(mat.prevPrice)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
