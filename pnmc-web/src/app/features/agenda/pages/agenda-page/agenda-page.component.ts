import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideArrowUpRight, 
  LucideCalendar, 
  LucideChevronLeft, 
  LucideChevronRight, 
  LucideClock, 
  LucideFilter, 
  LucideList, 
  LucideMapPin, 
  LucidePlus 
} from '@lucide/angular';
import { NavigationService } from '../../../../core/services/navigation.service';
import { WebTextsService } from '../../../../core/services/web-texts.service';
import { BackendDataService } from '../../../../core/services/backend-data.service';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { 
  LoadingStateComponent, 
  ErrorStateComponent, 
  EmptyStateComponent 
} from '../../../../shared/components/ui/remote-state/remote-state.component';
import { 
  getSortedDepartmentNames,
  getRuntimeDivipolaByDepartment,
  resolveDepartmentDivipolaKey,
  sortUniqueByLocale,
  normalizeDepartmentName,
  normalizeMunicipalityName,
  getDepartmentSelectionValue
} from '../../../map/domain/map-domain';
import { buildAgendaItemFromRecord } from '../../../../core/services/media-library.config';
import { buildAgendaEventIcs } from '../../domain/agenda-ics';

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  imports: [
    CommonModule,
    SectionHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    LucideArrowUpRight,
    LucideCalendar,
    LucideChevronLeft,
    LucideChevronRight,
    LucideClock,
    LucideFilter,
    LucideList,
    LucideMapPin,
    LucidePlus
  ],
  templateUrl: './agenda-page.component.html'
})
export class AgendaPageComponent implements OnInit {
  private navigationService = inject(NavigationService);
  private webTexts = inject(WebTextsService);
  private backendData = inject(BackendDataService);

  openIndex = signal<number>(-1);
  currentPage = signal<number>(1);
  dateMode = signal<'exact' | 'month'>('exact');
  viewMode = signal<'list' | 'calendar'>('list');
  selectedDept = signal<string>('');
  selectedMunicipality = signal<string>('');
  selectedExactDate = signal<string>('');
  selectedMonthFilter = signal<string>('');
  selectedCategory = signal<string>('Todos');

  isLoading = false;
  isRefreshing = false;
  isError = false;
  error: any = null;

  agendaData = signal<any[]>([]);

  Math = Math;

  padDay(d: any): string {
    return String(d ?? '').padStart(2, '0');
  }

  // Computed properties
  departments = computed(() => getSortedDepartmentNames());

  cities = computed(() => {
    const dept = this.selectedDept();
    if (!dept) return [];
    const grouped = getRuntimeDivipolaByDepartment();
    const departmentKey = resolveDepartmentDivipolaKey(dept);
    const municipalities = departmentKey ? grouped[departmentKey] : [];
    return sortUniqueByLocale(municipalities);
  });

  uniqueMonths = computed(() => {
    const months = this.agendaData().map(item => {
      if (!item.dateObj) return null;
      const year = item.dateObj.getFullYear();
      const monthIndex = item.dateObj.getMonth();
      const label = item.dateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      const value = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      return { value, label };
    }).filter(Boolean) as { value: string, label: string }[];

    return Array.from(new Map(months.map(m => [m.value, m])).values())
      .sort((a, b) => a.value.localeCompare(b.value));
  });

  activityCategories = computed(() => {
    const cats = [...new Set(this.agendaData().map(item => item.cat).filter(Boolean))];
    return ['Todos', ...cats];
  });

  filteredAgendaItems = computed(() => {
    const data = this.agendaData();
    const dept = this.selectedDept();
    const municipality = this.selectedMunicipality();
    const exactDate = this.selectedExactDate();
    const monthFilter = this.selectedMonthFilter();
    const category = this.selectedCategory();
    const dMode = this.dateMode();

    const selectedDepartmentNormalized = normalizeDepartmentName(getDepartmentSelectionValue(dept));
    const selectedMunicipalityNormalized = normalizeMunicipalityName(municipality);

    return data.filter((item) => {
      // 1. Filter by location
      const locationTokens = String(item?.l || '')
        .split(',')
        .map((token) => token.trim())
        .filter(Boolean);
      const itemMunicipality = item?.municipality || locationTokens[0] || '';
      const itemDepartment = item?.department || locationTokens[1] || '';

      const matchesDepartment = !selectedDepartmentNormalized
        || normalizeDepartmentName(itemDepartment) === selectedDepartmentNormalized;
      const matchesMunicipality = !selectedMunicipalityNormalized
        || normalizeMunicipalityName(itemMunicipality) === selectedMunicipalityNormalized;

      if (!matchesDepartment || !matchesMunicipality) return false;

      // 2. Filter by activity type
      const matchesCategory = category === 'Todos' || item.cat === category;
      if (!matchesCategory) return false;

      // 3. Filter by date / month selection
      if (dMode === 'exact') {
        if (!exactDate) return true;
        const filterDateObj = new Date(exactDate + 'T00:00:00');
        return item.dateObj && 
               item.dateObj.getFullYear() === filterDateObj.getFullYear() &&
               item.dateObj.getMonth() === filterDateObj.getMonth() &&
               item.dateObj.getDate() === filterDateObj.getDate();
      } else {
        if (dMode === 'month' && monthFilter) {
          const itemYear = item.dateObj.getFullYear();
          const itemMonthIndex = item.dateObj.getMonth();
          const itemMonthStr = `${itemYear}-${String(itemMonthIndex + 1).padStart(2, '0')}`;
          if (itemMonthStr !== monthFilter) return false;
        }
        return true;
      }
    });
  });

