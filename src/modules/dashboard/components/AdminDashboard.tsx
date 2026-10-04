import React, { useState } from 'react';
import {
    HeartPulse,
    Calendar,
    Users,
    Droplet,
    UserCheck,
    Settings,
    FileSpreadsheet,
    LogOut,
    Award,
    Building2
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
}

export type TabType = 'TAMIZ' | 'REFERENCIAS' | 'CALENDARIOS' | 'PARTERAS' | 'CUENTAS' | 'CLUES' | 'CONFIGURACION';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userName = 'Lic. Administrador Jurisdiccional' }) => {
    const [activeTab, setActiveTab] = useState<TabType>('TAMIZ');
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleExportExcel = () => {
        alert('Generando archivo institucional SSO-2026.xlsx...');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        /* MARCO INSTITUCIONAL DEL SISTEMA DE DISEÑO DE PARTERAS */
        <div className="border-4 border-[#9D2449] bg-white rounded-3xl shadow-xl p-4 md:p-8 max-w-7xl mx-auto my-4 space-y-6">

            {/* 1. CABECERA INSTITUCIONAL OFICIAL HOMOLOGADA */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-slate-200 pb-6 text-center md:text-left">
                {/* Logo Izquierdo */}
                <img
                    src="/logo-jurisdiccion.png"
                    alt="Logo Jurisdicción Sanitaria No. 2"
                    loading="eager"
                    className="h-20 w-auto object-contain mix-blend-multiply"
                />

                {/* Texto Central en Guinda Oaxaca */}
                <div className="text-center space-y-0.5">
                    <span className="text-xs font-black uppercase tracking-wider text-[#9D2449] block">
                        SERVICIOS DE SALUD DE OAXACA • JURISDICCIÓN SANITARIA NO. 2
                    </span>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#9D2449] tracking-tight">
                        CENTRO DE CONTROL Y MANDO JURISDICCIONAL
                    </h1>
                    <p className="text-xs font-bold text-slate-600">
                        Sistema de Gestión Operativa • Istmo de Tehuantepec
                    </p>
                </div>

                {/* Logo Derecho */}
                <img
                    src="/Logo-Secretaria.png"
                    alt="Logo Secretaría de Salud"
                    loading="eager"
                    className="h-20 w-auto object-contain mix-blend-multiply"
                />
            </div>

            {/* 2. HERO BANNER GUINDA OAXACA CON BOTONES RECICLADOS */}
            <div className="bg-[#9D2449] text-white rounded-2xl p-6 shadow-md font-bold my-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-1.5 text-center md:text-left">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-100 bg-white/15 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                        <Award className="w-3.5 h-3.5 text-rose-200" />
                        CENTRO DE CONTROL Y MANDO JURISDICCIONAL
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {userName}
                    </h2>
                    <p className="text-xs text-rose-100 font-semibold">
                        Director Operativo de Salud Comunitaria • Istmo de Tehuantepec
                    </p>
                </div>

                {/* BOTONES PRINCIPALES RECICLADOS */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={handleExportExcel}
                        className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-4 py-2 text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 backdrop-blur-md"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                        <span>Exportar Reporte (.xlsx)</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-4 py-2 text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 backdrop-blur-md"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>

            {/* 3. SISTEMA DE NAVEGACIÓN POR 7 PESTAÑAS EJECUTIVAS */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap lg:flex-nowrap gap-2 overflow-x-auto border border-slate-200 shadow-inner">

                {/* Pestaña 1: Control de Tamiz Neonatal */}
                <button
                    type="button"
                    onClick={() => setActiveTab('TAMIZ')}
                    className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'TAMIZ'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <Droplet className={`w-4 h-4 ${activeTab === 'TAMIZ' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>1. Tamiz Neonatal</span>
                </button>

                {/* Pestaña 2: Referencias (Formato 1) */}
                <button
                    type="button"
                    onClick={() => setActiveTab('REFERENCIAS')}
                    className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'REFERENCIAS'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <HeartPulse className={`w-4 h-4 ${activeTab === 'REFERENCIAS' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>2. Referencias (F1)</span>
                </button>

                {/* Pestaña 3: Auditoría F2 y F3 */}
                <button
                    type="button"
                    onClick={() => setActiveTab('CALENDARIOS')}
                    className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'CALENDARIOS'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <Calendar className={`w-4 h-4 ${activeTab === 'CALENDARIOS' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>3. Auditoría F2 y F3</span>
                </button>

                {/* Pestaña 4: Padrón y Credenciales QR */}
                <button
                    type="button"
                    onClick={() => setActiveTab('PARTERAS')}
                    className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'PARTERAS'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <Users className={`w-4 h-4 ${activeTab === 'PARTERAS' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>4. Padrón Parteras</span>
                </button>

                {/* Pestaña 5: Cuentas del Personal */}
                <button
                    type="button"
                    onClick={() => setActiveTab('CUENTAS')}
                    className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'CUENTAS'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <UserCheck className={`w-4 h-4 ${activeTab === 'CUENTAS' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>5. Cuentas SSO</span>
                </button>

                {/* Pestaña 6: Catálogo de Unidades Médicas CLUES */}
                <button
                    type="button"
                    onClick={() => setActiveTab('CLUES')}
                    className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'CLUES'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <Building2 className={`w-4 h-4 ${activeTab === 'CLUES' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>6. Unidades CLUES</span>
                </button>

                {/* Pestaña 7: Configuración & Seguridad */}
                <button
                    type="button"
                    onClick={() => setActiveTab('CONFIGURACION')}
                    className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'CONFIGURACION'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <Settings className={`w-4 h-4 ${activeTab === 'CONFIGURACION' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>7. Configuración & Seguridad</span>
                </button>
            </div>

            {/* 4. VISTA DINÁMICA SEGÚN PESTAÑA SELECCIONADA */}
            <div>
                {activeTab === 'TAMIZ' && <TabTamizNeonatal />}
                {activeTab === 'REFERENCIAS' && <TabReferencias />}
                {activeTab === 'CALENDARIOS' && <TabCalendarios />}
                {activeTab === 'PARTERAS' && <TabUsuariosParteras />}
                {activeTab === 'CUENTAS' && <TabCuentasPersonal />}
                {activeTab === 'CLUES' && <TabUnidadesCLUES />}
                {activeTab === 'CONFIGURACION' && <TabConfiguracionSistema />}
            </div>

        </div>
    );
};
