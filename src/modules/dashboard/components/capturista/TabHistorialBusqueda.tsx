/* spell-checker: disable */
import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, Truck, AlertTriangle, CheckCircle2, FileText, Printer, X, Calendar, Loader2 } from 'lucide-react';
import type { RegistroTamizHistorial } from './types';
import { http } from '../../../../services/http'; // <--- Instancia de Axios centralizada

interface TabHistorialBusquedaProps {
    registros?: RegistroTamizHistorial[];
}

export const TabHistorialBusqueda: React.FC<TabHistorialBusquedaProps> = ({ registros: propsRegistros = [] }) => {
    const [registros, setRegistros] = useState<any[]>(propsRegistros);
    const [cargando, setCargando] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('TODOS');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedRegistro, setSelectedRegistro] = useState<any | null>(null);

    // Carga de historial desde el backend real en PostgreSQL
    useEffect(() => {
        const cargarHistorial = async () => {
            setCargando(true);
            try {
                // RUTA CORREGIDA: Apunta exactamente al endpoint /tamiz/muestras del backend
                const res = await http.get('/tamiz/muestras');
                if (res.data) {
                    setRegistros(res.data);
                }
            } catch (error) {
                console.error('Error al cargar el historial desde el backend:', error);
                setRegistros([]);
            } finally {
                setCargando(false);
            }
        };

        const timeoutId = setTimeout(() => {
            cargarHistorial();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, []);

    const filtrados = registros.filter((item) => {
        const folioStr = item.folio_tarjeta || item.folio || '';
        const rnStr = `${item.rn_nombres || item.rn || ''} ${item.rn_apellido_paterno || ''}`;
        const madreStr = `${item.madre_nombres || item.madre || ''} ${item.madre_apellido_paterno || ''}`;
        const munStr = item.madre_municipio || item.municipio || '';

        const matchSearch =
            folioStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rnStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            madreStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            munStr.toLowerCase().includes(searchTerm.toLowerCase());

        const estatusItem = item.estatus_muestra || item.estatus || 'REGISTRADO';
        const matchStatus = statusFilter === 'TODOS' || estatusItem === statusFilter;

        const fechaTomaStr = (item.rn_fecha_toma_muestra || item.fechaToma || '').split('T')[0];
        let matchDate = true;
        if (startDate && fechaTomaStr) {
            matchDate = matchDate && fechaTomaStr >= startDate;
        }
        if (endDate && fechaTomaStr) {
            matchDate = matchDate && fechaTomaStr <= endDate;
        }

        return matchSearch && matchStatus && matchDate;
    });

    const getEstatusBadge = (estatus: string) => {
        switch (estatus) {
            case 'MUESTRA_COAGULADA':
            case 'MUESTRA_INSUFICIENTE':
            case 'RETOMA_SOLICITADA':
            case 'RE_TOMA_URGENTE':
                return (
                    <span className="px-3 py-1 bg-rose-100 text-rose-900 border border-rose-300 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-sm">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" /> Re-Toma Urgente
                    </span>
                );
            case 'EN_TRANSITO_LAB':
            case 'EN_LOTE_TRANSITO':
                return (
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                        <Truck className="w-3.5 h-3.5 text-amber-600" /> En Tránsito Lab
                    </span>
                );
            case 'PROCESADA_NORMAL':
            case 'REGISTRADO':
                return (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {estatus === 'REGISTRADO' ? 'Registrado' : 'Resultado Normal'}
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

                    {/* Selector de Rango de Fechas */}
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
                                type="button"
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
                        { id: 'REGISTRADO', label: 'Registrados' },
                        { id: 'MUESTRA_COAGULADA', label: 'Alertas Re-Toma' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            type="button"
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

            {/* TABLA DE REGISTROS HISTÓRICOS */}
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
                            {cargando ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-slate-400 font-semibold">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-[#9D2449]" />
                                            <span>Consultando registros en PostgreSQL...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-400 font-normal">
                                        No se encontraron registros de tarjetas Guthrie que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                filtrados.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-3 font-mono font-bold text-[#9D2449] bg-rose-50/40 rounded-lg">
                                            {item.folio_tarjeta || item.folio}
                                        </td>
                                        <td className="py-3.5 px-3 font-extrabold text-slate-900">
                                            {item.rn_nombres || item.rn} {item.rn_apellido_paterno || ''}
                                        </td>
                                        <td className="py-3.5 px-3 text-slate-700">
                                            <div>{item.madre_nombres || item.madre} {item.madre_apellido_paterno || ''}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{item.madre_curp || item.curpMadre}</div>
                                        </td>
                                        <td className="py-3.5 px-3 text-slate-600">
                                            <div className="font-bold text-slate-800">{item.unidad_medica_nombre || item.unidadMedica}</div>
                                            <div className="text-[10px] font-mono text-emerald-700">{item.clues_unidad || item.clues}</div>
                                        </td>
                                        <td className="py-3.5 px-3 text-slate-500 font-mono">
                                            {(item.rn_fecha_toma_muestra || item.fechaToma || '').split('T')[0]}
                                        </td>
                                        <td className="py-3.5 px-3">
                                            {getEstatusBadge(item.estatus_muestra || item.estatus || 'REGISTRADO')}
                                        </td>
                                        <td className="py-3.5 px-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedRegistro(item)}
                                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#9D2449] font-bold rounded-xl text-xs flex items-center gap-1 ml-auto border border-rose-200 transition-colors cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Ver Ficha</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
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
                                        FOLIO GUTHRIE: {selectedRegistro.folio_tarjeta || selectedRegistro.folio}
                                    </span>
                                    <h3 className="text-base font-black text-slate-900">
                                        Ficha Oficial de Tamiz Neonatal
                                    </h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRegistro(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-bold">Recién Nacido:</span>
                                <span className="font-extrabold text-slate-900">
                                    {selectedRegistro.rn_nombres || selectedRegistro.rn} {selectedRegistro.rn_apellido_paterno || ''}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-bold">Madre / Tutor:</span>
                                <span className="font-extrabold text-slate-900">
                                    {selectedRegistro.madre_nombres || selectedRegistro.madre} {selectedRegistro.madre_apellido_paterno || ''}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-bold">Unidad de Toma (CLUES):</span>
                                <span className="font-extrabold text-slate-900">
                                    {selectedRegistro.unidad_medica_nombre || selectedRegistro.unidadMedica} ({selectedRegistro.clues_unidad || selectedRegistro.clues})
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-bold">Municipio:</span>
                                <span className="font-extrabold text-slate-900">
                                    {selectedRegistro.madre_municipio || selectedRegistro.municipio || 'Juchitán'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-bold">Fecha Toma:</span>
                                <span className="font-mono font-bold text-slate-900">
                                    {(selectedRegistro.rn_fecha_toma_muestra || selectedRegistro.fechaToma || '').split('T')[0]}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-bold">Estatus Muestra:</span>
                                <span>{getEstatusBadge(selectedRegistro.estatus_muestra || selectedRegistro.estatus || 'REGISTRADO')}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
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

export default TabHistorialBusqueda;