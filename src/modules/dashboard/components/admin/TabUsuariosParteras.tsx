import React, { useState } from 'react';
import { Users, UserPlus, QrCode, Key, Printer, X } from 'lucide-react';
import type { UsuarioSSO, ParteraCredencial } from './types';

export const TabUsuariosParteras: React.FC = () => {
    const [subSection, setSubSection] = useState<'CUENTAS' | 'PARTERAS'>('PARTERAS');

    // Cuentas Institucionales
    const [usuarios, setUsuarios] = useState<UsuarioSSO[]>([
        {
            id: 'u1',
            nombre: 'Dr. Alejandro Morales',
            email: 'admin.jurisdiccion2@salud.gob.mx',
            rol: 'ADMIN_JURISDICCIONAL',
            unidadSalud: 'Jurisdicción Sanitaria No. 2 - Istmo',
            activo: true,
        },
        {
            id: 'u2',
            nombre: 'Dra. Carmen Silva Juárez',
            email: 'carmen.silva@salud.gob.mx',
            rol: 'CAPTURISTA_TAMIZ',
            unidadSalud: 'Laboratorio de Tamiz Juchitán',
            activo: true,
        },
        {
            id: 'u3',
            nombre: 'Lic. María Elena Santiz',
            email: 'gestor.parteras@salud.gob.mx',
            rol: 'GESTOR_PARTERAS',
            unidadSalud: 'Jurisdicción Sanitaria No. 2 - Istmo',
            activo: true,
        },
        {
            id: 'u4',
            nombre: 'Dr. Alejandro Murat H.',
            email: 'alejandro.murat@salud.gob.mx',
            rol: 'MEDICO_UNIDAD',
            unidadSalud: 'Centro de Salud Urbano Juchitán',
            activo: true,
        },
    ]);

    // Padrón de Parteras Tradicionales con PIN y Credencial QR
    const [parteras] = useState<ParteraCredencial[]>([
        {
            id: 'p1',
            nombreCompleto: 'Doña Rosa Santiz Gómez',
            nombreZapoteco: 'Na Rosa Santiz',
            curp: 'SAGR650412MOCGMR09',
            comunidad: 'San Pedro Juchitán',
            municipio: 'Juchitán de Zaragoza',
            jurisdiccion: 'Jurisdicción Sanitaria No. 2 - Istmo',
            experienciaAnos: 35,
            pinAcceso: '4821',
            certificadoVigente: true,
            estatus: 'ACTIVA',
            fechaExpedicion: '2026-01-15',
            fotoUrl: '/logo-jurisdiccion.png',
        },
        {
            id: 'p2',
            nombreCompleto: 'Doña Petrona Cruz Velasco',
            nombreZapoteco: 'Na Petrona Cruz',
            curp: 'CRVP700823MOCGMR02',
            comunidad: 'La Ventosa',
            municipio: 'Juchitán de Zaragoza',
            jurisdiccion: 'Jurisdicción Sanitaria No. 2 - Istmo',
            experienciaAnos: 30,
            pinAcceso: '1904',
            certificadoVigente: true,
            estatus: 'ACTIVA',
            fechaExpedicion: '2026-02-10',
            fotoUrl: '/logo-jurisdiccion.png',
        },
        {
            id: 'p3',
            nombreCompleto: 'Doña Micaela Ruiz Hernández',
            nombreZapoteco: 'Na Micaela Ruiz',
            curp: 'RUHM581105MOCGMR05',
            comunidad: 'San Blas Atempa',
            municipio: 'San Blas Atempa',
            jurisdiccion: 'Jurisdicción Sanitaria No. 2 - Istmo',
            experienciaAnos: 40,
            pinAcceso: '7352',
            certificadoVigente: true,
            estatus: 'ACTIVA',
            fechaExpedicion: '2026-01-20',
            fotoUrl: '/logo-jurisdiccion.png',
        },
    ]);

    const [selectedCredencial, setSelectedCredencial] = useState<ParteraCredencial | null>(null);
    const [showAltaUsuarioModal, setShowAltaUsuarioModal] = useState(false);

    // Form Alta Usuario
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoEmail, setNuevoEmail] = useState('');
    const [nuevoRol, setNuevoRol] = useState<UsuarioSSO['rol']>('CAPTURISTA_TAMIZ');
    const [nuevaUnidad, setNuevaUnidad] = useState('Centro de Salud Juchitán');

    const handleCreateUsuario = (e: React.FormEvent) => {
        e.preventDefault();
        const nu: UsuarioSSO = {
            id: Date.now().toString(),
            nombre: nuevoNombre,
            email: nuevoEmail,
            rol: nuevoRol,
            unidadSalud: nuevaUnidad,
            activo: true,
        };
        setUsuarios([...usuarios, nu]);
        setShowAltaUsuarioModal(false);
        setNuevoNombre('');
        setNuevoEmail('');
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            {/* CABECERA CON NAVEGACION INTERNA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#9D2449]" />
                        <span>Gestión de Cuentas, Padrón y Credenciales QR SSO</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Administración de accesos institucionales y credencialización con código QR para Parteras Tradicionales.
                    </p>
                </div>

                <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
                    <button
                        type="button"
                        onClick={() => setSubSection('PARTERAS')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${subSection === 'PARTERAS'
                            ? 'bg-[#9D2449] text-white shadow-md'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <QrCode className="w-4 h-4" />
                        <span>Padrón y Credenciales QR</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSubSection('CUENTAS')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${subSection === 'CUENTAS'
                            ? 'bg-[#9D2449] text-white shadow-md'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Cuentas Institucionales SSO</span>
                    </button>
                </div>
            </div>

            {/* SECCION B: PADRON DE PARTERAS Y CREDENCIALES QR */}
            {subSection === 'PARTERAS' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-xs">
                        <span className="font-bold text-[#9D2449]">
                            Total Parteras Acreditadas en el Istmo: <strong>{parteras.length}</strong>
                        </span>
                        <span className="text-slate-600">PIN de Seguridad Activado • QR Oficial Encriptado</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                                    <th className="py-3 px-4">Partera Acreditada</th>
                                    <th className="py-3 px-4">Nombre Zapoteco / Local</th>
                                    <th className="py-3 px-4">Comunidad / Municipio</th>
                                    <th className="py-3 px-4">PIN de Acceso</th>
                                    <th className="py-3 px-4">Certificación</th>
                                    <th className="py-3 px-4 text-right">Credencial QR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                                {parteras.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-4 font-black text-slate-900">{p.nombreCompleto}</td>
                                        <td className="py-3 px-4 text-slate-600 italic">{p.nombreZapoteco || 'N/A'}</td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-800">{p.comunidad}</div>
                                            <div className="text-[11px] text-slate-500">{p.municipio}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-mono font-black rounded-lg border border-amber-300 flex items-center gap-1 w-fit">
                                                <Key className="w-3 h-3 text-amber-700" />
                                                <span>PIN: {p.pinAcceso}</span>
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                CERTIFICADA VIGENTE
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCredencial(p)}
                                                className="px-3 py-1.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                                            >
                                                <QrCode className="w-4 h-4 text-rose-200" />
                                                <span>Generar Credencial QR</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECCION A: CUENTAS INSTITUCIONALES SSO */}
            {subSection === 'CUENTAS' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">Usuarios Registrados en el Sistema: {usuarios.length}</span>
                        <button
                            type="button"
                            onClick={() => setShowAltaUsuarioModal(true)}
                            className="px-4 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Alta Nueva Cuenta SSO</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                                    <th className="py-3 px-4">Usuario / Servidor Público</th>
                                    <th className="py-3 px-4">Correo Institucional</th>
                                    <th className="py-3 px-4">Rol Asignado</th>
                                    <th className="py-3 px-4">Unidad Médica</th>
                                    <th className="py-3 px-4 text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                                {usuarios.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-4 font-black text-slate-900">{u.nombre}</td>
                                        <td className="py-3 px-4 text-slate-600">{u.email}</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2.5 py-1 bg-rose-50 text-[#9D2449] font-black rounded-lg text-[10px] border border-rose-200">
                                                {u.rol}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-800">{u.unidadSalud}</td>
                                        <td className="py-3 px-4 text-right">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                ACTIVO
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL IMPRIMIBLE CREDENCIAL QR OFICIAL DE PARTERA */}
            {selectedCredencial && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-4 border-[#9D2449] rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative overflow-hidden">

                        {/* Encabezado Oficial Credencial */}
                        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
                            <img src="/logo-jurisdiccion.png" alt="Logo Jurisdicción" className="h-12 w-auto object-contain mix-blend-multiply" />
                            <div className="text-center px-1">
                                <span className="text-[9px] font-black text-[#9D2449] uppercase tracking-wider block">SERVICIOS DE SALUD DE OAXACA</span>
                                <h4 className="text-xs font-black text-slate-900">JURISDICCIÓN SANITARIA NO. 2</h4>
                                <span className="text-[9px] text-slate-600 font-bold block">Acreditación Partera Tradicional</span>
                            </div>
                            <img src="/Logo-Secretaria.png" alt="Logo SSO" className="h-12 w-auto object-contain mix-blend-multiply" />
                        </div>

                        {/* Contenido de la Credencial */}
                        <div className="space-y-4 text-center">
                            <div className="w-24 h-24 mx-auto bg-rose-50 rounded-2xl border-2 border-[#9D2449] p-1 flex items-center justify-center shadow-md">
                                <Users className="w-12 h-12 text-[#9D2449]" />
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-slate-900">{selectedCredencial.nombreCompleto}</h3>
                                {selectedCredencial.nombreZapoteco && (
                                    <p className="text-xs font-bold text-[#9D2449] italic">{selectedCredencial.nombreZapoteco}</p>
                                )}
                                <p className="text-xs text-slate-600 font-semibold mt-1">
                                    {selectedCredencial.comunidad}, {selectedCredencial.municipio}
                                </p>
                            </div>

                            {/* CÓDIGO QR OFICIAL E INFORMACIÓN PIN */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center space-y-2">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=SSO-PARTERA-${selectedCredencial.id}-${selectedCredencial.curp}`}
                                    alt="Código QR Credencial"
                                    className="w-32 h-32 rounded-xl border border-slate-300 shadow-sm"
                                />
                                <div className="flex items-center gap-2 pt-1">
                                    <span className="px-3 py-1 bg-amber-100 text-amber-900 font-mono font-black text-xs rounded-lg border border-amber-300">
                                        PIN SEGURO: {selectedCredencial.pinAcceso}
                                    </span>
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg border border-emerald-300">
                                        EXP. 2026
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Botones Modal */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Imprimir Credencial Oficial</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedCredencial(null)}
                                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ALTA USUARIO SSO */}
            {showAltaUsuarioModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-[#9D2449]" />
                                <span>Alta de Nueva Cuenta SSO</span>
                            </h3>
                            <button type="button" onClick={() => setShowAltaUsuarioModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUsuario} className="space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nombre del servidor público"
                                    value={nuevoNombre}
                                    onChange={(e) => setNuevoNombre(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Correo Electrónico Institucional</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="usuario@salud.gob.mx"
                                    value={nuevoEmail}
                                    onChange={(e) => setNuevoEmail(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Rol Operativo</label>
                                <select
                                    value={nuevoRol}
                                    onChange={(e) => setNuevoRol(e.target.value as UsuarioSSO['rol'])}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                >
                                    <option value="CAPTURISTA_TAMIZ">Capturista de Tamiz</option>
                                    <option value="ADMIN_JURISDICCIONAL">Administrador Jurisdiccional</option>
                                    <option value="GESTOR_PARTERAS">Gestor de Parteras</option>
                                    <option value="MEDICO_UNIDAD">Médico de Centro de Salud</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Unidad Médica Asignada</label>
                                <input
                                    type="text"
                                    required
                                    value={nuevaUnidad}
                                    onChange={(e) => setNuevaUnidad(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                            >
                                Registrar y Asignar Credenciales
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
