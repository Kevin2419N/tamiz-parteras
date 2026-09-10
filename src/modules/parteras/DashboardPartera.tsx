import React, { useState, useEffect } from 'react';
import {
    Volume2,
    VolumeX,
    ShieldCheck,
    CheckCircle2,
    Ambulance,
    HeartPulse,
    Baby,
    Info,
    QrCode,
    KeyRound
} from 'lucide-react';
import { FormatoReferencia } from './components/FormatoReferencia';
import { FormatoCalendarioMujer } from './components/FormatoCalendarioMujer';
import { FormatoCalendarioNino } from './components/FormatoCalendarioNino';

export const DashboardPartera: React.FC = () => {
    // Estado de Autenticación PIN / QR
    const [pinIngresado, setPinIngresado] = useState('');
    const [autenticado, setAutenticado] = useState(true); // Inicializado en true para demo directa
    const [errorPin, setErrorPin] = useState(false);

    // Active Tab View: 'HOME' | 'REFERENCIA' | 'MUJER' | 'NINO'
    const [vistaActiva, setVistaActiva] = useState<'HOME' | 'REFERENCIA' | 'MUJER' | 'NINO'>('HOME');

    // Voice Synthesis State (Web Speech API)
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Voice Dictation (SpeechRecognition) State
    const [isListening, setIsListening] = useState(false);
    const [campoEscuchando, setCampoEscuchando] = useState<string | null>(null);

    // Feedback Modal
    const [registroExitoso, setRegistroExitoso] = useState(false);

    // Dictado por voz mediante Web Speech API
    const iniciarDictado = (campo: string) => {
        const windowSpeech = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!windowSpeech) {
            alert('El dictado por voz no está disponible en este navegador. Puede escribir el texto.');
            return;
        }

        try {
            const recognition = new windowSpeech();
            recognition.lang = 'es-MX';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsListening(true);
                setCampoEscuchando(campo);
            };

            recognition.onresult = (_event: any) => {
                setIsListening(false);
                setCampoEscuchando(null);
            };

            recognition.onerror = () => {
                setIsListening(false);
                setCampoEscuchando(null);
            };

            recognition.onend = () => {
                setIsListening(false);
                setCampoEscuchando(null);
            };

            recognition.start();
        } catch (e) {
            setIsListening(false);
            setCampoEscuchando(null);
        }
    };

    // Altavoz de Instrucciones por Voz
    const hablarTexto = (texto: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = 'es-MX';
            utterance.rate = 0.85;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const detenerVoz = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        };
    }, []);

    const handleValidarPin = (pin: string) => {
        if (pin === '1234' || pin.length === 4) {
            setAutenticado(true);
            setErrorPin(false);
            hablarTexto('Acceso verificado. Bienvenida Doña Rosa Santiz.');
        } else {
            setErrorPin(true);
        }
    };

    const handleFormSuccess = () => {
        setRegistroExitoso(true);
        setTimeout(() => {
            setRegistroExitoso(false);
            setVistaActiva('HOME');
        }, 2500);
    };

    // PANTALLA DE BLOQUEO POR PIN / QR (SI NO AUTENTICADO)
    if (!autenticado) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
                <div className="bg-slate-800 border-2 border-slate-700 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl">
                    <div className="w-16 h-16 bg-[#9D2449] rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg">
                        <KeyRound className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">Espacio Exclusivo Parteras</h2>
                        <p className="text-xs text-slate-300 mt-1">Ingrese su PIN de 4 dígitos o escanee su tarjeta QR SSO</p>
                    </div>

                    <div className="space-y-3">
                        <input
                            type="password"
                            maxLength={4}
                            placeholder="• • • •"
                            value={pinIngresado}
                            onChange={(e) => {
                                setPinIngresado(e.target.value);
                                if (e.target.value.length === 4) handleValidarPin(e.target.value);
                            }}
                            className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl py-4 text-center text-3xl font-black tracking-widest text-white focus:outline-none focus:border-[#9D2449]"
                        />
                        {errorPin && <p className="text-xs font-bold text-rose-400">PIN incorrecto. Pruebe 1234</p>}
                    </div>

                    <button
                        type="button"
                        onClick={() => handleValidarPin('1234')}
                        className="w-full py-4 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg"
                    >
                        <QrCode className="w-5 h-5" />
                        <span>Escanear Tarjeta QR / Ingresar Demo (1234)</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 selection:bg-[#9D2449] selection:text-white">

            {/* ENCABEZADO GUINDA INSTITUCIONAL OAXACA (SIN SIDEBAR ADMINISTRATIVO) */}
            <header className="bg-gradient-to-r from-[#9D2449] via-[#7A1B38] to-slate-900 text-white p-4 sm:p-6 shadow-xl sticky top-0 z-40">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center text-white shrink-0">
                            <ShieldCheck className="w-7 h-7 text-rose-200" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-rose-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                                    ESPACIO EXCLUSIVO • PARTERA TRADICIONAL
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                                Doña Rosa Santiz Gómez
                            </h1>
                            <p className="text-xs text-rose-100/90 font-medium">
                                Acreditada por Servicios de Salud de Oaxaca • PIN Verificado
                            </p>
                        </div>
                    </div>

                    {/* BOTÓN ASISTENCIA POR VOZ GIGANTE */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() =>
                                isSpeaking
                                    ? detenerVoz()
                                    : hablarTexto(
                                        'Bienvenida Doña Rosa. Seleccione entre las 3 opciones oficiales: Ficha de Referencia y Contrareferencia, Calendario de Atención a la Mujer o Calendario del Niño menor de 2 años.'
                                    )
                            }
                            className={`w-full sm:w-auto px-4 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 border ${isSpeaking
                                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-300/40 animate-pulse'
                                : 'bg-white text-[#9D2449] border-rose-200 hover:bg-rose-50'
                                }`}
                        >
                            {isSpeaking ? (
                                <>
                                    <VolumeX className="w-5 h-5" />
                                    <span>Detener Voz</span>
                                </>
                            ) : (
                                <>
                                    <Volume2 className="w-5 h-5 text-[#9D2449]" />
                                    <span>Escuchar Instrucciones por Voz</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">

                {/* NOTIFICACIÓN REGISTRO EXITOSO */}
                {registroExitoso && (
                    <div className="bg-emerald-50 border-4 border-emerald-400 p-8 rounded-3xl text-center space-y-4 shadow-2xl animate-bounce">
                        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                        <h2 className="text-2xl font-black text-emerald-950">¡Formato Oficial Enviado con Éxito!</h2>
                        <p className="text-sm font-bold text-emerald-800">
                            La información ha sido transmitida y respaldada en el sistema de los Servicios de Salud de Oaxaca.
                        </p>
                    </div>
                )}

                {/* VISTA HOME: 3 TARJETAS TÁCTILES ILUSTRADAS PRINCIPALES */}
                {vistaActiva === 'HOME' && (
                    <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-300 p-4 rounded-3xl flex items-center gap-3">
                            <Info className="w-6 h-6 text-amber-700 shrink-0" />
                            <p className="text-xs font-bold text-amber-900">
                                Toque una de las 3 tarjetas ilustradas de abajo para abrir la digitalización completa del formato físico correspondiente.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* TARJETA 1: FICHA DE REFERENCIA Y CONTRAREFERENCIA */}
                            <button
                                type="button"
                                onClick={() => {
                                    hablarTexto('Abriendo Formato 1: Ficha de Referencia y Contrareferencia.');
                                    setVistaActiva('REFERENCIA');
                                }}
                                className="bg-white hover:bg-rose-50/70 border-4 border-rose-200 hover:border-[#9D2449] p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all flex flex-col items-center justify-between text-center space-y-4 min-h-[300px] group active:scale-95"
                            >
                                <div className="w-20 h-20 bg-rose-100 text-rose-700 rounded-3xl flex items-center justify-center border-2 border-rose-300 shadow-inner group-hover:scale-110 transition-transform">
                                    <Ambulance className="w-12 h-12 text-rose-700" />
                                </div>
                                <div className="space-y-2">
                                    <span className="block text-xl font-black text-rose-900 group-hover:text-[#9D2449]">
                                        1. Ficha de Referencia y Contrareferencia
                                    </span>
                                    <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-extrabold border border-rose-300">
                                        🚨 Urgencias & Sección Médica
                                    </span>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Formato 1: Canalizaciones urgentes, Zika, Tamiz y módulo de respuesta médica.
                                    </p>
                                </div>
                            </button>

                            {/* TARJETA 2: CALENDARIO DE ATENCIÓN A LA MUJER */}
                            <button
                                type="button"
                                onClick={() => {
                                    hablarTexto('Abriendo Formato 2: Calendario de Atención a la Mujer.');
                                    setVistaActiva('MUJER');
                                }}
                                className="bg-white hover:bg-rose-50/70 border-4 border-slate-200 hover:border-[#9D2449] p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all flex flex-col items-center justify-between text-center space-y-4 min-h-[300px] group active:scale-95"
                            >
                                <div className="w-20 h-20 bg-purple-100 text-purple-800 rounded-3xl flex items-center justify-center border-2 border-purple-300 shadow-inner group-hover:scale-110 transition-transform">
                                    <HeartPulse className="w-12 h-12 text-purple-700" />
                                </div>
                                <div className="space-y-2">
                                    <span className="block text-xl font-black text-slate-900 group-hover:text-[#9D2449]">
                                        2. Calendario de Atención a la Mujer
                                    </span>
                                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-xs font-extrabold border border-purple-300">
                                        🤰 Embarazo, Parto, Puerperio & †
                                    </span>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Formato 2: Control meses 1-9, cinta MUAC, parto vertical/horizontal y muerte materna.
                                    </p>
                                </div>
                            </button>

                            {/* TARJETA 3: CALENDARIO DEL NIÑO/A (<2 AÑOS) */}
                            <button
                                type="button"
                                onClick={() => {
                                    hablarTexto('Abriendo Formato 3: Calendario del Niño menor de 2 años.');
                                    setVistaActiva('NINO');
                                }}
                                className="bg-white hover:bg-rose-50/70 border-4 border-slate-200 hover:border-[#9D2449] p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all flex flex-col items-center justify-between text-center space-y-4 min-h-[300px] group active:scale-95"
                            >
                                <div className="w-20 h-20 bg-sky-100 text-sky-800 rounded-3xl flex items-center justify-center border-2 border-sky-300 shadow-inner group-hover:scale-110 transition-transform">
                                    <Baby className="w-12 h-12 text-sky-700" />
                                </div>
                                <div className="space-y-2">
                                    <span className="block text-xl font-black text-slate-900 group-hover:text-[#9D2449]">
                                        3. Calendario del Niño/a (Menor de 2 años)
                                    </span>
                                    <span className="inline-block px-3 py-1 bg-sky-100 text-sky-900 rounded-full text-xs font-extrabold border border-sky-300">
                                        👶 Duplicado, Tamiz, Vacunas & Huella
                                    </span>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Formato 3: Semáforo nutricional, fechas de tamiz/vacunas y firma/huella digital.
                                    </p>
                                </div>
                            </button>

                        </div>
                    </div>
                )}

                {/* VISTA 1: FICHA DE REFERENCIA Y CONTRAREFERENCIA (FORMATO 1) */}
                {vistaActiva === 'REFERENCIA' && !registroExitoso && (
                    <FormatoReferencia
                        onBack={() => setVistaActiva('HOME')}
                        onSuccess={handleFormSuccess}
                        hablarTexto={hablarTexto}
                        isListening={isListening}
                        campoEscuchando={campoEscuchando}
                        iniciarDictado={iniciarDictado}
                    />
                )}

                {/* VISTA 2: CALENDARIO DE ATENCIÓN A LA MUJER (FORMATO 2) */}
                {vistaActiva === 'MUJER' && !registroExitoso && (
                    <FormatoCalendarioMujer
                        onBack={() => setVistaActiva('HOME')}
                        onSuccess={handleFormSuccess}
                        hablarTexto={hablarTexto}
                        isListening={isListening}
                        campoEscuchando={campoEscuchando}
                        iniciarDictado={iniciarDictado}
                    />
                )}

                {/* VISTA 3: CALENDARIO DEL NIÑO/A (<2 AÑOS) (FORMATO 3) */}
                {vistaActiva === 'NINO' && !registroExitoso && (
                    <FormatoCalendarioNino
                        onBack={() => setVistaActiva('HOME')}
                        onSuccess={handleFormSuccess}
                        hablarTexto={hablarTexto}
                        isListening={isListening}
                        campoEscuchando={campoEscuchando}
                        iniciarDictado={iniciarDictado}
                    />
                )}

            </main>
        </div>
    );
};
