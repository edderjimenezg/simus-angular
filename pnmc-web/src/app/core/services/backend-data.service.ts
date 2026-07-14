import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { ApiClientService } from '../http/api-client.service';

export const DATA_API_CONFIG = {
  tables: {
    agenda: 'Agenda',
    news: 'Noticias',
    festivals: 'Festivales',
    schools: 'escuelas',
    markets: 'Mercados',
    networks: 'Redes',
    lutiers: 'Lutieres',
  },
};

const REQUEST_CACHE_TTL_MS = 15 * 1000;

interface CacheEntry {
  timestamp: number;
  payload: any;
}

@Injectable({
  providedIn: 'root'
})
export class BackendDataService {
  private resolvedCache = new Map<string, CacheEntry>();
  private inFlightRequests = new Map<string, Observable<any>>();

  private MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor(private apiClient: ApiClientService) {}

  private clonePayload<T>(value: T): T {
    try {
      return structuredClone(value);
    } catch {
      return JSON.parse(JSON.stringify(value));
    }
  }

  private toNumber(value: any, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private trimText(value: any): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private mapPagingParams(params: any = {}): Record<string, string> {
    const limit = this.toNumber(params.limit ?? params.pageSize ?? params.maxRecords ?? 100, 100);
    const offset = this.toNumber(params.offset ?? 0, 0);

    return {
      limit: String(Math.max(1, Math.min(limit, 500))),
      offset: String(Math.max(0, offset)),
    };
  }

  private parseIsoDate(value = '') {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return {
        year: '2026',
        monthName: 'Enero',
        day: '01',
      };
    }

    return {
      year: String(date.getUTCFullYear()),
      monthName: this.MONTH_NAMES[date.getUTCMonth()] || 'Enero',
      day: String(date.getUTCDate()).padStart(2, '0'),
    };
  }

  private normalizePagedResponse(payload: any) {
    if (!payload || typeof payload !== 'object') {
      return { items: [], total: 0 };
    }

    const items = Array.isArray(payload.items) ? payload.items : [];
    const total = Number.isFinite(payload.total) ? payload.total : items.length;
    return { items, total };
  }

  private fetchCachedJson(url: string, params: Record<string, string>): Observable<{ items: any[]; total: number }> {
    const cacheKey = `${url}?${new URLSearchParams(params).toString()}`;
    const now = Date.now();
    const cached = this.resolvedCache.get(cacheKey);

    if (cached && now - cached.timestamp < REQUEST_CACHE_TTL_MS) {
      return of(this.clonePayload(cached.payload));
    }

    const activeReq = this.inFlightRequests.get(cacheKey);
    if (activeReq) {
      return activeReq;
    }

    const httpObs = this.apiClient.get<any>(url, { params }).pipe(
      map(res => this.normalizePagedResponse(res)),
      tap(res => {
        this.resolvedCache.set(cacheKey, { timestamp: Date.now(), payload: res });
        this.inFlightRequests.delete(cacheKey);
      }),
      shareReplay(1)
    );

    this.inFlightRequests.set(cacheKey, httpObs);
    return httpObs;
  }

  // --- Mapeos a registros legados (Legacy Records) ---

  private mapAgendaItemsToLegacyRecords(items: any[] = []): any[] {
    return items.map((item) => {
      const date = this.parseIsoDate(item?.date);

      return {
        id: String(item?.id ?? ''),
        fields: {
          día: date.day,
          mes: date.monthName,
          año: date.year,
          time: this.trimText(item?.timeLabel),
          t: this.trimText(item?.title),
          l: this.trimText(item?.location) || [this.trimText(item?.municipality), this.trimText(item?.department)].filter(Boolean).join(', '),
          municipio: this.trimText(item?.municipality),
          departamento: this.trimText(item?.department),
          cat: this.trimText(item?.category),
          desc: this.trimText(item?.description),
          organizer: this.trimText(item?.organizer),
          link: '#',
          img: this.trimText(item?.imageUrl),
          Tags: Array.isArray(item?.tags) ? item.tags : [],
        },
      };
    });
  }

  private mapNewsItemsToLegacyRecords(items: any[] = []): any[] {
    return items.map((item) => ({
      id: String(item?.id ?? ''),
      fields: {
        date: this.trimText(item?.date),
        category: this.trimText(item?.category),
        title: this.trimText(item?.title),
        desc: this.trimText(item?.summary),
        img: this.trimText(item?.imageUrl),
        content: this.trimText(item?.contentHtml),
      },
    }));
  }

