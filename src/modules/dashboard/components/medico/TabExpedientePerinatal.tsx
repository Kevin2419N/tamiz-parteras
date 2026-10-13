import React, { useState } from 'react';
import {
    AlertTriangle,
    TrendingUp,
    Baby,
    Activity,
    ShieldAlert,
    Plus,
    Trash2,
    Info,
} from 'lucide-react';
import type { ExpedientePerinatal, ConsultaAntenatal, RiesgoARO } from './types';

// ─── Criterios ARO ────────────────────────────────────────────────────────────

const CRITERIOS_ARO: string[] = [
    'Edad < 15 o > 35 años',
    'Paridad ≥ 5',
    'Período intergenésico < 2 años',
    'Antecedente de mortinato o muerte neonatal',
    'Antecedente de cesárea anterior',
    'Preeclampsia / HTA crónica',
    'Diabetes mellitus pregestacional',
    'Cardiopatía materna',
    'Talla < 1.50 m',
    'IMC Pregestacional > 30',
    'Anemia severa (Hb < 8 g/dL)',
    'VIH / Sífilis positivo',
    'Gestas previas con RN < 2,500 g',
    'Embarazo múltiple',
];

// ─── Expediente inicial de demostración ──────────────────────────────────────

const EXPEDIENTE_DEMO: ExpedientePerinatal = {
    id: 'EXP-001',
    nombrePaciente: 'María del Carmen López Ruiz',
    curp: 'LORC920315MOCRPN02',
    fechaNacimiento: '1992-03-15',
    edad: 34,
    escolaridad: 'Secundaria completa',
    ocupacion: 'Hogar',
    domicilio: 'Calle Morelos #42',
    municipio: 'Juchitán de Zaragoza',
    comunidad: 'Centro',
    telefono: '9711234567',
    fumFecha: '2026-04-01',
    edadGestacionalInicioControl: 10,
    fppFecha: '2027-01-06',
    grupoSanguineo: 'O+',
    factorRh: 'POSITIVO',
    vihSerologia: 'NEGATIVO',
    vdrlSerologia: ' NON_REACTIVE',
    vacunaTetanos: true,
    vacunaDosis2: false,
    antecedentesFamiliares: {
        diabetesFamiliar: true,
        hipertensionFamiliar: false,
        gemelaridadFamiliar: false,
        malformacionesFamiliar: false,
        otros: '',
    },
    antecedentesPersonales: {
        diabetes: false,
        hipertension: false,
        cardiopatia: false,
        nefropatia: false,
        epilepsia: false,
        enfermadadesTiroideas: false,
        otros: '',
    },
    antecedentesObstetricos: {
        gestasAnteriores: 2,
        paritosAnteriores: 1,
        cesareasAnteriores: 1,
        abortosAnteriores: 0,
        mortinatos: 0,
        rpMenorA2500g: 0,
    },
    consultas: [
        {
            id: 'CONS-001',
            numeroConsulta: 1,
            fecha: '2026-06-10',
            edadGestacional: 10,
            pesoMadreKg: 62.5,
            tallaMadreM: 1.58,
            imcCalculado: 25.0,
            presionArterialSistolica: 110,
            presionArterialDiastolica: 70,
            alturaUterinaFr: 10,
            frecuenciaCardiacaFetal: 148,
            presentacion: 'Cefálica',
            edema: 'NO',
            observaciones: 'Paciente en buen estado general. Se solicitan estudios de laboratorio de primer trimestre.',
            medicoFirma: 'Dr. Jorge Ruiz Pérez',
        },
        {
            id: 'CONS-002',
            numeroConsulta: 2,
            fecha: '2026-08-05',
            edadGestacional: 18,
            pesoMadreKg: 65.0,
            tallaMadreM: 1.58,
            imcCalculado: 26.1,
            presionArterialSistolica: 115,
            presionArterialDiastolica: 75,
            alturaUterinaFr: 18,
            frecuenciaCardiacaFetal: 145,
            presentacion: 'Cefálica',
            edema: 'NO',
            observaciones: 'VDRL negativo. VIH negativo. Ultrasonido normal.',
            medicoFirma: 'Dr. Jorge Ruiz Pérez',
        },
    ],
    riesgoARO: 'MEDIO',
    criteriosARO: ['Antecedente de cesárea anterior', 'IMC Pregestacional > 30'],
};

// ─── Spike chart usando divs ──────────────────────────────────────────────────

interface MiniChartProps {
    consultas: ConsultaAntenatal[];
    campo: 'alturaUterinaFr' | 'pesoMadreKg';
    label: string;
    color: string;
}

const MiniBarChart: React.FC<MiniChartProps> = ({ consultas, campo, label, color }) => {
    const valores = consultas.map(c => c[campo]);
    const max = Math.max(...valores, 1);
    return (
        <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</p>
            <div className="flex items-end gap-1 h-16 border-b border-slate-200">
                {valores.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                        <span className="text-[9px] font-bold text-slate-500">{v}</span>
                        <div
                            className={`w-full rounded-t-sm ${color}`}
                            style={{ height: `${(v / max) * 52}px` }}
                        />
                    </div>
                ))}
            </div>
            <div className="flex gap-1 mt-1">
                {consultas.map(c => (
                    <div key={c.id} className="flex-1 text-center text-[8px] text-slate-400 font-bold">S{c.edadGestacional}</div>
                ))}
            </div>
        </div>
    );
};

// ─── Badge ARO ────────────────────────────────────────────────────────────────

function getAROBadge(riesgo: RiesgoARO): React.ReactNode {
    const map: Record<RiesgoARO, { label: string; cls: string }> = {
        BAJO: { label: 'Bajo Riesgo Obstétrico', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
        MEDIO: { label: 'Riesgo Obstétrico Moderado', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
        ALTO: { label: 'ALTO RIESGO OBSTÉTRICO (ARO)', cls: 'bg-rose-100 text-rose-900 border-rose-400 font-black' },
    };
    const { label, cls } = map[riesgo];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border ${cls}`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            {label}
        </span>
    );
}

// ─── Exportar ─────────────────────────────────────────────────────────────────

export const TabExpedientePerinatal: React.FC = () => {
    const [expediente, setExpediente] = useState<ExpedientePerinatal>(EXPEDIENTE_DEMO);
    const [nuevaConsulta, setNuevaConsulta] = useState<Partial<ConsultaAntenatal>>({});
    const [mostrarFormConsulta, setMostrarFormConsulta] = useState(false);

    const agregarConsulta = () => {
        if (!nuevaConsulta.fecha || !nuevaConsulta.edadGestacional) return;
        const cons: ConsultaAntenatal = {
            id: `CONS-${Date.now()}`,
            numeroConsulta: expediente.consultas.length + 1,
            fecha: nuevaConsulta.fecha ?? '',
            edadGestacional: Number(nuevaConsulta.edadGestacional ?? 0),
            pesoMadreKg: Number(nuevaConsulta.pesoMadreKg ?? 0),
            tallaMadreM: Number(nuevaConsulta.tallaMadreM ?? expediente.consultas[0]?.tallaMadreM ?? 0),
            imcCalculado: Number(
                (Number(nuevaConsulta.pesoMadreKg ?? 0) /
                    (Number(nuevaConsulta.tallaMadreM ?? expediente.consultas[0]?.tallaMadreM ?? 1) ** 2)).toFixed(1)
            ),
            presionArterialSistolica: Number(nuevaConsulta.presionArterialSistolica ?? 0),
            presionArterialDiastolica: Number(nuevaConsulta.presionArterialDiastolica ?? 0),
            alturaUterinaFr: Number(nuevaConsulta.alturaUterinaFr ?? 0),
            frecuenciaCardiacaFetal: Number(nuevaConsulta.frecuenciaCardiacaFetal ?? 0),
            presentacion: nuevaConsulta.presentacion ?? 'Cefálica',
            edema: (nuevaConsulta.edema as ConsultaAntenatal['edema']) ?? 'NO',
            observaciones: nuevaConsulta.observaciones ?? '',
            medicoFirma: nuevaConsulta.medicoFirma ?? 'Dr. Jorge Ruiz Pérez',
        };
        setExpediente(prev => ({ ...prev, consultas: [...prev.consultas, cons] }));
        setNuevaConsulta({});
        setMostrarFormConsulta(false);
    };

    const eliminarConsulta = (id: string) => {
        setExpediente(prev => ({ ...prev, consultas: prev.consultas.filter(c => c.id !== id) }));
    };

    return (
        <div className="space-y-6 mt-4">

            {/* Badge ARO + encabezado */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        EXPEDIENTE DIGITAL — CARNÉ PERINATAL (CLAP / OPS-OMS)
                    </p>
                    <p className="text-base font-black text-slate-900 mt-0.5">{expediente.nombrePaciente}</p>
                    <p className="text-xs text-slate-500">CURP: {expediente.curp} · Tel: {expediente.telefono}</p>
                </div>
                {getAROBadge(expediente.riesgoARO)}
            </div>

            {/* Criterios ARO (si aplica) */}
            {expediente.criteriosARO.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <p className="text-xs font-black text-rose-800">Criterios de Alto Riesgo Obstétrico identificados:</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {expediente.criteriosARO.map(crit => (
                            <span key={crit} className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[10px] font-bold">{crit}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* BLOQUE A – ANTECEDENTES */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-[#9D2449] px-5 py-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-rose-200" />
                    <h3 className="text-sm font-black text-white">Bloque A — Antecedentes</h3>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Familiares */}
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Familiares</p>
                        <div className="space-y-2">
                            {Object.entries(expediente.antecedentesFamiliares).filter(([k]) => k !== 'otros').map(([key, val]) => (
                                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                                    <input type="checkbox" readOnly checked={Boolean(val)}
                                        className="w-4 h-4 accent-[#9D2449] cursor-pointer shrink-0" />
                                    <span className="text-xs font-medium text-slate-700 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').replace('Familiar', '').trim()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Personales */}
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Personales Patológicos</p>
                        <div className="space-y-2">
                            {Object.entries(expediente.antecedentesPersonales).filter(([k]) => k !== 'otros').map(([key, val]) => (
                                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                                    <input type="checkbox" readOnly checked={Boolean(val)}
                                        className="w-4 h-4 accent-[#9D2449] cursor-pointer shrink-0" />
                                    <span className="text-xs font-medium text-slate-700 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Obstétricos */}
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Obstétricos</p>
                        <div className="space-y-2">
                            {Object.entries(expediente.antecedentesObstetricos).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-600 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="font-black text-slate-900 text-sm">{String(val)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOQUE B – GESTACIÓN ACTUAL */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-[#9D2449] px-5 py-3 flex items-center gap-2">
                    <Baby className="w-4 h-4 text-rose-200" />
                    <h3 className="text-sm font-black text-white">Bloque B — Gestación Actual</h3>
                </div>
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    {[
                        { label: 'FUM', value: expediente.fumFecha },
                        { label: 'EG Al Inicio Control', value: `${expediente.edadGestacionalInicioControl} sem.` },
                        { label: 'FPP (Naegele)', value: expediente.fppFecha },
                        { label: 'Grupo / Rh', value: `${expediente.grupoSanguineo} · ${expediente.factorRh}` },
                        { label: 'VIH Serología', value: expediente.vihSerologia },
                        { label: 'VDRL', value: expediente.vdrlSerologia === ' NON_REACTIVE' ? 'No reactivo' : expediente.vdrlSerologia },
                        { label: 'Vacuna Tétanos 1ª Dosis', value: expediente.vacunaTetanos ? 'Aplicada' : 'Pendiente' },
                        { label: 'Vacuna Tétanos 2ª Dosis', value: expediente.vacunaDosis2 ? 'Aplicada' : 'Pendiente' },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                            <p className="font-black text-slate-900">{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* BLOQUE C – CONSULTAS ANTENATALES */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-[#9D2449] px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-rose-200" />
                        <h3 className="text-sm font-black text-white">Bloque C — Control de Consultas Antenatales</h3>
                    </div>
                    <button
                        onClick={() => setMostrarFormConsulta(!mostrarFormConsulta)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-[10px] font-bold transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Nueva Consulta
                    </button>
                </div>

                {/* Mini gráficas */}
                {expediente.consultas.length > 0 && (
                    <div className="p-4 grid grid-cols-2 gap-6 bg-slate-50 border-b border-slate-200">
                        <MiniBarChart consultas={expediente.consultas} campo="alturaUterinaFr" label="Altura Uterina (cm) vs. Semanas" color="bg-rose-300" />
                        <MiniBarChart consultas={expediente.consultas} campo="pesoMadreKg" label="Peso Materno (kg) vs. Semanas" color="bg-blue-300" />
                    </div>
                )}

                {/* Formulario nueva consulta */}
                {mostrarFormConsulta && (
                    <div className="p-5 bg-rose-50 border-b border-rose-100 space-y-4">
                        <p className="text-xs font-black text-[#9D2449] uppercase tracking-wider">Registrar Nueva Consulta Antenatal</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Fecha', key: 'fecha', type: 'date' },
                                { label: 'EG (semanas)', key: 'edadGestacional', type: 'number' },
                                { label: 'Peso kg', key: 'pesoMadreKg', type: 'number' },
                                { label: 'Talla m', key: 'tallaMadreM', type: 'number' },
                                { label: 'PAS mmHg', key: 'presionArterialSistolica', type: 'number' },
                                { label: 'PAD mmHg', key: 'presionArterialDiastolica', type: 'number' },
                                { label: 'AU cm', key: 'alturaUterinaFr', type: 'number' },
                                { label: 'FCF lpm', key: 'frecuenciaCardiacaFetal', type: 'number' },
                            ].map(({ label, key, type }) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                                    <input
                                        type={type}
                                        step={type === 'number' ? '0.01' : undefined}
                                        value={String(nuevaConsulta[key as keyof ConsultaAntenatal] ?? '')}
                                        onChange={e => setNuevaConsulta(p => ({ ...p, [key]: e.target.value }))}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones</label>
                            <textarea rows={2} value={nuevaConsulta.observaciones ?? ''}
                                onChange={e => setNuevaConsulta(p => ({ ...p, observaciones: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449] resize-none" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={agregarConsulta}
                                className="px-4 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xs font-bold rounded-xl flex items-center gap-2">
                                <Plus className="w-3.5 h-3.5" /> Agregar Consulta
                            </button>
                            <button onClick={() => setMostrarFormConsulta(false)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl">
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabla de consultas */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="text-left px-4 py-3 font-black">No.</th>
                                <th className="text-left px-4 py-3 font-black">Fecha</th>
                                <th className="text-left px-4 py-3 font-black">EG</th>
                                <th className="text-left px-4 py-3 font-black">Peso</th>
                                <th className="text-left px-4 py-3 font-black">P.A.</th>
                                <th className="text-left px-4 py-3 font-black">AU</th>
                                <th className="text-left px-4 py-3 font-black">FCF</th>
                                <th className="text-left px-4 py-3 font-black">Edema</th>
                                <th className="text-left px-4 py-3 font-black">Observaciones</th>
                                <th className="px-4 py-3 font-black"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {expediente.consultas.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-black text-[#9D2449]">{c.numeroConsulta}</td>
                                    <td className="px-4 py-3 font-bold text-slate-700">{c.fecha}</td>
                                    <td className="px-4 py-3 font-bold text-slate-700">{c.edadGestacional} sem</td>
                                    <td className="px-4 py-3 font-bold text-slate-700">{c.pesoMadreKg} kg</td>
                                    <td className="px-4 py-3 font-bold text-slate-700">{c.presionArterialSistolica}/{c.presionArterialDiastolica}</td>
                                    <td className="px-4 py-3 font-bold text-slate-700">{c.alturaUterinaFr} cm</td>
                                    <td className="px-4 py-3 font-bold text-slate-700">{c.frecuenciaCardiacaFetal} lpm</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.edema === 'NO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {c.edema}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{c.observaciones}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => eliminarConsulta(c.id)}
                                            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BLOQUE D – PARTO / PUERPERIO / RN */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-[#9D2449] px-5 py-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-rose-200" />
                    <h3 className="text-sm font-black text-white">Bloque D — Parto, Puerperio y Recién Nacido</h3>
                </div>
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    {[
                        { label: 'Fecha de Parto', key: 'fechaParto', value: expediente.fechaParto ?? 'Pendiente' },
                        { label: 'Tipo de Parto', key: 'tipoParto', value: expediente.tipoPartoParto ?? 'Pendiente' },
                        { label: 'Semanas al Parto', key: 'semanas', value: expediente.semanasParto ? `${expediente.semanasParto} sem` : 'Pendiente' },
                        { label: 'APGAR 1 min', key: 'apgar1', value: expediente.apgar1 !== undefined ? String(expediente.apgar1) : 'Pendiente' },
                        { label: 'APGAR 5 min', key: 'apgar5', value: expediente.apgar5 !== undefined ? String(expediente.apgar5) : 'Pendiente' },
                        { label: 'Peso RN (g)', key: 'peso', value: expediente.pesoRNGramos ? `${expediente.pesoRNGramos} g` : 'Pendiente' },
                        { label: 'Talla RN (cm)', key: 'talla', value: expediente.tallaRNCm ? `${expediente.tallaRNCm} cm` : 'Pendiente' },
                        { label: 'PC RN (cm)', key: 'pc', value: expediente.perimetroCefalicoRNCm ? `${expediente.perimetroCefalicoRNCm} cm` : 'Pendiente' },
                        { label: 'Tamiz Neonatal', key: 'tamiz', value: expediente.tamizRNRealizado ? 'Realizado' : 'Pendiente' },
                        { label: 'Folio Guthrie', key: 'folio', value: expediente.folioGuthrie ?? 'Pendiente' },
                    ].map(({ label, value }) => (
                        <div key={label} className={`bg-slate-50 border rounded-xl p-3 ${value === 'Pendiente' ? 'border-amber-200' : 'border-slate-200'}`}>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                            <p className={`font-black text-sm ${value === 'Pendiente' ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Criterios ARO disponibles */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-5 py-3">
                    <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Criterios de ARO — Catálogo SSO Oaxaca</p>
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                    {CRITERIOS_ARO.map(crit => {
                        const activo = expediente.criteriosARO.includes(crit);
                        return (
                            <button
                                key={crit}
                                onClick={() => {
                                    setExpediente(prev => {
                                        const criterios = activo
                                            ? prev.criteriosARO.filter(c => c !== crit)
                                            : [...prev.criteriosARO, crit];
                                        const riesgoARO: RiesgoARO = criterios.length === 0 ? 'BAJO' : criterios.length <= 2 ? 'MEDIO' : 'ALTO';
                                        return { ...prev, criteriosARO: criterios, riesgoARO };
                                    });
                                }}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${activo
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                                    }`}
                            >
                                {crit}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
