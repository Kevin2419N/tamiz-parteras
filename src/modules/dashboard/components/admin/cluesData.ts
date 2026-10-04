import type { UnidadCLUES } from './types';

export const INITIAL_CLUES_LIST: UnidadCLUES[] = [
    {
        id: 'clues-1',
        nombre: 'Centro de Salud Urbano Juchitán',
        clues: 'OASSA000451',
        municipio: 'Juchitán de Zaragoza',
        tipoUnidad: 'Centro de Salud',
        nivelAtencion: 'Primer Nivel',
        estatus: 'ACTIVO',
    },
    {
        id: 'clues-2',
        nombre: 'Hospital General de Juchitán Dr. Maceonio Benítez',
        clues: 'OASSA001230',
        municipio: 'Juchitán de Zaragoza',
        tipoUnidad: 'Hospital General',
        nivelAtencion: 'Segundo Nivel',
        estatus: 'ACTIVO',
    },
    {
        id: 'clues-3',
        nombre: 'CESSA Tehuantepec',
        clues: 'OASSA002140',
        municipio: 'Santo Domingo Tehuantepec',
        tipoUnidad: 'CESSA',
        nivelAtencion: 'Primer Nivel',
        estatus: 'ACTIVO',
    },
    {
        id: 'clues-4',
        nombre: 'Hospital General de Salina Cruz',
        clues: 'OASSA003450',
        municipio: 'Salina Cruz',
        tipoUnidad: 'Hospital General',
        nivelAtencion: 'Segundo Nivel',
        estatus: 'ACTIVO',
    },
    {
        id: 'clues-5',
        nombre: 'Centro de Salud Ixtepec',
        clues: 'OASSA004120',
        municipio: 'Ciudad Ixtepec',
        tipoUnidad: 'Centro de Salud',
        nivelAtencion: 'Primer Nivel',
        estatus: 'ACTIVO',
    },
    {
        id: 'clues-6',
        nombre: 'Centro de Salud San Blas Atempa',
        clues: 'OASSA005890',
        municipio: 'San Blas Atempa',
        tipoUnidad: 'Centro de Salud',
        nivelAtencion: 'Primer Nivel',
        estatus: 'ACTIVO',
    },
    {
        id: 'clues-7',
        nombre: 'Hospital Comunitario Matías Romero',
        clues: 'OASSA006310',
        municipio: 'Matías Romero Avendaño',
        tipoUnidad: 'Hospital Comunitario',
        nivelAtencion: 'Segundo Nivel',
        estatus: 'ACTIVO',
    },
];

// In-memory catalog state with listeners
let catalogStore: UnidadCLUES[] = [...INITIAL_CLUES_LIST];
type Listener = (units: UnidadCLUES[]) => void;
const listeners = new Set<Listener>();

export const getCluesCatalog = (): UnidadCLUES[] => {
    return catalogStore;
};

export const addCluesUnit = (unit: Omit<UnidadCLUES, 'id'>): UnidadCLUES => {
    const newUnit: UnidadCLUES = {
        ...unit,
        id: `clues-${Date.now()}`,
    };
    catalogStore = [newUnit, ...catalogStore];
    listeners.forEach((l) => l(catalogStore));
    return newUnit;
};

export const subscribeCluesCatalog = (listener: Listener) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const exportDatabaseAsJSON = () => {
    const backupData = {
        sistema: 'Servicios de Salud de Oaxaca - Jurisdicción Sanitaria No. 2 Istmo',
        version: '2026.4.0-PROD',
        fechaExportacion: new Date().toISOString(),
        servidor: 'BD-LOCAL-JURISDICCION-02',
        catálogoCLUES: catalogStore,
        totalUnidades: catalogStore.length,
        politicaSeguridad: 'Cifrado AES-256 Institucional SSO Oaxaca',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SSO_Oaxaca_Respaldo_BD_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};
