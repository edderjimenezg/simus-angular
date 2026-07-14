import { Component, OnInit, OnDestroy, inject, signal, computed, HostListener } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { 
  LucideArrowLeft, 
  LucideArrowRight, 
  LucideArrowUpRight, 
  LucideCalendar, 
  LucideChevronDown, 
  LucideClock, 
  LucideFilter, 
  LucideMail, 
  LucidePlus, 
  LucideSearch, 
  LucideShare2, 
  LucideBookmark, 
  LucideCheckCircle2, 
  LucideLayoutGrid, 
  LucideList 
} from '@lucide/angular';
import { WebTextsService } from '../../../../core/services/web-texts.service';
import { BackendDataService } from '../../../../core/services/backend-data.service';
import { PageHeroComponent } from '../../../../shared/components/ui/page-hero/page-hero.component';
import { TagComponent } from '../../../../shared/components/ui/tag/tag.component';
import { 
  LoadingStateComponent, 
  ErrorStateComponent, 
  EmptyStateComponent 
} from '../../../../shared/components/ui/remote-state/remote-state.component';
import { 
  getNewsDateKeys, 
  splitHeroHeadline 
} from '../../../../core/services/data-transforms';
import { buildNewsItemFromRecord } from '../../../../core/services/media-library.config';

@Component({
  selector: 'app-noticias-page',
  standalone: true,
  imports: [
    CommonModule,
    PageHeroComponent,
    TagComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    LucideArrowLeft,
    LucideArrowRight,
    LucideArrowUpRight,
    LucideCalendar,
    LucideChevronDown,
    LucideClock,
    LucideFilter,
    LucideMail,
    LucidePlus,
    LucideSearch,
    LucideShare2,
    LucideBookmark,
    LucideCheckCircle2,
    LucideLayoutGrid,
    LucideList
  ],
  templateUrl: './noticias-page.component.html'
})
export class NoticiasPageComponent implements OnInit, OnDestroy {
  Math = Math;
  private webTexts = inject(WebTextsService);
  private backendData = inject(BackendDataService);
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Reactivo a la ruta: /noticias/:articleId identifica la noticia abierta,
  // así el artículo es enlazable, compartible y sobrevive a un refresco.
  private readonly routeParamMap = toSignal(this.route.paramMap);
  private readonly articleIdParam = computed(() => this.routeParamMap()?.get('articleId') ?? null);

  readonly localSelectedArticle = computed(() => {
    const id = this.articleIdParam();
    if (!id) return null;
    return this.newsData().find((item) => String(item.id) === id) ?? null;
  });

  newsSearchTerm = signal<string>('');
  newsCategoryFilter = signal<string>('all');
  newsSortOrder = signal<string>('newest');
  currentPage = signal<number>(1);
  viewLayout = signal<'grid' | 'list'>('grid');
  readingProgress = signal<number>(0);

  isLoading = false;
  isRefreshing = false;
  isError = false;
  error: any = null;

  newsData = signal<any[]>([]);

  // Subscription state
  isSubscribed = false;
  subscriberEmail = '';
  subscriptionError = '';

  ITEMS_PER_PAGE = 6;

  // Derivadas usando computed()
  featuredPrimary = computed(() => this.newsData()[0] || null);
  featuredSecondary = computed(() => this.newsData().slice(1, 3));
  newsListPool = computed(() => this.newsData().slice(3));

  newsCategoryOptions = computed(() => {
    const categories = this.newsListPool().map((item) => item.category).filter(Boolean);
    return [...new Set(categories)];
  });

  filteredListNews = computed(() => {
    const pool = this.newsListPool();
    const term = this.newsSearchTerm().trim().toLowerCase();
    const category = this.newsCategoryFilter();
    const sortOrder = this.newsSortOrder();

    return [...pool]
      .filter((item) => {
        const searchableText = [item.title, item.desc, item.category, item.content]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesSearch = !term || searchableText.includes(term);
        if (!matchesSearch) return false;

        const matchesCategory = category === 'all' || item.category === category;

        return matchesCategory;
      })
      .sort((leftItem, rightItem) => {
        const leftDate = getNewsDateKeys(leftItem.date)?.dateKey || '';
        const rightDate = getNewsDateKeys(rightItem.date)?.dateKey || '';

        if (leftDate === rightDate) {
          return leftItem.title.localeCompare(rightItem.title, 'es', { sensitivity: 'base' });
        }

        return sortOrder === 'oldest'
          ? leftDate.localeCompare(rightDate)
          : rightDate.localeCompare(leftDate);
      });
  });

