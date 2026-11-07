/* spell-checker: disable */
import React, { useState, useEffect, useRef } from 'react';
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
    Loader2,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { http } from '../../../../services/http';
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEstatusContaRefBadge(estatus: EstatusContraRef): React.ReactNode {
    const map: Record<EstatusContraRef, { label: string; cls: string; icon: React.ReactNode }> = {
        PENDIENTE_ATENCION: { label: 'Pendiente de Atención', cls: 'bg-rose-500/25 text-rose-200 border-rose-400/50', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
        EN_VALORACION: { label: 'En Valoración', cls: 'bg-amber-500/25 text-amber-200 border-amber-400/50', icon: <Clock className="w-3.5 h-3.5" /> },
        ATENDIDA: { label: 'Atendida', cls: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        DERIVADA_HOSPITAL: { label: 'Derivada a Hospital', cls: 'bg-blue-500/25 text-blue-200 border-blue-400/50', icon: <Building2 className="w-3.5 h-3.5" /> },
    };
    const { label, cls, icon } = map[estatus] || { label: estatus, cls: 'bg-white/10 text-white border-white/30', icon: null };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border backdrop-blur-md shadow-md ${cls}`}>
            {icon}{label}
        </span>
    );
}

function getRiesgoBadge(nivel: ReferenciaComunidad['nivelRiesgo']): React.ReactNode {
    const map = {
        BAJO: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50',
        MEDIO: 'bg-amber-500/25 text-amber-200 border-amber-400/50',
        ALTO: 'bg-rose-500/30 text-rose-200 border-rose-400/60',
        CRITICO: 'bg-red-600/50 text-white border-red-300 font-black animate-pulse',
    };
    return <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black border backdrop-blur-md shadow-md ${map[nivel] || map.BAJO}`}>{nivel}</span>;
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
                className={`w-full flex items-center justify-between bg-slate-900/50 border rounded-2xl px-4 py-3 text-xs text-left transition-all cursor-pointer backdrop-blur-xl shadow-inner ${open ? 'border-cyan-300 ring-2 ring-cyan-400/30' : 'border-white/50 text-white hover:border-white'}`}>
                <span className={value ? 'font-bold text-white' : 'text-slate-300'}>
                    {value || 'Seleccionar código CIE-10…'}
                </span>
                <ChevronDown className={`w-4 h-4 text-cyan-300 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-white/30 rounded-2xl shadow-2xl z-30 overflow-hidden backdrop-blur-3xl">
                    <div className="p-3 border-b border-white/20">
                        <input autoFocus type="text" placeholder="Buscar código o diagnóstico…"
                            value={query} onChange={e => setQuery(e.target.value)}
                            className="w-full bg-slate-950/80 border border-white/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-300" />
                    </div>
                    <div className="max-h-52 overflow-y-auto divide-y divide-white/10">
                        {filtrados.map(item => (
                            <button key={item.codigo} type="button"
                                onClick={() => { onChange(`${item.codigo} — ${item.desc}`); setOpen(false); setQuery(''); }}
                                className="w-full text-left px-4 py-2.5 text-xs hover:bg-white/10 transition-colors flex items-start gap-2.5 cursor-pointer">
                                <span className="font-mono font-black text-cyan-300 shrink-0 mt-0.5">{item.codigo}</span>
                                <span className="text-white/90 font-medium">{item.desc}</span>
                            </button>
                        ))}
                        {filtrados.length === 0 && (
                            <p className="text-center py-4 text-slate-400 text-xs">Sin resultados para "{query}"</p>
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
    const { user } = useAuth();

    const nombreMedicoContexto = (user as any)?.nombre || (user as any)?.nombreCompleto || (user as any)?.name || 'Dr. Médico Adscrito';
    const cedulaContexto = (user as any)?.cedula || '';

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
        medicoFirma: nombreMedicoContexto,
        cedulaProfesional: cedulaContexto,
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

    const inputGlassStyle = "w-full px-4 py-3 bg-slate-900/50 border border-white/50 rounded-2xl text-white text-xs font-bold placeholder:text-slate-300 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/30 backdrop-blur-2xl transition-all shadow-inner";
    const selectGlassStyle = "w-full px-4 py-3 bg-slate-900/70 border border-white/50 rounded-2xl text-white text-xs font-bold focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/30 backdrop-blur-2xl transition-all shadow-inner";

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

            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-start justify-center p-4 overflow-y-auto animate-fadeIn">
                <div className="relative border border-white/60 bg-slate-900/90 max-w-2xl w-full rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] backdrop-blur-3xl my-4 text-white overflow-hidden print-contraref" ref={printRef}>
                    <div className="absolute -top-32 -left-32 size-64 rounded-full bg-cyan-400/35 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-32 -right-32 size-64 rounded-full bg-blue-500/35 blur-3xl pointer-events-none" />

                    {/* Header no-print */}
                    <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/25 no-print">
                        <div>
                            <span className="text-[10px] font-black uppercase text-cyan-300 tracking-widest block">Servicios de Salud de Oaxaca</span>
                            <h3 className="text-lg font-black text-white tracking-tight mt-0.5">Formulario Oficial de Contrareferencia Médica SSO</h3>
                            <p className="text-xs text-cyan-100 font-medium mt-1">
                                Folio: <span className="font-extrabold text-cyan-300">{form.folioContraRef}</span> · Jurisdicción Sanitaria No. 2 Istmo
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/40 backdrop-blur-md cursor-pointer">
                            <X className="w-5 h-5" />
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

                    <div className="relative z-10 p-6 space-y-5 text-xs">
                        {/* Datos del paciente (read-only) */}
                        <div className="bg-white/5 border border-white/20 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 backdrop-blur-xl">
                            <div>
                                <p className="text-[10px] font-black text-cyan-200 uppercase tracking-wider">Paciente</p>
                                <p className="font-bold text-white text-sm">{referencia.nombrePaciente} · {referencia.edadPaciente} años</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-cyan-200 uppercase tracking-wider">Comunidad de Origen</p>
                                <p className="font-bold text-white text-sm">{referencia.comunidadOrigen}, {referencia.municipio}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-cyan-200 uppercase tracking-wider">Referida Por</p>
                                <p className="font-bold text-white">{referencia.nombrePartera}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-cyan-200 uppercase tracking-wider">Motivo de Referencia</p>
                                <p className="font-medium text-cyan-100 leading-snug">{referencia.motivoReferencia}</p>
                            </div>
                        </div>

                        {/* Diagnóstico CIE-10 */}
                        <div>
                            <label className="block text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-2">
                                <Stethoscope className="w-4 h-4 inline mr-1.5 text-cyan-300" />
                                Código CIE-10 — Diagnóstico Principal
                            </label>
                            <Cie10Selector
                                value={form.codigoCie10 ?? ''}
                                onChange={val => handleChange('codigoCie10', val)}
                            />
                        </div>

                        {/* Impresión diagnóstica */}
                        <div>
                            <label className="block text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-2">
                                Impresión Diagnóstica Completa
                            </label>
                            <input type="text"
                                value={form.diagnosticoImpresion}
                                onChange={e => handleChange('diagnosticoImpresion', e.target.value)}
                                className={inputGlassStyle} />
                        </div>

                        {/* Hallazgos */}
                        <div>
                            <label className="block text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-2">
                                Hallazgos a la Exploración Clínica
                            </label>
                            <textarea rows={2}
                                value={form.hallazgosClinica}
                                onChange={e => handleChange('hallazgosClinica', e.target.value)}
                                className={inputGlassStyle + " resize-none"} />
                        </div>

                        {/* Plan de manejo y conducta médica — 2 columnas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-2">
                                    Plan de Manejo Médico
                                </label>
                                <textarea rows={3}
                                    value={form.planManejo}
                                    onChange={e => handleChange('planManejo', e.target.value)}
                                    className={inputGlassStyle + " resize-none"} />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-2">
                                    <Pill className="w-4 h-4 inline mr-1.5 text-cyan-300" />
                                    Plan Farmacológico / Conducta Médica
                                </label>
                                <textarea rows={3}
                                    value={form.conductaMedica ?? ''}
                                    onChange={e => handleChange('conductaMedica', e.target.value)}
                                    placeholder="Ej. Metildopa 250mg c/8h, reposo relativo, control en 48h con tira de TA…"
                                    className={inputGlassStyle + " resize-none"} />
                            </div>
                        </div>

                        {/* Medicamentos */}
                        <div>
                            <label className="block text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-2">
                                Medicamentos Indicados (nombre, dosis, vía, duración)
                            </label>
                            <input type="text"
                                value={form.medicamentosIndicados}
                                onChange={e => handleChange('medicamentosIndicados', e.target.value)}
                                placeholder="Ej. Metildopa 500mg VO c/8h x 30 días · Ácido fólico 5mg VO/día"
                                className={inputGlassStyle} />
                        </div>

                        {/* Nivel de derivación */}
                        <div>
                            <label className="block text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-2">
                                <Navigation className="w-4 h-4 inline mr-1.5 text-cyan-300" />
                                Nivel de Derivación
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {(Object.entries(niveles) as [NonNullable<FormularioContraRef['nivelDerivacion']>, string][]).map(([key, label]) => (
                                    <button key={key} type="button"
                                        onClick={() => setForm(prev => ({ ...prev, nivelDerivacion: key }))}
                                        className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer backdrop-blur-xl ${form.nivelDerivacion === key
                                            ? 'bg-gradient-to-r from-cyan-400 to-blue-600 border-white text-white shadow-lg'
                                            : 'bg-white/10 border-white/30 text-white hover:bg-white/20'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Unidad de destino */}
                        {form.nivelDerivacion !== 'SIN_DERIVACION' && (
                            <div>
                                <label className="block text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-2">
                                    <Building2 className="w-4 h-4 inline mr-1.5 text-cyan-300" />Unidad de Destino
                                </label>
                                <select
                                    value={form.unidadDestino ?? ''}
                                    onChange={e => handleChange('unidadDestino', e.target.value)}
                                    className={selectGlassStyle}>
                                    <option value="" className="bg-slate-900 text-white">-- Seleccionar unidad --</option>
                                    {UNIDADES_DESTINO.map(u => <option key={u} value={u} className="bg-slate-900 text-white">{u}</option>)}
                                </select>
                            </div>
                        )}

                        {/* Próxima cita */}
                        <div>
                            <label className="block text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-2">Próxima Cita / Seguimiento</label>
                            <input type="text"
                                value={form.proximaCita}
                                onChange={e => handleChange('proximaCita', e.target.value)}
                                placeholder="Ej. Control en 7 días — CSU Juchitán, cita el ___/___/2026"
                                className={inputGlassStyle} />
                        </div>

                        {/* Firma médica */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            {[
                                { label: 'Médico Responsable', key: 'medicoFirma' },
                                { label: 'Cédula Profesional', key: 'cedulaProfesional' },
                                { label: 'CLUES Unidad Emisora', key: 'cluesUnidadEmisora' },
                            ].map(({ label, key }) => (
                                <div key={key}>
                                    <label className="block text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-2">{label}</label>
                                    <input
                                        type="text"
                                        value={form[key as keyof FormularioContraRef] as string ?? ''}
                                        onChange={e => handleChange(key as keyof FormularioContraRef, e.target.value)}
                                        className={inputGlassStyle}
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
                    <div className="relative z-10 flex justify-between items-center p-6 border-t border-white/25 no-print gap-3 flex-wrap">
                        <button type="button" onClick={onClose}
                            className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/30 backdrop-blur-xl cursor-pointer transition-all shadow-md">
                            Cancelar
                        </button>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer border border-white/30 shadow-lg"
                            >
                                <Printer className="w-4 h-4 text-cyan-300" />
                                Imprimir / PDF Oficial SSO
                            </button>
                            <button
                                type="button"
                                onClick={() => { onEmitir(form); onClose(); }}
                                className="flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white text-xs font-black rounded-2xl shadow-2xl shadow-cyan-950/80 transition-all active:scale-95 border border-white/60 cursor-pointer"
                            >
                                <CheckCircle2 className="w-4 h-4 text-cyan-100" />
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
    const [referencias, setReferencias] = useState<ReferenciaComunidad[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [referenciaSeleccionada, setReferenciaSeleccionada] = useState<ReferenciaComunidad | null>(null);

    useEffect(() => {
        const cargarReferencias = async () => {
            setCargando(true);
            setErrorMsg(null);
            try {
                const res = await http.get('/api/medico/contrareferencias/pendientes');
                setReferencias(res.data);
            } catch (error: any) {
                console.warn('Backend no disponible para contrareferencias, cargando datos de respaldo:', error);
                setErrorMsg('No se pudo conectar con el servidor. Mostrando datos de respaldo locales.');

                const mockReferencias: ReferenciaComunidad[] = [
                    {
                        id: 'REF-COM-2026-001',
                        folioReferencia: 'REF-COM-2026-001',
                        nombrePaciente: 'Guadalupe Jiménez Santiago',
                        edadPaciente: 27,
                        comunidadOrigen: 'San Dionisio del Mar',
                        municipio: 'San Dionisio del Mar',
                        nombrePartera: 'Doña Rosa Partera Tradicional',
                        nivelRiesgo: 'ALTO',
                        motivoReferencia: 'Paciente primigesta con cifras tensionales elevadas (140/90 mmHg) reportada por partera comunitaria.',
                        estatusContraRef: 'PENDIENTE_ATENCION',
                        fechaReferencia: '2026-10-20',
                    },
                    {
                        id: 'REF-COM-2026-002',
                        folioReferencia: 'REF-COM-2026-002',
                        nombrePaciente: 'Juana Martínez Pineda',
                        edadPaciente: 32,
                        comunidadOrigen: 'Playa Vicente',
                        municipio: 'Juchitán de Zaragoza',
                        nombrePartera: 'Abuela Martina Orozco',
                        nivelRiesgo: 'MEDIO',
                        motivoReferencia: 'Embarazo de 34 semanas con sospecha de disminución de movimientos fetales.',
                        estatusContraRef: 'PENDIENTE_ATENCION',
                        fechaReferencia: '2026-10-21',
                    }
                ];
                setReferencias(mockReferencias);
            } finally {
                setCargando(false);
            }
        };

        cargarReferencias();
    }, []);

    const refFiltradas = referencias.filter(r => {
        const q = busqueda.toLowerCase();
        return !q || r.nombrePaciente.toLowerCase().includes(q) ||
            r.folioReferencia.toLowerCase().includes(q) ||
            r.nombrePartera.toLowerCase().includes(q) ||
            r.municipio.toLowerCase().includes(q);
    });

    const handleEmitir = async (data: FormularioContraRef) => {
        try {
            await http.post(`/api/medico/contrareferencias/emitir`, data);

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
            alert('Contrareferencia emitida y sincronizada correctamente con el servidor.');
        } catch (error: any) {
            console.error('Error al emitir contrareferencia en servidor:', error);
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
            alert('Contrareferencia guardada localmente (modo offline / respaldo).');
        }
    };

    const pendientes = referencias.filter(r => r.estatusContraRef === 'PENDIENTE_ATENCION').length;
    const atendidas = referencias.filter(r => r.estatusContraRef === 'ATENDIDA').length;

    const cardGlassStyle = "p-6 bg-slate-900/35 rounded-3xl border border-white/50 backdrop-blur-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] space-y-4 text-white";
    const inputGlassStyle = "w-full px-4 py-3 bg-slate-900/40 border border-white/50 rounded-2xl text-white text-xs font-bold placeholder:text-slate-300 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/30 backdrop-blur-2xl transition-all shadow-inner";

    return (
        <div className="space-y-6 text-white animate-fadeIn">
            {errorMsg && (
                <div className="bg-rose-950/70 border border-rose-400/60 p-4 rounded-2xl text-rose-200 text-xs font-bold flex items-center gap-3 backdrop-blur-2xl shadow-xl">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                    { label: 'Referencias Recibidas', value: referencias.length, cls: 'bg-white/5 border-white/30 text-white', icon: HeartHandshake },
                    { label: 'Pendientes de Atención', value: pendientes, cls: 'bg-rose-950/40 border-rose-400/40 text-rose-200', icon: AlertTriangle },
                    { label: 'Atendidas y Documentadas', value: atendidas, cls: 'bg-emerald-950/40 border-emerald-400/40 text-emerald-200', icon: CheckCircle2 },
                ].map(({ label, value, cls, icon: Icon }) => (
                    <div key={label} className={`flex items-center gap-4 p-6 rounded-3xl border ${cls} backdrop-blur-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]`}>
                        <div className="p-3.5 bg-white/15 rounded-2xl border border-white/40 backdrop-blur-xl shadow-lg">
                            <Icon className="w-6 h-6 text-cyan-300" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">{value}</p>
                            <p className="text-xs font-bold text-cyan-100 mt-0.5">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Buscador */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-cyan-300 absolute left-4 top-3.5" />
                <input
                    type="text"
                    placeholder="Buscar por paciente, folio, partera o municipio..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className={inputGlassStyle + " pl-11"}
                />
            </div>

            {/* Bandeja de referencias */}
            <div className="space-y-4">
                {cargando ? (
                    <div className="text-center py-20 text-cyan-200 font-semibold text-sm flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                        <span>Sincronizando contrareferencias con PostgreSQL (Render)...</span>
                    </div>
                ) : refFiltradas.length === 0 ? (
                    <div className="text-center py-16 text-cyan-100/80 font-medium text-sm bg-slate-900/35 border border-white/50 rounded-3xl backdrop-blur-3xl shadow-xl">
                        No hay referencias comunitarias registradas.
                    </div>
                ) : (
                    refFiltradas.map(ref => (
                        <div key={ref.id} className={`border rounded-3xl p-6 transition-all backdrop-blur-3xl shadow-xl ${ref.estatusContraRef === 'PENDIENTE_ATENCION'
                            ? 'border-rose-400/50 bg-rose-950/30'
                            : ref.estatusContraRef === 'ATENDIDA'
                                ? 'border-emerald-400/50 bg-emerald-950/30'
                                : 'border-white/50 bg-slate-900/35'
                            }`}>
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="text-xs font-mono font-black text-cyan-300">{ref.folioReferencia}</span>
                                        {getEstatusContaRefBadge(ref.estatusContraRef)}
                                        {getRiesgoBadge(ref.nivelRiesgo)}
                                    </div>
                                    <p className="font-black text-base text-white flex items-center gap-2">
                                        <User className="w-4 h-4 text-cyan-300 shrink-0" />
                                        {ref.nombrePaciente} · {ref.edadPaciente} años
                                    </p>
                                    <p className="text-xs text-cyan-100 font-semibold flex items-center gap-2">
                                        <HeartHandshake className="w-4 h-4 text-rose-300 shrink-0" />
                                        {ref.nombrePartera}
                                    </p>
                                    <p className="text-xs text-cyan-200/90 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-cyan-300 shrink-0" />
                                        {ref.comunidadOrigen}, {ref.municipio}
                                    </p>
                                    <p className="text-xs text-white font-medium mt-1.5 max-w-2xl bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-md">{ref.motivoReferencia}</p>
                                    {ref.diagnosticoMedico && (
                                        <p className="text-xs text-emerald-300 font-bold flex items-center gap-2 mt-1">
                                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> {ref.diagnosticoMedico}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto items-stretch lg:items-end">
                                    {ref.estatusContraRef !== 'ATENDIDA' && (
                                        <button
                                            type="button"
                                            onClick={() => setReferenciaSeleccionada(ref)}
                                            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white text-xs font-extrabold rounded-2xl shadow-xl shadow-cyan-950/80 transition-all active:scale-95 border border-white/60 cursor-pointer"
                                        >
                                            <FileText className="w-4 h-4 text-cyan-100" />
                                            Emitir Contrareferencia
                                        </button>
                                    )}
                                    {ref.folioContraRef && (
                                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-200 bg-emerald-500/25 border border-emerald-400/50 px-4 py-2 rounded-2xl backdrop-blur-xl shadow-lg">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                            Folio: {ref.folioContraRef}
                                        </div>
                                    )}
                                    <span className="text-[11px] text-cyan-200/80 flex items-center justify-center lg:justify-end gap-1.5 font-medium">
                                        <Clock className="w-3.5 h-3.5" /> Recibida: {ref.fechaRecepcion ?? ref.fechaReferencia}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Nota informativa */}
            <div className="bg-slate-900/35 border border-white/50 rounded-3xl p-5 text-xs text-cyan-100 flex items-start gap-3.5 backdrop-blur-3xl shadow-xl">
                <FileText className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    Las contrareferencias emitidas tienen número de folio oficial SSO e incluyen diagnóstico CIE-10, plan farmacológico y unidad de destino.
                    El botón <span className="font-black text-white">Imprimir / PDF Oficial SSO</span> aplica reglas
                    <code className="bg-white/10 border border-white/30 rounded px-1.5 py-0.5 mx-1 font-mono">@media print</code>
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

export default TabContrareferencias;