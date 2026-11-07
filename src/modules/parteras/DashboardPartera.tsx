import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Volume2,
    VolumeX,
    ShieldCheck,
    BadgeCheck,
    CheckCircle2,
    Ambulance,
    HeartPulse,
    Baby,
    Info,
    QrCode,
    KeyRound,
    ChevronLeft,
    ArrowRight,
    type LucideIcon
} from 'lucide-react';
import { FormatoReferencia } from './components/FormatoReferencia';
import { CalendarioMujer } from './CalendarioMujer';
import { FormatoCalendarioNino } from './components/FormatoCalendarioNino';
import { handleVoiceInput } from '../../utils/voiceUtils';

/* ------------------------------------------------------------------ */
/* Tipos                                                              */
/* ------------------------------------------------------------------ */

type Vista = 'HOME' | 'REFERENCIA' | 'MUJER' | 'NINO';
type VistaFormato = Exclude<Vista, 'HOME'>;

interface TarjetaMenu {
    vista: VistaFormato;
    formato: string;
    titulo: string;
    descripcion: string;
    imagen: string;
    alt: string;
    vozApertura: string;
    FallbackIcon: LucideIcon;
    // Clases completas (estáticas) para que Tailwind las detecte en build
    badge: string;
    marco: string;
    borde: string;
    sombra: string;
    tituloHover: string;
    acento: string;
    halo: string;
}

interface CardImageProps {
    src: string;
    alt: string;
    FallbackIcon: LucideIcon;
    className?: string;
}

interface OndasVozProps {
    className?: string;
}

/* ------------------------------------------------------------------ */
/* Datos del menú                                                     */
/* ------------------------------------------------------------------ */

const TARJETAS: TarjetaMenu[] = [
    {
        vista: 'REFERENCIA',
        formato: 'FORMATO 1',
        titulo: '1. Ficha de Referencia y Contrareferencia',
        descripcion: 'Canalizaciones urgentes, Zika, Tamiz y módulo de respuesta médica.',
        imagen: '/icono-referencia.png',
        alt: 'Ilustración de una ambulancia y una cruz médica para la ficha de referencia',
        vozApertura: 'Abriendo Formato 1: Ficha de Referencia y Contrareferencia.',
        FallbackIcon: Ambulance,
        badge: 'bg-rose-100 text-[#9D2449] border-rose-200',
        marco: 'from-rose-100 to-rose-50 border-rose-200 group-hover:border-[#9D2449]/50',
        borde: 'border-white/70 hover:border-[#9D2449]/60 focus-visible:ring-[#9D2449]',
        sombra: 'shadow-rose-900/10 hover:shadow-rose-900/25',
        tituloHover: 'group-hover:text-[#9D2449]',
        acento: 'text-[#9D2449]',
        halo: 'bg-rose-300/40'
    },
    {
        vista: 'MUJER',
        formato: 'FORMATO 2',
        titulo: '2. Calendario de Atención a la Mujer',
        descripcion: 'Control meses 1-9, cinta MUAC, parto vertical/horizontal y muerte materna.',
        imagen: '/icono-prenatal.png',
        alt: 'Ilustración de una mujer embarazada para el calendario de atención a la mujer',
        vozApertura: 'Abriendo Formato 2: Calendario de Atención a la Mujer.',
        FallbackIcon: HeartPulse,
        badge: 'bg-purple-100 text-purple-900 border-purple-200',
        marco: 'from-purple-100 to-fuchsia-50 border-purple-200 group-hover:border-purple-500/50',
        borde: 'border-white/70 hover:border-purple-500/60 focus-visible:ring-purple-600',
        sombra: 'shadow-purple-900/10 hover:shadow-purple-900/25',
        tituloHover: 'group-hover:text-purple-700',
        acento: 'text-purple-700',
        halo: 'bg-purple-300/40'
    },
    {
        vista: 'NINO',
        formato: 'FORMATO 3',
        titulo: '3. Calendario del Niño/a (Menor de 2 años)',
        descripcion: 'Semáforo nutricional, fechas de tamiz/vacunas y firma/huella digital.',
        imagen: '/icono-nino.png',
        alt: 'Ilustración de un bebé para el calendario del niño o niña menor de dos años',
        vozApertura: 'Abriendo Formato 3: Calendario del Niño menor de 2 años.',
        FallbackIcon: Baby,
        badge: 'bg-teal-100 text-teal-900 border-teal-200',
        marco: 'from-teal-100 to-emerald-50 border-teal-200 group-hover:border-teal-500/50',
        borde: 'border-white/70 hover:border-teal-500/60 focus-visible:ring-teal-600',
        sombra: 'shadow-teal-900/10 hover:shadow-teal-900/25',
        tituloHover: 'group-hover:text-teal-700',
        acento: 'text-teal-700',
        halo: 'bg-teal-300/40'
    }
];

