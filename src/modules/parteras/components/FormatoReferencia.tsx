import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* ============================================================================
 * FormatoReferencia — Hoja de referencia comunitaria (Partera Tradicional)
 * Servicios de Salud de Oaxaca
 *
 * - Mobile-first: 1 columna en teléfono, 2 columnas simétricas en tablet/PC.
 * - Dictado por voz (es-MX) en TODOS los campos de texto.
 * - Confirmación auditiva (síntesis de voz es-MX) en cada acción clave.
 * - Compatible con las props originales del componente.
 * ========================================================================== */

/* ------------------------------ Tipos ------------------------------------ */

interface FormatoReferenciaProps {
    onBack: () => void;
    onSuccess: () => void;
    hablarTexto?: (texto: string) => void;
    isListening?: boolean;
    campoEscuchando?: string | null;
    iniciarDictado?: (campo: string, setFieldState?: (val: string) => void) => void;
}

type CampoId =
    | 'centro'
    | 'usuaria'
    | 'edad'
    | 'localidad'
    | 'municipio'
    | 'partera'
    | 'localidadPartera'
    | 'diagnostico'
    | 'tratamiento'
    | 'indicaciones'
    | 'medico'
    | 'unidad';

type Datos = Record<CampoId, string> & { sexo: string; fecha: string };

type EstadoContra = 'alta' | 'regresa' | null;

interface Motivo {
    id: string;
    etiqueta: string;
    voz: string;
    /** Ruta de la ilustración. Si no carga, se muestra el emoji de respaldo. */
    imagen: string;
    emoji: string;
}

