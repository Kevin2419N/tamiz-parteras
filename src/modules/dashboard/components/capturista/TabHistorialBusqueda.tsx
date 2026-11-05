/* spell-checker: disable */
import React, { useState, useEffect } from 'react';
import { Truck, Plus, Package, MapPin, X, CheckSquare, Square, FileSpreadsheet, Send, Loader2, AlertCircle } from 'lucide-react';
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [selectedFolios, setSelectedFolios] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [guia, setGuia] = useState('');
    const [transportista, setTransportista] = useState('Vehículo Oficial Jurisdicción No. 2');

    // Carga exclusiva de datos 100% reales desde PostgreSQL a través del backend
    useEffect(() => {
        const cargarDatosLogistica = async () => {
            setCargando(true);
            setErrorMessage(null);
            try {
                const [resLotes, resPendientes] = await Promise.all([
                    http.get('/tamiz/lotes'),
                    http.get('/tamiz/muestras-pendientes-lote')
                ]);
                setLotes(resLotes.data || []);
                setPendientes(resPendientes.data || []);
            } catch (error) {
                console.error('Error al cargar datos logísticos desde el servidor:', error);
                setErrorMessage('No se pudo conectar con el servidor para obtener los datos de lotes y muestras.');
                setLotes([]);
                setPendientes([]);
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
            alert('Por favor seleccione al menos 1 muestra real para el lote.');
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

    // Cálculos dinámicos de KPIs basados en registros reales
    const lotesEnTransito = lotes.filter((l: any) => (l.estatus || l.estatus_lote) === 'EN_TRANSITO_LESP').length;
    const totalMuestrasEnviadas = lotes.reduce((acc: number, l: any) => acc + (l.cantidadMuestras || l.cantidad_muestras || 0), 0);

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

            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-bold">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

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
                                    <td colSpan={6} className="py-10 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#9D2449]" />
                                        <span>Consultando lotes reales en PostgreSQL...</span>
                                    </td>
                                </tr>
                            ) : lotes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400 font-normal">
                                        No hay lotes de envío registrados en el sistema.
                                    </td>
                                </tr>
                            ) : (
                                lotes.map((lote: any) => (
                                    <tr key={lote.id || lote.id_lote} className="hover:bg-slate-50">
                                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{lote.id || lote.id_lote}</td>
                                        <td className="py-3.5 px-3 font-mono font-bold text-[#9D2449]">{lote.numeroGuia || lote.numero_guia}</td>
                                        <td className="py-3.5 px-3 font-semibold text-slate-700">{lote.transportista}</td>
                                        <td className="py-3.5 px-3 font-black text-slate-900">{lote.cantidadMuestras || lote.cantidad_muestras} tarjetas</td>
                                        <td className="py-3.5 px-3 text-slate-500">{(lote.fechaSalida || lote.creado_en || '').replace('T', ' ').substring(0, 16)}</td>
                                        <td className="py-3.5 px-3 text-center">
                                            {(lote.estatus || lote.estatus_lote) === 'ENTREGADO_LAB' ? (
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black border border-emerald-300">
                                                    Entregado en LESP
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black border border-amber-300">
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