import React, { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// EVM S-Curve Chart Component
export function EVMSCurveChart({ data, title = "Earned Value Analysis" }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        chartInstance.current = echarts.init(chartRef.current);

        const option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderColor: '#e2e8f0',
                textStyle: { color: '#1e293b' }
            },
            legend: {
                data: ['Planned Value (PV)', 'Earned Value (EV)', 'Actual Cost (AC)'],
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
                data: data?.periods || ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
                axisLine: { lineStyle: { color: '#e2e8f0' } },
                axisLabel: { color: '#64748b', fontSize: 11 }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: {
                    color: '#64748b',
                    fontSize: 11,
                    formatter: (value) => `Rp ${(value / 1e9).toFixed(1)}B`
                }
            },
            series: [
                {
                    name: 'Planned Value (PV)',
                    type: 'line',
                    data: data?.pv || [10, 25, 45, 70, 90, 100],
                    smooth: true,
                    lineStyle: { color: '#3b82f6', width: 2, type: 'dashed' },
                    itemStyle: { color: '#3b82f6' },
                    symbol: 'circle',
                    symbolSize: 6
                },
                {
                    name: 'Earned Value (EV)',
                    type: 'line',
                    data: data?.ev || [8, 22, 40, 60, 82, 95],
                    smooth: true,
                    lineStyle: { color: '#10b981', width: 3 },
                    itemStyle: { color: '#10b981' },
                    symbol: 'circle',
                    symbolSize: 8,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
                            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
                        ])
                    }
                },
                {
                    name: 'Actual Cost (AC)',
                    type: 'line',
                    data: data?.ac || [12, 28, 50, 75, 95, 110],
                    smooth: true,
                    lineStyle: { color: '#ef4444', width: 2 },
                    itemStyle: { color: '#ef4444' },
                    symbol: 'circle',
                    symbolSize: 6
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

    return (
        <Card className="border border-slate-200 rounded-xl">
            <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div ref={chartRef} style={{ height: '300px', width: '100%' }} />
            </CardContent>
        </Card>
    );
}

// Performance Gauge Chart
export function PerformanceGauge({ value, target = 1.0, title, type = 'CPI' }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const color = useMemo(() => {
        if (value >= target) return '#10b981';
        if (value >= target * 0.9) return '#f59e0b';
        return '#ef4444';
    }, [value, target]);

    useEffect(() => {
        if (!chartRef.current) return;

        chartInstance.current = echarts.init(chartRef.current);

        const option = {
            series: [
                {
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 2,
                    splitNumber: 4,
                    radius: '90%',
                    center: ['50%', '70%'],
                    axisLine: {
                        lineStyle: {
                            width: 12,
                            color: [
                                [0.4, '#ef4444'],
                                [0.5, '#f59e0b'],
                                [1, '#10b981']
                            ]
                        }
                    },
                    pointer: {
                        icon: 'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
                        length: '75%',
                        width: 8,
                        offsetCenter: [0, '-10%'],
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
                    title: {
                        offsetCenter: [0, '30%'],
                        fontSize: 12,
                        color: '#64748b'
                    },
                    detail: {
                        fontSize: 28,
                        offsetCenter: [0, '0%'],
                        valueAnimation: true,
                        formatter: (v) => v.toFixed(2),
                        color: color
                    },
                    data: [{ value: value, name: type }]
                }
            ]
        };

        chartInstance.current.setOption(option);

        return () => chartInstance.current?.dispose();
    }, [value, color, type]);

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
        >
            <div ref={chartRef} style={{ height: '150px', width: '100%' }} />
            <p className="text-sm font-medium text-slate-700 -mt-4">{title}</p>
        </motion.div>
    );
}