/* Tipos mínimos de Web Speech API (no vienen en lib.dom de TS) */
interface SpeechResultLike {
    isFinal: boolean;
    [index: number]: { transcript: string };
}
interface SpeechEventLike {
    resultIndex: number;
    results: ArrayLike<SpeechResultLike>;
}
interface SpeechRecognitionLike {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((e: SpeechEventLike) => void) | null;
    onend: (() => void) | null;
    onerror: ((e: { error: string }) => void) | null;
    start: () => void;
    stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const obtenerReconocimiento = (): SpeechRecognitionCtor | null => {
    if (typeof window === 'undefined') return null;
    const w = window as unknown as {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/* ------------------------------ Datos ------------------------------------ */

/* AJUSTA las rutas `imagen` a las ilustraciones reales de tu proyecto. */
const MOTIVOS: Motivo[] = [
    { id: 'embarazo', etiqueta: 'Complicaciones del embarazo', voz: 'Complicaciones del embarazo', imagen: '/motivos/embarazo.png', emoji: '🤰' },
    { id: 'toxoide', etiqueta: 'Aplicar toxoide tetánico', voz: 'Aplicar toxoide tetánico', imagen: '/motivos/toxoide.png', emoji: '💉' },
    { id: 'aborto', etiqueta: 'Aborto', voz: 'Aborto', imagen: '/motivos/aborto.png', emoji: '🩸' },
    { id: 'parto', etiqueta: 'Parto complicado', voz: 'Parto complicado', imagen: '/motivos/parto.png', emoji: '🚑' },
    { id: 'puerperio', etiqueta: 'Puerperio complicado', voz: 'Puerperio complicado', imagen: '/motivos/puerperio.png', emoji: '🛏️' },
    { id: 'zika', etiqueta: 'Zika', voz: 'Zika', imagen: '/motivos/zika.png', emoji: '🦟' },
    { id: 'nino', etiqueta: 'Niño con complicaciones', voz: 'Niño con complicaciones', imagen: '/motivos/nino.png', emoji: '👶' },
    { id: 'nina', etiqueta: 'Niña con complicaciones', voz: 'Niña con complicaciones', imagen: '/motivos/nina.png', emoji: '👧' },
    { id: 'tamizMetabolico', etiqueta: 'Tamiz metabólico', voz: 'Tamiz metabólico', imagen: '/motivos/tamiz-metabolico.png', emoji: '🦶' },
    { id: 'tamizAuditivo', etiqueta: 'Tamiz auditivo', voz: 'Tamiz auditivo', imagen: '/motivos/tamiz-auditivo.png', emoji: '👂' },
    { id: 'vitaminas', etiqueta: "Aplicar vitamina 'A' y 'K'", voz: 'Aplicar vitamina A y K', imagen: '/motivos/vitaminas.png', emoji: '💧' },
    { id: 'vacunas', etiqueta: 'Vacuna BCG / Anti hepatitis B', voz: 'Vacuna BCG y anti hepatitis B', imagen: '/motivos/vacunas.png', emoji: '💉' },
    { id: 'papanicolaou', etiqueta: 'Toma de papanicolaou', voz: 'Toma de papanicolaou', imagen: '/motivos/papanicolaou.png', emoji: '🌸' },
    { id: 'otros', etiqueta: 'Otros', voz: 'Otros motivos', imagen: '/motivos/otros.png', emoji: '❓' },
];

const hoyISO = (): string => {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
};

const DATOS_INICIALES = (): Datos => ({
    centro: '',
    usuaria: '',
    edad: '',
    sexo: 'Femenino',
    fecha: hoyISO(),
    localidad: '',
    municipio: '',
    partera: '',
    localidadPartera: '',
    diagnostico: '',
    tratamiento: '',
    indicaciones: '',
    medico: '',
    unidad: '',
});

/* --------------------------- Estilos / animación -------------------------- */

const ESTILOS = `
@keyframes pt-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes pt-slide-up { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pt-pop-in { 0% { opacity: 0; transform: scale(.4) } 70% { transform: scale(1.18) } 100% { opacity: 1; transform: scale(1) } }
@keyframes pt-breathe { 0%,100% { transform: scale(1); box-shadow: 0 8px 22px rgba(194,96,58,.35) } 50% { transform: scale(1.035); box-shadow: 0 12px 30px rgba(194,96,58,.55) } }
@keyframes pt-wave { 0%,100% { transform: scaleY(.25) } 50% { transform: scaleY(1) } }
@keyframes pt-ring { 0% { box-shadow: 0 0 0 0 rgba(194,96,58,.55) } 100% { box-shadow: 0 0 0 16px rgba(194,96,58,0) } }
@keyframes pt-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } }
.pt-fade-in { animation: pt-fade-in .5s ease-out both }
.pt-slide-up { animation: pt-slide-up .55s cubic-bezier(.22,1,.36,1) both }
.pt-pop-in { animation: pt-pop-in .38s cubic-bezier(.34,1.56,.64,1) both }
.pt-breathe { animation: pt-breathe 2.6s ease-in-out infinite }
.pt-ring { animation: pt-ring 1.2s ease-out infinite }
.pt-shake { animation: pt-shake .4s ease-in-out }
.pt-wave-bar { display: inline-block; width: 4px; height: 22px; border-radius: 4px; background: #C2603A; transform-origin: center; animation: pt-wave .9s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .pt-fade-in, .pt-slide-up, .pt-pop-in, .pt-breathe, .pt-ring, .pt-shake, .pt-wave-bar { animation: none !important }
}
`;

const VIDRIO = 'bg-white/85 backdrop-blur-md border border-white/70 shadow-2xl shadow-orange-900/10';

/* ------------------------------ Iconos SVG -------------------------------- */

const IconoMic: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <path d="M12 18v4" />
    </svg>
);
const IconoStop: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="6" y="6" width="12" height="12" rx="2.5" />
    </svg>
);
const IconoBocina: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
);
const IconoCheck: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
);
const IconoAtras: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m15 5-7 7 7 7" />
    </svg>
);
const IconoEnviar: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m22 2-11 11" />
        <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
);

/* ------------------------- Campo con dictado por voz ---------------------- */

