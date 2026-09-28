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
    motivoPrincipal: string;
    comunidad: string;
    municipio: string;
    fecha: string;
    nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
    estatus: 'PENDIENTE' | 'CONTRAREFERIDO';
    diagnosticoMedico?: string;
    tratamiento?: string;
    medicoResponsable?: string;
    centroSaludRespuesta?: string;
}

export interface UsuarioSSO {
    id: string;
    nombre: string;
    email: string;
    rol: 'ADMIN_JURISDICCIONAL' | 'CAPTURISTA_TAMIZ' | 'GESTOR_PARTERAS' | 'MEDICO_UNIDAD';
    unidadSalud: string;
    activo: boolean;
}

export interface ParteraCredencial {
    id: string;
    nombreCompleto: string;
    nombreZapoteco?: string;
    curp: string;
    comunidad: string;
    municipio: string;
    jurisdiccion: string;
    experienciaAnos: number;
    pinAcceso: string;
    certificadoVigente: boolean;
    estatus: 'ACTIVA' | 'INACTIVA';
    fechaExpedicion: string;
    fotoUrl?: string;
}
