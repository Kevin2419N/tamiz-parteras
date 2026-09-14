import React, { useState } from 'react';
import {
    ChevronLeft,
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
    Check
} from 'lucide-react';
import { handleVoiceInput } from '../../../utils/voiceUtils';

interface FormatoCalendarioNinoProps {
    onBack: () => void;
    onSuccess: () => void;
    hablarTexto?: (texto: string) => void;
    isListening?: boolean;
    campoEscuchando?: string | null;
    iniciarDictado?: (campo: string, setFieldState?: (val: string) => void) => void;
}

export const FormatoCalendarioNino: React.FC<FormatoCalendarioNinoProps> = ({
    onBack,
    onSuccess,
    hablarTexto
}) => {
    // 1. Alternancia entre Vista Partera vs Duplicado Centro de Salud
    const [modoDuplicado, setModoDuplicado] = useState(false);

    // 2. Datos de Identificación (Inician VACÍOS)
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
    const [nombrePartera, setNombrePartera] = useState('Rosa Santiz Gómez');
    const [cierreLocalidad, setCierreLocalidad] = useState('La Ventosa');
    const [noMunicipio, setNoMunicipio] = useState('043');
    const [mesInformado, setMesInformado] = useState('Septiembre 2026');
    const [nombreSupervisor, setNombreSupervisor] = useState('Lic. Enf. María de la Luz V.');
    const [centroSalud, setCentroSalud] = useState('Centro de Salud La Ventosa / Jurisdicción Sanitaria No. 2 Istmo');
    const [huellaRegistrada, setHuellaRegistrada] = useState(false);

    // Manejador universal de voz usando SpeechRecognition (es-MX)
    const startVoice = (setter: (val: string) => void, fieldKey: string) => {
        handleVoiceInput(
            (val) => setter(val),
            (l) => setListeningField(l ? fieldKey : null)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (hablarTexto) {
            hablarTexto('Calendario del Niño Formato 3 registrado exitosamente.');
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
            {/* 1. TOGGLE DE VISTA Y BOTÓN REGRESAR */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Botón de regresar en Guinda Oaxaca */}
                <button
                    type="button"
                    onClick={onBack}
                    className="bg-[#9D2449] hover:bg-[#7A1B38] text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border border-rose-300/30 shrink-0"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Regresar al Menú Principal</span>
                </button>

                {/* Toggle de Vista Partera / Centro de Salud */}
                <div className="bg-slate-200/90 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-300 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => {
                            setModoDuplicado(false);
                            if (hablarTexto) hablarTexto("Vista Partera activa");
                        }}
                        className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${!modoDuplicado
                            ? 'bg-[#9D2449] text-white shadow-md'
                            : 'bg-transparent text-slate-700 hover:text-slate-900'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Vista Partera</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setModoDuplicado(true);
                            if (hablarTexto) hablarTexto("Mostrando copia oficial para el Centro de Salud");
                        }}
                        className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${modoDuplicado
                            ? 'bg-[#9D2449] text-white shadow-md'
                            : 'bg-transparent text-slate-700 hover:text-slate-900'
                            }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Copia para Centro de Salud</span>
                    </button>
                </div>
            </div>

            {/* Insignia para Copia Centro de Salud */}
            {modoDuplicado && (
                <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-bold">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="inline-block bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-400 mb-0.5">
                                DUPLICADO OFICIAL SSO
                            </span>
                            <h4 className="text-sm font-black text-amber-950">
                                Copia Oficial para Enviar al Centro de Salud
                            </h4>
                            <p className="text-xs text-amber-800">
                                Expediente oficial de reporte mensual para los Servicios de Salud de Oaxaca.
                            </p>
                        </div>
                    </div>
                    <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/30 text-amber-900 font-extrabold text-xs rounded-xl border border-amber-400/50 shrink-0">
                        <Award className="w-4 h-4" /> Copia Institucional
                    </span>
                </div>
            )}

            {/* HEADER INSTITUCIONAL CON LOGOS FLANQUEANDO EL TÍTULO */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
                <img
                    src="/logo-jurisdiccion.png"
                    alt="Logo Jurisdicción Sanitaria"
                    className="h-16 w-auto object-contain shrink-0"
                />

                <div className="text-center space-y-1">
                    <span className="inline-block px-3 py-1 bg-rose-100 text-[#9D2449] rounded-full text-[11px] font-black uppercase tracking-wider border border-rose-200">
                        SERVICIOS DE SALUD DE OAXACA • FORMATO 3
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        CALENDARIO DE ATENCIÓN AL NIÑO(A) MENOR DE 2 AÑOS
                    </h1>
                    <p className="text-xs font-semibold text-slate-600">
                        Control Comunitario de Salud Infantil, Nutrición, Tamiz y Esquema de Vacunación
                    </p>
                </div>

                <img
                    src="/Logo-Secretaria.png"
                    alt="Logo Secretaría de Salud"
                    className="h-16 w-auto object-contain shrink-0"
                />
            </div>

            {/* 2. DATOS DE IDENTIFICACIÓN CON DICTADO POR VOZ REAL */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-md">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-xl">
                        <User className="w-5 h-5 text-[#9D2449]" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900">
                            Datos de Identificación
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                            Complete la información o presione el botón de micrófono para dictar por voz
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre del Niño/a */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                            Nombre del Niño/a
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={nombreNino}
                                onChange={(e) => setNombreNino(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => startVoice(setNombreNino, 'nombreNino')}
                                className={`bg-[#9D2449] text-white p-3 rounded-xl hover:bg-[#7A1B38] transition-all flex items-center justify-center shrink-0 shadow-md ${listeningField === 'nombreNino' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
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
                        <label className="block text-xs font-bold text-slate-700">
                            Edad del Niño/a (Meses / Años)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={edadNino}
                                onChange={(e) => setEdadNino(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => startVoice(setEdadNino, 'edadNino')}
                                className={`bg-[#9D2449] text-white p-3 rounded-xl hover:bg-[#7A1B38] transition-all flex items-center justify-center shrink-0 shadow-md ${listeningField === 'edadNino' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
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
                        <label className="block text-xs font-bold text-slate-700">
                            Nombre de la Madre
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={nombreMadre}
                                onChange={(e) => setNombreMadre(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => startVoice(setNombreMadre, 'nombreMadre')}
                                className={`bg-[#9D2449] text-white p-3 rounded-xl hover:bg-[#7A1B38] transition-all flex items-center justify-center shrink-0 shadow-md ${listeningField === 'nombreMadre' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
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
                        <label className="block text-xs font-bold text-slate-700">
                            Localidad
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={localidad}
                                onChange={(e) => setLocalidad(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => startVoice(setLocalidad, 'localidad')}
                                className={`bg-[#9D2449] text-white p-3 rounded-xl hover:bg-[#7A1B38] transition-all flex items-center justify-center shrink-0 shadow-md ${listeningField === 'localidad' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
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
                        <label className="block text-xs font-bold text-slate-700">
                            Municipio
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={municipio}
                                onChange={(e) => setMunicipio(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => startVoice(setMunicipio, 'municipio')}
                                className={`bg-[#9D2449] text-white p-3 rounded-xl hover:bg-[#7A1B38] transition-all flex items-center justify-center shrink-0 shadow-md ${listeningField === 'municipio' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
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
                        <label className="block text-xs font-bold text-slate-700">
                            Fecha
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => startVoice(setFecha, 'fecha')}
                                className={`bg-[#9D2449] text-white p-3 rounded-xl hover:bg-[#7A1B38] transition-all flex items-center justify-center shrink-0 shadow-md ${listeningField === 'fecha' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
                                    }`}
                                title="Dictar por voz Fecha"
                                aria-label="Dictar por voz Fecha"
                            >
                                {listeningField === 'fecha' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. ESTADO NUTRICIONAL DEL RECIÉN NACIDO (CINTA TRICOLOR TÁCTIL) */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-md">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl">
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
                        onClick={() => setNutricionNino('NEGRO')}
                        className={`p-5 rounded-2xl border-4 text-left space-y-3 transition-all ${nutricionNino === 'NEGRO'
                            ? 'bg-slate-900 text-white border-slate-950 shadow-xl scale-[1.02] ring-4 ring-slate-900/20'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-black text-[10px] uppercase tracking-wider rounded-full border border-emerald-500/40 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Estado Normal
                            </span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${nutricionNino === 'NEGRO' ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-300'
                                }`}>
                                {nutricionNino === 'NEGRO' && <Check className="w-4 h-4 stroke-[3]" />}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-black text-base tracking-tight">SIN DESNUTRICIÓN</h4>
                            <p className="text-xs opacity-80 mt-1 font-medium">Brazalete / Tarjeta Oscura: Peso y salud adecuada</p>
                        </div>
                    </button>

                    {/* Opción 2 (Amarillo): RIESGO DE DESNUTRICIÓN - ENVIAR AL CENTRO DE SALUD */}
                    <button
                        type="button"
                        onClick={() => setNutricionNino('AMARILLO')}
                        className={`p-5 rounded-2xl border-4 text-left space-y-3 transition-all ${nutricionNino === 'AMARILLO'
                            ? 'bg-amber-400 border-amber-600 text-amber-950 shadow-xl scale-[1.02] ring-4 ring-amber-400/30 font-extrabold'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="px-3 py-1 bg-amber-950/10 text-amber-900 font-black text-[10px] uppercase tracking-wider rounded-full border border-amber-950/20 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Advertencia
                            </span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${nutricionNino === 'AMARILLO' ? 'bg-amber-950 border-amber-900 text-amber-400' : 'border-slate-300'
                                }`}>
                                {nutricionNino === 'AMARILLO' && <Check className="w-4 h-4 stroke-[3]" />}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-black text-base tracking-tight">RIESGO DE DESNUTRICIÓN</h4>
                            <p className="text-xs opacity-90 mt-1 font-semibold">Brazalete Amarillo: ENVIAR AL CENTRO DE SALUD</p>
                        </div>
                    </button>

                    {/* Opción 3 (Rojo): DESNUTRIDO - ENVIAR URGENTE AL CENTRO DE SALUD */}
                    <button
                        type="button"
                        onClick={() => setNutricionNino('ROJO')}
                        className={`p-5 rounded-2xl border-4 text-left space-y-3 transition-all ${nutricionNino === 'ROJO'
                            ? 'bg-rose-600 border-rose-800 text-white shadow-xl scale-[1.02] ring-4 ring-rose-600/30'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="px-3 py-1 bg-white/20 text-white font-black text-[10px] uppercase tracking-wider rounded-full border border-white/30 flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" /> URGENTE
                            </span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${nutricionNino === 'ROJO' ? 'bg-white border-white text-rose-700' : 'border-slate-300'
                                }`}>
                                {nutricionNino === 'ROJO' && <Check className="w-4 h-4 stroke-[3]" />}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-black text-base tracking-tight">DESNUTRIDO</h4>
                            <p className="text-xs opacity-90 mt-1 font-semibold">Brazalete Rojo: ENVIAR URGENTE AL CENTRO DE SALUD</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* 4. SECCIÓN DE LACTANCIA MATERNA (USO DE NUEVAS IMÁGENES PNG) */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-md">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-xl">
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
                    {/* Tarjeta 1 */}
                    <button
                        type="button"
                        onClick={() => setTipoLactancia('PRIMEROS_6_MESES')}
                        className={`p-6 rounded-3xl border-4 text-center space-y-4 transition-all flex flex-col items-center justify-between ${tipoLactancia === 'PRIMEROS_6_MESES'
                            ? 'bg-rose-50/80 border-[#9D2449] shadow-xl ring-4 ring-rose-200 scale-[1.01]'
                            : 'bg-slate-50 border-slate-200 hover:border-rose-200 hover:bg-slate-100'
                            }`}
                    >
                        <div className="w-full flex justify-end">
                            <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${tipoLactancia === 'PRIMEROS_6_MESES' ? 'bg-[#9D2449] border-[#9D2449] text-white' : 'border-slate-300'
                                }`}>
                                {tipoLactancia === 'PRIMEROS_6_MESES' && <Check className="w-4 h-4 stroke-[3]" />}
                            </span>
                        </div>

                        <img
                            src="/Durnante-Primeros-8-Meses.png"
                            alt="Sólo durante los primeros 6 meses"
                            className="mix-blend-multiply h-28 object-contain"
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

                    {/* Tarjeta 2 */}
                    <button
                        type="button"
                        onClick={() => setTipoLactancia('DESPUES_6_MESES')}
                        className={`p-6 rounded-3xl border-4 text-center space-y-4 transition-all flex flex-col items-center justify-between ${tipoLactancia === 'DESPUES_6_MESES'
                            ? 'bg-rose-50/80 border-[#9D2449] shadow-xl ring-4 ring-rose-200 scale-[1.01]'
                            : 'bg-slate-50 border-slate-200 hover:border-rose-200 hover:bg-slate-100'
                            }`}
                    >
                        <div className="w-full flex justify-end">
                            <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${tipoLactancia === 'DESPUES_6_MESES' ? 'bg-[#9D2449] border-[#9D2449] text-white' : 'border-slate-300'
                                }`}>
                                {tipoLactancia === 'DESPUES_6_MESES' && <Check className="w-4 h-4 stroke-[3]" />}
                            </span>
                        </div>

                        <img
                            src="/Despues-De-Los-8-Meses.png"
                            alt="Después de los 6 meses leche materna y además le doy otros alimentos"
                            className="mix-blend-multiply h-28 object-contain"
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

            {/* 5. TABLA DE CANALIZACIONES (REUTILIZACIÓN DE IMÁGENES DE 'PUBLIC/') */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-md">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="p-2.5 bg-sky-50 text-sky-800 rounded-xl">
                        <Calendar className="w-5 h-5 text-sky-700" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900">
                            Registro de Canalizaciones y Seguimiento Médico
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                            Ingrese Fecha de Referencia y Fecha de Aplicación para cada intervención médica
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* 1. TOMA DE TAMIZ NEONATAL */}
                    <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-colors">
                        <div className="flex items-center gap-4">
                            <img
                                src="/Tamiz-Metabolico.png"
                                alt="Tamiz Metabolico Neonatal"
                                className="h-20 w-auto object-contain mix-blend-multiply shrink-0"
                            />
                            <div>
                                <span className="inline-block px-2.5 py-0.5 bg-sky-100 text-sky-900 rounded-md text-[10px] font-black uppercase mb-1 border border-sky-200">
                                    DE 72 HORAS AL QUINTO DÍA DE NACIDO
                                </span>
                                <h4 className="font-black text-base text-slate-900">
                                    1. TOMA DE TAMIZ NEONATAL
                                </h4>
                                <p className="text-xs text-slate-600 font-medium">
                                    Tamiz metabólico neonatal mediante toma de gota en tarjeta de Guthrie
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0 bg-white p-3 rounded-xl border border-slate-200">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                                    Fecha Referencia
                                </label>
                                <input
                                    type="date"
                                    value={tamizRef}
                                    onChange={(e) => setTamizRef(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                                    Fecha Aplicación
                                </label>
                                <input
                                    type="date"
                                    value={tamizApli}
                                    onChange={(e) => setTamizApli(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. VACUNA BCG Y ANTIHEPATITIS B */}
                    <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-colors">
                        <div className="flex items-center gap-4">
                            <img
                                src="/Vacuna.png"
                                alt="Vacuna BCG y Antihepatitis B"
                                className="h-20 w-auto object-contain mix-blend-multiply shrink-0"
                            />
                            <div>
                                <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-[10px] font-black uppercase mb-1 border border-emerald-200">
                                    RECIÉN NACIDO (0-28 DÍAS)
                                </span>
                                <h4 className="font-black text-base text-slate-900">
                                    2. APLICACIÓN DE VACUNA BCG Y ANTIHEPATITIS B
                                </h4>
                                <p className="text-xs text-slate-600 font-medium">
                                    Inmunización primaria al nacimiento contra tuberculosis y hepatitis B
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0 bg-white p-3 rounded-xl border border-slate-200">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                                    Fecha Referencia
                                </label>
                                <input
                                    type="date"
                                    value={bcgRef}
                                    onChange={(e) => setBcgRef(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                                    Fecha Aplicación
                                </label>
                                <input
                                    type="date"
                                    value={bcgApli}
                                    onChange={(e) => setBcgApli(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. APLICACIÓN DE VITAMINAS A Y K */}
                    <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-colors">
                        <div className="flex items-center gap-4">
                            <img
                                src="/Aplicar-Vitamina-A-Y-K.png"
                                alt="Aplicación de Vitaminas A y K"
                                className="h-20 w-auto object-contain mix-blend-multiply shrink-0"
                            />
                            <div>
                                <span className="inline-block px-2.5 py-0.5 bg-purple-100 text-purple-900 rounded-md text-[10px] font-black uppercase mb-1 border border-purple-200">
                                    RECIÉN NACIDO (0-28 DÍAS)
                                </span>
                                <h4 className="font-black text-base text-slate-900">
                                    3. APLICACIÓN DE VITAMINAS "A" Y "K"
                                </h4>
                                <p className="text-xs text-slate-600 font-medium">
                                    Profilaxis vitamínica oral/inyectable para la salud neonatal
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0 bg-white p-3 rounded-xl border border-slate-200">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                                    Fecha Referencia
                                </label>
                                <input
                                    type="date"
                                    value={vitRef}
                                    onChange={(e) => setVitRef(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                                    Fecha Aplicación
                                </label>
                                <input
                                    type="date"
                                    value={vitApli}
                                    onChange={(e) => setVitApli(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. TOMA DE TAMIZ AUDITIVO */}
                    <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-colors">
                        <div className="flex items-center gap-4">
                            <img
                                src="/Tamiz-Auditivo.png"
                                alt="Tamiz Auditivo Neonatal"
                                className="h-20 w-auto object-contain mix-blend-multiply shrink-0"
                            />
                            <div>
                                <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-black uppercase mb-1 border border-amber-200">
                                    RECIÉN NACIDO (0-28 DÍAS)
                                </span>
                                <h4 className="font-black text-base text-slate-900">
                                    4. TOMA DE TAMIZ AUDITIVO
                                </h4>
                                <p className="text-xs text-slate-600 font-medium">
                                    Evaluación electrofisiológica de la función auditiva temprana
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0 bg-white p-3 rounded-xl border border-slate-200">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                                    Fecha Referencia
                                </label>
                                <input
                                    type="date"
                                    value={auditivoRef}
                                    onChange={(e) => setAuditivoRef(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                                    Fecha Aplicación
                                </label>
                                <input
                                    type="date"
                                    value={auditivoApli}
                                    onChange={(e) => setAuditivoApli(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. CIERRE ADMINISTRATIVO Y BOTÓN FINAL */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border-2 border-slate-800 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="p-2.5 bg-amber-400/20 text-amber-400 rounded-xl border border-amber-400/30">
                        <PenTool className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white">
                            Cierre Administrativo del Informe Comunitaria
                        </h3>
                        <p className="text-xs text-slate-400">
                            Registro de datos institucionales, firmas y validación del supervisor SSO
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            Nombre de la Partera
                        </label>
                        <input
                            type="text"
                            value={nombrePartera}
                            onChange={(e) => setNombrePartera(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            Localidad
                        </label>
                        <input
                            type="text"
                            value={cierreLocalidad}
                            onChange={(e) => setCierreLocalidad(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            No. Municipio
                        </label>
                        <input
                            type="text"
                            value={noMunicipio}
                            onChange={(e) => setNoMunicipio(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            Mes Informado
                        </label>
                        <input
                            type="text"
                            value={mesInformado}
                            onChange={(e) => setMesInformado(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            Nombre del Supervisor
                        </label>
                        <input
                            type="text"
                            value={nombreSupervisor}
                            onChange={(e) => setNombreSupervisor(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            Centro de Salud
                        </label>
                        <input
                            type="text"
                            value={centroSalud}
                            onChange={(e) => setCentroSalud(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                        />
                    </div>
                </div>

                {/* BOTÓN DE CAPTURA DE HUELLA TÁCTIL SIMULADO */}
                <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border transition-all ${huellaRegistrada
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-400/20 text-amber-400 border-amber-400/30'
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
                            if (hablarTexto) hablarTexto("Huella digital registrada correctamente.");
                        }}
                        className={`px-5 py-3 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 ${huellaRegistrada
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md active:scale-95'
                            }`}
                    >
                        <Fingerprint className="w-4 h-4" />
                        <span>{huellaRegistrada ? 'Huella Registrada' : 'Capturar Huella Táctil'}</span>
                    </button>
                </div>
            </div>

            {/* BOTÓN GIGANTE DE ACCIÓN FINAL EN GUINDA OAXACA */}
            <button
                type="submit"
                className="bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xl py-4 rounded-2xl w-full shadow-lg font-bold flex items-center justify-center gap-3 active:scale-[0.99] transition-transform"
            >
                <Send className="w-6 h-6" />
                <span>REGISTRAR CALENDARIO DEL NIÑO (FORMATO 3)</span>
            </button>
        </form>
    );
};
