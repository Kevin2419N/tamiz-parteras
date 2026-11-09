import React, { useState, useEffect } from 'react';
import { HeartPulse, X, Stethoscope, MapPin, CheckCircle2, Clock, Loader2, AlertCircle, FileText } from 'lucide-react';
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

    // Función para formatear motivos crudos (ej. ["TAMIZ_METABOLICO"] -> Tamiz Metabólico)
    const formatearMotivos = (motivoString: string) => {
        if (!motivoString) return 'Canalización general';
        try {
            // Si viene en formato JSON string tipo array ['ZIKA']
            let parsed = motivoString;
            if (motivoString.startsWith('[') && motivoString.endsWith(']')) {
                const arr = JSON.parse(motivoString);
                if (Array.isArray(arr)) {
                    parsed = arr.join(', ');
                }
            }
            return parsed
                .replace(/_/g, ' ')
                .toLowerCase()
                .replace(/\b\w/g, (l) => l.toUpperCase());
        } catch {
            return motivoString.replace(/_/g, ' ');
        }
    };

    const getEstatusBadge = (estatus: ReferenciaFormato1['estatus']) => {
        if (estatus === 'PENDIENTE') {
            return (
                <span className="px-3 py-1.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-2 w-fit shadow-md">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>PENDIENTE</span>
                </span>
            );
        }
        return (
            <span className="px-3 py-1.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-2 w-fit shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ATENDIDO</span>
            </span>
        );
    };

    return (
        <div className="space-y-8 text-white w-full pb-10">

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes lgFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
                @keyframes lgModal{from{opacity:0;transform:scale(0.95) translateY(20px)}to{opacity:1;transform:none}}
                .lg-fade{animation:lgFade .35s ease both}
                .lg-modal{animation:lgModal .4s cubic-bezier(0.16,1,0.3,1) both}
                .lg-quiet{scrollbar-width:none}
                .lg-quiet::-webkit-scrollbar{display:none}
            `}} />

            {/* CABECERA PRINCIPAL */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 text-cyan-300 backdrop-blur-md shadow-xl shadow-cyan-950/50">
                        <HeartPulse className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                            Referencias y Contrareferencias Comunitarias (Formato 1)
                        </h2>
                        <p className="text-xs sm:text-sm text-cyan-100/80 font-medium mt-1">
                            Red de canalización oportuna entre Parteras Tradicionales y Unidades Médicas Hospitalarias del Istmo.
                        </p>
                    </div>
                </div>
            </div>

            {/* MENSAJE DE ERROR SI FALLA LA API */}
            {errorMessage && (
                <div className="p-5 bg-rose-950/70 border border-rose-400/40 rounded-2xl flex items-center gap-3.5 text-rose-100 text-xs sm:text-sm font-bold backdrop-blur-md shadow-lg">
                    <AlertCircle className="w-6 h-6 text-rose-300 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* VISTA MÓVIL / TABLET (< lg): TARJETAS COMPACTAS MODERNAS */}
            <div className="space-y-4 lg:hidden">
                {cargando ? (
                    <div className="p-10 text-center text-xs sm:text-sm text-cyan-200 font-medium bg-slate-900/60 rounded-3xl border border-white/20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                        <span>Cargando referencias desde PostgreSQL...</span>
                    </div>
                ) : referencias.length === 0 ? (
                    <div className="p-10 text-center text-xs sm:text-sm text-cyan-200/70 bg-slate-900/60 rounded-3xl border border-white/20">
                        No hay solicitudes de referencias comunitarias registradas.
                    </div>
                ) : (
                    referencias.map((r) => (
                        <div key={r.id} className="p-5 bg-slate-900/80 rounded-3xl border border-white/20 space-y-4 backdrop-blur-xl shadow-xl">
                            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                                <div>
                                    <span className="text-[11px] font-black text-cyan-300 tracking-wider uppercase block mb-0.5">{r.folio}</span>
                                    <h3 className="text-sm sm:text-base font-black text-white">{r.nombrePaciente} <span className="text-cyan-200/80 font-medium">({r.edad} años)</span></h3>
                                    <p className="text-xs text-cyan-100/90 font-medium mt-0.5">Partera: <strong className="text-white">{r.parteraNombre}</strong></p>
                                </div>
                                <div>{getEstatusBadge(r.estatus)}</div>
                            </div>

                            <div className="text-xs space-y-2 text-cyan-50 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <div className="font-black text-cyan-300 uppercase tracking-wide text-[10px]">Motivo de Canalización:</div>
                                <p className="text-cyan-50 font-medium text-sm leading-relaxed">{formatearMotivos(r.motivoReferencia)}</p>
                                <div className="flex items-center gap-1.5 text-xs text-cyan-200/90 pt-3 border-t border-white/10 mt-2">
                                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                                    <span><strong>{r.unidadDestino}</strong> ({r.municipio})</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleOpenModal(r)}
                                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/30"
                            >
                                <Stethoscope className="w-4 h-4" />
                                <span>{r.estatus === 'PENDIENTE' ? 'Responder Contrareferencia' : 'Ver Dictamen Médico'}</span>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* VISTA ESCRITORIO (>= lg): TABLA CLÍNICA AMPLIA Y SIMÉTRICA */}
            <div className="hidden lg:block w-full rounded-[32px] border border-white/30 bg-slate-900/50 shadow-2xl backdrop-blur-3xl overflow-hidden">
                <div className="w-full overflow-x-auto lg-quiet">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-white/10 text-cyan-200 font-extrabold uppercase text-xs tracking-wider border-b border-white/20">
                                <th className="py-5 px-6 w-[12%]">Folio F1</th>
                                <th className="py-5 px-6 w-[22%]">Paciente / Partera</th>
                                <th className="py-5 px-6 w-[25%]">Motivo de Referencia</th>
                                <th className="py-5 px-6 w-[20%]">Unidad Destino</th>
                                <th className="py-5 px-6 w-[10%]">Estatus</th>
                                <th className="py-5 px-6 w-[11%] text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-xs sm:text-sm font-medium text-cyan-50/90">
                            {cargando ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-cyan-200 font-medium">
                                        <div className="flex items-center justify-center gap-3">
                                            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                                            <span>Cargando referencias desde PostgreSQL (Render)...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : referencias.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-cyan-200/70 font-normal text-sm">
                                        No hay solicitudes de referencias comunitarias registradas.
                                    </td>
                                </tr>
                            ) : (
                                referencias.map((r) => (
                                    <tr key={r.id} className="hover:bg-white/10 transition-colors group">
                                        <td className="py-5 px-6 font-black text-white text-sm">
                                            <span className="flex items-center gap-1.5">
                                                <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                                                {r.folio}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="font-bold text-white text-sm">{r.nombrePaciente} <span className="text-cyan-200/80 font-normal">({r.edad} a)</span></div>
                                            <div className="text-xs text-cyan-200/80 font-medium mt-0.5">{r.parteraNombre}</div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <p className="line-clamp-2 text-cyan-50 font-medium leading-relaxed">{formatearMotivos(r.motivoReferencia)}</p>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="font-bold text-white">{r.unidadDestino}</div>
                                            <div className="text-xs text-cyan-200/70 mt-0.5">{r.municipio}</div>
                                        </td>
                                        <td className="py-5 px-6">{getEstatusBadge(r.estatus)}</td>
                                        <td className="py-5 px-6 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenModal(r)}
                                                className="px-4.5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 border border-white/30 shadow-lg ml-auto group-hover:scale-105"
                                            >
                                                <Stethoscope className="w-4 h-4 text-cyan-100" />
                                                <span>{r.estatus === 'PENDIENTE' ? 'Responder' : 'Ver'}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL MEDICAL CONTRAREFERENCIA (AMPLIO Y MODERNO) */}
            {selectedReferencia && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900/95 border border-white/40 rounded-[36px] max-w-xl w-full p-8 space-y-6 shadow-2xl shadow-slate-950/90 backdrop-blur-3xl lg-modal">
                        <div className="flex items-center justify-between border-b border-white/20 pb-5">
                            <div>
                                <span className="text-[11px] font-black text-cyan-300 uppercase tracking-widest block mb-1">Dictamen de Contrareferencia Hospitalaria</span>
                                <h3 className="text-lg font-black text-white">{selectedReferencia.folio} — {selectedReferencia.nombrePaciente}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedReferencia(null)}
                                className="p-2.5 text-cyan-200/70 hover:text-white hover:bg-white/10 rounded-2xl transition-colors cursor-pointer"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs sm:text-sm space-y-1.5 backdrop-blur-md">
                            <p className="font-black text-cyan-300 uppercase tracking-wide text-xs">Motivo Original de Canalización:</p>
                            <p className="text-cyan-50 font-medium leading-relaxed">{formatearMotivos(selectedReferencia.motivoReferencia)}</p>
                            <p className="text-cyan-200/80 text-xs pt-2 border-t border-white/10 mt-2">Partera Solicitante: <strong className="text-white">{selectedReferencia.parteraNombre}</strong></p>
                        </div>

                        <form onSubmit={handleSaveContrareferencia} className="space-y-5 text-xs sm:text-sm font-semibold">
                            <div>
                                <label className="block text-cyan-100 font-black mb-2 text-xs uppercase tracking-wide">
                                    Respuesta Médica / Indicaciones de Contrareferencia
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    placeholder="Describa la atención brindada en la unidad de salud y el plan de seguimiento para la partera..."
                                    value={respuestaTexto}
                                    onChange={(e) => setRespuestaTexto(e.target.value)}
                                    className="w-full p-4 bg-slate-950/80 border border-white/30 rounded-2xl text-white placeholder:text-cyan-200/40 focus:outline-none focus:border-cyan-400 font-medium text-sm leading-relaxed"
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-white/20">
                                <button
                                    type="button"
                                    onClick={() => setSelectedReferencia(null)}
                                    className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl cursor-pointer border border-white/20 transition-all text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold rounded-2xl shadow-xl shadow-cyan-950/50 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2.5 border border-white/40 transition-all text-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin text-white" />
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