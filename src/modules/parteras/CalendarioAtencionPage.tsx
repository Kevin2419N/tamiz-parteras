import React, { useState } from 'react';
import type { EtapaAtencion, CalendarioAtencion } from '../../types';
import { Calendar, Baby, HeartPulse, Stethoscope, CheckCircle2, ChevronRight, AlertTriangle, Eye } from 'lucide-react';

export const CalendarioAtencionPage: React.FC = () => {
    const [etapaActiva, setEtapaActiva] = useState<EtapaAtencion>('EMBARAZO');
    const [modoAltoContraste, setModoAltoContraste] = useState(false);

    // Mock care actions schedule
    const [tareas, setTareas] = useState<CalendarioAtencion[]>([
        {
            id: 'CAL-01',
            parteraId: 'PAR-001',
            pacienteNombre: 'María Elena Santiz',
            etapa: 'EMBARAZO',
            fechaProgramada: '2026-09-12',
            descripcionAccion: 'Chequeo de Presión Arterial y Medición de Fondo Uterino (Semana 32)',
            completada: false,
            notasRiesgo: 'Sin signos de preeclampsia',
        },
        {
            id: 'CAL-02',
            parteraId: 'PAR-001',
            pacienteNombre: 'Juana Gómez Ruiz',
            etapa: 'EMBARAZO',
            fechaProgramada: '2026-09-15',
            descripcionAccion: 'Revisión de Posición Fetal y Plan de Parto Humanizado',
            completada: true,
        },
        {
            id: 'CAL-03',
            parteraId: 'PAR-002',
            pacienteNombre: 'Rosa Pérez Cruz',
            etapa: 'PARTO',
            fechaProgramada: '2026-09-10',
            descripcionAccion: 'Atención Inmediata de Recién Nacido y Aplicación de Tamiz Neonatal (24-48 hrs)',
            completada: false,
            notasRiesgo: 'Preparar tarjeta de Guthrie',
        },
        {
            id: 'CAL-04',
            parteraId: 'PAR-002',
            pacienteNombre: 'Lucía Santiz Hernández',
            etapa: 'MENOR_2_ANOS',
            fechaProgramada: '2026-09-20',
            descripcionAccion: 'Evaluación de Crecimiento, Peso, Talla y Control de Vacunas (6 Meses)',
            completada: false,
        },
    ]);

    const toggleTarea = (id: string) => {
        setTareas(
            tareas.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t))
        );
    };

    const tareasFiltradas = tareas.filter((t) => t.etapa === etapaActiva);

    return (
        <div className={`space-y-6 max-w-7xl mx-auto transition-colors ${modoAltoContraste ? 'bg-black text-white p-4 rounded-3xl' : ''}`}>

            {/* Encabezado con Interruptor de Accesibilidad */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-amber-400">Wizard Accesible</span>
                    <h1 className="text-2xl font-extrabold text-white mt-1">Calendario de Atención Materno-Infantil</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Asistente paso a paso para el acompañamiento comunitario en Embarazo, Parto y desarrollo hasta los 2 años.
                    </p>
                </div>

                <button
                    onClick={() => setModoAltoContraste(!modoAltoContraste)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${modoAltoContraste
                            ? 'bg-yellow-400 text-black border-yellow-300'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                >
                    <Eye className="w-4 h-4" />
                    <span>{modoAltoContraste ? 'Modo Normal' : 'Modo Alto Contraste (Lectura Rápida)'}</span>
                </button>
            </div>

            {/* Tabs Wizard de 3 Etapas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    type="button"
                    onClick={() => setEtapaActiva('EMBARAZO')}
                    className={`p-5 rounded-2xl border text-left transition-all ${etapaActiva === 'EMBARAZO'
                            ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <HeartPulse className={`w-6 h-6 ${etapaActiva === 'EMBARAZO' ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full text-amber-300">Etapa 1</span>
                    </div>
                    <h3 className="font-bold text-base text-white">1. Control en Embarazo</h3>
                    <p className="text-xs text-slate-400 mt-1">Citas prenatales, signos de alarma y nutrición.</p>
                </button>

                <button
                    type="button"
                    onClick={() => setEtapaActiva('PARTO')}
                    className={`p-5 rounded-2xl border text-left transition-all ${etapaActiva === 'PARTO'
                            ? 'bg-teal-500/20 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <Stethoscope className={`w-6 h-6 ${etapaActiva === 'PARTO' ? 'text-teal-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-full text-teal-300">Etapa 2</span>
                    </div>
                    <h3 className="font-bold text-base text-white">2. Parto & Tamiz Inmediato</h3>
                    <p className="text-xs text-slate-400 mt-1">Parto seguro y recolección de gotas de sangre.</p>
                </button>

                <button
                    type="button"
                    onClick={() => setEtapaActiva('MENOR_2_ANOS')}
                    className={`p-5 rounded-2xl border text-left transition-all ${etapaActiva === 'MENOR_2_ANOS'
                            ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <Baby className={`w-6 h-6 ${etapaActiva === 'MENOR_2_ANOS' ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full text-emerald-300">Etapa 3</span>
                    </div>
                    <h3 className="font-bold text-base text-white">3. Desarrollo Menor 2 Años</h3>
                    <p className="text-xs text-slate-400 mt-1">Seguimiento de peso, vacunas y tamiz de control.</p>
                </button>
            </div>

            {/* Lista de Acciones para la Etapa Seleccionada */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-amber-400" />
                        <span>Acciones Programadas: {etapaActiva.replace('_', ' ')}</span>
                    </h3>
                    <span className="text-xs text-slate-400">{tareasFiltradas.length} atenciones agendadas</span>
                </div>

                <div className="space-y-3">
                    {tareasFiltradas.map((tarea) => (
                        <div
                            key={tarea.id}
                            className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${tarea.completada
                                    ? 'bg-slate-900/40 border-slate-800/60 opacity-65'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <button
                                    onClick={() => toggleTarea(tarea.id)}
                                    className={`mt-1 p-1 rounded-lg border transition-colors ${tarea.completada
                                            ? 'bg-emerald-500 text-white border-emerald-400'
                                            : 'border-slate-600 hover:border-emerald-400 text-transparent'
                                        }`}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <div>
                                    <h4 className={`font-bold text-sm ${tarea.completada ? 'line-through text-slate-400' : 'text-white'}`}>
                                        {tarea.pacienteNombre}
                                    </h4>
                                    <p className="text-xs text-slate-300 mt-0.5">{tarea.descripcionAccion}</p>
                                    {tarea.notasRiesgo && (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 mt-2 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                            <AlertTriangle className="w-3 h-3" /> {tarea.notasRiesgo}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
                                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                                    {tarea.fechaProgramada}
                                </span>
                                <button className="px-3 py-1.5 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 rounded-lg text-xs font-bold border border-teal-500/30 flex items-center gap-1">
                                    <span>Detalle</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};
