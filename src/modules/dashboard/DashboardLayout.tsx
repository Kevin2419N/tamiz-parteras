import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    FileText,
    Users,
    Calendar,
    Bell,
    LogOut,
    LayoutDashboard,
    ChevronRight,
    Menu,
    X,
    Building,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadNotificationsCount] = useState(3);

    const navItems = [
        { label: 'Panel Principal', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Registro de Tamiz', path: '/tamiz', icon: FileText },
        { label: 'Padrón de Parteras', path: '/parteras', icon: Users },
        { label: 'Calendario de Atención', path: '/parteras/calendario', icon: Calendar },
        { label: 'Centro de Alertas', path: '/notificaciones', icon: Bell, badge: unreadNotificationsCount },
    ];

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">

            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 p-4 justify-between shrink-0">
                <div>
                    {/* Logo Brand */}
                    <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-xl">
                            TP
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-white leading-snug">Tamiz & Parteras</h2>
                            <p className="text-xs text-slate-400">Gestión Operativa</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all ${active
                                            ? 'bg-teal-500 text-white font-semibold shadow-lg shadow-teal-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge ? (
                                        <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                            {item.badge}
                                        </span>
                                    ) : null}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Card & Logout */}
                <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-teal-300 font-bold text-xs">
                            CS
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">Dra. Carmen Silva</p>
                            <p className="text-[10px] text-slate-400 truncate">Jurisdicción I - San Cristóbal</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl border border-rose-900/40 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Header Mobile */}
            <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-base">
                        TP
                    </div>
                    <span className="font-bold text-sm text-white">Tamiz & Parteras</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 text-slate-400 hover:text-white"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium ${active ? 'bg-teal-500 text-white' : 'text-slate-400'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge ? (
                                    <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate('/login');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm text-rose-400"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Navbar */}
                <header className="hidden md:flex items-center justify-between h-16 px-6 bg-slate-950/60 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        <Building className="w-4 h-4 text-teal-400" />
                        <span>Jurisdicción II Altos • San Cristóbal de las Casas</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-slate-200 font-medium">Panel Operativo</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/notificaciones"
                            className="relative p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {unreadNotificationsCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </header>

                {/* Main Content Body */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {location.pathname === '/dashboard' ? (
                        <div className="space-y-6 max-w-7xl mx-auto">

                            {/* Header Welcome */}
                            <div className="bg-gradient-to-r from-teal-900/60 via-slate-900 to-emerald-950/40 p-6 rounded-3xl border border-teal-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-teal-400 font-bold">Resumen de Operación</span>
                                    <h1 className="text-2xl font-extrabold text-white mt-1">Gestión de Tamiz & Red de Parteras</h1>
                                    <p className="text-xs text-slate-400 mt-1">Monitoreo en tiempo real de muestras recolectadas y padrón de parteras comunitarias.</p>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        to="/tamiz"
                                        className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Nuevo Registro Tamiz
                                    </Link>
                                    <Link
                                        to="/parteras/calendario"
                                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Abrir Wizard de Atención
                                    </Link>
                                </div>
                            </div>

                            {/* KPI Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-semibold text-slate-400">Total Folios Tamiz</span>
                                        <span className="p-2 bg-teal-500/10 text-teal-400 rounded-xl"><FileText className="w-4 h-4" /></span>
                                    </div>
                                    <p className="text-2xl font-bold text-white mt-2">1,248</p>
                                    <div className="flex items-center gap-1 text-[11px] text-teal-400 mt-2 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>94.2% con muestra recolectada</span>
                                    </div>
                                </div>

                                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-semibold text-slate-400">Parteras Activas</span>
                                        <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl"><Users className="w-4 h-4" /></span>
                                    </div>
                                    <p className="text-2xl font-bold text-white mt-2">84</p>
                                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Comunidades de los Altos</span>
                                    </div>
                                </div>

                                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-semibold text-slate-400">Muestras en Laboratorio</span>
                                        <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><CheckCircle2 className="w-4 h-4" /></span>
                                    </div>
                                    <p className="text-2xl font-bold text-white mt-2">312</p>
                                    <p className="text-[11px] text-slate-400 mt-2">En proceso de análisis genético</p>
                                </div>

                                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-semibold text-slate-400">Alertas Críticas</span>
                                        <span className="p-2 bg-rose-500/10 text-rose-400 rounded-xl"><AlertTriangle className="w-4 h-4" /></span>
                                    </div>
                                    <p className="text-2xl font-bold text-rose-400 mt-2">3</p>
                                    <p className="text-[11px] text-rose-300 mt-2 font-medium">Re-muestras urgentes solicitadas</p>
                                </div>
                            </div>

                            {/* Modules Quick Access Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Link to="/tamiz" className="group bg-slate-950/60 p-6 rounded-2xl border border-slate-800 hover:border-teal-500/50 transition-all">
                                    <FileText className="w-8 h-8 text-teal-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-base text-white group-hover:text-teal-300">Registro & Folios de Tamiz</h3>
                                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                        Gestión de folios de muestra, gotas en papel filtro y seguimiento a laboratorios estatales.
                                    </p>
                                </Link>

                                <Link to="/parteras" className="group bg-slate-950/60 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all">
                                    <Users className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-base text-white group-hover:text-emerald-300">Padrón de Parteras Tradicionales</h3>
                                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                        Directorio institucional, credencialización comunitaria y fichas de seguimiento por región.
                                    </p>
                                </Link>

                                <Link to="/parteras/calendario" className="group bg-slate-950/60 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all">
                                    <Calendar className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-base text-white group-hover:text-amber-300">Wizard de Atención Etapa Materna</h3>
                                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                        Guía de asistencia comunitaria paso a paso para Embarazo, Parto y desarrollo hasta los 2 años.
                                    </p>
                                </Link>
                            </div>

                        </div>
                    ) : (
                        <Outlet />
                    )}
                </main>
            </div>

        </div>
    );
};
