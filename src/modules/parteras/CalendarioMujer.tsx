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
    PenTool,
    Pill,
    Droplet,
    Ruler,
    X,
    Baby,
    FileText,
    Building2,
    Award,
    Megaphone
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
    // 0. Modo Duplicado (Vista Partera vs Copia Centro de Salud)
    const [modoDuplicado, setModoDuplicado] = useState(false);

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

    // 8. Muerte Materna
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

                {/* 1. TOGGLE DE VISTA PARTERA / CENTRO DE SALUD Y BOTÓN REGRESAR */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                        {onBack && (
                            <button
                                type="button"
                                onClick={onBack}
                                className="bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Regresar</span>
                            </button>
                        )}
                    </div>

                    <div className="bg-slate-200/90 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-300 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setModoDuplicado(false);
                                if (hablarTexto) hablarTexto("Vista Partera activa");
                            }}
                            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${!modoDuplicado
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
                            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${modoDuplicado
                                ? 'bg-[#9D2449] text-white shadow-md'
                                : 'bg-transparent text-slate-700 hover:text-slate-900'
                                }`}
                        >
                            <Building2 className="w-4 h-4" />
                            <span>Copia para Centro de Salud</span>
                        </button>
                    </div>
                </div>

                {/* BANNER SUPERIOR INSTITUCIONAL "ACUDE A TU UNIDAD DE SALUD" */}
                <div className="bg-[#9D2449] text-white rounded-2xl p-4 text-center shadow-md font-bold text-lg md:text-xl flex items-center justify-center gap-3">
                    <Megaphone className="w-6 h-6 text-rose-200 shrink-0" />
                    <span>ACUDE A TU UNIDAD DE SALUD - CALENDARIO DE ATENCIÓN A LA MUJER</span>
                </div>

                {/* Insignia para Copia Centro de Salud */}
                {modoDuplicado && (
                    <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm animate-fadeIn">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-bold shadow-sm">
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
                                    Expediente oficial de reporte mensual de atención materna para los Servicios de Salud de Oaxaca.
                                </p>
                            </div>
                        </div>
                        <span className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400/30 text-amber-900 font-extrabold text-xs rounded-xl border border-amber-400/50 shrink-0">
                            <Award className="w-4 h-4" /> Copia Institucional
                        </span>
                    </div>
                )}

                {/* HEADER INSTITUCIONAL CON LOGOS FLANQUEANDO EL TÍTULO (HOMOLOGADO Y RESPONSIVO) */}
                <div className="bg-white p-4 md:p-6 rounded-3xl border-2 border-slate-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                    <img
                        src="/logo-jurisdiccion.png"
                        alt="Logo Jurisdicción Sanitaria"
                        className="h-14 md:h-20 w-auto object-contain shrink-0 mix-blend-multiply"
                    />

                    <div className="text-center space-y-1">
                        <span className="inline-block px-3.5 py-1 bg-rose-100 text-[#9D2449] rounded-full text-[11px] font-black uppercase tracking-wider border border-rose-200">
                            SERVICIOS DE SALUD DE OAXACA • FORMATO 2
                        </span>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            CALENDARIO DE ATENCIÓN A LA MUJER
                        </h1>
                        <p className="text-xs sm:text-sm font-semibold text-slate-600">
                            Durante el Embarazo, Parto y Puerperio
                        </p>
                    </div>

                    <img
                        src="/Logo-Secretaria.png"
                        alt="Logo Secretaría de Salud"
                        className="h-14 md:h-20 w-auto object-contain shrink-0 mix-blend-multiply"
                    />
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
                                    className={`w-full py-2.5 px-3 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 ${acidoFolico
                                        ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                                        : 'bg-white border-slate-300 text-slate-700'
                                        }`}
                                >
                                    <Pill className="w-4 h-4 text-emerald-700 shrink-0" />
                                    <span>Ácido Fólico (30 Días): {acidoFolico ? 'Entregado' : 'Pendiente'}</span>
                                    {acidoFolico ? <Check className="w-4 h-4 text-emerald-700 ml-1 shrink-0" /> : <X className="w-4 h-4 text-slate-400 ml-1 shrink-0" />}
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
                                    className={`w-full py-2.5 px-3 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 ${hierro
                                        ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                                        : 'bg-white border-slate-300 text-slate-700'
                                        }`}
                                >
                                    <Droplet className="w-4 h-4 text-rose-700 shrink-0" />
                                    <span>Sulfato Ferroso: {hierro ? 'Entregado' : 'Pendiente'}</span>
                                    {hierro ? <Check className="w-4 h-4 text-emerald-700 ml-1 shrink-0" /> : <X className="w-4 h-4 text-slate-400 ml-1 shrink-0" />}
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

                        {/* Estado Nutricional Madre - Cinta MUAC Tricolor (Brazalete) */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-slate-700" />
                                <label className="block text-xs font-black text-slate-900 uppercase">
                                    Estado Nutricional Madre (Cinta MUAC Tricolor)
                                </label>
                            </div>

                            {/* Selector Táctil Tricolor Estilo Brazalete */}
                            <div className="bg-slate-200 p-1.5 rounded-2xl border border-slate-300 grid grid-cols-3 gap-1.5 shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => setCintaMUAC('VERDE')}
                                    className={`py-3 px-2 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border-2 ${cintaMUAC === 'VERDE'
                                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.03] ring-2 ring-emerald-400'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        {cintaMUAC === 'VERDE' && <Check className="w-4 h-4 text-white" />}
                                        <span className="uppercase tracking-wider">Verde</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-90">Adecuado</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCintaMUAC('AMARILLO')}
                                    className={`py-3 px-2 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border-2 ${cintaMUAC === 'AMARILLO'
                                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md scale-[1.03] ring-2 ring-amber-300'
                                        : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        {cintaMUAC === 'AMARILLO' && <Check className="w-4 h-4 text-slate-950" />}
                                        <span className="uppercase tracking-wider">Amarillo</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-90">Riesgo</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCintaMUAC('ROJO')}
                                    className={`py-3 px-2 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border-2 ${cintaMUAC === 'ROJO'
                                        ? 'bg-rose-600 text-white border-rose-700 shadow-md scale-[1.03] ring-2 ring-rose-400'
                                        : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        {cintaMUAC === 'ROJO' && <Check className="w-4 h-4 text-white" />}
                                        <span className="uppercase tracking-wider">Rojo</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-90">Desnutrición</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. SECCIÓN EMBARAZO CON COMPLICACIONES (MAPA RADIAL SIMÉTRICO) */}
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
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${referidoEmbarazo
                                    ? 'bg-[#9D2449] text-white shadow-sm ring-2 ring-rose-400'
                                    : 'bg-transparent text-slate-600'
                                    }`}
                            >
                                <span>SI</span>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                            </button>
                        </div>
                    </div>

                    {/* CONTENEDOR CENTRAL RADIAL CON CONECTORES SVG */}
                    <div className="relative bg-rose-50/50 border-2 border-rose-200 rounded-3xl p-6 md:p-8 space-y-6 overflow-hidden">
                        {/* Conectores Visuales SVG Radiales */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
                            <line x1="50%" y1="50%" x2="16%" y2="20%" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                            <line x1="50%" y1="50%" x2="50%" y2="20%" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                            <line x1="50%" y1="50%" x2="84%" y2="20%" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                            <line x1="50%" y1="50%" x2="16%" y2="50%" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                            <line x1="50%" y1="50%" x2="84%" y2="50%" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                            <line x1="50%" y1="50%" x2="33%" y2="82%" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                            <line x1="50%" y1="50%" x2="67%" y2="82%" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                        </svg>

                        {/* Layout Radial Simétrico: Fila Superior, Fila Central (Con Tarjeta Principal), Fila Inferior */}
                        <div className="relative z-10 space-y-6">
                            {/* Fila 1: Top 3 Síntomas */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { id: 'DOLOR_CABEZA', img: '/DolorDeCabeza.png', label: 'Dolor de cabeza, zumbidos en oídos, ver lucecitas' },
                                    { id: 'HINCHAZON', img: '/Hinchazon.png', label: 'Hinchazón de cara, manos, piernas y pies' },
                                    { id: 'CONVULSIONES', img: '/Convulsiones.png', label: 'Convulsiones o ataques' },
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
                                            <img src={item.img} alt={item.label} className="h-16 mix-blend-multiply object-contain" />
                                            <p className="text-xs font-extrabold text-slate-900 leading-tight">{item.label}</p>
                                            <div className={`w-full py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 ${activo ? 'bg-[#9D2449] text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                <span>{activo ? 'Seleccionado' : 'Seleccionar'}</span>
                                                {activo && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Fila 2: Síntoma Izquierdo - TARJETA CENTRAL PRINCIPAL - Síntoma Derecho */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                {/* Síntoma Izquierda */}
                                <div className="md:col-span-1">
                                    {(() => {
                                        const item = { id: 'ORINA_DIFICULTAD', img: '/DificultadesDeOrinar.png', label: 'Dificultad al orinar o con sangre' };
                                        const activo = sintomasComplicaciones.includes(item.id);
                                        return (
                                            <button
                                                type="button"
                                                onClick={() => toggleSintoma(item.id)}
                                                className={`w-full p-4 rounded-2xl border-4 text-center flex flex-col items-center justify-between gap-3 transition-all cursor-pointer ${activo
                                                    ? 'bg-rose-100 border-[#9D2449] shadow-lg scale-[1.02] ring-2 ring-rose-400'
                                                    : 'bg-white border-slate-200 hover:border-rose-300'
                                                    }`}
                                            >
                                                <img src={item.img} alt={item.label} className="h-16 mix-blend-multiply object-contain" />
                                                <p className="text-xs font-extrabold text-slate-900 leading-tight">{item.label}</p>
                                                <div className={`w-full py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 ${activo ? 'bg-[#9D2449] text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                    <span>{activo ? 'Seleccionado' : 'Seleccionar'}</span>
                                                    {activo && <Check className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                            </button>
                                        );
                                    })()}
                                </div>

                                {/* TARJETA PRINCIPAL EN EL CENTRO */}
                                <div className="md:col-span-2 bg-gradient-to-b from-rose-100 to-rose-200 border-4 border-[#9D2449] rounded-3xl p-5 text-center flex flex-col items-center justify-center shadow-xl scale-[1.03] space-y-2">
                                    <div className="p-2 bg-rose-700 text-white rounded-full shadow-sm animate-pulse">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <img
                                        src="/EmbarazoConComplicaciones.png"
                                        alt="Embarazo con Complicaciones"
                                        className="h-28 mix-blend-multiply object-contain my-1"
                                    />
                                    <span className="px-4 py-1.5 bg-[#9D2449] text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                                        EMBARAZO CON COMPLICACIONES
                                    </span>
                                    <p className="text-[11px] font-bold text-rose-950 max-w-xs">
                                        Identificación de Signos de Alarma Materna durante la Valoración
                                    </p>
                                </div>

                                {/* Síntoma Derecha */}
                                <div className="md:col-span-1">
                                    {(() => {
                                        const item = { id: 'VOMITO_FRECUENTE', img: '/VomitoFrecuente.png', label: 'Vómito frecuente después de los 3 meses' };
                                        const activo = sintomasComplicaciones.includes(item.id);
                                        return (
                                            <button
                                                type="button"
                                                onClick={() => toggleSintoma(item.id)}
                                                className={`w-full p-4 rounded-2xl border-4 text-center flex flex-col items-center justify-between gap-3 transition-all cursor-pointer ${activo
                                                    ? 'bg-rose-100 border-[#9D2449] shadow-lg scale-[1.02] ring-2 ring-rose-400'
                                                    : 'bg-white border-slate-200 hover:border-rose-300'
                                                    }`}
                                            >
                                                <img src={item.img} alt={item.label} className="h-16 mix-blend-multiply object-contain" />
                                                <p className="text-xs font-extrabold text-slate-900 leading-tight">{item.label}</p>
                                                <div className={`w-full py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 ${activo ? 'bg-[#9D2449] text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                    <span>{activo ? 'Seleccionado' : 'Seleccionar'}</span>
                                                    {activo && <Check className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                            </button>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Fila 3: Bottom 2 Síntomas Centrados */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                {[
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
                                            <img src={item.img} alt={item.label} className="h-16 mix-blend-multiply object-contain" />
                                            <p className="text-xs font-extrabold text-slate-900 leading-tight">{item.label}</p>
                                            <div className={`w-full py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 ${activo ? 'bg-[#9D2449] text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                <span>{activo ? 'Seleccionado' : 'Seleccionar'}</span>
                                                {activo && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
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
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${referidoAborto
                                    ? 'bg-[#9D2449] text-white shadow-sm ring-2 ring-rose-400'
                                    : 'bg-transparent text-slate-600'
                                    }`}
                            >
                                <span>SI</span>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
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
                                    <div className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 ${activo ? 'bg-[#9D2449] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>
                                        <span>{activo ? 'Registrado' : 'Marcar'}</span>
                                        {activo && <Check className="w-4 h-4 text-white" />}
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
                                    <Baby className="w-4 h-4 text-sky-600 shrink-0" />
                                    <span className="text-xs">Niño Vivo</span>
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
                                    <Baby className="w-4 h-4 text-rose-500 shrink-0" />
                                    <span className="text-xs">Niña Viva</span>
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
                                    <Baby className="w-4 h-4 text-sky-600 shrink-0" />
                                    <span className="text-xs">Niño Vivo</span>
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
                                    <Baby className="w-4 h-4 text-rose-500 shrink-0" />
                                    <span className="text-xs">Niña Viva</span>
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
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${referidoPartoComplicado
                                    ? 'bg-[#9D2449] text-white shadow-sm ring-2 ring-rose-400'
                                    : 'bg-transparent text-slate-600'
                                    }`}
                            >
                                <span>SI</span>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { id: 'NINO_COMPLICADO', img: '/NiñoComplicado.png', title: 'Niño Complicado' },
                            { id: 'NINA_COMPLICADA', img: '/NiñaComplicado.png', title: 'Niña Complicada' },
                            { id: 'NINO_MUERTO', img: '/NiñoMuerto.png', title: 'Defunción Recién Nacido (Niño)' },
                            { id: 'NINA_MUERTA', img: '/NiñaMuerta.png', title: 'Defunción Recién Nacida (Niña)' },
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
                                    <span className="font-extrabold text-xs text-slate-900 leading-tight">
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
                        {/* Puerperio Normal: Cinta MUAC Tricolor (Brazalete) */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-slate-700" />
                                <h4 className="font-black text-slate-900 text-xs uppercase">
                                    Puerperio Normal (Cinta MUAC Tricolor)
                                </h4>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">
                                Evaluación del estado nutricia posparto materna
                            </p>

                            <div className="bg-slate-200 p-1.5 rounded-2xl border border-slate-300 grid grid-cols-3 gap-1.5 shadow-inner pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCintaMUACPuerperio('VERDE')}
                                    className={`py-3 px-2 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border-2 ${cintaMUACPuerperio === 'VERDE'
                                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.03] ring-2 ring-emerald-400'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        {cintaMUACPuerperio === 'VERDE' && <Check className="w-4 h-4 text-white" />}
                                        <span className="uppercase tracking-wider">Verde</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-90">Adecuado</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCintaMUACPuerperio('AMARILLO')}
                                    className={`py-3 px-2 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border-2 ${cintaMUACPuerperio === 'AMARILLO'
                                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md scale-[1.03] ring-2 ring-amber-300'
                                        : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        {cintaMUACPuerperio === 'AMARILLO' && <Check className="w-4 h-4 text-slate-950" />}
                                        <span className="uppercase tracking-wider">Amarillo</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-90">Riesgo</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCintaMUACPuerperio('ROJO')}
                                    className={`py-3 px-2 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border-2 ${cintaMUACPuerperio === 'ROJO'
                                        ? 'bg-rose-600 text-white border-rose-700 shadow-md scale-[1.03] ring-2 ring-rose-400'
                                        : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        {cintaMUACPuerperio === 'ROJO' && <Check className="w-4 h-4 text-white" />}
                                        <span className="uppercase tracking-wider">Rojo</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-90">Desnutrición</span>
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
                                        className={`px-3 py-1 rounded-xl text-xs font-black border transition-all flex items-center gap-1 ${referidoPuerperio ? 'bg-[#9D2449] text-white border-[#7A1B38]' : 'bg-white text-slate-700 border-slate-300'}`}
                                    >
                                        <span>{referidoPuerperio ? 'SI' : 'NO'}</span>
                                        {referidoPuerperio && <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />}
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
                                                className={`w-full p-2.5 rounded-xl border-2 text-left font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${marcado
                                                    ? 'bg-rose-200 border-[#9D2449] text-rose-950 font-black'
                                                    : 'bg-white border-slate-300 text-slate-700'
                                                    }`}
                                            >
                                                <span>{chk.label}</span>
                                                {marcado && <Check className="w-4 h-4 text-[#9D2449]" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 9. SECCIÓN MUERTE MATERNA (BLOQUE DE ALERTA LIMPIA) */}
                <div className="bg-rose-50/30 p-6 rounded-3xl border-2 border-rose-200 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-rose-200 pb-3">
                        <div className="p-2.5 bg-rose-100 text-[#9D2449] rounded-xl border border-rose-200">
                            <ShieldAlert className="w-6 h-6 text-[#9D2449]" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                7. Muerte Materna (Alerta Epidemiológica Médica)
                            </h3>
                            <p className="text-xs text-rose-800 font-medium">
                                Registro prioritario inmediato ante fallecimiento materno acontecido en la comunidad
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'EMBARAZO', img: '/MuerteMaternaEmbarazo.png', title: 'Embarazo' },
                            { id: 'PARTO', img: '/MuerteMaternaParto.png', title: 'Parto' },
                            { id: 'PUERPERIO', img: '/MuertePartoPuerperico.png', title: 'Puerperio' },
                        ].map((item) => {
                            const activo = muerteMaternaEtapa === item.id;
                            return (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => setMuerteMaternaEtapa(activo ? null : (item.id as any))}
                                    className={`p-5 rounded-2xl border-4 text-center flex flex-col items-center justify-between gap-3 transition-all cursor-pointer ${activo
                                        ? 'bg-rose-100 border-[#9D2449] text-[#9D2449] shadow-lg scale-[1.02] ring-2 ring-rose-300'
                                        : 'bg-white border-slate-200 text-slate-800 hover:border-rose-300 hover:bg-rose-50/50'
                                        }`}
                                >
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="h-24 mix-blend-multiply object-contain"
                                    />
                                    <span className="font-extrabold text-sm text-slate-900">{item.title}</span>
                                    <div className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 ${activo ? 'bg-[#9D2449] text-white' : 'bg-slate-100 text-slate-600'}`}>
                                        {activo ? (
                                            <>
                                                <span>Notificado</span>
                                                <Check className="w-3.5 h-3.5 text-white" />
                                            </>
                                        ) : (
                                            <>
                                                <span>Notificar</span>
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                            </>
                                        )}
                                    </div>
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
                            <span>{huellaRegistrada ? 'HUELLA DIGITAL CAPTURADA' : 'CAPTURAR HUELLA DIGITAL DE LA PARTERA'}</span>
                            {huellaRegistrada && <Check className="w-5 h-5 text-white" />}
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
