import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    Baby,
    Mic,
    Square,
    Send,
    AlertTriangle,
    Calendar,
    Check,
    ShieldAlert,
    User,
    PenTool,
    Syringe,
    Ruler,
    FileText,
    Building2,
    Award,
    Loader2,
    Volume2,
    CheckCircle2
} from 'lucide-react';
import { handleVoiceInput } from '../../../utils/voiceUtils';
import { http } from '../../../services/http';

/* ============================================================================
 * FormatoCalendarioNino — Versión Profesional con Retroalimentación Auditiva por Botón
 * Servicios de Salud de Oaxaca · Programa de Parteras Tradicionales
 * ========================================================================== */

export interface FormatoCalendarioNinoProps {
    onBack?: () => void;
    onSuccess?: () => void;
    hablarTexto?: (texto: string) => void;
}

type MuacNino = 'VERDE' | 'AMARILLO' | 'ROJO';
type VacunaNino = 'BCG' | 'HEPATITIS_B' | 'PENTAVALENTE' | 'ROTAVIRUS' | 'NEUMOCOCICA' | 'SRP';
type AcentoNino = 'verde' | 'turquesa' | 'lima';

interface ItemCatalogoNino {
    id: string;
    label: string;
    subtitulo?: string;
    img?: string;
}

interface ErrorServidor {
    message?: string;
}

/* ------------------------------ Catálogos -------------------------------- */
const MESES_NINO = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24] as const;

const VACUNAS_NINO: { id: VacunaNino; label: string; subtitulo: string; img?: string }[] = [
    { id: 'BCG', label: 'BCG', subtitulo: 'Única al nacer (Tuberculosis)', img: '/Vacuna.png' },
    { id: 'HEPATITIS_B', label: 'Hepatitis B', subtitulo: 'Recién nacido', img: '/Vacuna.png' },
    { id: 'PENTAVALENTE', label: 'Pentavalente', subtitulo: '2o, 4o y 6o mes', img: '/Vacuna.png' },
    { id: 'ROTAVIRUS', label: 'Rotavirus', subtitulo: 'Prevención diarrea grave', img: '/Vacuna.png' },
    { id: 'NEUMOCOCICA', label: 'Neumocócica', subtitulo: 'Conjugada', img: '/Vacuna.png' },
    { id: 'SRP', label: 'SRP', subtitulo: 'Sarampión, rubéola, parotiditis (1 año)', img: '/Vacuna.png' }
];

const SEMAFORO_NINO: { id: MuacNino; titulo: string; estado: string; on: string; off: string }[] = [
    {
        id: 'VERDE',
        titulo: 'Verde',
        estado: 'Peso adecuado',
        on: 'border-emerald-700 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-900/30 scale-[1.02]',
        off: 'border-emerald-200 bg-emerald-50/80 text-stone-900 hover:border-emerald-400'
    },
    {
        id: 'AMARILLO',
        titulo: 'Amarillo',
        estado: 'Riesgo de desnutrición',
        on: 'border-[#9A6A0F] bg-gradient-to-br from-[#E3AE3A] to-[#D69A1E] text-stone-900 shadow-xl shadow-amber-900/30 scale-[1.02]',
        off: 'border-amber-200 bg-amber-50/80 text-stone-900 hover:border-[#D69A1E]'
    },
    {
        id: 'ROJO',
        titulo: 'Rojo',
        estado: 'Desnutrición grave',
        on: 'border-red-800 bg-gradient-to-br from-red-500 to-red-700 text-white shadow-xl shadow-red-900/30 scale-[1.02]',
        off: 'border-red-200 bg-red-50/80 text-stone-900 hover:border-red-400'
    }
];

const SIGNOS_ALARMA_NINO: ItemCatalogoNino[] = [
    { id: 'FIEBRE_ALTA', label: 'Fiebre alta repentina o dificultad para calmar el llanto', img: '/DolorDeCabeza.png' },
    { id: 'RESPIRACION_RAPIDA', label: 'Respiración rápida, hundimiento de costillas o sibilancias', img: '/DificultadParaRespirar.png' },
    { id: 'DIARREA_VOMITO', label: 'Diarrea persistente o vómito a todo lo que mama/come', img: '/VomitoFrecuente.png' },
    { id: 'SOMNOLENCIA', label: 'Mucha somnolencia, apatía o dificultad para despertar', img: '/Hinchazon.png' },
    { id: 'MANCHAS_PIEL', label: 'Manchas rojas o violetas en la piel (petequias)', img: '/Hemorragia.png' },
    { id: 'CONVULSIONES_NINO', label: 'Convulsiones o movimientos atípicos', img: '/Convulsiones.png' }
];

