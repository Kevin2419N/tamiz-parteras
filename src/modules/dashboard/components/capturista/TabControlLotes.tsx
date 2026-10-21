import React, { useState, useEffect } from 'react';
import { Truck, Plus, Package, MapPin, X, CheckSquare, Square, FileSpreadsheet, Send } from 'lucide-react';
import type { LoteEnvioLESP } from './types';

interface MuestraPendiente {
    folio: string;
    rn: string;
    fecha: string;
    unidad: string;
}

export const TabControlLotes: React.FC = () => {
    // Estados limpios iniciados en arreglos vacíos
    const [lotes, setLotes] = useState<LoteEnvioLESP[]>([]);
    const [pendientes, setPendientes] = useState<MuestraPendiente[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);

    const [selectedFolios, setSelectedFolios] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [guia, setGuia] = useState('');
    const [transportista, setTransportista] = useState('Vehículo Oficial Jurisdicción No. 2');

    // Carga de lotes y muestras pendientes desde el Backend
    useEffect(() => {
        const cargarDatosLogistica = async () => {
            setCargando(true);
            try {
                // Futura llamada API:
                // const [resLotes, resPendientes] = await Promise.all([
                //     fetch('/api/tamiz/lotes'),
                //     fetch('/api/tamiz/muestras-pendientes-lote')
                // ]);
                // const dataLotes = await resLotes.json();
                // const dataPendientes = await resPendientes.json();
                // setLotes(dataLotes);
                // setPendientes(dataPendientes);
            } catch (error) {
                console.error('Error al cargar datos logísticos:', error);
            } finally {
                setCargando(false);
            }
        };

        cargarDatosLogistica();
    }, [setLotes, setPendientes]);

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
            console.log('Payload listo para envío a la API:', nuevoLotePayload);

            // Futuro envío al Backend:
            // const res = await fetch('/api/tamiz/lotes', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(nuevoLotePayload)
            // });
            // const loteGuardado = await res.json();
            // setLotes(prev => [loteGuardado, ...prev]);

            // Actualizar estado local provisionalmente
            setPendientes(prev => prev.filter(p => !selectedFolios.includes(p.folio)));
            setShowModal(false);
            setGuia('');
            setSelectedFolios([]);
        } catch (error) {
            console.error('Error al crear el lote:', error);
        }
    };

    // Cálculos dinámicos de KPIs basados en el estado real
    const lotesEnTransito = lotes.filter(l => l.estatus === 'EN_TRANSITO_LESP').length;
    const totalMuestrasEnviadas = lotes.reduce((acc, l) => acc + l.cantidadMuestras, 0);

    return (
        <div className="space-y-6">

            {/* ENCABEZADO Y BOTÓN PRINCIPAL */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl border border-amber-300">
                        <Truck className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-[#9D2449] tracking-wider block">
                            CONTROL LOGÍSTICO Y CADENA DE CUSTODIA • JURISDICCIÓN NO. 2
                        </span>
                        <h2 className="text-lg font-black text-slate-900">
                            Control de Lotes y Envíos a LESP Oaxaca
                        </h2>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="px-5 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4 text-rose-200" />
                    <span>+ Crear Nuevo Lote de Envío a LESP</span>
                </button>
            </div>

            {/* TARJETAS KPI LOGÍSTICO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500">Lotes en Tránsito a LESP</span>
                        <p className="text-3xl font-black text-amber-600 mt-1">{lotesEnTransito}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-2xl text-amber-700 border border-amber-200">
                        <Truck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500">Muestras Enviadas</span>
                        <p className="text-3xl font-black text-slate-900 mt-1">{totalMuestrasEnviadas}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700 border border-emerald-200">
                        <Package className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500">Destino Central Oficinas</span>
                        <p className="text-xs font-black text-rose-800 mt-1">LESP Oaxaca (San Bartolo Coyotepec)</p>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-2xl text-[#9D2449] border border-rose-200">
                        <MapPin className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* TABLA DE LOTES DE REMISIÓN */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-[#9D2449]" />
                        <span>Manifiestos y Remisiones de Envíos Registrados</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        {lotes.length} Lotes en Sistema
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-medium">
                        <thead>
                            <tr className="bg-slate-100/70 text-slate-500 font-bold uppercase border-b border-slate-200">
                                <th className="py-3 px-3">N° Lote / Manifiesto</th>
                                <th className="py-3 px-3">Guía / Rastreo</th>
                                <th className="py-3 px-3">Transportista</th>
                                <th className="py-3 px-3">Muestras</th>
                                <th className="py-3 px-3">Fecha Salida</th>
                                <th className="py-3 px-3 text-center">Estatus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cargando ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400 font-normal">
                                        Cargando historial de lotes de remisión...
                                    </td>
                                </tr>
                            ) : lotes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400 font-normal">
                                        No hay lotes de envío registrados en el sistema.
                                    </td>
                                </tr>
                            ) : (
                                lotes.map((lote) => (
                                    <tr key={lote.id} className="hover:bg-slate-50">
                                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{lote.id}</td>
                                        <td className="py-3.5 px-3 font-mono font-bold text-[#9D2449]">{lote.numeroGuia}</td>
                                        <td className="py-3.5 px-3 font-semibold text-slate-700">{lote.transportista}</td>
                                        <td className="py-3.5 px-3 font-black text-slate-900">{lote.cantidadMuestras} tarjetas</td>
                                        <td className="py-3.5 px-3 text-slate-500">{lote.fechaSalida}</td>
                                        <td className="py-3.5 px-3 text-center">
                                            {lote.estatus === 'ENTREGADO_LAB' ? (
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black border border-emerald-300">
                                                    Entregado en LESP
                                                </span>
                                            ) : lote.estatus === 'EN_TRANSITO_LESP' ? (
                                                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black border border-amber-300">
                                                    En Tránsito a LESP
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-rose-100 text-[#9D2449] rounded-full text-[10px] font-black border border-rose-300">
                                                    En Preparación
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-[#9D2449] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2 text-[#9D2449]">
                                <Send className="w-5 h-5" />
                                <h3 className="text-base font-black text-slate-900">Crear Nuevo Lote de Envío a LESP</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLote} className="space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-slate-800 font-bold mb-1">Número de Guía / Tracking *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. GUIA-LESP-2026-001"
                                    value={guia}
                                    onChange={(e) => setGuia(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold uppercase focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-800 font-bold mb-1">Transportista / Mensajería *</label>
                                <select
                                    value={transportista}
                                    onChange={(e) => setTransportista(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-[#9D2449]"
                                >
                                    <option value="Vehículo Oficial Jurisdicción No. 2">Vehículo Oficial Jurisdicción No. 2</option>
                                    <option value="Mensajería Estafeta Express SSO">Mensajería Estafeta Express SSO</option>
                                    <option value="Servicio Postal Mexicano (Mexpost)">Servicio Postal Mexicano (Mexpost)</option>
                                </select>
                            </div>

                            {/* SELECCIÓN DE MUESTRAS PENDIENTES */}
                            <div>
                                <label className="block text-slate-800 font-bold mb-1.5 flex items-center justify-between">
                                    <span>Seleccionar Muestras Pendientes de Envío:</span>
                                    <span className="text-[10px] text-[#9D2449] font-black font-mono">
                                        {selectedFolios.length} Muestras Seleccionadas
                                    </span>
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                                    {pendientes.length === 0 ? (
                                        <p className="text-slate-400 text-center py-2">No hay muestras pendientes de envío registradas.</p>
                                    ) : (
                                        pendientes.map((p) => {
                                            const isSelected = selectedFolios.includes(p.folio);
                                            return (
                                                <div
                                                    key={p.folio}
                                                    onClick={() => toggleSelectFolio(p.folio)}
                                                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-rose-50 border-[#9D2449]' : 'bg-white border-slate-200 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {isSelected ? (
                                                            <CheckSquare className="w-4 h-4 text-[#9D2449]" />
                                                        ) : (
                                                            <Square className="w-4 h-4 text-slate-400" />
                                                        )}
                                                        <div>
                                                            <span className="font-mono font-black text-[#9D2449]">{p.folio}</span>
                                                            <span className="text-slate-700 ml-2 font-bold">{p.rn}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-slate-500">{p.unidad}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
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