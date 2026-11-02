import React, { useState, useEffect } from 'react';
import { Heart, Plus, X, ShieldCheck, MapPin, Languages, Phone, Key, QrCode, UserCheck, Printer, CheckCircle2, Loader2, AlertCircle, User, Sparkles } from 'lucide-react';
import type { ParteraCredencial } from './types';
import { http } from '../../../../services/http';

export const TabUsuariosParteras: React.FC = () => {
    // Estado del padrón de parteras
    const [parteras, setParteras] = useState<ParteraCredencial[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Carga oficial del padrón de parteras desde PostgreSQL (Render)
    useEffect(() => {
        const cargarParteras = async () => {
            setCargando(true);
            setErrorMessage(null);
            try {
                const response = await http.get('/admin/parteras');
                const rawData = response.data;
                let listaValida: ParteraCredencial[] = [];

                if (Array.isArray(rawData)) {
                    listaValida = rawData;
                } else if (rawData && typeof rawData === 'object') {
                    if (Array.isArray(rawData.parteras)) {
                        listaValida = rawData.parteras;
                    } else if (Array.isArray(rawData.data)) {
                        listaValida = rawData.data;
                    }
                }

                setParteras(listaValida);
            } catch (error: any) {
                console.error('Error al cargar padrón de parteras:', error);
                setErrorMessage('No se pudo conectar con el servidor para obtener el padrón de parteras.');
                setParteras([]);
            } finally {
                setCargando(false);
            }
        };

        cargarParteras();
    }, []);

    // Estados para modal de registro de nueva partera
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [nombres, setNombres] = useState('');
    const [apellidoPaterno, setApellidoPaterno] = useState('');
    const [apellidoMaterno, setApellidoMaterno] = useState('');
    const [newCurp, setNewCurp] = useState('');
    const [newLengua, setNewLengua] = useState('Zapoteco del Istmo');
    const [newTelefono, setNewTelefono] = useState('');
    const [newMunicipio, setNewMunicipio] = useState('Juchitán de Zaragoza');
    const [newComunidad, setNewComunidad] = useState('');
    const [newPin, setNewPin] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado para la Ventana Central de Confirmación de Éxito
    const [successModalData, setSuccessModalData] = useState<ParteraCredencial | null>(null);

    // Modal para Ver y Generar Credencial QR (Doble Cara con istmo.png y tono Guinda)
    const [selectedParteraQR, setSelectedParteraQR] = useState<ParteraCredencial | null>(null);

    const generateRandom4Pin = () => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        setNewPin(pin);
    };

    const handleRegisterPartera = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        const nombreCompletoCompuesto = `${nombres.trim()} ${apellidoPaterno.trim()} ${apellidoMaterno.trim()}`.trim();
        const pinGenerado = newPin || Math.floor(1000 + Math.random() * 9000).toString();

        const payload = {
            nombre: nombres.trim(),
            apellidoPaterno: apellidoPaterno.trim(),
            apellidoMaterno: apellidoMaterno.trim(),
            nombreCompleto: nombreCompletoCompuesto,
            curp: newCurp.toUpperCase(),
            lenguaMaterna: newLengua,
            telefonoRecaudo: newTelefono,
            municipio: newMunicipio,
            comunidadBarrio: newComunidad || 'Cabecera Municipal',
            comunidad: newComunidad || 'Cabecera Municipal',
            pin: pinGenerado,
            pinAcceso: pinGenerado,
            estatusAcreditacion: 'ACREDITADA'
        };

        try {
            const response = await http.post('/admin/parteras', payload);
            const datosServidor = response.data?.partera || response.data?.data || {};
            const pinFinalAsignado = datosServidor.pin || datosServidor.pinCuatroDigitos || pinGenerado;

            const creada: ParteraCredencial = {
                ...payload,
                ...datosServidor,
                pinCuatroDigitos: pinFinalAsignado,
                pin: pinFinalAsignado
            };

            setParteras((prev) => [creada, ...(Array.isArray(prev) ? prev : [])]);
            
            setShowRegisterModal(false);
            setSuccessModalData(creada);

            setNombres('');
            setApellidoPaterno('');
            setApellidoMaterno('');
            setNewCurp('');
            setNewTelefono('');
            setNewComunidad('');
            setNewPin('');
        } catch (error: any) {
            console.error('Error al registrar partera:', error);
            alert(error.response?.data?.error || error.response?.data?.message || 'Error al guardar la partera en la base de datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInitials = (name: string) => {
        if (!name || typeof name !== 'string') return 'PT';
        const words = name.split(' ').filter(Boolean);
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="space-y-6 text-white">

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes lgFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
                @keyframes lgModal{from{opacity:0;transform:scale(0.95) translateY(20px)}to{opacity:1;transform:none}}
                @keyframes lgPop{0%{transform:scale(0.8);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
                .lg-fade{animation:lgFade .35s ease both}
                .lg-modal{animation:lgModal .4s cubic-bezier(0.16,1,0.3,1) both}
                .lg-pop{animation:lgPop .45s cubic-bezier(0.34,1.56,0.64,1) both}
                .lg-quiet{scrollbar-width:none}
                .lg-quiet::-webkit-scrollbar{display:none}
                @media print {
                    body * { visibility: hidden; }
                    #printable-credentials, #printable-credentials * { visibility: visible; }
                    #printable-credentials {
                        position: fixed; left: 50%; top: 50%;
                        transform: translate(-50%, -50%);
                        display: flex; gap: 20px;
                        box-shadow: none !important;
                    }
                }
            `}} />

            {/* CABECERA INSTITUCIONAL */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-rose-950/40 rounded-2xl border border-rose-800/40 text-rose-300 backdrop-blur-md shadow-lg shadow-rose-950/40">
                        <Heart className="w-6 h-6 fill-rose-500/20" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                            Padrón Oficial de Parteras Tradicionales Acreditadas
                        </h2>
                        <p className="text-xs text-rose-100/80 font-medium mt-0.5">
                            Red Intercultural de Salud Materna • Istmo de Tehuantepec (Jurisdicción Sanitaria No. 2)
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        generateRandom4Pin();
                        setShowRegisterModal(true);
                    }}
                    className="px-5 py-3 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95 border border-white/30"
                >
                    <Plus className="w-4 h-4 text-rose-200" />
                    <span>+ Registrar Nueva Partera</span>
                </button>
            </div>

            {/* MENSAJE DE ERROR */}
            {errorMessage && (
                <div className="p-4 bg-rose-950/60 border border-rose-300/40 rounded-2xl flex items-center gap-3 text-rose-100 text-xs font-bold backdrop-blur-md">
                    <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* VISTA MÓVIL (< md) */}
            <div className="space-y-3 md:hidden">
                {cargando ? (
                    <div className="p-8 text-center text-xs text-rose-100/70 font-medium bg-slate-900/40 rounded-2xl border border-white/20 backdrop-blur-md flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        <span>Cargando padrón desde PostgreSQL...</span>
                    </div>
                ) : !Array.isArray(parteras) || parteras.length === 0 ? (
                    <div className="p-8 text-center text-xs text-rose-100/70 font-medium bg-slate-900/40 rounded-2xl border border-white/20 backdrop-blur-md">
                        No hay parteras registradas en el padrón.
                    </div>
                ) : (
                    parteras.map((p) => (
                        <div key={p.id || p.curp} className="p-4 bg-slate-900/50 rounded-2xl border border-white/20 shadow-lg backdrop-blur-xl space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9D2449] to-[#7A1B38] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                                        {getInitials(p.nombreCompleto)}
                                    </div>
                                    <div>
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-block mb-1">
                                            {p.estatusAcreditacion || 'ACREDITADA'}
                                        </span>
                                        <h3 className="text-xs font-black text-white leading-tight">
                                            {p.nombreCompleto || 'Sin nombre'}
                                        </h3>
                                        <p className="text-[10px] text-rose-200/70 font-mono mt-0.5">CURP: {p.curp}</p>
                                    </div>
                                </div>
                                <div className="bg-amber-500/20 text-amber-200 font-mono font-black text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 border border-amber-300/40 shrink-0 backdrop-blur-md">
                                    <Key className="w-3 h-3 text-amber-300" />
                                    <span>PIN: {p.pinCuatroDigitos || (p as any).pin}</span>
                                </div>
                            </div>

                            <div className="text-xs space-y-1.5 text-rose-50/90 bg-white/5 p-3 rounded-xl border border-white/10">
                                <div className="flex items-center gap-1.5 text-white font-bold">
                                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                    <span>{p.municipio} {p.comunidad ? `(${p.comunidad})` : ''}</span>
                                </div>
                                {p.lenguaMaterna && (
                                    <div className="text-[11px] text-rose-200/80 flex items-center gap-1.5">
                                        <Languages className="w-3 h-3 text-rose-400" />
                                        <span>Lengua: <strong className="text-white">{p.lenguaMaterna}</strong></span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedParteraQR(p)}
                                className="w-full py-2.5 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/30"
                            >
                                <QrCode className="w-4 h-4 text-rose-200" />
                                <span>Ver Credencial Oficial (Doble Cara)</span>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* TABLA PRO DE PADRÓN DE PARTERAS (ESCRITORIO >= md) */}
            <div className="hidden md:block overflow-x-auto rounded-3xl border border-white/30 bg-slate-900/40 shadow-2xl backdrop-blur-3xl">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                        <tr className="bg-white/5 text-rose-200 font-bold uppercase text-[11px] tracking-wider border-b border-white/20">
                            <th className="py-4 px-5">Partera Tradicional / Lengua</th>
                            <th className="py-4 px-5">CURP</th>
                            <th className="py-4 px-5">Ubicación (Municipio / Comunidad)</th>
                            <th className="py-4 px-5 text-center">PIN Táctil</th>
                            <th className="py-4 px-5 text-right">Credencialización</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-rose-50/90">
                        {cargando ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-rose-200 font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
                                        <span>Cargando padrón desde PostgreSQL (Render)...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : !Array.isArray(parteras) || parteras.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-rose-200/70 font-normal">
                                    No hay parteras registradas en el padrón.
                                </td>
                            </tr>
                        ) : (
                            parteras.map((p) => (
                                <tr key={p.id || p.curp} className="hover:bg-white/10 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9D2449] to-[#7A1B38] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                                                {getInitials(p.nombreCompleto)}
                                            </div>
                                            <div>
                                                <div className="font-black text-white text-xs">
                                                    {p.nombreCompleto || 'Sin nombre'}
                                                </div>
                                                <div className="text-[10px] text-rose-200/80 flex items-center gap-1 font-medium mt-0.5">
                                                    <Languages className="w-3 h-3 text-rose-400" />
                                                    <span>{p.lenguaMaterna || 'Español'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-5 font-mono text-rose-100 font-medium">{p.curp}</td>
                                    <td className="py-4 px-5">
                                        <div className="font-bold text-white">{p.municipio}</div>
                                        <div className="text-[11px] text-rose-200/70">{p.comunidad || 'Cabecera Municipal'}</div>
                                    </td>
                                    <td className="py-4 px-5 text-center">
                                        <span className="bg-amber-500/20 text-amber-200 font-mono font-black text-xs px-3 py-1.5 rounded-xl inline-flex items-center gap-1 border border-amber-300/40 shadow-sm backdrop-blur-md">
                                            <Key className="w-3.5 h-3.5 text-amber-300" />
                                            <span>{p.pinCuatroDigitos || (p as any).pin}</span>
                                        </span>
                                    </td>
                                    <td className="py-4 px-5 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedParteraQR(p)}
                                            className="px-4 py-2.5 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95 border border-white/30"
                                        >
                                            <QrCode className="w-4 h-4 text-rose-200" />
                                            <span>Ver Credencial</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL REGISTRAR PARTERA */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
                    <div className="bg-slate-900/95 border border-white/40 rounded-[32px] max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl shadow-slate-950/90 backdrop-blur-3xl max-h-[90vh] flex flex-col lg-modal">

                        <div className="flex items-center justify-between border-b border-white/20 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-950/40 rounded-2xl border border-rose-800/40 text-rose-300 backdrop-blur-md">
                                    <Heart className="w-5 h-5 fill-rose-500/20" />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight">Registrar Nueva Partera Acreditada</h3>
                                    <p className="text-[11px] text-rose-100/80 font-medium">Servicios de Salud de Oaxaca • Padrón de Medicina Tradicional</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowRegisterModal(false)}
                                className="p-2 text-rose-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto lg-quiet space-y-4 pr-1">
                            <div className="p-3.5 bg-rose-950/30 border border-rose-800/40 rounded-2xl flex items-start gap-3 text-xs text-rose-100 backdrop-blur-md">
                                <ShieldCheck className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                                <div>
                                    <span className="font-extrabold uppercase tracking-wider block text-[10px] text-rose-300">Acreditación Comunitaria e Identidad Intercultural</span>
                                    <p className="text-rose-50/90 font-medium text-[11px]">
                                        Complete los datos oficiales. Al guardar, el sistema generará de inmediato su credencial con código QR de acceso seguro.
                                    </p>
                                </div>
                            </div>

                            <form id="partera-form" onSubmit={handleRegisterPartera} className="space-y-4 text-xs font-semibold">
                                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-3 backdrop-blur-md">
                                    <span className="text-[10px] font-black uppercase text-rose-300 tracking-wider block flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        <span>Identidad Oficial (Nombres y Apellidos *)</span>
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1">Nombre(s) *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. María Elena"
                                                value={nombres}
                                                onChange={(e) => setNombres(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1">Apellido Paterno *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. Velasco"
                                                value={apellidoPaterno}
                                                onChange={(e) => setApellidoPaterno(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1">Apellido Materno *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. Morales"
                                                value={apellidoMaterno}
                                                onChange={(e) => setApellidoMaterno(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    <div className="space-y-3.5">
                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1 flex items-center justify-between">
                                                <span>CURP de la Partera *</span>
                                                <span className={`text-[10px] font-mono font-bold ${newCurp.length === 18 ? 'text-emerald-300' : 'text-rose-200/60'}`}>
                                                    {newCurp.length}/18
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={18}
                                                placeholder="VEMA650810MOCMNS09"
                                                value={newCurp}
                                                onChange={(e) => setNewCurp(e.target.value.toUpperCase())}
                                                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white uppercase font-mono placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 font-medium"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1 flex items-center gap-1.5">
                                                <Languages className="w-3.5 h-3.5 text-rose-400" />
                                                <span>Lengua Materna *</span>
                                            </label>
                                            <select
                                                value={newLengua}
                                                onChange={(e) => setNewLengua(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/30 rounded-xl text-white focus:outline-none focus:border-rose-400 font-semibold"
                                            >
                                                <option value="Zapoteco del Istmo">Zapoteco del Istmo (Diidxazá)</option>
                                                <option value="Ombeayiüts / Huave">Ombeayiüts / Huave (San Mateo / Ikoods)</option>
                                                <option value="Mixe">Mixe (Ayuuk)</option>
                                                <option value="Zoque">Zoque (Angpøiny)</option>
                                                <option value="Español">Español</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3.5">
                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1">Municipio / Localidad *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. Juchitán de Zaragoza"
                                                value={newMunicipio}
                                                onChange={(e) => setNewMunicipio(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 font-semibold"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1">Comunidad / Barrio / Sección</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Sección Segunda"
                                                value={newComunidad}
                                                onChange={(e) => setNewComunidad(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-white/20">
                                    <div>
                                        <label className="block text-rose-100 font-bold mb-1">Teléfono / Recaudo</label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-rose-400 absolute left-3.5 top-3" />
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                placeholder="971 123 4567"
                                                value={newTelefono}
                                                onChange={(e) => setNewTelefono(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white font-mono placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-rose-100 font-bold mb-1 flex items-center justify-between">
                                            <span>PIN Táctil (4 Dígitos) *</span>
                                            <button
                                                type="button"
                                                onClick={generateRandom4Pin}
                                                className="text-[10px] text-rose-300 hover:underline font-bold cursor-pointer"
                                            >
                                                Generar PIN
                                            </button>
                                        </label>
                                        <div className="relative">
                                            <Key className="w-4 h-4 text-amber-300 absolute left-3.5 top-3" />
                                            <input
                                                type="text"
                                                required
                                                maxLength={4}
                                                placeholder="Ej. 4892"
                                                value={newPin}
                                                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-10 pr-3.5 py-2.5 bg-amber-500/20 border border-amber-300/50 rounded-xl text-amber-100 font-mono font-black text-sm tracking-widest focus:outline-none focus:border-rose-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="flex gap-3 pt-3 border-t border-white/25 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowRegisterModal(false)}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors cursor-pointer border border-white/20 text-xs"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="partera-form"
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:brightness-110 text-white font-extrabold rounded-xl shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60 border border-white/40 text-xs"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="w-4 h-4 text-rose-200" />
                                        <span>Guardar y Ver Credencial</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VENTANA CENTRAL DE CONFIRMACIÓN DE ÉXITO */}
            {successModalData && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-rose-500/50 rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-5 shadow-[0_0_50px_rgba(157,36,73,0.3)] text-center relative overflow-hidden lg-pop">
                        <div aria-hidden="true" className="absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-rose-600/25 blur-3xl pointer-events-none" />

                        <div className="relative mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-950/50 ring-4 ring-emerald-300/30">
                            <CheckCircle2 className="size-10 text-white animate-bounce" />
                        </div>

                        <div className="space-y-1.5 relative z-10">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-950/60 px-3 py-0.5 rounded-full border border-rose-800/50">
                                <Sparkles className="w-3.5 h-3.5" />
                                Acreditación Exitosa en PostgreSQL
                            </span>
                            <h3 className="text-xl font-black text-white tracking-tight">
                                ¡Partera Registrada con Éxito!
                            </h3>
                            <p className="text-xs text-rose-100/80 leading-relaxed">
                                Se ha completado el alta oficial de <strong className="text-white">{successModalData.nombreCompleto}</strong> en el sistema de la Jurisdicción Sanitaria No. 2.
                            </p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-xs space-y-2 text-left relative z-10 backdrop-blur-md">
                            <div className="flex justify-between">
                                <span className="text-rose-200/70">CURP:</span>
                                <span className="font-mono font-bold text-white">{successModalData.curp}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-rose-200/70">Ubicación:</span>
                                <span className="font-bold text-white">{successModalData.municipio}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-rose-200/70">PIN Táctil Asignado:</span>
                                <span className="font-mono font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-300/40">
                                    {successModalData.pinCuatroDigitos || (successModalData as any).pin}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2 relative z-10">
                            <button
                                type="button"
                                onClick={() => setSuccessModalData(null)}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const parteraActual = successModalData;
                                    setSuccessModalData(null);
                                    setSelectedParteraQR(parteraActual);
                                }}
                                className="flex-1 py-3 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-950/40 transition-all cursor-pointer border border-white/40 flex items-center justify-center gap-1.5"
                            >
                                <QrCode className="size-4" />
                                <span>Ver Credencial (Doble Cara)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREDENCIAL OFICIAL DOBLE CARA (FRENTE Y REVERSO EN TONO GUINDA CON istmo.png) */}
            {selectedParteraQR && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 overflow-y-auto">
                    <div className="bg-slate-900/90 border border-rose-500/50 rounded-[32px] p-5 sm:p-6 shadow-2xl shadow-slate-950/90 max-w-4xl w-full space-y-5 text-center relative backdrop-blur-3xl lg-modal">
                        
                        <div className="flex items-center justify-between border-b border-white/20 pb-3">
                            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                                <ShieldCheck className="w-4 h-4 text-rose-400" />
                                <span>Previsualización Oficial de Credencial de Identidad (Frente y Reverso)</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedParteraQR(null)}
                                className="p-2 text-rose-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* CONTENEDOR IMPRIMIBLE DOBLE CARA */}
                        <div id="printable-credentials" className="grid grid-cols-1 md:grid-cols-2 gap-5 justify-items-center py-2">
                            
                            {/* --- FRENTE DE LA CREDENCIAL --- */}
                            <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 w-full max-w-[340px] h-[510px] shadow-xl text-slate-900 relative flex flex-col justify-between overflow-hidden">
                                
                                {/* Encabezado Institucional */}
                                <div className="flex items-center justify-between border-b-2 border-rose-900/20 pb-2.5">
                                    <img src="/logo-jurisdiccion.png" alt="Jurisdicción" className="h-8 w-auto object-contain mix-blend-multiply" />
                                    <div className="text-center">
                                        <span className="text-[9px] font-black uppercase text-[#9D2449] tracking-wider block">SSO OAXACA</span>
                                        <span className="text-[8px] font-bold text-slate-600 block">JURISDICCIÓN SANITARIA NO. 2</span>
                                    </div>
                                    <img src="/Logo-Secretaria.png" alt="Secretaría" className="h-8 w-auto object-contain mix-blend-multiply" />
                                </div>

                                <div className="bg-[#9D2449] text-white py-1.5 px-2 rounded-xl shadow-xs border border-rose-900">
                                    <span className="text-[10px] font-black uppercase tracking-wider block">
                                        CREDENCIAL DE ACREDITACIÓN OFICIAL
                                    </span>
                                    <span className="text-[8px] font-medium text-rose-200 block">Medicina Tradicional e Interculturalidad</span>
                                </div>

                                {/* Datos de la Partera */}
                                <div className="space-y-2 relative z-10 my-auto">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9D2449] to-[#6E1833] text-white mx-auto flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
                                        {getInitials(selectedParteraQR.nombreCompleto)}
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 leading-tight pt-0.5">
                                        {selectedParteraQR.nombreCompleto || 'Partera Tradicional Acreditada'}
                                    </h4>
                                    <div className="inline-block bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                                        <span className="text-[11px] text-slate-700 font-mono font-bold tracking-wide">
                                            CURP: {selectedParteraQR.curp || 'No registrada'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-bold text-[#9D2449]">
                                        {selectedParteraQR.municipio || 'Juchitán de Zaragoza'} {selectedParteraQR.comunidad ? `• ${selectedParteraQR.comunidad}` : ''}
                                    </p>
                                    {selectedParteraQR.lenguaMaterna && (
                                        <p className="text-[10px] text-slate-500 font-medium">Lengua: <strong className="text-slate-800">{selectedParteraQR.lenguaMaterna}</strong></p>
                                    )}
                                </div>

                                {/* Cintillo Floral Istmeño (Fondo Inferior transparente istmo.png) */}
                                <div className="absolute bottom-0 inset-x-0 h-24 overflow-hidden pointer-events-none flex justify-center items-end pb-1">
                                    <img src="/istmo.png" alt="Bordado Istmeño" className="w-full h-auto object-contain opacity-100 max-h-20" />
                                </div>
                            </div>

                            {/* --- REVERSO DE LA CREDENCIAL --- */}
                            <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 w-full max-w-[340px] h-[510px] shadow-xl text-slate-900 relative flex flex-col justify-between overflow-hidden">
                                
                                <div className="text-center pt-1">
                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">ÁREA DE AUTENTICACIÓN DIGITAL</span>
                                </div>

                                <div className="bg-amber-100/80 text-amber-950 font-bold px-3 py-1.5 rounded-xl border border-amber-300 mx-auto text-xs flex items-center gap-1.5 shadow-2xs">
                                    <Key className="w-3.5 h-3.5 text-amber-700" />
                                    <span>PIN TÁCTIL: <strong className="font-mono font-black text-sm text-[#9D2449]">{selectedParteraQR.pinCuatroDigitos || (selectedParteraQR as any).pin || '0000'}</strong></span>
                                </div>

                                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 max-w-[150px] mx-auto shadow-2xs my-auto">
                                    <div className="w-28 h-28 mx-auto bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1.5 shadow-inner">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                                selectedParteraQR.pinCuatroDigitos || (selectedParteraQR as any).pin || '0000'
                                            )}`}
                                            alt="Código QR de Acceso Rápido"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <span className="text-[9px] text-slate-500 font-mono mt-1.5 block font-extrabold uppercase">Escanear para Login</span>
                                </div>

                                <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-800 font-extrabold pb-6">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Credencial Oficial Verificada • SSO</span>
                                </div>

                                {/* Cintillo Floral Istmeño (Fondo Inferior Reverso transparente istmo.png) */}
                                <div className="absolute bottom-0 inset-x-0 h-24 overflow-hidden pointer-events-none flex justify-center items-end pb-1">
                                    <img src="/istmo.png" alt="Bordado Istmeño" className="w-full h-auto object-contain opacity-100 max-h-20" />
                                </div>
                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="w-full max-w-sm mx-auto py-3.5 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border border-white/40"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Imprimir / Descargar Credenciales Oficiales (Doble Cara)</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TabUsuariosParteras;