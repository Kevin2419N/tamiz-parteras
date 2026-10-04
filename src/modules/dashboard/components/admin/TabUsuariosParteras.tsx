import React, { useState, useEffect } from 'react';
import { Users, Plus, QrCode, Key, Printer, X, MapPin, CheckCircle2, UserCheck, Heart, Phone, Building2, Languages, ShieldCheck } from 'lucide-react';
import type { ParteraCredencial, UnidadCLUES } from './types';
import { getCluesCatalog, subscribeCluesCatalog } from './cluesData';

export const TabUsuariosParteras: React.FC = () => {
    const [selectedParteraQR, setSelectedParteraQR] = useState<ParteraCredencial | null>(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    // Dynamic CLUES Catalog
    const [cluesList, setCluesList] = useState<UnidadCLUES[]>(getCluesCatalog());

    useEffect(() => {
        const unsubscribe = subscribeCluesCatalog((updatedList) => {
            setCluesList(updatedList);
        });
        return unsubscribe;
    }, []);

    const [parteras, setParteras] = useState<ParteraCredencial[]>([
        {
            id: 'p1',
            nombreCompleto: 'Doña Rosa Santiz Gómez',
            curp: 'SAGR620412MOCMNS09',
            lenguaMaterna: 'Zapoteco del Istmo',
            telefonoRecaudo: '9711029384',
            municipio: 'Juchitán de Zaragoza',
            comunidad: 'Sección Séptima',
            centroSaludAdscripcion: 'Centro de Salud Urbano Juchitán',
            cluesAdscripcion: 'OASSA000451',
            pinCuatroDigitos: '4892',
            estatusAcreditacion: 'ACREDITADA',
            fechaAcreditacion: '2026-01-15'
        },
        {
            id: 'p2',
            nombreCompleto: 'Doña Juana Martínez Velázquez',
            curp: 'MAVJ580903MOCMNS02',
            lenguaMaterna: 'Zapoteco del Istmo',
            telefonoRecaudo: '9719876543',
            municipio: 'Santo Domingo Tehuantepec',
            comunidad: 'Barrio Guichivere',
            centroSaludAdscripcion: 'CESSA Tehuantepec',
            cluesAdscripcion: 'OASSA002140',
            pinCuatroDigitos: '1204',
            estatusAcreditacion: 'ACREDITADA',
            fechaAcreditacion: '2026-02-10'
        },
        {
            id: 'p3',
            nombreCompleto: 'Doña Esperanza Cruz Castillo',
            curp: 'CRCE701120MOCMNS05',
            lenguaMaterna: 'Ombeayiüts / Huave',
            telefonoRecaudo: '9715554321',
            municipio: 'Salina Cruz',
            comunidad: 'Colonia Hidalgo',
            centroSaludAdscripcion: 'Hospital General de Salina Cruz',
            cluesAdscripcion: 'OASSA003450',
            pinCuatroDigitos: '7731',
            estatusAcreditacion: 'ACREDITADA',
            fechaAcreditacion: '2026-03-01'
        },
    ]);

    // Form states for new partera modal
    const [newNombre, setNewNombre] = useState('');
    const [newCurp, setNewCurp] = useState('');
    const [newLengua, setNewLengua] = useState('Zapoteco del Istmo');
    const [newTelefono, setNewTelefono] = useState('');
    const [newMunicipio, setNewMunicipio] = useState('Juchitán de Zaragoza');
    const [newComunidad, setNewComunidad] = useState('');
    const [selectedCluesId, setSelectedCluesId] = useState('');
    const [newPin, setNewPin] = useState('');

    useEffect(() => {
        if (cluesList.length > 0 && !selectedCluesId) {
            setSelectedCluesId(cluesList[0].id);
        }
    }, [cluesList, selectedCluesId]);

    const generateRandom4Pin = () => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        setNewPin(pin);
    };

    const handleRegisterPartera = (e: React.FormEvent) => {
        e.preventDefault();
        const unit = cluesList.find((u) => u.id === selectedCluesId) || cluesList[0];

        const created: ParteraCredencial = {
            id: `p-${Date.now()}`,
            nombreCompleto: newNombre,
            curp: newCurp.toUpperCase(),
            lenguaMaterna: newLengua,
            telefonoRecaudo: newTelefono,
            municipio: newMunicipio,
            comunidad: newComunidad || 'Cabecera Municipal',
            centroSaludAdscripcion: unit ? unit.nombre : 'Centro de Salud',
            cluesAdscripcion: unit ? unit.clues : 'OASSA000000',
            pinCuatroDigitos: newPin || Math.floor(1000 + Math.random() * 9000).toString(),
            estatusAcreditacion: 'ACREDITADA',
            fechaAcreditacion: new Date().toISOString().split('T')[0]
        };
        setParteras([created, ...parteras]);
        setShowRegisterModal(false);

        // Reset form
        setNewNombre('');
        setNewCurp('');
        setNewTelefono('');
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
                        Acreditación oficial SSO, asignación de PIN táctil de 4 dígitos y vinculación con la unidad CLUES.
                    </p>
                </div>

                {/* BOTÓN REGISTRAR NUEVA PARTERA ACREDITADA */}
                <button
                    type="button"
                    onClick={() => {
                        generateRandom4Pin();
                        setShowRegisterModal(true);
                    }}
                    className="px-4 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95"
                >
                    <Plus className="w-4 h-4 text-rose-200" />
                    <span>+ Registrar Partera Acreditada</span>
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
                            <div className="text-[10px] text-slate-400 pt-1">Acreditada: {p.fechaAcreditacion}</div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedParteraQR(p)}
                            className="w-full py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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
                            <th className="py-3 px-4">Partera Tradicional / Lengua</th>
                            <th className="py-3 px-4">CURP</th>
                            <th className="py-3 px-4">Ubicación (Municipio / Comunidad)</th>
                            <th className="py-3 px-4">Centro de Salud (CLUES)</th>
                            <th className="py-3 px-4 text-center">PIN Táctil</th>
                            <th className="py-3 px-4 text-right">Credencialización</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {parteras.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4">
                                    <div className="font-black text-slate-900">{p.nombreCompleto}</div>
                                    <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                                        <Languages className="w-3 h-3 text-[#9D2449]" />
                                        <span>{p.lenguaMaterna || 'Español'}</span>
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
                                        <span>Generar Credencial</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL PARA REGISTRAR NUEVA PARTERA ACREDITADA (2 COLUMNAS COMPLETO) */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">

                        {/* ENCABEZADO MODAL */}
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

                        {/* BANNER DE ACREDITACIÓN SALUD MATERNA */}
                        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                            <ShieldCheck className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
                            <div className="space-y-0.5">
                                <span className="font-extrabold uppercase tracking-wider block text-[10px]">Acreditación Comunitaria y Enlace Intercultural</span>
                                <p className="text-slate-700 font-medium text-[11px]">
                                    La asignación del PIN de 4 dígitos permitirá a la partera dictar de forma táctil y por voz las hojas de referencia y seguimientos obstétricos comunitarios.
                                </p>
                            </div>
                        </div>

                        {/* FORMULARIO EN LAYOUT DE 2 COLUMNAS */}
                        <form onSubmit={handleRegisterPartera} className="space-y-4 text-xs font-semibold">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* COLUMNA 1 */}
                                <div className="space-y-3.5">
                                    {/* Nombre Completo de la Partera */}
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1">Nombre Completo de la Partera *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Doña María Elena Velasco"
                                            value={newNombre}
                                            onChange={(e) => setNewNombre(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                        />
                                    </div>

                                    {/* CURP de la Partera */}
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
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 uppercase font-mono focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                        />
                                    </div>

                                    {/* Lengua Materna */}
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1 flex items-center gap-1.5">
                                            <Languages className="w-3.5 h-3.5 text-[#9D2449]" />
                                            <span>Lengua Materna *</span>
                                        </label>
                                        <select
                                            value={newLengua}
                                            onChange={(e) => setNewLengua(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all font-semibold"
                                        >
                                            <option value="Zapoteco del Istmo">Zapoteco del Istmo (Diidxazá)</option>
                                            <option value="Ombeayiüts / Huave">Ombeayiüts / Huave (San Mateo / Ikoods)</option>
                                            <option value="Mixe">Mixe (Ayuuk)</option>
                                            <option value="Zoque">Zoque (Angpøiny)</option>
                                            <option value="Español">Español</option>
                                        </select>
                                    </div>

                                    {/* Teléfono / Recaudo */}
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
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* COLUMNA 2 */}
                                <div className="space-y-3.5">
                                    {/* Municipio (TEXTO LIBRE) */}
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                                            <span>Municipio / Localidad * (Texto Libre)</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Escriba el municipio..."
                                            value={newMunicipio}
                                            onChange={(e) => setNewMunicipio(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all font-semibold"
                                        />
                                    </div>

                                    {/* Comunidad / Barrio / Sección */}
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1">Comunidad / Barrio / Sección *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Sección Séptima / Barrio Guichivere"
                                            value={newComunidad}
                                            onChange={(e) => setNewComunidad(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all"
                                        />
                                    </div>

                                    {/* Centro de Salud de Adscripción (Conectado a CLUES) */}
                                    <div>
                                        <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                                            <span>Centro de Salud de Adscripción (CLUES) *</span>
                                            <Building2 className="w-3.5 h-3.5 text-[#9D2449]" />
                                        </label>
                                        <select
                                            value={selectedCluesId}
                                            onChange={(e) => setSelectedCluesId(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449] focus:bg-white transition-all font-medium text-xs"
                                        >
                                            {cluesList.map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.nombre} [{unit.clues}]
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* PIN Táctil de Acceso */}
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

                            {/* BOTONES DE ACCIÓN */}
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
                                    className="flex-1 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                >
                                    <UserCheck className="w-4 h-4 text-rose-200" />
                                    <span>Guardar y Acreditar Partera</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREDENCIAL QR PARTERA (FORMATO BLANCO INSTITUCIONAL COMPLETO CON CLUES) */}
            {selectedParteraQR && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4 text-center relative">
                        <button
                            type="button"
                            onClick={() => setSelectedParteraQR(null)}
                            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
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
                        <div className="bg-[#9D2449] text-white py-2 px-3 rounded-xl shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-wider block">
                                ACREDITACIÓN DE MEDICINA TRADICIONAL
                            </span>
                        </div>

                        {/* DATOS DE LA PARTERA */}
                        <div className="space-y-1 text-slate-900">
                            <h4 className="text-base font-black text-[#9D2449]">{selectedParteraQR.nombreCompleto}</h4>
                            <p className="text-[11px] text-slate-500 font-mono">CURP: {selectedParteraQR.curp}</p>
                            <p className="text-[11px] font-bold text-slate-700">{selectedParteraQR.municipio} • {selectedParteraQR.comunidad}</p>
                            {selectedParteraQR.lenguaMaterna && (
                                <p className="text-[10px] text-slate-500 italic">Lengua: {selectedParteraQR.lenguaMaterna}</p>
                            )}
                        </div>

                        {/* ADSCRIPCIÓN HOSPITALARIA / CLUES */}
                        {selectedParteraQR.centroSaludAdscripcion && (
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-[11px] space-y-0.5">
                                <span className="text-[9px] font-bold uppercase text-slate-400 block">Centro de Salud Adscrito:</span>
                                <div className="font-bold text-slate-800 truncate">{selectedParteraQR.centroSaludAdscripcion}</div>
                                {selectedParteraQR.cluesAdscripcion && (
                                    <div className="font-mono text-[10px] font-bold text-[#9D2449]">CLUES: {selectedParteraQR.cluesAdscripcion}</div>
                                )}
                            </div>
                        )}

                        {/* PIN EN CAJA DORADA */}
                        <div className="bg-amber-100 text-amber-900 font-bold px-3 py-2 rounded-xl border border-amber-300 w-fit mx-auto text-xs flex items-center gap-1.5 shadow-inner">
                            <Key className="w-3.5 h-3.5 text-amber-700" />
                            <span>PIN TÁCTIL: {selectedParteraQR.pinCuatroDigitos}</span>
                        </div>

                        {/* QR CENTRADO EN CAJA BLANCA CON BORDE */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 max-w-[140px] mx-auto shadow-sm">
                            <div className="w-24 h-24 mx-auto bg-white border border-slate-300 rounded-xl flex items-center justify-center p-1.5">
                                <QrCode className="w-full h-full text-slate-900" />
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-800 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Red de Salud Intercultural SSO Oaxaca</span>
                        </div>

                        {/* BOTÓN IMPRIMIR */}
                        <button
                            type="button"
                            onClick={() => alert(`Imprimiendo credencial oficial de ${selectedParteraQR.nombreCompleto}...`)}
                            className="w-full py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Imprimir Credencial QR</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
