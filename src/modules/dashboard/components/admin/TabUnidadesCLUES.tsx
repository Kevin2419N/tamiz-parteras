import React, { useState, useEffect } from 'react';
import { Building2, Plus, X, Info, CheckCircle2, Loader2, AlertCircle, Search, ShieldCheck, Sparkles } from 'lucide-react';
import type { UnidadCLUES } from './types';
import { getCluesCatalog, addCluesUnit, subscribeCluesCatalog, fetchCluesCatalogFromBackend } from './cluesData';

export const TabUnidadesCLUES: React.FC = () => {
    // Estado limpio conectado con el catálogo global
    const [cluesCatalog, setCluesCatalog] = useState<UnidadCLUES[]>(getCluesCatalog());
    const [showModal, setShowModal] = useState(false);
    const [cargando, setCargando] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [busqueda, setBusqueda] = useState<string>('');

    // Formulario de alta de unidad
    const [claveClues, setClaveClues] = useState('');
    const [nombreUnidad, setNombreUnidad] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [tipoUnidad, setTipoUnidad] = useState<UnidadCLUES['tipoUnidad']>('Centro de Salud');
    const [estatus, setEstatus] = useState<UnidadCLUES['estatus']>('ACTIVO');

    useEffect(() => {
        const unsubscribe = subscribeCluesCatalog((updatedList) => {
            setCluesCatalog(updatedList);
        });
        return unsubscribe;
    }, []);

    // Carga oficial de unidades CLUES desde PostgreSQL (Render)
    useEffect(() => {
        const cargarClues = async () => {
            setCargando(true);
            setErrorMessage(null);
            try {
                const unidades = await fetchCluesCatalogFromBackend();
                setCluesCatalog(unidades);
            } catch (error: any) {
                console.error('Error al cargar catálogo de unidades CLUES:', error);
                setErrorMessage('No se pudo conectar con el servidor para obtener el catálogo CLUES.');
            } finally {
                setCargando(false);
            }
        };

        cargarClues();
    }, []);

    const handleCreateClues = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const nuevaUnidad = await addCluesUnit({
                clues: claveClues.toUpperCase().trim(),
                nombre: nombreUnidad.trim(),
                municipio: municipio.trim() || 'Juchitán de Zaragoza',
                tipoUnidad,
                estatus,
            });

            if (nuevaUnidad) {
                setShowModal(false);
                // Reset Form
                setClaveClues('');
                setNombreUnidad('');
                setMunicipio('');
            }
        } catch (error: any) {
            console.error('Error al registrar CLUES:', error);
            alert('Error al guardar la unidad médica en la base de datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filtrar unidades según la búsqueda
    const cluesFiltradas = cluesCatalog.filter((u: any) => {
        const nombre = (u.nombre || u.nombre_unidad || '').toLowerCase();
        const clues = (u.clues || u.clave_clues || '').toLowerCase();
        const mun = (u.municipio || '').toLowerCase();
        const termino = busqueda.toLowerCase();
        return nombre.includes(termino) || clues.includes(termino) || mun.includes(termino);
    });

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
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                            Catálogo Oficial de Unidades Médicas y CLUES
                        </h2>
                        <p className="text-xs text-cyan-100/80 font-medium mt-0.5">
                            Jurisdicción Sanitaria No. 2 • Red de Establecimientos de Salud (Clave Única de Establecimientos de Salud)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Barra de búsqueda rápida */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 text-cyan-300 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o CLUES..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/60 border border-white/20 rounded-2xl text-xs text-white placeholder:text-cyan-200/50 focus:outline-none focus:border-cyan-400 backdrop-blur-md font-medium"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/40 shrink-0"
                    >
                        <Plus className="w-4 h-4 text-cyan-200" />
                        <span className="hidden sm:inline">+ Dar de Alta Unidad</span>
                        <span className="sm:hidden">+ Nueva</span>
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

            {/* BANNER EXPLICATIVO INSTITUCIONAL */}
            <div className="p-4 bg-cyan-950/30 border border-cyan-800/40 rounded-2xl flex items-start gap-3.5 text-xs text-cyan-100 backdrop-blur-md">
                <Info className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" />
                <div className="space-y-1">
                    <span className="font-extrabold uppercase tracking-wider block text-[10px] text-cyan-300">
                        Sincronización Automática con Registro de Campo
                    </span>
                    <p className="text-cyan-50/90 font-medium text-[11px] leading-relaxed">
                        Las unidades y claves CLUES registradas en este apartado alimentarán automáticamente el autocompletado en el módulo de Tamiz Neonatal y la asignación de adscripción de Médicos y Parteras Tradicionales.
                    </p>
                </div>
            </div>

            {/* TABLA OFICIAL DE UNIDADES REGISTRADAS (ESCRITORIO >= md) */}
            <div className="hidden md:block overflow-x-auto rounded-3xl border border-white/30 bg-slate-900/40 shadow-2xl backdrop-blur-3xl">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                        <tr className="bg-white/5 text-cyan-200 font-bold uppercase text-[11px] tracking-wider border-b border-white/20">
                            <th className="py-4 px-5">Nombre de la Unidad Médica</th>
                            <th className="py-4 px-5">Clave CLUES</th>
                            <th className="py-4 px-5">Municipio / Localidad</th>
                            <th className="py-4 px-5">Tipo de Establecimiento</th>
                            <th className="py-4 px-5 text-center">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-cyan-50/90">
                        {cargando ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-cyan-200 font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                        <span>Cargando unidades desde PostgreSQL (Render)...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : cluesFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-cyan-200/70 font-normal">
                                    No se encontraron unidades médicas registradas con ese criterio.
                                </td>
                            </tr>
                        ) : (
                            cluesFiltradas.map((u: any) => (
                                <tr key={u.id} className="hover:bg-white/10 transition-colors">
                                    <td className="py-4 px-5 font-black text-white">{u.nombre || u.nombre_unidad}</td>
                                    <td className="py-4 px-5">
                                        <span className="font-mono bg-slate-950/80 border border-white/20 text-cyan-200 font-bold rounded-xl px-3 py-1.5 text-xs inline-block shadow-sm">
                                            {u.clues || u.clave_clues}
                                        </span>
                                    </td>
                                    <td className="py-4 px-5 font-bold text-white">{u.municipio}</td>
                                    <td className="py-4 px-5 text-cyan-100 font-medium">{u.tipoUnidad || u.tipo || u.tipo_establecimiento}</td>
                                    <td className="py-4 px-5 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${u.estatus === 'ACTIVO'
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                            : 'bg-amber-500/20 text-amber-300 border border-amber-300/30'
                                            }`}>
                                            {u.estatus}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE REGISTRO DE UNIDAD MÉDICA (CLUES) */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900/95 border border-white/40 rounded-[32px] max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-slate-950/90 backdrop-blur-3xl lg-modal">

                        {/* CABECERA MODAL */}
                        <div className="flex items-center justify-between border-b border-white/20 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 text-cyan-300 backdrop-blur-md">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white">Dar de Alta Nueva Unidad Médica (CLUES)</h3>
                                    <p className="text-xs text-cyan-100/80 font-medium">Servicios de Salud de Oaxaca • Catálogo Oficial CLUES</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-2 text-cyan-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* FORMULARIO DE REGISTRO */}
                        <form onSubmit={handleCreateClues} className="space-y-4 text-xs font-semibold">

                            {/* Clave CLUES */}
                            <div>
                                <label className="block text-cyan-100 font-bold mb-1 flex items-center justify-between">
                                    <span>Clave CLUES *</span>
                                    <span className={`text-[10px] font-mono font-bold ${claveClues.length === 11 ? 'text-emerald-300' : 'text-cyan-200/60'}`}>
                                        {claveClues.length}/11
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={11}
                                    placeholder="EJ. OASSA000451"
                                    value={claveClues}
                                    onChange={(e) => setClaveClues(e.target.value.toUpperCase())}
                                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/30 rounded-xl text-white font-mono font-bold uppercase focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                                />
                            </div>

                            {/* Nombre Completo de la Unidad Médica */}
                            <div>
                                <label className="block text-cyan-100 font-bold mb-1">Nombre Completo de la Unidad Médica *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Centro de Salud Urbano Juchitán"
                                    value={nombreUnidad}
                                    onChange={(e) => setNombreUnidad(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/30 rounded-xl text-white placeholder:text-cyan-200/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                                />
                            </div>

                            {/* Municipio / Localidad */}
                            <div>
                                <label className="block text-cyan-100 font-bold mb-1 flex items-center justify-between">
                                    <span>Municipio / Localidad * (Texto Libre)</span>
                                    <span className="text-[10px] text-cyan-200/60 font-normal">Cualquier municipio o agencia</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Escriba el municipio..."
                                    value={municipio}
                                    onChange={(e) => setMunicipio(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/30 rounded-xl text-white placeholder:text-cyan-200/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                                />
                            </div>

                            {/* Tipo de Establecimiento */}
                            <div>
                                <label className="block text-cyan-100 font-bold mb-1">Tipo de Establecimiento *</label>
                                <select
                                    value={tipoUnidad}
                                    onChange={(e) => setTipoUnidad(e.target.value as UnidadCLUES['tipoUnidad'])}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-semibold"
                                >
                                    <option value="Centro de Salud">Centro de Salud</option>
                                    <option value="CESSA">CESSA</option>
                                    <option value="Hospital General">Hospital General</option>
                                    <option value="Hospital Bienestar">Hospital Bienestar</option>
                                </select>
                            </div>

                            {/* Estatus */}
                            <div>
                                <label className="block text-cyan-100 font-bold mb-1">Estatus *</label>
                                <select
                                    value={estatus}
                                    onChange={(e) => setEstatus(e.target.value as UnidadCLUES['estatus'])}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-semibold"
                                >
                                    <option value="ACTIVO">ACTIVO (Operativa en Campo)</option>
                                    <option value="INACTIVO">INACTIVO (Mantenimiento / Suspendida)</option>
                                </select>
                            </div>

                            {/* BOTONES DE ACCIÓN */}
                            <div className="flex gap-3 pt-3 border-t border-white/20">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors cursor-pointer border border-white/20 text-xs"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold rounded-xl shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60 border border-white/40 text-xs"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Guardando en PostgreSQL...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-cyan-200" />
                                            <span>Guardar Unidad CLUES</span>
                                        </>
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

export default TabUnidadesCLUES;