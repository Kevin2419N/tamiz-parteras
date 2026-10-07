import React, { useState, useEffect } from 'react';
import {
    Building2,
    Baby,
    HeartPulse,
    CheckCircle2,
    Printer,
    RotateCcw,
    Sparkles,
    Camera,
    FileText,
    FlaskConical,
    Clock,
    ClipboardList
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
        // Sección A: Encabezado y Muestra
        folio: '5458349',
        unidadMedica: 'OCIMB000683 - Centro de Salud Urbano Juchitán',
        clues: 'OCIMB000683',
        jurisdiccion: '02 Istmo',
        estado: 'Oaxaca',
        nombreResponsableToma: 'María del Carmen',
        apellidoPaternoResponsableToma: 'Reyes',
        apellidoMaternoResponsableToma: 'Alvarez',
        responsableToma: 'Enf. María del Carmen Reyes Alvarez',
        tecnicaToma: '1A_MUESTRA',
        sospechosoEspecificar: '',
        calidadMuestraLab: 'ADECUADA',
        responsableLaboratorio: 'Q.F.B. Javier Hernández López',

        // Sección B: Datos del Recién Nacido
        nombreRN: 'RN (Bebé de María)',
        apellidoPaternoRN: 'Gómez',
        apellidoMaternoRN: 'Santiz',
        fechaNacimiento: new Date().toISOString().split('T')[0],
        horaNacimiento: '08:00',
        fechaToma: new Date().toISOString().split('T')[0],
        horaToma: '10:30',
        sexo: 'MASCULINO',
        edadGestacional: 'TERMINO_37_41',
        producto: 'UNICO',
        numeroGemelo: '',
        pesoGramos: '3200',
        tallaCm: '50',
        malformaciones: 'NO',
        malformacionesDetalle: '',
        condicionesRN: 'SANO',
        alimentacion: 'LECHE_MATERNA',

        // Sección C: Datos de la Madre
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
        codigoPostalMadre: '70000',
        telefonoFijo: '',
        telefonoCelular: '',
        emailMadre: '',
        edadMadre: '26',
        gestas: '1',
        enfermedadTiroideaMetabolica: 'NO',
        enfermedadTiroideaDetalle: '',
        observacionesMuestra: 'Muestra tomada en talón izquierdo sin complicaciones.',
    };

    const sampleAIData: GuthrieFormData = {
        folio: '5458347',
        unidadMedica: 'OCIMB000683 - Centro de Salud Urbano Juchitán',
        clues: 'OCIMB000683',
        jurisdiccion: '02 Istmo',
        estado: 'Oaxaca',
        nombreResponsableToma: 'María del Carmen',
        apellidoPaternoResponsableToma: 'Reyes',
        apellidoMaternoResponsableToma: 'Alvarez',
        responsableToma: 'Enf. María del Carmen Reyes Alvarez',
        tecnicaToma: '1A_MUESTRA',
        sospechosoEspecificar: '',
        calidadMuestraLab: 'ADECUADA',
        responsableLaboratorio: 'Q.F.B. Javier Hernández López',

        nombreRN: 'Mateo',
        apellidoPaternoRN: 'Gómez',
        apellidoMaternoRN: 'Santiz',
        fechaNacimiento: '2026-09-05',
        horaNacimiento: '08:30',
        fechaToma: '2026-09-08',
        horaToma: '10:00',
        sexo: 'MASCULINO',
        edadGestacional: 'TERMINO_37_41',
        producto: 'UNICO',
        numeroGemelo: '',
        pesoGramos: '3250',
        tallaCm: '50',
        malformaciones: 'NO',
        malformacionesDetalle: '',
        condicionesRN: 'SANO',
        alimentacion: 'LECHE_MATERNA',

        nombreMadre: 'María',
        apellidoPaternoMadre: 'Gómez',
        apellidoMaternoMadre: 'Santiz',
        curpMadre: 'GOSM980412MOCMNN08',
        calle: 'Av. Miguel Hidalgo',
        numExterior: '45',
        numInterior: 'A',
        coloniaLocalidad: 'Centro',
        municipioMadre: 'Juchitán de Zaragoza',
        estadoMadre: 'Oaxaca',
        codigoPostalMadre: '70000',
        telefonoFijo: '9717120987',
        telefonoCelular: '9711234567',
        emailMadre: 'maria.gomez@gmail.com',
        edadMadre: '28',
        gestas: '2',
        enfermedadTiroideaMetabolica: 'NO',
        enfermedadTiroideaDetalle: '',
        observacionesMuestra: 'Muestra tomada en talón izquierdo sin complicaciones. Impregnación de papel filtro uniforme.',
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
        setAiToast('¡100% de los campos de la tarjeta física Guthrie completados exitosamente por IA!');
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

            {/* REGLAS DE IMPRESIÓN CSS PARA 1 PÁGINA A4/CARTA */}
            <style>{`
                @media print {
                    @page {
                        size: portrait;
                        margin: 4mm;
                    }
                    body {
                        background: #fff !important;
                        color: #000 !important;
                        font-size: 8.5px !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .printable-guthrie-card {
                        border: 2px solid #9D2449 !important;
                        border-radius: 6px !important;
                        padding: 8px !important;
                        box-shadow: none !important;
                        background: white !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    .printable-guthrie-card input,
                    .printable-guthrie-card select,
                    .printable-guthrie-card textarea {
                        border: 1px solid #475569 !important;
                        background: #fff !important;
                        color: #000 !important;
                        padding: 2px 4px !important;
                        font-size: 8.5px !important;
                        height: auto !important;
                    }
                    .print-2col-layout {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 8px !important;
                    }
                }
            `}</style>

            {/* BARRA SUPERIOR DE ACCIÓN OCR / IA */}
            <div className="no-print bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-[#9D2449] tracking-wider block">
                            SECRETARÍA DE SALUD DE OAXACA • SERVICIOS DE SALUD DE OAXACA
                        </span>
                        <h2 className="text-base sm:text-lg font-black text-slate-900">
                            Cédula Digital de Tamiz Neonatal (Formato Papel Filtro SSO)
                        </h2>
                    </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={onOpenAIScan || handlePopulateAIData}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                        <Camera className="w-4 h-4 text-[#9D2449]" />
                        <span>Subir Foto de Tarjeta (OCR)</span>
                    </button>

                    <button
                        type="button"
                        onClick={handlePopulateAIData}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                        <Sparkles className="w-4 h-4 text-rose-200" />
                        <span>Rellenar por IA (Datos Prueba)</span>
                    </button>
                </div>
            </div>

            {/* TOAST DE IA */}
            {aiToast && (
                <div className="no-print bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 flex items-center gap-3 text-xs font-bold text-emerald-900 shadow-md">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="flex-1 font-extrabold">{aiToast}</p>
                </div>
            )}

            {/* TOAST AL GUARDAR */}
            {savedNotification && (
                <div className="no-print bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 flex items-center justify-between shadow-md text-emerald-900">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                            <p className="font-extrabold text-sm">¡Tarjeta de Tamiz Guthrie Guardada Exitosamente!</p>
                            <p className="text-xs text-emerald-700 font-medium">
                                Folio <span className="font-mono font-bold">{formData.folio}</span> registrado en el padrón de SSO Oaxaca.
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

            {/* FORMULARIO OFICIAL COMPLETO MAQUETADO EN 2 COLUMNAS */}
            <form onSubmit={handleSubmit} className="printable-guthrie-card space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">

                {/* HEADER CON FOLIO DE TARJETA RED ROJO */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[#9D2449] pb-4">
                    <div>
                        <span className="text-[10px] font-black uppercase text-[#9D2449] tracking-wider block">
                            SECRETARÍA DE SALUD • SISTEMA NACIONAL DE SALUD • OAXACA
                        </span>
                        <h2 className="text-lg font-black text-slate-900">
                            Cédula Oficial de Muestra Neonatal — SSO Oaxaca
                        </h2>
                    </div>

                    <div className="bg-rose-50 border-2 border-rose-300 px-4 py-2 rounded-2xl text-right">
                        <span className="text-[10px] font-black uppercase text-rose-700 block">FOLIO TARJETA GUTHRIE</span>
                        <span className="font-mono text-xl text-rose-600 font-black tracking-wider">
                            {formData.folio || '5458347'}
                        </span>
                    </div>
                </div>

                {/* MAQUETACIÓN EN 2 COLUMNAS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-2col-layout">

                    {/* COLUMNA IZQUIERDA: SECCIONES A Y B (UNIDAD, TÉCNICA Y RECIÉN NACIDO) */}
                    <div className="space-y-6">

                        {/* SECCIÓN A: UNIDAD MÉDICA Y MUESTRA */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-[#9D2449]">
                                <Building2 className="w-4 h-4" />
                                <h3 className="text-xs font-black uppercase tracking-wider">SECCIÓN A • Unidad Médica (CLUES) y Muestra</h3>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Folio de Tarjeta *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.folio}
                                        onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono text-sm font-black text-rose-600 focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                                        Unidad Médica * (Catálogo de Unidades Médicas CLUES)
                                    </label>
                                    <select
                                        required
                                        value={formData.unidadMedica}
                                        onChange={handleCluesChange}
                                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    >
                                        {catalogCLUES.map((u) => (
                                            <option key={u.clues} value={`${u.clues} - ${u.nombre}`}>
                                                {u.clues} - {u.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                                        <span className="text-slate-500 block">Jurisdicción:</span>
                                        <span className="text-slate-900 font-black">{formData.jurisdiccion}</span>
                                    </div>
                                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                                        <span className="text-slate-500 block">Estado:</span>
                                        <span className="text-slate-900 font-black">{formData.estado}</span>
                                    </div>
                                </div>

                                {/* DATOS DEL RESPONSABLE DE LA TOMA (NOMBRE, AP. PATERNO, AP. MATERNO) */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Responsable de la Toma (Nombre y Apellidos) *</label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nombre(s)"
                                            value={formData.nombreResponsableToma}
                                            onChange={(e) => setFormData({ ...formData, nombreResponsableToma: e.target.value })}
                                            className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                                        />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ap. Paterno"
                                            value={formData.apellidoPaternoResponsableToma}
                                            onChange={(e) => setFormData({ ...formData, apellidoPaternoResponsableToma: e.target.value })}
                                            className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                                        />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ap. Materno"
                                            value={formData.apellidoMaternoResponsableToma}
                                            onChange={(e) => setFormData({ ...formData, apellidoMaternoResponsableToma: e.target.value })}
                                            className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                                        />
                                    </div>
                                </div>

                                {/* TÉCNICA DE TOMA (RADIO/SELECT ESPECIFICATORIO) */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Técnica de Toma *</label>
                                    <select
                                        value={formData.tecnicaToma}
                                        onChange={(e) => setFormData({ ...formData, tecnicaToma: e.target.value as any })}
                                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                                    >
                                        <option value="1A_MUESTRA">1a Muestra</option>
                                        <option value="2A_PREMATUREZ">2a Muestra por Prematurez</option>
                                        <option value="2A_INADECUADA">2a Muestra por Inadecuada</option>
                                        <option value="2A_SOSPECHOSO">2a Muestra por ser Sospechoso a:</option>
                                    </select>
                                    {formData.tecnicaToma === '2A_SOSPECHOSO' && (
                                        <input
                                            type="text"
                                            required
                                            placeholder="Especifique patología sospechosa..."
                                            value={formData.sospechosoEspecificar}
                                            onChange={(e) => setFormData({ ...formData, sospechosoEspecificar: e.target.value })}
                                            className="w-full mt-1.5 px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-rose-800 font-bold"
                                        />
                                    )}
                                </div>

                                {/* REPORTE DE LABORATORIO */}
                                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                                    <span className="text-[10px] font-bold text-[#9D2449] flex items-center gap-1">
                                        <FlaskConical className="w-3.5 h-3.5" /> Reporte de Laboratorio:
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <label className="inline-flex items-center gap-1 font-bold text-[10px]">
                                            <input
                                                type="radio"
                                                name="calidadLab"
                                                checked={formData.calidadMuestraLab === 'ADECUADA'}
                                                onChange={() => setFormData({ ...formData, calidadMuestraLab: 'ADECUADA' })}
                                                className="accent-[#9D2449]"
                                            />
                                            Calidad: Adecuada
                                        </label>
                                        <label className="inline-flex items-center gap-1 font-bold text-[10px]">
                                            <input
                                                type="radio"
                                                name="calidadLab"
                                                checked={formData.calidadMuestraLab === 'INADECUADA'}
                                                onChange={() => setFormData({ ...formData, calidadMuestraLab: 'INADECUADA' })}
                                                className="accent-[#9D2449]"
                                            />
                                            Calidad: Inadecuada
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Responsable del Laboratorio (Q.F.B.)"
                                        value={formData.responsableLaboratorio}
                                        onChange={(e) => setFormData({ ...formData, responsableLaboratorio: e.target.value })}
                                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* SECCIÓN B: DATOS DEL RECIÉN NACIDO */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-[#9D2449]">
                                <Baby className="w-4 h-4" />
                                <h3 className="text-xs font-black uppercase tracking-wider">SECCIÓN B • Datos del Recién Nacido (RN)</h3>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-3 gap-1.5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Nombre(s) RN *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nombreRN}
                                            onChange={(e) => setFormData({ ...formData, nombreRN: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Ap. Paterno *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.apellidoPaternoRN}
                                            onChange={(e) => setFormData({ ...formData, apellidoPaternoRN: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Ap. Materno *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.apellidoMaternoRN}
                                            onChange={(e) => setFormData({ ...formData, apellidoMaternoRN: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-700 mb-1">Fecha / Hora Nacimiento *</label>
                                        <div className="flex gap-1">
                                            <input
                                                type="date"
                                                required
                                                value={formData.fechaNacimiento}
                                                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                                                className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded-lg text-[10px]"
                                            />
                                            <input
                                                type="time"
                                                required
                                                value={formData.horaNacimiento}
                                                onChange={(e) => setFormData({ ...formData, horaNacimiento: e.target.value })}
                                                className="w-20 px-1 py-1 bg-white border border-slate-300 rounded-lg text-[10px]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-700 mb-1">Fecha / Hora Toma Muestra *</label>
                                        <div className="flex gap-1">
                                            <input
                                                type="date"
                                                required
                                                value={formData.fechaToma}
                                                onChange={(e) => setFormData({ ...formData, fechaToma: e.target.value })}
                                                className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded-lg text-[10px]"
                                            />
                                            <input
                                                type="time"
                                                required
                                                value={formData.horaToma}
                                                onChange={(e) => setFormData({ ...formData, horaToma: e.target.value })}
                                                className="w-20 px-1 py-1 bg-white border border-slate-300 rounded-lg text-[10px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Sexo *</label>
                                        <select
                                            value={formData.sexo}
                                            onChange={(e) => setFormData({ ...formData, sexo: e.target.value as any })}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                        >
                                            <option value="MASCULINO">Masculino</option>
                                            <option value="FEMENINO">Femenino</option>
                                            <option value="AMBIGUEDAD">Ambigüedad de genitales</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Peso (g) *</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.pesoGramos}
                                            onChange={(e) => setFormData({ ...formData, pesoGramos: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Talla (cm) *</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.tallaCm}
                                            onChange={(e) => setFormData({ ...formData, tallaCm: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                        />
                                    </div>
                                </div>

                                {/* EDAD GESTACIONAL (SDG) */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Edad Gestacional *</label>
                                    <select
                                        value={formData.edadGestacional}
                                        onChange={(e) => setFormData({ ...formData, edadGestacional: e.target.value as any })}
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                    >
                                        <option value="PRETERMINO_MENOR_37">1. Pre-término &lt; 37 SDG</option>
                                        <option value="TERMINO_37_41">2. Término 37-41.6 SDG</option>
                                        <option value="POSTERMINO_MAYOR_42">3. Post-término &gt; 42 SDG</option>
                                    </select>
                                </div>

                                {/* PRODUCTO (GEMELARIDAD) */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Producto *</label>
                                        <select
                                            value={formData.producto}
                                            onChange={(e) => setFormData({ ...formData, producto: e.target.value as any })}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                        >
                                            <option value="UNICO">1. Único</option>
                                            <option value="GEMELAR">2. Multiple / Gemelar</option>
                                        </select>
                                    </div>
                                    {formData.producto === 'GEMELAR' && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">No. de Gemelo *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. Gemelo 1"
                                                value={formData.numeroGemelo}
                                                onChange={(e) => setFormData({ ...formData, numeroGemelo: e.target.value })}
                                                className="w-full px-2 py-1.5 bg-white border border-rose-300 rounded-lg font-bold"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* MALFORMACIONES CONGÉNITAS */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Malformaciones Congénitas *</label>
                                    <div className="flex items-center gap-3">
                                        <label className="inline-flex items-center gap-1 font-bold text-[10px]">
                                            <input
                                                type="radio"
                                                name="malform"
                                                checked={formData.malformaciones === 'NO'}
                                                onChange={() => setFormData({ ...formData, malformaciones: 'NO' })}
                                                className="accent-[#9D2449]"
                                            />
                                            1. No
                                        </label>
                                        <label className="inline-flex items-center gap-1 font-bold text-[10px]">
                                            <input
                                                type="radio"
                                                name="malform"
                                                checked={formData.malformaciones === 'SI'}
                                                onChange={() => setFormData({ ...formData, malformaciones: 'SI' })}
                                                className="accent-[#9D2449]"
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
                                                className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded-lg text-[10px]"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* CONDICIONES RN */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Condiciones del RN al Tomar la Muestra *</label>
                                    <select
                                        value={formData.condicionesRN}
                                        onChange={(e) => setFormData({ ...formData, condicionesRN: e.target.value as any })}
                                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                    >
                                        <option value="SANO">1. Sano</option>
                                        <option value="ENFERMO">2. Enfermo</option>
                                        <option value="UCIN">3. Cuidados Intensivos (UCIN)</option>
                                    </select>
                                </div>

                                {/* ALIMENTACIÓN RN */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Alimentación del RN *</label>
                                    <select
                                        value={formData.alimentacion}
                                        onChange={(e) => setFormData({ ...formData, alimentacion: e.target.value as any })}
                                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                    >
                                        <option value="LECHE_MATERNA">1. Leche Materna</option>
                                        <option value="FORMULA">2. Fórmula Láctea</option>
                                        <option value="MIXTA">3. Mixta</option>
                                        <option value="AYUNO">4. Ayuno</option>
                                    </select>
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* COLUMNA DERECHA: SECCIÓN C (DATOS DE LA MADRE O TUTORA) Y SECCIÓN D (OBSERVACIONES) */}
                    <div className="space-y-6">

                        {/* SECCIÓN C: DATOS DE LA MADRE O TUTORA */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                            <div>
                                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-[#9D2449] mb-4">
                                    <HeartPulse className="w-4 h-4" />
                                    <h3 className="text-xs font-black uppercase tracking-wider">SECCIÓN C • Datos de la Madre o Tutora</h3>
                                </div>

                                <div className="space-y-3.5 text-xs">

                                    {/* NOMBRES Y APELLIDOS MADRE */}
                                    <div className="grid grid-cols-3 gap-1.5">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">Nombre(s) *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.nombreMadre}
                                                onChange={(e) => setFormData({ ...formData, nombreMadre: e.target.value })}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">Ap. Paterno *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.apellidoPaternoMadre}
                                                onChange={(e) => setFormData({ ...formData, apellidoPaternoMadre: e.target.value })}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">Ap. Materno *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.apellidoMaternoMadre}
                                                onChange={(e) => setFormData({ ...formData, apellidoMaternoMadre: e.target.value })}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                            />
                                        </div>
                                    </div>

                                    {/* CURP MADRE */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-[10px] font-bold text-slate-700">CURP Madre (18 Caracteres)</label>
                                            <button
                                                type="button"
                                                onClick={generateTestCurp}
                                                className="text-[9px] font-bold text-[#9D2449] hover:underline no-print cursor-pointer"
                                            >
                                                + Generar CURP
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={18}
                                            value={formData.curpMadre}
                                            onChange={(e) => setFormData({ ...formData, curpMadre: e.target.value.toUpperCase() })}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs uppercase"
                                        />
                                    </div>

                                    {/* DOMICILIO DETALLADO: CALLE, EXT, INT */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Calle y Números *</label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Calle / Avenida"
                                                value={formData.calle}
                                                onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                                                className="col-span-2 px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                                            />
                                            <div className="flex gap-1">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Ext"
                                                    value={formData.numExterior}
                                                    onChange={(e) => setFormData({ ...formData, numExterior: e.target.value })}
                                                    className="w-1/2 px-1 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-center"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Int"
                                                    value={formData.numInterior}
                                                    onChange={(e) => setFormData({ ...formData, numInterior: e.target.value })}
                                                    className="w-1/2 px-1 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* COLONIA, MUNICIPIO LIBRE, C.P. */}
                                    <div className="grid grid-cols-3 gap-1.5">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">Colonia / Localidad *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.coloniaLocalidad}
                                                onChange={(e) => setFormData({ ...formData, coloniaLocalidad: e.target.value })}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">Municipio / Delegación *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.municipioMadre}
                                                onChange={(e) => setFormData({ ...formData, municipioMadre: e.target.value })}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">Código Postal *</label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={5}
                                                value={formData.codigoPostalMadre}
                                                onChange={(e) => setFormData({ ...formData, codigoPostalMadre: e.target.value })}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-center"
                                            />
                                        </div>
                                    </div>

                                    {/* TELÉFONO FIJO, CELULAR, EMAIL */}
                                    <div className="grid grid-cols-3 gap-1.5">
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-700 mb-1">Tel. Fijo</label>
                                            <input
                                                type="tel"
                                                value={formData.telefonoFijo}
                                                onChange={(e) => setFormData({ ...formData, telefonoFijo: e.target.value })}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-700 mb-1">Tel. Celular *</label>
                                            <input
                                                type="tel"
                                                required
                                                maxLength={10}
                                                value={formData.telefonoCelular}
                                                onChange={(e) => setFormData({ ...formData, telefonoCelular: e.target.value })}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-700 mb-1">E-mail Madre</label>
                                            <input
                                                type="email"
                                                value={formData.emailMadre}
                                                onChange={(e) => setFormData({ ...formData, emailMadre: e.target.value })}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* ANTECEDENTES: EDAD, GESTAS, ENFERMEDAD TIROIDEA */}
                                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">Edad Madre *</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.edadMadre}
                                                onChange={(e) => setFormData({ ...formData, edadMadre: e.target.value })}
                                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">Gestas (No.) *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. II"
                                                value={formData.gestas}
                                                onChange={(e) => setFormData({ ...formData, gestas: e.target.value })}
                                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-center"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Enfermedad Tiroidea / Metabólica *</label>
                                        <div className="flex items-center gap-4">
                                            <label className="inline-flex items-center gap-1 font-bold text-[10px]">
                                                <input
                                                    type="radio"
                                                    name="tiroidea"
                                                    checked={formData.enfermedadTiroideaMetabolica === 'NO'}
                                                    onChange={() => setFormData({ ...formData, enfermedadTiroideaMetabolica: 'NO' })}
                                                    className="accent-[#9D2449]"
                                                />
                                                1. No
                                            </label>
                                            <label className="inline-flex items-center gap-1 font-bold text-[10px]">
                                                <input
                                                    type="radio"
                                                    name="tiroidea"
                                                    checked={formData.enfermedadTiroideaMetabolica === 'SI'}
                                                    onChange={() => setFormData({ ...formData, enfermedadTiroideaMetabolica: 'SI' })}
                                                    className="accent-[#9D2449]"
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
                                                    className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded-lg text-[10px]"
                                                />
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN D: OBSERVACIONES Y CONTROL DE CALIDAD DE TOMA */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-[#9D2449]">
                                <ClipboardList className="w-4 h-4" />
                                <h3 className="text-xs font-black uppercase tracking-wider">SECCIÓN D • Observaciones / Control de Calidad de Toma</h3>
                            </div>

                            <div className="space-y-3.5 text-xs">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                                        Observaciones de la Muestra / Notas del Capturista
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Ej: Muestra tomada en talón izquierdo sin complicaciones. Impregnación de papel filtro uniforme."
                                        value={formData.observacionesMuestra || ''}
                                        onChange={(e) => setFormData({ ...formData, observacionesMuestra: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-[#9D2449] resize-none text-xs"
                                    />
                                </div>

                                {/* RECUADRO DE AVISO INSTITUCIONAL LÍMITE DE ENVÍO (<72 HRS) */}
                                <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl flex items-start gap-2.5 text-slate-700 shadow-sm">
                                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                                    <div className="text-[11px] space-y-0.5">
                                        <span className="font-extrabold text-amber-900 block uppercase tracking-tight text-[10px]">
                                            AVISO INSTITUCIONAL • TIEMPO LÍMITE DE ENVÍO
                                        </span>
                                        <p className="font-medium text-slate-700 leading-tight">
                                            Las muestras en papel filtro deben remitirse al LESP en un periodo <strong className="text-amber-900 font-extrabold">no mayor a 72 horas</strong> posterior a la toma para garantizar la viabilidad diagnóstica.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* BOTONES PRINCIPALES DE IMPRESIÓN Y GUARDADO (NO-PRINT) */}
                <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-100 p-4 rounded-3xl border border-slate-200 shadow-sm pt-4">
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
                            <span>Imprimir Cédula (1 Hoja)</span>
                        </button>

                        <button
                            type="submit"
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-sm font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
                        >
                            <CheckCircle2 className="w-5 h-5 text-rose-200" />
                            <span>Guardar Tarjeta Guthrie</span>
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};
