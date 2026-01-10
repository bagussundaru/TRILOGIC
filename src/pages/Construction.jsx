import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
    HardHat, TreePine, FileSpreadsheet, TrendingUp, ClipboardList,
    Receipt, Camera, DollarSign, Package, HelpCircle, AlertTriangle,
    Calendar, Users, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

const API_BASE = 'http://103.189.234.15:3001/api';

// Module configurations
const MODULES = [
    { id: 'wbs', name: 'WBS', icon: TreePine, color: 'from-blue-600 to-blue-500', category: 'core' },
    { id: 'boq', name: 'BOQ', icon: FileSpreadsheet, color: 'from-emerald-600 to-emerald-500', category: 'core' },
    { id: 's-curve', name: 'S-Curve', icon: TrendingUp, color: 'from-purple-600 to-purple-500', category: 'core' },
    { id: 'daily', name: 'Daily Report', icon: ClipboardList, color: 'from-orange-600 to-orange-500', category: 'core' },
    { id: 'payment', name: 'Payment Cert', icon: Receipt, color: 'from-rose-600 to-rose-500', category: 'core' },
    { id: 'photos', name: 'Site Photos', icon: Camera, color: 'from-pink-600 to-pink-500', category: 'core' },
    { id: 'rab', name: 'RAB', icon: DollarSign, color: 'from-indigo-600 to-indigo-500', category: 'pm' },
    { id: 'materials', name: 'Price Tracker', icon: Package, color: 'from-green-600 to-green-500', category: 'pm' },
    { id: 'rfi', name: 'RFI', icon: HelpCircle, color: 'from-cyan-600 to-cyan-500', category: 'pm' },
    { id: 'issues', name: 'Issues/NCR', icon: AlertTriangle, color: 'from-red-600 to-red-500', category: 'pm' },
    { id: 'meetings', name: 'Meetings', icon: Calendar, color: 'from-violet-600 to-violet-500', category: 'pm' },
    { id: 'subcon', name: 'Subcontractors', icon: Users, color: 'from-teal-600 to-teal-500', category: 'pm' },
];

export default function Construction() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeModule, setActiveModule] = useState(searchParams.get('module') || 'wbs');
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('trilogic_token');
                const res = await fetch(`${API_BASE}/projects`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success && data.data.length > 0) {
                    setProjects(data.data);
                    setSelectedProject(data.data[0]);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Update URL when module changes
    useEffect(() => {
        setSearchParams({ module: activeModule });
    }, [activeModule, setSearchParams]);

    const renderActiveModule = () => {
        if (!selectedProject) {
            return (
                <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                    <HardHat className="w-16 h-16 mb-4" />
                    <p className="text-lg">Pilih proyek untuk memulai</p>
                </div>
            );
        }

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

    const coreModules = MODULES.filter(m => m.category === 'core');
    const pmModules = MODULES.filter(m => m.category === 'pm');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="max-w-[1800px] mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                                <HardHat className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Construction PMO</h1>
                                <p className="text-slate-400 text-sm">Enterprise Project Management</p>
                            </div>
                        </div>

                        {/* Project Selector */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400">Proyek:</span>
                            <select
                                value={selectedProject?.id || ''}
                                onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value))}
                                className="bg-slate-700 text-white px-4 py-2 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Module Navigation */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-[1800px] mx-auto px-6">
                    <div className="flex gap-6 py-3">
                        {/* Core Modules */}
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400 uppercase tracking-wider mr-2">Core</span>
                            {coreModules.map(module => {
                                const Icon = module.icon;
                                const isActive = activeModule === module.id;

                                return (
                                    <button
                                        key={module.id}
                                        onClick={() => setActiveModule(module.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                                                ? `bg-gradient-to-r ${module.color} text-white shadow-lg`
                                                : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {module.name}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="w-px bg-slate-200" />

                        {/* PM Modules */}
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400 uppercase tracking-wider mr-2">PM Tools</span>
                            {pmModules.map(module => {
                                const Icon = module.icon;
                                const isActive = activeModule === module.id;

                                return (
                                    <button
                                        key={module.id}
                                        onClick={() => setActiveModule(module.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                                                ? `bg-gradient-to-r ${module.color} text-white shadow-lg`
                                                : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {module.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1800px] mx-auto px-6 py-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeModule}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center h-96">
                                <div className="animate-spin w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full" />
                            </div>
                        ) : (
                            renderActiveModule()
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
