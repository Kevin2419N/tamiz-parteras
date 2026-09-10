import React, { useState } from 'react';
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
    Send
} from 'lucide-react';

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

    // Modal state for viewing alert details
    const [selectedAlerta, setSelectedAlerta] = useState<AlertaOperativa | null>(null);
    const [notaInput, setNotaInput] = useState<string>('');

    // Mock Alertas Operativas (Istmo de Tehuantepec)
    const [alertas, setAlertas] = useState<AlertaOperativa[]>([
        {
            id: 'ALT-OAX-001',
            folioTamiz: 'TMZ-OAX-98214',
            titulo: 'RE-TOMA URGENTE: Muestra Insuficiente (TSH / Hipotiroidismo)',
            descripcion: 'El Laboratorio Estatal (LESP Oaxaca) reportó muestra con coagulación parcial y cantidad insuficiente de gotas. Se requiere re-toma inmediata antes del día 12 de vida.',
            tipo: 'URGENTE_RETOMA',
            nivel: 'CRITICAL',
            nombreMadre: 'María Elena Hernández Jiménez',
            nombreBebe: 'RN Mateo Hernández',
            comunidadIstmo: 'Juchitán de Zaragoza (Barrio Cheguigo)',
            telefonoContacto: '971 102 9988',
            responsableSalud: 'Centro de Salud Juchitán Centro',
            parteraComunitaria: 'Doña Rosa Santiz Gómez (Na Rosa)',
            fechaGeneracion: 'Hace 35 minutos',
            atendida: false,
            notasSeguimiento: '',
        },
        {
            id: 'ALT-OAX-002',
            folioTamiz: 'TMZ-OAX-98201',
            titulo: 'ALERTA DE VENCIMIENTO: Muestra Retenida > 72 horas',
            descripcion: 'La ficha de Guthrie tomada en la unidad médica no ha sido despachada a la Jurisdicción Sanitaria. Se aproxima al límite de tiempo para tamizaje oportuno.',
            tipo: 'VENCIMIENTO_MUESTRA',
            nivel: 'WARNING',
            nombreMadre: 'Juana Santiz Cruz',
            nombreBebe: 'RN Sofía Santiz',
            comunidadIstmo: 'Santo Domingo Tehuantepec',
            telefonoContacto: '971 554 1122',
            responsableSalud: 'CESSA Tehuantepec',
            parteraComunitaria: 'Doña Juana López Pérez (Na Juana)',
            fechaGeneracion: 'Hace 2 horas',
            atendida: false,
            notasSeguimiento: '',
        },
        {
            id: 'ALT-OAX-003',
            titulo: 'Referencia Comunitaria Emitida por Partera Tradicional',
            descripcion: 'Partera tradicional acreditada emitió referencia prioritaria por datos de alarma obstétrica y solicitó tamizado prioritario al nacimiento.',
            tipo: 'PARTERA_REFERENCIA',
            nivel: 'COMMUNITY',
            nombreMadre: 'Petrona Velasco Ruiz',
            nombreBebe: 'RN Petrona',
            comunidadIstmo: 'Ciudad Ixtepec',
            telefonoContacto: '971 712 4455',
            responsableSalud: 'Hospital Comunitario Ixtepec',
            parteraComunitaria: 'Doña Asunción Girón Morales (Na Chona)',
            fechaGeneracion: 'Ayer, 16:45',
            atendida: false,
            notasSeguimiento: 'Se agendó visita domiciliaria del personal de enfermería.',
        },
        {
            id: 'ALT-OAX-004',
            folioTamiz: 'TMZ-OAX-98190',
            titulo: 'RE-TOMA PROGRAMADA: Resultado Muestra Inconcluso',
            descripcion: 'Requiere segunda punción por interferencia analítica en laboratorio. Notificar a la madre para acudir al centro de salud.',
            tipo: 'URGENTE_RETOMA',
            nivel: 'CRITICAL',
            nombreMadre: 'Lucía Jiménez Toledo',
            nombreBebe: 'RN Jiménez',
            comunidadIstmo: 'Asunción Ixtaltepec',
            telefonoContacto: '971 822 6611',
            responsableSalud: 'Centro de Salud Ixtaltepec',
            parteraComunitaria: 'Doña Lucía Jiménez Toledo',
            fechaGeneracion: 'Hace 1 día',
            atendida: true,
            notasSeguimiento: 'Partera Na Lucía contactó a la familia. Re-toma efectuada el 08 de Septiembre.',
        },
        {
            id: 'ALT-OAX-005',
            folioTamiz: 'TMZ-OAX-98185',
            titulo: 'Confirmación de Envío a LESP Oaxaca',
            descripcion: 'Lote de 38 tarjetas de Guthrie del Istmo fue entregado con éxito al Laboratorio Estatal de Salud Pública.',
            tipo: 'INFORMATIVA',
            nivel: 'INFO',
            nombreMadre: 'Multicentro Istmo',
            comunidadIstmo: 'Salina Cruz / Tehuantepec',
            telefonoContacto: '971 332 9900',
            responsableSalud: 'Jurisdicción Sanitaria No. 2',
            fechaGeneracion: 'Hace 2 días',
            atendida: true,
            notasSeguimiento: '',
        },
    ]);

    const toggleAtendida = (id: string) => {
        setAlertas(
            alertas.map((a) => (a.id === id ? { ...a, atendida: !a.atendida } : a))
        );
    };

    const handleSaveNotas = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAlerta) return;

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
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
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
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${filtroTipo === item.id
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* LISTA DE TARJETAS INTERACTIVAS DE ALERTAS */}
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

                            {/* Información Principal Alerta */}
                            <div className="space-y-2 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    {getBadgeStyle(alerta.nivel)}
                                    {alerta.folioTamiz && (
                                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                            {alerta.folioTamiz}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-semibold text-slate-400">
                                        • {alerta.fechaGeneracion}
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

                                {/* Ficha de Paciente y Comunidad */}
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

                            {/* Botones de Acción Rápida */}
                            <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 justify-end">
                                <button
                                    onClick={() => {
                                        setSelectedAlerta(alerta);
                                        setNotaInput(alerta.notasSeguimiento || '');
                                    }}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <span>Ver Detalle</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>

                                <button
                                    onClick={() => alert(`Se ha agendado una visita / re-toma prioritaria para ${alerta.nombreMadre} en ${alerta.comunidadIstmo}.`)}
                                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Programar Visita</span>
                                </button>

                                <button
                                    onClick={() => toggleAtendida(alerta.id)}
                                    className={`px-3.5 py-2 font-bold text-xs rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${alerta.atendida
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
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Detalle Resumido del Caso */}
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

                        {/* Formulario de Notas de Seguimiento */}
                        <form onSubmit={handleSaveNotas} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">
                                    Notas de Seguimiento Clínico / Operativo *
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Escriba las acciones tomadas (ej: Se acudió al domicilio en Juchitán, se concertó cita para re-toma de muestra mañana a las 8:00 AM)..."
                                    value={notaInput}
                                    onChange={(e) => setNotaInput(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAlerta(null)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
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