const INSTRUCCIONES_VOZ_NINO =
    'Calendario de atención del niño y la niña menor de dos años. ' +
    'Escriba o dicte los datos del recién nacido o lactante tocando el micrófono en cada campo. ' +
    'Seleccione el mes de control, el estado nutricional con cinta MUAC, las vacunas aplicadas y los signos de alarma. ' +
    'Al finalizar, complete los datos administrativos de cierre y presione registrar.';

/* --------------------------- Estilos / Animaciones ------------------------ */
const ESTILOS = `
@keyframes pt-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pt-slide-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pt-pop-in { 0% { opacity: 0; transform: scale(.4) } 70% { transform: scale(1.18) } 100% { opacity: 1; transform: scale(1) } }
@keyframes pt-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.02) } }
@keyframes pt-wave { 0%,100% { transform: scaleY(.25) } 50% { transform: scaleY(1) } }
@keyframes pt-ring { 0% { box-shadow: 0 0 0 0 rgba(62,142,126,.5) } 100% { box-shadow: 0 0 0 16px rgba(62,142,126,0) } }
@keyframes pt-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } }
.pt-fade-in { animation: pt-fade-in .4s cubic-bezier(.16,1,.3,1) both }
.pt-slide-up { animation: pt-slide-up .5s cubic-bezier(.16,1,.3,1) both }
.pt-pop-in { animation: pt-pop-in .35s cubic-bezier(.34,1.56,.64,1) both }
.pt-breathe { animation: pt-breathe 3s ease-in-out infinite }
.pt-ring { animation: pt-ring 1.2s ease-out infinite }
.pt-shake { animation: pt-shake .4s ease-in-out }
.pt-wave-bar { display: inline-block; width: 4px; height: 22px; border-radius: 4px; background: #3E8E7E; transform-origin: center; animation: pt-wave .9s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .pt-fade-in, .pt-slide-up, .pt-pop-in, .pt-breathe, .pt-ring, .pt-shake, .pt-wave-bar { animation: none !important }
}
`;

const VIDRIO =
    'bg-white/90 backdrop-blur-xl border border-white/80 shadow-2xl shadow-teal-950/10 rounded-3xl transition-all duration-300';

const BOTON_TEAL =
    'bg-gradient-to-r from-[#3E8E7E] via-[#2F7365] to-[#24594E] text-white shadow-xl shadow-teal-900/30 border border-white/30 transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.98]';

const CLASE_SELECTOR =
    'h-16 w-full rounded-2xl border-2 bg-white/95 px-4 text-base sm:text-lg font-bold text-stone-900 outline-none transition-all duration-200 focus:border-[#3E8E7E] focus:ring-4 focus:ring-[#3E8E7E]/20';

const CLASE_ETIQUETA = 'mb-2 block text-xs sm:text-sm font-black uppercase tracking-wider text-stone-700';

const ACENTOS_NINO: Record<AcentoNino, string> = {
    verde: 'from-[#3E8E7E] to-[#24594E]',
    turquesa: 'from-[#2F7365] to-[#1E4A40]',
    lima: 'from-[#4A9988] to-[#347063]'
};

/* ------------------------- Componentes reutilizables ---------------------- */
const TriStripeNino: React.FC<{ className?: string }> = ({ className = 'h-2' }) => (
    <div className={`w-full bg-gradient-to-r from-[#24594E] via-[#3E8E7E] to-[#D69A1E] ${className}`} aria-hidden="true" />
);

