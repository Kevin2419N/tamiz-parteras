import React, { useState } from 'react';
import { Users, Plus, QrCode, Key, Printer, X, MapPin, CheckCircle2, UserCheck } from 'lucide-react';
import type { ParteraCredencial } from './types';

export const TabUsuariosParteras: React.FC = () => {
    const [selectedParteraQR, setSelectedParteraQR] = useState<ParteraCredencial | null>(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const [parteras, setParteras] = useState<ParteraCredencial[]>([
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

    // Form states for new partera
    const [newNombre, setNewNombre] = useState('');
    const [newCurp, setNewCurp] = useState('');
    const [newMunicipio, setNewMunicipio] = useState('Juchitán de Zaragoza');
    const [newComunidad, setNewComunidad] = useState('');
    const [newPin, setNewPin] = useState('');

    const handleRegisterPartera = (e: React.FormEvent) => {
        e.preventDefault();
        const created: ParteraCredencial = {
            id: `p-${Date.now()}`,
            nombreCompleto: newNombre,
            curp: newCurp.toUpperCase(),
            municipio: newMunicipio,
            comunidad: newComunidad || 'Centro',
            pinCuatroDigitos: newPin || Math.floor(1000 + Math.random() * 9000).toString(),
            estatusAcreditacion: 'ACREDITADA',
            fechaAcreditacion: new Date().toISOString().split('T')[0]
        };
        setParteras([created, ...parteras]);
        setShowRegisterModal(false);
        // Reset form
        setNewNombre('');
        setNewCurp('');
        setNewComunidad('');
        setNewPin('');
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#9D2449]" />
                        <span>Padrón y Credencialización de Parteras Tradicionales</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Acreditación oficial, asignación de PIN de 4 dígitos y emisión de credenciales QR.
                    </p>
                </div>

                {/* BOTÓN REGISTRAR NUEVA PARTERA ACREDITADA */}
                <button
                    type="button"
                    onClick={() => setShowRegisterModal(true)}
                    className="px-4 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4 text-rose-200" />
                    <span>+ Registrar Nueva Partera Acreditada</span>
                </button>
            </div>

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
                            <div className="bg-amber-100 text-amber-900 font-mono font-black text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 border border-amber-300">
                                <Key className="w-3 h-3 text-amber-700" />
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
                                    <span className="bg-amber-100 text-amber-900 font-mono font-black text-xs px-2.5 py-1 rounded-xl inline-flex items-center gap-1 border border-amber-300">
                                        <Key className="w-3 h-3 text-amber-700" />
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

            {/* MODAL PARA REGISTRAR NUEVA PARTERA ACREDITADA */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-[#9D2449]" />
                                <h3 className="text-base font-black text-slate-900">Registrar Nueva Partera Acreditada</h3>
                            </div>
                            <button type="button" onClick={() => setShowRegisterModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRegisterPartera} className="space-y-3 text-xs font-semibold">
                            <div>
                                <label className="block text-slate-800 font-bold mb-1">Nombre Completo de la Partera *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Doña María Elena Velasco"
                                    value={newNombre}
                                    onChange={(e) => setNewNombre(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-800 font-bold mb-1">CURP *</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={18}
                                        placeholder="18 caracteres..."
                                        value={newCurp}
                                        onChange={(e) => setNewCurp(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 uppercase font-mono focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-800 font-bold mb-1">PIN de 4 Dígitos</label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="Ej. 5521"
                                        value={newPin}
                                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-800 font-bold mb-1">Municipio *</label>
                                    <select
                                        value={newMunicipio}
                                        onChange={(e) => setNewMunicipio(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    >
                                        <option value="Juchitán de Zaragoza">Juchitán de Zaragoza</option>
                                        <option value="Santo Domingo Tehuantepec">Santo Domingo Tehuantepec</option>
                                        <option value="Salina Cruz">Salina Cruz</option>
                                        <option value="San Blas Atempa">San Blas Atempa</option>
                                        <option value="Ciudad Ixtepec">Ciudad Ixtepec</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-800 font-bold mb-1">Comunidad / Barrio</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Sección Cuarta"
                                        value={newComunidad}
                                        onChange={(e) => setNewComunidad(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRegisterModal(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                                >
                                    Guardar y Acreditar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREDENCIAL QR PARTERA (FORMATO BLANCO INSTITUCIONAL) */}
            {selectedParteraQR && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4 text-center relative">
                        <button
                            type="button"
                            onClick={() => setSelectedParteraQR(null)}
                            className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-700"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* ENCABEZADO CON AMBOS LOGOS OFICIALES */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 pt-2">
                            <img
                                src="/logo-jurisdiccion.png"
                                alt="Jurisdicción"
                                className="h-10 w-auto object-contain mix-blend-multiply"
                            />
                            <div className="text-center">
                                <span className="text-[9px] font-black uppercase text-[#9D2449] block">SSO OAXACA</span>
                                <span className="text-[8px] font-bold text-slate-500 block">JURISDICCIÓN NO. 2</span>
                            </div>
                            <img
                                src="/Logo-Secretaria.png"
                                alt="Secretaría"
                                className="h-10 w-auto object-contain mix-blend-multiply"
                            />
                        </div>

                        {/* FRANJA GUINDA INSTITUCIONAL */}
                        <div className="bg-[#9D2449] text-white py-1.5 px-3 rounded-lg shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-wider block">
                                SERVICIOS DE SALUD DE OAXACA • ACREDITACIÓN OFICIAL
                            </span>
                        </div>

                        {/* DATOS DE LA PARTERA */}
                        <div className="space-y-1 text-slate-900">
                            <h4 className="text-sm font-black">{selectedParteraQR.nombreCompleto}</h4>
                            <p className="text-[11px] text-slate-500 font-mono">CURP: {selectedParteraQR.curp}</p>
                            <p className="text-[11px] font-bold text-slate-700">{selectedParteraQR.municipio} - {selectedParteraQR.comunidad}</p>
                        </div>

                        {/* PIN EN CAJA DORADA */}
                        <div className="bg-amber-100 text-amber-900 font-bold px-3 py-1.5 rounded-xl border border-amber-300 w-fit mx-auto text-xs flex items-center gap-1.5 shadow-inner">
                            <Key className="w-3.5 h-3.5 text-amber-700" />
                            <span>PIN DE ACCESO ACC: {selectedParteraQR.pinCuatroDigitos}</span>
                        </div>

                        {/* QR CENTRADO EN CAJA BLANCA CON BORDE */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 max-w-[140px] mx-auto shadow-sm">
                            <div className="w-24 h-24 mx-auto bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1.5">
                                <QrCode className="w-full h-full text-slate-900" />
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-800 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Partera Tradicional Acreditada y Vinculada</span>
                        </div>

                        {/* BOTÓN GUINDA OAXACA */}
                        <button
                            type="button"
                            onClick={() => alert(`Imprimiendo credencial oficial de ${selectedParteraQR.nombreCompleto}...`)}
                            className="w-full py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
