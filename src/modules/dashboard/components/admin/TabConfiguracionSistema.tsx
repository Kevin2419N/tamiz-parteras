import React, { useState, useEffect } from 'react';
import { Settings, Database, HardDrive, ShieldCheck, History, RefreshCw, Building2, Plus, X, Info } from 'lucide-react';
import type { LogSistema, UnidadCLUES } from './types';
import { getCluesCatalog, addCluesUnit, subscribeCluesCatalog } from './cluesData';

export const TabConfiguracionSistema: React.FC = () => {
    const [backupStatus, setBackupStatus] = useState<string | null>(null);

    // Dynamic CLUES Catalog state
    const [cluesCatalog, setCluesCatalog] = useState<UnidadCLUES[]>(getCluesCatalog());
    const [showCluesModal, setShowCluesModal] = useState(false);

    // Form state for new CLUES unit
    const [nombreUnidad, setNombreUnidad] = useState('');
    const [claveClues, setClaveClues] = useState('');
    const [municipio, setMunicipio] = useState('Juchitán de Zaragoza');
    const [tipoUnidad, setTipoUnidad] = useState<UnidadCLUES['tipoUnidad']>('Centro de Salud');
    const [estatus, setEstatus] = useState<UnidadCLUES['estatus']>('ACTIVO');

    useEffect(() => {
        const unsubscribe = subscribeCluesCatalog((updatedList) => {
            setCluesCatalog(updatedList);
        });
        return unsubscribe;
    }, []);

    const [logs] = useState<LogSistema[]>([
        {
            id: 'l1',
            fechaHora: '2026-09-27 20:14:02',
            usuario: 'Lic. Administrador Jurisdiccional',
            accion: 'Acreditación de Partera Tradicional (PIN Generado)',
            modulo: 'Padrón Parteras',
            ip: '192.168.1.45'
        },
        {
            id: 'l2',
            fechaHora: '2026-09-27 19:40:15',
            usuario: 'Dra. María Elena Ramos',
            accion: 'Emisión de Contrareferencia Médica (REF-2026-0105)',
            modulo: 'Referencias Formato 1',
            ip: '192.168.1.88'
        },
        {
            id: 'l3',
            fechaHora: '2026-09-27 18:22:11',
            usuario: 'Enf. Juan Carlos Morales',
            accion: 'Auditoría de Muestra Guthrie (GUTH-2026-0891)',
            modulo: 'Tamiz Neonatal',
            ip: '192.168.1.12'
        },
    ]);

    const handleBackupBD = () => {
        setBackupStatus('Generando respaldo cifrado SQL...');
        setTimeout(() => {
            setBackupStatus('Respaldo completado: SSO_Istmo_20260927_Backup.sql (14.2 MB)');
        }, 1500);
    };

    const handleCreateClues = (e: React.FormEvent) => {
        e.preventDefault();
        addCluesUnit({
            nombre: nombreUnidad,
            clues: claveClues.toUpperCase(),
            municipio,
            tipoUnidad,
            estatus,
        });
        setShowCluesModal(false);

        // Reset form
        setNombreUnidad('');
        setClaveClues('');
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8">

            {/* CABECERA GENERAL DE CONFIGURACIÓN */}
            <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#9D2449]" />
                    <span>Configuración del Sistema, Catálogo CLUES y Seguridad</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Mantenimiento del catálogo de unidades médicas, respaldo de base de datos y bitácora de auditoría.
                </p>
            </div>

            {/* MÓDULO 1: CATÁLOGO DE ESTABLECIMIENTOS DE SALUD (CLUES) */}
            <div className="space-y-4 bg-slate-50/70 p-5 rounded-3xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Catálogo de Establecimientos de Salud (CLUES)</h3>
                            <p className="text-[11px] text-slate-500 font-medium">Jurisdicción Sanitaria No. 2 • Istmo de Tehuantepec</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowCluesModal(true)}
                        className="px-4 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4 text-rose-200" />
                        <span>+ Agregar Unidad Médica / CLUES</span>
                    </button>
                </div>

                {/* NOTA EXPLICATIVA VISUAL INSTITUCIONAL */}
                <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-[#9D2449]">
                    <Info className="w-5 h-5 shrink-0 text-[#9D2449] mt-0.5" />
                    <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                        <strong>Integración Operativa CLUES:</strong> La clave CLUES configurada aquí autocompletará los registros de Tamiz Neonatal en las unidades de campo y alimentará las adscripciones oficiales de Médicos y Parteras Tradicionales.
                    </p>
                </div>

                {/* TABLA DE UNIDADES CLUES REGISTRADAS */}
                <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <table className="w-full text-left border-collapse text-xs font-semibold">
                        <thead>
                            <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                                <th className="py-3 px-4">Establecimiento / Unidad Médica</th>
                                <th className="py-3 px-4">Clave CLUES</th>
                                <th className="py-3 px-4">Municipio</th>
                                <th className="py-3 px-4">Tipo de Unidad</th>
                                <th className="py-3 px-4 text-center">Estatus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {cluesCatalog.map((unit) => (
                                <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3.5 px-4 font-black text-slate-900">{unit.nombre}</td>
                                    <td className="py-3.5 px-4">
                                        <span className="bg-rose-50 text-[#9D2449] font-mono font-black text-xs px-2.5 py-1 rounded-lg border border-rose-200 inline-block shadow-sm">
                                            {unit.clues}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-bold text-slate-800">{unit.municipio}</td>
                                    <td className="py-3.5 px-4 text-slate-600 font-medium">{unit.tipoUnidad}</td>
                                    <td className="py-3.5 px-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${unit.estatus === 'ACTIVO'
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                                            }`}>
                                            {unit.estatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MÓDULO 2 & 3: RESPALDOS BD Y CATÁLOGOS SECUNDARIOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CAJA 1: RESPALDOS Y MANTENIMIENTO BD */}
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                        <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200">
                            <Database className="w-5 h-5 text-[#9D2449]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Respaldo y Servidor BD</h3>
                            <p className="text-[11px] text-slate-500">Base de datos local y sincronización estatal SSO</p>
                        </div>
                    </div>

                    <div className="text-xs space-y-2 text-slate-700">
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-emerald-600" />
                                <span className="font-bold">Estado de Almacenamiento:</span>
                            </div>
                            <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                                ÓPTIMO (1.2 GB / 20 GB)
                            </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                                <span className="font-bold">Último Respaldo Automático:</span>
                            </div>
                            <span className="font-mono text-slate-600">Hoy 04:00 AM</span>
                        </div>

                        {backupStatus && (
                            <div className="p-3 bg-rose-50 text-[#9D2449] font-bold rounded-xl border border-rose-200 text-center animate-fadeIn">
                                {backupStatus}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleBackupBD}
                        className="w-full py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4 text-rose-200" />
                        <span>Ejecutar Respaldo Manual BD (.sql)</span>
                    </button>
                </div>

                {/* CAJA 2: MUNICIPOS Y COBERTURA REGIONAL */}
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                        <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl border border-blue-200">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Cobertura Regional de la Jurisdicción</h3>
                            <p className="text-[11px] text-slate-500">Municipios cartografiados e integrados</p>
                        </div>
                    </div>

                    <div className="text-xs space-y-2">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-slate-800">Catálogo de Municipios del Istmo</p>
                                <p className="text-[10px] text-slate-500">48 Municipios cartografiados</p>
                            </div>
                            <span className="text-xs font-black text-[#9D2449]">48 Activos</span>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-slate-800">Unidades de Salud CLUES Registradas</p>
                                <p className="text-[10px] text-slate-500">Centros de Salud, CESSA y Hospitales Generales</p>
                            </div>
                            <span className="text-xs font-black text-[#9D2449]">{cluesCatalog.length} Unidades</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BITÁCORA DE AUDITORÍA Y LOGS */}
            <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-[#9D2449]" />
                    <span>Bitácora de Auditoría y Logs de Accesos al Sistema</span>
                </h3>

                <div className="overflow-x-auto bg-slate-50 rounded-2xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs font-semibold">
                        <thead>
                            <tr className="bg-white text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                                <th className="py-2.5 px-4">Fecha / Hora</th>
                                <th className="py-2.5 px-4">Usuario</th>
                                <th className="py-2.5 px-4">Acción Ejecutada</th>
                                <th className="py-2.5 px-4">Módulo</th>
                                <th className="py-2.5 px-4 text-right">Dirección IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60 text-slate-700">
                            {logs.map((l) => (
                                <tr key={l.id} className="hover:bg-white/80">
                                    <td className="py-3 px-4 font-mono text-slate-500">{l.fechaHora}</td>
                                    <td className="py-3 px-4 font-black text-slate-900">{l.usuario}</td>
                                    <td className="py-3 px-4 text-slate-800">{l.accion}</td>
                                    <td className="py-3 px-4 font-bold text-[#9D2449]">{l.modulo}</td>
                                    <td className="py-3 px-4 text-right font-mono text-slate-500">{l.ip}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL REGISTRAR UNIDAD MÉDICA / CLUES */}
            {showCluesModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Agregar Unidad Médica / CLUES</h3>
                                    <p className="text-xs text-slate-500 font-medium">Servicios de Salud de Oaxaca • Catálogo Oficial</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCluesModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateClues} className="space-y-4 text-xs font-semibold">

                            {/* Nombre de la Unidad Médica */}
                            <div>
                                <label className="block text-slate-800 font-bold mb-1">Nombre de la Unidad Médica *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Centro de Salud Urbano Juchitán"
                                    value={nombreUnidad}
                                    onChange={(e) => setNombreUnidad(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                />
                            </div>

                            {/* Clave CLUES (11 caracteres) */}
                            <div>
                                <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                                    <span>Clave CLUES (11 Caracteres) *</span>
                                    <span className={`text-[10px] font-mono font-bold ${claveClues.length === 11 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {claveClues.length}/11
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={11}
                                    placeholder="OASSA000451"
                                    value={claveClues}
                                    onChange={(e) => setClaveClues(e.target.value.toUpperCase())}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold uppercase focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Municipio */}
                                <div>
                                    <label className="block text-slate-800 font-bold mb-1">Municipio *</label>
                                    <select
                                        value={municipio}
                                        onChange={(e) => setMunicipio(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all font-semibold"
                                    >
                                        <option value="Juchitán de Zaragoza">Juchitán de Zaragoza</option>
                                        <option value="Santo Domingo Tehuantepec">Santo Domingo Tehuantepec</option>
                                        <option value="Salina Cruz">Salina Cruz</option>
                                        <option value="San Blas Atempa">San Blas Atempa</option>
                                        <option value="Ciudad Ixtepec">Ciudad Ixtepec</option>
                                        <option value="Matías Romero Avendaño">Matías Romero Avendaño</option>
                                    </select>
                                </div>

                                {/* Tipo de Unidad */}
                                <div>
                                    <label className="block text-slate-800 font-bold mb-1">Tipo de Unidad *</label>
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
                            </div>

                            {/* Estatus */}
                            <div>
                                <label className="block text-slate-800 font-bold mb-1">Estatus de la Unidad *</label>
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
                                    onClick={() => setShowCluesModal(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                >
                                    <Plus className="w-4 h-4 text-rose-200" />
                                    <span>Registrar Clave CLUES</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
