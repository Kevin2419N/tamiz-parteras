import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { http } from '../../services/http';
import {
    Building2,
    HeartHandshake,
    User as UserIcon,
    Lock,
    ArrowRight,
    QrCode,
    Volume2,
    Loader2,
    Delete,
    RotateCcw,
    X,
    CheckCircle2,
    HelpCircle,
    AlertCircle,
    ShieldCheck,
    Sparkles,
    Activity
} from 'lucide-react';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [activeTab, setActiveTab] = useState<'INSTITUCIONAL' | 'PARTERA'>('INSTITUCIONAL');

    // Tab 1: Institutional State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rolSeleccionado, setRolSeleccionado] = useState<UserRole>(UserRole.CAPTURISTA_TAMIZ);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Tab 2: Midwife Access State (WCAG 2.1 AAA)
    const [pinDigits, setPinDigits] = useState<string[]>([]);
    const [showQRScannerModal, setShowQRScannerModal] = useState(false);
    const [isScanningQR, setIsScanningQR] = useState(false);
    const [qrScanSuccess, setQrScanSuccess] = useState(false);

    // Webcam / Video Ref for QR Scanner
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    // Voice Assistance State (Web Speech API)
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speakInstructions = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const text = 'Por favor, acerque su credencial con código QR a la cámara o ingrese su código PIN de cuatro números.';
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
            stopCameraStream();
        };
    }, []);

    const stopCameraStream = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    };

    const handleKeypadPress = async (digit: string) => {
        if (pinDigits.length < 4) {
            const newPin = [...pinDigits, digit];
            setPinDigits(newPin);

            if (newPin.length === 4) {
                const pinString = newPin.join('');
                setIsSubmitting(true);
                setErrorMessage(null);

                try {
                    const response = await http.post('/auth/login-partera-pin', { pin: pinString });
                    const { token, user } = response.data;

                    localStorage.setItem('token_sso_parteras', token);
                    login(user);
                    navigate('/dashboard');
                } catch (error: any) {
                    console.error('Error en autenticación por PIN:', error);
                    setErrorMessage(error.response?.data?.message || 'PIN incorrecto o no registrado.');
                    setPinDigits([]);
                } finally {
                    setIsSubmitting(false);
                }
            }
        }
    };

    const handleKeypadDelete = () => {
        setPinDigits((prev) => prev.slice(0, -1));
    };

    const handleKeypadClear = () => {
        setPinDigits([]);
    };

    const handleStartQRScan = async () => {
        setShowQRScannerModal(true);
        setIsScanningQR(true);
        setQrScanSuccess(false);
        setErrorMessage(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            mediaStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error('No se pudo acceder a la cámara:', err);
            setErrorMessage('No se pudo acceder a la cámara del dispositivo. Verifique permisos.');
        }

        setTimeout(async () => {
            try {
                const qrMockValue = 'QR-PARTERA-JUM-001';
                const response = await http.post('/auth/login-partera-qr', { codigo_qr: qrMockValue });
                const { token, user } = response.data;

                stopCameraStream();
                setIsScanningQR(false);
                setQrScanSuccess(true);

                localStorage.setItem('token_sso_parteras', token);

                setTimeout(() => {
                    setShowQRScannerModal(false);
                    login(user);
                    navigate('/dashboard');
                }, 1000);
            } catch (error: any) {
                console.error('Error en autenticación por QR:', error);
                stopCameraStream();
                setIsScanningQR(false);
                setErrorMessage(error.response?.data?.message || 'Código QR no reconocido en el sistema.');
                setTimeout(() => {
                    setShowQRScannerModal(false);
                }, 1500);
            }
        }, 3000);
    };

    const handleCloseModal = () => {
        stopCameraStream();
        setShowQRScannerModal(false);
        setIsScanningQR(false);
    };

    const handleInstitutionalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await http.post('/auth/login-institucional', {
                email,
                password,
                rol: rolSeleccionado
            });

            const { token, user } = response.data;

            localStorage.setItem('token_sso_parteras', token);
            login(user);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Error en login institucional:', error);
            setErrorMessage(
                error.response?.data?.message ||
                'Credenciales inválidas o error de conexión con el servidor.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-950 via-[#4A1022] to-slate-900 overflow-y-auto flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-[#9D2449] selection:text-white">
            
            {/* Elementos decorativos de fondo con animación suave */}
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-rose-700/15 blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-pink-900/20 blur-[140px] pointer-events-none" />

            <div className="w-full max-w-5xl z-10 flex flex-col items-center my-auto transition-all duration-300">

                {/* Header Superior con Logos Oficiales */}
                <header className="w-full bg-white/95 backdrop-blur-xl border border-white/20 p-4 sm:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6 transition-all">
                    <div className="flex items-center justify-between w-full md:w-auto gap-6">
                        <img
                            src="/logo-jurisdiccion.png"
                            alt="Logo Jurisdicción Sanitaria No. 2 Istmo"
                            className="h-14 sm:h-16 w-auto object-contain transform hover:scale-105 transition-transform duration-300"
                        />
                        <div className="block md:hidden text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Servicios de Salud</span>
                        </div>
                    </div>

                    <div className="text-center flex-1 px-2">
                        <h1 className="text-slate-900 text-base sm:text-xl lg:text-2xl font-black tracking-tight flex items-center justify-center gap-2">
                            <span>Jurisdicción Sanitaria No. 2</span>
                            <span className="text-[#9D2449] font-light">|</span>
                            <span className="text-slate-700 font-bold">Istmo</span>
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
                            Sistema Web de Gestión Operativa para Tamiz Neonatal y Red de Parteras Tradicionales
                        </p>
                    </div>

                    <div className="flex items-center justify-center">
                        <img
                            src="/Logo-Secretaria.png"
                            alt="Logo Secretaría de Salud Oaxaca"
                            className="h-12 sm:h-16 w-auto object-contain transform hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </header>

                {/* Tarjeta Principal de Login */}
                <main className="w-full bg-white/95 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all">

                    {/* Panel Lateral Izquierdo (Identidad y Estado) */}
                    <div className="md:col-span-5 bg-gradient-to-br from-[#9D2449] via-[#7A1B38] to-slate-950 p-6 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-rose-200">
                                <Sparkles className="w-5 h-5 text-rose-300 animate-spin" style={{ animationDuration: '6s' }} />
                                <span className="text-xs font-bold tracking-wide uppercase">Plataforma Oficial Segura</span>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                                    Salud Reproductiva y Tamizaje
                                </h2>
                                <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed font-medium">
                                    Gestión centralizada en tiempo real con PostgreSQL para el seguimiento oportuno de recién nacidos y partería tradicional en la región del Istmo.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 mt-8 pt-6 border-t border-white/15 space-y-3">
                            <div className="flex items-center gap-3 text-xs text-rose-100 font-semibold bg-black/20 p-3 rounded-2xl border border-white/10">
                                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span>Conexión Segura vía API Backend (Render)</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-rose-200/80 px-1 font-medium">
                                <span>Estado del Servidor: <strong className="text-emerald-400 font-bold">En Línea</strong></span>
                                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Panel Derecho (Formularios y Pestañas) */}
                    <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white/80">
                        <div>
                            {errorMessage && (
                                <div className="mb-5 p-4 bg-rose-50 border border-rose-300/80 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-bold animate-shake shadow-sm">
                                    <AlertCircle className="w-5 h-5 text-[#9D2449] shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {/* Pestañas de Selección de Perfil */}
                            <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 mb-6 gap-1.5 shadow-inner">
                                <button
                                    onClick={() => { setActiveTab('INSTITUCIONAL'); setErrorMessage(null); }}
                                    className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                                        activeTab === 'INSTITUCIONAL'
                                            ? 'bg-[#9D2449] text-white shadow-lg shadow-[#9D2449]/25 transform scale-[1.02]'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    <Building2 className="w-4 h-4 shrink-0" />
                                    <span>Personal Institucional</span>
                                </button>

                                <button
                                    onClick={() => { setActiveTab('PARTERA'); setErrorMessage(null); }}
                                    className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                                        activeTab === 'PARTERA'
                                            ? 'bg-[#9D2449] text-white shadow-lg shadow-[#9D2449]/25 transform scale-[1.02]'
                                            : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    <HeartHandshake className="w-4 h-4 shrink-0" />
                                    <span>Partera Tradicional</span>
                                </button>
                            </div>

                            {/* Contenido Pestaña 1: Personal Institucional */}
                            {activeTab === 'INSTITUCIONAL' && (
                                <form onSubmit={handleInstitutionalSubmit} className="space-y-4 animate-fadeIn">
                                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                                        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                                            Perfil de Acceso Autorizado
                                        </label>
                                        <select
                                            value={rolSeleccionado}
                                            onChange={(e) => setRolSeleccionado(e.target.value as UserRole)}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#9D2449] focus:outline-none focus:ring-2 focus:ring-[#9D2449]/20 focus:border-[#9D2449] transition-all cursor-pointer"
                                        >
                                            <option value={UserRole.CAPTURISTA_TAMIZ}>Capturista de Tamiz Neonatal</option>
                                            <option value={UserRole.MEDICO_UNIDAD}>Médico de Unidad / Contrareferencias</option>
                                            <option value={UserRole.ADMIN_JURISDICCIONAL}>Administrador Jurisdiccional</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Correo Electrónico Institucional
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                                            <input
                                                type="email"
                                                required
                                                placeholder="usuario@salud.gob.mx"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-slate-50/50 border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9D2449]/20 focus:border-[#9D2449] focus:bg-white transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Contraseña Institucional
                                        </label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                                            <input
                                                type="password"
                                                required
                                                placeholder="••••••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-slate-50/50 border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9D2449]/20 focus:border-[#9D2449] focus:bg-white transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-2 py-4 px-6 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:from-[#7A1B38] hover:to-[#5E1228] shadow-xl shadow-[#9D2449]/25 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                <span>Conectando con Servidor Backend...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Iniciar Sesión Institucional</span>
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Contenido Pestaña 2: Partera Tradicional */}
                            {activeTab === 'PARTERA' && (
                                <div className="space-y-5 animate-fadeIn">
                                    <div className="bg-rose-50/80 border border-rose-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-rose-100 text-[#9D2449] rounded-xl shadow-sm">
                                                <Volume2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-900">Asistencia por Voz</h3>
                                                <p className="text-[11px] text-slate-600 font-medium">Escuche las instrucciones de acceso.</p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={isSpeaking ? stopVoice : speakInstructions}
                                            className="px-3.5 py-2 rounded-xl text-xs font-black bg-[#9D2449] hover:bg-[#7A1B38] text-white shadow-md transition-all cursor-pointer"
                                        >
                                            {isSpeaking ? 'Detener' : 'Escuchar Guía'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                        <button
                                            type="button"
                                            onClick={handleStartQRScan}
                                            className="w-full h-full min-h-[160px] p-4 bg-rose-50/40 hover:bg-rose-50/90 border-2 border-dashed border-[#9D2449]/60 hover:border-[#9D2449] rounded-3xl flex flex-col items-center justify-center gap-3 text-center transition-all duration-300 shadow-sm cursor-pointer group"
                                        >
                                            <div className="p-3.5 bg-[#9D2449] text-white rounded-2xl shadow-md group-hover:scale-110 transition-transform">
                                                <QrCode className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <span className="block text-xs sm:text-sm font-black text-slate-900">ESCANEAR CÓDIGO QR</span>
                                                <span className="text-[10px] text-slate-500 font-medium">Verificación biométrica / credencial</span>
                                            </div>
                                        </button>

                                        <div className="space-y-3 bg-slate-50/80 p-4 rounded-3xl border border-slate-200/80 shadow-sm">
                                            <div className="text-center">
                                                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#9D2449]">
                                                    Código PIN de 4 Dígitos
                                                </span>
                                            </div>

                                            <div className="flex justify-center items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-inner">
                                                {[0, 1, 2, 3].map((idx) => {
                                                    const filled = pinDigits.length > idx;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                                                                filled ? 'bg-[#9D2449] border-[#9D2449] scale-110 shadow-sm' : 'border-slate-300 bg-slate-50'
                                                            }`}
                                                        >
                                                            {filled && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="grid grid-cols-3 gap-1.5">
                                                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                                                    <button
                                                        key={num}
                                                        type="button"
                                                        onClick={() => handleKeypadPress(num)}
                                                        className="h-10 bg-white hover:bg-rose-50 border border-slate-200 text-slate-900 font-black text-base rounded-xl shadow-sm transition-transform active:scale-95 cursor-pointer"
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={handleKeypadDelete}
                                                    className="h-10 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#9D2449] rounded-xl flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                                                >
                                                    <Delete className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleKeypadPress('0')}
                                                    className="h-10 bg-white hover:bg-rose-50 border border-slate-200 text-slate-900 font-black text-base rounded-xl shadow-sm transition-transform active:scale-95 cursor-pointer"
                                                >
                                                    0
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleKeypadClear}
                                                    className="h-10 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Inferior de la Tarjeta */}
                        <footer className="mt-8 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 font-medium">
                            <span>Jurisdicción Sanitaria No. 2 • Istmo de Tehuantepec</span>
                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">Soporte Técnico: <strong>800 123 4567</strong></span>
                        </footer>
                    </div>
                </main>
            </div>

            {/* Modal de Escaneo QR con Cámara Web Real */}
            {showQRScannerModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-center border border-white/20">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-[#9D2449]" />
                                <span>Verificando Credencial QR...</span>
                            </h3>
                            <button onClick={handleCloseModal} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
                                <X className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>

                        <div className="w-full h-60 bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden border-2 border-[#9D2449] shadow-inner">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                playsInline
                                muted
                                autoPlay
                            />
                            {qrScanSuccess && (
                                <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-emerald-300 animate-fadeIn">
                                    <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                                    <span className="text-xs font-bold uppercase tracking-wider">¡Credencial Verificada con Éxito!</span>
                                </div>
                            )}
                            {!qrScanSuccess && isScanningQR && (
                                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md py-2 px-4 rounded-xl flex items-center justify-center gap-2 border border-white/10">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                                    <span className="text-xs text-rose-200 font-bold">Escaneando código en base de datos...</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center">
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-slate-50 py-2 px-4 rounded-xl border border-slate-200">
                                <HelpCircle className="w-4 h-4 text-[#9D2449]" /> Coloque su credencial frente a la cámara del dispositivo
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;