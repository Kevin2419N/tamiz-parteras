import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText,
    Truck,
    AlertTriangle,
    Plus,
    ArrowUpRight,
    Search,
    CheckCircle2,
    Clock,
    Eye
} from 'lucide-react';

interface CapturistaDashboardProps {
    userName: string;
}

export const CapturistaDashboard: React.FC<CapturistaDashboardProps> = ({ userName }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Recent Tamiz Records for Capturista
    const [registrosRecientes] = useState([
        {
            folio: 'TMZ-OAX-2026-98217',
            rn: 'RN Gómez Santiz',
            madre: 'María Gómez Santiz',
            fechaToma: '2026-09-09 10:00',
            municipio: 'Juchitán de Zaragoza',
            partera: 'Doña Rosa Santiz Gómez',
            estatus: 'MUESTRA_COAGULADA', // Requiere retoma
            prioridad: 'ALTA',
        },
        {
            folio: 'TMZ-OAX-2026-98216',
            rn: 'RN López Pérez',
            madre: 'Juana López Pérez',
            fechaToma: '2026-09-09 08:30',
            municipio: 'Santo Domingo Tehuantepec',
            partera: 'Doña Juana López Pérez',
            estatus: 'EN_TRANSITO_LAB',
            prioridad: 'NORMAL',
        },
        {
            folio: 'TMZ-OAX-2026-98215',
            rn: 'RN Cruz Toledo',
            madre: 'Ana Cruz Toledo',
            fechaToma: '2026-09-08 16:45',
            municipio: 'Salina Cruz',
            partera: 'Doña Petrona Cruz Velasco',
            estatus: 'PROCESADA_NORMAL',
            prioridad: 'NORMAL',
        },
        {
            folio: 'TMZ-OAX-2026-98214',
            rn: 'RN Girón Morales',
            madre: 'Beatriz Girón Morales',
            fechaToma: '2026-09-08 14:15',
            municipio: 'Ciudad Ixtepec',
            partera: 'Doña Asunción Girón Morales',
            estatus: 'EN_TRANSITO_LAB',
            prioridad: 'NORMAL',
        },
        {
            folio: 'TMZ-OAX-2026-98213',
            rn: 'RN Ruiz Atempa',
            madre: 'Carla Ruiz Atempa',
            fechaToma: '2026-09-07 11:20',
            municipio: 'San Blas Atempa',
            partera: 'Doña Micaela Ruiz Hernández',
            estatus: 'PROCESADA_NORMAL',
            prioridad: 'NORMAL',
        },
    ]);

    const registrosFiltrados = registrosRecientes.filter(
        (r) =>
            r.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.rn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.madre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.municipio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getEstatusBadge = (estatus: string) => {
        switch (estatus) {
            case 'MUESTRA_COAGULADA':
                return (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-[10px] font-black flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Re-Toma Urgente
                    </span>
                );
            case 'EN_TRANSITO_LAB':
                return (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-amber-600" /> En Tránsito Lab
                    </span>
                );
            case 'PROCESADA_NORMAL':
                return (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resultado Normal
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">
                        {estatus}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto selection:bg-rose-600 selection:text-white">

            {/* Encabezado Principal Capturista (Guinda Oaxaca) */}
            <div className="bg-gradient-to-r from-[#9D2449] via-[#7A1B38] to-slate-900 p-6 rounded-3xl text-white shadow-md border border-[#9D2449]/40 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-extrabold text-rose-200">
                            CAPTURISTA • UNIDAD DE SALUD
                        </span>
                        <span className="text-xs text-rose-200/60">•</span>
                        <span className="text-xs text-rose-100 font-medium">Jurisdicción Sanitaria No. 2 - Istmo</span>
                    </div>
                    <h1 className="text-2xl font-black text-white mt-1">
                        Bienvenido, {userName}
                    </h1>
                    <p className="text-xs text-rose-100/80 mt-1">
                        Módulo operativo para el registro rápido de tarjetas de Guthrie y seguimiento de laboratorios.
                    </p>
                </div>

                <div className="w-full sm:w-auto">
                    <Link
                        to="/tamiz/nuevo"
                        className="w-full sm:w-auto px-5 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 border border-rose-300/40 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>+ Nuevo Registro de Tamiz Neonatal</span>
                    </Link>
                </div>
            </div>

            {/* 3 Métricas Operativas Clave */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* KPI 1: Muestras Registradas */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500">Tamices Registrados (Mes)</span>
                        <p className="text-3xl font-black text-slate-900 mt-2">1,428</p>
                        <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold mt-1">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+12.4% vs mes anterior</span>
                        </div>
                    </div>
                    <div className="p-3 bg-rose-50 text-[#9D2449] rounded-2xl border border-rose-200">
                        <FileText className="w-7 h-7" />
                    </div>
                </div>

                {/* KPI 2: En Tránsito Lab */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500">Tarjetas Guthrie en Tránsito</span>
                        <p className="text-3xl font-black text-amber-600 mt-2">184</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">En envío a LESP Oaxaca</p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
                        <Truck className="w-7 h-7" />
                    </div>
                </div>

                {/* KPI 3: Re-toma Urgente */}
                <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-rose-800">Alertas de Re-Toma Urgente</span>
                        <p className="text-3xl font-black text-rose-600 mt-2">5</p>
                        <p className="text-[11px] text-rose-700 font-bold mt-1">Coagulación / Muestra insuficiente</p>
                    </div>
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 animate-pulse">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                </div>

            </div>

            {/* Tabla de Muestras Recientes Registradas por la Unidad */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#9D2449]" />
                            <span>Muestras de Tamiz Neonatal Recientes</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">Registros ingresados en las últimas 48 horas.</p>
                    </div>

                    {/* Búsqueda de registros */}
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Buscar por folio, madre o RN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9D2449]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400">
                                <th className="py-3 px-3">Folio Guthrie</th>
                                <th className="py-3 px-3">Recién Nacido</th>
                                <th className="py-3 px-3">Madre / Tutor</th>
                                <th className="py-3 px-3">Comunidad / Municipio</th>
                                <th className="py-3 px-3">Fecha Toma</th>
                                <th className="py-3 px-3">Estatus Muestra</th>
                                <th className="py-3 px-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium">
                            {registrosFiltrados.map((item) => (
                                <tr key={item.folio} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{item.folio}</td>
                                    <td className="py-3.5 px-3 font-extrabold text-slate-900">{item.rn}</td>
                                    <td className="py-3.5 px-3 text-slate-700">{item.madre}</td>
                                    <td className="py-3.5 px-3 text-slate-600">{item.municipio}</td>
                                    <td className="py-3.5 px-3 text-slate-500">{item.fechaToma}</td>
                                    <td className="py-3.5 px-3">{getEstatusBadge(item.estatus)}</td>
                                    <td className="py-3.5 px-3 text-right">
                                        <button
                                            onClick={() => alert(`Visualizando detalles del folio ${item.folio}`)}
                                            className="p-1.5 text-slate-500 hover:text-[#9D2449] hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Ver Ficha Completa"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};