const ImagenNino: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
    const [fallo, setFallo] = useState(false);
    if (fallo) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-teal-50 px-2 text-center text-xs font-bold text-stone-500">
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
        ? 'border-[#3E8E7E] ring-4 ring-[#3E8E7E]/20 bg-teal-50/60'
        : error
            ? 'border-red-500 pt-shake'
            : 'border-stone-200/90 hover:border-stone-300';

    return (
        <div className={className}>
            <label htmlFor={`cn-${id}`} className={CLASE_ETIQUETA}>
                {etiqueta}
            </label>
            <div className="relative">
                <input
                    id={`cn-${id}`}
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
                    className={`absolute right-2.5 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-2xl text-white shadow-md transition-all duration-200 active:scale-95 ${escuchando ? 'pt-ring bg-[#1E4A40]' : 'bg-[#3E8E7E] hover:bg-[#2F7365] hover:shadow-lg'}`}
                >
                    {escuchando ? <Square className="h-5 w-5 fill-current" /> : <Mic className="h-6 w-6" strokeWidth={2.4} />}
                </button>
            </div>
        </div>
    );
};

interface SectionCardProps {
    icon: React.ReactNode;
    acento?: AcentoNino;
    title: string;
    subtitle: string;
    action?: React.ReactNode;
    delay?: number;
    children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, acento = 'verde', title, subtitle, action, delay = 0.05, children }) => (
    <section className={`pt-slide-up p-5 sm:p-8 ${VIDRIO}`} style={{ animationDelay: `${delay}s` }}>
        <div className="mb-6 flex flex-col gap-4 border-b border-stone-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
                <span className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-xl shadow-teal-900/15 ${ACENTOS_NINO[acento]}`}>
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
    <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-[#3E8E7E]/40 bg-teal-50 px-4 py-2 text-xs sm:text-sm font-black text-stone-900 shadow-sm sm:self-auto">
        <CheckCircle2 className="h-4 w-4 text-[#3E8E7E]" />
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
            className={`min-h-[48px] min-w-[64px] cursor-pointer rounded-xl px-4 text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 ${!value ? 'bg-stone-800 text-white shadow-md' : 'text-stone-700 hover:bg-teal-50'}`}
        >
            NO
        </button>
        <button
            type="button"
            aria-pressed={value}
            onClick={() => onChange(true)}
            className={`flex min-h-[48px] min-w-[72px] cursor-pointer items-center justify-center gap-1 rounded-xl px-4 text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 ${value ? 'bg-[#3E8E7E] text-white shadow-md' : 'text-stone-700 hover:bg-teal-50'}`}
        >
            <span>SÍ</span>
            <AlertTriangle className={`h-3.5 w-3.5 ${value ? 'text-teal-200' : 'text-[#3E8E7E]'}`} />
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
    const seleccionada = 'border-[#3E8E7E] bg-gradient-to-b from-teal-50/90 to-emerald-50/70 shadow-xl shadow-teal-950/10 ring-4 ring-[#3E8E7E]/15 scale-[1.01]';
    const normal = 'border-stone-200/90 bg-white/95 shadow-sm hover:-translate-y-0.5 hover:border-[#3E8E7E]/50 hover:shadow-lg';

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={activo}
            className={`relative min-h-[72px] w-full cursor-pointer touch-manipulation select-none rounded-3xl border-2 p-3.5 sm:p-4 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#3E8E7E]/40 active:scale-[0.98] ${activo ? seleccionada : normal} ${
                fila
                    ? 'flex items-center gap-3.5 text-left'
                    : `flex flex-col items-center gap-3 text-center ${img || pie ? 'justify-between' : 'justify-center'}`
            } ${className}`}
        >
            {activo && (
                <span className="pt-pop-in absolute -right-2 -top-2 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 border-white bg-[#3E8E7E] text-white shadow-lg">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3.5} />
                </span>
            )}

            {img && (
                <span className={`flex items-center justify-center overflow-hidden bg-white p-2.5 shadow-inner ring-1 ring-stone-200/60 ${fila ? 'h-20 w-20 shrink-0 rounded-2xl' : `w-full rounded-2xl ${altoImg}`}`}>
                    <ImagenNino src={img} alt={titulo} />
                </span>
            )}

            <span className={`flex flex-col gap-1 ${fila ? 'min-w-0 flex-1' : 'flex-1 items-center justify-center'}`}>
                <span className={`font-black leading-tight text-stone-900 ${tituloClassName ?? (img && !fila ? 'text-xs sm:text-sm uppercase tracking-wide' : 'text-sm sm:text-base')}`}>{titulo}</span>
                {subtitulo && <span className="text-xs sm:text-sm font-bold text-stone-600">{subtitulo}</span>}
            </span>

            {icono}

            {pie && (
                <span className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider ${activo ? 'bg-[#3E8E7E] text-white' : 'bg-stone-100/80 text-stone-700'}`}>
                    <span>{activo ? pie.on : pie.off}</span>
                    {activo ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : pie.iconoOff}
                </span>
            )}
        </button>
    );
};

