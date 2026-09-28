import React, { useState } from 'react';
import { BarChart3, FileSpreadsheet, FileText, ShieldCheck } from 'lucide-react';

interface MunicipalCoverage {
    municipio: string;
    coberturaPct: number;
    muestrasTomadas: number;
    metaJurisdiccional: number;
    parterasActivas: number;
}

export const TabReportesEpidemio: React.FC = () => {
    const [exportModal, setExportModal] = useState<'EXCEL' | 'PDF' | null>(null);

    const coberturaMunicipios: MunicipalCoverage[] = [
        { municipio: 'Juchitán de Zaragoza', coberturaPct: 96, muestrasTomadas: 420, metaJurisdiccional: 438, parterasActivas: 28 },
        { municipio: 'Salina Cruz', coberturaPct: 95, muestrasTomadas: 310, metaJurisdiccional: 326, parterasActivas: 18 },
        { municipio: 'Santo Domingo Tehuantepec', coberturaPct: 92, muestrasTomadas: 280, metaJurisdiccional: 304, parterasActivas: 22 },
        { municipio: 'El Espinal', coberturaPct: 93, muestrasTomadas: 110, metaJurisdiccional: 118, parterasActivas: 8 },
        { municipio: 'Asunción Ixtaltepec', coberturaPct: 91, muestrasTomadas: 140, metaJurisdiccional: 154, parterasActivas: 10 },
        { municipio: 'Ciudad Ixtepec', coberturaPct: 90, muestrasTomadas: 160, metaJurisdiccional: 178, parterasActivas: 12 },
        { municipio: 'San Blas Atempa', coberturaPct: 84, muestrasTomadas: 95, metaJurisdiccional: 113, parterasActivas: 9 },
    ];

    const causasReferencia = [
        { causa: 'Control Prenatal de Rutina (Formato 1)', porcentaje: 45, casos: 216, color: 'bg-emerald-500' },
        { causa: 'Identificación de Riesgo Nutricional (Cinta MUAC)', porcentaje: 25, casos: 120, color: 'bg-[#9D2449]' },
        { causa: 'Sospecha de Preeclampsia / Hipertensión', porcentaje: 18, casos: 86, color: 'bg-amber-500' },
        { causa: 'Notificación de Febril / Alerta Vectorial (Zika/Dengue)', porcentaje: 12, casos: 58, color: 'bg-[#9D2449]' },
    ];

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
                        className="px-4 py-2 bg bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                        <span>Descargar Excel (SSO-2026.xlsx)</span>
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

            {/* GRAFICO DE BARRAS DE COBERTURA POR MUNICIPIO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna Izquierda: Cobertura por Municipio (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                        <span>Cobertura de Tamizaje Neonatal por Municipio (%)</span>
                        <span className="text-[#9D2449] font-bold">Meta Jurisdiccional: 95%</span>
                    </h3>

                    <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        {coberturaMunicipios.map((m) => (
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
                        ))}
                    </div>
                </div>

                {/* Columna Derecha: Distribución de Causas Epidemiológicas */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Distribución de Causas de Canalización
                    </h3>

                    <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        {causasReferencia.map((c) => (
                            <div key={c.causa} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                                    <span className="truncate max-w-[160px]">{c.causa}</span>
                                    <span className="text-[#9D2449] font-black">{c.porcentaje}%</span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-semibold">{c.casos} registros en el trimestre</p>
                            </div>
                        ))}
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

            {/* MODAL SIMULACION DE EXPORTACION */}
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

                        <button
                            type="button"
                            onClick={() => setExportModal(null)}
                            className="w-full py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                        >
                            Confirmar Descarga de Archivo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
