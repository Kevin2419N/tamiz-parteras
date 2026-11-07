/* spell-checker: disable */
import React, { useState, useEffect, useMemo } from 'react';
import {
    AlertTriangle, TrendingUp, Baby, Activity, ShieldAlert,
    Plus, Trash2, Info, Printer, Calculator, ChevronDown, User,
    Edit3, FlaskConical, X, Save, Baby as BabyIcon, Syringe, Loader2,
} from 'lucide-react';
import type { ExpedientePerinatal, ConsultaAntenatal, RiesgoARO, LabSerologiaForm, PartoDatosRegistro } from './types';
import { http } from '../../../../services/http';

// ─── Datos CLAP/OPS: Percentiles Altura Uterina (cm) por semana ──────────────
const AU_WEEKS = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40];
const AU_P10 = [8, 9, 11, 13, 16, 18, 20, 22, 24, 26, 28, 30, 31, 32, 33];
const AU_P50 = [10, 11, 14, 16, 19, 21, 23, 25, 27, 29, 31, 33, 34, 35, 36];
const AU_P90 = [12, 13, 16, 19, 22, 24, 27, 29, 31, 33, 35, 37, 38, 39, 40];

const PW_WEEKS = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40];
const PW_P10 = [0, 0.5, 1, 1.5, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const PW_P50 = [0, 1, 2, 3, 4.5, 5.5, 7, 8.5, 10, 11, 12, 13, 14, 15, 16];
const PW_P90 = [0, 1.5, 3, 5, 7, 8.5, 10, 12, 14, 15.5, 17, 18, 19, 20, 21];

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

    const boolSections = [
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

    const inputGlassStyle = "w-full px-4 py-3 bg-slate-900/50 border border-white/50 rounded-2xl text-white text-xs font-bold placeholder:text-slate-300 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/30 backdrop-blur-2xl transition-all shadow-inner";

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-start justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="relative border border-white/60 bg-slate-900/90 max-w-2xl w-full rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] backdrop-blur-3xl my-4 text-white overflow-hidden">
                <div className="absolute -top-32 -left-32 size-64 rounded-full bg-cyan-400/35 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 size-64 rounded-full bg-blue-500/35 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/25">
                    <div>
                        <span className="text-[10px] font-black uppercase text-cyan-300 tracking-widest block">Servicios de Salud de Oaxaca</span>
                        <h3 className="text-lg font-black text-white tracking-tight mt-0.5">Editar Antecedentes — Bloque A</h3>
                        <p className="text-xs text-cyan-100 font-medium mt-1">Los criterios ARO se recalcularán automáticamente al guardar.</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/40 backdrop-blur-md cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative z-10 p-6 space-y-6 text-xs">
                    {boolSections.map(({ title, state, setter }) => (
                        <div key={title} className="bg-white/5 p-4 rounded-2xl border border-white/20 backdrop-blur-xl">
                            <p className="text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-3">{title}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {Object.entries(state).filter(([k]) => k !== 'otros').map(([key, val]) => (
                                    <label key={key} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-white/10 transition-colors">
                                        <input type="checkbox" checked={Boolean(val)}
                                            onChange={e => setter(prev => ({ ...prev, [key]: e.target.checked }))}
                                            className="w-4 h-4 accent-cyan-400 shrink-0 rounded" />
                                        <span className="text-xs font-bold text-white capitalize">{humanKey(key)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/20 backdrop-blur-xl">
                        <p className="text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-3">Antecedentes Obstétricos</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {obsFields.map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-bold text-cyan-100 uppercase tracking-wider mb-1">{label}</label>
                                    <div className="flex items-center border border-white/40 rounded-xl overflow-hidden bg-slate-900/60 backdrop-blur-md">
                                        <button type="button" onClick={() => setObs(p => ({ ...p, [key]: Math.max(0, p[key] - 1) }))}
                                            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-black text-sm transition-colors cursor-pointer">−</button>
                                        <span className="flex-1 text-center text-sm font-black text-cyan-300">{obs[key]}</span>
                                        <button type="button" onClick={() => setObs(p => ({ ...p, [key]: p[key] + 1 }))}
                                            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-black text-sm transition-colors cursor-pointer">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex justify-end gap-3 p-6 border-t border-white/25">
                    <button type="button" onClick={onClose} className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/30 backdrop-blur-xl cursor-pointer transition-all shadow-md">Cancelar</button>
                    <button type="button" onClick={handleSave} className="flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white text-xs font-black rounded-2xl shadow-2xl shadow-cyan-950/80 transition-all active:scale-95 border border-white/60 cursor-pointer">
                        <Save className="w-4 h-4 text-cyan-100" />Guardar Antecedentes
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

    const grupoOpts: ExpedientePerinatal['grupoSanguineo'][] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const field = (label: string, node: React.ReactNode) => (
        <div>
            <label className="block text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-2">{label}</label>
            {node}
        </div>
    );
    const selectGlassStyle = "w-full px-4 py-3 bg-slate-900/70 border border-white/50 rounded-2xl text-white text-xs font-bold focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/30 backdrop-blur-2xl transition-all shadow-inner";

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-start justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="relative border border-white/60 bg-slate-900/90 max-w-2xl w-full rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] backdrop-blur-3xl my-4 text-white overflow-hidden">
                <div className="absolute -top-32 -left-32 size-64 rounded-full bg-cyan-400/35 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 size-64 rounded-full bg-blue-500/35 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/25">
                    <div>
                        <span className="text-[10px] font-black uppercase text-cyan-300 tracking-widest block">Servicios de Salud de Oaxaca</span>
                        <h3 className="text-lg font-black text-white tracking-tight mt-0.5">Actualizar Examen / Serología — Bloque B</h3>
                        <p className="text-xs text-cyan-100 font-medium mt-1">Gestación actual · {expediente.nombrePaciente}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/40 backdrop-blur-md cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative z-10 p-6 space-y-5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {field('Grupo Sanguíneo',
                            <div className="flex flex-wrap gap-2">
                                {grupoOpts.map(g => (
                                    <button key={g} type="button" onClick={() => setForm(p => ({ ...p, grupoSanguineo: g }))}
                                        className={`px-3 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer backdrop-blur-xl ${form.grupoSanguineo === g ? 'bg-gradient-to-r from-cyan-400 to-blue-600 border-white text-white shadow-lg' : 'bg-white/10 border-white/30 text-white hover:bg-white/20'}`}>{g}</button>
                                ))}
                            </div>
                        )}
                        {field('Factor Rh',
                            <div className="flex gap-2">
                                {(['POSITIVO', 'NEGATIVO'] as const).map(rh => (
                                    <button key={rh} type="button" onClick={() => setForm(p => ({ ...p, factorRh: rh }))}
                                        className={`flex-1 py-3 rounded-2xl border text-xs font-black transition-all cursor-pointer backdrop-blur-xl ${form.factorRh === rh ? 'bg-gradient-to-r from-cyan-400 to-blue-600 border-white text-white shadow-lg' : 'bg-white/10 border-white/30 text-white hover:bg-white/20'}`}>{rh}</button>
                                ))}
                            </div>
                        )}
                        {field('VIH Serología',
                            <select value={form.vihSerologia} onChange={e => setForm(p => ({ ...p, vihSerologia: e.target.value }))} className={selectGlassStyle}>
                                <option value="NEGATIVO" className="bg-slate-900 text-white font-bold">Negativo</option>
                                <option value="POSITIVO" className="bg-slate-900 text-white font-bold">Positivo</option>
                                <option value="PENDIENTE" className="bg-slate-900 text-white font-bold">Pendiente</option>
                            </select>
                        )}
                        {field('VDRL / Sífilis',
                            <select value={form.vdrlSerologia} onChange={e => setForm(p => ({ ...p, vdrlSerologia: e.target.value }))} className={selectGlassStyle}>
                                <option value="NON_REACTIVE" className="bg-slate-900 text-white font-bold">No Reactivo</option>
                                <option value="REACTIVE" className="bg-slate-900 text-white font-bold">Reactivo</option>
                                <option value="PENDIENTE" className="bg-slate-900 text-white font-bold">Pendiente</option>
                            </select>
                        )}
                    </div>
                </div>

                <div className="relative z-10 flex justify-end gap-3 p-6 border-t border-white/25">
                    <button type="button" onClick={onClose} className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/30 backdrop-blur-xl cursor-pointer transition-all shadow-md">Cancelar</button>
                    <button type="button" onClick={() => { onSave(form); onClose(); }}
                        className="flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white text-xs font-black rounded-2xl shadow-2xl shadow-cyan-950/80 transition-all active:scale-95 border border-white/60 cursor-pointer">
                        <FlaskConical className="w-4 h-4 text-cyan-100" />Guardar Serología
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

    const inputGlassStyle = "w-full px-4 py-3 bg-slate-900/50 border border-white/50 rounded-2xl text-white text-xs font-bold placeholder:text-slate-300 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/30 backdrop-blur-2xl transition-all shadow-inner";
    const f = (label: string, node: React.ReactNode) => (
        <div><label className="block text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-2">{label}</label>{node}</div>
    );
    const valid = Boolean(data.fechaHoraNacimiento && data.pesoRNGramos > 0);

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-start justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="relative border border-white/60 bg-slate-900/90 max-w-2xl w-full rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] backdrop-blur-3xl my-4 text-white overflow-hidden">
                <div className="absolute -top-32 -left-32 size-64 rounded-full bg-cyan-400/35 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 size-64 rounded-full bg-blue-500/35 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/25">
                    <div>
                        <span className="text-[10px] font-black uppercase text-cyan-300 tracking-widest block">Servicios de Salud de Oaxaca</span>
                        <h3 className="text-lg font-black text-white tracking-tight mt-0.5">Registrar Evento de Parto — Bloque D</h3>
                        <p className="text-xs text-cyan-100 font-medium mt-1">Parto, Puerperio y Recién Nacido</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/40 backdrop-blur-md cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative z-10 p-6 space-y-5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {f('Fecha y Hora de Nacimiento', <input type="datetime-local" value={data.fechaHoraNacimiento} onChange={e => setData(p => ({ ...p, fechaHoraNacimiento: e.target.value }))} className={inputGlassStyle} />)}
                        {f('Semanas al Parto', <input type="number" min={22} max={45} value={data.semanasParto} onChange={e => setData(p => ({ ...p, semanasParto: Number(e.target.value) }))} className={inputGlassStyle} />)}
                    </div>
                    {f('Tipo de Parto',
                        <div className="flex gap-2">
                            {(['EUTOCICO', 'DISTOCICO', 'CESAREA'] as const).map(t => (
                                <button key={t} type="button" onClick={() => setData(p => ({ ...p, tipoPartoParto: t }))}
                                    className={`flex-1 py-3 rounded-2xl border text-xs font-black transition-all cursor-pointer backdrop-blur-xl ${data.tipoPartoParto === t ? 'bg-gradient-to-r from-cyan-400 to-blue-600 border-white text-white shadow-lg' : 'bg-white/10 border-white/30 text-white hover:bg-white/20'}`}>{t}</button>
                            ))}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {f('Peso RN (g)', <input type="number" placeholder="3250" value={data.pesoRNGramos || ''} onChange={e => setData(p => ({ ...p, pesoRNGramos: Number(e.target.value) }))} className={inputGlassStyle} />)}
                        {f('Talla RN (cm)', <input type="number" placeholder="50" value={data.tallaRNCm || ''} onChange={e => setData(p => ({ ...p, tallaRNCm: Number(e.target.value) }))} className={inputGlassStyle} />)}
                        {f('Folio Guthrie', <input type="text" placeholder="5458400" value={data.folioGuthrie} onChange={e => setData(p => ({ ...p, folioGuthrie: e.target.value }))} className={inputGlassStyle} />)}
                    </div>
                </div>

                <div className="relative z-10 flex justify-end gap-3 p-6 border-t border-white/25">
                    <button type="button" onClick={onClose} className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/30 backdrop-blur-xl cursor-pointer transition-all shadow-md">Cancelar</button>
                    <button type="button" disabled={!valid} onClick={() => { if (valid) { onSave(data); onClose(); } }}
                        className="flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white text-xs font-black rounded-2xl shadow-2xl shadow-cyan-950/80 transition-all active:scale-95 disabled:opacity-40 border border-white/60 cursor-pointer">
                        <BabyIcon className="w-4 h-4 text-cyan-100" />Registrar Parto y RN
                    </button>
                </div>
            </div>
        </div>
    );
};

function getAROBadge(riesgo: RiesgoARO): React.ReactNode {
    const map: Record<RiesgoARO, { label: string; cls: string }> = {
        BAJO: { label: 'Bajo Riesgo Obstétrico', cls: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50' },
        MEDIO: { label: 'Riesgo Obstétrico Moderado', cls: 'bg-amber-500/25 text-amber-200 border-amber-400/50' },
        ALTO: { label: 'ALTO RIESGO OBSTÉTRICO (ARO)', cls: 'bg-rose-600/40 text-white border-rose-300 font-black animate-pulse' },
    };
    const { label, cls } = map[riesgo] || map.BAJO;
    return <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs border backdrop-blur-xl shadow-lg ${cls}`}><ShieldAlert className="w-4 h-4" />{label}</span>;
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
    title, subtitle, weeksData, p10, p50, p90, puntos,
    yMin, yMax, color = '#22d3ee', lineColor = '#38bdf8', unidad
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
    const pathOf = (vals: number[]) => weeksData.map((w, i) => `${i === 0 ? 'M' : 'L'}${scX(w).toFixed(1)},${scY(vals[i]).toFixed(1)}`).join(' ');
    const areaPath = [...weeksData.map((w, i) => `${i === 0 ? 'M' : 'L'}${scX(w).toFixed(1)},${scY(p90[i]).toFixed(1)}`), ...[...weeksData].reverse().map((w, i, arr) => `L${scX(w).toFixed(1)},${scY(p10[arr.length - 1 - i]).toFixed(1)}`), 'Z'].join(' ');

    const yRange = yhi - ylo;
    const yStep = yRange > 30 ? 5 : yRange > 15 ? 2 : 1;
    const yTicks: number[] = [];
    for (let v = Math.ceil(ylo / yStep) * yStep; v <= yhi; v += yStep) yTicks.push(v);

    const sortedPuntos = [...puntos].sort((a, b) => a.semana - b.semana);
    const trendPath = sortedPuntos.length > 1 ? sortedPuntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${scX(p.semana).toFixed(1)},${scY(p.valor).toFixed(1)}`).join(' ') : '';

    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="bg-slate-900/50 border border-white/30 rounded-3xl p-5 backdrop-blur-3xl shadow-xl">
            <div className="mb-3">
                <p className="text-xs font-black text-cyan-200 uppercase tracking-wider">{title}</p>
                {subtitle && <p className="text-[11px] text-cyan-100/80 font-medium">{subtitle}</p>}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                <rect x={ML} y={MT} width={plotW} height={plotH} fill="#0f172a" rx="8" opacity="0.8" />
                <path d={areaPath} fill={color} fillOpacity="0.15" stroke="none" />
                <path d={pathOf(p90)} fill="none" stroke={color} strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />
                <path d={pathOf(p10)} fill="none" stroke={color} strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />
                {yTicks.map(v => (<line key={v} x1={ML} x2={W - MR} y1={scY(v)} y2={scY(v)} stroke="#334155" strokeWidth="0.8" />))}
                <path d={pathOf(p50)} fill="none" stroke={color} strokeWidth="2.5" opacity="0.8" strokeLinecap="round" strokeLinejoin="round" />
                {trendPath && (<path d={trendPath} fill="none" stroke={lineColor} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />)}
                {sortedPuntos.map((p, i) => (
                    <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                        <circle cx={scX(p.semana)} cy={scY(p.valor)} r="6" fill={lineColor} stroke="#ffffff" strokeWidth="2" />
                        {hovered === i && (
                            <g>
                                <rect x={scX(p.semana) - 34} y={scY(p.valor) - 28} width={68} height={20} rx={6} fill="#020617" stroke="#38bdf8" strokeWidth="1" />
                                <text x={scX(p.semana)} y={scY(p.valor) - 14} textAnchor="middle" fontSize="9" fill="white" fontWeight="800">Sem {p.semana}: {p.valor}{unidad}</text>
                            </g>
                        )}
                    </g>
                ))}
                <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke="#64748b" strokeWidth="2" />
                <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke="#64748b" strokeWidth="2" />
            </svg>
        </div>
    );
};

// ─── Calculadora Obstétrica ────────────────────────────────────────────────────
const CalculadoraObstetrica: React.FC<{ fum: string; pesoInicial: number; talla: number }> = ({ fum, pesoInicial, talla }) => {
    const [fumLocal, setFumLocal] = useState(fum);
    const calc = useMemo(() => calcObstetrics(fumLocal), [fumLocal]);
    const imc = talla > 0 ? (pesoInicial / (talla * talla)).toFixed(1) : '—';

    return (
        <div className="bg-slate-900/40 border border-white/40 rounded-3xl p-5 space-y-4 backdrop-blur-3xl shadow-xl text-white">
            <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-400/40">
                    <Calculator className="w-5 h-5 text-cyan-300" />
                </div>
                <p className="text-xs font-black text-cyan-200 uppercase tracking-wider">Calculadora Obstétrica Instantánea</p>
            </div>
            <div className="flex items-center gap-3.5 flex-wrap">
                <label className="text-[11px] font-black text-cyan-200 uppercase tracking-wider shrink-0">FUM:</label>
                <input type="date" value={fumLocal} onChange={e => setFumLocal(e.target.value)}
                    className="bg-slate-900/70 border border-white/40 rounded-2xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-300 backdrop-blur-xl shadow-inner" />
            </div>
            {calc && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Edad Gestacional', value: `${calc.semanas} sem + ${calc.dias} días`, highlight: true },
                        { label: 'FPP (Naegele)', value: calc.fpp, highlight: false },
                        { label: 'IMC Pregestacional', value: `${imc} kg/m²`, highlight: false },
                        { label: 'Trimestre', value: calc.semanas < 14 ? '1er Trimestre' : calc.semanas < 28 ? '2do Trimestre' : '3er Trimestre', highlight: false },
                    ].map(({ label, value, highlight }) => (
                        <div key={label} className={`rounded-2xl p-4 border backdrop-blur-xl text-center shadow-lg ${highlight ? 'bg-gradient-to-r from-cyan-400 to-blue-600 border-white text-white' : 'bg-white/5 border-white/20 text-white'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${highlight ? 'text-cyan-100' : 'text-cyan-200'}`}>{label}</p>
                            <p className="text-sm font-black leading-snug">{value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Componente Principal ────────────────────────────────────────────────     
export const TabExpedientePerinatal: React.FC = () => {
    const [pacientes, setPacientes] = useState<ExpedientePerinatal[]>([]);
    const [expediente, setExpediente] = useState<ExpedientePerinatal | null>(null);
    const [cargando, setCargando] = useState<boolean>(true);

    const [nuevaConsulta, setNuevaConsulta] = useState<Partial<ConsultaAntenatal>>({});
    const [mostrarFormConsulta, setMostrarFormConsulta] = useState(false);
    const [pxOpen, setPxOpen] = useState(false);
    const [modalAntecedentes, setModalAntecedentes] = useState(false);
    const [modalLabSerologia, setModalLabSerologia] = useState(false);
    const [modalRegistroParto, setModalRegistroParto] = useState(false);

    useEffect(() => {
        const cargarExpedientes = async () => {
            setCargando(true);
            try {
                const res = await http.get('/medico/perinatales/pacientes-activas');
                const lista: ExpedientePerinatal[] = res.data;
                setPacientes(lista);
                if (lista.length > 0) {
                    const firstPx: any = lista[0];
                    const detalleRes = await http.get(`/medico/perinatales/expediente/${firstPx.expedienteId || firstPx.id}`);
                    setExpediente(detalleRes.data);
                } else {
                    throw new Error('Sin pacientes en servidor');
                }
            } catch (error: any) {
                console.warn('Backend no disponible o sin registros, cargando datos de respaldo perinatales:', error);
                const mockExp: ExpedientePerinatal = {
                    id: 'EXP-2026-0089',
                    expedienteId: 'EXP-2026-0089',
                    nombrePaciente: 'María del Carmen López Ruiz',
                    curp: 'LORC920315MOCRPN02',
                    telefono: '9711234567',
                    fumFecha: '2026-04-01',
                    fppFecha: '2027-01-05',
                    edadGestacionalInicioControl: 10,
                    grupoSanguineo: 'O+',
                    factorRh: 'POSITIVO',
                    vihSerologia: 'NEGATIVO',
                    vdrlSerologia: 'NON_REACTIVE',
                    vacunaTetanos: true,
                    vacunaDosis2: false,
                    riesgoARO: 'MEDIO',
                    criteriosARO: ['Período intergenésico < 2 años'],
                    antecedentesFamiliares: { diabetes: true, hipertension: false, gemelaridad: false, otros: '' } as any,
                    antecedentesPersonales: { diabetesGestacionalPrevia: false, htaCronica: false, nefropatia: false, otros: '' } as any,
                    antecedentesObstetricos: { gestasAnteriores: 2, paritosAnteriores: 1, cesareasAnteriores: 1, abortosAnteriores: 0, mortinatos: 0, rpMenorA2500g: 0 },
                    consultas: [
                        {
                            id: 'CONS-101',
                            numeroConsulta: 1,
                            fecha: '2026-06-10',
                            edadGestacional: 10,
                            pesoMadreKg: 60.0,
                            tallaMadreM: 1.55,
                            imcCalculado: 25.0,
                            presionArterialSistolica: 110,
                            presionArterialDiastolica: 70,
                            alturaUterinaFr: 10,
                            frecuenciaCardiacaFetal: 148,
                            presentacion: 'Cefálica',
                            edema: 'NO',
                            observaciones: 'Paciente en buen estado general.',
                            medicoFirma: 'Dr. Jorge Ruiz',
                        }
                    ],
                    tamizRNRealizado: false,
                } as any;
                setPacientes([mockExp]);
                setExpediente(mockExp);
            } finally {
                setCargando(false);
            }
        };

        cargarExpedientes();
    }, []);

    const seleccionarPaciente = async (px: ExpedientePerinatal) => {
        const pxAny: any = px;
        const id = pxAny.expedienteId || pxAny.id;
        try {
            const res = await http.get(`/medico/perinatales/expediente/${id}`);
            setExpediente(res.data);
        } catch {
            setExpediente(px);
        }
        setPxOpen(false);
    };

    const agregarConsulta = async () => {
        if (!expediente || !nuevaConsulta.fecha || !nuevaConsulta.edadGestacional) return;
        const talla = Number(nuevaConsulta.tallaMadreM ?? expediente.consultas[0]?.tallaMadreM ?? 1.55);
        const peso = Number(nuevaConsulta.pesoMadreKg ?? 62);
        const payloadConsulta = {
            fecha: nuevaConsulta.fecha,
            edadGestacional: Number(nuevaConsulta.edadGestacional),
            pesoMadreKg: peso,
            presionArterial: `${nuevaConsulta.presionArterialSistolica || 110}/${nuevaConsulta.presionArterialDiastolica || 70}`,
            alturaUterinaFr: Number(nuevaConsulta.alturaUterinaFr || 12),
            fcfLpm: Number(nuevaConsulta.frecuenciaCardiacaFetal || 140),
            edema: nuevaConsulta.edema || 'NO',
            observaciones: nuevaConsulta.observaciones || 'Control antenatal ordinario.',
        };

        try {
            const expAny: any = expediente;
            const id = expAny.expedienteId || expAny.id;
            await http.post(`/medico/perinatales/expediente/${id}/consultas`, payloadConsulta);

            const nuevaC: ConsultaAntenatal = {
                id: `CONS-${Date.now()}`,
                numeroConsulta: expediente.consultas.length + 1,
                fecha: payloadConsulta.fecha,
                edadGestacional: payloadConsulta.edadGestacional,
                pesoMadreKg: peso,
                tallaMadreM: talla,
                imcCalculado: Number((peso / (talla ** 2)).toFixed(1)),
                presionArterialSistolica: Number(payloadConsulta.presionArterial.split('/')[0]),
                presionArterialDiastolica: Number(payloadConsulta.presionArterial.split('/')[1]),
                alturaUterinaFr: payloadConsulta.alturaUterinaFr,
                frecuenciaCardiacaFetal: payloadConsulta.fcfLpm,
                presentacion: 'Cefálica',
                edema: (payloadConsulta.edema as any),
                observaciones: payloadConsulta.observaciones,
                medicoFirma: 'Médico Adscrito',
            };
            setExpediente(prev => prev ? ({ ...prev, consultas: [...prev.consultas, nuevaC] }) : null);
            setNuevaConsulta({});
            setMostrarFormConsulta(false);
            alert('Consulta registrada y sincronizada con el servidor.');
        } catch (err: any) {
            console.error('Error al guardar consulta:', err);
            alert(err.response?.data?.message || 'Error al conectar con el servidor.');
        }
    };

    const eliminarConsulta = (id: string) =>
        setExpediente(prev => prev ? ({ ...prev, consultas: prev.consultas.filter(c => c.id !== id) }) : null);

    if (cargando) {
        return (
            <div className="text-center py-20 text-cyan-200 font-semibold text-xs flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                <span>Sincronizando expedientes perinatales con PostgreSQL (Render)...</span>
            </div>
        );
    }

    if (!expediente) {
        return (
            <div className="bg-slate-900/40 border border-white/40 rounded-3xl p-8 text-center space-y-4 my-4 backdrop-blur-3xl shadow-xl text-white">
                <div className="p-4 bg-cyan-500/20 text-cyan-300 w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border border-cyan-400/40">
                    <Baby className="w-7 h-7" />
                </div>
                <div>
                    <h3 className="text-base font-black text-white">No hay expediente perinatal activo</h3>
                    <p className="text-xs text-cyan-100/80 max-w-md mx-auto mt-1">
                        Selecciona una paciente del padrón para comenzar el control antenatal.
                    </p>
                </div>
            </div>
        );
    }

    const pesoInicial = expediente.consultas[0]?.pesoMadreKg ?? 60;
    const talla = expediente.consultas[0]?.tallaMadreM ?? 1.55;

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

    const expAny: any = expediente;
    const cardGlassStyle = "bg-slate-900/35 border border-white/50 rounded-3xl backdrop-blur-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] overflow-hidden text-white";
    const inputGlassStyle = "w-full px-4 py-3 bg-slate-900/40 border border-white/50 rounded-2xl text-white text-xs font-bold placeholder:text-slate-300 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/30 backdrop-blur-2xl transition-all shadow-inner";

    return (
        <div className="space-y-6 text-white animate-fadeIn print-scope">
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .print-scope, .print-scope * { visibility: visible !important; }
                    .no-print { display: none !important; }
                    .only-print { display: block !important; }
                    .print-page-break { page-break-before: always !important; }
                    @page { margin: 1.2cm; size: A4 portrait; }
                    .print-scope { font-family: Arial, Helvetica, sans-serif !important; font-size: 8pt !important; color: #000 !important; }
                    .print-header { border-bottom: 2px solid #9D2449; padding-bottom: 8px; margin-bottom: 10px; text-align: center; }
                    table { border-collapse: collapse; width: 100%; font-size: 7pt; }
                    th, td { border: 1px solid #cbd5e1; padding: 3px 6px; }
                    th { background: #f1f5f9; font-weight: 900; }
                    .print-graficas { display: grid !important; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
                }
                .only-print { display: none; }
            `}</style>

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

            <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/40 border border-white/40 p-5 rounded-3xl backdrop-blur-3xl shadow-xl">
                <div className="flex-1">
                    <p className="text-[10px] font-black text-cyan-200 uppercase tracking-wider">PACIENTE ACTIVA</p>
                    <div className="relative inline-block mt-1">
                        <button type="button" onClick={() => setPxOpen(o => !o)}
                            className="flex items-center gap-2.5 text-base sm:text-lg font-black text-white hover:text-cyan-300 transition-colors cursor-pointer">
                            <User className="w-5 h-5 text-cyan-300" />
                            {expediente.nombrePaciente}
                            <ChevronDown className={`w-4 h-4 transition-transform ${pxOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {pxOpen && (
                            <div className="absolute left-0 top-full mt-2 bg-slate-900/95 border border-white/30 rounded-2xl shadow-2xl z-20 min-w-[300px] backdrop-blur-3xl overflow-hidden">
                                {pacientes.map(px => {
                                    const pxAnyItem: any = px;
                                    const pId = pxAnyItem.expedienteId || pxAnyItem.id;
                                    const currentId = expAny.expedienteId || expAny.id;
                                    return (
                                        <button key={pId} type="button" onClick={() => seleccionarPaciente(px)}
                                            className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer border-b border-white/10 last:border-0 ${pId === currentId ? 'text-cyan-300 bg-white/10' : 'text-white/90'}`}>
                                            {px.nombrePaciente}
                                            <span className="block text-[10px] text-cyan-200/70 font-medium mt-0.5">FUM: {px.fumFecha} · FPP: {px.fppFecha}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-cyan-100/80 mt-1">CURP: {expediente.curp} · Tel: {expediente.telefono}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    {getAROBadge(expediente.riesgoARO)}
                    <button type="button" onClick={() => window.print()}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-cyan-950/80 active:scale-95 border border-white/50 cursor-pointer">
                        <Printer className="w-4 h-4 text-cyan-100" />Imprimir Carné CLAP (2 Páginas)
                    </button>
                </div>
            </div>

            <CalculadoraObstetrica fum={expediente.fumFecha} pesoInicial={pesoInicial} talla={talla} />

            {expediente.criteriosARO.length > 0 && (
                <div className="bg-rose-950/40 border border-rose-400/50 rounded-3xl p-5 backdrop-blur-3xl shadow-xl text-white">
                    <div className="flex items-center gap-2.5 mb-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
                        <p className="text-xs font-black text-rose-200 uppercase tracking-wider">Criterios ARO identificados:</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {expediente.criteriosARO.map(crit => (
                            <span key={crit} className="px-3.5 py-1.5 bg-rose-500/25 text-rose-200 border border-rose-300/60 rounded-full text-xs font-bold backdrop-blur-md shadow-md">{crit}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* BLOQUE A */}
            <div className={cardGlassStyle}>
                <div className="bg-slate-900/60 px-6 py-4 flex items-center justify-between border-b border-white/20 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-400/40">
                            <Info className="w-4 h-4 text-cyan-300" />
                        </div>
                        <h3 className="text-sm font-black text-white tracking-tight">Bloque A — Antecedentes</h3>
                    </div>
                    <button type="button" onClick={() => setModalAntecedentes(true)}
                        className="no-print flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl text-xs font-bold transition-all backdrop-blur-md cursor-pointer shadow-md">
                        <Edit3 className="w-3.5 h-3.5 text-cyan-300" />Editar Antecedentes
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { titulo: 'Familiares', entries: Object.entries(expediente.antecedentesFamiliares || {}).filter(([k]) => k !== 'otros') },
                        { titulo: 'Personales Patológicos', entries: Object.entries(expediente.antecedentesPersonales || {}).filter(([k]) => k !== 'otros') },
                    ].map(({ titulo, entries }) => (
                        <div key={titulo} className="bg-white/5 p-4 rounded-2xl border border-white/15 backdrop-blur-xl">
                            <p className="text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-3">{titulo}</p>
                            <div className="space-y-2.5">
                                {entries.map(([key, val]) => (
                                    <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                                        <input type="checkbox" readOnly checked={Boolean(val)} className="w-4 h-4 accent-cyan-400 shrink-0 rounded" />
                                        <span className="text-xs font-semibold text-white capitalize">{humanKey(key)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/15 backdrop-blur-xl">
                        <p className="text-[11px] font-black text-cyan-200 uppercase tracking-wider mb-3">Obstétricos</p>
                        <div className="space-y-3">
                            {Object.entries(expediente.antecedentesObstetricos || {}).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0">
                                    <span className="text-xs font-medium text-cyan-100">{humanKey(key)}</span>
                                    <span className="font-black text-white text-sm font-mono">{String(val)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOQUE B */}
            <div className={cardGlassStyle}>
                <div className="bg-slate-900/60 px-6 py-4 flex items-center justify-between border-b border-white/20 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-400/40">
                            <Baby className="w-4 h-4 text-cyan-300" />
                        </div>
                        <h3 className="text-sm font-black text-white tracking-tight">Bloque B — Gestación Actual</h3>
                    </div>
                    <button type="button" onClick={() => setModalLabSerologia(true)}
                        className="no-print flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl text-xs font-bold transition-all backdrop-blur-md cursor-pointer shadow-md">
                        <FlaskConical className="w-3.5 h-3.5 text-cyan-300" />Actualizar Lab / Serología
                    </button>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    {camposB.map((item, index) => (
                        <div key={index} className="bg-white/5 border border-white/20 rounded-2xl p-4 backdrop-blur-xl shadow-md">
                            <p className="text-[10px] font-black text-cyan-200 uppercase tracking-wider mb-1">{item.label}</p>
                            <p className="font-black text-white text-sm">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* BLOQUE C */}
            <div className={cardGlassStyle}>
                <div className="bg-slate-900/60 px-6 py-4 flex items-center justify-between border-b border-white/20 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-400/40">
                            <Activity className="w-4 h-4 text-cyan-300" />
                        </div>
                        <h3 className="text-sm font-black text-white tracking-tight">Bloque C — Control Antenatal y Gráficas Percentiladas</h3>
                    </div>
                    <button type="button" onClick={() => setMostrarFormConsulta(!mostrarFormConsulta)}
                        className="no-print flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white border border-white/40 rounded-xl text-xs font-black transition-all backdrop-blur-md cursor-pointer shadow-lg shadow-cyan-950/60">
                        <Plus className="w-4 h-4 text-cyan-100" />Nueva Consulta
                    </button>
                </div>

                {expediente.consultas.length > 0 && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 border-b border-white/20 print-graficas backdrop-blur-md">
                        <SVGCurvaPercentil
                            title="Curva Altura Uterina vs Semanas (CLAP/OPS-OMS)"
                            subtitle="Percentiles P10, P50, P90"
                            xLabel="Semanas de Gestación" yLabel="A.U. (cm)"
                            weeksData={AU_WEEKS} p10={AU_P10} p50={AU_P50} p90={AU_P90}
                            puntos={puntosAU} unidad="cm" color="#22d3ee" lineColor="#38bdf8"
                        />
                        <SVGCurvaPercentil
                            title="Ganancia de Peso Materno vs Semanas (OMS/IOM)"
                            subtitle="Ganancia sobre peso pregestacional"
                            xLabel="Semanas de Gestación" yLabel="Ganancia (kg)"
                            weeksData={PW_WEEKS} p10={PW_P10} p50={PW_P50} p90={PW_P90}
                            puntos={puntosPeso} unidad="kg" color="#38bdf8" lineColor="#34d399"
                            yMin={-2} yMax={22}
                        />
                    </div>
                )}

                {mostrarFormConsulta && (
                    <div className="p-6 bg-slate-950/70 border-b border-white/20 space-y-5 no-print backdrop-blur-2xl">
                        <p className="text-xs font-black text-cyan-300 uppercase tracking-wider">Registrar Nueva Consulta Antenatal</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                                    <label className="block text-[11px] font-bold text-cyan-200 uppercase tracking-wider mb-1.5">{label}</label>
                                    <input type={type} step={type === 'number' ? '0.01' : undefined}
                                        value={String(nuevaConsulta[key as keyof ConsultaAntenatal] ?? '')}
                                        onChange={e => setNuevaConsulta(p => ({ ...p, [key]: e.target.value }))}
                                        className={inputGlassStyle} />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-cyan-200 uppercase tracking-wider mb-1.5">Observaciones</label>
                            <textarea rows={2} value={nuevaConsulta.observaciones ?? ''}
                                onChange={e => setNuevaConsulta(p => ({ ...p, observaciones: e.target.value }))}
                                className={inputGlassStyle + " resize-none"} />
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={agregarConsulta}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white text-xs font-black rounded-2xl flex items-center gap-2 cursor-pointer shadow-xl border border-white/50">
                                <Plus className="w-4 h-4 text-cyan-100" />Agregar y Sincronizar
                            </button>
                            <button type="button" onClick={() => setMostrarFormConsulta(false)}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/30 backdrop-blur-xl cursor-pointer transition-all">
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-xs text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/60 text-cyan-200 uppercase tracking-wider text-[11px] font-black border-b border-white/20">
                                {['No.', 'Fecha', 'EG', 'Peso', 'P.A.', 'AU', 'FCF', 'Edema', 'Observaciones', ''].map(h => (
                                    <th key={h} className="px-5 py-4">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-white font-medium">
                            {expediente.consultas.map(c => (
                                <tr key={c.id} className="hover:bg-white/10 transition-colors">
                                    <td className="px-5 py-4 font-mono font-black text-cyan-300">{c.numeroConsulta}</td>
                                    <td className="px-5 py-4 font-bold text-white">{c.fecha}</td>
                                    <td className="px-5 py-4 font-bold text-cyan-100">{c.edadGestacional} sem</td>
                                    <td className="px-5 py-4 font-bold text-white">{c.pesoMadreKg} kg</td>
                                    <td className="px-5 py-4 font-bold text-white">{c.presionArterialSistolica}/{c.presionArterialDiastolica}</td>
                                    <td className="px-5 py-4 font-bold text-white">{c.alturaUterinaFr} cm</td>
                                    <td className="px-5 py-4 font-bold text-white">{c.frecuenciaCardiacaFetal} lpm</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border backdrop-blur-md ${c.edema === 'NO' ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50' : 'bg-amber-500/25 text-amber-200 border-amber-400/50'}`}>{c.edema}</span>
                                    </td>
                                    <td className="px-5 py-4 text-cyan-100/90 max-w-[180px] truncate">{c.observaciones}</td>
                                    <td className="px-5 py-4 no-print text-center">
                                        <button type="button" onClick={() => eliminarConsulta(c.id)}
                                            className="p-2 text-white/50 hover:text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BLOQUE D */}
            <div className={cardGlassStyle + " print-page-break"}>
                <div className="bg-slate-900/60 px-6 py-4 flex items-center justify-between border-b border-white/20 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-400/40">
                            <TrendingUp className="w-4 h-4 text-cyan-300" />
                        </div>
                        <h3 className="text-sm font-black text-white tracking-tight">Bloque D — Parto, Puerperio y Recién Nacido</h3>
                    </div>
                    {!expediente.fechaParto && (
                        <button type="button" onClick={() => setModalRegistroParto(true)}
                            className="no-print flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white border border-white/40 rounded-xl text-xs font-black transition-all backdrop-blur-md cursor-pointer shadow-lg shadow-cyan-950/60">
                            <Syringe className="w-4 h-4 text-cyan-100" />Registrar Evento de Parto
                        </button>
                    )}
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    {[
                        { label: 'Fecha de Parto', value: expediente.fechaParto ?? 'Pendiente' },
                        { label: 'Tipo de Parto', value: expediente.tipoPartoParto ?? 'Pendiente' },
                        { label: 'Semanas al Parto', value: expediente.semanasParto ? `${expediente.semanasParto} sem` : 'Pendiente' },
                        { label: 'APGAR 1 min', value: expediente.apgar1 !== undefined ? String(expediente.apgar1) : 'Pendiente' },
                        { label: 'APGAR 5 min', value: expediente.apgar5 !== undefined ? String(expediente.apgar5) : 'Pendiente' },
                        { label: 'Peso RN (g)', value: expediente.pesoRNGramos ? `${expediente.pesoRNGramos} g` : 'Pendiente' },
                        { label: 'Talla RN (cm)', value: expediente.tallaRNCm ? `${expediente.tallaRNCm} cm` : 'Pendiente' },
                        { label: 'Folio Guthrie', value: expediente.folioGuthrie ?? 'Pendiente' },
                    ].map(({ label, value }) => (
                        <div key={label} className={`border rounded-2xl p-4 backdrop-blur-xl shadow-md ${value === 'Pendiente' ? 'bg-amber-950/30 border-amber-400/40' : 'bg-white/5 border-white/20'}`}>
                            <p className="text-[10px] font-black text-cyan-200 uppercase tracking-wider mb-1">{label}</p>
                            <p className={`font-black text-sm ${value === 'Pendiente' ? 'text-amber-300' : 'text-white'}`}>{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {modalAntecedentes && (
                <ModalEditAntecedentes
                    expediente={expediente}
                    onClose={() => setModalAntecedentes(false)}
                    onSave={async updated => {
                        try {
                            const id = expAny.expedienteId || expAny.id;
                            await http.put(`/medico/perinatales/expediente/${id}/antecedentes`, updated);
                            setExpediente(prev => prev ? ({ ...prev, ...updated }) : null);
                        } catch (err) {
                            console.error('Error al actualizar antecedentes:', err);
                            setExpediente(prev => prev ? ({ ...prev, ...updated }) : null);
                        }
                    }}
                />
            )}
            {modalLabSerologia && (
                <ModalLabSerologia
                    expediente={expediente}
                    onClose={() => setModalLabSerologia(false)}
                    onSave={async data => {
                        try {
                            const id = expAny.expedienteId || expAny.id;
                            await http.put(`/medico/perinatales/expediente/${id}/laboratorios`, data);
                            setExpediente(prev => prev ? ({
                                ...prev,
                                grupoSanguineo: data.grupoSanguineo,
                                factorRh: data.factorRh,
                                vihSerologia: data.vihSerologia,
                                vdrlSerologia: data.vdrlSerologia,
                                vacunaTetanos: data.vacunaTetanos,
                                vacunaDosis2: data.vacunaDosis2,
                            }) : null);
                        } catch (err) {
                            console.error('Error al actualizar laboratorios:', err);
                        }
                    }}
                />
            )}
            {modalRegistroParto && (
                <ModalRegistroParto
                    onClose={() => setModalRegistroParto(false)}
                    onSave={async data => {
                        try {
                            const id = expAny.expedienteId || expAny.id;
                            const payloadParto = {
                                fechaHoraNacimiento: data.fechaHoraNacimiento,
                                tipoPartoParto: data.tipoPartoParto,
                                semanasParto: data.semanasParto,
                                apgar1: data.apgar1,
                                apgar5: data.apgar5,
                                pesoRNGramos: data.pesoRNGramos,
                                tallaRNCm: data.tallaRNCm,
                                folioGuthrie: data.folioGuthrie
                            };
                            await http.post(`/medico/perinatales/expediente/${id}/parto`, payloadParto);
                            setExpediente(prev => prev ? ({
                                ...prev,
                                fechaParto: data.fechaHoraNacimiento.split('T')[0],
                                tipoPartoParto: data.tipoPartoParto,
                                semanasParto: data.semanasParto,
                                apgar1: data.apgar1,
                                apgar5: data.apgar5,
                                pesoRNGramos: data.pesoRNGramos,
                                tallaRNCm: data.tallaRNCm,
                                folioGuthrie: data.folioGuthrie,
                                tamizRNRealizado: Boolean(data.folioGuthrie),
                            }) : null);
                        } catch (err) {
                            console.error('Error al registrar parto:', err);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default TabExpedientePerinatal;