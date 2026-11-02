import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Plus, X, ShieldCheck, MapPin, Languages, Key, QrCode, UserCheck, Printer, CheckCircle2, Loader2, AlertCircle, User, Sparkles, Phone as PhoneIcon, Shield } from 'lucide-react';
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

const obtenerNombreCompleto = (p: ParteraCredencial): string => {
    if (p.nombreCompleto && p.nombreCompleto.trim().length > 3) {
        return p.nombreCompleto;
    }
    const partes = [
        (p as any).nombre ?? (p as any).nombres,
        (p as any).apellidoPaterno ?? (p as any).primerApellido ?? (p as any).apellido_paterno,
        (p as any).apellidoMaterno ?? (p as any).segundoApellido ?? (p as any).apellido_materno
    ].filter(Boolean);
    if (partes.length > 0) {
        return partes.join(' ');
    }
    return 'Partera Acreditada';
};

/* ============================================================================
 * COMPONENTES DE LA CREDENCIAL (FORMATO ID-1 / PVC · 324 x 514 px)
 * ========================================================================== */

/** Lee la lengua materna sin importar cómo la entregue el backend. */
const obtenerLengua = (p: ParteraCredencial): string => {
    const q = p as any;
    const valor =
        p.lenguaMaterna ?? q.lengua_materna ?? q.lengua ?? q.idioma ?? q.lenguaIndigena ?? '';
    return String(valor).trim();
};

const GUINDA = '#5C1228';
const GUINDA_CLARO = '#7A1B38';

const AcabadoPVC: React.FC = () => (
    <>
        <div
            className="cred-hole mx-auto mt-2 h-2 w-12 rounded-full bg-slate-200 shrink-0 relative z-20"
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

/**
 * Fondo común: gradiente marfil + cenefa floral a sangre completa + marca de agua.
 * `simetrico` replica la mitad izquierda de la plantilla en espejo a la derecha,
 * garantizando simetría perfecta (se usa en el reverso).
 */
const FONDO_REVERSO = '/plantilla-reverso.png'; // cambia a '/plantilla-frente.png' si prefieres la misma cenefa

const FondoCredencial: React.FC<{ src: string; alt: string; simetrico?: boolean; escala?: number }> = ({
    src, alt, simetrico = false, escala = 1
}) => {
    const img = (
        <img
            src={src}
            alt={alt}
            draggable={false}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            className="h-full w-full object-cover object-bottom pointer-events-none select-none"
            style={{ transform: `scale(${escala})`, transformOrigin: 'bottom center' }}
        />
    );
    return (
        <>
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-white via-amber-50/20 to-rose-50/30" />

            {simetrico ? (
                <>
                    <div className="absolute inset-0 z-[1]" style={{ clipPath: 'inset(0 50% 0 0)' }}>{img}</div>
                    <div className="absolute inset-0 z-[1]" style={{ clipPath: 'inset(0 50% 0 0)', transform: 'scaleX(-1)' }}>{img}</div>
                </>
            ) : (
                <div className="absolute inset-0 z-[1]">{img}</div>
            )}

            {/* Marca de agua geométrica (greca escalonada) al 3% — se desvanece hacia las flores */}
            <div
                aria-hidden
                className="absolute inset-0 z-[2] pointer-events-none"
                style={{
                    opacity: 0.03,
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Cpath d='M3 22h8v-8h8v8h8v-8h8' fill='none' stroke='%235C1228' stroke-width='1.6'/%3E%3C/svg%3E\")",
                    backgroundSize: '36px 36px',
                    WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 50%, transparent 78%)',
                    maskImage: 'linear-gradient(to bottom, #000 0%, #000 50%, transparent 78%)'
                }}
            />
        </>
    );
};

