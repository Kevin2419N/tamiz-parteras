import React, { useState, useEffect } from 'react';
import { HeartPulse, X, Stethoscope, MapPin, CheckCircle2, Clock, Loader2, AlertCircle, Sparkles } from 'lucide-react';
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
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/25 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 w-fit shadow-sm">
                    <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>PENDIENTE DE RESPUESTA</span>
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 w-fit shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>CONTRAREFERIDO (ATENDIDO)</span>
            </span>
        );
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-950/40">
                        <HeartPulse className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                            Referencias y Contrareferencias Comunitarias (Formato 1)
                        </h2>
                        <p className="text-xs text-cyan-100/80 font-medium mt-0.5">
                            Red de canalización oportuna entre Parteras Tradicionales y Unidades Médicas Hospitalarias del Istmo.
                        </p>
                    </div>
                </div>
            </div>

            {/* MENSAJE DE ERROR SI FALLA LA API */}
            {errorMessage && (
                <div className="p-4 bg-rose-950/60 border border-rose-300/40 rounded-2xl flex items-center gap-3 text-rose-100 text-xs font-bold backdrop-blur-md">
                    <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* VISTA MÓVIL (< md): TARJETAS COMPACTAS */}
            <div className="space-y-3 md:hidden">
                {cargando ? (
                    <div className="p-8 text-center text-xs text-cyan-200 font-medium bg-slate-900/40 rounded-2xl border border-white/20 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                        <span>Cargando referencias desde PostgreSQL (Render)...</span>
                    </div>
                ) : referencias.length === 0 ? (
                    <div className="p-8 text-center text-xs text-cyan-200/70 bg-slate-900/40 rounded-2xl border border-white/20">
                        No hay solicitudes de referencias comunitarias registradas.
                    </div>
                ) : (
                    referencias.map((r) => (
                        <div key={r.id} className="p-4 bg-slate-900/60 rounded-2xl border border-white/20 space-y-3 backdrop-blur-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-cyan-300 tracking-wider uppercase block">{r.folio}</span>
                                    <h3 className="text-xs font-black text-white">{r.nombrePaciente} ({r.edad} años)</h3>
                                    <p className="text-[11px] text-cyan-100/80 font-medium">Partera: {r.parteraNombre}</p>
                                </div>
                                <div>{getEstatusBadge(r.estatus)}</div>
                            </div>

                            <div className="text-xs space-y-1 text-cyan-50 bg-white/5 p-3 rounded-xl border border-white/10">
                                <div className="font-bold text-cyan-300 mb-1">Motivo de Canalización:</div>
                                <p className="text-cyan-100 font-medium">{r.motivoReferencia}</p>
                                <div className="flex items-center gap-1 text-[11px] text-cyan-200/70 pt-2 border-t border-white/10 mt-2">
                                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>{r.unidadDestino} ({r.municipio})</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleOpenModal(r)}
                                className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/30"
                            >
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>{r.estatus === 'PENDIENTE' ? 'Responder Contrareferencia' : 'Ver Dictamen Médico'}</span>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* VISTA ESCRITORIO (>= md): TABLA CLÍNICA */}
            <div className="w-full rounded-3xl border border-white/30 bg-slate-900/40 shadow-2xl backdrop-blur-3xl overflow-hidden">
                <div className="w-full overflow-x-auto lg-quiet">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white/5 text-cyan-200 font-bold uppercase text-[11px] tracking-wider border-b border-white/20">
                                <th className="py-4 px-5">Folio F1</th>
                                <th className="py-4 px-5">Paciente / Partera</th>
                                <th className="py-4 px-5">Motivo de Referencia</th>
                                <th className="py-4 px-5">Unidad Hospitalaria Destino</th>
                                <th className="py-4 px-5">Estatus</th>
                                <th className="py-4 px-5 text-right">Acción Médica</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-xs font-semibold text-cyan-50/90">
                            {cargando ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-cyan-200 font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                            <span>Cargando referencias desde PostgreSQL (Render)...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : referencias.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-cyan-200/70 font-normal">
                                        No hay solicitudes de referencias comunitarias registradas.
                                    </td>
                                </tr>
                            ) : (
                                referencias.map((r) => (
                                    <tr key={r.id} className="hover:bg-white/10 transition-colors">
                                        <td className="py-4 px-5 font-black text-white">{r.folio}</td>
                                        <td className="py-4 px-5">
                                            <div className="font-bold text-white">{r.nombrePaciente} ({r.edad} a)</div>
                                            <div className="text-[11px] text-cyan-200/80 font-medium">{r.parteraNombre}</div>
                                        </td>
                                        <td className="py-4 px-5 max-w-xs">
                                            <p className="line-clamp-2 text-cyan-100 font-medium">{r.motivoReferencia}</p>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="font-bold text-white">{r.unidadDestino}</div>
                                            <div className="text-[11px] text-cyan-200/70">{r.municipio}</div>
                                        </td>
                                        <td className="py-4 px-5">{getEstatusBadge(r.estatus)}</td>
                                        <td className="py-4 px-5 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenModal(r)}
                                                className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 border border-white/30 shadow-md ml-auto"
                                            >
                                                <Stethoscope className="w-3.5 h-3.5 text-cyan-200" />
                                                <span>{r.estatus === 'PENDIENTE' ? 'Responder' : 'Ver Dictamen'}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL MEDICAL CONTRAREFERENCIA */}
            {selectedReferencia && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900/95 border border-white/40 rounded-[32px] max-w-lg w-full p-6 space-y-4 shadow-2xl shadow-slate-950/90 backdrop-blur-3xl lg-modal">
                        <div className="flex items-center justify-between border-b border-white/20 pb-4">
                            <div>
                                <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">Dictamen de Contrareferencia Hospitalaria</span>
                                <h3 className="text-base font-black text-white">{selectedReferencia.folio} - {selectedReferencia.nombrePaciente}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedReferencia(null)}
                                className="p-2 text-cyan-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-1 backdrop-blur-md">
                            <p className="font-bold text-cyan-200">Motivo Original de Canalización:</p>
                            <p className="text-cyan-50 font-medium leading-relaxed">{selectedReferencia.motivoReferencia}</p>
                            <p className="text-cyan-200/70 text-[11px] pt-1">Refiere: <strong className="text-white">{selectedReferencia.parteraNombre}</strong></p>
                        </div>

                        <form onSubmit={handleSaveContrareferencia} className="space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-cyan-100 font-black mb-1">
                                    Respuesta Médica / Indicaciones de Contrareferencia
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Describa la atención brindada en la unidad de salud y el plan de seguimiento para la partera..."
                                    value={respuestaTexto}
                                    onChange={(e) => setRespuestaTexto(e.target.value)}
                                    className="w-full p-3.5 bg-slate-950/80 border border-white/30 rounded-xl text-white placeholder:text-cyan-200/40 focus:outline-none focus:border-cyan-400 font-medium"
                                />
                            </div>

                            <div className="flex gap-3 pt-3 border-t border-white/20">
                                <button
                                    type="button"
                                    onClick={() => setSelectedReferencia(null)}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl cursor-pointer border border-white/20"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold rounded-xl shadow-lg shadow-cyan-950/40 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 border border-white/40"
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