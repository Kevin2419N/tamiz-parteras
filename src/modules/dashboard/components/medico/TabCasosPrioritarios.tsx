import React, { useState, useMemo } from 'react';
import {
    Search,
    AlertTriangle,
    FlaskConical,
    CheckCircle2,
    Clock,
    X,
    FileText,
    Phone,
    MapPin,
    Calendar,
    ChevronRight,
    Syringe,
} from 'lucide-react';
import type { CasoPrioritario, RegistroSegundaMuestra, EstatusResultado } from './types';

// ─── Datos de demostración ───────────────────────────────────────────────────

const CASOS_DEMO: CasoPrioritario[] = [
    {
        id: 'CPR-001',
        folio: '5458347',
        nombreRN: 'RN Gómez Santiz',
        nombreMadre: 'María Gómez Santiz',
        clues: 'OCIMB000683',
        unidadMedica: 'Centro de Salud Urbano Juchitán',
        municipio: 'Juchitán de Zaragoza',
        fechaToma: '2026-10-01',
        tipoPrueba: 'TSH',
        estatusResultado: 'RESULTADO_SOSPECHOSO',
        valorObtenido: '25.4 mU/L',
        valorReferencia: '< 10 mU/L',
        observaciones: 'Resultado fuera de rango. Requiere confirmación venosa.',
        telefonoContacto: '9711234567',
    },
    {
        id: 'CPR-002',
        folio: '5458342',
        nombreRN: 'RN Vásquez Mendoza',
        nombreMadre: 'Diana Vásquez Mendoza',
        clues: 'OASIX003411',
        unidadMedica: 'Hospital General Ixtaltepec',
        municipio: 'Asunción Ixtaltepec',
        fechaToma: '2026-10-02',
        tipoPrueba: 'PKU',
        estatusResultado: 'MUESTRA_INADECUADA',
        observaciones: 'Muestra insuficiente de sangre en círculo Guthrie.',
        telefonoContacto: '9719876543',
    },
    {
        id: 'CPR-003',
        folio: '5458351',
        nombreRN: 'RN Ramírez López',
        nombreMadre: 'Carmen Ramírez López',
        clues: 'OASHG001245',
        unidadMedica: 'Hospital General Sto. Domingo Tehuantepec',
        municipio: 'Santo Domingo Tehuantepec',
        fechaToma: '2026-10-03',
        tipoPrueba: '17-OHP',
        estatusResultado: 'RETOMA_REQUERIDA',
        valorObtenido: '—',
        observaciones: 'Muestra rechazada por laboratorio: coagulación.',
        telefonoContacto: '9714561234',
    },
    {
        id: 'CPR-004',
        folio: '5458360',
        nombreRN: 'RN Hernández Cruz',
        nombreMadre: 'Laura Hernández Cruz',
        clues: 'OASCS002190',
        unidadMedica: 'Centro de Salud Salina Cruz',
        municipio: 'Salina Cruz',
        fechaToma: '2026-10-05',
        tipoPrueba: 'PANEL_COMPLETO',
        estatusResultado: 'EN_CONFIRMACION',
        valorObtenido: 'TSH: 18.2 mU/L',
        valorReferencia: '< 10 mU/L',
        observaciones: 'Muestra venosa enviada. Aguarda resultado confirmatorio.',
        telefonoContacto: '9718765432',
        tratamientoIniciado: false,
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEstatusBadge(estatus: EstatusResultado): React.ReactNode {
    const map: Record<EstatusResultado, { label: string; cls: string }> = {
        MUESTRA_INADECUADA: { label: 'Muestra Inadecuada', cls: 'bg-amber-100 text-amber-800 border border-amber-300' },
        RESULTADO_SOSPECHOSO: { label: 'Resultado Sospechoso', cls: 'bg-rose-100 text-rose-800 border border-rose-300' },
        RETOMA_REQUERIDA: { label: 'Re-toma Requerida', cls: 'bg-orange-100 text-orange-800 border border-orange-300' },
        MUESTRA_VENOSA_PENDIENTE: { label: 'Venosa Pendiente', cls: 'bg-purple-100 text-purple-800 border border-purple-300' },
        EN_CONFIRMACION: { label: 'En Confirmación', cls: 'bg-blue-100 text-blue-800 border border-blue-300' },
        CONFIRMADO_POSITIVO: { label: 'Confirmado Positivo', cls: 'bg-red-100 text-red-900 border border-red-400 font-black' },
        NORMAL: { label: 'Normal', cls: 'bg-emerald-100 text-emerald-800 border border-emerald-300' },
    };
    const { label, cls } = map[estatus];
    return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>{label}</span>;
}

// ─── Modal 2ª Muestra ─────────────────────────────────────────────────────────

interface Modal2MuestraProps {
    caso: CasoPrioritario;
    onClose: () => void;
    onSave: (data: RegistroSegundaMuestra) => void;
}

const Modal2Muestra: React.FC<Modal2MuestraProps> = ({ caso, onClose, onSave }) => {
    const [tipo, setTipo] = useState<RegistroSegundaMuestra['tipoMuestra']>('TALON_RETOMA');
    const [fechaObtension, setFechaObtension] = useState('');
    const [fechaEnvio, setFechaEnvio] = useState('');
    const [labDestino, setLabDestino] = useState('LESP Oaxaca');
    const [tratamiento, setTratamiento] = useState('');
    const [observaciones, setObservaciones] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            casoId: caso.id,
            tipoMuestra: tipo,
            fechaObtension,
            fechaEnvio,
            laboratorioDestino: labDestino,
            tratamientoIndicado: tratamiento,
            observacionesMedico: observaciones,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-black text-[#9D2449]">Registro de 2ª Muestra / Venosa Confirmatoria</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Folio <span className="font-bold text-slate-700">{caso.folio}</span> · {caso.nombreRN}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Tipo de Muestra</label>
                            <select
                                value={tipo}
                                onChange={e => setTipo(e.target.value as RegistroSegundaMuestra['tipoMuestra'])}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            >
                                <option value="TALON_RETOMA">Re-toma Talón (Guthrie)</option>
                                <option value="VENOSA_CONFIRMATORIA">Muestra Venosa Confirmatoria</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Prueba Objetivo</label>
                            <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-[#9D2449]">{caso.tipoPrueba}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Fecha Obtención</label>
                            <input type="date" required value={fechaObtension} onChange={e => setFechaObtension(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Fecha Envío Lab.</label>
                            <input type="date" required value={fechaEnvio} onChange={e => setFechaEnvio(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Laboratorio Destino</label>
                        <input type="text" value={labDestino} onChange={e => setLabDestino(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Tratamiento Indicado (si aplica)</label>
                        <input type="text" placeholder="Ej. Levotiroxina sódica 37.5 mcg/día" value={tratamiento} onChange={e => setTratamiento(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Observaciones del Médico</label>
                        <textarea rows={3} value={observaciones} onChange={e => setObservaciones(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449] resize-none" />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">
                            Cancelar
                        </button>
                        <button type="submit"
                            className="px-4 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xs font-bold rounded-xl flex items-center gap-2">
                            <Syringe className="w-3.5 h-3.5" />
                            Registrar y Enviar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export const TabCasosPrioritarios: React.FC = () => {
    const [busqueda, setBusqueda] = useState('');
    const [casoSeleccionado, setCasoSeleccionado] = useState<CasoPrioritario | null>(null);
    const [casos, setCasos] = useState<CasoPrioritario[]>(CASOS_DEMO);

    const casosFiltrados = useMemo(() => {
        if (!busqueda.trim()) return casos;
        const q = busqueda.toLowerCase();
        return casos.filter(c =>
            c.folio.includes(q) ||
            c.nombreMadre.toLowerCase().includes(q) ||
            c.clues.toLowerCase().includes(q) ||
            c.nombreRN.toLowerCase().includes(q)
        );
    }, [busqueda, casos]);

    const pendientes = casos.filter(c => c.estatusResultado !== 'NORMAL' && c.estatusResultado !== 'CONFIRMADO_POSITIVO').length;
    const inadecuadas = casos.filter(c => c.estatusResultado === 'MUESTRA_INADECUADA' || c.estatusResultado === 'RETOMA_REQUERIDA').length;
    const enConfirmacion = casos.filter(c => c.estatusResultado === 'EN_CONFIRMACION').length;

    const handleSave2Muestra = (data: RegistroSegundaMuestra) => {
        setCasos(prev => prev.map(c =>
            c.id === data.casoId
                ? { ...c, estatusResultado: 'EN_CONFIRMACION' as EstatusResultado }
                : c
        ));
    };

    return (
        <div className="space-y-6 mt-4">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Casos Pendientes', value: pendientes, icon: AlertTriangle, cls: 'bg-rose-50 border-rose-200 text-[#9D2449]' },
                    { label: 'Muestras Inadecuadas', value: inadecuadas, icon: FlaskConical, cls: 'bg-amber-50 border-amber-200 text-amber-700' },
                    { label: 'En Confirmación', value: enConfirmacion, icon: Clock, cls: 'bg-blue-50 border-blue-200 text-blue-700' },
                ].map(({ label, value, icon: Icon, cls }) => (
                    <div key={label} className={`flex items-center gap-4 p-4 rounded-2xl border ${cls} shadow-sm`}>
                        <div className="p-3 bg-white/60 rounded-xl shadow-sm">
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black">{value}</p>
                            <p className="text-[11px] font-bold opacity-75 leading-tight">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Buscador */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                    type="text"
                    placeholder="Buscar por Folio, CLUES o nombre de la madre..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-[#9D2449]/20"
                />
            </div>

            {/* Tabla */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full min-w-[700px] text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="text-left px-4 py-3 font-black">Folio / R.N.</th>
                            <th className="text-left px-4 py-3 font-black">Madre • CLUES</th>
                            <th className="text-left px-4 py-3 font-black">Prueba</th>
                            <th className="text-left px-4 py-3 font-black">Resultado</th>
                            <th className="text-left px-4 py-3 font-black">Estatus</th>
                            <th className="px-4 py-3 font-black">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {casosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-400 font-semibold">
                                    No se encontraron casos con los criterios de búsqueda.
                                </td>
                            </tr>
                        ) : (
                            casosFiltrados.map(caso => (
                                <tr key={caso.id} className="hover:bg-rose-50/40 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-black text-[#9D2449]">{caso.folio}</p>
                                        <p className="text-slate-500 text-[10px] mt-0.5">{caso.nombreRN}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-800">{caso.nombreMadre}</p>
                                        <div className="flex items-center gap-1 text-slate-400 text-[10px] mt-0.5">
                                            <MapPin className="w-3 h-3" />
                                            <span>{caso.clues}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-black text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">{caso.tipoPrueba}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-800">{caso.valorObtenido ?? '—'}</p>
                                        {caso.valorReferencia && (
                                            <p className="text-[10px] text-slate-400">Ref: {caso.valorReferencia}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getEstatusBadge(caso.estatusResultado)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {caso.estatusResultado !== 'NORMAL' && caso.estatusResultado !== 'EN_CONFIRMACION' && (
                                            <button
                                                onClick={() => setCasoSeleccionado(caso)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95"
                                            >
                                                <FlaskConical className="w-3 h-3" />
                                                2ª Muestra
                                            </button>
                                        )}
                                        {caso.estatusResultado === 'EN_CONFIRMACION' && (
                                            <span className="inline-flex items-center gap-1 text-blue-600 text-[10px] font-bold">
                                                <Clock className="w-3 h-3" /> En Lab.
                                            </span>
                                        )}
                                        {caso.estatusResultado === 'NORMAL' && (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detalle colapsable del caso al pasar el mouse */}
            {casosFiltrados.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#9D2449]" />
                        Leyenda de Acciones Requeridas
                    </p>
                    <div className="flex flex-wrap gap-3 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Resultado Sospechoso → Requiere muestra venosa confirmatoria</div>
                        <div className="flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5 text-amber-600" /> Muestra Inadecuada / Re-toma → Registrar 2ª toma en talón</div>
                        <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-blue-600" /> Contacto telefónico requerido</div>
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-600" /> Revisión de fecha toma</div>
                        <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-slate-500" /> Registro de alta con tratamiento</div>
                    </div>
                </div>
            )}

            {/* Modal 2ª Muestra */}
            {casoSeleccionado && (
                <Modal2Muestra
                    caso={casoSeleccionado}
                    onClose={() => setCasoSeleccionado(null)}
                    onSave={handleSave2Muestra}
                />
            )}
        </div>
    );
};
