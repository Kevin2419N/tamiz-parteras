import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
    AlertCircle,
    Building2,
    Camera,
    CameraOff,
    CheckCircle2,
    ChevronDown,
    Delete,
    Eye,
    EyeOff,
    HeartHandshake,
    Info,
    KeyRound,
    Loader2,
    Lock,
    LogIn,
    Mail,
    QrCode,
    RotateCcw,
    UserCheck,
    Volume2,
    VolumeX,
} from 'lucide-react';
import jsQR from 'jsqr';
import { useAuth } from '../../context/AuthContext';
import { http } from '../../services/http';
import { UserRole } from '../../types';
import type { User } from '../../types';

/* ═══════════════════════════════════════════════════════════════
   Constantes y tipos
   ═══════════════════════════════════════════════════════════════ */

const TOKEN_KEY = 'token_sso_parteras';
const REMEMBER_KEY = 'tamiz_remember_email';
const PIN_LENGTH = 4;
const SUPPORT_PHONE = '800 123 4567';

type AccessMode = 'institucional' | 'partera';
type PinMethod = 'pin' | 'qr';
type NoticeKind = 'error' | 'info';
type ScanState = 'idle' | 'starting' | 'scanning' | 'verifying' | 'success' | 'denied';

interface LoginResponse {
    token: string;
    user: User;
}
interface Notice {
    id: number;
    kind: NoticeKind;
    text: string;
}
interface ApiErrorBody {
    message?: string;
}

const MODES: ReadonlyArray<{ id: AccessMode; label: string; Icon: typeof Building2 }> = [
    { id: 'institucional', label: 'Personal institucional', Icon: Building2 },
    { id: 'partera', label: 'Partera tradicional', Icon: HeartHandshake },
];

const MODE_COPY: Record<AccessMode, { title: string; text: string }> = {
    institucional: {
        title: 'Control operativo del tamiz',
        text: 'Captura de muestras, seguimiento de resultados y contrarreferencias para el personal autorizado de la jurisdicción.',
    },
    partera: {
        title: 'Red de partería tradicional',
        text: 'Registro de atenciones, calendario y referencias obstétricas desde la comunidad, con apoyo de voz.',
    },
};

const ROLE_OPTIONS: ReadonlyArray<{ value: UserRole; label: string }> = [
    { value: UserRole.CAPTURISTA_TAMIZ, label: 'Capturista de tamiz neonatal' },
    { value: UserRole.MEDICO_UNIDAD, label: 'Médico de unidad y contrarreferencias' },
    { value: UserRole.ADMIN_JURISDICCIONAL, label: 'Administrador jurisdiccional' },
];

const VOICE_TEXT: Record<PinMethod, string> = {
    pin: 'Escriba su PIN de cuatro números tocando el teclado de la pantalla.',
    qr: 'Acerque su credencial con código QR a la cámara y espere.',
};

/* Clases compartidas */
const ACCENT = 'bg-gradient-to-r from-sky-600 to-blue-700';
const FOCUS =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900';
const SLIDE = 'ease-[cubic-bezier(0.65,0,0.35,1)]';
const LABEL = 'mb-1 block text-xs font-medium text-sky-50';
const INPUT =
    'min-h-11 w-full rounded-xl border border-white/20 bg-white/10 pl-10 text-base text-white placeholder:text-white/50 transition-colors focus:border-sky-300 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-sky-300/40 disabled:opacity-60';
const FIELD_ICON = 'pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-sky-200/80';
const PRIMARY = `group relative flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl ${ACCENT} px-5 text-base font-semibold text-white shadow-lg shadow-sky-950/40 transition duration-150 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${FOCUS}`;
const KEY = `min-h-12 rounded-2xl border border-white/15 bg-white/10 text-2xl font-semibold text-white transition duration-100 hover:bg-white/20 active:scale-95 active:bg-sky-500/40 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`;
const PILL_TRACK = 'relative grid grid-cols-2 rounded-2xl border border-white/15 bg-black/25 p-1';

