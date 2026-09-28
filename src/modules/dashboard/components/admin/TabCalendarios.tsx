import React, { useState } from 'react';
import { Calendar, User, Baby, Eye, X, MapPin } from 'lucide-react';

interface RegistroMujer {
    id: string;
    folio: string;
    nombreMujer: string;
    partera: string;
    municipio: string;
    semanaGestacion: number;
    nutricionMUAC: 'VERDE' | 'AMARILLO' | 'ROJO';
    controlesRealizados: number;
    alertas: string;
}

interface RegistroNino {
    id: string;
    folio: string;
    nombreNino: string;
    nombreMadre: string;
    partera: string;
    municipio: string;
    edadMeses: number;
    tamizTomado: boolean;
    vacunasCompletas: boolean;
    alertas: string;
}

export const TabCalendarios: React.FC = () => {
    const [subTab, setSubTab] = useState<'FORMATO_2' | 'FORMATO_3'>('FORMATO_2');
    const [selectedExpediente, setSelectedExpediente] = useState<{ titulo: string; detalle: string } | null>(null);

    const expedientesMujer: RegistroMujer[] = [
        {
            id: 'm1',
            folio: 'F2-2026-0041',
            nombreMujer: 'Sofía Isabel Morales Cruz',
            partera: 'Doña Rosa Santiz Gómez',
            municipio: 'Juchitán de Zaragoza',
            semanaGestacion: 28,
            nutricionMUAC: 'VERDE',
            controlesRealizados: 4,
            alertas: 'Evolución normal de gestación'
        },
        {
            id: 'm2',
            folio: 'F2-2026-0042',
            nombreMujer: 'Juana Carmen López Solís',
            partera: 'Doña Juana Martínez Velázquez',
            municipio: 'Santo Domingo Tehuantepec',
            semanaGestacion: 34,
            nutricionMUAC: 'AMARILLO',
            controlesRealizados: 5,
            alertas: 'Riesgo Nutricional Moderado (Cinta MUAC 22cm)'
        },
        {
            id: 'm3',
            folio: 'F2-2026-0043',
            nombreMujer: 'Lilia Ana Ruiz Vázquez',
            partera: 'Doña Esperanza Cruz Castillo',
            municipio: 'Salina Cruz',
            semanaGestacion: 38,
            nutricionMUAC: 'ROJO',
            controlesRealizados: 6,
            alertas: 'ALERTA: Desnutrición Severa. Remitida a hospital.'
        },
    ];

    const expedientesNino: RegistroNino[] = [
        {
            id: 'n1',
            folio: 'F3-2026-0091',
            nombreNino: 'Bebé Mateo Morales',
            nombreMadre: 'Sofía Isabel Morales Cruz',
            partera: 'Doña Rosa Santiz Gómez',
            municipio: 'Juchitán de Zaragoza',
            edadMeses: 2,
            tamizTomado: true,
            vacunasCompletas: true,
            alertas: 'Crecimiento y desarrollo óptimo'
        },
        {
            id: 'n2',
            folio: 'F3-2026-0092',
            nombreNino: 'Bebé López Solís',
            nombreMadre: 'Juana Carmen López Solís',
            partera: 'Doña Juana Martínez Velázquez',
            municipio: 'Santo Domingo Tehuantepec',
            edadMeses: 4,
            tamizTomado: true,
            vacunasCompletas: false,
            alertas: 'Pendiente refuerzo Pentavalente (Semana 16)'
        },
    ];

    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#9D2449]" />
                        <span>Auditoría de Calendarios Comunitarios (Formatos 2 y 3)</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Monitoreo del seguimiento prenatal, cinta MUAC y control de vacunación infantil.
                    </p>
                </div>

                {/* SELECTOR TOUCH SUBTAB (FORMATO 2 / FORMATO 3) */}
                <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setSubTab('FORMATO_2')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${subTab === 'FORMATO_2'
                                ? 'bg-[#9D2449] text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <User className="w-3.5 h-3.5" />
                        <span>Formato 2: Mujer</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSubTab('FORMATO_3')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${subTab === 'FORMATO_3'
                                ? 'bg-[#9D2449] text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Baby className="w-3.5 h-3.5" />
                        <span>Formato 3: Niño</span>
                    </button>
                </div>
            </div>

            {/* SECCIÓN FORMATO 2: CALENDARIO DE LA MUJER */}
            {subTab === 'FORMATO_2' && (
                <div className="space-y-4">
                    {/* VISTA MÓVIL (< md) */}
                    <div className="space-y-3 md:hidden">
                        {expedientesMujer.map((m) => (
                            <div key={m.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[10px] font-black text-[#9D2449] uppercase tracking-wider block">{m.folio}</span>
                                        <h3 className="text-xs font-black text-slate-900">{m.nombreMujer}</h3>
                                        <p className="text-[11px] text-slate-500 font-medium">Partera: {m.partera}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${m.nutricionMUAC === 'VERDE'
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                            : m.nutricionMUAC === 'AMARILLO'
                                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                                        }`}>
                                        MUAC {m.nutricionMUAC}
                                    </span>
                                </div>

                                <div className="text-xs space-y-1 text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-800">Sem. Gestación:</span>
                                        <span>{m.semanaGestacion} SDG</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-800">Controles Prenatales:</span>
                                        <span className="font-black text-[#9D2449]">{m.controlesRealizados} Visitas</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{m.municipio}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedExpediente({ titulo: `${m.folio} - ${m.nombreMujer}`, detalle: m.alertas })}
                                    className="w-full py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Auditar Expediente Mujer</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* VISTA ESCRITORIO (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                                    <th className="py-3 px-4">Folio F2</th>
                                    <th className="py-3 px-4">Gestante / Partera</th>
                                    <th className="py-3 px-4">Sem. Gestación</th>
                                    <th className="py-3 px-4">Cinta MUAC</th>
                                    <th className="py-3 px-4">Visitas</th>
                                    <th className="py-3 px-4 text-right">Acción Auditoría</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                                {expedientesMujer.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-black text-slate-900">{m.folio}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-900">{m.nombreMujer}</div>
                                            <div className="text-[11px] text-slate-500">{m.partera} ({m.municipio})</div>
                                        </td>
                                        <td className="py-3.5 px-4 font-black text-slate-900">{m.semanaGestacion} SDG</td>
                                        <td className="py-3.5 px-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${m.nutricionMUAC === 'VERDE'
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                    : m.nutricionMUAC === 'AMARILLO'
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                        : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                                                }`}>
                                                MUAC {m.nutricionMUAC}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-black text-[#9D2449]">{m.controlesRealizados} visitas</td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedExpediente({ titulo: `${m.folio} - ${m.nombreMujer}`, detalle: m.alertas })}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-[#9D2449] hover:text-white text-slate-800 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Auditar</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECCIÓN FORMATO 3: CALENDARIO DEL NIÑO */}
            {subTab === 'FORMATO_3' && (
                <div className="space-y-4">
                    {/* VISTA MÓVIL (< md) */}
                    <div className="space-y-3 md:hidden">
                        {expedientesNino.map((n) => (
                            <div key={n.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[10px] font-black text-[#9D2449] uppercase tracking-wider block">{n.folio}</span>
                                        <h3 className="text-xs font-black text-slate-900">{n.nombreNino}</h3>
                                        <p className="text-[11px] text-slate-500 font-medium">Madre: {n.nombreMadre}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${n.vacunasCompletas
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                                        }`}>
                                        {n.vacunasCompletas ? 'Esquema Completo' : 'Vacuna Pendiente'}
                                    </span>
                                </div>

                                <div className="text-xs space-y-1 text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-800">Edad:</span>
                                        <span>{n.edadMeses} Meses</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-800">Tamiz Neonatal:</span>
                                        <span className="font-black text-emerald-700">{n.tamizTomado ? 'Realizado' : 'Pendiente'}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedExpediente({ titulo: `${n.folio} - ${n.nombreNino}`, detalle: n.alertas })}
                                    className="w-full py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Auditar Expediente Niño</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* VISTA ESCRITORIO (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                                    <th className="py-3 px-4">Folio F3</th>
                                    <th className="py-3 px-4">Recién Nacido / Madre</th>
                                    <th className="py-3 px-4">Edad (Meses)</th>
                                    <th className="py-3 px-4">Tamiz Neonatal</th>
                                    <th className="py-3 px-4">Esquema Vacunación</th>
                                    <th className="py-3 px-4 text-right">Acción Auditoría</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                                {expedientesNino.map((n) => (
                                    <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-black text-slate-900">{n.folio}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-900">{n.nombreNino}</div>
                                            <div className="text-[11px] text-slate-500">Madre: {n.nombreMadre}</div>
                                        </td>
                                        <td className="py-3.5 px-4 font-black text-slate-900">{n.edadMeses} Meses</td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                GUTHRIE OK
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${n.vacunasCompletas ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                {n.vacunasCompletas ? 'COMPLETO' : 'PENDIENTE'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedExpediente({ titulo: `${n.folio} - ${n.nombreNino}`, detalle: n.alertas })}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-[#9D2449] hover:text-white text-slate-800 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Auditar</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL DETALLE DE AUDITORÍA */}
            {selectedExpediente && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-base font-black text-slate-900">{selectedExpediente.titulo}</h3>
                            <button type="button" onClick={() => setSelectedExpediente(null)} className="p-1 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 space-y-2">
                            <p className="font-black text-[#9D2449]">Dictamen Epidemiológico Jurisdiccional:</p>
                            <p>{selectedExpediente.detalle}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedExpediente(null)}
                            className="w-full py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-sm"
                        >
                            Cerrar Auditoría
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
