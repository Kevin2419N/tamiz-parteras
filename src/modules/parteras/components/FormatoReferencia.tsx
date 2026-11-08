import React, { useCallback, useEffect, useState } from 'react';
import { MotivoReferencia } from '../MotivoReferencia';

/* ============================================================================
 * FormatoReferencia — Envoltorio / Layout principal
 * Servicios de Salud de Oaxaca · Programa de Parteras Tradicionales
 *
 * Responsabilidades (presentación y cabecera simétrica global):
 *  - Header simétrico: Volver al menú (izq) · Título (centro exacto) · Escuchar instrucciones (der)
 *  - Contenedor de una sola columna, glassmorphism claro, paleta del Istmo
 *  - Renderiza <MotivoReferencia /> (motor del formulario y conexión backend en Render)
 * ========================================================================== */

interface FormatoReferenciaProps {
    onBack: () => void;
    onSuccess: () => void;
    hablarTexto?: (texto: string) => void;
    isListening?: boolean;
    campoEscuchando?: string | null;
    iniciarDictado?: (campo: string, setFieldState?: (val: string) => void) => void;
}

const INSTRUCCIONES =
    'Hoja oficial de referencia comunitaria. Llene los datos de la usuaria utilizando el dictado por voz, seleccione los motivos y envíe la información al centro de salud.';

const ESTILOS_LAYOUT = `
@keyframes pt-slide-up { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
.pt-slide-up { animation: pt-slide-up .55s cubic-bezier(.22,1,.36,1) both }
@media (prefers-reduced-motion: reduce) { .pt-slide-up { animation: none !important } }
`;

const VIDRIO =
    'bg-white/85 backdrop-blur-md border border-white/70 shadow-2xl shadow-orange-900/10 rounded-3xl';

const BOTON_TIERRA =
    'bg-gradient-to-br from-[#D69A1E] via-[#CC7A2C] to-[#C2603A] text-white shadow-lg shadow-orange-900/30 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]';

/* ------------------------------ Iconos SVG -------------------------------- */

interface IconoProps {
    className?: string;
}

const IconoAtras: React.FC<IconoProps> = ({ className = 'h-6 w-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m15 5-7 7 7 7" />
    </svg>
);
const IconoBocina: React.FC<IconoProps> = ({ className = 'h-6 w-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
);
const IconoBocinaApagada: React.FC<IconoProps> = ({ className = 'h-6 w-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        <path d="m22 9-6 6" />
        <path d="m16 9 6 6" />
    </svg>
);

/* ------------------------------ Componente -------------------------------- */

export const FormatoReferencia: React.FC<FormatoReferenciaProps> = ({
    onBack,
    onSuccess,
    hablarTexto,
    isListening = false,
    campoEscuchando = null,
    iniciarDictado,
}) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    /* Voz única para la cabecera global */
    const hablar = useCallback(
        (texto: string) => {
            if (hablarTexto) {
                hablarTexto(texto);
                return;
            }
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(texto);
            u.lang = 'es-MX';
            u.rate = 0.9;
            u.onstart = () => setIsSpeaking(true);
            u.onend = () => setIsSpeaking(false);
            u.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(u);
        },
        [hablarTexto]
    );

    const detenerVoz = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
        };
    }, []);

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden px-3 py-4 sm:px-6 sm:py-8">
            <style>{ESTILOS_LAYOUT}</style>

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                {/* ===================== Encabezado Simétrico Global ===================== */}
                <header className={`pt-slide-up overflow-hidden ${VIDRIO}`}>
                    <div className="h-2.5 w-full bg-gradient-to-r from-[#C2603A] via-[#D69A1E] to-[#5E8C61]" />
                    
                    {/* Grid simétrica de 3 columnas para asegurar centrado perfecto */}
                    <div className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-[1fr_auto_1fr] sm:p-6">
                        {/* Columna Izquierda: Botón Volver */}
                        <div className="flex justify-start">
                            <button
                                type="button"
                                onClick={onBack}
                                aria-label="Volver al menú"
                                className="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border-2 border-[#D69A1E]/50 bg-amber-50 px-5 text-base font-black text-stone-900 shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                <IconoAtras />
                                <span>Volver al menú</span>
                            </button>
                        </div>

                        {/* Columna Centro: Título Oficial */}
                        <div className="min-w-0 text-center px-2">
                            <h1 className="text-xl font-black leading-tight text-stone-900 sm:text-2xl uppercase tracking-tight">
                                Hoja oficial de referencia
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm font-bold text-stone-700">
                                Programa de Parteras Tradicionales · Servicios de Salud de Oaxaca
                            </p>
                        </div>

                        {/* Columna Derecha: Botón Escuchar Instrucciones */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => (isSpeaking ? detenerVoz() : hablar(INSTRUCCIONES))}
                                aria-label={isSpeaking ? 'Detener voz' : 'Escuchar instrucciones'}
                                className={`flex h-14 w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl px-5 text-base font-black ${BOTON_TIERRA}`}
                            >
                                {isSpeaking ? <IconoBocinaApagada /> : <IconoBocina />}
                                <span>{isSpeaking ? 'Detener voz' : 'Escuchar instrucciones'}</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* ===================== Motor del formulario ================= */}
                <MotivoReferencia
                    onBack={onBack}
                    onSuccess={onSuccess}
                    hablarTexto={hablar}
                    isListeningExternal={isListening}
                    campoEscuchandoExternal={campoEscuchando}
                    iniciarDictadoExternal={iniciarDictado}
                />
            </div>
        </div>
    );
};

export default FormatoReferencia;