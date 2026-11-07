import React, { useCallback, useEffect, useState } from 'react';
import { MotivoReferencia } from '../MotivoReferencia';

/* ============================================================================
 * FormatoReferencia — Envoltorio / Layout principal
 * Servicios de Salud de Oaxaca · Programa de Parteras Tradicionales
 *
 * Responsabilidades (solo presentación y voz de instrucciones):
 *  - Header único: Volver al menú (izq) · Título (centro) · Escuchar instrucciones (der)
 *  - Contenedor de una sola columna, glassmorphism claro, paleta del Istmo
 *  - Renderiza <MotivoReferencia /> (motor del formulario y conexión backend)
 *
 * Toda la lógica de formulario, dictado, Axios y envío vive en MotivoReferencia.
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
    'Llene los datos de la usuaria. Toque el micrófono de cada campo para dictar. Después toque los dibujos del motivo de la referencia y, al final, presione el botón de enviar.';

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

    /* Voz única para todo el formulario: usa la del padre o la del navegador (es-MX). */
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

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
                {/* ===================== Encabezado único ===================== */}
                <header className={`pt-slide-up overflow-hidden ${VIDRIO}`}>
                    <div className="h-2 w-full bg-gradient-to-r from-[#C2603A] via-[#D69A1E] to-[#5E8C61]" />
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 p-3 sm:gap-4 sm:p-5">
                        <button
                            type="button"
                            onClick={onBack}
                            aria-label="Volver al menú"
                            className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#D69A1E]/50 bg-amber-50 px-3 text-base font-black text-stone-900 shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] sm:px-5"
                        >
                            <IconoAtras />
                            <span className="hidden sm:inline">Volver al menú</span>
                        </button>

                        <div className="min-w-0 text-center">
                            <h1 className="text-lg font-black leading-tight text-stone-900 sm:text-2xl">
                                Hoja oficial de referencia
                            </h1>
                            <p className="hidden text-sm font-bold text-stone-700 sm:block">
                                Programa de Parteras Tradicionales · Servicios de Salud de Oaxaca
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => (isSpeaking ? detenerVoz() : hablar(INSTRUCCIONES))}
                            aria-label={isSpeaking ? 'Detener voz' : 'Escuchar instrucciones'}
                            className={`flex h-14 items-center justify-center gap-2 rounded-2xl px-3 text-base font-black sm:px-5 ${BOTON_TIERRA}`}
                        >
                            {isSpeaking ? <IconoBocinaApagada /> : <IconoBocina />}
                            <span className="hidden sm:inline">{isSpeaking ? 'Detener voz' : 'Escuchar instrucciones'}</span>
                        </button>
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