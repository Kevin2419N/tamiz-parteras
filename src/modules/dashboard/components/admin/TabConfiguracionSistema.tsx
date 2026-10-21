import React, { useState, useEffect } from 'react';
import { Settings, Database, HardDrive, ShieldCheck, History, Download, AlertTriangle, Megaphone, Plus, Trash2, CheckCircle2, Lock, User } from 'lucide-react';
import type { LogSistema, AvisoEpidemiologico } from './types';
import { exportDatabaseAsJSON } from './cluesData';

export const TabConfiguracionSistema: React.FC = () => {
    const [backupMessage, setBackupMessage] = useState<string | null>(null);

    // Estados limpios vacíos, listos para conectarse a la API de Node.js / PostgreSQL
    const [avisos, setAvisos] = useState<AvisoEpidemiologico[]>([]);
    const [bitacora, setBitacora] = useState<LogSistema[]>([]);
    const [cargandoAvisos, setCargandoAvisos] = useState<boolean>(false);
    const [cargandoBitacora, setCargandoBitacora] = useState<boolean>(false);

    // Formulario de creación de avisos
    const [showAvisoModal, setShowAvisoModal] = useState(false);
    const [nuevoTitulo, setNuevoTitulo] = useState('');
    const [nuevoContenido, setNuevoContenido] = useState('');
    const [nuevaPrioridad, setNuevaPrioridad] = useState<AvisoEpidemiologico['prioridad']>('ALTA');

    // Punto de enganche para cargar avisos y bitácora desde el back-end
    useEffect(() => {
        const cargarDatosSistema = async () => {
            setCargandoAvisos(true);
            setCargandoBitacora(true);
            try {
                // Futura llamada a la API:
                // const resAvisos = await fetch('/api/configuracion/avisos');
                // const dataAvisos = await resAvisos.json();
                // setAvisos(dataAvisos);

                // const resBitacora = await fetch('/api/configuracion/bitacora');
                // const dataBitacora = await resBitacora.json();
                // setBitacora(dataBitacora);
            } catch (error) {
                console.error('Error al cargar datos del sistema:', error);
                setAvisos([]);
                setBitacora([]);
            } finally {
                setCargandoAvisos(false);
                setCargandoBitacora(false);
            }
        };

        cargarDatosSistema();
    }, [setAvisos, setBitacora, setCargandoAvisos, setCargandoBitacora]);

    const handleGenerateJSONBackup = () => {
        exportDatabaseAsJSON();
        setBackupMessage('Descarga generada con éxito: archivo JSON listo para auditoría institucional.');
        setTimeout(() => {
            setBackupMessage(null);
        }, 4000);
    };

    const handlePublicarAviso = (e: React.FormEvent) => {
        e.preventDefault();
        const nuevo: AvisoEpidemiologico = {
            id: `av-${Date.now()}`,
            titulo: nuevoTitulo,
            contenido: nuevoContenido,
            prioridad: nuevaPrioridad,
            fechaPublicacion: new Date().toLocaleString(),
            autor: 'Lic. Administrador Jurisdiccional',
            estatus: 'ACTIVO',
        };

        // Petición POST a la API
        setAvisos([nuevo, ...avisos]);
        setShowAvisoModal(false);

        // Reset
        setNuevoTitulo('');
        setNuevoContenido('');
    };

    const handleEliminarAviso = (id: string) => {
        // Petición DELETE a la API
        setAvisos(avisos.filter((a) => a.id !== id));
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8">

            {/* CABECERA PRINCIPAL */}
            <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#9D2449]" />
                    <span>Configuración, Auditoría de Seguridad y Avisos Epidemiológicos</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Funciones exclusivas para la administración jurisdiccional de los Servicios de Salud de Oaxaca.
                </p>
            </div>

            {/* MÓDULO 1: RESPALDO DE BASE DE DATOS (.JSON) */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                    <div className="p-3 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200 shadow-sm">
                        <Database className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900">Módulo de Respaldo e Integridad de Base de Datos</h3>
                        <p className="text-xs text-slate-500 font-medium">Exportación estructurada de catálogos, parteras y bitácora en formato oficial JSON</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                            <HardDrive className="w-4 h-4 text-emerald-600" />
                            <span>Servidor BD:</span>
                        </div>
                        <span className="font-mono text-slate-900 font-extrabold text-xs block">BD-LOCAL-JURISDICCION-02</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                            <Lock className="w-4 h-4 text-blue-600" />
                            <span>Algoritmo de Cifrado:</span>
                        </div>
                        <span className="font-mono text-slate-900 font-extrabold text-xs block">AES-256 Institucional SSO</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                            <ShieldCheck className="w-4 h-4 text-[#9D2449]" />
                            <span>Estado de Almacenamiento:</span>
                        </div>
                        <span className="font-bold text-emerald-700 text-xs block">ÓPTIMO (100% Sincronizado)</span>
                    </div>
                </div>

                {backupMessage && (
                    <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{backupMessage}</span>
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleGenerateJSONBackup}
                    className="w-full sm:w-auto px-6 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                    <Download className="w-4 h-4 text-rose-200" />
                    <span>Generar Respaldo de Base de Datos (.json)</span>
                </button>
            </div>

            {/* MÓDULO 2: PANEL DE AVISOS Y ALERTAS EPIDEMIOLÓGICAS */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200">
                            <Megaphone className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Panel de Avisos y Alertas Epidemiológicas</h3>
                            <p className="text-[11px] text-slate-500">Publicación de boletines e instrucciones operativas para la red jurisdiccional</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAvisoModal(true)}
                        className="px-4 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4 text-rose-200" />
                        <span>Publicar Alerta / Aviso</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cargandoAvisos ? (
                        <div className="col-span-full p-8 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200">
                            Cargando avisos epidemiológicos...
                        </div>
                    ) : avisos.length === 0 ? (
                        <div className="col-span-full p-8 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200">
                            No hay avisos ni alertas epidemiológicas activas.
                        </div>
                    ) : (
                        avisos.map((a) => (
                            <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${a.prioridad === 'ALTA'
                                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                                : a.prioridad === 'MEDIA'
                                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                    : 'bg-blue-100 text-blue-900 border border-blue-300'
                                            }`}>
                                            {a.prioridad === 'ALTA' && <AlertTriangle className="w-3 h-3 inline mr-1 text-rose-700" />}
                                            Prioridad {a.prioridad}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleEliminarAviso(a.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        title="Eliminar Aviso"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-slate-900">{a.titulo}</h4>
                                    <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{a.contenido}</p>
                                </div>

                                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200/80 flex justify-between">
                                    <span>Publicado por: <strong>{a.autor}</strong></span>
                                    <span className="font-mono">{a.fechaPublicacion}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MÓDULO 3: BITÁCORA DE ACCESOS Y AUDITORÍA DE SISTEMA */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#9D2449]" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Bitácora de Accesos y Auditoría (Logs de Inicio de Sesión)
                    </h3>
                </div>

                <div className="overflow-x-auto bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                    <table className="w-full text-left border-collapse text-xs font-semibold">
                        <thead>
                            <tr className="bg-white text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                                <th className="py-3 px-4">Fecha / Hora</th>
                                <th className="py-3 px-4">Usuario / Servidor Público</th>
                                <th className="py-3 px-4">Acción Auditoría</th>
                                <th className="py-3 px-4">Módulo</th>
                                <th className="py-3 px-4 text-right">Dirección IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/70 text-slate-700">
                            {cargandoBitacora ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-400 font-normal">
                                        Cargando bitácora de auditoría...
                                    </td>
                                </tr>
                            ) : bitacora.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-400 font-normal">
                                        No hay eventos registrados en la bitácora del sistema.
                                    </td>
                                </tr>
                            ) : (
                                bitacora.map((b) => (
                                    <tr key={b.id} className="hover:bg-white transition-colors">
                                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{b.fechaHora}</td>
                                        <td className="py-3 px-4">
                                            <div className="font-black text-slate-900 flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{b.usuario}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-800 font-medium">{b.accion}</td>
                                        <td className="py-3 px-4">
                                            <span className="font-bold text-[#9D2449] bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                                                {b.modulo}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-slate-500">{b.ip}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL PUBLICAR ALERTA EPIDEMIOLÓGICA */}
            {showAvisoModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200">
                                    <Megaphone className="w-6 h-6 text-amber-700" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Publicar Aviso / Alerta Epidemiológica</h3>
                                    <p className="text-xs text-slate-500 font-medium">Servicios de Salud de Oaxaca • Jurisdicción No. 2</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handlePublicarAviso} className="space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-slate-800 font-bold mb-1">Título de la Alerta *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Alerta Epidemiológica: Vigilancia en Tamiz Neonatal"
                                    value={nuevoTitulo}
                                    onChange={(e) => setNuevoTitulo(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-800 font-bold mb-1">Indicaciones / Contenido del Aviso *</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Escriba el detalle de la instrucción operativa..."
                                    value={nuevoContenido}
                                    onChange={(e) => setNuevoContenido(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-800 font-bold mb-1">Nivel de Prioridad *</label>
                                <select
                                    value={nuevaPrioridad}
                                    onChange={(e) => setNuevaPrioridad(e.target.value as AvisoEpidemiologico['prioridad'])}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] font-bold"
                                >
                                    <option value="ALTA">Prioridad Alta (Alerta Epidemiológica Urgente)</option>
                                    <option value="MEDIA">Prioridad Media (Instrucción Operativa)</option>
                                    <option value="INFORMATIVA">Informativa (Boletín Informativo)</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowAvisoModal(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                                >
                                    Publicar Aviso
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TabConfiguracionSistema;