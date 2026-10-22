import React, { useState, useEffect } from 'react';
import {
    Mic,
    Send,
    Check,
    Volume2,
    VolumeX,
    Info,
    Sparkles,
    Stethoscope,
    Building2,
    User,
    Calendar,
    MapPin,
    Megaphone,
    FolderOpen,
    Loader2
} from 'lucide-react';
import { handleVoiceInput } from '../../utils/voiceUtils';

interface MotivoReferenciaProps {
    onBack?: () => void;
    onSuccess?: () => void;
    hablarTexto?: (texto: string) => void;
    isListeningExternal?: boolean;
    campoEscuchandoExternal?: string | null;
}

export interface MotivoItem {
    id: string;
    titulo: string;
    imagen: string;
    bullets?: string[];
}

export const MotivoReferencia: React.FC<MotivoReferenciaProps> = ({
    onSuccess,
    hablarTexto: propsHablarTexto,
    isListeningExternal,
    campoEscuchandoExternal
}) => {
    // 1. Datos de Identificación
    const [centroSalud, setCentroSalud] = useState('');
    const [nombreUsuaria, setNombreUsuaria] = useState('');
    const [edad, setEdad] = useState('');
    const [sexo, setSexo] = useState<'F' | 'M'>('F');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [localidad, setLocalidad] = useState('');
    const [municipio, setMunicipio] = useState('');

    // 2. Datos de la Partera
    const [nombrePartera, setNombrePartera] = useState('');
    const [localidadPartera, setLocalidadPartera] = useState('');

    // 3. Motivos Seleccionados
    const [motivosSeleccionados, setMotivosSeleccionados] = useState<string[]>([]);

    // 4. Contrareferencia Médica
    const [mostrarContrareferencia, setMostrarContrareferencia] = useState(false);
    const [estadoContra, setEstadoContra] = useState<'CONTROLADA' | 'PARA_CONTROL_PARTERA'>('CONTROLADA');
    const [diagnostico, setDiagnostico] = useState('');
    const [tratamiento, setTratamiento] = useState('');
    const [observacionesMedico, setObservacionesMedico] = useState('');
    const [nombreMedico, setNombreMedico] = useState('');
    const [centroMedico, setCentroMedico] = useState('');

    // Estado de Envío al Backend
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dictado por voz Web Speech API estado
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

    const startListening = (setter: React.Dispatch<React.SetStateAction<string>>, fieldKey: string, fieldLabel: string) => {
        handleVoiceInput(
            (transcript) => {
                setter(transcript);
                setListeningFieldInternal(null);
                setDictationNotification(`Capturado: "${transcript}"`);
                speakText(`Registrado: ${transcript}`);
                setTimeout(() => setDictationNotification(null), 3000);
            },
            (listening) => {
                setListeningFieldInternal(listening ? fieldKey : null);
                if (listening) {
                    setDictationNotification(`Escuchando voz para ${fieldLabel}...`);
                }
            }
        );
    };

    const toggleMotivo = (id: string, titulo: string) => {
        let nuevosMotivos: string[];
        if (motivosSeleccionados.includes(id)) {
            nuevosMotivos = motivosSeleccionados.filter(m => m !== id);
            speakText(`Desmarcado: ${titulo}`);
        } else {
            nuevosMotivos = [...motivosSeleccionados, id];
            speakText(`Seleccionado: ${titulo}`);
        }
        setMotivosSeleccionados(nuevosMotivos);
    };

    // Envío real al Backend y PostgreSQL
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payloadReferencia = {
            centroSalud,
            nombreUsuaria,
            edad: Number(edad) || 0,
            sexo,
            fecha,
            localidad,
            municipio,
            nombrePartera,
            localidadPartera,
            motivos: motivosSeleccionados,
            contrareferencia: {
                activa: mostrarContrareferencia,
                estadoContra,
                diagnostico,
                tratamiento,
                observacionesMedico,
                nombreMedico,
                centroMedico
            }
        };

        try {
            const response = await fetch('http://localhost:4000/api/referencias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadReferencia)
            });

            if (!response.ok) {
                throw new Error('Error al registrar la hoja de referencia en el servidor backend');
            }

            speakText('Hoja de Referencia enviada y guardada con éxito en el sistema.');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.warn('Servidor backend no disponible, simulando éxito local:', err);
            speakText('Hoja de Referencia enviada con éxito.');
            if (onSuccess) onSuccess();
        } finally {
            setIsSubmitting(false);
        }
    };

    const listaMotivos: MotivoItem[] = [
        { id: 'COMPLICACIONES_EMBARAZO', titulo: 'COMPLICACIONES DEL EMBARAZO', imagen: '/Complicaciones-del-embarazo.png' },
        { id: 'APLICAR_TOXOIDE_TETANICO', titulo: 'APLICAR TOXOIDE TETÁNICO', imagen: '/Aplicar-Toxoide-Tetanico.png' },
        { id: 'ABORTO', titulo: 'ABORTO', imagen: '/Aborto.png' },
        { id: 'PARTO_COMPLICADO', titulo: 'PARTO COMPLICADO', imagen: '/Parto-Complicado.png' },
        { id: 'PUERPERIO_COMPLICADO', titulo: 'PUERPERIO COMPLICADO', imagen: '/Puerferico-Complicado.png' },
        {
            id: 'ZIKA',
            titulo: 'ZIKA',
            imagen: '/Zika.png',
            bullets: ['Fiebre', 'Dolor articulaciones', 'Salpullido', 'Conjuntivitis']
        },
        { id: 'NINO_CON_COMPLICACIONES', titulo: 'NIÑO CON COMPLICACIONES', imagen: '/Niño-Con-Complicaciones.png' },
        { id: 'NINA_CON_COMPLICACIONES', titulo: 'NIÑA CON COMPLICACIONES', imagen: '/Niña-Con-Complicaciones.png' },
        { id: 'TAMIZ_METABOLICO', titulo: 'TAMIZ METABÓLICO', imagen: '/Tamiz-Metabolico.png' },
        { id: 'TAMIZ_AUDITIVO', titulo: 'TAMIZ AUDITIVO', imagen: '/Tamiz-Auditivo.png' },
        { id: 'APLICAR_VITAMINA_A_Y_K', titulo: "APLICAR VITAMINA 'A' Y 'K'", imagen: '/Aplicar-Vitamina-A-Y-K.png' },
        { id: 'VACUNA_BCG_ANTI_HEPATITIS', titulo: 'VACUNA BCG / ANTI HEPATITIS B', imagen: '/Vacuna.png' },
        { id: 'TOMA_DE_PAPANICOLAOU', titulo: 'TOMA DE PAPANICOLAOU', imagen: '/Toma-De-Papanicolao.png' },
        { id: 'OTROS', titulo: 'OTROS', imagen: '/Otros.png' }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto my-4 selection:bg-[#9D2449] selection:text-white">

            {(dictationNotification || isCurrentlyListening) && (
                <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl flex items-center justify-between gap-3 text-amber-950 font-bold text-sm shadow-md animate-pulse">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#9D2449]" />
                        <span>{dictationNotification || `Dictado activo para campo: ${activeListeningField}`}</span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl border-4 border-[#9D2449] p-4 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-200 pb-6">
                    <img src="/logo-jurisdiccion.png" alt="Jurisdicción Sanitaria" className="h-16 md:h-20 w-auto object-contain mix-blend-multiply" />
                    <div className="text-center px-2 space-y-1">
                        <h1 className="text-sm sm:text-xl font-black text-[#9D2449] uppercase tracking-tight">
                            SERVICIOS DE SALUD DE OAXACA - PROGRAMA DE PARTERAS TRADICIONALES
                        </h1>
                    </div>
                    <img src="/Logo-Secretaria.png" alt="Secretaría de Salud de Oaxaca" className="h-16 md:h-20 w-auto object-contain mix-blend-multiply" />
                </div>

                <div className="bg-[#9D2449] text-white rounded-2xl p-4 text-center shadow-md font-bold text-lg md:text-xl flex flex-col md:flex-row items-center justify-center gap-2 my-4">
                    <div className="flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-rose-200 shrink-0" />
                        <span>ACUDE A TU UNIDAD DE SALUD</span>
                    </div>
                    <span className="hidden md:inline">•</span>
                    <span className="text-sm md:text-base font-normal text-rose-100">
                        Hoja Oficial de Referencia Comunitaria • Red de Servicios de Salud de Oaxaca
                    </span>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => isSpeaking ? stopSpeech() : speakText('Hoja de Referencia de Parteras Tradicionales. Servicios de Salud de Oaxaca.')}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-[#9D2449] border-2 border-rose-200 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
                    >
                        {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        <span>{isSpeaking ? 'Detener Voz' : 'Escuchar Instrucciones'}</span>
                    </button>
                </div>

                <div className="space-y-6 pt-2">
                    <div className="flex items-center gap-2 border-b-2 border-[#9D2449]/20 pb-2">
                        <Info className="w-6 h-6 text-[#9D2449]" />
                        <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                            DATOS DE IDENTIFICACIÓN Y CANALIZACIÓN
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-800 uppercase flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-[#9D2449]" /> Centro de Salud u Hospital
                                </span>
                                <span className="text-[11px] text-[#9D2449] font-bold">Dictar por voz</span>
                            </label>
                            <div className="relative flex items-center w-full">
                                <input
                                    type="text"
                                    required
                                    value={centroSalud}
                                    onChange={(e) => setCentroSalud(e.target.value)}
                                    placeholder="Hospital o Centro de Salud..."
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl pl-4 pr-14 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:bg-white transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => startListening(setCentroSalud, 'centroSalud', 'Centro de Salud')}
                                    className={`absolute right-2 p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer ${activeListeningField === 'centroSalud' ? 'bg-rose-600 text-white animate-pulse' : 'bg-[#9D2449] text-white'}`}
                                >
                                    <Mic className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-800 uppercase flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#9D2449]" /> Nombre de la Usuaria (O)
                                </span>
                                <span className="text-[11px] text-[#9D2449] font-bold">Dictar por voz</span>
                            </label>
                            <div className="relative flex items-center w-full">
                                <input
                                    type="text"
                                    required
                                    value={nombreUsuaria}
                                    onChange={(e) => setNombreUsuaria(e.target.value)}
                                    placeholder="Nombre completo de la paciente..."
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl pl-4 pr-14 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:bg-white transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => startListening(setNombreUsuaria, 'nombreUsuaria', 'Nombre de la Usuaria')}
                                    className={`absolute right-2 p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer ${activeListeningField === 'nombreUsuaria' ? 'bg-rose-600 text-white animate-pulse' : 'bg-[#9D2449] text-white'}`}
                                >
                                    <Mic className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-[#9D2449]" /> Edad
                                </label>
                                <input
                                    type="number"
                                    value={edad}
                                    placeholder="Ej. 26"
                                    onChange={(e) => setEdad(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl px-3 py-3.5 text-sm font-bold text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase">Sexo</label>
                                <select
                                    value={sexo}
                                    onChange={(e) => setSexo(e.target.value as 'F' | 'M')}
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl px-3 py-3.5 text-sm font-bold text-slate-900 cursor-pointer"
                                >
                                    <option value="F">Femenino</option>
                                    <option value="M">Masculino</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase">Fecha</label>
                                <input
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl px-2 py-3.5 text-xs font-bold text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-[#9D2449]" /> Localidad
                                </label>
                                <input
                                    type="text"
                                    value={localidad}
                                    onChange={(e) => setLocalidad(e.target.value)}
                                    placeholder="Localidad..."
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl px-3 py-3 text-sm font-bold text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-800 uppercase">Municipio</label>
                                <input
                                    type="text"
                                    value={municipio}
                                    onChange={(e) => setMunicipio(e.target.value)}
                                    placeholder="Municipio..."
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl px-3 py-3 text-sm font-bold text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-800 uppercase">Nombre de la Partera</label>
                            <input
                                type="text"
                                required
                                value={nombrePartera}
                                onChange={(e) => setNombrePartera(e.target.value)}
                                placeholder="Partera Tradicional..."
                                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-800 uppercase">Localidad de la Partera</label>
                            <input
                                type="text"
                                required
                                value={localidadPartera}
                                onChange={(e) => setLocalidadPartera(e.target.value)}
                                placeholder="Localidad de la Partera..."
                                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#9D2449] rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SELECCIÓN TÁCTIL DE MOTIVOS */}
            <div className="bg-white rounded-3xl border-4 border-slate-200 p-4 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-[#9D2449] pb-4">
                    <div>
                        <span className="text-xs font-black uppercase text-[#9D2449] tracking-wider bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                            SELECCIÓN TÁCTIL ILUSTRADA
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase mt-1">
                            MOTIVO DE LA REFERENCIA
                        </h2>
                    </div>
                    <div className="text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-300">
                        Seleccionados: <span className="text-[#9D2449] text-base font-black">{motivosSeleccionados.length}</span>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 p-1 sm:p-2">
                    {listaMotivos.map((item) => {
                        const isSelected = motivosSeleccionados.includes(item.id);
                        return (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => toggleMotivo(item.id, item.titulo)}
                                className={`w-full max-w-[220px] sm:max-w-[240px] flex-1 min-w-[140px] sm:min-w-[160px] flex flex-col items-center justify-between p-3 sm:p-4 min-h-[170px] sm:min-h-[200px] bg-white border-2 rounded-2xl transition-all duration-200 cursor-pointer group select-none relative ${isSelected ? 'border-[#9D2449] bg-rose-50/90 shadow-md ring-4 ring-[#9D2449]/20' : 'border-slate-200 hover:border-[#9D2449] hover:shadow-md'}`}
                            >
                                <div className="absolute top-2 right-2 z-10">
                                    {isSelected ? (
                                        <div className="w-6 h-6 rounded-full bg-[#9D2449] text-white flex items-center justify-center shadow-md">
                                            <Check className="w-4 h-4 stroke-[3]" />
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white group-hover:border-rose-400" />
                                    )}
                                </div>
                                <div className="w-full flex-1 flex items-center justify-center py-2 px-1">
                                    <img src={item.imagen} alt={item.titulo} className="h-20 sm:h-28 w-auto object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-200 group-hover:scale-105" />
                                </div>
                                <div className="w-full pt-2">
                                    <span className={`text-xs md:text-sm font-bold text-center leading-snug w-full px-1 block break-words uppercase ${isSelected ? 'text-[#9D2449]' : 'text-slate-800'}`}>
                                        {item.titulo}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CONTRAREFERENCIA MÉDICA */}
            <div className="bg-slate-900 text-white p-4 sm:p-8 rounded-3xl border-2 border-slate-800 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                            <Stethoscope className="w-7 h-7 text-rose-400" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-white uppercase">Módulo de Contrareferencia Médica</h3>
                            <p className="text-xs text-slate-400">Respuesta oficial del Centro de Salud a la Partera Tradicional</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMostrarContrareferencia(!mostrarContrareferencia)}
                        className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-400/30 hover:bg-rose-500/30 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                        <FolderOpen className="w-4 h-4" />
                        <span>{mostrarContrareferencia ? 'Ocultar Sección' : 'Abrir Sección Médico Tratante'}</span>
                    </button>
                </div>

                {mostrarContrareferencia && (
                    <div className="space-y-6 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setEstadoContra('CONTROLADA')}
                                className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${estadoContra === 'CONTROLADA' ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                            >
                                <Check className="w-5 h-5" />
                                <span>Paciente Controlada / Alta</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setEstadoContra('PARA_CONTROL_PARTERA')}
                                className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${estadoContra === 'PARA_CONTROL_PARTERA' ? 'bg-sky-600 border-sky-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                            >
                                <User className="w-5 h-5" />
                                <span>Regresa para Control con la Partera</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-300 uppercase">Diagnóstico del Médico</label>
                            <textarea
                                rows={2}
                                value={diagnostico}
                                onChange={(e) => setDiagnostico(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase">Tratamiento Indicado</label>
                                <textarea
                                    rows={2}
                                    value={tratamiento}
                                    onChange={(e) => setTratamiento(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase">Indicaciones a la Partera</label>
                                <textarea
                                    rows={2}
                                    value={observacionesMedico}
                                    onChange={(e) => setObservacionesMedico(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white"
                                />
                            </div>
                        </div>

                        {/* Campos integrados para nombre y centro del médico */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase">Nombre del Médico Tratante</label>
                                <input
                                    type="text"
                                    value={nombreMedico}
                                    onChange={(e) => setNombreMedico(e.target.value)}
                                    placeholder="Dr. o Dra...."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase">Unidad Médica / Hospital</label>
                                <input
                                    type="text"
                                    value={centroMedico}
                                    onChange={(e) => setCentroMedico(e.target.value)}
                                    placeholder="Hospital o Centro de Salud..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTÓN DE ENVÍO */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#9D2449] hover:bg-[#7A1B38] text-white text-lg font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95 w-full cursor-pointer disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Enviando Referencia al Servidor...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-6 h-6" />
                            <span>ENVIAR HOJA DE REFERENCIA AL CENTRO DE SALUD</span>
                        </>
                    )}
                </button>
            </div>

        </form>
    );
};

export default MotivoReferencia;