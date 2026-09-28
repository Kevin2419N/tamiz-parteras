export interface MuestraGuthrie {
    id: string;
    folio: string;
    nombreRecienNacido: string;
    nombreMadre: string;
    fechaToma: string;
    unidadMedica: string;
    municipio: string;
    numeroGotas: number;
    estatus: 'REGISTRADO' | 'EN_TRANSITO' | 'NORMAL' | 'SOSPECHOSO';
    observaciones?: string;
}

export interface ReferenciaFormato1 {
    id: string;
    folio: string;
    nombrePaciente: string;
    edad: number;
    parteraNombre: string;
    motivoReferencia: string;
    unidadDestino: string;
    municipio: string;
    fechaReferencia: string;
    estatus: 'PENDIENTE' | 'CONTRAREFERIDO';
    respuestaContrareferencia?: string;
}

export interface UsuarioSSO {
    id: string;
    nombre: string;
    email: string;
    rol: 'ADMIN_JURISDICCIONAL' | 'CAPTURISTA_TAMIZ' | 'GESTOR_PARTERAS' | 'MEDICO_UNIDAD';
    unidadAsignada: string;
    estatus: 'ACTIVO' | 'INACTIVO';
}

export interface ParteraCredencial {
    id: string;
    nombreCompleto: string;
    curp: string;
    municipio: string;
    comunidad: string;
    pinCuatroDigitos: string;
    estatusAcreditacion: 'ACREDITADA' | 'EN_REVISION' | 'INACTIVA';
    fechaAcreditacion: string;
}
