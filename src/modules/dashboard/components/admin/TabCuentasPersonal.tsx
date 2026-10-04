import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, X, Mail, Shield, ShieldCheck, User, Phone, Key, Lock, Building2 } from 'lucide-react';
import type { UsuarioSSO, UnidadCLUES } from './types';
import { getCluesCatalog, subscribeCluesCatalog } from './cluesData';

export const TabCuentasPersonal: React.FC = () => {
    const [usuarios, setUsuarios] = useState<UsuarioSSO[]>([
        {
            id: 'u1',
            nombre: 'Lic. Administrador Jurisdiccional',
            curp: 'ADMJ800101HOCMNS01',
            email: 'admin.istmo@salud.oaxaca.gob.mx',
            telefono: '9711234567',
            rol: 'ADMIN_JURISDICCIONAL',
            unidadAsignada: 'Jurisdicción Sanitaria No. 2 - Istmo',
            clues: 'OASSA000001',
            pinTemporal: '9842',
            estatus: 'ACTIVO'
        },
        {
            id: 'u2',
            nombre: 'Dra. María Elena Ramos',
            curp: 'RAME820512MOCMNS03',
            email: 'gestor.parteras@salud.oaxaca.gob.mx',
            telefono: '9712345678',
            rol: 'GESTOR_PARTERAS',
            unidadAsignada: 'Programa Parteras Tradicionales',
            clues: 'OASSA000002',
            pinTemporal: '1245',
            estatus: 'ACTIVO'
        },
        {
            id: 'u3',
            nombre: 'Enf. Juan Carlos Morales',
            curp: 'MOJU850920HOCMNS04',
            email: 'capturista.tamiz@salud.oaxaca.gob.mx',
            telefono: '9713456789',
            rol: 'CAPTURISTA_TAMIZ',
            unidadAsignada: 'Centro de Salud Urbano Juchitán',
            clues: 'OASSA000451',
            pinTemporal: '4432',
            estatus: 'ACTIVO'
        },
        {
            id: 'u4',
            nombre: 'Dr. Roberto Mendoza Cruz',
            curp: 'MECR781105HOCMNS08',
            email: 'medico.juchitan@salud.oaxaca.gob.mx',
            telefono: '9714567890',
            rol: 'MEDICO_UNIDAD',
            unidadAsignada: 'Hospital General de Juchitán Dr. Maceonio Benítez',
            clues: 'OASSA001230',
            pinTemporal: '7789',
            estatus: 'ACTIVO'
        }
    ]);

    // Dynamic CLUES Catalog Store
    const [cluesList, setCluesList] = useState<UnidadCLUES[]>(getCluesCatalog());

    useEffect(() => {
        const unsubscribe = subscribeCluesCatalog((updatedList) => {
            setCluesList(updatedList);
        });
        return unsubscribe;
    }, []);

    // Form modal state
    const [showModal, setShowModal] = useState(false);
    const [nombre, setNombre] = useState('');
    const [curp, setCurp] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [rol, setRol] = useState<UsuarioSSO['rol']>('CAPTURISTA_TAMIZ');
    const [selectedCluesId, setSelectedCluesId] = useState<string>('');
    const [pinTemporal, setPinTemporal] = useState('');
    const [showPinText, setShowPinText] = useState(false);

    // Initialize selected CLUES when modal opens or cluesList updates
    useEffect(() => {
        if (cluesList.length > 0 && !selectedCluesId) {
            setSelectedCluesId(cluesList[0].id);
        }
    }, [cluesList, selectedCluesId]);

    const generateRandomPin = () => {
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        setPinTemporal(pin);
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        const foundUnit = cluesList.find((u) => u.id === selectedCluesId) || cluesList[0];

        const newUser: UsuarioSSO = {
            id: `u-${Date.now()}`,
            nombre,
            curp: curp.toUpperCase(),
            email: email.toLowerCase(),
            telefono,
            rol,
            unidadAsignada: foundUnit ? `${foundUnit.nombre} (${foundUnit.clues})` : 'Unidad Médica SSO',
            clues: foundUnit?.clues || 'OASSA000000',
            pinTemporal: pinTemporal || '123456',
            estatus: 'ACTIVO'
        };
        setUsuarios([newUser, ...usuarios]);
        setShowModal(false);

        // Reset form
        setNombre('');
        setCurp('');
        setEmail('');
        setTelefono('');
        setPinTemporal('');
    };

    const getRoleBadgeLabel = (r: UsuarioSSO['rol']) => {
        switch (r) {
            case 'ADMIN_JURISDICCIONAL': return 'Administrador Jurisdiccional';
            case 'CAPTURISTA_TAMIZ': return 'Capturista de Tamiz';
            case 'GESTOR_PARTERAS': return 'Gestor de Parteras';
            case 'MEDICO_UNIDAD': return 'Médico de Unidad';
            case 'SUPERVISOR_ZONA': return 'Supervisor de Zona';
            default: return r;
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-[#9D2449]" />
                        <span>Cuentas del Personal de Salud (Servidores Públicos SSO)</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Gestión de accesos institucionales para médicos, capturistas de tamiz y gestores de jurisdicción.
                    </p>
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

            {/* VISTA MÓVIL (< md) */}
            <div className="space-y-3 md:hidden">
                {usuarios.map((u) => (
                    <div key={u.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xs font-black text-slate-900">{u.nombre}</h3>
                                {u.curp && <p className="text-[10px] text-slate-500 font-mono">CURP: {u.curp}</p>}
                                <p className="text-[11px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    {u.email}
                                </p>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
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
                ))}
            </div>

            {/* VISTA ESCRITORIO (>= md) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                            <th className="py-3 px-4">Servidor Público / CURP</th>
                            <th className="py-3 px-4">Correo Institucional</th>
                            <th className="py-3 px-4">Rol en el Sistema</th>
                            <th className="py-3 px-4">Unidad Médica / Adscripción CLUES</th>
                            <th className="py-3 px-4 text-center">PIN Temporal</th>
                            <th className="py-3 px-4 text-center">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {usuarios.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4">
                                    <div className="font-black text-slate-900">{u.nombre}</div>
                                    {u.curp && <div className="text-[10px] font-mono text-slate-500">CURP: {u.curp}</div>}
                                </td>
                                <td className="py-3.5 px-4 text-slate-600 font-mono">{u.email}</td>
                                <td className="py-3.5 px-4">
                                    <span className="bg-rose-50 text-[#9D2449] font-black px-2.5 py-1 rounded-lg border border-rose-200 text-[11px]">
                                        {getRoleBadgeLabel(u.rol)}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4">
                                    <div className="font-bold text-slate-800">{u.unidadAsignada}</div>
                                    {u.clues && <div className="text-[10px] font-mono text-slate-500">CLUES: {u.clues}</div>}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                    <span className="bg-slate-100 text-slate-800 font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-300">
                                        {u.pinTemporal || '******'}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        {u.estatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL CREAR USUARIO INSTITUTIONAL SSO EN 2 COLUMNAS */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">

                        {/* CABECERA DEL MODAL */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-200 text-[#9D2449]">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Crear Usuario Institucional SSO</h3>
                                    <p className="text-xs text-slate-500 font-medium">Servicios de Salud de Oaxaca • Alta de Servidor Público</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* BADGE DE SEGURIDAD Y VALIDACIÓN SSO */}
                        <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-[#9D2449]">
                            <ShieldCheck className="w-5 h-5 shrink-0 text-[#9D2449] mt-0.5" />
                            <div className="space-y-0.5">
                                <span className="font-extrabold uppercase tracking-wider block text-[10px]">Autenticación Institucional Cifrada (256-bit)</span>
                                <p className="text-slate-700 font-medium text-[11px]">
                                    El registro requiere un correo válido con dominio <code className="bg-white px-1 py-0.5 rounded border border-rose-200 font-mono text-[#9D2449] font-bold">@salud.oaxaca.gob.mx</code> y la clave CLUES asignada para auditoría de acciones.
                                </p>
                            </div>
                        </div>

                        {/* FORMULARIO EN LAYOUT DE 2 COLUMNAS */}
                        <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-semibold">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* COLUMNA 1 */}
                                <div className="space-y-3.5">
                                    {/* Nombre Completo */}
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                                            <span>Nombre Completo *</span>
                                            <span className="text-[10px] text-slate-400 font-normal">Nombre y Apellidos</span>
                                        </label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. Dr. Alejandro Gómez Ruiz"
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* CURP */}
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                                            <span>CURP * (18 Caracteres)</span>
                                            <span className={`text-[10px] font-mono font-bold ${curp.length === 18 ? 'text-emerald-600' : 'text-slate-400'}`}>
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
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono uppercase focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                        />
                                    </div>

                                    {/* Correo Electrónico Institucional */}
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                                            <span>Correo Electrónico Institucional *</span>
                                            <span className="text-[10px] text-emerald-700 font-bold">@salud.oaxaca.gob.mx</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                            <input
                                                type="email"
                                                required
                                                placeholder="alejandro.gomez@salud.oaxaca.gob.mx"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Teléfono de Contacto */}
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1">Teléfono de Contacto</label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                placeholder="971 123 4567"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* COLUMNA 2 */}
                                <div className="space-y-3.5">
                                    {/* Rol Asignado */}
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1">Rol Asignado *</label>
                                        <select
                                            value={rol}
                                            onChange={(e) => setRol(e.target.value as UsuarioSSO['rol'])}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all font-semibold"
                                        >
                                            <option value="CAPTURISTA_TAMIZ">Capturista de Tamiz Neonatal</option>
                                            <option value="MEDICO_UNIDAD">Médico de Unidad / Hospital</option>
                                            <option value="SUPERVISOR_ZONA">Supervisor de Zona Epidemiológica</option>
                                            <option value="GESTOR_PARTERAS">Gestor de Parteras Tradicionales</option>
                                            <option value="ADMIN_JURISDICCIONAL">Administrador Jurisdiccional</option>
                                        </select>
                                    </div>

                                    {/* Unidad Médica / CLUES (Select dinámico) */}
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                                            <span>Unidad Médica de Adscripción / CLUES *</span>
                                            <Building2 className="w-3.5 h-3.5 text-[#9D2449]" />
                                        </label>
                                        <select
                                            value={selectedCluesId}
                                            onChange={(e) => setSelectedCluesId(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all font-medium text-xs"
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
                                        <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                                            <span>Contraseña Temporal / PIN de Primer Ingreso *</span>
                                            <button
                                                type="button"
                                                onClick={generateRandomPin}
                                                className="text-[10px] text-[#9D2449] hover:underline font-bold"
                                            >
                                                Generar Aleatorio
                                            </button>
                                        </label>
                                        <div className="relative flex items-center">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                                            <input
                                                type={showPinText ? 'text' : 'password'}
                                                required
                                                placeholder="PIN o Clave de 6 dígitos"
                                                value={pinTemporal}
                                                onChange={(e) => setPinTemporal(e.target.value)}
                                                className="w-full pl-9 pr-16 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPinText(!showPinText)}
                                                className="absolute right-3 text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase"
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
                                            <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200 space-y-1 text-[11px]">
                                                <div className="flex justify-between font-bold text-slate-800">
                                                    <span>Clave CLUES Configurada:</span>
                                                    <span className="font-mono text-[#9D2449] bg-white px-2 py-0.5 rounded border border-rose-200">
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
                            <div className="flex gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                >
                                    <UserCheck className="w-4 h-4 text-rose-200" />
                                    <span>Dar de Alta Usuario SSO</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
