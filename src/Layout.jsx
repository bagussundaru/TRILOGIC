import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    LayoutDashboard,
    HardHat,
    ClipboardList,
    Wallet,
    Camera,
    TreePine,
    FileSpreadsheet,
    TrendingUp,
    Receipt,
    DollarSign,
    Package,
    HelpCircle,
    AlertTriangle,
    Calendar,
    Users,
    Menu,
    LogOut,
    User,
    ChevronDown,
    Building2,
    Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from './contexts/AuthContext';

export default function Layout({ children, currentPageName }) {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Scroll detection for sticky header effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const currentSearchParams = new URLSearchParams(location.search);
    const currentModule = currentSearchParams.get('module') || 'wbs';

    const mainNavigation = [
        { name: 'Dashboard PMO Sipil', path: '/dashboard', pageName: 'Dashboard', icon: LayoutDashboard },
        { name: 'Laporan Harian Lapangan', path: '/daily-logs', pageName: 'DailyLogs', icon: ClipboardList },
        { name: 'Arus Kas & MC (Termyn)', path: '/cashflow', pageName: 'CashFlow', icon: Wallet },
        { name: 'Dokumentasi Foto Pekerjaan', path: '/photo-gallery', pageName: 'PhotoGallery', icon: Camera },
    ];

    const constructionSubModules = [
        { name: 'WBS (Struktur Pekerjaan)', module: 'wbs', icon: TreePine, color: 'text-blue-500' },
        { name: 'BOQ (Volume & Satuan)', module: 'boq', icon: FileSpreadsheet, color: 'text-emerald-500' },
        { name: 'Kurva S (Progress Fisik)', module: 's-curve', icon: TrendingUp, color: 'text-purple-500' },
        { name: 'RAB & AHSP (Biaya)', module: 'rab', icon: DollarSign, color: 'text-indigo-500' },
        { name: 'Harga Material Semarang', module: 'materials', icon: Package, color: 'text-green-500' },
        { name: 'RFI (Gambar & Teknis)', module: 'rfi', icon: HelpCircle, color: 'text-cyan-500' },
        { name: 'Kendala & K3 (NCR)', module: 'issues', icon: AlertTriangle, color: 'text-rose-500' },
        { name: 'Rapat Direksi / Owner', module: 'meetings', icon: Calendar, color: 'text-violet-500' },
        { name: 'Subkontraktor & Mandor', module: 'subcon', icon: Users, color: 'text-teal-500' },
    ];

    const Sidebar = ({ mobile = false }) => (
        <div className={`flex flex-col h-full ${mobile ? 'bg-white' : 'bg-slate-50/80 p-4'}`}>
            <div className={`flex flex-col h-full ${mobile
                ? ''
                : 'bg-white rounded-[1.75rem] shadow-xl shadow-slate-200/60 border border-slate-100/80 backdrop-blur-sm'}`}
            >
                {/* Logo Area */}
                <div className="p-5 pb-3">
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 3 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
                        >
                            <HardHat className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="leading-tight">
                            <span className="font-extrabold text-slate-900 text-lg tracking-tight">TRILOGIC</span>
                            <span className="block text-[10px] font-bold text-amber-600 uppercase tracking-widest">Civil PMO 360°</span>
                        </div>
                    </Link>
                </div>

                {/* Quick info */}
                <div className="px-5 mb-3">
                    <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl text-xs text-amber-950 font-bold flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="truncate">TKS-KOS-TBL-001 (Tembalang)</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 space-y-4 overflow-y-auto custom-scrollbar pb-6">
                    {/* Section 1: Main Menu */}
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 mb-2">
                            Menu Utama Sipil
                        </p>
                        <div className="space-y-1">
                            {mainNavigation.map(item => {
                                const active = location.pathname === item.path;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => mobile && setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${active
                                            ? 'bg-gradient-to-r from-amber-600 to-orange-500 shadow-md text-white font-bold'
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
                                        <span className="text-xs">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section 2: Construction Sub-Modules */}
                    <div>
                        <div className="flex items-center justify-between px-3 mb-2">
                            <p className="text-[10px] uppercase tracking-widest text-amber-600 font-extrabold flex items-center gap-1">
                                <Layers className="w-3 h-3" /> Modul Teknik Sipil
                            </p>
                        </div>
                        <div className="space-y-1">
                            {constructionSubModules.map(sub => {
                                const isConstructionPage = location.pathname === '/construction';
                                const active = isConstructionPage && currentModule === sub.module;
                                const Icon = sub.icon;
                                return (
                                    <Link
                                        key={sub.module}
                                        to={`/construction?module=${sub.module}`}
                                        onClick={() => mobile && setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${active
                                            ? 'bg-slate-900 text-white shadow-md font-bold'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : sub.color}`} />
                                        <span className="text-xs truncate">{sub.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* User Section */}
                {user && (
                    <div className="p-3 mt-auto">
                        <div className="border-t border-slate-100 pt-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 transition-all group">
                                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-2 ring-amber-100">
                                            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-xs">
                                                {user.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-[10px] text-amber-600 font-semibold truncate">
                                                {user.role || 'Site Manager'}
                                            </p>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-slate-100 p-2">
                                    <DropdownMenuItem className="rounded-xl py-2 font-medium text-xs">
                                        <User className="w-4 h-4 mr-2" /> Profil Pengguna
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-1" />
                                    <DropdownMenuItem
                                        className="rounded-xl py-2 text-rose-600 font-semibold focus:text-rose-700 focus:bg-rose-50 text-xs"
                                        onClick={logout}
                                    >
                                        <LogOut className="w-4 h-4 mr-2" /> Keluar (Sign Out)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex selection:bg-amber-100 selection:text-amber-900 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-72 h-screen">
                <Sidebar />
            </aside>

            {/* Mobile Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`lg:hidden fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled
                    ? 'h-16 bg-white/95 backdrop-blur-xl shadow-md'
                    : 'h-16 bg-white/90 backdrop-blur-md border-b border-slate-100'
                    }`}
            >
                <div className="h-full px-4 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                            <HardHat className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-extrabold text-slate-900 tracking-tight">TRILOGIC Sipil</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                                    <Menu className="w-5 h-5 text-slate-700" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-80 bg-white border-none shadow-2xl">
                                <Sidebar mobile />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </motion.header>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 h-screen overflow-y-auto scroll-smooth">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname + location.search}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="min-h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}