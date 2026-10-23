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
import { http } from '../../../../services/http'; // <--- Importamos tu instancia de Axios

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEstatusBadge(estatus: EstatusResultado): React.ReactNode {
    const map: Record<EstatusResultado, { label: string; cls: string }> = {
        MUESTRA_INADECUADA: { label: 'Muestra Inadecuada', cls: 'bg-amber-100 text-amber-800 border border-amber-300' },
        RESULTADO_SOSPECHOSO: { label: 'Resultado Sospechoso', cls: 'bg-rose-100 text-rose-800 border border-rose-300' },
        RETOMA_REQUERIDA: { label: 'Re-toma Requerida', cls: 'bg-orange-100 text-orange-800 border border-orange-300' },
        MUESTRA_VENOSA_PENDIENTE: { label: 'Venosa Pendiente', cls: 'bg-purple-100 text-purple-800 border border-purple-300' },
        EN_CONFIRMACION: { label: 'En Confirmación', cls: 'bg-blue-100 text-blue-800 border border-blue-300' },
        CONFIRMADO_POSITIVO: { label: 'Confirmado Positivo', cls: 'bg-red-100 text-red-900 border border-red-400 font-black' },
        NORMAL: { label: 'Normal', cls: 'bg-emerald-100 text-emerald-800 border border-emerald-300' },
    };
    const { label, cls } = map[estatus] || { label: estatus, cls: 'bg-slate-100 text-slate-800 border border-slate-300' };
    return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>{label}</span>;
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
    <div className="print-cedula bg-white border-2 border-slate-400 rounded-xl p-5 space-y-3 text-xs">
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

            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
                <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl my-4">
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <div>
                            <h3 className="text-sm font-black text-[#9D2449]">Registro de 2ª Muestra / Venosa Confirmatoria</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                Folio <span className="font-black text-slate-700">{caso.folio}</span> · {caso.nombreRN} · {caso.tipoPrueba}
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-5 space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Tipo de Muestra</label>
                                <select
                                    value={tipo}
                                    onChange={e => setTipo(e.target.value as RegistroSegundaMuestra['tipoMuestra'])}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                >
                                    <option value="TALON_RETOMA">Re-toma Talón (Guthrie)</option>
                                    <option value="VENOSA_CONFIRMATORIA">Muestra Venosa Confirmatoria</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Prueba Objetivo</label>
                                <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-xs font-black text-[#9D2449]">
                                    {caso.tipoPrueba}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                    <Calendar className="w-3 h-3 inline mr-1" />Fecha Obtención
                                </label>
                                <input type="date" required value={fechaObtension} onChange={e => setFechaObtension(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                    <Calendar className="w-3 h-3 inline mr-1" />Fecha Envío Lab.
                                </label>
                                <input type="date" required value={fechaEnvio} onChange={e => setFechaEnvio(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                    <Beaker className="w-3 h-3 inline mr-1 text-[#9D2449]" />Valor TSH Tamiz Previo
                                </label>
                                <input type="text" placeholder="Ej. 25.4 mU/L" value={valorTshPrevio} onChange={e => setValorTshPrevio(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                    <Pipette className="w-3 h-3 inline mr-1 text-violet-600" />Código Tubo Lila (EDTA)
                                </label>
                                <input type="text" placeholder="Ej. TL-2026-001245" value={codigoTubo} onChange={e => setCodigoTubo(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                <Hash className="w-3 h-3 inline mr-1" />Laboratorio Destino
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(Object.entries(labOpciones) as [NonNullable<RegistroSegundaMuestra['laboratorioId']>, string][]).map(([id, label]) => (
                                    <button key={id} type="button"
                                        onClick={() => handleLabChange(id)}
                                        className={`text-left px-3 py-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${laboratorioId === id
                                            ? 'bg-[#9D2449] border-[#9D2449] text-white'
                                            : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-[#9D2449]'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Tratamiento Empírico Indicado</label>
                            <input type="text" placeholder="Ej. Levotiroxina sódica 37.5 mcg/día" value={tratamiento} onChange={e => setTratamiento(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Observaciones del Médico</label>
                            <textarea rows={2} value={observaciones} onChange={e => setObservaciones(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449] resize-none" />
                        </div>

                        <div className="border border-slate-200 rounded-2xl overflow-hidden">
                            <button type="button"
                                onClick={() => setMostrarCedula(v => !v)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-black text-slate-700 cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#9D2449]" />
                                    Vista previa: Cédula de Orden de Laboratorio Confirmatoria
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${mostrarCedula ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {mostrarCedula ? 'Ocultar' : 'Ver Cédula'}
                                </span>
                            </button>
                            {mostrarCedula && (
                                <div className="p-4 space-y-3 bg-white">
                                    <CedulaLaboratorio caso={caso} datos={cedulaData} />
                                    <button type="button"
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer">
                                        <Printer className="w-3.5 h-3.5" />
                                        Imprimir Cédula de Laboratorio (A5)
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={onClose}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
                                Cancelar
                            </button>
                            <button type="submit"
                                className="px-5 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer">
                                <Syringe className="w-3.5 h-3.5" />
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

    // Carga de casos prioritarios desde el backend real en Render / PostgreSQL
    useEffect(() => {
        const cargarCasosPrioritarios = async () => {
            setCargando(true);
            setErrorMsg(null);
            try {
                const res = await http.get('/api/medico/tamiz/casos-prioritarios');
                setCasos(res.data);
            } catch (error: any) {
                console.warn('Backend no disponible, cargando datos de respaldo locales:', error);
                setErrorMsg('No se pudo conectar con el servidor. Mostrando datos de respaldo.');
                // Datos de respaldo si el backend está apagado o en desarrollo local
                setCasos([
                    {
                        id: '1',
                        folio: '5458347',
                        nombreRN: 'RN Gómez Santiz',
                        nombreMadre: 'María Gómez Santiz',
                        clues: 'OCIMB000683',
                        unidadMedica: 'Centro de Salud Salina Cruz',
                        municipio: 'Salina Cruz',
                        tipoPrueba: 'TSH',
                        estatusResultado: 'RESULTADO_SOSPECHOSO',
                        valorObtenido: '25.4 mU/L',
                        valorReferencia: '< 10 mU/L',
                        fechaToma: '2026-10-05',
                        telefonoContacto: '9718765432'
                    }
                ]);
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
            // Sincronización real con el backend mediante Axios POST
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

    return (
        <div className="space-y-6 mt-4">
            {errorMsg && (
                <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Casos Pendientes', value: pendientes, icon: AlertTriangle, cls: 'bg-rose-50 border-rose-200 text-[#9D2449]' },
                    { label: 'Muestras Inadecuadas', value: inadecuadas, icon: FlaskConical, cls: 'bg-amber-50 border-amber-200 text-amber-700' },
                    { label: 'En Confirmación', value: enConfirmacion, icon: Clock, cls: 'bg-blue-50 border-blue-200 text-blue-700' },
                ].map(({ label, value, icon: Icon, cls }) => (
                    <div key={label} className={`flex items-center gap-4 p-4 rounded-2xl border ${cls} shadow-sm`}>
                        <div className="p-3 bg-white/60 rounded-xl shadow-sm">
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black">{value}</p>
                            <p className="text-[11px] font-bold opacity-75 leading-tight">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                    type="text"
                    placeholder="Buscar por Folio, CLUES o nombre de la madre..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-[#9D2449]/20"
                />
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full min-w-[700px] text-xs">
                    <thead className="bg-[#9D2449] text-white uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="text-left px-4 py-3 font-black">Folio / R.N.</th>
                            <th className="text-left px-4 py-3 font-black">Madre • CLUES</th>
                            <th className="text-left px-4 py-3 font-black">Prueba</th>
                            <th className="text-left px-4 py-3 font-black">Resultado</th>
                            <th className="text-left px-4 py-3 font-black">Estatus</th>
                            <th className="px-4 py-3 font-black text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {cargando ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-400 font-semibold flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#9D2449]" />
                                    <span>Conectando con PostgreSQL para obtener casos prioritarios...</span>
                                </td>
                            </tr>
                        ) : casosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-400 font-semibold">
                                    No se encontraron casos prioritarios registrados.
                                </td>
                            </tr>
                        ) : (
                            casosFiltrados.map(caso => (
                                <tr key={caso.id} className="hover:bg-rose-50/40 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-black text-[#9D2449]">{caso.folio}</p>
                                        <p className="text-slate-500 text-[10px] mt-0.5">{caso.nombreRN}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-800">{caso.nombreMadre}</p>
                                        <div className="flex items-center gap-1 text-slate-400 text-[10px] mt-0.5">
                                            <MapPin className="w-3 h-3" />
                                            <span>{caso.clues}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-black text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">{caso.tipoPrueba}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-800">{caso.valorObtenido ?? '—'}</p>
                                        {caso.valorReferencia && (
                                            <p className="text-[10px] text-slate-400">Ref: {caso.valorReferencia}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getEstatusBadge(caso.estatusResultado)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {caso.estatusResultado !== 'NORMAL' && caso.estatusResultado !== 'EN_CONFIRMACION' && (
                                            <button
                                                type="button"
                                                onClick={() => setCasoSeleccionado(caso)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                                            >
                                                <FlaskConical className="w-3 h-3" />
                                                2ª Muestra / Venosa
                                            </button>
                                        )}
                                        {caso.estatusResultado === 'EN_CONFIRMACION' && (
                                            <span className="inline-flex items-center gap-1 text-blue-600 text-[10px] font-bold bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                                                <Clock className="w-3 h-3" /> En Lab.
                                            </span>
                                        )}
                                        {caso.estatusResultado === 'NORMAL' && (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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