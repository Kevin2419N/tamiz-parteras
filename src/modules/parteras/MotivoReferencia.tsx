import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { http } from '../../services/http'; // Instancia de Axios hacia el servidor en Render[cite: 10]

/* ============================================================================
 * MotivoReferencia — Motor del formulario de referencia
 *
 * - Estados del formulario y envío a PostgreSQL vía Axios:
 *     http.post('/referencias', payloadReferencia)
 * - Dictado por voz en vivo (es-MX) con ondas de audio en cada campo de texto
 * - Datos de identificación en 2 columnas simétricas (1 columna en celular)
 * - Tarjetas de motivos en cuadrícula simétrica, con imágenes PNG reales
 * - Contrarreferencia médica colapsable
 * - Estados de carga (spinner) y éxito (alerta visual + auditiva)
 *
 * No incluye encabezado propio: el header global lo aporta FormatoReferencia.
 * ========================================================================== */

/* ------------------------------ Tipos ------------------------------------ */

interface MotivoReferenciaProps {
    onBack?: () => void;
    onSuccess?: () => void;
    hablarTexto?: (texto: string) => void;
    isListeningExternal?: boolean;
    campoEscuchandoExternal?: string | null;
    iniciarDictadoExternal?: (campo: string, setFieldState?: (val: string) => void) => void;
}

export interface MotivoItem {
    id: string;
    titulo: string;
    voz: string;
    imagen: string;
    bullets?: string[];
}

type CampoId =
    | 'centroSalud'
    | 'nombreUsuaria'
    | 'edad'
    | 'localidad'
    | 'municipio'
    | 'nombrePartera'
    | 'localidadPartera'
    | 'diagnostico'
    | 'tratamiento'
    | 'observacionesMedico'
    | 'nombreMedico'
    | 'centroMedico';

type Sexo = 'F' | 'M';
type EstadoContra = 'CONTROLADA' | 'PARA_CONTROL_PARTERA';

interface Datos extends Record<CampoId, string> {
    sexo: Sexo;
    fecha: string;
}

type ErroresForm = Partial<Record<CampoId | 'motivos', boolean>>;

interface PayloadReferencia {
    parteraId: string;
    centroSalud: string;
    nombreUsuaria: string;
    edad: number;
    sexo: Sexo;
    fecha: string;
    localidad: string;
    municipio: string;
    nombrePartera: string;
    localidadPartera: string;
    motivos: string[];
    contrareferencia: {
        activa: boolean;
        estadoContra: EstadoContra;
        diagnostico: string;
        tratamiento: string;
        observacionesMedico: string;
        nombreMedico: string;
        centroMedico: string;
    };
}