// Risk Heatmap Matrix (5x5)
export function RiskHeatmap({ risks = [], title = "Risk Matrix" }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        chartInstance.current = echarts.init(chartRef.current);

        // Create matrix data
        const matrixData = [];
        const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'];
        const probLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Certain'];

        // Calculate risk counts per cell
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const count = risks.filter(r =>
                    r.probability === j + 1 && r.impact === i + 1
                ).length;
                const score = (i + 1) * (j + 1);
                matrixData.push([j, i, count, score]);
            }
        }

        const option = {
            tooltip: {
                formatter: (params) => {
                    const [prob, impact, count, score] = params.data;
                    return `
                        <strong>Probability:</strong> ${probLabels[prob]}<br/>
                        <strong>Impact:</strong> ${impactLabels[impact]}<br/>
                        <strong>Risk Score:</strong> ${score}<br/>
                        <strong>Risks:</strong> ${count}
                    `;
                }
            },
            grid: {
                left: '15%',
                right: '5%',
                bottom: '15%',
                top: '5%'
            },
            xAxis: {
                type: 'category',
                data: probLabels,
                axisLabel: { fontSize: 10, color: '#64748b', rotate: 30 },
                name: 'Probability',
                nameLocation: 'middle',
                nameGap: 40
            },
            yAxis: {
                type: 'category',
                data: impactLabels,
                axisLabel: { fontSize: 10, color: '#64748b' },
                name: 'Impact',
                nameLocation: 'middle',
                nameGap: 60
            },
            visualMap: {
                show: false,
                min: 1,
                max: 25,
                inRange: {
                    color: ['#dcfce7', '#fef3c7', '#fed7aa', '#fecaca', '#fca5a5', '#f87171']
                }
            },
            series: [
                {
                    type: 'heatmap',
                    data: matrixData,
                    label: {
                        show: true,
                        formatter: (params) => params.data[2] > 0 ? params.data[2] : '',
                        fontSize: 12,
                        fontWeight: 'bold'
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 2,
                        borderRadius: 4
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.3)'
                        }
                    }
                }
            ]
        };

        chartInstance.current.setOption(option);

        return () => chartInstance.current?.dispose();
    }, [risks]);

    return (
        <Card className="border border-slate-200 rounded-xl">
            <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div ref={chartRef} style={{ height: '300px', width: '100%' }} />
            </CardContent>
        </Card>
    );
}

// Resource Capacity Heatmap
export function ResourceHeatmap({ resources = [], weeks = 8, title = "Team Capacity" }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        chartInstance.current = echarts.init(chartRef.current);

        const weekLabels = Array.from({ length: weeks }, (_, i) => `W${i + 1}`);
        const resourceNames = resources.map(r => r.name);

        // Generate heatmap data
        const data = [];
        resources.forEach((resource, rIdx) => {
            weekLabels.forEach((_, wIdx) => {
                const utilization = resource.utilization?.[wIdx] || Math.random() * 120;
                data.push([wIdx, rIdx, Math.round(utilization)]);
            });
        });

        const option = {
            tooltip: {
                formatter: (params) => {
                    const [week, resource, util] = params.data;
                    const status = util > 100 ? '🔴 Overloaded' : util > 80 ? '🟡 High' : '🟢 Normal';
                    return `
                        <strong>${resourceNames[resource]}</strong><br/>
                        Week ${week + 1}: ${util}%<br/>
                        ${status}
                    `;
                }
            },
            grid: {
                left: '20%',
                right: '5%',
                bottom: '10%',
                top: '5%'
            },
            xAxis: {
                type: 'category',
                data: weekLabels,
                splitArea: { show: true },
                axisLabel: { fontSize: 10 }
            },
            yAxis: {
                type: 'category',
                data: resourceNames,
                splitArea: { show: true },
                axisLabel: { fontSize: 10 }
            },
            visualMap: {
                min: 0,
                max: 120,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '0%',
                itemWidth: 10,
                itemHeight: 60,
                text: ['Overload', 'Free'],
                textStyle: { fontSize: 10 },
                inRange: {
                    color: ['#dcfce7', '#86efac', '#fde047', '#fb923c', '#f87171']
                }
            },
            series: [{
                type: 'heatmap',
                data: data,
                label: {
                    show: true,
                    formatter: (params) => `${params.data[2]}%`,
                    fontSize: 9
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.3)'
                    }
                }
            }]
        };

        chartInstance.current.setOption(option);

        return () => chartInstance.current?.dispose();
    }, [resources, weeks]);

    return (
        <Card className="border border-slate-200 rounded-xl">
            <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div ref={chartRef} style={{ height: '250px', width: '100%' }} />
            </CardContent>
        </Card>
    );
}
