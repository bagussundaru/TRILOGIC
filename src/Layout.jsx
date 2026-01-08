import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
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
    FolderKanban,
    BarChart3,
    Settings,
    Menu,
    LogOut,
    User,
    Users,
    ChevronDown,
    Sparkles,
    Search,
    Bell,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const loadUser = async () => {
            const userData = await base44.auth.me();
            setUser(userData);
        };
        loadUser();
    }, []);

    // Scroll detection for sticky header effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigation = [
        { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
        { name: 'Implementations', page: 'Implementations', icon: FolderKanban },
        { name: 'Resources', page: 'Resources', icon: Users },
        { name: 'Reports', page: 'Reports', icon: BarChart3 },
        { name: 'Automation', page: 'Automation', icon: Sparkles },
    ];

    const isActive = (pageName) => currentPageName === pageName;

    const NavItem = ({ item, mobile = false, index = 0 }) => {
        const active = isActive(item.page);
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
            >
                <Link
                    to={createPageUrl(item.page)}
                    onClick={() => mobile && setMobileOpen(false)}
                    className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 ${active
                        ? 'bg-gradient-to-r from-teal-600 to-teal-500 shadow-lg shadow-teal-500/25 text-white'
                        : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-lg hover:shadow-slate-200/60'
                        }`}
                >
                    <item.icon className={`w-5 h-5 transition-all duration-300 ${active
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-teal-600 group-hover:scale-110'}`}
                    />
                    <span className={`font-medium tracking-tight ${active ? 'text-white' : ''}`}>
                        {item.name}
                    </span>

                    {/* Hover Indicator */}
                    {!active && (
                        <div className="absolute right-4 w-2 h-2 rounded-full bg-teal-500 opacity-0 scale-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" />
                    )}
                </Link>
            </motion.div>
        );
    };

    const Sidebar = ({ mobile = false }) => (
        <div className={`flex flex-col h-full ${mobile ? 'bg-white' : 'bg-slate-50/80 p-4'}`}>
            {/* Floating Container */}
            <div className={`flex flex-col h-full ${mobile
                ? ''
                : 'bg-white rounded-[1.75rem] shadow-xl shadow-slate-200/60 border border-slate-100/80 backdrop-blur-sm'}`}
            >

                {/* Logo Area - Maximum Visual Impact */}
                <div className="p-8 pb-6">
                    <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3.5 group">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 3 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/30"
                        >
                            <Sparkles className="w-5 h-5 text-white" />
                        </motion.div>
                        <div className="leading-tight">
                            <span className="font-bold text-slate-800 text-lg tracking-tight">Smart</span>
                            <span className="font-bold text-teal-600 text-lg tracking-tight ml-1">TRILOGIC</span>
                        </div>
                    </Link>
                </div>

                {/* Search Bar - Subtle Affordance */}
                <div className="px-6 mb-6">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400 group-hover:text-teal-500 transition-colors duration-200" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-12 py-2.5 border border-slate-100 rounded-xl bg-slate-50/80 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 focus:bg-white transition-all duration-200 hover:bg-slate-100/80 cursor-text"
                            placeholder="Quick find..."
                        />
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                            <kbd className="text-[10px] text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
                        </div>
                    </div>
                </div>

                {/* Navigation - Clear Hierarchy */}
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold px-4 mb-3">
                        Main Menu
                    </p>
                    {navigation.map((item, index) => (
                        <NavItem key={item.name} item={item} mobile={mobile} index={index} />
                    ))}
                </nav>

                {/* User Section - Trust Signal */}
                {user && (
                    <div className="p-4 mt-auto">
                        <div className="border-t border-slate-100 pt-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-slate-50 transition-all duration-200 group">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-md group-hover:shadow-lg transition-shadow ring-2 ring-slate-100">
                                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold text-sm">
                                                {user.full_name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-900">
                                                {user.full_name}
                                            </p>
                                            <p className="text-xs text-slate-400 truncate group-hover:text-teal-600 transition-colors">
                                                Project Manager
                                            </p>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-slate-100 p-2">
                                    <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5">
                                        <User className="w-4 h-4 mr-2.5" /> My Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5">
                                        <Settings className="w-4 h-4 mr-2.5" /> Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-2" />
                                    <DropdownMenuItem
                                        className="rounded-xl cursor-pointer py-2.5 text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                        onClick={() => base44.auth.logout()}
                                    >
                                        <LogOut className="w-4 h-4 mr-2.5" /> Sign Out
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex selection:bg-teal-100 selection:text-teal-900 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-72 h-screen">
                <Sidebar />
            </aside>

            {/* Mobile Header - Sticky with Backdrop Blur */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`lg:hidden fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled
                        ? 'h-16 bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50'
                        : 'h-16 bg-white/80 backdrop-blur-md border-b border-slate-100'
                    }`}
            >
                <div className="h-full px-4 flex items-center justify-between">
                    <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-md">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-slate-900 tracking-tight">Trilogic</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* Notification Bell */}
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 relative">
                            <Bell className="w-5 h-5 text-slate-500" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                        </Button>

                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                                    <Menu className="w-5 h-5 text-slate-600" />
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
                        key={location.pathname}
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