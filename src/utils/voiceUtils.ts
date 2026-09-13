/**
 * Manejador universal de reconocimiento de voz utilizando Web Speech API.
 * Compatible con Google Chrome, Android Chrome, Edge y Safari iOS.
 */
export const handleVoiceInput = (
    setFieldState: (val: string) => void,
    setIsListening: (listening: boolean) => void
) => {
    const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Tu navegador no soporta reconocimiento de voz. Intenta usar Google Chrome o Safari.");
        return;
    }

    try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.continuous = false;
        recognition.interimResults = false;

        setIsListening(true);

        recognition.onstart = () => {
            console.log("Micrófono activado...");
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
                // Actualiza el estado del input correspondiente
                setFieldState(transcript);
            }
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Error en SpeechRecognition:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    } catch (error) {
        console.error("Error al iniciar micrófono:", error);
        setIsListening(false);
    }
};
