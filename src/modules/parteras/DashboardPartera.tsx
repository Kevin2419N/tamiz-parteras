import React, { useState, useEffect } from 'react';
import {
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    AlertTriangle,
    Baby,
    HeartPulse,
    Ambulance,
    CheckCircle2,
    ShieldCheck,
    ChevronLeft,
    Send,
    Activity,
    Info
} from 'lucide-react';

export const DashboardPartera: React.FC = () => {
    // Active Tab View: 'HOME' | 'REFERENCIA' | 'MUJER' | 'NINO'
    const [vistaActiva, setVistaActiva] = useState<'HOME' | 'REFERENCIA' | 'MUJER' | 'NINO'>('HOME');

    // Voice Synthesis State (Web Speech API)
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Voice Dictation (SpeechRecognition) State
    const [isListening, setIsListening] = useState(false);
    const [campoEscuchando, setCampoEscuchando] = useState<string | null>(null);

    // Common Patient Form State
    const [nombreMadre, setNombreMadre] = useState('');
    const [nombreNino, setNombreNino] = useState('');
    const [comunidad, setComunidad] = useState('Juchitán de Zaragoza');
    const [observaciones, setObservaciones] = useState('');
    const [registroExitoso, setRegistroExitoso] = useState(false);

    // Form 1: Referencia y Contrareferencia (Urgencias)
    const [motivosTraslado, setMotivosTraslado] = useState<string[]>([]);
    const [hospitalDestino, setHospitalDestino] = useState('Hospital General de Juchitán');
    const [transporte, setTransporte] = useState('Ambulancia SSO / Comunitaria');

    // Form 2: Calendario Atención a la Mujer
    const [estadoNutricionalMujer, setEstadoNutricionalMujer] = useState<'VERDE' | 'AMARILLO' | 'ROJO'>('VERDE');
    const [signosAlarma, setSignosAlarma] = useState<string[]>([]);
    const [tipoParto, setTipoParto] = useState<'VERTICAL' | 'HORIZONTAL'>('VERTICAL');
    const [resultadoNacimiento, setResultadoNacimiento] = useState<string>('NINO_VIVO');

    // Form 3: Calendario del Niño/a (<2 años)
    const [escalaNutricionalNino, setEscalaNutricionalNino] = useState<'NEGRO' | 'AMARILLO' | 'ROJO'>('NEGRO');
    const [canalizacionesNino, setCanalizacionesNino] = useState<string[]>([
        'TAMIZ_NEONATAL',
        'VACUNAS_BCG'
    ]);
    const [tipoLactancia, setTipoLactancia] = useState<'EXCLUSIVA' | 'COMPLEMENTARIA'>('EXCLUSIVA');

    // Speech Recognition Setup
    const iniciarDictado = (campo: 'MADRE' | 'NINO' | 'COMUNIDAD' | 'NOTAS') => {
        const windowSpeech = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!windowSpeech) {
            alert('El dictado por voz no es soportado en este navegador. Puede ingresar el texto manualmente.');
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

            recognition.onresult = (event: any) => {
                const textoDictado = event.results[0][0].transcript;
                if (campo === 'MADRE') setNombreMadre(textoDictado);
                if (campo === 'NINO') setNombreNino(textoDictado);
                if (campo === 'COMUNIDAD') setComunidad(textoDictado);
                if (campo === 'NOTAS') setObservaciones((prev) => (prev ? `${prev}. ${textoDictado}` : textoDictado));
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

    // Speech Synthesis Assistant
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

    const toggleSignoAlarma = (signo: string) => {
        if (signosAlarma.includes(signo)) {
            setSignosAlarma(signosAlarma.filter((s) => s !== signo));
        } else {
            setSignosAlarma([...signosAlarma, signo]);
        }
    };

    const toggleCanalizacion = (item: string) => {
        if (canalizacionesNino.includes(item)) {
            setCanalizacionesNino(canalizacionesNino.filter((c) => c !== item));
        } else {
            setCanalizacionesNino([...canalizacionesNino, item]);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setRegistroExitoso(true);
        hablarTexto('El registro de atención ha sido enviado exitosamente al centro de salud.');
        setTimeout(() => {
            setRegistroExitoso(false);
            setVistaActiva('HOME');
            setSignosAlarma([]);
            setMotivosTraslado([]);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 selection:bg-[#9D2449] selection:text-white">

            {/* ENCABEZADO EXCLUSIVO PARA PARTERAS (SIN SIDEBAR ADMINISTRATIVO) */}
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
                                        'Bienvenida Doña Rosa. Seleccione la tarjeta del servicio que desea registrar: Ficha de emergencia, Calendario de la Mujer o Calendario del Niño.'
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

            {/* CONTENIDO PRINCIPAL SEGÚN LA VISTA ACTIVA */}
            <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">

                {/* VISTA 1: HOME CON 3 TARJETAS TÁCTILES ILUSTRADAS PRINCIPALES */}
                {vistaActiva === 'HOME' && (
                    <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-300 p-4 rounded-3xl flex items-center gap-3">
                            <Info className="w-6 h-6 text-amber-700 shrink-0" />
                            <p className="text-xs font-bold text-amber-900">
                                Toque una de las 3 opciones de abajo para llenar el formato oficial de salubridad con dibujos e íconos interactivos.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* TARJETA 1: FICHA DE REFERENCIA Y CONTRAREFERENCIA */}
                            <button
                                type="button"
                                onClick={() => {
                                    hablarTexto('Abriendo Ficha de Referencia y Contrareferencia para traslado de urgencias.');
                                    setVistaActiva('REFERENCIA');
                                }}
                                className="bg-white hover:bg-rose-50/70 border-4 border-rose-200 hover:border-[#9D2449] p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all flex flex-col items-center justify-between text-center space-y-4 min-h-[280px] group active:scale-95"
                            >
                                <div className="w-20 h-20 bg-rose-100 text-rose-700 rounded-3xl flex items-center justify-center border-2 border-rose-300 shadow-inner group-hover:scale-110 transition-transform">
                                    <Ambulance className="w-12 h-12 text-rose-700" />
                                </div>
                                <div className="space-y-2">
                                    <span className="block text-xl font-black text-rose-900 group-hover:text-[#9D2449]">
                                        1. Ficha de Referencia y Contrareferencia
                                    </span>
                                    <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-extrabold border border-rose-300">
                                        🚨 Atención de Urgencias
                                    </span>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Canalización inmediata al Hospital o Centro de Salud por complicaciones obstétricas.
                                    </p>
                                </div>
                            </button>

                            {/* TARJETA 2: CALENDARIO DE ATENCIÓN A LA MUJER */}
                            <button
                                type="button"
                                onClick={() => {
                                    hablarTexto('Abriendo Calendario de Atención a la Mujer para registrar control de embarazo o parto.');
                                    setVistaActiva('MUJER');
                                }}
                                className="bg-white hover:bg-rose-50/70 border-4 border-slate-200 hover:border-[#9D2449] p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all flex flex-col items-center justify-between text-center space-y-4 min-h-[280px] group active:scale-95"
                            >
                                <div className="w-20 h-20 bg-purple-100 text-purple-800 rounded-3xl flex items-center justify-center border-2 border-purple-300 shadow-inner group-hover:scale-110 transition-transform">
                                    <HeartPulse className="w-12 h-12 text-purple-700" />
                                </div>
                                <div className="space-y-2">
                                    <span className="block text-xl font-black text-slate-900 group-hover:text-[#9D2449]">
                                        2. Calendario de Atención a la Mujer
                                    </span>
                                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-xs font-extrabold border border-purple-300">
                                        🤰 Embarazo, Parto y Puerperio
                                    </span>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Semáforo nutricional, signos de alarma, parto vertical u horizontal y resultado.
                                    </p>
                                </div>
                            </button>

                            {/* TARJETA 3: CALENDARIO DEL NIÑO/A (<2 AÑOS) */}
                            <button
                                type="button"
                                onClick={() => {
                                    hablarTexto('Abriendo Calendario del Niño para seguimiento de tamiz, vacunas y lactancia.');
                                    setVistaActiva('NINO');
                                }}
                                className="bg-white hover:bg-rose-50/70 border-4 border-slate-200 hover:border-[#9D2449] p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all flex flex-col items-center justify-between text-center space-y-4 min-h-[280px] group active:scale-95"
                            >
                                <div className="w-20 h-20 bg-sky-100 text-sky-800 rounded-3xl flex items-center justify-center border-2 border-sky-300 shadow-inner group-hover:scale-110 transition-transform">
                                    <Baby className="w-12 h-12 text-sky-700" />
                                </div>
                                <div className="space-y-2">
                                    <span className="block text-xl font-black text-slate-900 group-hover:text-[#9D2449]">
                                        3. Calendario del Niño/a (Menor de 2 años)
                                    </span>
                                    <span className="inline-block px-3 py-1 bg-sky-100 text-sky-900 rounded-full text-xs font-extrabold border border-sky-300">
                                        👶 Tamiz, Vacunas y Nutrición
                                    </span>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Escala nutricional, gota de tamiz, vacunas BCG, vitamina A y lactancia exclusiva.
                                    </p>
                                </div>
                            </button>

                        </div>
                    </div>
                )}

                {/* MODAL / REGISTRO EXITOSO NOTIFICATION */}
                {registroExitoso && (
                    <div className="bg-emerald-50 border-4 border-emerald-400 p-8 rounded-3xl text-center space-y-4 shadow-2xl animate-bounce">
                        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                        <h2 className="text-2xl font-black text-emerald-950">¡Atención Registrada y Enviada a Salud!</h2>
                        <p className="text-sm font-bold text-emerald-800">
                            Se notificó exitosamente a la Jurisdicción Sanitaria No. 2 para la atención comunitaria.
                        </p>
                    </div>
                )}

                {/* VISTA 2: FORMULARIO 1 - REFERENCIA Y CONTRAREFERENCIA (URGENCIAS) */}
                {vistaActiva === 'REFERENCIA' && !registroExitoso && (
                    <form onSubmit={handleFormSubmit} className="space-y-6">

                        {/* BOTÓN REGRESAR */}
                        <button
                            type="button"
                            onClick={() => setVistaActiva('HOME')}
                            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl font-bold text-xs flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>Regresar al Menú Principal</span>
                        </button>

                        {/* BANNER ENCABEZADO DE URGENCIAS */}
                        <div className="bg-rose-700 text-white p-6 rounded-3xl shadow-lg border-2 border-rose-900 flex items-center gap-4">
                            <Ambulance className="w-12 h-12 text-rose-100 shrink-0" />
                            <div>
                                <h2 className="text-2xl font-black">Ficha de Referencia y Contrareferencia</h2>
                                <p className="text-xs text-rose-100">
                                    Formato oficial para canalización urgente de la paciente al hospital.
                                </p>
                            </div>
                        </div>

                        {/* CAMPOS CERO TECLADO: NOMBRE DE LA MADRE CON MICRÓFONO */}
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                            <label className="block text-base font-black text-slate-900">
                                👩‍🦱 Nombre Completo de la Madre
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. María Elena Santiz Juárez"
                                    value={nombreMadre}
                                    onChange={(e) => setNombreMadre(e.target.value)}
                                    className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-base text-slate-900 font-bold focus:outline-none focus:border-[#9D2449]"
                                />
                                <button
                                    type="button"
                                    onClick={() => iniciarDictado('MADRE')}
                                    className={`px-5 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md ${isListening && campoEscuchando === 'MADRE'
                                        ? 'bg-rose-600 text-white animate-pulse border-2 border-rose-300'
                                        : 'bg-rose-50 text-[#9D2449] border-2 border-rose-200 hover:bg-rose-100'
                                        }`}
                                >
                                    {isListening && campoEscuchando === 'MADRE' ? (
                                        <>
                                            <MicOff className="w-5 h-5" />
                                            <span>🔴 Escuchando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="w-5 h-5 text-[#9D2449]" />
                                            <span>🎙️ Presiona para Dictar Nombre</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* MOTIVOS DE TRASLADO / COMPLICACIONES ILUSTRADAS */}
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-rose-600" />
                                <span>Seleccione el Motivo de Urgencia / Traslado</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { id: 'HEMORRAGIA', titulo: '🩸 Sangrado / Hemorragia Vagina', desc: 'Sangrado abundante antes o después del parto' },
                                    { id: 'PREECLAMPSIA', titulo: '🧠 Lucecitas, Zumbido u Hinchazón', desc: 'Presión alta, dolor de cabeza o convulsiones' },
                                    { id: 'PARTO_PROLONGADO', titulo: '⏱️ Trabajo de Parto Prolongado', desc: 'Más de 12 horas con dolores fuertes sin nacer' },
                                    { id: 'FIEBRE', titulo: '🌡️ Fiebre Alta o Infección', desc: 'Temperatura elevada o líquido con mal olor' },
                                ].map((item) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() => {
                                            if (motivosTraslado.includes(item.id)) {
                                                setMotivosTraslado(motivosTraslado.filter((m) => m !== item.id));
                                            } else {
                                                setMotivosTraslado([...motivosTraslado, item.id]);
                                            }
                                        }}
                                        className={`p-4 rounded-2xl border-4 text-left transition-all flex items-start gap-3 ${motivosTraslado.includes(item.id)
                                            ? 'bg-rose-100 border-[#9D2449] text-rose-950 shadow-md'
                                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-400'
                                            }`}
                                    >
                                        <div className="mt-1">
                                            <input
                                                type="checkbox"
                                                checked={motivosTraslado.includes(item.id)}
                                                readOnly
                                                className="w-5 h-5 accent-[#9D2449]"
                                            />
                                        </div>
                                        <div>
                                            <span className="block font-black text-sm">{item.titulo}</span>
                                            <span className="text-xs font-medium text-slate-600">{item.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* HOSPITAL DE DESTINO Y MEDIO DE TRANSPORTE */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-3">
                                <label className="block text-sm font-black text-slate-900">🏥 Hospital de Destino</label>
                                <select
                                    value={hospitalDestino}
                                    onChange={(e) => setHospitalDestino(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900"
                                >
                                    <option value="Hospital General de Juchitán">Hospital General de Juchitán de Zaragoza</option>
                                    <option value="Hospital General de Tehuantepec">Hospital General de Tehuantepec</option>
                                    <option value="Hospital de Salina Cruz">Hospital de Especialidades Salina Cruz</option>
                                    <option value="Centro de Salud Comunitario">Centro de Salud Comunitario con Cama</option>
                                </select>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-3">
                                <label className="block text-sm font-black text-slate-900">🚑 Medio de Transporte</label>
                                <select
                                    value={transporte}
                                    onChange={(e) => setTransporte(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900"
                                >
                                    <option value="Ambulancia SSO / Comunitaria">Ambulancia Municipal / SSO</option>
                                    <option value="Vehículo Particular / Camioneta">Vehículo Comunitario Particular</option>
                                    <option value="Mototaxi / Transporte Local">Mototaxi / Taxi Comunitario</option>
                                </select>
                            </div>
                        </div>

                        {/* NOTAS Y OBSERVACIONES POR VOZ */}
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-3">
                            <label className="block text-sm font-black text-slate-900">📝 Notas u Observaciones Adicionales (Dictado por Voz)</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <textarea
                                    rows={2}
                                    placeholder="Dictar observaciones sobre la urgencia..."
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                                <button
                                    type="button"
                                    onClick={() => iniciarDictado('NOTAS')}
                                    className={`px-4 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md shrink-0 ${isListening && campoEscuchando === 'NOTAS'
                                        ? 'bg-rose-600 text-white animate-pulse border-2 border-rose-300'
                                        : 'bg-rose-50 text-[#9D2449] border-2 border-rose-200 hover:bg-rose-100'
                                        }`}
                                >
                                    {isListening && campoEscuchando === 'NOTAS' ? (
                                        <>
                                            <MicOff className="w-5 h-5" />
                                            <span>🔴 Escuchando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="w-5 h-5 text-[#9D2449]" />
                                            <span>🎙️ Dictar Notas</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* BOTÓN FINAL DE ENVÍO GUINDA OAXACA */}
                        <button
                            type="submit"
                            className="w-full py-5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-black text-lg rounded-3xl shadow-xl border-2 border-rose-300 flex items-center justify-center gap-3 transition-transform active:scale-95"
                        >
                            <Send className="w-6 h-6" />
                            <span>🚨 ENVIAR ALERTA DE URGENCIA HOSPITALARIA</span>
                        </button>
                    </form>
                )}

                {/* VISTA 3: FORMULARIO 2 - CALENDARIO DE ATENCIÓN A LA MUJER */}
                {vistaActiva === 'MUJER' && !registroExitoso && (
                    <form onSubmit={handleFormSubmit} className="space-y-6">

                        <button
                            type="button"
                            onClick={() => setVistaActiva('HOME')}
                            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl font-bold text-xs flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>Regresar al Menú Principal</span>
                        </button>

                        <div className="bg-purple-800 text-white p-6 rounded-3xl shadow-lg border-2 border-purple-950 flex items-center gap-4">
                            <HeartPulse className="w-12 h-12 text-purple-200 shrink-0" />
                            <div>
                                <h2 className="text-2xl font-black">Calendario de Atención a la Mujer</h2>
                                <p className="text-xs text-purple-100">
                                    Control de salud durante el Embarazo, Parto y Puerperio comunitarios.
                                </p>
                            </div>
                        </div>

                        {/* MADRE Y COMUNIDAD POR VOZ */}
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-black text-slate-900 mb-1">👩‍🦱 Nombre de la Madre</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nombre de la mujer..."
                                            value={nombreMadre}
                                            onChange={(e) => setNombreMadre(e.target.value)}
                                            className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => iniciarDictado('MADRE')}
                                            className="px-3 py-2 bg-rose-50 text-[#9D2449] border border-rose-200 rounded-2xl font-bold text-xs flex items-center gap-1"
                                        >
                                            <Mic className="w-4 h-4" />
                                            <span>Dictar</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-slate-900 mb-1">🏡 Comunidad / Municipio</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Comunidad..."
                                            value={comunidad}
                                            onChange={(e) => setComunidad(e.target.value)}
                                            className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => iniciarDictado('COMUNIDAD')}
                                            className="px-3 py-2 bg-rose-50 text-[#9D2449] border border-rose-200 rounded-2xl font-bold text-xs flex items-center gap-1"
                                        >
                                            <Mic className="w-4 h-4" />
                                            <span>Dictar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEMÁFORO DE ESTADO NUTRICIONAL */}
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <Activity className="w-6 h-6 text-emerald-600" />
                                <span>Semáforo de Estado Nutricional de la Mujer</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setEstadoNutricionalMujer('VERDE')}
                                    className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${estadoNutricionalMujer === 'VERDE'
                                        ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-lg scale-105'
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-300'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl mx-auto flex items-center justify-center font-black text-xl shadow-md">
                                        🟢
                                    </div>
                                    <span className="block font-black text-sm">Verde: Peso Normal</span>
                                    <span className="text-[11px] text-slate-600 font-medium">Saludable y bien alimentada</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEstadoNutricionalMujer('AMARILLO')}
                                    className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${estadoNutricionalMujer === 'AMARILLO'
                                        ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-lg scale-105'
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl mx-auto flex items-center justify-center font-black text-xl shadow-md">
                                        🟡
                                    </div>
                                    <span className="block font-black text-sm">Amarillo: Bajo Peso</span>
                                    <span className="text-[11px] text-slate-600 font-medium">Dar apoyo nutricional</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEstadoNutricionalMujer('ROJO')}
                                    className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${estadoNutricionalMujer === 'ROJO'
                                        ? 'bg-rose-100 border-rose-600 text-rose-950 shadow-lg scale-105'
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-300'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl mx-auto flex items-center justify-center font-black text-xl shadow-md">
                                        🔴
                                    </div>
                                    <span className="block font-black text-sm">Rojo: Riesgo Severo</span>
                                    <span className="text-[11px] text-slate-600 font-medium">Canalizar al médico</span>
                                </button>
                            </div>
                        </div>

                        {/* SIGNOS DE ALARMA ILUSTRADOS (CUADRÍCULA TÁCTIL) */}
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-[#9D2449]" />
                                <span>Signos de Alarma Ilustrados (Tocar cuadrículas para seleccionar)</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {[
                                    { id: 'DOLOR_CABEZA', icon: '🧠⚡', label: 'Dolor de cabeza / Lucecitas / Zumbido' },
                                    { id: 'HINCHAZON', icon: '🦵💧', label: 'Hinchazón de pies, piernas o cara' },
                                    { id: 'CONVULSIONES', icon: '⚡🔴', label: 'Convulsiones o ataques' },
                                    { id: 'DIFICULTAD_ORINAR', icon: '🚽🩸', label: 'Dificultad para orinar o sangrado' },
                                    { id: 'DOLOR_VIENTRE', icon: '🤰⚠️', label: 'Dolor de vientre antes de 8 meses' },
                                    { id: 'DIFICULTAD_RESPIRAR', icon: '🫁💨', label: 'Dificultad para respirar / Falta de aire' },
                                    { id: 'VOMITO_FRECUENTE', icon: '🤮⚠️', label: 'Vómito frecuente y constante' },
                                ].map((item) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() => toggleSignoAlarma(item.id)}
                                        className={`p-4 rounded-2xl border-4 text-left transition-all flex items-center gap-3 ${signosAlarma.includes(item.id)
                                            ? 'bg-rose-100 border-[#9D2449] text-rose-950 font-black shadow-md'
                                            : 'bg-slate-50 border-slate-200 text-slate-800 font-bold hover:border-slate-400'
                                            }`}
                                    >
                                        <span className="text-2xl">{item.icon}</span>
                                        <span className="text-xs">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* TIPO DE PARTO ATENDIDO */}
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                            <h3 className="text-base font-black text-slate-900">🧘‍♀️ Tipo de Parto Atendido</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setTipoParto('VERTICAL')}
                                    className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${tipoParto === 'VERTICAL'
                                        ? 'bg-purple-100 border-purple-700 text-purple-950 shadow-md'
                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-purple-300'
                                        }`}
                                >
                                    <span className="text-4xl block">🧘‍♀️</span>
                                    <span className="block font-black text-base">Parto Vertical</span>
                                    <span className="text-xs text-slate-600 font-medium">De pie, en cuclillas o de rodillas (Tradicional)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTipoParto('HORIZONTAL')}
                                    className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${tipoParto === 'HORIZONTAL'
                                        ? 'bg-purple-100 border-purple-700 text-purple-950 shadow-md'
                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-purple-300'
                                        }`}
                                >
                                    <span className="text-4xl block">🛌</span>
                                    <span className="block font-black text-base">Parto Horizontal</span>
                                    <span className="text-xs text-slate-600 font-medium">Acostada en camilla o cama</span>
                                </button>
                            </div>
                        </div>

                        {/* RESULTADO DEL NACIMIENTO */}
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                            <h3 className="text-base font-black text-slate-900">👶 Resultado del Nacimiento</h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                {[
                                    { id: 'NINO_VIVO', label: '👶🩵 Niño Vivo' },
                                    { id: 'NINA_VIVA', label: '👶🩷 Niña Viva' },
                                    { id: 'NINO_COMPLICADO', label: '⚠️🩵 Niño Complicado' },
                                    { id: 'NINA_COMPLICADA', label: '⚠️🩷 Niña Complicada' },
                                    { id: 'FALLECIDO', label: '🕊️ Niño/a Muerto' },
                                ].map((item) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() => setResultadoNacimiento(item.id)}
                                        className={`p-4 rounded-2xl border-4 text-center transition-all ${resultadoNacimiento === item.id
                                            ? 'bg-[#9D2449] text-white border-rose-300 font-black shadow-md'
                                            : 'bg-slate-50 border-slate-200 text-slate-800 font-bold hover:border-rose-300'
                                            }`}
                                    >
                                        <span className="text-xs block">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* BOTÓN DE ENVÍO */}
                        <button
                            type="submit"
                            className="w-full py-5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-black text-lg rounded-3xl shadow-xl border-2 border-rose-300 flex items-center justify-center gap-3 transition-transform active:scale-95"
                        >
                            <Send className="w-6 h-6" />
                            <span>REGISTRAR ATENCIÓN / ENVIAR A SALUD</span>
                        </button>
                    </form>
                )}

                {/* VISTA 4: FORMULARIO 3 - CALENDARIO DEL NIÑO/A (<2 AÑOS) */}
                {vistaActiva === 'NINO' && !registroExitoso && (
                    <form onSubmit={handleFormSubmit} className="space-y-6">

                        <button
                            type="button"
                            onClick={() => setVistaActiva('HOME')}
                            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl font-bold text-xs flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>Regresar al Menú Principal</span>
                        </button>

                        <div className="bg-sky-800 text-white p-6 rounded-3xl shadow-lg border-2 border-sky-950 flex items-center gap-4">
                            <Baby className="w-12 h-12 text-sky-200 shrink-0" />
                            <div>
                                <h2 className="text-2xl font-black">Calendario del Niño/a (Menor de 2 Años)</h2>
                                <p className="text-xs text-sky-100">
                                    Seguimiento de Tamiz Neonatal, Vacunas, Vitaminas y Lactancia Materna.
                                </p>
                            </div>
                        </div>

                        {/* NOMBRE DEL BEBÉ Y COMUNIDAD POR VOZ */}
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-black text-slate-900 mb-1">👶 Nombre del Recién Nacido / Niño</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nombre del bebé..."
                                            value={nombreNino}
                                            onChange={(e) => setNombreNino(e.target.value)}
                                            className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => iniciarDictado('NINO')}
                                            className="px-3 py-2 bg-rose-50 text-[#9D2449] border border-rose-200 rounded-2xl font-bold text-xs flex items-center gap-1"
                                        >
                                            <Mic className="w-4 h-4" />
                                            <span>Dictar</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-slate-900 mb-1">🏡 Comunidad / Localidad</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Comunidad..."
                                            value={comunidad}
                                            onChange={(e) => setComunidad(e.target.value)}
                                            className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => iniciarDictado('COMUNIDAD')}
                                            className="px-3 py-2 bg-rose-50 text-[#9D2449] border border-rose-200 rounded-2xl font-bold text-xs flex items-center gap-1"
                                        >
                                            <Mic className="w-4 h-4" />
                                            <span>Dictar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ESCALA NUTRICIONAL TÁCTIL */}
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                            <h3 className="text-base font-black text-slate-900">⚖️ Escala Nutricional Táctil del Niño</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setEscalaNutricionalNino('NEGRO')}
                                    className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${escalaNutricionalNino === 'NEGRO'
                                        ? 'bg-slate-900 text-white border-slate-950 shadow-lg scale-105'
                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-400'
                                        }`}
                                >
                                    <span className="text-3xl block">⚫</span>
                                    <span className="block font-black text-sm">Negro: Sin Desnutrición</span>
                                    <span className="text-[11px] opacity-80 font-medium">Peso y crecimiento adecuado</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEscalaNutricionalNino('AMARILLO')}
                                    className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${escalaNutricionalNino === 'AMARILLO'
                                        ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-lg scale-105'
                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-400'
                                        }`}
                                >
                                    <span className="text-3xl block">🟡</span>
                                    <span className="block font-black text-sm">Amarillo: Riesgo</span>
                                    <span className="text-[11px] text-slate-600 font-medium">Monitorear peso en 15 días</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEscalaNutricionalNino('ROJO')}
                                    className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${escalaNutricionalNino === 'ROJO'
                                        ? 'bg-rose-100 border-rose-600 text-rose-950 shadow-lg scale-105'
                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-rose-400'
                                        }`}
                                >
                                    <span className="text-3xl block">🔴</span>
                                    <span className="block font-black text-sm">Rojo: Desnutrido</span>
                                    <span className="text-[11px] text-slate-600 font-medium">Enviar a Centro de Salud</span>
                                </button>
                            </div>
                        </div>

                        {/* CANALIZACIONES CON ÍCONOS OFICIALES */}
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                            <h3 className="text-base font-black text-slate-900">
                                🏥 Canalizaciones y Pruebas Realizadas (Íconos Oficiales)
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { id: 'TAMIZ_NEONATAL', icon: '🦶🩸', title: 'Pie con Gota de Sangre', desc: 'Toma de Tamiz Neonatal (3 a 5 días de nacido)' },
                                    { id: 'VACUNAS_BCG', icon: '💉', title: 'Jeringa de Vacunación', desc: 'Vacunas BCG (Tuberculosis) y Hepatitis B' },
                                    { id: 'VITAMINAS_A_K', icon: '🟡💧', title: 'Gota A Amarillo', desc: 'Gotas de Vitaminas A y K para defensas' },
                                    { id: 'TAMIZ_AUDITIVO', icon: '🎧', title: 'Auriculares de Tamiz', desc: 'Tamiz Auditivo Neonatal (Revisión de oídos)' },
                                ].map((item) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() => toggleCanalizacion(item.id)}
                                        className={`p-4 rounded-2xl border-4 text-left transition-all flex items-start gap-3 ${canalizacionesNino.includes(item.id)
                                            ? 'bg-sky-100 border-sky-600 text-sky-950 font-black shadow-md'
                                            : 'bg-slate-50 border-slate-200 text-slate-800 font-bold hover:border-sky-300'
                                            }`}
                                    >
                                        <span className="text-3xl shrink-0">{item.icon}</span>
                                        <div>
                                            <span className="block text-sm font-black">{item.title}</span>
                                            <span className="text-xs text-slate-600 font-medium">{item.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* TIPO DE LACTANCIA MATERNA */}
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                            <h3 className="text-base font-black text-slate-900">🍼 Tipo de Lactancia Materna</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setTipoLactancia('EXCLUSIVA')}
                                    className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${tipoLactancia === 'EXCLUSIVA'
                                        ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-md'
                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-300'
                                        }`}
                                >
                                    <span className="text-4xl block">🍼✨</span>
                                    <span className="block font-black text-base">Exclusiva primeros 6 meses</span>
                                    <span className="text-xs text-slate-600 font-medium">Solo leche materna sin agua ni tés</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTipoLactancia('COMPLEMENTARIA')}
                                    className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${tipoLactancia === 'COMPLEMENTARIA'
                                        ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-md'
                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-300'
                                        }`}
                                >
                                    <span className="text-4xl block">🥣🍎</span>
                                    <span className="block font-black text-base">Después de 6 meses con alimentos</span>
                                    <span className="text-xs text-slate-600 font-medium">Leche materna + papillas y caldos comunitarios</span>
                                </button>
                            </div>
                        </div>

                        {/* BOTÓN FINAL DE ENVÍO */}
                        <button
                            type="submit"
                            className="w-full py-5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-black text-lg rounded-3xl shadow-xl border-2 border-rose-300 flex items-center justify-center gap-3 transition-transform active:scale-95"
                        >
                            <Send className="w-6 h-6" />
                            <span>REGISTRAR ATENCIÓN / ENVIAR A SALUD</span>
                        </button>
                    </form>
                )}

            </main>
        </div>
    );
};
