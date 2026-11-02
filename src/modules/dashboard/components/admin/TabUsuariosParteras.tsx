import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Plus, X, ShieldCheck, MapPin, Languages, Key, QrCode, UserCheck, Printer, CheckCircle2, Loader2, AlertCircle, User, Sparkles, Phone as PhoneIcon } from 'lucide-react';
import type { ParteraCredencial } from './types';
import { http } from '../../../../services/http';

/* ============================================================================
 * UTILIDADES
 * ========================================================================== */

const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'PT';
    const words = name.split(' ').filter(Boolean);
    if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

const obtenerPin = (p: ParteraCredencial): string =>
    String(p.pinCuatroDigitos || (p as any).pin || '----');

/* ============================================================================
 * COMPONENTES DE LA CREDENCIAL (FORMATO ID-1 / PVC)
 * ========================================================================== */

const AcabadoPVC: React.FC = () => (
    <>
        <div
            className="cred-hole mx-auto mt-2.5 h-2 w-14 rounded-full bg-slate-200 shrink-0 relative z-20"
            style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.35)' }}
        />
        <div
            className="cred-gloss absolute inset-0 z-20 pointer-events-none"
            style={{
                background:
                    'linear-gradient(115deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 34%)'
            }}
        />
    </>
);

const CredencialFrente: React.FC<{ partera: ParteraCredencial }> = ({ partera }) => {
    const nombre = partera.nombreCompleto || 'Sin nombre';
    const ubicacion = [partera.municipio || 'Juchitán de Zaragoza', partera.comunidad || 'Quinta Sección']
        .filter(Boolean)
        .join(' • ');
    const tamanoNombre = nombre.length > 34 ? 'text-[14px]' : nombre.length > 22 ? 'text-[16px]' : 'text-[19px]';
    const iniciales = getInitials(partera.nombreCompleto);
    const fotoUrl = (partera as any).fotoUrl;

    return (
        <div className="cred-slot">
            <div className="cred-card relative bg-white border border-slate-300 rounded-3xl overflow-hidden text-slate-900 flex flex-col shadow-2xl shadow-black/60">
                {/* Plantilla de fondo oficial para el Frente */}
                <img
                    src="/plantilla-frente.png"
                    alt="Plantilla Frente"
                    className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                    draggable={false}
                />
                
                <AcabadoPVC />

                {/* Contenido en Z-10 para flotar perfectamente sobre la plantilla */}
                <div className="relative z-10 flex flex-col h-full justify-between p-4 pt-3 pb-8">
                    {/* Logos institucionales */}
                    <div className="flex items-center justify-center gap-2 px-1 pt-1">
                        <img
                            src="/logo-jurisdiccion.png"
                            alt="Jurisdicción Sanitaria"
                            className="h-7 w-auto max-w-[46%] object-contain mix-blend-multiply"
                        />
                        <div className="h-5 w-px bg-slate-300" />
                        <img
                            src="/Logo-Secretaria.png"
                            alt="Medicina Tradicional"
                            className="h-7 w-auto max-w-[46%] object-contain mix-blend-multiply"
                        />
                    </div>

                    {/* Rectángulo guinda institucional */}
                    <div className="mx-1 rounded-lg bg-[#9D2449] py-1 px-2 text-center shadow-md border border-rose-900/30">
                        <span className="block text-[9.5px] font-black uppercase tracking-[0.05em] text-white leading-tight">
                            CREDENCIAL DE ACREDITACIÓN OFICIAL
                        </span>
                        <span className="block text-[7.5px] font-medium text-rose-100 leading-tight mt-0.5">
                            Medicina Tradicional e Interculturalidad
                        </span>
                    </div>

                    {/* Datos principales de la partera */}
                    <div className="flex flex-col items-center justify-center gap-1 text-center my-auto">
                        <div className="relative inline-block my-0.5">
                            <div className="w-[66px] h-[66px] rounded-full border-2 border-[#9D2449]/40 bg-gradient-to-br from-[#B02D55] to-[#6E1833] text-white flex items-center justify-center font-black text-[22px] tracking-wide shadow-md overflow-hidden">
                                {fotoUrl ? (
                                    <img src={fotoUrl} alt={nombre} className="w-full h-full object-cover" />
                                ) : (
                                    iniciales
                                )}
                            </div>
                            {/* Insignia circular superpuesta con iniciales */}
                            <div className="absolute -bottom-1 -right-1 bg-[#9D2449] text-white text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                {iniciales.slice(0, 2)}
                            </div>
                        </div>

                        <div>
                            <h4 className={`${tamanoNombre} font-black text-slate-900 leading-[1.1] break-words mt-0.5`}>
                                {nombre}
                            </h4>
                            <p className="text-[9px] font-bold text-slate-600 mt-0.5 tracking-tight">
                                Medicina Tradicional e Intercultural
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-1 bg-slate-50/90 border border-slate-200 rounded-md px-2 py-0.5 max-w-full shadow-2xs mt-0.5">
                            <span className="text-[7.5px] font-extrabold text-slate-400 tracking-widest">CURP:</span>
                            <span className="font-mono text-[10px] font-bold tracking-wider text-slate-800 break-all">
                                {partera.curp || 'No registrada'}
                            </span>
                        </div>

                        <div className="flex items-center justify-center gap-1 text-[#9D2449] max-w-full mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="text-[10px] font-extrabold leading-tight">{ubicacion}</span>
                        </div>

                        {partera.lenguaMaterna && (
                            <div className="flex flex-wrap items-center justify-center gap-x-1 mt-0.5">
                                <span className="text-[9.5px] font-bold text-slate-500">Lengua:</span>
                                <strong className="text-[10px] font-black text-[#9D2449] leading-tight">
                                    {partera.lenguaMaterna}
                                </strong>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CredencialReverso: React.FC<{ partera: ParteraCredencial }> = ({ partera }) => {
    const pin = obtenerPin(partera);

    return (
        <div className="cred-slot">
            <div className="cred-card relative bg-white border border-slate-300 rounded-3xl overflow-hidden text-slate-900 flex flex-col shadow-2xl shadow-black/60">
                {/* Plantilla de fondo oficial para el Reverso */}
                <img
                    src="/plantilla-reverso.png"
                    alt="Plantilla Reverso"
                    className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                    draggable={false}
                />
                
                <AcabadoPVC />

                {/* Contenido en Z-10 para flotar perfectamente sobre la plantilla */}
                <div className="relative z-10 flex flex-col h-full justify-between p-3 pt-3 pb-8">
                    {/* PIN táctil superior compacto */}
                    <div className="mx-2 rounded-xl border border-amber-300 bg-gradient-to-b from-amber-50 to-amber-100 py-1.5 px-3 text-center shadow-xs">
                        <div className="flex items-center justify-center gap-1 text-amber-900">
                            <Key className="w-3 h-3" />
                            <span className="text-[8.5px] font-black uppercase tracking-wider">PIN TÁCTIL DE ACCESO: {pin}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center flex-1 px-2 my-auto">
                        {/* Código QR centrado */}
                        <div className="text-center">
                            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm inline-block">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&ecc=M&data=${encodeURIComponent(pin)}`}
                                    alt="Código QR de acceso rápido"
                                    className="w-[105px] h-[105px] object-contain block"
                                />
                            </div>
                            <span className="text-[8px] text-slate-500 font-mono mt-1 block font-extrabold uppercase tracking-widest">
                                ESCANEAR PARA LOGIN
                            </span>
                        </div>

                        {/* Sello verificado */}
                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50/90 border border-emerald-200 px-2.5 py-0.5 text-[9.5px] text-emerald-800 font-extrabold shadow-2xs mt-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Credencial Oficial Verificada • SSO</span>
                        </div>
                    </div>

                    {/* Botón inferior guinda "Imprimir / Descargar Credencial Oficial" */}
                    <div className="mx-1 rounded-xl bg-[#9D2449] py-1.5 px-2 text-center shadow-md flex items-center justify-center gap-1.5 border border-rose-900/30">
                        <Printer className="w-3.5 h-3.5 text-rose-100 shrink-0" />
                        <span className="text-[9.5px] font-black tracking-tight text-white leading-tight">
                            Imprimir / Descargar Credencial Oficial
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ============================================================================
 * COMPONENTE PRINCIPAL
 * ========================================================================== */

export const TabUsuariosParteras: React.FC = () => {
    // Estado del padrón de parteras
    const [parteras, setParteras] = useState<ParteraCredencial[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Carga oficial del padrón de parteras desde PostgreSQL (Render)
    useEffect(() => {
        const cargarParteras = async () => {
            setCargando(true);
            setErrorMessage(null);
            try {
                const response = await http.get('/admin/parteras');
                const rawData = response.data;
                let listaValida: ParteraCredencial[] = [];

                if (Array.isArray(rawData)) {
                    listaValida = rawData;
                } else if (rawData && typeof rawData === 'object') {
                    if (Array.isArray(rawData.parteras)) {
                        listaValida = rawData.parteras;
                    } else if (Array.isArray(rawData.data)) {
                        listaValida = rawData.data;
                    }
                }

                setParteras(listaValida);
            } catch (error: any) {
                console.error('Error al cargar padrón de parteras:', error);
                setErrorMessage('No se pudo conectar con el servidor para obtener el padrón de parteras.');
                setParteras([]);
            } finally {
                setCargando(false);
            }
        };

        cargarParteras();
    }, []);

    // Estados para modal de registro de nueva partera
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [nombres, setNombres] = useState('');
    const [apellidoPaterno, setApellidoPaterno] = useState('');
    const [apellidoMaterno, setApellidoMaterno] = useState('');
    const [newCurp, setNewCurp] = useState('');
    const [newLengua, setNewLengua] = useState('Zapoteco del Istmo');
    const [newTelefono, setNewTelefono] = useState('');
    const [newMunicipio, setNewMunicipio] = useState('Juchitán de Zaragoza');
    const [newComunidad, setNewComunidad] = useState('');
    const [newPin, setNewPin] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado para la Ventana Central de Confirmación de Éxito
    const [successModalData, setSuccessModalData] = useState<ParteraCredencial | null>(null);

    // Modal para Ver y Generar Credencial QR (Doble Cara)
    const [selectedParteraQR, setSelectedParteraQR] = useState<ParteraCredencial | null>(null);

    const generateRandom4Pin = () => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        setNewPin(pin);
    };

    const handleRegisterPartera = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        const nombreCompletoCompuesto = `${nombres.trim()} ${apellidoPaterno.trim()} ${apellidoMaterno.trim()}`.trim();
        const pinGenerado = newPin || Math.floor(1000 + Math.random() * 9000).toString();

        const payload = {
            nombre: nombres.trim(),
            apellidoPaterno: apellidoPaterno.trim(),
            apellidoMaterno: apellidoMaterno.trim(),
            nombreCompleto: nombreCompletoCompuesto,
            curp: newCurp.toUpperCase(),
            lenguaMaterna: newLengua,
            telefonoRecaudo: newTelefono,
            municipio: newMunicipio,
            comunidadBarrio: newComunidad || 'Cabecera Municipal',
            comunidad: newComunidad || 'Cabecera Municipal',
            pin: pinGenerado,
            pinAcceso: pinGenerado,
            estatusAcreditacion: 'ACREDITADA'
        };

        try {
            const response = await http.post('/admin/parteras', payload);
            const datosServidor = response.data?.partera || response.data?.data || {};
            const pinFinalAsignado = datosServidor.pin || datosServidor.pinCuatroDigitos || pinGenerado;

            const creada: ParteraCredencial = {
                ...payload,
                ...datosServidor,
                pinCuatroDigitos: pinFinalAsignado,
                pin: pinFinalAsignado
            };

            setParteras((prev) => [creada, ...(Array.isArray(prev) ? prev : [])]);
            
            setShowRegisterModal(false);
            setSuccessModalData(creada);

            setNombres('');
            setApellidoPaterno('');
            setApellidoMaterno('');
            setNewCurp('');
            setNewTelefono('');
            setNewComunidad('');
            setNewPin('');
        } catch (error: any) {
            console.error('Error al registrar partera:', error);
            alert(error.response?.data?.error || error.response?.data?.message || 'Error al guardar la partera en la base de datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 text-white">

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes lgFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
                @keyframes lgModal{from{opacity:0;transform:scale(0.95) translateY(20px)}to{opacity:1;transform:none}}
                @keyframes lgPop{0%{transform:scale(0.8);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
                .lg-fade{animation:lgFade .35s ease both}
                .lg-modal{animation:lgModal .4s cubic-bezier(0.16,1,0.3,1) both}
                .lg-pop{animation:lgPop .45s cubic-bezier(0.34,1.56,0.64,1) both}
                .lg-quiet{scrollbar-width:none}
                .lg-quiet::-webkit-scrollbar{display:none}

                /* ===== Credencial ID-1 (base 324 x 514 px = 54 x 85.6 mm) ===== */
                #printable-credentials { --cred-scale: 1; }
                @media (max-width: 420px) {
                    #printable-credentials { --cred-scale: 0.82; }
                }
                .cred-slot {
                    width: calc(324px * var(--cred-scale, 1));
                    height: calc(514px * var(--cred-scale, 1));
                    flex-shrink: 0;
                }
                .cred-card {
                    width: 324px;
                    height: 514px;
                    transform: scale(var(--cred-scale, 1));
                    transform-origin: top left;
                }
                #printable-credentials, #printable-credentials * {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                /* ===== Impresión / PDF ===== */
                @page credenciales { margin: 10mm; }

                @media print {
                    body > *:not(.cred-portal) { display: none !important; }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                    }
                    .cred-portal {
                        page: credenciales;
                        position: static !important;
                        display: block !important;
                        inset: auto !important;
                        padding: 0 !important;
                        background: transparent !important;
                        backdrop-filter: none !important;
                        overflow: visible !important;
                    }
                    .cred-dialog {
                        background: transparent !important;
                        border: 0 !important;
                        box-shadow: none !important;
                        backdrop-filter: none !important;
                        border-radius: 0 !important;
                        padding: 0 !important;
                        max-width: none !important;
                        width: auto !important;
                        animation: none !important;
                        transform: none !important;
                    }
                    .cred-noprint, .cred-hole, .cred-gloss { display: none !important; }

                    #printable-credentials {
                        --cred-scale: 0.63;
                        display: flex !important;
                        flex-direction: row !important;
                        flex-wrap: nowrap !important;
                        justify-content: flex-start !important;
                        align-items: flex-start !important;
                        gap: 8mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    .cred-slot { width: 54mm !important; height: 85.6mm !important; }
                    .cred-card { box-shadow: none !important; }
                }
            `}} />

            {/* CABECERA INSTITUCIONAL */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-rose-950/40 rounded-2xl border border-rose-800/40 text-rose-300 backdrop-blur-md shadow-lg shadow-rose-950/40">
                        <Heart className="w-6 h-6 fill-rose-500/20" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                            Padrón Oficial de Parteras Tradicionales Acreditadas
                        </h2>
                        <p className="text-xs text-rose-100/80 font-medium mt-0.5">
                            Red Intercultural de Salud Materna • Istmo de Tehuantepec (Jurisdicción Sanitaria No. 2)
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        generateRandom4Pin();
                        setShowRegisterModal(true);
                    }}
                    className="px-5 py-3 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95 border border-white/30"
                >
                    <Plus className="w-4 h-4 text-rose-200" />
                    <span>+ Registrar Nueva Partera</span>
                </button>
            </div>

            {/* MENSAJE DE ERROR */}
            {errorMessage && (
                <div className="p-4 bg-rose-950/60 border border-rose-300/40 rounded-2xl flex items-center gap-3 text-rose-100 text-xs font-bold backdrop-blur-md">
                    <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* VISTA MÓVIL (< md) */}
            <div className="space-y-3 md:hidden">
                {cargando ? (
                    <div className="p-8 text-center text-xs text-rose-100/70 font-medium bg-slate-900/40 rounded-2xl border border-white/20 backdrop-blur-md flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        <span>Cargando padrón desde PostgreSQL...</span>
                    </div>
                ) : !Array.isArray(parteras) || parteras.length === 0 ? (
                    <div className="p-8 text-center text-xs text-rose-100/70 font-medium bg-slate-900/40 rounded-2xl border border-white/20 backdrop-blur-md">
                        No hay parteras registradas en el padrón.
                    </div>
                ) : (
                    parteras.map((p) => (
                        <div key={p.id || p.curp} className="p-4 bg-slate-900/50 rounded-2xl border border-white/20 shadow-lg backdrop-blur-xl space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9D2449] to-[#7A1B38] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                                        {getInitials(p.nombreCompleto)}
                                    </div>
                                    <div>
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-block mb-1">
                                            {p.estatusAcreditacion || 'ACREDITADA'}
                                        </span>
                                        <h3 className="text-xs font-black text-white leading-tight">
                                            {p.nombreCompleto || 'Sin nombre'}
                                        </h3>
                                        <p className="text-[10px] text-rose-200/70 font-mono mt-0.5">CURP: {p.curp}</p>
                                    </div>
                                </div>
                                <div className="bg-amber-500/20 text-amber-200 font-mono font-black text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 border border-amber-300/40 shrink-0 backdrop-blur-md">
                                    <Key className="w-3 h-3 text-amber-300" />
                                    <span>PIN: {p.pinCuatroDigitos || (p as any).pin}</span>
                                </div>
                            </div>

                            <div className="text-xs space-y-1.5 text-rose-50/90 bg-white/5 p-3 rounded-xl border border-white/10">
                                <div className="flex items-center gap-1.5 text-white font-bold">
                                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                    <span>{p.municipio} {p.comunidad ? `(${p.comunidad})` : ''}</span>
                                </div>
                                {p.lenguaMaterna && (
                                    <div className="text-[11px] text-rose-200/80 flex items-center gap-1.5">
                                        <Languages className="w-3 h-3 text-rose-400" />
                                        <span>Lengua: <strong className="text-white">{p.lenguaMaterna}</strong></span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedParteraQR(p)}
                                className="w-full py-2.5 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/30"
                            >
                                <QrCode className="w-4 h-4 text-rose-200" />
                                <span>Ver Credencial Oficial (Doble Cara)</span>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* TABLA PRO DE PADRÓN DE PARTERAS (ESCRITORIO >= md) */}
            <div className="hidden md:block overflow-x-auto rounded-3xl border border-white/30 bg-slate-900/40 shadow-2xl backdrop-blur-3xl">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                        <tr className="bg-white/5 text-rose-200 font-bold uppercase text-[11px] tracking-wider border-b border-white/20">
                            <th className="py-4 px-5">Partera Tradicional / Lengua</th>
                            <th className="py-4 px-5">CURP</th>
                            <th className="py-4 px-5">Ubicación (Municipio / Comunidad)</th>
                            <th className="py-4 px-5 text-center">PIN Táctil</th>
                            <th className="py-4 px-5 text-right">Credencialización</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-rose-50/90">
                        {cargando ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-rose-200 font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
                                        <span>Cargando padrón desde PostgreSQL (Render)...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : !Array.isArray(parteras) || parteras.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-rose-200/70 font-normal">
                                    No hay parteras registradas en el padrón.
                                </td>
                            </tr>
                        ) : (
                            parteras.map((p) => (
                                <tr key={p.id || p.curp} className="hover:bg-white/10 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9D2449] to-[#7A1B38] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                                                {getInitials(p.nombreCompleto)}
                                            </div>
                                            <div>
                                                <div className="font-black text-white text-xs">
                                                    {p.nombreCompleto || 'Sin nombre'}
                                                </div>
                                                <div className="text-[10px] text-rose-200/80 flex items-center gap-1 font-medium mt-0.5">
                                                    <Languages className="w-3 h-3 text-rose-400" />
                                                    <span>{p.lenguaMaterna || 'Español'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-5 font-mono text-rose-100 font-medium">{p.curp}</td>
                                    <td className="py-4 px-5">
                                        <div className="font-bold text-white">{p.municipio}</div>
                                        <div className="text-[11px] text-rose-200/70">{p.comunidad || 'Cabecera Municipal'}</div>
                                    </td>
                                    <td className="py-4 px-5 text-center">
                                        <span className="bg-amber-500/20 text-amber-200 font-mono font-black text-xs px-3 py-1.5 rounded-xl inline-flex items-center gap-1 border border-amber-300/40 shadow-sm backdrop-blur-md">
                                            <Key className="w-3.5 h-3.5 text-amber-300" />
                                            <span>{p.pinCuatroDigitos || (p as any).pin}</span>
                                        </span>
                                    </td>
                                    <td className="py-4 px-5 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedParteraQR(p)}
                                            className="px-4 py-2.5 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95 border border-white/30"
                                        >
                                            <QrCode className="w-4 h-4 text-rose-200" />
                                            <span>Ver Credencial</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL REGISTRAR PARTERA */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
                    <div className="bg-slate-900/95 border border-white/40 rounded-[32px] max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl shadow-slate-950/90 backdrop-blur-3xl max-h-[90vh] flex flex-col lg-modal">

                        <div className="flex items-center justify-between border-b border-white/20 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-950/40 rounded-2xl border border-rose-800/40 text-rose-300 backdrop-blur-md">
                                    <Heart className="w-5 h-5 fill-rose-500/20" />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight">Registrar Nueva Partera Acreditada</h3>
                                    <p className="text-[11px] text-rose-100/80 font-medium">Servicios de Salud de Oaxaca • Padrón de Medicina Tradicional</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowRegisterModal(false)}
                                className="p-2 text-rose-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto lg-quiet space-y-4 pr-1">
                            <div className="p-3.5 bg-rose-950/30 border border-rose-800/40 rounded-2xl flex items-start gap-3 text-xs text-rose-100 backdrop-blur-md">
                                <ShieldCheck className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                                <div>
                                    <span className="font-extrabold uppercase tracking-wider block text-[10px] text-rose-300">Acreditación Comunitaria e Identidad Intercultural</span>
                                    <p className="text-rose-50/90 font-medium text-[11px]">
                                        Complete los datos oficiales. Al guardar, el sistema generará de inmediato su credencial con código QR de acceso seguro.
                                    </p>
                                </div>
                            </div>

                            <form id="partera-form" onSubmit={handleRegisterPartera} className="space-y-4 text-xs font-semibold">
                                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-3 backdrop-blur-md">
                                    <span className="text-[10px] font-black uppercase text-rose-300 tracking-wider block flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        <span>Identidad Oficial (Nombres y Apellidos *)</span>
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1">Nombre(s) *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. María Elena"
                                                value={nombres}
                                                onChange={(e) => setNombres(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1">Apellido Paterno *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. Velasco"
                                                value={apellidoPaterno}
                                                onChange={(e) => setApellidoPaterno(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1">Apellido Materno *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. Morales"
                                                value={apellidoMaterno}
                                                onChange={(e) => setApellidoMaterno(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    <div className="space-y-3.5">
                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1 flex items-center justify-between">
                                                <span>CURP de la Partera *</span>
                                                <span className={`text-[10px] font-mono font-bold ${newCurp.length === 18 ? 'text-emerald-300' : 'text-rose-200/60'}`}>
                                                    {newCurp.length}/18
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={18}
                                                placeholder="VEMA650810MOCMNS09"
                                                value={newCurp}
                                                onChange={(e) => setNewCurp(e.target.value.toUpperCase())}
                                                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white uppercase font-mono placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 font-medium"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1 flex items-center gap-1.5">
                                                <Languages className="w-3.5 h-3.5 text-rose-400" />
                                                <span>Lengua Materna *</span>
                                            </label>
                                            <select
                                                value={newLengua}
                                                onChange={(e) => setNewLengua(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/30 rounded-xl text-white focus:outline-none focus:border-rose-400 font-semibold"
                                            >
                                                <option value="Zapoteco del Istmo">Zapoteco del Istmo (Diidxazá)</option>
                                                <option value="Ombeayiüts / Huave">Ombeayiüts / Huave (San Mateo / Ikoods)</option>
                                                <option value="Mixe">Mixe (Ayuuk)</option>
                                                <option value="Zoque">Zoque (Angpøiny)</option>
                                                <option value="Español">Español</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3.5">
                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1">Municipio / Localidad *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. Juchitán de Zaragoza"
                                                value={newMunicipio}
                                                onChange={(e) => setNewMunicipio(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 font-semibold"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-rose-100 font-bold mb-1">Comunidad / Barrio / Sección</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Sección Segunda"
                                                value={newComunidad}
                                                onChange={(e) => setNewComunidad(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-white/20">
                                    <div>
                                        <label className="block text-rose-100 font-bold mb-1">Teléfono / Recaudo</label>
                                        <div className="relative">
                                            <PhoneIcon className="w-4 h-4 text-rose-400 absolute left-3.5 top-3" />
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                placeholder="971 123 4567"
                                                value={newTelefono}
                                                onChange={(e) => setNewTelefono(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/60 border border-white/30 rounded-xl text-white font-mono placeholder:text-rose-200/40 focus:outline-none focus:border-rose-400 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-rose-100 font-bold mb-1 flex items-center justify-between">
                                            <span>PIN Táctil (4 Dígitos) *</span>
                                            <button
                                                type="button"
                                                onClick={generateRandom4Pin}
                                                className="text-[10px] text-rose-300 hover:underline font-bold cursor-pointer"
                                            >
                                                Generar PIN
                                            </button>
                                        </label>
                                        <div className="relative">
                                            <Key className="w-4 h-4 text-amber-300 absolute left-3.5 top-3" />
                                            <input
                                                type="text"
                                                required
                                                maxLength={4}
                                                placeholder="Ej. 4892"
                                                value={newPin}
                                                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-10 pr-3.5 py-2.5 bg-amber-500/20 border border-amber-300/50 rounded-xl text-amber-100 font-mono font-black text-sm tracking-widest focus:outline-none focus:border-rose-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="flex gap-3 pt-3 border-t border-white/25 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowRegisterModal(false)}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors cursor-pointer border border-white/20 text-xs"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="partera-form"
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:brightness-110 text-white font-extrabold rounded-xl shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60 border border-white/40 text-xs"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="w-4 h-4 text-rose-200" />
                                        <span>Guardar y Ver Credencial</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VENTANA CENTRAL DE CONFIRMACIÓN DE ÉXITO */}
            {successModalData && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-rose-500/50 rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-5 shadow-[0_0_50px_rgba(157,36,73,0.3)] text-center relative overflow-hidden lg-pop">
                        <div aria-hidden="true" className="absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-rose-600/25 blur-3xl pointer-events-none" />

                        <div className="relative mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-950/50 ring-4 ring-emerald-300/30">
                            <CheckCircle2 className="size-10 text-white animate-bounce" />
                        </div>

                        <div className="space-y-1.5 relative z-10">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-950/60 px-3 py-0.5 rounded-full border border-rose-800/50">
                                <Sparkles className="w-3.5 h-3.5" />
                                Acreditación Exitosa en PostgreSQL
                            </span>
                            <h3 className="text-xl font-black text-white tracking-tight">
                                ¡Partera Registrada con Éxito!
                            </h3>
                            <p className="text-xs text-rose-100/80 leading-relaxed">
                                Se ha completado el alta oficial de <strong className="text-white">{successModalData.nombreCompleto}</strong> en el sistema de la Jurisdicción Sanitaria No. 2.
                            </p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-xs space-y-2 text-left relative z-10 backdrop-blur-md">
                            <div className="flex justify-between">
                                <span className="text-rose-200/70">CURP:</span>
                                <span className="font-mono font-bold text-white">{successModalData.curp}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-rose-200/70">Ubicación:</span>
                                <span className="font-bold text-white">{successModalData.municipio}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-rose-200/70">PIN Táctil Asignado:</span>
                                <span className="font-mono font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-300/40">
                                    {successModalData.pinCuatroDigitos || (successModalData as any).pin}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2 relative z-10">
                            <button
                                type="button"
                                onClick={() => setSuccessModalData(null)}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const parteraActual = successModalData;
                                    setSuccessModalData(null);
                                    setSelectedParteraQR(parteraActual);
                                }}
                                className="flex-1 py-3 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-950/40 transition-all cursor-pointer border border-white/40 flex items-center justify-center gap-1.5"
                            >
                                <QrCode className="size-4" />
                                <span>Ver Credencial (Doble Cara)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREDENCIAL OFICIAL DOBLE CARA (FORMATO ID-1) — montada en document.body para imprimir limpio */}
            {selectedParteraQR && typeof document !== 'undefined' &&
                createPortal(
                    <div className="cred-portal fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 overflow-y-auto">
                        <div className="cred-dialog bg-slate-900/90 border border-rose-500/50 rounded-[32px] p-5 sm:p-6 shadow-2xl shadow-slate-950/90 max-w-4xl w-full space-y-5 text-center relative backdrop-blur-3xl lg-modal my-auto">

                            <div className="cred-noprint flex items-center justify-between border-b border-white/20 pb-3">
                                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold text-left">
                                    <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
                                    <span>Previsualización Oficial de Credencial de Identidad (Frente y Reverso)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedParteraQR(null)}
                                    className="p-2 text-rose-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* CONTENEDOR IMPRIMIBLE DOBLE CARA */}
                            <div
                                id="printable-credentials"
                                className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center py-2"
                            >
                                <CredencialFrente partera={selectedParteraQR} />
                                <CredencialReverso partera={selectedParteraQR} />
                            </div>

                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="cred-noprint w-full max-w-sm mx-auto py-3.5 bg-gradient-to-r from-[#9D2449] to-[#7A1B38] hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border border-white/40"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Imprimir / Descargar Credenciales Oficiales (Doble Cara)</span>
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default TabUsuariosParteras;