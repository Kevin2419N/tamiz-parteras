import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    HeartPulse,
    Mic,
    MicOff,
    Send,
    AlertTriangle,
    Calendar,
    Fingerprint,
    Check,
    ShieldAlert,
    User,
    PenTool,
    Pill,
    Droplet,
    Ruler,
    Baby,
    FileText,
    Building2,
    Award,
    Megaphone,
    Loader2,
    Volume2,
    CheckCircle2
} from 'lucide-react';
import { handleVoiceInput } from '../../utils/voiceUtils';
import { http } from '../../services/http';

/* ──────────────────────────────────────────────────────────────
 * TIPOS Y PROPS (sin cambios respecto al módulo original)
 * ────────────────────────────────────────────────────────────── */
export interface CalendarioMujerProps {
    onBack?: () => void;
    onSuccess?: () => void;
    hablarTexto?: (texto: string) => void;
    isListening?: boolean;
    campoEscuchando?: string | null;
    iniciarDictado?: (campo: string, setFieldState?: (val: string) => void) => void;
}

type Muac = 'VERDE' | 'AMARILLO' | 'ROJO';
type Vacuna = '1A' | '2A' | 'REFUERZO';
type PosicionParto = 'VERTICAL' | 'HORIZONTAL';
type ResultadoParto = 'NINO_VIVO' | 'NINA_VIVA';
type EtapaMuerte = 'EMBARAZO' | 'PARTO' | 'PUERPERIO';
type Tono = 'guinda' | 'emerald' | 'sky' | 'pink' | 'purple';

interface ItemCatalogo {
    id: string;
    img: string;
    label: string;
}

/* ──────────────────────────────────────────────────────────────
 * CATÁLOGOS
 * ────────────────────────────────────────────────────────────── */
const MESES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const VACUNAS: { id: Vacuna; label: string }[] = [
    { id: '1A', label: '1ª Dosis' },
    { id: '2A', label: '2ª Dosis' },
    { id: 'REFUERZO', label: 'Refuerzo' }
];

const SEMAFORO: { id: Muac; titulo: string; estado: string; on: string; off: string }[] = [
    {
        id: 'VERDE',
        titulo: 'Verde',
        estado: 'Adecuado',
        on: 'bg-emerald-600 text-white border-emerald-700 ring-4 ring-emerald-300/60 shadow-xl',
        off: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
    },
    {
        id: 'AMARILLO',
        titulo: 'Amarillo',
        estado: 'Riesgo',
        on: 'bg-amber-400 text-slate-950 border-amber-600 ring-4 ring-amber-200 shadow-xl',
        off: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
    },
    {
        id: 'ROJO',
        titulo: 'Rojo',
        estado: 'Desnutrición',
        on: 'bg-rose-600 text-white border-rose-700 ring-4 ring-rose-300/60 shadow-xl',
        off: 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
    }
];

const SINTOMAS_SUPERIORES: ItemCatalogo[] = [
    { id: 'DOLOR_CABEZA', img: '/DolorDeCabeza.png', label: 'Dolor de cabeza, zumbidos en oídos, ver lucecitas' },
    { id: 'HINCHAZON', img: '/Hinchazon.png', label: 'Hinchazón de cara, manos, piernas y pies' },
    { id: 'CONVULSIONES', img: '/Convulsiones.png', label: 'Convulsiones o ataques' }
];
const SINTOMA_IZQUIERDO: ItemCatalogo = { id: 'ORINA_DIFICULTAD', img: '/DificultadesDeOrinar.png', label: 'Dificultad al orinar o con sangre' };
const SINTOMA_DERECHO: ItemCatalogo = { id: 'VOMITO_FRECUENTE', img: '/VomitoFrecuente.png', label: 'Vómito frecuente después de los 3 meses' };
const SINTOMAS_INFERIORES: ItemCatalogo[] = [
    { id: 'DIFICULTAD_RESPIRAR', img: '/DificultadParaRespirar.png', label: 'Dificultad al respirar (labios y uñas moradas)' },
    { id: 'DOLOR_ANTES_8_MESES', img: '/DolorAntesDeLos8Meses.png', label: 'Dolor antes de los 8 meses' }
];

// Centros (en %) de cada tarjeta del mapa radial, usados por los conectores SVG
const CONECTORES: [number, number][] = [
    [16.6, 17], [50, 17], [83.3, 17],
    [16.6, 50], [83.3, 50],
    [33.3, 85], [66.6, 85]
];

const TARJETAS_ABORTO: { id: string; img: string; title: string }[] = [
    { id: 'ABORTO', img: '/Aborto.png', title: 'Aborto' },
    { id: 'DOLOR', img: '/Dolor.png', title: 'Dolor' },
    { id: 'HEMORRAGIA', img: '/Hemorragia.png', title: 'Hemorragia' }
];

const FILAS_PARTO: { pos: PosicionParto; etiqueta: string; titulo: string; descripcion: string; img: string }[] = [
    {
        pos: 'VERTICAL',
        etiqueta: 'Fila 1: Parto Vertical',
        titulo: 'Parto Humanizado Vertical',
        descripcion: 'Posición tradicional de pie, acuclillada o en silla hidrostática',
        img: '/PartoNormalVertical.png'
    },
    {
        pos: 'HORIZONTAL',
        etiqueta: 'Fila 2: Parto Horizontal',
        titulo: 'Parto Horizontal (Decúbito Supino)',
        descripcion: 'Posición horizontal asistida en camilla de atención',
        img: '/PartoNormalHorizontal.png'
    }
];

const RESULTADOS_PARTO: { id: ResultadoParto; titulo: string; img: string; tone: Tono }[] = [
    { id: 'NINO_VIVO', titulo: 'Niño Vivo', img: '/NiñoVivo.png', tone: 'sky' },
    { id: 'NINA_VIVA', titulo: 'Niña Viva', img: '/NiñaViva.png', tone: 'pink' }
];

const OPCIONES_PARTO_COMPLICADO: { id: string; img: string; title: string }[] = [
    { id: 'NINO_COMPLICADO', img: '/NiñoComplicado.png', title: 'Niño Complicado' },
    { id: 'NINA_COMPLICADA', img: '/NiñaComplicado.png', title: 'Niña Complicada' },
    { id: 'NINO_MUERTO', img: '/NiñoMuerto.png', title: 'Defunción Recién Nacido (Niño)' },
    { id: 'NINA_MUERTA', img: '/NiñaMuerta.png', title: 'Defunción Recién Nacida (Niña)' }
];

