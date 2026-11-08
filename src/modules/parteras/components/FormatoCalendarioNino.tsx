import React, { useState, useCallback } from 'react';
import {
    Mic,
    MicOff,
    CheckCircle2,
    AlertTriangle,
    ShieldAlert,
    Calendar,
    PenTool,
    Fingerprint,
    Send,
    FileText,
    Building2,
    User,
    Baby,
    Award,
    Sparkles,
    Check,
    Megaphone,
    Loader2,
    Volume2
} from 'lucide-react';
import { handleVoiceInput } from '../../../utils/voiceUtils';
import { http } from '../../../services/http';

interface FormatoCalendarioNinoProps {
    onBack?: () => void;
    onSuccess: () => void;
    hablarTexto?: (texto: string) => void;
    isListening?: boolean;
    campoEscuchando?: string | null;
    iniciarDictado?: (campo: string, setFieldState?: (val: string) => void) => void;
}

export const FormatoCalendarioNino: React.FC<FormatoCalendarioNinoProps> = ({
    onSuccess,
    hablarTexto
}) => {
    // 1. Alternancia entre Vista Partera vs Duplicado Centro de Salud
    const [modoDuplicado, setModoDuplicado] = useState(false);

    // 2. Datos de Identificación
    const [nombreNino, setNombreNino] = useState('');
    const [edadNino, setEdadNino] = useState('');
    const [nombreMadre, setNombreMadre] = useState('');
    const [localidad, setLocalidad] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [fecha, setFecha] = useState('');

    // Estado interno de campo en dictado de voz activo
    const [listeningField, setListeningField] = useState<string | null>(null);

    // 3. Semaforización Nutricional del Recién Nacido (Cinta Tricolor Táctil)
    const [nutricionNino, setNutricionNino] = useState<'NEGRO' | 'AMARILLO' | 'ROJO'>('NEGRO');

    // 4. Lactancia Materna
    const [tipoLactancia, setTipoLactancia] = useState<'PRIMEROS_6_MESES' | 'DESPUES_6_MESES'>('PRIMEROS_6_MESES');

    // 5. Tabla de Canalizaciones (Fechas de Referencia & Aplicación)
    const [tamizRef, setTamizRef] = useState('');
    const [tamizApli, setTamizApli] = useState('');

    const [bcgRef, setBcgRef] = useState('');
    const [bcgApli, setBcgApli] = useState('');

    const [vitRef, setVitRef] = useState('');
    const [vitApli, setVitApli] = useState('');

    const [auditivoRef, setAuditivoRef] = useState('');
    const [auditivoApli, setAuditivoApli] = useState('');

    // 6. Cierre Administrativo
    const [nombrePartera, setNombrePartera] = useState('');
    const [cierreLocalidad, setCierreLocalidad] = useState('');
    const [noMunicipio, setNoMunicipio] = useState('');
    const [mesInformado, setMesInformado] = useState('');
    const [nombreSupervisor, setNombreSupervisor] = useState('');
    const [centroSalud, setCentroSalud] = useState('');
    const [huellaRegistrada, setHuellaRegistrada] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Función auxiliar para hablar con síntesis de voz
    const hablar = useCallback((texto: string) => {
        if (hablarTexto) {
            hablarTexto(texto);
        } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = 'es-MX';
            window.speechSynthesis.speak(utterance);
        }
    }, [hablarTexto]);

    // Manejador universal de voz usando SpeechRecognition (es-MX)
    const startVoice = (setter: (val: string) => void, fieldKey: string, labelNombre: string) => {
        hablar(`Dictando ${labelNombre}. Hable ahora.`);
        handleVoiceInput(
            (val) => {
                setter(val);
                hablar(`Registrado: ${val}`);
            },
            (l) => setListeningField(l ? fieldKey : null)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        hablar('Guardando el Calendario del Niño en el servidor. Espere un momento.');

        const payload = {
            parteraId: localStorage.getItem('partera_id') || 'DEFAULT-PARTERA-UUID',
            datosNino: {
                nombreNino,
                edadMeses: parseInt(edadNino) || 0,
                nombreMadre,
                localidad,
                municipio,
                fechaAtencion: fecha || new Date().toISOString().split('T')[0],
                estadoNutricional: nutricionNino,
                tipoLactancia
            },
            canalizaciones: {
                tamizNeonatal: { referencia: tamizRef, aplicacion: tamizApli },
                vacunaBcgHepatitis: { referencia: bcgRef, aplicacion: bcgApli },
                vitaminasAyK: { referencia: vitRef, aplicacion: vitApli },
                tamizAuditivo: { referencia: auditivoRef, aplicacion: auditivoApli }
            },
            cierreAdministrativo: {
                nombrePartera,
                localidad: cierreLocalidad,
                noMunicipio,
                mesInformado,
                nombreSupervisor,
                centroSaludAdscripcion: centroSalud,
                huellaFirmada: huellaRegistrada,
                esCopiaCentroSalud: modoDuplicado
            }
        };

        try {
            await http.post('/api/v1/calendario-nino', payload);
            hablar('¡Calendario del Niño Formato 3 registrado y guardado exitosamente!');
            onSuccess();
        } catch (error: any) {
            console.error('Error al guardar calendario del niño:', error);
            const msg = error.response?.data?.message || 'Error al conectar con el servidor para guardar el calendario.';
            hablar('Error al guardar en el servidor.');
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-2 sm:px-4 py-6">
            {/* MARCO EXTERIOR DE HOJA OFICIAL EN GUINDA OAXACA */}
            <div className="border-4 border-[#9D2449] bg-white rounded-3xl shadow-2xl p-4 sm:p-8 space-y-6">

                {/* A) FILA SUPERIOR DE LOGOS Y TÍTULO TIPO HOJA OFICIAL */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-200 pb-6 text-center sm:text-left">
                    <img
                        src="/logo-jurisdiccion.png"
                        alt="Jurisdicción Sanitaria"
                        className="h-16 md:h-20 w-auto object-contain mix-blend-multiply"
                    />

                    <div className="space-y-1 px-2">
                        <span className="inline-block px-3 py-1 bg-rose-50 text-[#9D2449] text-[10px] font-black uppercase tracking-wider rounded-full border border-rose-200 mb-1">
                            Servicios de Salud de Oaxaca
                        </span>
                        <h1 className="text-base sm:text-xl font-black text-[#9D2449] uppercase tracking-tight">
                            CALENDARIO DEL NIÑO(A) MENOR DE 2 AÑOS
                        </h1>
                    </div>

                    <img
                        src="/Logo-Secretaria.png"
                        alt="Secretaría de Salud de Oaxaca"
                        className="h-16 md:h-20 w-auto object-contain mix-blend-multiply"
                    />
                </div>

                {/* B) BANNER PRINCIPAL GUINDA REDONDEADO */}
                <div className="bg-gradient-to-r from-[#9D2449] to-[#7A1B38] text-white rounded-2xl p-4 sm:p-5 text-center shadow-lg flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-rose-200 shrink-0 animate-pulse" />
                        <span className="font-black text-base sm:text-lg uppercase">ACUDE A TU UNIDAD DE SALUD</span>
                    </div>
                    <span className="hidden sm:inline text-rose-300">•</span>
                    <span className="text-xs sm:text-sm font-medium text-rose-100">
                        Control de Atención y Seguimiento Infantil Comunitario
                    </span>
                </div>

                {/* C) BOTÓN DE VISTA (VISTA PARTERA / COPIA CENTRO DE SALUD) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-300">
                    <span className="text-xs font-bold text-slate-700 px-2">Modo de Visualización:</span>
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setModoDuplicado(false);
                                hablar("Vista Partera activa");
                            }}
                            className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${!modoDuplicado
                                ? 'bg-[#9D2449] text-white shadow-md ring-2 ring-[#9D2449]/30'
                                : 'bg-white text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>Vista Partera</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setModoDuplicado(true);
                                hablar("Copia oficial para el Centro de Salud activada");
                            }}
                            className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${modoDuplicado
                                ? 'bg-[#9D2449] text-white shadow-md ring-2 ring-[#9D2449]/30'
                                : 'bg-white text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            <Building2 className="w-4 h-4" />
                            <span>Copia Centro de Salud</span>
                        </button>
                    </div>
                </div>

                {/* Insignia para Copia Centro de Salud */}
                {modoDuplicado && (
                    <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fadeIn">
                        <div className="flex items-center gap-3 text-center sm:text-left">
                            <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl font-bold shadow-md shrink-0">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="inline-block bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-400 mb-0.5">
                                    DUPLICADO OFICIAL SSO
                                </span>
                                <h4 className="text-sm font-black text-amber-950">
                                    Copia Oficial para Enviar al Centro de Salud
                                </h4>
                                <p className="text-xs text-amber-800 font-medium">
                                    Expediente oficial de reporte mensual para los Servicios de Salud de Oaxaca.
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400/40 text-amber-900 font-black text-xs rounded-xl border border-amber-400/60 shrink-0">
                            <Award className="w-4 h-4" /> Copia Institucional
                        </span>
                    </div>
                )}

                {/* 2. DATOS DE IDENTIFICACIÓN CON DICTADO POR VOZ REAL */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-md">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-100 shadow-sm">
                            <User className="w-5 h-5 text-[#9D2449]" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                Datos de Identificación
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Complete los campos o toque el botón de micrófono para dictar por voz
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre del Niño/a */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                Nombre del Niño/a *
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    required
                                    value={nombreNino}
                                    onChange={(e) => setNombreNino(e.target.value)}
                                    placeholder="Nombre(s) y Apellidos"
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setNombreNino, 'nombreNino', 'Nombre del Niño')}
                                    className={`bg-[#9D2449] text-white p-3.5 rounded-2xl hover:bg-[#7A1B38] transition-all flex items-center justify-center shrink-0 shadow-lg cursor-pointer active:scale-95 ${listeningField === 'nombreNino' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
                                        }`}
                                    title="Dictar por voz Nombre del Niño"
                                    aria-label="Dictar por voz Nombre del Niño"
                                >
                                    {listeningField === 'nombreNino' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Edad del Niño/a */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                Edad del Niño/a (Meses) *
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    required
                                    value={edadNino}
                                    onChange={(e) => setEdadNino(e.target.value)}
                                    placeholder="Ej. 3 meses"
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setEdadNino, 'edadNino', 'Edad del Niño')}
                                    className={`bg-[#9D2449] text-white p-3.5 rounded-2xl hover:bg-[#7A1B38] transition-all flex items-center justify-center shrink-0 shadow-lg cursor-pointer active:scale-95 ${listeningField === 'edadNino' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
                                        }`}
                                    title="Dictar por voz Edad del Niño"
                                    aria-label="Dictar por voz Edad del Niño"
                                >
                                    {listeningField === 'edadNino' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Nombre de la Madre */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                Nombre de la Madre *
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    required
                                    value={nombreMadre}
                                    onChange={(e) => setNombreMadre(e.target.value)}
                                    placeholder="Nombre completo de la madre"
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setNombreMadre, 'nombreMadre', 'Nombre de la Madre')}
                                    className={`bg-[#9D2449] text-white p-3.5 rounded-2xl hover:bg-[#7A1B38] transition-all flex items-center justify-center shrink-0 shadow-lg cursor-pointer active:scale-95 ${listeningField === 'nombreMadre' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
                                        }`}
                                    title="Dictar por voz Nombre de la Madre"
                                    aria-label="Dictar por voz Nombre de la Madre"
                                >
                                    {listeningField === 'nombreMadre' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Localidad */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                Localidad *
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    required
                                    value={localidad}
                                    onChange={(e) => setLocalidad(e.target.value)}
                                    placeholder="Comunidad / Localidad"
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setLocalidad, 'localidad', 'Localidad')}
                                    className={`bg-[#9D2449] text-white p-3.5 rounded-2xl hover:bg-[#7A1B38] transition-all flex items-center justify-center shrink-0 shadow-lg cursor-pointer active:scale-95 ${listeningField === 'localidad' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
                                        }`}
                                    title="Dictar por voz Localidad"
                                    aria-label="Dictar por voz Localidad"
                                >
                                    {listeningField === 'localidad' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Municipio */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                Municipio *
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    required
                                    value={municipio}
                                    onChange={(e) => setMunicipio(e.target.value)}
                                    placeholder="Municipio"
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setMunicipio, 'municipio', 'Municipio')}
                                    className={`bg-[#9D2449] text-white p-3.5 rounded-2xl hover:bg-[#7A1B38] transition-all flex items-center justify-center shrink-0 shadow-lg cursor-pointer active:scale-95 ${listeningField === 'municipio' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
                                        }`}
                                    title="Dictar por voz Municipio"
                                    aria-label="Dictar por voz Municipio"
                                >
                                    {listeningField === 'municipio' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Fecha */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                Fecha de Atención *
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    required
                                    value={fecha}
                                    onChange={(e) => {
                                        setFecha(e.target.value);
                                        hablar(`Fecha seleccionada: ${e.target.value}`);
                                    }}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. ESTADO NUTRICIONAL DEL RECIÉN NACIDO */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-md">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="p-2.5 bg-slate-100 text-slate-800 rounded-2xl shadow-sm">
                            <Baby className="w-5 h-5 text-[#9D2449]" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                Estado Nutricional del Recién Nacido
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Semáforo Nutricional Oficial para evaluación física en la comunidad
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Opción 1 (Negro): SIN DESNUTRICIÓN */}
                        <button
                            type="button"
                            onClick={() => {
                                setNutricionNino('NEGRO');
                                hablar('Seleccionado: Sin desnutrición, estado normal.');
                            }}
                            className={`p-5 rounded-3xl border-4 text-left space-y-3 transition-all cursor-pointer active:scale-95 ${nutricionNino === 'NEGRO'
                                ? 'bg-slate-900 text-white border-emerald-500 shadow-2xl scale-[1.02] ring-4 ring-emerald-500/20'
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 font-black text-[10px] uppercase tracking-wider rounded-full border flex items-center gap-1 ${
                                    nutricionNino === 'NEGRO'
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                        : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                                }`}>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Estado Normal
                                </span>
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                                    nutricionNino === 'NEGRO' ? 'bg-emerald-500 border-emerald-400 text-white shadow-md' : 'border-slate-300 bg-white'
                                }`}>
                                    {nutricionNino === 'NEGRO' && <Check className="w-4 h-4 stroke-[3]" />}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-black text-base tracking-tight">SIN DESNUTRICIÓN</h4>
                                <p className="text-xs opacity-80 mt-1 font-medium">Brazalete / Tarjeta Oscura: Peso y salud adecuada</p>
                            </div>
                        </button>

                        {/* Opción 2 (Amarillo): RIESGO DE DESNUTRICIÓN */}
                        <button
                            type="button"
                            onClick={() => {
                                setNutricionNino('AMARILLO');
                                hablar('Seleccionado: Riesgo de desnutrición. Enviar al centro de salud.');
                            }}
                            className={`p-5 rounded-3xl border-4 text-left space-y-3 transition-all cursor-pointer active:scale-95 ${nutricionNino === 'AMARILLO'
                                ? 'bg-amber-400 text-slate-950 border-amber-600 shadow-2xl scale-[1.02] ring-4 ring-amber-400/40 font-extrabold'
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 font-black text-[10px] uppercase tracking-wider rounded-full border flex items-center gap-1 ${
                                    nutricionNino === 'AMARILLO'
                                        ? 'bg-amber-950/20 text-amber-950 border-amber-950/30'
                                        : 'bg-amber-100 text-amber-900 border-amber-200'
                                }`}>
                                    <AlertTriangle className="w-3.5 h-3.5" /> Advertencia
                                </span>
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                                    nutricionNino === 'AMARILLO' ? 'bg-amber-950 border-amber-900 text-amber-400 shadow-md' : 'border-slate-300 bg-white'
                                }`}>
                                    {nutricionNino === 'AMARILLO' && <Check className="w-4 h-4 stroke-[3]" />}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-black text-base tracking-tight">RIESGO DE DESNUTRICIÓN</h4>
                                <p className="text-xs opacity-90 mt-1 font-semibold">Brazalete Amarillo: ENVIAR AL CENTRO DE SALUD</p>
                            </div>
                        </button>

                        {/* Opción 3 (Rojo): DESNUTRIDO GRAVE */}
                        <button
                            type="button"
                            onClick={() => {
                                setNutricionNino('ROJO');
                                hablar('¡Alerta! Desnutrición grave. Enviar urgente al centro de salud.');
                            }}
                            className={`p-5 rounded-3xl border-4 text-left space-y-3 transition-all cursor-pointer active:scale-95 ${nutricionNino === 'ROJO'
                                ? 'bg-rose-600 text-white border-rose-800 shadow-2xl scale-[1.02] ring-4 ring-rose-600/30 font-extrabold'
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="px-3 py-1 bg-white/20 text-white font-black text-[10px] uppercase tracking-wider rounded-full border border-white/30 flex items-center gap-1">
                                    <ShieldAlert className="w-3.5 h-3.5" /> URGENTE
                                </span>
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                                    nutricionNino === 'ROJO' ? 'bg-white border-white text-rose-700 shadow-md' : 'border-slate-300 bg-white'
                                }`}>
                                    {nutricionNino === 'ROJO' && <Check className="w-4 h-4 stroke-[3]" />}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-black text-base tracking-tight">DESNUTRIDO GRAVE</h4>
                                <p className="text-xs opacity-90 mt-1 font-semibold">Brazalete Rojo: ENVIAR URGENTE AL CENTRO DE SALUD</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 4. SECCIÓN DE LACTANCIA MATERNA */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-md">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-100 shadow-sm">
                            <Sparkles className="w-5 h-5 text-[#9D2449]" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                                LACTANCIA MATERNA
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Seleccione el tipo de lactancia materna que recibe la niña o niño
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Opción 1: Sólo durante los primeros 6 meses */}
                        <button
                            type="button"
                            onClick={() => {
                                setTipoLactancia('PRIMEROS_6_MESES');
                                hablar('Seleccionado: Lactancia materna exclusiva durante los primeros seis meses.');
                            }}
                            className={`p-6 rounded-3xl border-4 text-center space-y-4 transition-all flex flex-col items-center justify-between cursor-pointer active:scale-95 ${tipoLactancia === 'PRIMEROS_6_MESES'
                                ? 'bg-rose-50/90 border-[#9D2449] shadow-2xl ring-4 ring-rose-200 scale-[1.01]'
                                : 'bg-slate-50 border-slate-200 hover:border-rose-200 hover:bg-slate-100'
                                }`}
                        >
                            <div className="w-full flex justify-end">
                                <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${tipoLactancia === 'PRIMEROS_6_MESES' ? 'bg-[#9D2449] border-[#9D2449] text-white shadow-md' : 'border-slate-300 bg-white'
                                    }`}>
                                    {tipoLactancia === 'PRIMEROS_6_MESES' && <Check className="w-4 h-4 stroke-[3]" />}
                                </span>
                            </div>

                            <img
                                src="/Durnante-Primeros-8-Meses.png"
                                alt="Sólo durante los primeros 6 meses"
                                className="mix-blend-multiply h-28 object-contain drop-shadow-sm"
                            />

                            <div>
                                <h4 className="font-black text-lg text-slate-900">
                                    Sólo durante los primeros 6 meses
                                </h4>
                                <p className="text-xs font-bold text-[#9D2449] mt-1">
                                    Lactancia Materna Exclusiva
                                </p>
                            </div>
                        </button>

                        {/* Opción 2: Después de los 6 meses... */}
                        <button
                            type="button"
                            onClick={() => {
                                setTipoLactancia('DESPUES_6_MESES');
                                hablar('Seleccionado: Lactancia materna complementaria después de los 6 meses.');
                            }}
                            className={`p-6 rounded-3xl border-4 text-center space-y-4 transition-all flex flex-col items-center justify-between cursor-pointer active:scale-95 ${tipoLactancia === 'DESPUES_6_MESES'
                                ? 'bg-rose-50/90 border-[#9D2449] shadow-2xl ring-4 ring-rose-200 scale-[1.01]'
                                : 'bg-slate-50 border-slate-200 hover:border-rose-200 hover:bg-slate-100'
                                }`}
                        >
                            <div className="w-full flex justify-end">
                                <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${tipoLactancia === 'DESPUES_6_MESES' ? 'bg-[#9D2449] border-[#9D2449] text-white shadow-md' : 'border-slate-300 bg-white'
                                    }`}>
                                    {tipoLactancia === 'DESPUES_6_MESES' && <Check className="w-4 h-4 stroke-[3]" />}
                                </span>
                            </div>

                            <img
                                src="/Despues-De-Los-8-Meses.png"
                                alt="Después de los 6 meses leche materna y además le doy otros alimentos"
                                className="mix-blend-multiply h-28 object-contain drop-shadow-sm"
                            />

                            <div>
                                <h4 className="font-black text-lg text-slate-900">
                                    Después de los 6 meses leche materna y además le doy otros alimentos
                                </h4>
                                <p className="text-xs font-bold text-[#9D2449] mt-1">
                                    Lactancia Materna Complementaria
                                </p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 5. TABLA DE CANALIZACIONES */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-md">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="p-2.5 bg-sky-50 text-sky-800 rounded-2xl border border-sky-100 shadow-sm">
                            <Calendar className="w-5 h-5 text-sky-700" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                Registro de Canalizaciones y Seguimiento Médico
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Ingrese Fecha de Referencia y Fecha de Aplicación en formato limpio para cada intervención
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* 1. TOMA DE TAMIZ NEONATAL */}
                        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 hover:border-slate-300 transition-colors shadow-sm">
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                <img
                                    src="/Tamiz-Metabolico.png"
                                    alt="Toma de Tamiz Neonatal"
                                    className="mix-blend-multiply h-16 w-auto object-contain shrink-0"
                                />
                                <div>
                                    <span className="inline-block px-2.5 py-0.5 bg-sky-100 text-sky-900 rounded-md text-[10px] font-black uppercase mb-1 border border-sky-200">
                                        DE 72 HORAS AL QUINTO DÍA DE NACIDO
                                    </span>
                                    <h4 className="font-black text-sm sm:text-base text-slate-900">
                                        1. TOMA DE TAMIZ NEONATAL
                                    </h4>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Tamiz metabólico neonatal mediante gota de sangre en tarjeta de Guthrie
                                    </p>
                                </div>
                            </div>

                            <div className="w-full md:w-auto shrink-0 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2.5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-1 text-center">
                                        Fecha Referencia
                                    </label>
                                    <input
                                        type="date"
                                        value={tamizRef}
                                        onChange={(e) => setTamizRef(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 text-slate-700 bg-slate-50 p-2.5 text-xs sm:text-sm text-center font-bold focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-1 text-center">
                                        Fecha Aplicación
                                    </label>
                                    <input
                                        type="date"
                                        value={tamizApli}
                                        onChange={(e) => setTamizApli(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 text-slate-700 bg-slate-50 p-2.5 text-xs sm:text-sm text-center font-bold focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. VACUNA BCG / HEPATITIS B */}
                        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 hover:border-slate-300 transition-colors shadow-sm">
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                <img
                                    src="/Vacuna.png"
                                    alt="Vacuna BCG y Antihepatitis B"
                                    className="mix-blend-multiply h-16 w-auto object-contain shrink-0"
                                />
                                <div>
                                    <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-[10px] font-black uppercase mb-1 border border-emerald-200">
                                        RECIÉN NACIDO (0-28 DÍAS)
                                    </span>
                                    <h4 className="font-black text-sm sm:text-base text-slate-900">
                                        2. APLICACIÓN DE VACUNA BCG Y ANTIHEPATITIS B
                                    </h4>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Inmunización primaria al nacimiento contra tuberculosis y hepatitis B
                                    </p>
                                </div>
                            </div>

                            <div className="w-full md:w-auto shrink-0 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2.5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-1 text-center">
                                        Fecha Referencia
                                    </label>
                                    <input
                                        type="date"
                                        value={bcgRef}
                                        onChange={(e) => setBcgRef(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 text-slate-700 bg-slate-50 p-2.5 text-xs sm:text-sm text-center font-bold focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-1 text-center">
                                        Fecha Aplicación
                                    </label>
                                    <input
                                        type="date"
                                        value={bcgApli}
                                        onChange={(e) => setBcgApli(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 text-slate-700 bg-slate-50 p-2.5 text-xs sm:text-sm text-center font-bold focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. VITAMINAS A Y K */}
                        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 hover:border-slate-300 transition-colors shadow-sm">
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                <img
                                    src="/Aplicar-Vitamina-A-Y-K.png"
                                    alt="Aplicación de Vitaminas A y K"
                                    className="mix-blend-multiply h-16 w-auto object-contain shrink-0"
                                />
                                <div>
                                    <span className="inline-block px-2.5 py-0.5 bg-purple-100 text-purple-900 rounded-md text-[10px] font-black uppercase mb-1 border border-purple-200">
                                        RECIÉN NACIDO (0-28 DÍAS)
                                    </span>
                                    <h4 className="font-black text-sm sm:text-base text-slate-900">
                                        3. APLICACIÓN DE VITAMINAS "A" Y "K"
                                    </h4>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Profilaxis vitamínica oral/inyectable para la salud del recién nacido
                                    </p>
                                </div>
                            </div>

                            <div className="w-full md:w-auto shrink-0 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2.5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-1 text-center">
                                        Fecha Referencia
                                    </label>
                                    <input
                                        type="date"
                                        value={vitRef}
                                        onChange={(e) => setVitRef(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 text-slate-700 bg-slate-50 p-2.5 text-xs sm:text-sm text-center font-bold focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-1 text-center">
                                        Fecha Aplicación
                                    </label>
                                    <input
                                        type="date"
                                        value={vitApli}
                                        onChange={(e) => setVitApli(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 text-slate-700 bg-slate-50 p-2.5 text-xs sm:text-sm text-center font-bold focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. TAMIZ AUDITIVO */}
                        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 hover:border-slate-300 transition-colors shadow-sm">
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                <img
                                    src="/Tamiz-Auditivo.png"
                                    alt="Tamiz Auditivo Neonatal"
                                    className="mix-blend-multiply h-16 w-auto object-contain shrink-0"
                                />
                                <div>
                                    <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-black uppercase mb-1 border border-amber-200">
                                        RECIÉN NACIDO (0-28 DÍAS)
                                    </span>
                                    <h4 className="font-black text-sm sm:text-base text-slate-900">
                                        4. TOMA DE TAMIZ AUDITIVO
                                    </h4>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Evaluación electrofisiológica de la audición en la etapa neonatal
                                    </p>
                                </div>
                            </div>

                            <div className="w-full md:w-auto shrink-0 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2.5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-1 text-center">
                                        Fecha Referencia
                                    </label>
                                    <input
                                        type="date"
                                        value={auditivoRef}
                                        onChange={(e) => setAuditivoRef(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 text-slate-700 bg-slate-50 p-2.5 text-xs sm:text-sm text-center font-bold focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-1 text-center">
                                        Fecha Aplicación
                                    </label>
                                    <input
                                        type="date"
                                        value={auditivoApli}
                                        onChange={(e) => setAuditivoApli(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 text-slate-700 bg-slate-50 p-2.5 text-xs sm:text-sm text-center font-bold focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. CIERRE ADMINISTRATIVO Y BOTÓN FINAL */}
                <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 md:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <div className="p-3 bg-amber-400/20 text-amber-400 rounded-2xl border border-amber-400/30 shadow-sm">
                            <PenTool className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-white">
                                Cierre Administrativo del Informe Comunitario
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">
                                Registro de datos institucionales, firmas y validación del supervisor SSO
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                                Nombre de la Partera
                            </label>
                            <input
                                type="text"
                                value={nombrePartera}
                                onChange={(e) => setNombrePartera(e.target.value)}
                                placeholder="Nombre de la Partera"
                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-amber-400 transition-all shadow-inner"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                                Localidad
                            </label>
                            <input
                                type="text"
                                value={cierreLocalidad}
                                onChange={(e) => setCierreLocalidad(e.target.value)}
                                placeholder="Localidad"
                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-amber-400 transition-all shadow-inner"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                                No. Municipio
                            </label>
                            <input
                                type="text"
                                value={noMunicipio}
                                onChange={(e) => setNoMunicipio(e.target.value)}
                                placeholder="Clave municipio"
                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-amber-400 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                                Mes Informado
                            </label>
                            <input
                                type="text"
                                value={mesInformado}
                                onChange={(e) => setMesInformado(e.target.value)}
                                placeholder="Ej. Noviembre 2026"
                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-amber-400 transition-all shadow-inner"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                                Nombre del Supervisor
                            </label>
                            <input
                                type="text"
                                value={nombreSupervisor}
                                onChange={(e) => setNombreSupervisor(e.target.value)}
                                placeholder="Nombre del supervisor SSO"
                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-amber-400 transition-all shadow-inner"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                                Centro de Salud
                            </label>
                            <input
                                type="text"
                                value={centroSalud}
                                onChange={(e) => setCentroSalud(e.target.value)}
                                placeholder="Centro de Salud / Jurisdicción"
                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-amber-400 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* BOTÓN DE CAPTURA DE HUELLA TÁCTIL */}
                    <div className="p-4 sm:p-5 bg-slate-800/90 rounded-2xl border-2 border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                        <div className="flex items-center gap-3 text-center sm:text-left">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border transition-all shadow-md shrink-0 ${huellaRegistrada
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : 'bg-amber-400/20 text-amber-400 border-amber-400/40'
                                }`}>
                                <Fingerprint className="w-7 h-7" />
                            </div>
                            <div>
                                <span className="block text-xs font-black text-white uppercase tracking-wider">
                                    Firma o Huella Digital de la Partera
                                </span>
                                <span className="text-[11px] text-slate-300 font-medium">
                                    {huellaRegistrada
                                        ? 'Huella Digital Capturada Correctamente ✅'
                                        : 'Toque el botón para validar la firma táctil digital'}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setHuellaRegistrada(true);
                                hablar("Huella digital registrada correctamente.");
                            }}
                            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shrink-0 cursor-pointer"
                        >
                            <Fingerprint className="w-5 h-5" />
                            <span>{huellaRegistrada ? 'Huella Registrada' : 'Capturar Huella Táctil'}</span>
                        </button>
                    </div>
                </div>

                {/* BOTÓN FINAL DE GUARDADO GUINDA OAXACA */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#9D2449] hover:bg-[#7A1B38] text-white text-lg sm:text-xl py-5 px-6 rounded-2xl w-full font-black shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 border-2 border-rose-300/30"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-7 h-7 animate-spin text-white shrink-0" />
                            <span>Guardando en PostgreSQL (Render)...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-7 h-7 shrink-0" />
                            <span className="text-center">REGISTRAR CALENDARIO DEL NIÑO (FORMATO 3)</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default FormatoCalendarioNino;