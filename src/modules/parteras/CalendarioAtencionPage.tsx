import React, { useState, useEffect } from 'react';
import type { EtapaAtencion, CalendarioAtencion } from '../../types';
import { http } from '../../services/http';
import { Calendar, Baby, HeartPulse, Stethoscope, CheckCircle2, ChevronRight, AlertTriangle, Eye, Loader2 } from 'lucide-react';

export const CalendarioAtencionPage: React.FC = () => {
    const [etapaActiva, setEtapaActiva] = useState<EtapaAtencion>('EMBARAZO');
    const [modoAltoContraste, setModoAltoContraste] = useState(false);
    const [tareas, setTareas] = useState<CalendarioAtencion[]>([]);
    const [cargando, setCargando] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Carga de tareas desde el backend real (Render)
    useEffect(() => {
        const cargarCalendario = async () => {
            setCargando(true);
            setErrorMessage(null);
            try {
                const res = await http.get('/medico/calendario-atencion');
                if (res.data) {
                    setTareas(res.data);
                }
            } catch (error: any) {
                console.error('Error al cargar calendario de atención:', error);
                setErrorMessage('No se pudo conectar con el servidor para obtener las tareas agendadas.');
            } finally {
                setCargando(false);
            }
        };

        cargarCalendario();
    }, []);

    const toggleTarea = async (id: string) => {
        try {
            const tareaActual = tareas.find(t => t.id === id);
            if (!tareaActual) return;

            const nuevoEstatus = !tareaActual.completada;

            // Actualización optimista en el cliente
            setTareas(tareas.map((t) => (t.id === id ? { ...t, completada: nuevoEstatus } : t)));

            // Sincronización con el backend en Render
            await http.patch(`/medico/calendario-atencion/${id}`, { completada: nuevoEstatus });
        } catch (error: any) {
            console.error('Error al actualizar tarea:', error);
            // Revertir en caso de fallo
            setTareas(tareas.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t)));
            alert(error.response?.data?.message || 'Error al actualizar el estado de la tarea en el servidor.');
        }
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
                    type="button"
                    onClick={() => setModoAltoContraste(!modoAltoContraste)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${modoAltoContraste
                        ? 'bg-yellow-400 text-black border-yellow-300'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                >
                    <Eye className="w-4 h-4" />
                    <span>{modoAltoContraste ? 'Modo Normal' : 'Modo Alto Contraste (Lectura Rápida)'}</span>
                </button>
            </div>

            {/* Mensaje de Error si falla la API */}
            {errorMessage && (
                <div className="p-4 bg-rose-500/20 border border-rose-500 rounded-2xl flex items-center gap-3 text-rose-200 text-xs font-bold">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Tabs Wizard de 3 Etapas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    type="button"
                    onClick={() => setEtapaActiva('EMBARAZO')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${etapaActiva === 'EMBARAZO'
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <HeartPulse className={`w-6 h-6 ${etapaActiva === 'EMBARAZO' ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full text-amber-300">Etapa 1</span>
                    </div>
                    <h3 className="font-bold text-base text-white">Control en Embarazo</h3>
                    <p className="text-xs text-slate-400 mt-1">Citas prenatales, signos de alarma y nutrición.</p>
                </button>

                <button
                    type="button"
                    onClick={() => setEtapaActiva('PARTO')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${etapaActiva === 'PARTO'
                        ? 'bg-teal-500/20 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <Stethoscope className={`w-6 h-6 ${etapaActiva === 'PARTO' ? 'text-teal-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-full text-teal-300">Etapa 2</span>
                    </div>
                    <h3 className="font-bold text-base text-white">Parto & Tamiz Inmediato</h3>
                    <p className="text-xs text-slate-400 mt-1">Parto seguro y recolección de gotas de sangre.</p>
                </button>

                <button
                    type="button"
                    onClick={() => setEtapaActiva('MENOR_2_ANOS')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${etapaActiva === 'MENOR_2_ANOS'
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <Baby className={`w-6 h-6 ${etapaActiva === 'MENOR_2_ANOS' ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full text-emerald-300">Etapa 3</span>
                    </div>
                    <h3 className="font-bold text-base text-white">Desarrollo Menor 2 Años</h3>
                    <p className="text-xs text-slate-400 mt-1">Seguimiento de peso, vacunas y tamiz de control.</p>
                </button>
            </div>

            {/* Lista de Acciones para la Etapa Seleccionada */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-amber-400" />
                        <span>Acciones Programadas: {etapaActiva.replace(/_/g, ' ')}</span>
                    </h3>
                    <span className="text-xs text-slate-400">{tareasFiltradas.length} atenciones agendadas</span>
                </div>

                <div className="space-y-3">
                    {cargando ? (
                        <div className="text-center py-12 text-slate-400 flex items-center justify-center gap-2 text-sm font-semibold">
                            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                            <span>Sincronizando calendario con PostgreSQL (Render)...</span>
                        </div>
                    ) : (
                        tareasFiltradas.map((tarea) => (
                            <div
                                key={tarea.id}
                                className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${tarea.completada
                                    ? 'bg-slate-900/40 border-slate-800/60 opacity-65'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <button
                                        type="button"
                                        onClick={() => toggleTarea(tarea.id)}
                                        className={`mt-1 p-1 rounded-lg border transition-colors cursor-pointer ${tarea.completada
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
                                    <button type="button" className="px-3 py-1.5 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 rounded-lg text-xs font-bold border border-teal-500/30 flex items-center gap-1 cursor-pointer">
                                        <span>Detalle</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    {!cargando && tareasFiltradas.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-xs font-semibold">
                            No hay tareas programadas para esta etapa.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default CalendarioAtencionPage;