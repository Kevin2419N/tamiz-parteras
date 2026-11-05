/* spell-checker: disable */
import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Droplet, ShieldCheck, MapPin, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import type { MuestraGuthrie } from './types';
import { http } from '../../../../services/http';

export const TabTamizNeonatal: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMuestra, setSelectedMuestra] = useState<any | null>(null);

    // Estados de muestras, carga y errores
    const [muestras, setMuestras] = useState<any[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Carga oficial de muestras Guthrie desde PostgreSQL (Render)
    useEffect(() => {
        const cargarMuestras = async () => {
            setCargando(true);
            setErrorMessage(null);
            try {
                // Ruta corregida que apunta al endpoint activo del backend
                const response = await http.get('/tamiz/muestras');
                if (response.data) {
                    setMuestras(response.data);
                }
            } catch (error: any) {
                console.error('Error al cargar muestras de tamiz neonatal:', error);
                setErrorMessage('No se pudo conectar con el servidor para obtener las muestras de tamiz.');
            } finally {
                setCargando(false);
            }
        };

        cargarMuestras();
    }, []);

    const filteredMuestras = muestras.filter(
        (m) =>
            (m.folio_tarjeta || m.folio || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.rn_nombres || m.nombreRecienNacido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.madre_nombres || m.nombreMadre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.unidad_medica_nombre || m.unidadMedica || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.madre_municipio || m.municipio || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getEstatusBadge = (estatus: string) => {
        switch (estatus) {
            case 'SOSPECHOSO':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/25 text-rose-300 border border-rose-400/40 animate-pulse shadow-sm">SOSPECHOSO (ALERTA)</span>;
            case 'NORMAL':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-sm">NORMAL</span>;
            case 'EN_TRANSITO':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/25 text-blue-300 border border-blue-400/40 shadow-sm">EN TRÁNSITO</span>;
            case 'REGISTRADO':
            default:
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/10 text-cyan-200 border border-white/20 shadow-sm">REGISTRADO</span>;
        }
    };

    return (
        <div className="space-y-6 text-white w-full">

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes lgFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
                @keyframes lgModal{from{opacity:0;transform:scale(0.95) translateY(20px)}to{opacity:1;transform:none}}
                .lg-fade{animation:lgFade .35s ease both}
                .lg-modal{animation:lgModal .4s cubic-bezier(0.16,1,0.3,1) both}
                .lg-quiet{scrollbar-width:none}
                .lg-quiet::-webkit-scrollbar{display:none}
            `}} />

            {/* ENCABEZADO Y BUSCADOR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-950/40">
                        <Droplet className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                            Supervisión de Tamiz Neonatal (Muestras Guthrie)
                        </h2>
                        <p className="text-xs text-cyan-100/80 font-medium mt-0.5">
                            Panel de auditoría y seguimiento de tamizaje metabólico en la Jurisdicción No. 2 - Istmo.
                        </p>
                    </div>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-cyan-300 absolute left-3.5 top-3" />
                    <input
                        type="text"
                        placeholder="Buscar por folio, bebé, madre o municipio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/20 rounded-2xl text-xs font-medium text-white placeholder:text-cyan-200/50 focus:outline-none focus:border-cyan-400 backdrop-blur-md shadow-inner"
                    />
                </div>
            </div>

            {/* MENSAJE DE ERROR SI FALLA LA API */}
            {errorMessage && (
                <div className="p-4 bg-rose-950/60 border border-rose-300/40 rounded-2xl flex items-center gap-3 text-rose-100 text-xs font-bold backdrop-blur-md">
                    <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* VISTA MÓVIL (< md): TARJETAS COMPACTAS */}
            <div className="space-y-3 md:hidden">
                {cargando ? (
                    <div className="p-8 text-center text-xs text-cyan-200 font-medium bg-slate-900/40 rounded-2xl border border-white/20 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                        <span>Cargando muestras desde PostgreSQL (Render)...</span>
                    </div>
                ) : filteredMuestras.length === 0 ? (
                    <div className="p-8 text-center text-xs text-cyan-200/70 bg-slate-900/40 rounded-2xl border border-white/20">
                        No se encontraron registros de muestras Guthrie.
                    </div>
                ) : (
                    filteredMuestras.map((m) => (
                        <div key={m.id} className="p-4 bg-slate-900/60 rounded-2xl border border-white/20 space-y-3 backdrop-blur-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-cyan-300 tracking-wider uppercase block">{m.folio_tarjeta || m.folio}</span>
                                    <h3 className="text-xs font-black text-white">{m.rn_nombres || m.nombreRecienNacido} {m.rn_apellido_paterno || ''}</h3>
                                    <p className="text-[11px] text-cyan-100/80 font-medium">Madre: {m.madre_nombres || m.nombreMadre} {m.madre_apellido_paterno || ''}</p>
                                </div>
                                <div>{getEstatusBadge(m.estatus_muestra || m.estatus || 'REGISTRADO')}</div>
                            </div>

                            <div className="text-xs space-y-1 text-cyan-50 bg-white/5 p-3 rounded-xl border border-white/10">
                                <div className="flex justify-between">
                                    <span className="font-bold text-cyan-200">Fecha Toma:</span>
                                    <span>{(m.rn_fecha_toma_muestra || m.fechaToma || '').split('T')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-cyan-200 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-cyan-400" />
                                        {m.madre_municipio || m.municipio || 'Juchitán'}:
                                    </span>
                                    <span className="truncate max-w-[140px]">{m.unidad_medica_nombre || m.unidadMedica}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedMuestra(m)}
                                className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/30"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Auditar Expediente</span>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* VISTA ESCRITORIO (>= md): TABLA DENSA */}
            <div className="w-full rounded-3xl border border-white/30 bg-slate-900/40 shadow-2xl backdrop-blur-3xl overflow-hidden">
                <div className="w-full overflow-x-auto lg-quiet">
                    <table className="w-full text-left border-collapse min-w-[850px]">
                        <thead>
                            <tr className="bg-white/5 text-cyan-200 font-bold uppercase text-[11px] tracking-wider border-b border-white/20">
                                <th className="py-4 px-5">Folio Guthrie</th>
                                <th className="py-4 px-5">Recién Nacido / Madre</th>
                                <th className="py-4 px-5">Fecha Toma</th>
                                <th className="py-4 px-5">Unidad / Municipio</th>
                                <th className="py-4 px-5 text-center">Gota Talar</th>
                                <th className="py-4 px-5">Estatus</th>
                                <th className="py-4 px-5 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-xs font-semibold text-cyan-50/90">
                            {cargando ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-cyan-200 font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                            <span>Cargando muestras desde PostgreSQL (Render)...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMuestras.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-cyan-200/70 font-normal">
                                        No se encontraron registros de muestras Guthrie.
                                    </td>
                                </tr>
                            ) : (
                                filteredMuestras.map((m) => (
                                    <tr key={m.id} className="hover:bg-white/10 transition-colors">
                                        <td className="py-4 px-5 font-black text-white">{m.folio_tarjeta || m.folio}</td>
                                        <td className="py-4 px-5">
                                            <div className="font-bold text-white">{m.rn_nombres || m.nombreRecienNacido} {m.rn_apellido_paterno || ''}</div>
                                            <div className="text-[11px] text-cyan-200/80 font-medium">Madre: {m.madre_nombres || m.nombreMadre} {m.madre_apellido_paterno || ''}</div>
                                        </td>
                                        <td className="py-4 px-5 text-cyan-100">{(m.rn_fecha_toma_muestra || m.fechaToma || '').split('T')[0]}</td>
                                        <td className="py-4 px-5">
                                            <div className="font-bold text-white">{m.unidad_medica_nombre || m.unidadMedica}</div>
                                            <div className="text-[11px] text-cyan-200/70">{m.madre_municipio || m.municipio || 'Juchitán'}</div>
                                        </td>
                                        <td className="py-4 px-5 text-center font-black text-rose-300 font-mono">5 / 5</td>
                                        <td className="py-4 px-5">{getEstatusBadge(m.estatus_muestra || m.estatus || 'REGISTRADO')}</td>
                                        <td className="py-4 px-5 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedMuestra(m)}
                                                className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 border border-white/30 shadow-md ml-auto"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-cyan-200" />
                                                <span>Auditar</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DETALLE DE MUESTRA (AUDITORÍA) */}
            {selectedMuestra && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900/95 border border-white/40 rounded-[32px] max-w-md w-full p-6 space-y-4 shadow-2xl shadow-slate-950/90 backdrop-blur-3xl lg-modal">
                        <div className="flex items-center justify-between border-b border-white/20 pb-4">
                            <div>
                                <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">Ficha Técnica Guthrie</span>
                                <h3 className="text-base font-black text-white">{selectedMuestra.folio_tarjeta || selectedMuestra.folio}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedMuestra(null)}
                                className="p-2 text-cyan-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md">
                                <p className="font-bold text-white">Recién Nacido: <span className="text-cyan-200">{selectedMuestra.rn_nombres || selectedMuestra.nombreRecienNacido} {selectedMuestra.rn_apellido_paterno || ''}</span></p>
                                <p className="text-cyan-100/90">Madre: {selectedMuestra.madre_nombres || selectedMuestra.nombreMadre} {selectedMuestra.madre_apellido_paterno || ''}</p>
                                <p className="text-cyan-100/90">Fecha Toma: {(selectedMuestra.rn_fecha_toma_muestra || selectedMuestra.fechaToma || '').split('T')[0]}</p>
                                <p className="text-cyan-100/90">Unidad: {selectedMuestra.unidad_medica_nombre || selectedMuestra.unidadMedica} ({selectedMuestra.madre_municipio || selectedMuestra.municipio})</p>
                            </div>

                            <div className="p-3.5 bg-rose-950/40 rounded-2xl border border-rose-300/30 text-rose-100 font-medium backdrop-blur-md">
                                <p className="font-bold text-rose-300 mb-0.5 uppercase tracking-wider text-[10px]">Observaciones Clínicas:</p>
                                <p className="leading-relaxed">{selectedMuestra.observaciones_captura || selectedMuestra.observaciones || 'Sin observaciones'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedMuestra(null)}
                                className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all cursor-pointer border border-white/40 flex items-center justify-center gap-2"
                            >
                                <ShieldCheck className="w-4 h-4 text-cyan-200" />
                                <span>Validar Dictamen Jurisdiccional</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TabTamizNeonatal;