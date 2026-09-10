import React, { useState, useEffect } from 'react';
import {
    Volume2,
    VolumeX,
    QrCode,
    Plus,
    Baby,
    X,
    ShieldCheck,
    CheckCircle2,
    Printer
} from 'lucide-react';

interface ParteraDashboardProps {
    nombrePartera: string;
}

export const ParteraDashboard: React.FC<ParteraDashboardProps> = ({ nombrePartera }) => {
    // Modal States
    const [showNotificarPartoModal, setShowNotificarPartoModal] = useState(false);
    const [showMisBebesModal, setShowMisBebesModal] = useState(false);
    const [showCredencialModal, setShowCredencialModal] = useState(false);

    // Voice Assistance State
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Form Notificar Parto State
    const [notificacionEnviada, setNotificacionEnviada] = useState(false);
    const [partoData, setPartoData] = useState({
        nombreMadre: '',
        comunidad: 'Juchitán de Zaragoza',
        fechaHora: '2026-09-09T14:30',
        sexoRN: 'MASCULINO',
        pesoAproximado: '3.1 kg',
        canalizadoTamiz: true,
        observaciones: 'Parto sin complicaciones, recién nacido activo con buen llanto.',
    });

    // Mock Recién Nacidos de la Partera
    const [misBebes] = useState([
        {
            id: 'RN-001',
            madre: 'María Gómez Santiz',
            fechaNacimiento: '2026-09-07',
            comunidad: 'Juchitán de Zaragoza',
            sexo: 'MASCULINO',
            folioTamiz: 'TMZ-OAX-2026-98217',
            estatusTamiz: 'Tamiz Realizado (En Tránsito)',
        },
        {
            id: 'RN-002',
            madre: 'Juana López Pérez',
            fechaNacimiento: '2026-09-02',
            comunidad: 'Santo Domingo Tehuantepec',
            sexo: 'FEMENINO',
            folioTamiz: 'TMZ-OAX-2026-98104',
            estatusTamiz: 'Tamiz Completado (Normal)',
        },
        {
            id: 'RN-003',
            madre: 'Lucía Jiménez Toledo',
            fechaNacimiento: '2026-08-25',
            comunidad: 'Asunción Ixtaltepec',
            sexo: 'MASCULINO',
            folioTamiz: 'TMZ-OAX-2026-97992',
            estatusTamiz: 'Tamiz Completado (Normal)',
        },
    ]);

    // Speech API Handler
    const hablarGuia = (texto: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = 'es-MX';
            utterance.rate = 0.85;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        } else {
            alert('La lectura por voz no está disponible en este dispositivo.');
        }
    };

    const detenerVoz = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        };
    }, []);

    const handleEnviarNotificacion = (e: React.FormEvent) => {
        e.preventDefault();
        setNotificacionEnviada(true);
        setTimeout(() => {
            setNotificacionEnviada(false);
            setShowNotificarPartoModal(false);
            setPartoData({
                nombreMadre: '',
                comunidad: 'Juchitán de Zaragoza',
                fechaHora: '2026-09-09T14:30',
                sexoRN: 'MASCULINO',
                pesoAproximado: '3.1 kg',
                canalizadoTamiz: true,
                observaciones: '',
            });
        }, 1500);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto selection:bg-rose-600 selection:text-white">

            {/* Encabezado Cálido y Humanizado (Guinda Institucional) */}
            <div className="bg-gradient-to-r from-[#9D2449] via-[#7A1B38] to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-[#9D2449]/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-rose-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                            RED COMUNITARIA DE PARTERAS TRADICIONALES
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white">
                        ¡Hola, Doña {nombrePartera.replace('Doña ', '')}!
                    </h1>
                    <p className="text-sm text-rose-100/90 font-medium">
                        Bienvenida a su espacio comunitario de salud maternal en la Jurisdicción Sanitaria No. 2 - Istmo.
                    </p>
                </div>

                {/* Control de Asistencia por Voz */}
                <button
                    onClick={() =>
                        isSpeaking
                            ? detenerVoz()
                            : hablarGuia(
                                `Bienvenida Doña ${nombrePartera}. En este panel puede notificar un nuevo parto, consultar la lista de sus bebés atendidos o ver su credencial digital de salubridad.`
                            )
                    }
                    className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-3 shadow-lg transition-all transform active:scale-95 shrink-0 ${isSpeaking
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-300'
                        : 'bg-white text-[#9D2449] hover:bg-rose-50 shadow-white/20'
                        }`}
                >
                    {isSpeaking ? (
                        <>
                            <VolumeX className="w-5 h-5" />
                            <span>Detener Voz</span>
                        </>
                    ) : (
                        <>
                            <Volume2 className="w-5 h-5 text-[#9D2449]" />
                            <span>Escuchar Instrucciones por Voz</span>
                        </>
                    )}
                </button>
            </div>

            {/* 3 BOTONES TÁCTILES GIGANTES CON ÍCONOS Y OPCIÓN DE VOZ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* BOTÓN GIGANTE 1: Notificar Nuevo Parto */}
                <button
                    onClick={() => {
                        hablarGuia('Abriendo formulario para notificar un nuevo parto atendido.');
                        setShowNotificarPartoModal(true);
                    }}
                    className="bg-white hover:bg-rose-50/60 border-2 border-[#9D2449]/30 hover:border-[#9D2449] p-6 rounded-3xl shadow-md hover:shadow-xl transition-all flex flex-col items-center justify-center text-center space-y-4 group active:scale-95 min-h-[220px]"
                >
                    <div className="w-16 h-16 rounded-2xl bg-[#9D2449] text-white flex items-center justify-center shadow-lg shadow-[#9D2449]/30 group-hover:scale-110 transition-transform">
                        <Plus className="w-9 h-9" />
                    </div>
                    <div>
                        <span className="block text-lg font-black text-slate-900 group-hover:text-[#9D2449]">
                            1. Notificar Nuevo Parto Atendido
                        </span>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Registre un nacimiento en su comunidad de forma rápida.
                        </p>
                    </div>
                </button>

                {/* BOTÓN GIGANTE 2: Mis Recién Nacidos Canalizados */}
                <button
                    onClick={() => {
                        hablarGuia('Abriendo la lista de recién nacidos atendidos en su comunidad.');
                        setShowMisBebesModal(true);
                    }}
                    className="bg-white hover:bg-rose-50/60 border-2 border-slate-200 hover:border-[#9D2449] p-6 rounded-3xl shadow-md hover:shadow-xl transition-all flex flex-col items-center justify-center text-center space-y-4 group active:scale-95 min-h-[220px]"
                >
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Baby className="w-9 h-9 text-rose-300" />
                    </div>
                    <div>
                        <span className="block text-lg font-black text-slate-900 group-hover:text-[#9D2449]">
                            2. Mis Recién Nacidos Canalizados
                        </span>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Consulte el seguimiento de tamiz neonatal de los bebés.
                        </p>
                    </div>
                </button>

                {/* BOTÓN GIGANTE 3: Mi Credencial Digital / QR SSO */}
                <button
                    onClick={() => {
                        hablarGuia('Abriendo su credencial digital de partera acreditada por los Servicios de Salud de Oaxaca.');
                        setShowCredencialModal(true);
                    }}
                    className="bg-white hover:bg-rose-50/60 border-2 border-slate-200 hover:border-[#9D2449] p-6 rounded-3xl shadow-md hover:shadow-xl transition-all flex flex-col items-center justify-center text-center space-y-4 group active:scale-95 min-h-[220px]"
                >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <QrCode className="w-9 h-9" />
                    </div>
                    <div>
                        <span className="block text-lg font-black text-slate-900 group-hover:text-[#9D2449]">
                            3. Mi Credencial Digital / QR SSO
                        </span>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Muestre su acreditación oficial con código QR.
                        </p>
                    </div>
                </button>

            </div>

            {/* MODAL 1: FORMULARIO SIMPLIFICADO DE NOTIFICACIÓN DE PARTO */}
            {showNotificarPartoModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-[#9D2449]" />
                                <span>Notificar Parto Atendido en Comunidad</span>
                            </h3>
                            <button
                                onClick={() => setShowNotificarPartoModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {notificacionEnviada ? (
                            <div className="py-8 text-center space-y-3">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 animate-bounce">
                                    <CheckCircle2 className="w-9 h-9" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900">¡Parto Notificado con Éxito!</h4>
                                <p className="text-xs text-slate-600">
                                    Se ha enviado el aviso a la Jurisdicción Sanitaria No. 2 para la muestra de tamiz.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleEnviarNotificacion} className="space-y-4 text-xs font-medium">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Nombre Completo de la Madre</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. María Elena Santiz"
                                        value={partoData.nombreMadre}
                                        onChange={(e) => setPartoData({ ...partoData, nombreMadre: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Comunidad</label>
                                        <input
                                            type="text"
                                            value={partoData.comunidad}
                                            onChange={(e) => setPartoData({ ...partoData, comunidad: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Sexo del Recién Nacido</label>
                                        <select
                                            value={partoData.sexoRN}
                                            onChange={(e) => setPartoData({ ...partoData, sexoRN: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                        >
                                            <option value="MASCULINO">Masculino</option>
                                            <option value="FEMENINO">Femenino</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 flex items-center justify-between">
                                    <span className="text-slate-800 font-bold">¿Se programó visita para Tamiz Neonatal?</span>
                                    <input
                                        type="checkbox"
                                        checked={partoData.canalizadoTamiz}
                                        onChange={(e) => setPartoData({ ...partoData, canalizadoTamiz: e.target.checked })}
                                        className="w-5 h-5 accent-[#9D2449]"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowNotificarPartoModal(false)}
                                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-black rounded-xl shadow-md"
                                    >
                                        Guardar Aviso
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL 2: MIS RECIÉN NACIDOS CANALIZADOS */}
            {showMisBebesModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <Baby className="w-5 h-5 text-[#9D2449]" />
                                <span>Bebés Atendidos y Seguimiento de Tamiz</span>
                            </h3>
                            <button
                                onClick={() => setShowMisBebesModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {misBebes.map((bebe) => (
                                <div key={bebe.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <p className="text-sm font-black text-slate-900">RN de {bebe.madre}</p>
                                        <p className="text-xs text-slate-600">{bebe.comunidad} • Nacido el {bebe.fechaNacimiento}</p>
                                        <p className="text-xs font-mono font-bold text-[#9D2449] mt-1">{bebe.folioTamiz}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold">
                                        {bebe.estatusTamiz}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: CREDENCIAL DIGITAL / QR SSO */}
            {showCredencialModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#9D2449]" />
                                <span>Credencial Digital Oficial</span>
                            </h3>
                            <button
                                onClick={() => setShowCredencialModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tarjeta Visual de Credencial */}
                        <div className="bg-gradient-to-b from-[#9D2449] to-[#7A1B38] p-5 rounded-2xl text-white shadow-lg space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-rose-200 bg-white/10 px-3 py-0.5 rounded-md border border-white/20">
                                GOBIERNO DEL ESTADO DE OAXACA • SSO
                            </span>
                            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto border-2 border-white flex items-center justify-center text-white font-black text-2xl">
                                {nombrePartera.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="text-base font-black text-white">{nombrePartera}</h4>
                                <p className="text-xs text-rose-200">Partera Tradicional Acreditada</p>
                                <p className="text-[11px] text-rose-100/80">Jurisdicción Sanitaria No. 2 - Istmo</p>
                            </div>

                            <div className="bg-white p-3 rounded-xl text-slate-900 flex items-center justify-center gap-3">
                                <QrCode className="w-16 h-16 text-[#9D2449]" />
                                <div className="text-left text-xs">
                                    <span className="text-[10px] text-slate-500 font-bold block">FOLIO VERIFICADO</span>
                                    <p className="font-mono font-black text-slate-900 text-sm">PAR-OAX-001</p>
                                    <span className="text-[10px] text-emerald-700 font-bold">VIGENCIA 2026-2027</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => alert('Imprimiendo copia física de credencial digital...')}
                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Imprimir Credencial</span>
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};
