import React, { useState } from 'react';
import {
    Baby,
    Mic,
    MicOff,
    Send,
    ChevronLeft,
    Eye,
    Calendar,
    PenTool
} from 'lucide-react';
import { handleVoiceInput } from '../../../utils/voiceUtils';

interface FormatoCalendarioNinoProps {
    onBack: () => void;
    onSuccess: () => void;
    hablarTexto: (texto: string) => void;
    isListening?: boolean;
    campoEscuchando?: string | null;
    iniciarDictado?: (campo: string) => void;
}

export const FormatoCalendarioNino: React.FC<FormatoCalendarioNinoProps> = ({
    onBack,
    onSuccess,
    hablarTexto
}) => {
    // Alternancia entre Vista Partera vs Duplicado Centro de Salud
    const [modoDuplicado, setModoDuplicado] = useState(false);

    // Datos del niño y madre
    const [nombreNino, setNombreNino] = useState('');
    const [edadMeses, setEdadMeses] = useState('1');
    const [nombreMadre, setNombreMadre] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [municipio, setMunicipio] = useState('Juchitán de Zaragoza');
    const [localidad, setLocalidad] = useState('La Ventosa');

    // Estado interno de dictado por voz
    const [listeningField, setListeningField] = useState<string | null>(null);

    // Semaforización Nutricional RN
    const [nutricionNino, setNutricionNino] = useState<'NEGRO' | 'AMARILLO' | 'ROJO'>('NEGRO');

    // Lactancia Materna
    const [tipoLactancia, setTipoLactancia] = useState<'EXCLUSIVA' | 'COMPLEMENTARIA'>('EXCLUSIVA');

    // Registro de Canalizaciones con Captura de Fechas
    const [tamizRef, setTamizRef] = useState(new Date().toISOString().split('T')[0]);
    const [tamizApli, setTamizApli] = useState('');

    const [bcgRef, setBcgRef] = useState(new Date().toISOString().split('T')[0]);
    const [bcgApli, setBcgApli] = useState('');

    const [vitRef, setVitRef] = useState(new Date().toISOString().split('T')[0]);
    const [vitApli, setVitApli] = useState('');

    const [auditivoRef, setAuditivoRef] = useState(new Date().toISOString().split('T')[0]);
    const [auditivoApli, setAuditivoApli] = useState('');

    // Cierre Administrativo
    const [nombrePartera, setNombrePartera] = useState('Rosa Santiz Gómez');
    const [noMunicipio, setNoMunicipio] = useState('043');
    const [mesInformado, setMesInformado] = useState('Septiembre 2026');
    const [nombreSupervisor, setNombreSupervisor] = useState('Lic. Enf. Maria de la Luz V.');
    const [centroSaludSupervision, setCentroSaludSupervision] = useState('Jurisdicción Sanitaria No. 2 - Istmo');
    const [huellaRegistrada, setHuellaRegistrada] = useState(false);

    const startVoice = (setter: (val: string) => void, fieldKey: string) => {
        handleVoiceInput(
            (val) => setter(val),
            (l) => setListeningField(l ? fieldKey : null)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        hablarTexto('Calendario del Niño y duplicado oficial enviados a la Jurisdicción Sanitaria.');
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* BOTÓN REGRESAR */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl font-bold text-xs flex items-center gap-2"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Regresar al Menú Principal</span>
                </button>

                {/* BOTÓN ALTERNADOR VISTA PARTERA / DUPLICADO CENTRO DE SALUD */}
                <button
                    type="button"
                    onClick={() => {
                        setModoDuplicado(!modoDuplicado);
                        hablarTexto(
                            modoDuplicado
                                ? 'Cambiando a vista de captura de la Partera'
                                : 'Mostrando vista previa del duplicado oficial para el Centro de Salud'
                        );
                    }}
                    className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 border-2 ${modoDuplicado
                        ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md'
                        : 'bg-white text-[#9D2449] border-rose-300 hover:bg-rose-50'
                        }`}
                >
                    <Eye className="w-4 h-4" />
                    <span>{modoDuplicado ? '📄 Ver Vista Captura Partera' : '🏛️ Ver Duplicado Centro de Salud'}</span>
                </button>
            </div>

            {/* BANNER ENCABEZADO FORMATO 3 */}
            <div className="bg-sky-800 text-white p-6 rounded-3xl shadow-lg border-2 border-sky-950 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                        <Baby className="w-8 h-8 text-sky-200" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-sky-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                            FORMATO OFICIAL NO. 3 {modoDuplicado ? '• DUPLICADO CENTRO DE SALUD' : '• CONTROL PARTERA'}
                        </span>
                        <h2 className="text-2xl font-black text-white mt-1">Calendario del Niño/a (Menor de 2 Años)</h2>
                        <p className="text-xs text-sky-100">Seguimiento de Tamiz Neonatal, Vacunas, Vitaminas y Crecimiento.</p>
                    </div>
                </div>
            </div>

            {/* DATOS DEL NIÑO Y DE LA MADRE */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-base font-black text-slate-900">👶 Datos del Recién Nacido / Niño/a</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre del Niño */}
                    <div className="space-y-1">
                        <label className="block text-xs font-black text-slate-700">Nombre del Niño/a</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                placeholder="Ej. Mateo Santiz"
                                value={nombreNino}
                                onChange={(e) => setNombreNino(e.target.value)}
                                className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900"
                            />
                            <button
                                type="button"
                                onClick={() => startVoice(setNombreNino, 'nombreNino')}
                                className={`px-4 py-3 rounded-2xl font-black text-xs shrink-0 flex items-center gap-1 ${listeningField === 'nombreNino'
                                    ? 'bg-rose-600 text-white animate-pulse'
                                    : 'bg-rose-50 text-[#9D2449] border-2 border-rose-200'
                                    }`}
                                title="Dictar por voz"
                            >
                                {listeningField === 'nombreNino' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                <span>🎙️</span>
                            </button>
                        </div>
                    </div>

                    {/* Nombre de la Madre */}
                    <div className="space-y-1">
                        <label className="block text-xs font-black text-slate-700">Nombre de la Madre</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                placeholder="Nombre madre..."
                                value={nombreMadre}
                                onChange={(e) => setNombreMadre(e.target.value)}
                                className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900"
                            />
                            <button
                                type="button"
                                onClick={() => startVoice(setNombreMadre, 'nombreMadre')}
                                className={`px-4 py-3 rounded-2xl font-black text-xs shrink-0 flex items-center gap-1 ${listeningField === 'nombreMadre'
                                    ? 'bg-rose-600 text-white animate-pulse'
                                    : 'bg-rose-50 text-[#9D2449] border-2 border-rose-200'
                                    }`}
                                title="Dictar por voz"
                            >
                                {listeningField === 'nombreMadre' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                <span>🎙️</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-black text-slate-700">Edad (Meses)</label>
                            <div className="flex gap-1.5">
                                <input
                                    type="number"
                                    value={edadMeses}
                                    onChange={(e) => setEdadMeses(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3 text-sm font-bold text-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setEdadMeses, 'edadMeses')}
                                    className={`px-3 py-2 rounded-2xl font-bold text-xs shrink-0 ${listeningField === 'edadMeses'
                                        ? 'bg-rose-600 text-white animate-pulse'
                                        : 'bg-rose-50 text-[#9D2449] border-2 border-rose-200'
                                        }`}
                                    title="Dictar edad"
                                >
                                    <Mic className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-700">Fecha Atencion</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3 text-xs font-bold text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-black text-slate-700">Municipio</label>
                            <div className="flex gap-1.5">
                                <input
                                    type="text"
                                    value={municipio}
                                    onChange={(e) => setMunicipio(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3 text-sm font-bold text-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setMunicipio, 'municipio')}
                                    className={`px-3 py-2 rounded-2xl font-bold text-xs shrink-0 ${listeningField === 'municipio'
                                        ? 'bg-rose-600 text-white animate-pulse'
                                        : 'bg-rose-50 text-[#9D2449] border-2 border-rose-200'
                                        }`}
                                    title="Dictar municipio"
                                >
                                    <Mic className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-700">Localidad</label>
                            <div className="flex gap-1.5">
                                <input
                                    type="text"
                                    value={localidad}
                                    onChange={(e) => setLocalidad(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3 text-sm font-bold text-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setLocalidad, 'localidad')}
                                    className={`px-3 py-2 rounded-2xl font-bold text-xs shrink-0 ${listeningField === 'localidad'
                                        ? 'bg-rose-600 text-white animate-pulse'
                                        : 'bg-rose-50 text-[#9D2449] border-2 border-rose-200'
                                        }`}
                                    title="Dictar localidad"
                                >
                                    <Mic className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEMAFORIZACIÓN NUTRICIONAL DEL RECIÉN NACIDO */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-base font-black text-slate-900">⚖️ Semaforización Nutricional del Recién Nacido</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        type="button"
                        onClick={() => setNutricionNino('NEGRO')}
                        className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${nutricionNino === 'NEGRO'
                            ? 'bg-slate-900 text-white border-slate-950 shadow-lg scale-105'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                    >
                        <span className="text-3xl block">⚫</span>
                        <span className="block font-black text-sm">Negro: Sin Desnutrición</span>
                        <span className="text-[11px] opacity-80 font-medium block">Peso y salud adecuada</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setNutricionNino('AMARILLO')}
                        className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${nutricionNino === 'AMARILLO'
                            ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-lg scale-105'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                    >
                        <span className="text-3xl block">🟡</span>
                        <span className="block font-black text-sm">Amarillo: Riesgo Desnutrición</span>
                        <span className="text-[11px] font-medium block">Enviar a Centro de Salud</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setNutricionNino('ROJO')}
                        className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${nutricionNino === 'ROJO'
                            ? 'bg-rose-100 border-rose-600 text-rose-950 shadow-lg scale-105'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                    >
                        <span className="text-3xl block">🔴</span>
                        <span className="block font-black text-sm">Rojo: Desnutrido Grave</span>
                        <span className="text-[11px] font-medium block">Enviar URGENTE a Centro Salud</span>
                    </button>
                </div>
            </div>

            {/* LACTANCIA MATERNA */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-base font-black text-slate-900">🤱 Tipo de Lactancia Materna</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setTipoLactancia('EXCLUSIVA')}
                        className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${tipoLactancia === 'EXCLUSIVA'
                            ? 'bg-sky-100 border-sky-600 text-sky-950 font-black shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                    >
                        <span className="text-3xl block">🤱🩵</span>
                        <span className="block font-black text-sm">Sólo durante primeros 6 meses</span>
                        <span className="text-xs text-slate-600 font-medium block">Lactancia Materna Exclusiva</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTipoLactancia('COMPLEMENTARIA')}
                        className={`p-5 rounded-3xl border-4 text-center space-y-2 transition-all ${tipoLactancia === 'COMPLEMENTARIA'
                            ? 'bg-emerald-100 border-emerald-600 text-emerald-950 font-black shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                    >
                        <span className="text-3xl block">🥣🍎</span>
                        <span className="block font-black text-sm">Después de 6 meses con alimentos</span>
                        <span className="text-xs text-slate-600 font-medium block">Leche materna + papillas comunitarias</span>
                    </button>
                </div>
            </div>

            {/* REGISTRO DE CANALIZACIONES CON CAPTURA DE FECHAS DE REFERENCIA Y APLICACIÓN */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-700" />
                    <span>Registro de Canalizaciones (Fechas de Referencia & Aplicación)</span>
                </h3>

                <div className="space-y-4">
                    {/* 1. TAMIZ NEONATAL (PIE CON GOTA) */}
                    <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🦶🩸</span>
                            <div>
                                <span className="block font-black text-sm text-slate-900">1. Tamiz Neonatal (3 a 5 días)</span>
                                <span className="text-xs text-slate-600 font-medium">Toma de gota de sangre del talón</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600">Fecha Referencia</label>
                                <input
                                    type="date"
                                    value={tamizRef}
                                    onChange={(e) => setTamizRef(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs font-bold text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600">Fecha Aplicación</label>
                                <input
                                    type="date"
                                    value={tamizApli}
                                    onChange={(e) => setTamizApli(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs font-bold text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. VACUNA BCG Y ANTIHEPATITIS B */}
                    <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">💉</span>
                            <div>
                                <span className="block font-black text-sm text-slate-900">2. Vacuna BCG / Hepatitis B (0-28 días)</span>
                                <span className="text-xs text-slate-600 font-medium">Inmunización recién nacido</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600">Fecha Referencia</label>
                                <input
                                    type="date"
                                    value={bcgRef}
                                    onChange={(e) => setBcgRef(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs font-bold text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600">Fecha Aplicación</label>
                                <input
                                    type="date"
                                    value={bcgApli}
                                    onChange={(e) => setBcgApli(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs font-bold text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. VITAMINAS A Y K */}
                    <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">💧</span>
                            <div>
                                <span className="block font-black text-sm text-slate-900">3. Vitaminas "A" y "K" (0-28 días)</span>
                                <span className="text-xs text-slate-600 font-medium">Gotas de prevención profiláctica</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600">Fecha Referencia</label>
                                <input
                                    type="date"
                                    value={vitRef}
                                    onChange={(e) => setVitRef(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs font-bold text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600">Fecha Aplicación</label>
                                <input
                                    type="date"
                                    value={vitApli}
                                    onChange={(e) => setVitApli(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs font-bold text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. TAMIZ AUDITIVO NEONATAL */}
                    <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🎧</span>
                            <div>
                                <span className="block font-black text-sm text-slate-900">4. Tamiz Auditivo Neonatal (0-28 días)</span>
                                <span className="text-xs text-slate-600 font-medium">Revisión de audición temprana</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600">Fecha Referencia</label>
                                <input
                                    type="date"
                                    value={auditivoRef}
                                    onChange={(e) => setAuditivoRef(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs font-bold text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600">Fecha Aplicación</label>
                                <input
                                    type="date"
                                    value={auditivoApli}
                                    onChange={(e) => setAuditivoApli(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs font-bold text-slate-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CIERRE ADMINISTRATIVO CON FIRMA / HUELLA DIGITAL */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border-2 border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <PenTool className="w-6 h-6 text-amber-400" />
                    <div>
                        <h3 className="text-lg font-black text-white">Cierre Administrativo del Informe Comunitaria</h3>
                        <p className="text-xs text-slate-400">Firmas oficiales para envío mensual a los Servicios de Salud de Oaxaca</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-300">👩‍🦱 Nombre de la Partera</label>
                        <input
                            type="text"
                            value={nombrePartera}
                            onChange={(e) => setNombrePartera(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-300">🔢 No. Municipio / Jurisdicción</label>
                        <input
                            type="text"
                            value={noMunicipio}
                            onChange={(e) => setNoMunicipio(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-300">📅 Mes Informado</label>
                        <input
                            type="text"
                            value={mesInformado}
                            onChange={(e) => setMesInformado(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-300">👩‍⚕️ Nombre del Supervisor SSO</label>
                        <input
                            type="text"
                            value={nombreSupervisor}
                            onChange={(e) => setNombreSupervisor(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-300">🏥 Centro de Salud de Adscripción</label>
                        <input
                            type="text"
                            value={centroSaludSupervision}
                            onChange={(e) => setCentroSaludSupervision(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white"
                        />
                    </div>
                </div>

                {/* HUELLA DIGITAL / FIRMA DIGITAL SIMULADA */}
                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-400/20 text-amber-400 rounded-xl flex items-center justify-center font-black text-xl border border-amber-400/30">
                            🖐️
                        </div>
                        <div>
                            <span className="block text-xs font-black text-white">Huella Digital / Firma de la Partera</span>
                            <span className="text-[11px] text-slate-400">
                                {huellaRegistrada ? 'Huella Digital Capturada Correctamente ✅' : 'Toque el botón para registrar la huella táctil'}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setHuellaRegistrada(true);
                            hablarTexto('Huella digital capturada exitosamente.');
                        }}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs ${huellaRegistrada
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                            }`}
                    >
                        {huellaRegistrada ? '✓ Huella Capturada' : '🖐️ Capturar Huella Táctil'}
                    </button>
                </div>
            </div>

            {/* BOTÓN FINAL DE ENVÍO GUINDA OAXACA */}
            <button
                type="submit"
                className="w-full py-5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-black text-lg rounded-3xl shadow-xl border-2 border-rose-300 flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
                <Send className="w-6 h-6" />
                <span>REGISTRAR CALENDARIO DEL NIÑO (FORMATO 3)</span>
            </button>
        </form>
    );
};
