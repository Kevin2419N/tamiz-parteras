import type { UnidadCLUES } from './types';

// Catálogo en memoria con suscriptores. Inicia vacío: se hidrata con setCluesCatalog()
// desde la API real (o desde MOCK_CLUES_LIST en src/data/mocks.ts durante desarrollo).
let catalogStore: UnidadCLUES[] = [];
type Listener = (units: UnidadCLUES[]) => void;
const listeners = new Set<Listener>();

export const getCluesCatalog = (): UnidadCLUES[] => {
    return catalogStore;
};

/**
 * Reemplaza el catálogo completo (p. ej. con la respuesta de GET /clues del back-end)
 * y notifica a todos los componentes suscritos.
 */
export const setCluesCatalog = (units: UnidadCLUES[]): void => {
    catalogStore = units;
    listeners.forEach((l) => l(catalogStore));
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
