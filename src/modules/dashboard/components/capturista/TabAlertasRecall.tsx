/* spell-checker: disable */
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, Calendar, MessageSquare, CheckCircle2, X, Loader2, ShieldAlert, BellRing, Send } from 'lucide-react';
import type { RegistroTamizHistorial } from './types';
import { http } from '../../../../services/http';

interface TabAlertasRecallProps {
    alertas?: RegistroTamizHistorial[];
}

export const TabAlertasRecall: React.FC<TabAlertasRecallProps> = ({ alertas: propsAlertas = [] }) => {
    const [alertas, setAlertas] = useState<RegistroTamizHistorial[]>(propsAlertas);
    const [cargando, setCargando] = useState<boolean>(false);
    const [selectedContacto, setSelectedContacto] = useState<RegistroTamizHistorial | null>(null);
    const [notifiedIds, setNotifiedIds] = useState<string[]>([]);
    const [scheduledIds, setScheduledIds] = useState<string[]>([]);

    useEffect(() => {
        const cargarAlertasRecall = async () => {
            setCargando(true);
            try {
                // Ruta corregida con el prefijo /api/v1/ para empatar con el backend
                const res = await http.get('/api/v1/tamiz/alertas-recall');
                setAlertas(res.data || []);
            } catch (error) {
                console.error('Error al cargar alertas de recall desde el backend:', error);
                setAlertas([]);
            } finally {
                setCargando(false);
            }
        };

        cargarAlertasRecall();
    }, []);

    const handleSendNotification = async (item: RegistroTamizHistorial) => {
        try {
            await http.post('/api/v1/tamiz/notificar-recall', {
                casoId: item.id,
                folio: item.folio,
                telefono: (item as any).telefonoContacto,
                mensaje: `SERVICIOS DE SALUD DE OAXACA: Se requiere acudir al Centro de Salud para RE-TOMA URGENTE de Tamiz Neonatal del recién nacido de ${item.madre}. Motivo: ${(item as any).motivoRecall || 'Muestra coagulada'}.`
            });

            setNotifiedIds(prev => [...prev, item.id]);
            setSelectedContacto(null);
            alert('¡Notificación registrada y enviada exitosamente!');
        } catch (error: any) {
            console.error('Error al enviar notificación:', error);
            alert('Error al enviar la notificación a través del servidor.');
        }
    };

    const handleWhatsAppDirect = (item: any) => {
        const telefono = item.telefonoContacto ? item.telefonoContacto.replace(/\D/g, '') : '';
        const mensaje = encodeURIComponent(
            `SERVICIOS DE SALUD DE OAXACA: Aviso urgente de RE-TOMA de Tamiz Neonatal para el recién nacido de ${item.madre} (Folio: ${item.folio}). Motivo: ${item.motivoRecall || 'Muestra coagulada'}. Favor de acudir a su Unidad de Salud.`
        );
        
        if (telefono) {
            window.open(`https://wa.me/52${telefono}?text=${mensaje}`, '_blank');
        } else {
            alert('El paciente no cuenta con un número de teléfono celular registrado.');
        }
    };

    const handleScheduleRetoma = async (item: RegistroTamizHistorial) => {
        try {
            await http.post('/api/v1/tamiz/agendar-retoma', {
                casoId: item.id,
                folio: item.folio,
                unidadMedica: item.unidadMedica
            });

            setScheduledIds(prev => [...prev, item.id]);
            alert(`¡Re-toma de muestra agendada exitosamente para el recién nacido de ${item.madre} (Folio ${item.folio})!`);
        } catch (error: any) {
            console.error('Error al agendar re-toma:', error);
            alert('Error al agendar la re-toma en el servidor.');
        }
    };

    const cardGlassStyle = "p-4 sm:p-6 bg-white/5 rounded-3xl border border-white/30 backdrop-blur-3xl shadow-[0_20px_40px_-15px_rgba(15,23,42,0.5)] space-y-4";
    const inputGlassStyle = "w-full px-3.5 py-2.5 bg-white/5 border border-white/30 rounded-xl text-white text-xs font-semibold placeholder:text-white/40 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 backdrop-blur-md transition-all shadow-inner";

    return (
        <div className="space-y-6 text-white w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 animate-fadeIn">

            {/* ENCABEZADO Y ADVERTENCIA SANITARIA */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-950/80 via-slate-900/80 to-slate-950/90 rounded-3xl border border-rose-500/40 backdrop-blur-3xl shadow-[0_20px_40px_-15px_rgba(225,29,72,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                    <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-400/40 backdrop-blur-md shadow-lg animate-pulse shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-rose-300 block">
                            VIGILANCIA EPIDEMIOLÓGICA • RE-TOMA URGENTE (RECALL)
                        </span>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                            Centro de Alertas de Re-Toma Neonatal
                        </h2>
                        <p className="text-xs text-rose-100/80 font-medium mt-0.5">
                            Casos prioritarios reportados por LESP Oaxaca que requieren nueva toma de muestras de sangre en talón.
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 text-center shrink-0 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-rose-200 block uppercase">Total Casos Recall Activos</span>
                    <span className="text-2xl font-black text-rose-400 font-mono">{alertas.length}</span>
                </div>
            </div>

            {/* LISTA DE ALERTAS DE RE-TOMA */}
            {cargando ? (
                <div className={cardGlassStyle + " py-12 text-center text-cyan-200 font-semibold flex items-center justify-center gap-2.5"}>
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                    <span>Cargando alertas de re-toma desde PostgreSQL...</span>
                </div>
            ) : alertas.length === 0 ? (
                <div className={cardGlassStyle + " py-12 text-center text-xs text-white/60 font-medium space-y-2.5"}>
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <p className="font-bold text-white text-sm">No hay casos pendientes de re-toma (Recall) activos.</p>
                    <p className="text-[11px] text-cyan-200/80">Todas las muestras procesadas en la red jurisdiccional cumplen con la calidad normativa.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {alertas.map((item: any) => {
                        const isNotified = notifiedIds.includes(item.id);
                        const isScheduled = scheduledIds.includes(item.id);
                        const isCritica = item.prioridad === 'CRITICA';

                        return (
                            <div
                                key={item.id}
                                className={`p-5 bg-white/5 rounded-3xl border backdrop-blur-3xl shadow-[0_20px_40px_-15px_rgba(15,23,42,0.5)] space-y-4 relative overflow-hidden flex flex-col justify-between transition-all ${isCritica
                                    ? 'border-l-8 border-l-rose-500 border-white/20 hover:border-rose-400/60'
                                    : 'border-l-8 border-l-amber-500 border-white/20 hover:border-amber-400/60'
                                    }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start border-b border-white/15 pb-3">
                                        <div>
                                            <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-400/30">
                                                FOLIO: {item.folio}
                                            </span>
                                            <h3 className="text-base font-black text-white mt-2">{item.rn}</h3>
                                            <p className="text-xs font-bold text-cyan-200/90">Madre: {item.madre}</p>
                                        </div>

                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg backdrop-blur-md ${isCritica
                                            ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40 animate-pulse'
                                            : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                                            }`}>
                                            <AlertTriangle className="w-3 h-3" />
                                            {item.prioridad === 'CRITICA' ? 'CRÍTICA URGENTE' : (item.prioridad || 'ALERTA')}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-xs bg-white/5 p-4 rounded-2xl border border-white/15 backdrop-blur-md">
                                        <div className="flex items-center justify-between text-cyan-100">
                                            <span className="font-bold text-cyan-200/80">Motivo de Re-Toma:</span>
                                            <span className="font-black text-rose-300">{item.motivoRecall || 'Muestra Coagulada / Inadecuada'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-cyan-100">
                                            <span className="font-bold text-cyan-200/80">Municipio / Localidad:</span>
                                            <span className="font-bold text-white">{item.municipio}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-cyan-100">
                                            <span className="font-bold text-cyan-200/80">Fecha Toma Original:</span>
                                            <span className="font-mono font-bold text-cyan-300">{item.fechaToma}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* BOTONES DE ACCIÓN RÁPIDA */}
                                <div className="flex items-center gap-2 pt-2 border-t border-white/15">
                                    {isNotified ? (
                                        <div className="w-full py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 backdrop-blur-md">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span>Madre / Partera Notificada Exitosamente</span>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedContacto(item)}
                                                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95 border border-white/30"
                                            >
                                                <Phone className="w-4 h-4 text-cyan-100" />
                                                <span>Contactar Madre / Partera</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleScheduleRetoma(item)}
                                                disabled={isScheduled}
                                                className={`px-3.5 py-2.5 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${isScheduled
                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 cursor-default'
                                                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md'
                                                    }`}
                                                title="Programar Re-Toma en Unidad"
                                            >
                                                <Calendar className="w-4 h-4 text-cyan-300" />
                                                <span>{isScheduled ? 'Agendado ✓' : 'Agendar'}</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL DE CONTACTO TELEFÓNICO / WHATSAPP (GLASSMORPHISM) */}
            {selectedContacto && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="relative border border-cyan-400/40 bg-slate-900/80 max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl space-y-6 text-white overflow-hidden">
                        
                        <div className="absolute -top-24 -left-24 size-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-500/20 text-cyan-300 rounded-2xl border border-cyan-400/40 backdrop-blur-md">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-black text-white">Notificar Alerta de Re-Toma</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedContacto(null)}
                                className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/15 rounded-2xl transition-all cursor-pointer border border-white/20 backdrop-blur-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative z-10 space-y-4 text-xs">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/20 backdrop-blur-md space-y-1.5">
                                <p className="font-extrabold text-cyan-300">Folio Guthrie: {selectedContacto.folio}</p>
                                <p className="font-bold text-white">Madre: {selectedContacto.madre}</p>
                                <p className="text-cyan-100/80">Teléfono Celular: <span className="font-mono font-bold text-white">{(selectedContacto as any).telefonoContacto || 'Sin número registrado'}</span></p>
                            </div>

                            <div className="space-y-1">
                                <label className="block font-bold text-cyan-100">Plantilla de Mensaje Oficial (SMS / WhatsApp):</label>
                                <textarea
                                    readOnly
                                    rows={4}
                                    value={`SERVICIOS DE SALUD DE OAXACA: Se requiere acudir al Centro de Salud para RE-TOMA URGENTE de Tamiz Neonatal del recién nacido de ${selectedContacto.madre}. Motivo: ${(selectedContacto as any).motivoRecall || 'Muestra coagulada'}. Favor de contactar a su Unidad de Salud.`}
                                    className={inputGlassStyle + " resize-none text-cyan-100"}
                                />
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleWhatsAppDirect(selectedContacto)}
                                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 border border-white/40"
                                >
                                    <MessageSquare className="w-4 h-4 text-emerald-100" />
                                    <span>Enviar por WhatsApp Directo</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleSendNotification(selectedContacto)}
                                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-cyan-200 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-white/20"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Registrar Notificación en el Servidor</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TabAlertasRecall;