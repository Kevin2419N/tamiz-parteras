import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import {
    Building2,
    HeartHandshake,
    User as UserIcon,
    Lock,
    ArrowRight,
    QrCode,
    Volume2,
    VolumeX,
    Loader2,
    Delete,
    RotateCcw,
    Camera,
    X,
    CheckCircle2,
    HelpCircle,
    Sparkles,
    ShieldCheck
} from 'lucide-react';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'INSTITUCIONAL' | 'PARTERA'>('INSTITUCIONAL');

    // Tab 1: Institutional State
    const [email, setEmail] = useState('capturista.jurisdiccion2@salud.gob.mx');
    const [password, setPassword] = useState('••••••••••••');
    const [rolSeleccionado, setRolSeleccionado] = useState<UserRole>(UserRole.CAPTURISTA_TAMIZ);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [forgotEmailSent, setForgotEmailSent] = useState(false);

    // Tab 2: Midwife Access State (WCAG 2.1 AAA)
    const [pinDigits, setPinDigits] = useState<string[]>([]);
    const [showQRScannerModal, setShowQRScannerModal] = useState(false);
    const [isScanningQR, setIsScanningQR] = useState(false);
    const [qrScanSuccess, setQrScanSuccess] = useState(false);

    // Voice Assistance State (Web Speech API)
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Web Speech API Voice Instructions
    const speakInstructions = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any ongoing speech
            const text = 'Por favor, acerque su credencial con código QR a la cámara o ingrese su código de cuatro números.';
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-MX';
            utterance.rate = 0.9; // Slightly slower for clear accessibility comprehension
            utterance.pitch = 1.0;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        } else {
            alert('La asistencia por voz no está disponible en este navegador.');
        }
    };

    const stopVoice = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    useEffect(() => {
        // Cleanup speech on unmount
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Handle Keypad Press
    const handleKeypadPress = (digit: string) => {
        if (pinDigits.length < 4) {
            const newPin = [...pinDigits, digit];
            setPinDigits(newPin);

            // Auto-submit when 4 digits are reached
            if (newPin.length === 4) {
                setTimeout(() => {
                    triggerSuccessfulLogin(UserRole.PARTERA_TRADICIONAL, 'Doña Rosa Santiz Gómez (Partera Tradicional)');
                }, 400);
            }
        }
    };

    const handleKeypadDelete = () => {
        setPinDigits((prev) => prev.slice(0, -1));
    };

    const handleKeypadClear = () => {
        setPinDigits([]);
    };

    // Simulate QR Camera Scanner
    const handleStartQRScan = () => {
        setShowQRScannerModal(true);
        setIsScanningQR(true);
        setQrScanSuccess(false);

        // Auto-detect QR after 2.5 seconds simulation
        setTimeout(() => {
            setIsScanningQR(false);
            setQrScanSuccess(true);
            setTimeout(() => {
                setShowQRScannerModal(false);
                triggerSuccessfulLogin(UserRole.PARTERA_TRADICIONAL, 'Doña Juana López Pérez (Partera Tradicional)');
            }, 1200);
        }, 2500);
    };

    // General Login Redirection Handler
    const triggerSuccessfulLogin = (rol: UserRole, userNombre?: string) => {
        const userSimulado = {
            id: 'USR-' + Math.floor(Math.random() * 10000),
            nombre: userNombre || (email.split('@')[0].toUpperCase()),
            email: email,
            rol: rol,
            jurisdiccion: 'Jurisdicción Sanitaria No. 2 - Istmo (Juchitán de Zaragoza)',
            activo: true,
        };

        localStorage.setItem('tamiz_user', JSON.stringify(userSimulado));
        navigate('/dashboard');
    };

    const handleInstitutionalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            triggerSuccessfulLogin(rolSeleccionado);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-4 selection:bg-teal-500 selection:text-white">

            {/* Header Institucional del Sector Salud */}
            <header className="w-full max-w-4xl mb-6 flex flex-col sm:flex-row items-center justify-between bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-xl gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-0.5 shadow-lg shadow-teal-500/20 shrink-0">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-teal-400">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                                GOBIERNO DEL ESTADO DE OAXACA
                            </span>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                SSO - SERVICIOS DE SALUD DE OAXACA
                            </span>
                        </div>
                        <h1 className="text-lg font-black text-white tracking-tight mt-1">
                            Jurisdicción Sanitaria No. 2 - Istmo (Juchitán de Zaragoza)
                        </h1>
                        <p className="text-xs text-slate-400">
                            Sistema Web de Gestión Operativa para Tamiz Neonatal y Red de Parteras Tradicionales
                        </p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Acceso Operativo 2026</span>
                </div>
            </header>

            {/* Contenedor Principal */}
            <main className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">

                {/* Banner Informativo Lateral */}
                <div className="md:col-span-4 bg-gradient-to-b from-teal-900 via-teal-950 to-slate-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                        <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/30 w-fit text-teal-300">
                            <HeartHandshake className="w-8 h-8" />
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-white leading-tight">
                                Salud Maternal e Infantil Integrada
                            </h2>
                            <p className="text-xs text-teal-100/80 mt-2 leading-relaxed">
                                Plataforma incluyente para el registro oportuno de tamices neonatales y la vinculación de la medicina tradicional indígena.
                            </p>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-2.5 text-xs text-teal-200">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Captura Directa de Muestras de Tamiz</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-teal-200">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Acceso por Voz y QR para Parteras</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-teal-200">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Alertas de Emergencia Obstétrica</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-6 pt-4 border-t border-teal-800/40 text-[11px] text-teal-300/70">
                        Juchitán • Tehuantepec • Salina Cruz • Ciudad Ixtepec • San Blas Atempa • Asunción Ixtaltepec • Espinal
                    </div>
                </div>

                {/* Área Central de Formulario y Pestañas */}
                <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between">

                    <div>
                        {/* Pestañas de Selección (Tabs WCAG Accessibility) */}
                        <div
                            role="tablist"
                            aria-label="Modalidad de Autenticación"
                            className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-6 gap-1"
                        >
                            <button
                                role="tab"
                                aria-selected={activeTab === 'INSTITUCIONAL'}
                                aria-controls="panel-institucional"
                                id="tab-institucional"
                                onClick={() => setActiveTab('INSTITUCIONAL')}
                                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${activeTab === 'INSTITUCIONAL'
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                    }`}
                            >
                                <Building2 className="w-4 h-4 shrink-0" />
                                <span>Personal Institucional</span>
                            </button>

                            <button
                                role="tab"
                                aria-selected={activeTab === 'PARTERA'}
                                aria-controls="panel-partera"
                                id="tab-partera"
                                onClick={() => setActiveTab('PARTERA')}
                                className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${activeTab === 'PARTERA'
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                                    }`}
                            >
                                <HeartHandshake className="w-4 h-4 shrink-0" />
                                <span>Partera Tradicional</span>
                            </button>
                        </div>

                        {/* TAB 1: ACCESO INSTITUCIONAL */}
                        {activeTab === 'INSTITUCIONAL' && (
                            <div id="panel-institucional" role="tabpanel" aria-labelledby="tab-institucional" className="space-y-5">

                                <form onSubmit={handleInstitutionalSubmit} className="space-y-4">

                                    {/* Selector de Rol Simulado para Pruebas Rápida */}
                                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Rol Operativo (Simulación rápida para evaluación)
                                        </label>
                                        <select
                                            value={rolSeleccionado}
                                            onChange={(e) => setRolSeleccionado(e.target.value as UserRole)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-teal-300 focus:outline-none focus:border-teal-400"
                                        >
                                            <option value={UserRole.CAPTURISTA_TAMIZ}>Capturista de Tamiz Neonatal</option>
                                            <option value={UserRole.ADMIN_JURISDICCIONAL}>Administrador Jurisdiccional</option>
                                            <option value={UserRole.GESTOR_PARTERAS}>Gestor Jurisdiccional de Parteras</option>
                                        </select>
                                    </div>

                                    {/* Campo Email */}
                                    <div>
                                        <label htmlFor="inst-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                                            Correo Electrónico Institucional
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                                            <input
                                                id="inst-email"
                                                type="email"
                                                required
                                                placeholder="usuario@salud.gob.mx"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Campo Contraseña */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label htmlFor="inst-password" className="block text-xs font-semibold text-slate-300">
                                                Contraseña Institucional
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowForgotPasswordModal(true)}
                                                className="text-[11px] text-teal-400 hover:text-teal-300 hover:underline focus-visible:outline-none"
                                            >
                                                ¿Olvidó su contraseña?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                                            <input
                                                id="inst-password"
                                                type="password"
                                                required
                                                placeholder="••••••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Botón Iniciar Sesión con Spinner State */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-white bg-teal-500 hover:bg-teal-400 shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                <span>Autenticando credenciales...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Iniciar Sesión Institucional</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                            </div>
                        )}

                        {/* TAB 2: ACCESO PARTERA TRADICIONAL (MÁXIMA ACCESIBILIDAD WCAG 2.1 AAA) */}
                        {activeTab === 'PARTERA' && (
                            <div id="panel-partera" role="tabpanel" aria-labelledby="tab-partera" className="space-y-6">

                                {/* Asistente por Voz (Web Speech API) */}
                                <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl">
                                            {isSpeaking ? <Volume2 className="w-6 h-6 animate-pulse text-amber-300" /> : <Volume2 className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-white">Asistencia por Voz</h3>
                                            <p className="text-[11px] text-emerald-200/80">Escuche las instrucciones en voz alta.</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={isSpeaking ? stopVoice : speakInstructions}
                                        className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${isSpeaking
                                            ? 'bg-amber-500 text-slate-950 shadow-md'
                                            : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                                            }`}
                                    >
                                        {isSpeaking ? (
                                            <>
                                                <VolumeX className="w-4 h-4" />
                                                <span>Detener</span>
                                            </>
                                        ) : (
                                            <>
                                                <Volume2 className="w-4 h-4" />
                                                <span>Escuchar Guía</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                                    {/* Opción A: Botón Gigante Escaneo QR */}
                                    <div className="space-y-3">
                                        <span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                                            Opción A: Credencial QR
                                        </span>

                                        <button
                                            type="button"
                                            onClick={handleStartQRScan}
                                            className="w-full min-h-[140px] p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/60 rounded-3xl flex flex-col items-center justify-center gap-3 group transition-all transform active:scale-95 text-center focus-visible:ring-4 focus-visible:ring-emerald-400"
                                        >
                                            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                                <QrCode className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-black text-white group-hover:text-emerald-300">
                                                    ESCANEAR CREDENCIAL QR
                                                </span>
                                                <span className="text-[11px] text-emerald-200/70">
                                                    Acerque su tarjeta a la cámara
                                                </span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Opción B: Teclado Numérico Gigante (Keypad PIN) */}
                                    <div className="space-y-3">
                                        <span className="block text-xs font-extrabold uppercase tracking-wider text-teal-400">
                                            Opción B: Código PIN de 4 Números
                                        </span>

                                        {/* Visor de Dígitos PIN */}
                                        <div className="flex justify-center items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 min-h-[52px]">
                                            {[0, 1, 2, 3].map((idx) => {
                                                const filled = pinDigits.length > idx;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${filled
                                                            ? 'bg-emerald-400 border-emerald-300 shadow-md shadow-emerald-400/40'
                                                            : 'border-slate-700 bg-slate-900'
                                                            }`}
                                                    >
                                                        {filled && <span className="w-2 h-2 rounded-full bg-slate-950" />}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Botones Numéricos Gigantes (3x4 Grid) */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => handleKeypadPress(num)}
                                                    className="min-h-[52px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-black text-xl rounded-2xl shadow-sm transition-all transform active:scale-90 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-400"
                                                >
                                                    {num}
                                                </button>
                                            ))}

                                            {/* Botón Borrar */}
                                            <button
                                                type="button"
                                                onClick={handleKeypadDelete}
                                                aria-label="Borrar último número"
                                                className="min-h-[52px] bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-2xl flex items-center justify-center active:scale-90 transition-all"
                                            >
                                                <Delete className="w-5 h-5" />
                                            </button>

                                            {/* Botón Cero */}
                                            <button
                                                type="button"
                                                onClick={() => handleKeypadPress('0')}
                                                className="min-h-[52px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-black text-xl rounded-2xl shadow-sm transition-all transform active:scale-90 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-400"
                                            >
                                                0
                                            </button>

                                            {/* Botón Limpiar */}
                                            <button
                                                type="button"
                                                onClick={handleKeypadClear}
                                                aria-label="Limpiar todos los números"
                                                className="min-h-[52px] bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 rounded-2xl flex items-center justify-center active:scale-90 transition-all"
                                            >
                                                <RotateCcw className="w-5 h-5" />
                                            </button>
                                        </div>

                                    </div>

                                </div>

                            </div>
                        )}

                    </div>

                    {/* Pie de Página de Soporte */}
                    <footer className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                        <span>Jurisdicción Sanitaria No. 2 - Istmo • Programa de Tamiz Neonatal</span>
                        <div className="flex items-center gap-2 text-slate-400">
                            <HelpCircle className="w-4 h-4 text-teal-400" />
                            <span>Soporte Técnico: 800 123 4567</span>
                        </div>
                    </footer>

                </div>

            </main>

            {/* Modal Simulado de Escáner de Cámara QR */}
            {showQRScannerModal && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 relative overflow-hidden">
                        <button
                            onClick={() => setShowQRScannerModal(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-black text-white">Escáner de Credencial QR</h3>
                            <p className="text-xs text-slate-400">Coloque el código QR en el recuadro para ingresar.</p>
                        </div>

                        {/* Simulación de Visor de Cámara con Láser Animado */}
                        <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden border-2 border-emerald-500/50 flex items-center justify-center">

                            {/* Fondo cámara simulada */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/30 to-black opacity-80" />

                            {/* Marco de Escaneo QR */}
                            <div className="relative w-44 h-44 border-2 border-dashed border-emerald-400 rounded-2xl flex items-center justify-center">
                                <Camera className="w-12 h-12 text-slate-700 opacity-40" />

                                {/* Línea Láser Animada */}
                                {isScanningQR && (
                                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/80 animate-[bounce_2s_infinite]" />
                                )}
                            </div>

                            {qrScanSuccess && (
                                <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center gap-2 text-emerald-300 font-bold text-sm animate-fade-in">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                                    <span>¡Credencial QR Verificada!</span>
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <span className="text-[11px] text-slate-400">
                                {isScanningQR ? 'Buscando código QR...' : 'Redirigiendo...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Olvidó Contraseña */}
            {showForgotPasswordModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4">
                        <h3 className="text-base font-bold text-white">Recuperación de Contraseña Institucional</h3>
                        <p className="text-xs text-slate-400">
                            Ingrese su correo institucional registrado para enviar el enlace de restablecimiento.
                        </p>

                        {forgotEmailSent ? (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                                ✓ Se ha enviado el enlace a su correo electrónico.
                            </div>
                        ) : (
                            <input
                                type="email"
                                placeholder="usuario@salud.gob.mx"
                                defaultValue={email}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => {
                                    setShowForgotPasswordModal(false);
                                    setForgotEmailSent(false);
                                }}
                                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                            >
                                Cerrar
                            </button>
                            {!forgotEmailSent && (
                                <button
                                    onClick={() => setForgotEmailSent(true)}
                                    className="px-3 py-1.5 bg-teal-500 text-white text-xs font-bold rounded-xl"
                                >
                                    Enviar Enlace
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
