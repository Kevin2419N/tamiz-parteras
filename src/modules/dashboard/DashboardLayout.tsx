import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CapturistaDashboard } from './components/CapturistaDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DashboardPartera } from '../parteras/DashboardPartera';
import {
    FileText,
    Users,
    Bell,
    LogOut,
    LayoutDashboard,
    Menu,
    X,
    Settings,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, updateUser, logout } = useAuth();

    // UI State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const simulatedUsers = [
        {
            id: 'usr-001',
            nombre: 'Dra. Carmen Silva Juárez',
            email: 'carmen.silva@salud.gob.mx',
            rol: UserRole.CAPTURISTA_TAMIZ as UserRole,
            jurisdiccion: 'Jurisdicción Sanitaria No. 2 - Istmo',
            activo: true,
        },
        {
            id: 'usr-002',
            nombre: 'Dr. Alejandro Morales',
            email: 'admin.jurisdiccion2@salud.gob.mx',
            rol: UserRole.ADMIN_JURISDICCIONAL as UserRole,
            jurisdiccion: 'Jurisdicción Sanitaria No. 2 - Istmo',
            activo: true,
        },
        {
            id: 'usr-003',
            nombre: 'Lic. María Elena Santiz',
            email: 'gestor.parteras@salud.gob.mx',
            rol: UserRole.GESTOR_PARTERAS as UserRole,
            jurisdiccion: 'Jurisdicción Sanitaria No. 2 - Istmo',
            activo: true,
        },
        {
            id: 'usr-004',
            nombre: 'Doña Rosa Santiz Gómez',
            email: 'partera.rosa@comunidad.org',
            rol: UserRole.PARTERA_TRADICIONAL as UserRole,
            jurisdiccion: 'Comunidad Juchitán de Zaragoza',
            activo: true,
        },
    ];

    // Active User State initialized from AuthContext or fallback
    const [currentUser, setCurrentUser] = useState(() => {
        return user || simulatedUsers[0];
    });

    useEffect(() => {
        if (user) {
            setCurrentUser(user);
        }
    }, [user]);

    const handleRoleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = simulatedUsers.find((u) => u.email === e.target.value);
        if (selected) {
            setCurrentUser(selected);
            updateUser(selected);
        }
    };

    // Sidebar Items Dynamic Filtering by Role
    const getNavItemsByRole = (rol: UserRole) => {
        switch (rol) {
            case UserRole.PARTERA_TRADICIONAL:
                return [
                    { label: 'Mi Espacio Comunitaria', path: '/dashboard', icon: LayoutDashboard },
                    { label: 'Centro de Alertas', path: '/notificaciones', icon: Bell, badge: 3 },
                ];
            case UserRole.CAPTURISTA_TAMIZ:
                return [
                    { label: 'Inicio / Registro Tamiz', path: '/dashboard', icon: LayoutDashboard },
                    { label: 'Registro de Tamiz', path: '/tamiz', icon: FileText },
                    { label: 'Centro de Alertas', path: '/notificaciones', icon: Bell, badge: 3 },
                ];
            case UserRole.ADMIN_JURISDICCIONAL:
            case UserRole.GESTOR_PARTERAS:
            default:
                return [
                    { label: 'Inicio / Métricas', path: '/dashboard', icon: LayoutDashboard },
                    { label: 'Padrón de Parteras', path: '/parteras', icon: Users },
                    { label: 'Registro de Tamiz', path: '/tamiz', icon: FileText },
                    { label: 'Centro de Alertas', path: '/notificaciones', icon: Bell, badge: 3 },
                ];
        }
    };

    const navItems = getNavItemsByRole(currentUser.rol);

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-slate-100/80 text-slate-800 flex flex-col md:flex-row selection:bg-emerald-600 selection:text-white">

            {/* SIDEBAR DESKTOP COLAPSABLE (MODO CLARO) - Oculto para rol PARTERA_TRADICIONAL */}
            {currentUser.rol !== UserRole.PARTERA_TRADICIONAL && (
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
            )}

            {/* NAVBAR SUPERIOR RESPONSIVE (MODO CLARO) - Oculto para módulo Partera */}
            <div className="flex-1 flex flex-col min-w-0">

                {currentUser.rol !== UserRole.PARTERA_TRADICIONAL && !location.pathname.includes('/parteras/comunitaria') && (
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
                )}

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
                        currentUser.rol === UserRole.PARTERA_TRADICIONAL ? (
                            <DashboardPartera />
                        ) : currentUser.rol === UserRole.CAPTURISTA_TAMIZ ? (
                            <CapturistaDashboard userName={currentUser.nombre} />
                        ) : (
                            <AdminDashboard userName={currentUser.nombre} />
                        )
                    ) : (
                        <Outlet />
                    )}
                </main>
            </div>
        </div>
    );
};
