import React, { useState } from 'react';
import {
    HeartPulse,
    Mic,
    MicOff,
    Send,
    ChevronLeft,
    AlertTriangle,
    Calendar,
    Pill
} from 'lucide-react';

interface FormatoCalendarioMujerProps {
    onBack: () => void;
    onSuccess: () => void;
    hablarTexto: (texto: string) => void;
    isListening: boolean;
    campoEscuchando: string | null;
    iniciarDictado: (campo: string) => void;
}

export const FormatoCalendarioMujer: React.FC<FormatoCalendarioMujerProps> = ({
    onBack,
    onSuccess,
    hablarTexto,
    isListening,
    campoEscuchando,
    iniciarDictado
}) => {
    // Datos de la mujer
    const [nombreMujer, setNombreMujer] = useState('');
    const [edad, setEdad] = useState('24');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [municipio, setMunicipio] = useState('Juchitán de Zaragoza');
    const [localidad, setLocalidad] = useState('Álvaro Obregón');

    // Control de Embarazo Normal (Meses 1-9)
    const [mesSeleccionado, setMesSeleccionado] = useState<number>(5);
    const [acidoFolico, setAcidoFolico] = useState(true);
    const [hierro, setHierro] = useState(true);
    const [vacunaTetanos, setVacunaTetanos] = useState<'1A' | '2A' | 'REFUERZO'>('1A');
    const [cintaMUAC, setCintaMUAC] = useState<'VERDE' | 'AMARILLO' | 'ROJO'>('VERDE');

    // Complicaciones y Signos de Alarma
    const [signosAlarma, setSignosAlarma] = useState<string[]>([]);
    const [abortoTipo, setAbortoTipo] = useState<string[]>([]);

    // Parto Normal
    const [posicionParto, setPosicionParto] = useState<'VERTICAL' | 'HORIZONTAL'>('VERTICAL');
    const [partoComplicadoOption, setPartoComplicadoOption] = useState<string | null>(null);

    // Puerperio
    const [puerperioComplicaciones, setPuerperioComplicaciones] = useState<string[]>([]);

    // Muerte Materna †
    const [muerteMaternaEtapa, setMuerteMaternaEtapa] = useState<string | null>(null);

    const toggleSigno = (id: string) => {
        if (signosAlarma.includes(id)) {
            setSignosAlarma(signosAlarma.filter((s) => s !== id));
        } else {
            setSignosAlarma([...signosAlarma, id]);
        }
    };

    const togglePuerperioComp = (id: string) => {
        if (puerperioComplicaciones.includes(id)) {
            setPuerperioComplicaciones(puerperioComplicaciones.filter((p) => p !== id));
        } else {
            setPuerperioComplicaciones([...puerperioComplicaciones, id]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        hablarTexto('Calendario de Atención a la Mujer guardado y enviado exitosamente.');
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl font-bold text-xs flex items-center gap-2"
            >
                <ChevronLeft className="w-5 h-5" />
                <span>Regresar al Menú Principal</span>
            </button>

            {/* BANNER ENCABEZADO FORMATO 2 */}
            <div className="bg-purple-800 text-white p-6 rounded-3xl shadow-lg border-2 border-purple-950 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                    <HeartPulse className="w-8 h-8 text-purple-200" />
                </div>
                <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                        FORMATO OFICIAL NO. 2 • SSO OAXACA
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">Calendario de Atención a la Mujer</h2>
                    <p className="text-xs text-purple-100">Control de Embarazo, Parto, Puerperio y Vigilancia Epidemiológica Maternidad.</p>
                </div>
            </div>

            {/* DATOS DE LA MUJER */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-base font-black text-slate-900">👩‍🦱 Datos de la Mujer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="block text-xs font-black text-slate-700">Nombre de la Mujer</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                placeholder="Nombre completo..."
                                value={nombreMujer}
                                onChange={(e) => setNombreMujer(e.target.value)}
                                className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900"
                            />
                            <button
                                type="button"
                                onClick={() => iniciarDictado('MUJER')}
                                className={`px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-1 shrink-0 ${isListening && campoEscuchando === 'MUJER'
                                    ? 'bg-rose-600 text-white animate-pulse'
                                    : 'bg-rose-50 text-[#9D2449] border-2 border-rose-200'
                                    }`}
                            >
                                {isListening && campoEscuchando === 'MUJER' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                <span>🎙️</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-black text-slate-700">Edad</label>
                            <input
                                type="number"
                                value={edad}
                                onChange={(e) => setEdad(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-700">Fecha</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3 text-xs font-bold text-slate-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-700">Municipio</label>
                        <input
                            type="text"
                            value={municipio}
                            onChange={(e) => setMunicipio(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-700">Localidad</label>
                        <input
                            type="text"
                            value={localidad}
                            onChange={(e) => setLocalidad(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900"
                        />
                    </div>
                </div>
            </div>

            {/* CONTROL DE EMBARAZO NORMAL (MESES 1 A 9) */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-700" />
                    <span>Control de Embarazo Normal (Selección de Meses 1 al 9)</span>
                </h3>

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                        <button
                            type="button"
                            key={m}
                            onClick={() => setMesSeleccionado(m)}
                            className={`w-12 h-12 rounded-2xl font-black text-base transition-all shrink-0 flex items-center justify-center ${mesSeleccionado === m
                                ? 'bg-purple-800 text-white shadow-lg scale-110 border-2 border-purple-400'
                                : 'bg-slate-100 text-slate-700 border-2 border-slate-200 hover:bg-purple-100'
                                }`}
                        >
                            {m}º
                        </button>
                    ))}
                </div>

                {/* SUPLEMENTOS Y VACUNAS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <button
                        type="button"
                        onClick={() => setAcidoFolico(!acidoFolico)}
                        className={`p-4 rounded-2xl border-4 text-left flex items-center gap-3 ${acidoFolico
                            ? 'bg-emerald-100 border-emerald-600 text-emerald-950 font-black'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                    >
                        <Pill className="w-6 h-6 text-emerald-700 shrink-0" />
                        <div>
                            <span className="block text-xs font-black">💊 Ácido Fólico (30 días)</span>
                            <span className="text-[11px] font-bold text-slate-600">{acidoFolico ? 'Entregado ✅' : 'Pendiente ❌'}</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setHierro(!hierro)}
                        className={`p-4 rounded-2xl border-4 text-left flex items-center gap-3 ${hierro
                            ? 'bg-emerald-100 border-emerald-600 text-emerald-950 font-black'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                    >
                        <Pill className="w-6 h-6 text-emerald-700 shrink-0" />
                        <div>
                            <span className="block text-xs font-black">🩸 Hierro / Fumarato</span>
                            <span className="text-[11px] font-bold text-slate-600">{hierro ? 'Entregado ✅' : 'Pendiente ❌'}</span>
                        </div>
                    </button>

                    <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-200 space-y-1">
                        <span className="block text-xs font-black text-purple-950">💉 Vacuna Tétanos (Td)</span>
                        <div className="flex gap-1">
                            {(['1A', '2A', 'REFUERZO'] as const).map((v) => (
                                <button
                                    type="button"
                                    key={v}
                                    onClick={() => setVacunaTetanos(v)}
                                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${vacunaTetanos === v
                                        ? 'bg-purple-800 text-white border-purple-900'
                                        : 'bg-white text-purple-900 border-purple-300'
                                        }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* INDICADOR CINTA MUAC */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-black text-slate-800">📏 Estado Nutricional por Cinta MUAC (Brazo)</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setCintaMUAC('VERDE')}
                            className={`p-3 rounded-2xl border-4 font-black text-xs text-center ${cintaMUAC === 'VERDE'
                                ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                        >
                            🟢 Verde: Adecuado
                        </button>
                        <button
                            type="button"
                            onClick={() => setCintaMUAC('AMARILLO')}
                            className={`p-3 rounded-2xl border-4 font-black text-xs text-center ${cintaMUAC === 'AMARILLO'
                                ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                        >
                            🟡 Amarillo: Riesgo
                        </button>
                        <button
                            type="button"
                            onClick={() => setCintaMUAC('ROJO')}
                            className={`p-3 rounded-2xl border-4 font-black text-xs text-center ${cintaMUAC === 'ROJO'
                                ? 'bg-rose-100 border-rose-600 text-rose-950 shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                        >
                            🔴 Rojo: Desnutrición
                        </button>
                    </div>
                </div>
            </div>

            {/* SIGNOS DE ALARMA TÁCTILES */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>Embarazo con Complicaciones (Signos de Alarma Táctiles)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { id: 'LUCECITAS', label: '🧠 Lucecitas / Zumbidos / Dolor Cabeza' },
                        { id: 'HINCHAZON', label: '🦵 Hinchazón de cara, manos o pies' },
                        { id: 'CONVULSIONES', label: '⚡ Convulsiones o ataques' },
                        { id: 'ORINA_SANGRE', label: '🚽 Dificultad para orinar o sangrado' },
                        { id: 'DOLOR_VIENTRE', label: '🤰 Dolor de vientre antes de 8 meses' },
                        { id: 'RESPIRACION', label: '🫁 Dificultad para respirar' },
                        { id: 'VOMITO', label: '🤮 Vómito frecuente y abundante' },
                    ].map((item) => {
                        const activo = signosAlarma.includes(item.id);
                        return (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => toggleSigno(item.id)}
                                className={`p-4 rounded-2xl border-4 text-left transition-all ${activo
                                    ? 'bg-rose-100 border-rose-700 text-rose-950 font-black shadow-md'
                                    : 'bg-slate-50 border-slate-200 text-slate-800 font-bold'
                                    }`}
                            >
                                <span className="text-xs">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ABORTO Y PARTO NORMAL / COMPLICADO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aborto */}
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-3 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900">⚠️ Aborto</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setAbortoTipo(
                                    abortoTipo.includes('DOLOR')
                                        ? abortoTipo.filter((a) => a !== 'DOLOR')
                                        : [...abortoTipo, 'DOLOR']
                                )
                            }
                            className={`p-3 rounded-2xl border-2 font-bold text-xs ${abortoTipo.includes('DOLOR')
                                ? 'bg-rose-100 border-rose-600 text-rose-950 font-black'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                        >
                            💥 Con Dolor
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setAbortoTipo(
                                    abortoTipo.includes('HEMORRAGIA')
                                        ? abortoTipo.filter((a) => a !== 'HEMORRAGIA')
                                        : [...abortoTipo, 'HEMORRAGIA']
                                )
                            }
                            className={`p-3 rounded-2xl border-2 font-bold text-xs ${abortoTipo.includes('HEMORRAGIA')
                                ? 'bg-rose-100 border-rose-600 text-rose-950 font-black'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                        >
                            🩸 Con Hemorragia
                        </button>
                    </div>
                </div>

                {/* Parto Normal Posición y Resultado */}
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-3 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900">🧘‍♀️ Parto Normal (Posición & Resultado)</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setPosicionParto('VERTICAL')}
                            className={`p-3 rounded-2xl border-2 font-bold text-xs ${posicionParto === 'VERTICAL'
                                ? 'bg-purple-100 border-purple-700 text-purple-950 font-black'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                        >
                            🧘‍♀️ Parto Vertical
                        </button>
                        <button
                            type="button"
                            onClick={() => setPosicionParto('HORIZONTAL')}
                            className={`p-3 rounded-2xl border-2 font-bold text-xs ${posicionParto === 'HORIZONTAL'
                                ? 'bg-purple-100 border-purple-700 text-purple-950 font-black'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                        >
                            🛌 Parto Horizontal
                        </button>
                    </div>
                </div>
            </div>

            {/* PARTO COMPLICADO (ICONOGRAFÍA CON †) */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-base font-black text-slate-900">🚨 Parto Complicado (Resultado Nacimiento)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { id: 'NINO_COMPLICADO', label: '⚠️🩵 Niño Complicado' },
                        { id: 'NINA_COMPLICADA', label: '⚠️🩷 Niña Complicada' },
                        { id: 'NINO_MUERTO', label: '🕊️🩵 Niño Muerto †' },
                        { id: 'NINA_MUERTA', label: '🕊️🩷 Niña Muerta †' },
                    ].map((item) => (
                        <button
                            type="button"
                            key={item.id}
                            onClick={() => setPartoComplicadoOption(item.id)}
                            className={`p-4 rounded-2xl border-4 font-bold text-xs text-center ${partoComplicadoOption === item.id
                                ? 'bg-rose-100 border-rose-700 text-rose-950 font-black shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* PUERPERIO & MUERTE MATERNA † */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Puerperio Complicaciones */}
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-3 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900">🩺 Puerperio (Primeros 40 días tras el parto)</h3>
                    <div className="space-y-2">
                        {[
                            { id: 'SANGRADO_ABUNDANTE', label: '🩸 Sangrado Abundante' },
                            { id: 'CALENTURA', label: '🌡️ Calentura / Fiebre' },
                            { id: 'SANGRADO_MAL_OLOR', label: '🤢 Sangrado con Mal Olor' },
                        ].map((p) => (
                            <button
                                type="button"
                                key={p.id}
                                onClick={() => togglePuerperioComp(p.id)}
                                className={`w-full p-3 rounded-2xl border-2 text-left text-xs font-bold ${puerperioComplicaciones.includes(p.id)
                                    ? 'bg-rose-100 border-rose-600 text-rose-950 font-black'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Muerte Materna † */}
                <div className="bg-rose-950 text-white p-6 rounded-3xl border-2 border-rose-900 space-y-3 shadow-xl">
                    <h3 className="text-sm font-black text-rose-200 flex items-center gap-2">
                        <span>🕊️ Registro Muerte Materna †</span>
                    </h3>
                    <p className="text-[11px] text-rose-300">Marque si lamentablemente ocurrió el fallecimiento de la madre:</p>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'EMBARAZO', label: 'En Embarazo †' },
                            { id: 'PARTO', label: 'En Parto †' },
                            { id: 'PUERPERIO', label: 'En Puerperio †' },
                        ].map((m) => (
                            <button
                                type="button"
                                key={m.id}
                                onClick={() => setMuerteMaternaEtapa(m.id === muerteMaternaEtapa ? null : m.id)}
                                className={`p-3 rounded-2xl border font-black text-xs text-center ${muerteMaternaEtapa === m.id
                                    ? 'bg-rose-600 text-white border-rose-300 ring-2 ring-rose-400'
                                    : 'bg-rose-900/40 border-rose-800 text-rose-200'
                                    }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* BOTÓN FINAL DE ENVÍO GUINDA OAXACA */}
            <button
                type="submit"
                className="w-full py-5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-black text-lg rounded-3xl shadow-xl border-2 border-rose-300 flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
                <Send className="w-6 h-6" />
                <span>REGISTRAR CALENDARIO DE LA MUJER (FORMATO 2)</span>
            </button>
        </form>
    );
};
