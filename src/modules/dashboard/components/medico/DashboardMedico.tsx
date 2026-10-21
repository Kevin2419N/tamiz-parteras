import React, { useState } from 'react';
import {
    FlaskConical,
    BookOpen,
    HeartHandshake,
    LogOut,
    Building2,
    AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TabCasosPrioritarios } from './TabCasosPrioritarios';
import { TabExpedientePerinatal } from './TabExpedientePerinatal';
import { TabContrareferencias } from './TabContrareferencias';

interface DashboardMedicoProps {
    userName?: string;
    casosPendientesCount?: number;
    contrareferenciasCount?: number;
}

type MedicoTabType = 'CASOS' | 'EXPEDIENTE' | 'CONTRAREFERENCIAS';

interface TabConfig {
    id: MedicoTabType;
    label: string;
    shortLabel: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
}

export const DashboardMedico: React.FC<DashboardMedicoProps> = ({
    userName,
    casosPendientesCount = 0,
    contrareferenciasCount = 0,
}) => {
    const [activeTab, setActiveTab] = useState<MedicoTabType>('CASOS');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Obtener el nombre del usuario soportando 'nombre', 'nombreCompleto' o 'name' según AuthContext
    const nombreUsuarioContexto = (user as any)?.nombre || (user as any)?.nombreCompleto || (user as any)?.name;
    const nombreMedico = userName || nombreUsuarioContexto || 'Médico Adscrito';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const tabs: TabConfig[] = [
        {
            id: 'CASOS',
            label: 'Casos Prioritarios y Tamiz Recall',
            shortLabel: 'Casos Prioritarios',
            icon: FlaskConical,
            badge: casosPendientesCount,
        },
        {
            id: 'EXPEDIENTE',
            label: 'Expediente Digital Carné Perinatal (CLAP / OPS-OMS)',
            shortLabel: 'Carné Perinatal',
            icon: BookOpen,
        },
        {
            id: 'CONTRAREFERENCIAS',
            label: 'Contrareferencias y Red de Atención',
            shortLabel: 'Contrareferencias',
            icon: HeartHandshake,
            badge: contrareferenciasCount,
        },
    ];

    return (
        /* MARCO INSTITUCIONAL SSO OAXACA – MÉDICO DE UNIDAD / CONTRAREFERENCIAS */
        <div className="border-4 border-[#9D2449] bg-white rounded-3xl shadow-xl p-4 md:p-8 max-w-7xl mx-auto my-4 space-y-6">

            {/* 1. CABECERA INSTITUCIONAL */}
            <div className="no-print flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-slate-200 pb-6 text-center md:text-left">
                <img
                    src="/logo-jurisdiccion.png"
                    alt="Logo Jurisdicción Sanitaria No. 2"
                    loading="eager"
                    className="h-20 w-auto object-contain mix-blend-multiply"
                />
                <div className="text-center space-y-0.5">
                    <span className="text-xs font-black uppercase tracking-wider text-[#9D2449] block">
                        SERVICIOS DE SALUD DE OAXACA • JURISDICCIÓN SANITARIA NO. 2
                    </span>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#9D2449] tracking-tight">
                        MÓDULO DEL MÉDICO DE UNIDAD Y CONTRAREFERENCIAS
                    </h1>
                    <p className="text-xs font-bold text-slate-600">
                        Programa de Tamiz Neonatal y Atención Perinatal • Istmo de Tehuantepec
                    </p>
                </div>
                <img
                    src="/Logo-Secretaria.png"
                    alt="Logo Secretaría de Salud"
                    loading="eager"
                    className="h-20 w-auto object-contain mix-blend-multiply"
                />
            </div>

            {/* 2. HERO BANNER */}
            <div className="no-print py-3 px-6 bg-[#9D2449] text-white rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 text-center md:text-left">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                        Bienvenido, {nombreMedico}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-100 bg-white/15 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                        <Building2 className="w-3.5 h-3.5 text-rose-200" />
                        Médico de Unidad / Contrareferencias
                    </span>
                    {casosPendientesCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-100 bg-white/15 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                            {casosPendientesCount} Casos Pendientes de Atención
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl border border-white/30 text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-md shadow-sm shrink-0 cursor-pointer"
                >
                    <LogOut className="w-4 h-4 text-rose-200" />
                    Cerrar Sesión
                </button>
            </div>

            {/* 3. NAVEGACIÓN POR PESTAÑAS */}
            <div className="no-print bg-slate-100 p-1.5 rounded-2xl flex flex-wrap lg:flex-nowrap gap-2 overflow-x-auto border border-slate-200 shadow-inner">
                {tabs.map((tab, idx) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 relative cursor-pointer ${isActive
                                    ? 'bg-[#9D2449] text-white shadow-md'
                                    : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                                }`}
                        >
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-rose-200' : 'text-slate-500'}`} />
                            <span>{idx + 1}. {tab.shortLabel}</span>
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isActive
                                        ? 'bg-white/25 text-white'
                                        : 'bg-rose-500 text-white animate-pulse'
                                    }`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 4. CONTENIDO DINÁMICO */}
            <div className="pt-1">
                {activeTab === 'CASOS' && <TabCasosPrioritarios />}
                {activeTab === 'EXPEDIENTE' && <TabExpedientePerinatal />}
                {activeTab === 'CONTRAREFERENCIAS' && <TabContrareferencias />}
            </div>

        </div>
    );
};

export default DashboardMedico;