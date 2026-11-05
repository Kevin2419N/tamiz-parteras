/* spell-checker: disable */
import React, { useState, useEffect } from 'react';
import { Truck, Plus, Package, MapPin, X, CheckSquare, Square, FileSpreadsheet, Send, Loader2 } from 'lucide-react';
import type { LoteEnvioLESP } from './types';
import { http } from '../../../../services/http'; // <--- Instancia de Axios centralizada

interface MuestraPendiente {
    folio: string;
    rn: string;
    fecha: string;
    unidad: string;
}

export const TabControlLotes: React.FC = () => {
    const [lotes, setLotes] = useState<any[]>([]);
    const [pendientes, setPendientes] = useState<MuestraPendiente[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [selectedFolios, setSelectedFolios] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [guia, setGuia] = useState('');
    const [transportista, setTransportista] = useState('Vehículo Oficial Jurisdicción No. 2');

    // Carga real de lotes y muestras pendientes desde PostgreSQL a través del backend
    useEffect(() => {
        const cargarDatosLogistica = async () => {
            setCargando(true);
            setErrorMsg(null);
            try {
                const [resLotes, resPendientes] = await Promise.all([
                    http.get('/tamiz/lotes'),
                    http.get('/tamiz/muestras-pendientes-lote')
                ]);
                setLotes(resLotes.data || []);
                setPendientes(resPendientes.data || []);
            } catch (error) {
                console.error('Error al conectar con el servidor para logística:', error);
                setErrorMsg('No se pudo conectar con el servidor para obtener los datos logísticos.');
            } finally {
                setCargando(false);
            }
        };

        cargarDatosLogistica();
    }, []);

    const toggleSelectFolio = (folio: string) => {
        setSelectedFolios(prev =>
            prev.includes(folio) ? prev.filter(f => f !== folio) : [...prev, folio]
        );
    };

    const handleCreateLote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFolios.length === 0) {
            alert('Por favor seleccione al menos 1 muestra para el lote.');
            return;
        }

        const nuevoLotePayload = {
            numeroGuia: guia,
            transportista,
            foliosIncluidos: selectedFolios,
            destino: 'Laboratorio Estatal de Salud Pública (LESP Oaxaca)'
        };

        try {
            const res = await http.post('/tamiz/lotes', nuevoLotePayload);
            const loteGuardado = res.data.data;

            setLotes(prev => [loteGuardado, ...prev]);
            setPendientes(prev => prev.filter(p => !selectedFolios.includes(p.folio)));
            setShowModal(false);
            setGuia('');
            setSelectedFolios([]);
            alert('¡Lote de envío creado y registrado exitosamente en PostgreSQL!');
        } catch (error: any) {
            console.error('Error al crear el lote en el servidor:', error);
            alert('Error al registrar el lote en el servidor PostgreSQL.');
        }
    };

    const lotesEnTransito = lotes.filter((l: any) => l.estatus === 'EN_TRANSITO_LESP').length;
    const totalMuestrasEnviadas = lotes.reduce((acc: number, l: any) => acc + (l.cantidadMuestras || l.cantidad_muestras || 0), 0);

    return (
        <div className="space-y-6 text-white">

            {/* ENCABEZADO Y BOTÓN PRINCIPAL */}
            <div className="bg-white/10 p-6 rounded-3xl border border-white/30 backdrop-blur-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-400/40 backdrop-blur-md">
                        <Truck className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-cyan-300 tracking-wider block">
                            CONTROL LOGÍSTICO Y CADENA DE CUSTODIA • JURISDICCIÓN NO. 2
                        </span>
                        <h2 className="text-lg font-black text-white">
                            Control de Lotes y Envíos a LESP Oaxaca
                        </h2>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="px-5 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 cursor-pointer transition-all active:scale-95 border border-white/40"
                >
                    <Plus className="w-4 h-4 text-cyan-200" />
                    <span>+ Crear Nuevo Lote de Envío a LESP</span>
                </button>
            </div>

            {errorMsg && (
                <div className="p-4 bg-rose-950/60 border border-rose-300/40 rounded-2xl text-rose-100 text-xs font-bold backdrop-blur-md">
                    {errorMsg}
                </div>
            )}

            {/* TARJETAS KPI LOGÍSTICO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/10 p-5 rounded-3xl border border-white/30 backdrop-blur-3xl shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-cyan-200">Lotes en Tránsito a LESP</span>
                        <p className="text-3xl font-black text-amber-300 mt-1">{lotesEnTransito}</p>
                    </div>
                    <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-300 border border-amber-400/30">
                        <Truck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white/10 p-5 rounded-3xl border border-white/30 backdrop-blur-3xl shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-cyan-200">Muestras Enviadas</span>
                        <p className="text-3xl font-black text-white mt-1">{totalMuestrasEnviadas}</p>
                    </div>
                    <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-300 border border-emerald-400/30">
                        <Package className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white/10 p-5 rounded-3xl border border-white/30 backdrop-blur-3xl shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-cyan-200">Destino Central Oficinas</span>
                        <p className="text-xs font-black text-rose-300 mt-1">LESP Oaxaca (San Bartolo Coyotepec)</p>
                    </div>
                    <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-300 border border-rose-400/30">
                        <MapPin className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* TABLA DE LOTES DE REMISIÓN */}
            <div className="bg-white/10 rounded-3xl border border-white/30 backdrop-blur-3xl shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
                        <span>Manifiestos y Remisiones de Envíos Registrados</span>
                    </h3>
                    <span className="text-xs font-bold text-cyan-200 bg-slate-900/60 px-3 py-1 rounded-full border border-white/20">
                        {lotes.length} Lotes en Sistema
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-semibold text-cyan-50">
                        <thead>
                            <tr className="bg-white/5 text-cyan-200 font-bold uppercase border-b border-white/20 text-[11px]">
                                <th className="py-3 px-3">N° Lote / Manifiesto</th>
                                <th className="py-3 px-3">Guía / Rastreo</th>
                                <th className="py-3 px-3">Transportista</th>
                                <th className="py-3 px-3">Muestras</th>
                                <th className="py-3 px-3">Fecha Salida</th>
                                <th className="py-3 px-3 text-center">Estatus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {cargando ? (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-cyan-200 font-semibold">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                            <span>Conectando con PostgreSQL para obtener lotes...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : lotes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-cyan-200/70 font-normal">
                                        No hay lotes de envío registrados en el sistema.
                                    </td>
                                </tr>
                            ) : (
                                lotes.map((lote: any) => (
                                    <tr key={lote.id || lote.id_lote} className="hover:bg-white/5">
                                        <td className="py-3.5 px-3 font-mono font-bold text-white">{lote.id || lote.id_lote}</td>
                                        <td className="py-3.5 px-3 font-mono font-bold text-cyan-300">{lote.numeroGuia || lote.numero_guia}</td>
                                        <td className="py-3.5 px-3 font-semibold text-cyan-100">{lote.transportista}</td>
                                        <td className="py-3.5 px-3 font-black text-white">{lote.cantidadMuestras || lote.cantidad_muestras} tarjetas</td>
                                        <td className="py-3.5 px-3 text-cyan-200">{(lote.fechaSalida || lote.creado_en || '').replace('T', ' ').substring(0, 16)}</td>
                                        <td className="py-3.5 px-3 text-center">
                                            {lote.estatus === 'ENTREGADO_LAB' ? (
                                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black border border-emerald-400/40">
                                                    Entregado en LESP
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-black border border-amber-400/40">
                                                    En Tránsito a LESP
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CREAR LOTE INTERACTIVO */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900/95 border border-white/40 rounded-[32px] max-w-lg w-full p-6 space-y-5 shadow-2xl backdrop-blur-3xl text-white">
                        <div className="flex items-center justify-between border-b border-white/20 pb-3">
                            <div className="flex items-center gap-2 text-cyan-300">
                                <Send className="w-5 h-5" />
                                <h3 className="text-base font-black text-white">Crear Nuevo Lote de Envío a LESP</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-1 text-cyan-200/70 hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLote} className="space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-cyan-100 font-bold mb-1">Número de Guía / Tracking *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. GUIA-LESP-2026-001"
                                    value={guia}
                                    onChange={(e) => setGuia(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-white/30 rounded-xl text-white font-mono font-bold uppercase focus:outline-none focus:border-cyan-300"
                                />
                            </div>

                            <div>
                                <label className="block text-cyan-100 font-bold mb-1">Transportista / Mensajería *</label>
                                <select
                                    value={transportista}
                                    onChange={(e) => setTransportista(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-white/30 rounded-xl text-white font-bold focus:outline-none focus:border-cyan-300"
                                >
                                    <option value="Vehículo Oficial Jurisdicción No. 2">Vehículo Oficial Jurisdicción No. 2</option>
                                    <option value="Mensajería Estafeta Express SSO">Mensajería Estafeta Express SSO</option>
                                    <option value="Servicio Postal Mexicano (Mexpost)">Servicio Postal Mexicano (Mexpost)</option>
                                </select>
                            </div>

                            {/* SELECCIÓN DE MUESTRAS PENDIENTES */}
                            <div>
                                <label className="block text-cyan-100 font-bold mb-1.5 flex items-center justify-between">
                                    <span>Seleccionar Muestras Pendientes de Envío:</span>
                                    <span className="text-[10px] text-cyan-300 font-black font-mono">
                                        {selectedFolios.length} Muestras Seleccionadas
                                    </span>
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-slate-900/60 border border-white/20 rounded-2xl">
                                    {pendientes.length === 0 ? (
                                        <p className="text-cyan-200/60 text-center py-2">No hay muestras pendientes de envío registradas.</p>
                                    ) : (
                                        pendientes.map((p) => {
                                            const isSelected = selectedFolios.includes(p.folio);
                                            return (
                                                <div
                                                    key={p.folio}
                                                    onClick={() => toggleSelectFolio(p.folio)}
                                                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-cyan-500/20 border-cyan-400 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10 text-cyan-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {isSelected ? (
                                                            <CheckSquare className="w-4 h-4 text-cyan-300" />
                                                        ) : (
                                                            <Square className="w-4 h-4 text-cyan-200/50" />
                                                        )}
                                                        <div>
                                                            <span className="font-mono font-black text-cyan-300">{p.folio}</span>
                                                            <span className="text-white ml-2 font-bold">{p.rn}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-cyan-200/70">{p.unidad}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold rounded-xl shadow-lg shadow-cyan-950/40 cursor-pointer transition-all active:scale-95 border border-white/40"
                            >
                                Confirmar y Generar Lote de Remisión
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TabControlLotes;