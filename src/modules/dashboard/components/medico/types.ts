/**
 * Tipos para el módulo del Médico de Unidad / Contrareferencias
 * Jurisdicción Sanitaria No. 2 – Istmo • SSO Oaxaca
 */

// ──────────────────────────────────────────
// PESTAÑA 1 – CASOS PRIORITARIOS / RECALL
// ──────────────────────────────────────────

export type EstatusResultado =
    | 'MUESTRA_INADECUADA'
    | 'RESULTADO_SOSPECHOSO'
    | 'RETOMA_REQUERIDA'
    | 'MUESTRA_VENOSA_PENDIENTE'
    | 'EN_CONFIRMACION'
    | 'CONFIRMADO_POSITIVO'
    | 'NORMAL';

export type TipoPrueba = 'TSH' | 'PKU' | '17-OHP' | 'GAL' | 'G6PD' | 'CF' | 'PANEL_COMPLETO';

export interface CasoPrioritario {
    id: string;
    folio: string;
    nombreRN: string;
    nombreMadre: string;
    clues: string;
    unidadMedica: string;
    municipio: string;
    fechaToma: string;
    tipoPrueba: TipoPrueba;
    estatusResultado: EstatusResultado;
    valorObtenido?: string;
    valorReferencia?: string;
    observaciones?: string;
    telefonoContacto?: string;
    tratamientoIniciado?: boolean;
    fechaConfirmacion?: string;
}

export interface RegistroSegundaMuestra {
    casoId: string;
    tipoMuestra: 'TALON_RETOMA' | 'VENOSA_CONFIRMATORIA';
    fechaObtension: string;
    fechaEnvio: string;
    laboratorioDestino: string;
    resultadoConfirmatorio?: string;
    tratamientoIndicado?: string;
    observacionesMedico: string;
}

// ──────────────────────────────────────────
// PESTAÑA 2 – EXPEDIENTE / CARNÉ PERINATAL
// ──────────────────────────────────────────

export interface AntecedentesPersonales {
    diabetes: boolean;
    hipertension: boolean;
    cardiopatia: boolean;
    nefropatia: boolean;
    epilepsia: boolean;
    enfermadadesTiroideas: boolean;
    otros: string;
}

export interface AntecedentesFamiliares {
    diabetesFamiliar: boolean;
    hipertensionFamiliar: boolean;
    gemelaridadFamiliar: boolean;
    malformacionesFamiliar: boolean;
    otros: string;
}

export interface AntecedentesObstetricos {
    gestasAnteriores: number;
    paritosAnteriores: number;
    cesareasAnteriores: number;
    abortosAnteriores: number;
    mortinatos: number;
    rpMenorA2500g: number;
}

export interface ConsultaAntenatal {
    id: string;
    numeroConsulta: number;
    fecha: string;
    edadGestacional: number; // semanas
    pesoMadreKg: number;
    tallaMadreM: number;
    imcCalculado: number;
    presionArterialSistolica: number;
    presionArterialDiastolica: number;
    alturaUterinaFr: number; // cm (Fouchard)
    frecuenciaCardiacaFetal: number; // lpm
    presentacion: string;
    edema: 'NO' | '+' | '++' | '+++';
    observaciones: string;
    medicoFirma: string;
}

export type RiesgoARO = 'BAJO' | 'MEDIO' | 'ALTO';

export interface ExpedientePerinatal {
    id: string;
    // Datos Generales Paciente
    nombrePaciente: string;
    curp: string;
    fechaNacimiento: string;
    edad: number;
    escolaridad: string;
    ocupacion: string;
    domicilio: string;
    municipio: string;
    comunidad: string;
    telefono: string;
    // Gestación Actual
    fumFecha: string; // FUM
    edadGestacionalInicioControl: number;
    fppFecha: string; // FPP
    grupoSanguineo: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    factorRh: 'POSITIVO' | 'NEGATIVO';
    vihSerologia: 'NEGATIVO' | 'POSITIVO' | 'PENDIENTE' | 'NO_REALIZADO';
    vdrlSerologia: ' NON_REACTIVE' | 'REACTIVE' | 'PENDIENTE' | 'NO_REALIZADO';
    vacunaTetanos: boolean;
    vacunaDosis2: boolean;
    // Antecedentes
    antecedentesFamiliares: AntecedentesFamiliares;
    antecedentesPersonales: AntecedentesPersonales;
    antecedentesObstetricos: AntecedentesObstetricos;
    // Consultas antenatales
    consultas: ConsultaAntenatal[];
    // ARO
    riesgoARO: RiesgoARO;
    criteriosARO: string[];
    // Parto / RN
    fechaParto?: string;
    tipoPartoParto?: 'EUTOCICO' | 'DISTOCICO' | 'CESAREA';
    semanasParto?: number;
    apgar1?: number;
    apgar5?: number;
    pesoRNGramos?: number;
    tallaRNCm?: number;
    perimetroCefalicoRNCm?: number;
    tamizRNRealizado?: boolean;
    folioGuthrie?: string;
}

// ──────────────────────────────────────────
// PESTAÑA 3 – CONTRAREFERENCIAS
// ──────────────────────────────────────────

export type EstatusContraRef = 'PENDIENTE_ATENCION' | 'EN_VALORACION' | 'ATENDIDA' | 'DERIVADA_HOSPITAL';

export interface ReferenciaComunidad {
    id: string;
    folioReferencia: string;
    nombrePartera: string;
    comunidadOrigen: string;
    municipio: string;
    nombrePaciente: string;
    edadPaciente: number;
    motivoReferencia: string;
    nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
    fechaReferencia: string;
    fechaRecepcion?: string;
    estatusContraRef: EstatusContraRef;
    diagnosticoMedico?: string;
    planManejo?: string;
    folioContraRef?: string;
    medicoResponsable?: string;
}

export interface FormularioContraRef {
    referenciaId: string;
    folioContraRef: string;
    fechaAtencion: string;
    diagnosticoImpresion: string;
    hallazgosClinica: string;
    planManejo: string;
    medicamentosIndicados: string;
    proximaCita: string;
    derivadaA?: string;
    nivelDerivacion?: 'CSU' | 'HOSPITAL_GENERAL' | 'ESPECIALIDAD' | 'OTRO';
    medicoFirma: string;
    cedulaProfesional: string;
    cluesUnidadEmisora: string;
}