const TEXTO_BIENVENIDA =
    'Bienvenida. Seleccione entre las 3 opciones oficiales: Ficha de Referencia y Contrareferencia, Calendario de Atención a la Mujer o Calendario del Niño menor de 2 años.';

/* ------------------------------------------------------------------ */
/* Estilos y animaciones (sin dependencias externas)                  */
/* ------------------------------------------------------------------ */

const ESTILOS_ANIMACION = `
@keyframes pt-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes pt-slide-up { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pt-pop-in { from { opacity: 0; transform: scale(.92) } to { opacity: 1; transform: scale(1) } }
@keyframes pt-wave { 0%, 100% { transform: scaleY(.25) } 50% { transform: scaleY(1) } }
@keyframes pt-ring { 0% { transform: scale(1); opacity: .55 } 100% { transform: scale(1.35); opacity: 0 } }
@keyframes pt-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
.pt-fade-in { animation: pt-fade-in .45s ease-out both }
.pt-slide-up { animation: pt-slide-up .55s cubic-bezier(.22,1,.36,1) both }
.pt-pop-in { animation: pt-pop-in .4s cubic-bezier(.22,1,.36,1) both }
.pt-wave-bar { animation: pt-wave 1s ease-in-out infinite; transform-origin: center }
.pt-ring { animation: pt-ring 1.4s ease-out infinite }
.pt-float { animation: pt-float 5s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .pt-fade-in, .pt-slide-up, .pt-pop-in, .pt-wave-bar, .pt-ring, .pt-float { animation: none !important }
}
`;

/* ------------------------------------------------------------------ */
/* Subcomponentes de presentación                                     */
/* ------------------------------------------------------------------ */

const OndasVoz: React.FC<OndasVozProps> = ({ className = '' }) => (
    <span className={`inline-flex items-end gap-[3px] h-4 ${className}`} aria-hidden="true">
        {[0, 0.15, 0.3, 0.1, 0.25].map((delay, i) => (
            <span
                key={i}
                className="pt-wave-bar w-[3px] h-full rounded-full bg-current"
                style={{ animationDelay: `${delay}s` }}
            />
        ))}
    </span>
);

const CardImage: React.FC<CardImageProps> = ({ src, alt, FallbackIcon, className = '' }) => {
    const [falla, setFalla] = useState(false);

    if (falla) {
        return <FallbackIcon className="w-14 h-14 opacity-80" aria-label={alt} role="img" />;
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            draggable={false}
            onError={() => setFalla(true)}
            className={className}
        />
    );
};

/* ------------------------------------------------------------------ */
/* Selección de voz es-MX                                             */
/* ------------------------------------------------------------------ */

const normalizarLang = (lang: string): string => lang.replace('_', '-').toLowerCase();

const puntuarVoz = (voz: SpeechSynthesisVoice): number => {
    const lang = normalizarLang(voz.lang);
    let puntos = 0;

    if (lang === 'es-mx') puntos = 100;
    else if (lang === 'es-us' || lang === 'es-419') puntos = 70;
    else if (lang.startsWith('es-') && lang !== 'es-es') puntos = 50; // Resto de Latinoamérica
    else if (lang === 'es') puntos = 20;
    else return -1; // Descarta es-ES y cualquier otro idioma

    if (/natural|neural|online/i.test(voz.name)) puntos += 15;
    if (/google/i.test(voz.name)) puntos += 5;
    if (/paulina|sabina|dalia|mariana|jorge|raul|raúl|juan/i.test(voz.name)) puntos += 10;

    return puntos;
};

