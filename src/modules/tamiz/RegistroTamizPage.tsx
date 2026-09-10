import React, { useState } from 'react';
import type { RegistroTamiz } from '../../types';
import { Search, Plus, FileText, CheckCircle2, Clock, AlertCircle, Filter, Send, Download } from 'lucide-react';

export const RegistroTamizPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstatus, setFiltroEstatus] = useState<string>('TODOS');
    const [showModalNuevo, setShowModalNuevo] = useState(false);

    // Mock data for Tamiz registrations
    const [registros] = useState<RegistroTamiz[]>([
        {
            id: 'TAM-2026-001',
            folio: 'TMZ-98214',
            nombreRecienNacido: 'RN López Hernández',
            fechaNacimiento: '2026-09-02',
            semanasGestacion: 39,
            pesoGramos: 3200,
            nombreMadre: 'María Elena Hernández Jiménez',
            telefonoContacto: '967 112 4433',
            jurisdiccion: 'Jurisdicción II Altos',
            unidadSaludId: 'CS San Cristóbal Centro',
            capturistaId: 'CAP-04',
            fechaToma: '2026-09-04',
            estatus: 'PROCESADO',
        },
        {
            id: 'TAM-2026-002',
            folio: 'TMZ-98215',
            nombreRecienNacido: 'RN Gómez Santiz',
            fechaNacimiento: '2026-09-05',
            semanasGestacion: 38,
            pesoGramos: 2950,
            nombreMadre: 'Juana Santiz Cruz',
            telefonoContacto: '967 445 8899',
            jurisdiccion: 'Jurisdicción II Altos',
            unidadSaludId: 'CS Chamula',
            capturistaId: 'CAP-04',
            fechaToma: '2026-09-07',
            estatus: 'ENVIADO',
        },
        {
            id: 'TAM-2026-003',
            folio: 'TMZ-98216',
            nombreRecienNacido: 'RN Pérez Ruiz',
            fechaNacimiento: '2026-09-08',
            semanasGestacion: 40,
            pesoGramos: 3400,
            nombreMadre: 'Lucía Ruiz Velasco',
            telefonoContacto: '961 776 5544',
            jurisdiccion: 'Jurisdicción I Centro',
            unidadSaludId: 'CS Tuxtla Terán',
            capturistaId: 'CAP-02',
            fechaToma: '2026-09-09',
            estatus: 'PENDIENTE',
        },
    ]);

    const registrosFiltrados = registros.filter((reg) => {
        const coincideBusqueda =
            reg.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.nombreMadre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.nombreRecienNacido.toLowerCase().includes(searchTerm.toLowerCase());

        const coincideFiltro = filtroEstatus === 'TODOS' || reg.estatus === filtroEstatus;

        return coincideBusqueda && coincideFiltro;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Encabezado */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-teal-400">Módulo de Laboratorio</span>
                    <h1 className="text-2xl font-extrabold text-white mt-1">Registro de Folios & Muestras de Tamiz</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Captura de datos del recién nacido, gotas en papel filtro (Tarjeta de Guthrie) y rastreo de muestras.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowModalNuevo(true)}
                        className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Registrar Nueva Muestra</span>
                    </button>
                </div>
            </div>

            {/* KPI Muestras */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Capturados este Mes</p>
                        <p className="text-xl font-bold text-white mt-1">142</p>
                    </div>
                    <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Enviados a Laboratorio</p>
                        <p className="text-xl font-bold text-amber-400 mt-1">89</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                        <Send className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Resultados Validados</p>
                        <p className="text-xl font-bold text-emerald-400 mt-1">53</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Barra de Filtros */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 justify-between">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                        type="text"
                        placeholder="Buscar por Folio, nombre de la madre o recién nacido..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={filtroEstatus}
                            onChange={(e) => setFiltroEstatus(e.target.value)}
                            className="bg-transparent text-xs text-slate-300 focus:outline-none"
                        >
                            <option value="TODOS" className="bg-slate-900">Todos los Estatus</option>
                            <option value="PENDIENTE" className="bg-slate-900">Pendientes</option>
                            <option value="ENVIADO" className="bg-slate-900">Enviados</option>
                            <option value="PROCESADO" className="bg-slate-900">Procesados</option>
                        </select>
                    </div>

                    <button className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Tabla de Registros */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                            <tr>
                                <th className="px-5 py-4">Folio Tamiz</th>
                                <th className="px-5 py-4">Recién Nacido</th>
                                <th className="px-5 py-4">Madre / Contacto</th>
                                <th className="px-5 py-4">Fecha Toma</th>
                                <th className="px-5 py-4">Semanas / Peso</th>
                                <th className="px-5 py-4">Estatus</th>
                                <th className="px-5 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {registrosFiltrados.map((reg) => (
                                <tr key={reg.id} className="hover:bg-slate-900/50 transition-colors">
                                    <td className="px-5 py-4 font-mono font-bold text-teal-400">{reg.folio}</td>
                                    <td className="px-5 py-4 font-medium text-white">{reg.nombreRecienNacido}</td>
                                    <td className="px-5 py-4">
                                        <p className="font-medium text-slate-200">{reg.nombreMadre}</p>
                                        <p className="text-[11px] text-slate-400">{reg.telefonoContacto}</p>
                                    </td>
                                    <td className="px-5 py-4 text-slate-400">{reg.fechaToma}</td>
                                    <td className="px-5 py-4 text-slate-400">{reg.semanasGestacion} SDG / {reg.pesoGramos}g</td>
                                    <td className="px-5 py-4">
                                        {reg.estatus === 'PROCESADO' && (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
                                                <CheckCircle2 className="w-3 h-3" /> Procesado
                                            </span>
                                        )}
                                        {reg.estatus === 'ENVIADO' && (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 w-fit">
                                                <Clock className="w-3 h-3" /> Enviado Lab
                                            </span>
                                        )}
                                        {reg.estatus === 'PENDIENTE' && (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30 flex items-center gap-1.5 w-fit">
                                                <AlertCircle className="w-3 h-3" /> Pendiente Envío
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-teal-400 rounded-lg border border-slate-700 text-xs font-semibold">
                                            Ver Ficha
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Simulado de Registro */}
            {showModalNuevo && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white">Captura de Muestra de Tamiz Neonatal</h3>
                        <p className="text-xs text-slate-400">Complete los datos básicos tomados de la Tarjeta de Guthrie.</p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Folio del Papel Filtro</label>
                                <input type="text" placeholder="TMZ-98217" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Nombre de la Madre</label>
                                <input type="text" placeholder="Nombre completo" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Semanas Gestación</label>
                                    <input type="number" placeholder="39" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Peso (Gramos)</label>
                                    <input type="number" placeholder="3100" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                            <button onClick={() => setShowModalNuevo(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl">Cancelar</button>
                            <button onClick={() => setShowModalNuevo(false)} className="px-4 py-2 bg-teal-500 text-white text-xs font-bold rounded-xl">Guardar Folio</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
