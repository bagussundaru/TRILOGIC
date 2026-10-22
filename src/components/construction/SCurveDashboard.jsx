import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { motion } from 'framer-motion';
import {
    TrendingUp, Activity, Target, DollarSign,
    Calendar, CheckCircle
} from 'lucide-react';
import { useCivil } from '@/contexts/CivilContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SCurveDashboard({ projectId, projectName }) {
    const { projects, sCurveData } = useCivil();
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const project = projects[0];

    useEffect(() => {
        if (!chartRef.current || !sCurveData) return;

        chartInstance.current = echarts.init(chartRef.current);

        const option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderColor: '#e2e8f0',
                textStyle: { color: '#1e293b', fontSize: 12 },
                formatter: (params) => {
                    let result = `<div class="font-bold border-b pb-1 mb-1">${params[0].axisValue}</div>`;
                    params.forEach((param) => {
                        if (param.value !== null && param.value !== undefined) {
                            result += `<div class="flex items-center justify-between gap-4 text-xs">
                                <span>${param.marker} ${param.seriesName}:</span>
                                <span class="font-bold">${param.value}%</span>
                            </div>`;
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: ['Rencana Kumulatif (Target Baseline)', 'Realisasi Fisik Lapangan'],
                bottom: 0,
                textStyle: { color: '#475569', fontSize: 12 }
            },
            grid: {
                top: 40,
                right: 30,
                bottom: 50,
                left: 50
            },
            xAxis: {
                type: 'category',
                data: sCurveData.labels,
                axisLine: { lineStyle: { color: '#cbd5e1' } },
                axisLabel: { color: '#64748b', fontSize: 11 }
            },
            yAxis: {
                type: 'value',
                max: 100,
                axisLabel: { formatter: '{value}%', color: '#64748b', fontSize: 11 },
                splitLine: { lineStyle: { color: '#f1f5f9' } }
            },
            series: [
                {
                    name: 'Rencana Kumulatif (Target Baseline)',
                    type: 'line',
                    smooth: true,
                    data: sCurveData.planCumulative,
                    lineStyle: { width: 3, color: '#9333ea', type: 'dashed' },
                    itemStyle: { color: '#9333ea' }
                },
                {
                    name: 'Realisasi Fisik Lapangan',
                    type: 'line',
                    smooth: true,
                    data: sCurveData.actualCumulative,
                    lineStyle: { width: 4, color: '#059669' },
                    itemStyle: { color: '#059669' },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(5, 150, 105, 0.25)' },
                            { offset: 1, color: 'rgba(5, 150, 105, 0.02)' }
                        ])
                    }
                }
            ]
        };

        chartInstance.current.setOption(option);

        const handleResize = () => chartInstance.current?.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartInstance.current?.dispose();
        };
    }, [sCurveData]);

    return (
        <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5">
                        <span className="text-xs font-bold text-slate-400 uppercase">Target Baseline (Bulan 5)</span>
                        <h3 className="text-2xl font-extrabold text-purple-700 mt-2">43.7%</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-1">Target Kurva S Rencana</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5">
                        <span className="text-xs font-bold text-slate-400 uppercase">Realisasi Fisik Lapangan</span>
                        <h3 className="text-2xl font-extrabold text-emerald-700 mt-2">43.7%</h3>
                        <p className="text-xs text-emerald-600 font-semibold mt-1">On Schedule (Fase 1 100%)</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5">
                        <span className="text-xs font-bold text-slate-400 uppercase">Deviasi Progress</span>
                        <h3 className="text-2xl font-extrabold text-teal-700 mt-2">0.0%</h3>
                        <p className="text-xs text-teal-600 font-semibold mt-1">Sesuai Rencana Proposal</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5">
                        <span className="text-xs font-bold text-slate-400 uppercase">Kapasitas Unit Aktif</span>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-2">6 dari 24 Unit</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-1">Fase 1 Beroperasi (Okupansi 95%)</p>
                    </CardContent>
                </Card>
            </div>

            {/* S-Curve ECharts Canvas */}
            <Card className="border border-slate-200 bg-white shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Grafik Kurva S (Progres Fisik Rencana vs Realisasi Lapangan)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div ref={chartRef} className="w-full h-[420px]" />
                </CardContent>
            </Card>
        </div>
    );
}
