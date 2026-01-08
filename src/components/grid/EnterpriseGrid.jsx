import React, { useState, useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Filter, Download, Columns, Search, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Density configurations
const DENSITY_CONFIG = {
    compact: { rowHeight: 28, fontSize: '12px', headerHeight: 32 },
    standard: { rowHeight: 36, fontSize: '14px', headerHeight: 40 },
    comfortable: { rowHeight: 48, fontSize: '16px', headerHeight: 48 }
};

export default function EnterpriseGrid({
    rowData = [],
    columnDefs = [],
    defaultColDef = {},
    treeData = false,
    getDataPath = null,
    autoGroupColumnDef = null,
    masterDetail = false,
    detailCellRendererParams = null,
    onRowSelected = null,
    onCellValueChanged = null,
    onGridReady = null,
    density = 'standard',
    title = 'Data Grid',
    showToolbar = true,
    enableExport = true,
    enableColumnChooser = true,
    className = ''
}) {
    const gridRef = useRef(null);
    const [quickFilterText, setQuickFilterText] = useState('');
    const [currentDensity, setCurrentDensity] = useState(density);

    const densitySettings = DENSITY_CONFIG[currentDensity];

    // Default column definition
    const defaultColDefMerged = useMemo(() => ({
        sortable: true,
        resizable: true,
        filter: true,
        floatingFilter: false,
        editable: false,
        minWidth: 100,
        flex: 1,
        cellStyle: { fontSize: densitySettings.fontSize },
        ...defaultColDef
    }), [defaultColDef, densitySettings]);

    // Grid options
    const gridOptions = useMemo(() => ({
        animateRows: true,
        rowSelection: 'multiple',
        suppressRowClickSelection: true,
        enableRangeSelection: true,
        rowHeight: densitySettings.rowHeight,
        headerHeight: densitySettings.headerHeight,
        groupHeaderHeight: densitySettings.headerHeight,
        // Tree data config
        treeData,
        getDataPath,
        autoGroupColumnDef: autoGroupColumnDef || {
            headerName: 'Name',
            minWidth: 300,
            cellRendererParams: {
                suppressCount: false,
                innerRenderer: (params) => params.value
            }
        },
        // Master-detail config
        masterDetail,
        detailCellRendererParams,
        detailRowAutoHeight: true,
        // Performance optimizations
        suppressColumnVirtualisation: false,
        rowBuffer: 20,
        // Context menu
        getContextMenuItems: (params) => [
            'copy',
            'copyWithHeaders',
            'paste',
            'separator',
            'export',
            'separator',
            {
                name: 'View Details',
                action: () => {
                    if (onRowSelected) {
                        onRowSelected({ data: params.node.data });
                    }
                }
            }
        ]
    }), [treeData, getDataPath, autoGroupColumnDef, masterDetail, detailCellRendererParams, densitySettings, onRowSelected]);

    // Quick filter handler
    const onQuickFilterChange = useCallback((e) => {
        setQuickFilterText(e.target.value);
    }, []);

    // Export to CSV
    const handleExport = useCallback(() => {
        if (gridRef.current?.api) {
            gridRef.current.api.exportDataAsCsv({
                fileName: `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`
            });
        }
    }, [title]);

    // Density toggle
    const cycleDensity = useCallback(() => {
        const densities = ['compact', 'standard', 'comfortable'];
        const currentIndex = densities.indexOf(currentDensity);
        const nextIndex = (currentIndex + 1) % densities.length;
        setCurrentDensity(densities[nextIndex]);
    }, [currentDensity]);

    // Grid ready handler
    const handleGridReady = useCallback((params) => {
        if (onGridReady) {
            onGridReady(params);
        }
    }, [onGridReady]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
        >
            {/* Toolbar */}
            {showToolbar && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                            {rowData.length} items
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Quick Filter */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                value={quickFilterText}
                                onChange={onQuickFilterChange}
                                placeholder="Quick search..."
                                className="pl-9 h-8 w-48 text-sm rounded-lg"
                            />
                        </div>

                        {/* Density Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={cycleDensity}
                            className="h-8 px-2"
                            title={`Density: ${currentDensity}`}
                        >
                            <Settings2 className="w-4 h-4" />
                        </Button>

                        {/* Export */}
                        {enableExport && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleExport}
                                className="h-8 px-2"
                                title="Export CSV"
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* AG Grid */}
            <div className="flex-1 ag-theme-quartz" style={{ minHeight: 400 }}>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDefMerged}
                    quickFilterText={quickFilterText}
                    onGridReady={handleGridReady}
                    onRowSelected={onRowSelected}
                    onCellValueChanged={onCellValueChanged}
                    {...gridOptions}
                />
            </div>

            {/* Density Indicator */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Density: {currentDensity.charAt(0).toUpperCase() + currentDensity.slice(1)}</span>
                <span>Row Height: {densitySettings.rowHeight}px</span>
            </div>
        </motion.div>
    );
}

// Status Cell Renderer
export function StatusCellRenderer({ value }) {
    const statusConfig = {
        'On Track': { color: '#2E7D32', bg: '#E8F5E9', shape: '●' },
        'At Risk': { color: '#EF6C00', bg: '#FFF3E0', shape: '▲' },
        'Off Track': { color: '#C62828', bg: '#FFEBEE', shape: '■' },
        'Completed': { color: '#455A64', bg: '#ECEFF1', shape: '✓' },
        'Pending': { color: '#1565C0', bg: '#E3F2FD', shape: '⏳' },
        'Planning': { color: '#7B1FA2', bg: '#F3E5F5', shape: '○' },
        'In Progress': { color: '#0288D1', bg: '#E1F5FE', shape: '▶' }
    };

    const config = statusConfig[value] || { color: '#666', bg: '#F5F5F5', shape: '○' };

    return (
        <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: config.bg, color: config.color }}
        >
            <span>{config.shape}</span>
            {value}
        </span>
    );
}

// Priority Cell Renderer
export function PriorityCellRenderer({ value }) {
    const priorityConfig = {
        'Critical': { color: '#C62828', weight: 'bold' },
        'Urgent': { color: '#D84315', weight: 'bold' },
        'High': { color: '#EF6C00', weight: 'medium' },
        'Medium': { color: '#1565C0', weight: 'normal' },
        'Low': { color: '#43A047', weight: 'normal' }
    };

    const config = priorityConfig[value] || { color: '#666', weight: 'normal' };

    return (
        <span style={{ color: config.color, fontWeight: config.weight === 'bold' ? 600 : 400 }}>
            {value}
        </span>
    );
}

// Progress Cell Renderer
export function ProgressCellRenderer({ value }) {
    const percentage = typeof value === 'number' ? value : 0;
    const color = percentage >= 80 ? '#2E7D32' : percentage >= 50 ? '#EF6C00' : '#C62828';

    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-xs font-medium text-slate-600 min-w-[36px]">
                {percentage}%
            </span>
        </div>
    );
}
