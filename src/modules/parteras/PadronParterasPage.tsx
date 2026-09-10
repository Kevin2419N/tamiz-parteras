import React, { useState } from 'react';
import type { ParteraTradicional } from '../../types';
import {
    Search,
    HeartHandshake,
    ShieldCheck,
    MapPin,
    Phone,
    Award,
    Filter,
    UserCheck,
    QrCode,
    LayoutGrid,
    Table as TableIcon,
    Plus,
    X,
    Printer,
    Calendar,
    Clock,
    Activity,
    BookOpen
} from 'lucide-react';

export const PadronParterasPage: React.FC = () => {
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstatus, setFiltroEstatus] = useState<string>('TODOS');
    const [filtroMunicipio, setFiltroMunicipio] = useState<string>('TODOS');
    const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

    // Modals state
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [selectedParteraQr, setSelectedParteraQr] = useState<ParteraTradicional | null>(null);
    const [selectedParteraHistorial, setSelectedParteraHistorial] = useState<ParteraTradicional | null>(null);

    // Initial Mock Parteras Directory (Istmo de Tehuantepec)
    const [parteras, setParteras] = useState<ParteraTradicional[]>([
        {
            id: 'PAR-OAX-001',
            nombreCompleto: 'Doña Rosa Santiz Gómez',
            nombreZapoteco: 'Na Rosa de Juchitán',
            curp: 'SAGR650412HOCMNN09',
            telefono: '971 102 9988',
            lenguaMaterna: 'Zapoteco del Istmo (Diidxazá)',
            comunidad: 'Juchitán de Zaragoza',
            municipio: 'Juchitán de Zaragoza',
            jurisdiccion: 'Jurisdicción No. 2 - Istmo',
            certificadoVigente: true,
            experienciaAnos: 28,
            totalAtenciones: 342,
            tamicesCanalizadosPct: 94,
            estatusRegistro: 'ACTIVA',
            estatusAcreditacion: 'ACREDITADA',
            pinAcceso: '4829',
            fechaRegistro: '2021-03-15',
        },
        {
            id: 'PAR-OAX-002',
            nombreCompleto: 'Doña Juana López Pérez',
            nombreZapoteco: 'Na Juana de Tehuantepec',
            curp: 'LOPJ700820HOCMRR01',
            telefono: '971 554 1122',
            lenguaMaterna: 'Zapoteco del Istmo (Diidxazá)',
            comunidad: 'Santo Domingo Tehuantepec',
            municipio: 'Santo Domingo Tehuantepec',
            jurisdiccion: 'Jurisdicción No. 2 - Istmo',
            certificadoVigente: true,
            experienciaAnos: 22,
            totalAtenciones: 215,
            tamicesCanalizadosPct: 88,
            estatusRegistro: 'ACTIVA',
            estatusAcreditacion: 'ACREDITADA',
            pinAcceso: '1092',
            fechaRegistro: '2022-01-10',
        },
        {
            id: 'PAR-OAX-003',
            nombreCompleto: 'Doña Petrona Cruz Velasco',
            nombreZapoteco: 'Na Petrona de Salina Cruz',
            curp: 'CRVP621105HOCMXX04',
            telefono: '971 889 3344',
            lenguaMaterna: 'Español / Huave',
            comunidad: 'Salina Cruz',
            municipio: 'Salina Cruz',
            jurisdiccion: 'Jurisdicción No. 2 - Istmo',
            certificadoVigente: false,
            experienciaAnos: 35,
            totalAtenciones: 510,
            tamicesCanalizadosPct: 96,
            estatusRegistro: 'EN_VALIDACION',
            estatusAcreditacion: 'EN_PROCESO',
            pinAcceso: '7731',
            fechaRegistro: '2023-06-20',
        },
        {
            id: 'PAR-OAX-004',
            nombreCompleto: 'Doña Asunción Girón Morales',
            nombreZapoteco: 'Na Chona de Ixtepec',
            curp: 'GIMA780911HOCMKL03',
            telefono: '971 712 4455',
            lenguaMaterna: 'Zapoteco del Istmo (Diidxazá)',
            comunidad: 'Ciudad Ixtepec',
            municipio: 'Ciudad Ixtepec',
            jurisdiccion: 'Jurisdicción No. 2 - Istmo',
            certificadoVigente: true,
            experienciaAnos: 19,
            totalAtenciones: 180,
            tamicesCanalizadosPct: 91,
            estatusRegistro: 'ACTIVA',
            estatusAcreditacion: 'ACREDITADA',
            pinAcceso: '5520',
            fechaRegistro: '2022-11-04',
        },
        {
            id: 'PAR-OAX-005',
            nombreCompleto: 'Doña Micaela Ruiz Hernández',
            nombreZapoteco: 'Na Micaela de San Blas',
            curp: 'RUHM680214HOCMNP08',
            telefono: '971 332 9900',
            lenguaMaterna: 'Zapoteco del Istmo (Diidxazá)',
            comunidad: 'San Blas Atempa',
            municipio: 'San Blas Atempa',
            jurisdiccion: 'Jurisdicción No. 2 - Istmo',
            certificadoVigente: false,
            experienciaAnos: 30,
            totalAtenciones: 295,
            tamicesCanalizadosPct: 82,
            estatusRegistro: 'EN_VALIDACION',
            estatusAcreditacion: 'VISITA_PENDIENTE',
            pinAcceso: '3318',
            fechaRegistro: '2024-02-18',
        },
        {
            id: 'PAR-OAX-006',
            nombreCompleto: 'Doña Lucía Jiménez Toledo',
            nombreZapoteco: 'Na Lucía de Ixtaltepec',
            curp: 'JITL740522HOCMQR05',
            telefono: '971 822 6611',
            lenguaMaterna: 'Zapoteco del Istmo (Diidxazá)',
            comunidad: 'Asunción Ixtaltepec',
            municipio: 'Asunción Ixtaltepec',
            jurisdiccion: 'Jurisdicción No. 2 - Istmo',
            certificadoVigente: true,
            experienciaAnos: 25,
            totalAtenciones: 240,
            tamicesCanalizadosPct: 90,
            estatusRegistro: 'ACTIVA',
            estatusAcreditacion: 'ACREDITADA',
            pinAcceso: '9012',
            fechaRegistro: '2023-09-12',
        },
    ]);

    // Form state for New Partera
    const [newParteraForm, setNewParteraForm] = useState({
        nombreCompleto: '',
        nombreZapoteco: '',
        curp: '',
        telefono: '',
        lenguaMaterna: 'Zapoteco del Istmo (Diidxazá)',
        comunidad: 'Juchitán de Zaragoza',
        municipio: 'Juchitán de Zaragoza',
        experienciaAnos: 15,
        pinAcceso: '',
    });

    const handleCreatePartera = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newParteraForm.nombreCompleto || !newParteraForm.telefono) return;

        const newId = `PAR-OAX-00${parteras.length + 1}`;
        const generatedPin = newParteraForm.pinAcceso || Math.floor(1000 + Math.random() * 9000).toString();

        const created: ParteraTradicional = {
            id: newId,
            nombreCompleto: newParteraForm.nombreCompleto,
            nombreZapoteco: newParteraForm.nombreZapoteco || `Na ${newParteraForm.nombreCompleto.split(' ')[0]}`,
            curp: newParteraForm.curp || `${newParteraForm.nombreCompleto.substring(0, 4).toUpperCase()}900101HOCM00`,
            telefono: newParteraForm.telefono,
            lenguaMaterna: newParteraForm.lenguaMaterna,
            comunidad: newParteraForm.comunidad,
            municipio: newParteraForm.municipio,
            jurisdiccion: 'Jurisdicción No. 2 - Istmo',
            certificadoVigente: true,
            experienciaAnos: Number(newParteraForm.experienciaAnos),
            totalAtenciones: 1,
            tamicesCanalizadosPct: 100,
            estatusRegistro: 'ACTIVA',
            estatusAcreditacion: 'ACREDITADA',
            pinAcceso: generatedPin,
            fechaRegistro: new Date().toISOString().split('T')[0],
        };

        setParteras([created, ...parteras]);
        setShowRegisterModal(false);
        setNewParteraForm({
            nombreCompleto: '',
            nombreZapoteco: '',
            curp: '',
            telefono: '',
            lenguaMaterna: 'Zapoteco del Istmo (Diidxazá)',
            comunidad: 'Juchitán de Zaragoza',
            municipio: 'Juchitán de Zaragoza',
            experienciaAnos: 15,
            pinAcceso: '',
        });
        setSelectedParteraQr(created);
    };

    // Filtering logic
    const parterasFiltradas = parteras.filter((p) => {
        const query = searchTerm.toLowerCase();
        const coincideBusqueda =
            p.nombreCompleto.toLowerCase().includes(query) ||
            (p.nombreZapoteco && p.nombreZapoteco.toLowerCase().includes(query)) ||
            p.comunidad.toLowerCase().includes(query) ||
            p.lenguaMaterna.toLowerCase().includes(query);

        const coincideEstatus =
            filtroEstatus === 'TODOS' ||
            (filtroEstatus === 'ACREDITADA' && p.estatusAcreditacion === 'ACREDITADA') ||
            (filtroEstatus === 'EN_PROCESO' && p.estatusAcreditacion === 'EN_PROCESO') ||
            (filtroEstatus === 'VISITA_PENDIENTE' && p.estatusAcreditacion === 'VISITA_PENDIENTE');

        const coincideMunicipio =
            filtroMunicipio === 'TODOS' || p.municipio === filtroMunicipio;

        return coincideBusqueda && coincideEstatus && coincideMunicipio;
    });

    const getAcreditacionBadge = (estatus?: string) => {
        switch (estatus) {
            case 'ACREDITADA':
                return (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-black flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Acreditada SSO
                    </span>
                );
            case 'EN_PROCESO':
                return (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> En Proceso
                    </span>
                );
            case 'VISITA_PENDIENTE':
                return (
                    <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-300 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-600" /> Visita Pendiente
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-bold">
                        Registrada
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto selection:bg-emerald-600 selection:text-white">

            {/* Encabezado Principal */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            GOBIERNO DE OAXACA • SSO
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-600">Red Comunitaria de Salud Maternal</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mt-1">Padrón de Parteras Tradicionales</h1>
                    <p className="text-xs font-medium text-slate-600 mt-1">
                        Jurisdicción Sanitaria No. 2 • Istmo de Tehuantepec (Juchitán, Tehuantepec, Salina Cruz, Ixtepec, Atempa, Ixtaltepec, Espinal).
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowRegisterModal(true)}
                        className="px-4 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Registrar Nueva Partera</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards (Modo Claro) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-600">Total Parteras Registradas</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{parteras.length}</p>
                        <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">Jurisdicción No. 2 Istmo</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
                        <UserCheck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-600">Acreditadas por Salubridad</p>
                        <p className="text-2xl font-black text-teal-800 mt-1">
                            {parteras.filter((p) => p.estatusAcreditacion === 'ACREDITADA').length}
                        </p>
                        <p className="text-[10px] font-bold text-teal-700 mt-0.5">Certificación SSO activa</p>
                    </div>
                    <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl border border-teal-200">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-600">Atenciones de Parto Acumuladas</p>
                        <p className="text-2xl font-black text-amber-700 mt-1">
                            {parteras.reduce((acc, p) => acc + p.totalAtenciones, 0)}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Comunidades del Istmo</p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
                        <Award className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-600">Tamices Canalizados</p>
                        <p className="text-2xl font-black text-emerald-800 mt-1">91.4%</p>
                        <p className="text-[10px] font-bold text-emerald-700 mt-0.5">Referencia oportuna a salud</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
                        <Activity className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Barra de Filtros, Búsqueda y Alternador de Vista */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">

                {/* Caja de Búsqueda */}
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, nombre zapoteco, comunidad del Istmo o lengua..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Filtro Estatus Acreditación */}
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <select
                            value={filtroEstatus}
                            onChange={(e) => setFiltroEstatus(e.target.value)}
                            className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none"
                        >
                            <option value="TODOS">Todos los Estados</option>
                            <option value="ACREDITADA">Acreditada SSO</option>
                            <option value="EN_PROCESO">En Proceso</option>
                            <option value="VISITA_PENDIENTE">Visita Pendiente</option>
                        </select>
                    </div>

                    {/* Filtro Municipio Istmo */}
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <select
                            value={filtroMunicipio}
                            onChange={(e) => setFiltroMunicipio(e.target.value)}
                            className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none"
                        >
                            <option value="TODOS">Todos los Municipios del Istmo</option>
                            <option value="Juchitán de Zaragoza">Juchitán de Zaragoza</option>
                            <option value="Santo Domingo Tehuantepec">Tehuantepec</option>
                            <option value="Salina Cruz">Salina Cruz</option>
                            <option value="Ciudad Ixtepec">Ciudad Ixtepec</option>
                            <option value="San Blas Atempa">San Blas Atempa</option>
                            <option value="Asunción Ixtaltepec">Asunción Ixtaltepec</option>
                        </select>
                    </div>

                    {/* Alternador de Vista (Tarjetas vs Tabla) */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setViewMode('CARDS')}
                            className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'CARDS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            title="Vista de Tarjetas / Expediente Humano"
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden sm:inline">Tarjetas</span>
                        </button>
                        <button
                            onClick={() => setViewMode('TABLE')}
                            className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'TABLE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            title="Vista de Tabla / Padrón General"
                        >
                            <TableIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Tabla</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* VISTA 1: GRID DE TARJETAS (EXPEDIENTE HUMANO) */}
            {viewMode === 'CARDS' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parterasFiltradas.map((p) => (
                        <div
                            key={p.id}
                            className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm hover:border-emerald-500/60 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div>
                                {/* Header Tarjeta con Avatar & Acreditación */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-black text-base shadow-sm">
                                            {p.nombreCompleto.substring(5, 7).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{p.nombreCompleto}</h3>
                                            {p.nombreZapoteco && (
                                                <p className="text-xs font-extrabold text-emerald-700">{p.nombreZapoteco}</p>
                                            )}
                                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{p.id} • {p.curp}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Estatus Badge */}
                                <div className="mb-3">
                                    {getAcreditacionBadge(p.estatusAcreditacion)}
                                </div>

                                {/* Datos de Comunidad & Lengua */}
                                <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Comunidad:
                                        </span>
                                        <span className="font-bold text-slate-900 truncate max-w-[170px]">{p.comunidad}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                            <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" /> Lengua:
                                        </span>
                                        <span className="font-bold text-teal-800 truncate max-w-[170px]">{p.lenguaMaterna}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" /> Contacto:
                                        </span>
                                        <span className="font-bold text-slate-900">{p.telefono}</span>
                                    </div>
                                </div>

                                {/* Métricas Rápidas de la Partera */}
                                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                        <span className="block text-[10px] font-bold text-slate-500">Partos Atendidos</span>
                                        <span className="font-black text-slate-900 text-base">{p.totalAtenciones}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                        <span className="block text-[10px] font-bold text-slate-500">Tamices Canalizados</span>
                                        <span className="font-black text-emerald-700 text-base">{p.tamicesCanalizadosPct || 90}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Botones Táctiles de Acción */}
                            <div className="mt-5 pt-3 border-t border-slate-200 space-y-2">
                                <button
                                    onClick={() => setSelectedParteraQr(p)}
                                    className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <QrCode className="w-4 h-4 text-emerald-700" />
                                    <span>Generar Tarjeta / QR de Acceso</span>
                                </button>

                                <button
                                    onClick={() => setSelectedParteraHistorial(p)}
                                    className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Ver Historial de Atenciones</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* VISTA 2: TABLA DE PADRÓN GENERAL */
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Folio / Partera</th>
                                    <th className="p-4">Comunidad (Istmo)</th>
                                    <th className="p-4">Lengua Materna</th>
                                    <th className="p-4">Estado Acreditación</th>
                                    <th className="p-4 text-center">Partos</th>
                                    <th className="p-4 text-center">% Tamices</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {parterasFiltradas.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-xs">
                                                    {p.nombreCompleto.substring(5, 7)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{p.nombreCompleto}</p>
                                                    {p.nombreZapoteco && (
                                                        <p className="text-[11px] font-semibold text-emerald-700">{p.nombreZapoteco}</p>
                                                    )}
                                                    <span className="text-[10px] text-slate-400 font-mono">{p.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-800 font-semibold">{p.comunidad}</td>
                                        <td className="p-4 text-teal-800 font-semibold">{p.lenguaMaterna}</td>
                                        <td className="p-4">{getAcreditacionBadge(p.estatusAcreditacion)}</td>
                                        <td className="p-4 text-center font-bold text-slate-900">{p.totalAtenciones}</td>
                                        <td className="p-4 text-center font-extrabold text-emerald-700">{p.tamicesCanalizadosPct || 90}%</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => setSelectedParteraQr(p)}
                                                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-lg font-bold text-[11px] inline-flex items-center gap-1"
                                            >
                                                <QrCode className="w-3.5 h-3.5" /> Credencial QR
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL 1: REGISTRO DE NUEVA PARTERA */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                                    <HeartHandshake className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Registrar Nueva Partera Tradicional</h3>
                                    <p className="text-xs text-slate-500 font-medium">Acreditación e integración a la Red Comunitaria SSO</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePartera} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Doña Juana Vásquez Jiménez"
                                        value={newParteraForm.nombreCompleto}
                                        onChange={(e) => setNewParteraForm({ ...newParteraForm, nombreCompleto: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Nombre en Lengua Zapoteca / Comunitaria</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Na Juana de Tehuantepec"
                                        value={newParteraForm.nombreZapoteco}
                                        onChange={(e) => setNewParteraForm({ ...newParteraForm, nombreZapoteco: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Comunidad y Municipio del Istmo *</label>
                                    <select
                                        value={newParteraForm.municipio}
                                        onChange={(e) => setNewParteraForm({ ...newParteraForm, municipio: e.target.value, comunidad: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                                    >
                                        <option value="Juchitán de Zaragoza">Juchitán de Zaragoza</option>
                                        <option value="Santo Domingo Tehuantepec">Santo Domingo Tehuantepec</option>
                                        <option value="Salina Cruz">Salina Cruz</option>
                                        <option value="Ciudad Ixtepec">Ciudad Ixtepec</option>
                                        <option value="San Blas Atempa">San Blas Atempa</option>
                                        <option value="Asunción Ixtaltepec">Asunción Ixtaltepec</option>
                                        <option value="El Espinal">El Espinal</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Teléfono / WhatsApp *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Ej: 971 123 4567"
                                        value={newParteraForm.telefono}
                                        onChange={(e) => setNewParteraForm({ ...newParteraForm, telefono: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Lengua Originaria Principal</label>
                                    <select
                                        value={newParteraForm.lenguaMaterna}
                                        onChange={(e) => setNewParteraForm({ ...newParteraForm, lenguaMaterna: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                                    >
                                        <option value="Zapoteco del Istmo (Diidxazá)">Zapoteco del Istmo (Diidxazá)</option>
                                        <option value="Huave / Ombeayiüts">Huave / Ombeayiüts</option>
                                        <option value="Zoque">Zoque</option>
                                        <option value="Español">Español</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Años de Experiencia Tradicional</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={newParteraForm.experienciaAnos}
                                        onChange={(e) => setNewParteraForm({ ...newParteraForm, experienciaAnos: Number(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>

                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                                <label className="block text-emerald-950 font-black">Asignación de PIN de 4 Dígitos para Login Híbrido</label>
                                <p className="text-[11px] text-emerald-800 font-medium">
                                    Este PIN le permitirá ingresar rápidamente desde la aplicación web o móvil en comunidad.
                                </p>
                                <input
                                    type="text"
                                    maxLength={4}
                                    placeholder="Ej: 4829 (se genera aleatorio si se deja vacío)"
                                    value={newParteraForm.pinAcceso}
                                    onChange={(e) => setNewParteraForm({ ...newParteraForm, pinAcceso: e.target.value })}
                                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-slate-900 font-black tracking-widest text-center text-base focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowRegisterModal(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                                >
                                    Guardar y Acreditar Partera
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: VISTA PREVIA DE CREDENCIAL Y CÓDIGO QR OFICIAL */}
            {selectedParteraQr && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                                <h3 className="text-sm font-black text-slate-900">Credencial Digital & Código QR</h3>
                            </div>
                            <button
                                onClick={() => setSelectedParteraQr(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tarjeta Simulada Impresa Credencial SSO */}
                        <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-teal-700/50 space-y-4 relative overflow-hidden">

                            {/* Marca de Agua / Sello */}
                            <div className="flex justify-between items-start border-b border-teal-500/30 pb-3">
                                <div>
                                    <span className="text-[9px] font-black tracking-widest text-emerald-300 uppercase block">
                                        SERVICIOS DE SALUD DE OAXACA
                                    </span>
                                    <h4 className="text-xs font-black text-white">RED COMUNITARIA DE PARTERAS</h4>
                                </div>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/40">
                                    ACREDITADA
                                </span>
                            </div>

                            {/* Foto & Datos principales */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white text-emerald-900 font-black text-xl flex items-center justify-center border-2 border-emerald-400 shadow-md shrink-0">
                                    {selectedParteraQr.nombreCompleto.substring(5, 7).toUpperCase()}
                                </div>
                                <div>
                                    <h5 className="font-extrabold text-sm text-white leading-snug">{selectedParteraQr.nombreCompleto}</h5>
                                    {selectedParteraQr.nombreZapoteco && (
                                        <p className="text-xs font-bold text-teal-300">{selectedParteraQr.nombreZapoteco}</p>
                                    )}
                                    <p className="text-[11px] text-teal-100/80 mt-0.5">{selectedParteraQr.comunidad}</p>
                                    <p className="text-[10px] text-teal-200 font-mono mt-0.5">ID: {selectedParteraQr.id}</p>
                                </div>
                            </div>

                            {/* Código QR Gigante Simulado */}
                            <div className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center border border-teal-200">
                                <div className="w-36 h-36 relative flex items-center justify-center bg-slate-900 p-2 rounded-xl">
                                    {/* Mock QR SVG */}
                                    <svg className="w-full h-full text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
                                        <rect x="10" y="10" width="25" height="25" fill="#10b981" />
                                        <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                                        <rect x="65" y="10" width="25" height="25" fill="#10b981" />
                                        <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                                        <rect x="10" y="65" width="25" height="25" fill="#10b981" />
                                        <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                                        <circle cx="50" cy="50" r="10" fill="#10b981" />
                                        <rect x="40" y="15" width="20" height="8" fill="#10b981" />
                                        <rect x="15" y="40" width="8" height="20" fill="#10b981" />
                                        <rect x="77" y="40" width="8" height="20" fill="#10b981" />
                                        <rect x="40" y="77" width="20" height="8" fill="#10b981" />
                                    </svg>
                                </div>
                                <div className="mt-2 text-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PIN de Acceso Rápido</span>
                                    <span className="text-base font-black text-slate-900 font-mono tracking-widest">
                                        [ {selectedParteraQr.pinAcceso || '4829'} ]
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Botones Modal */}
                        <div className="flex justify-between items-center pt-2">
                            <button
                                onClick={() => alert('Generando archivo PDF para impresión de credencial...')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Imprimir Credencial</span>
                            </button>
                            <button
                                onClick={() => setSelectedParteraQr(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                            >
                                Cerrar
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* MODAL 3: HISTORIAL DE ATENCIONES COMUNITARIAS */}
            {selectedParteraHistorial && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-emerald-700" />
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Historial de Atenciones</h3>
                                    <p className="text-[11px] font-semibold text-teal-700">{selectedParteraHistorial.nombreCompleto}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedParteraHistorial(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-900">Atención de Parto & Canalización Tamiz</p>
                                    <p className="text-[11px] text-slate-500">Madre: María Sánchez • Juchitán</p>
                                </div>
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[10px]">
                                    Tamizado en 48 hrs
                                </span>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-900">Referencia Comunitaria por Riesgo</p>
                                    <p className="text-[11px] text-slate-500">Paciente: Juana Morales • Tehuantepec</p>
                                </div>
                                <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg font-bold text-[10px]">
                                    Atendida en CESSA
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-200">
                            <button
                                onClick={() => setSelectedParteraHistorial(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
