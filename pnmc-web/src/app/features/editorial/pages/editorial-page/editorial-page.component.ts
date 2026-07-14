import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideBookOpen, 
  LucideBoxes, 
  LucideBuilding2, 
  LucideDisc, 
  LucideFileVideo, 
  LucideInfo, 
  LucideLandmark, 
  LucideLibrary, 
  LucideMusic2, 
  LucideSearch,
  LucideChevronDown,
  LucideChevronUp,
  LucideChevronLeft,
  LucideChevronRight,
  LucideArrowUpRight,
  LucideDownload,
  LucideExternalLink,
  LucideQuote,
  LucideX,
  LucideCalendar,
  LucideAlertCircle,
  LucideLayoutGrid,
  LucideList,
  LucideUserCircle2,
  LucideLoader2
} from '@lucide/angular';
import { NavigationService } from '../../../../core/services/navigation.service';
import { WebTextsService } from '../../../../core/services/web-texts.service';
import { CatalogService } from '../../../../core/services/catalog.service';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { TagComponent } from '../../../../shared/components/ui/tag/tag.component';
import { 
  extractEditorialYears, 
  getEditorialSectionIconName 
} from '../../../../core/services/data-transforms';

@Component({
  selector: 'app-editorial-page',
  standalone: true,
  imports: [
    CommonModule,
    SectionHeaderComponent,
    TagComponent,
    LucideBookOpen, 
    LucideBoxes, 
    LucideBuilding2, 
    LucideDisc, 
    LucideFileVideo, 
    LucideInfo, 
    LucideLandmark, 
    LucideLibrary, 
    LucideMusic2, 
    LucideSearch,
    LucideChevronDown,
    LucideChevronUp,
    LucideChevronLeft,
    LucideChevronRight,
    LucideArrowUpRight,
    LucideDownload,
    LucideExternalLink,
    LucideQuote,
    LucideX,
    LucideCalendar,
    LucideAlertCircle,
    LucideLayoutGrid,
    LucideList,
    LucideUserCircle2,
    LucideLoader2
  ],
  templateUrl: './editorial-page.component.html'
})
export class EditorialPageComponent implements AfterViewChecked, OnInit {
  private navigationService = inject(NavigationService);
  private webTexts = inject(WebTextsService);
  private catalogService = inject(CatalogService);

  selectedMosaicItem = signal<any>(null);
  activeTab = signal<string>('all');
  searchTerm = signal<string>('');
  advancedTitleSearch = signal<string>('');
  advancedAuthorSearch = signal<string>('');
  advancedKeywordSearch = signal<string>('');
  selectedYearFilter = signal<string>('');
  showAdvancedSearch = signal<boolean>(false);
  editorialSortOrder = signal<string>('az');
  selectedKeyword = signal<string>('');
  hoveredId = signal<string | null>(null);
  viewMode = signal<'mosaic' | 'table'>('mosaic');
  expandedId = signal<string | null>(null);
  currentPage = signal<number>(1);
  resources = signal<any[]>([]);

  @ViewChild('mosaicDetailDialog') mosaicDetailDialog?: ElementRef<HTMLDialogElement>;

  isLoading = true;
  loadError: string | null = null;

  Math = Math;

  // Computed properties
  categories = computed(() => {
    const list = this.resources();
    const uniqueSections = [...new Set(list.map((r) => r.section).filter(Boolean))];

    return [
      { id: 'all', label: 'Todo el Acervo', iconName: 'library' },
      ...uniqueSections.map((section) => ({
        id: section,
        label: section,
        iconName: getEditorialSectionIconName(section)
      }))
    ];
  });

  sectionScopedResources = computed(() => {
    const list = this.resources();
    const tab = this.activeTab();
    return tab === 'all' ? list : list.filter((r) => r.section === tab);
  });

  popularKeywords = computed(() => {
    const scope = this.sectionScopedResources();
    const counts = new Map<string, number>();

    scope.forEach((resource) => {
      resource.keywords?.forEach((keyword: string) => {
        counts.set(keyword, (counts.get(keyword) || 0) + 1);
      });
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))
      .slice(0, 8)
      .map(([keyword]) => keyword);
  });

  availableYears = computed(() => {
    const scope = this.sectionScopedResources();
    const years = scope.flatMap((resource) => extractEditorialYears(resource.year));
    return [...new Set(years)].sort((a, b) => b - a);
  });