const LOGIN_CSS = `
@keyframes lgFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes lgShake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-7px)}40%,60%{transform:translateX(7px)}}
@keyframes lgCard{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:none}}
@keyframes lgLaser{from{top:4%}to{top:96%}}
@keyframes lgPop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:none}}
.lg-fade{animation:lgFade .35s cubic-bezier(0.16, 1, 0.3, 1) both}
.lg-shake{animation:lgShake .4s cubic-bezier(.36,.07,.19,.97) both}
.lg-card{animation:lgCard .6s cubic-bezier(.22,1,.36,1) both}
.lg-laser{animation:lgLaser 2s ease-in-out infinite alternate}
.lg-pop{animation:lgPop .3s cubic-bezier(.34,1.56,.64,1) both}
.lg-quiet{scrollbar-width:none}
.lg-quiet::-webkit-scrollbar{display:none}
@media (prefers-reduced-motion:reduce){.lg-fade,.lg-shake,.lg-card,.lg-laser,.lg-pop{animation:none}}
`;

function getErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError<ApiErrorBody>(error)) {
        if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder.';
        if (!error.response) return 'No hay conexión con el servidor. Revisa tu internet.';
        return error.response.data?.message ?? fallback;
    }
    return fallback;
}

function readRememberedEmail(): string {
    try {
        return localStorage.getItem(REMEMBER_KEY) ?? '';
    } catch {
        return '';
    }
}

function writeRememberedEmail(email: string | null): void {
    try {
        if (email) localStorage.setItem(REMEMBER_KEY, email);
        else localStorage.removeItem(REMEMBER_KEY);
    } catch {}
}

function StatusSlot({ notice }: { notice: Notice | null }) {
    const isError = notice?.kind === 'error';
    const Icon = isError ? AlertCircle : Info;
    return (
        <div className="mb-2 h-10 shrink-0" aria-live="polite">
            {notice && (
                <div
                    key={notice.id}
                    role={isError ? 'alert' : 'status'}
                    className={`flex h-full items-center gap-2 rounded-xl border px-3 text-xs leading-tight backdrop-blur-sm ${
                        isError ? 'lg-shake border-rose-300/40 bg-rose-500/20 text-rose-50' : 'lg-fade border-sky-300/40 bg-sky-400/20 text-sky-50'
                    }`}
                >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="line-clamp-2">{notice.text}</span>
                </div>
            )}
        </div>
    );
}

interface InstitutionalFormProps {
    busy: boolean;
    onSubmit: (email: string, password: string, rol: UserRole) => Promise<boolean>;
    onForgotPassword: () => void;
}

