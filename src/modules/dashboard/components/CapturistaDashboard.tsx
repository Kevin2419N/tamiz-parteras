import React, { useState } from 'react';
import {
    FileText,
    Search,
    Truck,
    AlertTriangle,
    LogOut,
    Building2,
    Sparkles,
    Activity,
    ShieldCheck
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

/* Estilos de UI/UX Avanzados y Animaciones Nativas (idénticos a AdminDashboard) */
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

export const CapturistaDashboard: React.FC<CapturistaDashboardProps> = ({
    userName = 'Capturista SSO'
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
        <div className="lg-text min-h-screen w-full overflow-x-hidden p-2.5 text-white selection:bg-cyan-300/40 sm:p-6">
            <style>{DASHBOARD_CSS}</style>

            {/* Fondo Inmersivo Absoluto idéntico al Login y Admin */}
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

            {/* Contenedor Principal Flotante */}
            <div className="relative z-10 mx-auto max-w-7xl space-y-4 sm:space-y-6">

                {/* 1. CABECERA INSTITUCIONAL SUPERIOR HOMOLOGADA */}
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
                                Centro de Captura y Control de Tamiz Neonatal
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/15">
                        <div className="flex h-10 sm:h-12 items-center rounded-xl sm:rounded-2xl bg-white/95 px-3 shadow-md backdrop-blur-md">
                            <img src="/Logo-Secretaria.png" alt="Secretaría de Salud" draggable={false} className="h-5 sm:h-6 w-auto object-contain" />
                        </div>
                    </div>
                </header>

                {/* 2. HERO BANNER OPERATIVO HOMOLOGADO */}
                <div className={`lg-card ${GLASS} rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden`}>
                    <div aria-hidden="true" className="absolute -right-10 -top-10 size-40 sm:size-56 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
                    
                    <div className="relative flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6">
                        <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left w-full lg:w-auto">
                            <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-cyan-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-md">
                                    <Building2 className="w-3 h-3 text-cyan-300" />
                                    Jurisdicción Sanitaria No. 2 - Istmo
                                </span>
                                <h2 className="text-base sm:text-2xl font-black text-white tracking-tight">
                                    Bienvenido, {userName}
                                </h2>
                                <p className="text-[11px] sm:text-xs text-cyan-50/90 font-medium flex items-center justify-center sm:justify-start gap-1">
                                    <ShieldCheck className="size-3.5 text-cyan-300 shrink-0" />
                                    <span>Capturista Autorizado • Sistema de Tamiz Neonatal</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2.5 w-full lg:w-auto">
                            <div className="flex items-center gap-2.5 bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl sm:rounded-2xl backdrop-blur-md">
                                <Activity className="size-4 sm:size-5 text-cyan-300 animate-pulse" />
                                <div>
                                    <p className="text-[9px] uppercase font-bold text-cyan-200">Estado de Red</p>
                                    <p className="text-[11px] sm:text-xs font-black text-white">Activo y Sincronizado</p>
                                </div>
                            </div>

                            <button type="button" onClick={handleLogout} className={SECONDARY_BTN}>
                                <LogOut className="size-4 text-rose-300 shrink-0" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* BANNER NOTIFICACIÓN ESCANEO IA */}
                {aiNotification && (
                    <div className="bg-cyan-950/80 border-2 border-cyan-400 rounded-2xl p-4 flex items-center gap-3 text-xs font-bold text-cyan-100 shadow-2xl backdrop-blur-md animate-bounce">
                        <Sparkles className="w-5 h-5 text-cyan-300 shrink-0" />
                        <p className="flex-1">{aiNotification}</p>
                    </div>
                )}

                {/* 3. TAB-NAVIGATION DE 4 PESTAÑAS EJECUTIVAS */}
                <div className={`lg-card ${GLASS} p-2 rounded-2xl flex flex-wrap sm:flex-nowrap gap-2 border border-white/20 shadow-xl`}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('CAPTURA')}
                        className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeTab === 'CAPTURA'
                                ? `${ACCENT} text-white shadow-lg shadow-cyan-950/50 ring-1 ring-white/50`
                                : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border border-white/10'
                        }`}
                    >
                        <FileText className={`w-4 h-4 ${activeTab === 'CAPTURA' ? 'text-white' : 'text-cyan-300'}`} />
                        <span>1. Captura de Tamiz Guthrie</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('HISTORIAL')}
                        className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeTab === 'HISTORIAL'
                                ? `${ACCENT} text-white shadow-lg shadow-cyan-950/50 ring-1 ring-white/50`
                                : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border border-white/10'
                        }`}
                    >
                        <Search className={`w-4 h-4 ${activeTab === 'HISTORIAL' ? 'text-white' : 'text-cyan-300'}`} />
                        <span>2. Historial, Búsqueda y Fechas</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('LOTES')}
                        className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeTab === 'LOTES'
                                ? `${ACCENT} text-white shadow-lg shadow-cyan-950/50 ring-1 ring-white/50`
                                : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border border-white/10'
                        }`}
                    >
                        <Truck className={`w-4 h-4 ${activeTab === 'LOTES' ? 'text-white' : 'text-cyan-300'}`} />
                        <span>3. Control de Lotes y Envíos</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('RECALL')}
                        className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
                            activeTab === 'RECALL'
                                ? `${ACCENT} text-white shadow-lg shadow-cyan-950/50 ring-1 ring-white/50`
                                : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border border-white/10'
                        }`}
                    >
                        <AlertTriangle className={`w-4 h-4 ${activeTab === 'RECALL' ? 'text-white' : 'text-rose-400'}`} />
                        <span>4. Centro de Alertas Recall</span>
                        {recallAlertsCount > 0 && (
                            <span className="ml-1 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                                {recallAlertsCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* 4. CONTENIDO DINÁMICO CONTENEDOR DE CRISTAL */}
                <main className={`lg-card ${GLASS} rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg-fade min-h-[500px] shadow-2xl`}>
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
                </main>

                {/* 5. MODAL DE ESCANEO POR IA (SIMULADOR OCR) */}
                <ModalEscaneoIA
                    isOpen={isAIScanOpen}
                    onClose={() => setIsAIScanOpen(false)}
                    onScanComplete={handleAIScanComplete}
                />

            </div>
        </div>
    );
};

export default CapturistaDashboard;