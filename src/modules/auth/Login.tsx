import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type {
    FormEvent,
    KeyboardEvent as ReactKeyboardEvent,
    PointerEvent as ReactPointerEvent,
    ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
    AlertTriangle,
    Baby,
    Building2,
    Camera,
    CameraOff,
    CheckCircle2,
    ChevronDown,
    Delete,
    Eye,
    EyeOff,
    HeartHandshake,
    HeartPulse,
    Info,
    KeyRound,
    Loader2,
    Lock,
    LogIn,
    Mail,
    QrCode,
    RotateCcw,
    ShieldCheck,
    UserCheck,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
const WELCOME_MS = 3400;
const NAME_KEYS = ['nombre', 'nombreCompleto', 'nombre_completo', 'name', 'fullName'] as const;
const TITLE_TOKENS = /^(dr|dra|lic|mtro|mtra|enf|ing|c)\.?$/i;

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
interface WelcomeState {
    user: User;
    name: string;
    audience: AccessMode;
}

const MODES: ReadonlyArray<{ id: AccessMode; label: string; Icon: LucideIcon }> = [
    { id: 'institucional', label: 'Personal institucional', Icon: Building2 },
    { id: 'partera', label: 'Partera tradicional', Icon: HeartHandshake },
];

const MODE_COPY: Record<AccessMode, { title: string; text: string; chips: ReadonlyArray<{ Icon: LucideIcon; label: string }> }> = {
    institucional: {
        title: 'Control operativo del tamiz',
        text: 'Captura de muestras, seguimiento de resultados y contrarreferencias para el personal autorizado de la jurisdicción.',
        chips: [
            { Icon: Baby, label: 'Tamiz neonatal' },
            { Icon: ShieldCheck, label: 'Acceso seguro' },
        ],
    },
    partera: {
        title: 'Red de partería tradicional',
        text: 'Registro de atenciones, calendario y referencias obstétricas desde la comunidad, con apoyo de voz.',
        chips: [
            { Icon: HeartPulse, label: 'Atención materna' },
            { Icon: Volume2, label: 'Apoyo de voz' },
            { Icon: QrCode, label: 'Ingreso con QR' },
        ],
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

const WELCOME_STAGES: ReadonlyArray<{ from: number; label: string }> = [
    { from: 0, label: 'Verificando credenciales' },
    { from: 28, label: 'Sincronizando Tamiz Neonatal' },
    { from: 58, label: 'Sincronizando Red de Parteras' },
    { from: 86, label: 'Preparando tu espacio de trabajo' },
    { from: 100, label: 'Todo listo' },
];

/* Clases compartidas y Estilo Glass Luminoso Avanzado */
const ACCENT = 'bg-gradient-to-r from-sky-400 to-blue-600';
const FOCUS =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-0 focus-visible:shadow-[0_0_25px_rgba(255,255,255,0.7)]';
const SLIDE = 'ease-[cubic-bezier(0.65,0,0.35,1)]';
const GLASS = 'lg-edge relative border border-white/35 bg-slate-900/30 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.45)] backdrop-blur-3xl';
const LABEL = 'mb-1.5 block text-xs font-medium text-white/95 tracking-wide';
const INPUT =
    'min-h-12 w-full rounded-xl border border-white/30 bg-white/10 pl-10 text-base text-white placeholder:text-white/60 shadow-inner shadow-white/5 transition-all duration-200 hover:border-white/50 hover:bg-white/15 focus:border-white focus:bg-white/20 focus:outline-none focus:ring-4 focus:ring-sky-200/40 focus:shadow-[0_0_30px_rgba(255,255,255,0.4)] disabled:opacity-60';
const FIELD_ICON = 'pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/80 transition-colors duration-200 group-focus-within:text-white';
const PRIMARY = `lg-sheen group relative flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/40 ${ACCENT} px-5 text-base font-semibold text-white shadow-lg shadow-sky-900/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(56,189,248,0.5)] hover:brightness-110 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${FOCUS}`;
const SECONDARY = `min-h-12 rounded-xl border border-white/30 bg-white/15 px-4 text-sm font-medium text-white backdrop-blur-md transition-all duration-200 hover:border-white/50 hover:bg-white/25 active:scale-[0.98] ${FOCUS}`;
const PILL_TRACK = 'relative grid grid-cols-2 rounded-2xl border border-white/25 bg-white/10 p-1 shadow-inner shadow-white/5 backdrop-blur-md';

const LOGIN_CSS = `
@keyframes lgFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes lgShake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-7px)}40%,60%{transform:translateX(7px)}}
@keyframes lgCard{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:none}}
@keyframes lgLaser{from{top:0}to{top:100%}}
@keyframes lgPop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:none}}
@keyframes lgRipple{from{transform:translate(-50%,-50%) scale(0);opacity:.55}to{transform:translate(-50%,-50%) scale(1);opacity:0}}
@keyframes lgAlertIn{from{opacity:0;transform:translateY(-18px) scale(.95)}to{opacity:1;transform:none}}
@keyframes lgVeil{from{opacity:0}to{opacity:1}}
@keyframes lgModal{from{opacity:0;transform:translateY(24px) scale(.94)}to{opacity:1;transform:none}}
@keyframes lgFloatA{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(4%,6%,0)}}
@keyframes lgFloatB{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-5%,-4%,0)}}
@keyframes lgSheen{from{transform:translateX(-160%) skewX(-15deg)}to{transform:translateX(420%) skewX(-15deg)}}
@keyframes lgHalo{0%{transform:scale(.85);opacity:.6}100%{transform:scale(1.7);opacity:0}}
@keyframes lgBar{from{transform:translateX(-100%)}to{transform:translateX(250%)}}
.lg-fade{animation:lgFade .4s cubic-bezier(0.16,1,0.3,1) both}
.lg-shake{animation:lgShake .45s cubic-bezier(.36,.07,.19,.97) both}
.lg-shake-late{animation:lgShake .5s cubic-bezier(.36,.07,.19,.97) .3s both}
.lg-card{animation:lgCard .7s cubic-bezier(.22,1,.36,1) both}
.lg-laser{animation:lgLaser 2.1s ease-in-out infinite alternate}
.lg-pop{animation:lgPop .35s cubic-bezier(.34,1.56,.64,1) both}
.lg-ripple{animation:lgRipple .6s ease-out forwards}
.lg-alert-in{animation:lgAlertIn .45s cubic-bezier(.22,1,.36,1) both}
.lg-veil{animation:lgVeil .35s ease-out both}
.lg-modal{animation:lgModal .55s cubic-bezier(.22,1,.36,1) both}
.lg-float-a{animation:lgFloatA 22s ease-in-out infinite}
.lg-float-b{animation:lgFloatB 28s ease-in-out infinite}
.lg-halo{animation:lgHalo 2.2s ease-out infinite}
.lg-bar-shine{animation:lgBar 1.6s linear infinite}
.lg-text{text-shadow:0 1px 3px rgba(15,23,42,.3)}
.lg-quiet{scrollbar-width:none}
.lg-quiet::-webkit-scrollbar{display:none}
.lg-edge::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;
background:linear-gradient(135deg,rgba(255,255,255,.9),rgba(255,255,255,.25) 35%,rgba(255,255,255,0) 60%,rgba(255,255,255,.5));
-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.lg-sheen::after{content:'';position:absolute;inset:0 auto 0 0;width:35%;pointer-events:none;
background:linear-gradient(100deg,transparent,rgba(255,255,255,.4),transparent);transform:translateX(-160%) skewX(-15deg)}
.lg-sheen:hover:not(:disabled)::after{animation:lgSheen .9s ease}
@media (prefers-reduced-motion:reduce){
.lg-fade,.lg-shake,.lg-shake-late,.lg-card,.lg-laser,.lg-pop,.lg-ripple,.lg-alert-in,.lg-veil,.lg-modal,.lg-float-a,.lg-float-b,.lg-halo,.lg-bar-shine{animation:none}
.lg-sheen:hover:not(:disabled)::after{animation:none}}
`;

/* ═══════════════════════════════════════════════════════════════
   Utilidades
   ═══════════════════════════════════════════════════════════════ */

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
    } catch {
        /* almacenamiento no disponible */
    }
}

function getFirstName(user: User): string {
    const record = user as unknown as Record<string, unknown>;
    for (const key of NAME_KEYS) {
        const value = record[key];
        if (typeof value === 'string' && value.trim()) {
            const token = value.trim().split(/\s+/).find((part) => !TITLE_TOKENS.test(part));
            if (token) return token;
        }
    }
    return '';
}

/* ═══════════════════════════════════════════════════════════════
   Voz natural en español de México (Web Speech API)
   ═══════════════════════════════════════════════════════════════ */

const PREFERRED_VOICES = /(dalia|paulina|sabina|angelica|renata|elena)/i;

function isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
    const lang = voice.lang.replace('_', '-').toLowerCase();
    let score: number;
    if (lang === 'es-mx') score = 100;
    else if (lang === 'es-us' || lang === 'es-419') score = 25;
    else return -1;
    if (/natural|neural|online/i.test(voice.name)) score += 30;
    if (PREFERRED_VOICES.test(voice.name)) score += 15;
    if (voice.localService) score += 3;
    return score;
}

function pickMexicanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    let best: SpeechSynthesisVoice | null = null;
    let bestScore = 0;
    for (const voice of voices) {
        const score = scoreVoice(voice);
        if (score > bestScore) {
            best = voice;
            bestScore = score;
        }
    }
    return best;
}

function useMexicanVoice() {
    const supported = isSpeechSupported();
    const [speaking, setSpeaking] = useState(false);
    const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const engagedRef = useRef(false);

    useEffect(() => {
        if (!supported) return;
        const synth = window.speechSynthesis;
        const loadVoices = () => {
            voiceRef.current = pickMexicanVoice(synth.getVoices());
        };
        loadVoices();
        synth.addEventListener('voiceschanged', loadVoices);
        return () => {
            synth.removeEventListener('voiceschanged', loadVoices);
            synth.cancel();
        };
    }, [supported]);

    const stop = useCallback(() => {
        if (supported) window.speechSynthesis.cancel();
        utteranceRef.current = null;
        setSpeaking(false);
    }, [supported]);

    const speak = useCallback(
        (text: string) => {
            if (!supported) return;
            const synth = window.speechSynthesis;
            synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-MX';
            if (voiceRef.current) utterance.voice = voiceRef.current;
            utterance.rate = 0.94;
            utterance.pitch = 1.05;
            utterance.volume = 1;
            const finish = () => {
                if (utteranceRef.current === utterance) {
                    utteranceRef.current = null;
                    setSpeaking(false);
                }
            };
            utterance.onstart = () => setSpeaking(true);
            utterance.onend = finish;
            utterance.onerror = finish;
            utteranceRef.current = utterance;
            synth.speak(utterance);
        },
        [supported],
    );

    const engage = useCallback(() => {
        engagedRef.current = true;
    }, []);

    const announce = useCallback(
        (text: string) => {
            if (engagedRef.current) speak(text);
        },
        [speak],
    );

    return useMemo(
        () => ({ supported, speaking, speak, stop, engage, announce }),
        [supported, speaking, speak, stop, engage, announce],
    );
}

