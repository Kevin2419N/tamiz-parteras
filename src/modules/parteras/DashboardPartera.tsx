import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Volume2,
    VolumeX,
    BadgeCheck,
    CheckCircle2,
    Ambulance,
    HeartPulse,
    Baby,
    QrCode,
    KeyRound,
    ChevronLeft,
    LogOut,
    UserRound,
    Hand,
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
    numero: string;
    titulo: string;
    subtitulo: string;
    imagen: string;
    alt: string;
    vozApertura: string;
    FallbackIcon: LucideIcon;
    lienzo: string;
    borde: string;
    sombra: string;
    numeroBg: string;
    tituloColor: string;
    banda: string;
    halo: string;
    foco: string;
}

interface CardImageProps {
    src: string;
    alt: string;
    FallbackIcon: LucideIcon;
    className?: string;
}

interface DashboardParteraProps {
    nombrePartera?: string;
    comunidad?: string;
    avatarSrc?: string;
}

interface AvatarParteraProps {
    src: string;
    nombre: string;
}

interface OndasVozProps {
    className?: string;
}

/* ------------------------------------------------------------------ */
/* Paleta cálida: terracota · ocre · verde natural                    */
/* ------------------------------------------------------------------ */

const TARJETAS: TarjetaMenu[] = [
    {
        vista: 'REFERENCIA',
        numero: '1',
        titulo: 'Enviar al hospital',
        subtitulo: 'Ficha de Referencia y Contrareferencia',
        imagen: '/icono-referencia.png',
        alt: 'Ilustración de ambulancia para enviar a una paciente al hospital',
        vozApertura: 'Abriendo Ficha de Referencia para enviar al hospital.',
        FallbackIcon: Ambulance,
        lienzo: 'from-orange-100 via-orange-50 to-amber-50',
        borde: 'border-white/70 hover:border-[#C2603A]',
        sombra: 'shadow-[#8F3F1E]/15 hover:shadow-[#8F3F1E]/35',
        numeroBg: 'bg-gradient-to-br from-[#C2603A] to-[#8F3F1E] shadow-[#8F3F1E]/40',
        tituloColor: 'text-[#8F3F1E]',
        banda: 'from-[#C2603A] to-[#E08A5B]',
        halo: 'bg-orange-300/50',
        foco: 'focus-visible:ring-[#C2603A]'
    },
    {
        vista: 'MUJER',
        numero: '2',
        titulo: 'Mamá embarazada',
        subtitulo: 'Calendario de Atención a la Mujer',
        imagen: '/icono-prenatal.png',
        alt: 'Ilustración de una mujer embarazada para el calendario de atención a la mujer',
        vozApertura: 'Abriendo Calendario de Atención a la Mujer embarazada.',
        FallbackIcon: HeartPulse,
        lienzo: 'from-amber-100 via-yellow-50 to-amber-50',
        borde: 'border-white/70 hover:border-[#D69A1E]',
        sombra: 'shadow-[#9A6A0B]/15 hover:shadow-[#9A6A0B]/35',
        numeroBg: 'bg-gradient-to-br from-[#D69A1E] to-[#A8700C] shadow-[#9A6A0B]/40',
        tituloColor: 'text-[#8A5C08]',
        banda: 'from-[#D69A1E] to-[#EDBF55]',
        halo: 'bg-amber-300/50',
        foco: 'focus-visible:ring-[#D69A1E]'
    },
    {
        vista: 'NINO',
        numero: '3',
        titulo: 'Bebé y niño/a',
        subtitulo: 'Calendario del Niño/a, menor de 2 años',
        imagen: '/icono-nino.png',
        alt: 'Ilustración de un bebé para el calendario del niño o niña menor de dos años',
        vozApertura: 'Abriendo Calendario del Niño o la Niña, menor de dos años.',
        FallbackIcon: Baby,
        lienzo: 'from-teal-100 via-emerald-50 to-lime-50',
        borde: 'border-white/70 hover:border-[#3E8E7E]',
        sombra: 'shadow-[#24675A]/15 hover:shadow-[#24675A]/35',
        numeroBg: 'bg-gradient-to-br from-[#3E8E7E] to-[#24675A] shadow-[#24675A]/40',
        tituloColor: 'text-[#24675A]',
        banda: 'from-[#3E8E7E] to-[#6BB8A6]',
        halo: 'bg-teal-300/50',
        foco: 'focus-visible:ring-[#3E8E7E]'
    }
];