  filteredResources = computed(() => {
    const scope = this.sectionScopedResources();
    const term = this.searchTerm().trim().toLowerCase();
    const advTitle = this.advancedTitleSearch().trim().toLowerCase();
    const advAuthor = this.advancedAuthorSearch().trim().toLowerCase();
    const advKeyword = this.advancedKeywordSearch().trim().toLowerCase();
    const keyword = this.selectedKeyword().trim().toLowerCase();
    const yearFilter = this.selectedYearFilter();
    const sortOrder = this.editorialSortOrder();

    const matching = scope.filter((resource) => {
      // 1. Keyword
      const matchesKeyword = !keyword
        || resource.keywords?.some((k: string) => k.toLowerCase() === keyword);
      if (!matchesKeyword) return false;

      // 2. Year
      const resourceYears = extractEditorialYears(resource.year).map(String);
      const matchesYear = !yearFilter || resourceYears.includes(yearFilter);
      if (!matchesYear) return false;

      // 3. Advanced title
      const matchesAdvTitle = !advTitle || (resource.title || '').toLowerCase().includes(advTitle);
      if (!matchesAdvTitle) return false;

      // 4. Advanced author
      const authorText = [
        resource.displayAuthor,
        resource.author,
        resource.corporateAuthor,
        resource.credits
      ].filter(Boolean).join(' ').toLowerCase();
      const matchesAdvAuthor = !advAuthor || authorText.includes(advAuthor);
      if (!matchesAdvAuthor) return false;

      // 5. Advanced keyword/meta
      const metaText = [
        resource.section,
        resource.sectionPath,
        resource.practice,
        resource.category,
        resource.subcategory,
        ...(resource.keywords || [])
      ].filter(Boolean).join(' ').toLowerCase();
      const matchesAdvKeyword = !advKeyword || metaText.includes(advKeyword);
      if (!matchesAdvKeyword) return false;

      // 6. Simple Search
      if (!term) return true;
      const searchable = [
        resource.id,
        resource.title,
        resource.year,
        resource.section,
        resource.sectionPath,
        resource.publicationType,
        resource.practice,
        resource.category,
        resource.subcategory,
        resource.author,
        resource.corporateAuthor,
        resource.credits,
        resource.regionalScope,
        resource.location,
        resource.summary,
        resource.additionalFields,
        ...(resource.keywords || [])
      ].filter(Boolean).join(' ').toLowerCase();

      return searchable.includes(term);
    });

    return [...matching].sort((left, right) => {
      const leftTitle = left.title || left.id || '';
      const rightTitle = right.title || right.id || '';
      const comparison = leftTitle.localeCompare(rightTitle, 'es', { sensitivity: 'base' });
      return sortOrder === 'za' ? comparison * -1 : comparison;
    });
  });

  ITEMS_PER_PAGE = 24;

  totalPages = computed(() => {
    const count = this.filteredResources().length;
    return Math.max(1, Math.ceil(count / this.ITEMS_PER_PAGE));
  });

