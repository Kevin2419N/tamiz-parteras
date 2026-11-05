/* spell-checker: disable */
import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, Truck, AlertTriangle, CheckCircle2, FileText, Printer, X, Calendar, Loader2, Sparkles, Database } from 'lucide-react';
import type { RegistroTamizHistorial } from './types';
import { http } from '../../../../services/http';

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

    useEffect(() => {
        const cargarHistorial = async () => {
            setCargando(true);
            try {
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
                    <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-400/40 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Re-Toma Urgente
                    </span>
                );
            case 'EN_TRANSITO_LAB':
            case 'EN_LOTE_TRANSITO':
                return (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                        <Truck className="w-3.5 h-3.5 text-amber-400" /> En Tránsito Lab
                    </span>
                );
            case 'PROCESADA_NORMAL':
            case 'REGISTRADO':
                return (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {estatus === 'REGISTRADO' ? 'Registrado' : 'Resultado Normal'}
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 bg-white/10 text-cyan-200 rounded-full text-[10px] font-bold border border-white/20 backdrop-blur-md">
                        {estatus}
                    </span>
                );
        }
    };

    const cardGlassStyle = "p-6 bg-white/5 rounded-3xl border border-white/30 backdrop-blur-3xl shadow-[0_20px_40px_-15px_rgba(15,23,42,0.5)] space-y-4";
    const inputGlassStyle = "w-full px-3.5 py-2.5 bg-white/5 border border-white/30 rounded-xl text-white text-xs font-semibold placeholder:text-white/40 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 backdrop-blur-md transition-all shadow-inner";

    return (
        <div className="space-y-6 text-white w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 animate-fadeIn">

            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <div className={cardGlassStyle}>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                    {/* Búsqueda por Texto */}
                    <div className="relative w-full lg:w-96">
                        <Search className="w-4 h-4 text-cyan-300 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar por Folio Guthrie, RN, Madre o Municipio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={inputGlassStyle + " pl-10"}
                        />
                    </div>

                    {/* Selector de Rango de Fechas */}
                    <div className="flex items-center gap-2 w-full lg:w-auto bg-white/5 p-2 rounded-2xl border border-white/20 backdrop-blur-md">
                        <span className="text-xs font-bold text-cyan-200 flex items-center gap-1 pl-1">
                            <Calendar className="w-4 h-4 text-cyan-400" /> Rango:
                        </span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-slate-900/60 border border-white/30 rounded-xl px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-cyan-300"
                            title="Fecha Inicio"
                        />
                        <span className="text-xs font-bold text-white/50">a</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-slate-900/60 border border-white/30 rounded-xl px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-cyan-300"
                            title="Fecha Fin"
                        />
                        {(startDate || endDate) && (
                            <button
                                type="button"
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-[10px] font-bold text-rose-300 hover:underline px-1 cursor-pointer"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>

                </div>

                {/* Filtros por Estatus Pill */}
                <div className="flex items-center gap-2 w-full overflow-x-auto pt-3 border-t border-white/15">
                    <span className="text-xs font-bold text-cyan-200 whitespace-nowrap flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5 text-cyan-400" /> Estatus:
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
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border ${statusFilter === f.id
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white border-white/40 shadow-lg shadow-cyan-950/50'
                                : 'bg-white/5 text-white/80 border-white/20 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TABLA DE REGISTROS HISTÓRICOS */}
            <div className={cardGlassStyle}>
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <h3 className="text-sm font-black text-white flex items-center gap-2.5">
                        <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-400/40 text-cyan-300">
                            <Database className="w-4 h-4" />
                        </div>
                        <span>Historial Completo de Tarjetas de Tamiz Registradas</span>
                    </h3>
                    <span className="text-xs font-bold text-cyan-200 bg-white/10 px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-md">
                        {filtrados.length} Registros Encontrados
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-[11px] font-bold uppercase text-cyan-200 border-b border-white/15">
                                <th className="py-3 px-3.5">Folio Guthrie</th>
                                <th className="py-3 px-3.5">Recién Nacido</th>
                                <th className="py-3 px-3.5">Madre / Tutor</th>
                                <th className="py-3 px-3.5">Unidad Médica / CLUES</th>
                                <th className="py-3 px-3.5">Fecha Toma</th>
                                <th className="py-3 px-3.5">Estatus</th>
                                <th className="py-3 px-3.5 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-xs font-medium">
                            {cargando ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-cyan-200 font-semibold">
                                        <div className="flex items-center justify-center gap-2.5">
                                            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                            <span>Consultando registros en PostgreSQL...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-white/50 font-normal">
                                        No se encontraron registros de tarjetas Guthrie que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                filtrados.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3.5 px-3.5 font-mono font-black text-cyan-300 bg-cyan-500/10 rounded-xl border border-cyan-400/20">
                                            {item.folio_tarjeta || item.folio}
                                        </td>
                                        <td className="py-3.5 px-3.5 font-extrabold text-white">
                                            {item.rn_nombres || item.rn} {item.rn_apellido_paterno || ''}
                                        </td>
                                        <td className="py-3.5 px-3.5 text-cyan-100/90">
                                            <div className="font-bold">{item.madre_nombres || item.madre} {item.madre_apellido_paterno || ''}</div>
                                            <div className="text-[10px] text-cyan-300/70 font-mono">{item.madre_curp || item.curpMadre}</div>
                                        </td>
                                        <td className="py-3.5 px-3.5 text-cyan-100/90">
                                            <div className="font-bold text-white">{item.unidad_medica_nombre || item.unidadMedica}</div>
                                            <div className="text-[10px] font-mono text-cyan-300">{item.clues_unidad || item.clues}</div>
                                        </td>
                                        <td className="py-3.5 px-3.5 text-cyan-200 font-mono">
                                            {(item.rn_fecha_toma_muestra || item.fechaToma || '').split('T')[0]}
                                        </td>
                                        <td className="py-3.5 px-3.5">
                                            {getEstatusBadge(item.estatus_muestra || item.estatus || 'REGISTRADO')}
                                        </td>
                                        <td className="py-3.5 px-3.5 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedRegistro(item)}
                                                className="px-3.5 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 ml-auto border border-white/30 shadow-md transition-all cursor-pointer active:scale-95"
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
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="relative border border-cyan-400/40 bg-slate-900/80 max-w-xl w-full p-6 sm:p-8 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl space-y-6 text-white overflow-hidden">
                        
                        {/* Luces decorativas */}
                        <div className="absolute -top-24 -left-24 size-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-4">
                            <div className="flex items-center gap-3.5">
                                <div className="p-3 bg-cyan-500/20 text-cyan-300 rounded-2xl shadow-lg border border-cyan-400/40 backdrop-blur-md">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono font-bold text-cyan-300 block">
                                        FOLIO GUTHRIE: {selectedRegistro.folio_tarjeta || selectedRegistro.folio}
                                    </span>
                                    <h3 className="text-base sm:text-lg font-black text-white">
                                        Ficha Oficial de Tamiz Neonatal
                                    </h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRegistro(null)}
                                className="p-2.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/15 rounded-2xl transition-all cursor-pointer border border-white/20 backdrop-blur-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative z-10 space-y-3 text-xs bg-white/5 p-5 rounded-2xl border border-white/20 backdrop-blur-md">
                            <div className="flex justify-between border-b border-white/15 pb-2.5">
                                <span className="text-cyan-200/80 font-bold">Recién Nacido:</span>
                                <span className="font-extrabold text-white">
                                    {selectedRegistro.rn_nombres || selectedRegistro.rn} {selectedRegistro.rn_apellido_paterno || ''}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white/15 pb-2.5">
                                <span className="text-cyan-200/80 font-bold">Madre / Tutor:</span>
                                <span className="font-extrabold text-white">
                                    {selectedRegistro.madre_nombres || selectedRegistro.madre} {selectedRegistro.madre_apellido_paterno || ''}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white/15 pb-2.5">
                                <span className="text-cyan-200/80 font-bold">Unidad de Toma (CLUES):</span>
                                <span className="font-extrabold text-white text-right">
                                    {selectedRegistro.unidad_medica_nombre || selectedRegistro.unidadMedica} ({selectedRegistro.clues_unidad || selectedRegistro.clues})
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white/15 pb-2.5">
                                <span className="text-cyan-200/80 font-bold">Municipio:</span>
                                <span className="font-extrabold text-white">
                                    {selectedRegistro.madre_municipio || selectedRegistro.municipio || 'Juchitán'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white/15 pb-2.5">
                                <span className="text-cyan-200/80 font-bold">Fecha Toma:</span>
                                <span className="font-mono font-bold text-cyan-300">
                                    {(selectedRegistro.rn_fecha_toma_muestra || selectedRegistro.fechaToma || '').split('T')[0]}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-cyan-200/80 font-bold">Estatus Muestra:</span>
                                <span>{getEstatusBadge(selectedRegistro.estatus_muestra || selectedRegistro.estatus || 'REGISTRADO')}</span>
                            </div>
                        </div>

                        <div className="relative z-10 flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold rounded-2xl shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 cursor-pointer border border-white/40 active:scale-95 transition-all"
                            >
                                <Printer className="w-4 h-4 text-cyan-100" />
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