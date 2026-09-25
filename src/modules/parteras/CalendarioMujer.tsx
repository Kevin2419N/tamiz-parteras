import React, { useState } from 'react';
import {
    HeartPulse,
    Mic,
    MicOff,
    Send,
    ChevronLeft,
    AlertTriangle,
    Calendar,
    Fingerprint,
    Check,
    ShieldAlert,
    User,
    PenTool
} from 'lucide-react';
import { handleVoiceInput } from '../../utils/voiceUtils';

export interface CalendarioMujerProps {
    onBack?: () => void;
    onSuccess?: () => void;
    hablarTexto?: (texto: string) => void;
    isListening?: boolean;
    campoEscuchando?: string | null;
    iniciarDictado?: (campo: string, setFieldState?: (val: string) => void) => void;
}

export const CalendarioMujer: React.FC<CalendarioMujerProps> = ({
    onBack,
    onSuccess,
    hablarTexto
}) => {
    // 1. Datos de Identificación
    const [nombreMujer, setNombreMujer] = useState('');
    const [edad, setEdad] = useState('24');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [municipio, setMunicipio] = useState('Juchitán de Zaragoza');
    const [localidad, setLocalidad] = useState('Álvaro Obregón');

    // Voice dictation tracking
    const [listeningField, setListeningField] = useState<string | null>(null);

    // 2. Control Prenatal y Embarazo Normal
    const [mesSeleccionado, setMesSeleccionado] = useState<number>(5);
    const [acidoFolico, setAcidoFolico] = useState(true);
    const [hierro, setHierro] = useState(true);
    const [vacunaTetanos, setVacunaTetanos] = useState<'1A' | '2A' | 'REFUERZO'>('1A');
    const [cintaMUAC, setCintaMUAC] = useState<'VERDE' | 'AMARILLO' | 'ROJO'>('VERDE');

    // 3. Embarazo con Complicaciones (Mapa Radial)
    const [referidoEmbarazo, setReferidoEmbarazo] = useState<boolean>(false);
    const [sintomasComplicaciones, setSintomasComplicaciones] = useState<string[]>([]);

    // 4. Aborto, Dolor y Hemorragia
    const [referidoAborto, setReferidoAborto] = useState<boolean>(false);
    const [tarjetasAborto, setTarjetasAborto] = useState<string[]>([]);

    // 5. Parto Normal
    const [partoNormalPosicion, setPartoNormalPosicion] = useState<'VERTICAL' | 'HORIZONTAL' | null>('VERTICAL');
    const [partoNormalResultado, setPartoNormalResultado] = useState<'NINO_VIVO' | 'NINA_VIVA' | null>('NINO_VIVO');

    // 6. Parto Complicado
    const [referidoPartoComplicado, setReferidoPartoComplicado] = useState<boolean>(false);
    const [partoComplicadoOpcion, setPartoComplicadoOpcion] = useState<string | null>(null);

    // 7. Puerperio Normal y Complicado
    const [cintaMUACPuerperio, setCintaMUACPuerperio] = useState<'VERDE' | 'AMARILLO' | 'ROJO'>('VERDE');
    const [referidoPuerperio, setReferidoPuerperio] = useState<boolean>(false);
    const [puerperioCheckboxes, setPuerperioCheckboxes] = useState<string[]>([]);

    // 8. Muerte Materna †
    const [muerteMaternaEtapa, setMuerteMaternaEtapa] = useState<'EMBARAZO' | 'PARTO' | 'PUERPERIO' | null>(null);

    // 9. Cierre Administrativo
    const [nombrePartera, setNombrePartera] = useState('Rosa Santiz Gómez');
    const [cierreLocalidad, setCierreLocalidad] = useState('La Ventosa');
    const [noMunicipio, setNoMunicipio] = useState('043');
    const [mesInformado, setMesInformado] = useState('Septiembre 2026');
    const [nombreSupervisor, setNombreSupervisor] = useState('Lic. Enf. María de la Luz V.');
    const [centroSalud, setCentroSalud] = useState('Centro de Salud La Ventosa / Jurisdicción Sanitaria No. 2 Istmo');
    const [huellaRegistrada, setHuellaRegistrada] = useState(false);

    // Web Speech API Voice Dictation
    const startVoice = (setter: (val: string) => void, fieldKey: string) => {
        handleVoiceInput(
            (val) => setter(val),
            (l) => setListeningField(l ? fieldKey : null)
        );
    };

    const toggleSintoma = (id: string) => {
        setSintomasComplicaciones(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleTarjetaAborto = (id: string) => {
        setTarjetasAborto(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const togglePuerperioCheckbox = (id: string) => {
        setPuerperioCheckboxes(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (hablarTexto) {
            hablarTexto('Calendario de Atención a la Mujer Formato 2 registrado exitosamente.');
        }
        if (onSuccess) {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
            {/* 1. ENCUADRE INSTITUCIONAL Y MARCO DE HOJA FÍSICA */}
            <div className="border-4 border-[#9D2449] bg-white rounded-3xl shadow-xl p-4 md:p-8 space-y-8 my-4">

                {/* BANNER INSTITUCIONAL SUPERIOR CON BOTÓN REGRESAR */}
                <div className="bg-[#9D2449] text-white rounded-2xl p-4 md:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                        {onBack && (
                            <button
                                type="button"
                                onClick={onBack}
                                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/25 text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shrink-0"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Regresar</span>
                            </button>
                        )}
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                            <HeartPulse className="w-6 h-6 text-rose-200" />
                        </div>
                    </div>

                    <div className="text-center space-y-1 flex-1">
                        <span className="inline-block px-3 py-0.5 bg-white/10 text-rose-100 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20">
                            FORMATO OFICIAL NO. 2 • SSO OAXACA
                        </span>
                        <h1 className="text-lg md:text-2xl font-black text-white tracking-tight uppercase">
                            CALENDARIO DE ATENCIÓN A LA MUJER (EMBARAZO, PARTO Y PUERPERIO)
                        </h1>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 shrink-0">
                        <img src="/logo-jurisdiccion.png" alt="Jurisdicción" className="h-10 w-auto object-contain bg-white/90 p-1 rounded-lg" />
                        <img src="/Logo-Secretaria.png" alt="Secretaría" className="h-10 w-auto object-contain bg-white/90 p-1 rounded-lg" />
                    </div>
                </div>

                {/* 2. DATOS DE IDENTIFICACIÓN CON BOTONES DE MICRÓFONO EN GUINDA OAXACA */}
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-xl border border-rose-100">
                            <User className="w-5 h-5 text-[#9D2449]" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                Datos de Identificación de la Paciente
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Presione el botón de micrófono en Guinda Oaxaca para activar dictado por voz Web Speech API
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre de la Mujer */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700">Nombre de la Mujer</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    required
                                    placeholder="Nombre completo de la mujer..."
                                    value={nombreMujer}
                                    onChange={(e) => setNombreMujer(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setNombreMujer, 'nombreMujer')}
                                    className={`bg-[#9D2449] hover:bg-[#7A1B38] text-white p-3 rounded-xl transition-all flex items-center justify-center shrink-0 shadow-md ${listeningField === 'nombreMujer' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
                                        }`}
                                    title="Dictar Nombre"
                                >
                                    {listeningField === 'nombreMujer' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Edad */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">Edad (Años)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={edad}
                                    onChange={(e) => setEdad(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setEdad, 'edad')}
                                    className={`bg-[#9D2449] hover:bg-[#7A1B38] text-white p-3 rounded-xl transition-all flex items-center justify-center shrink-0 shadow-md ${listeningField === 'edad' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
                                        }`}
                                    title="Dictar Edad"
                                >
                                    {listeningField === 'edad' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Fecha */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">Fecha de Consulta</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setFecha, 'fecha')}
                                    className={`bg-[#9D2449] hover:bg-[#7A1B38] text-white p-3 rounded-xl transition-all flex items-center justify-center shrink-0 shadow-md ${listeningField === 'fecha' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
                                        }`}
                                    title="Dictar Fecha"
                                >
                                    {listeningField === 'fecha' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Localidad */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">Localidad</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={localidad}
                                    onChange={(e) => setLocalidad(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setLocalidad, 'localidad')}
                                    className={`bg-[#9D2449] hover:bg-[#7A1B38] text-white p-3 rounded-xl transition-all flex items-center justify-center shrink-0 shadow-md ${listeningField === 'localidad' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
                                        }`}
                                    title="Dictar Localidad"
                                >
                                    {listeningField === 'localidad' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Municipio */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">Municipio</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={municipio}
                                    onChange={(e) => setMunicipio(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#9D2449] focus:outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => startVoice(setMunicipio, 'municipio')}
                                    className={`bg-[#9D2449] hover:bg-[#7A1B38] text-white p-3 rounded-xl transition-all flex items-center justify-center shrink-0 shadow-md ${listeningField === 'municipio' ? 'animate-pulse ring-4 ring-rose-400 bg-rose-700' : ''
                                        }`}
                                    title="Dictar Municipio"
                                >
                                    {listeningField === 'municipio' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. SECCIÓN EMBARAZO NORMAL Y CONTROL PRENATAL */}
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    1. Embarazo Normal y Control Prenatal
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Selección de mes gestacional, micronutrientes, vacuna anti-tetánica y semáforo nutricional
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Embarazo Normal Imagen & Mes de Embarazo 3x3 */}
                        <div className="md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
                                <img
                                    src="/EmbarazoNormal.png"
                                    alt="Embarazo Normal"
                                    className="h-24 mix-blend-multiply object-contain shrink-0"
                                />
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm md:text-base">
                                        Embarazo Normal (Evolución Fisiológica)
                                    </h4>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Seleccione el mes de gestación activo (1º al 9º Mes)
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-700 uppercase">
                                    Mes de Embarazo Activo:
                                </label>
                                <div className="grid grid-cols-3 gap-2.5">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                                        <button
                                            type="button"
                                            key={m}
                                            onClick={() => setMesSeleccionado(m)}
                                            className={`rounded-xl p-3 border-2 text-center font-bold text-sm transition-all cursor-pointer ${mesSeleccionado === m
                                                ? 'bg-[#9D2449] text-white border-[#7A1B38] shadow-md scale-[1.03]'
                                                : 'bg-white text-slate-800 border-slate-300 hover:border-[#9D2449] hover:bg-rose-50'
                                                }`}
                                        >
                                            {m}º Mes
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Suplementos y Vacunas */}
                        <div className="space-y-4">
                            {/* Ácido Fólico */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-center">
                                <img
                                    src="/DuranteElEmbarazo-PrimerosMeses.png"
                                    alt="Ácido Fólico"
                                    className="h-16 mix-blend-multiply object-contain mx-auto"
                                />
                                <button
                                    type="button"
                                    onClick={() => setAcidoFolico(!acidoFolico)}
                                    className={`w-full py-2.5 px-3 rounded-xl border-2 font-black text-xs transition-all ${acidoFolico
                                        ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                                        : 'bg-white border-slate-300 text-slate-700'
                                        }`}
                                >
                                    💊 Ácido Fólico (30 Días): {acidoFolico ? 'Entregado ✅' : 'Pendiente ❌'}
                                </button>
                            </div>

                            {/* Sulfato Ferroso */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-center">
                                <img
                                    src="/DuranteElEmbarazo.png"
                                    alt="Sulfato Ferroso"
                                    className="h-16 mix-blend-multiply object-contain mx-auto"
                                />
                                <button
                                    type="button"
                                    onClick={() => setHierro(!hierro)}
                                    className={`w-full py-2.5 px-3 rounded-xl border-2 font-black text-xs transition-all ${hierro
                                        ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                                        : 'bg-white border-slate-300 text-slate-700'
                                        }`}
                                >
                                    🩸 Sulfato Ferroso: {hierro ? 'Entregado ✅' : 'Pendiente ❌'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Vacunación Anti-Tetánica & Estado Nutricional MUAC */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                        {/* Vacuna anti-tetánica */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                            <img
                                src="/Aplicar-Toxoide-Tetanico.png"
                                alt="Vacunación Anti-Tetánica"
                                className="h-20 mix-blend-multiply object-contain shrink-0"
                            />
                            <div className="space-y-2 w-full">
                                <h4 className="font-black text-slate-900 text-xs uppercase">
                                    Vacunación Anti-Tetánica (Td/Tdap)
                                </h4>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {(['1A', '2A', 'REFUERZO'] as const).map((v) => (
                                        <button
                                            type="button"
                                            key={v}
                                            onClick={() => setVacunaTetanos(v)}
                                            className={`py-2 px-1 rounded-xl text-xs font-black border-2 transition-all ${vacunaTetanos === v
                                                ? 'bg-[#9D2449] text-white border-[#7A1B38]'
                                                : 'bg-white text-slate-800 border-slate-300 hover:bg-rose-50'
                                                }`}
                                        >
                                            {v === '1A' ? '1ª Dosis' : v === '2A' ? '2ª Dosis' : 'Refuerzo'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Estado Nutricional Madre - Cinta MUAC / Semáforo */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-black text-slate-900 uppercase">
                                📏 Estado Nutricional Madre (Cinta MUAC / Semáforo)
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCintaMUAC('VERDE')}
                                    className={`p-3 rounded-xl border-4 font-black text-xs text-center transition-all ${cintaMUAC === 'VERDE'
                                        ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-md scale-[1.02]'
                                        : 'bg-white border-slate-200 text-slate-700'
                                        }`}
                                >
                                    🟢 Verde: Adecuado
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCintaMUAC('AMARILLO')}
                                    className={`p-3 rounded-xl border-4 font-black text-xs text-center transition-all ${cintaMUAC === 'AMARILLO'
                                        ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-md scale-[1.02]'
                                        : 'bg-white border-slate-200 text-slate-700'
                                        }`}
                                >
                                    🟡 Amarillo: Riesgo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCintaMUAC('ROJO')}
                                    className={`p-3 rounded-xl border-4 font-black text-xs text-center transition-all ${cintaMUAC === 'ROJO'
                                        ? 'bg-rose-100 border-rose-600 text-rose-950 shadow-md scale-[1.02]'
                                        : 'bg-white border-slate-200 text-slate-700'
                                        }`}
                                >
                                    🔴 Rojo: Desnutrición
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. SECCIÓN EMBARAZO CON COMPLICACIONES (MAPA RADIAL / DIAGRAMA DE FLECHAS) */}
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    2. Embarazo con Complicaciones (Mapa Radial de Síntomas)
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Seleccione las tarjetas de signos de alarma identificados durante la valoración
                                </p>
                            </div>
                        </div>

                        {/* Switch táctil Referido SI / NO */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-300">
                            <span className="text-xs font-black px-2 text-slate-700">Referido:</span>
                            <button
                                type="button"
                                onClick={() => setReferidoEmbarazo(false)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${!referidoEmbarazo
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'bg-transparent text-slate-600'
                                    }`}
                            >
                                NO
                            </button>
                            <button
                                type="button"
                                onClick={() => setReferidoEmbarazo(true)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${referidoEmbarazo
                                    ? 'bg-[#9D2449] text-white shadow-sm ring-2 ring-rose-400'
                                    : 'bg-transparent text-slate-600'
                                    }`}
                            >
                                SI 🚨
                            </button>
                        </div>
                    </div>

                    {/* CONTENEDOR CENTRAL RADIAL */}
                    <div className="bg-rose-50/50 border-2 border-rose-200 rounded-3xl p-6 space-y-6">
                        {/* Imagen Central */}
                        <div className="flex flex-col items-center justify-center text-center space-y-2">
                            <img
                                src="/EmbarazoConComplicaciones.png"
                                alt="Embarazo con Complicaciones"
                                className="h-28 mix-blend-multiply object-contain"
                            />
                            <span className="px-4 py-1 bg-rose-700 text-white rounded-full text-xs font-black uppercase shadow-md">
                                EMBARAZO CON COMPLICACIONES
                            </span>
                        </div>

                        {/* Grid Radial alrededor con tarjetas de síntomas seleccionables */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[
                                { id: 'DOLOR_CABEZA', img: '/DolorDeCabeza.png', label: 'Dolor de cabeza, zumbidos en oídos, ver lucecitas' },
                                { id: 'HINCHAZON', img: '/Hinchazon.png', label: 'Hinchazón de cara, manos, piernas y pies' },
                                { id: 'CONVULSIONES', img: '/Convulsiones.png', label: 'Convulsiones o ataques' },
                                { id: 'ORINA_DIFICULTAD', img: '/DificultadesDeOrinar.png', label: 'Dificultad al orinar o con sangre' },
                                { id: 'VOMITO_FRECUENTE', img: '/VomitoFrecuente.png', label: 'Vómito frecuente después de los 3 meses' },
                                { id: 'DIFICULTAD_RESPIRAR', img: '/DificultadParaRespirar.png', label: 'Dificultad al respirar (labios y uñas moradas)' },
                                { id: 'DOLOR_ANTES_8_MESES', img: '/DolorAntesDeLos8Meses.png', label: 'Dolor antes de los 8 meses' },
                            ].map((item) => {
                                const activo = sintomasComplicaciones.includes(item.id);
                                return (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() => toggleSintoma(item.id)}
                                        className={`p-4 rounded-2xl border-4 text-center flex flex-col items-center justify-between gap-3 transition-all cursor-pointer ${activo
                                            ? 'bg-rose-100 border-[#9D2449] shadow-lg scale-[1.02] ring-2 ring-rose-400'
                                            : 'bg-white border-slate-200 hover:border-rose-300'
                                            }`}
                                    >
                                        <img
                                            src={item.img}
                                            alt={item.label}
                                            className="h-20 mix-blend-multiply object-contain"
                                        />
                                        <p className="text-xs font-extrabold text-slate-900 leading-tight">
                                            {item.label}
                                        </p>
                                        <div className={`w-full py-1.5 rounded-xl text-[10px] font-black uppercase ${activo ? 'bg-[#9D2449] text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            {activo ? 'Seleccionado ✅' : 'Seleccionar'}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 5. SECCIÓN ABORTO, DOLOR Y HEMORRAGIA */}
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    3. Aborto, Dolor y Hemorragia
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Evaluación de complicaciones hemorrágicas o dolor agudo
                                </p>
                            </div>
                        </div>

                        {/* Switch táctil Ref. SI / NO */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-300">
                            <span className="text-xs font-black px-2 text-slate-700">Ref. SI / NO:</span>
                            <button
                                type="button"
                                onClick={() => setReferidoAborto(false)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${!referidoAborto
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'bg-transparent text-slate-600'
                                    }`}
                            >
                                NO
                            </button>
                            <button
                                type="button"
                                onClick={() => setReferidoAborto(true)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${referidoAborto
                                    ? 'bg-[#9D2449] text-white shadow-sm ring-2 ring-rose-400'
                                    : 'bg-transparent text-slate-600'
                                    }`}
                            >
                                SI 🚨
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'ABORTO', img: '/Aborto.png', title: 'Aborto' },
                            { id: 'DOLOR', img: '/Dolor.png', title: 'Dolor' },
                            { id: 'HEMORRAGIA', img: '/Hemorragia.png', title: 'Hemorragia' },
                        ].map((item) => {
                            const activo = tarjetasAborto.includes(item.id);
                            return (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => toggleTarjetaAborto(item.id)}
                                    className={`p-5 rounded-2xl border-4 text-center flex flex-col items-center justify-between gap-4 transition-all cursor-pointer ${activo
                                        ? 'bg-rose-100 border-[#9D2449] shadow-lg scale-[1.02]'
                                        : 'bg-slate-50 border-slate-200 hover:border-rose-300'
                                        }`}
                                >
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="h-24 mix-blend-multiply object-contain"
                                    />
                                    <span className="font-black text-base text-slate-900">
                                        {item.title}
                                    </span>
                                    <div className={`w-full py-2 rounded-xl text-xs font-black ${activo ? 'bg-[#9D2449] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>
                                        {activo ? 'Registrado ✅' : 'Marcar'}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 6. SECCIÓN PARTO NORMAL (VERTICAL Y HORIZONTAL) */}
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
                            <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                4. Parto Normal (Posición Vertical y Horizontal)
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Registro de posición del parto y resultado del recién nacido
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Fila 1: Parto Vertical */}
                        <div className={`p-5 rounded-2xl border-4 transition-all flex flex-col md:flex-row items-center justify-between gap-6 ${partoNormalPosicion === 'VERTICAL' ? 'bg-purple-50/80 border-purple-600 shadow-md' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-4">
                                <img
                                    src="/PartoNormalVertical.png"
                                    alt="Parto Normal Vertical"
                                    className="h-24 mix-blend-multiply object-contain shrink-0"
                                />
                                <div>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-xs font-black uppercase">
                                        Fila 1: Parto Vertical
                                    </span>
                                    <h4 className="text-base font-black text-slate-900 mt-1">
                                        Parto Humanizado Vertical
                                    </h4>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Posición tradicional de pie, acuclillada o en silla hidrostática
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPartoNormalPosicion('VERTICAL');
                                        setPartoNormalResultado('NINO_VIVO');
                                    }}
                                    className={`flex-1 md:flex-initial p-3 rounded-2xl border-2 flex items-center gap-2 transition-all ${partoNormalPosicion === 'VERTICAL' && partoNormalResultado === 'NINO_VIVO'
                                        ? 'bg-sky-100 border-sky-600 text-sky-950 font-black shadow-sm'
                                        : 'bg-white border-slate-300 text-slate-700'
                                        }`}
                                >
                                    <img src="/NiñoVivo.png" alt="Niño Vivo" className="h-10 mix-blend-multiply object-contain" />
                                    <span className="text-xs">🩵 Niño Vivo</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPartoNormalPosicion('VERTICAL');
                                        setPartoNormalResultado('NINA_VIVA');
                                    }}
                                    className={`flex-1 md:flex-initial p-3 rounded-2xl border-2 flex items-center gap-2 transition-all ${partoNormalPosicion === 'VERTICAL' && partoNormalResultado === 'NINA_VIVA'
                                        ? 'bg-rose-100 border-rose-600 text-rose-950 font-black shadow-sm'
                                        : 'bg-white border-slate-300 text-slate-700'
                                        }`}
                                >
                                    <img src="/NiñaViva.png" alt="Niña Viva" className="h-10 mix-blend-multiply object-contain" />
                                    <span className="text-xs">🩷 Niña Viva</span>
                                </button>
                            </div>
                        </div>

                        {/* Fila 2: Parto Horizontal */}
                        <div className={`p-5 rounded-2xl border-4 transition-all flex flex-col md:flex-row items-center justify-between gap-6 ${partoNormalPosicion === 'HORIZONTAL' ? 'bg-purple-50/80 border-purple-600 shadow-md' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-4">
                                <img
                                    src="/PartoNormalHorizontal.png"
                                    alt="Parto Normal Horizontal"
                                    className="h-24 mix-blend-multiply object-contain shrink-0"
                                />
                                <div>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-xs font-black uppercase">
                                        Fila 2: Parto Horizontal
                                    </span>
                                    <h4 className="text-base font-black text-slate-900 mt-1">
                                        Parto Horizontal (Decúbito Supino)
                                    </h4>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Posición horizontal asistida en camilla de atención
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPartoNormalPosicion('HORIZONTAL');
                                        setPartoNormalResultado('NINO_VIVO');
                                    }}
                                    className={`flex-1 md:flex-initial p-3 rounded-2xl border-2 flex items-center gap-2 transition-all ${partoNormalPosicion === 'HORIZONTAL' && partoNormalResultado === 'NINO_VIVO'
                                        ? 'bg-sky-100 border-sky-600 text-sky-950 font-black shadow-sm'
                                        : 'bg-white border-slate-300 text-slate-700'
                                        }`}
                                >
                                    <img src="/NiñoVivo.png" alt="Niño Vivo" className="h-10 mix-blend-multiply object-contain" />
                                    <span className="text-xs">🩵 Niño Vivo</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPartoNormalPosicion('HORIZONTAL');
                                        setPartoNormalResultado('NINA_VIVA');
                                    }}
                                    className={`flex-1 md:flex-initial p-3 rounded-2xl border-2 flex items-center gap-2 transition-all ${partoNormalPosicion === 'HORIZONTAL' && partoNormalResultado === 'NINA_VIVA'
                                        ? 'bg-rose-100 border-rose-600 text-rose-950 font-black shadow-sm'
                                        : 'bg-white border-slate-300 text-slate-700'
                                        }`}
                                >
                                    <img src="/NiñaViva.png" alt="Niña Viva" className="h-10 mix-blend-multiply object-contain" />
                                    <span className="text-xs">🩷 Niña Viva</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7. SECCIÓN PARTO COMPLICADO */}
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    5. Parto Complicado (Resultado de Nacimiento)
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Seleccione si el nacimiento presentó complicaciones o defunción
                                </p>
                            </div>
                        </div>

                        {/* Switch táctil Referido: SI / NO */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-300">
                            <span className="text-xs font-black px-2 text-slate-700">Referido:</span>
                            <button
                                type="button"
                                onClick={() => setReferidoPartoComplicado(false)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${!referidoPartoComplicado
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'bg-transparent text-slate-600'
                                    }`}
                            >
                                NO
                            </button>
                            <button
                                type="button"
                                onClick={() => setReferidoPartoComplicado(true)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${referidoPartoComplicado
                                    ? 'bg-[#9D2449] text-white shadow-sm ring-2 ring-rose-400'
                                    : 'bg-transparent text-slate-600'
                                    }`}
                            >
                                SI 🚨
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { id: 'NINO_COMPLICADO', img: '/NiñoComplicado.png', title: 'Niño Complicado' },
                            { id: 'NINA_COMPLICADA', img: '/NiñaComplicado.png', title: 'Niña Complicada' },
                            { id: 'NINO_MUERTO', img: '/NiñoMuerto.png', title: 'Niño Muerto †' },
                            { id: 'NINA_MUERTA', img: '/NiñaMuerta.png', title: 'Niña Muerta †' },
                        ].map((item) => {
                            const activo = partoComplicadoOpcion === item.id;
                            return (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => setPartoComplicadoOpcion(activo ? null : item.id)}
                                    className={`p-4 rounded-2xl border-4 text-center flex flex-col items-center justify-between gap-3 transition-all cursor-pointer ${activo
                                        ? 'bg-rose-100 border-[#9D2449] shadow-lg scale-[1.02]'
                                        : 'bg-slate-50 border-slate-200 hover:border-rose-300'
                                        }`}
                                >
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="h-20 mix-blend-multiply object-contain"
                                    />
                                    <span className="font-extrabold text-xs text-slate-900">
                                        {item.title}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 8. SECCIÓN PUERPERIO NORMAL Y COMPLICADO */}
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                            <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                6. Puerperio Normal y Complicado (Primeros 40 Días Postparto)
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Monitoreo nutricional y detección de complicaciones puerperales
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Puerperio Normal: Cinta MUAC */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                            <h4 className="font-black text-slate-900 text-sm uppercase">
                                Puerperio Normal (Estado Nutricional MUAC)
                            </h4>
                            <p className="text-xs text-slate-600">
                                Evaluación de la recuperación nutricia materna en la etapa posparto
                            </p>
                            <div className="grid grid-cols-3 gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCintaMUACPuerperio('VERDE')}
                                    className={`p-3 rounded-xl border-4 font-black text-xs text-center transition-all ${cintaMUACPuerperio === 'VERDE'
                                        ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-md'
                                        : 'bg-white border-slate-200 text-slate-700'
                                        }`}
                                >
                                    🟢 Verde
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCintaMUACPuerperio('AMARILLO')}
                                    className={`p-3 rounded-xl border-4 font-black text-xs text-center transition-all ${cintaMUACPuerperio === 'AMARILLO'
                                        ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-md'
                                        : 'bg-white border-slate-200 text-slate-700'
                                        }`}
                                >
                                    🟡 Amarillo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCintaMUACPuerperio('ROJO')}
                                    className={`p-3 rounded-xl border-4 font-black text-xs text-center transition-all ${cintaMUACPuerperio === 'ROJO'
                                        ? 'bg-rose-100 border-rose-600 text-rose-950 shadow-md'
                                        : 'bg-white border-slate-200 text-slate-700'
                                        }`}
                                >
                                    🔴 Rojo
                                </button>
                            </div>
                        </div>

                        {/* Puerperio Complicado */}
                        <div className="bg-rose-50/60 p-5 rounded-2xl border-2 border-rose-200 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-black text-rose-950 text-sm uppercase">
                                    Puerperio Complicado
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-700">Ref:</span>
                                    <button
                                        type="button"
                                        onClick={() => setReferidoPuerperio(!referidoPuerperio)}
                                        className={`px-3 py-1 rounded-xl text-xs font-black border transition-all ${referidoPuerperio ? 'bg-[#9D2449] text-white border-[#7A1B38]' : 'bg-white text-slate-700 border-slate-300'}`}
                                    >
                                        {referidoPuerperio ? 'SI 🚨' : 'NO'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <img
                                    src="/PuerpericoComplicado.png"
                                    alt="Puerperio Complicado"
                                    className="h-24 mix-blend-multiply object-contain shrink-0"
                                />
                                <div className="space-y-2 flex-1">
                                    {[
                                        { id: 'SANGRADO_ABUNDANTE', label: 'Sangrado abundante' },
                                        { id: 'CALENTURA', label: 'Calentura / Fiebre' },
                                        { id: 'SANGRADO_MAL_OLOR', label: 'Sangrado con mal olor' },
                                    ].map((chk) => {
                                        const marcado = puerperioCheckboxes.includes(chk.id);
                                        return (
                                            <button
                                                type="button"
                                                key={chk.id}
                                                onClick={() => togglePuerperioCheckbox(chk.id)}
                                                className={`w-full p-2.5 rounded-xl border-2 text-left font-bold text-xs flex items-center justify-between transition-all ${marcado
                                                    ? 'bg-rose-200 border-[#9D2449] text-rose-950 font-black'
                                                    : 'bg-white border-slate-300 text-slate-700'
                                                    }`}
                                            >
                                                <span>[{marcado ? 'X' : ' '}] {chk.label}</span>
                                                {marcado && <Check className="w-4 h-4 text-[#9D2449]" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 9. SECCIÓN MUERTE MATERNA */}
                <div className="bg-rose-950 text-white p-6 rounded-3xl border-2 border-rose-900 space-y-4 shadow-xl">
                    <div className="flex items-center gap-3 border-b border-rose-800 pb-3">
                        <div className="p-2 bg-rose-900 text-rose-200 rounded-xl border border-rose-700">
                            <ShieldAlert className="w-6 h-6 text-rose-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-rose-100">
                                7. Muerte Materna (Alerta Epidemiológica Médica) †
                            </h3>
                            <p className="text-xs text-rose-300">
                                Registro prioritario inmediato ante fallecimiento materno acontecido en la comunidad
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'EMBARAZO', img: '/MuerteMaternaEmbarazo.png', title: 'Embarazo †' },
                            { id: 'PARTO', img: '/MuerteMaternaParto.png', title: 'Parto †' },
                            { id: 'PUERPERIO', img: '/MuertePartoPuerperico.png', title: 'Puerperio †' },
                        ].map((item) => {
                            const activo = muerteMaternaEtapa === item.id;
                            return (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => setMuerteMaternaEtapa(activo ? null : (item.id as any))}
                                    className={`p-4 rounded-2xl border-4 text-center flex flex-col items-center justify-between gap-3 transition-all cursor-pointer ${activo
                                        ? 'bg-rose-600 text-white border-white shadow-xl scale-[1.03] ring-4 ring-rose-400'
                                        : 'bg-rose-900/50 border-rose-800 text-rose-200 hover:bg-rose-900'
                                        }`}
                                >
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="h-20 mix-blend-multiply object-contain bg-white/10 p-2 rounded-xl"
                                    />
                                    <span className="font-black text-sm">{item.title}</span>
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${activo ? 'bg-white text-rose-950 font-black' : 'bg-rose-800 text-rose-300'}`}>
                                        {activo ? 'Registrado †' : 'Notificar'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 10. CIERRE ADMINISTRATIVO Y BOTÓN FINAL EN GUINDA OAXACA */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <div className="p-2.5 bg-amber-400/20 text-amber-400 rounded-xl border border-amber-400/30">
                            <PenTool className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-white">
                                Cierre Administrativo del Informe Materno (Formato 2)
                            </h3>
                            <p className="text-xs text-slate-400">
                                Ingrese datos de la partera acreditada, localidad, municipio y validación por huella digital
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Nombre de la Partera</label>
                            <input
                                type="text"
                                value={nombrePartera}
                                onChange={(e) => setNombrePartera(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Localidad</label>
                            <input
                                type="text"
                                value={cierreLocalidad}
                                onChange={(e) => setCierreLocalidad(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">No. Municipio</label>
                            <input
                                type="text"
                                value={noMunicipio}
                                onChange={(e) => setNoMunicipio(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Mes Informado</label>
                            <input
                                type="text"
                                value={mesInformado}
                                onChange={(e) => setMesInformado(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Supervisor</label>
                            <input
                                type="text"
                                value={nombreSupervisor}
                                onChange={(e) => setNombreSupervisor(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Centro de Salud</label>
                            <input
                                type="text"
                                value={centroSalud}
                                onChange={(e) => setCentroSalud(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                            />
                        </div>
                    </div>

                    {/* Botón de Huella Digital en Dorado/Vibrante */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setHuellaRegistrada(!huellaRegistrada);
                                if (hablarTexto) hablarTexto(huellaRegistrada ? "Huella removida" : "Huella digital registrada");
                            }}
                            className={`w-full md:w-auto py-3 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md ${huellaRegistrada
                                ? 'bg-emerald-500 text-white ring-4 ring-emerald-400/40'
                                : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                                }`}
                        >
                            <Fingerprint className="w-6 h-6" />
                            <span>{huellaRegistrada ? 'HUELLA DIGITAL CAPTURADA ✅' : 'CAPTURAR HUELLA DIGITAL DE LA PARTERA'}</span>
                        </button>
                    </div>

                    {/* Botón Gigante Final en Guinda Oaxaca */}
                    <button
                        type="submit"
                        className="bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xl py-4 rounded-2xl w-full font-bold shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95 border-2 border-rose-300 cursor-pointer"
                    >
                        <Send className="w-6 h-6" />
                        <span>REGISTRAR CALENDARIO DE LA MUJER (FORMATO 2)</span>
                    </button>
                </div>

            </div>
        </form>
    );
};

export default CalendarioMujer;
