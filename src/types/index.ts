/**
 * Sistema Web de Gestión Operativa para Tamiz Neonatal y Parteras Tradicionales
 * Tipos principales del sistema
 */

export const UserRole = {
    ADMIN_JURISDICCIONAL: 'ADMIN_JURISDICCIONAL',
    CAPTURISTA_TAMIZ: 'CAPTURISTA_TAMIZ',
    GESTOR_PARTERAS: 'GESTOR_PARTERAS',
    PARTERA_TRADICIONAL: 'PARTERA_TRADICIONAL',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
    id: string;
    nombre: string;
    email?: string;
    telefono?: string;
    rol: UserRole;
    jurisdiccion: string;
    comunidad?: string;
    activo: boolean;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    rolActivo: UserRole | null;
    isLoading: boolean;
}

export interface RegistroTamiz {
    id: string;
    folio: string;
    nombreRecienNacido: string;
    fechaNacimiento: string;
    semanasGestacion: number;
    pesoGramos: number;
    nombreMadre: string;
    curpMadre?: string;
    telefonoContacto: string;
    jurisdiccion: string;
    unidadSaludId: string;
    capturistaId: string;
    fechaToma: string;
    estatus: 'PENDIENTE' | 'ENVIADO' | 'PROCESADO' | 'RECHAZADO';
}

export interface MuestraTamiz {
    id: string;
    registroTamizId: string;
    folioMuestra: string;
    numeroGotas: number;
    calidadMuestra: 'ADECUADA' | 'INSUFICIENTE' | 'CONTAMINADA' | 'COAGULADA';
    fechaEnvioLaboratorio: string;
    laboratorioDestino: string;
    codigoRastreo: string;
    estatusLaboratorio: 'RECEPCION' | 'EN_ANALISIS' | 'RESULTADO_DISPONIBLE' | 'MUESTRA_RECHAZADA';
}

export interface ResultadoTamiz {
    id: string;
    registroTamizId: string;
    folio: string;
    fechaResultado: string;
    tipoPrueba: 'TSH' | 'PKU' | '17-OHP' | 'GAL' | 'G6PD' | 'CF' | 'PANEL_COMPLETO';
    resultado: 'NORMAL' | 'SOSPECHOSO' | 'PATOLOGICO' | 'INCONCLUSO';
    observaciones: string;
    medicoAnalista: string;
    requiereReMuestra: boolean;
}

export interface ParteraTradicional {
    id: string;
    nombreCompleto: string;
    curp: string;
    telefono: string;
    lenguaMaterna: string;
    comunidad: string;
    municipio: string;
    jurisdiccion: string;
    certificadoVigente: boolean;
    experienciaAnos: number;
    totalAtenciones: number;
    estatusRegistro: 'ACTIVA' | 'INACTIVA' | 'EN_VALIDACION';
    fechaRegistro: string;
}

export interface ReferenciaComunitaria {
    id: string;
    parteraId: string;
    nombrePaciente: string;
    motivoReferencia: string;
    nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
    unidadDestino: string;
    fechaReferencia: string;
    estatus: 'EMITIDA' | 'RECIBIDA' | 'ATENDIDA' | 'CANCELADA';
    observaciones?: string;
}

export type EtapaAtencion = 'EMBARAZO' | 'PARTO' | 'MENOR_2_ANOS';

export interface CalendarioAtencion {
    id: string;
    parteraId: string;
    pacienteNombre: string;
    etapa: EtapaAtencion;
    fechaProgramada: string;
    descripcionAccion: string;
    completada: boolean;
    notasRiesgo?: string;
}

export interface NotificacionAlerta {
    id: string;
    titulo: string;
    mensaje: string;
    nivelAlerta: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
    fechaCreacion: string;
    leida: boolean;
    rolesDestino: UserRole[];
    entidadRelacionadaId?: string;
}