/** Barra guinda institucional con textura de seguridad y marco dorado. */
const BarraGuinda: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
    <div
        className={`relative overflow-hidden rounded-xl border border-amber-400/90 text-center ${className}`}
        style={{
            backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 6px), linear-gradient(135deg, ${GUINDA} 0%, ${GUINDA_CLARO} 100%)`,
            boxShadow: '0 8px 16px -4px rgba(92,18,40,0.6), 0 2px 4px rgba(92,18,40,0.4), inset 0 1px 0 rgba(255,255,255,0.12)'
        }}
    >
        <div className="pointer-events-none absolute inset-[2px] rounded-[9px] border border-amber-300/30" />
        <div className="relative">{children}</div>
    </div>
);

const AVATAR_DEFAULT = '/avatar-partera-default.png';

/** Foto propia (fotoUrl) → ilustración oficial por defecto → iniciales si ninguna carga. */
const AvatarPartera: React.FC<{ fotoUrl?: string; nombre: string }> = ({ fotoUrl, nombre }) => {
    const [src, setSrc] = useState<string | null>(fotoUrl || AVATAR_DEFAULT);

    useEffect(() => {
        setSrc(fotoUrl || AVATAR_DEFAULT);
    }, [fotoUrl]);

    const alFallar = () => setSrc((actual) => (actual && actual !== AVATAR_DEFAULT ? AVATAR_DEFAULT : null));

    return (
        <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[2.5px] border-amber-400 bg-white text-[21px] font-black tracking-wide text-[#5C1228] shadow-lg ring-4 ring-rose-950/10">
            {src ? (
                <img
                    src={src}
                    alt={nombre}
                    draggable={false}
                    onError={alFallar}
                    className="h-full w-full object-cover"
                />
            ) : (
                getInitials(nombre)
            )}
        </div>
    );
};

const CredencialFrente: React.FC<{ partera: ParteraCredencial }> = ({ partera }) => {
    const nombre = obtenerNombreCompleto(partera);
    const ubicacion = [partera.municipio || 'Juchitán de Zaragoza', partera.comunidad || 'Quinta Sección']
        .filter(Boolean)
        .join(' • ');
    const tamanoNombre = nombre.length > 32 ? 'text-[12px]' : nombre.length > 22 ? 'text-[14px]' : 'text-[17px]';
    const fotoUrl = (partera as any).fotoUrl;
    const lengua = obtenerLengua(partera);

    return (
        <div className="cred-slot">
            <div className="cred-card relative flex flex-col overflow-hidden rounded-3xl border border-slate-300 bg-white text-slate-900 shadow-2xl shadow-black/60">
                <FondoCredencial src="/plantilla-frente.png" alt="Plantilla Frente" />
                <AcabadoPVC />

                <div className="relative z-10 flex flex-1 flex-col px-4 pt-1.5 pb-[112px]">

                    {/* Logos institucionales */}
                    <div className="rounded-2xl bg-white/90 px-2.5 py-1.5 shadow-sm ring-1 ring-amber-200/60">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                            <div className="flex h-10 items-center justify-center gap-1.5">
                                <img
                                    src="/logo-jurisdiccion.png"
                                    alt="Jurisdicción Sanitaria"
                                    className="h-9 w-9 shrink-0 object-contain"
                                />
                                <div className="text-left font-extrabold leading-[1.1] tracking-tight" style={{ color: GUINDA }}>
                                    <span className="block text-[8.5px]">Jurisdicción Sanitaria</span>
                                    <span className="block text-[8.5px]">No. 2 • Istmo</span>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
                            <div className="flex h-10 items-center justify-center">
                                <img
                                    src="/Logo-Secretaria.png"
                                    alt="Medicina Tradicional"
                                    className="h-full w-auto max-w-full object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Barra guinda institucional */}
                    <BarraGuinda className="mt-2 px-2 py-2">
                        <span className="block text-[9.5px] font-black uppercase leading-tight tracking-[0.07em] text-white">
                            CREDENCIAL DE ACREDITACIÓN OFICIAL
                        </span>
                        <span className="mt-0.5 block text-[7.5px] font-bold leading-tight tracking-wider text-amber-200">
                            Medicina Tradicional e Interculturalidad
                        </span>
                    </BarraGuinda>

                    {/* Identidad */}
                    <div className="flex flex-1 flex-col items-center justify-evenly text-center">

                        <AvatarPartera fotoUrl={fotoUrl} nombre={nombre} />

                        <div className="w-full px-1">
                            <h4 className={`${tamanoNombre} font-black leading-[1.1] text-slate-900 break-words`}>
                                {nombre}
                            </h4>
                            <p className="mt-1 text-[8px] font-extrabold uppercase tracking-wider text-rose-900">
                                Partera Tradicional Acreditada
                            </p>
                        </div>

                        <div className="inline-flex max-w-full items-center gap-1 rounded-lg border border-slate-300 bg-white/80 px-2.5 py-0.5 shadow-sm">
                            <span className="text-[7px] font-black tracking-widest text-rose-900">CURP:</span>
                            <span className="break-all font-mono text-[9.5px] font-black tracking-wider text-slate-900">
                                {partera.curp || 'No registrada'}
                            </span>
                        </div>

                        <div className="flex max-w-full items-center justify-center gap-1 text-[#9D2449]">
                            <MapPin className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                            <span className="text-[9px] font-extrabold leading-tight">{ubicacion}</span>
                        </div>

                        {lengua && (
                            <div className="mx-auto inline-flex max-w-full items-center justify-center gap-1.5 rounded-full border border-amber-400/70 bg-gradient-to-r from-amber-100/80 via-yellow-50 to-amber-100/80 px-3 py-0.5 shadow-sm">
                                <Languages className="h-3 w-3 shrink-0 text-amber-700" strokeWidth={2.5} />
                                <span className="text-[8px] font-bold text-slate-700">Lengua:</span>
                                <strong className="text-[9.5px] font-black tracking-wide text-amber-800">{lengua}</strong>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/** Franja de Certificación Digital (reverso): guinda oscuro, acentos dorados, código de barras sutil. */
const FranjaCertificacion: React.FC = () => (
    <div
        className="relative z-10 flex shrink-0 items-center gap-2.5 px-4 py-2.5"
        style={{
            backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 6px), linear-gradient(180deg, ${GUINDA} 0%, #4E0F22 100%)`,
            borderTop: '1.5px solid rgba(251,191,36,0.9)',
            boxShadow: '0 -6px 14px -4px rgba(92,18,40,0.45), inset 0 1px 0 rgba(253,230,138,0.35)'
        }}
    >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-400/90 bg-black/15">
            <ShieldCheck className="h-4 w-4 text-amber-300" strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1 text-center leading-tight">
            <span className="block text-[7px] font-black uppercase tracking-[0.14em] text-amber-200">
                Registro Oficial Intercultural
            </span>
            <span className="mt-0.5 block text-[6.5px] font-bold uppercase tracking-[0.12em] text-white/90">
                <span className="text-amber-300">•</span> Jurisdicción Sanitaria No. 2 <span className="text-amber-300">•</span>
            </span>
        </div>

        {/* Código de barras decorativo */}
        <div
            aria-hidden
            className="h-6 w-8 shrink-0 rounded-[2px] opacity-70"
            style={{
                backgroundImage:
                    'repeating-linear-gradient(90deg, #FCD34D 0 1px, transparent 1px 2px, #FCD34D 2px 4px, transparent 4px 5px, #FCD34D 5px 6px, transparent 6px 8px)'
            }}
        />
    </div>
);

