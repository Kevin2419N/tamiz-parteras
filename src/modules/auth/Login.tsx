import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { ShieldCheck, HeartHandshake, Lock, User as UserIcon, Phone, KeyRound, ArrowRight, Building2, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'INSTITUCIONAL' | 'PARTERA'>('INSTITUCIONAL');

    // Institutional State
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [rolSeleccionado, setRolSeleccionado] = useState<UserRole>(UserRole.CAPTURISTA_TAMIZ);

    // Partera State
    const [telefonoPIN, setTelefonoPIN] = useState('');
    const [pinComunitario, setPinComunitario] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder login action redirecting to dashboard
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">

                {/* Banner Lateral de Bienvenida */}
                <div className="md:col-span-5 bg-gradient-to-br from-teal-600 to-emerald-800 p-8 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute -top-12 -left-12 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <HeartHandshake className="w-8 h-8 text-teal-200" />
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-wider font-semibold text-teal-200">Salud Comunitaria</span>
                                <h1 className="text-xl font-bold leading-tight">Tamiz & Parteras</h1>
                            </div>
                        </div>

                        <h2 className="text-2xl font-extrabold mb-3 leading-snug">
                            Sistema Web de Gestión Operativa
                        </h2>
                        <p className="text-teal-100 text-sm leading-relaxed mb-6">
                            Plataforma integral para el registro neonatal, control de muestras de tamiz y seguimiento a la salud maternal comunitaria.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-3 bg-teal-950/40 p-4 rounded-2xl border border-teal-400/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3 text-xs text-teal-100">
                            <ShieldCheck className="w-5 h-5 text-teal-300 shrink-0" />
                            <span>Seguridad de Datos e Identificación Jurisdiccional</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-teal-100">
                            <Sparkles className="w-5 h-5 text-emerald-300 shrink-0" />
                            <span>Acceso Accesible e Incluyente para Parteras Tradicionales</span>
                        </div>
                    </div>
                </div>

                {/* Formulario de Login Híbrido */}
                <div className="md:col-span-7 p-8 flex flex-col justify-center">

                    {/* Selector de Pestañas Híbrido */}
                    <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700/50 mb-8">
                        <button
                            type="button"
                            onClick={() => setActiveTab('INSTITUCIONAL')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'INSTITUCIONAL'
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                                }`}
                        >
                            <Building2 className="w-4 h-4" />
                            Acceso Institucional
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('PARTERA')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'PARTERA'
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                                }`}
                        >
                            <HeartHandshake className="w-4 h-4" />
                            Parteras Tradicionales
                        </button>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                        {activeTab === 'INSTITUCIONAL' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                        Rol Operativo
                                    </label>
                                    <select
                                        value={rolSeleccionado}
                                        onChange={(e) => setRolSeleccionado(e.target.value as UserRole)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                                    >
                                        <option value={UserRole.ADMIN_JURISDICCIONAL}>Administrador Jurisdiccional</option>
                                        <option value={UserRole.CAPTURISTA_TAMIZ}>Capturista de Tamiz Neonatal</option>
                                        <option value={UserRole.GESTOR_PARTERAS}>Gestor Jurisdiccional de Parteras</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                        Usuario / RFC / Email
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="ej. capturista.jurisdiccion1@salud.gob.mx"
                                            value={usuario}
                                            onChange={(e) => setUsuario(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                        Contraseña Institucional
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-250 leading-relaxed mb-4">
                                    💡 <strong>Ingreso Simplificado:</strong> Diseñado para facilitar la captura directa desde comunidad mediante tu número registrado y código PIN.
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                        Número de Teléfono Registrado
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="961 123 4567"
                                            value={telefonoPIN}
                                            onChange={(e) => setTelefonoPIN(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                        PIN de Acceso Rápido (4 dígitos)
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                                        <input
                                            type="password"
                                            maxLength={4}
                                            required
                                            placeholder="1234"
                                            value={pinComunitario}
                                            onChange={(e) => setPinComunitario(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white tracking-widest text-center text-lg placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 ${activeTab === 'INSTITUCIONAL'
                                    ? 'bg-teal-500 hover:bg-teal-400 shadow-teal-500/25'
                                    : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25'
                                }`}
                        >
                            <span>Ingresar al Sistema</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-slate-500">
                        Jurisdicción Sanitaria N° 1 - Tamiz Neonatal & Red de Parteras Tradicionales
                    </p>
                </div>

            </div>
        </div>
    );
};
