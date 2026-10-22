import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../services/http';
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
    QrCode,
    Loader2
} from 'lucide-react';

export const RegistroTamizPage: React.FC = () => {
    const navigate = useNavigate();

    // Wizard Step State
    const [currentStep, setCurrentStep] = useState<number>(1);

    // Modal Exito & Loading Backend
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdFolio, setCreatedFolio] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Lista dinámica de parteras obtenida del backend real
    const [parterasIstmo, setParterasIstmo] = useState<Array<{ id: string; nombre: string }>>([
        { id: 'PAR-OAX-001', nombre: 'Doña Rosa Santiz Gómez (Na Rosa - Juchitán)' }
    ]);

    // Cargar parteras reales para el selector desde el backend (Render)
    useEffect(() => {
        const fetchParterasList = async () => {
            try {
                const res = await http.get('/parteras');
                if (res.data && res.data.length > 0) {
                    setParterasIstmo(res.data.map((p: any) => ({
                        id: p.id,
                        nombre: `${p.nombreCompleto} (${p.nombreZapoteco || p.comunidad})`
                    })));
                }
            } catch (e) {
                console.error('Error al cargar parteras del backend:', e);
            }
        };
        fetchParterasList();
    }, []);

    // Form Data State
    const [formData, setFormData] = useState({
        nombresRN: '',
        apellidosRN: '',
        fechaHoraNacimiento: '2026-09-07T08:30',
        sexo: 'MASCULINO',
        pesoGramos: 3200,
        tallaCm: 50,
        semanasGestacion: 39,
        atendidoPorPartera: true,
        parteraId: 'PAR-OAX-001',

        nombreMadre: '',
        curpMadre: '',
        telefonoContacto: '',
        direccion: '',
        municipio: 'Juchitán de Zaragoza',
        comunidad: 'Juchitán de Zaragoza',

        folioGuthrie: '', // El backend o PostgreSQL genera el folio oficial
        fechaHoraToma: new Date().toISOString().slice(0, 16),
        tipoMuestra: 'Sangre Talar (Tarjeta Guthrie S&S 903)',
        responsableToma: 'Personal de Jurisdicción Sanitaria No. 2',
        observaciones: 'Muestra adecuada en papel filtro.',
    });

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

    // Envío real al Backend y PostgreSQL vía Axios
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await http.post('/tamiz', {
                ...formData,
                prioridadAlta: esPrioridadAltaLab,
                horasPostParto
            });

            const resultado = response.data;
            setCreatedFolio(resultado.folioGuthrie || 'TMZ-OAX-REGISTRADO');
            setShowSuccessModal(true);
        } catch (err: any) {
            console.error('Error al registrar tamiz:', err);
            setErrorMessage(
                err.response?.data?.message ||
                'Error al conectar con el servidor para guardar la muestra de tamiz.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto selection:bg-emerald-600 selection:text-white">

            {/* Header */}
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
                        Jurisdicción Sanitaria No. 2 • Istmo de Tehuantepec (Conexión Backend Render).
                    </p>
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver al Dashboard</span>
                </button>
            </div>

            {/* Mensaje de Error si falla la API */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-bold">
                    <AlertTriangle className="w-5 h-5 text-[#9D2449] shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Stepper Wizard Indicator */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { num: 1, title: 'Recién Nacido' },
                        { num: 2, title: 'Madre / Tutor' },
                        { num: 3, title: 'Muestra / Ficha' },
                        { num: 4, title: 'Confirmación' }
                    ].map((step) => (
                        <div
                            key={step.num}
                            onClick={() => setCurrentStep(step.num)}
                            className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center gap-3 ${currentStep === step.num
                                    ? 'bg-rose-50 border-[#9D2449] shadow-sm'
                                    : currentStep > step.num
                                        ? 'bg-slate-50 border-slate-200 text-[#9D2449]'
                                        : 'bg-slate-50/60 border-slate-200 opacity-60'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${currentStep === step.num ? 'bg-[#9D2449] text-white' : currentStep > step.num ? 'bg-rose-100 text-[#9D2449]' : 'bg-slate-200 text-slate-600'
                                }`}>
                                {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                            </div>
                            <div className="hidden md:block overflow-hidden">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Paso {step.num}</span>
                                <p className="text-xs font-black text-slate-900 truncate">{step.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">

                {/* PASO 1 */}
                {currentStep === 1 && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                                <Baby className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">Paso 1: Datos del Recién Nacido</h3>
                                <p className="text-xs text-slate-500 font-medium">Información biológica y somatometría.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Nombres del Recién Nacido *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Mateo"
                                    value={formData.nombresRN}
                                    onChange={(e) => setFormData({ ...formData, nombresRN: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
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
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
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
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Sexo Biológico</label>
                                <select
                                    value={formData.sexo}
                                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none"
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
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none"
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
                                    value={formData.pesoGramos}
                                    onChange={(e) => setFormData({ ...formData, pesoGramos: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Talla (Centímetros)</label>
                                <input
                                    type="number"
                                    min="30"
                                    max="65"
                                    value={formData.tallaCm}
                                    onChange={(e) => setFormData({ ...formData, tallaCm: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <HeartHandshake className="w-5 h-5 text-emerald-700" />
                                    <span className="text-xs font-black text-emerald-950">
                                        ¿Atendido por Partera Tradicional Acreditada?
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
                                    <label className="block text-emerald-900 font-bold mb-1">Seleccionar Partera</label>
                                    <select
                                        value={formData.parteraId}
                                        onChange={(e) => setFormData({ ...formData, parteraId: e.target.value })}
                                        className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none"
                                    >
                                        {parterasIstmo.map((p) => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* PASO 2 */}
                {currentStep === 2 && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">Paso 2: Datos de la Madre / Tutor</h3>
                                <p className="text-xs text-slate-500 font-medium">Información de contacto y localización.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Nombre Completo de la Madre *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombreMadre}
                                    onChange={(e) => setFormData({ ...formData, nombreMadre: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">CURP de la Madre</label>
                                <input
                                    type="text"
                                    value={formData.curpMadre}
                                    onChange={(e) => setFormData({ ...formData, curpMadre: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Teléfono de Contacto / WhatsApp *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.telefonoContacto}
                                    onChange={(e) => setFormData({ ...formData, telefonoContacto: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Municipio del Istmo *</label>
                                <select
                                    value={formData.municipio}
                                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value, comunidad: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none"
                                >
                                    <option value="Juchitán de Zaragoza">Juchitán de Zaragoza</option>
                                    <option value="Santo Domingo Tehuantepec">Santo Domingo Tehuantepec</option>
                                    <option value="Salina Cruz">Salina Cruz</option>
                                    <option value="Ciudad Ixtepec">Ciudad Ixtepec</option>
                                    <option value="San Blas Atempa">San Blas Atempa</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 3 */}
                {currentStep === 3 && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">Paso 3: Muestra de Tamiz & Ficha de Guthrie</h3>
                                <p className="text-xs text-slate-500 font-medium">Validación de tiempo post-parto.</p>
                            </div>
                        </div>

                        {esPrioridadAltaLab && (
                            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 shadow-sm">
                                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-950 space-y-1">
                                    <h4 className="font-extrabold text-amber-900">¡Prioridad Alta de Laboratorio ({horasPostParto} hrs)!</h4>
                                    <p className="font-medium">Muestra tomada después de 72 horas. Se etiquetará con prioridad en PostgreSQL.</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Folio Papel Filtro Guthrie *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: TMZ-OAX-98421"
                                    value={formData.folioGuthrie}
                                    onChange={(e) => setFormData({ ...formData, folioGuthrie: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Fecha y Hora de Toma *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.fechaHoraToma}
                                    onChange={(e) => setFormData({ ...formData, fechaHoraToma: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 4 */}
                {currentStep === 4 && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">Paso 4: Confirmación</h3>
                                <p className="text-xs text-slate-500 font-medium">Listos para enviar al servidor backend en Render.</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4 text-xs">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <span className="font-mono font-bold text-emerald-800 text-sm">{formData.folioGuthrie || 'Folio Automático'}</span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    LISTO PARA API BACKEND
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recién Nacido</span>
                                    <p className="font-extrabold text-slate-900">{formData.nombresRN} {formData.apellidosRN}</p>
                                    <p className="text-slate-600 font-semibold">{formData.sexo} • {formData.semanasGestacion} SDG</p>
                                </div>
                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Madre</span>
                                    <p className="font-extrabold text-slate-900">{formData.nombreMadre || 'No ingresado'}</p>
                                    <p className="text-slate-600">{formData.telefonoContacto}</p>
                                </div>
                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Muestra</span>
                                    <p className="font-bold text-slate-900">{formData.folioGuthrie}</p>
                                    <p className="text-slate-600">Tiempo: {horasPostParto} hrs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones de Navegación */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Anterior</span>
                        </button>
                    ) : <div />}

                    {currentStep < 4 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-5 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                        >
                            <span>Siguiente</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Guardando en PostgreSQL (Render)...</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Enviar a Base de Datos Backend</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

            </form>

            {/* Modal Éxito Backend */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border-2 border-emerald-300">
                            <CheckCircle2 className="w-9 h-9" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                                PERSISTIDO EN POSTGRESQL • JURISDICCIÓN 2
                            </span>
                            <h3 className="text-xl font-black text-slate-900 mt-2">Muestra Guardada con Éxito</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                El registro ha sido procesado por el backend e integrado al sistema estatal.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Folio Asignado</span>
                            <p className="text-xl font-black text-slate-900 font-mono tracking-widest">{createdFolio}</p>
                            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                                <div className="w-32 h-20 bg-slate-900 p-2 rounded-lg flex items-center justify-center">
                                    <QrCode className="w-16 h-16 text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 mt-1">LESP Oaxaca Backend</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <button
                                onClick={() => alert('Generando comprobante oficial PDF...')}
                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Imprimir Comprobante</span>
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
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

export default RegistroTamizPage;