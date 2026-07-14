import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BackendDataService } from './backend-data.service';
import { CatalogService } from './catalog.service';
import * as MapDomain from '../../features/map/domain/map-domain';

@Injectable({
  providedIn: 'root'
})
export class MapDataService {
  constructor(
    private backendData: BackendDataService,
    private catalog: CatalogService
  ) {}

  fetchMapCountsBundle(): Observable<any> {
    return forkJoin({
      geoJson: this.catalog.fetchColombiaGeoJson().pipe(
        catchError(() => of({ type: 'FeatureCollection', features: [], municipalities: { type: 'FeatureCollection', features: [] } }))
      ),
      festivals: this.backendData.fetchModuleRecords('Festivales').pipe(
        catchError(() => of({ records: [] }))
      ),
      schools: this.backendData.fetchModuleRecords('escuelas').pipe(
        catchError(() => of({ records: [] }))
      ),
      markets: this.backendData.fetchModuleRecords('Mercados').pipe(
        catchError(() => of({ records: [] }))
      ),
      networks: this.backendData.fetchModuleRecords('Redes').pipe(
        catchError(() => of({ records: [] }))
      ),
      lutiers: this.backendData.fetchModuleRecords('Lutieres').pipe(
        catchError(() => of({ records: [] }))
      )
    }).pipe(
      map(({ geoJson, festivals, schools, markets, networks, lutiers }) => {
        const baseCounts = MapDomain.getBaseDepartmentCounts();

        const festivalRecords = festivals.records || [];
        const schoolRecords = (schools.records || [])
          .map(MapDomain.buildPublicSchoolRecord)
          .filter(Boolean);
        const marketRecords = (markets.records || [])
          .map(MapDomain.buildPublicMarketRecord)
          .filter(Boolean);
        const redesRecords = networks.records || [];
        const luthierRecords = lutiers.records || [];

        return {
          geoJson,
          baseCounts,
          festivalRecords,
          schoolRecords,
          marketRecords,
          redesRecords,
          luthierRecords,
          festivalCounts: { ...baseCounts, ...MapDomain.buildFestivalCounts(festivalRecords) },
          schoolCounts: { ...baseCounts, ...MapDomain.buildSchoolCounts(schoolRecords) },
          marketCounts: { ...baseCounts, ...MapDomain.buildMarketCounts(marketRecords) },
        };
      })
    );
  }
}
