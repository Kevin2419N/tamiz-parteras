import React, { useState } from 'react';
import {
    HeartPulse,
    Calendar,
    Users,
    BarChart3,
    Droplet
} from 'lucide-react';
import { AdminHeader } from './admin/AdminHeader';
import { TabTamizNeonatal } from './admin/TabTamizNeonatal';
import { TabReferencias } from './admin/TabReferencias';
import { TabCalendarios } from './admin/TabCalendarios';
import { TabUsuariosParteras } from './admin/TabUsuariosParteras';
import { TabReportesEpidemio } from './admin/TabReportesEpidemio';

interface AdminDashboardProps {
    userName?: string;
}

export type TabType = 'TAMIZ' | 'REFERENCIAS' | 'CALENDARIOS' | 'USUARIOS' | 'EPIDEMIOLOGIA';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userName = 'Lic. Administrador Jurisdiccional' }) => {
    const [activeTab, setActiveTab] = useState<TabType>('TAMIZ');

    const handleGlobalExport = () => {
        setActiveTab('EPIDEMIOLOGIA');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">

            {/* BARRA DE MANDO SUPERIOR E INDICADORES DE ESTADO + TARJETAS DE KPIS */}
            <AdminHeader userName={userName} onExportClick={handleGlobalExport} />

            {/* SISTEMA DE NAVEGACIÓN POR PESTAÑAS EJECUTIVAS (5 TABS) */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap md:flex-nowrap gap-2 overflow-x-auto border border-slate-200 shadow-inner">

                {/* Tab 1: Control Tamiz Neonatal */}
                <button
                    type="button"
                    onClick={() => setActiveTab('TAMIZ')}
                    className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'TAMIZ'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <Droplet className={`w-4 h-4 ${activeTab === 'TAMIZ' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>1. Control de Tamiz</span>
                </button>

                {/* Tab 2: Referencias y Contrareferencias */}
                <button
                    type="button"
                    onClick={() => setActiveTab('REFERENCIAS')}
                    className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'REFERENCIAS'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <HeartPulse className={`w-4 h-4 ${activeTab === 'REFERENCIAS' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>2. Referencias (F1)</span>
                </button>

                {/* Tab 3: Auditoría de Calendarios */}
                <button
                    type="button"
                    onClick={() => setActiveTab('CALENDARIOS')}
                    className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'CALENDARIOS'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <Calendar className={`w-4 h-4 ${activeTab === 'CALENDARIOS' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>3. Auditoría F2 y F3</span>
                </button>

                {/* Tab 4: Usuarios y Parteras QR */}
                <button
                    type="button"
                    onClick={() => setActiveTab('USUARIOS')}
                    className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'USUARIOS'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <Users className={`w-4 h-4 ${activeTab === 'USUARIOS' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>4. Usuarios y QR Parteras</span>
                </button>

                {/* Tab 5: Centro de Control Epidemiológico */}
                <button
                    type="button"
                    onClick={() => setActiveTab('EPIDEMIOLOGIA')}
                    className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'EPIDEMIOLOGIA'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <BarChart3 className={`w-4 h-4 ${activeTab === 'EPIDEMIOLOGIA' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>5. Reportes Epidemiológicos</span>
                </button>
            </div>

            {/* VISTA DINÁMICA SEGÚN PESTAÑA SELECCIONADA */}
            <div>
                {activeTab === 'TAMIZ' && <TabTamizNeonatal />}
                {activeTab === 'REFERENCIAS' && <TabReferencias />}
                {activeTab === 'CALENDARIOS' && <TabCalendarios />}
                {activeTab === 'USUARIOS' && <TabUsuariosParteras />}
                {activeTab === 'EPIDEMIOLOGIA' && <TabReportesEpidemio />}
            </div>

        </div>
    );
};