function InstitutionalForm({ busy, onSubmit, onForgotPassword }: InstitutionalFormProps) {
    const [email, setEmail] = useState<string>(readRememberedEmail);
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState<UserRole>(UserRole.CAPTURISTA_TAMIZ);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState<boolean>(() => readRememberedEmail() !== '');
    const passwordRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (busy) return;
        const cleanEmail = email.trim();
        writeRememberedEmail(remember ? cleanEmail : null);
        const ok = await onSubmit(cleanEmail, password, rol);
        if (!ok) {
            setPassword('');
            passwordRef.current?.focus();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex h-full flex-col justify-center gap-3">
            <div>
                <label htmlFor="login-rol" className={LABEL}>Perfil de acceso</label>
                <div className="relative">
                    <UserCheck className={FIELD_ICON} aria-hidden="true" />
                    <select
                        id="login-rol"
                        value={rol}
                        disabled={busy}
                        onChange={(event) => setRol(event.target.value as UserRole)}
                        className={`${INPUT} cursor-pointer appearance-none pr-9`}
                    >
                        {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value} className="bg-slate-900 text-white">
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-sky-200/80" aria-hidden="true" />
                </div>
            </div>

            <div>
                <label htmlFor="login-email" className={LABEL}>Correo institucional</label>
                <div className="relative">
                    <Mail className={FIELD_ICON} aria-hidden="true" />
                    <input
                        id="login-email"
                        type="email"
                        required
                        autoComplete="username"
                        inputMode="email"
                        placeholder="nombre@salud.gob.mx"
                        value={email}
                        disabled={busy}
                        onChange={(event) => setEmail(event.target.value)}
                        className={`${INPUT} pr-3`}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="login-password" className={LABEL}>Contraseña</label>
                <div className="relative">
                    <Lock className={FIELD_ICON} aria-hidden="true" />
                    <input
                        id="login-password"
                        ref={passwordRef}
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        placeholder="Tu contraseña"
                        value={password}
                        disabled={busy}
                        onChange={(event) => setPassword(event.target.value)}
                        className={`${INPUT} pr-11`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className={`absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-sky-100/80 transition hover:bg-white/10 hover:text-white ${FOCUS}`}
                    >
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                <label className="flex cursor-pointer select-none items-center gap-2 text-sky-50">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(event) => setRemember(event.target.checked)}
                        className="size-4 cursor-pointer rounded accent-sky-500"
                    />
                    Recordar equipo
                </label>
                <button
                    type="button"
                    onClick={onForgotPassword}
                    className={`rounded text-sky-200 underline-offset-4 transition-colors hover:text-white hover:underline ${FOCUS}`}
                >
                    ¿Olvidaste tu contraseña?
                </button>
            </div>

            <button type="submit" disabled={busy} className={PRIMARY}>
                {busy ? (
                    <>
                        <Loader2 className="size-5 animate-spin" />
                        <span>Verificando…</span>
                    </>
                ) : (
                    <>
                        <LogIn className="size-5" />
                        <span>Iniciar sesión</span>
                    </>
                )}
            </button>
        </form>
    );
}

interface QrViewfinderProps {
    onDetect: (code: string) => Promise<boolean>;
    onUsePin: () => void;
}

