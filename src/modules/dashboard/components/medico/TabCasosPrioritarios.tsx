/* spell-checker: disable */
import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    AlertTriangle,
    FlaskConical,
    CheckCircle2,
    Clock,
    X,
    FileText,
    MapPin,
    Calendar,
    Syringe,
    Printer,
    Pipette,
    Hash,
    Beaker,
    Loader2
} from 'lucide-react';
import type { CasoPrioritario, RegistroSegundaMuestra, EstatusResultado } from './types';
import { http } from '../../../../services/http';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEstatusBadge(estatus: EstatusResultado): React.ReactNode {
    const map: Record<EstatusResultado, { label: string; cls: string }> = {
        MUESTRA_INADECUADA: { label: 'Muestra Inadecuada', cls: 'bg-amber-500/25 text-amber-200 border border-amber-400/50 backdrop-blur-md' },
        RESULTADO_SOSPECHOSO: { label: 'Resultado Sospechoso', cls: 'bg-rose-500/25 text-rose-200 border border-rose-400/50 backdrop-blur-md' },
        RETOMA_REQUERIDA: { label: 'Re-toma Requerida', cls: 'bg-orange-500/25 text-orange-200 border border-orange-400/50 backdrop-blur-md' },
        MUESTRA_VENOSA_PENDIENTE: { label: 'Venosa Pendiente', cls: 'bg-purple-500/25 text-purple-200 border border-purple-400/50 backdrop-blur-md' },
        EN_CONFIRMACION: { label: 'En Confirmación', cls: 'bg-blue-500/25 text-blue-200 border border-blue-400/50 backdrop-blur-md' },
        CONFIRMADO_POSITIVO: { label: 'Confirmado Positivo', cls: 'bg-red-600/40 text-white border border-red-400 font-black backdrop-blur-md animate-pulse' },
        NORMAL: { label: 'Normal', cls: 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 backdrop-blur-md' },
    };
    const { label, cls } = map[estatus] || { label: estatus, cls: 'bg-slate-800 text-slate-200 border border-slate-600 backdrop-blur-md' };
    return <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black shadow-lg ${cls}`}>{label}</span>;
}

// ─── Cédula de Orden de Laboratorio (sección imprimible) ─────────────────────

interface CedulaLabProps {
    caso: CasoPrioritario;
    datos: {
        fechaObtension: string;
        fechaEnvio: string;
        codigoTubo: string;
        valorTshPrevio: string;
        laboratorioDestino: string;
        tipoMuestra: string;
        tratamiento: string;
    };
}

const CedulaLaboratorio: React.FC<CedulaLabProps> = ({ caso, datos }) => (
    <div className="print-cedula bg-white border-2 border-slate-400 rounded-xl p-5 space-y-3 text-xs text-slate-900">
        <div className="text-center border-b-2 border-[#9D2449] pb-3">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                SERVICIOS DE SALUD DE OAXACA • JURISDICCIÓN SANITARIA NO. 2
            </p>
            <h2 className="text-sm font-black text-[#9D2449] mt-1">
                CÉDULA DE ORDEN DE LABORATORIO CONFIRMATORIA
            </h2>
            <p className="text-[10px] text-slate-600 font-bold">
                Programa de Tamiz Neonatal Ampliado — Istmo de Tehuantepec
            </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                <p className="font-black text-slate-400 uppercase tracking-wider text-[9px]">Folio Tamiz</p>
                <p className="font-black text-[#9D2449]">{caso.folio}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                <p className="font-black text-slate-400 uppercase tracking-wider text-[9px]">Fecha Obtención</p>
                <p className="font-bold text-slate-900">{datos.fechaObtension || '—'}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                <p className="font-black text-slate-400 uppercase tracking-wider text-[9px]">Fecha Envío</p>
                <p className="font-bold text-slate-900">{datos.fechaEnvio || '—'}</p>
            </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-3 space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Datos del Recién Nacido</p>
            <div className="grid grid-cols-2 gap-x-4 text-[10px]">
                <div><span className="text-slate-500 font-bold">R.N.: </span><span className="font-black text-slate-900">{caso.nombreRN}</span></div>
                <div><span className="text-slate-500 font-bold">Madre: </span><span className="font-bold text-slate-800">{caso.nombreMadre}</span></div>
                <div><span className="text-slate-500 font-bold">CLUES: </span><span className="font-bold text-slate-800">{caso.clues}</span></div>
                <div><span className="text-slate-500 font-bold">Unidad: </span><span className="font-medium text-slate-700">{caso.unidadMedica}</span></div>
                <div><span className="text-slate-500 font-bold">Municipio: </span><span className="font-medium text-slate-700">{caso.municipio}</span></div>
                <div><span className="text-slate-500 font-bold">Tel: </span><span className="font-medium text-slate-700">{caso.telefonoContacto || 'Sin teléfono'}</span></div>
            </div>
        </div>

        <div className="border-2 border-[#9D2449] rounded-lg p-3 space-y-2">
            <p className="text-[9px] font-black text-[#9D2449] uppercase tracking-wider">Datos de la Muestra Confirmatoria</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                <div><span className="font-bold text-slate-500">Prueba objetivo: </span><span className="font-black text-slate-900">{caso.tipoPrueba}</span></div>
                <div><span className="font-bold text-slate-500">Tipo de muestra: </span><span className="font-black text-slate-900">{datos.tipoMuestra === 'VENOSA_CONFIRMATORIA' ? 'Venosa Confirmatoria' : 'Re-toma Talón'}</span></div>
                <div><span className="font-bold text-slate-500">Valor tamiz inicial: </span><span className="font-black text-rose-700">{datos.valorTshPrevio || caso.valorObtenido || '—'}</span></div>
                <div><span className="font-bold text-slate-500">Código tubo (lila): </span><span className="font-black text-slate-900">{datos.codigoTubo || '—'}</span></div>
                <div className="col-span-2"><span className="font-bold text-slate-500">Laboratorio destino: </span><span className="font-black text-slate-900">{datos.laboratorioDestino}</span></div>
            </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[9px] text-amber-900">
            <p className="font-black mb-1">INDICACIONES DE MANEJO DE MUESTRA:</p>
            <p>Tubo con EDTA (lila) 1–2 mL. Mantener en frío 2–8°C. Enviar dentro de 24h de obtención.</p>
            {datos.tratamiento && <p className="mt-1 font-bold">Tratamiento empírico: {datos.tratamiento}</p>}
        </div>

        <div className="flex justify-end pt-2">
            <div className="border-t border-slate-400 w-44 pt-1 text-center text-[9px] text-slate-600">
                Firma y Sello del Médico Responsable<br />
                Fecha: {datos.fechaEnvio || '___/___/______'}
            </div>
        </div>
    </div>
);

// ─── Modal 2ª Muestra ─────────────────────────────────────────────────────────

interface Modal2MuestraProps {
    caso: CasoPrioritario;
    onClose: () => void;
    onSave: (data: RegistroSegundaMuestra) => void;
}

const Modal2Muestra: React.FC<Modal2MuestraProps> = ({ caso, onClose, onSave }) => {
    const [tipo, setTipo] = useState<RegistroSegundaMuestra['tipoMuestra']>('TALON_RETOMA');
    const [fechaObtension, setFechaObtension] = useState('');
    const [fechaEnvio, setFechaEnvio] = useState('');
    const [labDestino, setLabDestino] = useState('LESP Oaxaca');
    const [laboratorioId, setLaboratorioId] = useState<RegistroSegundaMuestra['laboratorioId']>('LESP_OAXACA');
    const [codigoTubo, setCodigoTubo] = useState('');
    const [valorTshPrevio, setValorTshPrevio] = useState(caso.valorObtenido ?? '');
    const [tratamiento, setTratamiento] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [mostrarCedula, setMostrarCedula] = useState(false);

    const labOpciones: Record<NonNullable<RegistroSegundaMuestra['laboratorioId']>, string> = {
        LESP_OAXACA: 'LESP Oaxaca (Laboratorio Estatal de Salud Pública)',
        LAB_REGIONAL_ISTMO: 'Laboratorio Regional Istmo — Juchitán',
        OTRO: 'Otro laboratorio',
    };

    const handleLabChange = (id: RegistroSegundaMuestra['laboratorioId']) => {
        setLaboratorioId(id);
        setLabDestino(id ? labOpciones[id] : 'LESP Oaxaca');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            casoId: caso.id,
            tipoMuestra: tipo,
            fechaObtension,
            fechaEnvio,
            laboratorioDestino: labDestino,
            laboratorioId,
            codigoTubo,
            valorTshPrevio,
            tratamientoIndicado: tratamiento,
            observacionesMedico: observaciones,
        });
        onClose();
    };

    const cedulaData = {
        fechaObtension,
        fechaEnvio,
        codigoTubo,
        valorTshPrevio,
        laboratorioDestino: labDestino,
        tipoMuestra: tipo,
        tratamiento,
    };

    const inputGlassStyle = "w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/40 rounded-xl text-white text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40 backdrop-blur-md transition-all shadow-inner";
    const selectGlassStyle = "w-full px-3.5 py-2.5 bg-slate-950/90 border border-white/40 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40 backdrop-blur-md transition-all shadow-inner";

    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .print-cedula, .print-cedula * { visibility: visible !important; }
                    .print-cedula { position: fixed !important; top: 1cm !important; left: 1cm !important; right: 1cm !important; }
                    @page { margin: 1cm; size: A5 landscape; }
                }
            `}</style>

            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-2xl z-50 flex items-start justify-center p-4 overflow-y-auto animate-fadeIn">
                <div className="relative border border-cyan-400/50 bg-slate-950/95 max-w-2xl w-full rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-3xl my-4 text-white overflow-hidden">
                    
                    <div className="absolute -top-24 -left-24 size-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between p-5 sm:p-6 border-b border-white/20">
                        <div>
                            <span className="text-[10px] font-black uppercase text-cyan-300 tracking-widest block">Servicios de Salud de Oaxaca</span>
                            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">Registro de 2ª Muestra / Venosa Confirmatoria</h3>
                            <p className="text-xs text-slate-200 mt-0.5">
                                Folio <span className="font-black text-cyan-300">{caso.folio}</span> · {caso.nombreRN} · {caso.tipoPrueba}
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/30 backdrop-blur-md cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10 p-5 sm:p-6 space-y-5 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-cyan-200 uppercase tracking-wider mb-1.5">Tipo de Muestra</label>
                                <select
                                    value={tipo}
                                    onChange={e => setTipo(e.target.value as RegistroSegundaMuestra['tipoMuestra'])}
                                    className={selectGlassStyle}
                                >
                                    <option value="TALON_RETOMA" className="bg-slate-950 text-white">Re-toma Talón (Guthrie)</option>
                                    <option value="VENOSA_CONFIRMATORIA" className="bg-slate-950 text-white">Muestra Venosa Confirmatoria</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-cyan-200 uppercase tracking-wider mb-1.5">Prueba Objetivo</label>
                                <div className="bg-cyan-500/30 border border-cyan-400/50 rounded-xl px-3.5 py-2.5 text-xs font-black text-cyan-200 backdrop-blur-md">
                                    {caso.tipoPrueba}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-cyan-200 uppercase tracking-wider mb-1.5">
                                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-cyan-300" />Fecha Obtención
                                </label>
                                <input type="date" required value={fechaObtension} onChange={e => setFechaObtension(e.target.value)}
                                    className={inputGlassStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-cyan-200 uppercase tracking-wider mb-1.5">
                                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-cyan-300" />Fecha Envío Lab.
                                </label>
                                <input type="date" required value={fechaEnvio} onChange={e => setFechaEnvio(e.target.value)}
                                    className={inputGlassStyle} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-cyan-200 uppercase tracking-wider mb-1.5">
                                    <Beaker className="w-3.5 h-3.5 inline mr-1 text-cyan-300" />Valor TSH Tamiz Previo
                                </label>
                                <input type="text" placeholder="Ej. 25.4 mU/L" value={valorTshPrevio} onChange={e => setValorTshPrevio(e.target.value)}
                                    className={inputGlassStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-cyan-200 uppercase tracking-wider mb-1.5">
                                    <Pipette className="w-3.5 h-3.5 inline mr-1 text-cyan-300" />Código Tubo Lila (EDTA)
                                </label>
                                <input type="text" placeholder="Ej. TL-2026-001245" value={codigoTubo} onChange={e => setCodigoTubo(e.target.value)}
                                    className={inputGlassStyle} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-cyan-200 uppercase tracking-wider mb-1.5">
                                <Hash className="w-3.5 h-3.5 inline mr-1 text-cyan-300" />Laboratorio Destino
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {(Object.entries(labOpciones) as [NonNullable<RegistroSegundaMuestra['laboratorioId']>, string][]).map(([id, label]) => (
                                    <button key={id} type="button"
                                        onClick={() => handleLabChange(id)}
                                        className={`text-left px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer backdrop-blur-md ${laboratorioId === id
                                            ? 'bg-gradient-to-r from-cyan-400 to-blue-600 border-white text-white shadow-lg shadow-cyan-950/70'
                                            : 'bg-slate-900/80 border-white/30 text-slate-200 hover:bg-slate-800'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-cyan-200 uppercase tracking-wider mb-1.5">Tratamiento Empírico Indicado</label>
                            <input type="text" placeholder="Ej. Levotiroxina sódica 37.5 mcg/día" value={tratamiento} onChange={e => setTratamiento(e.target.value)}
                                className={inputGlassStyle} />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-cyan-200 uppercase tracking-wider mb-1.5">Observaciones del Médico</label>
                            <textarea rows={2} value={observaciones} onChange={e => setObservaciones(e.target.value)}
                                className={inputGlassStyle + " resize-none"} />
                        </div>

                        <div className="border border-white/30 rounded-2xl overflow-hidden backdrop-blur-md bg-slate-900/80">
                            <button type="button"
                                onClick={() => setMostrarCedula(v => !v)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 transition-colors text-xs font-black text-white cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-cyan-300" />
                                    Vista previa: Cédula de Orden de Laboratorio Confirmatoria
                                </span>
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${mostrarCedula ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/60' : 'bg-white/10 text-white border-white/30'}`}>
                                    {mostrarCedula ? 'Ocultar' : 'Ver Cédula'}
                                </span>
                            </button>
                            {mostrarCedula && (
                                <div className="p-4 space-y-3 bg-slate-950">
                                    <CedulaLaboratorio caso={caso} datos={cedulaData} />
                                    <button type="button"
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer shadow-lg border border-white/40">
                                        <Printer className="w-3.5 h-3.5" />
                                        Imprimir Cédula de Laboratorio (A5)
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose}
                                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl border border-white/30 backdrop-blur-md cursor-pointer transition-all">
                                Cancelar
                            </button>
                            <button type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white text-xs font-extrabold rounded-2xl flex items-center gap-2 shadow-lg shadow-cyan-950/70 transition-all active:scale-95 border border-white/50 cursor-pointer">
                                <Syringe className="w-4 h-4 text-cyan-100" />
                                Registrar y Enviar a Lab.
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export const TabCasosPrioritarios: React.FC = () => {
    const [busqueda, setBusqueda] = useState('');
    const [casoSeleccionado, setCasoSeleccionado] = useState<CasoPrioritario | null>(null);
    const [casos, setCasos] = useState<CasoPrioritario[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const cargarCasosPrioritarios = async () => {
            setCargando(true);
            setErrorMsg(null);
            try {
                const res = await http.get('/api/medico/tamiz/casos-prioritarios');
                setCasos(res.data || []);
            } catch (error: any) {
                console.error('Error al conectar con el backend para casos prioritarios:', error);
                setErrorMsg('No se pudo conectar con el servidor para obtener los casos prioritarios.');
                setCasos([]);
            } finally {
                setCargando(false);
            }
        };

        cargarCasosPrioritarios();
    }, []);

    const casosFiltrados = useMemo(() => {
        if (!busqueda.trim()) return casos;
        const q = busqueda.toLowerCase();
        return casos.filter(c =>
            c.folio.includes(q) ||
            c.nombreMadre.toLowerCase().includes(q) ||
            c.clues.toLowerCase().includes(q) ||
            c.nombreRN.toLowerCase().includes(q)
        );
    }, [busqueda, casos]);

    const pendientes = casos.filter(c => c.estatusResultado !== 'NORMAL' && c.estatusResultado !== 'CONFIRMADO_POSITIVO').length;
    const inadecuadas = casos.filter(c => c.estatusResultado === 'MUESTRA_INADECUADA' || c.estatusResultado === 'RETOMA_REQUERIDA').length;
    const enConfirmacion = casos.filter(c => c.estatusResultado === 'EN_CONFIRMACION').length;

    const handleSave2Muestra = async (data: RegistroSegundaMuestra) => {
        try {
            await http.post('/api/medico/tamiz/solicitar-segunda-muestra', data);

            setCasos(prev => prev.map(c =>
                c.id === data.casoId
                    ? { ...c, estatusResultado: 'EN_CONFIRMACION' as EstatusResultado }
                    : c
            ));
            alert('Segunda muestra registrada y enviada al servidor con éxito.');
        } catch (error: any) {
            console.error('Error al registrar segunda muestra en el servidor:', error);
            alert(error.response?.data?.message || 'Error al guardar en el servidor backend.');
        }
    };

    const cardGlassStyle = "p-5 bg-slate-950/80 rounded-3xl border border-white/40 backdrop-blur-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] space-y-4 text-white";
    const inputGlassStyle = "w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/40 rounded-xl text-white text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40 backdrop-blur-md transition-all shadow-inner";

    return (
        <div className="space-y-6 text-white animate-fadeIn">
            {errorMsg && (
                <div className="bg-rose-950/80 border border-rose-500/60 p-3.5 rounded-2xl text-rose-200 text-xs font-bold flex items-center gap-2.5 backdrop-blur-md shadow-lg">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* TARJETAS KPI DE CRISTAL ALTO CONTRASTE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Casos Pendientes', value: pendientes, icon: AlertTriangle, cls: 'bg-rose-950/70 border-rose-500/50 text-rose-200' },
                    { label: 'Muestras Inadecuadas', value: inadecuadas, icon: FlaskConical, cls: 'bg-amber-950/70 border-amber-500/50 text-amber-200' },
                    { label: 'En Confirmación', value: enConfirmacion, icon: Clock, cls: 'bg-blue-950/70 border-blue-500/50 text-blue-200' },
                ].map(({ label, value, icon: Icon, cls }) => (
                    <div key={label} className={`flex items-center gap-4 p-5 rounded-3xl border ${cls} backdrop-blur-3xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.7)]`}>
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/30 backdrop-blur-md shadow-lg">
                            <Icon className="w-5 h-5 text-cyan-300" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">{value}</p>
                            <p className="text-xs font-bold text-slate-200 mt-0.5">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-cyan-300 absolute left-3.5 top-3" />
                <input
                    type="text"
                    placeholder="Buscar por Folio, CLUES o nombre de la madre..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className={inputGlassStyle + " pl-10"}
                />
            </div>

            {/* TABLA DE CASOS PRIORITARIOS ALTO CONTRASTE */}
            <div className={cardGlassStyle + " overflow-hidden p-0 sm:p-0"}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-xs text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/90 text-cyan-200 uppercase tracking-wider text-[11px] font-bold border-b border-white/20">
                                <th className="px-4.5 py-3.5">Folio / R.N.</th>
                                <th className="px-4.5 py-3.5">Madre • CLUES</th>
                                <th className="px-4.5 py-3.5">Prueba</th>
                                <th className="px-4.5 py-3.5">Resultado</th>
                                <th className="px-4.5 py-3.5">Estatus</th>
                                <th className="px-4.5 py-3.5 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-white font-medium">
                            {cargando ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-cyan-200 font-semibold">
                                        <div className="flex items-center justify-center gap-2.5">
                                            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                            <span>Consultando casos prioritarios en PostgreSQL...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : casosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-300 font-normal">
                                        No se encontraron casos prioritarios registrados en el servidor.
                                    </td>
                                </tr>
                            ) : (
                                casosFiltrados.map(caso => (
                                    <tr key={caso.id} className="hover:bg-white/10 transition-colors">
                                        <td className="px-4.5 py-3.5">
                                            <p className="font-mono font-black text-cyan-300">{caso.folio}</p>
                                            <p className="text-slate-200 text-[11px] mt-0.5">{caso.nombreRN}</p>
                                        </td>
                                        <td className="px-4.5 py-3.5">
                                            <p className="font-bold text-white">{caso.nombreMadre}</p>
                                            <div className="flex items-center gap-1 text-cyan-300 text-[10px] font-mono mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                <span>{caso.clues}</span>
                                            </div>
                                        </td>
                                        <td className="px-4.5 py-3.5">
                                            <span className="font-black text-white bg-white/15 border border-white/30 px-2.5 py-1 rounded-xl">{caso.tipoPrueba}</span>
                                        </td>
                                        <td className="px-4.5 py-3.5">
                                            <p className="font-bold text-white">{caso.valorObtenido ?? '—'}</p>
                                            {caso.valorReferencia && (
                                                <p className="text-[10px] text-slate-300 font-mono">Ref: {caso.valorReferencia}</p>
                                            )}
                                        </td>
                                        <td className="px-4.5 py-3.5">
                                            {getEstatusBadge(caso.estatusResultado)}
                                        </td>
                                        <td className="px-4.5 py-3.5 text-center">
                                            {caso.estatusResultado !== 'NORMAL' && caso.estatusResultado !== 'EN_CONFIRMACION' && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCasoSeleccionado(caso)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-cyan-950/70 transition-all active:scale-95 border border-white/40 cursor-pointer"
                                                >
                                                    <FlaskConical className="w-3.5 h-3.5 text-cyan-100" />
                                                    2ª Muestra / Venosa
                                                </button>
                                            )}
                                            {caso.estatusResultado === 'EN_CONFIRMACION' && (
                                                <span className="inline-flex items-center gap-1 text-cyan-200 text-xs font-bold bg-cyan-600/30 border border-cyan-400/50 px-3 py-1.5 rounded-xl backdrop-blur-md">
                                                    <Clock className="w-3.5 h-3.5" /> En Lab.
                                                </span>
                                            )}
                                            {caso.estatusResultado === 'NORMAL' && (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {casoSeleccionado && (
                <Modal2Muestra
                    caso={casoSeleccionado}
                    onClose={() => setCasoSeleccionado(null)}
                    onSave={handleSave2Muestra}
                />
            )}
        </div>
    );
};

export default TabCasosPrioritarios;