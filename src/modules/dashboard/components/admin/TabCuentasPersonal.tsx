import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, X, Mail, Shield, ShieldCheck, Phone, Lock, Building2, Loader2, AlertCircle, Search, Sparkles } from 'lucide-react';
import type { UsuarioSSO, UnidadCLUES } from './types';
import { getCluesCatalog, subscribeCluesCatalog } from './cluesData';
import { http } from '../../../../services/http';

export const TabCuentasPersonal: React.FC = () => {
    // Estado de los usuarios institucionales
    const [usuarios, setUsuarios] = useState<UsuarioSSO[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState<string>('');

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

    // Filtrar usuarios según la búsqueda
    const usuariosFiltrados = usuarios.filter((u) => {
        const nombre = (u.nombre || '').toLowerCase();
        const curp = (u.curp || '').toLowerCase();
        const correo = (u.email || '').toLowerCase();
        const termino = busqueda.toLowerCase();
        return nombre.includes(termino) || curp.includes(termino) || correo.includes(termino);
    });

    return (
        <div className="space-y-6 text-white">

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes lgFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
                @keyframes lgModal{from{opacity:0;transform:scale(0.95) translateY(20px)}to{opacity:1;transform:none}}
                .lg-fade{animation:lgFade .35s ease both}
                .lg-modal{animation:lgModal .4s cubic-bezier(0.16,1,0.3,1) both}
                .lg-quiet{scrollbar-width:none}
                .lg-quiet::-webkit-scrollbar{display:none}
            `}} />

            {/* CABECERA PRINCIPAL */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-950/40">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                            Cuentas del Personal de Salud (Servidores Públicos SSO)
                        </h2>
                        <p className="text-xs text-cyan-100/80 font-medium mt-0.5">
                            Gestión de accesos institucionales para médicos, capturistas de tamiz y administradores jurisdiccionales.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Barra de búsqueda rápida */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 text-cyan-300 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, CURP o correo..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/60 border border-white/20 rounded-2xl text-xs text-white placeholder:text-cyan-200/50 focus:outline-none focus:border-cyan-400 backdrop-blur-md font-medium"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            generateRandomPin();
                            setShowModal(true);
                        }}
                        className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/40 shrink-0"
                    >
                        <Plus className="w-4 h-4 text-cyan-200" />
                        <span className="hidden sm:inline">+ Crear Usuario</span>
                        <span className="sm:hidden">+ Nuevo</span>
                    </button>
                </div>
            </div>

            {/* MENSAJE DE ERROR SI FALLA LA API */}
            {errorMessage && (
                <div className="p-4 bg-rose-950/60 border border-rose-300/40 rounded-2xl flex items-center gap-3 text-rose-100 text-xs font-bold backdrop-blur-md">
                    <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* TABLA PRO DE CUENTAS SSO (ESCRITORIO >= md) */}
            <div className="hidden md:block overflow-x-auto rounded-3xl border border-white/30 bg-slate-900/40 shadow-2xl backdrop-blur-3xl">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                        <tr className="bg-white/5 text-cyan-200 font-bold uppercase text-[11px] tracking-wider border-b border-white/20">
                            <th className="py-4 px-5">Servidor Público / CURP</th>
                            <th className="py-4 px-5">Correo Institucional</th>
                            <th className="py-4 px-5">Rol en el Sistema</th>
                            <th className="py-4 px-5">Unidad Médica / Adscripción CLUES</th>
                            <th className="py-4 px-5 text-center">PIN Temporal</th>
                            <th className="py-4 px-5 text-center">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-cyan-50/90">
                        {cargando ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-cyan-200 font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                        <span>Cargando cuentas desde PostgreSQL (Render)...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : usuariosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-cyan-200/70 font-normal">
                                    No se encontraron cuentas de personal registradas con ese criterio.
                                </td>
                            </tr>
                        ) : (
                            usuariosFiltrados.map((u) => (
                                <tr key={u.id} className="hover:bg-white/10 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                                                {getInitials(u.nombre)}
                                            </div>
                                            <div>
                                                <div className="font-black text-white text-xs">{u.nombre}</div>
                                                {u.curp && <div className="text-[10px] font-mono text-cyan-200/80">CURP: {u.curp}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-5 text-cyan-100 font-mono text-[11px]">{u.email}</td>
                                    <td className="py-4 px-5">
                                        <span className="bg-cyan-500/20 text-cyan-200 font-black px-3 py-1 rounded-full border border-cyan-400/30 text-[10px] inline-block">
                                            {getRoleBadgeLabel(u.rol)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-5">
                                        <div className="font-bold text-white">{u.unidadAsignada}</div>
                                        {u.clues && <div className="text-[10px] font-mono text-cyan-200/70">CLUES: {u.clues}</div>}
                                    </td>
                                    <td className="py-4 px-5 text-center">
                                        <span className="bg-slate-950/80 text-cyan-200 font-mono font-bold text-xs px-3 py-1.5 rounded-xl border border-white/20 inline-block shadow-sm">
                                            {u.pinTemporal || '******'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-5 text-center">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                            {u.estatus}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CREAR USUARIO INSTITUCIONAL SSO */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
                    <div className="bg-slate-900/95 border border-white/40 rounded-[32px] max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl shadow-slate-950/90 backdrop-blur-3xl overflow-y-auto max-h-[90vh] lg-modal">

                        {/* CABECERA DEL MODAL */}
                        <div className="flex items-center justify-between border-b border-white/20 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 text-cyan-300 backdrop-blur-md">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white tracking-tight">Alta de Servidor Público SSO</h3>
                                    <p className="text-xs text-cyan-100/80 font-medium">Servicios de Salud de Oaxaca • Credencialización Institucional</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-2 text-cyan-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* BADGE DE SEGURIDAD Y VALIDACIÓN SSO */}
                        <div className="p-3.5 bg-cyan-950/30 border border-cyan-800/40 rounded-2xl flex items-start gap-3 text-xs text-cyan-100 backdrop-blur-md">
                            <ShieldCheck className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" />
                            <div className="space-y-0.5">
                                <span className="font-extrabold uppercase tracking-wider text-[10px] text-cyan-300 block">Autenticación Institucional Segura</span>
                                <p className="text-cyan-50/90 font-medium text-[11px]">
                                    El correo institucional se autogenera con el formato oficial <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-cyan-400/30 font-mono text-cyan-300 font-bold">nombre.apellidopaterno@salud.oaxaca.gob.mx</code>.
                                </p>
                            </div>
                        </div>

                        {/* FORMULARIO */}
                        <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-semibold">

                            {/* NOMBRES DESGLOSADOS EN 3 CAMPOS */}
                            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-3 backdrop-blur-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-cyan-300 tracking-wider">
                                        Nombres y Apellidos del Personal
                                    </span>
                                    <span className="text-[10px] font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/50">Obligatorio</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div>
                                        <label className="block text-cyan-100 font-bold mb-1 text-[11px]">Nombre(s)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Alejandro"
                                            value={nombres}
                                            onChange={(e) => handleNombreChange(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/30 rounded-xl text-white placeholder:text-cyan-200/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-cyan-100 font-bold mb-1 text-[11px]">Apellido Paterno</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Gómez"
                                            value={apellidoPaterno}
                                            onChange={(e) => handleApellidoPaternoChange(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/30 rounded-xl text-white placeholder:text-cyan-200/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-cyan-100 font-bold mb-1 text-[11px]">Apellido Materno</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Ruiz"
                                            value={apellidoMaterno}
                                            onChange={(e) => setApellidoMaterno(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/30 rounded-xl text-white placeholder:text-cyan-200/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* COLUMNA 1 */}
                                <div className="space-y-3.5">
                                    {/* CURP */}
                                    <div>
                                        <label className="block text-cyan-100 font-bold mb-1 flex items-center justify-between text-[11px]">
                                            <span>CURP (18 Caracteres)</span>
                                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${curp.length === 18 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-white/10 text-cyan-200/60'}`}>
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
                                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/30 rounded-xl text-white font-mono uppercase placeholder:text-cyan-200/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 font-bold tracking-wider"
                                        />
                                    </div>

                                    {/* Correo Electrónico Institucional (Autogenerado) */}
                                    <div>
                                        <label className="block text-cyan-100 font-bold mb-1 flex items-center justify-between text-[11px]">
                                            <span>Correo Institucional (Autogenerado)</span>
                                            <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">@salud.oaxaca.gob.mx</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                                            <input
                                                type="email"
                                                required
                                                placeholder="alejandro.gomez@salud.oaxaca.gob.mx"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-3.5 py-2.5 bg-cyan-950/30 border border-cyan-400/40 rounded-xl text-cyan-100 font-mono font-bold focus:outline-none focus:border-cyan-400 transition-all text-[11px]"
                                            />
                                        </div>
                                    </div>

                                    {/* Teléfono de Contacto */}
                                    <div>
                                        <label className="block text-cyan-100 font-bold mb-1 text-[11px]">Teléfono de Contacto</label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                placeholder="971 123 4567"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-white/30 rounded-xl text-white font-mono placeholder:text-cyan-200/40 focus:outline-none focus:border-cyan-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Municipio / Localidad */}
                                    <div>
                                        <label className="block text-cyan-100 font-bold mb-1 text-[11px]">Municipio / Localidad (Texto Libre)</label>
                                        <input
                                            type="text"
                                            placeholder="Escriba el municipio..."
                                            value={municipio}
                                            onChange={(e) => setMunicipio(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/30 rounded-xl text-white placeholder:text-cyan-200/40 focus:outline-none focus:border-cyan-400 font-semibold"
                                        />
                                    </div>
                                </div>

                                {/* COLUMNA 2 */}
                                <div className="space-y-3.5">
                                    {/* Rol Asignado */}
                                    <div>
                                        <label className="block text-cyan-100 font-bold mb-1 text-[11px]">Rol Asignado en el Sistema *</label>
                                        <select
                                            value={rol}
                                            onChange={(e) => setRol(e.target.value as UsuarioSSO['rol'])}
                                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-bold text-xs"
                                        >
                                            <option value="CAPTURISTA_TAMIZ">Capturista de Tamiz Neonatal</option>
                                            <option value="MEDICO_UNIDAD">Médico de Unidad / Hospital</option>
                                            <option value="ADMIN_JURISDICCIONAL">Administrador Jurisdiccional</option>
                                        </select>
                                    </div>

                                    {/* Unidad Médica / CLUES */}
                                    <div>
                                        <label className="block text-cyan-100 font-bold mb-1 flex items-center justify-between text-[11px]">
                                            <span>Unidad Médica de Adscripción / CLUES *</span>
                                            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                                        </label>
                                        <select
                                            value={selectedCluesId}
                                            onChange={(e) => setSelectedCluesId(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-medium text-xs truncate"
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
                                        <label className="block text-cyan-100 font-bold mb-1 flex items-center justify-between text-[11px]">
                                            <span>Contraseña Temporal / PIN *</span>
                                            <button
                                                type="button"
                                                onClick={generateRandomPin}
                                                className="text-[10px] text-cyan-300 hover:underline font-extrabold cursor-pointer"
                                            >
                                                Generar Aleatorio
                                            </button>
                                        </label>
                                        <div className="relative flex items-center">
                                            <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5" />
                                            <input
                                                type={showPinText ? 'text' : 'password'}
                                                required
                                                placeholder="PIN o Clave de 6 dígitos"
                                                value={pinTemporal}
                                                onChange={(e) => setPinTemporal(e.target.value)}
                                                className="w-full pl-10 pr-16 py-2.5 bg-slate-950/80 border border-white/30 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPinText(!showPinText)}
                                                className="absolute right-3 text-[10px] font-black text-cyan-300 hover:text-white uppercase cursor-pointer"
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
                                            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1 text-[11px] backdrop-blur-md">
                                                <div className="flex justify-between font-bold text-cyan-100">
                                                    <span>Clave CLUES Configurada:</span>
                                                    <span className="font-mono text-cyan-300 bg-slate-950 px-2 py-0.5 rounded-lg border border-cyan-400/30 font-extrabold">
                                                        {currentUnit.clues}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-cyan-200/80">
                                                    <span>Municipio:</span>
                                                    <span className="font-semibold">{currentUnit.municipio}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* BOTONES DE ACCIÓN DEL MODAL */}
                            <div className="flex gap-3 pt-3 border-t border-white/20">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all cursor-pointer border border-white/20 text-xs"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold rounded-xl shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60 border border-white/40 text-xs"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Guardando en PostgreSQL...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="w-4 h-4 text-cyan-200" />
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