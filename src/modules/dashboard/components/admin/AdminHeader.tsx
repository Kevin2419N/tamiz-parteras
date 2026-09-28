import React from 'react';
import {
    Activity,
    ShieldCheck,
    AlertTriangle,
    Server,
    LogOut,
    HeartPulse,
    FileSpreadsheet,
    Bell
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
    userName: string;
    onExportClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userName, onExportClick }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* BARRA DE MANDO SUPERIOR (HEADER INSTITUCIONAL) */}
            <div className="bg-gradient-to-r from-[#9D2449] via-[#7A1B38] to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-[#9D2449]/40 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-rose-100 bg-white/15 px-3 py-1 rounded-full border border-white/20">
                            JURISDICCIÓN SANITARIA NO. 2 • ISTMO DE TEHUANTEPEC
                        </span>
                        <span className="text-xs text-rose-200/60">•</span>
                        <span className="text-xs text-rose-100 font-medium">Servicios de Salud de Oaxaca</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Centro de Mando: {userName || 'Lic. Administrador Jurisdiccional'}
                    </h1>

                    {/* INDICADORES EN TIEMPO REAL */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <Server className="w-3.5 h-3.5" />
                            <span>Servidor BD Activo</span>
                        </div>

                        <div className="bg-amber-500/20 border border-amber-400/40 text-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md">
                            <Bell className="w-3.5 h-3.5 text-amber-300" />
                            <span>Vigilancia Epidemiológica Activa</span>
                        </div>
                    </div>
                </div>

                {/* ACCIONES SUPERIORES */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                    <button
                        type="button"
                        onClick={onExportClick}
                        className="flex-1 sm:flex-none px-4 py-3 bg-white text-[#9D2449] hover:bg-rose-50 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-[#9D2449]" />
                        <span>Exportar Reporte SSO</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        className="flex-1 sm:flex-none px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 border border-white/25 active:scale-95 cursor-pointer backdrop-blur-md"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>

            {/* TARJETAS DE KPIS Y MÉTRICAS EN TIEMPO REAL (4 TARJETAS COMPACTAS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* KPI 1: Muestras Tamiz Neonatal */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Muestras Tamiz Neonatal</span>
                            <p className="text-3xl font-black text-slate-900 mt-1">1,420</p>
                        </div>
                        <div className="p-3 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-100">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-semibold">185 en tránsito</span>
                        <span className="bg-rose-100 text-[#9D2449] font-black px-2 py-0.5 rounded-full text-[10px] border border-rose-200">
                            12 Sospechosos
                        </span>
                    </div>
                </div>

                {/* KPI 2: Referencias Formato 1 */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Referencias (Formato 1)</span>
                            <p className="text-3xl font-black text-slate-900 mt-1">48</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
                            <HeartPulse className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                            15 Pendientes
                        </span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                            33 Atendidas
                        </span>
                    </div>
                </div>

                {/* KPI 3: Padrón de Parteras */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Padrón de Parteras</span>
                            <p className="text-3xl font-black text-emerald-800 mt-1">96</p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-emerald-700 font-bold">Activas en el Istmo</span>
                        <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full text-[10px]">
                            84 QR Emitidos
                        </span>
                    </div>
                </div>

                {/* KPI 4: Alertas Obstétricas */}
                <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Alertas Obstétricas</span>
                            <p className="text-3xl font-black text-amber-600 mt-1">8 Casos</p>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-amber-100 flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-semibold">Complicaciones F2/F3</span>
                        <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full text-[10px]">
                            0 Muerte Materna
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};
