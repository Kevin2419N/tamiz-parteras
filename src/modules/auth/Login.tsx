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
    AlertCircle
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
    const [, setIsScanningQR] = useState(false);
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

    const isInstitutional = activeTab === 'INSTITUCIONAL';

    return (
        <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-between p-3 sm:p-5 overflow-hidden selection:bg-teal-700 selection:text-white relative">
            
            {/* Imagen de fondo real "fondo-login.png" correctamente ajustada */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                style={{ backgroundImage: `url('/fondo-login.png')` }}
            />
            {/* Overlay sutil para dar contraste clínico profesional sin opacar el fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/60 via-blue-950/50 to-slate-950/70 backdrop-blur-[2px] z-0 pointer-events-none" />

            {/* Main Centered Container - Pro & Compact */}
            <div className="w-full max-w-4xl h-full max-h-[660px] flex flex-col justify-between z-10 my-auto gap-3">

                {/* Header Superior con Logos Oficiales y Cristal */}
                <header className="w-full bg-white/85 backdrop-blur-xl shadow-2xl rounded-2xl px-5 py-3 flex items-center justify-between gap-4 border border-white/50 shrink-0 transition-all">
                    <div className="flex items-center">
                        <img
                            src="/logo-jurisdiccion.png"
                            alt="Jurisdicción Sanitaria No. 2"
                            className="h-9 sm:h-11 w-auto object-contain"
                        />
                    </div>

                    <div className="text-center px-2 flex-1">
                        <h1 className="text-slate-900 text-xs sm:text-sm font-black tracking-tight leading-tight">
                            Jurisdicción Sanitaria No. 2 <span className="text-teal-700 font-light">|</span> Istmo
                        </h1>
                        <p className="text-slate-600 text-[10px] font-medium hidden sm:block">
                            Sistema Web de Gestión Operativa para Tamiz Neonatal y Red de Parteras Tradicionales
                        </p>
                    </div>

                    <div className="flex items-center">
                        <img
                            src="/Logo-Secretaria.png"
                            alt="Secretaría de Salud Oaxaca"
                            className="h-8 sm:h-10 w-auto object-contain"
                        />
                    </div>
                </header>

                {/* Tarjeta Principal Glassmorphic */}
                <main className="w-full flex-1 bg-slate-900/45 backdrop-blur-2xl shadow-[0_30px_70px_rgba(0,0,0,0.6)] rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-white/30 min-h-0 transition-all duration-500">

                    {/* Panel Izquierdo Dinámico (Cambia entre Azul Médico e Inteligente Teal/Esmeralda) */}
                    <div className={`md:col-span-5 p-6 sm:p-7 flex flex-col justify-between text-white relative overflow-hidden shrink-0 transition-all duration-700 ${
                        isInstitutional 
                            ? 'bg-gradient-to-br from-blue-950/90 via-blue-900/75 to-slate-950/90' 
                            : 'bg-gradient-to-br from-teal-950/90 via-emerald-900/75 to-slate-950/90'
                    }`}>
                        <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="space-y-4 relative z-10">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 transition-colors duration-500 ${
                                isInstitutional ? 'bg-blue-500/30 text-blue-200' : 'bg-teal-500/30 text-teal-200'
                            }`}>
                                {isInstitutional ? <Building2 className="w-6 h-6" /> : <HeartHandshake className="w-6 h-6" />}
                            </div>

                            <div className="space-y-2">
                                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border transition-colors duration-500 ${
                                    isInstitutional ? 'bg-blue-500/20 border-blue-400/40 text-blue-200' : 'bg-teal-500/20 border-teal-400/40 text-teal-200'
                                }`}>
                                    {isInstitutional ? 'Portal Institucional' : 'Módulo Comunitario'}
                                </span>
                                
                                <h2 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
                                    {isInstitutional ? 'Control Operativo de Tamizaje' : 'Red de Partería Tradicional'}
                                </h2>
                                
                                <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed font-normal">
                                    {isInstitutional 
                                        ? 'Acceso exclusivo para capturistas y personal médico autorizado en la gestión y seguimiento de tamices neonatales.' 
                                        : 'Sistema accesible y asistido por voz para el registro seguro de atenciones y referencias obstétricas de la partería.'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/20 relative z-10 text-[10px] text-slate-300 flex items-center justify-between">
                            <span>Servicios de Salud de Oaxaca</span>
                            <span className="font-bold text-white">Istmo 2026</span>
                        </div>
                    </div>

                    {/* Panel Derecho Translúcido ("Lo blanco transparente") */}
                    <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between bg-white/85 backdrop-blur-2xl overflow-y-auto">
                        <div>
                            {errorMessage && (
                                <div className="mb-3.5 p-3 bg-rose-50/90 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-900 text-xs font-bold shadow-sm animate-shake">
                                    <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {/* Pestañas de Selección Pro */}
                            <div className="grid grid-cols-2 p-1 bg-slate-200/80 backdrop-blur-sm rounded-2xl mb-4 gap-1.5 border border-slate-300/70 shadow-inner">
                                <button
                                    onClick={() => { setActiveTab('INSTITUCIONAL'); setErrorMessage(null); }}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                                        isInstitutional
                                            ? 'bg-blue-900 text-white shadow-md'
                                            : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Personal Institucional</span>
                                </button>

                                <button
                                    onClick={() => { setActiveTab('PARTERA'); setErrorMessage(null); }}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                                        !isInstitutional
                                            ? 'bg-teal-800 text-white shadow-md'
                                            : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
                                    <span>Partera Tradicional</span>
                                </button>
                            </div>

                            {/* Tab 1 Form: Institucional */}
                            {isInstitutional && (
                                <form onSubmit={handleInstitutionalSubmit} className="space-y-3.5 animate-fadeIn">
                                    <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-slate-300/70 shadow-sm">
                                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                            Perfil de Acceso
                                        </label>
                                        <select
                                            value={rolSeleccionado}
                                            onChange={(e) => setRolSeleccionado(e.target.value as UserRole)}
                                            className="w-full bg-white/90 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-900 cursor-pointer"
                                        >
                                            <option value={UserRole.CAPTURISTA_TAMIZ}>Capturista de Tamiz Neonatal</option>
                                            <option value={UserRole.MEDICO_UNIDAD}>Médico de Unidad / Contrareferencias</option>
                                            <option value={UserRole.ADMIN_JURISDICCIONAL}>Administrador Jurisdiccional</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Correo Electrónico Institucional
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                            <input
                                                type="email"
                                                required
                                                placeholder="usuario@salud.gob.mx"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white/90 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Contraseña
                                        </label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                            <input
                                                type="password"
                                                required
                                                placeholder="••••••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-white/90 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-1 py-3 px-5 rounded-xl font-bold text-xs text-white bg-blue-900 hover:bg-blue-950 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                <span>Iniciando sesión...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Entrar al Sistema</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Tab 2 Form: Partera Tradicional (Voz + QR + PIN con acento Teal/Esmeralda) */}
                            {!isInstitutional && (
                                <div className="space-y-3 animate-fadeIn">
                                    <div className="bg-teal-50/85 backdrop-blur-sm border border-teal-200 p-2.5 rounded-xl flex items-center justify-between gap-2.5 shadow-sm">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
                                                <Volume2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-900">Asistencia por Voz</h3>
                                                <p className="text-[10px] text-slate-600">Escuchar guía de acceso.</p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={isSpeaking ? stopVoice : speakInstructions}
                                            className="px-3 py-1.5 rounded-lg text-xs font-black bg-teal-800 hover:bg-teal-900 text-white shadow-sm cursor-pointer"
                                        >
                                            {isSpeaking ? 'Detener' : 'Escuchar'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                                        {/* Botón de Escaneo QR Pro */}
                                        <button
                                            type="button"
                                            onClick={handleStartQRScan}
                                            className="w-full h-full min-h-[140px] p-3 bg-gradient-to-br from-teal-50/90 to-white/95 hover:from-teal-100 hover:to-teal-50 border-2 border-teal-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group shadow-sm"
                                        >
                                            <div className="p-3 bg-teal-800 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                                                <QrCode className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <span className="block text-xs font-black text-slate-900">ESCANEAR QR</span>
                                                <span className="text-[10px] text-slate-600 font-medium">Credencial de partera</span>
                                            </div>
                                        </button>

                                        {/* Teclado PIN táctil */}
                                        <div className="space-y-2 bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-slate-300/70 shadow-sm">
                                            <div className="text-center">
                                                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
                                                    PIN de 4 Dígitos
                                                </span>
                                            </div>

                                            <div className="flex justify-center items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                                                {[0, 1, 2, 3].map((idx) => {
                                                    const filled = pinDigits.length > idx;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                                                                filled ? 'bg-teal-800 border-teal-800' : 'border-slate-300 bg-white'
                                                            }`}
                                                        >
                                                            {filled && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="grid grid-cols-3 gap-1">
                                                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                                                    <button
                                                        key={num}
                                                        type="button"
                                                        onClick={() => handleKeypadPress(num)}
                                                        className="h-8 bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-900 font-black text-xs rounded-lg shadow-sm cursor-pointer active:scale-95 transition-transform"
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={handleKeypadDelete}
                                                    className="h-8 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                                                >
                                                    <Delete className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleKeypadPress('0')}
                                                    className="h-8 bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-900 font-black text-xs rounded-lg cursor-pointer active:scale-95 transition-transform"
                                                >
                                                    0
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleKeypadClear}
                                                    className="h-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer de Tarjeta */}
                        <footer className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
                            <span>Jurisdicción Sanitaria No. 2 • Istmo</span>
                            <span>Soporte: 800 123 4567</span>
                        </footer>
                    </div>
                </main>
            </div>

            {/* Modal QR Scanner */}
            {showQRScannerModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl relative text-center">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <QrCode className="w-4 h-4 text-teal-800" />
                                <span>Escaneando Credencial...</span>
                            </h3>
                            <button onClick={handleCloseModal} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
                                <X className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>

                        <div className="w-full h-48 bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden border-2 border-teal-700">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                playsInline
                                muted
                                autoPlay
                            />
                            {qrScanSuccess && (
                                <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center gap-2 text-emerald-300">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                                    <span className="text-xs font-bold uppercase">¡Acceso Correcto!</span>
                                </div>
                            )}
                        </div>

                        <span className="text-[11px] text-slate-500 block">
                            Coloque el código QR frente a la cámara
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;