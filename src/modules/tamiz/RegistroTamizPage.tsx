import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Baby,
    User,
    FileText,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    AlertTriangle,
    ShieldCheck,
    Printer,
    HeartHandshake,
    Check,
    QrCode
} from 'lucide-react';

export const RegistroTamizPage: React.FC = () => {
    const navigate = useNavigate();

    // Wizard Step State (1, 2, 3, 4)
    const [currentStep, setCurrentStep] = useState<number>(1);

    // Modal Exito
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdFolio, setCreatedFolio] = useState<string>('');

    // Form Data State
    const [formData, setFormData] = useState({
        // Paso 1: Recién Nacido
        nombresRN: '',
        apellidosRN: '',
        fechaHoraNacimiento: '2026-09-07T08:30',
        sexo: 'MASCULINO',
        pesoGramos: 3200,
        tallaCm: 50,
        semanasGestacion: 39,
        atendidoPorPartera: true,
        parteraId: 'PAR-OAX-001',

        // Paso 2: Madre / Tutor
        nombreMadre: '',
        curpMadre: '',
        telefonoContacto: '',
        direccion: '',
        municipio: 'Juchitán de Zaragoza',
        comunidad: 'Juchitán de Zaragoza',

        // Paso 3: Muestra / Ficha de Guthrie
        folioGuthrie: 'TMZ-OAX-2026-98217',
        fechaHoraToma: '2026-09-09T10:00',
        tipoMuestra: 'Sangre Talar (Tarjeta Guthrie S&S 903)',
        responsableToma: 'Lic. María Elena Santiz (Enfermería Jurisdicción 2)',
        observaciones: 'Muestra adecuada, 4 gotas completas en papel filtro sin coagulación.',
    });

    // Mock Parteras List for Istmo
    const parterasIstmo = [
        { id: 'PAR-OAX-001', nombre: 'Doña Rosa Santiz Gómez (Na Rosa - Juchitán)' },
        { id: 'PAR-OAX-002', nombre: 'Doña Juana López Pérez (Na Juana - Tehuantepec)' },
        { id: 'PAR-OAX-003', nombre: 'Doña Petrona Cruz Velasco (Na Petrona - Salina Cruz)' },
        { id: 'PAR-OAX-004', nombre: 'Doña Asunción Girón Morales (Na Chona - Ixtepec)' },
        { id: 'PAR-OAX-005', nombre: 'Doña Micaela Ruiz Hernández (Na Micaela - San Blas Atempa)' },
        { id: 'PAR-OAX-006', nombre: 'Doña Lucía Jiménez Toledo (Na Lucía - Ixtaltepec)' },
    ];

    // Calculate hours between birth and sample collection for the Guthrie Alert
    const calcularHorasTranscurridas = (): number => {
        try {
            const nacimiento = new Date(formData.fechaHoraNacimiento).getTime();
            const toma = new Date(formData.fechaHoraToma).getTime();
            const diffMs = toma - nacimiento;
            return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
        } catch {
            return 48;
        }
    };

    const horasPostParto = calcularHorasTranscurridas();
    const esPrioridadAltaLab = horasPostParto > 72;

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCreatedFolio(formData.folioGuthrie);
        setShowSuccessModal(true);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto selection:bg-emerald-600 selection:text-white">

            {/* Header del Módulo */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            GOBIERNO DE OAXACA • SSO
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-600">Programa Estatal de Tamiz Neonatal</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mt-1">Registro de Muestra de Tamiz Neonatal</h1>
                    <p className="text-xs font-medium text-slate-600 mt-1">
                        Jurisdicción Sanitaria No. 2 • Istmo de Tehuantepec (Juchitán, Tehuantepec, Salina Cruz, Ixtepec, Atempa, Ixtaltepec, Espinal).
                    </p>
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver al Dashboard</span>
                </button>
            </div>

            {/* Stepper Wizard Indicator (4 Pasos) */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
                <div className="grid grid-cols-4 gap-2">

                    {/* Paso 1 */}
                    <div
                        onClick={() => setCurrentStep(1)}
                        className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center gap-3 ${currentStep === 1
                            ? 'bg-rose-50 border-[#9D2449] shadow-sm'
                            : currentStep > 1
                                ? 'bg-slate-50 border-slate-200 text-[#9D2449]'
                                : 'bg-slate-50/60 border-slate-200 opacity-60'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${currentStep === 1 ? 'bg-[#9D2449] text-white' : currentStep > 1 ? 'bg-rose-100 text-[#9D2449]' : 'bg-slate-200 text-slate-600'
                            }`}>
                            {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                        </div>
                        <div className="hidden md:block overflow-hidden">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Paso 1</span>
                            <p className="text-xs font-black text-slate-900 truncate">Recién Nacido</p>
                        </div>
                    </div>

                    {/* Paso 2 */}
                    <div
                        onClick={() => setCurrentStep(2)}
                        className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center gap-3 ${currentStep === 2
                            ? 'bg-rose-50 border-[#9D2449] shadow-sm'
                            : currentStep > 2
                                ? 'bg-slate-50 border-slate-200 text-[#9D2449]'
                                : 'bg-slate-50/60 border-slate-200 opacity-60'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${currentStep === 2 ? 'bg-[#9D2449] text-white' : currentStep > 2 ? 'bg-rose-100 text-[#9D2449]' : 'bg-slate-200 text-slate-600'
                            }`}>
                            {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                        </div>
                        <div className="hidden md:block overflow-hidden">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Paso 2</span>
                            <p className="text-xs font-black text-slate-900 truncate">Madre / Tutor</p>
                        </div>
                    </div>

                    {/* Paso 3 */}
                    <div
                        onClick={() => setCurrentStep(3)}
                        className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center gap-3 ${currentStep === 3
                            ? 'bg-rose-50 border-[#9D2449] shadow-sm'
                            : currentStep > 3
                                ? 'bg-slate-50 border-slate-200 text-[#9D2449]'
                                : 'bg-slate-50/60 border-slate-200 opacity-60'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${currentStep === 3 ? 'bg-[#9D2449] text-white' : currentStep > 3 ? 'bg-rose-100 text-[#9D2449]' : 'bg-slate-200 text-slate-600'
                            }`}>
                            {currentStep > 3 ? <Check className="w-4 h-4" /> : '3'}
                        </div>
                        <div className="hidden md:block overflow-hidden">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Paso 3</span>
                            <p className="text-xs font-black text-slate-900 truncate">Muestra / Ficha</p>
                        </div>
                    </div>

                    {/* Paso 4 */}
                    <div
                        onClick={() => setCurrentStep(4)}
                        className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center gap-3 ${currentStep === 4
                            ? 'bg-rose-50 border-[#9D2449] shadow-sm'
                            : 'bg-slate-50/60 border-slate-200 opacity-60'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${currentStep === 4 ? 'bg-[#9D2449] text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                            4
                        </div>
                        <div className="hidden md:block overflow-hidden">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Paso 4</span>
                            <p className="text-xs font-black text-slate-900 truncate">Confirmación</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* FORMULARIO POR PASOS */}
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">

                {/* PASO 1: RECIÉN NACIDO */}
                {currentStep === 1 && (
                    <div className="space-y-5 animate-fadeIn">
                        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                                <Baby className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">Paso 1: Datos del Recién Nacido</h3>
                                <p className="text-xs text-slate-500 font-medium">Información biológica y somatometría del neonato.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Nombres del Recién Nacido *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Mateo / RN Gómez"
                                    value={formData.nombresRN}
                                    onChange={(e) => setFormData({ ...formData, nombresRN: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Apellidos *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Gómez Santiz"
                                    value={formData.apellidosRN}
                                    onChange={(e) => setFormData({ ...formData, apellidosRN: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Fecha y Hora de Nacimiento *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.fechaHoraNacimiento}
                                    onChange={(e) => setFormData({ ...formData, fechaHoraNacimiento: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Sexo Biológico</label>
                                <select
                                    value={formData.sexo}
                                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                                >
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="FEMENINO">Femenino</option>
                                    <option value="INDETERMINADO">Indeterminado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Semanas de Gestación (SDG)</label>
                                <input
                                    type="number"
                                    min="24"
                                    max="44"
                                    value={formData.semanasGestacion}
                                    onChange={(e) => setFormData({ ...formData, semanasGestacion: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Peso al Nacer (Gramos) *</label>
                                <input
                                    type="number"
                                    required
                                    min="500"
                                    max="6000"
                                    placeholder="Ej: 3200"
                                    value={formData.pesoGramos}
                                    onChange={(e) => setFormData({ ...formData, pesoGramos: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Talla (Centímetros)</label>
                                <input
                                    type="number"
                                    min="30"
                                    max="65"
                                    placeholder="Ej: 50"
                                    value={formData.tallaCm}
                                    onChange={(e) => setFormData({ ...formData, tallaCm: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                                />
                            </div>
                        </div>

                        {/* Parto atendido por Partera Tradicional */}
                        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <HeartHandshake className="w-5 h-5 text-emerald-700" />
                                    <span className="text-xs font-black text-emerald-950">
                                        ¿El parto fue atendido por una Partera Tradicional Acreditada?
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.atendidoPorPartera}
                                    onChange={(e) => setFormData({ ...formData, atendidoPorPartera: e.target.checked })}
                                    className="w-5 h-5 accent-emerald-600 cursor-pointer"
                                />
                            </div>

                            {formData.atendidoPorPartera && (
                                <div className="pt-2 border-t border-emerald-200 text-xs">
                                    <label className="block text-emerald-900 font-bold mb-1">
                                        Seleccionar Partera de la Red Comunitaria (Istmo de Tehuantepec)
                                    </label>
                                    <select
                                        value={formData.parteraId}
                                        onChange={(e) => setFormData({ ...formData, parteraId: e.target.value })}
                                        className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                                    >
                                        {parterasIstmo.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* PASO 2: MADRE / TUTOR */}
                {currentStep === 2 && (
                    <div className="space-y-5 animate-fadeIn">
                        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">Paso 2: Datos de la Madre / Tutor</h3>
                                <p className="text-xs text-slate-500 font-medium">Información de contacto y localización de la madre.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Nombre Completo de la Madre *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Juana Santiz Cruz"
                                    value={formData.nombreMadre}
                                    onChange={(e) => setFormData({ ...formData, nombreMadre: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">CURP de la Madre</label>
                                <input
                                    type="text"
                                    placeholder="Ej: SACJ900512HOCMNN04"
                                    value={formData.curpMadre}
                                    onChange={(e) => setFormData({ ...formData, curpMadre: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Teléfono de Contacto / WhatsApp *</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="Ej: 971 123 4567"
                                    value={formData.telefonoContacto}
                                    onChange={(e) => setFormData({ ...formData, telefonoContacto: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Comunidad / Municipio del Istmo *</label>
                                <select
                                    value={formData.municipio}
                                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value, comunidad: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                                >
                                    <option value="Juchitán de Zaragoza">Juchitán de Zaragoza</option>
                                    <option value="Santo Domingo Tehuantepec">Santo Domingo Tehuantepec</option>
                                    <option value="Salina Cruz">Salina Cruz</option>
                                    <option value="Ciudad Ixtepec">Ciudad Ixtepec</option>
                                    <option value="San Blas Atempa">San Blas Atempa</option>
                                    <option value="Asunción Ixtaltepec">Asunción Ixtaltepec</option>
                                    <option value="El Espinal">El Espinal</option>
                                </select>
                            </div>
                        </div>

                        <div className="text-xs">
                            <label className="block text-slate-700 font-bold mb-1">Dirección / Referencia de Domicilio</label>
                            <input
                                type="text"
                                placeholder="Ej: Calle 5 de Mayo No. 12, Barrio Cheguigo, Juchitán"
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                            />
                        </div>
                    </div>
                )}

                {/* PASO 3: MUESTRA / FICHA GUTHRIE */}
                {currentStep === 3 && (
                    <div className="space-y-5 animate-fadeIn">
                        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">Paso 3: Muestra de Tamiz & Ficha de Guthrie</h3>
                                <p className="text-xs text-slate-500 font-medium">Folio del papel filtro y tiempo transcurrido post-parto.</p>
                            </div>
                        </div>

                        {/* Banner de Alerta Visual para Muestras > 72 Horas */}
                        {esPrioridadAltaLab && (
                            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 shadow-sm">
                                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 animate-bounce" />
                                <div className="text-xs text-amber-950 space-y-1">
                                    <h4 className="font-extrabold text-amber-900">
                                        ¡Aviso de Prioridad de Laboratorio! ({horasPostParto} horas transcurridas)
                                    </h4>
                                    <p className="font-medium">
                                        La muestra ha sido tomada después de las 72 horas del nacimiento. Se etiquetará con **Prioridad Alta** para el procesamiento inmediato en el Laboratorio Estatal de Salud Pública (LESP Oaxaca).
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Folio de Ficha / Papel Filtro Guthrie *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: TMZ-OAX-2026-98217"
                                    value={formData.folioGuthrie}
                                    onChange={(e) => setFormData({ ...formData, folioGuthrie: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Fecha y Hora de Toma de Muestra *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.fechaHoraToma}
                                    onChange={(e) => setFormData({ ...formData, fechaHoraToma: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Tipo / Calidad de Muestra</label>
                                <input
                                    type="text"
                                    value={formData.tipoMuestra}
                                    onChange={(e) => setFormData({ ...formData, tipoMuestra: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Responsable de la Toma de Muestra</label>
                                <input
                                    type="text"
                                    value={formData.responsableToma}
                                    onChange={(e) => setFormData({ ...formData, responsableToma: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="text-xs">
                            <label className="block text-slate-700 font-bold mb-1">Observaciones Clínicas / Notas de Toma</label>
                            <textarea
                                rows={2}
                                value={formData.observaciones}
                                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                            />
                        </div>
                    </div>
                )}

                {/* PASO 4: CONFIRMACIÓN Y VISTA PREVIA */}
                {currentStep === 4 && (
                    <div className="space-y-5 animate-fadeIn">
                        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">Paso 4: Resumen y Confirmación de Expediente</h3>
                                <p className="text-xs text-slate-500 font-medium">Verifique que los datos capturados sean correctos antes de guardar.</p>
                            </div>
                        </div>

                        {/* Card Expediente Vista Previa */}
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4 text-xs">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <span className="font-mono font-bold text-emerald-800 text-sm">{formData.folioGuthrie}</span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    LISTO PARA ENVÍO
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recién Nacido</span>
                                    <p className="font-extrabold text-slate-900">{formData.nombresRN} {formData.apellidosRN}</p>
                                    <p className="text-slate-600">{formData.sexo} • {formData.semanasGestacion} SDG</p>
                                    <p className="text-slate-600">{formData.pesoGramos}g • {formData.tallaCm}cm</p>
                                    {formData.atendidoPorPartera && (
                                        <p className="text-emerald-700 font-bold pt-1">Atendido por Partera Tradicional</p>
                                    )}
                                </div>

                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Madre / Tutor</span>
                                    <p className="font-extrabold text-slate-900">{formData.nombreMadre || 'No ingresado'}</p>
                                    <p className="text-slate-600">{formData.telefonoContacto}</p>
                                    <p className="text-slate-600">{formData.municipio}</p>
                                    <p className="text-slate-500 truncate">{formData.direccion}</p>
                                </div>

                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Muestra & Ficha</span>
                                    <p className="font-bold text-slate-900">{formData.folioGuthrie}</p>
                                    <p className="text-slate-600">Toma: {formData.fechaHoraToma.replace('T', ' ')}</p>
                                    <p className="text-slate-600">Tiempo: {horasPostParto} hrs post-parto</p>
                                    {esPrioridadAltaLab ? (
                                        <p className="text-amber-700 font-black">Prioridad Alta Lab (&gt;72h)</p>
                                    ) : (
                                        <p className="text-emerald-700 font-semibold">Toma Oportuna (&lt;72h)</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* NAVEGACIÓN Y BOTONES DEL WIZARD */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Anterior</span>
                        </button>
                    ) : (
                        <div />
                    )}

                    {currentStep < 4 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-5 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors"
                        >
                            <span>Siguiente</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Finalizar y Guardar Folio</span>
                        </button>
                    )}
                </div>

            </form>

            {/* MODAL DE ÉXITO CON FOLIO Y CÓDIGO QR / BARRAS SIMULADO */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-center">

                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border-2 border-emerald-300 animate-bounce">
                            <CheckCircle2 className="w-9 h-9" />
                        </div>

                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                                REGISTRO EXITOSO • SSO OAXACA
                            </span>
                            <h3 className="text-xl font-black text-slate-900 mt-2">Muestra Registrada Correctamente</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                El folio de la Tarjeta de Guthrie se integró a la red de la Jurisdicción Sanitaria No. 2.
                            </p>
                        </div>

                        {/* Tarjeta de Folio + Código QR de Muestra */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Folio Oficial Asignado</span>
                            <p className="text-xl font-black text-slate-900 font-mono tracking-widest">{createdFolio}</p>

                            {/* SVG Simulado de Código de Barras / QR */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                                <div className="w-32 h-20 bg-slate-900 p-2 rounded-lg flex items-center justify-center">
                                    <QrCode className="w-16 h-16 text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 mt-1">Rastreo LESP Oaxaca</span>
                            </div>
                        </div>

                        {/* Botones del Modal */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <button
                                onClick={() => alert('Generando comprobante oficial en formato PDF para laboratorio...')}
                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Imprimir Comprobante</span>
                            </button>

                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                            >
                                Volver al Dashboard
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};