function QrViewfinder({ onDetect, onUsePin }: QrViewfinderProps) {
    const [state, setState] = useState<ScanState>('idle');
    const [rejected, setRejected] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<number | null>(null);
    const onDetectRef = useRef(onDetect);

    useEffect(() => {
        onDetectRef.current = onDetect;
    }, [onDetect]);

    const stopCamera = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    }, []);

    useEffect(() => stopCamera, [stopCamera]);

    const startScanningLoop = useCallback(() => {
        if (timerRef.current !== null) window.clearInterval(timerRef.current);
        
        timerRef.current = window.setInterval(() => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code?.data) {
                if (timerRef.current !== null) window.clearInterval(timerRef.current);
                setState('verifying');
                void onDetectRef.current(code.data).then((ok) => {
                    if (ok) {
                        setState('success');
                        stopCamera();
                    } else {
                        setRejected(true);
                        setTimeout(() => {
                            setRejected(false);
                            setState('scanning');
                            startScanningLoop();
                        }, 1200);
                    }
                });
            }
        }, 150);
    }, [stopCamera]);

    const startCamera = async () => {
        setState('starting');
        setRejected(false);

        if (!navigator.mediaDevices?.getUserMedia) {
            setState('denied');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false,
            });
            streamRef.current = stream;
            const video = videoRef.current;
            if (!video) {
                stopCamera();
                setState('denied');
                return;
            }
            video.srcObject = stream;
            await video.play();
            setState('scanning');
            startScanningLoop();
        } catch {
            stopCamera();
            setState('denied');
        }
    };

    const live = state === 'scanning' || state === 'verifying' || state === 'success';
    const frame = state === 'success' ? 'border-emerald-300' : rejected ? 'border-rose-300' : 'border-sky-300';

    return (
        <div className="flex flex-col gap-2">
            <div className="relative mx-auto size-44 overflow-hidden rounded-3xl border border-white/20 bg-slate-950/70 shadow-inner sm:size-48">
                <video
                    ref={videoRef}
                    muted
                    playsInline
                    aria-label="Vista de la cámara"
                    className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${live ? 'opacity-100' : 'opacity-0'}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {!live && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900/60 to-sky-950/60">
                        {state === 'denied' ? (
                            <CameraOff className="size-11 text-sky-200/60" aria-hidden="true" />
                        ) : (
                            <QrCode className="size-12 text-sky-200/40" aria-hidden="true" />
                        )}
                    </div>
                )}

                <div className="pointer-events-none absolute inset-5" aria-hidden="true">
                    <span className={`absolute left-0 top-0 size-7 rounded-tl-xl border-l-4 border-t-4 transition-colors duration-300 ${frame}`} />
                    <span className={`absolute right-0 top-0 size-7 rounded-tr-xl border-r-4 border-t-4 transition-colors duration-300 ${frame}`} />
                    <span className={`absolute bottom-0 left-0 size-7 rounded-bl-xl border-b-4 border-l-4 transition-colors duration-300 ${frame}`} />
                    <span className={`absolute bottom-0 right-0 size-7 rounded-br-xl border-b-4 border-r-4 transition-colors duration-300 ${frame}`} />
                    {state === 'scanning' && !rejected && (
                        <span className="lg-laser absolute inset-x-1 top-0 h-0.5 rounded-full bg-sky-300 shadow-[0_0_14px_3px_rgba(125,211,252,0.85)] motion-reduce:hidden" />
                    )}
                </div>

                {(state === 'starting' || state === 'verifying') && (
                    <div className="lg-fade absolute inset-0 flex items-center justify-center bg-slate-950/60">
                        <Loader2 className="size-9 animate-spin text-sky-200" aria-hidden="true" />
                    </div>
                )}

                {state === 'success' && (
                    <div className="lg-fade absolute inset-0 flex flex-col items-center justify-center gap-2 bg-emerald-950/80 text-emerald-100">
                        <CheckCircle2 className="lg-pop size-12 text-emerald-300" aria-hidden="true" />
                        <span className="text-sm font-medium">Credencial reconocida</span>
                    </div>
                )}
            </div>

            <p className="flex min-h-10 items-center justify-center text-center text-xs leading-snug text-sky-100/80 sm:text-sm" aria-live="polite">
                {state === 'idle' && 'Activa la cámara y acerca tu credencial con código QR.'}
                {state === 'starting' && 'Abriendo la cámara…'}
                {state === 'scanning' && !rejected && 'Centra el código QR de la partera dentro del marco.'}
                {state === 'scanning' && rejected && 'Código no registrado. Prueba de nuevo.'}
                {state === 'verifying' && 'Verificando credencial…'}
                {state === 'success' && 'Entrando al sistema…'}
                {state === 'denied' && 'No se pudo abrir la cámara. Revisa permisos o usa tu PIN.'}
            </p>

            <div className="min-h-12">
                {(state === 'idle' || state === 'denied' || state === 'starting') && (
                    <div className="flex gap-2">
                        {state === 'denied' && (
                            <button
                                type="button"
                                onClick={startCamera}
                                className={`min-h-12 flex-1 rounded-xl border border-white/25 bg-white/10 px-3 text-sm font-medium transition hover:bg-white/20 ${FOCUS}`}
                            >
                                Reintentar
                            </button>
                        )}
                        <button type="button" onClick={startCamera} disabled={state === 'starting'} className={`${PRIMARY} flex-1`}>
                            <Camera className="size-5" />
                            <span>{state === 'starting' ? 'Abriendo...' : 'Activar cámara'}</span>
                        </button>
                    </div>
                )}
                {state === 'scanning' && (
                    <button type="button" onClick={onUsePin} className={PRIMARY}>
                        <span>Usar mi PIN</span>
                    </button>
                )}
            </div>
        </div>
    );
}

