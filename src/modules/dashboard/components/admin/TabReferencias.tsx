import React, { useState, useEffect } from 'react';
import { HeartPulse, X, Stethoscope, MapPin, CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';
import type { ReferenciaFormato1 } from './types';
import { http } from '../../../../services/http';

export const TabReferencias: React.FC = () => {
    // Estados de referencias, carga y errores
    const [referencias, setReferencias] = useState<ReferenciaFormato1[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [selectedReferencia, setSelectedReferencia] = useState<ReferenciaFormato1 | null>(null);
    const [respuestaTexto, setRespuestaTexto] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Carga oficial de referencias desde PostgreSQL (Render)
    useEffect(() => {
        const cargarReferencias = async () => {
            setCargando(true);
            setErrorMessage(null);
            try {
                const response = await http.get('/admin/referencias');
                if (response.data) {
                    setReferencias(response.data);
                }
            } catch (error: any) {
                console.error('Error al cargar referencias comunitarias:', error);
                setErrorMessage('No se pudo conectar con el servidor para obtener las referencias comunitarias.');
            } finally {
                setCargando(false);
            }
        };

        cargarReferencias();
    }, []);

    const handleOpenModal = (ref: ReferenciaFormato1) => {
        setSelectedReferencia(ref);
        setRespuestaTexto(ref.respuestaContrareferencia || '');
    };

    const handleSaveContrareferencia = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReferencia) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await http.patch(`/admin/referencias/${selectedReferencia.id}/contrareferencia`, {
                respuestaContrareferencia: respuestaTexto,
                estatus: 'CONTRAREFERIDO'
            });

            // Actualizar estado local
            setReferencias((prev) =>
                prev.map((r) =>
                    r.id === selectedReferencia.id
                        ? { ...r, estatus: 'CONTRAREFERIDO', respuestaContrareferencia: respuestaTexto }
                        : r
                )
            );
            setSelectedReferencia(null);
        } catch (error: any) {
            console.error('Error al guardar contrareferencia:', error);
            alert(error.response?.data?.message || 'Error al emitir la contrareferencia en el servidor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getEstatusBadge = (estatus: ReferenciaFormato1['estatus']) => {
        if (estatus === 'PENDIENTE') {
            return (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>PENDIENTE DE RESPUESTA</span>
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>CONTRAREFERIDO (ATENDIDO)</span>
            </span>
        );
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-[#9D2449]" />
                    <span>Referencias y Contrareferencias Comunitarias (Formato 1)</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Red de canalización oportuna entre Parteras Tradicionales y Unidades Médicas Hospitalarias del Istmo.
                </p>
            </div>

            {/* MENSAJE DE ERROR SI FALLA LA API */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-bold">
                    <AlertCircle className="w-5 h-5 text-[#9D2449] shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* VISTA MÓVIL (< md): TARJETAS COMPACTAS */}
            <div className="space-y-3 md:hidden">
                {cargando ? (
                    <div className="p-8 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#9D2449]" />
                        <span>Cargando referencias desde PostgreSQL (Render)...</span>
                    </div>
                ) : referencias.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200">
                        No hay solicitudes de referencias comunitarias registradas.
                    </div>
                ) : (
                    referencias.map((r) => (
                        <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-[#9D2449] tracking-wider uppercase block">{r.folio}</span>
                                    <h3 className="text-xs font-black text-slate-900">{r.nombrePaciente} ({r.edad} años)</h3>
                                    <p className="text-[11px] text-slate-500 font-medium">Partera: {r.parteraNombre}</p>
                                </div>
                                <div>{getEstatusBadge(r.estatus)}</div>
                            </div>

                            <div className="text-xs space-y-1 text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                                <div className="font-bold text-[#9D2449] mb-1">Motivo de Canalización:</div>
                                <p className="text-slate-600 font-medium">{r.motivoReferencia}</p>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{r.unidadDestino} ({r.municipio})</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleOpenModal(r)}
                                className="w-full py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>{r.estatus === 'PENDIENTE' ? 'Responder Contrareferencia' : 'Ver Dictamen Médico'}</span>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* VISTA ESCRITORIO (>= md): TABLA CLÍNICA */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                            <th className="py-3 px-4">Folio F1</th>
                            <th className="py-3 px-4">Paciente / Partera</th>
                            <th className="py-3 px-4">Motivo de Referencia</th>
                            <th className="py-3 px-4">Unidad Hospitalaria Destino</th>
                            <th className="py-3 px-4">Estatus</th>
                            <th className="py-3 px-4 text-right">Acción Médica</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {cargando ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#9D2449]" />
                                        <span>Cargando referencias desde PostgreSQL (Render)...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : referencias.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-400 font-normal">
                                    No hay solicitudes de referencias comunitarias registradas.
                                </td>
                            </tr>
                        ) : (
                            referencias.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3.5 px-4 font-black text-slate-900">{r.folio}</td>
                                    <td className="py-3.5 px-4">
                                        <div className="font-bold text-slate-900">{r.nombrePaciente} ({r.edad} a)</div>
                                        <div className="text-[11px] text-slate-500 font-medium">{r.parteraNombre}</div>
                                    </td>
                                    <td className="py-3.5 px-4 max-w-xs">
                                        <p className="line-clamp-2 text-slate-800 font-medium">{r.motivoReferencia}</p>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="font-bold text-slate-800">{r.unidadDestino}</div>
                                        <div className="text-[11px] text-slate-500">{r.municipio}</div>
                                    </td>
                                    <td className="py-3.5 px-4">{getEstatusBadge(r.estatus)}</td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenModal(r)}
                                            className="px-3.5 py-2 bg-slate-100 hover:bg-[#9D2449] hover:text-white text-slate-800 font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                                        >
                                            <Stethoscope className="w-3.5 h-3.5" />
                                            <span>{r.estatus === 'PENDIENTE' ? 'Responder' : 'Ver Dictamen'}</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL MEDICAL CONTRAREFERENCIA */}
            {selectedReferencia && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div>
                                <span className="text-[10px] font-black text-[#9D2449] uppercase">Dictamen de Contrareferencia Hospitalaria</span>
                                <h3 className="text-base font-black text-slate-900">{selectedReferencia.folio} - {selectedReferencia.nombrePaciente}</h3>
                            </div>
                            <button type="button" onClick={() => setSelectedReferencia(null)} className="p-1 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                            <p className="font-bold text-slate-900">Motivo Original de Canalización:</p>
                            <p className="text-slate-700">{selectedReferencia.motivoReferencia}</p>
                            <p className="text-slate-500 text-[11px] pt-1">Refiere: {selectedReferencia.parteraNombre}</p>
                        </div>

                        <form onSubmit={handleSaveContrareferencia} className="space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-slate-900 font-black mb-1">
                                    Respuesta Médica / Indicaciones de Contrareferencia
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Describa la atención brindada en la unidad de salud y el plan de seguimiento para la partera..."
                                    value={respuestaTexto}
                                    onChange={(e) => setRespuestaTexto(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedReferencia(null)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Guardando en PostgreSQL...</span>
                                        </>
                                    ) : (
                                        <span>Emitir Contrareferencia Oficial</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TabReferencias;