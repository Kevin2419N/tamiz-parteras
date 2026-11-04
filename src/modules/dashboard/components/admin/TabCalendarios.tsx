import React, { useState, useEffect } from 'react';
import { Calendar, User, Baby, Eye, X, MapPin, Loader2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { http } from '../../../../services/http';

interface RegistroMujer {
    id: string;
    folio: string;
    nombreMujer: string;
    partera: string;
    municipio: string;
    semanaGestacion: number;
    nutricionMUAC: 'VERDE' | 'AMARILLO' | 'ROJO';
    controlesRealizados: number;
    alertas: string;
}

interface RegistroNino {
    id: string;
    folio: string;
    nombreNino: string;
    nombreMadre: string;
    partera: string;
    municipio: string;
    edadMeses: number;
    tamizTomado: boolean;
    vacunasCompletas: boolean;
    alertas: string;
}

export const TabCalendarios: React.FC = () => {
    const [subTab, setSubTab] = useState<'FORMATO_2' | 'FORMATO_3'>('FORMATO_2');
    const [selectedExpediente, setSelectedExpediente] = useState<{ titulo: string; detalle: string } | null>(null);

    // Estados de expedientes y carga
    const [expedientesMujer, setExpedientesMujer] = useState<RegistroMujer[]>([]);
    const [expedientesNino, setExpedientesNino] = useState<RegistroNino[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Carga oficial de calendarios comunitarios desde PostgreSQL (Render)
    useEffect(() => {
        const cargarCalendarios = async () => {
            setCargando(true);
            setErrorMessage(null);
            try {
                const [resMujeres, resNinos] = await Promise.all([
                    http.get('/admin/calendarios/salud-materna'),
                    http.get('/admin/calendarios/desarrollo-infantil')
                ]);

                if (resMujeres.data) setExpedientesMujer(resMujeres.data);
                if (resNinos.data) setExpedientesNino(resNinos.data);
            } catch (error: any) {
                console.error('Error al cargar expedientes de calendarios:', error);
                setErrorMessage('No se pudo conectar con el servidor para obtener los calendarios comunitarios.');
            } finally {
                setCargando(false);
            }
        };

        cargarCalendarios();
    }, []);

    return (
        <div className="space-y-6 text-white">

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes lgFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
                @keyframes lgModal{from{opacity:0;transform:scale(0.95) translateY(20px)}to{opacity:1;transform:none}}
                .lg-fade{animation:lgFade .35s ease both}
                .lg-modal{animation:lgModal .4s cubic-bezier(0.16,1,0.3,1) both}
                .lg-quiet{scrollbar-width:none}
                .lg-quiet::-webkit-scrollbar{display:none}
            `}} />

            {/* ENCABEZADO PRINCIPAL */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-950/40">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                            Auditoría de Calendarios Comunitarios (Formatos 2 y 3)
                        </h2>
                        <p className="text-xs text-cyan-100/80 font-medium mt-0.5">
                            Monitoreo del seguimiento prenatal, cinta MUAC y control de vacunación infantil.
                        </p>
                    </div>
                </div>

                {/* SELECTOR TOUCH SUBTAB (FORMATO 2 / FORMATO 3) */}
                <div className="bg-slate-950/80 p-1 rounded-2xl flex gap-1 border border-white/20 self-start sm:self-auto backdrop-blur-md">
                    <button
                        type="button"
                        onClick={() => setSubTab('FORMATO_2')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            subTab === 'FORMATO_2'
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-950/40 border border-white/30'
                                : 'text-cyan-200/70 hover:text-white'
                        }`}
                    >
                        <User className="w-3.5 h-3.5" />
                        <span>Formato 2: Mujer</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSubTab('FORMATO_3')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            subTab === 'FORMATO_3'
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-950/40 border border-white/30'
                                : 'text-cyan-200/70 hover:text-white'
                        }`}
                    >
                        <Baby className="w-3.5 h-3.5" />
                        <span>Formato 3: Niño</span>
                    </button>
                </div>
            </div>

            {/* MENSAJE DE ERROR SI FALLA LA API */}
            {errorMessage && (
                <div className="p-4 bg-rose-950/60 border border-rose-300/40 rounded-2xl flex items-center gap-3 text-rose-100 text-xs font-bold backdrop-blur-md">
                    <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* SECCIÓN FORMATO 2: CALENDARIO DE LA MUJER */}
            {subTab === 'FORMATO_2' && (
                <div className="space-y-4">
                    {/* VISTA MÓVIL (< md) */}
                    <div className="space-y-3 md:hidden">
                        {cargando ? (
                            <div className="p-8 text-center text-xs text-cyan-200 font-medium bg-slate-900/40 rounded-2xl border border-white/20 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                <span>Cargando expedientes de salud materna...</span>
                            </div>
                        ) : expedientesMujer.length === 0 ? (
                            <div className="p-8 text-center text-xs text-cyan-200/70 bg-slate-900/40 rounded-2xl border border-white/20">
                                No hay expedientes de mujeres registrados en Formato 2.
                            </div>
                        ) : (
                            expedientesMujer.map((m) => (
                                <div key={m.id} className="p-4 bg-slate-900/60 rounded-2xl border border-white/20 space-y-3 backdrop-blur-md">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider block">{m.folio}</span>
                                            <h3 className="text-xs font-black text-white">{m.nombreMujer}</h3>
                                            <p className="text-[11px] text-cyan-100/80 font-medium">Partera: {m.partera}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                            m.nutricionMUAC === 'VERDE'
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                                : m.nutricionMUAC === 'AMARILLO'
                                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-300/30'
                                                    : 'bg-rose-500/20 text-rose-300 border border-rose-300/30 animate-pulse'
                                        }`}>
                                            MUAC {m.nutricionMUAC}
                                        </span>
                                    </div>

                                    <div className="text-xs space-y-1 text-cyan-50 bg-white/5 p-3 rounded-xl border border-white/10">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-cyan-200">Sem. Gestación:</span>
                                            <span>{m.semanaGestacion} SDG</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-bold text-cyan-200">Controles Prenatales:</span>
                                            <span className="font-black text-cyan-300">{m.controlesRealizados} Visitas</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] text-cyan-200/70 pt-2 border-t border-white/10 mt-2">
                                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                                            <span>{m.municipio}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedExpediente({ titulo: `${m.folio} - ${m.nombreMujer}`, detalle: m.alertas })}
                                        className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/30"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Auditar Expediente Mujer</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* VISTA ESCRITORIO (>= md) */}
                    <div className="hidden md:block overflow-x-auto rounded-3xl border border-white/30 bg-slate-900/40 shadow-2xl backdrop-blur-3xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-cyan-200 font-bold uppercase text-[11px] tracking-wider border-b border-white/20">
                                    <th className="py-4 px-5">Folio F2</th>
                                    <th className="py-4 px-5">Gestante / Partera</th>
                                    <th className="py-4 px-5">Sem. Gestación</th>
                                    <th className="py-4 px-5">Cinta MUAC</th>
                                    <th className="py-4 px-5">Visitas</th>
                                    <th className="py-4 px-5 text-right">Acción Auditoría</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 text-xs font-semibold text-cyan-50/90">
                                {cargando ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-cyan-200 font-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                                <span>Cargando expedientes de salud materna desde PostgreSQL...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : expedientesMujer.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-cyan-200/70 font-normal">
                                            No hay expedientes de mujeres registrados en Formato 2.
                                        </td>
                                    </tr>
                                ) : (
                                    expedientesMujer.map((m) => (
                                        <tr key={m.id} className="hover:bg-white/10 transition-colors">
                                            <td className="py-4 px-5 font-black text-white">{m.folio}</td>
                                            <td className="py-4 px-5">
                                                <div className="font-bold text-white">{m.nombreMujer}</div>
                                                <div className="text-[11px] text-cyan-200/80">{m.partera} ({m.municipio})</div>
                                            </td>
                                            <td className="py-4 px-5 font-black text-cyan-200">{m.semanaGestacion} SDG</td>
                                            <td className="py-4 px-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                                    m.nutricionMUAC === 'VERDE'
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                                        : m.nutricionMUAC === 'AMARILLO'
                                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-300/30'
                                                            : 'bg-rose-500/20 text-rose-300 border border-rose-300/30 animate-pulse'
                                                }`}>
                                                    MUAC {m.nutricionMUAC}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 font-black text-cyan-300">{m.controlesRealizados} visitas</td>
                                            <td className="py-4 px-5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedExpediente({ titulo: `${m.folio} - ${m.nombreMujer}`, detalle: m.alertas })}
                                                    className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 ml-auto border border-white/30 shadow-md"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-cyan-200" />
                                                    <span>Auditar</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECCIÓN FORMATO 3: CALENDARIO DEL NIÑO */}
            {subTab === 'FORMATO_3' && (
                <div className="space-y-4">
                    {/* VISTA MÓVIL (< md) */}
                    <div className="space-y-3 md:hidden">
                        {cargando ? (
                            <div className="p-8 text-center text-xs text-cyan-200 font-medium bg-slate-900/40 rounded-2xl border border-white/20 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                <span>Cargando expedientes de desarrollo infantil...</span>
                            </div>
                        ) : expedientesNino.length === 0 ? (
                            <div className="p-8 text-center text-xs text-cyan-200/70 bg-slate-900/40 rounded-2xl border border-white/20">
                                No hay expedientes de niños registrados en Formato 3.
                            </div>
                        ) : (
                            expedientesNino.map((n) => (
                                <div key={n.id} className="p-4 bg-slate-900/60 rounded-2xl border border-white/20 space-y-3 backdrop-blur-md">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider block">{n.folio}</span>
                                            <h3 className="text-xs font-black text-white">{n.nombreNino}</h3>
                                            <p className="text-[11px] text-cyan-100/80 font-medium">Madre: {n.nombreMadre}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                            n.vacunasCompletas
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                                : 'bg-amber-500/20 text-amber-300 border border-amber-300/30'
                                        }`}>
                                            {n.vacunasCompletas ? 'Esquema Completo' : 'Vacuna Pendiente'}
                                        </span>
                                    </div>

                                    <div className="text-xs space-y-1 text-cyan-50 bg-white/5 p-3 rounded-xl border border-white/10">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-cyan-200">Edad:</span>
                                            <span>{n.edadMeses} Meses</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-bold text-cyan-200">Tamiz Neonatal:</span>
                                            <span className="font-black text-emerald-300">{n.tamizTomado ? 'Realizado' : 'Pendiente'}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedExpediente({ titulo: `${n.folio} - ${n.nombreNino}`, detalle: n.alertas })}
                                        className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/30"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Auditar Expediente Niño</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* VISTA ESCRITORIO (>= md) */}
                    <div className="hidden md:block overflow-x-auto rounded-3xl border border-white/30 bg-slate-900/40 shadow-2xl backdrop-blur-3xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-cyan-200 font-bold uppercase text-[11px] tracking-wider border-b border-white/20">
                                    <th className="py-4 px-5">Folio F3</th>
                                    <th className="py-4 px-5">Recién Nacido / Madre</th>
                                    <th className="py-4 px-5">Edad (Meses)</th>
                                    <th className="py-4 px-5">Tamiz Neonatal</th>
                                    <th className="py-4 px-5">Esquema Vacunación</th>
                                    <th className="py-4 px-5 text-right">Acción Auditoría</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 text-xs font-semibold text-cyan-50/90">
                                {cargando ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-cyan-200 font-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                                <span>Cargando expedientes de desarrollo infantil...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : expedientesNino.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-cyan-200/70 font-normal">
                                            No hay expedientes de niños registrados en Formato 3.
                                        </td>
                                    </tr>
                                ) : (
                                    expedientesNino.map((n) => (
                                        <tr key={n.id} className="hover:bg-white/10 transition-colors">
                                            <td className="py-4 px-5 font-black text-white">{n.folio}</td>
                                            <td className="py-4 px-5">
                                                <div className="font-bold text-white">{n.nombreNino}</div>
                                                <div className="text-[11px] text-cyan-200/80">Madre: {n.nombreMadre}</div>
                                            </td>
                                            <td className="py-4 px-5 font-black text-cyan-200">{n.edadMeses} Meses</td>
                                            <td className="py-4 px-5">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                                    {n.tamizTomado ? 'GUTHRIE OK' : 'PENDIENTE'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                                    n.vacunasCompletas
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                                        : 'bg-amber-500/20 text-amber-300 border border-amber-300/30'
                                                }`}>
                                                    {n.vacunasCompletas ? 'COMPLETO' : 'PENDIENTE'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedExpediente({ titulo: `${n.folio} - ${n.nombreNino}`, detalle: n.alertas })}
                                                    className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 ml-auto border border-white/30 shadow-md"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-cyan-200" />
                                                    <span>Auditar</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL DETALLE DE AUDITORÍA */}
            {selectedExpediente && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900/95 border border-white/40 rounded-[32px] max-w-md w-full p-6 space-y-4 shadow-2xl shadow-slate-950/90 backdrop-blur-3xl lg-modal">
                        <div className="flex items-center justify-between border-b border-white/20 pb-3">
                            <h3 className="text-base font-black text-white">{selectedExpediente.titulo}</h3>
                            <button
                                type="button"
                                onClick={() => setSelectedExpediente(null)}
                                className="p-2 text-cyan-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs font-semibold text-cyan-50 space-y-2 backdrop-blur-md">
                            <p className="font-black text-cyan-300 uppercase tracking-wider text-[10px]">Dictamen Epidemiológico Jurisdiccional:</p>
                            <p className="leading-relaxed">{selectedExpediente.detalle}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedExpediente(null)}
                            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all cursor-pointer border border-white/40"
                        >
                            Cerrar Auditoría
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TabCalendarios;