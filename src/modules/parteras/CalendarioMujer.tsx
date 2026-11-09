import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    HeartPulse,
    Mic,
    Square,
    Send,
    AlertTriangle,
    Calendar,
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
    Loader2,
    Volume2,
    CheckCircle2
} from 'lucide-react';
import { handleVoiceInput } from '../../utils/voiceUtils';
import { http } from '../../services/http';

/* ============================================================================
 * CalendarioMujer — Versión Profesional con Retroalimentación Auditiva por Botón
 * Servicios de Salud de Oaxaca · Programa de Parteras Tradicionales
 * ========================================================================== */

export interface CalendarioMujerProps {
    onBack?: () => void;
    onSuccess?: () => void;
    hablarTexto?: (texto: string) => void;
}

type Muac = 'VERDE' | 'AMARILLO' | 'ROJO';
type Vacuna = '1A' | '2A' | 'REFUERZO';
type PosicionParto = 'VERTICAL' | 'HORIZONTAL';
type ResultadoParto = 'NINO_VIVO' | 'NINA_VIVA';
type EtapaMuerte = 'EMBARAZO' | 'PARTO' | 'PUERPERIO';
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
        on: 'border-emerald-700 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-900/30 scale-[1.02]',
        off: 'border-emerald-200 bg-emerald-50/80 text-stone-900 hover:border-emerald-400'
    },
    {
        id: 'AMARILLO',
        titulo: 'Amarillo',
        estado: 'Riesgo',
        on: 'border-[#9A6A0F] bg-gradient-to-br from-[#E3AE3A] to-[#D69A1E] text-stone-900 shadow-xl shadow-amber-900/30 scale-[1.02]',
        off: 'border-amber-200 bg-amber-50/80 text-stone-900 hover:border-[#D69A1E]'
    },
    {
        id: 'ROJO',
        titulo: 'Rojo',
        estado: 'Desnutrición',
        on: 'border-red-800 bg-gradient-to-br from-red-500 to-red-700 text-white shadow-xl shadow-red-900/30 scale-[1.02]',
        off: 'border-red-200 bg-red-50/80 text-stone-900 hover:border-red-400'
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
        etiqueta: 'Fila 1: Parto vertical',
        titulo: 'Parto humanizado vertical',
        descripcion: 'Posición tradicional de pie, acuclillada o en silla hidrostática',
        img: '/PartoNormalVertical.png'
    },
    {
        pos: 'HORIZONTAL',
        etiqueta: 'Fila 2: Parto horizontal',
        titulo: 'Parto horizontal (decúbito supino)',
        descripcion: 'Posición horizontal asistida en camilla de atención',
        img: '/PartoNormalHorizontal.png'
    }
];

const RESULTADOS_PARTO: { id: ResultadoParto; titulo: string; img: string }[] = [
    { id: 'NINO_VIVO', titulo: 'Niño vivo', img: '/NiñoVivo.png' },
    { id: 'NINA_VIVA', titulo: 'Niña viva', img: '/NiñaViva.png' }
];

