export interface UnidadCLUES {
    id: string;
    nombre: string;
    clues: string; // 11 caracteres (ej. OASSA000451)
    municipio: string;
    tipoUnidad: 'Centro de Salud' | 'CESSA' | 'Hospital General' | 'Hospital Comunitario';
    estatus: 'ACTIVO' | 'INACTIVO';
}

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

export interface RegistroMujer {
    id: string;
    folio: string;
    nombreMujer: string;
    partera: string;
    municipio: string;
    semanaGestacion: number;
    nutricionMUAC: 'VERDE' | 'AMARILLO' | 'ROJO';
    controlesRealizados: number;
    alertas: string;
}

export interface RegistroNino {
    id: string;
    folio: string;
    nombreNino: string;
    nombreMadre: string;
    partera: string;
    municipio: string;
    edadMeses: number;
    tamizTomado: boolean;
    vacunasCompletas: boolean;
    alertas: string;
}

export interface UsuarioSSO {
    id: string;
    nombre: string;
    curp?: string;
    email: string;
    telefono?: string;
    rol: 'ADMIN_JURISDICCIONAL' | 'CAPTURISTA_TAMIZ' | 'GESTOR_PARTERAS' | 'MEDICO_UNIDAD' | 'SUPERVISOR_ZONA';
    unidadAsignada: string;
    clues?: string;
    pinTemporal?: string;
    estatus: 'ACTIVO' | 'INACTIVO';
}

export interface ParteraCredencial {
    id: string;
    nombreCompleto: string;
    curp: string;
    lenguaMaterna?: string;
    telefonoRecaudo?: string;
    municipio: string;
    comunidad: string;
    centroSaludAdscripcion?: string;
    cluesAdscripcion?: string;
    pinCuatroDigitos: string;
    estatusAcreditacion: 'ACREDITADA' | 'EN_REVISION' | 'INACTIVA';
    fechaAcreditacion: string;
}

export interface LogSistema {
    id: string;
    fechaHora: string;
    usuario: string;
    accion: string;
    modulo: string;
    ip: string;
}

