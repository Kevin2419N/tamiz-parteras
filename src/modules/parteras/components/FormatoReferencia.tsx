import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* ============================================================================
 * FormatoReferencia — Hoja de referencia comunitaria (Partera Tradicional)
 * Servicios de Salud de Oaxaca
 *
 * - Una sola columna vertical, fluida, sin scroll horizontal.
 * - Un único encabezado: Volver (izq) · Título (centro) · Escuchar (der).
 * - Tarjetas de motivos con las ilustraciones PNG reales (sin emojis).
 * - Dictado por voz es-MX en todos los campos de texto.
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
type ErroresForm = Partial<Record<CampoId | 'motivos', boolean>>;

interface Motivo {
    id: string;
    etiqueta: string;
    voz: string;
    imagen: string;
}

/* Tipos mínimos de Web Speech API */
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

/* Rutas de las ilustraciones PNG (carpeta public/). Ajusta aquí cualquier nombre. */
const MOTIVOS: Motivo[] = [
    { id: 'embarazo', etiqueta: 'Complicaciones del embarazo', voz: 'Complicaciones del embarazo', imagen: '/Complicaciones-del-embarazo.png' },
    { id: 'toxoide', etiqueta: 'Aplicar toxoide tetánico', voz: 'Aplicar toxoide tetánico', imagen: '/Aplicar-Toxoide-Tetanico.png' },
    { id: 'aborto', etiqueta: 'Aborto', voz: 'Aborto', imagen: '/Aborto.png' },
    { id: 'parto', etiqueta: 'Parto complicado', voz: 'Parto complicado', imagen: '/Parto-Complicado.png' },
    { id: 'puerperio', etiqueta: 'Puerperio complicado', voz: 'Puerperio complicado', imagen: '/Puerperio-Complicado.png' },
    { id: 'zika', etiqueta: 'Zika', voz: 'Zika', imagen: '/Zika.png' },
    { id: 'nino', etiqueta: 'Niño con complicaciones', voz: 'Niño con complicaciones', imagen: '/Nino-con-Complicaciones.png' },
    { id: 'nina', etiqueta: 'Niña con complicaciones', voz: 'Niña con complicaciones', imagen: '/Nina-con-Complicaciones.png' },
    { id: 'tamizMetabolico', etiqueta: 'Tamiz metabólico', voz: 'Tamiz metabólico', imagen: '/Tamiz-Metabolico.png' },
    { id: 'tamizAuditivo', etiqueta: 'Tamiz auditivo', voz: 'Tamiz auditivo', imagen: '/Tamiz-Auditivo.png' },
    { id: 'vitaminas', etiqueta: "Aplicar vitamina 'A' y 'K'", voz: 'Aplicar vitamina A y K', imagen: '/Aplicar-Vitamina-A-y-K.png' },
    { id: 'vacunas', etiqueta: 'Vacuna BCG / Anti hepatitis B', voz: 'Vacuna BCG y anti hepatitis B', imagen: '/Vacuna-BCG-Anti-Hepatitis-B.png' },
    { id: 'papanicolaou', etiqueta: 'Toma de papanicolaou', voz: 'Toma de papanicolaou', imagen: '/Toma-de-Papanicolaou.png' },
    { id: 'otros', etiqueta: 'Otros', voz: 'Otros motivos', imagen: '/Otros.png' },
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
    'bg-gradient-to-br from-[#D69A1E] via-[#CC7A2C] to-[#C2603A] text-white shadow-lg shadow-orange-900/30 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]';

/* ------------------------------ Iconos SVG -------------------------------- */

interface IconoProps {
    className?: string;
}

const IconoMic: React.FC<IconoProps> = ({ className = 'h-6 w-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <path d="M12 18v4" />
    </svg>
);
const IconoStop: React.FC<IconoProps> = ({ className = 'h-6 w-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="6" y="6" width="12" height="12" rx="2.5" />
    </svg>
);
const IconoBocina: React.FC<IconoProps> = ({ className = 'h-6 w-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
);
const IconoCheck: React.FC<IconoProps> = ({ className = 'h-5 w-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
);
const IconoAtras: React.FC<IconoProps> = ({ className = 'h-6 w-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m15 5-7 7 7 7" />
    </svg>
);
const IconoEnviar: React.FC<IconoProps> = ({ className = 'h-7 w-7' }) => (
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
    maxLength,
}) => {
    const base =
        'w-full rounded-2xl border-2 bg-white/90 px-4 pr-20 text-lg font-bold text-stone-900 placeholder:font-semibold placeholder:text-stone-400 outline-none transition-all duration-200 focus:border-[#C2603A] focus:ring-4 focus:ring-[#C2603A]/20';
    const borde = escuchando
        ? 'border-[#C2603A] ring-4 ring-[#C2603A]/25 bg-orange-50/90'
        : error
            ? 'border-red-400 pt-shake'
            : 'border-stone-200';
    const alto = multilinea ? 'min-h-[110px] resize-none py-3' : 'h-16';
    const ph = escuchando ? 'Escuchando… hable ahora' : placeholder;

    return (
        <div>
            <label htmlFor={`pt-${id}`} className="mb-1.5 block text-sm font-bold uppercase tracking-wide text-stone-800">
                {etiqueta}
            </label>
            <div className="relative">
                {multilinea ? (
                    <textarea
                        id={`pt-${id}`}
                        value={valor}
                        maxLength={maxLength}
                        placeholder={ph}
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
                        placeholder={ph}
                        onChange={(e) => onCambio(e.target.value)}
                        autoComplete="off"
                        className={`${base} ${borde} ${alto}`}
                    />
                )}

                {escuchando && (
                    <div
                        className={`pt-fade-in pointer-events-none absolute right-[4.25rem] flex items-center gap-1 ${multilinea ? 'top-5' : 'top-1/2 -translate-y-1/2'}`}
                        aria-hidden="true"
                    >
                        {[0, 0.15, 0.3, 0.1, 0.25].map((d, i) => (
                            <span key={i} className="pt-wave-bar" style={{ animationDelay: `${d}s` }} />
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => onMic(id)}
                    aria-label={escuchando ? `Detener dictado de ${etiqueta}` : `Dictar ${etiqueta} por voz`}
                    aria-pressed={escuchando}
                    className={`absolute right-2 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md transition-all duration-200 active:scale-[0.96] ${multilinea ? 'top-2' : 'top-1/2 -translate-y-1/2'
                        } ${escuchando
                            ? 'pt-ring bg-[#C2603A]'
                            : 'bg-gradient-to-br from-[#D69A1E] to-[#C2603A] hover:shadow-lg'
                        }`}
                >
                    {escuchando ? <IconoStop /> : <IconoMic />}
                </button>
            </div>
        </div>
    );
};

/* ------------------------ Ilustración (imagen real) ----------------------- */

const Ilustracion: React.FC<{ motivo: Motivo }> = ({ motivo }) => {
    const [fallo, setFallo] = useState(false);
    if (fallo) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 px-2 text-center text-xs font-bold text-stone-500">
                Imagen no disponible
            </div>
        );
    }
    return (
        <img
            src={motivo.imagen}
            alt={motivo.etiqueta}
            loading="lazy"
            draggable={false}
            onError={() => setFallo(true)}
            className="max-h-full max-w-full object-contain"
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
    const [errores, setErrores] = useState<ErroresForm>({});
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const datosRef = useRef<Datos>(datos);
    const recRef = useRef<SpeechRecognitionLike | null>(null);
    const temporizadorRef = useRef<number | null>(null);

    useEffect(() => {
        datosRef.current = datos;
    }, [datos]);

    /* ----- Voz de salida ---------------------------------------------------- */
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

    /* ----- Campos ----------------------------------------------------------- */
    const setCampo = useCallback((id: CampoId, valor: string) => {
        const limpio = id === 'edad' ? valor.replace(/\D/g, '').slice(0, 3) : valor;
        setDatos((prev) => ({ ...prev, [id]: limpio }));
        setErrores((prev) => (prev[id] ? { ...prev, [id]: false } : prev));
    }, []);

    /* ----- Dictado ---------------------------------------------------------- */
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
            /* Si el padre controla el dictado, se delega en él. */
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
                const dictado = transcripcion.trim();
                setCampo(id, textoBase ? `${textoBase} ${dictado}` : dictado);
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

    /* ----- Motivos ---------------------------------------------------------- */
    const alternarMotivo = (m: Motivo) => {
        const yaEsta = seleccionados.includes(m.id);
        setSeleccionados((prev) => (yaEsta ? prev.filter((x) => x !== m.id) : [...prev, m.id]));
        setErrores((prev) => ({ ...prev, motivos: false }));
        hablar(yaEsta ? `Quitado: ${m.voz}` : `Seleccionado: ${m.voz}`);
    };

    const totalMotivos = useMemo(() => seleccionados.length, [seleccionados]);

    /* ----- Envío ------------------------------------------------------------ */
    const enviar = () => {
        const nuevos: ErroresForm = {};
        if (!datos.centro.trim()) nuevos.centro = true;
        if (!datos.usuaria.trim()) nuevos.usuaria = true;
        if (seleccionados.length === 0) nuevos.motivos = true;
        setErrores(nuevos);

        if (nuevos.centro) {
            hablar('Falta el centro de salud u hospital.');
            return;
        }
        if (nuevos.usuaria) {
            hablar('Falta el nombre de la usuaria.');
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

    const campo = (id: CampoId, etiqueta: string, placeholder: string, extra?: Partial<CampoVozProps>) => (
        <CampoVoz
            id={id}
            etiqueta={etiqueta}
            valor={datos[id]}
            placeholder={placeholder}
            escuchando={campoActivo === id}
            onCambio={(v) => setCampo(id, v)}
            onMic={alternarDictado}
            error={Boolean(errores[id])}
            {...extra}
        />
    );

    const INSTRUCCIONES =
        'Llene los datos de la usuaria. Toque el micrófono de cada campo para dictar. Después toque los dibujos del motivo de la referencia y, al final, presione el botón de enviar.';

    /* ------------------------------ Render ---------------------------------- */
    return (
        <div className="relative min-h-screen w-full overflow-x-hidden px-3 py-4 sm:px-6 sm:py-8">
            <style>{ESTILOS}</style>

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
                {/* ===================== Encabezado único ===================== */}
                <header className={`pt-slide-up overflow-hidden ${VIDRIO}`}>
                    <div className="h-2 w-full bg-gradient-to-r from-[#C2603A] via-[#D69A1E] to-[#5E8C61]" />
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 p-3 sm:gap-4 sm:p-5">
                        <button
                            type="button"
                            onClick={onBack}
                            aria-label="Volver al menú"
                            className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#D69A1E]/50 bg-amber-50 px-3 text-base font-black text-stone-900 shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] sm:px-5"
                        >
                            <IconoAtras />
                            <span className="hidden sm:inline">Volver al menú</span>
                        </button>

                        <div className="min-w-0 text-center">
                            <h1 className="text-lg font-black leading-tight text-stone-900 sm:text-2xl">
                                Hoja oficial de referencia
                            </h1>
                            <p className="hidden text-sm font-bold text-stone-700 sm:block">
                                Programa de Parteras Tradicionales · Servicios de Salud de Oaxaca
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => hablar(INSTRUCCIONES)}
                            aria-label="Escuchar instrucciones"
                            className={`flex h-14 items-center justify-center gap-2 rounded-2xl px-3 text-base font-black sm:px-5 ${BOTON_TIERRA}`}
                        >
                            <IconoBocina />
                            <span className="hidden sm:inline">Escuchar instrucciones</span>
                        </button>
                    </div>
                </header>

                {/* ================= Datos de identificación ================== */}
                <section className={`pt-slide-up p-4 sm:p-6 ${VIDRIO}`} style={{ animationDelay: '.06s' }}>
                    <h2 className="mb-5 border-b-4 border-[#D69A1E]/60 pb-2 text-xl font-black text-stone-900 sm:text-2xl">
                        Datos de identificación y canalización
                    </h2>

                    <div className="flex flex-col gap-5">
                        {campo('centro', 'Centro de salud u hospital', 'Hospital o centro de salud…')}
                        {campo('usuaria', 'Nombre de la usuaria', 'Nombre completo de la paciente…')}
                        {campo('edad', 'Edad', 'Ej. 26', { inputMode: 'numeric', maxLength: 3 })}

                        <div>
                            <label htmlFor="pt-sexo" className="mb-1.5 block text-sm font-bold uppercase tracking-wide text-stone-800">
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

                        <div>
                            <label htmlFor="pt-fecha" className="mb-1.5 block text-sm font-bold uppercase tracking-wide text-stone-800">
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

                {/* ================== Motivo de la referencia ================= */}
                <section
                    className={`pt-slide-up p-4 sm:p-6 ${VIDRIO} ${errores.motivos ? 'pt-shake ring-4 ring-red-400/60' : ''}`}
                    style={{ animationDelay: '.12s' }}
                >
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-2 border-b-4 border-[#C2603A]/60 pb-2">
                        <div>
                            <h2 className="text-xl font-black text-stone-900 sm:text-2xl">Motivo de la referencia</h2>
                            <p className="text-sm font-bold text-stone-700">Toque los dibujos que correspondan</p>
                        </div>
                        <span className="rounded-full border border-[#D69A1E]/50 bg-amber-100 px-4 py-1.5 text-sm font-black text-stone-900">
                            Seleccionados: {totalMotivos}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                        {MOTIVOS.map((m, i) => {
                            const activo = seleccionados.includes(m.id);
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => alternarMotivo(m)}
                                    aria-pressed={activo}
                                    style={{ animationDelay: `${0.15 + i * 0.03}s` }}
                                    className={`pt-fade-in relative flex min-h-[200px] flex-col items-center justify-between gap-2 rounded-3xl border-4 p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] ${activo
                                        ? '-translate-y-1 border-[#C2603A] bg-gradient-to-b from-orange-50 to-amber-100 shadow-xl shadow-orange-900/20'
                                        : 'border-stone-200 bg-gradient-to-b from-white to-amber-50/70 shadow-md'
                                        }`}
                                >
                                    {activo && (
                                        <span className="pt-pop-in absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-lg">
                                            <IconoCheck />
                                        </span>
                                    )}
                                    <span className="flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-amber-200/70">
                                        <Ilustracion motivo={m} />
                                    </span>
                                    <span className="text-sm font-black uppercase leading-tight text-stone-900">{m.etiqueta}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* ================= Contrarreferencia médica ================= */}
                <section className={`pt-slide-up p-4 sm:p-6 ${VIDRIO}`} style={{ animationDelay: '.18s' }}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-black text-stone-900 sm:text-2xl">Contrarreferencia médica</h2>
                            <p className="text-sm font-bold text-stone-700">Respuesta oficial del centro de salud a la partera</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setContraAbierta((v) => !v);
                                hablar(contraAbierta ? 'Sección del médico oculta.' : 'Sección del médico tratante abierta.');
                            }}
                            aria-expanded={contraAbierta}
                            className="h-14 rounded-2xl border-2 border-[#5E8C61]/60 bg-emerald-50 px-5 text-base font-black text-stone-900 shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                            {contraAbierta ? 'Ocultar sección' : 'Abrir sección del médico'}
                        </button>
                    </div>

                    {contraAbierta && (
                        <div className="pt-slide-up mt-5 flex flex-col gap-5 border-t-2 border-amber-200 pt-5">
                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEstadoContra('alta');
                                        hablar('Paciente controlada, dada de alta.');
                                    }}
                                    aria-pressed={estadoContra === 'alta'}
                                    className={`flex h-16 items-center justify-center gap-2 rounded-2xl border-4 text-base font-black transition-all duration-200 active:scale-[0.98] ${estadoContra === 'alta'
                                        ? 'border-emerald-700 bg-emerald-600 text-white shadow-lg'
                                        : 'border-stone-200 bg-white text-stone-900 hover:border-emerald-500'
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
                                    className={`flex h-16 items-center justify-center gap-2 rounded-2xl border-4 text-base font-black transition-all duration-200 active:scale-[0.98] ${estadoContra === 'regresa'
                                        ? 'border-[#9A6A0F] bg-[#D69A1E] text-stone-900 shadow-lg'
                                        : 'border-stone-200 bg-white text-stone-900 hover:border-[#D69A1E]'
                                        }`}
                                >
                                    {estadoContra === 'regresa' && <IconoCheck />} Regresa para control con la partera
                                </button>
                            </div>

                            {campo('diagnostico', 'Diagnóstico del médico', 'Diagnóstico…', { multilinea: true })}
                            {campo('tratamiento', 'Tratamiento indicado', 'Tratamiento…', { multilinea: true })}
                            {campo('indicaciones', 'Indicaciones a la partera', 'Indicaciones…', { multilinea: true })}
                            {campo('medico', 'Nombre del médico tratante', 'Dr. o Dra.…')}
                            {campo('unidad', 'Unidad médica / hospital', 'Hospital o centro de salud…')}
                        </div>
                    )}
                </section>

                {/* ====================== Botón de envío ====================== */}
                <button
                    type="button"
                    onClick={enviar}
                    disabled={enviando || enviado}
                    className={`pt-slide-up flex min-h-[88px] w-full items-center justify-center gap-4 rounded-3xl px-6 py-5 text-xl font-black disabled:cursor-wait disabled:opacity-80 sm:text-2xl ${BOTON_TIERRA} ${totalMotivos > 0 && !enviando ? 'pt-breathe' : ''
                        }`}
                    style={{ animationDelay: '.24s' }}
                >
                    <IconoEnviar />
                    {enviando ? 'Enviando…' : 'Enviar hoja de referencia al centro de salud'}
                </button>
            </div>

            {/* ================== Confirmación de envío ======================= */}
            {enviado && (
                <div
                    role="status"
                    aria-live="polite"
                    className="pt-fade-in fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
                >
                    <div className={`pt-pop-in w-full max-w-md p-8 text-center ${VIDRIO}`}>
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl">
                            <IconoCheck className="h-14 w-14" />
                        </div>
                        <h2 className="text-3xl font-black text-stone-900">¡Hoja enviada!</h2>
                        <p className="mt-2 text-lg font-bold text-stone-800">
                            La referencia de {datos.usuaria || 'la usuaria'} llegó al centro de salud.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormatoReferencia;