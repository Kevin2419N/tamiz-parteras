import React, { useState, useEffect, useMemo } from 'react';
import {
    AlertTriangle, TrendingUp, Baby, Activity, ShieldAlert,
    Plus, Trash2, Info, Printer, Calculator, ChevronDown, User,
    Edit3, FlaskConical, X, Save, Baby as BabyIcon, Syringe,
} from 'lucide-react';
import type { ExpedientePerinatal, ConsultaAntenatal, RiesgoARO, LabSerologiaForm, PartoDatosRegistro } from './types';

// ─── Datos CLAP/OPS: Percentiles Altura Uterina (cm) por semana ──────────────
const AU_WEEKS = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40];
const AU_P10 = [8, 9, 11, 13, 16, 18, 20, 22, 24, 26, 28, 30, 31, 32, 33];
const AU_P50 = [10, 11, 14, 16, 19, 21, 23, 25, 27, 29, 31, 33, 34, 35, 36];
const AU_P90 = [12, 13, 16, 19, 22, 24, 27, 29, 31, 33, 35, 37, 38, 39, 40];

// Ganancia peso (kg sobre peso inicial) P10/P50/P90 por semana (OMS/IOM)
const PW_WEEKS = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40];
const PW_P10 = [0, 0.5, 1, 1.5, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const PW_P50 = [0, 1, 2, 3, 4.5, 5.5, 7, 8.5, 10, 11, 12, 13, 14, 15, 16];
const PW_P90 = [0, 1.5, 3, 5, 7, 8.5, 10, 12, 14, 15.5, 17, 18, 19, 20, 21];

const CRITERIOS_ARO = [
    'Edad < 15 o > 35 años', 'Paridad ≥ 5', 'Período intergenésico < 2 años',
    'Antecedente de mortinato o muerte neonatal', 'Antecedente de cesárea anterior',
    'Preeclampsia / HTA crónica', 'Diabetes mellitus pregestacional', 'Cardiopatía materna',
    'Talla < 1.50 m', 'IMC Pregestacional > 30', 'Anemia severa (Hb < 8 g/dL)',
    'VIH / Sífilis positivo', 'Gestas previas con RN < 2,500 g', 'Embarazo múltiple',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function humanKey(key: string) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace('Familiar', '')
        .replace('Personal', '')
        .trim();
}

function recalcARO(
    prev: ExpedientePerinatal,
    obs: ExpedientePerinatal['antecedentesObstetricos']
): Pick<ExpedientePerinatal, 'criteriosARO' | 'riesgoARO'> {
    let criterios = [...prev.criteriosARO];
    const toggleCrit = (cond: boolean, crit: string) => {
        if (cond && !criterios.includes(crit)) criterios.push(crit);
        if (!cond) criterios = criterios.filter(c => c !== crit);
    };
    toggleCrit(obs.cesareasAnteriores > 0, 'Antecedente de cesárea anterior');
    toggleCrit(obs.gestasAnteriores >= 5, 'Paridad ≥ 5');
    toggleCrit(obs.mortinatos > 0, 'Antecedente de mortinato o muerte neonatal');
    toggleCrit(obs.rpMenorA2500g > 0, 'Gestas previas con RN < 2,500 g');
    const riesgoARO: RiesgoARO = criterios.length === 0 ? 'BAJO' : criterios.length <= 2 ? 'MEDIO' : 'ALTO';
    return { criteriosARO: criterios, riesgoARO };
}

// ─── MODAL: Editar Antecedentes (Bloque A) ───────────────────────────────────
interface ModalEditAntecedentesProps {
    expediente: ExpedientePerinatal;
    onClose: () => void;
    onSave: (updated: Partial<ExpedientePerinatal>) => void;
}

const ModalEditAntecedentes: React.FC<ModalEditAntecedentesProps> = ({ expediente, onClose, onSave }) => {
    const [familiares, setFamiliares] = useState({ ...expediente.antecedentesFamiliares });
    const [personales, setPersonales] = useState({ ...expediente.antecedentesPersonales });
    const [obs, setObs] = useState({ ...expediente.antecedentesObstetricos });

    const handleSave = () => {
        const aroUpdate = recalcARO(expediente, obs);
        onSave({ antecedentesFamiliares: familiares, antecedentesPersonales: personales, antecedentesObstetricos: obs, ...aroUpdate });
        onClose();
    };

    const boolSections: { title: string; state: Record<string, boolean>; setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>> }[] = [
        { title: 'Antecedentes Familiares', state: familiares as unknown as Record<string, boolean>, setter: setFamiliares as unknown as React.Dispatch<React.SetStateAction<Record<string, boolean>>> },
        { title: 'Antecedentes Personales Patológicos', state: personales as unknown as Record<string, boolean>, setter: setPersonales as unknown as React.Dispatch<React.SetStateAction<Record<string, boolean>>> },
    ];

    const obsFields: { key: keyof typeof obs; label: string }[] = [
        { key: 'gestasAnteriores', label: 'Gestas Anteriores' },
        { key: 'paritosAnteriores', label: 'Partos Vaginales' },
        { key: 'cesareasAnteriores', label: 'Cesáreas' },
        { key: 'abortosAnteriores', label: 'Abortos' },
        { key: 'mortinatos', label: 'Mortinatos' },
        { key: 'rpMenorA2500g', label: 'RN < 2,500 g' },
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl my-4">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                        <h3 className="text-sm font-black text-[#9D2449]">Editar Antecedentes — Bloque A</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Los criterios ARO se recalcularán automáticamente al guardar.</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-5">
                    {boolSections.map(({ title, state, setter }) => (
                        <div key={title}>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">{title}</p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(state).filter(([k]) => k !== 'otros').map(([key, val]) => (
                                    <label key={key} className="flex items-center gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                        <input type="checkbox" checked={Boolean(val)}
                                            onChange={e => setter(prev => ({ ...prev, [key]: e.target.checked }))}
                                            className="w-4 h-4 accent-[#9D2449] shrink-0" />
                                        <span className="text-xs font-medium text-slate-700 capitalize">{humanKey(key)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Antecedentes Obstétricos</p>
                        <div className="grid grid-cols-3 gap-3">
                            {obsFields.map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
                                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                                        <button type="button" onClick={() => setObs(p => ({ ...p, [key]: Math.max(0, p[key] - 1) }))}
                                            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-sm transition-colors cursor-pointer">−</button>
                                        <span className="flex-1 text-center text-sm font-black text-slate-900">{obs[key]}</span>
                                        <button type="button" onClick={() => setObs(p => ({ ...p, [key]: p[key] + 1 }))}
                                            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-sm transition-colors cursor-pointer">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
                    <button type="button" onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer">
                        <Save className="w-3.5 h-3.5" />Guardar Antecedentes
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── MODAL: Actualizar Serología / Lab (Bloque B) ─────────────────────────────
interface ModalLabSerologiaProps {
    expediente: ExpedientePerinatal;
    onClose: () => void;
    onSave: (data: LabSerologiaForm) => void;
}

const ModalLabSerologia: React.FC<ModalLabSerologiaProps> = ({ expediente, onClose, onSave }) => {
    const [form, setForm] = useState<LabSerologiaForm>({
        grupoSanguineo: expediente.grupoSanguineo,
        factorRh: (expediente.factorRh as 'POSITIVO' | 'NEGATIVO') || 'POSITIVO',
        vihSerologia: expediente.vihSerologia || 'NEGATIVO',
        vdrlSerologia: expediente.vdrlSerologia || 'NON_REACTIVE',
        hemoglobinaGdL: '',
        vacunaTetanos: expediente.vacunaTetanos,
        vacunaDosis2: expediente.vacunaDosis2,
        fechaVacuna1: '',
        fechaVacuna2: '',
    });

    const alertaRhNeg = form.factorRh === 'NEGATIVO';
    const alertaVDRL = ['REACTIVE', 'REACTIVO'].includes(String(form.vdrlSerologia).toUpperCase());

    const grupoOpts: ExpedientePerinatal['grupoSanguineo'][] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const field = (label: string, node: React.ReactNode) => (
        <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
            {node}
        </div>
    );

    const inputCls = "w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]";

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl my-4">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                        <h3 className="text-sm font-black text-[#9D2449]">Actualizar Examen / Serología — Bloque B</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Gestación actual · {expediente.nombrePaciente}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-4">
                    {alertaRhNeg && (
                        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-2xl p-3">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs font-black text-amber-800">ALERTA: Factor Rh Negativo — Verificar inmunoglobulina anti-D e isoinmunización.</p>
                        </div>
                    )}
                    {alertaVDRL && (
                        <div className="flex items-start gap-3 bg-rose-50 border border-rose-300 rounded-2xl p-3">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <p className="text-xs font-black text-rose-800">ALERTA CRÍTICA: VDRL Reactivo — Requiere tratamiento urgente con Penicilina Benzatínica y seguimiento estricto.</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        {field('Grupo Sanguíneo',
                            <div className="flex flex-wrap gap-1.5">
                                {grupoOpts.map(g => (
                                    <button key={g} type="button" onClick={() => setForm(p => ({ ...p, grupoSanguineo: g }))}
                                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all cursor-pointer ${form.grupoSanguineo === g ? 'bg-[#9D2449] border-[#9D2449] text-white' : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-[#9D2449]'
                                            }`}>{g}</button>
                                ))}
                            </div>
                        )}
                        {field('Factor Rh',
                            <div className="flex gap-2">
                                {(['POSITIVO', 'NEGATIVO'] as const).map(rh => (
                                    <button key={rh} type="button" onClick={() => setForm(p => ({ ...p, factorRh: rh }))}
                                        className={`flex-1 py-2 rounded-xl border text-[10px] font-black transition-all cursor-pointer ${form.factorRh === rh
                                            ? rh === 'NEGATIVO' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-emerald-600 border-emerald-600 text-white'
                                            : 'bg-slate-50 border-slate-300 text-slate-700'
                                            }`}>{rh}</button>
                                ))}
                            </div>
                        )}
                        {field('VIH Serología',
                            <select value={form.vihSerologia} onChange={e => setForm(p => ({ ...p, vihSerologia: e.target.value }))} className={inputCls}>
                                <option value="NEGATIVO">Negativo</option>
                                <option value="POSITIVO">Positivo</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="NO_REALIZADO">No realizado</option>
                            </select>
                        )}
                        {field('VDRL / Sífilis',
                            <select value={form.vdrlSerologia} onChange={e => setForm(p => ({ ...p, vdrlSerologia: e.target.value }))} className={inputCls}>
                                <option value="NON_REACTIVE">No Reactivo</option>
                                <option value="REACTIVE">Reactivo</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="NO_REALIZADO">No realizado</option>
                            </select>
                        )}
                        {field('Hemoglobina (g/dL)',
                            <input type="number" step="0.1" min="0" max="20" placeholder="Ej. 11.5"
                                value={form.hemoglobinaGdL} onChange={e => setForm(p => ({ ...p, hemoglobinaGdL: e.target.value }))}
                                className={inputCls} />
                        )}
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Vacunación Tdap / Tétanos</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.vacunaTetanos} onChange={e => setForm(p => ({ ...p, vacunaTetanos: e.target.checked }))}
                                        className="w-4 h-4 accent-[#9D2449]" />
                                    <span className="text-xs font-bold text-slate-700">1ª Dosis aplicada</span>
                                </label>
                                {form.vacunaTetanos && (
                                    <input type="date" value={form.fechaVacuna1} onChange={e => setForm(p => ({ ...p, fechaVacuna1: e.target.value }))}
                                        className={inputCls} />
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.vacunaDosis2} onChange={e => setForm(p => ({ ...p, vacunaDosis2: e.target.checked }))}
                                        className="w-4 h-4 accent-[#9D2449]" />
                                    <span className="text-xs font-bold text-slate-700">2ª Dosis aplicada</span>
                                </label>
                                {form.vacunaDosis2 && (
                                    <input type="date" value={form.fechaVacuna2} onChange={e => setForm(p => ({ ...p, fechaVacuna2: e.target.value }))}
                                        className={inputCls} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
                    <button type="button" onClick={() => { onSave(form); onClose(); }}
                        className="flex items-center gap-2 px-5 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer">
                        <FlaskConical className="w-3.5 h-3.5" />Guardar Serología
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── MODAL: Registrar Evento de Parto (Bloque D) ─────────────────────────────
interface ModalRegistroPartoProps {
    onClose: () => void;
    onSave: (data: PartoDatosRegistro) => void;
}

const ModalRegistroParto: React.FC<ModalRegistroPartoProps> = ({ onClose, onSave }) => {
    const [data, setData] = useState<PartoDatosRegistro>({
        fechaHoraNacimiento: '',
        tipoPartoParto: 'EUTOCICO',
        semanasParto: 38,
        apgar1: 8,
        apgar5: 9,
        pesoRNGramos: 0,
        tallaRNCm: 0,
        perimetroCefalicoRNCm: 0,
        folioGuthrie: '',
    });

    const inputCls = "w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]";
    const f = (label: string, node: React.ReactNode) => (
        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>{node}</div>
    );

    const valid = data.fechaHoraNacimiento && data.pesoRNGramos > 0;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl my-4">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                        <h3 className="text-sm font-black text-[#9D2449]">Registrar Evento de Parto — Bloque D</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Parto, Puerperio y Recién Nacido</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {f('Fecha y Hora de Nacimiento',
                            <input type="datetime-local" value={data.fechaHoraNacimiento}
                                onChange={e => setData(p => ({ ...p, fechaHoraNacimiento: e.target.value }))}
                                className={inputCls} />
                        )}
                        {f('Semanas al Parto',
                            <input type="number" min={22} max={45} value={data.semanasParto}
                                onChange={e => setData(p => ({ ...p, semanasParto: Number(e.target.value) }))}
                                className={inputCls} />
                        )}
                    </div>
                    {f('Tipo de Parto',
                        <div className="flex gap-2">
                            {(['EUTOCICO', 'DISTOCICO', 'CESAREA'] as const).map(t => (
                                <button key={t} type="button" onClick={() => setData(p => ({ ...p, tipoPartoParto: t }))}
                                    className={`flex-1 py-2 rounded-xl border text-[10px] font-black transition-all cursor-pointer ${data.tipoPartoParto === t ? 'bg-[#9D2449] border-[#9D2449] text-white' : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-[#9D2449]'
                                        }`}>{t}</button>
                            ))}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        {f('APGAR 1 min (0–10)',
                            <input type="number" min={0} max={10} value={data.apgar1}
                                onChange={e => setData(p => ({ ...p, apgar1: Number(e.target.value) }))}
                                className={inputCls} />
                        )}
                        {f('APGAR 5 min (0–10)',
                            <input type="number" min={0} max={10} value={data.apgar5}
                                onChange={e => setData(p => ({ ...p, apgar5: Number(e.target.value) }))}
                                className={inputCls} />
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {f('Peso RN (g)',
                            <input type="number" min={300} max={6000} placeholder="Ej. 3250"
                                value={data.pesoRNGramos || ''}
                                onChange={e => setData(p => ({ ...p, pesoRNGramos: Number(e.target.value) }))}
                                className={inputCls} />
                        )}
                        {f('Talla RN (cm)',
                            <input type="number" min={25} max={65} placeholder="Ej. 50"
                                value={data.tallaRNCm || ''}
                                onChange={e => setData(p => ({ ...p, tallaRNCm: Number(e.target.value) }))}
                                className={inputCls} />
                        )}
                        {f('PC RN (cm)',
                            <input type="number" min={20} max={45} placeholder="Ej. 34"
                                value={data.perimetroCefalicoRNCm || ''}
                                onChange={e => setData(p => ({ ...p, perimetroCefalicoRNCm: Number(e.target.value) }))}
                                className={inputCls} />
                        )}
                    </div>
                    {f('Folio Guthrie Asignado',
                        <input type="text" placeholder="Ej. 5458400"
                            value={data.folioGuthrie}
                            onChange={e => setData(p => ({ ...p, folioGuthrie: e.target.value }))}
                            className={inputCls} />
                    )}
                </div>
                <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
                    <button type="button" disabled={!valid} onClick={() => { if (valid) { onSave(data); onClose(); } }}
                        className="flex items-center gap-2 px-5 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                        <BabyIcon className="w-3.5 h-3.5" />Registrar Parto y RN
                    </button>
                </div>
            </div>
        </div>
    );
};

function getAROBadge(riesgo: RiesgoARO): React.ReactNode {
    const map: Record<RiesgoARO, { label: string; cls: string }> = {
        BAJO: { label: 'Bajo Riesgo Obstétrico', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
        MEDIO: { label: 'Riesgo Obstétrico Moderado', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
        ALTO: { label: 'ALTO RIESGO OBSTÉTRICO (ARO)', cls: 'bg-rose-100 text-rose-900 border-rose-400 font-black' },
    };
    const { label, cls } = map[riesgo] || map.BAJO;
    return <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border ${cls}`}><ShieldAlert className="w-3.5 h-3.5" />{label}</span>;
}

function calcObstetrics(fumStr: string) {
    if (!fumStr) return null;
    const fum = new Date(fumStr);
    const hoy = new Date();
    const diffMs = hoy.getTime() - fum.getTime();
    if (diffMs < 0) return null;
    const diffDays = Math.floor(diffMs / 86400000);
    const semanas = Math.floor(diffDays / 7);
    const dias = diffDays % 7;
    const fpp = new Date(fum.getTime() + 280 * 86400000);
    return {
        semanas, dias,
        fpp: fpp.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }),
    };
}

// ─── SVG Curva Percentil ──────────────────────────────────────────────────
interface SVGCurvaProps {
    title: string;
    subtitle?: string;
    xLabel: string;
    yLabel: string;
    weeksData: number[];
    p10: number[];
    p50: number[];
    p90: number[];
    puntos: { semana: number; valor: number }[];
    yMin?: number;
    yMax?: number;
    color?: string;
    lineColor?: string;
    unidad: string;
}

const SVGCurvaPercentil: React.FC<SVGCurvaProps> = ({
    title, subtitle, xLabel, yLabel, weeksData, p10, p50, p90, puntos,
    yMin, yMax, color = '#9D2449', lineColor = '#1e40af', unidad
}) => {
    const W = 520, H = 280, ML = 50, MR = 30, MT = 28, MB = 44;
    const plotW = W - ML - MR;
    const plotH = H - MT - MB;

    const xMin = weeksData[0];
    const xMax = weeksData[weeksData.length - 1];
    const allY = [...p10, ...p50, ...p90, ...puntos.map(p => p.valor)];
    const autoYMin = Math.floor(Math.min(...allY) - 2);
    const autoYMax = Math.ceil(Math.max(...allY) + 2);
    const ylo = yMin ?? autoYMin;
    const yhi = yMax ?? autoYMax;

    const scX = (w: number) => ML + ((w - xMin) / (xMax - xMin)) * plotW;
    const scY = (v: number) => MT + plotH - ((v - ylo) / (yhi - ylo)) * plotH;

    const pathOf = (vals: number[]) =>
        weeksData.map((w, i) => `${i === 0 ? 'M' : 'L'}${scX(w).toFixed(1)},${scY(vals[i]).toFixed(1)}`).join(' ');

    const areaPath = [
        ...weeksData.map((w, i) => `${i === 0 ? 'M' : 'L'}${scX(w).toFixed(1)},${scY(p90[i]).toFixed(1)}`),
        ...[...weeksData].reverse().map((w, i, arr) => `L${scX(w).toFixed(1)},${scY(p10[arr.length - 1 - i]).toFixed(1)}`),
        'Z'
    ].join(' ');

    const xTicks = weeksData.filter((_, i) => i % 2 === 0);
    const yRange = yhi - ylo;
    const yStep = yRange > 30 ? 5 : yRange > 15 ? 2 : 1;
    const yTicks: number[] = [];
    for (let v = Math.ceil(ylo / yStep) * yStep; v <= yhi; v += yStep) yTicks.push(v);

    const sortedPuntos = [...puntos].sort((a, b) => a.semana - b.semana);
    const trendPath = sortedPuntos.length > 1
        ? sortedPuntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${scX(p.semana).toFixed(1)},${scY(p.valor).toFixed(1)}`).join(' ')
        : '';

    const [hovered, setHovered] = useState<number | null>(null);

    const midX = (scX(xMin) + scX(xMax)) / 2;
    const midP50Y = scY(p50[Math.floor(p50.length / 2)]);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="mb-2">
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider">{title}</p>
                {subtitle && <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: 'inherit' }}>
                <rect x={ML} y={MT} width={plotW} height={plotH} fill="#f8fafc" rx="2" />
                <path d={areaPath} fill={color} fillOpacity="0.10" stroke="none" />
                <path d={pathOf(p90)} fill="none" stroke={color} strokeWidth="0.75" strokeDasharray="5 3" opacity="0.55" />
                <path d={pathOf(p10)} fill="none" stroke={color} strokeWidth="0.75" strokeDasharray="5 3" opacity="0.55" />

                {yTicks.map(v => (
                    <line key={v} x1={ML} x2={W - MR} y1={scY(v)} y2={scY(v)} stroke="#e2e8f0" strokeWidth="0.6" />
                ))}
                {xTicks.map(w => (
                    <line key={w} x1={scX(w)} x2={scX(w)} y1={MT} y2={H - MB} stroke="#e2e8f0" strokeWidth="0.6" />
                ))}

                {puntos.length === 0 && (
                    <text x={midX} y={midP50Y} textAnchor="middle" fontSize="9" fill={color} opacity="0.35" fontWeight="800">
                        ZONA NORMAL
                    </text>
                )}

                <path d={pathOf(p50)} fill="none" stroke={color} strokeWidth="2" opacity="0.65" strokeLinecap="round" strokeLinejoin="round" />

                {(['P10', 'P50', 'P90'] as const).map((lbl, idx) => {
                    const arr = [p10, p50, p90][idx];
                    const lastW = weeksData[weeksData.length - 1];
                    const yOffset = idx === 0 ? 4 : idx === 2 ? -2 : 4;
                    return (
                        <g key={lbl}>
                            <rect x={scX(lastW) + 2} y={scY(arr[arr.length - 1]) + yOffset - 7} width={24} height={9} rx={2} fill="white" opacity="0.85" />
                            <text x={scX(lastW) + 14} y={scY(arr[arr.length - 1]) + yOffset} textAnchor="middle" fontSize="8" fill={color} opacity="0.85" fontWeight="800">{lbl}</text>
                        </g>
                    );
                })}

                {trendPath && (
                    <path d={trendPath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                )}

                {sortedPuntos.map((p, i) => (
                    <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                        <circle cx={scX(p.semana)} cy={scY(p.valor)} r="7" fill={lineColor} opacity="0.15" />
                        <circle cx={scX(p.semana)} cy={scY(p.valor)} r="5" fill={lineColor} stroke="white" strokeWidth="2" />
                        <circle cx={scX(p.semana)} cy={scY(p.valor)} r="2" fill="white" />
                        {hovered === i && (
                            <g>
                                <rect x={scX(p.semana) - 28} y={scY(p.valor) - 24} width={56} height={17} rx={5} fill="#1e293b" />
                                <text x={scX(p.semana)} y={scY(p.valor) - 12} textAnchor="middle" fontSize="8.5" fill="white" fontWeight="700">
                                    Sem {p.semana}: {p.valor}{unidad}
                                </text>
                            </g>
                        )}
                    </g>
                ))}

                <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke="#94a3b8" strokeWidth="1.5" />
                <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke="#94a3b8" strokeWidth="1.5" />

                {xTicks.map(w => (
                    <g key={w}>
                        <line x1={scX(w)} x2={scX(w)} y1={H - MB} y2={H - MB + 4} stroke="#94a3b8" strokeWidth="1" />
                        <text x={scX(w)} y={H - MB + 14} textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="700">{w}</text>
                    </g>
                ))}

                {yTicks.map(v => (
                    <g key={v}>
                        <line x1={ML - 4} x2={ML} y1={scY(v)} y2={scY(v)} stroke="#94a3b8" strokeWidth="1" />
                        <text x={ML - 6} y={scY(v) + 3} textAnchor="end" fontSize="8" fill="#64748b" fontWeight="700">{v}</text>
                    </g>
                ))}

                <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="9.5" fill="#475569" fontWeight="800">{xLabel}</text>
                <text x={11} y={H / 2} textAnchor="middle" fontSize="9.5" fill="#475569" fontWeight="800" transform={`rotate(-90,11,${H / 2})`}>{yLabel}</text>
            </svg>

            <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                        <span className="w-5 border-t-[1.5px] border-dashed" style={{ borderColor: color }} />P10 / P90
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                        <span className="w-5 border-t-2" style={{ borderColor: color }} />P50 (Mediana)
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-blue-700">
                        <span className="w-5 border-t-2 border-blue-700" />Paciente
                    </span>
                </div>
                <span className="text-[9px] text-slate-400 font-medium">Fuente: CLAP/OPS-OMS</span>
            </div>
        </div>
    );
};

// ─── Widget Calculadora Obstétrica ────────────────────────────────────────────
const CalculadoraObstetrica: React.FC<{ fum: string; pesoInicial: number; talla: number }> = ({ fum, pesoInicial, talla }) => {
    const [fumLocal, setFumLocal] = useState(fum);
    const calc = useMemo(() => calcObstetrics(fumLocal), [fumLocal]);
    const imc = talla > 0 ? (pesoInicial / (talla * talla)).toFixed(1) : '—';
    const imcNum = talla > 0 ? pesoInicial / (talla * talla) : 0;
    const imcLabel = imcNum === 0 ? '' : imcNum < 18.5 ? 'Bajo peso' : imcNum < 25 ? 'Normal' : imcNum < 30 ? 'Sobrepeso' : 'Obesidad';

    return (
        <div className="bg-gradient-to-br from-rose-50 via-white to-white border border-rose-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-4 h-4 text-[#9D2449]" />
                <p className="text-xs font-black text-[#9D2449] uppercase tracking-wider">Calculadora Obstétrica Instantánea</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0">Fecha última menstruación (FUM):</label>
                <input type="date" value={fumLocal} onChange={e => setFumLocal(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9D2449]" />
            </div>
            {calc ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Edad Gestacional', value: `${calc.semanas} sem + ${calc.dias} días`, sub: 'Regla de Naegele', highlight: true },
                        { label: 'FPP (Naegele)', value: calc.fpp, sub: 'Fecha Probable de Parto', highlight: false },
                        { label: 'IMC Pregestacional', value: `${imc} kg/m²`, sub: imcLabel, highlight: false },
                        { label: 'Trimestre', value: calc.semanas < 14 ? '1er Trimestre' : calc.semanas < 28 ? '2do Trimestre' : '3er Trimestre', sub: `${calc.semanas} semanas`, highlight: false },
                    ].map(({ label, value, sub, highlight }) => (
                        <div key={label} className={`rounded-xl p-3 border text-center ${highlight ? 'bg-[#9D2449] border-[#9D2449] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                            <p className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${highlight ? 'text-rose-200' : 'text-slate-400'}`}>{label}</p>
                            <p className={`text-xs font-black leading-snug ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</p>
                            {sub && <p className={`text-[9px] mt-0.5 ${highlight ? 'text-rose-200' : 'text-slate-400'}`}>{sub}</p>}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-slate-400 font-medium">Ingrese la FUM para calcular automáticamente.</p>
            )}
        </div>
    );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export const TabExpedientePerinatal: React.FC = () => {
    const [pacientes, setPacientes] = useState<ExpedientePerinatal[]>([]);
    const [expediente, setExpediente] = useState<ExpedientePerinatal | null>(null);
    const [cargando, setCargando] = useState<boolean>(false);

    const [nuevaConsulta, setNuevaConsulta] = useState<Partial<ConsultaAntenatal>>({});
    const [mostrarFormConsulta, setMostrarFormConsulta] = useState(false);
    const [pxOpen, setPxOpen] = useState(false);
    const [modalAntecedentes, setModalAntecedentes] = useState(false);
    const [modalLabSerologia, setModalLabSerologia] = useState(false);
    const [modalRegistroParto, setModalRegistroParto] = useState(false);

    // Carga de expedientes desde el Backend
    useEffect(() => {
        const cargarExpedientes = async () => {
            setCargando(true);
            try {
                // Futura llamada API:
                // const res = await fetch('/api/medico/expedientes-perinatales');
                // const data: ExpedientePerinatal[] = await res.json();
                // setPacientes(data);
                // if (data.length > 0) setExpediente(data[0]);

                setPacientes([]); // Se usa la función para evitar el aviso de TypeScript
            } catch (error) {
                console.error('Error al cargar expedientes perinatales:', error);
            } finally {
                setCargando(false);
            }
        };

        cargarExpedientes();
    }, []);

    const agregarConsulta = () => {
        if (!expediente || !nuevaConsulta.fecha || !nuevaConsulta.edadGestacional) return;
        const talla = Number(nuevaConsulta.tallaMadreM ?? expediente.consultas[0]?.tallaMadreM ?? 1);
        const peso = Number(nuevaConsulta.pesoMadreKg ?? 0);
        const cons: ConsultaAntenatal = {
            id: `CONS-${Date.now()}`,
            numeroConsulta: expediente.consultas.length + 1,
            fecha: nuevaConsulta.fecha ?? '',
            edadGestacional: Number(nuevaConsulta.edadGestacional ?? 0),
            pesoMadreKg: peso,
            tallaMadreM: talla,
            imcCalculado: Number((peso / (talla ** 2)).toFixed(1)),
            presionArterialSistolica: Number(nuevaConsulta.presionArterialSistolica ?? 0),
            presionArterialDiastolica: Number(nuevaConsulta.presionArterialDiastolica ?? 0),
            alturaUterinaFr: Number(nuevaConsulta.alturaUterinaFr ?? 0),
            frecuenciaCardiacaFetal: Number(nuevaConsulta.frecuenciaCardiacaFetal ?? 0),
            presentacion: nuevaConsulta.presentacion ?? 'Cefálica',
            edema: (nuevaConsulta.edema as ConsultaAntenatal['edema']) ?? 'NO',
            observaciones: nuevaConsulta.observaciones ?? '',
            medicoFirma: nuevaConsulta.medicoFirma ?? 'Médico Adscrito',
        };
        setExpediente(prev => prev ? ({ ...prev, consultas: [...prev.consultas, cons] }) : null);
        setNuevaConsulta({});
        setMostrarFormConsulta(false);
    };

    const eliminarConsulta = (id: string) =>
        setExpediente(prev => prev ? ({ ...prev, consultas: prev.consultas.filter(c => c.id !== id) }) : null);

    if (cargando) {
        return <div className="text-center py-16 text-slate-400 font-semibold text-sm">Cargando expediente perinatal...</div>;
    }

    if (!expediente) {
        return (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 my-4">
                <div className="p-4 bg-rose-50 text-[#9D2449] w-12 h-12 rounded-2xl mx-auto flex items-center justify-center">
                    <Baby className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-base font-black text-slate-900">No hay expediente perinatal activo</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                        Selecciona una paciente o registra un nuevo carné perinatal (CLAP/OPS-OMS) para comenzar el control antenatal.
                    </p>
                </div>
            </div>
        );
    }

    const pesoInicial = expediente.consultas[0]?.pesoMadreKg ?? 0;
    const talla = expediente.consultas[0]?.tallaMadreM ?? 0;

    const puntosAU = expediente.consultas
        .filter(c => c.alturaUterinaFr > 0 && c.edadGestacional >= 12 && c.edadGestacional <= 40)
        .map(c => ({ semana: c.edadGestacional, valor: c.alturaUterinaFr }));
    const puntosPeso = expediente.consultas
        .filter(c => c.pesoMadreKg > 0 && c.edadGestacional >= 12 && c.edadGestacional <= 40)
        .map(c => ({ semana: c.edadGestacional, valor: +(c.pesoMadreKg - pesoInicial).toFixed(1) }));

    const vdrlValue = String(expediente.vdrlSerologia || '').toUpperCase();
    const vdrlDisplay = (vdrlValue === 'NON_REACTIVE' || vdrlValue === 'NO_REACTIVO' || vdrlValue === 'NEGATIVO')
        ? 'No reactivo'
        : (expediente.vdrlSerologia || 'Sin prueba');
    const grupoRh = `${expediente.grupoSanguineo || ''} ${expediente.factorRh || ''}`.trim() || 'Sin dato';
    const camposB = [
        { label: 'FUM', value: expediente.fumFecha || 'No registrada' },
        { label: 'EG Inicio Control', value: `${expediente.edadGestacionalInicioControl || 0} sem.` },
        { label: 'FPP (Naegele)', value: expediente.fppFecha || 'Pendiente' },
        { label: 'Grupo / Rh', value: grupoRh },
        { label: 'VIH Serología', value: expediente.vihSerologia || 'Sin prueba' },
        { label: 'VDRL', value: vdrlDisplay },
        { label: 'Vacuna Tétanos 1a', value: expediente.vacunaTetanos ? 'Aplicada' : 'Pendiente' },
        { label: 'Vacuna Tétanos 2a', value: expediente.vacunaDosis2 ? 'Aplicada' : 'Pendiente' },
    ];

    return (
        <div className="space-y-5 mt-4 print-scope">
            {/* ── Estilos @media print — Carné CLAP 2 páginas ── */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .print-scope, .print-scope * { visibility: visible !important; }
                    .no-print { display: none !important; }
                    .only-print { display: block !important; }
                    .print-page-break { page-break-before: always !important; }
                    @page { margin: 1.2cm; size: A4 portrait; }
                    .print-scope { font-family: Arial, Helvetica, sans-serif !important; font-size: 8pt !important; }
                    .print-header { border-bottom: 2px solid #9D2449; padding-bottom: 8px; margin-bottom: 10px; text-align: center; }
                    table { border-collapse: collapse; width: 100%; font-size: 7pt; }
                    th, td { border: 1px solid #cbd5e1; padding: 3px 6px; }
                    th { background: #f1f5f9; font-weight: 900; }
                    .print-graficas { display: grid !important; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
                }
                .only-print { display: none; }
            `}</style>

            {/* ── Encabezado de impresión (solo visible al imprimir) ── */}
            <div className="only-print print-header">
                <p style={{ fontSize: '7pt', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    SERVICIOS DE SALUD DE OAXACA • JURISDICCIÓN SANITARIA NO. 2 — ISTMO DE TEHUANTEPEC
                </p>
                <h1 style={{ fontSize: '13pt', fontWeight: 900, color: '#9D2449', margin: '4px 0' }}>
                    CARNÉ PERINATAL — CLAP/OPS-OMS
                </h1>
                <p style={{ fontSize: '8pt', color: '#475569' }}>
                    Paciente: <strong>{expediente.nombrePaciente}</strong> · CURP: {expediente.curp} · Tel: {expediente.telefono}
                </p>
            </div>

            {/* ── Cabecera: Selector de Paciente + Badge ARO + Botón Imprimir ── */}
            <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PACIENTE ACTIVA</p>
                    <div className="relative inline-block mt-1">
                        <button type="button" onClick={() => setPxOpen(o => !o)}
                            className="flex items-center gap-2 text-base font-black text-slate-900 hover:text-[#9D2449] transition-colors cursor-pointer">
                            <User className="w-4 h-4 text-[#9D2449]" />
                            {expediente.nombrePaciente}
                            <ChevronDown className={`w-4 h-4 transition-transform ${pxOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {pxOpen && (
                            <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 min-w-[280px]">
                                {pacientes.map(px => (
                                    <button key={px.id} type="button" onClick={() => { setExpediente(px); setPxOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-rose-50 transition-colors cursor-pointer ${px.id === expediente.id ? 'text-[#9D2449] bg-rose-50' : 'text-slate-700'}`}>
                                        {px.nombrePaciente}
                                        <span className="block text-[10px] text-slate-400 font-medium">FUM: {px.fumFecha} · FPP: {px.fppFecha}</span>
                                    </button>
                                ))}
                                <div className="border-t border-slate-100">
                                    <button type="button" onClick={() => setPxOpen(false)}
                                        className="w-full text-left px-4 py-3 text-xs font-bold text-[#9D2449] hover:bg-rose-50 flex items-center gap-2 cursor-pointer">
                                        <Plus className="w-3.5 h-3.5" />+ Registrar Nueva Gestante
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">CURP: {expediente.curp} · Tel: {expediente.telefono}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {getAROBadge(expediente.riesgoARO)}
                    <button type="button" onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer">
                        <Printer className="w-3.5 h-3.5" />Imprimir Carné CLAP (2 Páginas)
                    </button>
                </div>
            </div>

            {/* ── CALCULADORA OBSTÉTRICA ── */}
            <CalculadoraObstetrica fum={expediente.fumFecha} pesoInicial={pesoInicial} talla={talla} />

            {/* ── Criterios ARO ── */}
            {expediente.criteriosARO.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <p className="text-xs font-black text-rose-800">Criterios ARO identificados:</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {expediente.criteriosARO.map(crit => (
                            <span key={crit} className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[10px] font-bold">{crit}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── BLOQUE A — Antecedentes ── */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-[#9D2449] px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-rose-200" /><h3 className="text-sm font-black text-white">Bloque A — Antecedentes</h3>
                    </div>
                    <button type="button" onClick={() => setModalAntecedentes(true)}
                        className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-[10px] font-bold transition-all cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5" />Editar Antecedentes
                    </button>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { titulo: 'Familiares', entries: Object.entries(expediente.antecedentesFamiliares).filter(([k]) => k !== 'otros') },
                        { titulo: 'Personales Patológicos', entries: Object.entries(expediente.antecedentesPersonales).filter(([k]) => k !== 'otros') },
                    ].map(({ titulo, entries }) => (
                        <div key={titulo}>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">{titulo}</p>
                            <div className="space-y-2">
                                {entries.map(([key, val]) => (
                                    <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                                        <input type="checkbox" readOnly checked={Boolean(val)} className="w-4 h-4 accent-[#9D2449] shrink-0" />
                                        <span className="text-xs font-medium text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').replace('Familiar', '').replace('Personal', '').trim()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Obstétricos</p>
                        <div className="space-y-2">
                            {Object.entries(expediente.antecedentesObstetricos).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="font-black text-slate-900 text-sm">{String(val)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BLOQUE B — Gestación Actual ── */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-[#9D2449] px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-rose-200" /><h3 className="text-sm font-black text-white">Bloque B — Gestación Actual</h3>
                    </div>
                    <button type="button" onClick={() => setModalLabSerologia(true)}
                        className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-[10px] font-bold transition-all cursor-pointer">
                        <FlaskConical className="w-3.5 h-3.5" />Actualizar Lab / Serología
                    </button>
                </div>
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    {camposB.map((item, index) => (
                        <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                            <p className="font-black text-slate-900">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── BLOQUE C — Control Antenatal + Gráficas ── */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-[#9D2449] px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-rose-200" />
                        <h3 className="text-sm font-black text-white">Bloque C — Control Antenatal y Gráficas Percentiladas</h3>
                    </div>
                    <button type="button" onClick={() => setMostrarFormConsulta(!mostrarFormConsulta)}
                        className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-[10px] font-bold transition-all cursor-pointer">
                        <Plus className="w-3.5 h-3.5" />Nueva Consulta
                    </button>
                </div>

                {/* Gráficas SVG — Página 2 de impresión */}
                {expediente.consultas.length > 0 && (
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 border-b border-slate-200 print-graficas">
                        <SVGCurvaPercentil
                            title="Curva Altura Uterina vs Semanas (CLAP/OPS-OMS)"
                            subtitle="Percentiles P10, P50, P90 · Pub. 1562"
                            xLabel="Semanas de Gestación"
                            yLabel="A.U. (cm)"
                            weeksData={AU_WEEKS} p10={AU_P10} p50={AU_P50} p90={AU_P90}
                            puntos={puntosAU} unidad="cm" color="#9D2449" lineColor="#1e40af"
                        />
                        <SVGCurvaPercentil
                            title="Ganancia de Peso Materno vs Semanas (OMS/IOM)"
                            subtitle="Ganancia sobre peso pregestacional"
                            xLabel="Semanas de Gestación"
                            yLabel="Ganancia (kg)"
                            weeksData={PW_WEEKS} p10={PW_P10} p50={PW_P50} p90={PW_P90}
                            puntos={puntosPeso} unidad="kg" color="#1e40af" lineColor="#059669"
                            yMin={-2} yMax={22}
                        />
                    </div>
                )}

                {/* Formulario nueva consulta */}
                {mostrarFormConsulta && (
                    <div className="p-5 bg-rose-50 border-b border-rose-100 space-y-4 no-print">
                        <p className="text-xs font-black text-[#9D2449] uppercase tracking-wider">Registrar Nueva Consulta Antenatal</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Fecha', key: 'fecha', type: 'date' },
                                { label: 'EG (sem)', key: 'edadGestacional', type: 'number' },
                                { label: 'Peso kg', key: 'pesoMadreKg', type: 'number' },
                                { label: 'Talla m', key: 'tallaMadreM', type: 'number' },
                                { label: 'PAS mmHg', key: 'presionArterialSistolica', type: 'number' },
                                { label: 'PAD mmHg', key: 'presionArterialDiastolica', type: 'number' },
                                { label: 'AU cm', key: 'alturaUterinaFr', type: 'number' },
                                { label: 'FCF lpm', key: 'frecuenciaCardiacaFetal', type: 'number' },
                            ].map(({ label, key, type }) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                                    <input type={type} step={type === 'number' ? '0.01' : undefined}
                                        value={String(nuevaConsulta[key as keyof ConsultaAntenatal] ?? '')}
                                        onChange={e => setNuevaConsulta(p => ({ ...p, [key]: e.target.value }))}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#9D2449]" />
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
                            <button type="button" onClick={agregarConsulta}
                                className="px-4 py-2 bg-[#9D2449] hover:bg-[#7A1B38] text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer">
                                <Plus className="w-3.5 h-3.5" />Agregar Consulta
                            </button>
                            <button type="button" onClick={() => setMostrarFormConsulta(false)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabla consultas */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                            <tr>
                                {['No.', 'Fecha', 'EG', 'Peso', 'P.A.', 'AU', 'FCF', 'Edema', 'Observaciones', ''].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-black">{h}</th>
                                ))}
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
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.edema === 'NO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.edema}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{c.observaciones}</td>
                                    <td className="px-4 py-3 no-print">
                                        <button type="button" onClick={() => eliminarConsulta(c.id)}
                                            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {expediente.consultas.length === 0 && (
                                <tr><td colSpan={10} className="text-center py-8 text-slate-400 font-semibold">Sin consultas registradas.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── BLOQUE D — Parto / RN (Página 2 al imprimir) ── */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden print-page-break">
                <div className="bg-[#9D2449] px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-rose-200" />
                        <h3 className="text-sm font-black text-white">Bloque D — Parto, Puerperio y Recién Nacido</h3>
                    </div>
                    {!expediente.fechaParto && (
                        <button type="button" onClick={() => setModalRegistroParto(true)}
                            className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-[10px] font-bold transition-all cursor-pointer">
                            <Syringe className="w-3.5 h-3.5" />Registrar Evento de Parto
                        </button>
                    )}
                </div>
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    {[
                        { label: 'Fecha de Parto', value: expediente.fechaParto ?? 'Pendiente' },
                        { label: 'Tipo de Parto', value: expediente.tipoPartoParto ?? 'Pendiente' },
                        { label: 'Semanas al Parto', value: expediente.semanasParto ? `${expediente.semanasParto} sem` : 'Pendiente' },
                        { label: 'APGAR 1 min', value: expediente.apgar1 !== undefined ? String(expediente.apgar1) : 'Pendiente' },
                        { label: 'APGAR 5 min', value: expediente.apgar5 !== undefined ? String(expediente.apgar5) : 'Pendiente' },
                        { label: 'Peso RN (g)', value: expediente.pesoRNGramos ? `${expediente.pesoRNGramos} g` : 'Pendiente' },
                        { label: 'Talla RN (cm)', value: expediente.tallaRNCm ? `${expediente.tallaRNCm} cm` : 'Pendiente' },
                        { label: 'PC RN (cm)', value: expediente.perimetroCefalicoRNCm ? `${expediente.perimetroCefalicoRNCm} cm` : 'Pendiente' },
                        { label: 'Tamiz Neonatal', value: expediente.tamizRNRealizado ? 'Realizado ✓' : 'Pendiente' },
                        { label: 'Folio Guthrie', value: expediente.folioGuthrie ?? 'Pendiente' },
                    ].map(({ label, value }) => (
                        <div key={label} className={`bg-slate-50 border rounded-xl p-3 ${value === 'Pendiente' ? 'border-amber-200' : 'border-slate-200'}`}>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                            <p className={`font-black text-sm ${value === 'Pendiente' ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Catálogo ARO — sin imprimir ── */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden no-print">
                <div className="bg-slate-100 px-5 py-3">
                    <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Criterios ARO — Catálogo SSO Oaxaca (clic para activar/desactivar)</p>
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                    {CRITERIOS_ARO.map(crit => {
                        const activo = expediente.criteriosARO.includes(crit);
                        return (
                            <button key={crit} type="button" onClick={() => {
                                setExpediente(prev => {
                                    if (!prev) return null;
                                    const criterios = activo
                                        ? prev.criteriosARO.filter(c => c !== crit)
                                        : [...prev.criteriosARO, crit];
                                    const riesgoARO: RiesgoARO = criterios.length === 0 ? 'BAJO' : criterios.length <= 2 ? 'MEDIO' : 'ALTO';
                                    return { ...prev, criteriosARO: criterios, riesgoARO };
                                });
                            }} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${activo ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'}`}>
                                {crit}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Modales interactivos ── */}
            {modalAntecedentes && (
                <ModalEditAntecedentes
                    expediente={expediente}
                    onClose={() => setModalAntecedentes(false)}
                    onSave={updated => setExpediente(prev => prev ? ({ ...prev, ...updated }) : null)}
                />
            )}
            {modalLabSerologia && (
                <ModalLabSerologia
                    expediente={expediente}
                    onClose={() => setModalLabSerologia(false)}
                    onSave={data => setExpediente(prev => prev ? ({
                        ...prev,
                        grupoSanguineo: data.grupoSanguineo,
                        factorRh: data.factorRh,
                        vihSerologia: data.vihSerologia,
                        vdrlSerologia: data.vdrlSerologia,
                        vacunaTetanos: data.vacunaTetanos,
                        vacunaDosis2: data.vacunaDosis2,
                    }) : null)}
                />
            )}
            {modalRegistroParto && (
                <ModalRegistroParto
                    onClose={() => setModalRegistroParto(false)}
                    onSave={data => setExpediente(prev => prev ? ({
                        ...prev,
                        fechaParto: data.fechaHoraNacimiento.split('T')[0],
                        tipoPartoParto: data.tipoPartoParto,
                        semanasParto: data.semanasParto,
                        apgar1: data.apgar1,
                        apgar5: data.apgar5,
                        pesoRNGramos: data.pesoRNGramos,
                        tallaRNCm: data.tallaRNCm,
                        perimetroCefalicoRNCm: data.perimetroCefalicoRNCm,
                        folioGuthrie: data.folioGuthrie,
                        tamizRNRealizado: Boolean(data.folioGuthrie),
                    }) : null)}
                />
            )}
        </div>
    );
};

export default TabExpedientePerinatal;