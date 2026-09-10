import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
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
    HelpCircle
} from 'lucide-react';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
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
            window.speechSynthesis.cancel();
            const text = 'Por favor, acerque su credencial con código QR a la cámara o ingrese su código de cuatro números.';
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-MX';
            utterance.rate = 0.9;
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

        login(userSimulado);
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
        <div className="min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100/70 via-slate-50 to-emerald-100/50 flex flex-col items-center justify-center p-4 selection:bg-emerald-600 selection:text-white">

            {/* Header Institucional de Servicios de Salud de Oaxaca */}
            <header className="w-full max-w-4xl mb-6 flex flex-col md:flex-row items-center justify-between bg-white/95 border border-slate-200/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-md gap-3 md:gap-4 text-center">
                <div className="flex items-center justify-center gap-6 md:contents">
                    <img
                        src="/logo-jurisdiccion.png"
                        alt="Logo Jurisdicción Sanitaria No. 2 Istmo"
                        loading="eager"
                        fetchPriority="high"
                        className="h-12 md:h-16 w-auto object-contain shrink-0 md:order-1"
                    />
                    <img
                        src="/Logo-Secretaria.png"
                        alt="Logo Secretaría de Salud"
                        loading="eager"
                        fetchPriority="high"
                        className="h-12 md:h-16 w-auto object-contain shrink-0 md:order-3"
                    />
                </div>

                <div className="flex flex-col items-center text-center md:order-2">
                    <h1 className="text-slate-900 text-xl md:text-2xl font-bold text-center">
                        Jurisdicción Sanitaria No. 2 - Istmo
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm font-medium text-center">
                        Sistema Web de Gestión Operativa para Tamiz Neonatal y Red de Parteras Tradicionales
                    </p>
                </div>
            </header>

            {/* Contenedor Principal (Modo Claro) */}
            <main className="w-full max-w-4xl bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">

                {/* Banner Informativo Lateral Guinda e Institucional */}
                <div className="md:col-span-4 bg-gradient-to-b from-[#9D2449] via-[#7A1B38] to-slate-900 p-6 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-fit text-rose-200">
                            <HeartHandshake className="w-8 h-8" />
                        </div>

                        <div>
                            <h2 className="text-xl font-black leading-tight text-white">
                                Salud Reproductiva
                            </h2>
                            <p className="text-xs text-rose-100/90 mt-2 leading-relaxed">
                                Plataforma incluyente para el registro oportuno de tamices neonatales y la vinculación de la medicina tradicional del Istmo.
                            </p>
                        </div>

                        <div className="space-y-2.5 pt-2">
                            <div className="flex items-center gap-2.5 text-xs text-rose-100 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Captura Directa de Muestras de Tamiz</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-rose-100 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Acceso por Voz y QR para Parteras</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-rose-100 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Alertas de Emergencia Obstétrica</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Área Central de Formulario y Pestañas */}
                <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between bg-white">

                    <div>
                        {/* Pestañas de Selección (Tabs WCAG Accessibility) */}
                        <div
                            role="tablist"
                            aria-label="Modalidad de Autenticación"
                            className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-6 gap-1"
                        >
                            <button
                                role="tab"
                                aria-selected={activeTab === 'INSTITUCIONAL'}
                                aria-controls="panel-institucional"
                                id="tab-institucional"
                                onClick={() => setActiveTab('INSTITUCIONAL')}
                                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9D2449] ${activeTab === 'INSTITUCIONAL'
                                    ? 'bg-[#9D2449] text-white shadow-md shadow-[#9D2449]/20'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
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
                                className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9D2449] ${activeTab === 'PARTERA'
                                    ? 'bg-[#9D2449] text-white shadow-md shadow-[#9D2449]/20 ring-2 ring-[#9D2449]'
                                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
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
                                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Rol Operativo (Simulación rápida para evaluación)
                                        </label>
                                        <select
                                            value={rolSeleccionado}
                                            onChange={(e) => setRolSeleccionado(e.target.value as UserRole)}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#9D2449] focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-[#9D2449]/20"
                                        >
                                            <option value={UserRole.CAPTURISTA_TAMIZ}>Capturista de Tamiz Neonatal</option>
                                            <option value={UserRole.ADMIN_JURISDICCIONAL}>Administrador Jurisdiccional</option>
                                            <option value={UserRole.GESTOR_PARTERAS}>Gestor Jurisdiccional de Parteras</option>
                                        </select>
                                    </div>

                                    {/* Campo Email */}
                                    <div>
                                        <label htmlFor="inst-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Correo Electrónico Institucional
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                            <input
                                                id="inst-email"
                                                type="email"
                                                required
                                                placeholder="usuario@salud.gob.mx"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#9D2449] focus:ring-2 focus:ring-[#9D2449]/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Campo Contraseña */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label htmlFor="inst-password" className="block text-xs font-bold text-slate-700">
                                                Contraseña Institucional
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowForgotPasswordModal(true)}
                                                className="text-[11px] font-bold text-[#9D2449] hover:text-[#7A1B38] hover:underline focus-visible:outline-none"
                                            >
                                                ¿Olvidó su contraseña?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                            <input
                                                id="inst-password"
                                                type="password"
                                                required
                                                placeholder="••••••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#9D2449] focus:ring-2 focus:ring-[#9D2449]/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Botón Iniciar Sesión con Spinner State */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#9D2449] hover:bg-[#7A1B38] shadow-md shadow-[#9D2449]/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
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
                                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                                            {isSpeaking ? <Volume2 className="w-6 h-6 animate-pulse text-amber-600" /> : <Volume2 className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900">Asistencia por Voz</h3>
                                            <p className="text-[11px] text-slate-600 font-medium">Escuche las instrucciones en voz alta.</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={isSpeaking ? stopVoice : speakInstructions}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${isSpeaking
                                            ? 'bg-amber-500 text-slate-950 shadow-md'
                                            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20'
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
                                        <span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                                            Opción A: Credencial QR
                                        </span>

                                        <button
                                            type="button"
                                            onClick={handleStartQRScan}
                                            className="w-full min-h-[140px] p-4 bg-emerald-50 hover:bg-emerald-100/80 border-2 border-emerald-500 rounded-3xl flex flex-col items-center justify-center gap-3 group transition-all transform active:scale-95 text-center focus-visible:ring-4 focus-visible:ring-emerald-600 shadow-sm"
                                        >
                                            <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                                                <QrCode className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-black text-slate-900 group-hover:text-emerald-800">
                                                    ESCANEAR CREDENCIAL QR
                                                </span>
                                                <span className="text-[11px] text-slate-600 font-medium">
                                                    Acerque su tarjeta a la cámara
                                                </span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Opción B: Teclado Numérico Gigante (Keypad PIN) */}
                                    <div className="space-y-3">
                                        <span className="block text-xs font-extrabold uppercase tracking-wider text-teal-800">
                                            Opción B: Código PIN de 4 Números
                                        </span>

                                        {/* Visor de Dígitos PIN */}
                                        <div className="flex justify-center items-center gap-3 bg-slate-100 p-3 rounded-2xl border border-slate-200 min-h-[52px]">
                                            {[0, 1, 2, 3].map((idx) => {
                                                const filled = pinDigits.length > idx;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${filled
                                                            ? 'bg-emerald-600 border-emerald-500 shadow-md'
                                                            : 'border-slate-300 bg-white'
                                                            }`}
                                                    >
                                                        {filled && <span className="w-2 h-2 rounded-full bg-white" />}
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
                                                    className="min-h-[52px] bg-white hover:bg-emerald-50 border border-slate-200 text-slate-900 font-black text-xl rounded-2xl shadow-sm transition-all transform active:scale-90 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-600"
                                                >
                                                    {num}
                                                </button>
                                            ))}

                                            {/* Botón Borrar */}
                                            <button
                                                type="button"
                                                onClick={handleKeypadDelete}
                                                aria-label="Borrar último número"
                                                className="min-h-[52px] bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-2xl flex items-center justify-center active:scale-90 transition-all font-bold"
                                            >
                                                <Delete className="w-5 h-5" />
                                            </button>

                                            {/* Botón Cero */}
                                            <button
                                                type="button"
                                                onClick={() => handleKeypadPress('0')}
                                                className="min-h-[52px] bg-white hover:bg-emerald-50 border border-slate-200 text-slate-900 font-black text-xl rounded-2xl shadow-sm transition-all transform active:scale-90 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-600"
                                            >
                                                0
                                            </button>

                                            {/* Botón Limpiar */}
                                            <button
                                                type="button"
                                                onClick={handleKeypadClear}
                                                aria-label="Limpiar todos los números"
                                                className="min-h-[52px] bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center active:scale-90 transition-all font-bold"
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
                    <footer className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                        <span>Jurisdicción Sanitaria No. 2 - Istmo • Programa de Tamiz Neonatal</span>
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <HelpCircle className="w-4 h-4 text-teal-700" />
                            <span>Soporte Técnico: 800 123 4567</span>
                        </div>
                    </footer>

                </div>

            </main>

            {/* Modal Simulado de Escáner de Cámara QR */}
            {showQRScannerModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 relative overflow-hidden shadow-2xl">
                        <button
                            onClick={() => setShowQRScannerModal(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-black text-slate-900">Escáner de Credencial QR</h3>
                            <p className="text-xs text-slate-500">Coloque el código QR en el recuadro para ingresar.</p>
                        </div>

                        {/* Simulación de Visor de Cámara con Láser Animado */}
                        <div className="relative w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-500/80 flex items-center justify-center">

                            {/* Fondo cámara simulada */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/40 to-black opacity-80" />

                            {/* Marco de Escaneo QR */}
                            <div className="relative w-44 h-44 border-2 border-dashed border-emerald-400 rounded-2xl flex items-center justify-center">
                                <Camera className="w-12 h-12 text-slate-600 opacity-50" />

                                {isScanningQR && (
                                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/80 animate-[bounce_2s_infinite]" />
                                )}
                            </div>

                            {qrScanSuccess && (
                                <div className="absolute inset-0 bg-emerald-900/90 flex flex-col items-center justify-center gap-2 text-emerald-200 font-bold text-sm animate-fade-in">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                                    <span>¡Credencial QR Verificada!</span>
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <span className="text-[11px] font-bold text-slate-500">
                                {isScanningQR ? 'Buscando código QR...' : 'Redirigiendo...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Olvidó Contraseña */}
            {showForgotPasswordModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
                        <h3 className="text-base font-bold text-slate-900">Recuperación de Contraseña Institucional</h3>
                        <p className="text-xs text-slate-600">
                            Ingrese su correo institucional registrado para enviar el enlace de restablecimiento.
                        </p>

                        {forgotEmailSent ? (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
                                ✓ Se ha enviado el enlace a su correo electrónico.
                            </div>
                        ) : (
                            <input
                                type="email"
                                placeholder="usuario@salud.gob.mx"
                                defaultValue={email}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                            />
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => {
                                    setShowForgotPasswordModal(false);
                                    setForgotEmailSent(false);
                                }}
                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                            >
                                Cerrar
                            </button>
                            {!forgotEmailSent && (
                                <button
                                    onClick={() => setForgotEmailSent(true)}
                                    className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl"
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
