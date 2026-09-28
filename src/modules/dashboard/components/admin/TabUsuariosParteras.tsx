import React, { useState } from 'react';
import { Users, UserPlus, QrCode, Key, Printer, X, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import type { UsuarioSSO, ParteraCredencial } from './types';

export const TabUsuariosParteras: React.FC = () => {
    const [subSection, setSubSection] = useState<'PARTERAS' | 'CUENTAS'>('PARTERAS');
    const [selectedParteraQR, setSelectedParteraQR] = useState<ParteraCredencial | null>(null);

    const [usuarios] = useState<UsuarioSSO[]>([
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
        }
    ]);

    const [parteras] = useState<ParteraCredencial[]>([
        {
            id: 'p1',
            nombreCompleto: 'Doña Rosa Santiz Gómez',
            curp: 'SAGR620412MOCMNS09',
            municipio: 'Juchitán de Zaragoza',
            comunidad: 'Sección Séptima',
            pinCuatroDigitos: '4892',
            estatusAcreditacion: 'ACREDITADA',
            fechaAcreditacion: '2026-01-15'
        },
        {
            id: 'p2',
            nombreCompleto: 'Doña Juana Martínez Velázquez',
            curp: 'MAVJ580903MOCMNS02',
            municipio: 'Santo Domingo Tehuantepec',
            comunidad: 'Barrio Guichivere',
            pinCuatroDigitos: '1204',
            estatusAcreditacion: 'ACREDITADA',
            fechaAcreditacion: '2026-02-10'
        },
        {
            id: 'p3',
            nombreCompleto: 'Doña Esperanza Cruz Castillo',
            curp: 'CRCE701120MOCMNS05',
            municipio: 'Salina Cruz',
            comunidad: 'Colonia Hidalgo',
            pinCuatroDigitos: '7731',
            estatusAcreditacion: 'ACREDITADA',
            fechaAcreditacion: '2026-03-01'
        },
    ]);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#9D2449]" />
                        <span>Padrón y Credencialización de Parteras Tradicionales</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Acreditación oficial, asignación de PIN de 4 dígitos y generación de credenciales QR.
                    </p>
                </div>

                {/* SELECTOR TOUCH SUBSECCIÓN */}
                <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setSubSection('PARTERAS')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${subSection === 'PARTERAS'
                                ? 'bg-[#9D2449] text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Padrón de Parteras</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSubSection('CUENTAS')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${subSection === 'CUENTAS'
                                ? 'bg-[#9D2449] text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Cuentas SSO</span>
                    </button>
                </div>
            </div>

            {/* VISTA 1: PADRÓN DE PARTERAS Y CREDENCIAL QR */}
            {subSection === 'PARTERAS' && (
                <div className="space-y-4">
                    {/* VISTA MÓVIL (< md) */}
                    <div className="space-y-3 md:hidden">
                        {parteras.map((p) => (
                            <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 uppercase tracking-wider block w-fit mb-1">
                                            {p.estatusAcreditacion}
                                        </span>
                                        <h3 className="text-xs font-black text-slate-900">{p.nombreCompleto}</h3>
                                        <p className="text-[11px] text-slate-500 font-mono">CURP: {p.curp}</p>
                                    </div>
                                    <div className="bg-slate-900 text-white font-mono font-black text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 border border-slate-700">
                                        <Key className="w-3 h-3 text-amber-400" />
                                        <span>PIN: {p.pinCuatroDigitos}</span>
                                    </div>
                                </div>

                                <div className="text-xs space-y-1 text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-1 text-slate-800 font-bold">
                                        <MapPin className="w-3.5 h-3.5 text-[#9D2449]" />
                                        <span>{p.municipio} - {p.comunidad}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 pt-1">Acreditada desde: {p.fechaAcreditacion}</div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedParteraQR(p)}
                                    className="w-full py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <QrCode className="w-4 h-4 text-rose-200" />
                                    <span>Generar Credencial QR Oficial</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* VISTA ESCRITORIO (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                                    <th className="py-3 px-4">Partera Tradicional</th>
                                    <th className="py-3 px-4">CURP</th>
                                    <th className="py-3 px-4">Municipio / Comunidad</th>
                                    <th className="py-3 px-4 text-center">PIN de Acceso</th>
                                    <th className="py-3 px-4">Acreditación SSO</th>
                                    <th className="py-3 px-4 text-right">Credencialización</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                                {parteras.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-black text-slate-900">{p.nombreCompleto}</td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600">{p.curp}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-800">{p.municipio}</div>
                                            <div className="text-[11px] text-slate-500">{p.comunidad}</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span className="bg-slate-900 text-white font-mono font-black text-xs px-2.5 py-1 rounded-xl inline-flex items-center gap-1 border border-slate-700">
                                                <Key className="w-3 h-3 text-amber-400" />
                                                <span>{p.pinCuatroDigitos}</span>
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                                                ACREDITADA SSO
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedParteraQR(p)}
                                                className="px-4 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
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

            {/* VISTA 2: GESTIÓN DE CUENTAS SSO */}
            {subSection === 'CUENTAS' && (
                <div className="space-y-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-semibold">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                                    <th className="py-3 px-4">Nombre Servidor Público</th>
                                    <th className="py-3 px-4">Correo Institucional</th>
                                    <th className="py-3 px-4">Rol Asignado</th>
                                    <th className="py-3 px-4">Unidad Médica / Adscripción</th>
                                    <th className="py-3 px-4">Estatus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {usuarios.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/80">
                                        <td className="py-3.5 px-4 font-black text-slate-900">{u.nombre}</td>
                                        <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                                        <td className="py-3.5 px-4 font-bold text-[#9D2449]">{u.rol}</td>
                                        <td className="py-3.5 px-4">{u.unidadAsignada}</td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                                {u.estatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL DE CREDENCIAL QR OFICIAL IMPRIMIBLE */}
            {selectedParteraQR && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
                        <div className="flex justify-between items-start">
                            <div className="text-left">
                                <span className="text-[10px] font-black text-[#9D2449] uppercase tracking-wider block">SERVICIOS DE SALUD DE OAXACA</span>
                                <h3 className="text-xs font-black text-slate-900">CREDENCIAL OFICIAL DE PARTERA</h3>
                            </div>
                            <button type="button" onClick={() => setSelectedParteraQR(null)} className="p-1 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* TARJETA SIMULADA DE CREDENCIAL INSTITUCIONAL */}
                        <div className="bg-gradient-to-br from-[#9D2449] via-[#7A1B38] to-slate-900 p-5 rounded-2xl text-white space-y-4 shadow-lg border border-rose-900/40 relative overflow-hidden">
                            <div className="flex items-center justify-between border-b border-white/20 pb-2">
                                <img src="/logo-jurisdiccion.png" alt="Logo" className="h-8 w-auto object-contain brightness-200" />
                                <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full">JURISDICCIÓN 2</span>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-white">{selectedParteraQR.nombreCompleto}</h4>
                                <p className="text-[10px] text-rose-200 font-mono">CURP: {selectedParteraQR.curp}</p>
                                <p className="text-[10px] text-rose-100 font-semibold">{selectedParteraQR.municipio}</p>
                            </div>

                            {/* CODIGO QR SIMULADO */}
                            <div className="bg-white p-3 rounded-xl max-w-[140px] mx-auto shadow-inner text-slate-900 space-y-1">
                                <div className="w-24 h-24 mx-auto bg-slate-900 rounded-lg flex items-center justify-center p-2">
                                    <QrCode className="w-full h-full text-white" />
                                </div>
                                <span className="text-[9px] font-mono font-black text-slate-800 block">PIN: {selectedParteraQR.pinCuatroDigitos}</span>
                            </div>

                            <div className="flex items-center justify-center gap-1 text-[9px] text-rose-200 font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Acreditada ante SSO Oaxaca</span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedParteraQR(null)}
                                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                onClick={() => alert('Imprimiendo Credencial QR...')}
                                className="flex-1 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Imprimir Credencial</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
