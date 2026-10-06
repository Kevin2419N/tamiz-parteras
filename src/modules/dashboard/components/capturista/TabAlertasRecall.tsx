import React, { useState } from 'react';
import { AlertTriangle, Phone, Calendar, MessageSquare, CheckCircle2, X } from 'lucide-react';
import type { RegistroTamizHistorial } from './types';

interface TabAlertasRecallProps {
    alertas: RegistroTamizHistorial[];
}

export const TabAlertasRecall: React.FC<TabAlertasRecallProps> = ({ alertas }) => {
    const [selectedContacto, setSelectedContacto] = useState<RegistroTamizHistorial | null>(null);
    const [notifiedIds, setNotifiedIds] = useState<string[]>([]);
    const [scheduledIds, setScheduledIds] = useState<string[]>([]);

    const handleSendNotification = (id: string) => {
        setNotifiedIds(prev => [...prev, id]);
        setSelectedContacto(null);
    };

    const handleScheduleRetoma = (item: RegistroTamizHistorial) => {
        setScheduledIds(prev => [...prev, item.id]);
        alert(`¡Re-toma de muestra agendada exitosamente para el recién nacido de ${item.madre} (Folio ${item.folio})!`);
    };

    return (
        <div className="space-y-6">

            {/* ENCABEZADO Y ADVERTENCIA SANITARIA */}
            <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-md animate-pulse shrink-0">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">
                            VIGILANCIA EPIDEMIOLÓGICA • RE-TOMA URGENTE (RECALL)
                        </span>
                        <h2 className="text-xl font-black text-[#9D2449]">
                            Centro de Alertas de Re-Toma Neonatal
                        </h2>
                        <p className="text-xs text-rose-800 font-medium mt-0.5">
                            Casos prioritarios reportados por LESP Oaxaca que requieren nueva toma de muestras de sangre en talón.
                        </p>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-rose-200 text-center shrink-0">
                    <span className="text-xs font-bold text-rose-800 block">Total Casos Recall Activos</span>
                    <span className="text-2xl font-black text-rose-600 font-mono">{alertas.length}</span>
                </div>
            </div>

            {/* LISTA DE ALERTAS DE RE-TOMA CON BANDERAS LATERALES DE ADVERTENCIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alertas.map((item) => {
                    const isNotified = notifiedIds.includes(item.id);
                    const isScheduled = scheduledIds.includes(item.id);
                    const isCritica = item.prioridad === 'CRITICA';

                    return (
                        <div
                            key={item.id}
                            className={`bg-white rounded-3xl border-y border-r shadow-sm p-5 space-y-4 transition-all relative overflow-hidden flex flex-col justify-between ${isCritica
                                ? 'border-l-8 border-l-rose-600 border-rose-200 hover:border-rose-400'
                                : 'border-l-8 border-l-amber-500 border-amber-200 hover:border-amber-400'
                                }`}
                        >

                            <div className="space-y-3">
                                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                    <div>
                                        <span className="font-mono text-xs font-black text-[#9D2449] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                            FOLIO: {item.folio}
                                        </span>
                                        <h3 className="text-base font-black text-slate-900 mt-1">{item.rn}</h3>
                                        <p className="text-xs font-bold text-slate-600">Madre: {item.madre}</p>
                                    </div>

                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm ${isCritica
                                        ? 'bg-rose-600 text-white animate-pulse'
                                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                                        }`}>
                                        <AlertTriangle className="w-3 h-3" />
                                        {item.prioridad === 'CRITICA' ? 'CRÍTICA URGENTE' : item.prioridad}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                                    <div className="flex items-center justify-between text-slate-700">
                                        <span className="font-bold text-slate-500">Motivo de Re-Toma:</span>
                                        <span className="font-black text-rose-700">{item.motivoRecall || 'Muestra Coagulada / Inadecuada'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-700">
                                        <span className="font-bold text-slate-500">Municipio / Localidad:</span>
                                        <span className="font-bold text-slate-900">{item.municipio}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-700">
                                        <span className="font-bold text-slate-500">Fecha Toma Original:</span>
                                        <span className="font-mono font-bold text-slate-800">{item.fechaToma}</span>
                                    </div>
                                </div>
                            </div>

                            {/* BOTONES DIRECTOS DE ACCIÓN RÁPIDA */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                {isNotified ? (
                                    <div className="w-full py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Madre / Partera Notificada Exitosamente</span>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setSelectedContacto(item)}
                                            className="flex-1 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                                        >
                                            <Phone className="w-4 h-4 text-rose-200" />
                                            <span>Contactar Madre / Partera</span>
                                        </button>

                                        <button
                                            onClick={() => handleScheduleRetoma(item)}
                                            disabled={isScheduled}
                                            className={`px-3 py-2.5 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${isScheduled
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                                }`}
                                            title="Programar Re-Toma en Unidad"
                                        >
                                            <Calendar className="w-4 h-4 text-slate-600" />
                                            <span>{isScheduled ? 'Agendado ✓' : 'Agendar Re-Toma'}</span>
                                        </button>
                                    </>
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* MODAL DE CONTACTO TELEFÓNICO / WHATSAPP */}
            {selectedContacto && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-[#9D2449] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2 text-[#9D2449]">
                                <Phone className="w-5 h-5" />
                                <h3 className="text-base font-black text-slate-900">Notificar Alerta de Re-Toma</h3>
                            </div>
                            <button onClick={() => setSelectedContacto(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
                                <p className="font-extrabold text-[#9D2449]">Folio Guthrie: {selectedContacto.folio}</p>
                                <p className="font-bold text-slate-900">Madre: {selectedContacto.madre}</p>
                                <p className="text-slate-600">Teléfono Celular: <span className="font-mono font-bold text-slate-900">{selectedContacto.telefonoContacto || '9711234567'}</span></p>
                            </div>

                            <div className="space-y-1">
                                <label className="block font-bold text-slate-700">Plantilla de Mensaje Oficial (SMS / WhatsApp):</label>
                                <textarea
                                    readOnly
                                    rows={4}
                                    value={`SERVICIOS DE SALUD DE OAXACA: Se requiere acudir al Centro de Salud para RE-TOMA URGENTE de Tamiz Neonatal del recién nacido de ${selectedContacto.madre}. Motivo: ${selectedContacto.motivoRecall || 'Muestra coagulada'}. Favor de contactar a su Unidad de Salud.`}
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => handleSendNotification(selectedContacto.id)}
                                    className="flex-1 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                                >
                                    <MessageSquare className="w-4 h-4 text-rose-200" />
                                    <span>Enviar Mensaje SMS / WhatsApp</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
