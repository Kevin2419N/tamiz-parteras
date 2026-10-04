import React, { useState, useEffect } from 'react';
import { Building2, Plus, X, Info, CheckCircle2 } from 'lucide-react';
import type { UnidadCLUES } from './types';
import { getCluesCatalog, addCluesUnit, subscribeCluesCatalog } from './cluesData';

export const TabUnidadesCLUES: React.FC = () => {
    const [cluesCatalog, setCluesCatalog] = useState<UnidadCLUES[]>(getCluesCatalog());
    const [showModal, setShowModal] = useState(false);

    // Modal Form State
    const [claveClues, setClaveClues] = useState('');
    const [nombreUnidad, setNombreUnidad] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [tipoUnidad, setTipoUnidad] = useState<UnidadCLUES['tipoUnidad']>('Centro de Salud');
    const [nivelAtencion, setNivelAtencion] = useState<UnidadCLUES['nivelAtencion']>('Primer Nivel');
    const [estatus, setEstatus] = useState<UnidadCLUES['estatus']>('ACTIVO');

    useEffect(() => {
        const unsubscribe = subscribeCluesCatalog((updatedList) => {
            setCluesCatalog(updatedList);
        });
        return unsubscribe;
    }, []);

    const handleCreateClues = (e: React.FormEvent) => {
        e.preventDefault();
        addCluesUnit({
            clues: claveClues.toUpperCase().trim(),
            nombre: nombreUnidad.trim(),
            municipio: municipio.trim() || 'Juchitán de Zaragoza',
            tipoUnidad,
            nivelAtencion,
            estatus,
        });
        setShowModal(false);

        // Reset Form
        setClaveClues('');
        setNombreUnidad('');
        setMunicipio('');
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">

            {/* ENCABEZADO PRINCIPAL DEL MÓDULO EXCLUSIVO */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200 shadow-sm">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                            <span>Catálogo Oficial de Unidades Médicas y CLUES</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Jurisdicción Sanitaria No. 2 • Red de Establecimientos de Salud del Istmo de Tehuantepec
                        </p>
                    </div>
                </div>

                {/* BOTÓN PRINCIPAL GUINDA OAXACA */}
                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4 text-rose-200" />
                    <span>+ Dar de Alta Nueva Unidad Médica</span>
                </button>
            </div>

            {/* BANNER EXPLICATIVO INSTITUCIONAL */}
            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-start gap-3.5 text-xs text-[#9D2449]">
                <Info className="w-5 h-5 shrink-0 text-[#9D2449] mt-0.5" />
                <div className="space-y-1">
                    <span className="font-extrabold uppercase tracking-wider block text-[10px]">
                        Sincronización Automática con Registro de Campo
                    </span>
                    <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                        Las unidades y claves CLUES registradas en este apartado alimentarán automáticamente el autocompletado en el módulo de Tamiz Neonatal y la asignación de adscripción de Médicos y Parteras Tradicionales.
                    </p>
                </div>
            </div>

            {/* VISTA MÓVIL (< md) */}
            <div className="space-y-3 md:hidden">
                {cluesCatalog.map((u) => (
                    <div key={u.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xs font-black text-slate-900">{u.nombre}</h3>
                                <p className="text-[11px] text-slate-600 font-medium">Municipio: <strong>{u.municipio}</strong></p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${u.estatus === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                {u.estatus}
                            </span>
                        </div>

                        <div className="text-xs space-y-1 text-slate-700 bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] text-slate-400 block font-bold uppercase">Clave CLUES</span>
                                <span className="font-mono bg-slate-100 border border-slate-300 text-slate-800 font-bold rounded-lg px-2 py-0.5 text-xs">
                                    {u.clues}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-400 block font-bold uppercase">Tipo / Nivel</span>
                                <span className="font-bold text-[#9D2449] text-[11px]">{u.tipoUnidad} ({u.nivelAtencion})</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLA OFICIAL DE UNIDADES REGISTRADAS (ESCRITORIO >= md) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                        <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                            <th className="py-3.5 px-4">Nombre de la Unidad Médica</th>
                            <th className="py-3.5 px-4">Clave CLUES</th>
                            <th className="py-3.5 px-4">Municipio / Localidad</th>
                            <th className="py-3.5 px-4">Tipo de Establecimiento</th>
                            <th className="py-3.5 px-4 text-center">Nivel de Atención</th>
                            <th className="py-3.5 px-4 text-center">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {cluesCatalog.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4 font-black text-slate-900">{u.nombre}</td>
                                <td className="py-3.5 px-4">
                                    <span className="font-mono bg-slate-100 border border-slate-300 text-slate-800 font-bold rounded-lg px-2.5 py-1 text-xs inline-block shadow-sm">
                                        {u.clues}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-slate-800">{u.municipio}</td>
                                <td className="py-3.5 px-4 text-slate-700 font-medium">{u.tipoUnidad}</td>
                                <td className="py-3.5 px-4 text-center">
                                    <span className="bg-rose-50 text-[#9D2449] font-black text-[10px] px-2.5 py-1 rounded-full border border-rose-200">
                                        {u.nivelAtencion}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${u.estatus === 'ACTIVO'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                                        }`}>
                                        {u.estatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE REGISTRO DE UNIDAD MÉDICA */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">

                        {/* CABECERA MODAL */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Dar de Alta Nueva Unidad Médica</h3>
                                    <p className="text-xs text-slate-500 font-medium">Servicios de Salud de Oaxaca • Catálogo CLUES</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* FORMULARIO DE REGISTRO */}
                        <form onSubmit={handleCreateClues} className="space-y-4 text-xs font-semibold">

                            {/* Clave CLUES */}
                            <div>
                                <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                                    <span>Clave CLUES *</span>
                                    <span className={`text-[10px] font-mono font-bold ${claveClues.length === 11 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {claveClues.length}/11
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={11}
                                    placeholder="Ej. OASSA000451"
                                    value={claveClues}
                                    onChange={(e) => setClaveClues(e.target.value.toUpperCase())}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold uppercase focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                />
                            </div>

                            {/* Nombre Completo de la Unidad Médica */}
                            <div>
                                <label className="block text-slate-800 font-bold mb-1">Nombre Completo de la Unidad Médica *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Centro de Salud Urbano Juchitán"
                                    value={nombreUnidad}
                                    onChange={(e) => setNombreUnidad(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                />
                            </div>

                            {/* Municipio / Localidad (TEXTO LIBRE) */}
                            <div>
                                <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                                    <span>Municipio / Localidad * (Texto Libre)</span>
                                    <span className="text-[10px] text-slate-400 font-normal">Cualquier municipio o agencia</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Escriba el municipio..."
                                    value={municipio}
                                    onChange={(e) => setMunicipio(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Tipo de Establecimiento */}
                                <div>
                                    <label className="block text-slate-800 font-bold mb-1">Tipo de Establecimiento *</label>
                                    <select
                                        value={tipoUnidad}
                                        onChange={(e) => setTipoUnidad(e.target.value as UnidadCLUES['tipoUnidad'])}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all font-semibold"
                                    >
                                        <option value="Centro de Salud">Centro de Salud</option>
                                        <option value="CESSA">CESSA</option>
                                        <option value="Hospital General">Hospital General</option>
                                        <option value="Hospital Comunitario">Hospital Comunitario</option>
                                    </select>
                                </div>

                                {/* Nivel de Atención */}
                                <div>
                                    <label className="block text-slate-800 font-bold mb-1">Nivel de Atención *</label>
                                    <select
                                        value={nivelAtencion}
                                        onChange={(e) => setNivelAtencion(e.target.value as UnidadCLUES['nivelAtencion'])}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all font-semibold"
                                    >
                                        <option value="Primer Nivel">Primer Nivel</option>
                                        <option value="Segundo Nivel">Segundo Nivel</option>
                                    </select>
                                </div>
                            </div>

                            {/* Estatus */}
                            <div>
                                <label className="block text-slate-800 font-bold mb-1">Estatus *</label>
                                <select
                                    value={estatus}
                                    onChange={(e) => setEstatus(e.target.value as UnidadCLUES['estatus'])}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all font-semibold"
                                >
                                    <option value="ACTIVO">ACTIVO (Operativa en Campo)</option>
                                    <option value="INACTIVO">INACTIVO (Mantenimiento / Suspendida)</option>
                                </select>
                            </div>

                            {/* BOTONES DE ACCIÓN */}
                            <div className="flex gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-rose-200" />
                                    <span>Guardar Unidad CLUES</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
