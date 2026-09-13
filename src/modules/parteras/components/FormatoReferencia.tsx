import React, { useState } from 'react';
import { MotivoReferencia } from '../MotivoReferencia';
import { Stethoscope } from 'lucide-react';

interface FormatoReferenciaProps {
    onBack: () => void;
    onSuccess: () => void;
    hablarTexto: (texto: string) => void;
    isListening: boolean;
    campoEscuchando: string | null;
    iniciarDictado: (campo: string) => void;
}

export const FormatoReferencia: React.FC<FormatoReferenciaProps> = ({
    onBack,
    onSuccess,
    hablarTexto,
    isListening,
    campoEscuchando,
    iniciarDictado
}) => {
    // Contrareferencia Médica
    const [mostrarContrareferencia, setMostrarContrareferencia] = useState(false);
    const [estadoContra, setEstadoContra] = useState<'CONTROLADA' | 'PARA_CONTROL_PARTERA'>('CONTROLADA');
    const [diagnostico, setDiagnostico] = useState('');
    const [tratamiento, setTratamiento] = useState('');
    const [observacionesMedico, setObservacionesMedico] = useState('');
    const [nombreMedico, setNombreMedico] = useState('Dr. Alejandro Murat H.');
    const [centroMedico, setCentroMedico] = useState('Centro de Salud Urbano Juchitán');

    return (
        <div className="space-y-8">
            {/* MOTIVO DE LA REFERENCIA (COMPONENT PRINCIPAL HOJA SSO) */}
            <MotivoReferencia
                onBack={onBack}
                onSuccess={onSuccess}
                hablarTexto={hablarTexto}
                isListeningExternal={isListening}
                campoEscuchandoExternal={campoEscuchando}
                iniciarDictadoExternal={iniciarDictado}
            />

            {/* SECCIÓN COMPLEMENTARIA: CONTRAREFERENCIA MÉDICA */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border-4 border-slate-800 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                            <Stethoscope className="w-7 h-7 text-rose-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase">Módulo de Contrareferencia Médica</h3>
                            <p className="text-xs text-slate-400">Respuesta oficial del Centro de Salud a la Partera Tradicional</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMostrarContrareferencia(!mostrarContrareferencia)}
                        className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-400/30 hover:bg-rose-500/30 rounded-2xl text-xs font-bold transition-all active:scale-95 self-start sm:self-auto"
                    >
                        {mostrarContrareferencia ? 'Ocultar Sección Médica' : '📂 Abrir Sección Médico Tratante'}
                    </button>
                </div>

                {mostrarContrareferencia && (
                    <div className="space-y-6 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Estado de Contrareferencia:</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setEstadoContra('CONTROLADA')}
                                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${estadoContra === 'CONTROLADA'
                                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                        }`}
                                >
                                    ✅ Paciente Controlada / Alta Hospitalaria
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEstadoContra('PARA_CONTROL_PARTERA')}
                                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${estadoContra === 'PARA_CONTROL_PARTERA'
                                        ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                        }`}
                                >
                                    👩‍🦱 Regresa para Control con la Partera
                                </button>
                            </div>
                        </div>

                        {/* Diagnóstico */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-300 uppercase">🩺 Diagnóstico del Médico</label>
                            <div className="flex gap-2">
                                <textarea
                                    rows={2}
                                    placeholder="Dictar o escribir diagnóstico médico..."
                                    value={diagnostico}
                                    onChange={(e) => setDiagnostico(e.target.value)}
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-rose-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => iniciarDictado('DIAGNOSTICO')}
                                    className="px-4 py-3 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-2xl text-xs font-bold hover:bg-rose-500/30"
                                >
                                    🎙️ Dictar
                                </button>
                            </div>
                        </div>

                        {/* Tratamiento e Indicaciones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase">💊 Tratamiento Indicado</label>
                                <textarea
                                    rows={2}
                                    placeholder="Tratamiento y medicamentos..."
                                    value={tratamiento}
                                    onChange={(e) => setTratamiento(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase">💬 Indicaciones a la Partera</label>
                                <textarea
                                    rows={2}
                                    placeholder="Indicaciones para el seguimiento en comunidad..."
                                    value={observacionesMedico}
                                    onChange={(e) => setObservacionesMedico(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white"
                                />
                            </div>
                        </div>

                        {/* Nombre y Firma del Médico */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase">👨‍⚕️ Nombre del Médico Tratante</label>
                                <input
                                    type="text"
                                    value={nombreMedico}
                                    onChange={(e) => setNombreMedico(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase">🏢 Unidad de Salud que Emite</label>
                                <input
                                    type="text"
                                    value={centroMedico}
                                    onChange={(e) => setCentroMedico(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