interface ErrorServidor {
    message?: string;
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

/* IDs (viajan al backend) y rutas PNG reales de /public/. */
const LISTA_MOTIVOS: MotivoItem[] = [
    { id: 'COMPLICACIONES_EMBARAZO', titulo: 'Complicaciones del embarazo', voz: 'Complicaciones del embarazo', imagen: '/Complicaciones-del-embarazo.png' },
    { id: 'APLICAR_TOXOIDE_TETANICO', titulo: 'Aplicar toxoide tetánico', voz: 'Aplicar toxoide tetánico', imagen: '/Aplicar-Toxoide-Tetanico.png' },
    { id: 'ABORTO', titulo: 'Aborto', voz: 'Aborto', imagen: '/Aborto.png' },
    { id: 'PARTO_COMPLICADO', titulo: 'Parto complicado', voz: 'Parto complicado', imagen: '/Parto-Complicado.png' },
    { id: 'PUERPERIO_COMPLICADO', titulo: 'Puerperio complicado', voz: 'Puerperio complicado', imagen: '/Puerferico-Complicado.png' },
    {
        id: 'ZIKA',
        titulo: 'Zika',
        voz: 'Zika',
        imagen: '/Zika.png',
        bullets: ['Fiebre', 'Dolor de articulaciones', 'Salpullido', 'Conjuntivitis'],
    },
    { id: 'NINO_CON_COMPLICACIONES', titulo: 'Niño con complicaciones', voz: 'Niño con complicaciones', imagen: '/Niño-Con-Complicaciones.png' },
    { id: 'NINA_CON_COMPLICACIONES', titulo: 'Niña con complicaciones', voz: 'Niña con complicaciones', imagen: '/Niña-Con-Complicaciones.png' },
    { id: 'TAMIZ_METABOLICO', titulo: 'Tamiz metabólico', voz: 'Tamiz metabólico', imagen: '/Tamiz-Metabolico.png' },
    { id: 'TAMIZ_AUDITIVO', titulo: 'Tamiz auditivo', voz: 'Tamiz auditivo', imagen: '/Tamiz-Auditivo.png' },
    { id: 'APLICAR_VITAMINA_A_Y_K', titulo: "Aplicar vitamina 'A' y 'K'", voz: 'Aplicar vitamina A y K', imagen: '/Aplicar-Vitamina-A-Y-K.png' },
    { id: 'VACUNA_BCG_ANTI_HEPATITIS', titulo: 'Vacuna BCG / Anti hepatitis B', voz: 'Vacuna BCG y anti hepatitis B', imagen: '/Vacuna.png' },
    { id: 'TOMA_DE_PAPANICOLAOU', titulo: 'Toma de papanicolaou', voz: 'Toma de papanicolaou', imagen: '/Toma-De-Papanicolao.png' },
    { id: 'OTROS', titulo: 'Otros', voz: 'Otros motivos', imagen: '/Otros.png' },
];

const CAMPOS_OBLIGATORIOS: CampoId[] = ['centroSalud', 'nombreUsuaria', 'nombrePartera', 'localidadPartera'];

const AVISOS_FALTANTES: Partial<Record<CampoId, string>> = {
    centroSalud: 'Falta el centro de salud u hospital.',
    nombreUsuaria: 'Falta el nombre de la usuaria.',
    nombrePartera: 'Falta el nombre de la partera.',
    localidadPartera: 'Falta la localidad de la partera.',
};

const hoyISO = (): string => {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
};

const DATOS_INICIALES = (): Datos => ({
    centroSalud: '',
    nombreUsuaria: '',
    edad: '',
    sexo: 'F',
    fecha: hoyISO(),
    localidad: '',
    municipio: '',
    nombrePartera: '',
    localidadPartera: '',
    diagnostico: '',
    tratamiento: '',
    observacionesMedico: '',
    nombreMedico: '',
    centroMedico: '',
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
    'bg-gradient-to-br from-[#D69A1E] via-[#CC7A2C] to-[#C2603A] text-white shadow-xl shadow-orange-900/40 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl active:scale-[0.98]';

const CLASE_SELECTOR =
    'h-16 w-full rounded-2xl border-2 border-stone-200 bg-white/90 px-4 text-lg font-bold text-stone-900 outline-none transition-all duration-200 focus:border-[#C2603A] focus:ring-4 focus:ring-[#C2603A]/20';

const CLASE_ETIQUETA = 'mb-1.5 block text-sm font-bold uppercase tracking-wide text-stone-800';

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
const IconoCheck: React.FC<IconoProps> = ({ className = 'h-5 w-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
);
const IconoEnviar: React.FC<IconoProps> = ({ className = 'h-7 w-7' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m22 2-11 11" />
        <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
);
const IconoCargando: React.FC<IconoProps> = ({ className = 'h-7 w-7' }) => (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity={0.3} strokeWidth={3.5} />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" />
    </svg>
);
const IconoEstetoscopio: React.FC<IconoProps> = ({ className = 'h-7 w-7' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3v6a4 4 0 0 0 8 0V3" />
        <path d="M5 3h2" />
        <path d="M13 3h2" />
        <path d="M10 13v2a5 5 0 0 0 10 0v-2" />
        <circle cx="20" cy="11" r="2" />
    </svg>
);
const IconoChevron: React.FC<IconoProps> = ({ className = 'h-6 w-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
    </svg>
);
const IconoPersona: React.FC<IconoProps> = ({ className = 'h-6 w-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
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
    multilinea = false,
    error = false,
    maxLength,
    className = '',
}) => {
    const base =
        'w-full rounded-2xl border-2 bg-white/90 px-4 pr-20 text-lg font-bold text-stone-900 placeholder:font-semibold placeholder:text-stone-500 outline-none transition-all duration-200 focus:border-[#C2603A] focus:ring-4 focus:ring-[#C2603A]/20';
    const borde = escuchando
        ? 'border-[#C2603A] ring-4 ring-[#C2603A]/25 bg-orange-50/90'
        : error
            ? 'border-red-500 pt-shake'
            : 'border-stone-200';
    const alto = multilinea ? 'min-h-[120px] resize-none py-3' : 'h-16';
    const ph = escuchando ? 'Escuchando… hable ahora' : placeholder;

    return (
        <div className={className}>
            <label htmlFor={`pt-${id}`} className={CLASE_ETIQUETA}>
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
                        aria-invalid={error}
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

const Ilustracion: React.FC<{ motivo: MotivoItem }> = ({ motivo }) => {
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
            src={motivo.imagen}
            alt={motivo.titulo}
            loading="lazy"
            draggable={false}
            onError={() => setFallo(true)}
            className="max-h-full max-w-full object-contain mix-blend-multiply"
        />
    );
};

/* ------------------------------ Componente -------------------------------- */

export const MotivoReferencia: React.FC<MotivoReferenciaProps> = ({
    onSuccess,
    hablarTexto: propsHablarTexto,
    isListeningExternal = false,
    campoEscuchandoExternal = null,
    iniciarDictadoExternal,
}) => {
    /* ----- Estado de negocio ----- */
    const [datos, setDatos] = useState<Datos>(DATOS_INICIALES);
    const [motivosSeleccionados, setMotivosSeleccionados] = useState<string[]>([]);
    const [mostrarContrareferencia, setMostrarContrareferencia] = useState(false);
    const [estadoContra, setEstadoContra] = useState<EstadoContra>('CONTROLADA');

    /* ----- Estado de UI ----- */
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [errorServidor, setErrorServidor] = useState<string | null>(null);
    const [errores, setErrores] = useState<ErroresForm>({});
    const [campoInterno, setCampoInterno] = useState<CampoId | null>(null);

    const datosRef = useRef<Datos>(datos);
    const recRef = useRef<SpeechRecognitionLike | null>(null);
    const temporizadorRef = useRef<number | null>(null);
    const montadoRef = useRef(true);

    useEffect(() => {
        datosRef.current = datos;
    }, [datos]);

    useEffect(() => {
        montadoRef.current = true;
        return () => {
            montadoRef.current = false;
            recRef.current?.stop();
            if (temporizadorRef.current !== null) window.clearTimeout(temporizadorRef.current);
        };
    }, []);

    /* ----- Voz de salida (usa la del contenedor; si no, la del navegador) -- */
    const speakText = useCallback(
        (texto: string) => {
            if (propsHablarTexto) {
                propsHablarTexto(texto);
                return;
            }
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(texto);
            u.lang = 'es-MX';
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
        },
        [propsHablarTexto]
    );

    /* ----- Campos ----------------------------------------------------------- */
    const setCampo = useCallback((id: CampoId, valor: string) => {
        const limpio = id === 'edad' ? valor.replace(/\D/g, '').slice(0, 3) : valor;
        setDatos((prev) => ({ ...prev, [id]: limpio }));
        setErrores((prev) => (prev[id] ? { ...prev, [id]: false } : prev));
    }, []);

    /* ----- Dictado ---------------------------------------------------------- */
    const detenerDictadoInterno = useCallback(() => {
        recRef.current?.stop();
        recRef.current = null;
        setCampoInterno(null);
    }, []);

    const campoActivo: string | null = campoInterno ?? (isListeningExternal ? campoEscuchandoExternal : null);

    const alternarDictado = useCallback(
        (id: CampoId) => {
            /* Si el padre controla el dictado, se delega en él. */
            if (iniciarDictadoExternal) {
                iniciarDictadoExternal(id, (val: string) => setCampo(id, val));
                return;
            }

            if (campoInterno === id) {
                detenerDictadoInterno();
                return;
            }
            detenerDictadoInterno();

            const Ctor = obtenerReconocimiento();
            if (!Ctor) {
                speakText('Su dispositivo no permite dictar por voz. Escriba con el teclado.');
                return;
            }

            const rec = new Ctor();
            rec.lang = 'es-MX';
            rec.continuous = false;
            rec.interimResults = true;

            const textoBase = datosRef.current[id].trim();
            let dictadoFinal = '';

            rec.onresult = (e: SpeechEventLike) => {
                let transcripcion = '';
                for (let i = e.resultIndex; i < e.results.length; i += 1) {
                    transcripcion += e.results[i][0].transcript;
                }
                dictadoFinal = transcripcion.trim();
                setCampo(id, textoBase ? `${textoBase} ${dictadoFinal}` : dictadoFinal);
            };
            rec.onerror = () => {
                if (!montadoRef.current) return;
                setCampoInterno(null);
                recRef.current = null;
            };
            rec.onend = () => {
                if (!montadoRef.current) return;
                setCampoInterno((actual) => (actual === id ? null : actual));
                recRef.current = null;
                if (dictadoFinal) speakText(`Registrado: ${dictadoFinal}`);
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
        [campoInterno, detenerDictadoInterno, iniciarDictadoExternal, setCampo, speakText]
    );

    /* ----- Motivos ---------------------------------------------------------- */
    const toggleMotivo = (m: MotivoItem) => {
        const yaEsta = motivosSeleccionados.includes(m.id);
        setMotivosSeleccionados((prev) => (yaEsta ? prev.filter((x) => x !== m.id) : [...prev, m.id]));
        setErrores((prev) => ({ ...prev, motivos: false }));
        speakText(yaEsta ? `Desmarcado: ${m.voz}` : `Seleccionado: ${m.voz}`);
    };

    /* ----- Envío al backend (Axios → Render / PostgreSQL) ------------------- */
    const enfocar = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus({ preventScroll: true });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting || enviado) return;
        setErrorServidor(null);

        const nuevos: ErroresForm = {};
        CAMPOS_OBLIGATORIOS.forEach((id) => {
            if (!datos[id].trim()) nuevos[id] = true;
        });
        if (motivosSeleccionados.length === 0) nuevos.motivos = true;
        setErrores(nuevos);

        const primerFaltante = CAMPOS_OBLIGATORIOS.find((id) => nuevos[id]);
        if (primerFaltante) {
            speakText(AVISOS_FALTANTES[primerFaltante] ?? 'Falta un dato obligatorio.');
            enfocar(`pt-${primerFaltante}`);
            return;
        }
        if (nuevos.motivos) {
            speakText('Toque al menos un motivo de la referencia.');
            enfocar('pt-motivos');
            return;
        }

        detenerDictadoInterno();
        setIsSubmitting(true);
        speakText('Enviando la hoja de referencia.');

        const payloadReferencia: PayloadReferencia = {
            parteraId: localStorage.getItem('partera_id') || 'DEFAULT-PARTERA-UUID',
            centroSalud: datos.centroSalud,
            nombreUsuaria: datos.nombreUsuaria,
            edad: Number(datos.edad) || 0,
            sexo: datos.sexo,
            fecha: datos.fecha,
            localidad: datos.localidad,
            municipio: datos.municipio,
            nombrePartera: datos.nombrePartera,
            localidadPartera: datos.localidadPartera,
            motivos: motivosSeleccionados,
            contrareferencia: {
                activa: mostrarContrareferencia,
                estadoContra,
                diagnostico: datos.diagnostico,
                tratamiento: datos.tratamiento,
                observacionesMedico: datos.observacionesMedico,
                nombreMedico: datos.nombreMedico,
                centroMedico: datos.centroMedico,
            },
        };

        try {
            // CORREGIDO: Se cambia '/api/v1/referencias' por '/referencias' para evitar duplicación con el baseURL de http.ts
            await http.post('/referencias', payloadReferencia);
            if (!montadoRef.current) return;

            setEnviado(true);
            speakText('Hoja de referencia enviada y guardada con éxito.');
            temporizadorRef.current = window.setTimeout(() => {
                if (montadoRef.current && onSuccess) onSuccess();
            }, 2600);
        } catch (err: unknown) {
            console.error('Error al enviar la hoja de referencia:', err);
            const mensaje =
                (axios.isAxiosError<ErrorServidor>(err) ? err.response?.data?.message : undefined) ??
                'No se pudo conectar con el servidor para guardar la referencia. Revise su señal e intente de nuevo.';
            if (montadoRef.current) {
                setErrorServidor(mensaje);
                speakText('No se pudo enviar la hoja. Revise su señal e intente de nuevo.');
            }
        } finally {
            if (montadoRef.current) setIsSubmitting(false);
        }
    };

    /* ----- Helper de campo -------------------------------------------------- */
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

    const totalMotivos = motivosSeleccionados.length;

    /* ------------------------------ Render ---------------------------------- */
    return (
        <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-5">
            <style>{ESTILOS}</style>

            {/* ================= Datos de identificación (2 columnas) ========= */}
            <section className={`pt-slide-up p-4 sm:p-6 ${VIDRIO}`} style={{ animationDelay: '.05s' }}>
                <h2 className="mb-5 border-b-4 border-[#D69A1E]/60 pb-2 text-xl font-black text-stone-900 sm:text-2xl">
                    Datos de identificación y canalización
                </h2>

                <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
                    {campo('centroSalud', 'Centro de salud u hospital', 'Hospital o centro de salud…')}
                    {campo('nombreUsuaria', 'Nombre de la usuaria', 'Nombre completo de la paciente…')}

                    {campo('edad', 'Edad', 'Ej. 26', { inputMode: 'numeric', maxLength: 3 })}
                    <div>
                        <label htmlFor="pt-sexo" className={CLASE_ETIQUETA}>
                            Sexo
                        </label>
                        <select
                            id="pt-sexo"
                            value={datos.sexo}
                            onChange={(e) => setDatos((p) => ({ ...p, sexo: e.target.value === 'M' ? 'M' : 'F' }))}
                            className={CLASE_SELECTOR}
                        >
                            <option value="F">Femenino</option>
                            <option value="M">Masculino</option>
                        </select>
                    </div>

                    {campo('localidad', 'Localidad', 'Localidad…')}
                    {campo('municipio', 'Municipio', 'Municipio…')}

                    {campo('nombrePartera', 'Nombre de la partera', 'Partera tradicional…')}
                    {campo('localidadPartera', 'Localidad de la partera', 'Localidad de la partera…')}

                    <div className="md:col-span-2">
                        <label htmlFor="pt-fecha" className={CLASE_ETIQUETA}>
                            Fecha de la referencia
                        </label>
                        <input
                            id="pt-fecha"
                            type="date"
                            value={datos.fecha}
                            onChange={(e) => setDatos((p) => ({ ...p, fecha: e.target.value }))}
                            className={CLASE_SELECTOR}
                        />
                    </div>
                </div>
            </section>

            {/* ================== Motivo de la referencia ================= */}
            <section
                id="pt-motivos"
                className={`pt-slide-up p-4 sm:p-6 ${VIDRIO} ${errores.motivos ? 'pt-shake ring-4 ring-red-400/60' : ''}`}
                style={{ animationDelay: '.1s' }}
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

                {/* Cuadrícula simétrica: 2 / 3 / 4 columnas; la última fila queda centrada */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                    {LISTA_MOTIVOS.map((m, i) => {
                        const activo = motivosSeleccionados.includes(m.id);
                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => toggleMotivo(m)}
                                aria-pressed={activo}
                                style={{ animationDelay: `${0.12 + i * 0.03}s` }}
                                className={`pt-fade-in relative flex min-h-[220px] w-[calc(50%-0.375rem)] flex-col items-center justify-between gap-2 rounded-3xl border-4 p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)] ${activo
                                    ? '-translate-y-1 border-[#C2603A] bg-gradient-to-b from-orange-50 to-amber-100 shadow-xl shadow-orange-900/25'
                                    : 'border-stone-200 bg-gradient-to-b from-white to-amber-50/70 shadow-md'
                                    }`}
                            >
                                {activo && (
                                    <span className="pt-pop-in absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-lg shadow-emerald-700/40">
                                        <IconoCheck className="h-6 w-6" />
                                    </span>
                                )}
                                <span className="flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-inner ring-1 ring-amber-200/70">
                                    <Ilustracion motivo={m} />
                                </span>
                                <span className="flex flex-1 flex-col items-center justify-center gap-1">
                                    <span className="text-sm font-black uppercase leading-tight text-stone-900">{m.titulo}</span>
                                    {m.bullets && (
                                        <span className="text-xs font-bold leading-snug text-stone-700">{m.bullets.join(' · ')}</span>
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ================= Contrarreferencia médica ================= */}
            <section className={`pt-slide-up overflow-hidden ${VIDRIO}`} style={{ animationDelay: '.15s' }}>
                <div className="h-1.5 w-full bg-gradient-to-r from-[#5E8C61] via-[#D69A1E] to-[#C2603A]" />

                <button
                    type="button"
                    onClick={() => {
                        setMostrarContrareferencia((v) => !v);
                        speakText(mostrarContrareferencia ? 'Sección del médico oculta.' : 'Sección del médico tratante abierta.');
                    }}
                    aria-expanded={mostrarContrareferencia}
                    aria-controls="pt-contrarreferencia"
                    className="flex w-full items-center gap-4 p-4 text-left transition-colors duration-200 hover:bg-amber-50/60 sm:p-6"
                >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5E8C61] to-[#3F7048] text-white shadow-lg shadow-emerald-900/25">
                        <IconoEstetoscopio />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-xl font-black text-stone-900 sm:text-2xl">Contrarreferencia médica</span>
                        <span className="block text-sm font-bold text-stone-700">
                            Respuesta oficial del centro de salud a la partera
                        </span>
                    </span>
                    <span className="hidden rounded-2xl border-2 border-[#5E8C61]/60 bg-emerald-50 px-4 py-2 text-sm font-black text-stone-900 sm:block">
                        {mostrarContrareferencia ? 'Ocultar' : 'Abrir sección del médico'}
                    </span>
                    <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-stone-900 transition-transform duration-300 ${mostrarContrareferencia ? 'rotate-180' : ''
                            }`}
                    >
                        <IconoChevron />
                    </span>
                </button>

                {mostrarContrareferencia && (
                    <div
                        id="pt-contrarreferencia"
                        className="pt-slide-up flex flex-col gap-5 border-t-2 border-amber-200 p-4 sm:p-6"
                    >
                        <div>
                            <p className={CLASE_ETIQUETA}>Resultado de la atención</p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEstadoContra('CONTROLADA');
                                        speakText('Paciente controlada, dada de alta.');
                                    }}
                                    aria-pressed={estadoContra === 'CONTROLADA'}
                                    className={`flex min-h-[72px] items-center justify-center gap-3 rounded-2xl border-4 px-4 text-base font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${estadoContra === 'CONTROLADA'
                                        ? 'border-emerald-700 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-900/30'
                                        : 'border-stone-200 bg-white text-stone-900 hover:border-emerald-500'
                                        }`}
                                >
                                    {estadoContra === 'CONTROLADA' && <IconoCheck />}
                                    Paciente controlada / Alta
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEstadoContra('PARA_CONTROL_PARTERA');
                                        speakText('La paciente regresa a control con la partera.');
                                    }}
                                    aria-pressed={estadoContra === 'PARA_CONTROL_PARTERA'}
                                    className={`flex min-h-[72px] items-center justify-center gap-3 rounded-2xl border-4 px-4 text-base font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${estadoContra === 'PARA_CONTROL_PARTERA'
                                        ? 'border-[#9A6A0F] bg-gradient-to-br from-[#E3AE3A] to-[#D69A1E] text-stone-900 shadow-lg shadow-amber-900/30'
                                        : 'border-stone-200 bg-white text-stone-900 hover:border-[#D69A1E]'
                                        }`}
                                >
                                    {estadoContra === 'PARA_CONTROL_PARTERA' ? <IconoCheck /> : <IconoPersona />}
                                    Regresa para control con la partera
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
                            {campo('diagnostico', 'Diagnóstico del médico', 'Diagnóstico…', {
                                multilinea: true,
                                className: 'md:col-span-2',
                            })}
                            {campo('tratamiento', 'Tratamiento indicado', 'Tratamiento…', { multilinea: true })}
                            {campo('observacionesMedico', 'Indicaciones a la partera', 'Indicaciones…', { multilinea: true })}
                            {campo('nombreMedico', 'Nombre del médico tratante', 'Dr. o Dra.…')}
                            {campo('centroMedico', 'Unidad médica / hospital', 'Hospital o centro de salud…')}
                        </div>
                    </div>
                )}
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
                disabled={isSubmitting || enviado}
                className={`pt-slide-up flex min-h-[88px] w-full items-center justify-center gap-4 rounded-3xl px-6 py-5 text-xl font-black disabled:cursor-wait disabled:opacity-80 sm:text-2xl ${BOTON_TIERRA} ${totalMotivos > 0 && !isSubmitting ? 'pt-breathe' : ''
                    }`}
                style={{ animationDelay: '.2s' }}
            >
                {isSubmitting ? <IconoCargando /> : <IconoEnviar />}
                <span>{isSubmitting ? 'Enviando referencia…' : 'Enviar hoja de referencia al centro de salud'}</span>
            </button>

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
                            La referencia de {datos.nombreUsuaria || 'la usuaria'} quedó guardada y llegó al centro de salud.
                        </p>
                        <p className="mt-3 text-sm font-bold text-stone-600">Regresando al menú…</p>
                    </div>
                </div>
            )}
        </form>
    );
};

export default MotivoReferencia;