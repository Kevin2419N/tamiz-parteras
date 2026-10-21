import React, { useState } from 'react';
import {
    FileText,
    Search,
    Truck,
    AlertTriangle,
    LogOut,
    Building2,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import type { GuthrieFormData, RegistroTamizHistorial } from './capturista/types';
import { ModalEscaneoIA } from './capturista/ModalEscaneoIA';
import { TabCapturaGuthrie } from './capturista/TabCapturaGuthrie';
import { TabHistorialBusqueda } from './capturista/TabHistorialBusqueda';
import { TabControlLotes } from './capturista/TabControlLotes';
import { TabAlertasRecall } from './capturista/TabAlertasRecall';

interface CapturistaDashboardProps {
    userName?: string;
}

export type CapturistaTabType = 'CAPTURA' | 'HISTORIAL' | 'LOTES' | 'RECALL';

export const CapturistaDashboard: React.FC<CapturistaDashboardProps> = ({
    userName = ''
}) => {
    const [activeTab, setActiveTab] = useState<CapturistaTabType>('CAPTURA');
    const [isAIScanOpen, setIsAIScanOpen] = useState(false);
    const [scannedFormData, setScannedFormData] = useState<Partial<GuthrieFormData> | undefined>(undefined);
    const [aiNotification, setAiNotification] = useState<string | null>(null);

    const { logout } = useAuth();
    const navigate = useNavigate();

    // Historial de tamiz — se llena dinámicamente al guardar cédulas Guthrie
    const [registrosHistorial, setRegistrosHistorial] = useState<RegistroTamizHistorial[]>([]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSaveNewGuthrie = (newForm: GuthrieFormData) => {
        const nuevoRegistro: RegistroTamizHistorial = {
            id: `REG-${Math.floor(100 + Math.random() * 900)}`,
            folio: newForm.folio,
            rn: `${newForm.nombreRN || 'RN'} ${newForm.apellidoPaternoRN} ${newForm.apellidoMaternoRN}`,
            madre: `${newForm.nombreMadre} ${newForm.apellidoPaternoMadre} ${newForm.apellidoMaternoMadre}`,
            curpMadre: newForm.curpMadre || 'SIN CURP',
            fechaToma: `${newForm.fechaToma} ${newForm.horaToma}`,
            municipio: newForm.municipioMadre || 'Juchitán de Zaragoza',
            unidadMedica: newForm.unidadMedica.split('-')[1]?.trim() || newForm.unidadMedica,
            clues: newForm.clues,
            tecnicaToma: newForm.tecnicaToma === '1A_TALON' ? '1ª Muestra Talón' : 'Re-muestra',
            estatus: 'EN_TRANSITO_LAB',
            prioridad: 'NORMAL'
        };

        setRegistrosHistorial([nuevoRegistro, ...registrosHistorial]);
    };

    const handleAIScanComplete = (scannedObj: Partial<GuthrieFormData>) => {
        setScannedFormData(scannedObj);
        setActiveTab('CAPTURA');
        setAiNotification(`¡Tarjeta Guthrie (Folio ${scannedObj.folio}) extraída exitosamente por IA! Por favor revise y confirme los datos.`);
        setTimeout(() => setAiNotification(null), 8000);
    };

    const recallAlertsCount = registrosHistorial.filter(
        r => r.estatus === 'MUESTRA_COAGULADA' || r.estatus === 'MUESTRA_INSUFICIENTE' || r.estatus === 'RETOMA_SOLICITADA'
    ).length;

    return (
        /* MARCO INSTITUCIONAL DEL SISTEMA DE DISEÑO DE PARTERAS Y SSO OAXACA */
        <div className="border-4 border-[#9D2449] bg-white rounded-3xl shadow-xl p-4 md:p-8 max-w-7xl mx-auto my-4 min-h-screen space-y-6">

            {/* 1. CABECERA INSTITUCIONAL SUPERIOR HOMOLOGADA (OCULTA EN IMPRESIÓN) */}
            <div className="no-print flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-slate-200 pb-6 text-center md:text-left">
                {/* Logo Izquierdo: Jurisdicción Sanitaria No. 2 */}
                <img
                    src="/logo-jurisdiccion.png"
                    alt="Logo Jurisdicción Sanitaria No. 2"
                    loading="eager"
                    className="h-20 w-auto object-contain mix-blend-multiply"
                />

                {/* Texto Central en Guinda Oaxaca */}
                <div className="text-center space-y-0.5">
                    <span className="text-xs font-black uppercase tracking-wider text-[#9D2449] block">
                        SERVICIOS DE SALUD DE OAXACA • SISTEMA DE TAMIZ NEONATAL Y RED DE PARTERAS
                    </span>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#9D2449] tracking-tight">
                        CENTRO DE CAPTURA Y CONTROL DE TAMIZ NEONATAL
                    </h1>
                    <p className="text-xs font-bold text-slate-600">
                        Jurisdicción Sanitaria No. 2 - Istmo • SSO Oaxaca
                    </p>
                </div>

                {/* Logo Derecho: Secretaría de Salud */}
                <img
                    src="/Logo-Secretaria.png"
                    alt="Logo Secretaría de Salud"
                    loading="eager"
                    className="h-20 w-auto object-contain mix-blend-multiply"
                />
            </div>

            {/* 2. HERO BANNER OPERATIVO GUINDA OAXACA (DELGADO Y REESTRUCTURADO) */}
            <div className="no-print py-3 px-6 bg-[#9D2449] text-white rounded-2xl shadow-sm my-3 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 text-center md:text-left">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                        Bienvenido, {userName}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-100 bg-white/15 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                        <Building2 className="w-3.5 h-3.5 text-rose-200" />
                        Jurisdicción Sanitaria No. 2 - Istmo
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl border border-white/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 backdrop-blur-md shadow-sm shrink-0"
                    title="Cerrar Sesión"
                >
                    <LogOut className="w-4 h-4 text-rose-200" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>

            {/* BANNER NOTIFICACIÓN ESCANEO IA (OCULTO EN IMPRESIÓN) */}
            {aiNotification && (
                <div className="no-print bg-rose-50 border-2 border-[#9D2449] rounded-2xl p-4 flex items-center gap-3 text-xs font-bold text-[#9D2449] shadow-md animate-bounce">
                    <Sparkles className="w-5 h-5 text-[#9D2449] shrink-0" />
                    <p className="flex-1">{aiNotification}</p>
                </div>
            )}

            {/* 3. TAB-NAVIGATION DE 4 PESTAÑAS EJECUTIVAS (OCULTAS EN IMPRESIÓN) */}
            <div className="no-print bg-slate-100 p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap gap-2 overflow-x-auto border border-slate-200 shadow-inner">

                {/* Pestaña 1: Captura Guthrie */}
                <button
                    type="button"
                    onClick={() => setActiveTab('CAPTURA')}
                    className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'CAPTURA'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <FileText className={`w-4 h-4 ${activeTab === 'CAPTURA' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>1. Captura de Tamiz Guthrie</span>
                </button>

                {/* Pestaña 2: Historial, Búsqueda y Fechas */}
                <button
                    type="button"
                    onClick={() => setActiveTab('HISTORIAL')}
                    className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'HISTORIAL'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <Search className={`w-4 h-4 ${activeTab === 'HISTORIAL' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>2. Historial, Búsqueda y Fechas</span>
                </button>

                {/* Pestaña 3: Control de Lotes y Envíos */}
                <button
                    type="button"
                    onClick={() => setActiveTab('LOTES')}
                    className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'LOTES'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <Truck className={`w-4 h-4 ${activeTab === 'LOTES' ? 'text-rose-200' : 'text-slate-500'}`} />
                    <span>3. Control de Lotes y Envíos</span>
                </button>

                {/* Pestaña 4: Centro de Alertas Recall */}
                <button
                    type="button"
                    onClick={() => setActiveTab('RECALL')}
                    className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer relative ${activeTab === 'RECALL'
                        ? 'bg-[#9D2449] text-white shadow-md'
                        : 'bg-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                >
                    <AlertTriangle className={`w-4 h-4 ${activeTab === 'RECALL' ? 'text-rose-200' : 'text-rose-600'}`} />
                    <span>4. Centro de Alertas Recall</span>
                    {recallAlertsCount > 0 && (
                        <span className="ml-1 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                            {recallAlertsCount}
                        </span>
                    )}
                </button>

            </div>

            {/* 4. CONTENIDO DINÁMICO SEGÚN PESTAÑA */}
            <div className="pt-2">
                {activeTab === 'CAPTURA' && (
                    <TabCapturaGuthrie
                        initialData={scannedFormData}
                        onSaveSuccess={handleSaveNewGuthrie}
                        onOpenAIScan={() => setIsAIScanOpen(true)}
                    />
                )}

                {activeTab === 'HISTORIAL' && (
                    <TabHistorialBusqueda
                        registros={registrosHistorial}
                    />
                )}

                {activeTab === 'LOTES' && (
                    <TabControlLotes />
                )}

                {activeTab === 'RECALL' && (
                    <TabAlertasRecall
                        alertas={registrosHistorial.filter(
                            r => r.estatus === 'MUESTRA_COAGULADA' || r.estatus === 'MUESTRA_INSUFICIENTE' || r.estatus === 'RETOMA_SOLICITADA'
                        )}
                    />
                )}
            </div>

            {/* 5. MODAL DE ESCANEO POR IA (SIMULADOR OCR) */}
            <ModalEscaneoIA
                isOpen={isAIScanOpen}
                onClose={() => setIsAIScanOpen(false)}
                onScanComplete={handleAIScanComplete}
            />

        </div>
    );
};