interface MidwifeAccessProps {
    active: boolean;
    busy: boolean;
    onPin: (pin: string) => Promise<boolean>;
    onQr: (code: string) => Promise<boolean>;
}

function MidwifeAccess({ active, busy, onPin, onQr }: MidwifeAccessProps) {
    const [method, setMethod] = useState<PinMethod>('pin');
    const [digits, setDigits] = useState('');
    const [shakeKey, setShakeKey] = useState(0);
    const [speaking, setSpeaking] = useState(false);
    const busyRef = useRef(busy);
    const digitsRef = useRef('');

    useEffect(() => {
        busyRef.current = busy;
    }, [busy]);

    const updateDigits = useCallback((value: string) => {
        digitsRef.current = value;
        setDigits(value);
    }, []);

    const stopVoice = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setSpeaking(false);
    }, []);

    const toggleVoice = () => {
        if (speaking) {
            stopVoice();
            return;
        }
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(VOICE_TEXT[method]);
        utterance.lang = 'es-MX';
        utterance.rate = 1.0;
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => stopVoice, [stopVoice]);

    useEffect(() => {
        if (!active) {
            updateDigits('');
            stopVoice();
        }
    }, [active, stopVoice, updateDigits]);

    const submitPin = useCallback(
        async (pin: string) => {
            const ok = await onPin(pin);
            if (!ok) {
                setShakeKey((k) => k + 1);
                updateDigits('');
                if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                    navigator.vibrate(100);
                }
            }
        },
        [onPin, updateDigits],
    );

    const pressDigit = useCallback(
        (digit: string) => {
            if (busyRef.current || digitsRef.current.length >= PIN_LENGTH) return;
            const next = digitsRef.current + digit;
            updateDigits(next);
            if (next.length === PIN_LENGTH) {
                void submitPin(next);
            }
        },
        [submitPin, updateDigits],
    );

    const deleteLast = useCallback(() => {
        if (!busyRef.current) updateDigits(digitsRef.current.slice(0, -1));
    }, [updateDigits]);

    const clearAll = useCallback(() => {
        if (!busyRef.current) updateDigits('');
    }, [updateDigits]);

    useEffect(() => {
        if (!active || method !== 'pin') return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            if (/^\d$/.test(event.key)) pressDigit(event.key);
            else if (event.key === 'Backspace') deleteLast();
            else if (event.key === 'Escape') clearAll();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [active, method, pressDigit, deleteLast, clearAll]);

    const changeMethod = (next: PinMethod) => {
        if (next === method) return;
        stopVoice();
        updateDigits('');
        setMethod(next);
    };

    return (
        <div className="flex h-full flex-col gap-3">
            <div className="flex items-center gap-2">
                <div role="group" aria-label="Forma de acceso" className={`${PILL_TRACK} flex-1`}>
                    <span
                        aria-hidden="true"
                        className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl ${ACCENT} shadow-md transition-transform duration-300 ease-out ${
                            method === 'pin' ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    />
                    {(
                        [
                            { id: 'pin', label: 'Escribir PIN', Icon: KeyRound },
                            { id: 'qr', label: 'Escanear QR', Icon: QrCode },
                        ] as const
                    ).map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            type="button"
                            aria-pressed={method === id}
                            onClick={() => changeMethod(id)}
                            className={`relative z-10 flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-1 text-sm font-medium transition-colors ${FOCUS} ${
                                method === id ? 'text-white' : 'text-sky-100/70 hover:text-white'
                            }`}
                        >
                            <Icon className="size-4 shrink-0" aria-hidden="true" />
                            <span className="truncate">{label}</span>
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={toggleVoice}
                    aria-pressed={speaking}
                    aria-label={speaking ? 'Detener la voz' : 'Escuchar instrucciones'}
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/25 text-sky-100 transition hover:bg-white/10 hover:text-white active:scale-90 ${FOCUS} ${
                        speaking ? 'bg-sky-500/30' : ''
                    }`}
                >
                    {speaking ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                </button>
            </div>

            <div key={method} className="lg-fade flex min-h-0 flex-1 flex-col justify-center">
                {method === 'pin' ? (
                    <div className="flex flex-col gap-3">
                        <div
                            key={shakeKey}
                            role="img"
                            aria-label={`${digits.length} de ${PIN_LENGTH} dígitos ingresados`}
                            className={`flex justify-center gap-4 ${shakeKey > 0 ? 'lg-shake' : ''}`}
                        >
                            {Array.from({ length: PIN_LENGTH }, (_, index) => (
                                <span
                                    key={index}
                                    className={`size-5 rounded-full border-2 transition-all duration-150 ${
                                        index < digits.length
                                            ? 'scale-110 border-sky-300 bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.7)]'
                                            : 'border-white/40 bg-transparent'
                                    }`}
                                />
                            ))}
                        </div>

                        <p className="flex h-5 items-center justify-center gap-2 text-sm text-sky-100/80" aria-live="polite">
                            {busy ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Verificando PIN…
                                </>
                            ) : (
                                'Toca los números para escribir tu PIN'
                            )}
                        </p>

                        <div className="mx-auto grid w-full max-w-64 grid-cols-3 gap-2">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                                <button key={digit} type="button" disabled={busy} onClick={() => pressDigit(digit)} className={KEY}>
                                    {digit}
                                </button>
                            ))}
                            <button type="button" disabled={busy} onClick={clearAll} aria-label="Borrar todo" className={`${KEY} flex items-center justify-center text-sky-100`}>
                                <RotateCcw className="size-5" />
                            </button>
                            <button type="button" disabled={busy} onClick={() => pressDigit('0')} className={KEY}>
                                0
                            </button>
                            <button type="button" disabled={busy} onClick={deleteLast} aria-label="Borrar último" className={`${KEY} flex items-center justify-center text-sky-100`}>
                                <Delete className="size-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    active && <QrViewfinder onDetect={onQr} onUsePin={() => changeMethod('pin')} />
                )}
            </div>
        </div>
    );
}

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const baseId = useId();

    const [mode, setMode] = useState<AccessMode>('institucional');
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<Notice | null>(null);

    const isInstitutional = mode === 'institucional';
    const tabId = (id: AccessMode) => `${baseId}-tab-${id}`;
    const panelId = (id: AccessMode) => `${baseId}-panel-${id}`;

    const showNotice = useCallback((kind: NoticeKind, text: string) => {
        setNotice({ id: Date.now(), kind, text });
    }, []);

    const switchMode = (next: AccessMode) => {
        if (next === mode || busy) return;
        setNotice(null);
        setMode(next);
    };

    const handleTabKeys = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        const index = MODES.findIndex((item) => item.id === mode);
        let target: number | null = null;
        if (event.key === 'ArrowRight') target = (index + 1) % MODES.length;
        else if (event.key === 'ArrowLeft') target = (index - 1 + MODES.length) % MODES.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = MODES.length - 1;
        if (target === null) return;
        event.preventDefault();
        const next = MODES[target].id;
        switchMode(next);
        document.getElementById(tabId(next))?.focus();
    };

    const authenticate = useCallback(
        async (request: () => Promise<LoginResponse>, fallbackError: string): Promise<boolean> => {
            setBusy(true);
            setNotice(null);
            try {
                const { token, user } = await request();
                localStorage.setItem(TOKEN_KEY, token);
                login(user);
                navigate('/dashboard', { replace: true });
                return true;
            } catch (error) {
                showNotice('error', getErrorMessage(error, fallbackError));
                return false;
            } finally {
                setBusy(false);
            }
        },
        [login, navigate, showNotice],
    );

    const handleInstitutional = useCallback(
        (email: string, password: string, rol: UserRole) =>
            authenticate(
                async () => (await http.post<LoginResponse>('/auth/login-institucional', { email, password, rol })).data,
                'Correo o contraseña incorrectos.',
            ),
        [authenticate],
    );

    const handlePin = useCallback(
        (pin: string) =>
            authenticate(async () => (await http.post<LoginResponse>('/v1/parteras/login-pin', { pin })).data, 'PIN incorrecto o no registrado.'),
        [authenticate],
    );

    const handleQr = useCallback(
        (code: string) =>
            authenticate(
                async () => (await http.post<LoginResponse>('/v1/parteras/login-pin', { pin: code })).data,
                'Código QR no reconocido en el sistema.',
            ),
        [authenticate],
    );

    const handleForgotPassword = useCallback(() => {
        showNotice('info', 'Para restablecer tu contraseña, solicita apoyo al administrador jurisdiccional.');
    }, [showNotice]);

    return (
        <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden p-3 text-white selection:bg-sky-400/40 sm:p-6">
            <style>{LOGIN_CSS}</style>

            <div aria-hidden="true" className="fixed inset-0 -z-10 bg-slate-950">
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/fondo-login.png')" }} />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-sky-950/80 to-slate-900/90" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.14),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(2,6,23,0.55))]" />
            </div>

            <div className="flex w-full max-w-md flex-col items-center md:max-w-4xl">
                {/* Contenedor principal con transición ultra fluida en espejo */}
                <div
                    className={`lg-card flex h-[min(36rem,calc(100dvh-6rem))] w-full flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                        isInstitutional ? '' : 'md:[direction:rtl]'
                    }`}
                >
                    {/* ── Panel lateral (marca / información) ── */}
                    <aside className={`relative shrink-0 overflow-hidden border-b border-white/15 p-3.5 sm:p-4 md:border-b-0 md:p-8 transition-all duration-700 ${!isInstitutional ? 'md:[direction:ltr]' : ''}`}>
                        <div
                            aria-hidden="true"
                            className={`absolute inset-0 bg-gradient-to-br from-blue-600/35 via-sky-500/10 to-transparent transition-opacity duration-700 ${
                                isInstitutional ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                        <div
                            aria-hidden="true"
                            className={`absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-sky-400/10 to-transparent transition-opacity duration-700 ${
                                isInstitutional ? 'opacity-0' : 'opacity-100'
                            }`}
                        />

                        <div className="relative flex items-center gap-2.5 md:hidden">
                            <img
                                src="/logo-jurisdiccion.png"
                                alt="Jurisdicción Sanitaria No. 2 Istmo"
                                className="size-10 shrink-0 rounded-full bg-white object-cover shadow-md ring-2 ring-white/40"
                            />
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate text-sm font-semibold leading-tight">Jurisdicción Sanitaria No. 2</h1>
                                <p className="truncate text-[11px] text-sky-100/80">Istmo, Servicios de Salud de Oaxaca</p>
                            </div>
                            <div className="flex h-9 shrink-0 items-center rounded-lg bg-white/95 px-2 shadow-md">
                                <img src="/Logo-Secretaria.png" alt="Secretaría de Salud" className="h-4 w-auto" />
                            </div>
                        </div>

                        <div className="relative hidden h-full flex-col justify-between gap-5 md:flex">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/logo-jurisdiccion.png"
                                    alt="Jurisdicción Sanitaria No. 2 Istmo"
                                    className="size-16 shrink-0 rounded-full bg-white object-cover shadow-lg ring-2 ring-white/40"
                                />
                                <div className="flex h-14 items-center rounded-xl bg-white/95 px-3 shadow-lg">
                                    <img src="/Logo-Secretaria.png" alt="Secretaría de Salud" className="h-9 w-auto" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h1 className="text-2xl font-semibold leading-tight">Jurisdicción Sanitaria No. 2</h1>
                                <p className="text-sm text-sky-100/80">Istmo, Servicios de Salud de Oaxaca</p>
                            </div>

                            <div key={mode} className="lg-fade space-y-2">
                                <h2 className="text-lg font-medium">{MODE_COPY[mode].title}</h2>
                                <p className="text-sm leading-relaxed text-sky-100/80">{MODE_COPY[mode].text}</p>
                            </div>

                            <p className="text-xs text-sky-100/60">Sistema de gestión de tamiz neonatal y parteras tradicionales</p>
                        </div>
                    </aside>

                    {/* ── Panel de formularios ── */}
                    <section className={`flex min-h-0 flex-1 flex-col bg-slate-950/25 p-4 sm:p-6 md:border-l md:border-white/15 md:p-7 transition-all duration-700 ${!isInstitutional ? 'md:[direction:ltr] md:border-l-0 md:border-r' : ''}`}>
                        <div
                            role="tablist"
                            aria-label="Tipo de acceso"
                            onKeyDown={handleTabKeys}
                            className={`${PILL_TRACK} mb-3 shrink-0`}
                        >
                            <span
                                aria-hidden="true"
                                className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl ${ACCENT} shadow-lg shadow-sky-950/40 transition-transform duration-500 ${SLIDE} ${
                                    isInstitutional ? 'translate-x-0' : 'translate-x-full'
                                }`}
                            />
                            {MODES.map(({ id, label, Icon }) => {
                                const selected = id === mode;
                                return (
                                    <button
                                        key={id}
                                        id={tabId(id)}
                                        type="button"
                                        role="tab"
                                        aria-selected={selected}
                                        aria-controls={panelId(id)}
                                        tabIndex={selected ? 0 : -1}
                                        onClick={() => switchMode(id)}
                                        className={`relative z-10 flex min-h-10 items-center justify-center gap-2 rounded-xl px-2 text-sm font-medium transition-colors ${FOCUS} ${
                                            selected ? 'text-white' : 'text-sky-100/70 hover:text-white'
                                        }`}
                                    >
                                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                                        <span className="truncate">{label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <StatusSlot notice={notice} />

                        <div className="-m-1 min-h-0 flex-1 overflow-hidden p-1">
                            <div
                                className={`flex h-full w-[200%] transition-transform duration-500 ${SLIDE} ${
                                    isInstitutional ? 'translate-x-0' : '-translate-x-1/2'
                                }`}
                            >
                                <div
                                    id={panelId('institucional')}
                                    role="tabpanel"
                                    aria-labelledby={tabId('institucional')}
                                    inert={!isInstitutional}
                                    className={`lg-quiet h-full w-1/2 shrink-0 overflow-y-auto px-1 py-0.5 transition-opacity duration-300 ${
                                        isInstitutional ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    }`}
                                >
                                    <InstitutionalForm busy={busy} onSubmit={handleInstitutional} onForgotPassword={handleForgotPassword} />
                                </div>

                                <div
                                    id={panelId('partera')}
                                    role="tabpanel"
                                    aria-labelledby={tabId('partera')}
                                    inert={isInstitutional}
                                    className={`lg-quiet h-full w-1/2 shrink-0 overflow-y-auto px-1 py-0.5 transition-opacity duration-300 ${
                                        isInstitutional ? 'opacity-0 pointer-events-none' : 'opacity-100'
                                    }`}
                                >
                                    <MidwifeAccess active={!isInstitutional} busy={busy} onPin={handlePin} onQr={handleQr} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 text-center text-xs text-sky-100/70">
                    <span>Uso exclusivo de personal autorizado</span>
                    <a
                        href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}
                        className={`rounded underline-offset-4 hover:text-white hover:underline ${FOCUS}`}
                    >
                        Soporte: {SUPPORT_PHONE}
                    </a>
                </p>
            </div>
        </div>
    );
}

export default Login;