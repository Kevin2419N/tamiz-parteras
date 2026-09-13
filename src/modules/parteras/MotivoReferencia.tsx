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
    AlertCircle
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
    imagenes: string[];
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
    // Datos de Identificación y Encabezado
    const [centroSalud, setCentroSalud] = useState('Hospital General de Juchitán');
    const [nombreUsuaria, setNombreUsuaria] = useState('María Elena Santiz');
    const [edad, setEdad] = useState('26');
    const [sexo, setSexo] = useState<'F' | 'M'>('F');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [localidad, setLocalidad] = useState('La Ventosa');
    const [municipio, setMunicipio] = useState('Juchitán de Zaragoza');
    const [nombrePartera, setNombrePartera] = useState('Doña Rosa Santiz Gómez');
    const [localidadPartera, setLocalidadPartera] = useState('San Pedro Juchitán');

    // Selección de Motivos de Referencia
    const [motivosSeleccionados, setMotivosSeleccionados] = useState<string[]>([]);

    // Dictado por voz interno
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
            utterance.rate = 0.88;
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

    // Manejador de Dictado por Voz Táctil
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

        // Fallback simulación con valores realistas
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
                localidadPartera: 'La Ventosa'
            };
            const simulado = simulaciones[fieldKey] || 'Texto dictado por voz';
            actualizarValorCampo(fieldKey, simulado);
            setListeningFieldInternal(null);
            setDictationNotification(`✅ Dictado simulado para ${fieldLabel}: "${simulado}"`);
            speakText(`Registrado: ${simulado}`);
            setTimeout(() => setDictationNotification(null), 3500);
        }, 1500);
    };

    const actualizarValorCampo = (key: string, val: string) => {
        switch (key) {
            case 'centroSalud': setCentroSalud(val); break;
            case 'nombreUsuaria': setNombreUsuaria(val); break;
            case 'edad': setEdad(val); break;
            case 'localidad': setLocalidad(val); break;
            case 'municipio': setMunicipio(val); break;
            case 'nombrePartera': setNombrePartera(val); break;
            case 'localidadPartera': setLocalidadPartera(val); break;
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

    // Matriz de Motivos oficial replicando la hoja física SSO (13 items)
    const motivosFila1: MotivoItem[] = [
        {
            id: 'COMPLICACIONES_EMBARAZO',
            titulo: 'COMPLICACIONES DEL EMBARAZO',
            imagenes: ['/Complicaciones-del-embarazo.png'],
            fila: 1
        },
        {
            id: 'APLICAR_TOXOIDE_TETANICO',
            titulo: 'APLICAR TOXOIDE TETÁNICO',
            imagenes: ['/Aplicar-Toxoide-Tetanico.png'],
            fila: 1
        },
        {
            id: 'ABORTO',
            titulo: 'ABORTO',
            imagenes: ['/Aborto.png'],
            fila: 1
        },
        {
            id: 'PARTO_COMPLICADO',
            titulo: 'PARTO COMPLICADO',
            imagenes: ['/Parto-Complicado.png'],
            fila: 1
        },
        {
            id: 'PUERPERIO_COMPLICADO',
            titulo: 'PUERPERIO COMPLICADO',
            imagenes: ['/Puerferico-Complicado.png'],
            fila: 1
        },
        {
            id: 'ZIKA',
            titulo: 'ZIKA',
            imagenes: ['/Zika.png'],
            fila: 1,
            bullets: ['Fiebre', 'Dolor articulaciones', 'Salpullido', 'Conjuntivitis']
        }
    ];

    const motivosFila2: MotivoItem[] = [
        {
            id: 'NINO_CON_COMPLICACIONES',
            titulo: 'NIÑO CON COMPLICACIONES',
            imagenes: ['/Niño-Con-Complicaciones.png'],
            fila: 2
        },
        {
            id: 'NINA_CON_COMPLICACIONES',
            titulo: 'NIÑA CON COMPLICACIONES',
            imagenes: ['/Niña-Con-Complicaciones.png'],
            fila: 2
        },
        {
            id: 'TAMIZ_METABOLICO_AUDITIVO',
            titulo: 'TAMIZ METABÓLICO / AUDITIVO',
            imagenes: ['/Tamiz-Metabolico.png', '/Tamiz-Auditivo.png'],
            fila: 2
        },
        {
            id: 'APLICAR_VITAMINA_A_Y_K',
            titulo: "APLICAR VITAMINA 'A' y 'K'",
            imagenes: ['/Aplicar-Vitamina-A-Y-K.png'],
            fila: 2
        },
        {
            id: 'VACUNA_BCG_ANTI_HEPATITIS',
            titulo: 'VACUNA BCG - ANTI HEPATITIS',
            imagenes: ['/Vacuna.png'],
            fila: 2
        },
        {
            id: 'TOMA_DE_PAPANICOLAOU',
            titulo: 'TOMA DE PAPANICOLAOU',
            imagenes: ['/Toma-De-Papanicolao.png'],
            fila: 2
        },
        {
            id: 'OTROS',
            titulo: 'OTROS',
            imagenes: ['/Otros.png'],
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
                className={`relative group flex flex-col justify-between items-center p-4 rounded-3xl transition-all duration-200 cursor-pointer select-none text-center min-h-[260px] sm:min-h-[280px] w-full border-4 ${isSelected
                    ? 'border-[#9D2449] bg-rose-50/90 shadow-xl scale-[1.02] ring-4 ring-[#9D2449]/20'
                    : 'border-slate-200 bg-white hover:border-rose-300 hover:bg-slate-50/80 shadow-sm hover:shadow-md'
                    }`}
            >
                {/* Checkmark flotante en la esquina superior derecha */}
                <div className="absolute top-3 right-3 z-10">
                    {isSelected ? (
                        <div className="w-8 h-8 rounded-full bg-[#9D2449] text-white flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in-50">
                            <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                    ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-slate-300 bg-white/90 group-hover:border-rose-400" />
                    )}
                </div>

                {/* Contenedor de Imagen Generoso (Sin Fondo) */}
                <div className="w-full flex-1 flex items-center justify-center py-2 px-1">
                    {item.imagenes.length > 1 ? (
                        <div className="flex items-center justify-center gap-2 h-28 sm:h-32 w-full">
                            {item.imagenes.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`${item.titulo} ${idx + 1}`}
                                    className="h-full max-h-32 w-auto object-contain drop-shadow-sm transition-transform group-hover:scale-105"
                                    loading="eager"
                                />
                            ))}
                        </div>
                    ) : (
                        <img
                            src={item.imagenes[0]}
                            alt={item.titulo}
                            className="h-28 sm:h-36 w-auto max-w-full object-contain drop-shadow-sm transition-transform group-hover:scale-105"
                            loading="eager"
                        />
                    )}
                </div>

                {/* Texto del Motivo en Mayúsculas Destacado */}
                <div className="w-full pt-2">
                    <span className={`block font-black text-xs sm:text-sm tracking-tight leading-snug uppercase ${isSelected ? 'text-[#9D2449]' : 'text-slate-900'
                        }`}>
                        {item.titulo}
                    </span>

                    {/* Viñetas informativas para ZIKA */}
                    {item.bullets && item.bullets.length > 0 && (
                        <div className="mt-2 text-[10px] sm:text-[11px] text-slate-700 bg-amber-50/90 p-2 rounded-xl border border-amber-200/80 text-left space-y-0.5 shadow-inner">
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
            {/* BOTÓN REGRESAR SI APLICA */}
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Regresar al Menú Principal</span>
                </button>
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

            {/* 1. ENCABEZADO INSTITUCIONAL OFICIAL SSO */}
            <div className="bg-white rounded-3xl border-4 border-[#9D2449] p-6 sm:p-8 shadow-xl space-y-6">
                {/* LOGOS FLANQUEANDO EL TÍTULO INSTITUCIONAL */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-200 pb-6">
                    <img
                        src="/Logo-Secretaria.png"
                        alt="Secretaría de Salud de Oaxaca"
                        className="h-16 sm:h-20 w-auto object-contain"
                    />

                    <div className="text-center px-4 space-y-1">
                        <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#9D2449] bg-rose-50 px-3 py-1 rounded-full border border-rose-200 inline-block">
                            GOBIERNO DEL ESTADO DE OAXACA
                        </span>
                        <h1 className="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                            SERVICIOS DE SALUD DE OAXACA - PROGRAMA DE PARTERAS TRADICIONALES
                        </h1>
                    </div>

                    <img
                        src="/logo-jurisdiccion.png"
                        alt="Jurisdicción Sanitaria"
                        className="h-16 sm:h-20 w-auto object-contain"
                    />
                </div>

                {/* TÍTULO DESTACADO "ACUDE A TU UNIDAD DE SALUD" */}
                <div className="bg-gradient-to-r from-[#9D2449] via-[#7A1B38] to-[#9D2449] text-white py-4 px-6 rounded-2xl text-center shadow-lg">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-wider uppercase drop-shadow-sm flex items-center justify-center gap-3">
                        <span>📢</span>
                        <span>ACUDE A TU UNIDAD DE SALUD</span>
                        <span>📢</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-rose-100 font-medium mt-1">
                        Hoja Oficial de Referencia Comunitario - Red de Servicios de Salud de Oaxaca
                    </p>
                </div>

                {/* BOTÓN ASISTENCIA AUDIO INFORMATIVO */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            isSpeaking
                                ? stopSpeech()
                                : speakText(
                                    'Hoja de Referencia de Parteras Tradicionales. Puede llenar los campos tocando los micrófonos guinda para dictar su voz, y tocar las tarjetas con imágenes para indicar el motivo de la referencia.'
                                )
                        }
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-[#9D2449] border-2 border-rose-200 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        <span>{isSpeaking ? 'Detener Voz' : 'Escuchar Instrucciones del Formulario'}</span>
                    </button>
                </div>

                {/* BLOQUE DE CAMPOS DE TEXTO TÁCTILES (CON DICTADO POR VOZ GIGANTE) */}
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
                                <span className="text-[10px] text-[#9D2449] font-bold">Tocar 🎙️ para dictar</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    value={centroSalud}
                                    onChange={(e) => setCentroSalud(e.target.value)}
                                    placeholder="Ej. Centro de Salud San Pedro Juchitán"
                                    className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleVoiceDictation('centroSalud', 'Centro de Salud u Hospital')}
                                    className={`bg-[#9D2449] hover:bg-[#7A1B38] text-white p-3.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0 ${activeListeningField === 'centroSalud' ? 'ring-4 ring-rose-400 animate-pulse bg-rose-700' : ''
                                        }`}
                                    title="Dictar por voz"
                                >
                                    {activeListeningField === 'centroSalud' ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                                </button>
                            </div>
                        </div>

                        {/* Nombre de la Usuaria (O) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-black text-slate-800 uppercase flex items-center justify-between">
                                <span>👩‍🦱 Nombre de la Usuaria (O)</span>
                                <span className="text-[10px] text-[#9D2449] font-bold">Tocar 🎙️ para dictar</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    value={nombreUsuaria}
                                    onChange={(e) => setNombreUsuaria(e.target.value)}
                                    placeholder="Ej. María Elena Santiz"
                                    className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleVoiceDictation('nombreUsuaria', 'Nombre de la Usuaria')}
                                    className={`bg-[#9D2449] hover:bg-[#7A1B38] text-white p-3.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0 ${activeListeningField === 'nombreUsuaria' ? 'ring-4 ring-rose-400 animate-pulse bg-rose-700' : ''
                                        }`}
                                    title="Dictar por voz"
                                >
                                    {activeListeningField === 'nombreUsuaria' ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                                </button>
                            </div>
                        </div>

                        {/* Edad | Sexo | Fecha */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase">🎂 Edad</label>
                                <div className="flex gap-1">
                                    <input
                                        type="number"
                                        value={edad}
                                        onChange={(e) => setEdad(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3 text-sm font-bold text-slate-900 focus:border-[#9D2449]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase">👤 Sexo</label>
                                <select
                                    value={sexo}
                                    onChange={(e) => setSexo(e.target.value as 'F' | 'M')}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-2 py-3 text-sm font-bold text-slate-900 focus:border-[#9D2449]"
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
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-2 py-3 text-xs font-bold text-slate-900 focus:border-[#9D2449]"
                                />
                            </div>
                        </div>

                        {/* Localidad | Municipio */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Localidad */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase flex items-center justify-between">
                                    <span>🏡 Localidad</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={localidad}
                                        onChange={(e) => setLocalidad(e.target.value)}
                                        placeholder="Localidad"
                                        className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3 text-sm font-bold text-slate-900 focus:border-[#9D2449]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleVoiceDictation('localidad', 'Localidad')}
                                        className={`bg-[#9D2449] hover:bg-[#7A1B38] text-white p-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0 ${activeListeningField === 'localidad' ? 'ring-4 ring-rose-400 animate-pulse bg-rose-700' : ''
                                            }`}
                                        title="Dictar por voz"
                                    >
                                        <Mic className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Municipio */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase flex items-center justify-between">
                                    <span>🏛️ Municipio</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={municipio}
                                        onChange={(e) => setMunicipio(e.target.value)}
                                        placeholder="Municipio"
                                        className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3 text-sm font-bold text-slate-900 focus:border-[#9D2449]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleVoiceDictation('municipio', 'Municipio')}
                                        className={`bg-[#9D2449] hover:bg-[#7A1B38] text-white p-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0 ${activeListeningField === 'municipio' ? 'ring-4 ring-rose-400 animate-pulse bg-rose-700' : ''
                                            }`}
                                        title="Dictar por voz"
                                    >
                                        <Mic className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Nombre de la Partera (O) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-black text-slate-800 uppercase flex items-center justify-between">
                                <span>👩‍🌾 Nombre de la Partera (O)</span>
                                <span className="text-[10px] text-[#9D2449] font-bold">Tocar 🎙️ para dictar</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    value={nombrePartera}
                                    onChange={(e) => setNombrePartera(e.target.value)}
                                    placeholder="Ej. Doña Rosa Santiz Gómez"
                                    className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleVoiceDictation('nombrePartera', 'Nombre de la Partera')}
                                    className={`bg-[#9D2449] hover:bg-[#7A1B38] text-white p-3.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0 ${activeListeningField === 'nombrePartera' ? 'ring-4 ring-rose-400 animate-pulse bg-rose-700' : ''
                                        }`}
                                    title="Dictar por voz"
                                >
                                    {activeListeningField === 'nombrePartera' ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                                </button>
                            </div>
                        </div>

                        {/* Localidad de la Partera */}
                        <div className="space-y-2">
                            <label className="block text-sm font-black text-slate-800 uppercase flex items-center justify-between">
                                <span>📍 Localidad de la Partera</span>
                                <span className="text-[10px] text-[#9D2449] font-bold">Tocar 🎙️ para dictar</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    value={localidadPartera}
                                    onChange={(e) => setLocalidadPartera(e.target.value)}
                                    placeholder="Ej. San Pedro Juchitán"
                                    className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleVoiceDictation('localidadPartera', 'Localidad de la Partera')}
                                    className={`bg-[#9D2449] hover:bg-[#7A1B38] text-white p-3.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0 ${activeListeningField === 'localidadPartera' ? 'ring-4 ring-rose-400 animate-pulse bg-rose-700' : ''
                                        }`}
                                    title="Dictar por voz"
                                >
                                    {activeListeningField === 'localidadPartera' ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 2. MATRIZ TÁCTIL DE "MOTIVO DE LA REFERENCIA" (REPLICANDO HOJA FÍSICA OFICIAL SSO) */}
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

                {/* FILA 1 DE LA MATRIZ (6 COLUMNAS EN DESKTOP / TABLET) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#9D2449]" />
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                            FILA 1: ATENCIÓN DE LA MADRE, EMBARAZO Y ENFERMEDADES TRANSMISIBLES
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
                        {motivosFila1.map(renderCard)}
                    </div>
                </div>

                {/* FILA 2 DE LA MATRIZ (7 COLUMNAS EN DESKTOP / TABLET) */}
                <div className="space-y-4 pt-4 border-t-2 border-slate-200">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#9D2449]" />
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                            FILA 2: SALUD INFANTIL, TAMIZ, VACUNACIÓN Y ESTUDIOS PREVENTIVOS
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 sm:gap-4">
                        {motivosFila2.map(renderCard)}
                    </div>
                </div>
            </div>

            {/* AVISO DE VALIDACIÓN / RESUMEN ACCESIBLE */}
            {motivosSeleccionados.length === 0 && (
                <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-center gap-3 text-amber-900 font-bold text-sm">
                    <AlertCircle className="w-6 h-6 text-amber-700 shrink-0" />
                    <span>Toque al menos una tarjeta de Motivo de Referencia para indicar la causa de la consulta en la hoja oficial.</span>
                </div>
            )}

            {/* 4. BOTÓN FINAL DE ENVÍO ACCESIBLE EN GUINDA OAXACA */}
            <div className="pt-4">
                <button
                    type="submit"
                    className="bg-[#9D2449] hover:bg-[#801D3B] text-white text-xl sm:text-2xl font-black py-5 px-8 rounded-3xl shadow-2xl w-full flex items-center justify-center gap-4 transition-all active:scale-[0.99] border-4 border-rose-300 group"
                >
                    <Send className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                    <span>ENVIAR HOJA DE REFERENCIA AL CENTRO DE SALUD</span>
                </button>
            </div>
        </form>
    );
};

export default MotivoReferencia;
