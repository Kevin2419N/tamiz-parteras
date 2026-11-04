import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, X, Mail, Shield, ShieldCheck, Phone, Lock, Building2, Loader2, AlertCircle, Search, KeyRound } from 'lucide-react';
import type { UsuarioSSO, UnidadCLUES } from './types';
import { getCluesCatalog, subscribeCluesCatalog } from './cluesData';
import { http } from '../../../../services/http';

export const TabCuentasPersonal: React.FC = () => {
    const [usuarios, setUsuarios] = useState<UsuarioSSO[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState<string>('');

    const [cluesList, setCluesList] = useState<UnidadCLUES[]>(getCluesCatalog());

    useEffect(() => {
        const unsubscribe = subscribeCluesCatalog((updatedList) => {
            setCluesList(updatedList);
        });
        return unsubscribe;
    }, []);

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

    useEffect(() => {
        if (cluesList.length > 0 && !selectedCluesId) {
            setSelectedCluesId(cluesList[0].id);
        }
    }, [cluesList, selectedCluesId]);

    const cleanStringForEmail = (str: string) => {
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");
    };

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
        if (!name) return 'SS';
        const words = name.replace(/^(Dr\.|Dra\.|Lic\.|Enf\.)\s+/, '').split(' ').filter(Boolean);
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const usuariosFiltrados = usuarios.filter((u: any) => {
        const nombre = (u.nombre || '').toLowerCase();
        const curp = (u.curp || '').toLowerCase();
        const correo = (u.correo_institucional || u.email || '').toLowerCase();
        const termino = busqueda.toLowerCase();
        return nombre.includes(termino) || curp.includes(termino) || correo.includes(termino);
    });

    return (
        <div className="space-y-6 text-white w-full">

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes lgFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
                @keyframes lgModal{from{opacity:0;transform:scale(0.95) translateY(20px)}to{opacity:1;transform:none}}
                .lg-fade{animation:lgFade .35s ease both}
                .lg-modal{animation:lgModal .4s cubic-bezier(0.16,1,0.3,1) both}
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
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 text-cyan-300 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o CURP..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/60 border border-white/20 rounded-2xl text-xs text-white placeholder:text-cyan-200/50 focus:outline-none focus:border-cyan-400 backdrop-blur-md font-medium shadow-inner"
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

            {errorMessage && (
                <div className="p-4 bg-rose-950/60 border border-rose-300/40 rounded-2xl flex items-center gap-3 text-rose-100 text-xs font-bold backdrop-blur-md">
                    <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* SECCIÓN DE TARJETAS DE USUARIOS (GRID EJECUTIVO) */}
            <div className="w-full">
                {cargando ? (
                    <div className="p-16 text-center text-xs text-cyan-200 font-medium bg-slate-900/40 rounded-3xl border border-white/20 backdrop-blur-3xl flex items-center justify-center gap-3 shadow-2xl">
                        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                        <span>Sincronizando cuentas con PostgreSQL (Render)...</span>
                    </div>
                ) : usuariosFiltrados.length === 0 ? (
                    <div className="p-16 text-center text-xs text-cyan-200/70 bg-slate-900/40 rounded-3xl border border-white/20 backdrop-blur-3xl shadow-2xl">
                        No se encontraron cuentas de personal registradas con ese criterio de búsqueda.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {usuariosFiltrados.map((u: any) => {
                            const nombreCompleto = u.nombre || [u.nombres, u.apellido_paterno, u.apellido_materno].filter(Boolean).join(' ') || 'Servidor Público';
                            const correoInst = u.correo_institucional || u.email || 'No registrado';
                            const unidadAdscripcion = u.unidad_asignada || u.unidadAsignada || 'Jurisdicción Sanitaria No. 2';
                            const cluesCodigo = u.clues || 'OASSA000000';
                            const pinCode = u.password || u.pin_temporal || u.pinTemporal || '******';
                            const estatusUser = u.estatus || 'ACTIVO';

                            return (
                                <div key={u.id} className="p-5 bg-slate-900/60 border border-white/20 rounded-3xl shadow-2xl backdrop-blur-3xl hover:border-cyan-400/50 transition-all space-y-4 group">
                                    
                                    {/* CABECERA DE LA TARJETA */}
                                    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3.5">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-cyan-950/50 border border-white/30">
                                                {getInitials(nombreCompleto)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white text-sm tracking-tight group-hover:text-cyan-300 transition-colors">
                                                    {nombreCompleto}
                                                </h3>
                                                {u.curp && (
                                                    <p className="text-[11px] font-mono text-cyan-200/80 mt-0.5">
                                                        CURP: <span className="font-bold text-white">{u.curp}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${
                                            estatusUser === 'ACTIVO'
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                                : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                        }`}>
                                            {estatusUser}
                                        </span>
                                    </div>

                                    {/* CUERPO DE DATOS DE LA TARJETA */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        
                                        {/* Correo institucional */}
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                                                Correo Institucional
                                            </span>
                                            <p className="font-mono text-[11px] text-white font-bold truncate" title={correoInst}>
                                                {correoInst}
                                            </p>
                                        </div>

                                        {/* Rol asignado */}
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                                                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                                                Rol en el Sistema
                                            </span>
                                            <p className="text-[11px] text-cyan-100 font-bold truncate">
                                                {getRoleBadgeLabel(u.rol)}
                                            </p>
                                        </div>

                                        {/* Unidad Adscripción y CLUES */}
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md sm:col-span-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                                                    Unidad Médica Adscrita
                                                </span>
                                                <span className="font-mono text-[10px] font-extrabold text-cyan-200 bg-slate-950 px-2 py-0.5 rounded-lg border border-cyan-400/30">
                                                    CLUES: {cluesCodigo}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white font-bold truncate" title={unidadAdscripcion}>
                                                {unidadAdscripcion}
                                            </p>
                                        </div>
                                    </div>

                                    {/* PIE DE TARJETA: PIN TEMPORAL */}
                                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 text-cyan-200/80">
                                            <KeyRound className="w-4 h-4 text-cyan-400" />
                                            <span className="text-[11px] font-medium">Contraseña o PIN Temporal de Acceso:</span>
                                        </div>
                                        <span className="font-mono bg-slate-950/90 text-cyan-300 font-black text-xs px-3.5 py-1.5 rounded-xl border border-cyan-400/40 shadow-inner">
                                            {pinCode}
                                        </span>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* MODAL CREAR USUARIO INSTITUCIONAL SSO */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
                    <div className="bg-slate-900/95 border border-white/40 rounded-[32px] max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl shadow-slate-950/90 backdrop-blur-3xl overflow-y-auto max-h-[90vh] lg-modal">

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

                        <div className="p-3.5 bg-cyan-950/30 border border-cyan-800/40 rounded-2xl flex items-start gap-3 text-xs text-cyan-100 backdrop-blur-md">
                            <ShieldCheck className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" />
                            <div className="space-y-0.5">
                                <span className="font-extrabold uppercase tracking-wider text-[10px] text-cyan-300 block">Autenticación Institucional Segura</span>
                                <p className="text-cyan-50/90 font-medium text-[11px]">
                                    El correo institucional se autogenera con el formato oficial <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-cyan-400/30 font-mono text-cyan-300 font-bold">nombre.apellidopaterno@salud.oaxaca.gob.mx</code>.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-semibold">

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
                                <div className="space-y-3.5">
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

                                <div className="space-y-3.5">
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