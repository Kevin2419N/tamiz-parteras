import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    HeartPulse,
    Mic,
    Square,
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
    Volume2
} from 'lucide-react';
import { handleVoiceInput } from '../../utils/voiceUtils';
import { http } from '../../services/http';

/* ============================================================================
 * CalendarioMujer — mismo sistema de diseño que MotivoReferencia
 * (vidrio, paleta tierra, tarjetas con check esmeralda, campos con mic interno)
 * ========================================================================== */

/* ------------------------------ Tipos ------------------------------------ */
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
type Tono = 'terracota' | 'verde';
type Acento = 'ocre' | 'terracota' | 'verde';

interface ItemCatalogo {
    id: string;
    img: string;
    label: string;
}

interface ErrorServidor {
    message?: string;
}

/* ------------------------------ Catálogos -------------------------------- */
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
        on: 'border-emerald-700 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-900/30',
        off: 'border-emerald-200 bg-emerald-50 text-stone-900 hover:border-emerald-500'
    },
    {
        id: 'AMARILLO',
        titulo: 'Amarillo',
        estado: 'Riesgo',
        on: 'border-[#9A6A0F] bg-gradient-to-br from-[#E3AE3A] to-[#D69A1E] text-stone-900 shadow-lg shadow-amber-900/30',
        off: 'border-amber-200 bg-amber-50 text-stone-900 hover:border-[#D69A1E]'
    },
    {
        id: 'ROJO',
        titulo: 'Rojo',
        estado: 'Desnutrición',
        on: 'border-red-800 bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-900/30',
        off: 'border-red-200 bg-red-50 text-stone-900 hover:border-red-500'
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

// Centros (en %) de cada tarjeta del mapa radial, para los conectores SVG
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

const RESULTADOS_PARTO: { id: ResultadoParto; titulo: string; img: string }[] = [
    { id: 'NINO_VIVO', titulo: 'Niño Vivo', img: '/NiñoVivo.png' },
    { id: 'NINA_VIVA', titulo: 'Niña Viva', img: '/NiñaViva.png' }
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
    'Primero escriba o dicte los datos de la paciente: presione el botón con el micrófono dentro de cada campo y hable con claridad. ' +
    'Después seleccione el mes de embarazo, la vacuna y el color de la cinta de medición. ' +
    'Si detecta signos de alarma, toque los dibujos que correspondan y marque si fue referida. ' +
    'Registre el tipo de parto y el resultado del recién nacido, y revise el puerperio. ' +
    'Al final capture la huella digital de la partera y presione el botón grande para registrar el calendario.';

/* --------------------------- Estilos / animación -------------------------- */
const ESTILOS = `
@keyframes pt-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes pt-slide-up { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pt-pop-in { 0% { opacity: 0; transform: scale(.4) } 70% { transform: scale(1.18) } 100% { opacity: 1; transform: scale(1) } }
@keyframes pt-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.03) } }
@keyframes pt-wave { 0%,100% { transform: scaleY(.25) } 50% { transform: scaleY(1) } }
@keyframes pt-ring { 0% { box-shadow: 0 0 0 0 rgba(194,96,58,.55) } 100% { box-shadow: 0 0 0 14px rgba(194,96,58,0) } }
@keyframes pt-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } }
.pt-fade-in { animation: pt-fade-in .5s ease-out both }
.pt-slide-up { animation: pt-slide-up .55s cubic-bezier(.22,1,.36,1) both }
.pt-pop-in { animation: pt-pop-in .38s cubic-bezier(.34,1.56,.64,1) both }
.pt-breathe { animation: pt-breathe 2.8s ease-in-out infinite }
.pt-ring { animation: pt-ring 1.2s ease-out infinite }
.pt-shake { animation: pt-shake .4s ease-in-out }
.pt-wave-bar { display: inline-block; width: 4px; height: 20px; border-radius: 4px; background: #C2603A; transform-origin: center; animation: pt-wave .9s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .pt-fade-in, .pt-slide-up, .pt-pop-in, .pt-breathe, .pt-ring, .pt-shake, .pt-wave-bar { animation: none !important }
}
`;

const VIDRIO =
    'bg-white/85 backdrop-blur-md border border-white/70 shadow-2xl shadow-orange-900/10 rounded-3xl';

const BOTON_TIERRA =
    'bg-gradient-to-br from-[#D69A1E] via-[#CC7A2C] to-[#C2603A] text-white shadow-xl shadow-orange-900/40 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl active:scale-[0.98]';

const CLASE_SELECTOR =
    'h-16 w-full rounded-2xl border-2 border-stone-200 bg-white/90 px-4 text-lg font-bold text-stone-900 outline-none transition-all duration-200 focus:border-[#C2603A] focus:ring-4 focus:ring-[#C2603A]/20';

const CLASE_ETIQUETA = 'mb-1.5 block text-sm font-bold uppercase tracking-wide text-stone-800';

const ACENTOS: Record<Acento, { borde: string; icono: string }> = {
    ocre: { borde: 'border-[#D69A1E]/60', icono: 'from-[#D69A1E] to-[#CC7A2C]' },
    terracota: { borde: 'border-[#C2603A]/60', icono: 'from-[#CC7A2C] to-[#C2603A]' },
    verde: { borde: 'border-[#5E8C61]/60', icono: 'from-[#5E8C61] to-[#3F7048]' }
};

/* ------------------------- Componentes reutilizables ---------------------- */
const TriStripe: React.FC<{ className?: string }> = ({ className = 'h-1.5' }) => (
    <div className={`w-full bg-gradient-to-r from-[#5E8C61] via-[#D69A1E] to-[#C2603A] ${className}`} aria-hidden="true" />
);

const Imagen: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
    const [fallo, setFallo] = useState(false);
    if (fallo) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 px-2 text-center text-xs font-bold text-stone-600">
                Imagen no disponible
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            draggable={false}
            onError={() => setFallo(true)}
            className="max-h-full max-w-full object-contain mix-blend-multiply"
        />
    );
};

