/* spell-checker: disable */
import React, { useState, useEffect } from 'react';
import { Truck, Plus, Package, MapPin, X, CheckSquare, Square, FileSpreadsheet, Send, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import type { LoteEnvioLESP } from './types';
import { http } from '../../../../services/http';

interface MuestraPendiente {
    folio: string;
    rn: string;
    fecha: string;
    unidad: string;
}

export const TabControlLotes: React.FC = () => {
    const [lotes, setLotes] = useState<LoteEnvioLESP[]>([]);
    const [pendientes, setPendientes] = useState<MuestraPendiente[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);

    const [selectedFolios, setSelectedFolios] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [guia, setGuia] = useState('');
    const [transportista, setTransportista] = useState('Vehículo Oficial Jurisdicción No. 2');

    useEffect(() => {
        const cargarDatosLogistica = async () => {
            setCargando(true);
            try {
                const [resLotes, resPendientes] = await Promise.all([
                    http.get('/api/tamiz/lotes'),
                    http.get('/api/tamiz/muestras-pendientes-lote')
                ]);
                setLotes(resLotes.data || []);
                setPendientes(resPendientes.data || []);
            } catch (error) {
                console.warn('Backend no disponible, cargando respaldo logístico local:', error);
                setLotes([
                    {
                        id: 'LOTE-2026-01',
                        numeroGuia: 'GUIA-LESP-2026-981',
                        transportista: 'Vehículo Oficial Jurisdicción No. 2',
                        cantidadMuestras: 4,
                        fechaSalida: '2026-10-06 10:30',
                        estatus: 'EN_TRANSITO_LESP',
                        destino: 'Laboratorio Estatal de Salud Pública (LESP Oaxaca)'
                    } as unknown as LoteEnvioLESP
                ]);
                setPendientes([
                    { folio: '5458347', rn: 'RN Gómez Santiz', fecha: '2026-10-06', unidad: 'Centro de Salud Urbano Juchitán' },
                    { folio: '5458348', rn: 'RN Pineda Ruiz', fecha: '2026-10-06', unidad: 'Hospital General Sto. Domingo Tehuantepec' }
                ]);
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
            const res = await http.post('/api/tamiz/lotes', nuevoLotePayload);
            const loteGuardado = res.data;

            setLotes(prev => [loteGuardado, ...prev]);
            setPendientes(prev => prev.filter(p => !selectedFolios.includes(p.folio)));
            setShowModal(false);
            setGuia('');
            setSelectedFolios([]);
            alert('¡Lote de envío creado y registrado exitosamente en PostgreSQL!');
        } catch (error: any) {
            console.error('Error al crear el lote en el servidor:', error);
            const loteLocal = {
                id: `LOTE-2026-${Math.floor(Math.random() * 900 + 100)}`,
                numeroGuia: guia,
                transportista,
                cantidadMuestras: selectedFolios.length,
                fechaSalida: new Date().toISOString().replace('T', ' ').substring(0, 16),
                estatus: 'EN_TRANSITO_LESP',
                destino: 'Laboratorio Estatal de Salud Pública (LESP Oaxaca)'
            } as unknown as LoteEnvioLESP;

            setLotes(prev => [loteLocal, ...prev]);
            setPendientes(prev => prev.filter(p => !selectedFolios.includes(p.folio)));
            setShowModal(false);
            setGuia('');
            setSelectedFolios([]);
            alert('Lote creado localmente (Modo Respaldo).');
        }
    };

    const lotesEnTransito = lotes.filter((l: any) => l.estatus === 'EN_TRANSITO_LESP').length;
    const totalMuestrasEnviadas = lotes.reduce((acc: number, l: any) => acc + (l.cantidadMuestras || 0), 0);

    const cardGlassStyle = "p-4 sm:p-6 bg-white/5 rounded-3xl border border-white/30 backdrop-blur-3xl shadow-[0_20px_40px_-15px_rgba(15,23,42,0.5)] space-y-4";
    const inputGlassStyle = "w-full px-3.5 py-2.5 bg-white/5 border border-white/30 rounded-xl text-white text-xs font-semibold placeholder:text-white/40 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 backdrop-blur-md transition-all shadow-inner";
    const selectGlassStyle = "w-full px-3.5 py-2.5 bg-slate-900/40 border border-white/30 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 backdrop-blur-md transition-all shadow-inner";

    return (
        <div className="space-y-6 text-white w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 animate-fadeIn">

            {/* ENCABEZADO Y BOTÓN PRINCIPAL */}
            <div className={cardGlassStyle + " flex flex-col sm:flex-row justify-between items-center gap-4"}>
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                    <div className="p-3 bg-cyan-500/20 text-cyan-300 rounded-2xl border border-cyan-400/40 backdrop-blur-md shadow-lg shrink-0">
                        <Truck className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase text-cyan-200 tracking-widest block">
                            CONTROL LOGÍSTICO Y CADENA DE CUSTODIA • JURISDICCIÓN NO. 2
                        </span>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                            Control de Lotes y Envíos a LESP Oaxaca
                        </h2>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95 border border-white/40 shrink-0"
                >
                    <Plus className="w-4 h-4 text-cyan-100" />
                    <span>+ Crear Nuevo Lote de Envío a LESP</span>
                </button>
            </div>

            {/* TARJETAS KPI LOGÍSTICO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={cardGlassStyle + " flex items-center justify-between"}>
                    <div>
                        <span className="text-xs font-bold text-cyan-200">Lotes en Tránsito a LESP</span>
                        <p className="text-3xl font-black text-cyan-300 mt-1">{lotesEnTransito}</p>
                    </div>
                    <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-300 border border-cyan-400/40 backdrop-blur-md shadow-lg">
                        <Truck className="w-6 h-6" />
                    </div>
                </div>

                <div className={cardGlassStyle + " flex items-center justify-between"}>
                    <div>
                        <span className="text-xs font-bold text-cyan-200">Muestras Enviadas</span>
                        <p className="text-3xl font-black text-white mt-1">{totalMuestrasEnviadas}</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-300 border border-blue-400/40 backdrop-blur-md shadow-lg">
                        <Package className="w-6 h-6" />
                    </div>
                </div>

                <div className={cardGlassStyle + " flex items-center justify-between"}>
                    <div>
                        <span className="text-xs font-bold text-cyan-200">Destino Central Oficinas</span>
                        <p className="text-xs font-black text-cyan-300 mt-1">LESP Oaxaca (San Bartolo Coyotepec)</p>
                    </div>
                    <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-300 border border-indigo-400/40 backdrop-blur-md shadow-lg">
                        <MapPin className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* TABLA DE LOTES DE REMISIÓN (HÍBRIDA MÓVIL / ESCRITORIO) */}
            <div className={cardGlassStyle}>
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <h3 className="text-sm font-black text-white flex items-center gap-2.5">
                        <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-400/40 text-cyan-300">
                            <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <span>Manifiestos y Remisiones de Envíos Registrados</span>
                    </h3>
                    <span className="text-xs font-bold text-cyan-200 bg-white/10 px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-md">
                        {lotes.length} Lotes en Sistema
                    </span>
                </div>

                {/* Vista Móvil: Tarjetas */}
                <div className="block lg:hidden space-y-3">
                    {cargando ? (
                        <div className="py-12 text-center text-cyan-200 font-semibold flex items-center justify-center gap-2.5">
                            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                            <span>Cargando lotes...</span>
                        </div>
                    ) : lotes.length === 0 ? (
                        <div className="py-10 text-center text-white/50 text-xs">
                            No hay lotes de envío registrados en el sistema.
                        </div>
                    ) : (
                        lotes.map((lote: any) => (
                            <div key={lote.id} className="p-4 bg-white/5 rounded-2xl border border-white/15 space-y-2.5 backdrop-blur-md shadow-lg">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono font-black text-cyan-300 text-xs">{lote.id}</span>
                                    {lote.estatus === 'ENTREGADO_LAB' ? (
                                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black border border-emerald-400/40">Entregado en LESP</span>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-black border border-amber-400/40">En Tránsito a LESP</span>
                                    )}
                                </div>
                                <div className="text-xs space-y-1">
                                    <div><strong className="text-cyan-200">Guía:</strong> <span className="font-mono text-white font-bold">{lote.numeroGuia}</span></div>
                                    <div><strong className="text-cyan-200">Transportista:</strong> <span className="text-cyan-100">{lote.transportista}</span></div>
                                    <div><strong className="text-cyan-200">Muestras:</strong> <span className="text-white font-black">{lote.cantidadMuestras} tarjetas</span></div>
                                    <div><strong className="text-cyan-200">Salida:</strong> <span className="text-cyan-200">{lote.fechaSalida}</span></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Vista Escritorio: Tabla */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-medium">
                        <thead>
                            <tr className="bg-white/5 text-cyan-200 font-bold uppercase border-b border-white/15 text-[11px]">
                                <th className="py-3 px-3.5">N° Lote / Manifiesto</th>
                                <th className="py-3 px-3.5">Guía / Rastreo</th>
                                <th className="py-3 px-3.5">Transportista</th>
                                <th className="py-3 px-3.5">Muestras</th>
                                <th className="py-3 px-3.5">Fecha Salida</th>
                                <th className="py-3 px-3.5 text-center">Estatus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {cargando ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-cyan-200 font-semibold">
                                        <div className="flex items-center justify-center gap-2.5">
                                            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                            <span>Conectando con PostgreSQL para obtener lotes...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : lotes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-white/50">
                                        No hay lotes de envío registrados en el sistema.
                                    </td>
                                </tr>
                            ) : (
                                lotes.map((lote: any) => (
                                    <tr key={lote.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3.5 px-3.5 font-mono font-black text-cyan-300">{lote.id}</td>
                                        <td className="py-3.5 px-3.5 font-mono font-bold text-cyan-200">{lote.numeroGuia}</td>
                                        <td className="py-3.5 px-3.5 font-semibold text-white/90">{lote.transportista}</td>
                                        <td className="py-3.5 px-3.5 font-black text-white">{lote.cantidadMuestras} tarjetas</td>
                                        <td className="py-3.5 px-3.5 text-cyan-200 font-mono">{lote.fechaSalida}</td>
                                        <td className="py-3.5 px-3.5 text-center">
                                            {lote.estatus === 'ENTREGADO_LAB' ? (
                                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black border border-emerald-400/40 backdrop-blur-md">
                                                    Entregado en LESP
                                                </span>
                                            ) : lote.estatus === 'EN_TRANSITO_LESP' ? (
                                                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-black border border-amber-400/40 backdrop-blur-md">
                                                    En Tránsito a LESP
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-[10px] font-black border border-rose-400/40 backdrop-blur-md">
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

            {/* MODAL CREAR LOTE INTERACTIVO (GLASSMORPHISM) */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="relative border border-cyan-400/40 bg-slate-900/80 max-w-lg w-full p-6 sm:p-8 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl space-y-6 text-white overflow-hidden">
                        
                        <div className="absolute -top-24 -left-24 size-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-500/20 text-cyan-300 rounded-2xl border border-cyan-400/40 backdrop-blur-md">
                                    <Send className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-black text-white">Crear Nuevo Lote de Envío a LESP</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/15 rounded-2xl transition-all cursor-pointer border border-white/20 backdrop-blur-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLote} className="relative z-10 space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-cyan-100 font-bold mb-1">Número de Guía / Tracking *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. GUIA-LESP-2026-001"
                                    value={guia}
                                    onChange={(e) => setGuia(e.target.value)}
                                    className={inputGlassStyle + " font-mono text-cyan-300 uppercase"}
                                />
                            </div>

                            <div>
                                <label className="block text-cyan-100 font-bold mb-1">Transportista / Mensajería *</label>
                                <select
                                    value={transportista}
                                    onChange={(e) => setTransportista(e.target.value)}
                                    className={selectGlassStyle}
                                >
                                    <option value="Vehículo Oficial Jurisdicción No. 2" className="bg-slate-900 text-white">Vehículo Oficial Jurisdicción No. 2</option>
                                    <option value="Mensajería Estafeta Express SSO" className="bg-slate-900 text-white">Mensajería Estafeta Express SSO</option>
                                    <option value="Servicio Postal Mexicano (Mexpost)" className="bg-slate-900 text-white">Servicio Postal Mexicano (Mexpost)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-cyan-100 font-bold mb-1.5 flex items-center justify-between">
                                    <span>Seleccionar Muestras Pendientes de Envío:</span>
                                    <span className="text-[10px] text-cyan-300 font-black font-mono">
                                        {selectedFolios.length} Muestras Seleccionadas
                                    </span>
                                </label>
                                <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-white/5 border border-white/20 rounded-2xl backdrop-blur-md">
                                    {pendientes.length === 0 ? (
                                        <p className="text-white/50 text-center py-4 text-xs">No hay muestras pendientes de envío registradas.</p>
                                    ) : (
                                        pendientes.map((p) => {
                                            const isSelected = selectedFolios.includes(p.folio);
                                            return (
                                                <div
                                                    key={p.folio}
                                                    onClick={() => toggleSelectFolio(p.folio)}
                                                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all backdrop-blur-md ${isSelected ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg' : 'bg-white/5 border-white/15 hover:bg-white/10 text-white/90'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        {isSelected ? (
                                                            <CheckSquare className="w-4 h-4 text-cyan-300 shrink-0" />
                                                        ) : (
                                                            <Square className="w-4 h-4 text-white/40 shrink-0" />
                                                        )}
                                                        <div>
                                                            <span className="font-mono font-black text-cyan-300">{p.folio}</span>
                                                            <span className="text-white ml-2 font-bold">{p.rn}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-cyan-200/80">{p.unidad}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold rounded-2xl shadow-lg shadow-cyan-950/50 cursor-pointer transition-all active:scale-95 border border-white/40"
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