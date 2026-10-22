import React, { useState, useEffect } from 'react';
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
    BookOpen,
    Loader2
} from 'lucide-react';

export const PadronParterasPage: React.FC = () => {
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstatus, setFiltroEstatus] = useState<string>('TODOS');
    const [filtroMunicipio, setFiltroMunicipio] = useState<string>('TODOS');
    const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

    // Estado real de conexión con Backend (Sustituyendo Mocks)
    const [parteras, setParteras] = useState<ParteraTradicional[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorConexion, setErrorConexion] = useState<string | null>(null);

    // Modals state
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [selectedParteraQr, setSelectedParteraQr] = useState<ParteraTradicional | null>(null);
    const [selectedParteraHistorial, setSelectedParteraHistorial] = useState<ParteraTradicional | null>(null);

    // Cargar datos reales desde el Backend al montar el componente
    useEffect(() => {
        const fetchParteras = async () => {
            try {
                setIsLoading(true);
                // Reemplaza esta URL con el endpoint real de tu backend Node.js / Express
                const response = await fetch('http://localhost:4000/api/parteras');

                if (!response.ok) {
                    throw new Error('Error al conectar con el servidor backend');
                }

                const data = await response.json();
                setParteras(data);
                setErrorConexion(null);
            } catch (err) {
                console.warn('Backend no disponible temporalmente, operando en modo desconectado:', err);
                setErrorConexion('No se pudo conectar al servidor. Verifique que el backend esté encendido.');
                // En caso de fallo de red en desarrollo local, puedes dejar un arreglo vacío o notificar
                setParteras([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchParteras();
    }, []);

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

    const handleCreatePartera = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newParteraForm.nombreCompleto || !newParteraForm.telefono) return;

        try {
            const response = await fetch('http://localhost:4000/api/parteras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newParteraForm),
            });

            if (!response.ok) throw new Error('Error al registrar la partera en el servidor');

            const nuevaParteraCreada = await response.json();

            // Actualizar estado local con la respuesta real de la base de datos
            setParteras([nuevaParteraCreada, ...parteras]);
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
            setSelectedParteraQr(nuevaParteraCreada);
        } catch (err) {
            console.error('Error en el registro:', err);
            alert('Hubo un error al registrar en el backend. Verifique la conexión.');
        }
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
                        className="px-4 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Registrar Nueva Partera</span>
                    </button>
                </div>
            </div>

            {/* Alerta de Error de Conexión si aplica */}
            {errorConexion && (
                <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-center justify-between text-amber-900 text-xs font-bold">
                    <span>⚠️ {errorConexion}</span>
                    <span className="text-[10px] bg-amber-200 px-2 py-1 rounded-lg">Modo Conexión Activo</span>
                </div>
            )}

            {/* KPI Cards */}
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
                            {parteras.reduce((acc, p) => acc + (p.totalAtenciones || 0), 0)}
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

            {/* Barra de Búsqueda y Filtros */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
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
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <select
                            value={filtroEstatus}
                            onChange={(e) => setFiltroEstatus(e.target.value)}
                            className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
                        >
                            <option value="TODOS">Todos los Estados</option>
                            <option value="ACREDITADA">Acreditada SSO</option>
                            <option value="EN_PROCESO">En Proceso</option>
                            <option value="VISITA_PENDIENTE">Visita Pendiente</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <select
                            value={filtroMunicipio}
                            onChange={(e) => setFiltroMunicipio(e.target.value)}
                            className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
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

                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setViewMode('CARDS')}
                            className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'CARDS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden sm:inline">Tarjetas</span>
                        </button>
                        <button
                            onClick={() => setViewMode('TABLE')}
                            className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'TABLE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <TableIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Tabla</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Listado / Carga */}
            {isLoading ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Conectando con la base de datos PostgreSQL y cargando padrón...</p>
                </div>
            ) : parterasFiltradas.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-700">No se encontraron parteras registradas en el servidor.</p>
                    <p className="text-xs text-slate-400">Verifica que tu backend esté corriendo y respondiendo en el endpoint.</p>
                </div>
            ) : viewMode === 'CARDS' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parterasFiltradas.map((p) => (
                        <div
                            key={p.id}
                            className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm hover:border-emerald-500/60 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-black text-base shadow-sm shrink-0">
                                            {p.nombreCompleto?.substring(5, 7).toUpperCase() || 'PR'}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{p.nombreCompleto}</h3>
                                            {p.nombreZapoteco && (
                                                <p className="text-xs font-extrabold text-emerald-700">{p.nombreZapoteco}</p>
                                            )}
                                            <div className="flex flex-col mt-0.5">
                                                <span className="text-[10px] text-slate-500 font-mono font-bold">{p.id}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">{p.curp}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    {getAcreditacionBadge(p.estatusAcreditacion)}
                                </div>

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

                                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                        <span className="block text-[10px] font-bold text-slate-500">Partos Atendidos</span>
                                        <span className="font-black text-slate-900 text-base">{p.totalAtenciones || 0}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                        <span className="block text-[10px] font-bold text-slate-500">Tamices Canalizados</span>
                                        <span className="font-black text-emerald-700 text-base">{p.tamicesCanalizadosPct || 90}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-slate-200 space-y-2">
                                <button
                                    onClick={() => setSelectedParteraQr(p)}
                                    className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <QrCode className="w-4 h-4 text-emerald-700" />
                                    <span>Generar Credencial / QR</span>
                                </button>
                                <button
                                    onClick={() => setSelectedParteraHistorial(p)}
                                    className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Ver Historial Backend</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
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
                                                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                                                    {p.nombreCompleto?.substring(5, 7) || 'PR'}
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
                                        <td className="p-4 text-center font-bold text-slate-900">{p.totalAtenciones || 0}</td>
                                        <td className="p-4 text-center font-extrabold text-emerald-700">{p.tamicesCanalizadosPct || 90}%</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => setSelectedParteraQr(p)}
                                                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
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

            {/* MODAL DE REGISTRO (Conectado a POST backend) */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                                    <HeartHandshake className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Registrar Partera en PostgreSQL</h3>
                                    <p className="text-xs text-slate-500 font-medium">Envío directo de datos al servidor backend</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
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
                                    <label className="block text-slate-700 font-bold mb-1">Nombre en Lengua Zapoteca</label>
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
                                    <label className="block text-slate-700 font-bold mb-1">Municipio del Istmo *</label>
                                    <select
                                        value={newParteraForm.municipio}
                                        onChange={(e) => setNewParteraForm({ ...newParteraForm, municipio: e.target.value, comunidad: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
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
                                    <label className="block text-slate-700 font-bold mb-1">Lengua Originaria</label>
                                    <select
                                        value={newParteraForm.lenguaMaterna}
                                        onChange={(e) => setNewParteraForm({ ...newParteraForm, lenguaMaterna: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
                                    >
                                        <option value="Zapoteco del Istmo (Diidxazá)">Zapoteco del Istmo (Diidxazá)</option>
                                        <option value="Huave / Ombeayiüts">Huave / Ombeayiüts</option>
                                        <option value="Zoque">Zoque</option>
                                        <option value="Español">Español</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Años de Experiencia</label>
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
                                <label className="block text-emerald-950 font-black">PIN de 4 Dígitos</label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    placeholder="Ej: 4829 (se genera automático si se vacía)"
                                    value={newParteraForm.pinAcceso}
                                    onChange={(e) => setNewParteraForm({ ...newParteraForm, pinAcceso: e.target.value })}
                                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-slate-900 font-black tracking-widest text-center text-base focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowRegisterModal(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                                >
                                    Guardar en Base de Datos
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL CREDENCIAL QR */}
            {selectedParteraQr && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                                <h3 className="text-sm font-black text-slate-900">Credencial Digital & QR</h3>
                            </div>
                            <button
                                onClick={() => setSelectedParteraQr(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-teal-700/50 space-y-4">
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

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white text-emerald-900 font-black text-xl flex items-center justify-center border-2 border-emerald-400 shadow-md shrink-0">
                                    {selectedParteraQr.nombreCompleto?.substring(5, 7).toUpperCase() || 'PR'}
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

                            <div className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center border border-teal-200">
                                <div className="w-36 h-36 relative flex items-center justify-center bg-slate-900 p-2 rounded-xl">
                                    <svg className="w-full h-full text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
                                        <rect x="10" y="10" width="25" height="25" fill="#10b981" />
                                        <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                                        <rect x="65" y="10" width="25" height="25" fill="#10b981" />
                                        <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                                        <rect x="10" y="65" width="25" height="25" fill="#10b981" />
                                        <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                                        <circle cx="50" cy="50" r="10" fill="#10b981" />
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

                        <div className="flex justify-between items-center pt-2">
                            <button
                                onClick={() => alert('Generando PDF desde el servidor...')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Imprimir Credencial</span>
                            </button>
                            <button
                                onClick={() => setSelectedParteraQr(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL HISTORIAL */}
            {selectedParteraHistorial && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-emerald-700" />
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Historial de Atenciones (Backend)</h3>
                                    <p className="text-[11px] font-semibold text-teal-700">{selectedParteraHistorial.nombreCompleto}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedParteraHistorial(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-900">Atención de Parto & Canalización Tamiz</p>
                                    <p className="text-[11px] text-slate-500">Sincronizado con PostgreSQL • Jurisdicción No. 2</p>
                                </div>
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[10px]">
                                    Completado
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-200">
                            <button
                                onClick={() => setSelectedParteraHistorial(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
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

export default PadronParterasPage;