import React, { useState, useEffect } from 'react';
import { Settings, Database, HardDrive, ShieldCheck, History, Download, AlertTriangle, Megaphone, Plus, Trash2, CheckCircle2, Lock, User, Loader2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import type { LogSistema, AvisoEpidemiologico } from './types';
import { exportDatabaseAsJSON } from './cluesData';
import { http } from '../../../../services/http';

export const TabConfiguracionSistema: React.FC = () => {
    const [backupMessage, setBackupMessage] = useState<string | null>(null);

    // Estados de avisos y bitácora
    const [avisos, setAvisos] = useState<AvisoEpidemiologico[]>([]);
    const [bitacora, setBitacora] = useState<LogSistema[]>([]);
    const [cargandoAvisos, setCargandoAvisos] = useState<boolean>(false);
    const [cargandoBitacora, setCargandoBitacora] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Formulario de creación de avisos
    const [showAvisoModal, setShowAvisoModal] = useState(false);
    const [nuevoTitulo, setNuevoTitulo] = useState('');
    const [nuevoContenido, setNuevoContenido] = useState('');
    const [nuevaPrioridad, setNuevaPrioridad] = useState<AvisoEpidemiologico['prioridad']>('ALTA');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Carga oficial de avisos y bitácora desde PostgreSQL (Render)
    useEffect(() => {
        const cargarDatosSistema = async () => {
            setCargandoAvisos(true);
            setCargandoBitacora(true);
            setErrorMessage(null);
            try {
                const [resAvisos, resBitacora] = await Promise.all([
                    http.get('/admin/avisos'),
                    http.get('/admin/bitacora')
                ]);

                if (resAvisos.data) setAvisos(resAvisos.data);
                if (resBitacora.data) setBitacora(resBitacora.data);
            } catch (error: any) {
                console.error('Error al cargar datos del sistema:', error);
                setErrorMessage('No se pudo conectar con el servidor para obtener los avisos y la bitácora de auditoría.');
            } finally {
                setCargandoAvisos(false);
                setCargandoBitacora(false);
            }
        };

        cargarDatosSistema();
    }, []);

    const handleGenerateJSONBackup = () => {
        exportDatabaseAsJSON();
        setBackupMessage('Descarga generada con éxito: archivo JSON listo para auditoría institucional.');
        setTimeout(() => {
            setBackupMessage(null);
        }, 4000);
    };

    const handlePublicarAviso = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        const payload = {
            titulo: nuevoTitulo,
            contenido: nuevoContenido,
            prioridad: nuevaPrioridad,
            autor: 'Lic. Administrador Jurisdiccional',
            estatus: 'ACTIVO',
        };

        try {
            const response = await http.post('/admin/avisos', payload);
            const nuevo: AvisoEpidemiologico = response.data.aviso || response.data;

            setAvisos([nuevo, ...avisos]);
            setShowAvisoModal(false);

            // Reset
            setNuevoTitulo('');
            setNuevoContenido('');
        } catch (error: any) {
            console.error('Error al publicar aviso:', error);
            alert(error.response?.data?.message || 'Error al guardar el aviso en la base de datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEliminarAviso = async (id: string) => {
        if (!window.confirm('¿Está seguro de eliminar este aviso epidemiológico?')) return;
        try {
            await http.delete(`/admin/avisos/${id}`);
            setAvisos(avisos.filter((a) => a.id !== id));
        } catch (error: any) {
            console.error('Error al eliminar aviso:', error);
            alert('No se pudo eliminar el aviso del servidor.');
        }
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
                        <Settings className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                            Configuración, Auditoría de Seguridad y Avisos Epidemiológicos
                        </h2>
                        <p className="text-xs text-cyan-100/80 font-medium mt-0.5">
                            Funciones exclusivas para la administración jurisdiccional de los Servicios de Salud de Oaxaca.
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

            {/* MÓDULO 1: RESPALDO DE BASE DE DATOS (.JSON) */}
            <div className="p-6 bg-slate-900/60 rounded-3xl border border-white/20 space-y-4 backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-3.5 border-b border-white/10 pb-4">
                    <div className="p-3 bg-cyan-500/20 text-cyan-300 rounded-2xl border border-cyan-400/30 shadow-lg backdrop-blur-md">
                        <Database className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-black text-white">Módulo de Respaldo e Integridad de Base de Datos</h3>
                        <p className="text-xs text-cyan-100/80 font-medium">Exportación estructurada de catálogos, parteras y bitácora en formato oficial JSON</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-cyan-200 font-bold">
                            <HardDrive className="w-4 h-4 text-emerald-400" />
                            <span>Servidor BD:</span>
                        </div>
                        <span className="font-mono text-white font-extrabold text-xs block">BD-RENDER-POSTGRESQL-02</span>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-cyan-200 font-bold">
                            <Lock className="w-4 h-4 text-blue-400" />
                            <span>Algoritmo de Cifrado:</span>
                        </div>
                        <span className="font-mono text-white font-extrabold text-xs block">AES-256 Institucional SSO</span>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-cyan-200 font-bold">
                            <ShieldCheck className="w-4 h-4 text-cyan-400" />
                            <span>Estado de Almacenamiento:</span>
                        </div>
                        <span className="font-bold text-emerald-300 text-xs block">ÓPTIMO (100% Sincronizado)</span>
                    </div>
                </div>

                {backupMessage && (
                    <div className="p-3.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{backupMessage}</span>
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleGenerateJSONBackup}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/40"
                >
                    <Download className="w-4 h-4 text-cyan-200" />
                    <span>Generar Respaldo de Base de Datos (.json)</span>
                </button>
            </div>

            {/* MÓDULO 2: PANEL DE AVISOS Y ALERTAS EPIDEMIOLÓGICAS */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-3">
                    <div className="flex items-center gap-3.5">
                        <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-400/30 backdrop-blur-md">
                            <Megaphone className="w-5 h-5 text-amber-300" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white">Panel de Avisos y Alertas Epidemiológicas</h3>
                            <p className="text-[11px] text-cyan-100/80">Publicación de boletines e instrucciones operativas para la red jurisdiccional</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAvisoModal(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto border border-white/40"
                    >
                        <Plus className="w-4 h-4 text-cyan-200" />
                        <span>Publicar Alerta / Aviso</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cargandoAvisos ? (
                        <div className="col-span-full p-12 text-center text-xs text-cyan-200 font-medium bg-slate-900/40 rounded-3xl border border-white/20 backdrop-blur-3xl">
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                <span>Cargando avisos desde PostgreSQL (Render)...</span>
                            </div>
                        </div>
                    ) : avisos.length === 0 ? (
                        <div className="col-span-full p-12 text-center text-xs text-cyan-200/70 bg-slate-900/40 rounded-3xl border border-white/20 backdrop-blur-3xl">
                            No hay avisos ni alertas epidemiológicas activas.
                        </div>
                    ) : (
                        avisos.map((a) => (
                            <div key={a.id} className="p-5 bg-slate-900/60 rounded-3xl border border-white/20 space-y-3 relative backdrop-blur-3xl shadow-2xl hover:border-cyan-400/50 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                            a.prioridad === 'ALTA'
                                                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                                                : a.prioridad === 'MEDIA'
                                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-300/30'
                                                    : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                                        }`}>
                                            {a.prioridad === 'ALTA' && <AlertTriangle className="w-3 h-3 inline mr-1 text-rose-300" />}
                                            Prioridad {a.prioridad}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleEliminarAviso(a.id)}
                                        className="p-1.5 text-cyan-200/60 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                                        title="Eliminar Aviso"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-white">{a.titulo}</h4>
                                    <p className="text-[11px] text-cyan-100/90 font-medium leading-relaxed">{a.contenido}</p>
                                </div>

                                <div className="text-[10px] text-cyan-200/70 pt-2 border-t border-white/10 flex justify-between">
                                    <span>Publicado por: <strong className="text-white">{a.autor}</strong></span>
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
                    <History className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Bitácora de Accesos y Auditoría (Logs de Inicio de Sesión)
                    </h3>
                </div>

                <div className="w-full rounded-3xl border border-white/30 bg-slate-900/40 shadow-2xl backdrop-blur-3xl overflow-hidden">
                    <div className="w-full overflow-x-auto lg-quiet">
                        <table className="w-full text-left border-collapse text-xs font-semibold min-w-[700px]">
                            <thead>
                                <tr className="bg-white/5 text-cyan-200 font-bold uppercase text-[11px] tracking-wider border-b border-white/20">
                                    <th className="py-4 px-4">Fecha / Hora</th>
                                    <th className="py-4 px-4">Usuario / Servidor Público</th>
                                    <th className="py-4 px-4">Acción Auditoría</th>
                                    <th className="py-4 px-4">Módulo</th>
                                    <th className="py-4 px-4 text-right">Dirección IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 text-cyan-50/90">
                                {cargandoBitacora ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-cyan-200 font-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                                <span>Cargando bitácora desde PostgreSQL (Render)...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : bitacora.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-cyan-200/70 font-normal">
                                            No hay eventos registrados en la bitácora del sistema.
                                        </td>
                                    </tr>
                                ) : (
                                    bitacora.map((b) => (
                                        <tr key={b.id} className="hover:bg-white/10 transition-colors">
                                            <td className="py-3.5 px-4 font-mono text-cyan-200/80 text-[11px]">{b.fechaHora}</td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-black text-white flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-cyan-400" />
                                                    <span>{b.usuario}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-cyan-100 font-medium">{b.accion}</td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-bold text-cyan-200 bg-cyan-500/20 px-2.5 py-1 rounded-full border border-cyan-400/30 text-[10px] inline-block">
                                                    {b.modulo}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-mono text-cyan-200/80">{b.ip}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL PUBLICAR ALERTA EPIDEMIOLÓGICA */}
            {showAvisoModal && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900/95 border border-white/40 rounded-[32px] max-w-lg w-full p-6 space-y-4 shadow-2xl shadow-slate-950/90 backdrop-blur-3xl lg-modal">
                        <div className="flex items-center justify-between border-b border-white/20 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-400/30 backdrop-blur-md">
                                    <Megaphone className="w-6 h-6 text-amber-300" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white">Publicar Aviso / Alerta Epidemiológica</h3>
                                    <p className="text-xs text-cyan-100/80 font-medium">Servicios de Salud de Oaxaca • Jurisdicción No. 2</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handlePublicarAviso} className="space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-cyan-100 font-bold mb-1">Título de la Alerta *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Alerta Epidemiológica: Vigilancia en Tamiz Neonatal"
                                    value={nuevoTitulo}
                                    onChange={(e) => setNuevoTitulo(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/30 rounded-xl text-white placeholder:text-cyan-200/40 focus:outline-none focus:border-cyan-400 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-cyan-100 font-bold mb-1">Indicaciones / Contenido del Aviso *</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Escriba el detalle de la instrucción operativa..."
                                    value={nuevoContenido}
                                    onChange={(e) => setNuevoContenido(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/30 rounded-xl text-white placeholder:text-cyan-200/40 focus:outline-none focus:border-cyan-400 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-cyan-100 font-bold mb-1">Nivel de Prioridad *</label>
                                <select
                                    value={nuevaPrioridad}
                                    onChange={(e) => setNuevaPrioridad(e.target.value as AvisoEpidemiologico['prioridad'])}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-bold"
                                >
                                    <option value="ALTA">Prioridad Alta (Alerta Epidemiológica Urgente)</option>
                                    <option value="MEDIA">Prioridad Media (Instrucción Operativa)</option>
                                    <option value="INFORMATIVA">Informativa (Boletín Informativo)</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-3 border-t border-white/20">
                                <button
                                    type="button"
                                    onClick={() => setShowAvisoModal(false)}
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
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <span>Publicar Aviso</span>
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

export default TabConfiguracionSistema;