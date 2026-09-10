import React, { useState } from 'react';
import type { ParteraTradicional } from '../../types';
import { Search, HeartHandshake, ShieldCheck, MapPin, Phone, Award, Filter, UserCheck } from 'lucide-react';

export const PadronParterasPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroComunidad, setFiltroComunidad] = useState<string>('TODAS');

    // Mock Parteras Tradicionales directory
    const [parteras] = useState<ParteraTradicional[]>([
        {
            id: 'PAR-001',
            nombreCompleto: 'Doña Rosa Santiz Gómez',
            curp: 'SAGR650412HCSMNN09',
            telefono: '967 102 9988',
            lenguaMaterna: 'Tzotzil',
            comunidad: 'San Juan Chamula',
            municipio: 'Chamula',
            jurisdiccion: 'Jurisdicción II Altos',
            certificadoVigente: true,
            experienciaAnos: 28,
            totalAtenciones: 342,
            estatusRegistro: 'ACTIVA',
            fechaRegistro: '2021-03-15',
        },
        {
            id: 'PAR-002',
            nombreCompleto: 'Doña Juana López Pérez',
            curp: 'LOPJ700820HCSMRR01',
            telefono: '967 554 1122',
            lenguaMaterna: 'Tseltal',
            comunidad: 'Tenejapa Centro',
            municipio: 'Tenejapa',
            jurisdiccion: 'Jurisdicción II Altos',
            certificadoVigente: true,
            experienciaAnos: 22,
            totalAtenciones: 215,
            estatusRegistro: 'ACTIVA',
            fechaRegistro: '2022-01-10',
        },
        {
            id: 'PAR-003',
            nombreCompleto: 'Doña Petrona Cruz Velasco',
            curp: 'CRVP621105HCSMXX04',
            telefono: '961 889 3344',
            lenguaMaterna: 'Zoque',
            comunidad: 'Copainalá',
            municipio: 'Copainalá',
            jurisdiccion: 'Jurisdicción I Centro',
            certificadoVigente: false,
            experienciaAnos: 35,
            totalAtenciones: 510,
            estatusRegistro: 'EN_VALIDACION',
            fechaRegistro: '2023-06-20',
        },
    ]);

    const parterasFiltradas = parteras.filter((p) => {
        const coincideBusqueda =
            p.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.comunidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.lenguaMaterna.toLowerCase().includes(searchTerm.toLowerCase());

        const coincideComunidad = filtroComunidad === 'TODAS' || p.municipio === filtroComunidad;

        return coincideBusqueda && coincideComunidad;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Encabezado */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">Red Comunitaria de Salud</span>
                    <h1 className="text-2xl font-extrabold text-white mt-1">Padrón de Parteras Tradicionales</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Directorio oficial de parteras tradicionales acreditadas, lenguas originarias y red de atención perinatal.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4" />
                        <span>Registrar Nueva Partera</span>
                    </button>
                </div>
            </div>

            {/* KPI Parteras */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Parteras Registradas</p>
                        <p className="text-xl font-bold text-white mt-1">84</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                        <UserCheck className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Certificadas con Salubridad</p>
                        <p className="text-xl font-bold text-teal-400 mt-1">76</p>
                    </div>
                    <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Atenciones Acumuladas</p>
                        <p className="text-xl font-bold text-amber-400 mt-1">1,067</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                        <Award className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Filtros de Búsqueda */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 justify-between">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                        type="text"
                        placeholder="Buscar partera por nombre, comunidad o lengua originaria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={filtroComunidad}
                        onChange={(e) => setFiltroComunidad(e.target.value)}
                        className="bg-transparent text-xs text-slate-300 focus:outline-none"
                    >
                        <option value="TODAS" className="bg-slate-900">Todos los Municipios</option>
                        <option value="Chamula" className="bg-slate-900">Chamula</option>
                        <option value="Tenejapa" className="bg-slate-900">Tenejapa</option>
                        <option value="Copainalá" className="bg-slate-900">Copainalá</option>
                    </select>
                </div>
            </div>

            {/* Grid de Tarjetas de Parteras */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parterasFiltradas.map((p) => (
                    <div key={p.id} className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                                        {p.nombreCompleto.substring(5, 7)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-white">{p.nombreCompleto}</h3>
                                        <span className="text-[11px] text-slate-400 font-mono">{p.curp}</span>
                                    </div>
                                </div>
                                {p.certificadoVigente ? (
                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Certificada
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-bold">
                                        En Validación
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Comunidad:</span>
                                    <span className="font-medium text-white">{p.comunidad}, {p.municipio}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Lengua Originaria:</span>
                                    <span className="font-medium text-emerald-300">{p.lenguaMaterna}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teal-400" /> Teléfono:</span>
                                    <span className="font-medium text-white">{p.telefono}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                                    <span className="block text-[10px] text-slate-400">Experiencia</span>
                                    <span className="font-bold text-white text-sm">{p.experienciaAnos} Años</span>
                                </div>
                                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                                    <span className="block text-[10px] text-slate-400">Atenciones</span>
                                    <span className="font-bold text-emerald-400 text-sm">{p.totalAtenciones} Partos</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Reg: {p.fechaRegistro}</span>
                            <button className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/30">
                                Ver Ficha Completa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};