const CredencialReverso: React.FC<{ partera: ParteraCredencial }> = ({ partera }) => {
    const pin = obtenerPin(partera);

    return (
        <div className="cred-slot">
            <div className="cred-card relative flex flex-col overflow-hidden rounded-3xl border border-slate-300 bg-white text-slate-900 shadow-2xl shadow-black/60">
                <FondoCredencial src={FONDO_REVERSO} alt="Plantilla Reverso" simetrico escala={1.08} />
                <AcabadoPVC />

                <div className="relative z-10 flex flex-1 flex-col px-4 pt-1.5 pb-3">

                    {/* 1. PIN táctil */}
                    <div className="rounded-xl border border-amber-400 bg-gradient-to-b from-amber-50 to-amber-100 px-3 py-1.5 text-center shadow-sm">
                        <div className="flex items-center justify-center gap-1.5">
                            <Key className="h-3.5 w-3.5 text-amber-700" strokeWidth={2.5} />
                            <span className="text-[8.5px] font-black uppercase tracking-wider text-amber-950">
                                PIN TÁCTIL DE ACCESO: {pin}
                            </span>
                        </div>
                    </div>

                    {/* Bloque central: se reparte el espacio para evitar vacíos */}
                    <div className="flex flex-1 flex-col items-center justify-evenly px-5">

                        {/* 2. QR */}
                        <div className="rounded-2xl border border-amber-400/70 bg-white p-2 text-center shadow-lg shadow-slate-900/10 ring-1 ring-amber-200/60 ring-offset-2 ring-offset-white/70">
                            <div className="inline-block rounded-xl border border-slate-200 bg-white p-1.5">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&ecc=M&data=${encodeURIComponent(pin)}`}
                                    alt="Código QR de acceso rápido"
                                    className="block h-[92px] w-[92px] object-contain"
                                />
                            </div>
                            <span className="mt-1.5 block text-center font-mono text-[7px] font-extrabold uppercase tracking-widest text-slate-700">
                                ESCANEAR PARA LOGIN
                            </span>
                        </div>

                        {/* 3. Insignias */}
                        <div className="w-full rounded-xl border border-rose-900/20 bg-white/80 px-2 py-1.5 text-center shadow-sm">
                            <div className="flex items-center justify-center gap-1" style={{ color: GUINDA }}>
                                <Shield className="h-3 w-3" strokeWidth={2.5} />
                                <span className="text-[8px] font-black uppercase tracking-tight">
                                    Red de Salud Materna e Intercultural
                                </span>
                            </div>
                            <p className="mt-0.5 text-[7px] font-medium leading-tight text-slate-600">
                                Jurisdicción Sanitaria No. 2 • Istmo de Tehuantepec, Oaxaca.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-50 px-3 py-0.5 text-[8.5px] font-extrabold text-emerald-900 shadow-sm">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Credencial Oficial Verificada • SSO</span>
                        </div>
                    </div>
                </div>

                <FranjaCertificacion />
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
                :root { --cred-w: 324px; --cred-h: 514px; --cred-print-scale: 0.6296; /* 54mm ÷ 324px a 96dpi */ }
                #printable-credentials { --cred-scale: 1; }
                @media (max-width: 420px) {
                    #printable-credentials { --cred-scale: 0.82; }
                }
                .cred-slot {
                    width: calc(var(--cred-w) * var(--cred-scale, 1));
                    height: calc(var(--cred-h) * var(--cred-scale, 1));
                    flex-shrink: 0;
                }
                .cred-card {
                    width: var(--cred-w);
                    height: var(--cred-h);
                    transform: scale(var(--cred-scale, 1));
                    transform-origin: top left;
                    isolation: isolate;
                }
                #printable-credentials, #printable-credentials * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    forced-color-adjust: none;
                }

                /* ===== Impresión / PDF ===== */
                @page credenciales { size: A4 portrait; margin: 10mm; }

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
                        --cred-scale: var(--cred-print-scale);
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
                    .cred-slot { width: 54mm !important; height: 85.6mm !important; overflow: hidden; }
                    .cred-card {
                        box-shadow: none !important;
                        border: 0.1mm solid #cbd5e1 !important;
                        border-radius: 3mm !important;
                        -webkit-font-smoothing: antialiased;
                        text-rendering: geometricPrecision;
                    }
                    /* Fondos, gradientes, bordes dorados e imágenes a color pleno */
                    .cred-card, .cred-card * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        filter: none !important;
                    }
                    .cred-card img { image-rendering: -webkit-optimize-contrast; }
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
                    parteras.map((p) => {
                        const nombrePartera = obtenerNombreCompleto(p);
                        return (
                            <div key={p.id || p.curp} className="p-4 bg-slate-900/50 rounded-2xl border border-white/20 shadow-lg backdrop-blur-xl space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9D2449] to-[#7A1B38] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                                            {getInitials(nombrePartera)}
                                        </div>
                                        <div>
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-block mb-1">
                                                {p.estatusAcreditacion || 'ACREDITADA'}
                                            </span>
                                            <h3 className="text-xs font-black text-white leading-tight">
                                                {nombrePartera}
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
                                            <span>Lengua: <strong className="text-amber-300">{p.lenguaMaterna}</strong></span>
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
                        );
                    })
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
                            parteras.map((p) => {
                                const nombrePartera = obtenerNombreCompleto(p);
                                return (
                                    <tr key={p.id || p.curp} className="hover:bg-white/10 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9D2449] to-[#7A1B38] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                                                    {getInitials(nombrePartera)}
                                                </div>
                                                <div>
                                                    <div className="font-black text-white text-xs">
                                                        {nombrePartera}
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
                                );
                            })
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
                                Se ha completado el alta oficial de <strong className="text-white">{obtenerNombreCompleto(successModalData)}</strong> en el sistema de la Jurisdicción Sanitaria No. 2.
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