const OPCIONES_PARTO_COMPLICADO: { id: string; img: string; title: string }[] = [
    { id: 'NINO_COMPLICADO', img: '/NiñoComplicado.png', title: 'Niño complicado' },
    { id: 'NINA_COMPLICADA', img: '/NiñaComplicado.png', title: 'Niña complicada' },
    { id: 'NINO_MUERTO', img: '/NiñoMuerto.png', title: 'Defunción recién nacido (niño)' },
    { id: 'NINA_MUERTA', img: '/NiñaMuerta.png', title: 'Defunción recién nacida (niña)' }
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
    'Primero escriba o dicte los datos de la paciente tocando el micrófono en cada campo. ' +
    'Seleccione el mes de embarazo, la vacuna y el color de la cinta de medición. ' +
    'Si hay signos de alarma, toque los dibujos que correspondan. ' +
    'Registre el tipo de parto, el resultado del recién nacido y el puerperio. ' +
    'Al final complete los datos de cierre y presione el botón de registrar.';

/* --------------------------- Estilos / Animaciones ------------------------ */
const ESTILOS = `
@keyframes pt-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pt-slide-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pt-pop-in { 0% { opacity: 0; transform: scale(.4) } 70% { transform: scale(1.18) } 100% { opacity: 1; transform: scale(1) } }
@keyframes pt-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.02) } }
@keyframes pt-wave { 0%,100% { transform: scaleY(.25) } 50% { transform: scaleY(1) } }
@keyframes pt-ring { 0% { box-shadow: 0 0 0 0 rgba(204,122,44,.5) } 100% { box-shadow: 0 0 0 16px rgba(204,122,44,0) } }
@keyframes pt-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } }
.pt-fade-in { animation: pt-fade-in .4s cubic-bezier(.16,1,.3,1) both }
.pt-slide-up { animation: pt-slide-up .5s cubic-bezier(.16,1,.3,1) both }
.pt-pop-in { animation: pt-pop-in .35s cubic-bezier(.34,1.56,.64,1) both }
.pt-breathe { animation: pt-breathe 3s ease-in-out infinite }
.pt-ring { animation: pt-ring 1.2s ease-out infinite }
.pt-shake { animation: pt-shake .4s ease-in-out }
.pt-wave-bar { display: inline-block; width: 4px; height: 22px; border-radius: 4px; background: #CC7A2C; transform-origin: center; animation: pt-wave .9s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .pt-fade-in, .pt-slide-up, .pt-pop-in, .pt-breathe, .pt-ring, .pt-shake, .pt-wave-bar { animation: none !important }
}
`;

const VIDRIO =
    'bg-white/90 backdrop-blur-xl border border-white/80 shadow-2xl shadow-orange-950/10 rounded-3xl transition-all duration-300';

const BOTON_TIERRA =
    'bg-gradient-to-r from-[#D69A1E] via-[#CC7A2C] to-[#C2603A] text-white shadow-xl shadow-orange-900/30 border border-white/30 transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.98]';

const CLASE_SELECTOR =
    'h-16 w-full rounded-2xl border-2 bg-white/95 px-4 text-base sm:text-lg font-bold text-stone-900 outline-none transition-all duration-200 focus:border-[#CC7A2C] focus:ring-4 focus:ring-[#CC7A2C]/20';

const CLASE_ETIQUETA = 'mb-2 block text-xs sm:text-sm font-black uppercase tracking-wider text-stone-700';

const ACENTOS: Record<Acento, string> = {
    ocre: 'from-[#D69A1E] to-[#CC7A2C]',
    terracota: 'from-[#CC7A2C] to-[#C2603A]',
    verde: 'from-[#5E8C61] to-[#3F7048]'
};

/* ------------------------- Componentes reutilizables ---------------------- */
const TriStripe: React.FC<{ className?: string }> = ({ className = 'h-2' }) => (
    <div className={`w-full bg-gradient-to-r from-[#C2603A] via-[#D69A1E] to-[#5E8C61] ${className}`} aria-hidden="true" />
);

const Imagen: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
    const [fallo, setFallo] = useState(false);
    if (fallo) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-amber-50 px-2 text-center text-xs font-bold text-stone-500">
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
            className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
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
    className = ''
}) => {
    const borde = escuchando
        ? 'border-[#CC7A2C] ring-4 ring-[#CC7A2C]/20 bg-amber-50/60'
        : error
            ? 'border-red-500 pt-shake'
            : 'border-stone-200/90 hover:border-stone-300';

    return (
        <div className={className}>
            <label htmlFor={`cm-${id}`} className={CLASE_ETIQUETA}>
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
                    className={`${CLASE_SELECTOR} pr-20 placeholder:font-semibold placeholder:text-stone-400 ${borde}`}
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
                    className={`absolute right-2.5 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-2xl text-white shadow-md transition-all duration-200 active:scale-95 ${escuchando ? 'pt-ring bg-[#A85322]' : 'bg-[#CC7A2C] hover:bg-[#B56822] hover:shadow-lg'}`}
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
    children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, acento = 'ocre', title, subtitle, action, delay = 0.05, children }) => (
    <section className={`pt-slide-up p-5 sm:p-8 ${VIDRIO}`} style={{ animationDelay: `${delay}s` }}>
        <div className="mb-6 flex flex-col gap-4 border-b border-stone-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
                <span className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-xl shadow-orange-900/15 ${ACENTOS[acento]}`}>
                    {icon}
                </span>
                <div>
                    <h2 className="text-lg sm:text-2xl font-black leading-tight text-stone-900">{title}</h2>
                    <p className="text-xs sm:text-sm font-bold text-stone-600 mt-0.5">{subtitle}</p>
                </div>
            </div>
            {action}
        </div>
        <div className="space-y-6">{children}</div>
    </section>
);

const ContadorPill: React.FC<{ total: number }> = ({ total }) => (
    <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-[#CC7A2C]/40 bg-amber-50 px-4 py-2 text-xs sm:text-sm font-black text-stone-900 shadow-sm sm:self-auto">
        <CheckCircle2 className="h-4 w-4 text-[#CC7A2C]" />
        <span>Seleccionados: {total}</span>
    </span>
);

const ReferidoToggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
    <div role="group" aria-label={label} className="inline-flex items-center gap-1.5 self-start rounded-2xl border border-stone-200/90 bg-white/80 p-1.5 shadow-sm sm:self-auto">
        <span className="px-2 text-xs font-black uppercase tracking-wider text-stone-700">{label}</span>
        <button
            type="button"
            aria-pressed={!value}
            onClick={() => onChange(false)}
            className={`min-h-[48px] min-w-[64px] cursor-pointer rounded-xl px-4 text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 ${!value ? 'bg-stone-800 text-white shadow-md' : 'text-stone-700 hover:bg-amber-50'}`}
        >
            NO
        </button>
        <button
            type="button"
            aria-pressed={value}
            onClick={() => onChange(true)}
            className={`flex min-h-[48px] min-w-[72px] cursor-pointer items-center justify-center gap-1 rounded-xl px-4 text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 ${value ? 'bg-[#CC7A2C] text-white shadow-md' : 'text-stone-700 hover:bg-amber-50'}`}
        >
            <span>SÍ</span>
            <AlertTriangle className={`h-3.5 w-3.5 ${value ? 'text-amber-200' : 'text-[#CC7A2C]'}`} />
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
    disposicion?: 'columna' | 'fila';
    pie?: { off: string; on: string; iconoOff?: React.ReactNode };
    tituloClassName?: string;
    className?: string;
}

const TarjetaOpcion: React.FC<TarjetaOpcionProps> = ({
    activo,
    onClick,
    titulo,
    subtitulo,
    img,
    altoImg = 'h-36',
    icono,
    disposicion = 'columna',
    pie,
    tituloClassName,
    className = ''
}) => {
    const fila = disposicion === 'fila';
    const seleccionada = 'border-[#CC7A2C] bg-gradient-to-b from-orange-50/90 to-amber-50/70 shadow-xl shadow-orange-950/10 ring-4 ring-[#CC7A2C]/15 scale-[1.01]';
    const normal = 'border-stone-200/90 bg-white/95 shadow-sm hover:-translate-y-0.5 hover:border-[#CC7A2C]/50 hover:shadow-lg';

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={activo}
            className={`relative min-h-[72px] w-full cursor-pointer touch-manipulation select-none rounded-3xl border-2 p-3.5 sm:p-4 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CC7A2C]/40 active:scale-[0.98] ${activo ? seleccionada : normal} ${
                fila
                    ? 'flex items-center gap-3.5 text-left'
                    : `flex flex-col items-center gap-3 text-center ${img || pie ? 'justify-between' : 'justify-center'}`
            } ${className}`}
        >
            {activo && (
                <span className="pt-pop-in absolute -right-2 -top-2 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 border-white bg-[#CC7A2C] text-white shadow-lg">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3.5} />
                </span>
            )}

            {img && (
                <span className={`flex items-center justify-center overflow-hidden bg-white p-2.5 shadow-inner ring-1 ring-stone-200/60 ${fila ? 'h-20 w-20 shrink-0 rounded-2xl' : `w-full rounded-2xl ${altoImg}`}`}>
                    <Imagen src={img} alt={titulo} />
                </span>
            )}

            <span className={`flex flex-col gap-1 ${fila ? 'min-w-0 flex-1' : 'flex-1 items-center justify-center'}`}>
                <span className={`font-black leading-tight text-stone-900 ${tituloClassName ?? (img && !fila ? 'text-xs sm:text-sm uppercase tracking-wide' : 'text-sm sm:text-base')}`}>{titulo}</span>
                {subtitulo && <span className="text-xs sm:text-sm font-bold text-stone-600">{subtitulo}</span>}
            </span>

            {icono}

            {pie && (
                <span className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider ${activo ? 'bg-[#CC7A2C] text-white' : 'bg-stone-100/80 text-stone-700'}`}>
                    <span>{activo ? pie.on : pie.off}</span>
                    {activo ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : pie.iconoOff}
                </span>
            )}
        </button>
    );
};