const CHECKS_PUERPERIO: { id: string; label: string }[] = [
    { id: 'SANGRADO_ABUNDANTE', label: 'Sangrado abundante' },
    { id: 'CALENTURA', label: 'Calentura / Fiebre' },
    { id: 'SANGRADO_MAL_OLOR', label: 'Sangrado con mal olor' }
];

const ETAPAS_MUERTE_MATERNA: { id: EtapaMuerte; img: string; title: string }[] = [
    { id: 'EMBARAZO', img: '/MuerteMaternaEmbarazo.png', title: 'Embarazo' },
    { id: 'PARTO', img: '/MuerteMaternaParto.png', title: 'Parto' },
    { id: 'PUERPERIO', img: '/MuertePartoPuerperico.png', title: 'Puerperio' }
];

const INSTRUCCIONES_VOZ =
    'Calendario de atención a la mujer. ' +
    'Primero escriba o dicte los datos de la paciente: presione el botón guinda con el micrófono junto a cada campo y hable con claridad. ' +
    'Después seleccione el mes de embarazo, la vacuna y el color de la cinta de medición. ' +
    'Si detecta signos de alarma, toque las tarjetas que correspondan y marque si fue referida. ' +
    'Registre el tipo de parto y el resultado del recién nacido, y revise el puerperio. ' +
    'Al final capture la huella digital de la partera y presione el botón grande para registrar el calendario.';

/* ──────────────────────────────────────────────────────────────
 * ESTILOS LOCALES (ondas de audio y animaciones)
 * Si `pt-wave-bar` ya existe en tu CSS global, puedes borrar ese bloque.
 * ────────────────────────────────────────────────────────────── */
const ESTILOS = `
@keyframes pt-wave { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
.pt-wave-bar { display: inline-block; width: 4px; border-radius: 9999px; background: currentColor; transform-origin: center; animation: pt-wave .9s ease-in-out infinite; }
@keyframes cm-pop { from { opacity: 0; transform: translateY(14px) scale(.92); } to { opacity: 1; transform: none; } }
.cm-pop { animation: cm-pop .35s cubic-bezier(.2,.8,.2,1) both; }
@keyframes cm-fade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.cm-fade { animation: cm-fade .25s ease-out both; }
@media (prefers-reduced-motion: reduce) { .pt-wave-bar, .cm-pop, .cm-fade { animation: none; } }
`;

/* ──────────────────────────────────────────────────────────────
 * UTILIDADES DE AUDIO
 * ────────────────────────────────────────────────────────────── */
const reproducirAcuse = () => {
    try {
        const Ctx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, t);
        osc.frequency.setValueAtTime(880, t + 0.12);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.32);
        osc.onended = () => { void ctx.close(); };
    } catch {
        /* Sin audio disponible: se ignora */
    }
};

/* ──────────────────────────────────────────────────────────────
 * COMPONENTES REUTILIZABLES
 * ────────────────────────────────────────────────────────────── */
const TriStripe: React.FC<{ className?: string }> = ({ className = 'h-2' }) => (
    <div className={`flex w-full ${className}`} aria-hidden="true">
        <span className="flex-1 bg-[#9D2449]" />
        <span className="flex-1 bg-[#D4A029]" />
        <span className="flex-1 bg-[#2E7D5B]" />
    </div>
);

const WaveBars: React.FC = () => (
    <span className="flex items-center gap-[3px]" aria-hidden="true">
        {[12, 22, 28, 18, 14].map((h, i) => (
            <span key={i} className="pt-wave-bar" style={{ height: h, animationDelay: `${i * 0.12}s` }} />
        ))}
    </span>
);

