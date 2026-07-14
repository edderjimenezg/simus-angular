import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../http/api-client.service';
import { feature as topojsonFeature } from 'topojson-client';

const TOPOLOGY_DEPARTMENTS_OBJECT = 'MGN_ADM_DPTO_POLITICO';
const TOPOLOGY_MUNICIPALITIES_OBJECT = 'MGN_ADM_MPIO_GRAFICO';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  constructor(private apiClient: ApiClientService) {}

  private normalizeDepartmentCode(value: any): string {
    const digits = String(value ?? '').replace(/\D+/g, '');
    if (!digits) return '';
    return digits.padStart(2, '0').slice(-2);
  }

  private normalizeMunicipalityCode(value: any, departmentCode = '', municipalityShortCode = ''): string {
    const valueDigits = String(value ?? '').replace(/\D+/g, '');
    if (valueDigits.length >= 5) return valueDigits.slice(-5);

    const departmentDigits = this.normalizeDepartmentCode(departmentCode);
    const municipalityDigits = String(municipalityShortCode ?? '').replace(/\D+/g, '').padStart(3, '0').slice(-3);

    if (departmentDigits && municipalityDigits) {
      return `${departmentDigits}${municipalityDigits}`;
    }

    return valueDigits || '';
  }

  private ensureFeatureCollection(value: any) {
    if (value?.type === 'FeatureCollection' && Array.isArray(value.features)) {
      return value;
    }
    return { type: 'FeatureCollection', features: [] };
  }

  private normalizeDepartmentFeatureCollection(collection: any) {
    const normalized = this.ensureFeatureCollection(collection);

    return {
      ...normalized,
      features: normalized.features.map((item: any) => {
        const properties = item?.properties || {};
        const departmentCode = this.normalizeDepartmentCode(properties.departmentCode || properties.dpto_ccdgo);
        const departmentName = properties.departmentName || properties.dpto_cnmbr || '';

        return {
          ...item,
          properties: {
            ...properties,
            departmentCode,
            departmentName,
          },
        };
      }),
    };
  }

  private normalizeMunicipalityFeatureCollection(collection: any) {
    const normalized = this.ensureFeatureCollection(collection);

    return {
      ...normalized,
      features: normalized.features.map((item: any) => {
        const properties = item?.properties || {};
        const departmentCode = this.normalizeDepartmentCode(properties.departmentCode || properties.dpto_ccdgo);
        const municipalityCode = this.normalizeMunicipalityCode(
          properties.municipalityCode || properties.mpio_cdpmp,
          departmentCode,
          properties.municipalityShortCode || properties.mpio_ccdgo
        );
        const municipalityShortCode = String(
          properties.municipalityShortCode || properties.mpio_ccdgo || ''
        ).replace(/\D+/g, '').padStart(3, '0').slice(-3);
        const municipalityName = properties.municipalityName || properties.mpio_cnmbr || '';
        const departmentName = properties.departmentName || properties.dpto_cnmbr || '';

        return {
          ...item,
          properties: {
            ...properties,
            departmentCode,
            departmentName,
            municipalityCode,
            municipalityShortCode,
            municipalityName,
          },
        };
      }),
    };
  }

  private toGeoBundleFromTopology(topologyPayload: any) {
    const topologyObjects = topologyPayload?.objects || {};
    const departmentsObject = topologyObjects[TOPOLOGY_DEPARTMENTS_OBJECT];
    const municipalitiesObject = topologyObjects[TOPOLOGY_MUNICIPALITIES_OBJECT];

    // Cast properties appropriately or use topojsonFeature
    const departmentsGeo = departmentsObject
      ? (topojsonFeature(topologyPayload, departmentsObject as any) as any)
      : { type: 'FeatureCollection', features: [] };

    const municipalitiesGeo = municipalitiesObject
      ? (topojsonFeature(topologyPayload, municipalitiesObject as any) as any)
      : { type: 'FeatureCollection', features: [] };

    const departments = this.normalizeDepartmentFeatureCollection(departmentsGeo);
    const municipalities = this.normalizeMunicipalityFeatureCollection(municipalitiesGeo);

    return {
      departments,
      municipalities,
    };
  }

  fetchEditorialCatalog(): Observable<{ items: any[] }> {
    return this.apiClient.get<any>('/api/v1/editorial/resources', {
      params: { limit: 500, offset: 0 },
      errorFallback: 'No fue posible cargar datos'
    }).pipe(
      map((payload) => ({
        items: Array.isArray(payload?.items) ? payload.items : [],
      }))
    );
  }

  fetchAgendaEvents(): Observable<{ items: any[] }> {
    return this.apiClient.get<any>('/api/v1/agenda/events', {
      params: { limit: 200, offset: 0 },
      errorFallback: 'No fue posible cargar la agenda'
    }).pipe(
      map((payload) => ({
        items: Array.isArray(payload?.items) ? payload.items : [],
      }))
    );
  }

  fetchColombiaGeoJson(): Observable<any> {
    return this.apiClient.get<any>('/api/v1/map/topojson/territories', {
      errorFallback: 'No fue posible cargar datos'
    }).pipe(
      map((payload) => {
        if (payload?.type === 'Topology') {
          const geoBundle = this.toGeoBundleFromTopology(payload);
          return {
            ...geoBundle.departments,
            municipalities: geoBundle.municipalities,
            sourceFormat: 'topojson',
          };
        }

        if (payload?.type === 'FeatureCollection') {
          return {
            ...this.normalizeDepartmentFeatureCollection(payload),
            municipalities: { type: 'FeatureCollection', features: [] },
            sourceFormat: 'geojson',
          };
        }

        return {
          type: 'FeatureCollection',
          features: [],
          municipalities: { type: 'FeatureCollection', features: [] },
          sourceFormat: 'unknown',
        };
      })
    );
  }

  fetchGalleryAlbums(): Observable<any[]> {
    return this.apiClient.get<any>('/api/v1/gallery/albums', {
      errorFallback: 'No fue posible cargar datos',
      timeoutMs: 5000
    }).pipe(
      map((payload) => (Array.isArray(payload?.items) ? payload.items : []))
    );
  }

  fetchDivipolaGrouped(): Observable<any> {
    return this.apiClient.get<any>('/api/v1/divipola/grouped', {
      errorFallback: 'No fue posible cargar datos'
    }).pipe(
      map((payload) => (payload && typeof payload === 'object' ? payload : {}))
    );
  }
}
