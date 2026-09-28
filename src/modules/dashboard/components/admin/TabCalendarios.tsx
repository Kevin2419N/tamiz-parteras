import React, { useState } from 'react';
import { Calendar, User, Baby, Eye, X } from 'lucide-react';

export const TabCalendarios: React.FC = () => {
    const [subTab, setSubTab] = useState<'FORMATO_2' | 'FORMATO_3'>('FORMATO_2');
    const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

    // Formato 2 Data Mock
    const datosMujer = [
        {
            id: 'm1',
            paciente: 'Rosa Elena Solís Cruz',
            partera: 'Doña Rosa Santiz Gómez',
            comunidad: 'San Pedro Juchitán',
            etapa: 'EMBARAZO (28 SDG)',
            fup: '2026-03-12',
            muac: 'VERDE',
            muacValor: '24.5 cm (Normal)',
            complicaciones: 'Sin complicaciones. Signos vitales normales.',
            vistasPrenatales: 4,
        },
        {
            id: 'm2',
            paciente: 'Ana María Gómez López',
            partera: 'Doña Petrona Cruz Velasco',
            comunidad: 'Salina Cruz',
            etapa: 'PUERPERIO (Día 12)',
            fup: '2026-09-15',
            muac: 'AMARILLO',
            muacValor: '21.0 cm (Riesgo Nutricional)',
            complicaciones: 'Ligero cansancio. Se remitió a suplementación folato.',
            vistasPrenatales: 6,
        },
        {
            id: 'm3',
            paciente: 'Guadalupe Martínez Ruiz',
            partera: 'Doña Micaela Ruiz Hernández',
            comunidad: 'San Blas Atempa',
            etapa: 'EMBARAZO (34 SDG)',
            fup: '2026-01-20',
            muac: 'ROJO',
            muacValor: '18.5 cm (Desnutrición Aguda)',
            complicaciones: 'Alerta Nutricional y Cefalea. Canalizada al Centro de Salud.',
            vistasPrenatales: 3,
        }
    ];

    // Formato 3 Data Mock
    const datosNino = [
        {
            id: 'n1',
            nino: 'Mateo Alejandro Morales Solís',
            madre: 'Rosa Elena Solís Cruz',
            edad: '4 Meses',
            partera: 'Doña Rosa Santiz Gómez',
            comunidad: 'San Pedro Juchitán',
            vacunas: 'BCG y Anti-Hepatitis B Aplicadas',
            tamiz: 'Metabólico y Auditivo Normales',
            lactancia: 'EXCLUSIVA (Primeros 6 Meses)',
            estatus: 'SALUDABLE',
        },
        {
            id: 'n2',
            nino: 'Sofía Isabel Gómez',
            madre: 'Ana María Gómez López',
            edad: '12 Días',
            partera: 'Doña Petrona Cruz Velasco',
            comunidad: 'Salina Cruz',
            vacunas: 'BCG Aplicada (Pendiente Hep B)',
            tamiz: 'Metabólico Tomado (En Tránsito)',
            lactancia: 'EXCLUSIVA',
            estatus: 'CONTROL_NORMAL',
        },
        {
            id: 'n3',
            nino: 'Carlos Daniel Martínez',
            madre: 'Guadalupe Martínez Ruiz',
            edad: '8 Meses',
            partera: 'Doña Micaela Ruiz Hernández',
            comunidad: 'San Blas Atempa',
            vacunas: 'Esquema Completo a los 6 meses',
            tamiz: 'Completado',
            lactancia: 'COMPLEMENTARIA CON ALIMENTOS',
            estatus: 'SEGUIMIENTO_ESPECIAL',
        }
    ];

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#9D2449]" />
                        <span>Auditoría de Calendarios Comunitarios de Salud</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Inspección de registros de atención del Calendario de la Mujer (Formato 2) y del Niño (Formato 3).
                    </p>
                </div>

                {/* SUB-TABS SELECTOR */}
                <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
                    <button
                        type="button"
                        onClick={() => setSubTab('FORMATO_2')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${subTab === 'FORMATO_2'
                            ? 'bg-[#9D2449] text-white shadow-md'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        <span>Formato 2: Mujer</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSubTab('FORMATO_3')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${subTab === 'FORMATO_3'
                            ? 'bg-[#9D2449] text-white shadow-md'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Baby className="w-4 h-4" />
                        <span>Formato 3: Niño(a)</span>
                    </button>
                </div>
            </div>

            {/* VISTA FORMATO 2 */}
            {subTab === 'FORMATO_2' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                                <th className="py-3 px-4">Paciente Gestante/Puerpera</th>
                                <th className="py-3 px-4">Partera Responsable</th>
                                <th className="py-3 px-4">Comunidad</th>
                                <th className="py-3 px-4">Etapa Clínica</th>
                                <th className="py-3 px-4">Cinta MUAC Nutrición</th>
                                <th className="py-3 px-4">Complicaciones</th>
                                <th className="py-3 px-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                            {datosMujer.map((d) => (
                                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3 px-4 font-black text-slate-900">{d.paciente}</td>
                                    <td className="py-3 px-4 text-slate-800">{d.partera}</td>
                                    <td className="py-3 px-4 text-slate-600">{d.comunidad}</td>
                                    <td className="py-3 px-4 font-bold text-[#9D2449]">{d.etapa}</td>
                                    <td className="py-3 px-4">
                                        {d.muac === 'VERDE' && <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">VERDE ({d.muacValor})</span>}
                                        {d.muac === 'AMARILLO' && <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">AMARILLO ({d.muacValor})</span>}
                                        {d.muac === 'ROJO' && <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">ROJO ({d.muacValor})</span>}
                                    </td>
                                    <td className="py-3 px-4 max-w-xs text-slate-600 font-normal">{d.complicaciones}</td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRecord({ tipo: 'Formato 2 - Mujer', ...d })}
                                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* VISTA FORMATO 3 */}
            {subTab === 'FORMATO_3' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                                <th className="py-3 px-4">Nombre Niño(a)</th>
                                <th className="py-3 px-4">Madre</th>
                                <th className="py-3 px-4">Edad</th>
                                <th className="py-3 px-4">Partera Responsable</th>
                                <th className="py-3 px-4">Vacunación</th>
                                <th className="py-3 px-4">Lactancia</th>
                                <th className="py-3 px-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                            {datosNino.map((n) => (
                                <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3 px-4 font-black text-slate-900">{n.nino}</td>
                                    <td className="py-3 px-4 text-slate-700">{n.madre}</td>
                                    <td className="py-3 px-4 font-bold text-slate-800">{n.edad}</td>
                                    <td className="py-3 px-4 text-slate-800">{n.partera} ({n.comunidad})</td>
                                    <td className="py-3 px-4 text-slate-600 font-medium">{n.vacunas}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                                            {n.lactancia}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRecord({ tipo: 'Formato 3 - Niño(a)', ...n })}
                                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL DETALLE DE RECORD */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div>
                                <span className="text-[10px] font-black text-[#9D2449] uppercase">{selectedRecord.tipo}</span>
                                <h3 className="text-base font-black text-slate-900">
                                    {selectedRecord.paciente || selectedRecord.nino}
                                </h3>
                            </div>
                            <button type="button" onClick={() => setSelectedRecord(null)} className="p-1 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2 text-xs">
                            <p className="text-slate-700"><strong>Partera:</strong> {selectedRecord.partera}</p>
                            <p className="text-slate-700"><strong>Comunidad:</strong> {selectedRecord.comunidad}</p>
                            {selectedRecord.etapa && <p className="text-slate-700"><strong>Etapa:</strong> {selectedRecord.etapa}</p>}
                            {selectedRecord.muacValor && <p className="text-slate-700"><strong>Cinta MUAC:</strong> {selectedRecord.muacValor}</p>}
                            {selectedRecord.vacunas && <p className="text-slate-700"><strong>Esquema Vacunación:</strong> {selectedRecord.vacunas}</p>}
                            {selectedRecord.tamiz && <p className="text-slate-700"><strong>Tamiz:</strong> {selectedRecord.tamiz}</p>}
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedRecord(null)}
                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
                        >
                            Cerrar Auditoría
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
