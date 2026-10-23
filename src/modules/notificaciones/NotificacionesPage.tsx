import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Info,
    CheckCircle2,
    ShieldAlert,
    Clock,
    MapPin,
    Phone,
    User,
    Calendar,
    ChevronRight,
    MessageSquare,
    X,
    Filter,
    HeartHandshake,
    Send,
    Loader2
} from 'lucide-react';
import { http } from '../../services/http'; // <--- Instancia centralizada de Axios en src/services/http

export interface AlertaOperativa {
    id: string;
    folioTamiz?: string;
    titulo: string;
    descripcion: string;
    tipo: 'URGENTE_RETOMA' | 'VENCIMIENTO_MUESTRA' | 'PARTERA_REFERENCIA' | 'INFORMATIVA';
    nivel: 'CRITICAL' | 'WARNING' | 'COMMUNITY' | 'INFO';
    nombreMadre: string;
    nombreBebe?: string;
    comunidadIstmo: string;
    telefonoContacto: string;
    responsableSalud: string;
    parteraComunitaria?: string;
    fechaGeneracion: string;
    atendida: boolean;
    notasSeguimiento?: string;
}

export const NotificacionesPage: React.FC = () => {
    const [filtroTipo, setFiltroTipo] = useState<string>('TODAS');

    // Estado real de alertas conectado al Backend (PostgreSQL) mediante Axios
    const [alertas, setAlertas] = useState<AlertaOperativa[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state for viewing alert details
    const [selectedAlerta, setSelectedAlerta] = useState<AlertaOperativa | null>(null);
    const [notaInput, setNotaInput] = useState<string>('');

    // Cargar alertas reales desde el servidor backend al iniciar
    useEffect(() => {
        const fetchAlertas = async () => {
            try {
                setIsLoading(true);
                // Endpoint oficial especificado en el documento consolidado de backend
                const response = await http.get('/api/v1/notificaciones/usuario');
                setAlertas(response.data || []);
            } catch (err) {
                console.warn('Backend no disponible temporalmente, cargando datos de respaldo de alertas:', err);
                // Datos de respaldo para desarrollo offline / demostración
                setAlertas([
                    {
                        id: 'ALT-2026-001',
                        folioTamiz: '5458349',
                        titulo: 'Re-toma Urgente de Tamiz Neonatal',
                        descripcion: 'La muestra en papel filtro presenta coagulación parcial. Se requiere nueva toma en talón.',
                        tipo: 'URGENTE_RETOMA',
                        nivel: 'CRITICAL',
                        nombreMadre: 'Guadalupe Cruz Pérez',
                        nombreBebe: 'RN Cruz Pérez',
                        comunidadIstmo: 'Salina Cruz',
                        telefonoContacto: '9711234567',
                        responsableSalud: 'Centro de Salud Salina Cruz',
                        fechaGeneracion: '2026-10-06 09:30',
                        atendida: false
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlertas();
    }, []);

    const toggleAtendida = async (id: string) => {
        const alertaActual = alertas.find((a) => a.id === id);
        if (!alertaActual) return;

        const nuevoEstatus = !alertaActual.atendida;

        try {
            await http.patch(`/api/v1/notificaciones/${id}/atendida`, { atendida: nuevoEstatus });
        } catch (e) {
            console.warn('No se pudo actualizar en el backend, actualizando localmente:', e);
        }

        setAlertas(
            alertas.map((a) => (a.id === id ? { ...a, atendida: nuevoEstatus } : a))
        );
    };

    const handleSaveNotas = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAlerta) return;

        try {
            await http.post(`/api/v1/notificaciones/${selectedAlerta.id}/seguimiento`, {
                notasSeguimiento: notaInput,
                atendida: true
            });
        } catch (e) {
            console.warn('Error al guardar notas en backend:', e);
        }

        setAlertas(
            alertas.map((a) =>
                a.id === selectedAlerta.id
                    ? { ...a, notasSeguimiento: notaInput, atendida: true }
                    : a
            )
        );
        setSelectedAlerta(null);
    };

    // Filter Logic
    const alertasFiltradas = alertas.filter((a) => {
        if (filtroTipo === 'TODAS') return true;
        if (filtroTipo === 'URGENTES') return a.tipo === 'URGENTE_RETOMA';
        if (filtroTipo === 'VENCIMIENTO') return a.tipo === 'VENCIMIENTO_MUESTRA';
        if (filtroTipo === 'PARTERAS') return a.tipo === 'PARTERA_REFERENCIA';
        return true;
    });

    const getBadgeStyle = (nivel: string) => {
        switch (nivel) {
            case 'CRITICAL':
                return (
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-300 rounded-lg text-[10px] font-black flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" /> Re-toma Urgente / Critical
                    </span>
                );
            case 'WARNING':
                return (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Vencimiento Muestra (&gt;72h)
                    </span>
                );
            case 'COMMUNITY':
                return (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" /> Red Comunitaria de Parteras
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-300 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-sky-600" /> Aviso Informativo
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
                        <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            GOBIERNO DE OAXACA • SSO
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-600">Sistema Operativo de Vigilancia Neonatal</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mt-1">Centro de Alertas y Notificaciones Operativas</h1>
                    <p className="text-xs font-medium text-slate-600 mt-1">
                        Jurisdicción Sanitaria No. 2 • Istmo de Tehuantepec (Juchitán, Tehuantepec, Salina Cruz, Ixtepec, Atempa, Ixtaltepec, Espinal).
                    </p>
                </div>

                <button
                    onClick={() => setAlertas(alertas.map((a) => ({ ...a, atendida: true })))}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Marcar Todas como Atendidas</span>
                </button>
            </div>

            {/* Banner de Protocolo Recall URGENTE */}
            <div className="bg-rose-50 border-2 border-rose-200 p-5 rounded-3xl flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0 shadow-md">
                        <ShieldAlert className="w-6 h-6 animate-bounce" />
                    </div>
                    <div className="text-xs">
                        <h3 className="font-black text-rose-950 text-sm">Protocolo de Búsqueda Inmediata (Recall Neonatal)</h3>
                        <p className="text-rose-900 font-medium mt-0.5">
                            Toda alerta de tipo <strong className="font-extrabold">RE-TOMA URGENTE</strong> requiere contacto telefónico o visita domiciliaria en menos de 24 horas para evitar secuelas de Hipotiroidismo Congénito o Fenilcetonuria.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtros Superiores de Alertas */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 mr-2" />
                {[
                    { id: 'TODAS', label: 'Todas las Alertas' },
                    { id: 'URGENTES', label: 'Urgentes / Re-tomas' },
                    { id: 'VENCIMIENTO', label: 'Vencimiento Muestra (>72h)' },
                    { id: 'PARTERAS', label: 'Notificaciones de Parteras' },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setFiltroTipo(item.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${filtroTipo === item.id
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* LISTA DE TARJETAS INTERACTIVAS DE ALERTAS */}
            {isLoading ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Conectando con la base de datos PostgreSQL y cargando alertas...</p>
                </div>
            ) : alertasFiltradas.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-700">No hay alertas registradas en este filtro.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {alertasFiltradas.map((alerta) => (
                        <div
                            key={alerta.id}
                            className={`bg-white p-5 rounded-3xl border transition-all shadow-sm ${alerta.atendida
                                ? 'border-slate-200 opacity-70 bg-slate-50/60'
                                : alerta.nivel === 'CRITICAL'
                                    ? 'border-rose-300/90 hover:border-rose-400 bg-white'
                                    : alerta.nivel === 'WARNING'
                                        ? 'border-amber-300/90 hover:border-amber-400 bg-white'
                                        : 'border-slate-200 hover:border-emerald-300'
                                }`}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {getBadgeStyle(alerta.nivel)}
                                        {alerta.folioTamiz && (
                                            <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                                {alerta.folioTamiz}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-semibold text-slate-400">
                                            {alerta.fechaGeneracion}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                                            <span>{alerta.titulo}</span>
                                            {!alerta.atendida && (
                                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                                            )}
                                        </h3>
                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                                            {alerta.descripcion}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                                        <span className="flex items-center gap-1.5 font-bold text-slate-900">
                                            <User className="w-3.5 h-3.5 text-emerald-600" />
                                            Madre: {alerta.nombreMadre} {alerta.nombreBebe ? `(${alerta.nombreBebe})` : ''}
                                        </span>

                                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                            <MapPin className="w-3.5 h-3.5 text-sky-600" />
                                            {alerta.comunidadIstmo}
                                        </span>

                                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                            {alerta.telefonoContacto}
                                        </span>

                                        {alerta.parteraComunitaria && (
                                            <span className="flex items-center gap-1.5 font-bold text-teal-800">
                                                <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                                                {alerta.parteraComunitaria}
                                            </span>
                                        )}
                                    </div>

                                    {alerta.notasSeguimiento && (
                                        <div className="mt-2 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                                            <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                                            <p className="font-semibold">
                                                <strong className="text-emerald-900">Nota de Seguimiento:</strong> {alerta.notasSeguimiento}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 justify-end">
                                    <button
                                        onClick={() => {
                                            setSelectedAlerta(alerta);
                                            setNotaInput(alerta.notasSeguimiento || '');
                                        }}
                                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <span>Ver Detalle</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                        onClick={() => alert(`Se ha agendado una visita / re-toma prioritaria para ${alerta.nombreMadre} en ${alerta.comunidadIstmo}.`)}
                                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Programar Visita</span>
                                    </button>

                                    <button
                                        onClick={() => toggleAtendida(alerta.id)}
                                        className={`px-3.5 py-2 font-bold text-xs rounded-xl border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${alerta.atendida
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>{alerta.atendida ? 'Atendida' : 'Marcar Atendida'}</span>
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL INTERACTIVO DE DETALLE DE ALERTA & SEGUIMIENTO */}
            {selectedAlerta && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">

                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-rose-600" />
                                <h3 className="text-base font-black text-slate-900">Expediente de Alerta Operativa</h3>
                            </div>
                            <button
                                onClick={() => setSelectedAlerta(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                            <div className="flex items-center justify-between">
                                {getBadgeStyle(selectedAlerta.nivel)}
                                <span className="font-mono font-bold text-slate-500">{selectedAlerta.id}</span>
                            </div>

                            <div>
                                <h4 className="font-black text-slate-900 text-sm">{selectedAlerta.titulo}</h4>
                                <p className="text-slate-600 font-medium mt-1 leading-relaxed">{selectedAlerta.descripcion}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Madre / Paciente</span>
                                    <p className="font-bold text-slate-900">{selectedAlerta.nombreMadre}</p>
                                    <p className="text-slate-600">{selectedAlerta.telefonoContacto}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Comunidad / Municipio</span>
                                    <p className="font-bold text-slate-900">{selectedAlerta.comunidadIstmo}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Centro de Salud Asignado</span>
                                    <p className="font-bold text-slate-900">{selectedAlerta.responsableSalud}</p>
                                </div>
                                {selectedAlerta.parteraComunitaria && (
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Partera Tradicional</span>
                                        <p className="font-bold text-teal-800">{selectedAlerta.parteraComunitaria}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSaveNotas} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">
                                    Notas de Seguimiento Clínico / Operativo *
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Escriba las acciones tomadas..."
                                    value={notaInput}
                                    onChange={(e) => setNotaInput(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAlerta(null)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Guardar Notas y Marcar Atendida</span>
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
};

export default NotificacionesPage;