interface CampoVozProps {
    id: string;
    etiqueta: string;
    valor: string;
    placeholder: string;
    escuchando: boolean;
    onCambio: (valor: string) => void;
    onMic: () => void;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    error?: boolean;
    maxLength?: number;
    oscuro?: boolean;
    className?: string;
}

const CampoVoz: React.FC<CampoVozProps> = ({
    id,
    etiqueta,
    valor,
    placeholder,
    escuchando,
    onCambio,
    onMic,
    inputMode,
    error = false,
    maxLength,
    oscuro = false,
    className = ''
}) => {
    const base = oscuro
        ? 'h-16 w-full rounded-2xl border-2 bg-stone-800/90 px-4 pr-20 text-lg font-bold text-white placeholder:font-semibold placeholder:text-stone-400 outline-none transition-all duration-200 focus:border-[#D69A1E] focus:ring-4 focus:ring-[#D69A1E]/25'
        : 'h-16 w-full rounded-2xl border-2 bg-white/90 px-4 pr-20 text-lg font-bold text-stone-900 placeholder:font-semibold placeholder:text-stone-500 outline-none transition-all duration-200 focus:border-[#C2603A] focus:ring-4 focus:ring-[#C2603A]/20';
    const borde = escuchando
        ? oscuro
            ? 'border-[#D69A1E] ring-4 ring-[#D69A1E]/30'
            : 'border-[#C2603A] ring-4 ring-[#C2603A]/25 bg-orange-50/90'
        : error
            ? 'border-red-500 pt-shake'
            : oscuro
                ? 'border-stone-600'
                : 'border-stone-200';

    return (
        <div className={className}>
            <label htmlFor={`cm-${id}`} className={oscuro ? 'mb-1.5 block text-sm font-bold uppercase tracking-wide text-stone-300' : CLASE_ETIQUETA}>
                {etiqueta}
            </label>
            <div className="relative">
                <input
                    id={`cm-${id}`}
                    type="text"
                    inputMode={inputMode}
                    value={valor}
                    maxLength={maxLength}
                    placeholder={escuchando ? 'Escuchando… hable ahora' : placeholder}
                    onChange={(e) => onCambio(e.target.value)}
                    autoComplete="off"
                    aria-invalid={error}
                    className={`${base} ${borde}`}
                />

                {escuchando && (
                    <div className="pt-fade-in pointer-events-none absolute right-[4.25rem] top-1/2 flex -translate-y-1/2 items-center gap-1" aria-hidden="true">
                        {[0, 0.15, 0.3, 0.1, 0.25].map((d, i) => (
                            <span key={i} className="pt-wave-bar" style={{ animationDelay: `${d}s` }} />
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={onMic}
                    aria-label={escuchando ? `Detener dictado de ${etiqueta}` : `Dictar ${etiqueta} por voz`}
                    aria-pressed={escuchando}
                    className={`absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl text-white shadow-md transition-all duration-200 active:scale-[0.96] ${escuchando ? 'pt-ring bg-[#C2603A]' : 'bg-gradient-to-br from-[#D69A1E] to-[#C2603A] hover:shadow-lg'}`}
                >
                    {escuchando ? <Square className="h-5 w-5 fill-current" /> : <Mic className="h-6 w-6" strokeWidth={2.4} />}
                </button>
            </div>
        </div>
    );
};

interface SectionCardProps {
    icon: React.ReactNode;
    acento?: Acento;
    title: string;
    subtitle: string;
    action?: React.ReactNode;
    delay?: number;
    className?: string;
    children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, acento = 'ocre', title, subtitle, action, delay = 0.05, className = '', children }) => {
    const a = ACENTOS[acento];
    return (
        <section className={`pt-slide-up p-4 sm:p-6 ${VIDRIO} ${className}`} style={{ animationDelay: `${delay}s` }}>
            <div className={`mb-5 flex flex-col gap-3 border-b-4 pb-3 sm:flex-row sm:items-end sm:justify-between ${a.borde}`}>
                <div className="flex items-center gap-3">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-orange-900/25 ${a.icono}`}>
                        {icon}
                    </span>
                    <div>
                        <h2 className="text-xl font-black leading-tight text-stone-900 sm:text-2xl">{title}</h2>
                        <p className="text-sm font-bold text-stone-700">{subtitle}</p>
                    </div>
                </div>
                {action}
            </div>
            <div className="space-y-5">{children}</div>
        </section>
    );
};

const ContadorPill: React.FC<{ total: number }> = ({ total }) => (
    <span className="self-start rounded-full border border-[#D69A1E]/50 bg-amber-100 px-4 py-1.5 text-sm font-black text-stone-900 sm:self-auto">
        Seleccionados: {total}
    </span>
);

const ReferidoToggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
    <div role="group" aria-label={label} className="inline-flex items-center gap-1.5 self-start rounded-2xl border-2 border-stone-200 bg-white/70 p-1.5 sm:self-auto">
        <span className="px-2 text-xs font-black uppercase text-stone-800">{label}</span>
        <button
            type="button"
            aria-pressed={!value}
            onClick={() => onChange(false)}
            className={`min-h-[56px] min-w-[72px] cursor-pointer rounded-xl border-2 px-5 text-sm font-black transition-all duration-200 active:scale-[0.98] ${!value ? 'border-stone-700 bg-stone-700 text-white shadow-md' : 'border-transparent text-stone-700 hover:bg-amber-50'}`}
        >
            NO
        </button>
        <button
            type="button"
            aria-pressed={value}
            onClick={() => onChange(true)}
            className={`flex min-h-[56px] min-w-[80px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 px-5 text-sm font-black transition-all duration-200 active:scale-[0.98] ${value ? 'border-[#9A4A2A] bg-gradient-to-br from-[#D69A1E] via-[#CC7A2C] to-[#C2603A] text-white shadow-md' : 'border-transparent text-stone-700 hover:bg-amber-50'}`}
        >
            <span>SÍ</span>
            <AlertTriangle className={`h-4 w-4 ${value ? 'text-white' : 'text-[#D69A1E]'}`} />
        </button>
    </div>
);

interface TarjetaOpcionProps {
    activo: boolean;
    onClick: () => void;
    titulo: string;
    subtitulo?: string;
    img?: string;
    altoImg?: string;
    icono?: React.ReactNode;
    tono?: Tono;
    disposicion?: 'columna' | 'fila';
    pie?: { off: string; on: string; iconoOff?: React.ReactNode };
    className?: string;
}

const TarjetaOpcion: React.FC<TarjetaOpcionProps> = ({
    activo,
    onClick,
    titulo,
    subtitulo,
    img,
    altoImg = 'h-28',
    icono,
    tono = 'terracota',
    disposicion = 'columna',
    pie,
    className = ''
}) => {
    const fila = disposicion === 'fila';
    const seleccionada =
        tono === 'verde'
            ? '-translate-y-1 border-[#5E8C61] bg-gradient-to-b from-emerald-50 to-green-100 shadow-xl shadow-emerald-900/20'
            : '-translate-y-1 border-[#C2603A] bg-gradient-to-b from-orange-50 to-amber-100 shadow-xl shadow-orange-900/25';
    const normal =
        'border-stone-200 bg-gradient-to-b from-white to-amber-50/70 shadow-md hover:-translate-y-1 hover:shadow-xl';

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={activo}
            className={`relative min-h-[72px] w-full cursor-pointer touch-manipulation select-none rounded-3xl border-4 p-3 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C2603A]/40 active:scale-[0.98] ${activo ? seleccionada : normal} ${fila
                ? 'flex items-center gap-3 text-left'
                : `flex flex-col items-center gap-2 text-center ${img || pie ? 'justify-between' : 'justify-center'}`
                } ${className}`}
        >
            {activo && (
                <span className={`pt-pop-in absolute -right-2 -top-2 z-10 flex items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-lg shadow-emerald-700/40 ${img ? 'h-10 w-10' : 'h-8 w-8'}`}>
                    <Check className={img ? 'h-6 w-6' : 'h-5 w-5'} strokeWidth={3.5} />
                </span>
            )}

            {img && (
                <span className={`flex items-center justify-center overflow-hidden bg-white p-2 shadow-inner ring-1 ring-amber-200/70 ${fila ? 'h-16 w-16 shrink-0 rounded-xl' : `w-full rounded-2xl ${altoImg}`}`}>
                    <Imagen src={img} alt={titulo} />
                </span>
            )}

            <span className={`flex flex-col gap-0.5 ${fila ? 'min-w-0 flex-1' : 'flex-1 items-center justify-center'}`}>
                <span className={`font-black leading-tight text-stone-900 ${img && !fila ? 'text-sm uppercase' : 'text-base'}`}>{titulo}</span>
                {subtitulo && <span className="text-sm font-bold text-stone-700">{subtitulo}</span>}
            </span>

            {icono}

            {pie && (
                <span className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black uppercase ${activo ? 'bg-[#C2603A] text-white' : 'border border-[#D69A1E]/40 bg-amber-100 text-stone-800'}`}>
                    <span>{activo ? pie.on : pie.off}</span>
                    {activo ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : pie.iconoOff}
                </span>
            )}
        </button>
    );
};

const SemaforoMUAC: React.FC<{ value: Muac; onChange: (v: Muac) => void; label: string }> = ({ value, onChange, label }) => (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2 rounded-2xl bg-white/60 p-2 ring-1 ring-stone-200">
        {SEMAFORO.map((s) => {
            const activo = value === s.id;
            return (
                <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => onChange(s.id)}
                    className={`relative flex min-h-[88px] cursor-pointer touch-manipulation flex-col items-center justify-center gap-0.5 rounded-2xl border-4 px-2 py-3 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${activo ? s.on : s.off}`}
                >
                    {activo && (
                        <span className="pt-pop-in absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-stone-200 bg-white text-stone-900 shadow-lg">
                            <Check className="h-5 w-5" strokeWidth={3.5} />
                        </span>
                    )}
                    <span className="text-sm font-black uppercase tracking-wider">{s.titulo}</span>
                    <span className="text-xs font-bold opacity-90">{s.estado}</span>
                </button>
            );
        })}
    </div>
);

