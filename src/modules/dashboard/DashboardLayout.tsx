import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { UserRole } from '../../types';
import {
    FileText,
    Users,
    Bell,
    LogOut,
    LayoutDashboard,
    Menu,
    X,
    ShieldCheck,
    AlertTriangle,
    Plus,
    Settings,
    Truck,
    ArrowUpRight,
    Activity,
    HeartHandshake,
    UserCheck,
    PanelLeftClose,
    PanelLeftOpen,
    MapPin
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // UI State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [activeChartTab, setActiveChartTab] = useState<'MES' | 'TRIMESTRE'>('MES');
    const [selectedCommunityHover, setSelectedCommunityHover] = useState<string | null>(null);

    // Simulated Active User & Role Switcher State
    const [currentUser, setCurrentUser] = useState({
        nombre: 'Dra. Carmen Silva Juárez',
        email: 'carmen.silva@salud.gob.mx',
        rol: UserRole.CAPTURISTA_TAMIZ as UserRole,
        jurisdiccion: 'Jurisdicción Sanitaria No. II',
    });

    const simulatedUsers = [
        {
            nombre: 'Dra. Carmen Silva Juárez',
            email: 'carmen.silva@salud.gob.mx',
            rol: UserRole.CAPTURISTA_TAMIZ as UserRole,
            jurisdiccion: 'Jurisdicción Sanitaria No. II',
        },
        {
            nombre: 'Dr. Alejandro Morales',
            email: 'admin.jurisdiccion2@salud.gob.mx',
            rol: UserRole.ADMIN_JURISDICCIONAL as UserRole,
            jurisdiccion: 'Jurisdicción Sanitaria No. II',
        },
        {
            nombre: 'Lic. María Elena Santiz',
            email: 'gestor.parteras@salud.gob.mx',
            rol: UserRole.GESTOR_PARTERAS as UserRole,
            jurisdiccion: 'Jurisdicción Sanitaria No. II',
        },
        {
            nombre: 'Doña Rosa Santiz Gómez',
            email: 'partera.rosa@comunidad.org',
            rol: UserRole.PARTERA_TRADICIONAL as UserRole,
            jurisdiccion: 'Comunidad San Juan Chamula',
        },
    ];

    const handleRoleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = simulatedUsers.find((u) => u.email === e.target.value);
        if (selected) {
            setCurrentUser(selected);
        }
    };

    const navItems = [
        { label: 'Inicio / Métricas', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Padrón de Parteras', path: '/parteras', icon: Users },
        { label: 'Registro de Tamiz', path: '/tamiz', icon: FileText },
        { label: 'Centro de Alertas', path: '/notificaciones', icon: Bell, badge: 3 },
    ];

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    // Mock Monthly Registration Data for Chart 1
    const monthlyTamizData = [
        { mes: 'Ene', cantidad: 110 },
        { mes: 'Feb', cantidad: 132 },
        { mes: 'Mar', cantidad: 125 },
        { mes: 'Abr', cantidad: 148 },
        { mes: 'May', cantidad: 160 },
        { mes: 'Jun', cantidad: 155 },
        { mes: 'Jul', cantidad: 172 },
        { mes: 'Ago', cantidad: 188 },
        { mes: 'Sep', cantidad: 195 },
    ];

    // Mock Births Distribution Data by Community for Chart 2 (Juchitán, Tehuantepec, Salina Cruz, Ixtepec, Chamula, Tenejapa)
    const communityBirthsData = [
        { comunidad: 'Juchitán', partos: 45, tamicesPct: 92 },
        { comunidad: 'Tehuantepec', partos: 38, tamicesPct: 88 },
        { comunidad: 'Salina Cruz', partos: 32, tamicesPct: 95 },
        { comunidad: 'Ixtepec', partos: 26, tamicesPct: 90 },
        { comunidad: 'Chamula', partos: 54, tamicesPct: 85 },
        { comunidad: 'Tenejapa', partos: 30, tamicesPct: 82 },
    ];

    const maxPartos = Math.max(...communityBirthsData.map((d) => d.partos));

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-teal-500 selection:text-white">

            {/* SIDEBAR DESKTOP COLAPSABLE */}
            <aside
                className={`hidden md:flex flex-col bg-slate-900 border-r border-slate-800 p-4 justify-between transition-all duration-300 shrink-0 ${sidebarCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                <div>
                    {/* Header Brand */}
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                        {!sidebarCollapsed ? (
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 p-0.5 shadow-lg shadow-teal-500/20 shrink-0">
                                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-teal-400 font-black text-sm">
                                        TP
                                    </div>
                                </div>
                                <div>
                                    <h2 className="font-bold text-sm text-white leading-snug truncate">Tamiz & Parteras</h2>
                                    <p className="text-[11px] text-slate-400 truncate">Jurisdicción No. II</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-base mx-auto">
                                TP
                            </div>
                        )}

                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
                        >
                            {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Rutas Principales */}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center justify-between px-3 py-3 rounded-xl text-xs font-bold transition-all ${active
                                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                    title={sidebarCollapsed ? item.label : undefined}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                                        {!sidebarCollapsed && <span>{item.label}</span>}
                                    </div>
                                    {!sidebarCollapsed && item.badge ? (
                                        <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            {item.badge}
                                        </span>
                                    ) : null}
                                </Link>
                            );
                        })}

                        {/* Configuración */}
                        <button
                            onClick={() => setShowConfigModal(true)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all text-left"
                            title={sidebarCollapsed ? 'Configuración' : undefined}
                        >
                            <Settings className="w-5 h-5 shrink-0 text-slate-400" />
                            {!sidebarCollapsed && <span>Configuración</span>}
                        </button>
                    </nav>
                </div>

                {/* Footer Sidebar: User Avatar & Logout */}
                <div className="pt-4 border-t border-slate-800">
                    {!sidebarCollapsed ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
                                <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-xs shrink-0">
                                    {currentUser.nombre.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-white truncate">{currentUser.nombre}</p>
                                    <p className="text-[10px] text-teal-400 truncate">{currentUser.rol}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl border border-rose-900/40 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="p-2.5 text-rose-400 hover:bg-rose-950/30 rounded-xl border border-rose-900/40 w-full flex justify-center"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </aside>

            {/* NAVBAR SUPERIOR RESPONSIVE */}
            <div className="flex-1 flex flex-col min-w-0">

                <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 sticky top-0 z-20 flex items-center justify-between gap-4">

                    {/* Logo & Marca Mobile */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-slate-400 hover:text-white"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <div className="flex items-center gap-2.5">
                            <ShieldCheck className="w-6 h-6 text-teal-400 shrink-0" />
                            <div>
                                <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider block">
                                    SECTOR SALUD • CHIAPAS
                                </span>
                                <h1 className="text-xs sm:text-sm font-black text-white leading-none">
                                    Gestión Tamiz & Parteras Tradicionales
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Selector de Usuario Simulado + Badges + Cerrar Sesión */}
                    <div className="hidden sm:flex items-center gap-3">

                        {/* Indicador de Rol Activo */}
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30">
                            Rol: {currentUser.rol.replace('_', ' ')}
                        </span>

                        {/* Simulación de Cambio de Usuario */}
                        <div className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-bold">Prueba:</span>
                            <select
                                value={currentUser.email}
                                onChange={handleRoleSwitch}
                                className="bg-transparent text-xs text-white focus:outline-none font-semibold"
                            >
                                {simulatedUsers.map((u) => (
                                    <option key={u.email} value={u.email} className="bg-slate-900 text-white">
                                        {u.nombre} ({u.rol})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notificaciones Quick Trigger */}
                        <Link
                            to="/notificaciones"
                            className="relative p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl hover:border-teal-500/40 transition-colors"
                            title="Notificaciones"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                                3
                            </span>
                        </Link>

                        {/* Botón Salir */}
                        <button
                            onClick={() => navigate('/login')}
                            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Salir</span>
                        </button>
                    </div>

                </header>

                {/* MENU DRAWER MOBILE */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2">
                        <div className="mb-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                            <p className="text-xs font-bold text-white">{currentUser.nombre}</p>
                            <p className="text-[10px] text-teal-400">{currentUser.rol}</p>
                        </div>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center justify-between px-3 py-3 rounded-xl text-xs font-bold ${active ? 'bg-teal-500 text-white' : 'text-slate-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge ? (
                                        <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
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
                            className="w-full flex items-center gap-3 px-3 py-3 text-xs text-rose-400 font-bold"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                )}

                {/* MAIN BODY AREA */}
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                    {location.pathname === '/dashboard' ? (
                        <div className="space-y-6 max-w-7xl mx-auto">

                            {/* Encabezado Bienvenida + Botones Rápidos */}
                            <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 p-6 rounded-3xl border border-teal-500/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs uppercase tracking-wider font-extrabold text-teal-400">
                                            Jurisdicción Sanitaria No. II
                                        </span>
                                        <span className="text-xs text-slate-500">•</span>
                                        <span className="text-xs text-slate-400">Altos & Istmo de Chiapas</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-white mt-1">
                                        Bienvenido, {currentUser.nombre.split(' ')[0]} {currentUser.nombre.split(' ')[1]}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Monitoreo en tiempo real del programa de Tamiz Neonatal y la Red Comunitaria de Parteras.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                                    <Link
                                        to="/tamiz"
                                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Nuevo Registro de Tamiz</span>
                                    </Link>

                                    <Link
                                        to="/parteras"
                                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <HeartHandshake className="w-4 h-4" />
                                        <span>Registrar Nueva Partera</span>
                                    </Link>
                                </div>
                            </div>

                            {/* 4 TARJETAS KPI DE MÉTRICAS RÁPIDAS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                                {/* KPI 1: Total Tamices */}
                                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-teal-500/40 transition-all">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-semibold text-slate-400">Total Tamices Registrados</span>
                                        <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-white mt-3">1,428</p>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-bold">
                                        <ArrowUpRight className="w-4 h-4" />
                                        <span>+12.4% este mes</span>
                                    </div>
                                </div>

                                {/* KPI 2: Muestras Pendientes en Tránsito */}
                                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-amber-500/40 transition-all">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-semibold text-slate-400">Muestras en Tránsito Lab</span>
                                        <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-amber-400 mt-3">184</p>
                                    <p className="text-[11px] text-slate-400 mt-2">Tarjetas de Guthrie en envío</p>
                                </div>

                                {/* KPI 3: Parteras Activas */}
                                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-semibold text-slate-400">Parteras Activas (Jurisdicción 2)</span>
                                        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                            <UserCheck className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-white mt-3">96</p>
                                    <p className="text-[11px] text-emerald-400 mt-2 font-semibold">100% acreditadas comunitarias</p>
                                </div>

                                {/* KPI 4: Alertas Sospechosas */}
                                <div className="bg-slate-900/90 p-5 rounded-2xl border border-rose-500/30 relative overflow-hidden group hover:border-rose-500/60 transition-all">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-semibold text-rose-300">Alertas de Muestras Sospechosas</span>
                                        <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl animate-pulse">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-rose-400 mt-3">5</p>
                                    <p className="text-[11px] text-rose-300 mt-2 font-bold">Se requiere re-toma inmediata</p>
                                </div>

                            </div>

                            {/* SECCIÓN DE GRÁFICOS DE VISUALIZACIÓN DE DATOS */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                {/* GRÁFICO 1: REGISTRO MENSUAL DE TAMICES (ÁREA INTERACTIVA SVG) */}
                                <div className="lg:col-span-7 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                                            <div>
                                                <h3 className="text-base font-black text-white flex items-center gap-2">
                                                    <Activity className="w-5 h-5 text-teal-400" />
                                                    <span>Registro Mensual de Tamices Neonatales</span>
                                                </h3>
                                                <p className="text-xs text-slate-400">Evolución de muestras recolectadas en 2026.</p>
                                            </div>

                                            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                                <button
                                                    onClick={() => setActiveChartTab('MES')}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${activeChartTab === 'MES' ? 'bg-teal-500 text-white' : 'text-slate-400'
                                                        }`}
                                                >
                                                    Mensual
                                                </button>
                                                <button
                                                    onClick={() => setActiveChartTab('TRIMESTRE')}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${activeChartTab === 'TRIMESTRE' ? 'bg-teal-500 text-white' : 'text-slate-400'
                                                        }`}
                                                >
                                                    Trimestral
                                                </button>
                                            </div>
                                        </div>

                                        {/* Contenedor del Gráfico de Área SVG */}
                                        <div className="h-56 w-full relative">
                                            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
                                                <defs>
                                                    <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                                                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                                                    </linearGradient>
                                                </defs>

                                                {/* Líneas de Cuadrícula Horizontal */}
                                                <line x1="0" y1="30" x2="500" y2="30" stroke="#334155" strokeDasharray="3 3" />
                                                <line x1="0" y1="80" x2="500" y2="80" stroke="#334155" strokeDasharray="3 3" />
                                                <line x1="0" y1="130" x2="500" y2="130" stroke="#334155" strokeDasharray="3 3" />

                                                {/* Área Rellenada */}
                                                <polygon
                                                    fill="url(#tealGradient)"
                                                    points="
                            0,150 
                            0,120 
                            60,105 
                            120,112 
                            180,85 
                            240,70 
                            300,75 
                            360,55 
                            420,40 
                            480,32 
                            480,150
                          "
                                                />

                                                {/* Línea Principal del Gráfico */}
                                                <polyline
                                                    fill="none"
                                                    stroke="#14b8a6"
                                                    strokeWidth="3.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    points="
                            0,120 
                            60,105 
                            120,112 
                            180,85 
                            240,70 
                            300,75 
                            360,55 
                            420,40 
                            480,32
                          "
                                                />

                                                {/* Puntos Interactivos */}
                                                {monthlyTamizData.map((d, index) => {
                                                    const x = index * 60;
                                                    const y = 150 - (d.cantidad / 220) * 130;
                                                    return (
                                                        <g key={d.mes} className="group cursor-pointer">
                                                            <circle
                                                                cx={x}
                                                                cy={y}
                                                                r="5"
                                                                className="fill-teal-400 stroke-slate-900 stroke-2 group-hover:r-7 transition-all"
                                                            />
                                                            <text
                                                                x={x}
                                                                y={y - 12}
                                                                textAnchor="middle"
                                                                className="fill-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                {d.cantidad}
                                                            </text>
                                                        </g>
                                                    );
                                                })}
                                            </svg>

                                            {/* Etiquetas de Meses en Eje X */}
                                            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2 px-1">
                                                {monthlyTamizData.map((d) => (
                                                    <span key={d.mes}>{d.mes}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                        <span>Muestras promedio mensual: <strong>153.8</strong></span>
                                        <span className="text-emerald-400 font-semibold">Meta Jurisdiccional Cumplida</span>
                                    </div>
                                </div>

                                {/* GRÁFICO 2: DISTRIBUCIÓN DE PARTOS POR COMUNIDAD (BARRAS TAILWIND) */}
                                <div className="lg:col-span-5 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                                    <div>
                                        <div className="mb-4">
                                            <h3 className="text-base font-black text-white flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-emerald-400" />
                                                <span>Partos por Comunidad (Parteras)</span>
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Atenciones en Juchitán, Tehuantepec, Salina Cruz, Ixtepec, Chamula y Tenejapa.
                                            </p>
                                        </div>

                                        {/* Lista de Barras de Progreso */}
                                        <div className="space-y-3.5">
                                            {communityBirthsData.map((item) => {
                                                const pctBar = (item.partos / maxPartos) * 100;
                                                const isHovered = selectedCommunityHover === item.comunidad;

                                                return (
                                                    <div
                                                        key={item.comunidad}
                                                        onMouseEnter={() => setSelectedCommunityHover(item.comunidad)}
                                                        onMouseLeave={() => setSelectedCommunityHover(null)}
                                                        className="space-y-1 group cursor-pointer"
                                                    >
                                                        <div className="flex justify-between text-xs">
                                                            <span className={`font-bold transition-colors ${isHovered ? 'text-emerald-300' : 'text-slate-200'}`}>
                                                                {item.comunidad}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-extrabold text-white">{item.partos} partos</span>
                                                                <span className="text-[10px] text-teal-400 font-semibold">({item.tamicesPct}% tamizados)</span>
                                                            </div>
                                                        </div>

                                                        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                                            <div
                                                                style={{ width: `${pctBar}%` }}
                                                                className={`h-full rounded-full transition-all duration-500 ${isHovered ? 'bg-emerald-400 shadow-md shadow-emerald-400/50' : 'bg-gradient-to-r from-emerald-600 to-teal-500'
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                                        <span>Total Atenciones Comunitarias: <strong>233</strong></span>
                                        <Link to="/parteras" className="text-emerald-400 font-bold hover:underline">Ver Padrón &rarr;</Link>
                                    </div>
                                </div>

                            </div>

                            {/* SECCIÓN DE ALERTAS RECIENTES Y ACCESOS RÁPIDOS */}
                            <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <h3 className="font-black text-base text-white flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-rose-400" />
                                        <span>Últimas Alertas Críticas del Sistema</span>
                                    </h3>
                                    <Link to="/notificaciones" className="text-xs font-bold text-teal-400 hover:underline">
                                        Ver Centro de Alertas Completas
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* Alerta 1 */}
                                    <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                                                RE-TOMA URGENTE
                                            </span>
                                            <span className="text-[10px] text-slate-400">Hace 15 min</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-white">Muestra M-1092 Muestra Coagulada</h4>
                                        <p className="text-[11px] text-slate-300">
                                            RN Gómez Santiz en Chamula requiere re-toma inmediata por coagulación en Tarjeta de Guthrie.
                                        </p>
                                        <button className="text-[11px] font-bold text-rose-300 hover:underline pt-1">
                                            Gestionar Re-Toma &rarr;
                                        </button>
                                    </div>

                                    {/* Alerta 2 */}
                                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                                REFERENCIA COMUNITARIA
                                            </span>
                                            <span className="text-[10px] text-slate-400">Hace 1 hora</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-white">Riesgo Materno en Tenejapa</h4>
                                        <p className="text-[11px] text-slate-300">
                                            Doña Juana López emitió referencia por presión arterial elevada en embarazo de 36 SDG.
                                        </p>
                                        <button className="text-[11px] font-bold text-amber-300 hover:underline pt-1">
                                            Ver Ficha de Referencia &rarr;
                                        </button>
                                    </div>

                                    {/* Alerta 3 */}
                                    <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/40 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                                                LABORATORIO ESTATAL
                                            </span>
                                            <span className="text-[10px] text-slate-400">Hace 3 horas</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-white">Lote L-2026 Recibido</h4>
                                        <p className="text-[11px] text-slate-300">
                                            El Laboratorio Central confirmó la recepción de 45 muestras de la Jurisdicción II.
                                        </p>
                                        <button className="text-[11px] font-bold text-teal-300 hover:underline pt-1">
                                            Ver Código de Rastreo &rarr;
                                        </button>
                                    </div>

                                </div>
                            </div>

                        </div>
                    ) : (
                        <Outlet />
                    )}
                </main>
            </div>

            {/* MODAL DE CONFIGURACIÓN Y ACCESIBILIDAD */}
            {showConfigModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-teal-400" />
                                <span>Configuración del Sistema</span>
                            </h3>
                            <button
                                onClick={() => setShowConfigModal(false)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-400 mb-1">Jurisdicción Sanitaria Asignada</label>
                                <input
                                    type="text"
                                    disabled
                                    value="Jurisdicción Sanitaria No. II - Altos de Chiapas"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-1">Modo de Accesibilidad Visual</label>
                                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                                    <option>Normal (Estándar Web)</option>
                                    <option>Alto Contraste (WCAG 2.1 AAA)</option>
                                    <option>Texto Grande para Comunidad</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-1">Alertas Emergentes</label>
                                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                    <span className="text-slate-200">Notificaciones de Re-Muestras Urgentes</span>
                                    <input type="checkbox" defaultChecked className="accent-teal-500 w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-3">
                            <button
                                onClick={() => setShowConfigModal(false)}
                                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs rounded-xl"
                            >
                                Guardar Preferencias
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
