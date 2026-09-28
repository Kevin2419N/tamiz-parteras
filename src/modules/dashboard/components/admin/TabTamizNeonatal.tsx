import React, { useState } from 'react';
import { Search, Eye, X, Droplet, ShieldCheck, MapPin } from 'lucide-react';
import type { MuestraGuthrie } from './types';

export const TabTamizNeonatal: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMuestra, setSelectedMuestra] = useState<MuestraGuthrie | null>(null);

    const [muestras] = useState<MuestraGuthrie[]>([
        {
            id: '1',
            folio: 'GUTH-2026-0891',
            nombreRecienNacido: 'Bebé de Mateo Cruz',
            nombreMadre: 'Guadalupe Mateo Cruz',
            fechaToma: '2026-09-24',
            unidadMedica: 'Centro de Salud Juchitán',
            municipio: 'Juchitán de Zaragoza',
            numeroGotas: 4,
            estatus: 'SOSPECHOSO',
            observaciones: 'Muestra con elevación en prueba TSH. Requiere confirmación de laboratorio central.'
        },
        {
            id: '2',
            folio: 'GUTH-2026-0892',
            nombreRecienNacido: 'Bebé de Morales Ruiz',
            nombreMadre: 'Rosa Elena Morales Ruiz',
            fechaToma: '2026-09-25',
            unidadMedica: 'Centro de Salud Tehuantepec',
            municipio: 'Santo Domingo Tehuantepec',
            numeroGotas: 5,
            estatus: 'NORMAL',
            observaciones: 'Panel metabólico completo dentro de rangos normales.'
        },
        {
            id: '3',
            folio: 'GUTH-2026-0893',
            nombreRecienNacido: 'Bebé de Jiménez Solís',
            nombreMadre: 'Carmen Jiménez Solís',
            fechaToma: '2026-09-26',
            unidadMedica: 'Hospital General Salina Cruz',
            municipio: 'Salina Cruz',
            numeroGotas: 4,
            estatus: 'EN_TRANSITO',
            observaciones: 'Enviado con guía de rastreo RAST-8821 a laboratorio estatal de Oaxaca.'
        },
        {
            id: '4',
            folio: 'GUTH-2026-0894',
            nombreRecienNacido: 'Bebé de Vázquez López',
            nombreMadre: 'Juana Vázquez López',
            fechaToma: '2026-09-27',
            unidadMedica: 'Centro de Salud San Blas Atempa',
            municipio: 'San Blas Atempa',
            numeroGotas: 4,
            estatus: 'REGISTRADO',
            observaciones: 'Pendiente recolección por mensajería institucional.'
        },
    ]);

    const filteredMuestras = muestras.filter(
        (m) =>
            m.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.nombreRecienNacido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.nombreMadre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.unidadMedica.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.municipio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getEstatusBadge = (estatus: MuestraGuthrie['estatus']) => {
        switch (estatus) {
            case 'SOSPECHOSO':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">SOSPECHOSO (ALERTA)</span>;
            case 'NORMAL':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">NORMAL</span>;
            case 'EN_TRANSITO':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">EN TRÁNSITO</span>;
            case 'REGISTRADO':
            default:
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-300">REGISTRADO</span>;
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            {/* ENCABEZADO Y BUSCADOR (SIN BOTÓN DE REGISTRO) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-[#9D2449]" />
                        <span>Supervisión de Tamiz Neonatal (Muestras Guthrie)</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Panel de auditoría y seguimiento de tamizaje metabólico en la Jurisdicción No. 2 - Istmo.
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        placeholder="Buscar por folio, bebé, madre o municipio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#9D2449]"
                    />
                </div>
            </div>

            {/* VISTA MÓVIL (< md): TARJETAS COMPACTAS */}
            <div className="space-y-3 md:hidden">
                {filteredMuestras.map((m) => (
                    <div key={m.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-[10px] font-black text-[#9D2449] tracking-wider uppercase block">{m.folio}</span>
                                <h3 className="text-xs font-black text-slate-900">{m.nombreRecienNacido}</h3>
                                <p className="text-[11px] text-slate-500 font-medium">Madre: {m.nombreMadre}</p>
                            </div>
                            <div>{getEstatusBadge(m.estatus)}</div>
                        </div>

                        <div className="text-xs space-y-1 text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                            <div className="flex justify-between">
                                <span className="font-bold text-slate-800">Fecha Toma:</span>
                                <span>{m.fechaToma}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#9D2449]" />
                                    {m.municipio}:
                                </span>
                                <span className="truncate max-w-[140px]">{m.unidadMedica}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-100">
                                <span className="font-bold text-slate-800">Gota talar:</span>
                                <span className="font-black text-rose-700">{m.numeroGotas} / 5 Gotas</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedMuestra(m)}
                            className="w-full py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Auditar Expediente</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* VISTA ESCRITORIO (>= md): TABLA DENSA */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                            <th className="py-3 px-4">Folio Guthrie</th>
                            <th className="py-3 px-4">Recién Nacido / Madre</th>
                            <th className="py-3 px-4">Fecha Toma</th>
                            <th className="py-3 px-4">Unidad / Municipio</th>
                            <th className="py-3 px-4 text-center">Gota Talar</th>
                            <th className="py-3 px-4">Estatus</th>
                            <th className="py-3 px-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {filteredMuestras.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4 font-black text-slate-900">{m.folio}</td>
                                <td className="py-3.5 px-4">
                                    <div className="font-bold text-slate-900">{m.nombreRecienNacido}</div>
                                    <div className="text-[11px] text-slate-500 font-medium">Madre: {m.nombreMadre}</div>
                                </td>
                                <td className="py-3.5 px-4 text-slate-600">{m.fechaToma}</td>
                                <td className="py-3.5 px-4">
                                    <div className="font-bold text-slate-800">{m.unidadMedica}</div>
                                    <div className="text-[11px] text-slate-500">{m.municipio}</div>
                                </td>
                                <td className="py-3.5 px-4 text-center font-black text-rose-700">{m.numeroGotas} / 5</td>
                                <td className="py-3.5 px-4">{getEstatusBadge(m.estatus)}</td>
                                <td className="py-3.5 px-4 text-right">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMuestra(m)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-[#9D2449] hover:text-white text-slate-700 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
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

            {/* MODAL DETALLE DE MUESTRA (AUDITORÍA) */}
            {selectedMuestra && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div>
                                <span className="text-[10px] font-black text-[#9D2449] uppercase">Ficha Técnica Guthrie</span>
                                <h3 className="text-base font-black text-slate-900">{selectedMuestra.folio}</h3>
                            </div>
                            <button type="button" onClick={() => setSelectedMuestra(null)} className="p-1 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                                <p className="font-bold text-slate-900">Recién Nacido: {selectedMuestra.nombreRecienNacido}</p>
                                <p className="text-slate-600">Madre: {selectedMuestra.nombreMadre}</p>
                                <p className="text-slate-600">Fecha Toma: {selectedMuestra.fechaToma}</p>
                                <p className="text-slate-600">Unidad: {selectedMuestra.unidadMedica} ({selectedMuestra.municipio})</p>
                            </div>

                            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-950 font-medium">
                                <p className="font-bold text-[#9D2449] mb-0.5">Observaciones Clínicas:</p>
                                <p>{selectedMuestra.observaciones}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedMuestra(null)}
                                className="w-full py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                            >
                                <ShieldCheck className="w-4 h-4 inline mr-1" />
                                Validar Dictamen Jurisdiccional
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
