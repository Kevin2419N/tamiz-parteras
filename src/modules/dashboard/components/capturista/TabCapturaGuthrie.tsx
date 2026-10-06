import React, { useState, useEffect } from 'react';
import {
    Building2,
    User,
    Baby,
    HeartPulse,
    CheckCircle2,
    Printer,
    RotateCcw,
    Sparkles,
    Calendar,
    Clock,
    Phone,
    Hash,
    Camera,
    Upload,
    Zap,
    Check
} from 'lucide-react';
import type { GuthrieFormData, UnidadCLUES } from './types';

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

    const catalogCLUES: UnidadCLUES[] = [
        { clues: 'OCIMB000683', nombre: 'Centro de Salud Urbano Juchitán', jurisdiccion: '02 Istmo', estado: 'Oaxaca' },
        { clues: 'OASHG001245', nombre: 'Hospital General Sto. Domingo Tehuantepec', jurisdiccion: '02 Istmo', estado: 'Oaxaca' },
        { clues: 'OASCS002190', nombre: 'Centro de Salud Salina Cruz', jurisdiccion: '02 Istmo', estado: 'Oaxaca' },
        { clues: 'OASIX003410', nombre: 'Centro de Salud Cd. Ixtepec', jurisdiccion: '02 Istmo', estado: 'Oaxaca' },
        { clues: 'OASBA004120', nombre: 'CESSA San Blas Atempa', jurisdiccion: '02 Istmo', estado: 'Oaxaca' },
        { clues: 'OASIX003411', nombre: 'Hospital General Ixtaltepec', jurisdiccion: '02 Istmo', estado: 'Oaxaca' },
    ];

    const defaultForm: GuthrieFormData = {
        folio: '5458349',
        unidadMedica: 'OCIMB000683 - Centro de Salud Urbano Juchitán',
        clues: 'OCIMB000683',
        jurisdiccion: '02 Istmo',
        estado: 'Oaxaca',
        responsableToma: 'Enf. María del Carmen Reyes',
        tecnicaToma: '1A_TALON',
        nombreRN: 'RN (Bebé de María)',
        apellidoPaternoRN: 'Gómez',
        apellidoMaternoRN: 'Santiz',
        fechaNacimiento: new Date().toISOString().split('T')[0],
        horaNacimiento: '08:00',
        fechaToma: new Date().toISOString().split('T')[0],
        horaToma: '10:30',
        sexo: 'MASCULINO',
        edadGestacional: 'TERMINO',
        producto: 'UNICO',
        pesoGramos: '3200',
        tallaCm: '50',
        malformaciones: 'NO',
        malformacionesDetalle: '',
        condicionesRN: 'SANO',
        alimentacion: 'LACTANCIA_MATERNA',
        nombreMadre: '',
        apellidoPaternoMadre: '',
        apellidoMaternoMadre: '',
        curpMadre: '',
        calleNumero: '',
        coloniaLocalidad: '',
        municipioMadre: 'Juchitán de Zaragoza',
        codigoPostalMadre: '70000',
        telefonoCelular: '',
        edadMadre: '26',
        gestas: '1',
        enfermedadTiroideaMetabolica: 'NO',
        enfermedadTiroideaDetalle: '',
    };

    const sampleAIData: GuthrieFormData = {
        folio: '5458347',
        unidadMedica: 'OCIMB000683 - Centro de Salud Urbano Juchitán',
        clues: 'OCIMB000683',
        jurisdiccion: '02 Istmo',
        estado: 'Oaxaca',
        responsableToma: 'Enf. María del Carmen Reyes',
        tecnicaToma: '1A_TALON',
        nombreRN: 'RN (Bebé de María)',
        apellidoPaternoRN: 'Gómez',
        apellidoMaternoRN: 'Santiz',
        fechaNacimiento: '2026-09-05',
        horaNacimiento: '08:30',
        fechaToma: '2026-09-08',
        horaToma: '10:00',
        sexo: 'MASCULINO',
        edadGestacional: 'TERMINO',
        producto: 'UNICO',
        pesoGramos: '3250',
        tallaCm: '50',
        malformaciones: 'NO',
        condicionesRN: 'SANO',
        alimentacion: 'LACTANCIA_MATERNA',
        nombreMadre: 'María',
        apellidoPaternoMadre: 'Gómez',
        apellidoMaternoMadre: 'Santiz',
        curpMadre: 'GOSM980412MOCMNN08',
        calleNumero: 'Av. Hidalgo No. 45',
        coloniaLocalidad: 'Centro',
        municipioMadre: 'Juchitán de Zaragoza',
        codigoPostalMadre: '70000',
        telefonoCelular: '9711234567',
        edadMadre: '28',
        gestas: '2',
        enfermedadTiroideaMetabolica: 'NO',
    };

    const [formData, setFormData] = useState<GuthrieFormData>(defaultForm);
    const [savedNotification, setSavedNotification] = useState(false);
    const [aiToast, setAiToast] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData]);

    const handlePopulateAIData = () => {
        setFormData(sampleAIData);
        setAiToast('¡Datos de la tarjeta Guthrie extraídos e ingresados correctamente por IA!');
        setTimeout(() => setAiToast(null), 6000);
    };

    const handleCluesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedVal = e.target.value;
        const found = catalogCLUES.find(c => `${c.clues} - ${c.nombre}` === selectedVal || c.clues === selectedVal);
        if (found) {
            setFormData(prev => ({
                ...prev,
                unidadMedica: `${found.clues} - ${found.nombre}`,
                clues: found.clues,
                jurisdiccion: found.jurisdiccion,
                estado: found.estado
            }));
        }
    };

    const generateTestCurp = () => {
        const curpTest = `GOSM${Math.floor(100000 + Math.random() * 900000)}MOCMNN0${Math.floor(1 + Math.random() * 8)}`;
        setFormData(prev => ({ ...prev, curpMadre: curpTest }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveSuccess(formData);
        setSavedNotification(true);
        setTimeout(() => setSavedNotification(false), 5000);
    };

    const handleReset = () => {
        if (window.confirm('¿Está seguro de reiniciar todos los campos de la tarjeta Guthrie?')) {
            setFormData(defaultForm);
        }
    };

    return (
        <div className="space-y-6">

            {/* REGLAS DE IMPRESIÓN CSS PARA 1 PAGINA EXACTA */}
            <style>{`
                @media print {
                    @page {
                        size: portrait;
                        margin: 6mm;
                    }
                    body {
                        background: #fff !important;
                        color: #000 !important;
                        font-size: 10px !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .printable-guthrie-card {
                        border: 2px solid #9D2449 !important;
                        border-radius: 12px !important;
                        padding: 12px !important;
                        box-shadow: none !important;
                        background: white !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    .printable-guthrie-card input,
                    .printable-guthrie-card select,
                    .printable-guthrie-card textarea {
                        border: 1px solid #94a3b8 !important;
                        background: #fff !important;
                        color: #000 !important;
                        padding: 3px 6px !important;
                        font-size: 10px !important;
                        height: auto !important;
                    }
                    .print-dense-grid {
                        gap: 6px !important;
                    }
                    .print-section-header {
                        padding-bottom: 4px !important;
                        margin-bottom: 6px !important;
                    }
                }
            `}</style>

            {/* BANNER INTEGRADOR DE ESCANEO POR IA DENTRO DE LA PESTAÑA 1 */}
            <div className="no-print bg-gradient-to-r from-rose-900 via-[#9D2449] to-rose-950 text-white rounded-3xl p-5 shadow-lg border-2 border-rose-300 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="p-3.5 bg-white/15 text-white rounded-2xl border border-white/20 backdrop-blur-md shrink-0 shadow-inner">
                        <Sparkles className="w-7 h-7 text-rose-200 animate-pulse" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-200 block">
                            LECTURA AUTOMÁTICA OCR CON INTELIGENCIA ARTIFICIAL
                        </span>
                        <h2 className="text-base sm:text-lg font-black text-white">
                            Escanear Tarjeta Física Guthrie con IA (Lectura Automática OCR)
                        </h2>
                        <p className="text-xs text-rose-100 font-medium mt-0.5">
                            Suba la fotografía del formato físico o utilice la simulación para autocompletar el 100% de la tarjeta de forma instantánea.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto shrink-0">
                    <button
                        type="button"
                        onClick={handlePopulateAIData}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-white text-[#9D2449] hover:bg-rose-50 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-white"
                    >
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>⚡ Rellenar Datos de Prueba por IA</span>
                    </button>

                    <button
                        type="button"
                        onClick={onOpenAIScan || handlePopulateAIData}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold border border-white/30 backdrop-blur-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                        <Camera className="w-4 h-4 text-rose-200" />
                        <span>📷 Subir Foto de Tarjeta Guthrie</span>
                    </button>
                </div>
            </div>

            {/* TOAST DE ÉXITO DE IA */}
            {aiToast && (
                <div className="no-print bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 flex items-center gap-3 text-xs font-bold text-emerald-900 shadow-md animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="flex-1 font-extrabold">{aiToast}</p>
                </div>
            )}

            {/* BANNER DE ÉXITO AL GUARDAR */}
            {savedNotification && (
                <div className="no-print bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 flex items-center justify-between shadow-md text-emerald-900 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                            <p className="font-extrabold text-sm">¡Tarjeta de Tamiz Guthrie Guardada Exitosamente!</p>
                            <p className="text-xs text-emerald-700 font-medium">
                                Folio <span className="font-mono font-bold">{formData.folio}</span> ingresado al padrón de la Jurisdicción Sanitaria No. 2.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Imprimir Comprobante</span>
                    </button>
                </div>
            )}

            {/* FORMULARIO OFICIAL Y CONTENEDOR IMPRIMIBLE EN 1 PÁGINA */}
            <form onSubmit={handleSubmit} className="printable-guthrie-card space-y-6">

                {/* A. ENCABEZADO DE LA TARJETA GUTHRIE */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="print-section-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200 no-print">
                                <Hash className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#9D2449]">
                                    SECCIÓN A • OFICIAL SSO OAXACA
                                </span>
                                <h3 className="text-base sm:text-lg font-black text-slate-900">
                                    Encabezado de la Tarjeta Guthrie & Unidad Médica
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-dense-grid">

                        {/* Folio Destacado en Rojo Monospaciado */}
                        <div>
                            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span>Folio de Tarjeta * (Identificador Único)</span>
                                <span className="text-[10px] font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                    FORMATO GUTHRIE
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={formData.folio}
                                    onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                                    placeholder="Ej. 5458347"
                                    className="w-full px-4 py-3 bg-rose-50/60 border-2 border-rose-300 rounded-2xl font-mono text-xl font-black text-[#9D2449] tracking-wider focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all shadow-inner"
                                />
                                <span className="absolute right-4 top-3.5 text-xs font-bold text-rose-400 uppercase font-mono no-print">
                                    SSO-TMZ
                                </span>
                            </div>
                        </div>

                        {/* Unidad Médica de Toma con Catálogo de Unidades Médicas CLUES */}
                        <div>
                            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                                Unidad Médica de Toma * (Catálogo de Unidades Médicas CLUES)
                            </label>
                            <select
                                required
                                value={formData.unidadMedica}
                                onChange={handleCluesChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-extrabold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                            >
                                {catalogCLUES.map((u) => (
                                    <option key={u.clues} value={`${u.clues} - ${u.nombre}`}>
                                        {u.clues} - {u.nombre}
                                    </option>
                                ))}
                            </select>

                            {/* Badges de Verificación CLUES */}
                            <div className="flex flex-wrap gap-2 mt-2.5">
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-emerald-600 no-print" /> CLUES: {formData.clues}
                                </span>
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold">
                                    Jurisdicción: {formData.jurisdiccion}
                                </span>
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold">
                                    Estado: {formData.estado}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* B. DATOS DE LA MUESTRA / RESPONSABLE */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="print-section-header flex items-center gap-3 border-b border-slate-200 pb-3">
                        <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200 no-print">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#9D2449]">
                                SECCIÓN B • PERSONAL OPERATIVO
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                Datos de la Muestra y Responsable de Toma
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-dense-grid">

                        <div>
                            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                                Responsable de la toma (Nombre y Apellidos) *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.responsableToma}
                                onChange={(e) => setFormData({ ...formData, responsableToma: e.target.value })}
                                placeholder="Ej. Enf. María del Carmen Reyes"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                                Técnica / Tipo de Muestra *
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: '1A_TALON', label: '1ª Muestra Talón' },
                                    { id: '2A_TALON', label: '2ª Muestra' },
                                    { id: 'REMUESTRA_SOSPECHA', label: 'Re-muestra / Sospecha' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, tecnicaToma: opt.id as any })}
                                        className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all border text-center cursor-pointer ${formData.tecnicaToma === opt.id
                                            ? 'bg-[#9D2449] text-white border-[#9D2449] shadow-sm'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* C. DATOS DEL RECIÉN NACIDO (INCLUYE NOMBRE Y APELLIDOS DEL RN) */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="print-section-header flex items-center gap-3 border-b border-slate-200 pb-3">
                        <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200 no-print">
                            <Baby className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#9D2449]">
                                SECCIÓN C • FICHA DEL NEONATO
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                Datos del Recién Nacido (RN)
                            </h3>
                        </div>
                    </div>

                    {/* CAMPOS DE NOMBRE Y APELLIDOS DEL RECIÉN NACIDO */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print-dense-grid">
                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1">Nombre(s) del RN *</label>
                            <input
                                type="text"
                                required
                                value={formData.nombreRN}
                                onChange={(e) => setFormData({ ...formData, nombreRN: e.target.value })}
                                placeholder="Ej. RN (Bebé de María)"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1">Apellido Paterno RN *</label>
                            <input
                                type="text"
                                required
                                value={formData.apellidoPaternoRN}
                                onChange={(e) => setFormData({ ...formData, apellidoPaternoRN: e.target.value })}
                                placeholder="Ej. Gómez"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1">Apellido Materno RN *</label>
                            <input
                                type="text"
                                required
                                value={formData.apellidoMaternoRN}
                                onChange={(e) => setFormData({ ...formData, apellidoMaternoRN: e.target.value })}
                                placeholder="Ej. Santiz"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 print-dense-grid">

                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#9D2449] no-print" /> Fecha Nacimiento *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.fechaNacimiento}
                                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#9D2449] no-print" /> Hora Nacimiento *
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.horaNacimiento}
                                onChange={(e) => setFormData({ ...formData, horaNacimiento: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#9D2449] no-print" /> Fecha Toma Muestra *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.fechaToma}
                                onChange={(e) => setFormData({ ...formData, fechaToma: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#9D2449] no-print" /> Hora Toma Muestra *
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.horaToma}
                                onChange={(e) => setFormData({ ...formData, horaToma: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 print-dense-grid">

                        <div>
                            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Sexo *</label>
                            <select
                                value={formData.sexo}
                                onChange={(e) => setFormData({ ...formData, sexo: e.target.value as any })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            >
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMENINO">Femenino</option>
                                <option value="AMBIGUEDAD">Ambigüedad Genital</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Edad Gestacional *</label>
                            <select
                                value={formData.edadGestacional}
                                onChange={(e) => setFormData({ ...formData, edadGestacional: e.target.value as any })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            >
                                <option value="PRETERMINO">Pre-término (&lt;37 SDG)</option>
                                <option value="TERMINO">Término (37 - 41.6 SDG)</option>
                                <option value="POSTERMINO">Post-término (&gt;42 SDG)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Producto *</label>
                            <select
                                value={formData.producto}
                                onChange={(e) => setFormData({ ...formData, producto: e.target.value as any })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            >
                                <option value="UNICO">Único</option>
                                <option value="GEMELAR_MULTIPLE">Gemelar / Múltiple</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[11px] font-black text-slate-800 mb-1">Peso (g) *</label>
                                <input
                                    type="number"
                                    required
                                    min={500}
                                    max={7000}
                                    value={formData.pesoGramos}
                                    onChange={(e) => setFormData({ ...formData, pesoGramos: e.target.value })}
                                    placeholder="3200"
                                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-800 mb-1">Talla (cm) *</label>
                                <input
                                    type="number"
                                    required
                                    min={30}
                                    max={70}
                                    value={formData.tallaCm}
                                    onChange={(e) => setFormData({ ...formData, tallaCm: e.target.value })}
                                    placeholder="50"
                                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 print-dense-grid">

                        <div>
                            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Condición del RN *</label>
                            <select
                                value={formData.condicionesRN}
                                onChange={(e) => setFormData({ ...formData, condicionesRN: e.target.value as any })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            >
                                <option value="SANO">RN Sano</option>
                                <option value="ENFERMO">RN Enfermo / Hospitalizado</option>
                                <option value="UCIN">Cuidados Intensivos Neonatales (UCIN)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Alimentación *</label>
                            <select
                                value={formData.alimentacion}
                                onChange={(e) => setFormData({ ...formData, alimentacion: e.target.value as any })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            >
                                <option value="LACTANCIA_MATERNA">SLA - Leche Materna Exclusiva</option>
                                <option value="FORMULA">Fórmula Láctea</option>
                                <option value="MIXTA">Alimentación Mixta</option>
                                <option value="AYUNO">Ayuno / Parenteral</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Malformaciones Congénitas *</label>
                            <div className="flex items-center gap-3">
                                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="malformaciones"
                                        checked={formData.malformaciones === 'NO'}
                                        onChange={() => setFormData({ ...formData, malformaciones: 'NO' })}
                                        className="accent-[#9D2449]"
                                    />
                                    No
                                </label>
                                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="malformaciones"
                                        checked={formData.malformaciones === 'SI'}
                                        onChange={() => setFormData({ ...formData, malformaciones: 'SI' })}
                                        className="accent-[#9D2449]"
                                    />
                                    Sí
                                </label>
                            </div>
                        </div>

                    </div>
                </div>

                {/* D. DATOS DE LA MADRE */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="print-section-header flex items-center gap-3 border-b border-slate-200 pb-3">
                        <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200 no-print">
                            <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#9D2449]">
                                SECCIÓN D • FICHA MATERNA
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                Datos de la Madre o Tutora
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print-dense-grid">
                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1">Nombre(s) *</label>
                            <input
                                type="text"
                                required
                                value={formData.nombreMadre}
                                onChange={(e) => setFormData({ ...formData, nombreMadre: e.target.value })}
                                placeholder="Ej. María"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1">Apellido Paterno *</label>
                            <input
                                type="text"
                                required
                                value={formData.apellidoPaternoMadre}
                                onChange={(e) => setFormData({ ...formData, apellidoPaternoMadre: e.target.value })}
                                placeholder="Ej. Gómez"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1">Apellido Materno *</label>
                            <input
                                type="text"
                                required
                                value={formData.apellidoMaternoMadre}
                                onChange={(e) => setFormData({ ...formData, apellidoMaternoMadre: e.target.value })}
                                placeholder="Ej. Santiz"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print-dense-grid">

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-black text-slate-800 mb-1 flex items-center justify-between">
                                <span>CURP de la Madre (18 Caracteres)</span>
                                <button
                                    type="button"
                                    onClick={generateTestCurp}
                                    className="text-[10px] font-bold text-[#9D2449] hover:underline cursor-pointer no-print"
                                >
                                    + Autogenerar CURP de Prueba
                                </button>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    maxLength={18}
                                    value={formData.curpMadre}
                                    onChange={(e) => setFormData({ ...formData, curpMadre: e.target.value.toUpperCase() })}
                                    placeholder="GOSM980412MOCMNN08"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs text-slate-900 uppercase focus:outline-none focus:border-[#9D2449]"
                                />
                                <span className={`absolute right-3 top-2.5 text-[10px] font-mono font-bold no-print ${formData.curpMadre.length === 18 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {formData.curpMadre.length}/18
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-[#9D2449] no-print" /> Teléfono Celular *
                            </label>
                            <input
                                type="tel"
                                required
                                maxLength={10}
                                value={formData.telefonoCelular}
                                onChange={(e) => setFormData({ ...formData, telefonoCelular: e.target.value })}
                                placeholder="9711234567"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print-dense-grid">
                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1">Calle y Número</label>
                            <input
                                type="text"
                                value={formData.calleNumero}
                                onChange={(e) => setFormData({ ...formData, calleNumero: e.target.value })}
                                placeholder="Av. Hidalgo #45"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1">Colonia / Localidad</label>
                            <input
                                type="text"
                                value={formData.coloniaLocalidad}
                                onChange={(e) => setFormData({ ...formData, coloniaLocalidad: e.target.value })}
                                placeholder="Barrio Cheguigo"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-800 mb-1">Municipio (Texto Libre) *</label>
                            <input
                                type="text"
                                required
                                value={formData.municipioMadre}
                                onChange={(e) => setFormData({ ...formData, municipioMadre: e.target.value })}
                                placeholder="Juchitán de Zaragoza"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 print-dense-grid">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[11px] font-black text-slate-800 mb-1">Edad Madre *</label>
                                <input
                                    type="number"
                                    required
                                    min={12}
                                    max={60}
                                    value={formData.edadMadre}
                                    onChange={(e) => setFormData({ ...formData, edadMadre: e.target.value })}
                                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-800 mb-1">Gestas *</label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    max={15}
                                    value={formData.gestas}
                                    onChange={(e) => setFormData({ ...formData, gestas: e.target.value })}
                                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                                Antecedente Enfermedad Tiroidea / Metabólica *
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="tiroidea"
                                        checked={formData.enfermedadTiroideaMetabolica === 'NO'}
                                        onChange={() => setFormData({ ...formData, enfermedadTiroideaMetabolica: 'NO' })}
                                        className="accent-[#9D2449]"
                                    />
                                    Sin Antecedentes Conocidos
                                </label>
                                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="tiroidea"
                                        checked={formData.enfermedadTiroideaMetabolica === 'SI'}
                                        onChange={() => setFormData({ ...formData, enfermedadTiroideaMetabolica: 'SI' })}
                                        className="accent-[#9D2449]"
                                    />
                                    Sí (Hipotiroidismo / Diabetes / Otro)
                                </label>
                            </div>
                        </div>
                    </div>

                </div>

                {/* BOTONES DE ACCIÓN PRINCIPALES (OCULTOS EN IMPRESIÓN) */}
                <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-100 p-4 rounded-3xl border border-slate-200 shadow-sm">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Limpiar Campos</span>
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                            <Printer className="w-4 h-4 text-slate-600" />
                            <span>Imprimir Vista Previa (1 Hoja)</span>
                        </button>

                        <button
                            type="submit"
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-sm font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
                        >
                            <CheckCircle2 className="w-5 h-5 text-rose-200" />
                            <span>Guardar y Registrar Tarjeta Guthrie</span>
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};
