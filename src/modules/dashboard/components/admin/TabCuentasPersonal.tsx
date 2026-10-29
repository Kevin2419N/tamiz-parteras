import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, X, Mail, Shield, ShieldCheck, Phone, Lock, Building2, Loader2, AlertCircle } from 'lucide-react';
import type { UsuarioSSO, UnidadCLUES } from './types';
import { getCluesCatalog, subscribeCluesCatalog } from './cluesData';
import { http } from '../../../../services/http';

export const TabCuentasPersonal: React.FC = () => {
    // Estado de los usuarios institucionales
    const [usuarios, setUsuarios] = useState<UsuarioSSO[]>([]);
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

    // Carga oficial de usuarios desde PostgreSQL (Render) -> Ruta sincronizada a /admin/usuarios-sso
    useEffect(() => {
        const cargarUsuarios = async () => {
            setCargando(true);
            setErrorMessage(null);
            try {
                const response = await http.get('/admin/usuarios-sso');
                if (response.data) {
                    setUsuarios(response.data);
                }
            } catch (error: any) {
                console.error('Error al cargar cuentas de personal:', error);
                setErrorMessage('No se pudo conectar con el servidor para obtener las cuentas de personal.');
            } finally {
                setCargando(false);
            }
        };

        cargarUsuarios();
    }, []);

    // Form modal state (Desglose en 3 campos)
    const [showModal, setShowModal] = useState(false);
    const [nombres, setNombres] = useState('');
    const [apellidoPaterno, setApellidoPaterno] = useState('');
    const [apellidoMaterno, setApellidoMaterno] = useState('');
    const [curp, setCurp] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [rol, setRol] = useState<UsuarioSSO['rol']>('CAPTURISTA_TAMIZ');
    const [selectedCluesId, setSelectedCluesId] = useState<string>('');
    const [pinTemporal, setPinTemporal] = useState('');
    const [showPinText, setShowPinText] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize selected CLUES when modal opens or cluesList updates
    useEffect(() => {
        if (cluesList.length > 0 && !selectedCluesId) {
            setSelectedCluesId(cluesList[0].id);
        }
    }, [cluesList, selectedCluesId]);

    // Normalizador para correo electrónico institucional
    const cleanStringForEmail = (str: string) => {
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");
    };

    // Autogenerar Correo Institucional en tiempo real
    const handleNombreChange = (val: string) => {
        setNombres(val);
        generateAutoEmail(val, apellidoPaterno);
    };

    const handleApellidoPaternoChange = (val: string) => {
        setApellidoPaterno(val);
        generateAutoEmail(nombres, val);
    };

    const generateAutoEmail = (nom: string, pat: string) => {
        const primerNombre = cleanStringForEmail(nom.trim().split(' ')[0] || '');
        const pPaterno = cleanStringForEmail(pat.trim());
        if (primerNombre && pPaterno) {
            setEmail(`${primerNombre}.${pPaterno}@salud.oaxaca.gob.mx`);
        } else if (primerNombre) {
            setEmail(`${primerNombre}@salud.oaxaca.gob.mx`);
        }
    };

    const generateRandomPin = () => {
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        setPinTemporal(pin);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        const foundUnit = cluesList.find((u) => u.id === selectedCluesId) || cluesList[0];
        const nombreCompleto = `${nombres.trim()} ${apellidoPaterno.trim()} ${apellidoMaterno.trim()}`.trim();

        const payload = {
            nombre: nombres.trim(),
            apellidoPaterno: apellidoPaterno.trim(),
            apellidoMaterno: apellidoMaterno.trim(),
            curp: curp.toUpperCase(),
            correoInstitucional: email.toLowerCase(),
            telefono,
            municipio: municipio.trim() || foundUnit?.municipio || 'Juchitán de Zaragoza',
            rol,
            unidadMedicaId: foundUnit ? foundUnit.id : null,
            unidadAsignada: foundUnit ? `${foundUnit.nombre} (${foundUnit.clues})` : 'Unidad Médica SSO',
            clues: foundUnit?.clues || 'OASSA000000',
            pinTemporal: pinTemporal || '123456',
            estatus: 'ACTIVO'
        };

        try {
            // Ruta oficial unificada en /admin/usuarios-sso
            const response = await http.post('/admin/usuarios-sso', payload);
            const newUser: UsuarioSSO = response.data.usuario || response.data;

            setUsuarios([newUser, ...usuarios]);
            setShowModal(false);

            // Reset form
            setNombres('');
            setApellidoPaterno('');
            setApellidoMaterno('');
            setCurp('');
            setEmail('');
            setTelefono('');
            setMunicipio('');
            setPinTemporal('');
        } catch (error: any) {
            console.error('Error al crear usuario institucional:', error);
            alert(error.response?.data?.message || 'Error al guardar el usuario en la base de datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRoleBadgeLabel = (r: UsuarioSSO['rol']) => {
        switch (r) {
            case 'ADMIN_JURISDICCIONAL': return 'Administrador Jurisdiccional';
            case 'CAPTURISTA_TAMIZ': return 'Capturista de Tamiz';
            case 'MEDICO_UNIDAD': return 'Médico de Unidad';
            default: return r;
        }
    };

    const getInitials = (name: string) => {
        const words = name.replace(/^(Dr\.|Dra\.|Lic\.|Enf\.)\s+/, '').split(' ').filter(Boolean);
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">

            {/* CABECERA CON LOGOS INSTITUCIONALES */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <img
                        src="/logo-jurisdiccion.png"
                        alt="Logo Jurisdicción"
                        className="h-12 w-auto object-contain mix-blend-multiply hidden sm:block"
                    />
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-[#9D2449]" />
                            <span>Cuentas del Personal de Salud (Servidores Públicos SSO)</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Gestión de accesos institucionales para médicos, capturistas de tamiz y administradores jurisdiccionales.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        generateRandomPin();
                        setShowModal(true);
                    }}
                    className="px-4 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95"
                >
                    <Plus className="w-4 h-4 text-rose-200" />
                    <span>+ Crear Usuario Institucional</span>
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
                        <span>Cargando cuentas desde PostgreSQL (Render)...</span>
                    </div>
                ) : usuarios.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                        No hay cuentas de personal registradas.
                    </div>
                ) : (
                    usuarios.map((u) => (
                        <div key={u.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-[#9D2449] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-rose-200">
                                        {getInitials(u.nombre)}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-slate-900">{u.nombre}</h3>
                                        {u.curp && <p className="text-[10px] text-slate-500 font-mono">CURP: {u.curp}</p>}
                                        <p className="text-[11px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                                            <Mail className="w-3 h-3 text-slate-400" />
                                            {u.email}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                    {u.estatus}
                                </span>
                            </div>

                            <div className="text-xs space-y-1 text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-800">Rol Asignado:</span>
                                    <span className="font-black text-[#9D2449]">{getRoleBadgeLabel(u.rol)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                    <span className="font-bold text-slate-800">Adscripción / CLUES:</span>
                                    <span className="truncate max-w-[170px] text-right font-medium">{u.unidadAsignada}</span>
                                </div>
                                {u.clues && (
                                    <div className="flex justify-between items-center pt-1 text-[11px]">
                                        <span className="text-slate-500 font-semibold">Código CLUES:</span>
                                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{u.clues}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* TABLA PRO DE CUENTAS SSO (ESCRITORIO >= md) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                        <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                            <th className="py-3.5 px-4">Servidor Público / CURP</th>
                            <th className="py-3.5 px-4">Correo Institucional</th>
                            <th className="py-3.5 px-4">Rol en el Sistema</th>
                            <th className="py-3.5 px-4">Unidad Médica / Adscripción CLUES</th>
                            <th className="py-3.5 px-4 text-center">PIN Temporal</th>
                            <th className="py-3.5 px-4 text-center">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {cargando ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#9D2449]" />
                                        <span>Cargando cuentas desde PostgreSQL (Render)...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : usuarios.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-400 font-normal">
                                    No hay cuentas de personal registradas.
                                </td>
                            </tr>
                        ) : (
                            usuarios.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#9D2449] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-rose-200">
                                                {getInitials(u.nombre)}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900">{u.nombre}</div>
                                                {u.curp && <div className="text-[10px] font-mono text-slate-500">CURP: {u.curp}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                                    <td className="py-3.5 px-4">
                                        <span className="bg-rose-50 text-[#9D2449] font-black px-2.5 py-1 rounded-full border border-rose-200 text-[10px] inline-block">
                                            {getRoleBadgeLabel(u.rol)}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="font-bold text-slate-800">{u.unidadAsignada}</div>
                                        {u.clues && <div className="text-[10px] font-mono text-slate-500">CLUES: {u.clues}</div>}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <span className="bg-slate-100 text-slate-800 font-mono font-bold text-xs px-2.5 py-1 rounded-xl border border-slate-300 shadow-xs">
                                            {u.pinTemporal || '******'}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                            {u.estatus}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CREAR USUARIO INSTITUTIONAL SSO (REDESIGN) */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh] relative">

                        {/* CABECERA DEL MODAL */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#9D2449] to-[#7A1B38] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-950/20">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Alta de Servidor Público SSO</h3>
                                    <p className="text-xs text-slate-500 font-medium">Servicios de Salud de Oaxaca • Credencialización Institucional</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* BADGE DE SEGURIDAD Y VALIDACIÓN SSO */}
                        <div className="p-4 bg-gradient-to-r from-rose-50/80 via-rose-50/30 to-transparent border border-rose-200/80 rounded-2xl flex items-start gap-3.5 text-xs">
                            <div className="p-2 bg-rose-100 text-[#9D2449] rounded-xl shrink-0 mt-0.5">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <span className="font-extrabold uppercase tracking-wider text-[10px] text-[#9D2449] block">Autenticación Institucional Segura</span>
                                <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
                                    El correo institucional se autogenera con el formato oficial <code className="bg-white px-1.5 py-0.5 rounded-lg border border-rose-200 font-mono text-[#9D2449] font-bold shadow-2xs">nombre.apellidopaterno@salud.oaxaca.gob.mx</code>.
                                </p>
                            </div>
                        </div>

                        {/* FORMULARIO */}
                        <form onSubmit={handleCreateUser} className="space-y-5 text-xs font-semibold">

                            {/* NOMBRES DESGLOSADOS EN 3 CAMPOS */}
                            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                                        Nombres y Apellidos del Personal
                                    </span>
                                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">Obligatorio</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1 text-[11px]">Nombre(s)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Alejandro"
                                            value={nombres}
                                            onChange={(e) => handleNombreChange(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-rose-100 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1 text-[11px]">Apellido Paterno</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Gómez"
                                            value={apellidoPaterno}
                                            onChange={(e) => handleApellidoPaternoChange(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-rose-100 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1 text-[11px]">Apellido Materno</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Ruiz"
                                            value={apellidoMaterno}
                                            onChange={(e) => setApellidoMaterno(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-rose-100 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* COLUMNA 1 */}
                                <div className="space-y-4">
                                    {/* CURP */}
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between text-[11px]">
                                            <span>CURP (18 Caracteres)</span>
                                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${curp.length === 18 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                                                {curp.length}/18
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={18}
                                            placeholder="GORA850412HOCMNS02"
                                            value={curp}
                                            onChange={(e) => setCurp(e.target.value.toUpperCase())}
                                            className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-slate-900 font-mono uppercase focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-rose-100 transition-all font-bold tracking-wider"
                                        />
                                    </div>

                                    {/* Correo Electrónico Institucional (Autogenerado) */}
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between text-[11px]">
                                            <span>Correo Institucional (Autogenerado)</span>
                                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">@salud.oaxaca.gob.mx</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                            <input
                                                type="email"
                                                required
                                                placeholder="alejandro.gomez@salud.oaxaca.gob.mx"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-3.5 py-2.5 bg-emerald-50/40 border border-emerald-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-emerald-100 transition-all text-[11px]"
                                            />
                                        </div>
                                    </div>

                                    {/* Teléfono de Contacto */}
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1.5 text-[11px]">Teléfono de Contacto</label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                placeholder="971 123 4567"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-rose-100 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Municipio / Localidad */}
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1.5 text-[11px]">Municipio / Localidad (Texto Libre)</label>
                                        <input
                                            type="text"
                                            placeholder="Escriba el municipio..."
                                            value={municipio}
                                            onChange={(e) => setMunicipio(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-rose-100 transition-all font-semibold"
                                        />
                                    </div>
                                </div>

                                {/* COLUMNA 2 */}
                                <div className="space-y-4">
                                    {/* Rol Asignado (Roles Actualizados sin los obsoletos) */}
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1.5 text-[11px]">Rol Asignado en el Sistema *</label>
                                        <select
                                            value={rol}
                                            onChange={(e) => setRol(e.target.value as UsuarioSSO['rol'])}
                                            className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-rose-100 transition-all font-bold text-xs"
                                        >
                                            <option value="CAPTURISTA_TAMIZ">Capturista de Tamiz Neonatal</option>
                                            <option value="MEDICO_UNIDAD">Médico de Unidad / Hospital</option>
                                            <option value="ADMIN_JURISDICCIONAL">Administrador Jurisdiccional</option>
                                        </select>
                                    </div>

                                    {/* Unidad Médica / CLUES */}
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between text-[11px]">
                                            <span>Unidad Médica de Adscripción / CLUES *</span>
                                            <Building2 className="w-3.5 h-3.5 text-[#9D2449]" />
                                        </label>
                                        <select
                                            value={selectedCluesId}
                                            onChange={(e) => setSelectedCluesId(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-rose-100 transition-all font-medium text-xs truncate"
                                        >
                                            {cluesList.map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.nombre} [{unit.clues}] - {unit.municipio}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Contraseña Temporal / PIN */}
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between text-[11px]">
                                            <span>Contraseña Temporal / PIN *</span>
                                            <button
                                                type="button"
                                                onClick={generateRandomPin}
                                                className="text-[10px] text-[#9D2449] hover:underline font-extrabold cursor-pointer"
                                            >
                                                Generar Aleatorio
                                            </button>
                                        </label>
                                        <div className="relative flex items-center">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                                            <input
                                                type={showPinText ? 'text' : 'password'}
                                                required
                                                placeholder="PIN o Clave de 6 dígitos"
                                                value={pinTemporal}
                                                onChange={(e) => setPinTemporal(e.target.value)}
                                                className="w-full pl-10 pr-16 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-[#9D2449] focus:ring-2 focus:ring-rose-100 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPinText(!showPinText)}
                                                className="absolute right-3 text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase cursor-pointer"
                                            >
                                                {showPinText ? 'Ocultar' : 'Ver'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* RESUMEN VISUAL DE UNIDAD SELECCIONADA */}
                                    {(() => {
                                        const currentUnit = cluesList.find((u) => u.id === selectedCluesId);
                                        if (!currentUnit) return null;
                                        return (
                                            <div className="p-3.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 space-y-1 text-[11px]">
                                                <div className="flex justify-between font-bold text-slate-800">
                                                    <span>Clave CLUES Configurada:</span>
                                                    <span className="font-mono text-[#9D2449] bg-white px-2 py-0.5 rounded-lg border border-rose-200 shadow-2xs font-extrabold">
                                                        {currentUnit.clues}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-slate-600">
                                                    <span>Municipio:</span>
                                                    <span className="font-semibold">{currentUnit.municipio}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* BOTONES DE ACCIÓN DEL MODAL */}
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer text-xs"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-2xl shadow-lg shadow-rose-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60 text-xs"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Guardando en PostgreSQL...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="w-4 h-4 text-rose-200" />
                                            <span>Dar de Alta Usuario SSO</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TabCuentasPersonal;