/* ------------------------------ Componente principal ---------------------- */
export const FormatoCalendarioNino: React.FC<FormatoCalendarioNinoProps> = ({
    onSuccess,
    hablarTexto
}) => {
    // 0. Modo Duplicado (Vista Partera vs Copia Centro de Salud)
    const [modoDuplicado, setModoDuplicado] = useState(false);

    // 1. Datos de Identificación
    const [nombreNino, setNombreNino] = useState('');
    const [edadMeses, setEdadMeses] = useState('');
    const [fecha, setFecha] = useState('');
    const [nombreMadre, setNombreMadre] = useState('');
    const [localidad, setLocalidad] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [listeningField, setListeningField] = useState<string | null>(null);

    // 2. Control y Seguimiento
    const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
    const [cintaMUACNino, setCintaMUACNino] = useState<MuacNino | null>(null);
    const [vacunasSeleccionadas, setVacunasSeleccionadas] = useState<VacunaNino[]>([]);

    // 3. Signos de Alarma
    const [referidoAlarma, setReferidoAlarma] = useState<boolean>(false);
    const [alarmasSeleccionadas, setAlarmasSeleccionadas] = useState<string[]>([]);

    // 4. Cierre Administrativo
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
        speakText(INSTRUCCIONES_VOZ_NINO);
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

    // Funciones de selección con retroalimentación auditiva inmediata
    const handleSelectMes = (m: number) => {
        setMesSeleccionado(m);
        speakText(`Control seleccionado: ${m}º mes de vida`);
    };

    const handleSelectMUAC = (muac: MuacNino) => {
        setCintaMUACNino(muac);
        const labelMuac = muac === 'VERDE' ? 'Verde, peso adecuado' : muac === 'AMARILLO' ? 'Amarillo, riesgo de desnutrición' : 'Rojo, desnutrición grave';
        speakText(`Estado nutricional del niño: ${labelMuac}`);
    };

    const toggleVacuna = (id: VacunaNino, label: string) => {
        const activo = vacunasSeleccionadas.includes(id);
        setVacunasSeleccionadas(prev => activo ? prev.filter(item => item !== id) : [...prev, id]);
        speakText(activo ? `Vacuna removida: ${label}` : `Vacuna registrada: ${label}`);
    };

    const toggleAlarma = (id: string, label: string) => {
        const activo = alarmasSeleccionadas.includes(id);
        setAlarmasSeleccionadas(prev => activo ? prev.filter(item => item !== id) : [...prev, id]);
        speakText(activo ? `Signo removido: ${label}` : `Signo de alarma registrado: ${label}`);
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

        if (!nombreNino.trim()) {
            setErrorNombre(true);
            speakText('Falta el nombre del niño o niña.');
            enfocar('cn-nombreNino');
            return;
        }
        if (!fecha) {
            setErrorFecha(true);
            speakText('Falta la fecha de consulta.');
            enfocar('cn-fecha');
            return;
        }

        setIsSubmitting(true);
        speakText('Guardando los datos del calendario del niño en la base de datos...');

        const payload = {
            parteraId: localStorage.getItem('partera_id') || 'DEFAULT-PARTERA-UUID',
            datosNino: {
                nombreNino,
                edadMeses: parseInt(edadMeses) || 0,
                fechaConsulta: fecha,
                nombreMadre,
                localidad,
                municipio,
                esCopiaCentroSalud: modoDuplicado
            },
            controlNutricional: {
                mesVidaActivo: mesSeleccionado,
                muacNino: cintaMUACNino,
                vacunasAplicadas: vacunasSeleccionadas
            },
            signosAlarma: {
                referido: referidoAlarma,
                alarmas: alarmasSeleccionadas
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
            await http.post('/api/v1/calendario-nino', payload);
            if (!montadoRef.current) return;

            setExito(true);
            speakText('¡Alerta de éxito! Los datos del calendario del niño fueron enviados y guardados correctamente en la base de datos.');
            temporizadorRef.current = window.setTimeout(() => {
                if (!montadoRef.current) return;
                setExito(false);
                if (onSuccess) onSuccess();
            }, 3000);
        } catch (err: unknown) {
            console.error('Error al guardar calendario del niño:', err);
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

    const renderAlarma = (item: ItemCatalogoNino) => {
        const activo = alarmasSeleccionadas.includes(item.id);
        return (
            <TarjetaOpcion
                key={item.id}
                activo={activo}
                onClick={() => toggleAlarma(item.id, item.label)}
                titulo={item.label}
                img={item.img}
                altoImg="h-28 sm:h-32"
                pie={{ off: 'Seleccionar', on: 'Seleccionado' }}
                className="h-full"
            />
        );
    };

    const camposCierre = [
        { key: 'nombrePartera', label: 'Nombre de la partera', ph: 'Partera tradicional…', value: nombrePartera, set: setNombrePartera },
        { key: 'cierreLocalidad', label: 'Localidad', ph: 'Localidad…', value: cierreLocalidad, set: setCierreLocalidad },
        { key: 'noMunicipio', label: 'No. Municipio', ph: 'Número de municipio…', value: noMunicipio, set: setNoMunicipio },
        { key: 'mesInformado', label: 'Mes informado', ph: 'Mes informado…', value: mesInformado, set: setMesInformado },
        { key: 'nombreSupervisor', label: 'Nombre del supervisor', ph: 'Nombre del supervisor…', value: nombreSupervisor, set: setNombreSupervisor },
        { key: 'centroSalud', label: 'Centro de salud', ph: 'Centro de salud…', value: centroSalud, set: setCentroSalud }
    ];

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden px-3 py-4 sm:px-6 sm:py-10 bg-gradient-to-b from-teal-50/40 via-emerald-50/20 to-stone-50">
            <style>{ESTILOS}</style>

            <form onSubmit={handleSubmit} noValidate className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-7">
                
                {/* ===================== Cabecera Compacta ===================== */}
                <header className={`pt-slide-up overflow-hidden ${VIDRIO}`}>
                    <TriStripeNino />
                    <div className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-[1fr_auto] sm:p-6">
                        <div className="min-w-0 text-center sm:text-left">
                            <span className="inline-block rounded-full bg-teal-100/80 px-3 py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider text-teal-900 mb-1.5">
                                Salud Infantil (Menores de 2 Años)
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 uppercase">
                                Calendario del Niño y la Niña
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
                                className={`flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl px-5 text-sm font-black ${BOTON_TEAL} ${hablando ? 'pt-ring' : ''}`}
                            >
                                <Volume2 className="h-5 w-5 shrink-0" />
                                <span>{hablando ? 'Detener audio' : 'Escuchar instrucciones'}</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* ============ Selector de Vista ================= */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
                    <div className="min-h-[32px] flex items-center">
                        {modoDuplicado && (
                            <span className="pt-fade-in inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-50 px-3.5 py-1.5 text-xs font-black uppercase tracking-wide text-stone-900 shadow-sm">
                                <Award className="h-3.5 w-3.5 text-[#3E8E7E]" />
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
                            className={`flex min-h-[42px] flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 ${!modoDuplicado ? BOTON_TEAL : 'text-stone-700 hover:bg-teal-50/60'}`}
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
                            className={`flex min-h-[42px] flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 ${modoDuplicado ? BOTON_TEAL : 'text-stone-700 hover:bg-teal-50/60'}`}
                        >
                            <Building2 className="h-4 w-4" />
                            <span>Centro de Salud</span>
                        </button>
                    </div>
                </div>

                {/* ================= Datos de identificación del niño ================= */}
                <SectionCard
                    acento="verde"
                    delay={0.05}
                    icon={<User className="h-5 w-5 sm:h-6 sm:w-6" />}
                    title="Datos de identificación del niño o niña"
                    subtitle="Toque el micrófono dentro de cada campo para dictar con su voz"
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CampoVoz
                            id="nombreNino"
                            etiqueta="Nombre del niño o niña"
                            placeholder="Nombre completo del infante…"
                            valor={nombreNino}
                            onCambio={(v) => {
                                setNombreNino(v);
                                if (errorNombre) setErrorNombre(false);
                            }}
                            onMic={() => startVoice((v) => { setNombreNino(v); setErrorNombre(false); }, 'nombreNino')}
                            escuchando={listeningField === 'nombreNino'}
                            error={errorNombre}
                            className="sm:col-span-2"
                        />
                        <CampoVoz
                            id="edadMeses"
                            etiqueta="Edad (meses o días si es recién nacido)"
                            placeholder="Ej. 6 meses"
                            inputMode="numeric"
                            maxLength={3}
                            valor={edadMeses}
                            onCambio={(v) => setEdadMeses(v.replace(/\D/g, '').slice(0, 3))}
                            onMic={() => startVoice((v) => setEdadMeses(v.replace(/\D/g, '').slice(0, 3)), 'edadMeses')}
                            escuchando={listeningField === 'edadMeses'}
                        />
                        <div>
                            <label htmlFor="cn-fecha" className={CLASE_ETIQUETA}>
                                Fecha de consulta
                            </label>
                            <input
                                id="cn-fecha"
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
                            id="nombreMadre"
                            etiqueta="Nombre de la madre"
                            placeholder="Nombre completo de la madre…"
                            valor={nombreMadre}
                            onCambio={setNombreMadre}
                            onMic={() => startVoice(setNombreMadre, 'nombreMadre')}
                            escuchando={listeningField === 'nombreMadre'}
                            className="sm:col-span-2"
                        />
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

                {/* ================= Control Nutricional y Vacunación ================= */}
                <SectionCard
                    acento="turquesa"
                    delay={0.08}
                    icon={<Calendar className="h-5 w-5 sm:h-6 sm:w-6" />}
                    title="Control de crecimiento y vacunación"
                    subtitle="Seleccione el mes de vida, evaluación nutricional con cinta MUAC y esquema de vacunación"
                >
                    <div className="space-y-4 rounded-3xl border border-stone-200/80 bg-white/70 p-4 sm:p-5">
                        <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
                            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-stone-200/70">
                                <ImagenNino src="/Vacuna.png" alt="Control de crecimiento" />
                            </span>
                            <div>
                                <h3 className="text-sm sm:text-base font-black text-stone-900">Mes de control (1 al 12 meses, 18 y 24 meses)</h3>
                                <p className="text-xs font-bold text-stone-600 mt-0.5">Toque el mes activo correspondiente a la revisión del infante</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2.5">
                            {MESES_NINO.map((m) => (
                                <TarjetaOpcion
                                    key={m}
                                    activo={mesSeleccionado === m}
                                    onClick={() => handleSelectMes(m)}
                                    titulo={`${m}º Mes`}
                                    tituloClassName="text-base sm:text-lg"
                                    className="min-h-[72px]"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <div className="space-y-3 rounded-3xl border border-stone-200/80 bg-white/70 p-4 sm:p-5">
                            <div className="flex items-center gap-2">
                                <Ruler className="h-5 w-5 text-stone-700" />
                                <h3 className="text-xs sm:text-sm font-black uppercase text-stone-900">Estado nutricional (Cinta MUAC infantil)</h3>
                            </div>
                            <div role="radiogroup" aria-label="Estado nutricional del infante" className="grid grid-cols-3 gap-2.5 pt-2">
                                {SEMAFORO_NINO.map((s) => {
                                    const activo = cintaMUACNino === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            role="radio"
                                            aria-checked={activo}
                                            onClick={() => handleSelectMUAC(s.id)}
                                            className={`relative flex min-h-[96px] cursor-pointer touch-manipulation flex-col items-center justify-center gap-1 rounded-3xl border-2 px-2 py-3 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${activo ? s.on : s.off}`}
                                        >
                                            {activo && (
                                                <span className="pt-pop-in absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-stone-900 text-white shadow-md">
                                                    <Check className="h-4 w-4" strokeWidth={3.5} />
                                                </span>
                                            )}
                                            <span className="text-sm font-black uppercase tracking-wider">{s.titulo}</span>
                                            <span className="text-[10px] font-bold opacity-90 text-center">{s.estado}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-3 rounded-3xl border border-stone-200/80 bg-white/70 p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Syringe className="h-5 w-5 text-[#3E8E7E]" />
                                    <h3 className="text-xs sm:text-sm font-black uppercase text-stone-900">Esquema de vacunación</h3>
                                </div>
                                <ContadorPill total={vacunasSeleccionadas.length} />
                            </div>
                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                                {VACUNAS_NINO.map((v) => {
                                    const activo = vacunasSeleccionadas.includes(v.id);
                                    return (
                                        <TarjetaOpcion
                                            key={v.id}
                                            activo={activo}
                                            onClick={() => toggleVacuna(v.id, v.label)}
                                            titulo={v.label}
                                            subtitulo={v.subtitulo}
                                            img={v.img}
                                            altoImg="h-16"
                                            className="min-h-[88px]"
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* ================= Signos de Alarma Infantil ================= */}
                <SectionCard
                    acento="lima"
                    delay={0.1}
                    icon={<AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />}
                    title="Signos de alarma en el menor de 2 años"
                    subtitle="Toque los signos de alarma detectados durante la evaluación del infante"
                    action={
                        <div className="flex flex-wrap items-center gap-3">
                            <ContadorPill total={alarmasSeleccionadas.length} />
                            <ReferidoToggle
                                label="Referido urgente"
                                value={referidoAlarma}
                                onChange={(v) => {
                                    setReferidoAlarma(v);
                                    speakText(v ? 'Infante referido de urgencia al hospital' : 'Sin referencia urgente');
                                }}
                            />
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                        {SIGNOS_ALARMA_NINO.map(renderAlarma)}
                    </div>
                </SectionCard>

                {/* ================= Cierre Administrativo ================= */}
                <section className={`pt-slide-up overflow-hidden ${VIDRIO}`} style={{ animationDelay: '.15s' }}>
                    <TriStripeNino />
                    <div className="space-y-5 p-4 sm:p-6">
                        <div className="flex items-center gap-3.5 border-b border-stone-200/80 pb-4">
                            <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3E8E7E] to-[#24594E] text-white shadow-xl shadow-teal-900/15">
                                <PenTool className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-base sm:text-xl font-black leading-tight text-stone-900">
                                    Cierre administrativo del informe infantil
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

                {/* ================== Error del servidor ====================== */}
                {errorServidor && (
                    <div
                        role="alert"
                        className="pt-pop-in rounded-3xl border-2 border-red-300 bg-red-50 p-4 text-xs sm:text-sm font-bold text-stone-900 shadow-xl flex items-center gap-3"
                    >
                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                        <span>{errorServidor}</span>
                    </div>
                )}

                {/* ====================== Botón de envío Principal ====================== */}
                <button
                    type="submit"
                    disabled={isSubmitting || exito}
                    className={`pt-slide-up flex min-h-[80px] w-full cursor-pointer items-center justify-center gap-3 rounded-3xl px-6 py-5 text-lg sm:text-xl font-black disabled:cursor-wait disabled:opacity-80 ${BOTON_TEAL} ${nombreNino.trim() && !isSubmitting ? 'pt-breathe' : ''}`}
                    style={{ animationDelay: '.2s' }}
                >
                    {isSubmitting ? <Loader2 className="h-7 w-7 animate-spin" /> : <Send className="h-7 w-7" />}
                    <span>{isSubmitting ? 'Guardando en PostgreSQL (Render)…' : 'REGISTRAR CALENDARIO DEL NIÑO/A'}</span>
                </button>

                {/* ================== Confirmación de éxito ======================= */}
                {exito && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="pt-fade-in fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-md"
                    >
                        <div className={`pt-pop-in w-full max-w-md overflow-hidden text-center ${VIDRIO}`}>
                            <TriStripeNino className="h-2" />
                            <div className="p-7">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl animate-bounce">
                                    <Check className="h-10 w-10" strokeWidth={3.5} />
                                </div>
                                <h2 className="text-2xl font-black text-stone-900">¡Datos guardados con éxito!</h2>
                                <p className="mt-2 text-sm sm:text-base font-bold text-stone-700">
                                    El calendario de {nombreNino || 'el infante'} se ha enviado y guardado correctamente en la base de datos.
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

export default FormatoCalendarioNino;