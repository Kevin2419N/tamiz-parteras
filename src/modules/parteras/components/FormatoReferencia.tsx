import React from 'react';
import { MotivoReferencia } from '../MotivoReferencia';

interface FormatoReferenciaProps {
    onBack: () => void;
    onSuccess: () => void;
    hablarTexto: (texto: string) => void;
    isListening: boolean;
    campoEscuchando: string | null;
    iniciarDictado: (campo: string) => void;
}

export const FormatoReferencia: React.FC<FormatoReferenciaProps> = ({
    onBack,
    onSuccess,
    hablarTexto,
    isListening,
    campoEscuchando,
    iniciarDictado
}) => {
    return (
        <MotivoReferencia
            onBack={onBack}
            onSuccess={onSuccess}
            hablarTexto={hablarTexto}
            isListeningExternal={isListening}
            campoEscuchandoExternal={campoEscuchando}
            iniciarDictadoExternal={iniciarDictado}
        />
    );
};