  ITEMS_PER_PAGE = 12;

  totalPages = computed(() => {
    const count = this.filteredAgendaItems().length;
    return Math.max(1, Math.ceil(count / this.ITEMS_PER_PAGE));
  });

  paginatedAgendaItems = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.ITEMS_PER_PAGE;
    return this.filteredAgendaItems().slice(startIndex, startIndex + this.ITEMS_PER_PAGE);
  });

  ngOnInit() {
    this.loadAgendaData();
  }

  loadAgendaData(isRefresh = false) {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }
    this.isError = false;
    this.error = null;

    this.backendData.fetchAgendaRecords({ limit: 1000 }).subscribe({
      next: (res) => {
        const sorted = (res.records || [])
          .map((rec) => buildAgendaItemFromRecord(rec))
          .sort((a, b) => {
            if (a.dateObj.getTime() !== b.dateObj.getTime()) {
              return a.dateObj.getTime() - b.dateObj.getTime();
            }
            return a.timeValue - b.timeValue;
          });
        this.agendaData.set(sorted);
        this.isLoading = false;
        this.isRefreshing = false;

        // Check for navigation target
        const initialId = this.navigationService.selectedAgendaEventId();
        if (initialId) {
          const targetIndex = this.filteredAgendaItems().findIndex(item => item.id === initialId);
          if (targetIndex !== -1) {
            setTimeout(() => {
              this.viewMode.set('list');
              this.openIndex.set(targetIndex);
              const targetElement = document.getElementById(`agenda-item-${initialId}`);
              if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 150);
          }
        }
      },
      error: (err) => {
        this.error = err;
        this.isError = true;
        this.isLoading = false;
        this.isRefreshing = false;
      }
    });
  }

  retry() {
    this.loadAgendaData(false);
  }

  getWebText(key: string, fallback = ''): string {
    return this.webTexts.getWebText(key) || fallback;
  }

  setDateMode(mode: 'exact' | 'month') {
    this.dateMode.set(mode);
    this.resetPaginationAndSelection();
  }

  setSelectedDept(event: Event) {
    const input = event.target as HTMLSelectElement;
    this.selectedDept.set(input.value);
    this.selectedMunicipality.set('');
    this.resetPaginationAndSelection();
  }

  setSelectedMunicipality(event: Event) {
    const input = event.target as HTMLSelectElement;
    this.selectedMunicipality.set(input.value);
    this.resetPaginationAndSelection();
  }

  setSelectedExactDate(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedExactDate.set(input.value);
    this.resetPaginationAndSelection();
  }

  setSelectedMonthFilter(event: Event) {
    const input = event.target as HTMLSelectElement;
    this.selectedMonthFilter.set(input.value);
    this.resetPaginationAndSelection();
  }

  setSelectedCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.resetPaginationAndSelection();
  }

  toggleOpenIndex(index: number) {
    this.openIndex.set(this.openIndex() === index ? -1 : index);
  }

  setViewMode(mode: 'list' | 'calendar') {
    this.viewMode.set(mode);
    this.openIndex.set(-1);
  }

  setCurrentPage(page: number) {
    this.currentPage.set(page);
    this.openIndex.set(-1);
    this.scrollToFeed();
  }

  prevPage() {
    this.currentPage.set(Math.max(1, this.currentPage() - 1));
    this.openIndex.set(-1);
    this.scrollToFeed();
  }

  nextPage() {
    this.currentPage.set(Math.min(this.totalPages(), this.currentPage() + 1));
    this.openIndex.set(-1);
    this.scrollToFeed();
  }

  clearFilters() {
    this.dateMode.set('exact');
    this.selectedDept.set('');
    this.selectedMunicipality.set('');
    this.selectedExactDate.set('');
    this.selectedMonthFilter.set('');
    this.selectedCategory.set('Todos');
    this.resetPaginationAndSelection();
  }

  handleAddToCalendar(event: Event, item: any) {
    event.stopPropagation();
    const icsContent = buildAgendaEventIcs(item);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = (item.t || 'evento-pnmc').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    link.href = url;
    link.download = `${safeTitle || 'evento-pnmc'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  handleInfoLink(event: Event, item: any) {
    event.stopPropagation();
    if (item.link && item.link !== '#') {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
  }

  private resetPaginationAndSelection() {
    this.currentPage.set(1);
    this.openIndex.set(-1);
  }

  private scrollToFeed() {
    setTimeout(() => {
      const element = document.getElementById('agenda-lista-eventos');
      if (element) {
        const yOffset = -112;
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  }
}