  paginatedResources = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.ITEMS_PER_PAGE;
    return this.filteredResources().slice(startIndex, startIndex + this.ITEMS_PER_PAGE);
  });

  currentCategoryLabel = computed(() => {
    const tab = this.activeTab();
    return this.categories().find((c) => c.id === tab)?.label || 'Todo el Acervo';
  });

  ngOnInit() {
    this.loadCatalog();

    // Check for navigation target (initial selection)
    const initialId = this.navigationService.selectedEditorialResourceId();
    if (initialId) {
      setTimeout(() => {
        this.viewMode.set('table');
        this.expandedId.set(initialId);
        const targetElement = document.getElementById(`resource-row-${initialId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }

  loadCatalog() {
    this.isLoading = true;
    this.loadError = null;

    this.catalogService.fetchEditorialCatalog().subscribe({
      next: (res) => {
        this.resources.set(Array.isArray(res?.items) ? res.items : []);
        this.isLoading = false;
      },
      error: (err) => {
        this.loadError = err?.message || 'No fue posible cargar el catálogo editorial.';
        this.isLoading = false;
      }
    });
  }

  getWebText(key: string, fallback = ''): string {
    return this.webTexts.getWebText(key) || fallback;
  }

  setActiveTab(tabId: string) {
    this.activeTab.set(tabId);
    this.selectedKeyword.set('');
    this.currentPage.set(1);
  }

  setSelectedKeyword(keyword: string) {
    this.selectedKeyword.set(this.selectedKeyword() === keyword ? '' : keyword);
    this.currentPage.set(1);
  }

  setSelectedYearFilter(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedYearFilter.set(select.value);
    this.currentPage.set(1);
  }

  setEditorialSortOrder(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.editorialSortOrder.set(select.value);
    this.currentPage.set(1);
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  toggleAdvancedSearch() {
    this.showAdvancedSearch.set(!this.showAdvancedSearch());
  }

  clearSearch() {
    this.searchTerm.set('');
    this.advancedTitleSearch.set('');
    this.advancedAuthorSearch.set('');
    this.advancedKeywordSearch.set('');
    this.selectedYearFilter.set('');
    this.currentPage.set(1);
  }

  setViewMode(mode: 'mosaic' | 'table') {
    this.viewMode.set(mode);
    this.expandedId.set(null);
  }

  toggleExpandedId(itemId: string) {
    const isExpanding = this.expandedId() !== itemId;
    this.expandedId.set(isExpanding ? itemId : null);

    if (isExpanding) {
      setTimeout(() => {
        const element = document.getElementById(`resource-row-${itemId}`);
        if (element) {
          const yOffset = -140;
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }

  setSelectedMosaicItem(item: any) {
    if (!item) {
      this.closeMosaicDetail();
      return;
    }

    this.selectedMosaicItem.set(item);
  }

  ngAfterViewChecked(): void {
    const dialog = this.mosaicDetailDialog?.nativeElement;
    if (this.selectedMosaicItem() && dialog && !dialog.open) {
      dialog.showModal();
    }
  }

  closeMosaicDetail(event?: Event) {
    event?.preventDefault();
    const dialog = this.mosaicDetailDialog?.nativeElement;
    if (dialog?.open) {
      dialog.close();
    }
    this.selectedMosaicItem.set(null);
  }

  onMosaicDialogClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeMosaicDetail();
    }
  }

  setCurrentPage(page: number) {
    this.currentPage.set(page);
    this.expandedId.set(null);
    this.scrollToFeed();
  }

  prevPage() {
    this.currentPage.set(Math.max(1, this.currentPage() - 1));
    this.expandedId.set(null);
    this.scrollToFeed();
  }

  nextPage() {
    this.currentPage.set(Math.min(this.totalPages(), this.currentPage() + 1));
    this.expandedId.set(null);
    this.scrollToFeed();
  }

  openUrl(url: string) {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  splitParagraphs(text = ''): string[] {
    return text.split('\n').filter(Boolean);
  }

  getClassificationItems(item: any) {
    return [
      { label: 'Sección principal', value: item.section },
      { label: 'Ruta de sección', value: item.sectionPath },
      { label: 'Práctica musical', value: item.practice },
      { label: 'Categoría', value: item.category },
      { label: 'Subcategoría', value: item.subcategory },
      { label: 'Ámbito regional', value: item.regionalScope }
    ].filter((detail) => detail.value);
  }

  getBibliographicItems(item: any) {
    return [
      { label: 'Año o rango', value: item.year },
      { label: 'Tipo de publicación', value: item.publicationType },
      { label: 'Autor', value: item.author },
      { label: 'Autor corporativo', value: item.corporateAuthor },
      { label: 'Créditos adicionales', value: item.credits },
      { label: 'ISBN', value: item.isbn },
      { label: 'ISMN', value: item.ismn },
      { label: 'Tamaño o formato', value: item.formatSize },
      { label: 'Páginas', value: item.pages },
      { label: 'Duración', value: item.duration }
    ].filter((detail) => detail.value);
  }

  getAvailabilityItems(item: any) {
    return [
      { label: 'Ubicación de la publicación', value: item.location },
      { label: 'URL', value: item.url }
    ].filter((detail) => detail.value);
  }

  getCategoryCount(catId: string): number {
    if (catId === 'all') return this.resources().length;
    return this.resources().filter((r) => r.section === catId).length;
  }

  private scrollToFeed() {
    setTimeout(() => {
      const element = document.getElementById('editorial-catalogo');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  }
}
