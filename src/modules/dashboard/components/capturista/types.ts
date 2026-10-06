export interface UnidadCLUES {
    clues: string;
    nombre: string;
    jurisdiccion: string;
    estado: string;
}

export interface GuthrieFormData {
    // Sección A: Encabezado y Datos de la Muestra
    folio: string;
    unidadMedica: string;
    clues: string;
    jurisdiccion: string;
    estado: string;
    nombreResponsableToma: string;
    apellidoPaternoResponsableToma: string;
    apellidoMaternoResponsableToma: string;
    responsableToma: string; // Para compatibilidad
    tecnicaToma: '1A_MUESTRA' | '2A_PREMATUREZ' | '2A_INADECUADA' | '2A_SOSPECHOSO' | '1A_TALON' | '2A_TALON' | 'REMUESTRA_SOSPECHA';
    sospechosoEspecificar?: string;
    calidadMuestraLab: 'ADECUADA' | 'INADECUADA';
    responsableLaboratorio: string;

    // Sección B: Datos del Recién Nacido (RN)
    nombreRN: string;
    apellidoPaternoRN: string;
    apellidoMaternoRN: string;
    fechaNacimiento: string;
    horaNacimiento: string;
    fechaToma: string;
    horaToma: string;
    sexo: 'MASCULINO' | 'FEMENINO' | 'AMBIGUEDAD';
    edadGestacional: 'PRETERMINO_MENOR_37' | 'TERMINO_37_41' | 'POSTERMINO_MAYOR_42' | 'PRETERMINO' | 'TERMINO' | 'POSTERMINO';
    producto: 'UNICO' | 'GEMELAR' | 'GEMELAR_MULTIPLE';
    numeroGemelo?: string;
    pesoGramos: string;
    tallaCm: string;
    malformaciones: 'NO' | 'SI';
    malformacionesDetalle?: string;
    condicionesRN: 'SANO' | 'ENFERMO' | 'UCIN';
    alimentacion: 'LECHE_MATERNA' | 'FORMULA' | 'MIXTA' | 'AYUNO';

    // Sección C: Datos de la Madre o Tutora
    nombreMadre: string;
    apellidoPaternoMadre: string;
    apellidoMaternoMadre: string;
    curpMadre: string;
    calle: string;
    numExterior: string;
    numInterior: string;
    coloniaLocalidad: string;
    municipioMadre: string;
    estadoMadre: string;
    codigoPostalMadre: string;
    telefonoFijo: string;
    telefonoCelular: string;
    emailMadre: string;
    edadMadre: string;
    gestas: string;
    enfermedadTiroideaMetabolica: 'NO' | 'SI';
    enfermedadTiroideaDetalle?: string;
    observacionesMuestra?: string;
    calleNumero?: string; // Compatibilidad
}

export interface RegistroTamizHistorial {
    id: string;
    folio: string;
    rn: string;
    madre: string;
    curpMadre: string;
    fechaToma: string;
    municipio: string;
    unidadMedica: string;
    clues: string;
    tecnicaToma: string;
    estatus: 'PROCESADA_NORMAL' | 'EN_TRANSITO_LAB' | 'MUESTRA_COAGULADA' | 'MUESTRA_INSUFICIENTE' | 'RETOMA_SOLICITADA';
    prioridad: 'NORMAL' | 'ALTA' | 'CRITICA';
    motivoRecall?: string;
    telefonoContacto?: string;
}

export interface LoteEnvioLESP {
    id: string;
    numeroGuia: string;
    fechaSalida: string;
    transportista: string;
    cantidadMuestras: number;
    destino: string;
    estatus: 'EN_PREPARACION' | 'EN_TRANSITO_LESP' | 'ENTREGADO_LAB';
    foliosIncluidos: string[];
}
