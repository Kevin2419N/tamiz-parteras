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

/* Estilos de Diseño Glassmorfismo Avanzado homólogos al Login */
const ACCENT = 'bg-gradient-to-r from-cyan-400 to-blue-600';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-0';
const GLASS = 'lg-edge relative border border-white/45 bg-slate-900/35 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.6)] backdrop-blur-3xl';
const PRIMARY_BTN = `lg-sheen group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/40 ${ACCENT} px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-950/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(34,211,238,0.4)] hover:brightness-110 active:translate-y-0 active:scale-[0.98] ${FOCUS}`;
const SECONDARY_BTN = `flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:border-white/50 hover:bg-white/20 active:scale-[0.98] ${FOCUS}`;

const DASHBOARD_CSS = `
@keyframes lgFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes lgCard{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:none}}
@keyframes lgFloatA{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(4%,6%,0)}}
@keyframes lgFloatB{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-5%,-4%,0)}}
@keyframes lgSheen{from{transform:translateX(-160%) skewX(-15deg)}to{transform:translateX(420%) skewX(-15deg)}}
@keyframes lgHalo{0%{transform:scale(.85);opacity:.6}100%{transform:scale(1.7);opacity:0}}
.lg-fade{animation:lgFade .35s cubic-bezier(0.16,1,0.3,1) both}
.lg-card{animation:lgCard .6s cubic-bezier(.22,1,.36,1) both}
.lg-float-a{animation:lgFloatA 22s ease-in-out infinite}
.lg-float-b{animation:lgFloatB 28s ease-in-out infinite}
.lg-halo{animation:lgHalo 2.2s ease-out infinite}
.lg-text{text-shadow:0 1px 3px rgba(15,23,42,.4)}
.lg-quiet{scrollbar-width:none}
.lg-quiet::-webkit-scrollbar{display:none}
.lg-edge::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;
background:linear-gradient(135deg,rgba(255,255,255,.9),rgba(255,255,255,.3) 35%,rgba(255,255,255,0) 60%,rgba(255,255,255,.5));
-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.lg-sheen::after{content:'';position:absolute;inset:0 auto 0 0;width:35%;pointer-events:none;
background:linear-gradient(100deg,transparent,rgba(255,255,255,.4),transparent);transform:translateX(-160%) skewX(-15deg)}
.lg-sheen:hover:not(:disabled)::after{animation:lgSheen .9s ease}
`;

interface NavTabProps {
    id: TabType;
    active: boolean;
    icon: ReactNode;
    label: string;
    onClick: () => void;
}

