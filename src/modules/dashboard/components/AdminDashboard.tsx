import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    ShieldCheck,
    AlertTriangle,
    Download,
    UserCheck,
    TrendingUp,
    Building2,
    FileSpreadsheet,
    Printer,
    X,
    Check
} from 'lucide-react';

interface AdminDashboardProps {
    userName: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userName }) => {
    const [showExportModal, setShowExportModal] = useState(false);
    const [showAprobacionModal, setShowAprobacionModal] = useState(false);

    // Mock Municipios de la Jurisdicción Sanitaria No. 2 Istmo
    const municipiosData = [
        { nombre: 'Juchitán de Zaragoza', partos: 342, tamizPct: 96, parteras: 28, alerta: 'NORMAL' },
        { nombre: 'Santo Domingo Tehuantepec', partos: 215, tamizPct: 92, parteras: 18, alerta: 'ALTA' },
        { nombre: 'Salina Cruz', partos: 189, tamizPct: 95, parteras: 15, alerta: 'NORMAL' },
        { nombre: 'Ciudad Ixtepec', partos: 142, tamizPct: 90, parteras: 12, alerta: 'NORMAL' },
        { nombre: 'San Blas Atempa', partos: 110, tamizPct: 84, parteras: 9, alerta: 'ALTA' },
        { nombre: 'Asunción Ixtaltepec', partos: 98, tamizPct: 91, parteras: 8, alerta: 'NORMAL' },
        { nombre: 'El Espinal', partos: 64, tamizPct: 93, parteras: 6, alerta: 'NORMAL' },
    ];

    // Mock Solicitudes de Acreditación Pendientes
    const [solicitudesPendientes, setSolicitudesPendientes] = useState([
        {
            id: 'SOL-001',
            nombre: 'Doña Petrona Cruz Velasco',
            municipio: 'Salina Cruz',
            experiencia: '35 años',
            visitaRealizada: true,
        },
        {
            id: 'SOL-002',
            nombre: 'Doña Micaela Ruiz Hernández',
            municipio: 'San Blas Atempa',
            experiencia: '30 años',
            visitaRealizada: false,
        },
    ]);

    const handleAprobarSolicitud = (id: string) => {
        setSolicitudesPendientes(solicitudesPendientes.filter((s) => s.id !== id));
        alert('Acreditación aprobada exitosamente y notificada a la partera.');
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto selection:bg-rose-600 selection:text-white">

            {/* Encabezado Principal Administrador / Jefe de Jurisdicción */}
            <div className="bg-gradient-to-r from-[#9D2449] via-[#7A1B38] to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-[#9D2449]/40 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-rose-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                            PANEL EJECUTIVO JURISDICCIONAL
                        </span>
                        <span className="text-xs text-rose-200/60">•</span>
                        <span className="text-xs text-rose-100 font-medium">Jurisdicción Sanitaria No. 2 - Istmo</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                        Bienvenido, {userName}
                    </h1>
                    <p className="text-xs sm:text-sm text-rose-100/90 font-medium mt-1">
                        Consola de supervisión ejecutiva para el Tamiz Neonatal y la Red Comunitaria de Parteras Tradicionales.
                    </p>
                </div>

                {/* Acciones Ejecutivas Principales */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex-1 sm:flex-none px-4 py-3 bg-white text-[#9D2449] hover:bg-rose-50 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Download className="w-4 h-4 text-[#9D2449]" />
                        <span>Exportar Reporte SSO</span>
                    </button>

                    <button
                        onClick={() => setShowAprobacionModal(true)}
                        className="flex-1 sm:flex-none px-4 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 border border-rose-300/30 active:scale-95"
                    >
                        <UserCheck className="w-4 h-4" />
                        <span>Aprobar Acreditaciones ({solicitudesPendientes.length})</span>
                    </button>
                </div>
            </div>

            {/* 3 Métricas Ejecutivas Clave */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* KPI 1: % Cobertura Tamiz */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500">% Cobertura de Tamiz en el Istmo</span>
                        <p className="text-3xl font-black text-slate-900 mt-2">94.2%</p>
                        <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold mt-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>Meta Estatal Cumplida (&gt;90%)</span>
                        </div>
                    </div>
                    <div className="p-3 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200">
                        <Activity className="w-7 h-7" />
                    </div>
                </div>

                {/* KPI 2: Total Parteras Acreditadas */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500">Parteras Acreditadas SSO</span>
                        <p className="text-3xl font-black text-emerald-800 mt-2">96</p>
                        <p className="text-[11px] text-emerald-700 font-bold mt-1">Certificación Vigente 2026</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                </div>

                {/* KPI 3: Zonas con Alta Alerta Obstétrica */}
                <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-amber-900">Zonas de Alta Alerta Obstétrica</span>
                        <p className="text-3xl font-black text-amber-600 mt-2">3 Zonas</p>
                        <p className="text-[11px] text-amber-700 font-medium mt-1">Juchitán, Tehuantepec, San Blas</p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
                        <AlertTriangle className="w-7 h-7 text-amber-600" />
                    </div>
                </div>

            </div>

            {/* Gráficos / Indicadores Comunitarios por Municipio */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Gráfico SVG Simulado de Partos Atendidos */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <div>
                            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#9D2449]" />
                                <span>Partos Atendidos por Municipio (Istmo de Tehuantepec)</span>
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">Distribución regional y cobertura de tamiz neonatal.</p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        {municipiosData.map((mun) => (
                            <div key={mun.nombre} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-800">{mun.nombre}</span>
                                    <span className="text-slate-600 font-semibold">
                                        {mun.partos} partos • <strong className="text-[#9D2449]">{mun.tamizPct}% Tamiz</strong>
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                                    <div
                                        className="bg-[#9D2449] h-full rounded-full transition-all duration-500"
                                        style={{ width: `${mun.tamizPct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tarjeta de Acreditaciones Pendientes */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                        <div className="border-b border-slate-200 pb-3">
                            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-[#9D2449]" />
                                <span>Solicitudes Pendientes</span>
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">Aprobación de nuevas parteras comunitarias.</p>
                        </div>

                        <div className="space-y-3 mt-4">
                            {solicitudesPendientes.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-6">No hay solicitudes pendientes.</p>
                            ) : (
                                solicitudesPendientes.map((sol) => (
                                    <div key={sol.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{sol.nombre}</p>
                                                <p className="text-[11px] text-slate-600">{sol.municipio} • Exp. {sol.experiencia}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${sol.visitaRealizada ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {sol.visitaRealizada ? 'Visita Realizada' : 'Pendiente Visita'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleAprobarSolicitud(sol.id)}
                                            className="w-full py-1.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-bold text-[11px] rounded-xl transition-all"
                                        >
                                            Aprobar Acreditación
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <Link
                        to="/parteras"
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl text-center block transition-colors mt-4"
                    >
                        Ver Padrón Completo de Parteras
                    </Link>
                </div>

            </div>

            {/* MODAL 1: EXPORTAR REPORTE MENSUAL SSO */}
            {showExportModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-[#9D2449]" />
                                <span>Exportar Reporte Mensual SSO</span>
                            </h3>
                            <button onClick={() => setShowExportModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs font-medium">
                            <p className="text-slate-600">Seleccione el formato oficial para el informe de la Jurisdicción Sanitaria No. 2:</p>

                            <button
                                onClick={() => {
                                    alert('Generando archivo Excel oficial SSO de Cobertura de Tamiz Neonatal...');
                                    setShowExportModal(false);
                                }}
                                className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-900 font-bold transition-all"
                            >
                                <span className="flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                                    <span>Descargar Formato Excel (.XLSX)</span>
                                </span>
                                <Download className="w-4 h-4 text-emerald-700" />
                            </button>

                            <button
                                onClick={() => {
                                    alert('Generando informe ejecutivo PDF para la Secretaría de Salud de Oaxaca...');
                                    setShowExportModal(false);
                                }}
                                className="w-full p-3 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-2xl flex items-center justify-between text-[#9D2449] font-bold transition-all"
                            >
                                <span className="flex items-center gap-2">
                                    <Printer className="w-5 h-5 text-[#9D2449]" />
                                    <span>Descargar Informe Ejecutivo (.PDF)</span>
                                </span>
                                <Download className="w-4 h-4 text-[#9D2449]" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: APROBACIÓN RÁPIDA DE ACREDITACIONES */}
            {showAprobacionModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-[#9D2449]" />
                                <span>Aprobar Nuevas Acreditaciones de Parteras</span>
                            </h3>
                            <button onClick={() => setShowAprobacionModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {solicitudesPendientes.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-6">No hay solicitudes pendientes por aprobar.</p>
                            ) : (
                                solicitudesPendientes.map((sol) => (
                                    <div key={sol.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{sol.nombre}</p>
                                            <p className="text-[11px] text-slate-600">{sol.municipio} • Exp. {sol.experiencia}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAprobarSolicitud(sol.id)}
                                            className="px-3 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Aprobar</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
