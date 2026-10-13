import React, { useState, useRef } from 'react';
import {
    HeartHandshake,
    Search,
    FileText,
    Printer,
    CheckCircle2,
    Clock,
    AlertTriangle,
    X,
    ChevronRight,
    MapPin,
    User,
    Building2,
} from 'lucide-react';
import type { ReferenciaComunidad, FormularioContraRef, EstatusContraRef } from './types';

// ─── Datos de demostración ────────────────────────────────────────────────────

const REFERENCIAS_DEMO: ReferenciaComunidad[] = [
    {
        id: 'REF-001',
        folioReferencia: 'REF-JS2-2026-1041',
        nombrePartera: 'Doña Rosa Santiz Gómez',
        comunidadOrigen: 'San Blas Atempa',
        municipio: 'San Blas Atempa',
        nombrePaciente: 'Concepción Ruiz Atempa',
        edadPaciente: 26,
        motivoReferencia: 'Tensión arterial elevada: 150/100 mmHg. Edema de miembros inferiores ++.',
        nivelRiesgo: 'ALTO',
        fechaReferencia: '2026-10-05',
        fechaRecepcion: '2026-10-06',
        estatusContraRef: 'PENDIENTE_ATENCION',
    },
    {
        id: 'REF-002',
        folioReferencia: 'REF-JS2-2026-1038',
        nombrePartera: 'Doña Juana López Pérez',
        comunidadOrigen: 'Asunción Ixtaltepec',
        municipio: 'Asunción Ixtaltepec',
        nombrePaciente: 'Sara Hernández Cruz',
        edadPaciente: 19,
        motivoReferencia: 'Sangrado transvaginal escaso. Dolor pélvico intermitente. EG: 12 semanas.',
        nivelRiesgo: 'MEDIO',
        fechaReferencia: '2026-10-03',
        fechaRecepcion: '2026-10-04',
        estatusContraRef: 'EN_VALORACION',
        diagnosticoMedico: 'Amenaza de aborto. Útero gestante 12 semanas.',
        planManejo: 'Reposo absoluto, progesterona vaginal 200 mg/día. Control en 7 días.',
    },
    {
        id: 'REF-003',
        folioReferencia: 'REF-JS2-2026-1030',
        nombrePartera: 'Doña Antonia García Toledo',
        comunidadOrigen: 'Santo Domingo Chihuitán',
        municipio: 'Santo Domingo Chihuitán',
        nombrePaciente: 'Lucía Morales Vásquez',
        edadPaciente: 31,
        motivoReferencia: 'Sospecha de diabetes gestacional. Resultado de glucosa ayuno: 128 mg/dL.',
        nivelRiesgo: 'MEDIO',
        fechaReferencia: '2026-09-28',
        fechaRecepcion: '2026-09-29',
        estatusContraRef: 'ATENDIDA',
        diagnosticoMedico: 'Diabetes gestacional confirmada por CTOG 75g.',
        planManejo: 'Dieta ADA. Monitoreo domiciliario de glucosa. Valoración nutricional.',
        folioContraRef: 'CREF-JS2-2026-0822',
        medicoResponsable: 'Dr. Jorge Ruiz Pérez',
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEstatusContaRefBadge(estatus: EstatusContraRef): React.ReactNode {
    const map: Record<EstatusContraRef, { label: string; cls: string; icon: React.ReactNode }> = {
        PENDIENTE_ATENCION: { label: 'Pendiente de Atención', cls: 'bg-rose-100 text-rose-800 border-rose-300', icon: <AlertTriangle className="w-3 h-3" /> },
        EN_VALORACION: { label: 'En Valoración', cls: 'bg-amber-100 text-amber-800 border-amber-300', icon: <Clock className="w-3 h-3" /> },
        ATENDIDA: { label: 'Atendida', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: <CheckCircle2 className="w-3 h-3" /> },
        DERIVADA_HOSPITAL: { label: 'Derivada a Hospital', cls: 'bg-blue-100 text-blue-800 border-blue-300', icon: <Building2 className="w-3 h-3" /> },
    };
    const { label, cls, icon } = map[estatus];
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cls}`}>
            {icon}{label}
        </span>
    );
}

function getRiesgoBadge(nivel: ReferenciaComunidad['nivelRiesgo']): React.ReactNode {
    const map = {
        BAJO: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        MEDIO: 'bg-amber-100 text-amber-800 border-amber-300',
        ALTO: 'bg-rose-100 text-rose-900 border-rose-400',
        CRITICO: 'bg-red-100 text-red-900 border-red-500 font-black',
    };
    return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[nivel]}`}>{nivel}</span>;
}

// ─── Modal / Formulario de Contrareferencia ───────────────────────────────────

interface ModalContraRefProps {
    referencia: ReferenciaComunidad;
    onClose: () => void;
    onEmitir: (data: FormularioContraRef) => void;
}