interface SectionCardProps {
    icon: React.ReactNode;
    tone?: 'rose' | 'emerald' | 'purple';
    title: string;
    subtitle: string;
    action?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const SECTION_TONES = {
    rose: 'bg-rose-50 text-[#9D2449] border-rose-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
};

const SectionCard: React.FC<SectionCardProps> = ({ icon, tone = 'rose', title, subtitle, action, className = '', children }) => (
    <section className={`space-y-6 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-2xl backdrop-blur-md md:p-8 ${className}`}>
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className={`rounded-2xl border p-3 ${SECTION_TONES[tone]}`}>{icon}</div>
                <div>
                    <h3 className="text-lg font-black leading-tight text-slate-900">{title}</h3>
                    <p className="text-sm font-medium text-slate-600">{subtitle}</p>
                </div>
            </div>
            {action}
        </div>
        {children}
    </section>
);

const ReferidoToggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
    <div role="group" aria-label={label} className="inline-flex items-center gap-1.5 self-start rounded-2xl border border-slate-300 bg-slate-100/90 p-1.5 sm:self-auto">
        <span className="px-2 text-xs font-black text-slate-700">{label}</span>
        <button
            type="button"
            aria-pressed={!value}
            onClick={() => onChange(false)}
            className={`min-h-[48px] min-w-[64px] cursor-pointer rounded-xl px-5 text-sm font-black transition-all active:scale-[0.98] ${!value ? 'bg-slate-700 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}
        >
            NO
        </button>
        <button
            type="button"
            aria-pressed={value}
            onClick={() => onChange(true)}
            className={`flex min-h-[48px] min-w-[72px] cursor-pointer items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-black transition-all active:scale-[0.98] ${value ? 'bg-[#9D2449] text-white shadow-md ring-2 ring-rose-300' : 'text-slate-600 hover:bg-white'}`}
        >
            <span>SÍ</span>
            <AlertTriangle className={`h-4 w-4 ${value ? 'text-amber-300' : 'text-amber-500'}`} />
        </button>
    </div>
);

const TONOS: Record<Tono, { on: string; badge: string; pillOn: string }> = {
    guinda: { on: 'border-[#9D2449] bg-rose-50 ring-4 ring-[#9D2449]/15 shadow-xl', badge: 'bg-[#9D2449]', pillOn: 'bg-[#9D2449] text-white' },
    emerald: { on: 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-500/20 shadow-xl', badge: 'bg-emerald-600', pillOn: 'bg-emerald-600 text-white' },
    sky: { on: 'border-sky-600 bg-sky-50 ring-4 ring-sky-500/20 shadow-xl', badge: 'bg-sky-600', pillOn: 'bg-sky-600 text-white' },
    pink: { on: 'border-pink-600 bg-pink-50 ring-4 ring-pink-500/20 shadow-xl', badge: 'bg-pink-600', pillOn: 'bg-pink-600 text-white' },
    purple: { on: 'border-purple-600 bg-purple-50 ring-4 ring-purple-500/20 shadow-xl', badge: 'bg-purple-600', pillOn: 'bg-purple-600 text-white' }
};

interface ChoiceCardProps {
    active: boolean;
    onClick: () => void;
    title: string;
    subtitle?: string;
    img?: string;
    imgClassName?: string;
    icon?: React.ReactNode;
    tone?: Tono;
    layout?: 'stack' | 'row';
    footer?: { off: string; on: string; offIcon?: React.ReactNode };
    className?: string;
}

const ChoiceCard: React.FC<ChoiceCardProps> = ({
    active,
    onClick,
    title,
    subtitle,
    img,
    imgClassName = 'h-16',
    icon,
    tone = 'guinda',
    layout = 'stack',
    footer,
    className = ''
}) => {
    const t = TONOS[tone];
    const disposicion =
        layout === 'row'
            ? 'flex items-center gap-4 text-left'
            : `flex flex-col items-center gap-3 text-center ${img || footer ? 'justify-between' : 'justify-center'}`;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`relative min-h-[72px] w-full cursor-pointer touch-manipulation select-none rounded-2xl border-2 p-4 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#9D2449]/40 active:scale-[0.98] ${disposicion} ${active ? t.on : 'border-slate-200 bg-white/90 hover:-translate-y-0.5 hover:border-[#9D2449]/40 hover:shadow-lg'} ${className}`}
        >
            {active && (
                <span className={`absolute -right-2.5 -top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white ${t.badge}`}>
                    <Check className="h-5 w-5" strokeWidth={3} />
                </span>
            )}
            {img && <img src={img} alt="" className={`shrink-0 object-contain mix-blend-multiply ${imgClassName}`} />}
            <span className={`flex flex-col ${layout === 'row' ? 'min-w-0 flex-1' : 'items-center'}`}>
                <span className="text-base font-extrabold leading-tight text-slate-900">{title}</span>
                {subtitle && <span className="mt-0.5 text-sm font-semibold text-slate-600">{subtitle}</span>}
            </span>
            {icon}
            {footer && (
                <span className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black uppercase ${active ? t.pillOn : 'bg-slate-100 text-slate-600'}`}>
                    <span>{active ? footer.on : footer.off}</span>
                    {active ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : footer.offIcon}
                </span>
            )}
        </button>
    );
};

const SemaforoMUAC: React.FC<{ value: Muac; onChange: (v: Muac) => void; label: string }> = ({ value, onChange, label }) => (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-300 bg-slate-200/80 p-2 shadow-inner">
        {SEMAFORO.map((s) => {
            const active = value === s.id;
            return (
                <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange(s.id)}
                    className={`relative flex min-h-[84px] cursor-pointer touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-3 transition-all active:scale-[0.98] ${active ? s.on : s.off}`}
                >
                    {active && (
                        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg ring-2 ring-slate-900/10">
                            <Check className="h-4 w-4" strokeWidth={3} />
                        </span>
                    )}
                    <span className="text-sm font-black uppercase tracking-wider">{s.titulo}</span>
                    <span className="text-xs font-bold opacity-90">{s.estado}</span>
                </button>
            );
        })}
    </div>
);

interface VoiceFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    onMic: () => void;
    listening: boolean;
    type?: 'text' | 'number' | 'date';
    inputMode?: 'text' | 'numeric';
    required?: boolean;
    placeholder?: string;
    dark?: boolean;
    className?: string;
}

const VoiceField: React.FC<VoiceFieldProps> = ({
    id,
    label,
    value,
    onChange,
    onMic,
    listening,
    type = 'text',
    inputMode,
    required,
    placeholder,
    dark = false,
    className = ''
}) => {
    const base = dark
        ? 'bg-slate-800/80 border-slate-600 text-white placeholder:text-slate-400'
        : 'bg-white/90 border-slate-300 text-slate-900 placeholder:text-slate-400';
    const estado = listening
        ? `border-[#9D2449] ring-4 ring-[#9D2449]/30 ${dark ? 'bg-slate-800' : 'bg-white'}`
        : dark
            ? 'focus:border-amber-400'
            : 'focus:border-[#9D2449]';

    return (
        <div className={className}>
            <label htmlFor={id} className={`mb-1.5 block text-sm font-bold ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                {label}
            </label>
            <div className="flex items-stretch gap-2">
                <div className="relative flex-1">
                    <input
                        id={id}
                        type={type}
                        inputMode={inputMode}
                        required={required}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`min-h-[56px] w-full rounded-2xl border-2 px-4 text-base font-bold transition-all focus:outline-none ${listening ? 'pr-36' : ''} ${base} ${estado}`}
                    />
                    {listening && (
                        <span className={`pointer-events-none absolute inset-y-0 right-3 flex items-center gap-2 ${dark ? 'text-rose-300' : 'text-[#9D2449]'}`}>
                            <WaveBars />
                            <span className="text-xs font-black">Escuchando…</span>
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onMic}
                    aria-label={`Dictar ${label}`}
                    aria-pressed={listening}
                    title={`Dictar ${label}`}
                    className={`flex min-h-[56px] min-w-[56px] shrink-0 cursor-pointer items-center justify-center rounded-2xl text-white shadow-md transition-all focus-visible:ring-4 focus-visible:ring-[#9D2449]/40 active:scale-95 ${listening ? 'animate-pulse bg-[#7A1B38] ring-4 ring-rose-300' : 'bg-[#9D2449] hover:bg-[#7A1B38]'}`}
                >
                    {listening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>
            </div>
        </div>
    );
};

/* ──────────────────────────────────────────────────────────────
 * COMPONENTE PRINCIPAL
 * ────────────────────────────────────────────────────────────── */
export const CalendarioMujer: React.FC<CalendarioMujerProps> = ({
    onSuccess,
    hablarTexto
}) => {
    // 0. Modo Duplicado (Vista Partera vs Copia Centro de Salud)
    const [modoDuplicado, setModoDuplicado] = useState(false);

    // 1. Datos de Identificación
    const [nombreMujer, setNombreMujer] = useState('');
    const [edad, setEdad] = useState('24');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [municipio, setMunicipio] = useState('Juchitán de Zaragoza');
    const [localidad, setLocalidad] = useState('Álvaro Obregón');

    // Voice dictation tracking
    const [listeningField, setListeningField] = useState<string | null>(null);

    // 2. Control Prenatal y Embarazo Normal
    const [mesSeleccionado, setMesSeleccionado] = useState<number>(5);
    const [acidoFolico, setAcidoFolico] = useState(true);
    const [hierro, setHierro] = useState(true);
    const [vacunaTetanos, setVacunaTetanos] = useState<'1A' | '2A' | 'REFUERZO'>('1A');
    const [cintaMUAC, setCintaMUAC] = useState<'VERDE' | 'AMARILLO' | 'ROJO'>('VERDE');

    // 3. Embarazo con Complicaciones (Mapa Radial)
    const [referidoEmbarazo, setReferidoEmbarazo] = useState<boolean>(false);
    const [sintomasComplicaciones, setSintomasComplicaciones] = useState<string[]>([]);

    // 4. Aborto, Dolor y Hemorragia
    const [referidoAborto, setReferidoAborto] = useState<boolean>(false);
    const [tarjetasAborto, setTarjetasAborto] = useState<string[]>([]);

    // 5. Parto Normal
    const [partoNormalPosicion, setPartoNormalPosicion] = useState<'VERTICAL' | 'HORIZONTAL' | null>('VERTICAL');
    const [partoNormalResultado, setPartoNormalResultado] = useState<'NINO_VIVO' | 'NINA_VIVA' | null>('NINO_VIVO');

    // 6. Parto Complicado
    const [referidoPartoComplicado, setReferidoPartoComplicado] = useState<boolean>(false);
    const [partoComplicadoOpcion, setPartoComplicadoOpcion] = useState<string | null>(null);

    // 7. Puerperio Normal y Complicado
    const [cintaMUACPuerperio, setCintaMUACPuerperio] = useState<'VERDE' | 'AMARILLO' | 'ROJO'>('VERDE');
    const [referidoPuerperio, setReferidoPuerperio] = useState<boolean>(false);
    const [puerperioCheckboxes, setPuerperioCheckboxes] = useState<string[]>([]);

    // 8. Muerte Materna
    const [muerteMaternaEtapa, setMuerteMaternaEtapa] = useState<'EMBARAZO' | 'PARTO' | 'PUERPERIO' | null>(null);

    // 9. Cierre Administrativo
    const [nombrePartera, setNombrePartera] = useState('');
    const [cierreLocalidad, setCierreLocalidad] = useState('');
    const [noMunicipio, setNoMunicipio] = useState('');
    const [mesInformado, setMesInformado] = useState('');
    const [nombreSupervisor, setNombreSupervisor] = useState('');
    const [centroSalud, setCentroSalud] = useState('');
    const [huellaRegistrada, setHuellaRegistrada] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado de UI nuevo (no afecta el payload)
    const [hablando, setHablando] = useState(false);
    const [exito, setExito] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

    const escuchandoRef = useRef(false);
    const onSuccessRef = useRef(onSuccess);
    onSuccessRef.current = onSuccess;

    const hablar = (texto: string) => {
        if (hablarTexto) hablarTexto(texto);
    };

    /* ── Síntesis de voz es-MX para "Escuchar instrucciones" ── */
    const escucharInstrucciones = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;
        if (hablando) {
            synth.cancel();
            setHablando(false);
            return;
        }
        synth.cancel();
        const u = new SpeechSynthesisUtterance(INSTRUCCIONES_VOZ);
        u.lang = 'es-MX';
        u.rate = 0.9;
        const voz = synth.getVoices().find((v) => v.lang.toLowerCase().replace('_', '-') === 'es-mx');
        if (voz) u.voice = voz;
        u.onstart = () => setHablando(true);
        u.onend = () => setHablando(false);
        u.onerror = () => setHablando(false);
        synth.speak(u);
    };

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    /* ── Modal de éxito: cierra solo y luego avisa al padre ── */
    const cerrarExito = useCallback(() => {
        setExito(false);
        if (onSuccessRef.current) onSuccessRef.current();
    }, []);

    useEffect(() => {
        if (!exito) return;
        const timer = window.setTimeout(cerrarExito, 4500);
        return () => window.clearTimeout(timer);
    }, [exito, cerrarExito]);

    // Web Speech API Voice Dictation
    const startVoice = (setter: (val: string) => void, fieldKey: string) => {
        handleVoiceInput(
            (val) => setter(val),
            (l) => {
                setListeningField(l ? fieldKey : null);
                if (l) {
                    escuchandoRef.current = true;
                } else if (escuchandoRef.current) {
                    escuchandoRef.current = false;
                    reproducirAcuse();
                }
            }
        );
    };

    const toggleSintoma = (id: string) => {
        setSintomasComplicaciones(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleTarjetaAborto = (id: string) => {
        setTarjetasAborto(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const togglePuerperioCheckbox = (id: string) => {
        setPuerperioCheckboxes(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Conexión real con el backend y PostgreSQL
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorEnvio(null);

        const payload = {
            parteraId: localStorage.getItem('partera_id') || 'DEFAULT-PARTERA-UUID',
            datosUsuaria: {
                nombreMujer,
                edad: parseInt(edad) || 0,
                fechaConsulta: fecha,
                localidad,
                municipio,
                esCopiaCentroSalud: modoDuplicado
            },
            controlPrenatal: {
                mesEmbarazoActivo: mesSeleccionado,
                acidoFolicoEntregado: acidoFolico,
                sulfatoFerrosoEntregado: hierro,
                vacunaTetanos,
                muacEmbarazo: cintaMUAC
            },
            embarazoComplicaciones: {
                referido: referidoEmbarazo,
                sintomas: sintomasComplicaciones
            },
            complicacionesHemorragicas: {
                referido: referidoAborto,
                complicaciones: tarjetasAborto
            },
            partoNormal: {
                tipoParto: partoNormalPosicion,
                resultado: partoNormalResultado
            },
            partoComplicado: {
                referido: referidoPartoComplicado,
                resultado: partoComplicadoOpcion
            },
            puerperio: {
                muacPuerperio: cintaMUACPuerperio,
                complicadoReferido: referidoPuerperio,
                sintomas: puerperioCheckboxes
            },
            alertaMuerteMaterna: {
                registrada: muerteMaternaEtapa !== null,
                etapa: muerteMaternaEtapa
            },
            cierreAdministrativo: {
                nombrePartera,
                localidad: cierreLocalidad,
                noMunicipio,
                mesInformado,
                nombreSupervisor,
                centroSaludAdscripcion: centroSalud,
                huellaFirmada: huellaRegistrada
            }
        };

        try {
            await http.post('/api/v1/calendario-mujer', payload);

            hablar('Calendario de atención a la mujer registrado y guardado exitosamente en la base de datos.');
            setExito(true);
        } catch (error: unknown) {
            console.error('Error al guardar calendario de la mujer:', error);
            const mensaje = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setErrorEnvio(mensaje || 'Error al conectar con el servidor para guardar el calendario.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSintoma = (item: ItemCatalogo, extra = '') => (
        <ChoiceCard
            key={item.id}
            active={sintomasComplicaciones.includes(item.id)}
            onClick={() => toggleSintoma(item.id)}
            title={item.label}
            img={item.img}
            footer={{ off: 'Seleccionar', on: 'Seleccionado' }}
            className={`h-full ${extra}`}
        />
    );

    const camposCierre = [
        { key: 'nombrePartera', label: 'Nombre de la Partera', value: nombrePartera, set: setNombrePartera },
        { key: 'cierreLocalidad', label: 'Localidad', value: cierreLocalidad, set: setCierreLocalidad },
        { key: 'noMunicipio', label: 'No. Municipio', value: noMunicipio, set: setNoMunicipio },
        { key: 'mesInformado', label: 'Mes Informado', value: mesInformado, set: setMesInformado },
        { key: 'nombreSupervisor', label: 'Nombre del Supervisor', value: nombreSupervisor, set: setNombreSupervisor },
        { key: 'centroSalud', label: 'Centro de Salud', value: centroSalud, set: setCentroSalud }
    ];

    return (
        <>
            <style>{ESTILOS}</style>

            <form onSubmit={handleSubmit} className="mx-auto my-4 max-w-5xl space-y-6 px-2 sm:px-0">
                {/* ═══ CABECERA GLOBAL SIMÉTRICA ═══ */}
                <header className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-2xl backdrop-blur-md">
                    <TriStripe />
                    <div className="grid grid-cols-1 items-center gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:gap-6 md:p-6">
                        <div className="flex items-center justify-center gap-3">
                            <img src="/logo-jurisdiccion.png" alt="Jurisdicción Sanitaria" className="h-14 w-auto object-contain mix-blend-multiply md:h-16" />
                            <img src="/Logo-Secretaria.png" alt="Secretaría de Salud de Oaxaca" className="h-14 w-auto object-contain mix-blend-multiply md:h-16" />
                        </div>

                        <div className="text-center">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#B8892B]">
                                Programa de Parteras Tradicionales
                            </p>
                            <h1 className="mt-1 text-lg font-black uppercase leading-tight tracking-tight text-[#9D2449] sm:text-2xl">
                                Servicios de Salud de Oaxaca — Calendario de Atención a la Mujer
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={escucharInstrucciones}
                            aria-pressed={hablando}
                            className={`flex min-h-[72px] w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[#C0623B] bg-gradient-to-br from-[#C0623B] to-[#8A3A1E] px-6 text-base font-extrabold text-white shadow-lg transition-all active:scale-[0.98] md:w-auto ${hablando ? 'animate-pulse ring-4 ring-amber-300' : 'hover:-translate-y-0.5 hover:shadow-xl'}`}
                        >
                            <Volume2 className="h-6 w-6" />
                            <span>{hablando ? 'Detener instrucciones' : 'Escuchar instrucciones'}</span>
                        </button>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-2 bg-[#9D2449] px-5 py-4 text-center font-bold text-white md:flex-row">
                        <span className="flex items-center gap-2 text-lg md:text-xl">
                            <Megaphone className="h-6 w-6 shrink-0 text-rose-200" />
                            ACUDE A TU UNIDAD DE SALUD
                        </span>
                        <span className="hidden md:inline">•</span>
                        <span className="text-sm font-normal text-rose-100 md:text-base">
                            Calendario de Atención a la Mujer (Embarazo, Parto y Puerperio)
                        </span>
                    </div>
                </header>

                {/* ═══ VISTA PARTERA / COPIA CENTRO DE SALUD ═══ */}
                <div className="flex justify-end">
                    <div className="flex w-full items-center gap-1.5 rounded-2xl border border-slate-300 bg-slate-200/90 p-1.5 shadow-inner sm:w-auto">
                        <button
                            type="button"
                            aria-pressed={!modoDuplicado}
                            onClick={() => {
                                setModoDuplicado(false);
                                hablar('Vista Partera activa');
                            }}
                            className={`flex min-h-[56px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold transition-all active:scale-[0.98] sm:flex-initial ${!modoDuplicado ? 'bg-[#9D2449] text-white shadow-md' : 'text-slate-700 hover:bg-white/70'}`}
                        >
                            <FileText className="h-5 w-5" />
                            <span>Vista Partera</span>
                        </button>
                        <button
                            type="button"
                            aria-pressed={modoDuplicado}
                            onClick={() => {
                                setModoDuplicado(true);
                                hablar('Mostrando copia oficial para el Centro de Salud');
                            }}
                            className={`flex min-h-[56px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold transition-all active:scale-[0.98] sm:flex-initial ${modoDuplicado ? 'bg-[#9D2449] text-white shadow-md' : 'text-slate-700 hover:bg-white/70'}`}
                        >
                            <Building2 className="h-5 w-5" />
                            <span>Copia para Centro de Salud</span>
                        </button>
                    </div>
                </div>

                {modoDuplicado && (
                    <div className="cm-fade overflow-hidden rounded-3xl border-2 border-amber-400 bg-amber-50/95 shadow-xl">
                        <TriStripe className="h-1.5" />
                        <div className="flex items-center justify-between gap-4 p-4 md:p-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-amber-400 p-3 text-slate-950 shadow-md">
                                    <Building2 className="h-7 w-7" />
                                </div>
                                <div>
                                    <span className="mb-1 inline-block rounded-full border border-amber-400 bg-amber-200 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                                        Duplicado Oficial SSO
                                    </span>
                                    <h4 className="text-base font-black text-amber-950">Copia Oficial para Enviar al Centro de Salud</h4>
                                    <p className="text-sm font-medium text-amber-800">
                                        Expediente oficial de reporte mensual de atención materna para los Servicios de Salud de Oaxaca.
                                    </p>
                                </div>
                            </div>
                            <span className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-amber-400/60 bg-amber-300/40 px-4 py-2 text-xs font-extrabold text-amber-900 md:inline-flex">
                                <Award className="h-4 w-4" /> Copia Institucional
                            </span>
                        </div>
                    </div>
                )}

                {/* ═══ DATOS DE IDENTIFICACIÓN ═══ */}
                <SectionCard
                    icon={<User className="h-6 w-6" />}
                    title="Datos de Identificación de la Paciente"
                    subtitle="Presione el micrófono guinda junto a cada campo para dictar con su voz"
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <VoiceField
                            id="nombreMujer"
                            label="Nombre de la Mujer"
                            required
                            placeholder="Nombre completo de la mujer..."
                            value={nombreMujer}
                            onChange={setNombreMujer}
                            onMic={() => startVoice(setNombreMujer, 'nombreMujer')}
                            listening={listeningField === 'nombreMujer'}
                            className="md:col-span-2"
                        />
                        <VoiceField
                            id="edad"
                            label="Edad (Años)"
                            type="number"
                            inputMode="numeric"
                            value={edad}
                            onChange={setEdad}
                            onMic={() => startVoice((v) => setEdad(v.replace(/\D/g, '').slice(0, 3)), 'edad')}
                            listening={listeningField === 'edad'}
                        />
                        <VoiceField
                            id="fecha"
                            label="Fecha de Consulta"
                            type="date"
                            value={fecha}
                            onChange={setFecha}
                            onMic={() => startVoice(setFecha, 'fecha')}
                            listening={listeningField === 'fecha'}
                        />
                        <VoiceField
                            id="localidad"
                            label="Localidad"
                            value={localidad}
                            onChange={setLocalidad}
                            onMic={() => startVoice(setLocalidad, 'localidad')}
                            listening={listeningField === 'localidad'}
                        />
                        <VoiceField
                            id="municipio"
                            label="Municipio"
                            value={municipio}
                            onChange={setMunicipio}
                            onMic={() => startVoice(setMunicipio, 'municipio')}
                            listening={listeningField === 'municipio'}
                        />
                    </div>
                </SectionCard>

                {/* ═══ 1. EMBARAZO NORMAL Y CONTROL PRENATAL ═══ */}
                <SectionCard
                    tone="emerald"
                    icon={<Calendar className="h-6 w-6" />}
                    title="1. Embarazo Normal y Control Prenatal"
                    subtitle="Selección de mes gestacional, micronutrientes, vacuna anti-tetánica y semáforo nutricional"
                >
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 lg:col-span-2">
                            <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
                                <img src="/EmbarazoNormal.png" alt="" className="h-24 shrink-0 object-contain mix-blend-multiply" />
                                <div>
                                    <h4 className="text-base font-black text-slate-900">Embarazo Normal (Evolución Fisiológica)</h4>
                                    <p className="text-sm font-medium text-slate-600">Seleccione el mes de gestación activo (1º al 9º Mes)</p>
                                </div>
                            </div>
                            <p className="text-xs font-black uppercase text-slate-700">Mes de embarazo activo:</p>
                            <div className="grid grid-cols-3 gap-3">
                                {MESES.map((m) => (
                                    <ChoiceCard
                                        key={m}
                                        active={mesSeleccionado === m}
                                        onClick={() => setMesSeleccionado(m)}
                                        title={`${m}º Mes`}
                                        tone="guinda"
                                        className="min-h-[72px] text-lg"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ChoiceCard
                                active={acidoFolico}
                                onClick={() => setAcidoFolico(!acidoFolico)}
                                title="Ácido Fólico (30 Días)"
                                subtitle={acidoFolico ? 'Entregado' : 'Pendiente'}
                                img="/DuranteElEmbarazo-PrimerosMeses.png"
                                imgClassName="h-14"
                                icon={<Pill className="h-5 w-5 shrink-0 text-emerald-700" />}
                                tone="emerald"
                                layout="row"
                                className="min-h-[96px]"
                            />
                            <ChoiceCard
                                active={hierro}
                                onClick={() => setHierro(!hierro)}
                                title="Sulfato Ferroso"
                                subtitle={hierro ? 'Entregado' : 'Pendiente'}
                                img="/DuranteElEmbarazo.png"
                                imgClassName="h-14"
                                icon={<Droplet className="h-5 w-5 shrink-0 text-rose-700" />}
                                tone="emerald"
                                layout="row"
                                className="min-h-[96px]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 md:grid-cols-2">
                        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                            <div className="flex items-center gap-4">
                                <img src="/Aplicar-Toxoide-Tetanico.png" alt="" className="h-20 shrink-0 object-contain mix-blend-multiply" />
                                <h4 className="text-sm font-black uppercase text-slate-900">Vacunación Anti-Tetánica (Td/Tdap)</h4>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {VACUNAS.map((v) => (
                                    <ChoiceCard
                                        key={v.id}
                                        active={vacunaTetanos === v.id}
                                        onClick={() => setVacunaTetanos(v.id)}
                                        title={v.label}
                                        className="px-2"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                            <div className="flex items-center gap-2">
                                <Ruler className="h-5 w-5 text-slate-700" />
                                <h4 className="text-sm font-black uppercase text-slate-900">Estado Nutricional Madre (Cinta MUAC Tricolor)</h4>
                            </div>
                            <SemaforoMUAC value={cintaMUAC} onChange={setCintaMUAC} label="Estado nutricional de la madre" />
                        </div>
                    </div>
                </SectionCard>

                {/* ═══ 2. EMBARAZO CON COMPLICACIONES (MAPA RADIAL) ═══ */}
                <SectionCard
                    icon={<AlertTriangle className="h-6 w-6" />}
                    title="2. Embarazo con Complicaciones (Mapa Radial de Síntomas)"
                    subtitle="Seleccione las tarjetas de signos de alarma identificados durante la valoración"
                    action={<ReferidoToggle label="Referido:" value={referidoEmbarazo} onChange={setReferidoEmbarazo} />}
                >
                    <div className="relative overflow-hidden rounded-3xl border-2 border-rose-200 bg-rose-50/60 p-4 md:p-8">
                        <svg
                            className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            {CONECTORES.map(([x, y], i) => (
                                <line
                                    key={i}
                                    x1="50"
                                    y1="50"
                                    x2={x}
                                    y2={y}
                                    stroke="#9D2449"
                                    strokeWidth="2"
                                    strokeDasharray="6 5"
                                    strokeLinecap="round"
                                    opacity="0.35"
                                    vectorEffect="non-scaling-stroke"
                                />
                            ))}
                        </svg>

                        <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6 md:gap-x-6 md:gap-y-8">
                            {SINTOMAS_SUPERIORES.map((s) => renderSintoma(s, 'md:col-span-2'))}
                            {renderSintoma(SINTOMA_IZQUIERDO, 'md:col-span-2')}

                            <div className="order-first flex flex-col items-center justify-center gap-2 rounded-3xl border-4 border-[#9D2449] bg-gradient-to-b from-rose-50 to-rose-200 p-5 text-center shadow-2xl sm:col-span-2 md:order-none md:col-span-2">
                                <div className="animate-pulse rounded-full bg-[#9D2449] p-2 text-white shadow-md">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <img src="/EmbarazoConComplicaciones.png" alt="" className="my-1 h-28 object-contain mix-blend-multiply" />
                                <span className="rounded-full bg-[#9D2449] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md">
                                    Embarazo con Complicaciones
                                </span>
                                <p className="max-w-xs text-xs font-bold text-rose-950">
                                    Identificación de Signos de Alarma Materna durante la Valoración
                                </p>
                            </div>

                            {renderSintoma(SINTOMA_DERECHO, 'md:col-span-2')}
                            {SINTOMAS_INFERIORES.map((s, i) => renderSintoma(s, i === 0 ? 'md:col-span-2 md:col-start-2' : 'md:col-span-2'))}
                        </div>
                    </div>
                </SectionCard>

                {/* ═══ 3. ABORTO, DOLOR Y HEMORRAGIA ═══ */}
                <SectionCard
                    icon={<ShieldAlert className="h-6 w-6" />}
                    title="3. Aborto, Dolor y Hemorragia"
                    subtitle="Evaluación de complicaciones hemorrágicas o dolor agudo"
                    action={<ReferidoToggle label="Ref. SI / NO:" value={referidoAborto} onChange={setReferidoAborto} />}
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        {TARJETAS_ABORTO.map((item) => (
                            <ChoiceCard
                                key={item.id}
                                active={tarjetasAborto.includes(item.id)}
                                onClick={() => toggleTarjetaAborto(item.id)}
                                title={item.title}
                                img={item.img}
                                imgClassName="h-24"
                                footer={{ off: 'Marcar', on: 'Registrado' }}
                                className="p-5"
                            />
                        ))}
                    </div>
                </SectionCard>

                {/* ═══ 4. PARTO NORMAL ═══ */}
                <SectionCard
                    tone="purple"
                    icon={<HeartPulse className="h-6 w-6" />}
                    title="4. Parto Normal (Posición Vertical y Horizontal)"
                    subtitle="Registro de posición del parto y resultado del recién nacido"
                >
                    <div className="space-y-5">
                        {FILAS_PARTO.map((fila) => {
                            const filaActiva = partoNormalPosicion === fila.pos;
                            return (
                                <div
                                    key={fila.pos}
                                    className={`grid items-center gap-5 rounded-2xl border-2 p-4 transition-all md:grid-cols-[1fr_auto] md:p-5 ${filaActiva ? 'border-purple-600 bg-purple-50/80 shadow-lg' : 'border-slate-200 bg-slate-50/70'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <img src={fila.img} alt="" className="h-24 shrink-0 object-contain mix-blend-multiply" />
                                        <div>
                                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black uppercase text-purple-900">
                                                {fila.etiqueta}
                                            </span>
                                            <h4 className="mt-1.5 text-base font-black text-slate-900">{fila.titulo}</h4>
                                            <p className="text-sm font-medium text-slate-600">{fila.descripcion}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 md:w-[400px]">
                                        {RESULTADOS_PARTO.map((r) => (
                                            <ChoiceCard
                                                key={r.id}
                                                active={filaActiva && partoNormalResultado === r.id}
                                                onClick={() => {
                                                    setPartoNormalPosicion(fila.pos);
                                                    setPartoNormalResultado(r.id);
                                                }}
                                                title={r.titulo}
                                                img={r.img}
                                                imgClassName="h-12"
                                                icon={<Baby className={`h-5 w-5 shrink-0 ${r.tone === 'sky' ? 'text-sky-600' : 'text-pink-500'}`} />}
                                                tone={r.tone}
                                                layout="row"
                                                className="min-h-[80px] px-3"
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>

                {/* ═══ 5. PARTO COMPLICADO ═══ */}
                <SectionCard
                    icon={<AlertTriangle className="h-6 w-6" />}
                    title="5. Parto Complicado (Resultado de Nacimiento)"
                    subtitle="Seleccione si el nacimiento presentó complicaciones o defunción"
                    action={<ReferidoToggle label="Referido:" value={referidoPartoComplicado} onChange={setReferidoPartoComplicado} />}
                >
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {OPCIONES_PARTO_COMPLICADO.map((item) => {
                            const activo = partoComplicadoOpcion === item.id;
                            return (
                                <ChoiceCard
                                    key={item.id}
                                    active={activo}
                                    onClick={() => setPartoComplicadoOpcion(activo ? null : item.id)}
                                    title={item.title}
                                    img={item.img}
                                    imgClassName="h-20"
                                    className="h-full"
                                />
                            );
                        })}
                    </div>
                </SectionCard>

                {/* ═══ 6. PUERPERIO NORMAL Y COMPLICADO ═══ */}
                <SectionCard
                    tone="emerald"
                    icon={<HeartPulse className="h-6 w-6" />}
                    title="6. Puerperio Normal y Complicado (Primeros 40 Días Postparto)"
                    subtitle="Monitoreo nutricional y detección de complicaciones puerperales"
                >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                            <div className="flex items-center gap-2">
                                <Ruler className="h-5 w-5 text-slate-700" />
                                <h4 className="text-sm font-black uppercase text-slate-900">Puerperio Normal (Cinta MUAC Tricolor)</h4>
                            </div>
                            <p className="text-sm font-medium text-slate-600">Evaluación del estado nutricio posparto materna</p>
                            <SemaforoMUAC value={cintaMUACPuerperio} onChange={setCintaMUACPuerperio} label="Estado nutricional en puerperio" />
                        </div>

                        <div className="space-y-4 rounded-2xl border-2 border-rose-200 bg-rose-50/70 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="text-sm font-black uppercase text-rose-950">Puerperio Complicado</span>
                                <ReferidoToggle label="Ref:" value={referidoPuerperio} onChange={setReferidoPuerperio} />
                            </div>
                            <div className="flex items-center gap-4">
                                <img src="/PuerpericoComplicado.png" alt="" className="h-24 shrink-0 object-contain mix-blend-multiply" />
                                <div className="flex-1 space-y-3">
                                    {CHECKS_PUERPERIO.map((chk) => (
                                        <ChoiceCard
                                            key={chk.id}
                                            active={puerperioCheckboxes.includes(chk.id)}
                                            onClick={() => togglePuerperioCheckbox(chk.id)}
                                            title={chk.label}
                                            layout="row"
                                            className="min-h-[72px]"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* ═══ 7. MUERTE MATERNA ═══ */}
                <SectionCard
                    className="!border-rose-200 !bg-rose-50/70"
                    icon={<ShieldAlert className="h-6 w-6" />}
                    title="7. Muerte Materna (Alerta Epidemiológica Médica)"
                    subtitle="Registro prioritario inmediato ante fallecimiento materno acontecido en la comunidad"
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        {ETAPAS_MUERTE_MATERNA.map((item) => {
                            const activo = muerteMaternaEtapa === item.id;
                            return (
                                <ChoiceCard
                                    key={item.id}
                                    active={activo}
                                    onClick={() => setMuerteMaternaEtapa(activo ? null : item.id)}
                                    title={item.title}
                                    img={item.img}
                                    imgClassName="h-24"
                                    footer={{ off: 'Notificar', on: 'Notificado', offIcon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> }}
                                    className="p-5"
                                />
                            );
                        })}
                    </div>
                </SectionCard>

                {/* ═══ 8. CIERRE ADMINISTRATIVO Y ENVÍO ═══ */}
                <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 text-white shadow-2xl backdrop-blur-md">
                    <TriStripe />
                    <div className="space-y-6 p-5 md:p-8">
                        <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/20 p-3 text-amber-400">
                                <PenTool className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">Cierre Administrativo del Informe Materno (Formato 2)</h3>
                                <p className="text-sm text-slate-400">
                                    Ingrese datos de la partera acreditada, localidad, municipio y validación por huella digital
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {camposCierre.map((c) => (
                                <VoiceField
                                    key={c.key}
                                    id={c.key}
                                    label={c.label}
                                    dark
                                    value={c.value}
                                    onChange={c.set}
                                    onMic={() => startVoice(c.set, c.key)}
                                    listening={listeningField === c.key}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            aria-pressed={huellaRegistrada}
                            onClick={() => {
                                setHuellaRegistrada(!huellaRegistrada);
                                hablar(huellaRegistrada ? 'Huella removida' : 'Huella digital registrada');
                            }}
                            className={`flex min-h-[72px] w-full cursor-pointer items-center justify-center gap-3 rounded-2xl px-6 text-base font-extrabold shadow-lg transition-all active:scale-[0.98] md:w-auto ${huellaRegistrada ? 'bg-emerald-500 text-white ring-4 ring-emerald-400/40' : 'bg-amber-400 text-slate-950 hover:bg-amber-300'}`}
                        >
                            <Fingerprint className="h-7 w-7" />
                            <span>{huellaRegistrada ? 'HUELLA DIGITAL CAPTURADA' : 'CAPTURAR HUELLA DIGITAL DE LA PARTERA'}</span>
                            {huellaRegistrada && <Check className="h-6 w-6" strokeWidth={3} />}
                        </button>

                        {errorEnvio && (
                            <div role="alert" className="cm-fade flex items-start gap-3 rounded-2xl border border-rose-400/60 bg-rose-950/60 p-4 text-sm font-bold text-rose-100">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                                <span>{errorEnvio}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex min-h-[72px] w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-rose-300 bg-[#9D2449] px-4 py-4 text-lg font-extrabold text-white shadow-xl transition-all hover:bg-[#7A1B38] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 md:text-xl"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>Guardando en PostgreSQL (Render)...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="h-6 w-6" />
                                    <span>REGISTRAR CALENDARIO DE LA MUJER (FORMATO 2)</span>
                                </>
                            )}
                        </button>
                    </div>
                </section>
            </form>

            {/* ═══ MODAL DE ÉXITO ═══ */}
            {exito && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="cm-exito-titulo"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
                >
                    <div className="cm-pop w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
                        <TriStripe className="h-2.5" />
                        <div className="space-y-5 p-8 text-center">
                            <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300/50" />
                                <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl">
                                    <CheckCircle2 className="h-14 w-14" strokeWidth={2.5} />
                                </span>
                            </div>
                            <div className="space-y-2">
                                <h4 id="cm-exito-titulo" className="text-2xl font-black text-slate-900">¡Registro guardado!</h4>
                                <p className="text-base font-medium text-slate-600">
                                    El Calendario de Atención a la Mujer se guardó correctamente en la base de datos (PostgreSQL · Render).
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={cerrarExito}
                                className="min-h-[64px] w-full cursor-pointer rounded-2xl bg-[#9D2449] text-lg font-extrabold text-white shadow-lg transition-all hover:bg-[#7A1B38] active:scale-[0.98]"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CalendarioMujer;