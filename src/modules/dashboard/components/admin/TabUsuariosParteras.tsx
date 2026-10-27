import React, { useState, useEffect } from 'react';
import { Heart, Plus, X, ShieldCheck, MapPin, Languages, Phone, Key, QrCode, UserCheck, Printer, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import type { ParteraCredencial, UnidadCLUES } from './types';
import { getCluesCatalog, subscribeCluesCatalog } from './cluesData';
import { http } from '../../../../services/http';

export const TabUsuariosParteras: React.FC = () => {
    // Estado del padrón de parteras
    const [parteras, setParteras] = useState<ParteraCredencial[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Catálogo dinámico de CLUES
    const [cluesList, setCluesList] = useState<UnidadCLUES[]>(getCluesCatalog());

    useEffect(() => {
        const unsubscribe = subscribeCluesCatalog((updatedList) => {
            setCluesList(updatedList);
        });
        return unsubscribe;
    }, []);

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
    const [selectedCluesId, setSelectedCluesId] = useState('');
    const [newPin, setNewPin] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal para Ver y Generar Credencial QR
    const [selectedParteraQR, setSelectedParteraQR] = useState<ParteraCredencial | null>(null);

    useEffect(() => {
        if (cluesList.length > 0 && !selectedCluesId) {
            setSelectedCluesId(cluesList[0].id);
        }
    }, [cluesList, selectedCluesId]);

    const generateRandom4Pin = () => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        setNewPin(pin);
    };

    const handleRegisterPartera = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        const unit = cluesList.find((u) => u.id === selectedCluesId) || cluesList[0];
        const nombreCompletoCompuesto = `${nombres.trim()} ${apellidoPaterno.trim()} ${apellidoMaterno.trim()}`.trim();
        const pinGenerado = newPin || Math.floor(1000 + Math.random() * 9000).toString();

        const payload = {
            nombreCompleto: nombreCompletoCompuesto,
            curp: newCurp.toUpperCase(),
            lenguaMaterna: newLengua,
            telefonoRecaudo: newTelefono,
            municipio: newMunicipio,
            comunidad: newComunidad || 'Cabecera Municipal',
            centroSaludAdscripcion: unit ? unit.nombre : 'Centro de Salud',
            cluesAdscripcion: unit ? unit.clues : 'OASSA000000',
            pinCuatroDigitos: pinGenerado,
            estatusAcreditacion: 'ACREDITADA'
        };

        try {
            const response = await http.post('/admin/parteras', payload);
            const creada: ParteraCredencial = response.data?.partera || response.data || payload;

            setParteras((prev) => [creada, ...(Array.isArray(prev) ? prev : [])]);
            
            setShowRegisterModal(false);
            setSelectedParteraQR(creada);

            setNombres('');
            setApellidoPaterno('');
            setApellidoMaterno('');
            setNewCurp('');
            setNewTelefono('');
            setNewComunidad('');
            setNewPin('');
        } catch (error: any) {
            console.error('Error al registrar partera:', error);
            alert(error.response?.data?.message || 'Error al guardar la partera en la base de datos.');
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
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">

            {/* ESTILOS CSS PARA IMPRESIÓN PROFESIONAL DE LA CREDENCIAL */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-credential, #printable-credential * {
                        visibility: visible;
                    }
                    #printable-credential {
                        position: fixed;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        width: 100%;
                        max-width: 380px;
                        box-shadow: none !important;
                        border: 2px solid #9D2449 !important;
                    }
                }
            `}} />

            {/* CABECERA INSTITUCIONAL */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <img
                        src="/logo-jurisdiccion.png"
                        alt="Logo Jurisdicción Sanitaria No. 2"
                        className="h-12 w-auto object-contain mix-blend-multiply hidden sm:block"
                    />
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-[#9D2449] fill-rose-100" />
                            <span>Padrón Oficial de Parteras Tradicionales Acreditadas</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
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
                    className="px-4 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95"
                >
                    <Plus className="w-4 h-4 text-rose-200" />
                    <span>+ Registrar Nueva Partera</span>
                </button>
            </div>

            {/* MENSAJE DE ERROR SI FALLA LA API */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-bold">
                    <AlertCircle className="w-5 h-5 text-[#9D2449] shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* VISTA MÓVIL (< md) */}
            <div className="space-y-3 md:hidden">
                {cargando ? (
                    <div className="p-8 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#9D2449]" />
                        <span>Cargando padrón desde PostgreSQL (Render)...</span>
                    </div>
                ) : !Array.isArray(parteras) || parteras.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200">
                        No hay parteras registradas en el padrón.
                    </div>
                ) : (
                    parteras.map((p) => (
                        <div key={p.id || p.curp} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-[#9D2449] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-rose-200">
                                        {getInitials(p.nombreCompleto)}
                                    </div>
                                    <div>
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block mb-0.5">
                                            {p.estatusAcreditacion || 'ACREDITADA'}
                                        </span>
                                        <h3 className="text-xs font-black text-slate-900">{p.nombreCompleto || 'Sin nombre'}</h3>
                                        <p className="text-[10px] text-slate-500 font-mono">CURP: {p.curp}</p>
                                    </div>
                                </div>
                                <div className="bg-amber-100 text-amber-900 font-mono font-black text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 border border-amber-300 shrink-0">
                                    <Key className="w-3 h-3 text-amber-700" />
                                    <span>PIN: {p.pinCuatroDigitos}</span>
                                </div>
                            </div>

                            <div className="text-xs space-y-1 text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-1 text-slate-800 font-bold">
                                    <MapPin className="w-3.5 h-3.5 text-[#9D2449]" />
                                    <span>{p.municipio} {p.comunidad ? `(${p.comunidad})` : ''}</span>
                                </div>
                                {p.lenguaMaterna && (
                                    <div className="text-[11px] text-slate-600 flex items-center gap-1 pt-1">
                                        <Languages className="w-3 h-3 text-slate-400" />
                                        <span>Lengua: <strong>{p.lenguaMaterna}</strong></span>
                                    </div>
                                )}
                                {p.centroSaludAdscripcion && (
                                    <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100 mt-1 flex justify-between">
                                        <span>Adscripción CLUES:</span>
                                        <span className="font-bold text-[#9D2449] truncate max-w-[150px]">{p.centroSaludAdscripcion}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedParteraQR(p)}
                                className="w-full py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                <QrCode className="w-4 h-4 text-rose-200" />
                                <span>Ver Credencial QR Oficial</span>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* TABLA PRO DE PADRÓN DE PARTERAS (ESCRITORIO >= md) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                        <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                            <th className="py-3.5 px-4">Partera Tradicional / Lengua</th>
                            <th className="py-3.5 px-4">CURP</th>
                            <th className="py-3.5 px-4">Ubicación (Municipio / Comunidad)</th>
                            <th className="py-3.5 px-4">Centro de Salud (CLUES)</th>
                            <th className="py-3.5 px-4 text-center">PIN Táctil</th>
                            <th className="py-3.5 px-4 text-right">Credencialización</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {cargando ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#9D2449]" />
                                        <span>Cargando padrón desde PostgreSQL (Render)...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : !Array.isArray(parteras) || parteras.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-400 font-normal">
                                    No hay parteras registradas en el padrón.
                                </td>
                            </tr>
                        ) : (
                            parteras.map((p) => (
                                <tr key={p.id || p.curp} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#9D2449] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-rose-200">
                                                {getInitials(p.nombreCompleto)}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900">{p.nombreCompleto || 'Sin nombre'}</div>
                                                <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                                                    <Languages className="w-3 h-3 text-[#9D2449]" />
                                                    <span>{p.lenguaMaterna || 'Español'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-slate-600">{p.curp}</td>
                                    <td className="py-3.5 px-4">
                                        <div className="font-bold text-slate-800">{p.municipio}</div>
                                        <div className="text-[11px] text-slate-500">{p.comunidad}</div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="font-bold text-slate-800 truncate max-w-[180px]">{p.centroSaludAdscripcion || 'Centro de Salud'}</div>
                                        {p.cluesAdscripcion && (
                                            <span className="text-[10px] font-mono text-[#9D2449] font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                                {p.cluesAdscripcion}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <span className="bg-amber-100 text-amber-900 font-mono font-black text-xs px-2.5 py-1 rounded-xl inline-flex items-center gap-1 border border-amber-300 shadow-sm">
                                            <Key className="w-3 h-3 text-amber-700" />
                                            <span>{p.pinCuatroDigitos}</span>
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedParteraQR(p)}
                                            className="px-3.5 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
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

            {/* MODAL REGISTRAR PARTERA ACREDITADA */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">

                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-200 text-[#9D2449]">
                                    <Heart className="w-6 h-6 fill-rose-100" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Registrar Nueva Partera Acreditada</h3>
                                    <p className="text-xs text-slate-500 font-medium">Servicios de Salud de Oaxaca • Padrón de Medicina Tradicional</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowRegisterModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                            <ShieldCheck className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
                            <div className="space-y-0.5">
                                <span className="font-extrabold uppercase tracking-wider block text-[10px]">Acreditación Comunitaria e Identidad Intercultural</span>
                                <p className="text-slate-700 font-medium text-[11px]">
                                    Al guardar el registro, el sistema generará automáticamente la credencial QR oficial lista para imprimir.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleRegisterPartera} className="space-y-4 text-xs font-semibold">

                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                                <span className="text-[10px] font-black uppercase text-[#9D2449] tracking-wider block">
                                    Identidad de la Partera (Nombres y Apellidos *):
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1">Nombre(s) *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. María Elena"
                                            value={nombres}
                                            onChange={(e) => setNombres(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1">Apellido Paterno *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Velasco"
                                            value={apellidoPaterno}
                                            onChange={(e) => setApellidoPaterno(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1">Apellido Materno *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Morales"
                                            value={apellidoMaterno}
                                            onChange={(e) => setApellidoMaterno(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3.5">
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                                            <span>CURP de la Partera *</span>
                                            <span className={`text-[10px] font-mono font-bold ${newCurp.length === 18 ? 'text-emerald-600' : 'text-slate-400'}`}>
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
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 uppercase font-mono focus:outline-none focus:border-[#9D2449]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1 flex items-center gap-1.5">
                                            <Languages className="w-3.5 h-3.5 text-[#9D2449]" />
                                            <span>Lengua Materna *</span>
                                        </label>
                                        <select
                                            value={newLengua}
                                            onChange={(e) => setNewLengua(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] font-semibold"
                                        >
                                            <option value="Zapoteco del Istmo">Zapoteco del Istmo (Diidxazá)</option>
                                            <option value="Ombeayiüts / Huave">Ombeayiüts / Huave (San Mateo / Ikoods)</option>
                                            <option value="Mixe">Mixe (Ayuuk)</option>
                                            <option value="Zoque">Zoque (Angpøiny)</option>
                                            <option value="Español">Español</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1">Teléfono / Teléfono de Recaudo</label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                placeholder="971 123 4567"
                                                value={newTelefono}
                                                onChange={(e) => setNewTelefono(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-[#9D2449]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3.5">
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1">Municipio / Localidad * (Texto Libre)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Escriba el municipio..."
                                            value={newMunicipio}
                                            onChange={(e) => setNewMunicipio(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] font-semibold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1">Comunidad / Barrio / Sección</label>
                                        <input
                                            type="text"
                                            placeholder="Ej. Sección Segunda"
                                            value={newComunidad}
                                            onChange={(e) => setNewComunidad(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1">Centro de Salud Adscrito (CLUES) *</label>
                                        <select
                                            value={selectedCluesId}
                                            onChange={(e) => setSelectedCluesId(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] text-xs font-semibold"
                                        >
                                            {cluesList.map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.nombre} [{unit.clues}]
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                                            <span>PIN Táctil de Acceso (4 Dígitos Numéricos) *</span>
                                            <button
                                                type="button"
                                                onClick={generateRandom4Pin}
                                                className="text-[10px] text-[#9D2449] hover:underline font-bold"
                                            >
                                                Generar PIN
                                            </button>
                                        </label>
                                        <div className="relative">
                                            <Key className="w-4 h-4 text-amber-600 absolute left-3 top-3" />
                                            <input
                                                type="text"
                                                required
                                                maxLength={4}
                                                placeholder="Ej. 4892"
                                                value={newPin}
                                                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-9 pr-3 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 font-mono font-black text-sm tracking-widest focus:outline-none focus:border-[#9D2449]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowRegisterModal(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Guardando y Generando Credencial...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="w-4 h-4 text-rose-200" />
                                            <span>Guardar y Ver Credencial QR</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREDENCIAL QR OFICIAL PROFESIONAL INSTITUCIONAL */}
            {selectedParteraQR && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div 
                        id="printable-credential"
                        className="bg-white border-2 border-[#9D2449]/30 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4 text-center relative overflow-hidden"
                    >
                        {/* MARCA DE AGUA INSTITUCIONAL DE FONDO */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                            <Heart className="w-64 h-64 text-[#9D2449]" />
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedParteraQR(null)}
                            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* ENCABEZADO OFICIAL SSO */}
                        <div className="flex items-center justify-between border-b-2 border-[#9D2449]/20 pb-3 pt-1">
                            <img
                                src="/logo-jurisdiccion.png"
                                alt="Jurisdicción"
                                className="h-10 w-auto object-contain mix-blend-multiply"
                            />
                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase text-[#9D2449] tracking-wider block">SSO OAXACA</span>
                                <span className="text-[9px] font-bold text-slate-600 block">JURISDICCIÓN SANITARIA NO. 2</span>
                            </div>
                            <img
                                src="/Logo-Secretaria.png"
                                alt="Secretaría"
                                className="h-10 w-auto object-contain mix-blend-multiply"
                            />
                        </div>

                        {/* TÍTULO EJECUTIVO DE ACREDITACIÓN */}
                        <div className="bg-[#9D2449] text-white py-2 px-3 rounded-xl shadow-md border border-rose-900">
                            <span className="text-[11px] font-black uppercase tracking-wider block">
                                CREDENCIAL DE ACREDITACIÓN OFICIAL
                            </span>
                            <span className="text-[9px] font-medium text-rose-200 block">Medicina Tradicional e Interculturalidad</span>
                        </div>

                        {/* DATOS DE IDENTIDAD DE LA PARTERA */}
                        <div className="space-y-1.5 text-slate-900 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9D2449] to-[#6E1833] text-white mx-auto flex items-center justify-center font-black text-xl shadow-lg border-2 border-white">
                                {getInitials(selectedParteraQR.nombreCompleto)}
                            </div>
                            <h4 className="text-base font-black text-slate-900 pt-1 leading-tight">{selectedParteraQR.nombreCompleto}</h4>
                            <div className="inline-block bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                                <span className="text-xs text-slate-700 font-mono font-bold tracking-wide">CURP: {selectedParteraQR.curp}</span>
                            </div>
                            <p className="text-xs font-bold text-[#9D2449]">{selectedParteraQR.municipio} {selectedParteraQR.comunidad ? `• ${selectedParteraQR.comunidad}` : ''}</p>
                            {selectedParteraQR.lenguaMaterna && (
                                <p className="text-[11px] text-slate-600 font-medium">Lengua Materna: <strong className="text-slate-800">{selectedParteraQR.lenguaMaterna}</strong></p>
                            )}
                        </div>

                        {/* UNIDAD ADSCRITA / CLUES */}
                        {selectedParteraQR.centroSaludAdscripcion && (
                            <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-200 text-left text-xs space-y-1 relative z-10">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold uppercase text-[#9D2449]">Unidad Médica Adscrita:</span>
                                    {selectedParteraQR.cluesAdscripcion && (
                                        <span className="font-mono text-[10px] font-black bg-white px-2 py-0.5 rounded text-slate-800 border border-rose-300">
                                            {selectedParteraQR.cluesAdscripcion}
                                        </span>
                                    )}
                                </div>
                                <div className="font-bold text-slate-900">{selectedParteraQR.centroSaludAdscripcion}</div>
                            </div>
                        )}

                        {/* PIN TÁCTIL DE ACCESO */}
                        <div className="bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 text-amber-950 font-bold px-4 py-2.5 rounded-2xl border border-amber-300 w-fit mx-auto text-xs flex items-center gap-2 shadow-sm relative z-10">
                            <Key className="w-4 h-4 text-amber-700" />
                            <span>PIN TÁCTIL DE ACCESO: <strong className="font-mono font-black text-sm text-[#9D2449]">{selectedParteraQR.pinCuatroDigitos}</strong></span>
                        </div>

                        {/* CÓDIGO QR DINÁMICO EXCLUSIVO CON EL PIN (LOGIN RÁPIDO) */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 max-w-[160px] mx-auto shadow-sm relative z-10">
                            <div className="w-32 h-32 mx-auto bg-white border border-slate-300 rounded-xl flex items-center justify-center p-2 shadow-inner">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                        selectedParteraQR.pinCuatroDigitos
                                    )}`}
                                    alt="Código QR de Acceso Rápido"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-[10px] text-slate-600 font-mono mt-1.5 block font-extrabold">Escanear para Login</span>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-800 font-extrabold relative z-10">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Credencial Oficial Verificada • SSO</span>
                        </div>

                        {/* BOTÓN IMPRIMIR / DESCARGAR */}
                        <button
                            type="button"
                            onClick={() => {
                                window.print();
                            }}
                            className="w-full py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all relative z-10"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Imprimir / Descargar Credencial Oficial</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TabUsuariosParteras;