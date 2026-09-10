import React, { useState } from 'react';
import {
    Ambulance,
    Mic,
    MicOff,
    Send,
    ChevronLeft,
    AlertTriangle,
    Stethoscope,
    UserCheck
} from 'lucide-react';

interface FormatoReferenciaProps {
    onBack: () => void;
    onSuccess: () => void;
    hablarTexto: (texto: string) => void;
    isListening: boolean;
    campoEscuchando: string | null;
    iniciarDictado: (campo: string) => void;
}

export const FormatoReferencia: React.FC<FormatoReferenciaProps> = ({
    onBack,
    onSuccess,
    hablarTexto,
    isListening,
    campoEscuchando,
    iniciarDictado
}) => {
    // Datos generales
    const [centroSalud, setCentroSalud] = useState('Hospital General de Juchitán');
    const [nombreUsuaria, setNombreUsuaria] = useState('');
    const [edad, setEdad] = useState('26');
    const [sexo, setSexo] = useState<'F' | 'M'>('F');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [municipio, setMunicipio] = useState('Juchitán de Zaragoza');
    const [localidad, setLocalidad] = useState('La Ventosa');

    // Motivos de Referencia seleccionados
    const [motivos, setMotivos] = useState<string[]>([]);

    // Contrareferencia Médica
    const [mostrarContrareferencia, setMostrarContrareferencia] = useState(false);
    const [estadoContra, setEstadoContra] = useState<'CONTROLADA' | 'PARA_CONTROL_PARTERA'>('CONTROLADA');
    const [diagnostico, setDiagnostico] = useState('');
    const [tratamiento, setTratamiento] = useState('');
    const [observacionesMedico, setObservacionesMedico] = useState('');
    const [nombreMedico, setNombreMedico] = useState('Dr. Alejandro Murat H.');
    const [centroMedico, setCentroMedico] = useState('Centro de Salud Urbano Juchitán');

    const toggleMotivo = (id: string) => {
        if (motivos.includes(id)) {
            setMotivos(motivos.filter((m) => m !== id));
        } else {
            setMotivos([...motivos, id]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        hablarTexto('Ficha de referencia enviada exitosamente al Centro de Salud.');
        onSuccess();
    };

    const listaMotivos = [
        { id: 'COMPLICACIONES_EMBARAZO', titulo: '🤰 Complicaciones Embarazo', desc: 'Sangrado, dolor o presión alta' },
        { id: 'TOXOIDE_TETANICO', titulo: '💉 Aplicar Toxoide Tetánico', desc: 'Vacuna de protección para la madre' },
        { id: 'ABORTO', titulo: '⚠️ Aborto / Amenaza', desc: 'Pérdida o sangrado en primeros meses' },
        { id: 'PARTO_COMPLICADO', titulo: '🧘‍♀️ Parto Complicado', desc: 'Trabajo prolongado o mala posición' },
        { id: 'PUERPERIO_COMPLICADO', titulo: '🩸 Puerperio Complicado', desc: 'Fiebre o sangrado tras el parto' },
        { id: 'ZIKA', titulo: '🦟 Zika / Transmisibles', desc: 'Fiebre, dolor articulaciones, salpullido, conjuntivitis' },
        { id: 'NINO_COMPLICADO', titulo: '👶🩵 Niño con Complicaciones', desc: 'No respira bien o está amarillo' },
        { id: 'NINA_COMPLICADA', titulo: '👶🩷 Niña con Complicaciones', desc: 'Bajo peso o fiebre recién nacida' },
        { id: 'TAMIZ_METABOLICO_AUDITIVO', titulo: '🦶 Tamiz Metabólico / Auditivo', desc: 'Prueba de gota de sangre y oído' },
        { id: 'VITAMINAS_AK', titulo: '💧 Vitaminas A y K', desc: 'Protección para el recién nacido' },
        { id: 'VACUNA_BCG_HEPATITIS', titulo: '💉 Vacuna BCG / Hepatitis B', desc: 'Primeras vacunas comunitarias' },
        { id: 'PAPANICOLAOU', titulo: '🔬 Toma de Papanicolaou', desc: 'Revisión preventiva de matriz' },
        { id: 'OTROS', titulo: '❓ Otros Motivos', desc: 'Valoración médica general' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* BOTÓN REGRESAR */}
            <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl font-bold text-xs flex items-center gap-2"
            >
                <ChevronLeft className="w-5 h-5" />
                <span>Regresar al Menú Principal</span>
            </button>

            {/* BANNER FORMATO 1 */}
            <div className="bg-[#9D2449] text-white p-6 rounded-3xl shadow-lg border-2 border-rose-900 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                        <Ambulance className="w-8 h-8 text-rose-200" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                            FORMATO OFICIAL NO. 1 • SSO OAXACA
                        </span>
                        <h2 className="text-2xl font-black text-white mt-1">Ficha de Referencia y Contrareferencia</h2>
                        <p className="text-xs text-rose-100">Atención de urgencias obstétricas y canalizaciones comunitarias.</p>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 1: DATOS DE LA USUARIA CON DICTADO POR VOZ */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#9D2449]" />
                    <span>1. Datos Generales de la Usuaria</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre Usuaria */}
                    <div className="space-y-1">
                        <label className="block text-xs font-black text-slate-700">👩‍🦱 Nombre Completo de la Usuaria</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                placeholder="Ej. Maria Elena Santiz"
                                value={nombreUsuaria}
                                onChange={(e) => setNombreUsuaria(e.target.value)}
                                className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#9D2449]"
                            />
                            <button
                                type="button"
                                onClick={() => iniciarDictado('USUARIA')}
                                className={`px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-1.5 shrink-0 ${isListening && campoEscuchando === 'USUARIA'
                                    ? 'bg-rose-600 text-white animate-pulse border-2 border-rose-300'
                                    : 'bg-rose-50 text-[#9D2449] border-2 border-rose-200 hover:bg-rose-100'
                                    }`}
                            >
                                {isListening && campoEscuchando === 'USUARIA' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                <span>{isListening && campoEscuchando === 'USUARIA' ? 'Hablando...' : '🎙️ Dictar'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Centro de Salud u Hospital */}
                    <div className="space-y-1">
                        <label className="block text-xs font-black text-slate-700">🏥 Centro de Salud / Hospital Destino</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                value={centroSalud}
                                onChange={(e) => setCentroSalud(e.target.value)}
                                className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900"
                            />
                            <button
                                type="button"
                                onClick={() => iniciarDictado('CENTRO_SALUD')}
                                className="px-3 py-2 bg-rose-50 text-[#9D2449] border-2 border-rose-200 rounded-2xl font-bold text-xs"
                            >
                                🎙️
                            </button>
                        </div>
                    </div>

                    {/* Edad y Sexo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-black text-slate-700">🎂 Edad (Años)</label>
                            <input
                                type="number"
                                value={edad}
                                onChange={(e) => setEdad(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-700">👤 Sexo</label>
                            <select
                                value={sexo}
                                onChange={(e) => setSexo(e.target.value as 'F' | 'M')}
                                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900"
                            >
                                <option value="F">Femenino</option>
                                <option value="M">Masculino</option>
                            </select>
                        </div>
                    </div>

                    {/* Fecha */}
                    <div>
                        <label className="block text-xs font-black text-slate-700">📅 Fecha de Atencion</label>
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900"
                        />
                    </div>

                    {/* Municipio */}
                    <div>
                        <label className="block text-xs font-black text-slate-700">🏛️ Municipio</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={municipio}
                                onChange={(e) => setMunicipio(e.target.value)}
                                className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-900"
                            />
                            <button
                                type="button"
                                onClick={() => iniciarDictado('MUNICIPIO')}
                                className="px-3 py-2 bg-rose-50 text-[#9D2449] border border-rose-200 rounded-2xl font-bold text-xs"
                            >
                                🎙️
                            </button>
                        </div>
                    </div>

                    {/* Localidad */}
                    <div>
                        <label className="block text-xs font-black text-slate-700">🏡 Localidad</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={localidad}
                                onChange={(e) => setLocalidad(e.target.value)}
                                className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-900"
                            />
                            <button
                                type="button"
                                onClick={() => iniciarDictado('LOCALIDAD')}
                                className="px-3 py-2 bg-rose-50 text-[#9D2449] border border-rose-200 rounded-2xl font-bold text-xs"
                            >
                                🎙️
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: MATRIZ DE CUADRÍCULAS ILUSTRADAS (MOTIVOS DE REFERENCIA) */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#9D2449]" />
                    <span>2. Motivos de Referencia (Selección Táctil por Ilustraciones)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {listaMotivos.map((item) => {
                        const activo = motivos.includes(item.id);
                        return (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => toggleMotivo(item.id)}
                                className={`p-4 rounded-2xl border-4 text-left transition-all flex items-start gap-3 ${activo
                                    ? 'bg-rose-100 border-[#9D2449] text-rose-950 font-black shadow-md scale-[1.02]'
                                    : 'bg-slate-50 border-slate-200 text-slate-800 font-bold hover:border-slate-400'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={activo}
                                    readOnly
                                    className="w-5 h-5 accent-[#9D2449] mt-0.5"
                                />
                                <div>
                                    <span className="block text-xs font-black">{item.titulo}</span>
                                    <span className="text-[11px] font-medium text-slate-600 leading-tight block mt-0.5">{item.desc}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SECCIÓN 3: MÓDULO DE CONTRAREFERENCIA (USO DEL MÉDICO / PARTERA) */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border-2 border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                        <Stethoscope className="w-6 h-6 text-rose-400" />
                        <div>
                            <h3 className="text-lg font-black text-white">3. Módulo de Contrareferencia (Para uso del Médico)</h3>
                            <p className="text-xs text-slate-400">Respuesta oficial del Centro de Salud a la Partera Tradicional</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMostrarContrareferencia(!mostrarContrareferencia)}
                        className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-400/30 rounded-xl text-xs font-bold"
                    >
                        {mostrarContrareferencia ? 'Ocultar Sección' : 'Abrir Sección Médico'}
                    </button>
                </div>

                {mostrarContrareferencia && (
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2">Estado de Contrareferencia:</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEstadoContra('CONTROLADA')}
                                    className={`p-3 rounded-2xl border-2 font-bold text-xs ${estadoContra === 'CONTROLADA'
                                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                                        : 'bg-slate-800 border-slate-700 text-slate-300'
                                        }`}
                                >
                                    ✅ Paciente Controlada / Alta Hospitalaria
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEstadoContra('PARA_CONTROL_PARTERA')}
                                    className={`p-3 rounded-2xl border-2 font-bold text-xs ${estadoContra === 'PARA_CONTROL_PARTERA'
                                        ? 'bg-sky-600 border-sky-400 text-white shadow-md'
                                        : 'bg-slate-800 border-slate-700 text-slate-300'
                                        }`}
                                >
                                    👩‍🦱 Regresa para Control con la Partera
                                </button>
                            </div>
                        </div>

                        {/* Diagnóstico */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-300">🩺 Diagnóstico del Médico</label>
                            <div className="flex gap-2">
                                <textarea
                                    rows={2}
                                    placeholder="Dictar o escribir diagnóstico médico..."
                                    value={diagnostico}
                                    onChange={(e) => setDiagnostico(e.target.value)}
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-rose-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => iniciarDictado('DIAGNOSTICO')}
                                    className="px-3 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-2xl text-xs font-bold"
                                >
                                    🎙️ Dictar
                                </button>
                            </div>
                        </div>

                        {/* Tratamiento y Observaciones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-300">💊 Tratamiento Indicado</label>
                                <textarea
                                    rows={2}
                                    placeholder="Tratamiento y medicamentos..."
                                    value={tratamiento}
                                    onChange={(e) => setTratamiento(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-300">💬 Indicaciones a la Partera</label>
                                <textarea
                                    rows={2}
                                    placeholder="Indicaciones para el seguimiento en comunidad..."
                                    value={observacionesMedico}
                                    onChange={(e) => setObservacionesMedico(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs text-white"
                                />
                            </div>
                        </div>

                        {/* Nombre y Firma del Médico */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-300">👨‍⚕️ Nombre del Médico Tratante</label>
                                <input
                                    type="text"
                                    value={nombreMedico}
                                    onChange={(e) => setNombreMedico(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300">🏢 Unidad de Salud que Emite</label>
                                <input
                                    type="text"
                                    value={centroMedico}
                                    onChange={(e) => setCentroMedico(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTÓN FINAL DE ENVÍO GUINDA OAXACA */}
            <button
                type="submit"
                className="w-full py-5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-black text-lg rounded-3xl shadow-xl border-2 border-rose-300 flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
                <Send className="w-6 h-6" />
                <span>🚨 GUARDAR Y ENVIAR FICHA DE REFERENCIA (FORMATO 1)</span>
            </button>
        </form>
    );
};
