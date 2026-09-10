import React, { useState } from 'react';
import { type NotificacionAlerta, UserRole } from '../../types';
import { Bell, AlertTriangle, Info, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
    const [filtroNivel, setFiltroNivel] = useState<string>('TODAS');

    const [notificaciones, setNotificaciones] = useState<NotificacionAlerta[]>([
        {
            id: 'NOT-01',
            titulo: '⚠️ RE-MUESTRA URGENTE: Resultado Sospechoso TSH',
            mensaje: 'La muestra con folio TMZ-98214 (RN López Hernández) dio resultado fuera de rango para Hipotiroidismo Congénito. Se requiere localización inmediata.',
            nivelAlerta: 'CRITICAL',
            fechaCreacion: 'Hace 20 min',
            leida: false,
            rolesDestino: [UserRole.ADMIN_JURISDICCIONAL, UserRole.CAPTURISTA_TAMIZ],
            entidadRelacionadaId: 'TMZ-98214',
        },
        {
            id: 'NOT-02',
            titulo: 'Notificación de Referencia Comunitaria de Partera',
            mensaje: 'Doña Rosa Santiz emitió referencia de riesgo medio para paciente en Chamula por cifras tensionales elevadas.',
            nivelAlerta: 'WARNING',
            fechaCreacion: 'Hace 2 horas',
            leida: false,
            rolesDestino: [UserRole.GESTOR_PARTERAS],
        },
        {
            id: 'NOT-03',
            titulo: 'Lote de Muestras Entregado a Laboratorio Central',
            mensaje: 'Se ha confirmado la recepción de 45 tarjetas de Guthrie enviadas desde San Cristóbal.',
            nivelAlerta: 'SUCCESS',
            fechaCreacion: 'Ayer, 18:30',
            leida: true,
            rolesDestino: [UserRole.CAPTURISTA_TAMIZ],
        },
    ]);

    const marcarComoLeida = (id: string) => {
        setNotificaciones(
            notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n))
        );
    };

    const notificacionesFiltradas = notificaciones.filter(
        (n) => filtroNivel === 'TODAS' || n.nivelAlerta === filtroNivel
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Encabezado */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-rose-400">Alertas de Salud Públicas</span>
                    <h1 className="text-2xl font-extrabold text-white mt-1">Centro de Notificaciones & Alertas Críticas</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Sistema prioritario de comunicación para recall de recién nacidos y urgencias obstétricas comunitarias.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setNotificaciones(notificaciones.map((n) => ({ ...n, leida: true })))}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800"
                    >
                        Marcar todas como leídas
                    </button>
                </div>
            </div>

            {/* Banner de Emergencia */}
            <div className="bg-rose-950/40 border border-rose-500/30 p-5 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl shrink-0">
                        <ShieldAlert className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Protocolo de Localización Inmediata (Recall)</h3>
                        <p className="text-xs text-rose-200 mt-0.5">
                            Toda alerta de tipo <strong className="text-white">CRÍTICA</strong> debe atenderse en menos de 24 horas para garantizar el tratamiento oportuno.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 border-b border-slate-800 pb-3">
                {['TODAS', 'CRITICAL', 'WARNING', 'SUCCESS'].map((nivel) => (
                    <button
                        key={nivel}
                        onClick={() => setFiltroNivel(nivel)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filtroNivel === nivel
                                ? 'bg-teal-500 text-white shadow-md'
                                : 'text-slate-400 hover:bg-slate-900'
                            }`}
                    >
                        {nivel === 'TODAS' ? 'Todas' : nivel === 'CRITICAL' ? 'Críticas' : nivel === 'WARNING' ? 'Advertencias' : 'Informativas'}
                    </button>
                ))}
            </div>

            {/* Lista de Alertas */}
            <div className="space-y-4">
                {notificacionesFiltradas.map((notif) => (
                    <div
                        key={notif.id}
                        className={`p-5 rounded-2xl border transition-all ${notif.nivelAlerta === 'CRITICAL'
                                ? 'bg-rose-950/20 border-rose-500/40'
                                : notif.nivelAlerta === 'WARNING'
                                    ? 'bg-amber-950/20 border-amber-500/40'
                                    : 'bg-slate-950/80 border-slate-800'
                            } ${notif.leida ? 'opacity-65' : ''}`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {notif.nivelAlerta === 'CRITICAL' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                                    {notif.nivelAlerta === 'WARNING' && <Info className="w-5 h-5 text-amber-400" />}
                                    {notif.nivelAlerta === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                    {notif.nivelAlerta === 'INFO' && <Bell className="w-5 h-5 text-teal-400" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                                        <span>{notif.titulo}</span>
                                        {!notif.leida && (
                                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                        )}
                                    </h4>
                                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.mensaje}</p>
                                    <span className="text-[10px] text-slate-500 mt-2 block">{notif.fechaCreacion}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                                {!notif.leida && (
                                    <button
                                        onClick={() => marcarComoLeida(notif.id)}
                                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700"
                                    >
                                        Marcar Leída
                                    </button>
                                )}
                                {notif.entidadRelacionadaId && (
                                    <button className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg text-xs font-bold shadow-md shadow-rose-500/20 flex items-center gap-1">
                                        <span>Atender Caso</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};
