import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
    FileText,
    Users,
    Bell,
    LogOut,
    LayoutDashboard,
    Menu,
    X,
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
    const { logout } = useAuth();

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
        jurisdiccion: 'Jurisdicción Sanitaria No. 2 - Istmo',
    });

    const simulatedUsers = [
        {
            nombre: 'Dra. Carmen Silva Juárez',
            email: 'carmen.silva@salud.gob.mx',
            rol: UserRole.CAPTURISTA_TAMIZ as UserRole,
            jurisdiccion: 'Jurisdicción Sanitaria No. 2 - Istmo',
        },
        {
            nombre: 'Dr. Alejandro Morales',
            email: 'admin.jurisdiccion2@salud.gob.mx',
            rol: UserRole.ADMIN_JURISDICCIONAL as UserRole,
            jurisdiccion: 'Jurisdicción Sanitaria No. 2 - Istmo',
        },
        {
            nombre: 'Lic. María Elena Santiz',
            email: 'gestor.parteras@salud.gob.mx',
            rol: UserRole.GESTOR_PARTERAS as UserRole,
            jurisdiccion: 'Jurisdicción Sanitaria No. 2 - Istmo',
        },
        {
            nombre: 'Doña Rosa Santiz Gómez',
            email: 'partera.rosa@comunidad.org',
            rol: UserRole.PARTERA_TRADICIONAL as UserRole,
            jurisdiccion: 'Comunidad Juchitán de Zaragoza',
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

    // Mock Births Distribution Data by Community for Chart 2 (Juchitán, Tehuantepec, Salina Cruz, Ciudad Ixtepec, San Blas Atempa, Asunción Ixtaltepec, Espinal)
    const communityBirthsData = [
        { comunidad: 'Juchitán', partos: 45, tamicesPct: 92 },
        { comunidad: 'Tehuantepec', partos: 38, tamicesPct: 88 },
        { comunidad: 'Salina Cruz', partos: 32, tamicesPct: 95 },
        { comunidad: 'Ciudad Ixtepec', partos: 26, tamicesPct: 90 },
        { comunidad: 'San Blas Atempa', partos: 35, tamicesPct: 86 },
        { comunidad: 'Asunción Ixtaltepec', partos: 28, tamicesPct: 84 },
        { comunidad: 'Espinal', partos: 22, tamicesPct: 89 },
    ];

    const maxPartos = Math.max(...communityBirthsData.map((d) => d.partos));

    return (
        <div className="min-h-screen bg-slate-100/80 text-slate-800 flex flex-col md:flex-row selection:bg-emerald-600 selection:text-white">

            {/* SIDEBAR DESKTOP COLAPSABLE (MODO CLARO) */}
            <aside
                className={`hidden md:flex flex-col bg-white border-r border-slate-200/90 p-4 justify-between transition-all duration-300 shrink-0 shadow-sm ${sidebarCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                <div>
                    {/* Header Brand */}
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
                        {!sidebarCollapsed ? (
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9D2449] to-[#7A1B38] p-0.5 shadow-md shadow-[#9D2449]/20 shrink-0">
                                    <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-[#9D2449] font-black text-sm">
                                        TP
                                    </div>
                                </div>
                                <div>
                                    <h2 className="font-black text-sm text-slate-900 leading-snug truncate">Tamiz & Parteras</h2>
                                    <p className="text-[11px] font-semibold text-[#9D2449] truncate">Jurisdicción No. 2 - Istmo</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#9D2449] font-bold text-base mx-auto">
                                TP
                            </div>
                        )}

                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
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
                                        ? 'bg-[#9D2449] text-white shadow-md shadow-[#9D2449]/20'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    title={sidebarCollapsed ? item.label : undefined}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
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
                        <Link
                            to="/configuracion"
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${isActive('/configuracion')
                                ? 'bg-[#9D2449] text-white shadow-md shadow-[#9D2449]/20'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            title={sidebarCollapsed ? 'Configuración' : undefined}
                        >
                            <Settings className={`w-5 h-5 shrink-0 ${isActive('/configuracion') ? 'text-white' : 'text-slate-500'}`} />
                            {!sidebarCollapsed && <span>Configuración</span>}
                        </Link>
                    </nav>
                </div>

                {/* Footer Sidebar: User Avatar & Logout */}
                <div className="pt-4 border-t border-slate-200">
                    {!sidebarCollapsed ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0">
                                    {currentUser.nombre.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.nombre}</p>
                                    <p className="text-[10px] font-semibold text-teal-700 truncate">{currentUser.rol}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/');
                                }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                logout();
                                navigate('/');
                            }}
                            className="p-2.5 text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 w-full flex justify-center"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </aside>

            {/* NAVBAR SUPERIOR RESPONSIVE (MODO CLARO) */}
            <div className="flex-1 flex flex-col min-w-0">

                <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-20 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 shadow-sm text-center">

                    {/* Botón de Menú Móvil & Controles Rápidos */}
                    <div className="md:hidden flex items-center justify-between w-full border-b border-slate-100 pb-2">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title="Menú"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {currentUser.rol.replace('_', ' ')}
                            </span>
                            <Link
                                to="/notificaciones"
                                className="relative p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg"
                                title="Notificaciones"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                    3
                                </span>
                            </Link>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/');
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                                title="Salir"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Fila de Logos Responsiva */}
                    <div className="flex items-center justify-center gap-6 md:contents">
                        <img
                            src="/logo-jurisdiccion.png"
                            alt="Logo Jurisdicción Sanitaria No. 2 Istmo"
                            loading="eager"
                            fetchPriority="high"
                            className="h-12 md:h-16 w-auto object-contain shrink-0 md:order-1"
                        />
                        <div className="flex items-center gap-3 md:order-3">
                            <img
                                src="/Logo-Secretaria.png"
                                alt="Logo Secretaría de Salud"
                                loading="eager"
                                fetchPriority="high"
                                className="h-12 md:h-16 w-auto object-contain shrink-0"
                            />

                            {/* Selector de Usuario Simulado + Badges + Cerrar Sesión (Escritorio) */}
                            <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 pl-3">
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                                    Rol: {currentUser.rol.replace('_', ' ')}
                                </span>

                                <div className="bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 flex items-center gap-2">
                                    <span className="text-[10px] text-slate-600 font-bold">Prueba:</span>
                                    <select
                                        value={currentUser.email}
                                        onChange={handleRoleSwitch}
                                        className="bg-transparent text-xs text-slate-900 focus:outline-none font-bold"
                                    >
                                        {simulatedUsers.map((u) => (
                                            <option key={u.email} value={u.email} className="bg-white text-slate-900">
                                                {u.nombre} ({u.rol})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Link
                                    to="/notificaciones"
                                    className="relative p-2 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-500/40 transition-colors shrink-0"
                                    title="Notificaciones"
                                >
                                    <Bell className="w-4 h-4" />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                                        3
                                    </span>
                                </Link>

                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/');
                                    }}
                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Salir</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Columna Central (Centrada) */}
                    <div className="flex flex-col items-center text-center md:order-2">
                        <h1 className="text-slate-900 text-xl md:text-2xl font-bold text-center">
                            Jurisdicción Sanitaria No. 2 - Istmo
                        </h1>
                        <p className="text-slate-500 text-xs md:text-sm font-medium text-center">
                            Sistema Web de Gestión Operativa para Tamiz Neonatal y Red de Parteras Tradicionales
                        </p>
                    </div>

                </header>

                {/* MENU DRAWER MOBILE */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2 shadow-lg">
                        <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-xs font-bold text-slate-900">{currentUser.nombre}</p>
                            <p className="text-[10px] font-semibold text-teal-700">{currentUser.rol}</p>
                        </div>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center justify-between px-3 py-3 rounded-xl text-xs font-bold ${active ? 'bg-emerald-600 text-white' : 'text-slate-600'
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
                                logout();
                                navigate('/');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-3 text-xs text-rose-700 font-bold"
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

                            {/* Encabezado Bienvenida + Botones Rápidos (Modo Institucional Guinda) */}
                            <div className="bg-gradient-to-r from-[#9D2449] via-[#7A1B38] to-slate-900 p-6 rounded-3xl text-white shadow-md border border-[#9D2449]/40 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs uppercase tracking-wider font-extrabold text-rose-200">
                                            Jurisdicción Sanitaria No. 2 - Istmo
                                        </span>
                                        <span className="text-xs text-rose-200/60">•</span>
                                        <span className="text-xs text-rose-100 font-medium">Juchitán de Zaragoza, Oaxaca</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-white mt-1">
                                        Bienvenido, {currentUser.nombre.split(' ')[0]} {currentUser.nombre.split(' ')[1]}
                                    </h2>
                                    <p className="text-xs text-rose-100/80 mt-1">
                                        Monitoreo en tiempo real del programa de Tamiz Neonatal y la Red Comunitaria de Parteras.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                                    <Link
                                        to="/tamiz/nuevo"
                                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-rose-300/30"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Nuevo Registro de Tamiz</span>
                                    </Link>

                                    <Link
                                        to="/parteras"
                                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <HeartHandshake className="w-4 h-4" />
                                        <span>Registrar Nueva Partera</span>
                                    </Link>
                                </div>
                            </div>

                            {/* 4 TARJETAS KPI DE MÉTRICAS RÁPIDAS (MODO CLARO) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                                {/* KPI 1: Total Tamices */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-teal-500/50 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-slate-600">Total Tamices Registrados</span>
                                        <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-slate-900 mt-3">1,428</p>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-2 font-bold">
                                        <ArrowUpRight className="w-4 h-4" />
                                        <span>+12.4% este mes</span>
                                    </div>
                                </div>

                                {/* KPI 2: Muestras Pendientes en Tránsito */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-amber-500/50 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-slate-600">Muestras en Tránsito Lab</span>
                                        <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-amber-600 mt-3">184</p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-2">Tarjetas de Guthrie en envío</p>
                                </div>

                                {/* KPI 3: Parteras Activas */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-slate-600">Parteras Activas (Jurisdicción 2)</span>
                                        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                                            <UserCheck className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-slate-900 mt-3">96</p>
                                    <p className="text-[11px] text-emerald-700 mt-2 font-bold">100% acreditadas comunitarias</p>
                                </div>

                                {/* KPI 4: Alertas Sospechosas */}
                                <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm relative overflow-hidden group hover:border-rose-400 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-rose-800">Alertas Muestras Sospechosas</span>
                                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl animate-pulse">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-rose-600 mt-3">5</p>
                                    <p className="text-[11px] text-rose-700 mt-2 font-bold">Se requiere re-toma inmediata</p>
                                </div>

                            </div>

                            {/* SECCIÓN DE GRÁFICOS DE VISUALIZACIÓN DE DATOS (MODO CLARO) */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                {/* GRÁFICO 1: REGISTRO MENSUAL DE TAMICES (ÁREA INTERACTIVA SVG) */}
                                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                                    <Activity className="w-5 h-5 text-teal-700" />
                                                    <span>Registro Mensual de Tamices Neonatales</span>
                                                </h3>
                                                <p className="text-xs text-slate-500 font-medium">Evolución de muestras recolectadas en 2026.</p>
                                            </div>

                                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                                <button
                                                    onClick={() => setActiveChartTab('MES')}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${activeChartTab === 'MES' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600'
                                                        }`}
                                                >
                                                    Mensual
                                                </button>
                                                <button
                                                    onClick={() => setActiveChartTab('TRIMESTRE')}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${activeChartTab === 'TRIMESTRE' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600'
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
                                                    <linearGradient id="tealGradientLight" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
                                                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                                                    </linearGradient>
                                                </defs>

                                                {/* Líneas de Cuadrícula Horizontal Claras */}
                                                <line x1="0" y1="30" x2="500" y2="30" stroke="#e2e8f0" strokeDasharray="3 3" />
                                                <line x1="0" y1="80" x2="500" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
                                                <line x1="0" y1="130" x2="500" y2="130" stroke="#e2e8f0" strokeDasharray="3 3" />

                                                {/* Área Rellenada */}
                                                <polygon
                                                    fill="url(#tealGradientLight)"
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
                                                    stroke="#0d9488"
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
                                                                className="fill-teal-600 stroke-white stroke-2 group-hover:r-7 transition-all"
                                                            />
                                                            <text
                                                                x={x}
                                                                y={y - 12}
                                                                textAnchor="middle"
                                                                className="fill-slate-900 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                {d.cantidad}
                                                            </text>
                                                        </g>
                                                    );
                                                })}
                                            </svg>

                                            {/* Etiquetas de Meses en Eje X */}
                                            <div className="flex justify-between text-[11px] font-bold text-slate-500 mt-2 px-1">
                                                {monthlyTamizData.map((d) => (
                                                    <span key={d.mes}>{d.mes}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
                                        <span>Muestras promedio mensual: <strong className="text-slate-900">153.8</strong></span>
                                        <span className="text-emerald-700 font-bold">Meta Jurisdiccional Cumplida</span>
                                    </div>
                                </div>

                                {/* GRÁFICO 2: DISTRIBUCIÓN DE PARTOS POR COMUNIDAD (BARRAS TAILWIND) */}
                                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="mb-4">
                                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-emerald-700" />
                                                <span>Partos por Comunidad (Parteras)</span>
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium">
                                                Atenciones en Juchitán, Tehuantepec, Salina Cruz, Ciudad Ixtepec, San Blas Atempa, Asunción Ixtaltepec y Espinal.
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
                                                            <span className={`font-bold transition-colors ${isHovered ? 'text-emerald-800' : 'text-slate-800'}`}>
                                                                {item.comunidad}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-extrabold text-slate-900">{item.partos} partos</span>
                                                                <span className="text-[10px] text-teal-800 font-semibold">({item.tamicesPct}% tamizados)</span>
                                                            </div>
                                                        </div>

                                                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                            <div
                                                                style={{ width: `${pctBar}%` }}
                                                                className={`h-full rounded-full transition-all duration-500 ${isHovered ? 'bg-emerald-500 shadow-md' : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                                        <span>Total Atenciones Comunitarias: <strong className="text-slate-900">233</strong></span>
                                        <Link to="/parteras" className="text-emerald-700 font-bold hover:underline">Ver Padrón &rarr;</Link>
                                    </div>
                                </div>

                            </div>

                            {/* SECCIÓN DE ALERTAS RECIENTES Y ACCESOS RÁPIDOS */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-rose-600" />
                                        <span>Últimas Alertas Críticas del Sistema</span>
                                    </h3>
                                    <Link to="/notificaciones" className="text-xs font-bold text-teal-700 hover:underline">
                                        Ver Centro de Alertas Completas
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* Alerta 1 */}
                                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300">
                                                RE-TOMA URGENTE
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500">Hace 15 min</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-900">Muestra M-1092 Muestra Coagulada</h4>
                                        <p className="text-[11px] text-slate-600 font-medium">
                                            RN Gómez Santiz en Juchitán de Zaragoza requiere re-toma inmediata por coagulación en Tarjeta de Guthrie.
                                        </p>
                                        <button className="text-[11px] font-bold text-rose-700 hover:underline pt-1">
                                            Gestionar Re-Toma &rarr;
                                        </button>
                                    </div>

                                    {/* Alerta 2 */}
                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                                                REFERENCIA COMUNITARIA
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500">Hace 1 hora</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-900">Riesgo Materno en Tehuantepec</h4>
                                        <p className="text-[11px] text-slate-600 font-medium">
                                            Doña Juana López emitió referencia por presión arterial elevada en embarazo de 36 SDG.
                                        </p>
                                        <button className="text-[11px] font-bold text-amber-800 hover:underline pt-1">
                                            Ver Ficha de Referencia &rarr;
                                        </button>
                                    </div>

                                    {/* Alerta 3 */}
                                    <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md border border-teal-300">
                                                LABORATORIO ESTATAL
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500">Hace 3 horas</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-900">Lote L-2026 Recibido</h4>
                                        <p className="text-[11px] text-slate-600 font-medium">
                                            El LESP Oaxaca confirmó la recepción de 45 muestras de la Jurisdicción No. 2 Istmo.
                                        </p>
                                        <button className="text-[11px] font-bold text-teal-800 hover:underline pt-1">
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-teal-700" />
                                <span>Configuración del Sistema</span>
                            </h3>
                            <button
                                onClick={() => setShowConfigModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Jurisdicción Sanitaria Asignada</label>
                                <input
                                    type="text"
                                    disabled
                                    value="Jurisdicción Sanitaria No. 2 - Istmo (Juchitán de Zaragoza)"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Modo de Accesibilidad Visual</label>
                                <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-teal-600">
                                    <option>Normal (Estándar Modo Claro)</option>
                                    <option>Alto Contraste (WCAG 2.1 AAA)</option>
                                    <option>Texto Grande para Comunidad</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Alertas Emergentes</label>
                                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                    <span className="text-slate-800 font-medium">Notificaciones de Re-Muestras Urgentes</span>
                                    <input type="checkbox" defaultChecked className="accent-emerald-600 w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-3">
                            <button
                                onClick={() => setShowConfigModal(false)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
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
