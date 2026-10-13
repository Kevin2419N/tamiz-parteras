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
    ChevronDown,
    MapPin,
    User,
    Building2,
    Stethoscope,
    Pill,
    Navigation,
} from 'lucide-react';
import type { ReferenciaComunidad, FormularioContraRef, EstatusContraRef } from './types';

// ─── Catálogo CIE-10 Obstétrico/Ginecológico (resumen clínico frecuente) ──────

const CIE10_CATALOGO = [
    { codigo: 'O10', desc: 'Hipertensión preexistente que complica el embarazo' },
    { codigo: 'O11', desc: 'Trastorno hipertensivo preexistente con proteinuria sobreañadida' },
    { codigo: 'O13', desc: 'Hipertensión gestacional (inducida por el embarazo)' },
    { codigo: 'O14', desc: 'Preeclampsia' },
    { codigo: 'O14.1', desc: 'Preeclampsia grave' },
    { codigo: 'O15', desc: 'Eclampsia' },
    { codigo: 'O20', desc: 'Hemorragia precoz del embarazo / Amenaza de aborto' },
    { codigo: 'O21', desc: 'Vómitos excesivos del embarazo / Hiperémesis gravídica' },
    { codigo: 'O24', desc: 'Diabetes mellitus en el embarazo (gestacional)' },
    { codigo: 'O26', desc: 'Atención materna por otras complicaciones del embarazo' },
    { codigo: 'O30', desc: 'Embarazo múltiple' },
    { codigo: 'O32', desc: 'Atención materna por presentación anormal del feto' },
    { codigo: 'O33', desc: 'Atención materna por desproporción pélvica' },
    { codigo: 'O36', desc: 'Atención materna por otros problemas fetales conocidos o presuntos' },
    { codigo: 'O41', desc: 'Oligohidramnios / Polihidramnios' },
    { codigo: 'O42', desc: 'Ruptura prematura de membranas' },
    { codigo: 'O43', desc: 'Placenta previa / Desprendimiento prematuro de placenta' },
    { codigo: 'O60', desc: 'Amenaza de trabajo de parto prematuro' },
    { codigo: 'O62', desc: 'Disfunción del trabajo de parto (inercia uterina)' },
    { codigo: 'O82', desc: 'Parto por cesárea electiva o de urgencia' },
    { codigo: 'O90', desc: 'Complicaciones del puerperio' },
    { codigo: 'O99', desc: 'Otras enfermedades maternas clasificadas en otra parte que complican el embarazo' },
    { codigo: 'Z34', desc: 'Supervisión de embarazo normal' },
    { codigo: 'Z35', desc: 'Supervisión de embarazo de alto riesgo (ARO)' },
    { codigo: 'Z36', desc: 'Detección prenatal' },
];

const UNIDADES_DESTINO = [
    'CSU Juchitán de Zaragoza',
    'Hospital General Ixtepec (HGIX)',
    'Hospital General Santo Domingo Tehuantepec',
    'Hospital Regional de Alta Especialidad de Oaxaca (HRAEO)',
    'IMSS Juchitán — UMF No. 33',
    'Hospital de la Mujer y el Niño SSO Oaxaca',
    'Centro de Salud Rural San Blas Atempa',
    'Otro (especificar en conducta médica)',
];

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

// ─── Selector CIE-10 ────────────────────────────────────────────────────────

interface Cie10SelectorProps {
    value: string;
    onChange: (val: string) => void;
}