  totalPages = computed(() => {
    const count = this.filteredListNews().length;
    return Math.max(1, Math.ceil(count / this.ITEMS_PER_PAGE));
  });

  paginatedNews = computed(() => {
    const list = this.filteredListNews();
    const page = Math.min(this.currentPage(), this.totalPages());
    const startIndex = (page - 1) * this.ITEMS_PER_PAGE;
    return list.slice(startIndex, startIndex + this.ITEMS_PER_PAGE);
  });

  selectedArticleHeroCopy = computed(() => {
    const article = this.localSelectedArticle();
    return article ? splitHeroHeadline(article.title || '') : { title: '', titleAccent: '' };
  });

  selectedArticleSafeContent = computed<SafeHtml>(() => {
    const article = this.localSelectedArticle();
    return article?.content
      ? this.sanitizer.bypassSecurityTrustHtml(article.content)
      : '';
  });

  ngOnInit() {
    this.loadNewsData();
  }

  ngOnDestroy() {
    // Scroll listener se remueve automáticamente gracias al HostListener de Angular
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.localSelectedArticle()) return;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const totalHeight = scrollHeight - clientHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      this.readingProgress.set(progress);
    }
  }

  loadNewsData(isRefresh = false) {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }
    this.isError = false;
    this.error = null;

    this.backendData.fetchNewsRecords({ limit: 100 }).subscribe({
      next: (res) => {
        this.newsData.set((res.records || []).map((rec) => buildNewsItemFromRecord(rec)));
        this.isLoading = false;
        this.isRefreshing = false;
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
    this.loadNewsData(false);
  }

  getWebText(key: string, fallback = ''): string {
    return this.webTexts.getWebText(key) || fallback;
  }

  handleSelectArticle(article: any) {
    this.readingProgress.set(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (article?.id != null) {
      this.router.navigate(['/noticias', article.id]);
    } else {
      this.router.navigate(['/noticias']);
    }
  }

  setCategoryFilter(category: string) {
    this.newsCategoryFilter.set(category);
    this.currentPage.set(1);
    this.scrollToFeed();
  }

  setSortOrder(order: string) {
    this.newsSortOrder.set(order);
    this.currentPage.set(1);
    this.scrollToFeed();
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.newsSearchTerm.set(input.value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.newsSearchTerm.set('');
    this.currentPage.set(1);
  }

  setViewLayout(layout: 'grid' | 'list') {
    this.viewLayout.set(layout);
  }

  setCurrentPage(page: number) {
    this.currentPage.set(page);
    this.scrollToFeed();
  }

  prevPage() {
    this.currentPage.set(Math.max(1, this.currentPage() - 1));
    this.scrollToFeed();
  }

  nextPage() {
    this.currentPage.set(Math.min(this.totalPages(), this.currentPage() + 1));
    this.scrollToFeed();
  }

  resetAllFilters() {
    this.newsSearchTerm.set('');
    this.newsCategoryFilter.set('all');
    this.newsSortOrder.set('newest');
    this.currentPage.set(1);
    this.scrollToFeed();
  }

  onEmailChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.subscriberEmail = input.value;
    this.subscriptionError = '';
  }

  handleSubscribeSubmit(event: Event) {
    event.preventDefault();
    if (!this.subscriberEmail || !this.subscriberEmail.includes('@')) {
      this.subscriptionError = 'Por favor, ingresa una dirección de correo válida.';
      return;
    }
    this.subscriptionError = '';
    this.isSubscribed = true;
  }

  calculateReadingTime(content = ''): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  getCategoryCount(cat: string): number {
    return this.newsListPool().filter(item => item.category === cat).length;
  }

  private scrollToFeed() {
    setTimeout(() => {
      const element = document.getElementById('news-feed-section');
      if (element) {
        const yOffset = -100;
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  }
}
