import type { UnidadCLUES } from './types';
import { http } from '../../../../services/http';

// Catálogo en memoria con suscriptores. Inicia vacío: se hidrata desde la API real (Render)
let catalogStore: UnidadCLUES[] = [];
type Listener = (units: UnidadCLUES[]) => void;
const listeners = new Set<Listener>();

export const getCluesCatalog = (): UnidadCLUES[] => {
    return catalogStore;
};

/**
 * Reemplaza el catálogo completo y notifica a todos los componentes suscritos.
 */
export const setCluesCatalog = (units: UnidadCLUES[]): void => {
    catalogStore = units;
    listeners.forEach((l) => l(catalogStore));
};

/**
 * Carga oficial del catálogo de CLUES directamente desde el backend en Render (PostgreSQL).
 */
export const fetchCluesCatalogFromBackend = async (): Promise<UnidadCLUES[]> => {
    try {
        const response = await http.get('/clues');
        if (response.data) {
            setCluesCatalog(response.data);
            return response.data;
        }
    } catch (error) {
        console.error('Error al obtener el catálogo de CLUES desde el servidor:', error);
    }
    return catalogStore;
};

export const addCluesUnit = async (unit: Omit<UnidadCLUES, 'id'>): Promise<UnidadCLUES | null> => {
    try {
        const response = await http.post('/clues', unit);
        const createdUnit: UnidadCLUES = response.data.unidad || response.data;

        catalogStore = [createdUnit, ...catalogStore];
        listeners.forEach((l) => l(catalogStore));
        return createdUnit;
    } catch (error) {
        console.error('Error al registrar la unidad CLUES en el servidor:', error);
        alert('No se pudo guardar la unidad médica en la base de datos.');
        return null;
    }
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
        servidor: 'BD-RENDER-POSTGRESQL-JURISDICCION-02',
        catálogoCLUES: catalogStore,
        totalUnidades: catalogStore.length,
        politicaSeguridad: 'Cifrado AES-256 Institucional SSO Oaxaca',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SSO_Oaxaca_Respaldo_CLUES_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};