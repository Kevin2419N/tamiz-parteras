import React, { useState } from 'react';
import { HeartPulse, X } from 'lucide-react';
import type { ReferenciaFormato1 } from './types';

export const TabReferencias: React.FC = () => {
    const [referencias, setReferencias] = useState<ReferenciaFormato1[]>([
        {
            id: '1',
            folio: 'REF-2026-041',
            nombrePaciente: 'María Guadalupe Vázquez',
            edad: 28,
            parteraNombre: 'Doña Rosa Santiz Gómez',
            motivoPrincipal: 'COMPLICACIONES DEL EMBARAZO (Preeclampsia leve)',
            comunidad: 'San Pedro Juchitán',
            municipio: 'Juchitán de Zaragoza',
            fecha: '2026-09-25',
            nivelRiesgo: 'ALTO',
            estatus: 'PENDIENTE',
        },
        {
            id: '2',
            folio: 'REF-2026-042',
            nombrePaciente: 'Juana Ruiz Solís',
            edad: 22,
            parteraNombre: 'Doña Petrona Cruz Velasco',
            motivoPrincipal: 'APLICAR TOXOIDE TETÁNICO (Esquema incompleto)',
            comunidad: 'La Ventosa',
            municipio: 'Juchitán de Zaragoza',
            fecha: '2026-09-24',
            nivelRiesgo: 'MEDIO',
            estatus: 'CONTRAREFERIDO',
            diagnosticoMedico: 'Gestante de 24 SDG sin inmunización tetánica. Aplicación de dosis 1 efectuada sin complicaciones.',
            tratamiento: 'Cita en 4 semanas para 2da dosis. Indicaciones de seguimiento prenatal con partera.',
            medicoResponsable: 'Dr. Alejandro Murat H.',
            centroSaludRespuesta: 'Centro de Salud Urbano Juchitán',
        },
        {
            id: '3',
            folio: 'REF-2026-043',
            nombrePaciente: 'Elena Morales Jiménez',
            edad: 34,
            parteraNombre: 'Doña Micaela Ruiz Hernández',
            motivoPrincipal: 'PUERPERIO COMPLICADO (Sangrado moderado postparto)',
            comunidad: 'San Blas Atempa',
            municipio: 'San Blas Atempa',
            fecha: '2026-09-26',
            nivelRiesgo: 'CRITICO',
            estatus: 'PENDIENTE',
        },
    ]);

    // Modal Contrareferencia
    const [selectedReferencia, setSelectedReferencia] = useState<ReferenciaFormato1 | null>(null);
    const [diagnostico, setDiagnostico] = useState('');
    const [tratamiento, setTratamiento] = useState('');
    const [medico, setMedico] = useState('Dr. Alejandro Murat H.');
    const [centroSalud, setCentroSalud] = useState('Centro de Salud Urbano Juchitán');

    const handleOpenResponderModal = (ref: ReferenciaFormato1) => {
        setSelectedReferencia(ref);
        setDiagnostico(ref.diagnosticoMedico || '');
        setTratamiento(ref.tratamiento || '');
        setMedico(ref.medicoResponsable || 'Dr. Alejandro Murat H.');
        setCentroSalud(ref.centroSaludRespuesta || 'Centro de Salud Urbano Juchitán');
    };

    const handleSubmitContrareferencia = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReferencia) return;

        setReferencias(
            referencias.map((r) =>
                r.id === selectedReferencia.id
                    ? {
                        ...r,
                        estatus: 'CONTRAREFERIDO',
                        diagnosticoMedico: diagnostico,
                        tratamiento: tratamiento,
                        medicoResponsable: medico,
                        centroSaludRespuesta: centroSalud,
                    }
                    : r
            )
        );
        setSelectedReferencia(null);
    };

    const getRiesgoBadge = (riesgo: ReferenciaFormato1['nivelRiesgo']) => {
        switch (riesgo) {
            case 'CRITICO':
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white animate-pulse">CRÍTICO</span>;
            case 'ALTO':
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">ALTO</span>;
            case 'MEDIO':
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">MEDIO</span>;
            case 'BAJO':
            default:
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">BAJO</span>;
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-[#9D2449]" />
                    <span>Referencias y Contrareferencias Comunitarias (Formato 1 SSO)</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                    Gestión médica de canalizaciones remitidas por la Red Comunitaria de Parteras Tradicionales.
                </p>
            </div>

            {/* TABLA CLINICA DE REFERENCIAS */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                            <th className="py-3 px-4">Folio Ficha</th>
                            <th className="py-3 px-4">Paciente (Edad)</th>
                            <th className="py-3 px-4">Partera Referente</th>
                            <th className="py-3 px-4">Motivo Principal</th>
                            <th className="py-3 px-4">Riesgo</th>
                            <th className="py-3 px-4">Estatus</th>
                            <th className="py-3 px-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {referencias.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-4 font-black text-slate-900">{r.folio}</td>
                                <td className="py-3 px-4">
                                    <div className="font-bold text-slate-900">{r.nombrePaciente}</div>
                                    <div className="text-[11px] text-slate-500">{r.edad} años</div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="font-bold text-slate-800">{r.parteraNombre}</div>
                                    <div className="text-[11px] text-slate-500">{r.comunidad}</div>
                                </td>
                                <td className="py-3 px-4 max-w-xs font-medium text-slate-800">{r.motivoPrincipal}</td>
                                <td className="py-3 px-4">{getRiesgoBadge(r.nivelRiesgo)}</td>
                                <td className="py-3 px-4">
                                    {r.estatus === 'PENDIENTE' ? (
                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                            PENDIENTE DE ATENCIÓN
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                            CONTRAREFERIDO
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenResponderModal(r)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm ${r.estatus === 'PENDIENTE'
                                            ? 'bg-[#9D2449] hover:bg-[#7A1B38] text-white'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                            }`}
                                    >
                                        {r.estatus === 'PENDIENTE' ? 'Responder Contrareferencia' : 'Ver Ficha Médica'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL RESPONDER CONTRAREFERENCIA MEDICA */}
            {selectedReferencia && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div>
                                <span className="text-[10px] font-black text-[#9D2449] uppercase">Contrareferencia Médica SSO</span>
                                <h3 className="text-base font-black text-slate-900">{selectedReferencia.folio} - {selectedReferencia.nombrePaciente}</h3>
                            </div>
                            <button type="button" onClick={() => setSelectedReferencia(null)} className="p-1 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitContrareferencia} className="space-y-4 text-xs font-semibold">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                                <p className="text-slate-600"><strong className="text-slate-900">Motivo de Referencia:</strong> {selectedReferencia.motivoPrincipal}</p>
                                <p className="text-slate-600 mt-1"><strong className="text-slate-900">Partera Remitente:</strong> {selectedReferencia.parteraNombre} ({selectedReferencia.comunidad})</p>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Diagnóstico Médico Oficial</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Ingrese el diagnóstico clínico completo formulado en la Unidad Médica..."
                                    value={diagnostico}
                                    onChange={(e) => setDiagnostico(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Tratamiento Indicado y Plan de Manejo</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Describa el tratamiento otorgado e indicaciones para la partera de la comunidad..."
                                    value={tratamiento}
                                    onChange={(e) => setTratamiento(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Médico Responsable</label>
                                    <input
                                        type="text"
                                        required
                                        value={medico}
                                        onChange={(e) => setMedico(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Centro de Salud / Hospital</label>
                                    <input
                                        type="text"
                                        required
                                        value={centroSalud}
                                        onChange={(e) => setCentroSalud(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                            >
                                Emitir Contrareferencia y Notificar a la Partera
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