type VoiceApi = ReturnType<typeof useMexicanVoice>;

/* ═══════════════════════════════════════════════════════════════
   Alerta flotante
   ═══════════════════════════════════════════════════════════════ */

interface FloatingAlertProps {
    notice: Notice;
    onRetry: () => void;
    onClose: () => void;
}

function FloatingAlert({ notice, onRetry, onClose }: FloatingAlertProps) {
    const isError = notice.kind === 'error';
    const Icon = isError ? AlertTriangle : Info;

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        const timer = isError ? null : window.setTimeout(onClose, 8000);
        return () => {
            window.removeEventListener('keydown', onKey);
            if (timer !== null) window.clearTimeout(timer);
        };
    }, [notice.id, isError, onClose]);

    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-6">
            <div key={notice.id} className="lg-alert-in pointer-events-auto w-full max-w-sm">
                <div
                    role={isError ? 'alert' : 'status'}
                    className={`lg-edge relative overflow-hidden rounded-2xl border bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/60 backdrop-blur-2xl ${
                        isError ? 'lg-shake-late border-rose-300/40' : 'border-sky-300/40'
                    }`}
                >
                    <div
                        aria-hidden="true"
                        className={`absolute -top-12 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full blur-2xl ${isError ? 'bg-rose-500/30' : 'bg-sky-400/30'}`}
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar aviso"
                        className={`absolute right-2 top-2 flex size-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/15 hover:text-white ${FOCUS}`}
                    >
                        <X className="size-4" />
                    </button>
                    <div className="relative flex gap-3 pr-8">
                        <span
                            className={`flex size-11 shrink-0 items-center justify-center rounded-full ring-1 ${
                                isError ? 'bg-rose-500/25 text-amber-300 ring-rose-300/50' : 'bg-sky-400/25 text-sky-200 ring-sky-300/50'
                            }`}
                        >
                            <Icon className="size-6" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white">{isError ? 'No pudimos iniciar sesión' : 'Aviso'}</p>
                            <p className="mt-0.5 text-sm leading-snug text-sky-50/90">{notice.text}</p>
                        </div>
                    </div>
                    <div className="relative mt-3.5 flex justify-end">
                        <button type="button" onClick={onRetry} className={`${SECONDARY} flex min-h-11 items-center gap-2`}>
                            {isError && <RotateCcw className="size-4" aria-hidden="true" />}
                            {isError ? 'Reintentar' : 'Entendido'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Tecla del PIN
   ═══════════════════════════════════════════════════════════════ */

interface PinKeyProps {
    disabled: boolean;
    onPress: () => void;
    ariaLabel?: string;
    muted?: boolean;
    children: ReactNode;
}

function PinKey({ disabled, onPress, ariaLabel, muted = false, children }: PinKeyProps) {
    const [ripple, setRipple] = useState<{ id: number; x: number; y: number } | null>(null);

    const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (disabled) return;
        const rect = event.currentTarget.getBoundingClientRect();
        setRipple({ id: event.timeStamp, x: event.clientX - rect.left, y: event.clientY - rect.top });
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(8);
    };

    return (
        <button
            type="button"
            disabled={disabled}
            aria-label={ariaLabel}
            onPointerDown={handlePointerDown}
            onClick={onPress}
            className={`relative flex min-h-14 touch-manipulation select-none items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-b from-white/25 to-white/10 text-2xl font-semibold shadow-[0_4px_14px_rgba(15,23,42,0.18)] transition duration-100 hover:from-white/35 hover:to-white/15 active:scale-90 active:border-sky-300/70 active:from-sky-400/45 active:to-sky-500/25 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12 ${FOCUS} ${
                muted ? 'text-sky-100' : 'text-white'
            }`}
        >
            {ripple && (
                <span
                    key={ripple.id}
                    aria-hidden="true"
                    onAnimationEnd={() => setRipple(null)}
                    style={{ left: ripple.x, top: ripple.y }}
                    className="lg-ripple pointer-events-none absolute size-28 rounded-full bg-sky-200/60"
                />
            )}
            <span className="relative">{children}</span>
        </button>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Formulario institucional
   ═══════════════════════════════════════════════════════════════ */

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label htmlFor="login-rol" className={LABEL}>Perfil de acceso</label>
                <div className="group relative">
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
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/80" aria-hidden="true" />
                </div>
            </div>

            <div>
                <label htmlFor="login-email" className={LABEL}>Correo institucional</label>
                <div className="group relative">
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
                <div className="group relative">
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
                        className={`${INPUT} pr-12`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className={`absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-sky-100 transition hover:bg-white/15 hover:text-white active:scale-90 ${FOCUS}`}
                    >
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-sm">
                <label className="flex min-h-9 cursor-pointer select-none items-center gap-2 text-sky-50">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(event) => setRemember(event.target.checked)}
                        className="size-4 cursor-pointer rounded accent-sky-400"
                    />
                    Recordar equipo
                </label>
                <button
                    type="button"
                    onClick={onForgotPassword}
                    className={`min-h-9 rounded text-sky-200 underline-offset-4 transition-colors hover:text-white hover:underline ${FOCUS}`}
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

/* ═══════════════════════════════════════════════════════════════
   Visor QR
   ═══════════════════════════════════════════════════════════════ */

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
    const retryRef = useRef<number | null>(null);
    const onDetectRef = useRef(onDetect);

    useEffect(() => {
        onDetectRef.current = onDetect;
    }, [onDetect]);

    const stopCamera = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (retryRef.current !== null) {
            window.clearTimeout(retryRef.current);
            retryRef.current = null;
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
                        retryRef.current = window.setTimeout(() => {
                            retryRef.current = null;
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
        <div className="flex flex-col gap-3">
            <div className="relative mx-auto aspect-square w-full max-w-[13rem] overflow-hidden rounded-3xl border border-white/35 bg-slate-900/50 shadow-inner sm:max-w-[14rem]">
                <video
                    ref={videoRef}
                    muted
                    playsInline
                    aria-label="Vista de la cámara"
                    className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${live ? 'opacity-100' : 'opacity-0'}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {!live && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-900/50 to-slate-950/70">
                        {state === 'denied' ? (
                            <CameraOff className="size-11 text-sky-200/60" aria-hidden="true" />
                        ) : (
                            <QrCode className="size-12 text-sky-200/50" aria-hidden="true" />
                        )}
                    </div>
                )}

                <div className="pointer-events-none absolute inset-5" aria-hidden="true">
                    <span className={`absolute left-0 top-0 size-7 rounded-tl-xl border-l-4 border-t-4 transition-colors duration-300 ${frame}`} />
                    <span className={`absolute right-0 top-0 size-7 rounded-tr-xl border-r-4 border-t-4 transition-colors duration-300 ${frame}`} />
                    <span className={`absolute bottom-0 left-0 size-7 rounded-bl-xl border-b-4 border-l-4 transition-colors duration-300 ${frame}`} />
                    <span className={`absolute bottom-0 right-0 size-7 rounded-br-xl border-b-4 border-r-4 transition-colors duration-300 ${frame}`} />
                    {state === 'scanning' && !rejected && (
                        <span className="lg-laser absolute inset-x-0 top-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-sky-200 to-transparent shadow-[0_0_16px_4px_rgba(125,211,252,0.85)] motion-reduce:hidden" />
                    )}
                </div>

                {(state === 'starting' || state === 'verifying') && (
                    <div className="lg-fade absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
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

            <p className="flex min-h-10 items-center justify-center text-center text-sm leading-snug text-sky-50/90" aria-live="polite">
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
                            <button type="button" onClick={onUsePin} className={`${SECONDARY} flex-1`}>
                                Usar mi PIN
                            </button>
                        )}
                        <button type="button" onClick={startCamera} disabled={state === 'starting'} className={`${PRIMARY} flex-1`}>
                            <Camera className="size-5" />
                            <span>{state === 'starting' ? 'Abriendo...' : state === 'denied' ? 'Reintentar' : 'Activar cámara'}</span>
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

/* ═══════════════════════════════════════════════════════════════
   Acceso de parteras
   ═══════════════════════════════════════════════════════════════ */

interface MidwifeAccessProps {
    active: boolean;
    busy: boolean;
    voice: VoiceApi;
    onPin: (pin: string) => Promise<boolean>;
    onQr: (code: string) => Promise<boolean>;
}

function MidwifeAccess({ active, busy, voice, onPin, onQr }: MidwifeAccessProps) {
    const [method, setMethod] = useState<PinMethod>('pin');
    const [digits, setDigits] = useState('');
    const [shakeKey, setShakeKey] = useState(0);
    const busyRef = useRef(busy);
    const digitsRef = useRef('');
    const { speaking, stop: stopVoice, speak, engage, supported } = voice;

    useEffect(() => {
        busyRef.current = busy;
    }, [busy]);

    const updateDigits = useCallback((value: string) => {
        digitsRef.current = value;
        setDigits(value);
    }, []);

    const toggleVoice = () => {
        if (speaking) {
            stopVoice();
            return;
        }
        engage();
        speak(VOICE_TEXT[method]);
    };

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
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div role="group" aria-label="Forma de acceso" className={`${PILL_TRACK} flex-1`}>
                    <span
                        aria-hidden="true"
                        className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl ${ACCENT} shadow-md shadow-sky-950/30 ring-1 ring-white/40 transition-transform duration-300 ${SLIDE} ${
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
                            className={`relative z-10 flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-1 text-sm font-medium transition-all duration-200 active:scale-[0.97] ${FOCUS} ${
                                method === id ? 'text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
                            }`}
                        >
                            <Icon className="size-4 shrink-0" aria-hidden="true" />
                            <span className="truncate">{label}</span>
                        </button>
                    ))}
                </div>

                {supported && (
                    <button
                        type="button"
                        onClick={toggleVoice}
                        aria-pressed={speaking}
                        aria-label={speaking ? 'Detener la voz' : 'Escuchar instrucciones'}
                        className={`relative flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/35 bg-white/15 text-white transition duration-200 hover:bg-white/25 active:scale-90 ${FOCUS} ${
                            speaking ? 'border-sky-300/60 bg-sky-500/40' : ''
                        }`}
                    >
                        {speaking && <span aria-hidden="true" className="lg-halo absolute inset-0 rounded-2xl border border-sky-300/70" />}
                        {speaking ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                    </button>
                )}
            </div>

            <div key={method} className="lg-fade flex flex-col justify-center">
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
                                    className={`size-5 rounded-full border-2 transition-all duration-200 ${
                                        index < digits.length
                                            ? 'scale-110 border-sky-300 bg-sky-300 shadow-[0_0_18px_rgba(125,211,252,0.85)]'
                                            : 'border-white/45 bg-transparent'
                                    }`}
                                />
                            ))}
                        </div>

                        <p className="flex h-5 items-center justify-center gap-2 text-sm text-sky-50/90" aria-live="polite">
                            {busy ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Verificando PIN…
                                </>
                            ) : (
                                'Toca los números para escribir tu PIN'
                            )}
                        </p>

                        <div className="mx-auto grid w-full max-w-72 grid-cols-3 gap-2.5 sm:max-w-64 sm:gap-2">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                                <PinKey key={digit} disabled={busy} onPress={() => pressDigit(digit)}>
                                    {digit}
                                </PinKey>
                            ))}
                            <PinKey disabled={busy} onPress={clearAll} ariaLabel="Borrar todo" muted>
                                <RotateCcw className="size-5" />
                            </PinKey>
                            <PinKey disabled={busy} onPress={() => pressDigit('0')}>
                                0
                            </PinKey>
                            <PinKey disabled={busy} onPress={deleteLast} ariaLabel="Borrar último" muted>
                                <Delete className="size-5" />
                            </PinKey>
                        </div>
                    </div>
                ) : (
                    active && <QrViewfinder onDetect={onQr} onUsePin={() => changeMethod('pin')} />
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Modal de bienvenida
   ═══════════════════════════════════════════════════════════════ */

interface WelcomeModalProps {
    name: string;
    audience: AccessMode;
    onDone: () => void;
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function WelcomeModal({ name, audience, onDone }: WelcomeModalProps) {
    const [progress, setProgress] = useState(0);
    const onDoneRef = useRef(onDone);
    const doneRef = useRef(false);
    const skipRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        onDoneRef.current = onDone;
    }, [onDone]);

    const finish = useCallback(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        onDoneRef.current();
    }, []);

    useEffect(() => {
        skipRef.current?.focus();
        let raf = 0;
        let timeout = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / WELCOME_MS);
            setProgress(Math.round(easeInOutCubic(t) * 100));
            if (t < 1) raf = requestAnimationFrame(tick);
            else timeout = window.setTimeout(finish, 450);
        };
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(timeout);
        };
    }, [finish]);

    const stage = [...WELCOME_STAGES].reverse().find((item) => progress >= item.from) ?? WELCOME_STAGES[0];
    const complete = progress >= 100;
    const isMidwife = audience === 'partera';
    const title = isMidwife ? `¡Bienvenida${name ? `, ${name}` : ''}!` : `¡Hola de nuevo${name ? `, ${name}` : ''}!`;
    const message = isMidwife
        ? 'Gracias por acompañar y cuidar la vida en tu comunidad. Ya casi está todo listo.'
        : 'Qué gusto verte por aquí. Estamos dejando todo listo para tu jornada.';

    return (
        <div className="lg-veil fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="welcome-title"
                className={`${GLASS} lg-modal w-full max-w-sm overflow-hidden rounded-3xl p-6 text-center sm:p-8`}
            >
                <div aria-hidden="true" className="absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-sky-400/35 blur-3xl" />

                <div className="relative mx-auto mb-5 flex size-24 items-center justify-center">
                    <span aria-hidden="true" className="lg-halo absolute inset-0 rounded-full border border-sky-300/60" />
                    <span aria-hidden="true" className="lg-halo absolute inset-0 rounded-full border border-sky-300/50 [animation-delay:1.1s]" />
                    <img
                        src="/logo-jurisdiccion.png"
                        alt=""
                        draggable={false}
                        className="relative size-20 rounded-full bg-white/90 backdrop-blur-sm object-cover shadow-xl ring-4 ring-white/40"
                    />
                    <span
                        className={`absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full ring-4 ring-slate-900/60 transition-colors duration-500 ${
                            complete ? 'bg-emerald-400 text-emerald-950' : 'bg-sky-400 text-white'
                        }`}
                    >
                        {complete ? <CheckCircle2 className="lg-pop size-5" /> : <HeartHandshake className="size-4" />}
                    </span>
                </div>

                <h2 id="welcome-title" className="relative text-2xl font-semibold leading-tight text-white">{title}</h2>
                <p className="relative mx-auto mt-2 max-w-xs text-sm leading-relaxed text-sky-50/90">{message}</p>

                <div className="relative mt-6">
                    <div
                        role="progressbar"
                        aria-label="Sincronización institucional"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress}
                        className="relative h-2.5 overflow-hidden rounded-full border border-white/30 bg-white/15"
                    >
                        <div
                            className={`relative h-full overflow-hidden rounded-full transition-colors duration-500 ${
                                complete ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' : 'bg-gradient-to-r from-sky-400 to-cyan-300'
                            }`}
                            style={{ width: `${progress}%` }}
                        >
                            {!complete && (
                                <span className="lg-bar-shine absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent motion-reduce:hidden" />
                            )}
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-3 text-xs text-sky-50/90" aria-live="polite">
                        <span key={stage.label} className="lg-fade flex min-w-0 items-center gap-1.5 truncate">
                            {complete ? (
                                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
                            ) : (
                                <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />
                            )}
                            <span className="truncate">{stage.label}</span>
                        </span>
                        <span className="shrink-0 tabular-nums">{progress}%</span>
                    </div>
                </div>

                <button ref={skipRef} type="button" onClick={finish} className={`${SECONDARY} relative mt-5 w-full`}>
                    Entrar ahora
                </button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Pantalla de Login Principal
   ═══════════════════════════════════════════════════════════════ */

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const baseId = useId();
    const voice = useMexicanVoice();
    const { announce } = voice;

    const [mode, setMode] = useState<AccessMode>('institucional');
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [welcome, setWelcome] = useState<WelcomeState | null>(null);

    const isInstitutional = mode === 'institucional';
    const locked = busy || welcome !== null;
    const tabId = (id: AccessMode) => `${baseId}-tab-${id}`;
    const panelId = (id: AccessMode) => `${baseId}-panel-${id}`;

    const showNotice = useCallback((kind: NoticeKind, text: string) => {
        setNotice({ id: Date.now(), kind, text });
    }, []);

    const dismissNotice = useCallback(() => setNotice(null), []);

    const handleRetry = useCallback(() => {
        setNotice(null);
        if (mode === 'institucional') {
            requestAnimationFrame(() => document.getElementById('login-password')?.focus());
        }
    }, [mode]);

    const switchMode = (next: AccessMode) => {
        if (next === mode || locked) return;
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
        async (request: () => Promise<LoginResponse>, fallbackError: string, audience: AccessMode): Promise<boolean> => {
            setBusy(true);
            setNotice(null);
            try {
                const { token, user } = await request();
                localStorage.setItem(TOKEN_KEY, token);
                const name = getFirstName(user);
                if (audience === 'partera') {
                    announce(name ? `Bienvenida, ${name}. Estamos preparando su información.` : 'Bienvenida. Estamos preparando su información.');
                }
                setWelcome({ user, name, audience });
                return true;
            } catch (error) {
                const message = getErrorMessage(error, fallbackError);
                showNotice('error', message);
                if (audience === 'partera') announce(`${message} Inténtelo de nuevo.`);
                return false;
            } finally {
                setBusy(false);
            }
        },
        [announce, showNotice],
    );

    const handleInstitutional = useCallback(
        (email: string, password: string, rol: UserRole) =>
            authenticate(
                async () => (await http.post<LoginResponse>('/auth/login-institucional', { email, password, rol })).data,
                'Correo o contraseña incorrectos.',
                'institucional',
            ),
        [authenticate],
    );

    const handlePin = useCallback(
        (pin: string) =>
            authenticate(
                async () => (await http.post<LoginResponse>('/parteras/login-pin', { pin })).data,
                'PIN incorrecto o no registrado.',
                'partera',
            ),
        [authenticate],
    );

    const handleQr = useCallback(
        (code: string) =>
            authenticate(
                async () => (await http.post<LoginResponse>('/parteras/login-pin', { pin: code })).data,
                'Código QR no reconocido en el sistema.',
                'partera',
            ),
        [authenticate],
    );

    const handleForgotPassword = useCallback(() => {
        showNotice('info', 'Para restablecer tu contraseña, solicita apoyo al administrador jurisdiccional.');
    }, [showNotice]);

    const panelClass = (on: boolean, from: 'left' | 'right') =>
        `flex w-full flex-col justify-center px-1 py-1 transition-[opacity,transform,visibility] duration-500 ${SLIDE} ${
            on
                ? 'visible relative min-h-full translate-x-0 opacity-100'
                : `invisible pointer-events-none absolute inset-x-0 top-0 opacity-0 ${from === 'left' ? '-translate-x-8' : 'translate-x-8'}`
        }`;

    return (
        <div className="lg-text fixed inset-0 isolate flex items-center justify-center overflow-hidden overscroll-none px-3 py-3 text-white selection:bg-sky-300/40 sm:p-6">
            <style>{LOGIN_CSS}</style>

            {/* Fondo vibrante, nítido y optimizado para lucir al máximo */}
            <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-sky-500 via-blue-700 to-slate-950">
                <img
                    src="/fondo-login.png"
                    alt=""
                    draggable={false}
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                    className="absolute inset-0 size-full object-cover object-center opacity-85 brightness-105 contrast-105 blur-md"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-sky-950/20 via-blue-900/10 to-slate-950/40" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(186,230,253,0.3),transparent_70%)]" />
                <div className="lg-float-a absolute -left-20 -top-20 size-[32rem] rounded-full bg-sky-400/25 blur-3xl" />
                <div className="lg-float-b absolute -bottom-28 -right-20 size-[36rem] rounded-full bg-cyan-400/25 blur-3xl" />
            </div>

            {/* Contenedor Fijo y Centrado */}
            <div className="flex h-full w-full max-w-md items-center justify-center md:max-w-4xl" inert={welcome !== null ? true : undefined}>
                <div
                    className={`lg-card ${GLASS} flex max-h-[92vh] min-h-0 w-full flex-col overflow-hidden rounded-3xl md:h-[40rem] ${
                        isInstitutional ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                >
                    {/* Reflejo de luz superior del cristal (Efecto especular) */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tr from-white/20 via-transparent to-sky-200/25" />

                    {/* ── Panel lateral (Logotipos sin fondo blanco forzado y alta elegancia) ── */}
                    <aside className="relative z-10 shrink-0 overflow-hidden border-b border-white/20 p-4 sm:p-5 md:w-5/12 md:border-b-0 md:p-8 flex flex-col justify-between">
                        <div
                            aria-hidden="true"
                            className={`absolute inset-0 bg-gradient-to-br from-white/25 via-sky-200/10 to-transparent transition-opacity duration-700 ${
                                isInstitutional ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                        <div
                            aria-hidden="true"
                            className={`absolute inset-0 bg-gradient-to-br from-cyan-200/25 via-sky-200/10 to-transparent transition-opacity duration-700 ${
                                isInstitutional ? 'opacity-0' : 'opacity-100'
                            }`}
                        />

                        {/* Versión móvil/tablet compacta */}
                        <div className="relative flex flex-col items-center gap-2.5 text-center md:hidden">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/logo-jurisdiccion.png"
                                    alt="Jurisdicción Sanitaria No. 2 Istmo"
                                    draggable={false}
                                    className="size-11 shrink-0 rounded-full bg-white/90 backdrop-blur-sm object-cover shadow-lg ring-2 ring-white/60 p-0.5"
                                />
                                <span aria-hidden="true" className="h-6 w-px bg-white/40" />
                                <div className="flex h-9 shrink-0 items-center rounded-xl bg-white/90 backdrop-blur-md px-3 shadow-lg">
                                    <img src="/Logo-Secretaria.png" alt="Secretaría de Salud" draggable={false} className="h-4 w-auto object-contain" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-base font-semibold leading-tight tracking-tight text-white">Jurisdicción Sanitaria No. 2</h1>
                                <p className="mt-0.5 text-xs text-white/90">Istmo, Servicios de Salud de Oaxaca</p>
                            </div>
                        </div>

                        {/* Versión escritorio centrada (Logotipos sin fondo blanco sólido, integrados con sutileza) */}
                        <div className="relative hidden h-full flex-col items-center justify-between gap-4 text-center md:flex">
                            <div className="flex items-center gap-3.5 pt-2">
                                <img
                                    src="/logo-jurisdiccion.png"
                                    alt="Jurisdicción Sanitaria No. 2 Istmo"
                                    draggable={false}
                                    className="size-16 shrink-0 rounded-full bg-white/90 backdrop-blur-md object-cover shadow-xl ring-2 ring-white/60 p-0.5 transition-transform duration-300 hover:scale-105"
                                />
                                <div className="flex h-14 items-center rounded-2xl bg-white/90 backdrop-blur-md px-3.5 shadow-xl transition-transform duration-300 hover:scale-105">
                                    <img src="/Logo-Secretaria.png" alt="Secretaría de Salud" draggable={false} className="h-8 w-auto object-contain" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <h1 className="text-2xl font-semibold leading-tight tracking-tight text-white">Jurisdicción Sanitaria No. 2</h1>
                                <p className="text-sm text-white/90">Istmo, Servicios de Salud de Oaxaca</p>
                            </div>

                            <div key={mode} className="lg-fade flex flex-col items-center space-y-3">
                                <h2 className="text-lg font-medium text-white">{MODE_COPY[mode].title}</h2>
                                <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/90">{MODE_COPY[mode].text}</p>
                                <ul className="flex flex-wrap justify-center gap-2 pt-1">
                                    {MODE_COPY[mode].chips.map(({ Icon, label }) => (
                                        <li
                                            key={label}
                                            className="flex items-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs text-white backdrop-blur-md shadow-sm"
                                        >
                                            <Icon className="size-3.5" aria-hidden="true" />
                                            {label}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className="mx-auto max-w-[16rem] text-xs leading-snug text-white/85 pb-2">
                                Sistema de gestión de tamiz neonatal y parteras tradicionales
                            </p>
                        </div>
                    </aside>

                    {/* ── Panel de formularios ── */}
                    <section
                        className={`relative z-10 flex min-h-0 flex-1 flex-col bg-white/[0.03] p-4 sm:p-6 md:border-white/20 md:p-8 overflow-y-auto lg-quiet ${
                            isInstitutional ? 'md:border-l' : 'md:border-r'
                        }`}
                    >
                        <div role="tablist" aria-label="Tipo de acceso" onKeyDown={handleTabKeys} className={`${PILL_TRACK} mb-4 shrink-0`}>
                            <span
                                aria-hidden="true"
                                className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl ${ACCENT} shadow-lg shadow-sky-950/40 ring-1 ring-white/40 transition-transform duration-500 ${SLIDE} ${
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
                                        className={`relative z-10 flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-sm font-medium transition-all duration-300 active:scale-[0.97] ${FOCUS} ${
                                            selected ? 'text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
                                        }`}
                                    >
                                        <Icon
                                            className={`size-4 shrink-0 transition-transform duration-500 ${selected ? 'scale-110' : 'scale-100'}`}
                                            aria-hidden="true"
                                        />
                                        <span className="truncate">{label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="lg-quiet relative min-h-0 flex-1 overflow-y-auto">
                            <div
                                id={panelId('institucional')}
                                role="tabpanel"
                                aria-labelledby={tabId('institucional')}
                                inert={!isInstitutional ? true : undefined}
                                className={panelClass(isInstitutional, 'left')}
                            >
                                <InstitutionalForm busy={locked} onSubmit={handleInstitutional} onForgotPassword={handleForgotPassword} />
                            </div>

                            <div
                                id={panelId('partera')}
                                role="tabpanel"
                                aria-labelledby={tabId('partera')}
                                inert={isInstitutional ? true : undefined}
                                className={panelClass(!isInstitutional, 'right')}
                            >
                                <MidwifeAccess active={!isInstitutional} busy={locked} voice={voice} onPin={handlePin} onQr={handleQr} />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {notice && <FloatingAlert notice={notice} onRetry={handleRetry} onClose={dismissNotice} />}

            {welcome && (
                <WelcomeModal
                    name={welcome.name}
                    audience={welcome.audience}
                    onDone={() => {
                        login(welcome.user);
                        navigate('/dashboard', { replace: true });
                    }}
                />
            )}
        </div>
    );
}

export default Login;