function NavTab({ active, icon, label, onClick }: NavTabProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-all duration-300 cursor-pointer active:scale-95 ${FOCUS} ${
                active
                    ? `${ACCENT} text-white shadow-lg shadow-cyan-950/50 ring-1 ring-white/40`
                    : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border border-white/15'
            }`}
        >
            <span className={active ? 'text-white' : 'text-cyan-300'}>{icon}</span>
            <span className="whitespace-nowrap">{label}</span>
        </button>
    );
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    userName = 'Lic. Administrador Jurisdiccional',
    userAvatar,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('TAMIZ');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleExportExcel = () => {
        alert('Generando archivo institucional SSO-2026.xlsx...');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const tabsList: Array<{ id: TabType; label: string; icon: ReactNode }> = [
        { id: 'TAMIZ', label: '1. Tamiz Neonatal', icon: <Droplet className="size-4" /> },
        { id: 'REFERENCIAS', label: '2. Referencias (F1)', icon: <HeartPulse className="size-4" /> },
        { id: 'CALENDARIOS', label: '3. Auditoría F2 y F3', icon: <Calendar className="size-4" /> },
        { id: 'PARTERAS', label: '4. Padrón Parteras', icon: <Users className="size-4" /> },
        { id: 'CUENTAS', label: '5. Cuentas SSO', icon: <UserCheck className="size-4" /> },
        { id: 'CLUES', label: '6. Unidades y CLUES', icon: <Building2 className="size-4" /> },
        { id: 'CONFIGURACION', label: '7. Configuración & Seguridad', icon: <Settings className="size-4" /> },
    ];

    return (
        <div className="lg-text min-h-screen w-full overflow-x-hidden p-3 text-white selection:bg-cyan-300/40 sm:p-6">
            <style>{DASHBOARD_CSS}</style>

            {/* Fondo Inmersivo y Coherente con el Login */}
            <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-800 to-slate-950">
                <img
                    src="/fondo-login.png"
                    alt=""
                    draggable={false}
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                    className="absolute inset-0 size-full object-cover object-center opacity-85 brightness-105 contrast-105 blur-md"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/25 via-blue-900/15 to-slate-950/50" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(165,243,252,0.25),transparent_70%)]" />
                <div className="lg-float-a absolute -left-20 -top-20 size-[32rem] rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="lg-float-b absolute -bottom-28 -right-20 size-[36rem] rounded-full bg-blue-400/20 blur-3xl" />
            </div>

            {/* Contenedor Principal de Cristal (Centro de Mando) */}
            <div className={`lg-card ${GLASS} mx-auto max-w-7xl rounded-3xl p-4 sm:p-8 space-y-6`}>
                
                {/* Reflejo superior del cristal */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tr from-white/15 via-transparent to-cyan-200/20" />

                {/* 1. CABECERA INSTITUCIONAL OFICIAL HOMOLOGADA */}
                <header className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/20 pb-6 text-center md:text-left">
                    <img
                        src="/logo-jurisdiccion.png"
                        alt="Logo Jurisdicción Sanitaria No. 2"
                        loading="eager"
                        className="h-16 md:h-20 w-auto object-contain rounded-full bg-white/90 p-1 shadow-lg ring-2 ring-white/50 backdrop-blur-md"
                    />

                    <div className="space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-widest text-cyan-200 block">
                            SERVICIOS DE SALUD DE OAXACA • JURISDICCIÓN SANITARIA NO. 2
                        </span>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                            CENTRO DE CONTROL Y MANDO JURISDICCIONAL
                        </h1>
                        <p className="text-xs font-semibold text-cyan-50/85">
                            Sistema de Gestión Operativa • Istmo de Tehuantepec
                        </p>
                    </div>

                    <div className="flex h-14 md:h-18 items-center rounded-2xl bg-white/90 backdrop-blur-md px-4 shadow-xl ring-2 ring-white/50">
                        <img
                            src="/Logo-Secretaria.png"
                            alt="Logo Secretaría de Salud"
                            loading="eager"
                            className="h-8 md:h-10 w-auto object-contain"
                        />
                    </div>
                </header>

                {/* 2. HERO BANNER DE ADMINISTRADOR CON PERFIL Y FOTO COQUETA */}
                <div className="relative z-10 overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-r from-slate-900/60 via-cyan-950/40 to-slate-900/60 p-5 md:p-6 shadow-xl backdrop-blur-2xl">
                    <div aria-hidden="true" className="absolute -right-10 -top-10 size-48 rounded-full bg-cyan-400/20 blur-3xl" />
                    
                    <div className="relative flex flex-col md:flex-row justify-between items-center gap-5">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            {/* Avatar Coqueto y Profesional con Glow */}
                            <div className="relative flex size-16 md:size-20 shrink-0 items-center justify-center">
                                <span aria-hidden="true" className="lg-halo absolute inset-0 rounded-full border border-cyan-300/60" />
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt={userName}
                                        className="relative size-14 md:size-18 rounded-full object-cover ring-4 ring-white/40 shadow-xl"
                                    />
                                ) : (
                                    <div className="relative flex size-14 md:size-18 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-xl font-black text-white shadow-xl ring-4 ring-white/40">
                                        {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                )}
                                <span className="absolute bottom-0 right-0 size-4 rounded-full bg-emerald-400 ring-2 ring-slate-900 shadow-md" title="En línea" />
                            </div>

                            <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-200 bg-white/10 px-3 py-0.5 rounded-full border border-white/20 backdrop-blur-md">
                                    <Award className="w-3.5 h-3.5 text-cyan-300" />
                                    Administración Autorizada SSO
                                </span>
                                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    {userName}
                                </h2>
                                <p className="text-xs text-cyan-50/90 font-medium flex items-center justify-center md:justify-start gap-1.5">
                                    <ShieldCheck className="size-3.5 text-cyan-300" />
                                    Director Operativo de Salud Comunitaria • Istmo de Tehuantepec
                                </p>
                            </div>
                        </div>

                        {/* Botones de Acción Global */}
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center">
                            <button type="button" onClick={handleExportExcel} className={PRIMARY_BTN}>
                                <FileSpreadsheet className="size-4 text-emerald-300" />
                                <span>Exportar Reporte (.xlsx)</span>
                            </button>

                            <button type="button" onClick={handleLogout} className={SECONDARY_BTN}>
                                <LogOut className="size-4 text-rose-300" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. SISTEMA DE NAVEGACIÓN POR PESTAÑAS (Responsivo & Escritorio / Móvil) */}
                <div className="relative z-10">
                    {/* Botón menú hamburguesa para móviles pequeños */}
                    <div className="flex md:hidden justify-between items-center bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-md mb-3">
                        <span className="text-xs font-bold text-cyan-200 flex items-center gap-2">
                            {tabsList.find(t => t.id === activeTab)?.icon}
                            {tabsList.find(t => t.id === activeTab)?.label}
                        </span>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="flex size-9 items-center justify-center rounded-lg bg-white/15 text-white"
                        >
                            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>

                    {/* Menú desplegable móvil */}
                    {mobileMenuOpen && (
                        <div className="lg-fade flex flex-col gap-2 mb-4 md:hidden bg-slate-900/90 p-3 rounded-2xl border border-white/20 backdrop-blur-2xl">
                            {tabsList.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold text-left transition ${
                                        activeTab === tab.id ? 'bg-cyan-500/30 text-white border border-cyan-400/40' : 'text-white/80 hover:bg-white/10'
                                    }`}
                                >
                                    <span className="text-cyan-300">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Pestañas de Escritorio / Tablet (Scroll horizontal silencioso y elegante) */}
                    <div className="hidden md:flex flex-wrap lg:flex-nowrap gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md overflow-x-auto lg-quiet">
                        {tabsList.map((tab) => (
                            <NavTab
                                key={tab.id}
                                id={tab.id}
                                active={activeTab === tab.id}
                                icon={tab.icon}
                                label={tab.label}
                                onClick={() => setActiveTab(tab.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* 4. VISTA DINÁMICA DE LA PESTAÑA SELECCIONADA */}
                <div className="relative z-10 lg-fade pt-2">
                    {activeTab === 'TAMIZ' && <TabTamizNeonatal />}
                    {activeTab === 'REFERENCIAS' && <TabReferencias />}
                    {activeTab === 'CALENDARIOS' && <TabCalendarios />}
                    {activeTab === 'PARTERAS' && <TabUsuariosParteras />}
                    {activeTab === 'CUENTAS' && <TabCuentasPersonal />}
                    {activeTab === 'CLUES' && <TabUnidadesCLUES />}
                    {activeTab === 'CONFIGURACION' && <TabConfiguracionSistema />}
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;