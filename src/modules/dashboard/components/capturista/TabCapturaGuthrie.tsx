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
    FileText
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

            {/* REGLAS DE IMPRESIÓN CSS PARA 1 PÁGINA A4/CARTA */}
            <style>{`
                @media print {
                    @page {
                        size: portrait;
                        margin: 6mm;
                    }
                    body {
                        background: #fff !important;
                        color: #000 !important;
                        font-size: 9px !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .printable-guthrie-card {
                        border: 2px solid #9D2449 !important;
                        border-radius: 8px !important;
                        padding: 10px !important;
                        box-shadow: none !important;
                        background: white !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    .printable-guthrie-card input,
                    .printable-guthrie-card select,
                    .printable-guthrie-card textarea {
                        border: 1px solid #64748b !important;
                        background: #fff !important;
                        color: #000 !important;
                        padding: 2px 4px !important;
                        font-size: 9px !important;
                        height: auto !important;
                    }
                    .print-2col-layout {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 10px !important;
                    }
                }
            `}</style>

            {/* BARRA SUPERIOR SOBRIA DE ACCIÓN OCR / IA (SIN EMOJIS NATIVOS) */}
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
                            Ficha de Captura Digital - Tarjeta de Tamiz Neonatal Guthrie
                        </h2>
                    </div>
                </div>

                {/* BOTONES UNIFICADOS CON ICONOS LUCIDE-REACT LIMPIOS */}
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

            {/* TOAST DE ÉXITO DE IA (SIN EMOJIS) */}
            {aiToast && (
                <div className="no-print bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 flex items-center gap-3 text-xs font-bold text-emerald-900 shadow-md">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="flex-1 font-extrabold">{aiToast}</p>
                </div>
            )}

            {/* BANNER DE ÉXITO AL GUARDAR */}
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

            {/* FORMULARIO MAQUETADO EN 2 COLUMNAS (ALINEADO A HOJA FÍSICA REAL) */}
            <form onSubmit={handleSubmit} className="printable-guthrie-card space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">

                {/* ENCABEZADO CON FOLIO DE DESTACADO EN TEXTO GRANDE ROJO */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[#9D2449] pb-4">
                    <div>
                        <span className="text-[10px] font-black uppercase text-[#9D2449] tracking-wider block">
                            TARJETA OFICIAL DE TAMIZ NEONATAL • FORMATO DE SANGRE EN PAPEL FILTRO
                        </span>
                        <h2 className="text-lg font-black text-slate-900">
                            Cédula de Captura de Muestra Neonatal
                        </h2>
                    </div>

                    {/* FOLIO EN TEXTO GRANDE ROJO FONT-MONO */}
                    <div className="bg-rose-50 border-2 border-rose-300 px-4 py-2 rounded-2xl text-right">
                        <span className="text-[10px] font-black uppercase text-rose-700 block">FOLIO TARJETA GUTHRIE</span>
                        <span className="font-mono text-xl text-rose-600 font-black tracking-wider">
                            {formData.folio || '5458347'}
                        </span>
                    </div>
                </div>

                {/* MAQUETACIÓN EN 2 COLUMNAS DE ALTA FIDELIDAD */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-2col-layout">

                    {/* COLUMNA IZQUIERDA: SECCIONES A Y C (UNIDAD Y RECIÉN NACIDO) */}
                    <div className="space-y-6">

                        {/* SECCIÓN A: ENCABEZADO Y CLUES */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-[#9D2449]">
                                <Building2 className="w-4 h-4" />
                                <h3 className="text-xs font-black uppercase tracking-wider">SECCIÓN A • Unidad Médica (CLUES)</h3>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Folio de Tarjeta *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.folio}
                                        onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-sm font-black text-rose-600 focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Unidad Médica * (Catálogo de Unidades Médicas CLUES)
                                    </label>
                                    <select
                                        required
                                        value={formData.unidadMedica}
                                        onChange={handleCluesChange}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
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
                            </div>
                        </div>

                        {/* SECCIÓN B: MUESTRA Y RESPONSABLE */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-[#9D2449]">
                                <User className="w-4 h-4" />
                                <h3 className="text-xs font-black uppercase tracking-wider">SECCIÓN B • Personal / Muestra</h3>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Responsable de Toma *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.responsableToma}
                                        onChange={(e) => setFormData({ ...formData, responsableToma: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Técnica de Toma *</label>
                                    <select
                                        value={formData.tecnicaToma}
                                        onChange={(e) => setFormData({ ...formData, tecnicaToma: e.target.value as any })}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    >
                                        <option value="1A_TALON">1ª Muestra Sangre en Talón</option>
                                        <option value="2A_TALON">2ª Muestra Confirmatoria</option>
                                        <option value="REMUESTRA_SOSPECHA">Re-muestra por Sospecha Epidemiológica</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN C: DATOS DEL RECIÉN NACIDO */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-[#9D2449]">
                                <Baby className="w-4 h-4" />
                                <h3 className="text-xs font-black uppercase tracking-wider">SECCIÓN C • Datos del Recién Nacido (RN)</h3>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Nombre(s) RN *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nombreRN}
                                            onChange={(e) => setFormData({ ...formData, nombreRN: e.target.value })}
                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Ap. Paterno *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.apellidoPaternoRN}
                                            onChange={(e) => setFormData({ ...formData, apellidoPaternoRN: e.target.value })}
                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Ap. Materno *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.apellidoMaternoRN}
                                            onChange={(e) => setFormData({ ...formData, apellidoMaternoRN: e.target.value })}
                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Fecha Nacimiento *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.fechaNacimiento}
                                            onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Hora Nacimiento *</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.horaNacimiento}
                                            onChange={(e) => setFormData({ ...formData, horaNacimiento: e.target.value })}
                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Fecha Toma *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.fechaToma}
                                            onChange={(e) => setFormData({ ...formData, fechaToma: e.target.value })}
                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Hora Toma *</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.horaToma}
                                            onChange={(e) => setFormData({ ...formData, horaToma: e.target.value })}
                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Sexo *</label>
                                        <select
                                            value={formData.sexo}
                                            onChange={(e) => setFormData({ ...formData, sexo: e.target.value as any })}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                                        >
                                            <option value="MASCULINO">Masculino</option>
                                            <option value="FEMENINO">Femenino</option>
                                            <option value="AMBIGUEDAD">Ambigüedad</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Peso (g) *</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.pesoGramos}
                                            onChange={(e) => setFormData({ ...formData, pesoGramos: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Talla (cm) *</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.tallaCm}
                                            onChange={(e) => setFormData({ ...formData, tallaCm: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* COLUMNA DERECHA: SECCIÓN D (DATOS DE LA MADRE Y ANTECEDENTES) */}
                    <div className="space-y-6">

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-[#9D2449] mb-4">
                                    <HeartPulse className="w-4 h-4" />
                                    <h3 className="text-xs font-black uppercase tracking-wider">SECCIÓN D • Datos de la Madre o Tutora</h3>
                                </div>

                                <div className="space-y-3.5 text-xs">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">Nombre(s) *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.nombreMadre}
                                                onChange={(e) => setFormData({ ...formData, nombreMadre: e.target.value })}
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">Ap. Paterno *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.apellidoPaternoMadre}
                                                onChange={(e) => setFormData({ ...formData, apellidoPaternoMadre: e.target.value })}
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">Ap. Materno *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.apellidoMaternoMadre}
                                                onChange={(e) => setFormData({ ...formData, apellidoMaternoMadre: e.target.value })}
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                                            />
                                        </div>
                                    </div>

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

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1">Teléfono Celular *</label>
                                            <input
                                                type="tel"
                                                required
                                                maxLength={10}
                                                value={formData.telefonoCelular}
                                                onChange={(e) => setFormData({ ...formData, telefonoCelular: e.target.value })}
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-1">
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-700 mb-1">Edad *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.edadMadre}
                                                    onChange={(e) => setFormData({ ...formData, edadMadre: e.target.value })}
                                                    className="w-full px-1.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-center"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-700 mb-1">Gestas *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.gestas}
                                                    onChange={(e) => setFormData({ ...formData, gestas: e.target.value })}
                                                    className="w-full px-1.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Calle y Número / Colonia</label>
                                        <input
                                            type="text"
                                            value={`${formData.calleNumero} ${formData.coloniaLocalidad}`.trim()}
                                            onChange={(e) => setFormData({ ...formData, calleNumero: e.target.value })}
                                            placeholder="Av. Hidalgo #45, Barrio Cheguigo"
                                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Municipio *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.municipioMadre}
                                            onChange={(e) => setFormData({ ...formData, municipioMadre: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Antecedente Tiroideo / Metabólico *</label>
                                        <div className="flex gap-4">
                                            <label className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="tiroidea"
                                                    checked={formData.enfermedadTiroideaMetabolica === 'NO'}
                                                    onChange={() => setFormData({ ...formData, enfermedadTiroideaMetabolica: 'NO' })}
                                                    className="accent-[#9D2449]"
                                                />
                                                Sin Antecedentes
                                            </label>
                                            <label className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="tiroidea"
                                                    checked={formData.enfermedadTiroideaMetabolica === 'SI'}
                                                    onChange={() => setFormData({ ...formData, enfermedadTiroideaMetabolica: 'SI' })}
                                                    className="accent-[#9D2449]"
                                                />
                                                Sí (Reportado)
                                            </label>
                                        </div>
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
                            <span>Imprimir Ficha (1 Hoja)</span>
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
