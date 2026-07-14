import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideArrowRight, LucideArrowUpRight } from '@lucide/angular';
import { MapDataService } from '../../../../core/services/map-data.service';
import { ContentWrapperComponent } from '../../../../shared/components/ui/content-wrapper/content-wrapper.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { LoadingStateComponent, ErrorStateComponent } from '../../../../shared/components/ui/remote-state/remote-state.component';
import { RANDOM_GALLERY_IMAGES } from '../../../../core/services/media-library.config';
import * as MapDomain from '../../../map/domain/map-domain';

@Component({
  selector: 'app-mapa-ecosistemico-preview',
  standalone: true,
  imports: [
    CommonModule,
    LucideArrowRight,
    LucideArrowUpRight,
    ContentWrapperComponent,
    SectionHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './mapa-ecosistemico-preview.component.html'
})
export class MapaEcosistemicoPreviewComponent implements OnInit {
  @Output() navigateToMapLayer = new EventEmitter<string>();
  @Output() openParticipation = new EventEmitter<void>();

  mapData: any = null;
  isLoading = false;
  isRefreshing = false;
  isError = false;
  error: any = null;

  previewCards: any[] = [];

  constructor(private mapDataService: MapDataService) {}

  ngOnInit(): void {
    this.loadMapData();
  }

  loadMapData(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }
    this.isError = false;
    this.error = null;

    this.mapDataService.fetchMapCountsBundle().subscribe({
      next: (data) => {
        this.mapData = data;
        this.isLoading = false;
        this.isRefreshing = false;
        this.buildPreviewCards();
      },
      error: (err) => {
        this.error = err;
        this.isError = true;
        this.isLoading = false;
        this.isRefreshing = false;
      }
    });
  }

  retryMapData(): void {
    this.loadMapData(false);
  }

  private countDistinctDepartments(records: any[] = [], keys: string[] = []): number {
    const values = new Set<string>();
    records.forEach((record) => {
      const source = record?.fields || record || {};
      const match = keys
        .map((key) => source?.[key])
        .find((val) => typeof val === 'string' && val.trim());

      if (match) {
        values.add(match.trim().toLowerCase());
      }
    });
    return values.size;
  }

  private buildPreviewCards(): void {
    if (!this.mapData) return;

    this.previewCards = [
      {
        name: 'Festivales',
        count: this.mapData?.festivalCounts
          ? MapDomain.sumNumericValues(Object.values(this.mapData.festivalCounts))
          : null,
        departments: this.mapData?.festivalCounts
          ? Object.values(this.mapData.festivalCounts).filter((value) => Number(value) > 0).length
          : 0,
        img: RANDOM_GALLERY_IMAGES[6],
        targetLayer: 'Festivales',
      },
      {
        name: 'Mercados',
        count: this.mapData?.marketRecords?.length ?? null,
        departments: this.countDistinctDepartments(this.mapData?.marketRecords, ['department', 'departmentName']),
        img: RANDOM_GALLERY_IMAGES[7],
        targetLayer: 'Mercados Musicales',
      },
      {
        name: 'Escuelas',
        count: this.mapData?.schoolRecords?.length ?? null,
        departments: this.countDistinctDepartments(this.mapData?.schoolRecords, ['department', 'departmentName']),
        img: RANDOM_GALLERY_IMAGES[8],
        targetLayer: 'Escuelas de Música',
      },
      {
        name: 'Redes Doc.',
        count: this.mapData?.redesRecords?.length ?? 0,
        departments: this.countDistinctDepartments(this.mapData?.redesRecords, ['departmentName', 'departamento']),
        img: RANDOM_GALLERY_IMAGES[9],
        targetLayer: 'Redes de Documentación',
      },
      {
        name: 'Lutieres',
        count: this.mapData?.luthierRecords?.length ?? 0,
        departments: this.countDistinctDepartments(this.mapData?.luthierRecords, ['departmentName', 'departamento']),
        img: RANDOM_GALLERY_IMAGES[10],
        targetLayer: 'Lutieres',
      },
    ];
  }

  formatMetricValue(value: number): string {
    return MapDomain.formatMetricValue(value);
  }

  onNavigateToMapLayer(layer: string): void {
    this.navigateToMapLayer.emit(layer);
  }

  onOpenParticipation(): void {
    this.openParticipation.emit();
  }
}