const ModalFormContraRef: React.FC<ModalContraRefProps> = ({ referencia, onClose, onEmitir }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [form, setForm] = useState<FormularioContraRef>({
        referenciaId: referencia.id,
        folioContraRef: `CREF-JS2-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        fechaAtencion: new Date().toISOString().split('T')[0],
        diagnosticoImpresion: referencia.diagnosticoMedico ?? '',
        hallazgosClinica: '',
        planManejo: referencia.planManejo ?? '',
        medicamentosIndicados: '',
        proximaCita: '',
        derivadaA: '',
        nivelDerivacion: undefined,
        medicoFirma: 'Dr. Jorge Ruiz Pérez',
        cedulaProfesional: '8923456',
        cluesUnidadEmisora: 'OCIMB000683',
    });

    const handleChange = (key: keyof FormularioContraRef, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleImprimir = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl" ref={printRef}>
                {/* Cabecera del modal */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 no-print">
                    <div>
                        <h3 className="text-sm font-black text-[#9D2449]">Formulario de Contrareferencia Médica Oficial</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Folio: <span className="font-bold text-slate-700">{form.folioContraRef}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"><X className="w-4 h-4" /></button>
                </div>

                {/* Encabezado de impresión (solo visible al imprimir) */}
                <div className="only-print p-4 border-b border-slate-300 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">SERVICIOS DE SALUD DE OAXACA • JURISDICCIÓN SANITARIA NO. 2</p>
                    <h2 className="text-base font-black text-[#9D2449] mt-1">HOJA OFICIAL DE CONTRAREFERENCIA MÉDICA</h2>
                    <p className="text-xs text-slate-600">Folio: {form.folioContraRef} · Fecha: {form.fechaAtencion}</p>
                </div>

                <div className="p-5 space-y-4">
                    {/* Datos del paciente (read-only) */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Paciente</p>
                            <p className="font-bold text-slate-900">{referencia.nombrePaciente} · {referencia.edadPaciente} años</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Comunidad de Origen</p>
                            <p className="font-bold text-slate-900">{referencia.comunidadOrigen}, {referencia.municipio}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Referida Por</p>
                            <p className="font-bold text-slate-900">{referencia.nombrePartera}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Motivo de Referencia</p>
                            <p className="font-medium text-slate-700">{referencia.motivoReferencia}</p>
                        </div>
                    </div>

                    {/* Campos del formulario */}
                    <div className="space-y-3">
                        {[
                            { label: 'Diagnóstico / Impresión Diagnóstica', key: 'diagnosticoImpresion', multiline: false },
                            { label: 'Hallazgos a la Exploración Clínica', key: 'hallazgosClinica', multiline: true },
                            { label: 'Plan de Manejo Médico', key: 'planManejo', multiline: true },
                            { label: 'Medicamentos Indicados', key: 'medicamentosIndicados', multiline: false },
                            { label: 'Próxima Cita / Seguimiento', key: 'proximaCita', multiline: false },
                            { label: 'Derivada A (si aplica)', key: 'derivadaA', multiline: false },
                        ].map(({ label, key, multiline }) => (
                            <div key={key}>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                                {multiline ? (
                                    <textarea
                                        rows={2}
                                        value={form[key as keyof FormularioContraRef] as string ?? ''}
                                        onChange={e => handleChange(key as keyof FormularioContraRef, e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449] resize-none"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={form[key as keyof FormularioContraRef] as string ?? ''}
                                        onChange={e => handleChange(key as keyof FormularioContraRef, e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Firma médica */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Médico Responsable', key: 'medicoFirma' },
                            { label: 'Cédula Profesional', key: 'cedulaProfesional' },
                            { label: 'CLUES Unidad Emisora', key: 'cluesUnidadEmisora' },
                        ].map(({ label, key }) => (
                            <div key={key}>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                                <input
                                    type="text"
                                    value={form[key as keyof FormularioContraRef] as string ?? ''}
                                    onChange={e => handleChange(key as keyof FormularioContraRef, e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Espacio firma impresa */}
                    <div className="only-print mt-8 flex justify-end">
                        <div className="border-t border-slate-400 w-48 pt-1 text-center text-[10px] text-slate-600">
                            Firma y Sello del Médico<br />{form.medicoFirma}<br />Cédula: {form.cedulaProfesional}
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex justify-between items-center p-5 border-t border-slate-200 no-print gap-3 flex-wrap">
                    <button onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">
                        Cancelar
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={handleImprimir}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Imprimir / PDF Oficial SSO
                        </button>
                        <button
                            onClick={() => { onEmitir(form); onClose(); }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xs font-bold rounded-xl"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Emitir Contrareferencia
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export const TabContrareferencias: React.FC = () => {
    const [busqueda, setBusqueda] = useState('');
    const [referencias, setReferencias] = useState<ReferenciaComunidad[]>(REFERENCIAS_DEMO);
    const [referenciaSeleccionada, setReferenciaSeleccionada] = useState<ReferenciaComunidad | null>(null);

    const refFiltradas = referencias.filter(r => {
        const q = busqueda.toLowerCase();
        return !q || r.nombrePaciente.toLowerCase().includes(q) ||
            r.folioReferencia.toLowerCase().includes(q) ||
            r.nombrePartera.toLowerCase().includes(q) ||
            r.municipio.toLowerCase().includes(q);
    });

    const handleEmitir = (data: FormularioContraRef) => {
        setReferencias(prev => prev.map(r =>
            r.id === data.referenciaId
                ? {
                    ...r,
                    estatusContraRef: 'ATENDIDA' as EstatusContraRef,
                    diagnosticoMedico: data.diagnosticoImpresion,
                    planManejo: data.planManejo,
                    folioContraRef: data.folioContraRef,
                    medicoResponsable: data.medicoFirma,
                }
                : r
        ));
    };

    const pendientes = referencias.filter(r => r.estatusContraRef === 'PENDIENTE_ATENCION').length;
    const atendidas = referencias.filter(r => r.estatusContraRef === 'ATENDIDA').length;

    return (
        <div className="space-y-6 mt-4">
            {/* Estilos @media print */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .print-scope, .print-scope * { visibility: visible !important; }
                    .no-print { display: none !important; }
                    .only-print { display: block !important; }
                    @page { margin: 1.5cm; size: A4; }
                }
                .only-print { display: none; }
            `}</style>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Referencias Recibidas', value: referencias.length, cls: 'bg-slate-50 border-slate-200 text-slate-700', icon: HeartHandshake },
                    { label: 'Pendientes de Atención', value: pendientes, cls: 'bg-rose-50 border-rose-200 text-[#9D2449]', icon: AlertTriangle },
                    { label: 'Atendidas y Documentadas', value: atendidas, cls: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: CheckCircle2 },
                ].map(({ label, value, cls, icon: Icon }) => (
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
                    placeholder="Buscar por paciente, folio, partera o municipio..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-[#9D2449]/20"
                />
            </div>

            {/* Bandeja de referencias */}
            <div className="space-y-3">
                {refFiltradas.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-semibold text-sm">Sin referencias que coincidan con la búsqueda.</div>
                ) : (
                    refFiltradas.map(ref => (
                        <div key={ref.id} className={`border rounded-2xl p-4 transition-all hover:shadow-md ${ref.estatusContraRef === 'PENDIENTE_ATENCION'
                            ? 'border-rose-200 bg-rose-50/40'
                            : ref.estatusContraRef === 'ATENDIDA'
                                ? 'border-emerald-200 bg-emerald-50/30'
                                : 'border-slate-200 bg-white'
                            }`}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-black text-slate-400">{ref.folioReferencia}</span>
                                        {getEstatusContaRefBadge(ref.estatusContraRef)}
                                        {getRiesgoBadge(ref.nivelRiesgo)}
                                    </div>
                                    <p className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        {ref.nombrePaciente} · {ref.edadPaciente} años
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <HeartHandshake className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                        {ref.nombrePartera}
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        {ref.comunidadOrigen}, {ref.municipio}
                                    </p>
                                    <p className="text-xs text-slate-600 font-medium mt-1 max-w-lg">{ref.motivoReferencia}</p>
                                    {ref.diagnosticoMedico && (
                                        <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {ref.diagnosticoMedico}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    {ref.estatusContraRef !== 'ATENDIDA' && (
                                        <button
                                            onClick={() => setReferenciaSeleccionada(ref)}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            Emitir Contrareferencia
                                        </button>
                                    )}
                                    {ref.folioContraRef && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Folio: {ref.folioContraRef}
                                        </div>
                                    )}
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Recibida: {ref.fechaRecepcion ?? ref.fechaReferencia}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Nota informativa */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-[#9D2449] shrink-0 mt-0.5" />
                <p>
                    Las contrareferencias emitidas tienen número de folio oficial SSO y pueden imprimirse en formato A4.
                    El botón <span className="font-black text-slate-700">Imprimir / PDF Oficial SSO</span> aplica reglas CSS
                    <code className="bg-slate-100 border border-slate-300 rounded px-1 mx-0.5">@media print</code>
                    para ocultar la interfaz y mostrar únicamente el documento de contrareferencia institucional.
                </p>
            </div>

            {/* Modal */}
            {referenciaSeleccionada && (
                <ModalFormContraRef
                    referencia={referenciaSeleccionada}
                    onClose={() => setReferenciaSeleccionada(null)}
                    onEmitir={handleEmitir}
                />
            )}
        </div>
    );
};