/* ------------------------------ Componente -------------------------------- */
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

    // Estado de UI (no afecta el payload)
    const [hablando, setHablando] = useState(false);
    const [exito, setExito] = useState(false);
    const [errorServidor, setErrorServidor] = useState<string | null>(null);
    const [errorNombre, setErrorNombre] = useState(false);

    const temporizadorRef = useRef<number | null>(null);
    const montadoRef = useRef(true);

    useEffect(() => {
        montadoRef.current = true;
        return () => {
            montadoRef.current = false;
            if (temporizadorRef.current !== null) window.clearTimeout(temporizadorRef.current);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    /* ----- Voz de salida (usa la del contenedor; si no, la del navegador) -- */
    const speakText = useCallback(
        (texto: string) => {
            if (hablarTexto) {
                hablarTexto(texto);
                return;
            }
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(texto);
            u.lang = 'es-MX';
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
        },
        [hablarTexto]
    );

    /* ----- "Escuchar instrucciones" (siempre es-MX) ----- */
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

    /* ----- Dictado: ondas en vivo + acuse auditivo al terminar ----- */
    const startVoice = (setter: (val: string) => void, fieldKey: string) => {
        let ultimo = '';
        let inicio = false;
        handleVoiceInput(
            (val) => {
                ultimo = val;
                setter(val);
            },
            (l) => {
                setListeningField(l ? fieldKey : null);
                if (l) {
                    inicio = true;
                } else if (inicio) {
                    inicio = false;
                    if (ultimo) speakText(`Registrado: ${ultimo}`);
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

    const enfocar = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el instanceof HTMLInputElement) el.focus({ preventScroll: true });
    };

    // Conexión real con el backend y PostgreSQL
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting || exito) return;
        setErrorServidor(null);

        if (!nombreMujer.trim()) {
            setErrorNombre(true);
            speakText('Falta el nombre de la mujer.');
            enfocar('cm-nombreMujer');
            return;
        }

        setIsSubmitting(true);

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
            if (!montadoRef.current) return;

            setExito(true);
            speakText('Calendario de atención a la mujer registrado y guardado exitosamente en la base de datos.');
            temporizadorRef.current = window.setTimeout(() => {
                if (!montadoRef.current) return;
                setExito(false);
                if (onSuccess) onSuccess();
            }, 2600);
        } catch (err: unknown) {
            console.error('Error al guardar calendario de la mujer:', err);
            const mensaje =
                (axios.isAxiosError<ErrorServidor>(err) ? err.response?.data?.message : undefined) ??
                'Error al conectar con el servidor para guardar el calendario. Revise su señal e intente de nuevo.';
            if (montadoRef.current) {
                setErrorServidor(mensaje);
                speakText('No se pudo guardar el calendario. Revise su señal e intente de nuevo.');
            }
        } finally {
            if (montadoRef.current) setIsSubmitting(false);
        }
    };

    const renderSintoma = (item: ItemCatalogo, extra = '') => (
        <TarjetaOpcion
            key={item.id}
            activo={sintomasComplicaciones.includes(item.id)}
            onClick={() => toggleSintoma(item.id)}
            titulo={item.label}
            img={item.img}
            altoImg="h-24"
            pie={{ off: 'Seleccionar', on: 'Seleccionado' }}
            className={`h-full ${extra}`}
        />
    );

    const camposCierre = [
        { key: 'nombrePartera', label: 'Nombre de la partera', ph: 'Partera tradicional…', value: nombrePartera, set: setNombrePartera },
        { key: 'cierreLocalidad', label: 'Localidad', ph: 'Localidad…', value: cierreLocalidad, set: setCierreLocalidad },
        { key: 'noMunicipio', label: 'No. Municipio', ph: 'Número de municipio…', value: noMunicipio, set: setNoMunicipio },
        { key: 'mesInformado', label: 'Mes informado', ph: 'Mes informado…', value: mesInformado, set: setMesInformado },
        { key: 'nombreSupervisor', label: 'Nombre del supervisor', ph: 'Nombre del supervisor…', value: nombreSupervisor, set: setNombreSupervisor },
        { key: 'centroSalud', label: 'Centro de salud', ph: 'Centro de salud…', value: centroSalud, set: setCentroSalud }
    ];

    /* ------------------------------ Render ---------------------------------- */
    return (
        <form onSubmit={handleSubmit} noValidate className="mx-auto flex w-full max-w-5xl flex-col gap-5">
            <style>{ESTILOS}</style>

            {/* ================= Cabecera institucional ================= */}
            <header className={`pt-slide-up overflow-hidden ${VIDRIO}`}>
                <TriStripe />
                <div className="grid grid-cols-1 items-center gap-4 p-4 sm:p-6 md:grid-cols-[auto_1fr_auto]">
                    <div className="flex items-center justify-center gap-3">
                        <img src="/logo-jurisdiccion.png" alt="Jurisdicción Sanitaria" className="h-14 w-auto object-contain mix-blend-multiply md:h-16" />
                        <img src="/Logo-Secretaria.png" alt="Secretaría de Salud de Oaxaca" className="h-14 w-auto object-contain mix-blend-multiply md:h-16" />
                    </div>

                    <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C2603A]">
                            Programa de Parteras Tradicionales
                        </p>
                        <h1 className="mt-1 text-lg font-black uppercase leading-tight text-stone-900 sm:text-2xl">
                            Servicios de Salud de Oaxaca — Calendario de Atención a la Mujer
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={escucharInstrucciones}
                        aria-pressed={hablando}
                        className={`flex min-h-[72px] w-full cursor-pointer items-center justify-center gap-3 rounded-2xl px-6 text-base font-black md:w-auto ${BOTON_TIERRA} ${hablando ? 'pt-ring' : ''}`}
                    >
                        <Volume2 className="h-6 w-6" />
                        <span>{hablando ? 'Detener instrucciones' : 'Escuchar instrucciones'}</span>
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-[#D69A1E] via-[#CC7A2C] to-[#C2603A] px-5 py-4 text-center font-black text-white md:flex-row">
                    <span className="flex items-center gap-2 text-lg md:text-xl">
                        <Megaphone className="h-6 w-6 shrink-0" />
                        ACUDE A TU UNIDAD DE SALUD
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span className="text-sm font-bold md:text-base">
                        Calendario de Atención a la Mujer (Embarazo, Parto y Puerperio)
                    </span>
                </div>
            </header>

            {/* ============ Vista Partera / Copia Centro de Salud ============ */}
            <div className="flex justify-end">
                <div className="flex w-full items-center gap-1.5 rounded-2xl border-2 border-stone-200 bg-white/70 p-1.5 sm:w-auto">
                    <button
                        type="button"
                        aria-pressed={!modoDuplicado}
                        onClick={() => {
                            setModoDuplicado(false);
                            speakText('Vista Partera activa');
                        }}
                        className={`flex min-h-[56px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-5 text-sm font-black transition-all duration-200 active:scale-[0.98] sm:flex-initial ${!modoDuplicado ? `border-[#9A4A2A] ${BOTON_TIERRA}` : 'border-transparent text-stone-800 hover:bg-amber-50'}`}
                    >
                        <FileText className="h-5 w-5" />
                        <span>Vista Partera</span>
                    </button>
                    <button
                        type="button"
                        aria-pressed={modoDuplicado}
                        onClick={() => {
                            setModoDuplicado(true);
                            speakText('Mostrando copia oficial para el Centro de Salud');
                        }}
                        className={`flex min-h-[56px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-5 text-sm font-black transition-all duration-200 active:scale-[0.98] sm:flex-initial ${modoDuplicado ? `border-[#9A4A2A] ${BOTON_TIERRA}` : 'border-transparent text-stone-800 hover:bg-amber-50'}`}
                    >
                        <Building2 className="h-5 w-5" />
                        <span>Copia para Centro de Salud</span>
                    </button>
                </div>
            </div>

            {modoDuplicado && (
                <div className="pt-slide-up overflow-hidden rounded-3xl border-4 border-[#D69A1E] bg-gradient-to-b from-amber-50 to-orange-50 shadow-xl shadow-orange-900/15">
                    <TriStripe />
                    <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D69A1E] to-[#C2603A] text-white shadow-lg shadow-orange-900/25">
                                <Building2 className="h-7 w-7" />
                            </span>
                            <div>
                                <span className="mb-1 inline-block rounded-full border border-[#D69A1E]/60 bg-amber-200 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-stone-900">
                                    Duplicado Oficial SSO
                                </span>
                                <h3 className="text-base font-black text-stone-900">Copia Oficial para Enviar al Centro de Salud</h3>
                                <p className="text-sm font-bold text-stone-700">
                                    Expediente oficial de reporte mensual de atención materna para los Servicios de Salud de Oaxaca.
                                </p>
                            </div>
                        </div>
                        <span className="hidden shrink-0 items-center gap-1.5 rounded-2xl border-2 border-[#D69A1E]/60 bg-white/70 px-4 py-2 text-sm font-black text-stone-900 md:inline-flex">
                            <Award className="h-4 w-4" /> Copia Institucional
                        </span>
                    </div>
                </div>
            )}

            {/* ================= Datos de identificación ================= */}
            <SectionCard
                acento="ocre"
                delay={0.05}
                icon={<User className="h-6 w-6" />}
                title="Datos de identificación de la paciente"
                subtitle="Toque el micrófono dentro de cada campo para dictar con su voz"
            >
                <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
                    <CampoVoz
                        id="nombreMujer"
                        etiqueta="Nombre de la mujer"
                        placeholder="Nombre completo de la mujer…"
                        valor={nombreMujer}
                        onCambio={(v) => {
                            setNombreMujer(v);
                            if (errorNombre) setErrorNombre(false);
                        }}
                        onMic={() => startVoice((v) => { setNombreMujer(v); setErrorNombre(false); }, 'nombreMujer')}
                        escuchando={listeningField === 'nombreMujer'}
                        error={errorNombre}
                        className="md:col-span-2"
                    />
                    <CampoVoz
                        id="edad"
                        etiqueta="Edad (años)"
                        placeholder="Ej. 24"
                        inputMode="numeric"
                        maxLength={3}
                        valor={edad}
                        onCambio={(v) => setEdad(v.replace(/\D/g, '').slice(0, 3))}
                        onMic={() => startVoice((v) => setEdad(v.replace(/\D/g, '').slice(0, 3)), 'edad')}
                        escuchando={listeningField === 'edad'}
                    />
                    <div>
                        <label htmlFor="cm-fecha" className={CLASE_ETIQUETA}>
                            Fecha de consulta
                        </label>
                        <input
                            id="cm-fecha"
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className={CLASE_SELECTOR}
                        />
                    </div>
                    <CampoVoz
                        id="localidad"
                        etiqueta="Localidad"
                        placeholder="Localidad…"
                        valor={localidad}
                        onCambio={setLocalidad}
                        onMic={() => startVoice(setLocalidad, 'localidad')}
                        escuchando={listeningField === 'localidad'}
                    />
                    <CampoVoz
                        id="municipio"
                        etiqueta="Municipio"
                        placeholder="Municipio…"
                        valor={municipio}
                        onCambio={setMunicipio}
                        onMic={() => startVoice(setMunicipio, 'municipio')}
                        escuchando={listeningField === 'municipio'}
                    />
                </div>
            </SectionCard>

            {/* ================= 1. Embarazo normal y control prenatal ================= */}
            <SectionCard
                acento="verde"
                delay={0.08}
                icon={<Calendar className="h-6 w-6" />}
                title="1. Embarazo normal y control prenatal"
                subtitle="Mes de embarazo, micronutrientes, vacuna anti-tetánica y semáforo nutricional"
            >
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <div className="space-y-4 rounded-3xl border-2 border-stone-200 bg-white/60 p-4 lg:col-span-2">
                        <div className="flex items-center gap-4 border-b-2 border-amber-200 pb-3">
                            <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-amber-200/70">
                                <Imagen src="/EmbarazoNormal.png" alt="Embarazo normal" />
                            </span>
                            <div>
                                <h3 className="text-base font-black text-stone-900">Embarazo normal (evolución fisiológica)</h3>
                                <p className="text-sm font-bold text-stone-700">Seleccione el mes de gestación activo (1º al 9º mes)</p>
                            </div>
                        </div>
                        <p className={CLASE_ETIQUETA}>Mes de embarazo activo</p>
                        <div className="grid grid-cols-3 gap-3">
                            {MESES.map((m) => (
                                <TarjetaOpcion
                                    key={m}
                                    activo={mesSeleccionado === m}
                                    onClick={() => setMesSeleccionado(m)}
                                    titulo={`${m}º Mes`}
                                    className="min-h-[76px] text-lg"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <TarjetaOpcion
                            activo={acidoFolico}
                            onClick={() => setAcidoFolico(!acidoFolico)}
                            titulo="Ácido fólico (30 días)"
                            subtitulo={acidoFolico ? 'Entregado' : 'Pendiente'}
                            img="/DuranteElEmbarazo-PrimerosMeses.png"
                            icono={<Pill className="h-6 w-6 shrink-0 text-[#3F7048]" />}
                            tono="verde"
                            disposicion="fila"
                            className="min-h-[104px] flex-1"
                        />
                        <TarjetaOpcion
                            activo={hierro}
                            onClick={() => setHierro(!hierro)}
                            titulo="Sulfato ferroso"
                            subtitulo={hierro ? 'Entregado' : 'Pendiente'}
                            img="/DuranteElEmbarazo.png"
                            icono={<Droplet className="h-6 w-6 shrink-0 text-[#C2603A]" />}
                            tono="verde"
                            disposicion="fila"
                            className="min-h-[104px] flex-1"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-3 rounded-3xl border-2 border-stone-200 bg-white/60 p-4">
                        <div className="flex items-center gap-4">
                            <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-amber-200/70">
                                <Imagen src="/Aplicar-Toxoide-Tetanico.png" alt="Vacunación anti-tetánica" />
                            </span>
                            <h3 className="text-sm font-black uppercase text-stone-900">Vacunación anti-tetánica (Td/Tdap)</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {VACUNAS.map((v) => (
                                <TarjetaOpcion
                                    key={v.id}
                                    activo={vacunaTetanos === v.id}
                                    onClick={() => setVacunaTetanos(v.id)}
                                    titulo={v.label}
                                    className="min-h-[80px] px-2"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 rounded-3xl border-2 border-stone-200 bg-white/60 p-4">
                        <div className="flex items-center gap-2">
                            <Ruler className="h-5 w-5 text-stone-800" />
                            <h3 className="text-sm font-black uppercase text-stone-900">Estado nutricional madre (cinta MUAC tricolor)</h3>
                        </div>
                        <SemaforoMUAC value={cintaMUAC} onChange={setCintaMUAC} label="Estado nutricional de la madre" />
                    </div>
                </div>
            </SectionCard>

            {/* ================= 2. Embarazo con complicaciones (mapa radial) ================= */}
            <SectionCard
                acento="terracota"
                delay={0.1}
                icon={<AlertTriangle className="h-6 w-6" />}
                title="2. Embarazo con complicaciones"
                subtitle="Toque los dibujos de los signos de alarma identificados en la valoración"
                action={
                    <div className="flex flex-wrap items-center gap-3">
                        <ContadorPill total={sintomasComplicaciones.length} />
                        <ReferidoToggle label="Referido" value={referidoEmbarazo} onChange={setReferidoEmbarazo} />
                    </div>
                }
            >
                <div className="relative overflow-hidden rounded-3xl border-4 border-[#C2603A]/30 bg-gradient-to-b from-orange-50/80 to-amber-50 p-4 md:p-8">
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
                                stroke="#C2603A"
                                strokeWidth="2"
                                strokeDasharray="6 5"
                                strokeLinecap="round"
                                opacity="0.4"
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}
                    </svg>

                    <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6 md:gap-x-6 md:gap-y-8">
                        {SINTOMAS_SUPERIORES.map((s) => renderSintoma(s, 'md:col-span-2'))}
                        {renderSintoma(SINTOMA_IZQUIERDO, 'md:col-span-2')}

                        <div className="order-first flex flex-col items-center justify-center gap-2 rounded-3xl border-4 border-[#C2603A] bg-gradient-to-b from-orange-100 to-amber-200 p-5 text-center shadow-2xl shadow-orange-900/25 sm:col-span-2 md:order-none md:col-span-2">
                            <span className="pt-breathe flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#CC7A2C] to-[#C2603A] text-white shadow-lg">
                                <AlertTriangle className="h-6 w-6" />
                            </span>
                            <span className="flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-amber-200/70">
                                <Imagen src="/EmbarazoConComplicaciones.png" alt="Embarazo con complicaciones" />
                            </span>
                            <span className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider ${BOTON_TIERRA}`}>
                                Embarazo con complicaciones
                            </span>
                            <p className="max-w-xs text-xs font-bold text-stone-800">
                                Identificación de signos de alarma materna durante la valoración
                            </p>
                        </div>

                        {renderSintoma(SINTOMA_DERECHO, 'md:col-span-2')}
                        {SINTOMAS_INFERIORES.map((s, i) => renderSintoma(s, i === 0 ? 'md:col-span-2 md:col-start-2' : 'md:col-span-2'))}
                    </div>
                </div>
            </SectionCard>

            {/* ================= 3. Aborto, dolor y hemorragia ================= */}
            <SectionCard
                acento="terracota"
                delay={0.12}
                icon={<ShieldAlert className="h-6 w-6" />}
                title="3. Aborto, dolor y hemorragia"
                subtitle="Evaluación de complicaciones hemorrágicas o dolor agudo"
                action={
                    <div className="flex flex-wrap items-center gap-3">
                        <ContadorPill total={tarjetasAborto.length} />
                        <ReferidoToggle label="Referido" value={referidoAborto} onChange={setReferidoAborto} />
                    </div>
                }
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {TARJETAS_ABORTO.map((item) => (
                        <TarjetaOpcion
                            key={item.id}
                            activo={tarjetasAborto.includes(item.id)}
                            onClick={() => toggleTarjetaAborto(item.id)}
                            titulo={item.title}
                            img={item.img}
                            altoImg="h-32"
                            pie={{ off: 'Marcar', on: 'Registrado' }}
                            className="min-h-[220px]"
                        />
                    ))}
                </div>
            </SectionCard>

            {/* ================= 4. Parto normal ================= */}
            <SectionCard
                acento="ocre"
                delay={0.14}
                icon={<HeartPulse className="h-6 w-6" />}
                title="4. Parto normal (posición vertical y horizontal)"
                subtitle="Posición del parto y resultado del recién nacido"
            >
                <div className="space-y-4">
                    {FILAS_PARTO.map((fila) => {
                        const filaActiva = partoNormalPosicion === fila.pos;
                        return (
                            <div
                                key={fila.pos}
                                className={`grid items-center gap-4 rounded-3xl border-4 p-4 transition-all duration-300 md:grid-cols-[1fr_auto] ${filaActiva ? 'border-[#D69A1E] bg-gradient-to-b from-amber-50 to-orange-50 shadow-xl shadow-orange-900/15' : 'border-stone-200 bg-white/60'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="flex h-24 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-amber-200/70">
                                        <Imagen src={fila.img} alt={fila.titulo} />
                                    </span>
                                    <div>
                                        <span className="rounded-full border border-[#D69A1E]/50 bg-amber-100 px-3 py-1 text-xs font-black uppercase text-stone-900">
                                            {fila.etiqueta}
                                        </span>
                                        <h3 className="mt-1.5 text-base font-black text-stone-900">{fila.titulo}</h3>
                                        <p className="text-sm font-bold text-stone-700">{fila.descripcion}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:w-[420px]">
                                    {RESULTADOS_PARTO.map((r) => (
                                        <TarjetaOpcion
                                            key={r.id}
                                            activo={filaActiva && partoNormalResultado === r.id}
                                            onClick={() => {
                                                setPartoNormalPosicion(fila.pos);
                                                setPartoNormalResultado(r.id);
                                            }}
                                            titulo={r.titulo}
                                            img={r.img}
                                            icono={<Baby className="h-5 w-5 shrink-0 text-[#C2603A]" />}
                                            disposicion="fila"
                                            className="min-h-[88px] px-2"
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* ================= 5. Parto complicado ================= */}
            <SectionCard
                acento="terracota"
                delay={0.16}
                icon={<AlertTriangle className="h-6 w-6" />}
                title="5. Parto complicado (resultado de nacimiento)"
                subtitle="Seleccione si el nacimiento presentó complicaciones o defunción"
                action={<ReferidoToggle label="Referido" value={referidoPartoComplicado} onChange={setReferidoPartoComplicado} />}
            >
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {OPCIONES_PARTO_COMPLICADO.map((item) => {
                        const activo = partoComplicadoOpcion === item.id;
                        return (
                            <TarjetaOpcion
                                key={item.id}
                                activo={activo}
                                onClick={() => setPartoComplicadoOpcion(activo ? null : item.id)}
                                titulo={item.title}
                                img={item.img}
                                className="min-h-[220px]"
                            />
                        );
                    })}
                </div>
            </SectionCard>

            {/* ================= 6. Puerperio normal y complicado ================= */}
            <SectionCard
                acento="verde"
                delay={0.18}
                icon={<HeartPulse className="h-6 w-6" />}
                title="6. Puerperio normal y complicado"
                subtitle="Primeros 40 días postparto: estado nutricional y signos de alarma"
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-3 rounded-3xl border-2 border-stone-200 bg-white/60 p-4">
                        <div className="flex items-center gap-2">
                            <Ruler className="h-5 w-5 text-stone-800" />
                            <h3 className="text-sm font-black uppercase text-stone-900">Puerperio normal (cinta MUAC tricolor)</h3>
                        </div>
                        <p className="text-sm font-bold text-stone-700">Evaluación del estado nutricio posparto materna</p>
                        <SemaforoMUAC value={cintaMUACPuerperio} onChange={setCintaMUACPuerperio} label="Estado nutricional en puerperio" />
                    </div>

                    <div className="space-y-4 rounded-3xl border-4 border-[#C2603A]/40 bg-gradient-to-b from-orange-50 to-amber-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-sm font-black uppercase text-stone-900">Puerperio complicado</h3>
                            <ReferidoToggle label="Ref" value={referidoPuerperio} onChange={setReferidoPuerperio} />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-amber-200/70">
                                <Imagen src="/PuerpericoComplicado.png" alt="Puerperio complicado" />
                            </span>
                            <div className="flex-1 space-y-3">
                                {CHECKS_PUERPERIO.map((chk) => (
                                    <TarjetaOpcion
                                        key={chk.id}
                                        activo={puerperioCheckboxes.includes(chk.id)}
                                        onClick={() => togglePuerperioCheckbox(chk.id)}
                                        titulo={chk.label}
                                        disposicion="fila"
                                        className="min-h-[72px]"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* ================= 7. Muerte materna ================= */}
            <SectionCard
                acento="terracota"
                delay={0.2}
                className="!border-red-300 !bg-red-50/70"
                icon={<ShieldAlert className="h-6 w-6" />}
                title="7. Muerte materna (alerta epidemiológica médica)"
                subtitle="Registro prioritario inmediato ante fallecimiento materno ocurrido en la comunidad"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {ETAPAS_MUERTE_MATERNA.map((item) => {
                        const activo = muerteMaternaEtapa === item.id;
                        return (
                            <TarjetaOpcion
                                key={item.id}
                                activo={activo}
                                onClick={() => setMuerteMaternaEtapa(activo ? null : item.id)}
                                titulo={item.title}
                                img={item.img}
                                altoImg="h-32"
                                pie={{ off: 'Notificar', on: 'Notificado', iconoOff: <AlertTriangle className="h-3.5 w-3.5 text-[#CC7A2C]" /> }}
                                className="min-h-[220px]"
                            />
                        );
                    })}
                </div>
            </SectionCard>

            {/* ================= 8. Cierre administrativo ================= */}
            <section
                className="pt-slide-up overflow-hidden rounded-3xl border border-stone-700 bg-stone-900/95 text-white shadow-2xl shadow-orange-900/30 backdrop-blur-md"
                style={{ animationDelay: '.22s' }}
            >
                <TriStripe className="h-2" />
                <div className="space-y-6 p-4 sm:p-6">
                    <div className="flex items-center gap-3 border-b-4 border-[#D69A1E]/60 pb-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D69A1E] to-[#C2603A] text-white shadow-lg">
                            <PenTool className="h-6 w-6" />
                        </span>
                        <div>
                            <h2 className="text-xl font-black leading-tight text-white sm:text-2xl">
                                Cierre administrativo del informe materno (Formato 2)
                            </h2>
                            <p className="text-sm font-bold text-stone-300">
                                Datos de la partera acreditada, localidad, municipio y validación por huella digital
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
                        {camposCierre.map((c) => (
                            <CampoVoz
                                key={c.key}
                                id={c.key}
                                etiqueta={c.label}
                                placeholder={c.ph}
                                oscuro
                                valor={c.value}
                                onCambio={c.set}
                                onMic={() => startVoice(c.set, c.key)}
                                escuchando={listeningField === c.key}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        aria-pressed={huellaRegistrada}
                        onClick={() => {
                            setHuellaRegistrada(!huellaRegistrada);
                            speakText(huellaRegistrada ? 'Huella removida' : 'Huella digital registrada');
                        }}
                        className={`flex min-h-[80px] w-full cursor-pointer items-center justify-center gap-3 rounded-3xl border-4 px-6 text-base font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] md:w-auto ${huellaRegistrada
                            ? 'border-emerald-700 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-900/40'
                            : 'border-[#9A6A0F] bg-gradient-to-br from-[#E3AE3A] to-[#D69A1E] text-stone-900 shadow-lg shadow-amber-900/30'
                            }`}
                    >
                        <Fingerprint className="h-7 w-7" />
                        <span>{huellaRegistrada ? 'HUELLA DIGITAL CAPTURADA' : 'CAPTURAR HUELLA DIGITAL DE LA PARTERA'}</span>
                        {huellaRegistrada && <Check className="h-6 w-6" strokeWidth={3.5} />}
                    </button>
                </div>
            </section>

            {/* ================== Error del servidor ====================== */}
            {errorServidor && (
                <div
                    role="alert"
                    className="pt-pop-in rounded-3xl border-4 border-red-400 bg-red-50 p-4 text-base font-bold text-stone-900 shadow-lg"
                >
                    {errorServidor}
                </div>
            )}

            {/* ====================== Botón de envío ====================== */}
            <button
                type="submit"
                disabled={isSubmitting || exito}
                className={`pt-slide-up flex min-h-[88px] w-full cursor-pointer items-center justify-center gap-4 rounded-3xl px-6 py-5 text-xl font-black disabled:cursor-wait disabled:opacity-80 sm:text-2xl ${BOTON_TIERRA} ${nombreMujer.trim() && !isSubmitting ? 'pt-breathe' : ''}`}
                style={{ animationDelay: '.25s' }}
            >
                {isSubmitting ? <Loader2 className="h-7 w-7 animate-spin" /> : <Send className="h-7 w-7" />}
                <span>{isSubmitting ? 'Guardando en PostgreSQL (Render)…' : 'REGISTRAR CALENDARIO DE LA MUJER (FORMATO 2)'}</span>
            </button>

            {/* ================== Confirmación de envío ======================= */}
            {exito && (
                <div
                    role="status"
                    aria-live="polite"
                    className="pt-fade-in fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
                >
                    <div className={`pt-pop-in w-full max-w-md overflow-hidden text-center ${VIDRIO}`}>
                        <TriStripe className="h-2" />
                        <div className="p-8">
                            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl">
                                <Check className="h-14 w-14" strokeWidth={3.5} />
                            </div>
                            <h2 className="text-3xl font-black text-stone-900">¡Registro guardado!</h2>
                            <p className="mt-2 text-lg font-bold text-stone-800">
                                El calendario de {nombreMujer || 'la paciente'} quedó guardado en la base de datos.
                            </p>
                            <p className="mt-3 text-sm font-bold text-stone-600">Regresando al menú…</p>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

export default CalendarioMujer;