const TEXTO_BIENVENIDA =
    'Bienvenida. Toque una de las tres tarjetas. La uno, para enviar a una paciente al hospital. La dos, para la mamá embarazada. La tres, para el bebé o niño menor de dos años.';

/* ------------------------------------------------------------------ */
/* Animaciones                                                        */
/* ------------------------------------------------------------------ */

const ESTILOS_ANIMACION = `
@keyframes pt-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes pt-slide-up { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pt-pop-in { from { opacity: 0; transform: scale(.92) } to { opacity: 1; transform: scale(1) } }
@keyframes pt-wave { 0%, 100% { transform: scaleY(.25) } 50% { transform: scaleY(1) } }
@keyframes pt-ring { 0% { transform: scale(1); opacity: .55 } 100% { transform: scale(1.18); opacity: 0 } }
@keyframes pt-breathe { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
.pt-fade-in { animation: pt-fade-in .45s ease-out both }
.pt-slide-up { animation: pt-slide-up .55s cubic-bezier(.22,1,.36,1) both }
.pt-pop-in { animation: pt-pop-in .4s cubic-bezier(.22,1,.36,1) both }
.pt-wave-bar { animation: pt-wave 1s ease-in-out infinite; transform-origin: center }
.pt-ring { animation: pt-ring 1.4s ease-out infinite }
.pt-breathe { animation: pt-breathe 4.5s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .pt-fade-in, .pt-slide-up, .pt-pop-in, .pt-wave-bar, .pt-ring, .pt-breathe { animation: none !important }
}
`;

/* ------------------------------------------------------------------ */
/* Subcomponentes de presentación                                     */
/* ------------------------------------------------------------------ */

const OndasVoz: React.FC<OndasVozProps> = ({ className = '' }) => (
    <span className={`inline-flex items-end gap-[3px] h-5 ${className}`} aria-hidden="true">
        {[0, 0.15, 0.3, 0.1, 0.25].map((delay, i) => (
            <span
                key={i}
                className="pt-wave-bar w-[4px] h-full rounded-full bg-current"
                style={{ animationDelay: `${delay}s` }}
            />
        ))}
    </span>
);