  private mapFestivalItemsToLegacyRecords(items: any[] = []): any[] {
    return items.map((item) => {
      const lastEditionDate = this.trimText(item?.lastEditionDate);
      const lastEditionDateParts = this.parseIsoDate(lastEditionDate);

      return {
        id: String(item?.id ?? ''),
        fields: {
          name: this.trimText(item?.name),
          departmentCode: this.trimText(item?.departmentCode),
          municipalityCode: this.trimText(item?.municipalityCode),
          dpt: this.trimText(item?.departmentName),
          departamento: this.trimText(item?.departmentName),
          municipio: this.trimText(item?.municipalityName),
          divipola: this.trimText(item?.municipalityCode),
          coverageLevel: this.trimText(item?.coverageLevel),
          desc: this.trimText(item?.description),
          versiones: this.toNumber(item?.versionsCount),
          mes_de_realización: lastEditionDate ? lastEditionDateParts.monthName : '',
          mes_de_realizacion: lastEditionDate ? lastEditionDateParts.monthName : '',
          fecha_ultima_edicion: lastEditionDate,
          organizador: this.trimText(item?.organizerDisplayName),
          contacto_email: this.trimText(item?.contactEmail),
          contacto_telefono: this.trimText(item?.contactPhone),
          sitio_web: this.trimText(item?.websiteUrl),
          ubicacion_especifica: this.trimText(item?.specificLocation),
          'Prácticas musicales': this.trimText(item?.musicalPractices),
          'Territorios sonoros': this.trimText(item?.sonorousTerritories),
        },
      };
    });
  }

  private mapSchoolItemsToLegacyRecords(items: any[] = []): any[] {
    return items.map((item) => ({
      id: String(item?.id ?? ''),
      fields: {
        'ID escuela': String(item?.id ?? ''),
        Estado: item?.isActiveSchool ? 'Activa' : 'Inactiva',
        departmentCode: this.trimText(item?.departmentCode),
        municipalityCode: this.trimText(item?.municipalityCode),
        Departamento: this.trimText(item?.departmentName),
        Municipio: this.trimText(item?.municipalityName),
        'Código Divipola': this.trimText(item?.municipalityCode),
        'Nombre de la escuela': this.trimText(item?.name),
        'Tipo de escuela': this.trimText(item?.schoolType),
        'Categoría': this.trimText(item?.schoolCategory),
        Cobertura: this.trimText(item?.coverageLevel),
        'Sede de trabajo': this.trimText(item?.specificLocation) || this.trimText(item?.addressText),
        'Naturaleza': this.trimText(item?.responsibleEntityDisplayName),
        'Correo institucional o de contacto': this.trimText(item?.contactEmail),
        'Celular o contacto del director': this.trimText(item?.contactPhone),
        'Cuenta con organización comunitaria': item?.hasCommunityOrganization ? 'Sí' : 'No',
        'Prácticas musicales': this.trimText(item?.musicalPractices),
        'Territorios sonoros': this.trimText(item?.sonorousTerritories),
        'Talleres independientes': this.trimText(item?.trainingProcesses),
        'Cantidad total de alumnos': this.toNumber(item?.studentsTotal),
        'Cantidad de agrupaciones vigentes': this.toNumber(item?.activeGroupsCount),
      },
    }));
  }

  private mapMarketItemsToLegacyRecords(items: any[] = []): any[] {
    return items.map((item) => ({
      id: String(item?.id ?? ''),
      fields: {
        'Nombre del mercado': this.trimText(item?.name),
        departmentCode: this.trimText(item?.departmentCode),
        municipalityCode: this.trimText(item?.municipalityCode),
        Departamento: this.trimText(item?.departmentName),
        Municipio: this.trimText(item?.municipalityName),
        'Cobertura del mercado': this.trimText(item?.coverageLevel),
        'Descripción': this.trimText(item?.description),
        'Periodicidad del mercado': this.trimText(item?.periodicity),
        'Número de versiones realizadas': this.toNumber(item?.editionsCount),
        '¿El mercado se realiza en el marco de algún Festival?': item?.hasAssociatedFestival ? 'Sí' : 'No',
        'Si le respuesta anterior fue Sí, señale:  \nNombre del festival o evento ': this.trimText(item?.associatedFestivalDisplayName),
        '¿Cuál es la entidad, organización o corporación responsable del mercado? ': this.trimText(item?.responsibleEntityDisplayName),
        'Fecha de realización del mercado para el 2026': this.trimText(item?.currentYearStartDate),
        'Ámbito del mercado': this.trimText(item?.scopeType),
        'Modo del mercado': this.trimText(item?.marketMode),
        'Ubicación específica': this.trimText(item?.specificLocation),
        'Prácticas musicales': this.trimText(item?.musicalPractices),
        'Territorios sonoros': this.trimText(item?.sonorousTerritories),
        'sitio_web': this.trimText(item?.websiteUrl || item?.website || ''),
      },
    }));
  }

