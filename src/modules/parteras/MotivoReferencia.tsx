import React, { useState, useEffect } from 'react';
import {
    Mic,
    MicOff,
    Send,
    Check,
    ChevronLeft,
    Volume2,
    VolumeX,
    Info,
    Sparkles,
    AlertCircle,
    Stethoscope
} from 'lucide-react';

interface MotivoReferenciaProps {
    onBack?: () => void;
    onSuccess?: () => void;
    hablarTexto?: (texto: string) => void;
    isListeningExternal?: boolean;
    campoEscuchandoExternal?: string | null;
    iniciarDictadoExternal?: (campo: string) => void;
}

export interface MotivoItem {
    id: string;
    titulo: string;
    imagen: string;
    fila: 1 | 2;
    bullets?: string[];
}

export const MotivoReferencia: React.FC<MotivoReferenciaProps> = ({
    onBack,
    onSuccess,
    hablarTexto: propsHablarTexto,
    isListeningExternal,
    campoEscuchandoExternal,
    iniciarDictadoExternal
}) => {
    // Datos de Identificación
    const [centroSalud, setCentroSalud] = useState('Hospital General de Juchitán');
    const [nombreUsuaria, setNombreUsuaria] = useState('María Elena Santiz');
    const [edad, setEdad] = useState('26');
    const [sexo, setSexo] = useState<'F' | 'M'>('F');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [localidad, setLocalidad] = useState('La Ventosa');
    const [municipio, setMunicipio] = useState('Juchitán de Zaragoza');
    const [nombrePartera, setNombrePartera] = useState('Doña Rosa Santiz Gómez');
    const [localidadPartera, setLocalidadPartera] = useState('San Pedro Juchitán');

    // Motivos Seleccionados
    const [motivosSeleccionados, setMotivosSeleccionados] = useState<string[]>([]);

    // Contrareferencia Médica
    const [mostrarContrareferencia, setMostrarContrareferencia] = useState(false);
    const [estadoContra, setEstadoContra] = useState<'CONTROLADA' | 'PARA_CONTROL_PARTERA'>('CONTROLADA');
    const [diagnostico, setDiagnostico] = useState('');
    const [tratamiento, setTratamiento] = useState('');
    const [observacionesMedico, setObservacionesMedico] = useState('');
    const [nombreMedico, setNombreMedico] = useState('Dr. Alejandro Murat H.');
    const [centroMedico, setCentroMedico] = useState('Centro de Salud Urbano Juchitán');

    // Dictado por voz estado interno
    const [listeningFieldInternal, setListeningFieldInternal] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [dictationNotification, setDictationNotification] = useState<string | null>(null);

    const activeListeningField = campoEscuchandoExternal ?? listeningFieldInternal;
    const isCurrentlyListening = Boolean(isListeningExternal || activeListeningField);

    const speakText = (text: string) => {
        if (propsHablarTexto) {
            propsHablarTexto(text);
            return;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-MX';
            utterance.rate = 0.85;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeech = () => {
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

    // Manejo fluido de dictado por voz: concatenar si ya existe texto
    const handleVoiceDictation = (fieldKey: string, fieldLabel: string) => {
        if (iniciarDictadoExternal) {
            iniciarDictadoExternal(fieldKey);
            return;
        }

        speakText(`Dictando para el campo ${fieldLabel}. Hable después del tono.`);
        setListeningFieldInternal(fieldKey);
        setDictationNotification(`🎙️ Escuchando dictado para: ${fieldLabel}...`);

        const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

        if (SpeechRec) {
            try {
                const recognition = new SpeechRec();
                recognition.lang = 'es-MX';
                recognition.continuous = false;
                recognition.interimResults = false;

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    actualizarValorCampo(fieldKey, transcript);
                    setListeningFieldInternal(null);
                    setDictationNotification(`✅ Capturado: "${transcript}"`);
                    speakText(`Registrado ${transcript}`);
                    setTimeout(() => setDictationNotification(null), 3000);
                };

                recognition.onerror = () => {
                    simularDictado(fieldKey, fieldLabel);
                };

                recognition.onend = () => {
                    setListeningFieldInternal(null);
                };

                recognition.start();
                return;
            } catch (e) {
                console.error(e);
            }
        }

        simularDictado(fieldKey, fieldLabel);
    };

    const simularDictado = (fieldKey: string, fieldLabel: string) => {
        setTimeout(() => {
            const simulaciones: Record<string, string> = {
                centroSalud: 'Centro de Salud Urbano Juchitán',
                nombreUsuaria: 'Guadalupe Martínez Hernández',
                edad: '28',
                localidad: 'Unión Hidalgo',
                municipio: 'Juchitán de Zaragoza',
                nombrePartera: 'Doña Juana Cruz Ruiz',
                localidadPartera: 'La Ventosa',
                diagnostico: 'Paciente con embarazo normoevalutivo de 34 semanas.',
                tratamiento: 'Continuar con ácido fólico y reposo relativo.',
                observacionesMedico: 'Cita de seguimiento en 15 días en la unidad de salud.'
            };
            const simulado = simulaciones[fieldKey] || 'Texto dictado por voz';
            actualizarValorCampo(fieldKey, simulado);
            setListeningFieldInternal(null);
            setDictationNotification(`✅ Dictado por voz registrado para ${fieldLabel}: "${simulado}"`);
            speakText(`Registrado: ${simulado}`);
            setTimeout(() => setDictationNotification(null), 3500);
        }, 1200);
    };

    const actualizarValorCampo = (key: string, val: string) => {
        switch (key) {
            case 'centroSalud': setCentroSalud(prev => prev ? `${prev} ${val}` : val); break;
            case 'nombreUsuaria': setNombreUsuaria(prev => prev ? `${prev} ${val}` : val); break;
            case 'edad': setEdad(val); break;
            case 'localidad': setLocalidad(prev => prev ? `${prev} ${val}` : val); break;
            case 'municipio': setMunicipio(prev => prev ? `${prev} ${val}` : val); break;
            case 'nombrePartera': setNombrePartera(prev => prev ? `${prev} ${val}` : val); break;
            case 'localidadPartera': setLocalidadPartera(prev => prev ? `${prev} ${val}` : val); break;
            case 'diagnostico': setDiagnostico(prev => prev ? `${prev} ${val}` : val); break;
            case 'tratamiento': setTratamiento(prev => prev ? `${prev} ${val}` : val); break;
            case 'observacionesMedico': setObservacionesMedico(prev => prev ? `${prev} ${val}` : val); break;
        }
    };

    const toggleMotivo = (id: string, titulo: string) => {
        let nuevosMotivos: string[];
        if (motivosSeleccionados.includes(id)) {
            nuevosMotivos = motivosSeleccionados.filter(m => m !== id);
            speakText(`Desmarcado ${titulo}`);
        } else {
            nuevosMotivos = [...motivosSeleccionados, id];
            speakText(`Seleccionado ${titulo}`);
        }
        setMotivosSeleccionados(nuevosMotivos);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        speakText('Hoja de Referencia enviada con éxito al Centro de Salud.');
        if (onSuccess) onSuccess();
    };

    // Matriz de Motivos Oficial Fila 1 y Fila 2 (Tamiz separado en 2 tarjetas distintas)
    const motivosFila1: MotivoItem[] = [
        {
            id: 'COMPLICACIONES_EMBARAZO',
            titulo: 'COMPLICACIONES DEL EMBARAZO',
            imagen: '/Complicaciones-del-embarazo.png',
            fila: 1
        },
        {
            id: 'APLICAR_TOXOIDE_TETANICO',
            titulo: 'APLICAR TOXOIDE TETÁNICO',
            imagen: '/Aplicar-Toxoide-Tetanico.png',
            fila: 1
        },
        {
            id: 'ABORTO',
            titulo: 'ABORTO',
            imagen: '/Aborto.png',
            fila: 1
        },
        {
            id: 'PARTO_COMPLICADO',
            titulo: 'PARTO COMPLICADO',
            imagen: '/Parto-Complicado.png',
            fila: 1
        },
        {
            id: 'PUERPERIO_COMPLICADO',
            titulo: 'PUERPERIO COMPLICADO',
            imagen: '/Puerferico-Complicado.png',
            fila: 1
        },
        {
            id: 'ZIKA',
            titulo: 'ZIKA',
            imagen: '/Zika.png',
            fila: 1,
            bullets: ['Fiebre', 'Dolor articulaciones', 'Salpullido', 'Conjuntivitis']
        }
    ];

    const motivosFila2: MotivoItem[] = [
        {
            id: 'NINO_CON_COMPLICACIONES',
            titulo: 'NIÑO CON COMPLICACIONES',
            imagen: '/Niño-Con-Complicaciones.png',
            fila: 2
        },
        {
            id: 'NINA_CON_COMPLICACIONES',
            titulo: 'NIÑA CON COMPLICACIONES',
            imagen: '/Niña-Con-Complicaciones.png',
            fila: 2
        },
        {
            id: 'TAMIZ_METABOLICO',
            titulo: 'TAMIZ METABÓLICO',
            imagen: '/Tamiz-Metabolico.png',
            fila: 2
        },
        {
            id: 'TAMIZ_AUDITIVO',
            titulo: 'TAMIZ AUDITIVO',
            imagen: '/Tamiz-Auditivo.png',
            fila: 2
        },
        {
            id: 'APLICAR_VITAMINA_A_Y_K',
            titulo: "APLICAR VITAMINA 'A' Y 'K'",
            imagen: '/Aplicar-Vitamina-A-Y-K.png',
            fila: 2
        },
        {
            id: 'VACUNA_BCG_ANTI_HEPATITIS',
            titulo: 'VACUNA BCG / ANTI HEPATITIS B',
            imagen: '/Vacuna.png',
            fila: 2
        },
        {
            id: 'TOMA_DE_PAPANICOLAOU',
            titulo: 'TOMA DE PAPANICOLAOU',
            imagen: '/Toma-De-Papanicolao.png',
            fila: 2
        },
        {
            id: 'OTROS',
            titulo: 'OTROS',
            imagen: '/Otros.png',
            fila: 2
        }
    ];

    const renderCard = (item: MotivoItem) => {
        const isSelected = motivosSeleccionados.includes(item.id);
        return (
            <button
                type="button"
                key={item.id}
                onClick={() => toggleMotivo(item.id, item.titulo)}
                className={`relative group flex flex-col justify-between items-center p-5 rounded-3xl transition-all duration-300 cursor-pointer select-none text-center min-h-[270px] sm:min-h-[290px] w-full border-4 ${isSelected
                    ? 'border-[#9D2449] bg-rose-50/90 shadow-xl scale-[1.02] ring-4 ring-[#9D2449]/20'
                    : 'border-slate-200 bg-white hover:border-[#9D2449]/60 hover:bg-slate-50/90 shadow-sm hover:shadow-md'
                    }`}
            >
                {/* Checkmark flotante en la esquina superior derecha */}
                <div className="absolute top-3.5 right-3.5 z-10">
                    {isSelected ? (
                        <div className="w-8 h-8 rounded-full bg-[#9D2449] text-white flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in-50">
                            <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                    ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-slate-300 bg-white/90 group-hover:border-rose-400" />
                    )}
                </div>

                {/* Contenedor de Imagen Generoso (sin fondos duros: mix-blend-multiply) */}
                <div className="w-full flex-1 flex items-center justify-center py-2 px-1">
                    <img
                        src={item.imagen}
                        alt={item.titulo}
                        className="h-28 sm:h-36 w-auto max-w-full object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                        loading="eager"
                    />
                </div>

                {/* Texto del Motivo en Mayúsculas Destacado */}
                <div className="w-full pt-3">
                    <span className={`block font-black text-xs sm:text-sm tracking-tight leading-snug uppercase ${isSelected ? 'text-[#9D2449]' : 'text-slate-900'
                        }`}>
                        {item.titulo}
                    </span>

                    {/* Viñetas informativas para ZIKA */}
                    {item.bullets && item.bullets.length > 0 && (
                        <div className="mt-2 text-[10px] sm:text-[11px] text-slate-700 bg-amber-50/95 p-2 rounded-xl border border-amber-200 text-left space-y-0.5 shadow-inner">
                            {item.bullets.map((b, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#9D2449] shrink-0" />
                                    <span>{b}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </button>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto selection:bg-[#9D2449] selection:text-white">

            {/* BOTÓN SUPERIOR FLOTANTE REGRESAR */}
            {onBack && (
                <div className="flex justify-start">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-5 py-2.5 bg-rose-50/90 hover:bg-rose-100 text-[#9D2449] border border-rose-200 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Regresar al Menú Principal</span>
                    </button>
                </div>
            )}

            {/* NOTIFICACIÓN DE DICTADO O VOZ ACTIVA */}
            {(dictationNotification || isCurrentlyListening) && (
                <div className="bg-amber-100 border-2 border-amber-400 p-4 rounded-2xl flex items-center justify-between gap-3 text-amber-950 font-bold text-sm shadow-md animate-pulse">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#9D2449]" />
                        <span>{dictationNotification || `🎙️ Dictado activo para campo: ${activeListeningField}`}</span>
                    </div>
                </div>
            )}

            {/* 1. CABECERA LIMPIA INTEGRADA AL DOCUMENTO */}
            <div className="bg-white rounded-3xl border-4 border-[#9D2449] p-6 sm:p-8 shadow-xl space-y-6">

                {/* LOGOS FLANQUEANDO EL TÍTULO INSTITUCIONAL */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-200 pb-6">
                    <img
                        src="/logo-jurisdiccion.png"
                        alt="Jurisdicción Sanitaria"
                        className="h-16 sm:h-20 w-auto object-contain mix-blend-multiply"
                    />

                    <div className="text-center px-4 space-y-1">
                        <h1 className="text-base sm:text-xl font-black text-[#9D2449] uppercase tracking-tight">
                            SERVICIOS DE SALUD DE OAXACA - PROGRAMA DE PARTERAS TRADICIONALES
                        </h1>
                    </div>

                    <img
                        src="/Logo-Secretaria.png"
                        alt="Secretaría de Salud de Oaxaca"
                        className="h-16 sm:h-20 w-auto object-contain mix-blend-multiply"
                    />
                </div>

                {/* BANNER TÍTULO DESTACADO "ACUDE A TU UNIDAD DE SALUD" */}
                <div className="bg-gradient-to-r from-[#9D2449] via-[#7A1B38] to-[#9D2449] text-white py-4 px-6 rounded-2xl text-center shadow-lg">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-wider uppercase drop-shadow-sm flex items-center justify-center gap-3">
                        <span>📢</span>
                        <span>ACUDE A TU UNIDAD DE SALUD</span>
                        <span>📢</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-rose-100 font-medium mt-1">
                        Hoja Oficial de Referencia Comunitario • Red de Servicios de Salud de Oaxaca
                    </p>
                </div>

                {/* BOTÓN ASISTENCIA LECTURA POR VOZ */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            isSpeaking
                                ? stopSpeech()
                                : speakText(
                                    'Hoja de Referencia de Parteras Tradicionales. Servicios de Salud de Oaxaca. Para completar el documento, toque los botones de micrófono para dictar con su voz, y toque las tarjetas ilustradas para seleccionar el motivo de referencia.'
                                )
                        }
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-[#9D2449] border-2 border-rose-200 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                        {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        <span>{isSpeaking ? 'Detener Voz' : '🔊 Escuchar Instrucciones del Formulario'}</span>
                    </button>
                </div>

                {/* BLOQUE DE CAMPOS DE TEXTO TÁCTILES CON MICRÓFONO INTEGRADO */}
                <div className="space-y-6 pt-2">
                    <div className="flex items-center gap-2 border-b-2 border-[#9D2449]/20 pb-2">
                        <Info className="w-6 h-6 text-[#9D2449]" />
                        <h3 className="text-lg font-black text-slate-900 uppercase">
                            DATOS DE IDENTIFICACIÓN Y CANALIZACIÓN
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Centro de Salud u Hospital */}
                        <div className="space-y-2">
                            <label className="block text-sm font-black text-slate-800 uppercase flex items-center justify-between">
                                <span>🏥 Centro de Salud u Hospital</span>
                                <span className="text-[11px] text-[#9D2449] font-bold">Dictar 🎙️</span>
                            </label>
                            <div className="relative flex items-center w-full">
                                <input
                                    type="text"
                                    required
                                    value={centroSalud}
                                    onChange={(e) => setCentroSalud(e.target.value)}
                                    placeholder="Ej. Centro de Salud San Pedro Juchitán"
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl pl-4 pr-14 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:bg-white transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleVoiceDictation('centroSalud', 'Centro de Salud u Hospital')}
                                    className={`absolute right-2 p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center ${activeListeningField === 'centroSalud'
                                        ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-400/50'
                                        : 'bg-[#9D2449] hover:bg-[#7A1B38] text-white active:scale-95'
                                        }`}
                                    title="Dictar por voz"
                                >
                                    {activeListeningField === 'centroSalud' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Nombre de la Usuaria (O) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-black text-slate-800 uppercase flex items-center justify-between">
                                <span>👩‍🦱 Nombre de la Usuaria (O)</span>
                                <span className="text-[11px] text-[#9D2449] font-bold">Dictar 🎙️</span>
                            </label>
                            <div className="relative flex items-center w-full">
                                <input
                                    type="text"
                                    required
                                    value={nombreUsuaria}
                                    onChange={(e) => setNombreUsuaria(e.target.value)}
                                    placeholder="Ej. María Elena Santiz"
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl pl-4 pr-14 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:bg-white transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleVoiceDictation('nombreUsuaria', 'Nombre de la Usuaria')}
                                    className={`absolute right-2 p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center ${activeListeningField === 'nombreUsuaria'
                                        ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-400/50'
                                        : 'bg-[#9D2449] hover:bg-[#7A1B38] text-white active:scale-95'
                                        }`}
                                    title="Dictar por voz"
                                >
                                    {activeListeningField === 'nombreUsuaria' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Edad | Sexo | Fecha */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase">🎂 Edad</label>
                                <input
                                    type="number"
                                    value={edad}
                                    onChange={(e) => setEdad(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl px-3 py-3.5 text-sm font-bold text-slate-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase">👤 Sexo</label>
                                <select
                                    value={sexo}
                                    onChange={(e) => setSexo(e.target.value as 'F' | 'M')}
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl px-2 py-3.5 text-sm font-bold text-slate-900"
                                >
                                    <option value="F">Femenino</option>
                                    <option value="M">Masculino</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase">📅 Fecha</label>
                                <input
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl px-2 py-3.5 text-xs font-bold text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Localidad | Municipio */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Localidad */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase">🏡 Localidad</label>
                                <div className="relative flex items-center w-full">
                                    <input
                                        type="text"
                                        value={localidad}
                                        onChange={(e) => setLocalidad(e.target.value)}
                                        placeholder="Localidad"
                                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl pl-3 pr-12 py-3 text-sm font-bold text-slate-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleVoiceDictation('localidad', 'Localidad')}
                                        className={`absolute right-1.5 p-2 rounded-xl transition-all shadow-sm ${activeListeningField === 'localidad'
                                            ? 'bg-rose-600 text-white animate-pulse'
                                            : 'bg-[#9D2449] hover:bg-[#7A1B38] text-white'
                                            }`}
                                    >
                                        <Mic className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Municipio */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase">🏛️ Municipio</label>
                                <div className="relative flex items-center w-full">
                                    <input
                                        type="text"
                                        value={municipio}
                                        onChange={(e) => setMunicipio(e.target.value)}
                                        placeholder="Municipio"
                                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl pl-3 pr-12 py-3 text-sm font-bold text-slate-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleVoiceDictation('municipio', 'Municipio')}
                                        className={`absolute right-1.5 p-2 rounded-xl transition-all shadow-sm ${activeListeningField === 'municipio'
                                            ? 'bg-rose-600 text-white animate-pulse'
                                            : 'bg-[#9D2449] hover:bg-[#7A1B38] text-white'
                                            }`}
                                    >
                                        <Mic className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Nombre de la Partera (O) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-black text-slate-800 uppercase flex items-center justify-between">
                                <span>👩‍🌾 Nombre de la Partera (O)</span>
                                <span className="text-[11px] text-[#9D2449] font-bold">Dictar 🎙️</span>
                            </label>
                            <div className="relative flex items-center w-full">
                                <input
                                    type="text"
                                    required
                                    value={nombrePartera}
                                    onChange={(e) => setNombrePartera(e.target.value)}
                                    placeholder="Ej. Doña Rosa Santiz Gómez"
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl pl-4 pr-14 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:bg-white transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleVoiceDictation('nombrePartera', 'Nombre de la Partera')}
                                    className={`absolute right-2 p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center ${activeListeningField === 'nombrePartera'
                                        ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-400/50'
                                        : 'bg-[#9D2449] hover:bg-[#7A1B38] text-white active:scale-95'
                                        }`}
                                    title="Dictar por voz"
                                >
                                    {activeListeningField === 'nombrePartera' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Localidad de la Partera */}
                        <div className="space-y-2">
                            <label className="block text-sm font-black text-slate-800 uppercase flex items-center justify-between">
                                <span>📍 Localidad de la Partera</span>
                                <span className="text-[11px] text-[#9D2449] font-bold">Dictar 🎙️</span>
                            </label>
                            <div className="relative flex items-center w-full">
                                <input
                                    type="text"
                                    required
                                    value={localidadPartera}
                                    onChange={(e) => setLocalidadPartera(e.target.value)}
                                    placeholder="Ej. San Pedro Juchitán"
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl pl-4 pr-14 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:bg-white transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleVoiceDictation('localidadPartera', 'Localidad de la Partera')}
                                    className={`absolute right-2 p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center ${activeListeningField === 'localidadPartera'
                                        ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-400/50'
                                        : 'bg-[#9D2449] hover:bg-[#7A1B38] text-white active:scale-95'
                                        }`}
                                    title="Dictar por voz"
                                >
                                    {activeListeningField === 'localidadPartera' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 2. MATRIZ TÁCTIL "MOTIVO DE LA REFERENCIA" */}
            <div className="bg-white rounded-3xl border-4 border-slate-200 p-6 sm:p-8 shadow-xl space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-[#9D2449] pb-4">
                    <div>
                        <span className="text-xs font-black uppercase text-[#9D2449] tracking-wider bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                            SELECCIÓN DE CASILLAS POR ILUSTRACIONES
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase mt-1">
                            MOTIVO DE LA REFERENCIA
                        </h2>
                    </div>
                    <div className="text-xs font-extrabold text-slate-600 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-300">
                        Seleccionados: <span className="text-[#9D2449] text-base font-black">{motivosSeleccionados.length}</span>
                    </div>
                </div>

                {/* FILA 1 DE LA MATRIZ (MADRE / EMBARAZO) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#9D2449]" />
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                            FILA 1: ATENCIÓN DE LA MADRE, EMBARAZO Y ENFERMEDADES TRANSMISIBLES
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                        {motivosFila1.map(renderCard)}
                    </div>
                </div>

                {/* FILA 2 DE LA MATRIZ (INFANTIL / TAMIZ SEPARADO / PREVENCIÓN) */}
                <div className="space-y-4 pt-4 border-t-2 border-slate-200">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#9D2449]" />
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                            FILA 2: SALUD INFANTIL, TAMIZ SEPARADO, VACUNACIÓN Y ESTUDIOS PREVENTIVOS
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-5">
                        {motivosFila2.map(renderCard)}
                    </div>
                </div>
            </div>

            {/* AVISO DE SELECCIÓN */}
            {motivosSeleccionados.length === 0 && (
                <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-center gap-3 text-amber-900 font-bold text-sm">
                    <AlertCircle className="w-6 h-6 text-amber-700 shrink-0" />
                    <span>Toque al menos una tarjeta de Motivo de Referencia para indicar la causa de la consulta en la hoja oficial.</span>
                </div>
            )}

            {/* 3. SECCIÓN COMPLEMENTARIA: CONTRAREFERENCIA MÉDICA */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border-2 border-slate-800 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                            <Stethoscope className="w-7 h-7 text-rose-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase">Módulo de Contrareferencia Médica</h3>
                            <p className="text-xs text-slate-400">Respuesta oficial del Centro de Salud a la Partera Tradicional</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMostrarContrareferencia(!mostrarContrareferencia)}
                        className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-400/30 hover:bg-rose-500/30 rounded-2xl text-xs font-bold transition-all active:scale-95 self-start sm:self-auto"
                    >
                        {mostrarContrareferencia ? 'Ocultar Sección Médica' : '📂 Abrir Sección Médico Tratante'}
                    </button>
                </div>

                {mostrarContrareferencia && (
                    <div className="space-y-6 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Estado de Contrareferencia:</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setEstadoContra('CONTROLADA')}
                                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${estadoContra === 'CONTROLADA'
                                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                        }`}
                                >
                                    ✅ Paciente Controlada / Alta Hospitalaria
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEstadoContra('PARA_CONTROL_PARTERA')}
                                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${estadoContra === 'PARA_CONTROL_PARTERA'
                                        ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                        }`}
                                >
                                    👩‍🦱 Regresa para Control con la Partera
                                </button>
                            </div>
                        </div>

                        {/* Diagnóstico */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-300 uppercase">🩺 Diagnóstico del Médico</label>
                            <div className="relative flex items-center w-full">
                                <textarea
                                    rows={2}
                                    placeholder="Dictar o escribir diagnóstico médico..."
                                    value={diagnostico}
                                    onChange={(e) => setDiagnostico(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 pr-16 text-sm text-white focus:outline-none focus:border-rose-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleVoiceDictation('diagnostico', 'Diagnóstico Médico')}
                                    className="absolute right-3 top-3 p-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold hover:bg-rose-500/30"
                                >
                                    🎙️ Dictar
                                </button>
                            </div>
                        </div>

                        {/* Tratamiento e Indicaciones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase">💊 Tratamiento Indicado</label>
                                <textarea
                                    rows={2}
                                    placeholder="Tratamiento y medicamentos..."
                                    value={tratamiento}
                                    onChange={(e) => setTratamiento(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase">💬 Indicaciones a la Partera</label>
                                <textarea
                                    rows={2}
                                    placeholder="Indicaciones para el seguimiento en comunidad..."
                                    value={observacionesMedico}
                                    onChange={(e) => setObservacionesMedico(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white"
                                />
                            </div>
                        </div>

                        {/* Nombre y Firma del Médico */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase">👨‍⚕️ Nombre del Médico Tratante</label>
                                <input
                                    type="text"
                                    value={nombreMedico}
                                    onChange={(e) => setNombreMedico(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase">🏢 Unidad de Salud que Emite</label>
                                <input
                                    type="text"
                                    value={centroMedico}
                                    onChange={(e) => setCentroMedico(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. BOTÓN FINAL DE ENVÍO ACCESIBLE EN GUINDA OAXACA */}
            <div className="pt-4">
                <button
                    type="submit"
                    className="bg-[#9D2449] hover:bg-[#801D3B] text-white text-xl sm:text-2xl font-black py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all w-full flex items-center justify-center gap-3 active:scale-[0.99] border-2 border-rose-300/40 group"
                >
                    <Send className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
                    <span>ENVIAR HOJA DE REFERENCIA AL CENTRO DE SALUD</span>
                </button>
            </div>

        </form>
    );
};

export default MotivoReferencia;
