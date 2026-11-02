import React, { useState } from 'react';
import type { ReactNode } from 'react';
import {
    Award,
    Building2,
    Calendar,
    Droplet,
    FileSpreadsheet,
    HeartPulse,
    LogOut,
    Menu,
    Settings,
    ShieldCheck,
    UserCheck,
    Users,
    X,
    Activity,
    Database,
    Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { TabTamizNeonatal } from './admin/TabTamizNeonatal';
import { TabReferencias } from './admin/TabReferencias';
import { TabCalendarios } from './admin/TabCalendarios';
import { TabUsuariosParteras } from './admin/TabUsuariosParteras';
import { TabCuentasPersonal } from './admin/TabCuentasPersonal';
import { TabUnidadesCLUES } from './admin/TabUnidadesCLUES';
import { TabConfiguracionSistema } from './admin/TabConfiguracionSistema';

interface AdminDashboardProps {
    userName?: string;
    userAvatar?: string;
}

export type TabType = 'TAMIZ' | 'REFERENCIAS' | 'CALENDARIOS' | 'PARTERAS' | 'CUENTAS' | 'CLUES' | 'CONFIGURACION';

/* Estilos de UI/UX Avanzados y Animaciones Nativas */
const ACCENT = 'bg-gradient-to-r from-cyan-400 to-blue-600';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-0';
const GLASS = 'lg-edge relative border border-white/40 bg-slate-900/40 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.6)] backdrop-blur-3xl';
const PRIMARY_BTN = `lg-sheen group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/40 ${ACCENT} px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-cyan-950/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(34,211,238,0.4)] hover:brightness-110 active:translate-y-0 active:scale-[0.98] ${FOCUS}`;
const SECONDARY_BTN = `flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:border-white/50 hover:bg-white/20 active:scale-[0.98] ${FOCUS}`;

const DASHBOARD_CSS = `
@keyframes lgFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes lgCard{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}
@keyframes lgFloatA{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(4%,6%,0)}}
@keyframes lgFloatB{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-5%,-4%,0)}}
@keyframes lgSheen{from{transform:translateX(-160%) skewX(-15deg)}to{transform:translateX(420%) skewX(-15deg)}}
@keyframes lgHalo{0%{transform:scale(.85);opacity:.6}100%{transform:scale(1.75);opacity:0}}
.lg-fade{animation:lgFade .35s cubic-bezier(0.16,1,0.3,1) both}
.lg-card{animation:lgCard .5s cubic-bezier(.22,1,.36,1) both}
.lg-float-a{animation:lgFloatA 20s ease-in-out infinite}
.lg-float-b{animation:lgFloatB 26s ease-in-out infinite}
.lg-halo{animation:lgHalo 2.2s ease-out infinite}
.lg-text{text-shadow:0 1px 3px rgba(15,23,42,.4)}
.lg-quiet{scrollbar-width:none}
.lg-quiet::-webkit-scrollbar{display:none}
.lg-edge::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;
background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(255,255,255,.3) 35%,rgba(255,255,255,0) 60%,rgba(255,255,255,.5));
-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.lg-sheen::after{content:'';position:absolute;inset:0 auto 0 0;width:35%;pointer-events:none;
background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:translateX(-160%) skewX(-15deg)}
.lg-sheen:hover:not(:disabled)::after{animation:lgSheen .9s ease}
`;

interface NavItemProps {
    id: TabType;
    active: boolean;
    icon: ReactNode;
    label: string;
    badge?: string;
    onClick: () => void;
}

function NavItem({ active, icon, label, badge, onClick }: NavItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer active:scale-[0.98] ${FOCUS} ${
                active
                    ? `${ACCENT} text-white shadow-lg shadow-cyan-950/50 ring-1 ring-white/50`
                    : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border border-white/10'
            }`}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <span className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-white/20 text-white' : 'bg-white/5 text-cyan-300 group-hover:bg-white/10'}`}>
                    {icon}
                </span>
                <span className="truncate text-left">{label}</span>
            </div>
            {badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${active ? 'bg-white text-blue-900' : 'bg-cyan-500/20 text-cyan-200'}`}>
                    {badge}
                </span>
            )}
        </button>
    );
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    userName = 'Lic. Administrador Jurisdiccional',
    userAvatar,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('TAMIZ');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleExportExcel = () => {
        alert('Generando reporte institucional oficial SSO-2026.xlsx...');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems: Array<{ id: TabType; label: string; icon: ReactNode; badge?: string }> = [
        { id: 'TAMIZ', label: 'Tamiz Neonatal (Guthrie)', icon: <Droplet className="size-4" />, badge: 'Activo' },
        { id: 'REFERENCIAS', label: 'Referencias Médicas (F1)', icon: <HeartPulse className="size-4" /> },
        { id: 'CALENDARIOS', label: 'Auditoría F2 y F3', icon: <Calendar className="size-4" /> },
        { id: 'PARTERAS', label: 'Gestión y Padrón de Parteras', icon: <Users className="size-4" /> },
        { id: 'CUENTAS', label: 'Directorio de Cuentas SSO', icon: <UserCheck className="size-4" /> },
        { id: 'CLUES', label: 'Unidades Médicas y CLUES', icon: <Building2 className="size-4" /> },
        { id: 'CONFIGURACION', label: 'Configuración y Seguridad', icon: <Settings className="size-4" /> },
    ];

    const currentTabLabel = navItems.find((t) => t.id === activeTab)?.label || 'Módulo';

    return (
        <div className="lg-text min-h-screen w-full overflow-x-hidden p-2.5 text-white selection:bg-cyan-300/40 sm:p-6">
            <style>{DASHBOARD_CSS}</style>

            {/* Fondo Inmersivo Absoluto idéntico al Login */}
            <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-800 to-slate-950">
                <img
                    src="/fondo-login.png"
                    alt=""
                    draggable={false}
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                    className="absolute inset-0 size-full object-cover object-center opacity-85 brightness-105 contrast-105 blur-md"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-blue-900/10 to-slate-950/40" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(165,243,252,0.3),transparent_70%)]" />
                <div className="lg-float-a absolute -left-20 -top-20 size-[28rem] rounded-full bg-cyan-400/25 blur-3xl pointer-events-none" />
                <div className="lg-float-b absolute -bottom-28 -right-20 size-[32rem] rounded-full bg-blue-400/25 blur-3xl pointer-events-none" />
            </div>

            {/* Contenedor Principal (Z-index para flotar sobre el fondo) */}
            <div className="relative z-10 mx-auto max-w-7xl space-y-4 sm:space-y-6">

                {/* 1. CABECERA INSTITUCIONAL COMPACTA EN MÓVIL Y ELEGANTE EN ESCRITORIO */}
                <header className={`lg-card ${GLASS} rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left`}>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                        <img
                            src="/logo-jurisdiccion.png"
                            alt="Jurisdicción Sanitaria No. 2"
                            draggable={false}
                            className="size-11 sm:size-14 rounded-full bg-white/95 p-0.5 object-cover shadow-xl ring-2 ring-white/60 shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0">
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-cyan-200 block truncate">
                                Servicios de Salud de Oaxaca • Jurisdicción No. 2
                            </span>
                            <h1 className="text-sm sm:text-xl font-black text-white tracking-tight truncate">
                                Centro de Control y Mando
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/15">
                        <div className="flex h-10 sm:h-12 items-center rounded-xl sm:rounded-2xl bg-white/95 px-3 shadow-md backdrop-blur-md">
                            <img src="/Logo-Secretaria.png" alt="Secretaría de Salud" draggable={false} className="h-5 sm:h-6 w-auto object-contain" />
                        </div>
                        
                        {/* Botón menú móvil flotante */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="flex lg:hidden items-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-500/30 border border-cyan-300/50 text-white text-xs font-bold backdrop-blur-md active:scale-95 transition"
                        >
                            <Menu className="size-4 text-cyan-300" />
                            <span className="max-w-[120px] truncate">{currentTabLabel}</span>
                        </button>
                    </div>
                </header>

                {/* 2. BANNER HERO DE ADMINISTRADOR & METRICAS (COMPACTO Y RESPONSIVO) */}
                <div className={`lg-card ${GLASS} rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden`}>
                    <div aria-hidden="true" className="absolute -right-10 -top-10 size-40 sm:size-56 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
                    
                    <div className="relative flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6">
                        
                        {/* Perfil del Administrador */}
                        <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left w-full lg:w-auto">
                            <div className="relative flex size-16 sm:size-20 shrink-0 items-center justify-center">
                                <span aria-hidden="true" className="lg-halo absolute inset-0 rounded-full border border-cyan-300/60" />
                                {userAvatar ? (
                                    <img src={userAvatar} alt={userName} className="relative size-14 sm:size-18 rounded-full object-cover ring-4 ring-white/40 shadow-xl" />
                                ) : (
                                    <div className="relative flex size-14 sm:size-18 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-lg sm:text-xl font-black text-white shadow-xl ring-4 ring-white/40">
                                        {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                )}
                                <span className="absolute bottom-0 right-0 size-3.5 sm:size-4 rounded-full bg-emerald-400 ring-3 ring-slate-900 shadow-md animate-pulse" title="En línea" />
                            </div>

                            <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-cyan-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-md">
                                    <Award className="w-3 h-3 text-cyan-300" />
                                    Administración Autorizada SSO
                                </span>
                                <h2 className="text-base sm:text-2xl font-black text-white tracking-tight">
                                    {userName}
                                </h2>
                                <p className="text-[11px] sm:text-xs text-cyan-50/90 font-medium flex items-center justify-center sm:justify-start gap-1">
                                    <ShieldCheck className="size-3.5 text-cyan-300 shrink-0" />
                                    <span>Director Operativo • Istmo de Tehuantepec</span>
                                </p>
                            </div>
                        </div>

                        {/* Tarjetas KPI y Botones de Acción */}
                        <div className="flex flex-wrap items-center justify-center gap-2.5 w-full lg:w-auto">
                            <div className="flex items-center gap-2.5 bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl sm:rounded-2xl backdrop-blur-md">
                                <Activity className="size-4 sm:size-5 text-cyan-300 animate-pulse" />
                                <div>
                                    <p className="text-[9px] uppercase font-bold text-cyan-200">Sincronización</p>
                                    <p className="text-[11px] sm:text-xs font-black text-white">Óptimo (100%)</p>
                                </div>
                            </div>

                            <button type="button" onClick={handleExportExcel} className={PRIMARY_BTN}>
                                <FileSpreadsheet className="size-4 text-emerald-300 shrink-0" />
                                <span>Reporte (.xlsx)</span>
                            </button>

                            <button type="button" onClick={handleLogout} className={SECONDARY_BTN}>
                                <LogOut className="size-4 text-rose-300 shrink-0" />
                                <span>Salir</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. LAYOUT PRINCIPAL: SIDEBAR FLOTANTE EN MÓVIL Y ESCRITORIO */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                    
                    {/* Menú Móvil Desplegable (Drawer Modal) */}
                    {sidebarOpen && (
                        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-md p-3 sm:hidden lg-fade">
                            <div className={`lg-card ${GLASS} w-full max-w-sm rounded-3xl p-4 space-y-3 max-h-[85vh] overflow-y-auto`}>
                                <div className="flex items-center justify-between pb-2 border-b border-white/20">
                                    <span className="text-xs font-black uppercase text-cyan-300 flex items-center gap-1.5">
                                        <Sparkles className="size-3.5" />
                                        Módulos Operativos
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSidebarOpen(false)}
                                        className="size-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                                <div className="space-y-1.5">
                                    {navItems.map((item) => (
                                        <NavItem
                                            key={item.id}
                                            id={item.id}
                                            active={activeTab === item.id}
                                            icon={item.icon}
                                            label={item.label}
                                            badge={item.badge}
                                            onClick={() => {
                                                setActiveTab(item.id);
                                                setSidebarOpen(false);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sidebar de Escritorio */}
                    <aside className="hidden lg:block lg:col-span-3 space-y-3">
                        <div className={`lg-card ${GLASS} rounded-3xl p-3.5 space-y-1.5`}>
                            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5">
                                <Sparkles className="size-3.5 text-cyan-300" />
                                Módulos Operativos
                            </p>
                            {navItems.map((item) => (
                                <NavItem
                                    key={item.id}
                                    id={item.id}
                                    active={activeTab === item.id}
                                    icon={item.icon}
                                    label={item.label}
                                    badge={item.badge}
                                    onClick={() => setActiveTab(item.id)}
                                />
                            ))}
                        </div>

                        {/* Tarjeta de Servidor PostgreSQL */}
                        <div className={`lg-card ${GLASS} rounded-2xl p-4 text-xs space-y-2 border border-white/20 shadow-xl`}>
                            <div className="flex items-center gap-2 text-cyan-300 font-bold">
                                <Database className="size-4" />
                                <span>Servidor PostgreSQL</span>
                            </div>
                            <p className="text-white/80 text-[11px] leading-relaxed">
                                Conectado a Render Cloud • Cifrado AES-256 Institucional SSO.
                            </p>
                        </div>
                    </aside>

                    {/* Área de Trabajo Principal */}
                    <main className="w-full lg:col-span-9">
                        <div key={activeTab} className={`lg-card ${GLASS} rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg-fade min-h-[500px] shadow-2xl`}>
                            {activeTab === 'TAMIZ' && <TabTamizNeonatal />}
                            {activeTab === 'REFERENCIAS' && <TabReferencias />}
                            {activeTab === 'CALENDARIOS' && <TabCalendarios />}
                            {activeTab === 'PARTERAS' && <TabUsuariosParteras />}
                            {activeTab === 'CUENTAS' && <TabCuentasPersonal />}
                            {activeTab === 'CLUES' && <TabUnidadesCLUES />}
                            {activeTab === 'CONFIGURACION' && <TabConfiguracionSistema />}
                        </div>
                    </main>

                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;