  private mapNetworkItemsToLegacyRecords(items: any[] = []): any[] {
    return items.map((item) => ({
      id: String(item?.id ?? ''),
      fields: {
        name: this.trimText(item?.name),
        centerType: this.trimText(item?.organizationType),
        municipio: this.trimText(item?.municipalityName),
        departamento: this.trimText(item?.departmentName),
        deptCode: this.trimText(item?.departmentCode),
        divipola: this.trimText(item?.municipalityCode),
        descripcion: this.trimText(item?.description),
        desc: this.trimText(item?.description),
        contact: [this.trimText(item?.contactEmail), this.trimText(item?.contactPhone)].filter(Boolean).join(' · '),
        latitud: item?.latitude != null ? Number(item.latitude) : null,
        longitud: item?.longitude != null ? Number(item.longitude) : null,
        'Territorios sonoros': this.trimText(item?.sonorousTerritories),
        'Prácticas musicales': this.trimText(item?.musicalPractices),
        'sitio_web': this.trimText(item?.websiteUrl || item?.website || ''),
      },
    }));
  }

  private mapLutierItemsToLegacyRecords(items: any[] = []): any[] {
    return items.map((item) => ({
      id: String(item?.id ?? ''),
      fields: {
        name: this.trimText(item?.name),
        oficio: this.trimText(item?.primaryFunction),
        municipio: this.trimText(item?.municipalityName),
        departamento: this.trimText(item?.departmentName),
        deptCode: this.trimText(item?.departmentCode),
        divipola: this.trimText(item?.municipalityCode),
        descripcion: this.trimText(item?.description),
        desc: this.trimText(item?.description),
        contact: [this.trimText(item?.contactEmail), this.trimText(item?.contactPhone)].filter(Boolean).join(' · '),
        latitud: item?.latitude != null ? Number(item.latitude) : null,
        longitud: item?.longitude != null ? Number(item.longitude) : null,
        'Territorios sonoros': this.trimText(item?.sonorousTerritories),
        'Prácticas musicales': this.trimText(item?.musicalPractices),
        'sitio_web': this.trimText(item?.websiteUrl || item?.website || ''),
      },
    }));
  }

  // --- Métodos de consulta de registros ---

  fetchModuleRecords(table: string, params: any = {}): Observable<{ records: any[] }> {
    const paging = this.mapPagingParams(params);

    if (table === DATA_API_CONFIG.tables.agenda) {
      return this.fetchCachedJson('/api/v1/agenda/events', paging).pipe(
        map(res => ({ records: this.mapAgendaItemsToLegacyRecords(res.items) }))
      );
    }
    if (table === DATA_API_CONFIG.tables.news) {
      return this.fetchCachedJson('/api/v1/news/articles', paging).pipe(
        map(res => ({ records: this.mapNewsItemsToLegacyRecords(res.items) }))
      );
    }
    if (table === DATA_API_CONFIG.tables.festivals) {
      return this.fetchCachedJson('/api/v1/festivals', paging).pipe(
        map(res => ({ records: this.mapFestivalItemsToLegacyRecords(res.items) }))
      );
    }
    if (table === DATA_API_CONFIG.tables.schools) {
      return this.fetchCachedJson('/api/v1/music-schools', paging).pipe(
        map(res => ({ records: this.mapSchoolItemsToLegacyRecords(res.items) }))
      );
    }
    if (table === DATA_API_CONFIG.tables.markets) {
      return this.fetchCachedJson('/api/v1/music-markets', paging).pipe(
        map(res => ({ records: this.mapMarketItemsToLegacyRecords(res.items) }))
      );
    }
    if (table === DATA_API_CONFIG.tables.networks) {
      return this.fetchCachedJson('/api/v1/organizations', paging).pipe(
        map(res => ({ records: this.mapNetworkItemsToLegacyRecords(res.items) }))
      );
    }
    if (table === DATA_API_CONFIG.tables.lutiers) {
      return this.fetchCachedJson('/api/v1/spaces-infrastructure', paging).pipe(
        map(res => ({ records: this.mapLutierItemsToLegacyRecords(res.items) }))
      );
    }

    return of({ records: [] });
  }

  fetchAgendaRecords(params: any = {}): Observable<{ records: any[] }> {
    return this.fetchModuleRecords(DATA_API_CONFIG.tables.agenda, params);
  }

  fetchNewsRecords(params: any = {}): Observable<{ records: any[] }> {
    return this.fetchModuleRecords(DATA_API_CONFIG.tables.news, params);
  }

  fetchFestivalRecords(params: any = {}): Observable<{ records: any[] }> {
    return this.fetchModuleRecords(DATA_API_CONFIG.tables.festivals, params);
  }

  fetchSchoolRecords(params: any = {}): Observable<{ records: any[] }> {
    return this.fetchModuleRecords(DATA_API_CONFIG.tables.schools, params);
  }

  fetchMarketRecords(params: any = {}): Observable<{ records: any[] }> {
    return this.fetchModuleRecords(DATA_API_CONFIG.tables.markets, params);
  }

  fetchNetworkRecords(params: any = {}): Observable<{ records: any[] }> {
    return this.fetchModuleRecords(DATA_API_CONFIG.tables.networks, params);
  }

  fetchLutierRecords(params: any = {}): Observable<{ records: any[] }> {
    return this.fetchModuleRecords(DATA_API_CONFIG.tables.lutiers, params);
  }
}
