import React, { useState, useEffect } from 'react';
import { BarChart3, FileSpreadsheet, FileText, ShieldCheck, Loader2, AlertCircle, X, Sparkles } from 'lucide-react';
import { http } from '../../../../services/http';

export interface MunicipalCoverage {
    municipio: string;
    coberturaPct: number;
    muestrasTomadas: number;
    metaJurisdiccional: number;
    parterasActivas: number;
}

export interface CausaReferencia {
    causa: string;
    porcentaje: number;
    casos: number;
    color?: string;
}

export const TabReportesEpidemio: React.FC = () => {
    const [exportModal, setExportModal] = useState<'EXCEL' | 'PDF' | null>(null);

    // Estados de métricas, carga y errores
    const [coberturaMunicipios, setCoberturaMunicipios] = useState<MunicipalCoverage[]>([]);
    const [causasReferencia, setCausasReferencia] = useState<CausaReferencia[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState<boolean>(false);

    // Carga oficial de métricas epidemiológicas desde PostgreSQL (Render)
    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true);
            setErrorMessage(null);
            try {
                const response = await http.get('/admin/reportes/epidemio');
                if (response.data) {
                    setCoberturaMunicipios(response.data.cobertura || []);
                    setCausasReferencia(response.data.causas || []);
                }
            } catch (error: any) {
                console.error('Error al cargar datos epidemiológicos:', error);
                setErrorMessage('No se pudo conectar con el servidor para obtener los reportes epidemiológicos.');
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []);

    const handleConfirmDownload = async () => {
        setIsExporting(true);
        try {
            if (exportModal === 'EXCEL') {
                const response = await http.get('/admin/reportes/excel', { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Reporte_Epidemiologico_SSO_${new Date().toISOString().split('T')[0]}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else if (exportModal === 'PDF') {
                const response = await http.get('/admin/reportes/pdf', { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Reporte_Jurisdiccional_SSO_${new Date().toISOString().split('T')[0]}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (error: any) {
            console.error('Error al descargar reporte:', error);
            alert('Error al generar el archivo en el servidor.');
        } finally {
            setIsExporting(false);
            setExportModal(null);
        }
    };

    return (
        <div className="space-y-6 text-white w-full">

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes lgFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
                @keyframes lgModal{from{opacity:0;transform:scale(0.95) translateY(20px)}to{opacity:1;transform:none}}
                .lg-fade{animation:lgFade .35s ease both}
                .lg-modal{animation:lgModal .4s cubic-bezier(0.16,1,0.3,1) both}
                .lg-quiet{scrollbar-width:none}
                .lg-quiet::-webkit-scrollbar{display:none}
            `}} />

            {/* CABECERA PRINCIPAL */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-950/40">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                            Centro de Control y Análisis Epidemiológico por Municipio
                        </h2>
                        <p className="text-xs text-cyan-100/80 font-medium mt-0.5">
                            Monitoreo de cobertura de tamizaje neonatal y perfil epidemiológico regional (Istmo de Tehuantepec).
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setExportModal('EXCEL')}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-white/30"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                        <span>Descargar Excel (.xlsx)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setExportModal('PDF')}
                        className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-950/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-white/40"
                    >
                        <FileText className="w-4 h-4 text-cyan-200" />
                        <span>Reporte PDF Jurisdiccional</span>
                    </button>
                </div>
            </div>

            {/* MENSAJE DE ERROR SI FALLA LA API */}
            {errorMessage && (
                <div className="p-4 bg-rose-950/60 border border-rose-300/40 rounded-2xl flex items-center gap-3 text-rose-100 text-xs font-bold backdrop-blur-md">
                    <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* GRÁFICO DE BARRAS DE COBERTURA POR MUNICIPIO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna Izquierda: Cobertura por Municipio */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <h3 className="text-xs font-black text-cyan-200 uppercase tracking-wider">
                            Cobertura de Tamizaje Neonatal por Municipio (%)
                        </h3>
                        <span className="text-cyan-300 font-extrabold text-xs bg-slate-950 px-2.5 py-1 rounded-xl border border-cyan-400/30">Meta: 95%</span>
                    </div>

                    <div className="space-y-4 bg-slate-900/60 p-6 rounded-3xl border border-white/25 min-h-[220px] flex flex-col justify-center backdrop-blur-3xl shadow-2xl">
                        {cargando ? (
                            <div className="py-8 text-center text-xs text-cyan-200 font-medium flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                <span>Cargando métricas desde PostgreSQL (Render)...</span>
                            </div>
                        ) : coberturaMunicipios.length === 0 ? (
                            <p className="text-center text-xs text-cyan-200/70 font-medium">No hay datos de cobertura registrados para este periodo.</p>
                        ) : (
                            coberturaMunicipios.map((m) => (
                                <div key={m.municipio} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold text-white">
                                        <span>{m.municipio}</span>
                                        <span className="font-mono text-cyan-200">{m.coberturaPct}% <span className="text-[10px] text-cyan-200/70 font-normal">({m.muestrasTomadas} / {m.metaJurisdiccional})</span></span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-950/80 rounded-full overflow-hidden flex border border-white/10 p-0.5 shadow-inner">
                                        <div
                                            style={{ width: `${m.coberturaPct}%` }}
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                m.coberturaPct >= 95
                                                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                                                    : m.coberturaPct >= 90
                                                        ? 'bg-amber-400'
                                                        : 'bg-rose-500'
                                            }`}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Distribución de Causas Epidemiológicas */}
                <div className="space-y-4">
                    <div className="border-b border-white/10 pb-2">
                        <h3 className="text-xs font-black text-cyan-200 uppercase tracking-wider">
                            Distribución de Causas de Canalización
                        </h3>
                    </div>

                    <div className="space-y-3 bg-slate-900/60 p-5 rounded-3xl border border-white/25 min-h-[220px] flex flex-col justify-center backdrop-blur-3xl shadow-2xl">
                        {cargando ? (
                            <p className="text-center text-xs text-cyan-200 font-medium">Cargando causas...</p>
                        ) : causasReferencia.length === 0 ? (
                            <p className="text-center text-xs text-cyan-200/70 font-medium">No hay canalizaciones registradas en el periodo.</p>
                        ) : (
                            causasReferencia.map((c) => (
                                <div key={c.causa} className="p-3.5 bg-white/5 rounded-2xl border border-white/10 shadow-sm space-y-1 backdrop-blur-md hover:border-cyan-400/40 transition-all">
                                    <div className="flex justify-between items-center text-xs font-bold text-white">
                                        <span className="truncate max-w-[170px]" title={c.causa}>{c.causa}</span>
                                        <span className="font-mono text-cyan-300 font-black">{c.porcentaje}%</span>
                                    </div>
                                    <p className="text-[11px] text-cyan-200/70 font-semibold">{c.casos} registros en el trimestre</p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-emerald-950/40 rounded-3xl border border-emerald-400/30 flex items-center gap-3.5 backdrop-blur-md shadow-lg">
                        <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-emerald-300 shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-emerald-200">Vigilancia de Muerte Materna Cero</p>
                            <p className="text-[11px] text-emerald-100/80 font-medium mt-0.5">
                                Red de parteras activamente vinculadas con respuesta hospitalaria oportuna.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE EXPORTACIÓN */}
            {exportModal && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900/95 border border-white/40 rounded-[32px] max-w-sm w-full p-6 text-center space-y-4 shadow-2xl shadow-slate-950/90 backdrop-blur-3xl lg-modal">
                        <div className="w-16 h-16 mx-auto bg-cyan-500/20 text-cyan-300 rounded-2xl border border-cyan-400/30 flex items-center justify-center backdrop-blur-md">
                            {exportModal === 'EXCEL' ? <FileSpreadsheet className="w-8 h-8 text-emerald-400" /> : <FileText className="w-8 h-8 text-cyan-300" />}
                        </div>

                        <div>
                            <h3 className="text-base font-black text-white">
                                Exportar Reporte {exportModal === 'EXCEL' ? 'Excel (.xlsx)' : 'PDF Jurisdiccional'}
                            </h3>
                            <p className="text-xs text-cyan-100/80 mt-1 font-medium">
                                Generando informe oficial consolidado de la Jurisdicción Sanitaria No. 2 - Istmo.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setExportModal(null)}
                                disabled={isExporting}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/20"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDownload}
                                disabled={isExporting}
                                className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-950/40 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 border border-white/40"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Generando...</span>
                                    </>
                                ) : (
                                    <span>Confirmar</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TabReportesEpidemio;