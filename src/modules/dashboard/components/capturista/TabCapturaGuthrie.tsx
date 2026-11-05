/* spell-checker: disable */
import React, { useState, useEffect } from 'react';
import {
    Building2,
    Baby,
    HeartPulse,
    CheckCircle2,
    Printer,
    RotateCcw,
    FileText,
    FlaskConical,
    Clock,
    ClipboardList,
    Loader2,
    Sparkles,
    CheckCircle
} from 'lucide-react';
import type { GuthrieFormData, UnidadCLUES } from './types';
import { http } from '../../../../services/http';

interface TabCapturaGuthrieProps {
    initialData?: Partial<GuthrieFormData>;
    onSaveSuccess: (data: GuthrieFormData) => void;
    onOpenAIScan?: () => void;
}

export const TabCapturaGuthrie: React.FC<TabCapturaGuthrieProps> = ({
    initialData,
    onSaveSuccess,
    onOpenAIScan
}) => {

    const [catalogCLUES, setCatalogCLUES] = useState<UnidadCLUES[]>([]);
    const [cargandoClues, setCargandoClues] = useState<boolean>(false);

    const defaultForm: GuthrieFormData = {
        folio: '',
        unidadMedica: '',
        clues: '',
        jurisdiccion: '02 Istmo',
        estado: 'Oaxaca',
        nombreResponsableToma: '',
        apellidoPaternoResponsableToma: '',
        apellidoMaternoResponsableToma: '',
        responsableToma: '',
        tecnicaToma: '1A_MUESTRA',
        sospechosoEspecificar: '',
        calidadMuestraLab: 'ADECUADA',
        responsableLaboratorio: '',

        nombreRN: '',
        apellidoPaternoRN: '',
        apellidoMaternoRN: '',
        fechaNacimiento: new Date().toISOString().split('T')[0],
        horaNacimiento: '08:00',
        fechaToma: new Date().toISOString().split('T')[0],
        horaToma: '10:00',
        sexo: 'MASCULINO',
        edadGestacional: 'TERMINO_37_41',
        producto: 'UNICO',
        numeroGemelo: '',
        pesoGramos: '',
        tallaCm: '',
        malformaciones: 'NO',
        malformacionesDetalle: '',
        condicionesRN: 'SANO',
        alimentacion: 'LECHE_MATERNA',

        nombreMadre: '',
        apellidoPaternoMadre: '',
        apellidoMaternoMadre: '',
        curpMadre: '',
        calle: '',
        numExterior: '',
        numInterior: '',
        coloniaLocalidad: '',
        municipioMadre: 'Juchitán de Zaragoza',
        estadoMadre: 'Oaxaca',
        codigoPostalMadre: '',
        telefonoFijo: '',
        telefonoCelular: '',
        emailMadre: '',
        edadMadre: '',
        gestas: '1',
        enfermedadTiroideaMetabolica: 'NO',
        enfermedadTiroideaDetalle: '',
        observacionesMuestra: '',
    };

    const [formData, setFormData] = useState<GuthrieFormData>(defaultForm);
    const [savedNotification, setSavedNotification] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUnidadesMedicas = async () => {
            setCargandoClues(true);
            try {
                const response = await http.get('/clues');
                setCatalogCLUES(response.data || []);
            } catch (error) {
                console.error('Error al cargar el catálogo CLUES desde el servidor:', error);
                setCatalogCLUES([]);
            } finally {
                setCargandoClues(false);
            }
        };

        fetchUnidadesMedicas();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData]);

    const handleCluesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedVal = e.target.value;
        const found = catalogCLUES.find(c => `${c.clues} ${c.nombre}` === selectedVal || c.clues === selectedVal);
        if (found) {
            setFormData(prev => ({
                ...prev,
                unidadMedica: `${found.clues} ${found.nombre}`,
                clues: found.clues,
                jurisdiccion: found.jurisdiccion || '02 Istmo',
                estado: found.estado || 'Oaxaca'
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                folio_tarjeta: formData.folio,
                clues_unidad: formData.clues,
                unidad_medica_nombre: formData.unidadMedica,
                jurisdiccion: formData.jurisdiccion,
                estado: formData.estado,
                responsable_toma_nombre: `${formData.nombreResponsableToma} ${formData.apellidoPaternoResponsableToma} ${formData.apellidoMaternoResponsableToma}`.trim(),
                tecnica_toma: formData.tecnicaToma,
                tecnica_toma_especificar: formData.sospechosoEspecificar,

                rn_nombres: formData.nombreRN,
                rn_apellido_paterno: formData.apellidoPaternoRN,
                rn_apellido_materno: formData.apellidoMaternoRN,
                rn_fecha_nacimiento: `${formData.fechaNacimiento}T${formData.horaNacimiento}:00Z`,
                rn_fecha_toma_muestra: `${formData.fechaToma}T${formData.horaToma}:00Z`,
                rn_sexo: formData.sexo,
                rn_edad_gestacional: formData.edadGestacional,
                rn_producto: formData.producto,
                rn_peso_gramos: Number(formData.pesoGramos) || 0,
                rn_talla_cm: Number(formData.tallaCm) || 0,
                rn_malformaciones_congenitas: formData.malformaciones === 'SI',
                rn_malformaciones_especificar: formData.malformacionesDetalle,
                rn_condicion_toma: formData.condicionesRN,
                rn_alimentacion: formData.alimentacion,

                madre_nombres: formData.nombreMadre,
                madre_apellido_paterno: formData.apellidoPaternoMadre,
                madre_apellido_materno: formData.apellidoMaternoMadre,
                madre_curp: formData.curpMadre,
                madre_telefono_celular: formData.telefonoCelular,
                madre_telefono_fijo: formData.telefonoFijo,
                madre_email: formData.emailMadre,
                madre_calle_numero: `${formData.calle} Ext.${formData.numExterior} Int.${formData.numInterior || 'S/N'}`,
                madre_colonia_localidad: formData.coloniaLocalidad,
                madre_municipio: formData.municipioMadre,
                madre_codigo_postal: formData.codigoPostalMadre,
                madre_edad: Number(formData.edadMadre) || 0,
                madre_gestas: Number(formData.gestas) || 1,
                madre_antecedente_tiroideo: formData.enfermedadTiroideaMetabolica === 'SI',
                madre_antecedente_especificar: formData.enfermedadTiroideaDetalle,

                observaciones_captura: formData.observacionesMuestra,
                estatus_muestra: 'REGISTRADO'
            };

            await http.post('/tamiz/muestras', payload);

            onSaveSuccess(formData);
            setSavedNotification(true);
            setTimeout(() => setSavedNotification(false), 6000);
        } catch (error: any) {
            console.error('Error al guardar la tarjeta Guthrie en el servidor:', error);
            alert('Error al sincronizar el registro con el servidor PostgreSQL.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('¿Está seguro de reiniciar todos los campos de la tarjeta Guthrie?')) {
            setFormData(defaultForm);
        }
    };

    const inputGlassStyle = "w-full px-3.5 py-2.5 bg-white/5 border border-white/30 rounded-xl text-white text-xs font-semibold placeholder:text-white/40 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 backdrop-blur-md transition-all shadow-inner";
    const selectGlassStyle = "w-full px-3.5 py-2.5 bg-slate-900/40 border border-white/30 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 backdrop-blur-md transition-all shadow-inner";
    const cardGlassStyle = "p-4 sm:p-6 bg-white/5 rounded-3xl border border-white/30 backdrop-blur-3xl shadow-[0_20px_40px_-15px_rgba(15,23,42,0.5)] space-y-4";

    return (
        <div className="space-y-6 text-white w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 animate-fadeIn">

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slideDown {
                    animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @media print {
                    @page { size: portrait; margin: 4mm; }
                    body { background: #fff !important; color: #000 !important; font-size: 8.5px !important; }
                    .no-print { display: none !important; }
                    .printable-guthrie-card {
                        border: 2px solid #9D2449 !important; border-radius: 6px !important;
                        padding: 8px !important; box-shadow: none !important; background: white !important;
                        margin: 0 !important; width: 100% !important; color: #000 !important;
                    }
                    .printable-guthrie-card input, .printable-guthrie-card select, .printable-guthrie-card textarea {
                        border: 1px solid #475569 !important; background: #fff !important; color: #000 !important;
                        padding: 2px 4px !important; font-size: 8.5px !important; height: auto !important;
                    }
                    .print-2col-layout { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
                }
            `}</style>

            {/* BARRA SUPERIOR CON ESCANEO IA */}
            <div className={cardGlassStyle + " flex flex-col md:flex-row items-center justify-between gap-4"}>
                <div className="flex items-center gap-3.5 text-center md:text-left">
                    <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/40 text-cyan-300 backdrop-blur-md shadow-lg shrink-0">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[9px] sm:text-[10px] font-black text-cyan-200 uppercase tracking-widest block">
                            SECRETARÍA DE SALUD DE OAXACA • SERVICIOS DE SALUD DE OAXACA
                        </span>
                        <h2 className="text-sm sm:text-lg font-black text-white tracking-tight">
                            Cédula Digital de Tamiz Neonatal (Formato Papel Filtro SSO)
                        </h2>
                    </div>
                </div>

                {onOpenAIScan && (
                    <button
                        type="button"
                        onClick={onOpenAIScan}
                        className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:brightness-110 text-white font-black text-xs rounded-2xl shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 border border-white/40 shrink-0"
                    >
                        <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
                        <span>Subir Foto de Tarjeta (OCR con IA)</span>
                    </button>
                )}
            </div>

            {/* ALERTA FLOTANTE DE ÉXITO */}
            {savedNotification && (
                <div className="animate-slideDown p-4 sm:p-5 bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-cyan-950/90 border-2 border-emerald-400/80 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(52,211,153,0.3)] backdrop-blur-2xl text-emerald-100 z-50">
                    <div className="flex items-center gap-3.5 text-center sm:text-left">
                        <div className="p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-2xl text-emerald-300 shadow-lg shrink-0">
                            <CheckCircle className="w-7 h-7 animate-bounce" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-300 block">
                                ESTADO DE REGISTRO INSTITUCIONAL
                            </span>
                            <h3 className="font-black text-base sm:text-lg text-white">
                                ¡Guardado con Éxito! Prueba de Tamiz Registrada
                            </h3>
                            <p className="text-xs text-emerald-200/90 font-medium">
                                El folio <span className="font-mono font-bold text-cyan-300">{formData.folio}</span> se sincronizó correctamente con la base de datos PostgreSQL.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer border border-emerald-400/40 transition-all active:scale-95"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Imprimir Comprobante</span>
                        </button>
                    </div>
                </div>
            )}

            {/* FORMULARIO RESPONSIVO */}
            <form onSubmit={handleSubmit} className="printable-guthrie-card space-y-6">

                {/* ENCABEZADO FOLIO */}
                <div className={cardGlassStyle + " flex flex-col sm:flex-row items-center justify-between gap-4 py-4"}>
                    <div className="text-center sm:text-left">
                        <span className="text-[9px] sm:text-[10px] font-black text-cyan-200 uppercase tracking-wider block">SECRETARÍA DE SALUD • SISTEMA NACIONAL DE SALUD • OAXACA</span>
                        <h3 className="text-xs sm:text-sm font-black text-white">Cédula Oficial de Muestra Neonatal — SSO Oaxaca</h3>
                    </div>
                    <div className="px-4 py-2.5 bg-slate-900/40 rounded-2xl border border-cyan-400/40 text-center sm:text-right shadow-inner backdrop-blur-md w-full sm:w-auto">
                        <span className="text-[9px] uppercase font-bold text-cyan-200 block">FOLIO TARJETA GUTHRIE</span>
                        <span className="font-mono text-base sm:text-lg text-cyan-300 font-black tracking-wider">
                            {formData.folio || 'PENDIENTE'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-2col-layout">

                    {/* COLUMNA IZQUIERDA: SECCIÓN A Y B */}
                    <div className="space-y-6">

                        {/* SECCIÓN A */}
                        <div className={cardGlassStyle}>
                            <div className="flex items-center gap-2.5 border-b border-white/20 pb-3 text-cyan-300">
                                <Building2 className="w-4 h-4 shrink-0" />
                                <h3 className="text-xs font-black uppercase tracking-wider">SECCIÓN A • Unidad Médica (CLUES) y Muestra</h3>
                            </div>

                            <div className="space-y-3 text-xs font-semibold">
                                <div>
                                    <label className="block text-[11px] font-bold text-cyan-100 mb-1">Folio de Tarjeta *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. 5458349"
                                        value={formData.folio}
                                        onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                                        className={inputGlassStyle + " font-mono text-cyan-300 font-black"}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-cyan-100 mb-1 flex items-center justify-between">
                                        <span>Unidad Médica * (Catálogo CLUES Real)</span>
                                        {cargandoClues && <span className="text-[10px] text-cyan-300 animate-pulse">Cargando unidades...</span>}
                                    </label>
                                    <select
                                        required
                                        value={formData.unidadMedica}
                                        onChange={handleCluesChange}
                                        className={selectGlassStyle}
                                    >
                                        <option value="" className="bg-slate-900 text-white">Seleccione una unidad médica institucional...</option>
                                        {catalogCLUES.map((u) => (
                                            <option key={u.clues} value={`${u.clues} ${u.nombre}`} className="bg-slate-900 text-white">
                                                {u.clues} - {u.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-[11px] font-bold">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/20 backdrop-blur-md">
                                        <span className="text-cyan-200/80 block text-[10px]">Jurisdicción:</span>
                                        <span className="text-white font-black">{formData.jurisdiccion}</span>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/20 backdrop-blur-md">
                                        <span className="text-cyan-200/80 block text-[10px]">Estado:</span>
                                        <span className="text-white font-black">{formData.estado}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-cyan-100 mb-1">Responsable de la Toma (Nombre y Apellidos) *</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nombre(s)"
                                            value={formData.nombreResponsableToma}
                                            onChange={(e) => setFormData({ ...formData, nombreResponsableToma: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ap. Paterno"
                                            value={formData.apellidoPaternoResponsableToma}
                                            onChange={(e) => setFormData({ ...formData, apellidoPaternoResponsableToma: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ap. Materno"
                                            value={formData.apellidoMaternoResponsableToma}
                                            onChange={(e) => setFormData({ ...formData, apellidoMaternoResponsableToma: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-cyan-100 mb-1">Técnica de Toma *</label>
                                    <select
                                        value={formData.tecnicaToma}
                                        onChange={(e) => setFormData({ ...formData, tecnicaToma: e.target.value as any })}
                                        className={selectGlassStyle}
                                    >
                                        <option value="1A_MUESTRA" className="bg-slate-900 text-white">1a Muestra</option>
                                        <option value="2A_PREMATUREZ" className="bg-slate-900 text-white">2a Muestra por Prematurez</option>
                                        <option value="2A_INADECUADA" className="bg-slate-900 text-white">2a Muestra por Inadecuada</option>
                                        <option value="2A_SOSPECHOSO" className="bg-slate-900 text-white">2a Muestra por ser Sospechoso a:</option>
                                    </select>
                                    {formData.tecnicaToma === '2A_SOSPECHOSO' && (
                                        <input
                                            type="text"
                                            required
                                            placeholder="Especifique patología sospechosa..."
                                            value={formData.sospechosoEspecificar}
                                            onChange={(e) => setFormData({ ...formData, sospechosoEspecificar: e.target.value })}
                                            className={inputGlassStyle + " mt-2 border-rose-400/50 text-rose-200"}
                                        />
                                    )}
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/20 space-y-2.5 backdrop-blur-md">
                                    <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                                        <FlaskConical className="w-4 h-4 shrink-0" /> Reporte de Laboratorio:
                                    </span>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <label className="inline-flex items-center gap-1.5 font-bold text-xs text-white cursor-pointer">
                                            <input
                                                type="radio"
                                                name="calidadLab"
                                                checked={formData.calidadMuestraLab === 'ADECUADA'}
                                                onChange={() => setFormData({ ...formData, calidadMuestraLab: 'ADECUADA' })}
                                                className="accent-cyan-400"
                                            />
                                            Calidad: Adecuada
                                        </label>
                                        <label className="inline-flex items-center gap-1.5 font-bold text-xs text-white cursor-pointer">
                                            <input
                                                type="radio"
                                                name="calidadLab"
                                                checked={formData.calidadMuestraLab === 'INADECUADA'}
                                                onChange={() => setFormData({ ...formData, calidadMuestraLab: 'INADECUADA' })}
                                                className="accent-cyan-400"
                                            />
                                            Calidad: Inadecuada
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Responsable del Laboratorio (Q.F.B.)"
                                        value={formData.responsableLaboratorio}
                                        onChange={(e) => setFormData({ ...formData, responsableLaboratorio: e.target.value })}
                                        className={inputGlassStyle}
                                    />
                                </div>

                            </div>
                        </div>

                        {/* SECCIÓN B */}
                        <div className={cardGlassStyle}>
                            <div className="flex items-center gap-2.5 border-b border-white/20 pb-3 text-cyan-300">
                                <Baby className="w-4 h-4 shrink-0" />
                                <h3 className="text-xs font-black uppercase tracking-wider">SECCIÓN B • Datos del Recién Nacido (RN)</h3>
                            </div>

                            <div className="space-y-3 text-xs font-semibold">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Nombre(s) RN *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nombre(s)"
                                            value={formData.nombreRN}
                                            onChange={(e) => setFormData({ ...formData, nombreRN: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Ap. Paterno *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ap. Paterno"
                                            value={formData.apellidoPaternoRN}
                                            onChange={(e) => setFormData({ ...formData, apellidoPaternoRN: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Ap. Materno *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ap. Materno"
                                            value={formData.apellidoMaternoRN}
                                            onChange={(e) => setFormData({ ...formData, apellidoMaternoRN: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-cyan-100 mb-1">Fecha / Hora Nacimiento *</label>
                                        <div className="flex gap-1.5">
                                            <input
                                                type="date"
                                                required
                                                value={formData.fechaNacimiento}
                                                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                                                className={inputGlassStyle + " text-[11px]"}
                                            />
                                            <input
                                                type="time"
                                                required
                                                value={formData.horaNacimiento}
                                                onChange={(e) => setFormData({ ...formData, horaNacimiento: e.target.value })}
                                                className={inputGlassStyle + " w-24 sm:w-20 text-[11px]"}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-cyan-100 mb-1">Fecha / Hora Toma Muestra *</label>
                                        <div className="flex gap-1.5">
                                            <input
                                                type="date"
                                                required
                                                value={formData.fechaToma}
                                                onChange={(e) => setFormData({ ...formData, fechaToma: e.target.value })}
                                                className={inputGlassStyle + " text-[11px]"}
                                            />
                                            <input
                                                type="time"
                                                required
                                                value={formData.horaToma}
                                                onChange={(e) => setFormData({ ...formData, horaToma: e.target.value })}
                                                className={inputGlassStyle + " w-24 sm:w-20 text-[11px]"}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Sexo *</label>
                                        <select
                                            value={formData.sexo}
                                            onChange={(e) => setFormData({ ...formData, sexo: e.target.value as any })}
                                            className={selectGlassStyle}
                                        >
                                            <option value="MASCULINO" className="bg-slate-900 text-white">Masculino</option>
                                            <option value="FEMENINO" className="bg-slate-900 text-white">Femenino</option>
                                            <option value="AMBIGUEDAD" className="bg-slate-900 text-white">Ambigüedad</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Peso (g) *</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="Ej. 3200"
                                            value={formData.pesoGramos}
                                            onChange={(e) => setFormData({ ...formData, pesoGramos: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Talla (cm) *</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="Ej. 50"
                                            value={formData.tallaCm}
                                            onChange={(e) => setFormData({ ...formData, tallaCm: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-cyan-100 mb-1">Edad Gestacional *</label>
                                    <select
                                        value={formData.edadGestacional}
                                        onChange={(e) => setFormData({ ...formData, edadGestacional: e.target.value as any })}
                                        className={selectGlassStyle}
                                    >
                                        <option value="PRETERMINO_MENOR_37" className="bg-slate-900 text-white">1. Pre-término &lt; 37 SDG</option>
                                        <option value="TERMINO_37_41" className="bg-slate-900 text-white">2. Término 37-41.6 SDG</option>
                                        <option value="POSTERMINO_MAYOR_42" className="bg-slate-900 text-white">3. Post-término &gt; 42 SDG</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Producto *</label>
                                        <select
                                            value={formData.producto}
                                            onChange={(e) => setFormData({ ...formData, producto: e.target.value as any })}
                                            className={selectGlassStyle}
                                        >
                                            <option value="UNICO" className="bg-slate-900 text-white">1. Único</option>
                                            <option value="GEMELAR" className="bg-slate-900 text-white">2. Múltiple / Gemelar</option>
                                        </select>
                                    </div>
                                    {formData.producto === 'GEMELAR' && (
                                        <div>
                                            <label className="block text-[11px] font-bold text-cyan-100 mb-1">No. de Gemelo *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. Gemelo 1"
                                                value={formData.numeroGemelo}
                                                onChange={(e) => setFormData({ ...formData, numeroGemelo: e.target.value })}
                                                className={inputGlassStyle + " border-rose-400/50"}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-cyan-100 mb-1">Malformaciones Congénitas *</label>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <label className="inline-flex items-center gap-1.5 font-bold text-xs text-white cursor-pointer">
                                            <input
                                                type="radio"
                                                name="malform"
                                                checked={formData.malformaciones === 'NO'}
                                                onChange={() => setFormData({ ...formData, malformaciones: 'NO' })}
                                                className="accent-cyan-400"
                                            />
                                            1. No
                                        </label>
                                        <label className="inline-flex items-center gap-1.5 font-bold text-xs text-white cursor-pointer">
                                            <input
                                                type="radio"
                                                name="malform"
                                                checked={formData.malformaciones === 'SI'}
                                                onChange={() => setFormData({ ...formData, malformaciones: 'SI' })}
                                                className="accent-cyan-400"
                                            />
                                            2. Sí
                                        </label>
                                        {formData.malformaciones === 'SI' && (
                                            <input
                                                type="text"
                                                required
                                                placeholder="¿Cuál malformación?"
                                                value={formData.malformacionesDetalle}
                                                onChange={(e) => setFormData({ ...formData, malformacionesDetalle: e.target.value })}
                                                className={inputGlassStyle + " flex-1 mt-1 sm:mt-0"}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-cyan-100 mb-1">Condiciones del RN al Tomar la Muestra *</label>
                                    <select
                                        value={formData.condicionesRN}
                                        onChange={(e) => setFormData({ ...formData, condicionesRN: e.target.value as any })}
                                        className={selectGlassStyle}
                                    >
                                        <option value="SANO" className="bg-slate-900 text-white">1. Sano</option>
                                        <option value="ENFERMO" className="bg-slate-900 text-white">2. Enfermo</option>
                                        <option value="UCIN" className="bg-slate-900 text-white">3. Cuidados Intensivos (UCIN)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-cyan-100 mb-1">Alimentación del RN *</label>
                                    <select
                                        value={formData.alimentacion}
                                        onChange={(e) => setFormData({ ...formData, alimentacion: e.target.value as any })}
                                        className={selectGlassStyle}
                                    >
                                        <option value="LECHE_MATERNA" className="bg-slate-900 text-white">1. Leche Materna</option>
                                        <option value="FORMULA" className="bg-slate-900 text-white">2. Fórmula Láctea</option>
                                        <option value="MIXTA" className="bg-slate-900 text-white">3. Mixta</option>
                                        <option value="AYUNO" className="bg-slate-900 text-white">4. Ayuno</option>
                                    </select>
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* COLUMNA DERECHA: SECCIÓN C Y D */}
                    <div className="space-y-6">

                        {/* SECCIÓN C */}
                        <div className={cardGlassStyle}>
                            <div className="flex items-center gap-2.5 border-b border-white/20 pb-3 text-cyan-300">
                                <HeartPulse className="w-4 h-4 shrink-0" />
                                <h3 className="text-xs font-black uppercase tracking-wider">SECCIÓN C • Datos de la Madre o Tutora</h3>
                            </div>

                            <div className="space-y-3.5 text-xs font-semibold">

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Nombre(s) *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nombre(s)"
                                            value={formData.nombreMadre}
                                            onChange={(e) => setFormData({ ...formData, nombreMadre: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Ap. Paterno *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ap. Paterno"
                                            value={formData.apellidoPaternoMadre}
                                            onChange={(e) => setFormData({ ...formData, apellidoPaternoMadre: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Ap. Materno *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ap. Materno"
                                            value={formData.apellidoMaternoMadre}
                                            onChange={(e) => setFormData({ ...formData, apellidoMaternoMadre: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-cyan-100 mb-1">CURP Madre (18 Caracteres)</label>
                                    <input
                                        type="text"
                                        maxLength={18}
                                        placeholder="EJ. GOSM980412MOCMNN08"
                                        value={formData.curpMadre}
                                        onChange={(e) => setFormData({ ...formData, curpMadre: e.target.value.toUpperCase() })}
                                        className={inputGlassStyle + " font-mono font-bold uppercase text-cyan-300"}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-cyan-100 mb-1">Calle y Números *</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Calle / Avenida"
                                            value={formData.calle}
                                            onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                                            className={inputGlassStyle + " sm:col-span-2"}
                                        />
                                        <div className="flex gap-1">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ext"
                                                value={formData.numExterior}
                                                onChange={(e) => setFormData({ ...formData, numExterior: e.target.value })}
                                                className={inputGlassStyle + " w-1/2 text-center px-1"}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Int"
                                                value={formData.numInterior}
                                                onChange={(e) => setFormData({ ...formData, numInterior: e.target.value })}
                                                className={inputGlassStyle + " w-1/2 text-center px-1"}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Colonia / Localidad *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Colonia"
                                            value={formData.coloniaLocalidad}
                                            onChange={(e) => setFormData({ ...formData, coloniaLocalidad: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Municipio *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Municipio"
                                            value={formData.municipioMadre}
                                            onChange={(e) => setFormData({ ...formData, municipioMadre: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Código Postal *</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={5}
                                            placeholder="70000"
                                            value={formData.codigoPostalMadre}
                                            onChange={(e) => setFormData({ ...formData, codigoPostalMadre: e.target.value })}
                                            className={inputGlassStyle + " font-mono font-bold text-center"}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-cyan-100 mb-1">Tel. Fijo</label>
                                        <input
                                            type="tel"
                                            placeholder="971..."
                                            value={formData.telefonoFijo}
                                            onChange={(e) => setFormData({ ...formData, telefonoFijo: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-cyan-100 mb-1">Tel. Celular *</label>
                                        <input
                                            type="tel"
                                            required
                                            maxLength={10}
                                            placeholder="971..."
                                            value={formData.telefonoCelular}
                                            onChange={(e) => setFormData({ ...formData, telefonoCelular: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-cyan-100 mb-1">E-mail Madre</label>
                                        <input
                                            type="email"
                                            placeholder="correo@..."
                                            value={formData.emailMadre}
                                            onChange={(e) => setFormData({ ...formData, emailMadre: e.target.value })}
                                            className={inputGlassStyle}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/20">
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Edad Madre *</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="Ej. 26"
                                            value={formData.edadMadre}
                                            onChange={(e) => setFormData({ ...formData, edadMadre: e.target.value })}
                                            className={inputGlassStyle + " text-center"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-cyan-100 mb-1">Gestas (No.) *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. I"
                                            value={formData.gestas}
                                            onChange={(e) => setFormData({ ...formData, gestas: e.target.value })}
                                            className={inputGlassStyle + " text-center"}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-cyan-100 mb-1">Enfermedad Tiroidea / Metabólica *</label>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <label className="inline-flex items-center gap-1.5 font-bold text-xs text-white cursor-pointer">
                                            <input
                                                type="radio"
                                                name="tiroidea"
                                                checked={formData.enfermedadTiroideaMetabolica === 'NO'}
                                                onChange={() => setFormData({ ...formData, enfermedadTiroideaMetabolica: 'NO' })}
                                                className="accent-cyan-400"
                                            />
                                            1. No
                                        </label>
                                        <label className="inline-flex items-center gap-1.5 font-bold text-xs text-white cursor-pointer">
                                            <input
                                                type="radio"
                                                name="tiroidea"
                                                checked={formData.enfermedadTiroideaMetabolica === 'SI'}
                                                onChange={() => setFormData({ ...formData, enfermedadTiroideaMetabolica: 'SI' })}
                                                className="accent-cyan-400"
                                            />
                                            2. Sí
                                        </label>
                                        {formData.enfermedadTiroideaMetabolica === 'SI' && (
                                            <input
                                                type="text"
                                                required
                                                placeholder="¿Cuál enfermedad?"
                                                value={formData.enfermedadTiroideaDetalle}
                                                onChange={(e) => setFormData({ ...formData, enfermedadTiroideaDetalle: e.target.value })}
                                                className={inputGlassStyle + " flex-1 mt-1 sm:mt-0"}
                                            />
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* SECCIÓN D */}
                        <div className={cardGlassStyle}>
                            <div className="flex items-center gap-2.5 border-b border-white/20 pb-3 text-cyan-300">
                                <ClipboardList className="w-4 h-4 shrink-0" />
                                <h3 className="text-xs font-black uppercase tracking-wider">SECCIÓN D • Observaciones / Control de Calidad de Toma</h3>
                            </div>

                            <div className="space-y-3.5 text-xs font-semibold">
                                <div>
                                    <label className="block text-[11px] font-bold text-cyan-100 mb-1">
                                        Observaciones de la Muestra / Notas del Capturista
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Escriba aquí cualquier observación sobre la muestra..."
                                        value={formData.observacionesMuestra || ''}
                                        onChange={(e) => setFormData({ ...formData, observacionesMuestra: e.target.value })}
                                        className={inputGlassStyle + " resize-none"}
                                    />
                                </div>

                                <div className="p-4 bg-amber-950/40 border border-amber-400/40 rounded-2xl flex items-start gap-3 text-amber-100 backdrop-blur-md shadow-lg">
                                    <Clock className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                                    <div className="text-[11px] space-y-0.5">
                                        <span className="font-black text-amber-300 uppercase tracking-wider text-[10px] block">
                                            AVISO INSTITUCIONAL • TIEMPO LÍMITE DE ENVÍO
                                        </span>
                                        <p className="font-medium text-amber-100/90 leading-tight">
                                            Las muestras en papel filtro deben remitirse al LESP en un periodo <strong className="text-white underline">no mayor a 72 horas</strong> posterior a la toma para garantizar la viabilidad diagnóstica.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* BOTONERA INFERIOR RESPONSIVA */}
                <div className={cardGlassStyle + " flex flex-col sm:flex-row items-center justify-between gap-4 py-4"}>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/30"
                    >
                        <RotateCcw className="w-4 h-4 text-cyan-300" />
                        <span>Limpiar Campos</span>
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/30 shadow-md"
                        >
                            <Printer className="w-4 h-4 text-cyan-300" />
                            <span>Imprimir Cédula (1 Hoja)</span>
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50 cursor-pointer border border-white/40"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 text-cyan-200" />
                            )}
                            <span>{isSubmitting ? 'Guardando en PostgreSQL...' : 'Guardar Tarjeta Guthrie'}</span>
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default TabCapturaGuthrie;