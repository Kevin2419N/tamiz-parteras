export interface UnidadCLUES {
    clues: string;
    nombre: string;
    jurisdiccion: string;
    estado: string;
}

export interface GuthrieFormData {
    // Sección A: Encabezado de la Tarjeta
    folio: string;
    unidadMedica: string;
    clues: string;
    jurisdiccion: string;
    estado: string;

    // Sección B: Datos Muestra / Responsable
    responsableToma: string;
    tecnicaToma: '1A_TALON' | '2A_TALON' | 'REMUESTRA_SOSPECHA';

    // Sección C: Datos del Recién Nacido
    fechaNacimiento: string;
    horaNacimiento: string;
    fechaToma: string;
    horaToma: string;
    sexo: 'MASCULINO' | 'FEMENINO' | 'AMBIGUEDAD';
    edadGestacional: 'PRETERMINO' | 'TERMINO' | 'POSTERMINO';
    producto: 'UNICO' | 'GEMELAR_MULTIPLE';
    pesoGramos: string;
    tallaCm: string;
    malformaciones: 'NO' | 'SI';
    malformacionesDetalle?: string;
    condicionesRN: 'SANO' | 'ENFERMO' | 'UCIN';
    alimentacion: 'LACTANCIA_MATERNA' | 'FORMULA' | 'MIXTA' | 'AYUNO';

    // Sección D: Datos de la Madre
    nombreMadre: string;
    apellidoPaternoMadre: string;
    apellidoMaternoMadre: string;
    curpMadre: string;
    calleNumero: string;
    coloniaLocalidad: string;
    municipioMadre: string;
    codigoPostalMadre: string;
    telefonoCelular: string;
    edadMadre: string;
    gestas: string;
    enfermedadTiroideaMetabolica: 'NO' | 'SI';
    enfermedadTiroideaDetalle?: string;
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
