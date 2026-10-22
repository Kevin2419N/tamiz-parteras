import React, { useState, useEffect } from 'react';
import { BarChart3, FileSpreadsheet, FileText, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#9D2449]" />
                        <span>Centro de Control y Análisis Epidemiológico por Municipio</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Monitoreo de cobertura de tamizaje neonatal y perfil epidemiológico regional (Istmo de Tehuantepec).
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setExportModal('EXCEL')}
                        className="px-4 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                        <span>Descargar Excel (.xlsx)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setExportModal('PDF')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <FileText className="w-4 h-4 text-rose-300" />
                        <span>Reporte PDF Jurisdiccional</span>
                    </button>
                </div>
            </div>

            {/* MENSAJE DE ERROR SI FALLA LA API */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-bold">
                    <AlertCircle className="w-5 h-5 text-[#9D2449] shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* GRÁFICO DE BARRAS DE COBERTURA POR MUNICIPIO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna Izquierda: Cobertura por Municipio */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                        <span>Cobertura de Tamizaje Neonatal por Municipio (%)</span>
                        <span className="text-[#9D2449] font-bold">Meta Jurisdiccional: 95%</span>
                    </h3>

                    <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 min-h-[160px] flex flex-col justify-center">
                        {cargando ? (
                            <div className="py-8 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-[#9D2449]" />
                                <span>Cargando métricas desde PostgreSQL (Render)...</span>
                            </div>
                        ) : coberturaMunicipios.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 font-medium">No hay datos de cobertura registrados para este periodo.</p>
                        ) : (
                            coberturaMunicipios.map((m) => (
                                <div key={m.municipio} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold text-slate-800">
                                        <span>{m.municipio}</span>
                                        <span>{m.coberturaPct}% ({m.muestrasTomadas} / {m.metaJurisdiccional} muestras)</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                                        <div
                                            style={{ width: `${m.coberturaPct}%` }}
                                            className={`h-full rounded-full transition-all duration-500 ${m.coberturaPct >= 95
                                                ? 'bg-[#9D2449]'
                                                : m.coberturaPct >= 90
                                                    ? 'bg-amber-500'
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
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Distribución de Causas de Canalización
                    </h3>

                    <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 min-h-[160px] flex flex-col justify-center">
                        {cargando ? (
                            <p className="text-center text-xs text-slate-400 font-medium">Cargando causas...</p>
                        ) : causasReferencia.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 font-medium">No hay canalizaciones registradas en el periodo.</p>
                        ) : (
                            causasReferencia.map((c) => (
                                <div key={c.causa} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                                        <span className="truncate max-w-[160px]">{c.causa}</span>
                                        <span className="text-[#9D2449] font-black">{c.porcentaje}%</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-semibold">{c.casos} registros en el trimestre</p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-emerald-700 shrink-0" />
                        <div>
                            <p className="text-xs font-black text-emerald-950">Vigilancia de Muerte Materna Cero</p>
                            <p className="text-[11px] text-emerald-800 font-medium">
                                Red de parteras activamente vinculadas con respuesta hospitalaria oportuna.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE EXPORTACIÓN */}
            {exportModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
                        <div className="w-16 h-16 mx-auto bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-100 flex items-center justify-center">
                            {exportModal === 'EXCEL' ? <FileSpreadsheet className="w-8 h-8 text-emerald-600" /> : <FileText className="w-8 h-8 text-[#9D2449]" />}
                        </div>

                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                Exportar Reporte {exportModal === 'EXCEL' ? 'Excel (.xlsx)' : 'PDF Jurisdiccional'}
                            </h3>
                            <p className="text-xs text-slate-600 mt-1">
                                Generando informe oficial consolidado de la Jurisdicción Sanitaria No. 2 - Istmo.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setExportModal(null)}
                                disabled={isExporting}
                                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDownload}
                                disabled={isExporting}
                                className="w-1/2 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
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