import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Activity, Target, DollarSign,
    Calendar, AlertTriangle, CheckCircle, Clock, BarChart2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const API_BASE_URL = 'http://103.189.234.15:3001/api';

export default function SCurveDashboard({ projectId, projectName = 'Project' }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('cumulative'); // cumulative or periodic
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Fetch S-Curve data
    const fetchData = useCallback(async () => {
        if (!projectId) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem('trilogic_token');

            const response = await fetch(`${API_BASE_URL}/progress/project/${projectId}/s-curve`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();

            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching S-Curve data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Render S-Curve chart
    useEffect(() => {
        if (!chartRef.current || !data?.sCurve) return;

        chartInstance.current = echarts.init(chartRef.current);

        const option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderColor: '#e2e8f0',
                textStyle: { color: '#1e293b', fontSize: 12 },
                formatter: (params) => {
                    let html = `<strong>${params[0].axisValue}</strong><br/>`;
                    params.forEach(p => {
                        html += `${p.marker} ${p.seriesName}: Rp ${p.value?.toLocaleString() || 0} Jt<br/>`;
                    });
                    return html;
                }
            },
            legend: {
                data: ['Planned Value (BCWS)', 'Earned Value (BCWP)', 'Actual Cost (ACWP)'],
                bottom: 0,
                textStyle: { fontSize: 11, color: '#64748b' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.sCurve.periods,
                axisLine: { lineStyle: { color: '#e2e8f0' } },
                axisLabel: { color: '#64748b', fontSize: 10, rotate: 30 }
            },
            yAxis: {
                type: 'value',
                name: 'Nilai (Juta Rp)',
                nameTextStyle: { color: '#64748b', fontSize: 11 },
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: {
                    color: '#64748b',
                    fontSize: 10,
                    formatter: (v) => `${(v / 1000).toFixed(0)}M`
                }
            },
            series: [
                {
                    name: 'Planned Value (BCWS)',
                    type: 'line',
                    data: data.sCurve.planned,
                    smooth: true,
                    lineStyle: { color: '#3b82f6', width: 2, type: 'dashed' },
                    itemStyle: { color: '#3b82f6' },
                    symbol: 'circle',
                    symbolSize: 4
                },
                {
                    name: 'Earned Value (BCWP)',
                    type: 'line',
                    data: data.sCurve.earned,
                    smooth: true,
                    lineStyle: { color: '#10b981', width: 3 },
                    itemStyle: { color: '#10b981' },
                    symbol: 'circle',
                    symbolSize: 6,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
                        ])
                    }
                },
                {
                    name: 'Actual Cost (ACWP)',
                    type: 'line',
                    data: data.sCurve.actual,
                    smooth: true,
                    lineStyle: { color: '#ef4444', width: 2 },
                    itemStyle: { color: '#ef4444' },
                    symbol: 'triangle',
                    symbolSize: 5
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
    }, [data]);

    // Format currency
    const formatCurrency = (value) => {
        if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(1)} Miliar`;
        if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(0)} Juta`;
        return `Rp ${value?.toLocaleString() || 0}`;
    };

    // Determine status color
    const getStatusColor = (value, threshold = 1) => {
        if (value >= threshold) return 'text-emerald-600';
        if (value >= threshold * 0.9) return 'text-amber-600';
        return 'text-red-600';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <TrendingUp className="w-16 h-16 mb-4" />
                <p>Data tidak tersedia</p>
            </div>
        );
    }

    const { summary, project } = data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-teal-600" />
                        S-Curve & Earned Value Analysis
                    </h2>
                    <p className="text-sm text-slate-500">{projectName}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'cumulative' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('cumulative')}
                        className="rounded-lg"
                    >
                        Kumulatif
                    </Button>
                    <Button
                        variant={viewMode === 'periodic' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('periodic')}
                        className="rounded-lg"
                    >
                        Periodik
                    </Button>
                </div>
            </div>

            {/* EVM Metrics Cards */}
            <div className="grid grid-cols-5 gap-4">
                <EVMCard
                    label="BAC"
                    subLabel="Budget at Completion"
                    value={formatCurrency(summary.bac)}
                    icon={Target}
                    color="slate"
                />
                <EVMCard
                    label="EV"
                    subLabel="Earned Value"
                    value={formatCurrency(summary.ev)}
                    icon={TrendingUp}
                    color="emerald"
                    trend={summary.sv >= 0 ? '+' : ''}
                    trendValue={`${((summary.ev / summary.bac) * 100).toFixed(1)}%`}
                />
                <EVMCard
                    label="AC"
                    subLabel="Actual Cost"
                    value={formatCurrency(summary.ac)}
                    icon={DollarSign}
                    color={summary.cv >= 0 ? 'emerald' : 'red'}
                />
                <EVMCard
                    label="EAC"
                    subLabel="Estimate at Completion"
                    value={formatCurrency(summary.eac)}
                    icon={Calendar}
                    color={summary.vac >= 0 ? 'emerald' : 'amber'}
                />
                <EVMCard
                    label="VAC"
                    subLabel="Variance at Completion"
                    value={formatCurrency(summary.vac)}
                    icon={summary.vac >= 0 ? CheckCircle : AlertTriangle}
                    color={summary.vac >= 0 ? 'emerald' : 'red'}
                />
            </div>

            {/* Performance Index Gauges */}
            <div className="grid grid-cols-3 gap-4">
                <PerformanceGauge
                    title="Schedule Performance Index (SPI)"
                    value={summary.spi}
                    description={summary.spi >= 1 ? 'Ahead of Schedule' : 'Behind Schedule'}
                />
                <PerformanceGauge
                    title="Cost Performance Index (CPI)"
                    value={summary.cpi}
                    description={summary.cpi >= 1 ? 'Under Budget' : 'Over Budget'}
                />
                <Card className="border border-slate-200">
                    <CardHeader className="py-3 border-b border-slate-100">
                        <CardTitle className="text-sm font-medium">Progress Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Fisik</span>
                                    <span className="font-medium">{summary.progressPct.toFixed(1)}%</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                                        style={{ width: `${Math.min(summary.progressPct, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Keuangan</span>
                                    <span className="font-medium">
                                        {((summary.ac / summary.bac) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${summary.ac > summary.ev ? 'bg-red-500' : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${Math.min((summary.ac / summary.bac) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* S-Curve Chart */}
            <Card className="border border-slate-200">
                <CardHeader className="py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-teal-600" />
                            Kurva-S Progress Proyek
                        </CardTitle>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-0.5 bg-blue-500 inline-block" style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0', borderColor: '#3b82f6' }} />
                                Rencana
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-1 bg-emerald-500 rounded inline-block" />
                                Realisasi
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-0.5 bg-red-500 inline-block" />
                                Biaya Aktual
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <div ref={chartRef} style={{ height: '350px', width: '100%' }} />
                </CardContent>
            </Card>

            {/* Variance Summary */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border border-slate-200">
                    <CardHeader className="py-3 border-b border-slate-100">
                        <CardTitle className="text-sm font-medium">Schedule Variance (SV)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-2xl font-bold ${summary.sv >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {summary.sv >= 0 ? '+' : ''}{formatCurrency(summary.sv)}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {summary.sv >= 0
                                        ? '✓ Progres lebih cepat dari jadwal'
                                        : '⚠️ Progres terlambat dari jadwal'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${summary.sv >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                {summary.sv >= 0
                                    ? <TrendingUp className="w-6 h-6 text-emerald-600" />
                                    : <TrendingDown className="w-6 h-6 text-red-600" />
                                }
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200">
                    <CardHeader className="py-3 border-b border-slate-100">
                        <CardTitle className="text-sm font-medium">Cost Variance (CV)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-2xl font-bold ${summary.cv >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {summary.cv >= 0 ? '+' : ''}{formatCurrency(summary.cv)}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {summary.cv >= 0
                                        ? '✓ Biaya lebih hemat dari anggaran'
                                        : '⚠️ Biaya melebihi anggaran'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${summary.cv >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                {summary.cv >= 0
                                    ? <DollarSign className="w-6 h-6 text-emerald-600" />
                                    : <AlertTriangle className="w-6 h-6 text-red-600" />
                                }
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// EVM Card Component
function EVMCard({ label, subLabel, value, icon: Icon, color, trend, trendValue }) {
    const colors = {
        slate: 'from-slate-500 to-slate-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        red: 'from-red-500 to-red-600',
        blue: 'from-blue-500 to-blue-600'
    };

    return (
        <Card className="border border-slate-200">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                        <p className="text-lg font-bold text-slate-800 mt-1">{value}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{subLabel}</p>
                    </div>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]} text-white`}>
                        <Icon className="w-4 h-4" />
                    </div>
                </div>
                {trendValue && (
                    <p className={`text-xs mt-2 ${trend === '+' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {trend}{trendValue}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// Performance Gauge Component
function PerformanceGauge({ title, value, description }) {
    const gaugeRef = useRef(null);
    const gaugeInstance = useRef(null);

    useEffect(() => {
        if (!gaugeRef.current) return;

        gaugeInstance.current = echarts.init(gaugeRef.current);

        const color = value >= 1 ? '#10b981' : value >= 0.9 ? '#f59e0b' : '#ef4444';

        const option = {
            series: [
                {
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 2,
                    splitNumber: 4,
                    radius: '100%',
                    center: ['50%', '75%'],
                    axisLine: {
                        lineStyle: {
                            width: 15,
                            color: [
                                [0.45, '#ef4444'],
                                [0.55, '#f59e0b'],
                                [1, '#10b981']
                            ]
                        }
                    },
                    pointer: {
                        icon: 'path://M2090.36389,615.30999 L2## Performance gauges...',
                        length: '65%',
                        width: 6,
                        offsetCenter: [0, '-5%'],
                        itemStyle: { color: '#1e293b' }
                    },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: {
                        distance: 20,
                        color: '#64748b',
                        fontSize: 10,
                        formatter: (v) => v.toFixed(1)
                    },
                    detail: {
                        fontSize: 28,
                        fontWeight: 'bold',
                        offsetCenter: [0, '10%'],
                        valueAnimation: true,
                        formatter: (v) => v.toFixed(2),
                        color: color
                    },
                    data: [{ value: value }]
                }
            ]
        };

        gaugeInstance.current.setOption(option);

        return () => gaugeInstance.current?.dispose();
    }, [value]);

    return (
        <Card className="border border-slate-200">
            <CardHeader className="py-2 border-b border-slate-100">
                <CardTitle className="text-sm font-medium text-center">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
                <div ref={gaugeRef} style={{ height: '140px', width: '100%' }} />
                <p className={`text-xs text-center -mt-2 ${value >= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
