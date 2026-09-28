import React, { useState } from 'react';
import { UserCheck, Plus, X, Mail, Shield } from 'lucide-react';
import type { UsuarioSSO } from './types';

export const TabCuentasPersonal: React.FC = () => {
    const [usuarios, setUsuarios] = useState<UsuarioSSO[]>([
        {
            id: 'u1',
            nombre: 'Lic. Administrador Jurisdiccional',
            email: 'admin.istmo@salud.oaxaca.gob.mx',
            rol: 'ADMIN_JURISDICCIONAL',
            unidadAsignada: 'Jurisdicción Sanitaria No. 2',
            estatus: 'ACTIVO'
        },
        {
            id: 'u2',
            nombre: 'Dra. María Elena Ramos',
            email: 'gestor.parteras@salud.oaxaca.gob.mx',
            rol: 'GESTOR_PARTERAS',
            unidadAsignada: 'Programa Parteras Tradicionales',
            estatus: 'ACTIVO'
        },
        {
            id: 'u3',
            nombre: 'Enf. Juan Carlos Morales',
            email: 'capturista.tamiz@salud.oaxaca.gob.mx',
            rol: 'CAPTURISTA_TAMIZ',
            unidadAsignada: 'Laboratorio de Tamiz Juchitán',
            estatus: 'ACTIVO'
        },
        {
            id: 'u4',
            nombre: 'Dr. Roberto Mendoza Cruz',
            email: 'medico.juchitan@salud.oaxaca.gob.mx',
            rol: 'MEDICO_UNIDAD',
            unidadAsignada: 'Hospital General de Juchitán',
            estatus: 'ACTIVO'
        }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [rol, setRol] = useState<UsuarioSSO['rol']>('CAPTURISTA_TAMIZ');
    const [unidad, setUnidad] = useState('Centro de Salud Juchitán');

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: UsuarioSSO = {
            id: `u-${Date.now()}`,
            nombre,
            email,
            rol,
            unidadAsignada: unidad,
            estatus: 'ACTIVO'
        };
        setUsuarios([newUser, ...usuarios]);
        setShowModal(false);
        setNombre('');
        setEmail('');
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
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
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
                                <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
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
                                <span className="font-bold text-slate-800">Rol:</span>
                                <span className="font-black text-[#9D2449]">{u.rol}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                <span className="font-bold text-slate-800">Adscripción:</span>
                                <span className="truncate max-w-[150px]">{u.unidadAsignada}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* VISTA ESCRITORIO (>= md) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                            <th className="py-3 px-4">Servidor Público</th>
                            <th className="py-3 px-4">Correo Institucional</th>
                            <th className="py-3 px-4">Rol en el Sistema</th>
                            <th className="py-3 px-4">Unidad Médica / Adscripción</th>
                            <th className="py-3 px-4 text-center">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {usuarios.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4 font-black text-slate-900">{u.nombre}</td>
                                <td className="py-3.5 px-4 text-slate-600 font-mono">{u.email}</td>
                                <td className="py-3.5 px-4 font-bold text-[#9D2449]">{u.rol}</td>
                                <td className="py-3.5 px-4">{u.unidadAsignada}</td>
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

            {/* MODAL CREAR USUARIO INSTITUCIONAL */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-[#9D2449]" />
                                <h3 className="text-base font-black text-slate-900">Crear Usuario Institucional SSO</h3>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-3 text-xs font-semibold">
                            <div>
                                <label className="block text-slate-800 font-bold mb-1">Nombre Completo *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Dr. Alejandro Gómez Ruiz"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-800 font-bold mb-1">Correo Electrónico Institucional *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="usuario@salud.oaxaca.gob.mx"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-800 font-bold mb-1">Rol Asignado *</label>
                                    <select
                                        value={rol}
                                        onChange={(e) => setRol(e.target.value as UsuarioSSO['rol'])}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    >
                                        <option value="CAPTURISTA_TAMIZ">Capturista de Tamiz</option>
                                        <option value="GESTOR_PARTERAS">Gestor de Parteras</option>
                                        <option value="MEDICO_UNIDAD">Médico de Unidad</option>
                                        <option value="ADMIN_JURISDICCIONAL">Administrador</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-800 font-bold mb-1">Unidad Médica *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Hospital Salina Cruz"
                                        value={unidad}
                                        onChange={(e) => setUnidad(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                                >
                                    Alta de Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
