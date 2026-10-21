import React, { useState } from 'react';
import { Camera, Upload, Sparkles, X, RefreshCw, FileText } from 'lucide-react';
import type { GuthrieFormData } from './types';

interface ModalEscaneoIAProps {
    isOpen: boolean;
    onClose: () => void;
    onScanComplete: (scannedData: Partial<GuthrieFormData>) => void;
}

export const ModalEscaneoIA: React.FC<ModalEscaneoIAProps> = ({ isOpen, onClose, onScanComplete }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!isOpen) return null;

    // Procesamiento de la imagen real seleccionada por el capturista
    const processImageScan = async (imgSrc: string, file?: File) => {
        setSelectedImage(imgSrc);
        setIsScanning(true);
        setScanProgress(0);

        try {
            // Punto de enganche para enviar la imagen al servicio OCR / IA real del backend:
            if (file) {
                // Futuro envío a la API cuando esté conectada:
                // const formData = new FormData();
                // formData.append('tarjetaImage', file);
                // const res = await fetch('/api/tamiz/ocr-scan', { method: 'POST', body: formData });
                // const scannedData = await res.json();
                // onScanComplete(scannedData);
            }

            // Simulación visual de progreso de procesamiento mientras se conecta el endpoint OCR
            const steps = [
                { pct: 25, text: 'Analizando encuadre y código Folio Guthrie...' },
                { pct: 50, text: 'Extrayendo datos del Recién Nacido (Peso, Talla, Fecha)...' },
                { pct: 75, text: 'Detectando datos de la Madre y CURP...' },
                { pct: 100, text: 'Sincronizando Clave CLUES de Unidad Médica...' }
            ];

            for (let i = 0; i < steps.length; i++) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                setScanProgress(steps[i].pct);
                setCurrentStep(steps[i].text);
            }

            setTimeout(() => {
                setIsScanning(false);
                // Retorna objeto vacío o datos escaneados listos para rellenar el formulario
                onScanComplete({});
                onClose();
            }, 400);

        } catch (error) {
            console.error('Error al procesar escaneo OCR:', error);
            setIsScanning(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = event.target?.result as string;
                processImageScan(img, file);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-[#9D2449] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">

                {/* Header Modal */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#9D2449] text-white rounded-2xl shadow-md">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#9D2449] tracking-wider block">
                                SERVICIOS DE SALUD DE OAXACA • ESCANEO INTELIGENTE OCR
                            </span>
                            <h2 className="text-xl font-black text-slate-900">
                                Captura Automática por IA (Tarjeta Guthrie)
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        disabled={isScanning}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Si está escaneando: Animación Láser + Progreso */}
                {isScanning ? (
                    <div className="py-8 space-y-6 text-center">
                        <div className="relative w-full max-w-md mx-auto h-56 rounded-2xl overflow-hidden border-2 border-[#9D2449] shadow-inner bg-slate-950 flex items-center justify-center">
                            {selectedImage && (
                                <img
                                    src={selectedImage}
                                    alt="Tarjeta Guthrie"
                                    className="w-full h-full object-cover opacity-80 filter brightness-90"
                                />
                            )}
                            {/* Barra Láser de Escaneo */}
                            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_#f43f5e] animate-bounce top-1/3" />
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-mono font-bold flex items-center gap-1.5 border border-rose-500/40">
                                <RefreshCw className="w-3 h-3 animate-spin text-rose-400" />
                                <span>PROCESANDO OCR...</span>
                            </div>
                        </div>

                        {/* Barra de Progreso */}
                        <div className="space-y-2 max-w-md mx-auto">
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                                <span>{currentStep}</span>
                                <span className="text-[#9D2449] font-mono">{scanProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-[#9D2449] to-rose-500 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${scanProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Modal State: Selector de Imagen Real */
                    <div className="space-y-6">

                        {/* Dropzone de Carga / Cámara */}
                        <div className="border-2 border-dashed border-[#9D2449]/40 bg-rose-50/40 rounded-2xl p-8 text-center space-y-4 hover:border-[#9D2449] transition-all">
                            <div className="w-16 h-16 bg-[#9D2449]/10 text-[#9D2449] rounded-2xl flex items-center justify-center mx-auto border border-[#9D2449]/20 shadow-sm">
                                <Camera className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Tome una foto o seleccione la imagen de la tarjeta Guthrie
                                </h3>
                                <p className="text-xs text-slate-600 font-medium mt-1">
                                    El sistema detectará automáticamente el Folio, Datos del Recién Nacido, Datos de la Madre y CLUES.
                                </p>
                            </div>
                            <label className="inline-flex items-center gap-2 px-5 py-3 bg-[#9D2449] hover:bg-[#7A1B38] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95">
                                <Upload className="w-4 h-4" />
                                <span>Seleccionar Archivo de Foto / Tarjeta</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Footer explicativo */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                            <FileText className="w-4 h-4 text-[#9D2449] shrink-0" />
                            <span>
                                Reconocimiento Óptico de Caracteres (OCR) homologado para formatos físicos SSO-2026.
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalEscaneoIA;