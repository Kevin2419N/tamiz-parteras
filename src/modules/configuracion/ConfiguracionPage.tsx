import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    UserCheck,
    Lock,
    Shield,
    Volume2,
    VolumeX,
    WifiOff,
    RefreshCw,
    Check,
    X,
    Camera,
    Save,
    CheckCircle2,
    Eye,
    Type,
    Sliders,
    Database,
    HardDrive,
    Sparkles,
    AlertCircle
} from 'lucide-react';

export const ConfiguracionPage: React.FC = () => {
    const { user } = useAuth();

    // Active Tab State ('PERFIL' | 'ROLES' | 'ACCESIBILIDAD' | 'OFFLINE')
    const [activeTab, setActiveTab] = useState<'PERFIL' | 'ROLES' | 'ACCESIBILIDAD' | 'OFFLINE'>('PERFIL');

    // Tab 1: Perfil de Operador State
    const [profileData, setProfileData] = useState({
        nombre: user?.nombre || 'Dra. Carmen Silva Juárez',
        email: user?.email || 'carmen.silva@salud.gob.mx',
        telefono: '971 123 4567',
        curp: 'SIJC850412HOCMNN02',
        cargo: 'Capturista de Tamiz Neonatal & Enlace Jurisdiccional',
        jurisdiccion: 'Jurisdicción Sanitaria No. 2 - Istmo (Juchitán de Zaragoza)',
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Tab 2: Roles y Permisos State
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('TODOS');

    // Tab 3: Accesibilidad State
    const [lecturaVozActiva, setLecturaVozActiva] = useState(true);
    const [velocidadVoz, setVelocidadVoz] = useState<number>(0.9);
    const [volumenVoz, setVolumenVoz] = useState<number>(80);
    const [tamanoFuente, setTamanoFuente] = useState<'NORMAL' | 'GRANDE' | 'EXTRA_GRANDE'>('GRANDE');
    const [modoAltoContraste, setModoAltoContraste] = useState(false);
    const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);

    // Tab 4: Sincronización Offline State
    const [modoOfflineActivo, setModoOfflineActivo] = useState(true);
    const [registrosPendientes] = useState(3);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [lastSyncTime, setLastSyncTime] = useState('Hoy a las 09:15 AM');
    const [syncSuccessMessage, setSyncSuccessMessage] = useState(false);

    // Password Update Handler
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword) {
            setPasswordMessage({ text: 'Ingrese su contraseña actual.', type: 'error' });
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMessage({ text: 'La nueva contraseña debe tener al menos 6 caracteres.', type: 'error' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ text: 'Las contraseñas no coinciden.', type: 'error' });
            return;
        }

        setPasswordMessage({ text: '✓ Contraseña actualizada correctamente.', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(null), 4000);
    };

    // Test Voice Reader with SpeechSynthesis
    const playTestAudio = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const text = 'Prueba de Asistente de Voz para la Red de Parteras Tradicionales del Istmo.';
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-MX';
            utterance.rate = velocidadVoz;
            utterance.volume = volumenVoz / 100;

            utterance.onstart = () => setIsPlayingTestAudio(true);
            utterance.onend = () => setIsPlayingTestAudio(false);
            utterance.onerror = () => setIsPlayingTestAudio(false);

            window.speechSynthesis.speak(utterance);
        } else {
            alert('La sintesis de voz no está soportada en su navegador.');
        }
    };

    // Simulate Sync Process
    const triggerSync = () => {
        setIsSyncing(true);
        setSyncProgress(0);
        setSyncSuccessMessage(false);

        const interval = setInterval(() => {
            setSyncProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsSyncing(false);
                    setSyncSuccessMessage(true);
                    const now = new Date();
                    setLastSyncTime(`Hoy a las ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
                    return 100;
                }
                return prev + 25;
            });
        }, 400);
    };

    // Matrix of Permissions
    const matrizPermisos = [
        {
            modulo: 'Registro de Tamiz Neonatal',
            descripcion: 'Captura y validación de tarjetas de Guthrie',
            medicos: true,
            capturistas: true,
            admins: true,
            parteras: false,
        },
        {
            modulo: 'Padrón de Parteras Tradicionales',
            descripcion: 'Directorio, acreditación y emisión de credencial QR',
            medicos: true,
            capturistas: true,
            admins: true,
            parteras: true,
        },
        {
            modulo: 'Centro de Alertas & Recall Neonatal',
            descripcion: 'Gestión de re-tomas urgentes y llamadas de recall',
            medicos: true,
            capturistas: true,
            admins: true,
            parteras: false,
        },
        {
            modulo: 'Asistencia por Voz & Teclado Táctil',
            descripcion: 'Acceso simplificado por PIN / QR para parteras',
            medicos: true,
            capturistas: true,
            admins: true,
            parteras: true,
        },
        {
            modulo: 'Sincronización de Campo Offline',
            descripcion: 'Almacenamiento local sin cobertura de red en comunidades',
            medicos: true,
            capturistas: true,
            admins: true,
            parteras: true,
        },
        {
            modulo: 'Administración del Sistema & Roles',
            descripcion: 'Configuración global y gestión de cuentas de usuario',
            medicos: false,
            capturistas: false,
            admins: true,
            parteras: false,
        },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto selection:bg-[#9D2449] selection:text-white">

            {/* Header del Módulo de Configuración */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-black text-[#9D2449] bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                            GOBIERNO DE OAXACA • SSO
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-600">Ajustes Generales del Sistema</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mt-1">Configuración & Preferencias Operativas</h1>
                    <p className="text-xs font-medium text-slate-600 mt-1">
                        Jurisdicción Sanitaria No. 2 • Istmo de Tehuantepec (Perfil de Usuario, Roles, Accesibilidad y Modo Offline).
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700">
                    <Database className="w-4 h-4 text-[#9D2449]" />
                    <span>Servidor Estatal Oaxaca SSO</span>
                </div>
            </div>

            {/* Pestañas de Navegación del Módulo */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                        onClick={() => setActiveTab('PERFIL')}
                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 ${activeTab === 'PERFIL'
                            ? 'bg-[#9D2449] text-white shadow-md shadow-[#9D2449]/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <UserCheck className="w-4 h-4" />
                        <span>Perfil de Operador</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('ROLES')}
                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 ${activeTab === 'ROLES'
                            ? 'bg-[#9D2449] text-white shadow-md shadow-[#9D2449]/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        <span>Roles y Permisos</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('ACCESIBILIDAD')}
                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 ${activeTab === 'ACCESIBILIDAD'
                            ? 'bg-[#9D2449] text-white shadow-md shadow-[#9D2449]/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <Sliders className="w-4 h-4" />
                        <span>Accesibilidad Parteras</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('OFFLINE')}
                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 ${activeTab === 'OFFLINE'
                            ? 'bg-[#9D2449] text-white shadow-md shadow-[#9D2449]/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <WifiOff className="w-4 h-4" />
                        <span>Sincronización Offline</span>
                    </button>
                </div>
            </div>

            {/* CONTENIDO PESTAÑA 1: PERFIL DE OPERADOR */}
            {activeTab === 'PERFIL' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">

                    {/* Tarjeta de Fotografía y Datos Rápidos */}
                    <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5 text-center flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="relative w-28 h-28 mx-auto">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Foto de perfil"
                                        className="w-full h-full rounded-3xl object-cover border-4 border-rose-100 shadow-md"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-3xl bg-gradient-to-br from-[#9D2449] to-[#7A1B38] text-white font-black text-3xl flex items-center justify-center border-4 border-rose-100 shadow-md">
                                        {profileData.nombre.substring(0, 2).toUpperCase()}
                                    </div>
                                )}

                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute -bottom-2 -right-2 p-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white rounded-2xl cursor-pointer shadow-lg transition-transform hover:scale-105"
                                    title="Cambiar fotografía"
                                >
                                    <Camera className="w-4 h-4" />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const url = URL.createObjectURL(file);
                                                setAvatarUrl(url);
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <div>
                                <h3 className="font-extrabold text-base text-slate-900">{profileData.nombre}</h3>
                                <p className="text-xs font-bold text-[#9D2449] mt-0.5">{profileData.cargo}</p>
                                <span className="inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 mt-2">
                                    CURP: {profileData.curp}
                                </span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Adscripción Oficial</span>
                            <p className="font-bold text-slate-900">{profileData.jurisdiccion}</p>
                            <p className="text-slate-600 font-medium">Estado: Oaxaca • SSO</p>
                        </div>
                    </div>

                    {/* Formulario Datos de Usuario & Cambio de Contraseña */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Datos del Operador */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                            <h3 className="font-black text-base text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-[#9D2449]" />
                                <span>Información del Usuario Activo</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={profileData.nombre}
                                        onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Correo Electrónico Institucional</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Teléfono de Contacto</label>
                                    <input
                                        type="tel"
                                        value={profileData.telefono}
                                        onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Puesto / Cargo Asignado</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={profileData.cargo}
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-600 font-semibold"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card Cambio de Contraseña */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                            <h3 className="font-black text-base text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-[#9D2449]" />
                                <span>Seguridad y Cambio de Contraseña</span>
                            </h3>

                            {passwordMessage && (
                                <div
                                    className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border ${passwordMessage.type === 'success'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : 'bg-rose-50 text-rose-800 border-rose-300'
                                        }`}
                                >
                                    {passwordMessage.type === 'success' ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                    )}
                                    <span>{passwordMessage.text}</span>
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Contraseña Actual *</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Nueva Contraseña *</label>
                                        <input
                                            type="password"
                                            placeholder="Mínimo 6 caracteres"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Confirmar Nueva Contraseña *</label>
                                        <input
                                            type="password"
                                            placeholder="Repita la nueva contraseña"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-[#9D2449]"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Actualizar Contraseña</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            )}

            {/* CONTENIDO PESTAÑA 2: ROLES Y PERMISOS (SIMULACIÓN INSTITUCIONAL) */}
            {activeTab === 'ROLES' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
                            <div>
                                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-[#9D2449]" />
                                    <span>Matriz Institucional de Roles y Permisos</span>
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    Definición de privilegios de acceso según la norma del Gobierno del Estado de Oaxaca.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
                                <span className="font-bold text-slate-600 px-2">Filtrar Rol:</span>
                                <select
                                    value={selectedRoleFilter}
                                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 font-bold focus:outline-none"
                                >
                                    <option value="TODOS">Ver Todos los Roles</option>
                                    <option value="MEDICO">Médicos / Clínicos</option>
                                    <option value="CAPTURISTA">Capturistas de Tamiz</option>
                                    <option value="ADMIN">Administradores Jurisdiccionales</option>
                                    <option value="PARTERA">Parteras Tradicionales</option>
                                </select>
                            </div>
                        </div>

                        {/* Tabla Matriz de Permisos */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4">Módulo / Capacidad</th>
                                        <th className="p-4 text-center">Médicos</th>
                                        <th className="p-4 text-center">Capturistas</th>
                                        <th className="p-4 text-center">Administradores</th>
                                        <th className="p-4 text-center">Parteras Tradicionales</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {matrizPermisos.map((p, index) => (
                                        <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-slate-900">{p.modulo}</p>
                                                <p className="text-[11px] text-slate-500">{p.descripcion}</p>
                                            </td>

                                            <td className="p-4 text-center">
                                                {p.medicos ? (
                                                    <span className="inline-flex p-1.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-300">
                                                        <Check className="w-4 h-4" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex p-1.5 bg-slate-100 text-slate-400 rounded-xl">
                                                        <X className="w-4 h-4" />
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 text-center">
                                                {p.capturistas ? (
                                                    <span className="inline-flex p-1.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-300">
                                                        <Check className="w-4 h-4" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex p-1.5 bg-slate-100 text-slate-400 rounded-xl">
                                                        <X className="w-4 h-4" />
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 text-center">
                                                {p.admins ? (
                                                    <span className="inline-flex p-1.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-300">
                                                        <Check className="w-4 h-4" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex p-1.5 bg-slate-100 text-slate-400 rounded-xl">
                                                        <X className="w-4 h-4" />
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 text-center">
                                                {p.parteras ? (
                                                    <span className="inline-flex p-1.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-300">
                                                        <Check className="w-4 h-4" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex p-1.5 bg-slate-100 text-slate-400 rounded-xl">
                                                        <X className="w-4 h-4" />
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENIDO PESTAÑA 3: AJUSTES DE ACCESIBILIDAD PARA PARTERAS */}
            {activeTab === 'ACCESIBILIDAD' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
                        <div className="border-b border-slate-200 pb-3">
                            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                                <Sliders className="w-5 h-5 text-[#9D2449]" />
                                <span>Ajustes de Accesibilidad para Parteras Tradicionales</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Herramientas de asistencia por voz y adaptación de tipografía táctil (Cumplimiento WCAG 2.1 AAA).
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Control 1: Lectura de Voz */}
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-rose-100 text-[#9D2449] rounded-2xl border border-rose-200">
                                            {lecturaVozActiva ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900">Lectura de Voz de Instrucciones</h4>
                                            <p className="text-xs text-slate-500">Asistencia por voz en español y lenguas zapotecas.</p>
                                        </div>
                                    </div>

                                    <input
                                        type="checkbox"
                                        checked={lecturaVozActiva}
                                        onChange={(e) => setLecturaVozActiva(e.target.checked)}
                                        className="w-5 h-5 accent-[#9D2449] cursor-pointer"
                                    />
                                </div>

                                {lecturaVozActiva && (
                                    <div className="space-y-4 pt-2 border-t border-slate-200 text-xs">

                                        {/* Slider Velocidad */}
                                        <div>
                                            <div className="flex justify-between font-bold text-slate-700 mb-1">
                                                <span>Velocidad de Lectura</span>
                                                <span className="text-[#9D2449]">{velocidadVoz}x</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="1.5"
                                                step="0.1"
                                                value={velocidadVoz}
                                                onChange={(e) => setVelocidadVoz(Number(e.target.value))}
                                                className="w-full accent-[#9D2449] cursor-pointer"
                                            />
                                        </div>

                                        {/* Slider Volumen */}
                                        <div>
                                            <div className="flex justify-between font-bold text-slate-700 mb-1">
                                                <span>Volumen de la Voz</span>
                                                <span className="text-[#9D2449]">{volumenVoz}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={volumenVoz}
                                                onChange={(e) => setVolumenVoz(Number(e.target.value))}
                                                className="w-full accent-[#9D2449] cursor-pointer"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={playTestAudio}
                                            disabled={isPlayingTestAudio}
                                            className="w-full py-2.5 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                                        >
                                            <Volume2 className="w-4 h-4" />
                                            <span>{isPlayingTestAudio ? 'Reproduciendo audio...' : 'Probar Audio de Muestra'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Control 2: Tamaño de Tipografía Táctil */}
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-rose-100 text-[#9D2449] rounded-2xl border border-rose-200">
                                        <Type className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900">Tamaño de Tipografía Táctil</h4>
                                        <p className="text-xs text-slate-500">Ajuste de legibilidad para dispositivos móviles.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setTamanoFuente('NORMAL')}
                                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${tamanoFuente === 'NORMAL'
                                            ? 'bg-[#9D2449] text-white border-[#9D2449] shadow-md'
                                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                            }`}
                                    >
                                        Estándar (100%)
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTamanoFuente('GRANDE')}
                                        className={`py-3 px-2 rounded-xl text-sm font-black border transition-all ${tamanoFuente === 'GRANDE'
                                            ? 'bg-[#9D2449] text-white border-[#9D2449] shadow-md'
                                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                            }`}
                                    >
                                        Grande (120%)
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTamanoFuente('EXTRA_GRANDE')}
                                        className={`py-3 px-2 rounded-xl text-base font-black border transition-all ${tamanoFuente === 'EXTRA_GRANDE'
                                            ? 'bg-[#9D2449] text-white border-[#9D2449] shadow-md'
                                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                            }`}
                                    >
                                        Máximo (150%)
                                    </button>
                                </div>

                                {/* Control Alto Contraste */}
                                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-slate-600" />
                                        <span className="font-bold text-slate-800">Modo Alto Contraste (Fondo Oscuro)</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={modoAltoContraste}
                                        onChange={(e) => setModoAltoContraste(e.target.checked)}
                                        className="w-5 h-5 accent-[#9D2449] cursor-pointer"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* CONTENIDO PESTAÑA 4: SINCRONIZACIÓN OFFLINE (ISTMO DE TEHUANTEPEC) */}
            {activeTab === 'OFFLINE' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
                        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                                    <WifiOff className="w-5 h-5 text-[#9D2449]" />
                                    <span>Sincronización y Guardado Offline (Campo Istmo)</span>
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    Permite registrar muestras de tamiz sin conexión a internet en comunidades rurales.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                <span>IndexedDB Activo (1.4 MB)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Interruptor Modo Offline */}
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900">Activar Modo Guardado Sin Conexión</h4>
                                        <p className="text-xs text-slate-500">Almacena formularios en el dispositivo de forma encriptada.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={modoOfflineActivo}
                                        onChange={(e) => setModoOfflineActivo(e.target.checked)}
                                        className="w-5 h-5 accent-[#9D2449] cursor-pointer"
                                    />
                                </div>

                                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 font-medium">Registros Pendientes de Enviar:</span>
                                        <span className="font-black text-[#9D2449] text-base">{registrosPendientes} folios</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 font-medium">Última Sincronización Exitosa:</span>
                                        <span className="font-bold text-slate-900">{lastSyncTime}</span>
                                    </div>
                                </div>

                                {/* Botón de Sincronización Manual */}
                                <button
                                    type="button"
                                    onClick={triggerSync}
                                    disabled={isSyncing}
                                    className="w-full py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                    <span>{isSyncing ? 'Sincronizando con Servidor Estatal...' : 'Sincronizar Registros Pendientes Ahora'}</span>
                                </button>

                                {isSyncing && (
                                    <div className="space-y-1">
                                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-[#9D2449] h-full transition-all duration-300"
                                                style={{ width: `${syncProgress}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-bold block text-center">Progreso: {syncProgress}%</span>
                                    </div>
                                )}

                                {syncSuccessMessage && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>✓ ¡Todos los registros locales fueron sincronizados con éxito!</span>
                                    </div>
                                )}
                            </div>

                            {/* Información Técnica de Almacenamiento Local */}
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3 text-xs">
                                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-[#9D2449]" />
                                    <span>Estado del Almacenamiento Local (Istmo)</span>
                                </h4>

                                <div className="space-y-2">
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between">
                                        <span className="text-slate-600 font-medium">Base de Datos Local:</span>
                                        <span className="font-bold text-slate-900">IndexedDB (tamiz_offline_db)</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between">
                                        <span className="text-slate-600 font-medium">Espacio Utilizado:</span>
                                        <span className="font-bold text-slate-900">1.4 MB de 50 MB asignados</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between">
                                        <span className="text-slate-600 font-medium">Algoritmo de Encriptación:</span>
                                        <span className="font-bold text-emerald-700">AES-256 en Reposo</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
