import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { HardHat, Info } from 'lucide-react';
import { useCivil } from '@/contexts/CivilContext';

// Import all construction components
import WBSBuilder from '@/components/construction/WBSBuilder';
import BOQManager from '@/components/construction/BOQManager';
import SCurveDashboard from '@/components/construction/SCurveDashboard';
import DailyReportForm from '@/components/construction/DailyReportForm';
import PaymentCertificateManager from '@/components/construction/PaymentCertificateManager';
import SitePhotoGallery from '@/components/construction/SitePhotoGallery';
import RABBuilder from '@/components/construction/RABBuilder';
import MaterialPriceTracker from '@/components/construction/MaterialPriceTracker';
import RFIManager from '@/components/construction/RFIManager';
import IssueTracker from '@/components/construction/IssueTracker';
import MeetingMinutes from '@/components/construction/MeetingMinutes';
import SubcontractorRating from '@/components/construction/SubcontractorRating';

export default function Construction() {
    const { projects } = useCivil();
    const [searchParams] = useSearchParams();

    // Directly derive active module from URL search params so sidebar navigation reacts 100% instantly
    const activeModule = searchParams.get('module') || 'wbs';
    const selectedProject = projects[0];

    const renderActiveModule = () => {
        if (!selectedProject) return null;

        const props = {
            projectId: selectedProject.id,
            projectName: selectedProject.name
        };

        switch (activeModule) {
            case 'wbs': return <WBSBuilder {...props} />;
            case 'boq': return <BOQManager {...props} />;
            case 's-curve': return <SCurveDashboard {...props} />;
            case 'daily': return <DailyReportForm {...props} />;
            case 'payment': return <PaymentCertificateManager {...props} />;
            case 'photos': return <SitePhotoGallery {...props} />;
            case 'rab': return <RABBuilder {...props} />;
            case 'materials': return <MaterialPriceTracker />;
            case 'rfi': return <RFIManager {...props} />;
            case 'issues': return <IssueTracker {...props} />;
            case 'meetings': return <MeetingMinutes {...props} />;
            case 'subcon': return <SubcontractorRating {...props} />;
            default: return <WBSBuilder {...props} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white">
                <div className="max-w-[1800px] mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                                <HardHat className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Modul Konstruksi Teknik Sipil</h1>
                                <p className="text-amber-300 text-sm font-semibold">Dokumen Teknis: TKS-KOS-TBL-001 (Rev 2.0)</p>
                            </div>
                        </div>

                        {/* Selected Project Card */}
                        {selectedProject && (
                            <div className="bg-slate-800/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl text-xs space-y-1 max-w-lg">
                                <div className="font-extrabold text-amber-400">[{selectedProject.code}] {selectedProject.name}</div>
                                <div className="text-slate-300 flex justify-between gap-4">
                                    <span>Lahan: <strong>{selectedProject.landArea}</strong></span>
                                    <span>Bangunan: <strong>{selectedProject.buildingArea}</strong></span>
                                    <span>CAPEX: <strong>Rp 2,346 Miliar</strong></span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Technical Specifications Bar */}
            {selectedProject && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-xs text-amber-950 font-semibold">
                    <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5"><Info className="w-4 h-4 text-amber-700" /> Spesifikasi Teknis Sipil Tembalang:</span>
                        <span>Beton K-250: <strong>{selectedProject.concreteVolume}</strong></span>
                        <span>Pembesian: <strong>{selectedProject.steelWeight}</strong></span>
                        <span>Pondasi: <strong>{selectedProject.foundation}</strong></span>
                        <span>Dinding: <strong>{selectedProject.wallMaterial}</strong></span>
                    </div>
                </div>
            )}

            {/* Content Area - Driven strictly by Sidebar Selection */}
            <div className="max-w-[1800px] mx-auto px-6 py-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeModule}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderActiveModule()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