const SemaforoMUAC: React.FC<{ value: Muac | null; onChange: (v: Muac) => void; label: string }> = ({ value, onChange, label }) => (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {SEMAFORO.map((s) => {
            const activo = value === s.id;
            return (
                <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => onChange(s.id)}
                    className={`relative flex min-h-[96px] sm:min-h-[110px] cursor-pointer touch-manipulation flex-col items-center justify-center gap-1 rounded-3xl border-2 px-2 py-3 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${activo ? s.on : s.off}`}
                >
                    {activo && (
                        <span className="pt-pop-in absolute -right-2 -top-2 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-white bg-stone-900 text-white shadow-md">
                            <Check className="h-4 w-4" strokeWidth={3.5} />
                        </span>
                    )}
                    <span className="text-sm sm:text-base font-black uppercase tracking-wider">{s.titulo}</span>
                    <span className="text-[11px] sm:text-xs font-bold opacity-90">{s.estado}</span>
                </button>
            );
        })}
    </div>
);

/* ------------------------------ Componente principal ---------------------- */
export const CalendarioMujer: React.FC<CalendarioMujerProps> = ({
    onSuccess,
    hablarTexto
}) => {
    // 0. Modo Duplicado (Vista Partera vs Copia Centro de Salud)
    const [modoDuplicado, setModoDuplicado] = useState(false);

    // 1. Datos de Identificación
    const [nombreMujer, setNombreMujer] = useState('');
    const [edad, setEdad] = useState('');
    const [fecha, setFecha] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [localidad, setLocalidad] = useState('');
    const [listeningField, setListeningField] = useState<string | null>(null);

    // 2. Control Prenatal
    const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
    const [acidoFolico, setAcidoFolico] = useState(false);
    const [hierro, setHierro] = useState(false);
    const [vacunaTetanos, setVacunaTetanos] = useState<Vacuna | null>(null);
    const [cintaMUAC, setCintaMUAC] = useState<Muac | null>(null);

    // 3. Complicaciones Embarazo
    const [referidoEmbarazo, setReferidoEmbarazo] = useState<boolean>(false);
    const [sintomasComplicaciones, setSintomasComplicaciones] = useState<string[]>([]);

    // 4. Aborto, Dolor y Hemorragia
    const [referidoAborto, setReferidoAborto] = useState<boolean>(false);
    const [tarjetasAborto, setTarjetasAborto] = useState<string[]>([]);

    // 5. Parto Normal
    const [partoNormalPosicion, setPartoNormalPosicion] = useState<PosicionParto | null>(null);
    const [partoNormalResultado, setPartoNormalResultado] = useState<ResultadoParto | null>(null);

    // 6. Parto Complicado
    const [referidoPartoComplicado, setReferidoPartoComplicado] = useState<boolean>(false);
    const [partoComplicadoOpcion, setPartoComplicadoOpcion] = useState<string | null>(null);

    // 7. Puerperio
    const [cintaMUACPuerperio, setCintaMUACPuerperio] = useState<Muac | null>(null);
    const [referidoPuerperio, setReferidoPuerperio] = useState<boolean>(false);
    const [puerperioCheckboxes, setPuerperioCheckboxes] = useState<string[]>([]);

    // 8. Muerte Materna
    const [muerteMaternaEtapa, setMuerteMaternaEtapa] = useState<EtapaMuerte | null>(null);

    // 9. Cierre Administrativo
    const [nombrePartera, setNombrePartera] = useState('');
    const [cierreLocalidad, setCierreLocalidad] = useState('');
    const [noMunicipio, setNoMunicipio] = useState('');
    const [mesInformado, setMesInformado] = useState('');
    const [nombreSupervisor, setNombreSupervisor] = useState('');
    const [centroSalud, setCentroSalud] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado UI
    const [hablando, setHablando] = useState(false);
    const [exito, setExito] = useState(false);
    const [errorServidor, setErrorServidor] = useState<string | null>(null);
    const [errorNombre, setErrorNombre] = useState(false);
    const [errorFecha, setErrorFecha] = useState(false);

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

    const escucharInstrucciones = () => {
        if (hablando) {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            setHablando(false);
            return;
        }
        setHablando(true);
        speakText(INSTRUCCIONES_VOZ);
    };

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

    const handleSelectMes = (m: number) => {
        setMesSeleccionado(m);
        speakText(`Seleccionado: ${m}º mes de embarazo`);
    };

    const handleSelectAcidoFolico = () => {
        const nuevo = !acidoFolico;
        setAcidoFolico(nuevo);
        speakText(nuevo ? 'Ácido fólico entregado' : 'Ácido fólico pendiente');
    };

    const handleSelectHierro = () => {
        const nuevo = !hierro;
        setHierro(nuevo);
        speakText(nuevo ? 'Sulfato ferroso entregado' : 'Sulfato ferroso pendiente');
    };

    const handleSelectVacuna = (v: Vacuna) => {
        setVacunaTetanos(v);
        const labelVac = v === '1A' ? 'Primera dosis' : v === '2A' ? 'Segunda dosis' : 'Refuerzo';
        speakText(`Vacuna anti-tetánica: ${labelVac}`);
    };

    const handleSelectMUAC = (muac: Muac) => {
        setCintaMUAC(muac);
        const labelMuac = muac === 'VERDE' ? 'Verde, adecuado' : muac === 'AMARILLO' ? 'Amarillo, riesgo' : 'Rojo, desnutrición';
        speakText(`Estado nutricional materno: ${labelMuac}`);
    };

    const toggleSintoma = (id: string, label: string) => {
        const activo = sintomasComplicaciones.includes(id);
        setSintomasComplicaciones(prev => activo ? prev.filter(item => item !== id) : [...prev, id]);
        speakText(activo ? `Removido: ${label}` : `Seleccionado signo de alarma: ${label}`);
    };

    const toggleTarjetaAborto = (id: string, title: string) => {
        const activo = tarjetasAborto.includes(id);
        setTarjetasAborto(prev => activo ? prev.filter(item => item !== id) : [...prev, id]);
        speakText(activo ? `Removido: ${title}` : `Seleccionado: ${title}`);
    };

    const handlePartoNormal = (pos: PosicionParto, res: ResultadoParto, posLabel: string, resLabel: string) => {
        setPartoNormalPosicion(pos);
        setPartoNormalResultado(res);
        speakText(`Parto normal: ${posLabel}, resultado ${resLabel}`);
    };

    const togglePuerperioCheckbox = (id: string, label: string) => {
        const activo = puerperioCheckboxes.includes(id);
        setPuerperioCheckboxes(prev => activo ? prev.filter(item => item !== id) : [...prev, id]);
        speakText(activo ? `Removido: ${label}` : `Seleccionado: ${label}`);
    };

    const enfocar = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el instanceof HTMLInputElement) el.focus({ preventScroll: true });
    };

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
        if (!fecha) {
            setErrorFecha(true);
            speakText('Falta la fecha de consulta.');
            enfocar('cm-fecha');
            return;
        }

        setIsSubmitting(true);
        speakText('Guardando los datos del calendario en la base de datos...');

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
                huellaFirmada: true
            }
        };

        try {
            // CORREGIDO: Ruta relativa limpia sin duplicar /api/v1
            await http.post('/calendario-mujer', payload);
            if (!montadoRef.current) return;

            setExito(true);
            speakText('¡Alerta de éxito! Los datos del calendario de atención a la mujer fueron enviados y guardados correctamente en la base de datos.');
            temporizadorRef.current = window.setTimeout(() => {
                if (!montadoRef.current) return;
                setExito(false);
                if (onSuccess) onSuccess();
            }, 3000);
        } catch (err: unknown) {
            console.error('Error al guardar calendario:', err);
            const mensaje =
                (axios.isAxiosError<ErrorServidor>(err) ? err.response?.data?.message : undefined) ??
                'Error al conectar con el servidor. Revise su señal e intente de nuevo.';
            if (montadoRef.current) {
                setErrorServidor(mensaje);
                speakText('Error al enviar los datos. No se pudo guardar en el servidor.');
            }
        } finally {
            if (montadoRef.current) setIsSubmitting(false);
        }
    };

    const renderSintoma = (item: ItemCatalogo, extra = '') => (
        <TarjetaOpcion
            key={item.id}
            activo={sintomasComplicaciones.includes(item.id)}
            onClick={() => toggleSintoma(item.id, item.label)}
            titulo={item.label}
            img={item.img}
            altoImg="h-28 sm:h-32"
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

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden px-3 py-4 sm:px-6 sm:py-10 bg-gradient-to-b from-amber-50/40 via-orange-50/20 to-stone-50">
            <style>{ESTILOS}</style>

            <form onSubmit={handleSubmit} noValidate className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-7">
                
                {/* Cabecera */}
                <header className={`pt-slide-up overflow-hidden ${VIDRIO}`}>
                    <TriStripe />
                    <div className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-[1fr_auto] sm:p-6">
                        <div className="min-w-0 text-center sm:text-left">
                            <span className="inline-block rounded-full bg-amber-100/80 px-3 py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-900 mb-1.5">
                                Servicio de Salud Materna
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 uppercase">
                                Calendario de atención a la mujer
                            </h1>
                            <p className="mt-0.5 text-xs sm:text-sm font-bold text-stone-600">
                                Programa de Parteras Tradicionales · Servicios de Salud de Oaxaca
                            </p>
                        </div>
                        <div className="flex justify-center sm:justify-end">
                            <button
                                type="button"
                                onClick={escucharInstrucciones}
                                aria-pressed={hablando}
                                className={`flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl px-5 text-sm font-black ${BOTON_TIERRA} ${hablando ? 'pt-ring' : ''}`}
                            >
                                <Volume2 className="h-5 w-5 shrink-0" />
                                <span>{hablando ? 'Detener audio' : 'Escuchar instrucciones'}</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Selector de Vista */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
                    <div className="min-h-[32px] flex items-center">
                        {modoDuplicado && (
                            <span className="pt-fade-in inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-black uppercase tracking-wide text-stone-900 shadow-sm">
                                <Award className="h-3.5 w-3.5 text-[#CC7A2C]" />
                                Duplicado oficial SSO · Copia para Centro de Salud
                            </span>
                        )}
                    </div>
                    <div role="group" aria-label="Tipo de vista" className="flex w-full sm:w-auto items-center gap-1.5 rounded-2xl border border-stone-200/90 bg-white/80 p-1.5 shadow-sm">
                        <button
                            type="button"
                            aria-pressed={!modoDuplicado}
                            onClick={() => {
                                setModoDuplicado(false);
                                speakText('Vista Partera activa');
                            }}
                            className={`flex min-h-[42px] flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 ${!modoDuplicado ? BOTON_TIERRA : 'text-stone-700 hover:bg-amber-50/60'}`}
                        >
                            <FileText className="h-4 w-4" />
                            <span>Vista Partera</span>
                        </button>
                        <button
                            type="button"
                            aria-pressed={modoDuplicado}
                            onClick={() => {
                                setModoDuplicado(true);
                                speakText('Mostrando copia oficial para el Centro de Salud');
                            }}
                            className={`flex min-h-[42px] flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 ${modoDuplicado ? BOTON_TIERRA : 'text-stone-700 hover:bg-amber-50/60'}`}
                        >
                            <Building2 className="h-4 w-4" />
                            <span>Centro de Salud</span>
                        </button>
                    </div>
                </div>

                {/* Datos de identificación */}
                <SectionCard
                    acento="ocre"
                    delay={0.05}
                    icon={<User className="h-5 w-5 sm:h-6 sm:w-6" />}
                    title="Datos de identificación de la paciente"
                    subtitle="Toque el micrófono dentro de cada campo para dictar con su voz"
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                            className="sm:col-span-2"
                        />
                        <CampoVoz
                            id="edad"
                            etiqueta="Edad (años)"
                            placeholder="Ej. 26"
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
                                aria-invalid={errorFecha}
                                onChange={(e) => {
                                    setFecha(e.target.value);
                                    if (errorFecha) setErrorFecha(false);
                                    speakText(`Fecha seleccionada: ${e.target.value}`);
                                }}
                                className={`${CLASE_SELECTOR} ${errorFecha ? 'border-red-500 pt-shake' : 'border-stone-200/90'}`}
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

                {/* 1. Embarazo normal y control prenatal */}
                <SectionCard
                    acento="verde"
                    delay={0.08}
                    icon={<Calendar className="h-5 w-5 sm:h-6 sm:w-6" />}
                    title="1. Embarazo normal y control prenatal"
                    subtitle="Mes de embarazo, micronutrientes, vacuna anti-tetánica y semáforo nutricional"
                >
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <div className="space-y-4 rounded-3xl border border-stone-200/80 bg-white/70 p-4 sm:p-5 lg:col-span-2">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-stone-200 pb-3">
                                <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-stone-200/70">
                                    <Imagen src="/EmbarazoNormal.png" alt="Embarazo normal" />
                                </span>
                                <div>
                                    <h3 className="text-sm sm:text-base font-black text-stone-900">Embarazo normal (evolución fisiológica)</h3>
                                    <p className="text-xs font-bold text-stone-600 mt-0.5">Seleccione el mes de gestación activo (1º al 9º mes)</p>
                                </div>
                            </div>
                            <p className={CLASE_ETIQUETA}>Mes de embarazo activo</p>
                            <div className="grid grid-cols-3 gap-2.5">
                                {MESES.map((m) => (
                                    <TarjetaOpcion
                                        key={m}
                                        activo={mesSeleccionado === m}
                                        onClick={() => handleSelectMes(m)}
                                        titulo={`${m}º Mes`}
                                        tituloClassName="text-xl"
                                        className="min-h-[80px]"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3.5">
                            <TarjetaOpcion
                                activo={acidoFolico}
                                onClick={handleSelectAcidoFolico}
                                titulo="Ácido fólico (30 días)"
                                subtitulo={acidoFolico ? 'Entregado' : 'Pendiente'}
                                img="/DuranteElEmbarazo-PrimerosMeses.png"
                                icono={<Pill className="h-5 w-5 shrink-0 text-[#3F7048]" />}
                                disposicion="fila"
                                className="min-h-[92px] flex-1"
                            />
                            <TarjetaOpcion
                                activo={hierro}
                                onClick={handleSelectHierro}
                                titulo="Sulfato ferroso"
                                subtitulo={hierro ? 'Entregado' : 'Pendiente'}
                                img="/DuranteElEmbarazo.png"
                                icono={<Droplet className="h-5 w-5 shrink-0 text-[#C2603A]" />}
                                disposicion="fila"
                                className="min-h-[92px] flex-1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="space-y-3 rounded-3xl border border-stone-200/80 bg-white/70 p-4 sm:p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-stone-200/70">
                                    <Imagen src="/Aplicar-Toxoide-Tetanico.png" alt="Vacunación anti-tetánica" />
                                </span>
                                <h3 className="text-xs sm:text-sm font-black uppercase text-stone-900">Vacunación anti-tetánica (Td/Tdap)</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {VACUNAS.map((v) => (
                                    <TarjetaOpcion
                                        key={v.id}
                                        activo={vacunaTetanos === v.id}
                                        onClick={() => handleSelectVacuna(v.id)}
                                        titulo={v.label}
                                        className="min-h-[72px] px-1 text-xs"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 rounded-3xl border border-stone-200/80 bg-white/70 p-4 sm:p-5">
                            <div className="flex items-center gap-2">
                                <Ruler className="h-5 w-5 text-stone-700" />
                                <h3 className="text-xs sm:text-sm font-black uppercase text-stone-900">Estado nutricional madre (Cinta MUAC)</h3>
                            </div>
                            <SemaforoMUAC
                                value={cintaMUAC}
                                onChange={(muac) => handleSelectMUAC(muac)}
                                label="Estado nutricional de la madre"
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* 2. Embarazo con complicaciones */}
                <SectionCard
                    acento="terracota"
                    delay={0.1}
                    icon={<AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />}
                    title="2. Embarazo con complicaciones"
                    subtitle="Toque los dibujos de los signos de alarma identificados en la valoración clínica"
                    action={
                        <div className="flex flex-wrap items-center gap-3">
                            <ContadorPill total={sintomasComplicaciones.length} />
                            <ReferidoToggle
                                label="Referido"
                                value={referidoEmbarazo}
                                onChange={(v) => {
                                    setReferidoEmbarazo(v);
                                    speakText(v ? 'Paciente referida en embarazo' : 'Sin referencia en embarazo');
                                }}
                            />
                        </div>
                    }
                >
                    <div className="relative overflow-hidden rounded-3xl border border-[#CC7A2C]/30 bg-gradient-to-b from-orange-50/80 to-amber-50/60 p-4 sm:p-6">
                        <svg
                            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
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
                                    stroke="#CC7A2C"
                                    strokeWidth="2"
                                    strokeDasharray="6 5"
                                    strokeLinecap="round"
                                    opacity="0.4"
                                    vectorEffect="non-scaling-stroke"
                                />
                            ))}
                        </svg>

                        <div className="relative z-10 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-6 lg:gap-x-5 lg:gap-y-6">
                            {SINTOMAS_SUPERIORES.map((s) => renderSintoma(s, 'lg:col-span-2'))}
                            {renderSintoma(SINTOMA_IZQUIERDO, 'lg:col-span-2')}

                            <div className="order-first flex flex-col items-center justify-center gap-2.5 rounded-3xl border border-[#CC7A2C]/40 bg-gradient-to-b from-orange-100 to-amber-100 p-5 text-center shadow-xl shadow-orange-950/10 sm:col-span-2 lg:order-none lg:col-span-2">
                                <span className="pt-breathe flex h-10 w-10 items-center justify-center rounded-full bg-[#CC7A2C] text-white shadow-md">
                                    <AlertTriangle className="h-5 w-5" />
                                </span>
                                <span className="flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-stone-200/70">
                                    <Imagen src="/EmbarazoConComplicaciones.png" alt="Embarazo con complicaciones" />
                                </span>
                                <span className={`rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-wider ${BOTON_TIERRA}`}>
                                    Embarazo con complicaciones
                                </span>
                                <p className="text-[11px] font-bold text-stone-700">
                                    Signos de alarma materna
                                </p>
                            </div>

                            {renderSintoma(SINTOMA_DERECHO, 'lg:col-span-2')}
                            {SINTOMAS_INFERIORES.map((s, i) => renderSintoma(s, i === 0 ? 'lg:col-span-2 lg:col-start-2' : 'lg:col-span-2'))}
                        </div>
                    </div>
                </SectionCard>

                {/* 3. Aborto, dolor y hemorragia */}
                <SectionCard
                    acento="terracota"
                    delay={0.12}
                    icon={<ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />}
                    title="3. Aborto, dolor y hemorragia"
                    subtitle="Evaluación clínica de complicaciones hemorrágicas o dolor agudo"
                    action={
                        <div className="flex flex-wrap items-center gap-3">
                            <ContadorPill total={tarjetasAborto.length} />
                            <ReferidoToggle
                                label="Referido"
                                value={referidoAborto}
                                onChange={(v) => {
                                    setReferidoAborto(v);
                                    speakText(v ? 'Referida por hemorragia o aborto' : 'Sin referencia por hemorragia');
                                }}
                            />
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                        {TARJETAS_ABORTO.map((item) => (
                            <TarjetaOpcion
                                key={item.id}
                                activo={tarjetasAborto.includes(item.id)}
                                onClick={() => toggleTarjetaAborto(item.id, item.title)}
                                titulo={item.title}
                                img={item.img}
                                altoImg="h-36 sm:h-40"
                                pie={{ off: 'Marcar', on: 'Registrado' }}
                                className="min-h-[220px]"
                            />
                        ))}
                    </div>
                </SectionCard>

                {/* 4. Parto normal */}
                <SectionCard
                    acento="ocre"
                    delay={0.14}
                    icon={<HeartPulse className="h-5 w-5 sm:h-6 sm:w-6" />}
                    title="4. Parto normal (vertical y horizontal)"
                    subtitle="Posición de atención del parto y estado del recién nacido"
                >
                    <div className="space-y-4">
                        {FILAS_PARTO.map((fila) => {
                            const filaActiva = partoNormalPosicion === fila.pos;
                            return (
                                <div
                                    key={fila.pos}
                                    className={`grid items-center gap-4 rounded-3xl border-2 p-4 transition-all duration-300 lg:grid-cols-2 ${
                                        filaActiva
                                            ? 'border-[#CC7A2C] bg-gradient-to-br from-amber-50/90 to-orange-50/70 shadow-xl shadow-orange-950/10'
                                            : 'border-stone-200/80 bg-white/70'
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 text-center sm:text-left">
                                        <span className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-stone-200/70">
                                            <Imagen src={fila.img} alt={fila.titulo} />
                                        </span>
                                        <div>
                                            <span className="inline-block rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-black uppercase text-stone-800 mb-1.5">
                                                {fila.etiqueta}
                                            </span>
                                            <h3 className="text-sm sm:text-base font-black text-stone-900">{fila.titulo}</h3>
                                            <p className="text-xs font-bold text-stone-600 mt-0.5">{fila.descripcion}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5">
                                        {RESULTADOS_PARTO.map((r) => (
                                            <TarjetaOpcion
                                                key={r.id}
                                                activo={filaActiva && partoNormalResultado === r.id}
                                                onClick={() => handlePartoNormal(fila.pos, r.id, fila.titulo, r.titulo)}
                                                titulo={r.titulo}
                                                img={r.img}
                                                altoImg="h-20 sm:h-24"
                                                icono={<Baby className="h-4 w-4 shrink-0 text-[#CC7A2C]" />}
                                                className="min-h-[150px]"
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>

                {/* 5. Parto complicado */}
                <SectionCard
                    acento="terracota"
                    delay={0.16}
                    icon={<AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />}
                    title="5. Parto complicado (resultado de nacimiento)"
                    subtitle="Seleccione si el nacimiento presentó complicaciones o defunción"
                    action={
                        <ReferidoToggle
                            label="Referido"
                            value={referidoPartoComplicado}
                            onChange={(v) => {
                                setReferidoPartoComplicado(v);
                                speakText(v ? 'Parto complicado referido' : 'Sin referencia en parto complicado');
                            }}
                        />
                    }
                >
                    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
                        {OPCIONES_PARTO_COMPLICADO.map((item) => {
                            const activo = partoComplicadoOpcion === item.id;
                            return (
                                <TarjetaOpcion
                                    key={item.id}
                                    activo={activo}
                                    onClick={() => {
                                        setPartoComplicadoOpcion(activo ? null : item.id);
                                        speakText(activo ? 'Deseleccionado' : `Seleccionado: ${item.title}`);
                                    }}
                                    titulo={item.title}
                                    img={item.img}
                                    altoImg="h-28 sm:h-32"
                                    className="min-h-[190px]"
                                />
                            );
                        })}
                    </div>
                </SectionCard>

                {/* 6. Puerperio normal y complicado */}
                <SectionCard
                    acento="verde"
                    delay={0.18}
                    icon={<HeartPulse className="h-5 w-5 sm:h-6 sm:w-6" />}
                    title="6. Puerperio normal y complicado"
                    subtitle="Primeros 40 días postparto: estado nutricional y signos de alarma"
                >
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <div className="space-y-3.5 rounded-3xl border border-stone-200/80 bg-white/70 p-4 sm:p-5">
                            <div className="flex items-center gap-2">
                                <Ruler className="h-5 w-5 text-stone-700" />
                                <h3 className="text-xs sm:text-sm font-black uppercase text-stone-900">Puerperio normal (Cinta MUAC)</h3>
                            </div>
                            <p className="text-xs font-bold text-stone-600">Evaluación del estado nutricio posparto</p>
                            <SemaforoMUAC
                                value={cintaMUACPuerperio}
                                onChange={(muac) => {
                                    setCintaMUACPuerperio(muac);
                                    speakText(`Estado nutricional en puerperio: ${muac}`);
                                }}
                                label="Estado nutricional en puerperio"
                            />
                        </div>

                        <div className="space-y-3.5 rounded-3xl border border-[#CC7A2C]/30 bg-gradient-to-br from-orange-50/80 to-amber-50/60 p-4 sm:p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h3 className="text-xs sm:text-sm font-black uppercase text-stone-900">Puerperio complicado</h3>
                                <ReferidoToggle
                                    label="Ref"
                                    value={referidoPuerperio}
                                    onChange={(v) => {
                                        setReferidoPuerperio(v);
                                        speakText(v ? 'Puerperio complicado referido' : 'Sin referencia en puerperio');
                                    }}
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3.5">
                                <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-stone-200/70">
                                    <Imagen src="/PuerpericoComplicado.png" alt="Puerperio complicado" />
                                </span>
                                <div className="w-full flex-1 space-y-2.5">
                                    {CHECKS_PUERPERIO.map((chk) => (
                                        <TarjetaOpcion
                                            key={chk.id}
                                            activo={puerperioCheckboxes.includes(chk.id)}
                                            onClick={() => togglePuerperioCheckbox(chk.id, chk.label)}
                                            titulo={chk.label}
                                            disposicion="fila"
                                            className="min-h-[56px]"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* 7. Muerte materna */}
                <SectionCard
                    acento="terracota"
                    delay={0.2}
                    icon={<ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />}
                    title="7. Muerte materna (alerta epidemiológica médica)"
                    subtitle="Registro prioritario inmediato ante fallecimiento materno ocurrido en la comunidad"
                >
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                        {ETAPAS_MUERTE_MATERNA.map((item) => {
                            const activo = muerteMaternaEtapa === item.id;
                            return (
                                <TarjetaOpcion
                                    key={item.id}
                                    activo={activo}
                                    onClick={() => {
                                        setMuerteMaternaEtapa(activo ? null : item.id);
                                        speakText(activo ? 'Alerta retirada' : `Alerta de muerte materna en ${item.title} registrada`);
                                    }}
                                    titulo={item.title}
                                    img={item.img}
                                    altoImg="h-36 sm:h-40"
                                    pie={{ off: 'Notificar', on: 'Notificado', iconoOff: <AlertTriangle className="h-3.5 w-3.5 text-[#CC7A2C]" /> }}
                                    className="min-h-[220px]"
                                />
                            );
                        })}
                    </div>
                </SectionCard>

                {/* 8. Cierre administrativo */}
                <section className={`pt-slide-up overflow-hidden ${VIDRIO}`} style={{ animationDelay: '.22s' }}>
                    <TriStripe />
                    <div className="space-y-5 p-4 sm:p-6">
                        <div className="flex items-center gap-3.5 border-b border-stone-200/80 pb-4">
                            <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D69A1E] to-[#C2603A] text-white shadow-xl shadow-orange-900/15">
                                <PenTool className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-base sm:text-xl font-black leading-tight text-stone-900">
                                    Cierre administrativo del informe materno
                                </h2>
                                <p className="text-xs sm:text-sm font-bold text-stone-600 mt-0.5">
                                    Datos de la partera acreditada, localidad, municipio y supervisión institucional
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {camposCierre.map((c) => (
                                <CampoVoz
                                    key={c.key}
                                    id={c.key}
                                    etiqueta={c.label}
                                    placeholder={c.ph}
                                    valor={c.value}
                                    onCambio={c.set}
                                    onMic={() => startVoice(c.set, c.key)}
                                    escuchando={listeningField === c.key}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Error del servidor */}
                {errorServidor && (
                    <div
                        role="alert"
                        className="pt-pop-in rounded-3xl border-2 border-red-300 bg-red-50 p-4 text-xs sm:text-sm font-bold text-stone-900 shadow-xl flex items-center gap-3"
                    >
                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                        <span>{errorServidor}</span>
                    </div>
                )}

                {/* Botón de envío Principal */}
                <button
                    type="submit"
                    disabled={isSubmitting || exito}
                    className={`pt-slide-up flex min-h-[80px] w-full cursor-pointer items-center justify-center gap-3 rounded-3xl px-6 py-5 text-lg sm:text-xl font-black disabled:cursor-wait disabled:opacity-80 ${BOTON_TIERRA} ${nombreMujer.trim() && !isSubmitting ? 'pt-breathe' : ''}`}
                    style={{ animationDelay: '.25s' }}
                >
                    {isSubmitting ? <Loader2 className="h-7 w-7 animate-spin" /> : <Send className="h-7 w-7" />}
                    <span>{isSubmitting ? 'Guardando en PostgreSQL (Render)…' : 'REGISTRAR CALENDARIO DE LA MUJER'}</span>
                </button>

                {/* Confirmación de éxito */}
                {exito && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="pt-fade-in fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-md"
                    >
                        <div className={`pt-pop-in w-full max-w-md overflow-hidden text-center ${VIDRIO}`}>
                            <TriStripe className="h-2" />
                            <div className="p-7">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl animate-bounce">
                                    <Check className="h-10 w-10" strokeWidth={3.5} />
                                </div>
                                <h2 className="text-2xl font-black text-stone-900">¡Datos guardados con éxito!</h2>
                                <p className="mt-2 text-sm sm:text-base font-bold text-stone-700">
                                    El calendario de atención de {nombreMujer || 'la paciente'} se ha enviado y guardado correctamente en la base de datos.
                                </p>
                                <p className="mt-3 text-xs sm:text-sm font-bold text-stone-500">Regresando al menú principal…</p>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default CalendarioMujer;