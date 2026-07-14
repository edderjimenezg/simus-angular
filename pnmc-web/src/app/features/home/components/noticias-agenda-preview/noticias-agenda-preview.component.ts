import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideArrowRight, 
  LucideArrowUpRight, 
  LucideCalendarDays, 
  LucideChevronRight, 
  LucideMapPin 
} from '@lucide/angular';
import { BackendDataService } from '../../../../core/services/backend-data.service';
import { 
  buildAgendaItemFromRecord, 
  buildNewsItemFromRecord 
} from '../../../../core/services/media-library.config';
import { ContentWrapperComponent } from '../../../../shared/components/ui/content-wrapper/content-wrapper.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { 
  LoadingStateComponent, 
  ErrorStateComponent, 
  EmptyStateComponent 
} from '../../../../shared/components/ui/remote-state/remote-state.component';

@Component({
  selector: 'app-noticias-agenda-preview',
  standalone: true,
  imports: [
    CommonModule,
    LucideArrowRight,
    LucideArrowUpRight,
    LucideCalendarDays,
    LucideChevronRight,
    LucideMapPin,
    ContentWrapperComponent,
    SectionHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './noticias-agenda-preview.component.html'
})
export class NoticiasAgendaPreviewComponent implements OnInit, OnDestroy {
  @Output() navigate = new EventEmitter<string>();
  @Output() navigateToArticle = new EventEmitter<any>();
  @Output() navigateToAgendaEvent = new EventEmitter<string>();

  isLoading = false;
  isRefreshing = false;
  isError = false;
  error: any = null;

  agendaItems: any[] = [];
  newsItems: any[] = [];
  featuredGroup: any[] = [];

  activeTab = 0;
  activeNewsGroup = 0;
  private rotationTimer: any = null;

  constructor(private backendData: BackendDataService) {}

  ngOnInit(): void {
    this.loadData();
    this.startRotationTimer();
  }

  ngOnDestroy(): void {
    this.stopRotationTimer();
  }

  loadData(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }
    this.isError = false;
    this.error = null;

    // Fetch news and agenda in parallel
    this.backendData.fetchNewsRecords({ limit: 10 }).subscribe({
      next: (newsData) => {
        this.newsItems = (newsData.records || []).map((rec) => buildNewsItemFromRecord(rec));
        
        this.backendData.fetchAgendaRecords({ limit: 100 }).subscribe({
          next: (agendaData) => {
            const mappedAgenda = (agendaData.records || []).map((rec) => {
              const agendaItem = buildAgendaItemFromRecord(rec);
              return {
                id: agendaItem.id,
                d: agendaItem.d,
                month: agendaItem.m,
                t: agendaItem.t,
                l: agendaItem.l,
                cat: agendaItem.cat,
                desc: agendaItem.desc,
                dateObj: agendaItem.dateObj,
                timeValue: agendaItem.timeValue,
              };
            });

            // Sort agenda items by date and then by time value
            this.agendaItems = mappedAgenda.sort((leftItem: any, rightItem: any) => {
              if (leftItem.dateObj.getTime() !== rightItem.dateObj.getTime()) {
                return leftItem.dateObj.getTime() - rightItem.dateObj.getTime();
              }
              return leftItem.timeValue - rightItem.timeValue;
            }).slice(0, 6);

            this.isLoading = false;
            this.isRefreshing = false;
            this.updateFeaturedNewsGroup();
          },
          error: (err) => {
            this.isError = true;
            this.error = err;
            this.isLoading = false;
            this.isRefreshing = false;
          }
        });
      },
      error: (err) => {
        this.isError = true;
        this.error = err;
        this.isLoading = false;
        this.isRefreshing = false;
      }
    });
  }

  retryPreview(): void {
    this.loadData(false);
  }

  setActiveTab(idx: number): void {
    this.activeTab = idx;
  }

  onNavigate(page: string): void {
    this.navigate.emit(page);
  }

  onNavigateToArticle(item: any): void {
    this.navigateToArticle.emit(item);
  }

  onNavigateToAgendaEvent(eventId: string): void {
    this.navigateToAgendaEvent.emit(eventId);
  }

  private startRotationTimer(): void {
    this.rotationTimer = setInterval(() => {
      this.activeNewsGroup = this.activeNewsGroup === 0 ? 1 : 0;
      this.updateFeaturedNewsGroup();
    }, 30000);
  }

  private stopRotationTimer(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }
  }

  private updateFeaturedNewsGroup(): void {
    this.featuredGroup = this.activeNewsGroup === 0 
      ? this.newsItems.slice(0, 3) 
      : this.newsItems.slice(3, 6);
  }
}
