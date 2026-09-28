import React, { useState } from 'react';
import { Settings, Database, HardDrive, ShieldCheck, History, RefreshCw, FileText } from 'lucide-react';
import type { LogSistema } from './types';

export const TabConfiguracionSistema: React.FC = () => {
    const [backupStatus, setBackupStatus] = useState<string | null>(null);

    const [logs] = useState<LogSistema[]>([
        {
            id: 'l1',
            fechaHora: '2026-09-27 20:14:02',
            usuario: 'Lic. Administrador Jurisdiccional',
            accion: 'Acreditación de Partera Tradicional (PIN Generado)',
            modulo: 'Padrón Parteras',
            ip: '192.168.1.45'
        },
        {
            id: 'l2',
            fechaHora: '2026-09-27 19:40:15',
            usuario: 'Dra. María Elena Ramos',
            accion: 'Emisión de Contrareferencia Médica (REF-2026-0105)',
            modulo: 'Referencias Formato 1',
            ip: '192.168.1.88'
        },
        {
            id: 'l3',
            fechaHora: '2026-09-27 18:22:11',
            usuario: 'Enf. Juan Carlos Morales',
            accion: 'Auditoría de Muestra Guthrie (GUTH-2026-0891)',
            modulo: 'Tamiz Neonatal',
            ip: '192.168.1.12'
        },
    ]);

    const handleBackupBD = () => {
        setBackupStatus('Generando respaldo cifrado SQL...');
        setTimeout(() => {
            setBackupStatus('Respaldo completado: SSO_Istmo_20260927_Backup.sql (14.2 MB)');
        }, 1500);
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#9D2449]" />
                    <span>Configuración del Sistema y Auditoría de Seguridad</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Mantenimiento de catálogos jurisdiccionales, respaldo de base de datos y bitácora de actividad.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CAJA 1: RESPALDOS Y MANTENIMIENTO BD */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                        <div className="p-2.5 bg-rose-50 text-[#9D2449] rounded-xl border border-rose-100">
                            <Database className="w-5 h-5 text-[#9D2449]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Respaldo y Servidor BD</h3>
                            <p className="text-[11px] text-slate-500">Base de datos local y sincronización con servidor estatal SSO</p>
                        </div>
                    </div>

                    <div className="text-xs space-y-2 text-slate-700">
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-emerald-600" />
                                <span className="font-bold">Estado de Almacenamiento:</span>
                            </div>
                            <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                                ÓPTIMO (1.2 GB / 20 GB)
                            </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                                <span className="font-bold">Último Respaldo Automático:</span>
                            </div>
                            <span className="font-mono text-slate-600">Hoy 04:00 AM</span>
                        </div>

                        {backupStatus && (
                            <div className="p-3 bg-rose-50 text-[#9D2449] font-bold rounded-xl border border-rose-200 text-center animate-fadeIn">
                                {backupStatus}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleBackupBD}
                        className="w-full py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4 text-rose-200" />
                        <span>Ejecutar Respaldo Manual BD (.sql)</span>
                    </button>
                </div>

                {/* CAJA 2: CATÁLOGOS JURISDICCIONALES */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                        <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Catálogos de la Jurisdicción No. 2</h3>
                            <p className="text-[11px] text-slate-500">Gestión de municipios, comunidades y centros de salud</p>
                        </div>
                    </div>

                    <div className="text-xs space-y-2">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-slate-800">Catálogo de Municipios del Istmo</p>
                                <p className="text-[10px] text-slate-500">48 Municipios registrados y cartografiados</p>
                            </div>
                            <span className="text-xs font-black text-[#9D2449]">48 Activos</span>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-slate-800">Red de Unidades Hospitalarias</p>
                                <p className="text-[10px] text-slate-500">Hospitales Generales y CESSAs para contrareferencia</p>
                            </div>
                            <span className="text-xs font-black text-[#9D2449]">14 Unidades</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* LOGS DE AUDITORÍA Y SEGURIDAD */}
            <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-[#9D2449]" />
                    <span>Bitácora de Auditoría y Logs del Sistema</span>
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-semibold">
                        <thead>
                            <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200">
                                <th className="py-2.5 px-4">Fecha / Hora</th>
                                <th className="py-2.5 px-4">Usuario</th>
                                <th className="py-2.5 px-4">Acción Ejecutada</th>
                                <th className="py-2.5 px-4">Módulo</th>
                                <th className="py-2.5 px-4 text-right">Dirección IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {logs.map((l) => (
                                <tr key={l.id} className="hover:bg-slate-50/80">
                                    <td className="py-3 px-4 font-mono text-slate-500">{l.fechaHora}</td>
                                    <td className="py-3 px-4 font-black text-slate-900">{l.usuario}</td>
                                    <td className="py-3 px-4 text-slate-800">{l.accion}</td>
                                    <td className="py-3 px-4 font-bold text-[#9D2449]">{l.modulo}</td>
                                    <td className="py-3 px-4 text-right font-mono text-slate-500">{l.ip}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