const elegirMejorVoz = (voces: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    let mejor: SpeechSynthesisVoice | null = null;
    let mejorPuntaje = 0;

    for (const voz of voces) {
        const puntaje = puntuarVoz(voz);
        if (puntaje > mejorPuntaje) {
            mejor = voz;
            mejorPuntaje = puntaje;
        }
    }
    return mejor;
};

/* ------------------------------------------------------------------ */
/* Componente principal                                               */
/* ------------------------------------------------------------------ */

export const DashboardPartera: React.FC = () => {
    // Estado de Autenticación PIN / QR
    const [pinIngresado, setPinIngresado] = useState<string>('');
    const [autenticado, setAutenticado] = useState<boolean>(true); // true para demo directa
    const [errorPin, setErrorPin] = useState<boolean>(false);

    // Vista activa: 'HOME' | 'REFERENCIA' | 'MUJER' | 'NINO'
    const [vistaActiva, setVistaActiva] = useState<Vista>('HOME');

    // Síntesis de voz (Web Speech API)
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const vozRef = useRef<SpeechSynthesisVoice | null>(null);

    // Dictado por voz (SpeechRecognition)
    const [isListening, setIsListening] = useState<boolean>(false);
    const [campoEscuchando, setCampoEscuchando] = useState<string | null>(null);

    // Modal de éxito
    const [registroExitoso, setRegistroExitoso] = useState<boolean>(false);

    // Dictado por voz mediante Web Speech API universal
    const iniciarDictado = (campo: string, setFieldState?: (val: string) => void): void => {
        if (!setFieldState) return;
        handleVoiceInput(
            (transcript: string) => setFieldState(transcript),
            (listening: boolean) => {
                setIsListening(listening);
                setCampoEscuchando(listening ? campo : null);
            }
        );
    };

    /* ----- Carga y captura de la voz es-MX ----- */
    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;

        const actualizarVoz = (): void => {
            const voces = synth.getVoices();
            if (voces.length > 0) {
                vozRef.current = elegirMejorVoz(voces);
            }
        };

        actualizarVoz(); // Intento inmediato
        synth.onvoiceschanged = actualizarVoz; // Captura cuando el navegador las cargue

        return () => {
            synth.onvoiceschanged = null;
            synth.cancel();
        };
    }, []);

    // Altavoz de instrucciones por voz (cálido, pausado y en español de México)
    const hablarTexto = useCallback((texto: string): void => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;

        synth.cancel();

        // Si aún no se había resuelto la voz, reintenta justo antes de hablar
        if (!vozRef.current) {
            vozRef.current = elegirMejorVoz(synth.getVoices());
        }

        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = vozRef.current?.lang || 'es-MX';
        if (vozRef.current) utterance.voice = vozRef.current;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        synth.speak(utterance);
    }, []);

    const detenerVoz = useCallback((): void => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    const handleValidarPin = (pin: string): void => {
        if (pin === '1234' || pin.length === 4) {
            setAutenticado(true);
            setErrorPin(false);
            hablarTexto('Acceso verificado. Bienvenida.');
        } else {
            setErrorPin(true);
        }
    };

    const handleFormSuccess = (): void => {
        setRegistroExitoso(true);
        setTimeout(() => {
            setRegistroExitoso(false);
            setVistaActiva('HOME');
        }, 2500);
    };

    const abrirFormato = (tarjeta: TarjetaMenu): void => {
        hablarTexto(tarjeta.vozApertura);
        setVistaActiva(tarjeta.vista);
    };

    const volverAlMenu = (): void => setVistaActiva('HOME');

    /* ----- Fondo común (imagen + overlay luminoso) ----- */
    const fondo: React.ReactNode = (
        <>
            <img
                src="/partera.png"
                alt=""
                aria-hidden="true"
                className="fixed inset-0 w-full h-full object-cover z-0"
            />
            <div
                className="fixed inset-0 z-0 bg-gradient-to-br from-white/80 via-rose-50/55 to-amber-50/45 backdrop-blur-md"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none fixed -top-24 -left-24 z-0 w-96 h-96 rounded-full bg-rose-200/40 blur-3xl pt-float"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none fixed -bottom-32 -right-24 z-0 w-[28rem] h-[28rem] rounded-full bg-amber-200/40 blur-3xl pt-float"
                style={{ animationDelay: '1.5s' }}
                aria-hidden="true"
            />
        </>
    );

    /* ================================================================ */
    /* PANTALLA DE BLOQUEO POR PIN / QR                                 */
    /* ================================================================ */
    if (!autenticado) {
        return (
            <div className="relative min-h-screen flex items-center justify-center p-4 text-slate-900">
                <style>{ESTILOS_ANIMACION}</style>
                {fondo}

                <main className="relative z-10 w-full max-w-md pt-pop-in">
                    <div className="bg-white/85 backdrop-blur-lg border border-white/60 shadow-2xl shadow-rose-900/10 rounded-3xl p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#9D2449] to-[#7A1B38] rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-rose-900/30">
                            <KeyRound className="w-8 h-8" aria-hidden="true" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Espacio Exclusivo Parteras</h1>
                            <p className="text-sm text-slate-600 mt-1">
                                Ingrese su PIN de 4 dígitos o escanee su tarjeta QR SSO
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label htmlFor="pin-partera" className="sr-only">
                                PIN de 4 dígitos
                            </label>
                            <input
                                id="pin-partera"
                                type="password"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={4}
                                placeholder="••••"
                                value={pinIngresado}
                                aria-invalid={errorPin}
                                aria-describedby={errorPin ? 'pin-error' : undefined}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setPinIngresado(e.target.value);
                                    if (e.target.value.length === 4) handleValidarPin(e.target.value);
                                }}
                                className="w-full bg-white/90 border-2 border-rose-200 rounded-2xl py-4 text-center text-3xl font-black tracking-[0.5em] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#9D2449] focus:ring-4 focus:ring-[#9D2449]/20 transition"
                            />
                            {errorPin && (
                                <p id="pin-error" role="alert" className="text-sm font-bold text-rose-700">
                                    PIN incorrecto. Pruebe 1234
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => handleValidarPin('1234')}
                            className="w-full py-4 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:from-[#8A1F40] hover:to-[#651530] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-900/25 transition-all active:scale-[0.98] hover:-translate-y-0.5 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#9D2449]/40"
                        >
                            <QrCode className="w-5 h-5" aria-hidden="true" />
                            <span>Escanear Tarjeta QR / Ingresar Demo (1234)</span>
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    /* ================================================================ */
    /* DASHBOARD PRINCIPAL                                              */
    /* ================================================================ */
    return (
        <div className="relative min-h-screen text-slate-900 pb-12 selection:bg-[#9D2449] selection:text-white">
            <style>{ESTILOS_ANIMACION}</style>
            {fondo}

            {/* ENCABEZADO INSTITUCIONAL SSO (GLASS) */}
            <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 sm:pt-4">
                <div className="max-w-6xl mx-auto bg-white/85 backdrop-blur-lg border border-white/60 shadow-2xl shadow-rose-900/10 rounded-3xl overflow-hidden pt-fade-in">
                    <div className="h-1.5 bg-gradient-to-r from-[#9D2449] via-[#C2476A] to-amber-400" aria-hidden="true" />

                    <div className="p-3 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            {vistaActiva !== 'HOME' && (
                                <button
                                    type="button"
                                    onClick={volverAlMenu}
                                    title="Regresar al Menú Principal"
                                    aria-label="Regresar al Menú Principal"
                                    className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-[#9D2449] border border-rose-200 text-xs sm:text-sm font-bold transition-all active:scale-95 hover:-translate-x-0.5 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#9D2449]/30 pt-fade-in"
                                >
                                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                                    <span className="hidden sm:inline">Regresar al Menú</span>
                                </button>
                            )}

                            <div className="relative shrink-0">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#9D2449] to-[#7A1B38] rounded-2xl flex items-center justify-center shadow-lg shadow-rose-900/30">
                                    <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-rose-100" aria-hidden="true" />
                                </div>
                            </div>

                            <div className="min-w-0">
                                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#9D2449] bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                                    Espacio exclusivo • Partera tradicional
                                </span>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                                    Partera Tradicional
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                                    <p className="text-xs text-slate-600 font-medium">
                                        Acreditada por Servicios de Salud de Oaxaca
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shadow-[0_0_14px_rgba(52,211,153,0.55)]">
                                        <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
                                        PIN Verificado
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* BOTÓN DE VOZ CON ONDAS */}
                        <div className="relative w-full md:w-auto">
                            {isSpeaking && (
                                <span
                                    className="pt-ring absolute inset-0 rounded-2xl bg-amber-300/70 pointer-events-none"
                                    aria-hidden="true"
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => (isSpeaking ? detenerVoz() : hablarTexto(TEXTO_BIENVENIDA))}
                                aria-pressed={isSpeaking}
                                aria-label={isSpeaking ? 'Detener la voz' : 'Escuchar instrucciones por voz'}
                                className={`relative w-full md:w-auto px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg border transition-all duration-300 active:scale-95 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus-visible:ring-4 ${isSpeaking
                                    ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-slate-900 border-amber-300 shadow-amber-400/40 focus-visible:ring-amber-300/60'
                                    : 'bg-gradient-to-r from-[#9D2449] to-[#7A1B38] text-white border-[#9D2449] shadow-rose-900/25 hover:shadow-rose-900/40 focus-visible:ring-[#9D2449]/40'
                                    }`}
                            >
                                {isSpeaking ? (
                                    <>
                                        <VolumeX className="w-5 h-5" aria-hidden="true" />
                                        <span>Detener Voz</span>
                                        <OndasVoz />
                                    </>
                                ) : (
                                    <>
                                        <Volume2 className="w-5 h-5" aria-hidden="true" />
                                        <span>Escuchar Instrucciones por Voz</span>
                                    </>
                                )}
                            </button>

                            {isSpeaking && (
                                <span
                                    className="pt-pop-in absolute -top-3 -right-2 flex items-center gap-1.5 bg-white text-[#9D2449] border border-amber-300 shadow-lg rounded-full px-2.5 py-1 text-[10px] font-black"
                                    aria-hidden="true"
                                >
                                    <OndasVoz className="h-3" />
                                    Hablando
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Anuncio accesible del estado de voz */}
            <p className="sr-only" role="status" aria-live="polite">
                {isSpeaking ? 'La voz está activa' : ''}
            </p>

            {/* CONTENIDO PRINCIPAL */}
            <main className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 pt-6 space-y-6">

                {/* Éxito de registro */}
                {registroExitoso && (
                    <div
                        role="status"
                        aria-live="assertive"
                        className="pt-pop-in bg-white/90 backdrop-blur-lg border-2 border-emerald-300 p-8 rounded-3xl text-center space-y-3 shadow-2xl shadow-emerald-900/10"
                    >
                        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" aria-hidden="true" />
                        <h2 className="text-2xl font-black text-emerald-950">¡Formato Oficial Enviado con Éxito!</h2>
                        <p className="text-sm font-bold text-emerald-800">
                            La información ha sido transmitida y respaldada en el sistema de los Servicios de Salud de Oaxaca.
                        </p>
                    </div>
                )}

                {/* Contenedor con transición al cambiar de vista */}
                <div key={vistaActiva} className="pt-slide-up">

                    {vistaActiva === 'HOME' && (
                        <section className="space-y-6" aria-label="Menú principal de formatos">
                            <div className="bg-amber-50/90 backdrop-blur-lg border border-amber-300/80 p-4 rounded-3xl flex items-center gap-3 shadow-lg shadow-amber-900/5">
                                <div className="w-10 h-10 shrink-0 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                                    <Info className="w-5 h-5 text-amber-700" aria-hidden="true" />
                                </div>
                                <p className="text-xs md:text-sm font-bold text-amber-900">
                                    Toque una de las 3 tarjetas ilustradas de abajo para abrir la digitalización completa del formato físico correspondiente.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7">
                                {TARJETAS.map((tarjeta, indice) => (
                                    <button
                                        key={tarjeta.vista}
                                        type="button"
                                        onClick={() => abrirFormato(tarjeta)}
                                        style={{ animationDelay: `${indice * 110}ms` }}
                                        aria-label={`${tarjeta.titulo}. ${tarjeta.descripcion}`}
                                        className={`pt-slide-up group relative overflow-hidden flex flex-col items-center justify-between text-center gap-6 min-h-[340px] p-6 md:p-8 rounded-3xl bg-white/85 backdrop-blur-lg border-2 shadow-2xl transition-all duration-300 ease-out hover:-translate-y-2 active:translate-y-0 active:scale-[0.99] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${tarjeta.borde} ${tarjeta.sombra}`}
                                    >
                                        {/* Brillo superior al pasar el cursor */}
                                        <span
                                            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            aria-hidden="true"
                                        />
                                        <span
                                            className={`pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${tarjeta.halo}`}
                                            aria-hidden="true"
                                        />

                                        {/* Contenedor de ilustración */}
                                        <div
                                            className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br border-2 shadow-lg flex items-center justify-center p-4 transition-all duration-300 ${tarjeta.marco} ${tarjeta.acento}`}
                                        >
                                            <CardImage
                                                src={tarjeta.imagen}
                                                alt={tarjeta.alt}
                                                FallbackIcon={tarjeta.FallbackIcon}
                                                className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-2"
                                            />
                                        </div>

                                        <div className="relative space-y-3">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${tarjeta.badge}`}
                                            >
                                                {tarjeta.formato}
                                            </span>
                                            <span
                                                className={`block text-xl font-black text-slate-900 leading-snug transition-colors ${tarjeta.tituloHover}`}
                                            >
                                                {tarjeta.titulo}
                                            </span>
                                            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                                                {tarjeta.descripcion}
                                            </p>
                                        </div>

                                        <span
                                            className={`relative inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide ${tarjeta.acento} opacity-80 group-hover:opacity-100 transition-all`}
                                            aria-hidden="true"
                                        >
                                            Abrir formato
                                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {vistaActiva === 'REFERENCIA' && !registroExitoso && (
                        <div className="bg-white/85 backdrop-blur-lg border border-white/60 shadow-2xl shadow-rose-900/10 rounded-3xl p-3 sm:p-6">
                            <FormatoReferencia
                                onBack={volverAlMenu}
                                onSuccess={handleFormSuccess}
                                hablarTexto={hablarTexto}
                                isListening={isListening}
                                campoEscuchando={campoEscuchando}
                                iniciarDictado={iniciarDictado}
                            />
                        </div>
                    )}

                    {vistaActiva === 'MUJER' && !registroExitoso && (
                        <div className="bg-white/85 backdrop-blur-lg border border-white/60 shadow-2xl shadow-purple-900/10 rounded-3xl p-3 sm:p-6">
                            <CalendarioMujer
                                onBack={volverAlMenu}
                                onSuccess={handleFormSuccess}
                                hablarTexto={hablarTexto}
                                isListening={isListening}
                                campoEscuchando={campoEscuchando}
                                iniciarDictado={iniciarDictado}
                            />
                        </div>
                    )}

                    {vistaActiva === 'NINO' && !registroExitoso && (
                        <div className="bg-white/85 backdrop-blur-lg border border-white/60 shadow-2xl shadow-teal-900/10 rounded-3xl p-3 sm:p-6">
                            <FormatoCalendarioNino
                                onBack={volverAlMenu}
                                onSuccess={handleFormSuccess}
                                hablarTexto={hablarTexto}
                                isListening={isListening}
                                campoEscuchando={campoEscuchando}
                                iniciarDictado={iniciarDictado}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DashboardPartera;