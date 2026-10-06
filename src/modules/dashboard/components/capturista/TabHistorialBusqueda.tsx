import React, { useState } from 'react';
import { Search, Eye, Filter, Truck, AlertTriangle, CheckCircle2, FileText, Printer, X, Calendar } from 'lucide-react';
import type { RegistroTamizHistorial } from './types';

interface TabHistorialBusquedaProps {
    registros: RegistroTamizHistorial[];
}

export const TabHistorialBusqueda: React.FC<TabHistorialBusquedaProps> = ({ registros }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('TODOS');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedRegistro, setSelectedRegistro] = useState<RegistroTamizHistorial | null>(null);

    const filtrados = registros.filter((item) => {
        const matchSearch =
            item.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.rn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.madre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.municipio.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = statusFilter === 'TODOS' || item.estatus === statusFilter;

        let matchDate = true;
        if (startDate) {
            matchDate = matchDate && item.fechaToma >= startDate;
        }
        if (endDate) {
            matchDate = matchDate && item.fechaToma <= endDate;
        }

        return matchSearch && matchStatus && matchDate;
    });

    const getEstatusBadge = (estatus: string) => {
        switch (estatus) {
            case 'MUESTRA_COAGULADA':
            case 'MUESTRA_INSUFICIENTE':
            case 'RETOMA_SOLICITADA':
                return (
                    <span className="px-3 py-1 bg-rose-100 text-rose-900 border border-rose-300 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-sm">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" /> Re-Toma Urgente
                    </span>
                );
            case 'EN_TRANSITO_LAB':
                return (
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                        <Truck className="w-3.5 h-3.5 text-amber-600" /> En Tránsito Lab
                    </span>
                );
            case 'PROCESADA_NORMAL':
                return (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resultado Normal
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold border border-slate-200">
                        {estatus}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">

            {/* BARRA DE BÚSQUEDA, RANGO DE FECHAS Y FILTROS */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">

                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                    {/* Búsqueda por Texto */}
                    <div className="relative w-full lg:w-96">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar por Folio Guthrie, RN, Madre o Municipio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9D2449] font-medium"
                        />
                    </div>

                    {/* Selector de Rango de Fechas (Calendario Inicio y Fin) */}
                    <div className="flex items-center gap-2 w-full lg:w-auto bg-slate-50 p-2 rounded-2xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1 pl-1">
                            <Calendar className="w-4 h-4 text-[#9D2449]" /> Rango:
                        </span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#9D2449]"
                            title="Fecha Inicio"
                        />
                        <span className="text-xs font-bold text-slate-400">a</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#9D2449]"
                            title="Fecha Fin"
                        />
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-[10px] font-bold text-rose-700 hover:underline px-1 cursor-pointer"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>

                </div>

                {/* Filtros por Estatus Pill */}
                <div className="flex items-center gap-2 w-full overflow-x-auto pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5 text-[#9D2449]" /> Estatus:
                    </span>
                    {[
                        { id: 'TODOS', label: 'Todos los Registros' },
                        { id: 'EN_TRANSITO_LAB', label: 'En Tránsito Lab' },
                        { id: 'PROCESADA_NORMAL', label: 'Procesada Normal' },
                        { id: 'MUESTRA_COAGULADA', label: 'Alertas Re-Toma' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setStatusFilter(f.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${statusFilter === f.id
                                ? 'bg-[#9D2449] text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

            </div>

            {/* TABLA DENSA DE REGISTROS HISTÓRICOS */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#9D2449]" />
                        <span>Historial Completo de Tarjetas de Tamiz Registradas</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        {filtrados.length} Registros Encontrados
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/70 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                                <th className="py-3 px-3">Folio Guthrie</th>
                                <th className="py-3 px-3">Recién Nacido</th>
                                <th className="py-3 px-3">Madre / Tutor</th>
                                <th className="py-3 px-3">Unidad Médica / CLUES</th>
                                <th className="py-3 px-3">Fecha Toma</th>
                                <th className="py-3 px-3">Estatus</th>
                                <th className="py-3 px-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium">
                            {filtrados.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3.5 px-3 font-mono font-bold text-[#9D2449] bg-rose-50/40 rounded-lg">
                                        {item.folio}
                                    </td>
                                    <td className="py-3.5 px-3 font-extrabold text-slate-900">{item.rn}</td>
                                    <td className="py-3.5 px-3 text-slate-700">
                                        <div>{item.madre}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{item.curpMadre}</div>
                                    </td>
                                    <td className="py-3.5 px-3 text-slate-600">
                                        <div className="font-bold text-slate-800">{item.unidadMedica}</div>
                                        <div className="text-[10px] font-mono text-emerald-700">{item.clues}</div>
                                    </td>
                                    <td className="py-3.5 px-3 text-slate-500 font-mono">{item.fechaToma}</td>
                                    <td className="py-3.5 px-3">{getEstatusBadge(item.estatus)}</td>
                                    <td className="py-3.5 px-3 text-right">
                                        <button
                                            onClick={() => setSelectedRegistro(item)}
                                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#9D2449] font-bold rounded-xl text-xs flex items-center gap-1 ml-auto border border-rose-200 transition-colors cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Ver Ficha</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DETALLE DE FICHA TÉCNICA GUTHRIE */}
            {selectedRegistro && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-[#9D2449] rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono font-bold text-[#9D2449] block">
                                        FOLIO GUTHRIE: {selectedRegistro.folio}
                                    </span>
                                    <h3 className="text-base font-black text-slate-900">
                                        Ficha Oficial de Tamiz Neonatal
                                    </h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedRegistro(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-bold">Recién Nacido:</span>
                                <span className="font-extrabold text-slate-900">{selectedRegistro.rn}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-bold">Madre / Tutor:</span>
                                <span className="font-extrabold text-slate-900">{selectedRegistro.madre}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-bold">Unidad de Toma (CLUES):</span>
                                <span className="font-extrabold text-slate-900">{selectedRegistro.unidadMedica} ({selectedRegistro.clues})</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-bold">Municipio:</span>
                                <span className="font-extrabold text-slate-900">{selectedRegistro.municipio}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-bold">Fecha Toma:</span>
                                <span className="font-mono font-bold text-slate-900">{selectedRegistro.fechaToma}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-bold">Estatus Muestra:</span>
                                <span>{getEstatusBadge(selectedRegistro.estatus)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Reimprimir Tarjeta Guthrie</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