const Cie10Selector: React.FC<Cie10SelectorProps> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const filtrados = CIE10_CATALOGO.filter(item =>
        !query || item.codigo.toLowerCase().includes(query.toLowerCase()) || item.desc.toLowerCase().includes(query.toLowerCase())
    );
    return (
        <div className="relative">
            <button type="button"
                onClick={() => setOpen(v => !v)}
                className={`w-full flex items-center justify-between bg-slate-50 border rounded-xl px-3 py-2 text-xs text-left transition-colors ${open ? 'border-[#9D2449]' : 'border-slate-300 hover:border-slate-400'}`}>
                <span className={value ? 'font-bold text-slate-900' : 'text-slate-400'}>
                    {value || 'Seleccionar código CIE-10…'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                        <input autoFocus type="text" placeholder="Buscar código o diagnóstico…"
                            value={query} onChange={e => setQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filtrados.map(item => (
                            <button key={item.codigo} type="button"
                                onClick={() => { onChange(`${item.codigo} — ${item.desc}`); setOpen(false); setQuery(''); }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-rose-50 transition-colors flex items-start gap-2">
                                <span className="font-black text-[#9D2449] shrink-0 mt-0.5">{item.codigo}</span>
                                <span className="text-slate-700">{item.desc}</span>
                            </button>
                        ))}
                        {filtrados.length === 0 && (
                            <p className="text-center py-4 text-slate-400 text-[10px]">Sin resultados para "{query}"</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

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
        codigoCie10: '',
        diagnosticoImpresion: referencia.diagnosticoMedico ?? '',
        hallazgosClinica: '',
        planManejo: referencia.planManejo ?? '',
        conductaMedica: '',
        medicamentosIndicados: '',
        proximaCita: '',
        derivadaA: '',
        unidadDestino: '',
        nivelDerivacion: 'SIN_DERIVACION',
        medicoFirma: 'Dr. Jorge Ruiz Pérez',
        cedulaProfesional: '8923456',
        cluesUnidadEmisora: 'OCIMB000683',
    });

    const handleChange = (key: keyof FormularioContraRef, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const niveles: Record<NonNullable<FormularioContraRef['nivelDerivacion']>, string> = {
        SIN_DERIVACION: 'Sin derivación',
        CSU: '1er Nivel (CSU)',
        HOSPITAL_GENERAL: '2do Nivel (HG)',
        ESPECIALIDAD: '3er Nivel (Especialidad)',
        OTRO: 'Otro',
    };

    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .print-contraref, .print-contraref * { visibility: visible !important; }
                    .print-contraref { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; }
                    .no-print { display: none !important; }
                    .only-print { display: block !important; }
                    @page { margin: 1.5cm; size: A4; }
                }
                .only-print { display: none; }
            `}</style>

            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
                <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl my-4 print-contraref" ref={printRef}>
                    {/* Header no-print */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-100 no-print">
                        <div>
                            <h3 className="text-sm font-black text-[#9D2449]">Formulario Oficial de Contrareferencia Médica SSO</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                Folio: <span className="font-black text-slate-700">{form.folioContraRef}</span> · Jurisdicción Sanitaria No. 2 Istmo
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Encabezado oficial — solo visible en impresión */}
                    <div className="only-print p-5 border-b-2 border-[#9D2449] text-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            SERVICIOS DE SALUD DE OAXACA • JURISDICCIÓN SANITARIA NO. 2 — ISTMO DE TEHUANTEPEC
                        </p>
                        <h2 className="text-base font-black text-[#9D2449] mt-1">HOJA OFICIAL DE CONTRAREFERENCIA MÉDICA</h2>
                        <p className="text-xs text-slate-600">Folio: {form.folioContraRef} · Fecha: {form.fechaAtencion} · CLUES: {form.cluesUnidadEmisora}</p>
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
                                <p className="font-medium text-slate-700 leading-snug">{referencia.motivoReferencia}</p>
                            </div>
                        </div>

                        {/* Diagnóstico CIE-10 */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                <Stethoscope className="w-3 h-3 inline mr-1 text-[#9D2449]" />
                                Código CIE-10 — Diagnóstico Principal
                            </label>
                            <Cie10Selector
                                value={form.codigoCie10 ?? ''}
                                onChange={val => handleChange('codigoCie10', val)}
                            />
                        </div>

                        {/* Impresión diagnóstica */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                Impresión Diagnóstica Completa
                            </label>
                            <input type="text"
                                value={form.diagnosticoImpresion}
                                onChange={e => handleChange('diagnosticoImpresion', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                        </div>

                        {/* Hallazgos */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                Hallazgos a la Exploración Clínica
                            </label>
                            <textarea rows={2}
                                value={form.hallazgosClinica}
                                onChange={e => handleChange('hallazgosClinica', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449] resize-none" />
                        </div>

                        {/* Plan de manejo y conducta médica — 2 columnas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                    Plan de Manejo Médico
                                </label>
                                <textarea rows={3}
                                    value={form.planManejo}
                                    onChange={e => handleChange('planManejo', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449] resize-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                    <Pill className="w-3 h-3 inline mr-1 text-blue-600" />
                                    Plan Farmacológico / Conducta Médica
                                </label>
                                <textarea rows={3}
                                    value={form.conductaMedica ?? ''}
                                    onChange={e => handleChange('conductaMedica', e.target.value)}
                                    placeholder="Ej. Metildopa 250mg c/8h, reposo relativo, control en 48h con tira de TA…"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449] resize-none" />
                            </div>
                        </div>

                        {/* Medicamentos */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                Medicamentos Indicados (nombre, dosis, vía, duración)
                            </label>
                            <input type="text"
                                value={form.medicamentosIndicados}
                                onChange={e => handleChange('medicamentosIndicados', e.target.value)}
                                placeholder="Ej. Metildopa 500mg VO c/8h x 30 días · Ácido fólico 5mg VO/día"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                        </div>

                        {/* Nivel de derivación */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                <Navigation className="w-3 h-3 inline mr-1 text-slate-500" />
                                Nivel de Derivación
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {(Object.entries(niveles) as [NonNullable<FormularioContraRef['nivelDerivacion']>, string][]).map(([key, label]) => (
                                    <button key={key} type="button"
                                        onClick={() => setForm(prev => ({ ...prev, nivelDerivacion: key }))}
                                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${form.nivelDerivacion === key
                                            ? 'bg-[#9D2449] border-[#9D2449] text-white'
                                            : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-[#9D2449]'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Unidad de destino */}
                        {form.nivelDerivacion !== 'SIN_DERIVACION' && (
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                    <Building2 className="w-3 h-3 inline mr-1" />Unidad de Destino
                                </label>
                                <select
                                    value={form.unidadDestino ?? ''}
                                    onChange={e => handleChange('unidadDestino', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]">
                                    <option value="">-- Seleccionar unidad --</option>
                                    {UNIDADES_DESTINO.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        )}

                        {/* Próxima cita */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Próxima Cita / Seguimiento</label>
                            <input type="text"
                                value={form.proximaCita}
                                onChange={e => handleChange('proximaCita', e.target.value)}
                                placeholder="Ej. Control en 7 días — CSU Juchitán, cita el ___/___/2026"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                        </div>

                        {/* Firma médica */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Médico Responsable', key: 'medicoFirma' },
                                { label: 'Cédula Profesional', key: 'cedulaProfesional' },
                                { label: 'CLUES Unidad Emisora', key: 'cluesUnidadEmisora' },
                            ].map(({ label, key }) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
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
                        <div className="only-print mt-8 flex justify-between items-end">
                            <div className="text-[9px] text-slate-600">
                                <p className="font-bold">Partera que refirió: {referencia.nombrePartera}</p>
                                <p>Comunidad: {referencia.comunidadOrigen}, {referencia.municipio}</p>
                                <p>Folio referencia: {referencia.folioReferencia}</p>
                            </div>
                            <div className="border-t border-slate-400 w-48 pt-1 text-center text-[9px] text-slate-600">
                                Firma y Sello del Médico Responsable<br />{form.medicoFirma}<br />Cédula: {form.cedulaProfesional}
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-between items-center p-5 border-t border-slate-100 no-print gap-3 flex-wrap">
                        <button onClick={onClose}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">
                            Cancelar
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Imprimir / PDF Oficial SSO
                            </button>
                            <button
                                onClick={() => { onEmitir(form); onClose(); }}
                                className="flex items-center gap-2 px-5 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Emitir Contrareferencia
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
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
                <FileText className="w-4 h-4 text-[#9D2449] shrink-0 mt-0.5" />
                <p>
                    Las contrareferencias emitidas tienen número de folio oficial SSO e incluyen diagnóstico CIE-10, plan farmacológico y unidad de destino.
                    El botón <span className="font-black text-slate-700">Imprimir / PDF Oficial SSO</span> aplica reglas
                    <code className="bg-slate-100 border border-slate-300 rounded px-1 mx-0.5">@media print</code>
                    para generar el documento institucional en A4.
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