const AvatarPartera: React.FC<AvatarParteraProps> = ({ src, nombre }) => {
    const [falla, setFalla] = useState<boolean>(false);

    return (
        <div className="relative shrink-0">
            <span
                className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#C2603A]/60 via-[#EDBF55] to-[#C2603A]/60 opacity-80 blur-[3px]"
                aria-hidden="true"
            />
            <div className="relative p-[3px] rounded-full bg-gradient-to-br from-[#C2603A] to-[#8F3F1E] shadow-lg shadow-[#8F3F1E]/35">
                <div className="p-[3px] rounded-full bg-white">
                    <div className="w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full overflow-hidden bg-orange-50 ring-2 ring-[#EDBF55]/80 flex items-center justify-center">
                        {falla ? (
                            <UserRound className="w-8 h-8 text-[#8F3F1E]" aria-hidden="true" />
                        ) : (
                            <img
                                src={src}
                                alt={`Fotografía de ${nombre}`}
                                draggable={false}
                                onError={() => setFalla(true)}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CardImage: React.FC<CardImageProps> = ({ src, alt, FallbackIcon, className = '' }) => {
    const [falla, setFalla] = useState<boolean>(false);

    if (falla) {
        return <FallbackIcon className="w-1/2 h-1/2 opacity-70" aria-label={alt} role="img" />;
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
    else if (lang.startsWith('es-') && lang !== 'es-es') puntos = 50;
    else if (lang === 'es') puntos = 20;
    else return -1;

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

export const DashboardPartera: React.FC<DashboardParteraProps> = ({
    nombrePartera = 'Doña María Eustolia Jiménez',
    comunidad = 'Santa Catarina Juquila, Oaxaca',
    avatarSrc = '/avatar-partera-default.png'
}) => {
    const [pinIngresado, setPinIngresado] = useState<string>('');
    const [autenticado, setAutenticado] = useState<boolean>(true);
    const [errorPin, setErrorPin] = useState<boolean>(false);

    const [vistaActiva, setVistaActiva] = useState<Vista>('HOME');

    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const vozRef = useRef<SpeechSynthesisVoice | null>(null);

    const [registroExitoso, setRegistroExitoso] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;

        const actualizarVoz = (): void => {
            const voces = synth.getVoices();
            if (voces.length > 0) {
                vozRef.current = elegirMejorVoz(voces);
            }
        };

        actualizarVoz();
        synth.onvoiceschanged = actualizarVoz;

        return () => {
            synth.onvoiceschanged = null;
            synth.cancel();
        };
    }, []);

    const hablarTexto = useCallback((texto: string): void => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;

        synth.cancel();

        if (!vozRef.current) {
            vozRef.current = elegirMejorVoz(synth.getVoices());
        }

        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = vozRef.current?.lang || 'es-MX';
        if (vozRef.current) utterance.voice = vozRef.current;
        utterance.rate = 0.88;
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
            hablarTexto(`Acceso verificado. Bienvenida, ${nombrePartera}.`);
        } else {
            setErrorPin(true);
        }
    };

    const handleSalir = (): void => {
        hablarTexto('Cerrando sesión de forma segura');
        setRegistroExitoso(false);
        setVistaActiva('HOME');
        setPinIngresado('');
        setErrorPin(false);
        setAutenticado(false);
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

    const volverAlMenu = (): void => {
        hablarTexto('Regresando al menú principal.');
        setVistaActiva('HOME');
    };

    const fondo: React.ReactNode = (
        <>
            <img
                src="/partera.png"
                alt=""
                aria-hidden="true"
                className="fixed inset-0 w-full h-full object-cover z-0"
            />
            <div
                className="fixed inset-0 z-0 bg-gradient-to-br from-white/45 via-amber-50/30 to-orange-50/30 backdrop-blur-sm"
                aria-hidden="true"
            />
        </>
    );

    if (!autenticado) {
        return (
            <div className="relative min-h-screen flex items-center justify-center p-4 text-stone-900">
                <style>{ESTILOS_ANIMACION}</style>
                {fondo}

                <main className="relative z-10 w-full max-w-md pt-pop-in">
                    <div className="bg-white/85 backdrop-blur-md border border-white/70 shadow-2xl shadow-[#8F3F1E]/15 rounded-3xl p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#C2603A] to-[#8F3F1E] rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg shadow-[#8F3F1E]/35">
                            <KeyRound className="w-10 h-10" aria-hidden="true" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-stone-900">Espacio Exclusivo Parteras</h1>
                            <p className="text-sm text-stone-600 mt-1">
                                Ingrese su PIN de 4 dígitos o escanee su tarjeta QR
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
                                className="w-full bg-white/90 border-2 border-orange-200 rounded-2xl py-4 text-center text-4xl font-black tracking-[0.5em] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-[#C2603A] focus:ring-4 focus:ring-[#C2603A]/20 transition"
                            />
                            {errorPin && (
                                <p id="pin-error" role="alert" className="text-sm font-bold text-red-700">
                                    PIN incorrecto. Pruebe 1234
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => handleValidarPin('1234')}
                            className="w-full py-4 bg-gradient-to-r from-[#C2603A] to-[#8F3F1E] hover:from-[#AD5230] hover:to-[#7A3418] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#8F3F1E]/30 transition-all active:scale-[0.98] hover:-translate-y-0.5 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C2603A]/40"
                        >
                            <QrCode className="w-5 h-5" aria-hidden="true" />
                            <span>Escanear Tarjeta QR / Ingresar Demo (1234)</span>
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen text-stone-900 pb-12 selection:bg-[#C2603A] selection:text-white">
            <style>{ESTILOS_ANIMACION}</style>
            {fondo}

            {/* ENCABEZADO COMUNITARIO (GLASS) */}
            <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 sm:pt-4">
                <div className="max-w-6xl mx-auto bg-white/85 backdrop-blur-md border border-white/70 shadow-2xl shadow-[#8F3F1E]/15 rounded-3xl overflow-hidden pt-fade-in">
                    <div className="h-1.5 flex" aria-hidden="true">
                        <span className="flex-1 bg-[#C2603A]" />
                        <span className="flex-1 bg-[#D69A1E]" />
                        <span className="flex-1 bg-[#3E8E7E]" />
                    </div>

                    <div className="p-3 sm:p-5 grid grid-cols-[1fr_auto] lg:grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-3 lg:gap-x-6">
                        {/* IZQUIERDA: avatar + identidad (Si estamos en módulo, aparece el botón Menú) */}
                        <div className="col-start-1 row-start-1 flex items-center gap-3 sm:gap-4 min-w-0">
                            {vistaActiva !== 'HOME' && (
                                <button
                                    type="button"
                                    onClick={volverAlMenu}
                                    title="Regresar al Menú Principal"
                                    aria-label="Regresar al Menú Principal"
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-3 rounded-full bg-orange-50 hover:bg-orange-100 text-[#8F3F1E] border border-orange-200 text-sm font-bold transition-all active:scale-95 hover:-translate-x-0.5 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C2603A]/30 pt-fade-in"
                                >
                                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                                    <span>Menú</span>
                                </button>
                            )}

                            <AvatarPartera src={avatarSrc} nombre={nombrePartera} />

                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#8F3F1E]">
                                    Partera Tradicional
                                </p>
                                <h1 className="text-base sm:text-xl font-black text-stone-900 leading-tight">
                                    {nombrePartera}
                                </h1>
                                <p className="text-xs text-stone-600 font-medium truncate">{comunidad}</p>
                                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-black text-teal-900 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-full shadow-[0_0_14px_rgba(45,212,191,0.5)]">
                                    <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
                                    PIN Verificado
                                </span>
                            </div>
                        </div>

                        {/* EXTREMA DERECHA: SALIR (Solo se muestra en el HOME / Menú Principal) */}
                        {vistaActiva === 'HOME' && (
                            <button
                                type="button"
                                onClick={handleSalir}
                                aria-label="Salir. Cerrar sesión"
                                className="col-start-2 row-start-1 lg:col-start-3 self-start lg:self-center flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-300 hover:border-[#C2603A] hover:text-[#8F3F1E] font-black text-sm shadow-md transition-all active:scale-95 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C2603A]/30 pt-fade-in"
                            >
                                <LogOut className="w-5 h-5" aria-hidden="true" />
                                <span>Salir</span>
                            </button>
                        )}

                        {/* CENTRO: BOTÓN DE VOZ GRANDE CON ONDAS */}
                        <div className="relative col-span-2 row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1 w-full lg:max-w-md lg:mx-auto">
                            {isSpeaking && (
                                <span
                                    className="pt-ring absolute inset-0 rounded-3xl bg-amber-300/70 pointer-events-none"
                                    aria-hidden="true"
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => (isSpeaking ? detenerVoz() : hablarTexto(TEXTO_BIENVENIDA))}
                                aria-pressed={isSpeaking}
                                aria-label={isSpeaking ? 'Detener la voz' : 'Escuchar instrucciones por voz'}
                                className={`relative w-full px-5 py-4 rounded-3xl font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg border-2 transition-all duration-300 active:scale-[0.98] hover:-translate-y-0.5 cursor-pointer focus:outline-none focus-visible:ring-4 ${isSpeaking
                                    ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-stone-900 border-amber-300 shadow-amber-400/40 focus-visible:ring-amber-300/60'
                                    : 'bg-gradient-to-r from-[#C2603A] to-[#8F3F1E] text-white border-[#C2603A] shadow-[#8F3F1E]/30 hover:shadow-[#8F3F1E]/45 focus-visible:ring-[#C2603A]/40'
                                    }`}
                            >
                                {isSpeaking ? (
                                    <>
                                        <VolumeX className="w-7 h-7" aria-hidden="true" />
                                        <span>Detener voz</span>
                                        <OndasVoz className="h-6" />
                                    </>
                                ) : (
                                    <>
                                        <Volume2 className="w-7 h-7" aria-hidden="true" />
                                        <span>Escuchar instrucciones</span>
                                    </>
                                )}
                            </button>

                            {isSpeaking && (
                                <span
                                    className="pt-pop-in absolute -top-3 right-4 flex items-center gap-1.5 bg-white text-[#8F3F1E] border border-amber-300 shadow-lg rounded-full px-3 py-1 text-[11px] font-black"
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

            <p className="sr-only" role="status" aria-live="polite">
                {isSpeaking ? 'La voz está activa' : ''}
            </p>

            {/* CONTENIDO PRINCIPAL */}
            <main className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 pt-6 space-y-6">

                {registroExitoso && (
                    <div
                        role="status"
                        aria-live="assertive"
                        className="pt-pop-in bg-white/90 backdrop-blur-md border-2 border-teal-300 p-8 rounded-3xl text-center space-y-3 shadow-2xl shadow-teal-900/10"
                    >
                        <CheckCircle2 className="w-20 h-20 text-teal-600 mx-auto" aria-hidden="true" />
                        <h2 className="text-2xl font-black text-teal-950">¡Formato enviado con éxito!</h2>
                        <p className="text-sm font-bold text-teal-800">
                            La información fue enviada y guardada en el sistema de los Servicios de Salud de Oaxaca.
                        </p>
                    </div>
                )}

                <div key={vistaActiva} className="pt-slide-up">

                    {vistaActiva === 'HOME' && (
                        <section className="space-y-5" aria-label="Menú principal de formatos">
                            <div className="mx-auto w-fit flex items-center gap-3 bg-white/85 backdrop-blur-md border border-white/70 px-5 py-2.5 rounded-full shadow-lg">
                                <Hand className="w-6 h-6 text-[#C2603A] pt-breathe" aria-hidden="true" />
                                <p className="text-sm font-bold text-stone-700">Toque una tarjeta</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pb-4">
                                {TARJETAS.map((tarjeta, indice) => (
                                    <button
                                        key={tarjeta.vista}
                                        type="button"
                                        onClick={() => abrirFormato(tarjeta)}
                                        style={{ animationDelay: `${indice * 110}ms` }}
                                        aria-label={`${tarjeta.titulo}. ${tarjeta.subtitulo}`}
                                        className={`pt-slide-up group relative overflow-hidden flex flex-col text-center gap-4 p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-md border-2 ring-1 ring-inset ring-white/60 shadow-2xl transition-all duration-300 ease-out hover:-translate-y-2 active:translate-y-0 active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${tarjeta.borde} ${tarjeta.sombra} ${tarjeta.foco}`}
                                    >
                                        <div
                                            className={`relative w-full aspect-[4/3] md:aspect-square rounded-2xl bg-gradient-to-br ${tarjeta.lienzo} border border-white shadow-inner flex items-center justify-center overflow-hidden`}
                                        >
                                            <span
                                                className={`pointer-events-none absolute w-3/4 h-3/4 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 ${tarjeta.halo}`}
                                                aria-hidden="true"
                                            />

                                            <span
                                                className={`absolute top-3 left-3 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl text-white text-2xl sm:text-3xl font-black flex items-center justify-center shadow-lg ${tarjeta.numeroBg}`}
                                                aria-hidden="true"
                                            >
                                                {tarjeta.numero}
                                            </span>

                                            <span
                                                className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 text-stone-700 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                                                aria-hidden="true"
                                            >
                                                <Volume2 className="w-5 h-5" />
                                            </span>

                                            <CardImage
                                                src={tarjeta.imagen}
                                                alt={tarjeta.alt}
                                                FallbackIcon={tarjeta.FallbackIcon}
                                                className="relative w-[82%] h-[82%] object-contain drop-shadow-xl transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-2"
                                            />
                                        </div>

                                        <div className="space-y-1 pb-2">
                                            <span
                                                className={`block text-xl sm:text-2xl font-black leading-tight ${tarjeta.tituloColor}`}
                                            >
                                                {tarjeta.titulo}
                                            </span>
                                            <span className="block text-xs text-stone-600 font-medium">
                                                {tarjeta.subtitulo}
                                            </span>
                                        </div>

                                        <span
                                            className={`absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r ${tarjeta.banda}`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {vistaActiva === 'REFERENCIA' && !registroExitoso && (
                        <div className="bg-white/85 backdrop-blur-md border border-white/70 shadow-2xl shadow-[#8F3F1E]/15 rounded-3xl p-3 sm:p-6">
                            <FormatoReferencia
                                onBack={volverAlMenu}
                                onSuccess={handleFormSuccess}
                                hablarTexto={hablarTexto}
                            />
                        </div>
                    )}

                    {vistaActiva === 'MUJER' && !registroExitoso && (
                        <div className="bg-white/85 backdrop-blur-md border border-white/70 shadow-2xl shadow-[#9A6A0B]/15 rounded-3xl p-3 sm:p-6">
                            <CalendarioMujer
                                onBack={volverAlMenu}
                                onSuccess={handleFormSuccess}
                                hablarTexto={hablarTexto}
                            />
                        </div>
                    )}

                    {vistaActiva === 'NINO' && !registroExitoso && (
                        <div className="bg-white/85 backdrop-blur-md border border-white/70 shadow-2xl shadow-[#24675A]/15 rounded-3xl p-3 sm:p-6">
                            <FormatoCalendarioNino
                                onBack={volverAlMenu}
                                onSuccess={handleFormSuccess}
                                hablarTexto={hablarTexto}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DashboardPartera;