interface CampoVozProps {
    id: CampoId;
    etiqueta: string;
    valor: string;
    placeholder: string;
    escuchando: boolean;
    onCambio: (valor: string) => void;
    onMic: (id: CampoId) => void;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    multilinea?: boolean;
    error?: boolean;
    className?: string;
    maxLength?: number;
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
    multilinea = false,
    error = false,
    className = '',
    maxLength,
}) => {
    const base =
        'w-full rounded-2xl border-2 bg-white/90 px-4 text-lg font-bold text-stone-900 placeholder:font-semibold placeholder:text-stone-400 outline-none transition-all duration-200 focus:border-[#C2603A] focus:ring-4 focus:ring-[#C2603A]/20';
    const borde = escuchando
        ? 'border-[#C2603A] ring-4 ring-[#C2603A]/25 bg-orange-50/90'
        : error
            ? 'border-red-400 pt-shake'
            : 'border-stone-200';
    const alto = multilinea ? 'min-h-[104px] py-3 pr-20 resize-none' : 'h-16 pr-20';

    return (
        <div className={className}>
            <label htmlFor={`pt-${id}`} className="mb-1.5 block text-sm font-black uppercase tracking-wide text-stone-700">
                {etiqueta}
            </label>
            <div className="relative">
                {multilinea ? (
                    <textarea
                        id={`pt-${id}`}
                        value={valor}
                        maxLength={maxLength}
                        placeholder={escuchando ? 'Escuchando… hable ahora' : placeholder}
                        onChange={(e) => onCambio(e.target.value)}
                        className={`${base} ${borde} ${alto}`}
                    />
                ) : (
                    <input
                        id={`pt-${id}`}
                        type="text"
                        inputMode={inputMode}
                        value={valor}
                        maxLength={maxLength}
                        placeholder={escuchando ? 'Escuchando… hable ahora' : placeholder}
                        onChange={(e) => onCambio(e.target.value)}
                        autoComplete="off"
                        className={`${base} ${borde} ${alto}`}
                    />
                )}

                {escuchando && (
                    <div
                        className={`pointer-events-none absolute left-4 flex items-end gap-1 ${multilinea ? 'bottom-3' : 'top-1/2 -translate-y-1/2'} pt-fade-in`}
                        aria-hidden="true"
                    >
                        {[0, 0.15, 0.3, 0.1, 0.25, 0.05, 0.2].map((d, i) => (
                            <span key={i} className="pt-wave-bar" style={{ animationDelay: `${d}s` }} />
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => onMic(id)}
                    aria-label={escuchando ? `Detener dictado de ${etiqueta}` : `Dictar ${etiqueta} por voz`}
                    aria-pressed={escuchando}
                    className={`absolute right-2 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition-all duration-200 active:scale-90 ${multilinea ? 'top-2' : 'top-1/2 -translate-y-1/2'
                        } ${escuchando
                            ? 'bg-[#C2603A] pt-ring'
                            : 'bg-gradient-to-br from-[#D69A1E] to-[#C2603A] hover:-translate-y-0.5 hover:shadow-xl'
                        }`}
                >
                    {escuchando ? <IconoStop className="h-6 w-6" /> : <IconoMic className="h-6 w-6" />}
                </button>
            </div>
        </div>
    );
};

/* ------------------------ Ilustración con respaldo ------------------------ */

const Ilustracion: React.FC<{ motivo: Motivo }> = ({ motivo }) => {
    const [fallo, setFallo] = useState(false);
    if (fallo) {
        return (
            <span className="text-6xl sm:text-7xl" role="img" aria-label={motivo.etiqueta}>
                {motivo.emoji}
            </span>
        );
    }
    return (
        <img
            src={motivo.imagen}
            alt={motivo.etiqueta}
            loading="lazy"
            draggable={false}
            onError={() => setFallo(true)}
            className="max-h-full max-w-full object-contain drop-shadow-md"
        />
    );
};

/* ------------------------------ Componente -------------------------------- */

export const FormatoReferencia: React.FC<FormatoReferenciaProps> = ({
    onBack,
    onSuccess,
    hablarTexto,
    isListening = false,
    campoEscuchando = null,
    iniciarDictado,
}) => {
    const [datos, setDatos] = useState<Datos>(DATOS_INICIALES);
    const [seleccionados, setSeleccionados] = useState<string[]>([]);
    const [contraAbierta, setContraAbierta] = useState(false);
    const [estadoContra, setEstadoContra] = useState<EstadoContra>(null);
    const [campoInterno, setCampoInterno] = useState<CampoId | null>(null);
    const [errores, setErrores] = useState<Partial<Record<CampoId | 'motivos', boolean>>>({});
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const datosRef = useRef<Datos>(datos);
    const recRef = useRef<SpeechRecognitionLike | null>(null);
    const temporizadorRef = useRef<number | null>(null);

    useEffect(() => {
        datosRef.current = datos;
    }, [datos]);

    /* ----- Voz de salida (usa la prop si existe; si no, speechSynthesis) ---- */
    const hablar = useCallback(
        (texto: string) => {
            if (hablarTexto) {
                hablarTexto(texto);
                return;
            }
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(texto);
            u.lang = 'es-MX';
            u.rate = 0.92;
            window.speechSynthesis.speak(u);
        },
        [hablarTexto]
    );

    /* ----- Actualización de campos ---------------------------------------- */
    const setCampo = useCallback((id: CampoId, valor: string) => {
        const limpio = id === 'edad' ? valor.replace(/\D/g, '').slice(0, 3) : valor;
        setDatos((prev) => ({ ...prev, [id]: limpio }));
        setErrores((prev) => (prev[id] ? { ...prev, [id]: false } : prev));
    }, []);

    /* ----- Dictado -------------------------------------------------------- */
    const detenerInterno = useCallback(() => {
        recRef.current?.stop();
        recRef.current = null;
        setCampoInterno(null);
    }, []);

    useEffect(() => {
        return () => {
            recRef.current?.stop();
            if (temporizadorRef.current !== null) window.clearTimeout(temporizadorRef.current);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
        };
    }, []);

    const campoActivo: string | null = campoInterno ?? (isListening ? campoEscuchando : null);

    const alternarDictado = useCallback(
        (id: CampoId) => {
            /* Si el padre controla el dictado, delegamos en él. */
            if (iniciarDictado) {
                iniciarDictado(id, (val: string) => setCampo(id, val));
                return;
            }

            if (campoInterno === id) {
                detenerInterno();
                return;
            }
            detenerInterno();

            const Ctor = obtenerReconocimiento();
            if (!Ctor) {
                hablar('Su dispositivo no permite dictar por voz. Escriba con el teclado.');
                return;
            }

            const rec = new Ctor();
            rec.lang = 'es-MX';
            rec.continuous = false;
            rec.interimResults = true;

            const textoBase = datosRef.current[id].trim();

            rec.onresult = (e: SpeechEventLike) => {
                let transcripcion = '';
                for (let i = e.resultIndex; i < e.results.length; i += 1) {
                    transcripcion += e.results[i][0].transcript;
                }
                const unido = textoBase ? `${textoBase} ${transcripcion.trim()}` : transcripcion.trim();
                setCampo(id, unido);
            };
            rec.onerror = () => {
                setCampoInterno(null);
                recRef.current = null;
            };
            rec.onend = () => {
                setCampoInterno((actual) => (actual === id ? null : actual));
                recRef.current = null;
            };

            recRef.current = rec;
            setCampoInterno(id);
            try {
                rec.start();
            } catch {
                setCampoInterno(null);
                recRef.current = null;
            }
        },
        [campoInterno, detenerInterno, hablar, iniciarDictado, setCampo]
    );

    /* ----- Motivos -------------------------------------------------------- */
    const alternarMotivo = (m: Motivo) => {
        const yaEsta = seleccionados.includes(m.id);
        setSeleccionados((prev) => (yaEsta ? prev.filter((x) => x !== m.id) : [...prev, m.id]));
        setErrores((prev) => ({ ...prev, motivos: false }));
        hablar(yaEsta ? `Quitaste: ${m.voz}` : `Seleccionaste: ${m.voz}`);
    };

    const motivosElegidos = useMemo(
        () => MOTIVOS.filter((m) => seleccionados.includes(m.id)),
        [seleccionados]
    );

    /* ----- Envío ---------------------------------------------------------- */
    const enviar = () => {
        const nuevos: Partial<Record<CampoId | 'motivos', boolean>> = {};
        if (!datos.usuaria.trim()) nuevos.usuaria = true;
        if (!datos.centro.trim()) nuevos.centro = true;
        if (seleccionados.length === 0) nuevos.motivos = true;
        setErrores(nuevos);

        if (nuevos.usuaria) {
            hablar('Falta el nombre de la usuaria.');
            return;
        }
        if (nuevos.centro) {
            hablar('Falta el centro de salud u hospital.');
            return;
        }
        if (nuevos.motivos) {
            hablar('Toque al menos un motivo de la referencia.');
            return;
        }

        detenerInterno();
        setEnviando(true);
        hablar('Enviando la hoja de referencia al centro de salud.');

        temporizadorRef.current = window.setTimeout(() => {
            setEnviando(false);
            setEnviado(true);
            hablar('Hoja de referencia enviada correctamente.');
            temporizadorRef.current = window.setTimeout(() => onSuccess(), 2200);
        }, 1100);
    };

    const escuchandoCampo = (id: CampoId): boolean => campoActivo === id;

    const campo = (
        id: CampoId,
        etiqueta: string,
        placeholder: string,
        extra?: Partial<CampoVozProps>
    ): React.ReactElement => (
        <CampoVoz
            id={id}
            etiqueta={etiqueta}
            valor={datos[id]}
            placeholder={placeholder}
            escuchando={escuchandoCampo(id)}
            onCambio={(v) => setCampo(id, v)}
            onMic={alternarDictado}
            error={Boolean(errores[id])}
            {...extra}
        />
    );

    /* ------------------------------ Render ---------------------------------- */
    return (
        <div className="relative min-h-screen w-full px-3 py-4 sm:px-6 sm:py-8">
            <style>{ESTILOS}</style>

            <div className="mx-auto w-full max-w-7xl">
                {/* ----------------------- Encabezado ------------------------ */}
                <header className={`pt-slide-up mb-5 overflow-hidden rounded-3xl ${VIDRIO}`}>
                    <div className="h-2 w-full bg-gradient-to-r from-[#C2603A] via-[#D69A1E] to-[#5E8C61]" />
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex h-14 items-center gap-1 rounded-2xl border-2 border-[#D69A1E]/50 bg-amber-50 px-4 text-base font-black text-[#8A4A1E] shadow transition-all hover:-translate-y-0.5 active:scale-95"
                            >
                                <IconoAtras /> Volver
                            </button>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-[#C2603A]">Programa de Parteras Tradicionales</p>
                                <h1 className="text-2xl font-black leading-tight text-stone-900 sm:text-3xl">Hoja de referencia</h1>
                                <p className="text-sm font-bold text-stone-600">Acude a tu unidad de salud · Servicios de Salud de Oaxaca</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                hablar(
                                    'Llene los datos de la usuaria. Toque el micrófono para dictar. Después toque los dibujos del motivo de la referencia y por último presione enviar.'
                                )
                            }
                            className="pt-breathe flex h-16 items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-[#D69A1E] to-[#C2603A] px-6 text-lg font-black text-white"
                        >
                            <IconoBocina className="h-7 w-7" /> Escuchar instrucciones
                        </button>
                    </div>
                </header>

                {/* ------------------------ Dos columnas --------------------- */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
                    {/* ===================== COLUMNA IZQUIERDA ================= */}
                    <div className="flex flex-col gap-5">
                        {/* ---- Identificación ---- */}
                        <section className={`pt-slide-up rounded-3xl p-4 sm:p-6 ${VIDRIO}`} style={{ animationDelay: '.06s' }}>
                            <h2 className="mb-4 border-b-4 border-[#D69A1E]/60 pb-2 text-xl font-black text-stone-900 sm:text-2xl">
                                Datos de identificación y canalización
                            </h2>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {campo('centro', 'Centro de salud u hospital', 'Hospital o centro de salud…', { className: 'sm:col-span-2' })}
                                {campo('usuaria', 'Nombre de la usuaria', 'Nombre completo de la paciente…', { className: 'sm:col-span-2' })}

                                {campo('edad', 'Edad', 'Ej. 26', { inputMode: 'numeric', maxLength: 3 })}

                                <div>
                                    <label htmlFor="pt-sexo" className="mb-1.5 block text-sm font-black uppercase tracking-wide text-stone-700">
                                        Sexo
                                    </label>
                                    <select
                                        id="pt-sexo"
                                        value={datos.sexo}
                                        onChange={(e) => setDatos((p) => ({ ...p, sexo: e.target.value }))}
                                        className="h-16 w-full rounded-2xl border-2 border-stone-200 bg-white/90 px-4 text-lg font-bold text-stone-900 outline-none transition-all focus:border-[#C2603A] focus:ring-4 focus:ring-[#C2603A]/20"
                                    >
                                        <option>Femenino</option>
                                        <option>Masculino</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="pt-fecha" className="mb-1.5 block text-sm font-black uppercase tracking-wide text-stone-700">
                                        Fecha
                                    </label>
                                    <input
                                        id="pt-fecha"
                                        type="date"
                                        value={datos.fecha}
                                        onChange={(e) => setDatos((p) => ({ ...p, fecha: e.target.value }))}
                                        className="h-16 w-full rounded-2xl border-2 border-stone-200 bg-white/90 px-4 text-lg font-bold text-stone-900 outline-none transition-all focus:border-[#C2603A] focus:ring-4 focus:ring-[#C2603A]/20"
                                    />
                                </div>

                                {campo('localidad', 'Localidad', 'Localidad…')}
                                {campo('municipio', 'Municipio', 'Municipio…')}
                                {campo('partera', 'Nombre de la partera', 'Partera tradicional…')}
                                {campo('localidadPartera', 'Localidad de la partera', 'Localidad de la partera…')}
                            </div>
                        </section>

                        {/* ---- Motivos ---- */}
                        <section
                            className={`pt-slide-up rounded-3xl p-4 sm:p-6 ${VIDRIO} ${errores.motivos ? 'ring-4 ring-red-400/60 pt-shake' : ''}`}
                            style={{ animationDelay: '.12s' }}
                        >
                            <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b-4 border-[#C2603A]/60 pb-2">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[#C2603A]">Toque los dibujos</p>
                                    <h2 className="text-xl font-black text-stone-900 sm:text-2xl">Motivo de la referencia</h2>
                                </div>
                                <span className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-black text-[#8A4A1E]">
                                    Seleccionados: {seleccionados.length}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                                {MOTIVOS.map((m, i) => {
                                    const activo = seleccionados.includes(m.id);
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => alternarMotivo(m)}
                                            aria-pressed={activo}
                                            style={{ animationDelay: `${0.15 + i * 0.03}s` }}
                                            className={`pt-fade-in relative flex min-h-[188px] flex-col items-center justify-between gap-2 rounded-3xl border-4 p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 ${activo
                                                ? 'border-[#C2603A] bg-gradient-to-b from-orange-50 to-amber-100 shadow-xl shadow-orange-900/20 -translate-y-1'
                                                : 'border-stone-200 bg-gradient-to-b from-white to-amber-50/70 shadow-md'
                                                }`}
                                        >
                                            {activo && (
                                                <span className="pt-pop-in absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-lg">
                                                    <IconoCheck />
                                                </span>
                                            )}
                                            <span className="flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-amber-200/70">
                                                <Ilustracion motivo={m} />
                                            </span>
                                            <span className="text-sm font-black uppercase leading-tight text-stone-900">{m.etiqueta}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* ===================== COLUMNA DERECHA =================== */}
                    <div className="flex flex-col gap-5 lg:sticky lg:top-4">
                        {/* ---- Resumen interactivo ---- */}
                        <section className={`pt-slide-up rounded-3xl p-4 sm:p-6 ${VIDRIO}`} style={{ animationDelay: '.18s' }}>
                            <h2 className="mb-3 border-b-4 border-[#5E8C61]/60 pb-2 text-xl font-black text-stone-900 sm:text-2xl">
                                Resumen de la referencia
                            </h2>

                            <dl className="mb-4 grid grid-cols-1 gap-2 text-base sm:grid-cols-2">
                                <div className="rounded-2xl bg-amber-50 p-3">
                                    <dt className="text-xs font-black uppercase text-stone-600">Usuaria</dt>
                                    <dd className="break-words font-bold text-stone-900">{datos.usuaria || '—'}</dd>
                                </div>
                                <div className="rounded-2xl bg-amber-50 p-3">
                                    <dt className="text-xs font-black uppercase text-stone-600">Centro de salud</dt>
                                    <dd className="break-words font-bold text-stone-900">{datos.centro || '—'}</dd>
                                </div>
                                <div className="rounded-2xl bg-amber-50 p-3">
                                    <dt className="text-xs font-black uppercase text-stone-600">Edad y sexo</dt>
                                    <dd className="font-bold text-stone-900">
                                        {datos.edad ? `${datos.edad} años` : '—'} · {datos.sexo}
                                    </dd>
                                </div>
                                <div className="rounded-2xl bg-amber-50 p-3">
                                    <dt className="text-xs font-black uppercase text-stone-600">Comunidad</dt>
                                    <dd className="break-words font-bold text-stone-900">
                                        {[datos.localidad, datos.municipio].filter(Boolean).join(', ') || '—'}
                                    </dd>
                                </div>
                            </dl>

                            <p className="mb-2 text-sm font-black uppercase tracking-wide text-stone-700">Motivos elegidos</p>
                            {motivosElegidos.length === 0 ? (
                                <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white/60 p-5 text-center text-base font-bold text-stone-500">
                                    Toque un dibujo para elegir el motivo
                                </div>
                            ) : (
                                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {motivosElegidos.map((m) => (
                                        <li key={m.id} className="pt-pop-in">
                                            <button
                                                type="button"
                                                onClick={() => alternarMotivo(m)}
                                                aria-label={`Quitar ${m.etiqueta}`}
                                                className="flex w-full items-center gap-3 rounded-2xl border-2 border-[#C2603A]/60 bg-orange-50 p-2 text-left transition-all hover:bg-orange-100 active:scale-95"
                                            >
                                                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1">
                                                    <Ilustracion motivo={m} />
                                                </span>
                                                <span className="flex-1 text-sm font-black leading-tight text-stone-900">{m.etiqueta}</span>
                                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                                                    <IconoCheck className="h-4 w-4" />
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        {/* ---- Contrarreferencia ---- */}
                        <section className={`pt-slide-up overflow-hidden rounded-3xl p-4 sm:p-6 ${VIDRIO}`} style={{ animationDelay: '.24s' }}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-black text-stone-900">Contrarreferencia médica</h2>
                                    <p className="text-sm font-bold text-stone-600">Respuesta del centro de salud a la partera</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setContraAbierta((v) => !v);
                                        hablar(contraAbierta ? 'Sección del médico oculta.' : 'Sección del médico tratante abierta.');
                                    }}
                                    aria-expanded={contraAbierta}
                                    className="h-14 rounded-2xl border-2 border-[#5E8C61]/60 bg-emerald-50 px-5 text-base font-black text-emerald-900 transition-all hover:-translate-y-0.5 active:scale-95"
                                >
                                    {contraAbierta ? 'Ocultar sección' : 'Abrir sección del médico'}
                                </button>
                            </div>

                            {contraAbierta && (
                                <div className="pt-slide-up mt-4 flex flex-col gap-4 border-t-2 border-amber-200 pt-4">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEstadoContra('alta');
                                                hablar('Paciente controlada, dada de alta.');
                                            }}
                                            aria-pressed={estadoContra === 'alta'}
                                            className={`flex h-16 items-center justify-center gap-2 rounded-2xl border-4 text-base font-black transition-all active:scale-95 ${estadoContra === 'alta'
                                                ? 'border-emerald-700 bg-emerald-600 text-white shadow-lg'
                                                : 'border-stone-200 bg-white text-stone-800 hover:border-emerald-500'
                                                }`}
                                        >
                                            {estadoContra === 'alta' && <IconoCheck />} Paciente controlada / Alta
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEstadoContra('regresa');
                                                hablar('La paciente regresa a control con la partera.');
                                            }}
                                            aria-pressed={estadoContra === 'regresa'}
                                            className={`flex h-16 items-center justify-center gap-2 rounded-2xl border-4 text-base font-black transition-all active:scale-95 ${estadoContra === 'regresa'
                                                ? 'border-[#9A6A0F] bg-[#D69A1E] text-stone-900 shadow-lg'
                                                : 'border-stone-200 bg-white text-stone-800 hover:border-[#D69A1E]'
                                                }`}
                                        >
                                            {estadoContra === 'regresa' && <IconoCheck />} Regresa a control con la partera
                                        </button>
                                    </div>

                                    {campo('diagnostico', 'Diagnóstico del médico', 'Diagnóstico…', { multilinea: true })}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {campo('tratamiento', 'Tratamiento indicado', 'Tratamiento…', { multilinea: true })}
                                        {campo('indicaciones', 'Indicaciones a la partera', 'Indicaciones…', { multilinea: true })}
                                        {campo('medico', 'Nombre del médico tratante', 'Dr. o Dra.…')}
                                        {campo('unidad', 'Unidad médica / hospital', 'Hospital o centro de salud…')}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ---- Botón gigante de envío ---- */}
                        <button
                            type="button"
                            onClick={enviar}
                            disabled={enviando || enviado}
                            className={`pt-slide-up flex min-h-[88px] w-full items-center justify-center gap-4 rounded-3xl border-4 border-white/70 px-6 py-5 text-xl font-black text-white shadow-2xl shadow-orange-900/30 transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 sm:text-2xl ${seleccionados.length > 0 && !enviando ? 'pt-breathe' : ''
                                } bg-gradient-to-r from-[#C2603A] via-[#CC7A2C] to-[#D69A1E]`}
                            style={{ animationDelay: '.3s' }}
                        >
                            <IconoEnviar />
                            {enviando ? 'Enviando…' : 'Enviar hoja de referencia al centro de salud'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ----------------------- Confirmación de envío ------------------ */}
            {enviado && (
                <div
                    role="status"
                    aria-live="polite"
                    className="pt-fade-in fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
                >
                    <div className={`pt-pop-in w-full max-w-md rounded-3xl p-8 text-center ${VIDRIO}`}>
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl">
                            <IconoCheck className="h-14 w-14" />
                        </div>
                        <h2 className="text-3xl font-black text-stone-900">¡Hoja enviada!</h2>
                        <p className="mt-2 text-lg font-bold text-stone-700">
                            La referencia de {datos.usuaria || 'la usuaria'} llegó al centro de salud.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormatoReferencia;