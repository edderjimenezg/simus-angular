import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideArrowLeft, 
  LucideArrowRight, 
  LucideChevronLeft, 
  LucideChevronRight, 
  LucideDownload, 
  LucideLayoutGrid, 
  LucideList, 
  LucideMapPin, 
  LucideCalendar, 
  LucideImages, 
  LucideSearch, 
  LucideX, 
  LucideZoomIn, 
  LucideFolderOpen, 
  LucideLayers,
  LucideLoader2
} from '@lucide/angular';
import { WebTextsService } from '../../../../core/services/web-texts.service';
import { CatalogService } from '../../../../core/services/catalog.service';
import {
  LoadingStateComponent, 
  ErrorStateComponent, 
  EmptyStateComponent 
} from '../../../../shared/components/ui/remote-state/remote-state.component';
import { MEDIA_LIBRARY } from '../../../../core/services/media-library.config';

@Component({
  selector: 'app-galeria-page',
  standalone: true,
  imports: [
    CommonModule,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    LucideArrowLeft,
    LucideArrowRight,
    LucideChevronLeft,
    LucideChevronRight,
    LucideDownload,
    LucideLayoutGrid,
    LucideList,
    LucideMapPin,
    LucideCalendar,
    LucideImages,
    LucideSearch,
    LucideX,
    LucideZoomIn,
    LucideFolderOpen,
    LucideLayers,
    LucideLoader2
  ],
  templateUrl: './galeria-page.component.html'
})
export class GaleriaPageComponent implements OnInit {
  private webTexts = inject(WebTextsService);
  private catalogService = inject(CatalogService);

  activeAlbumId = signal<string | null>(null);
  categoryFilter = signal<string>('all');
  albumSearch = signal<string>('');
  viewLayout = signal<'grid' | 'list'>('grid');
  lightbox = signal<{ items: any[]; index: number | null; contextTitle: string }>({ items: [], index: null, contextTitle: '' });
  visiblePhotosCount = signal<number>(24);
  albums = signal<any[]>([]);

  isLoading = true;
  isError = false;
  error: any = null;

  // Keyboard navigation for Lightbox and Album overlays
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.lightbox().index !== null) {
      if (event.key === 'Escape') this.closeLightbox();
      else if (event.key === 'ArrowLeft') this.prevPhoto();
      else if (event.key === 'ArrowRight') this.nextPhoto();
    } else if (this.activeAlbumId()) {
      if (event.key === 'Escape') this.closeAlbum();
    }
  }

  // Computed properties
  sortedAlbums = computed(() => {
    return [...this.albums()].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.title.localeCompare(b.title, 'es');
    });
  });

  categories = computed(() => {
    const list = this.sortedAlbums();
    const cats = [...new Set(list.map((a) => a.category).filter(Boolean))];
    return cats;
  });

  filteredAlbums = computed(() => {
    const list = this.sortedAlbums();
    const cat = this.categoryFilter();
    const q = this.albumSearch().trim().toLowerCase();

    return list.filter((album) => {
      const matchCat = cat === 'all' || album.category === cat;
      const matchSearch = !q || album.title.toLowerCase().includes(q) || (album.location || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  });

  featuredAlbums = computed(() => {
    const list = this.sortedAlbums();
    const expl = list.filter((a) => a.featured);
    return (expl.length > 0 ? expl : list).slice(0, 4);
  });

  activeAlbum = computed(() => {
    const albumId = this.activeAlbumId();
    if (!albumId) return null;
    return this.sortedAlbums().find((a) => a.id === albumId) || null;
  });

  activeAlbumSections = computed(() => {
    const album = this.activeAlbum();
    if (!album) return [];
    const sects = (album.sections || []).filter((s: any) => s.photos?.length > 0);
    if (sects.length === 0) {
      return [{ id: 'general', title: 'General', photos: album.photos || [] }];
    }
    return sects;
  });

  hasMultipleSections = computed(() => {
    return this.activeAlbumSections().length > 1;
  });

  activeLightboxPhoto = computed(() => {
    const lb = this.lightbox();
    if (lb.index === null) return null;
    return lb.items[lb.index] || null;
  });

  isLightboxVideo = computed(() => {
    const photo = this.activeLightboxPhoto();
    if (!photo) return false;
    return photo.src.toLowerCase().endsWith('.mp4') || photo.type === 'video';
  });

  ngOnInit() {
    this.loadAlbums();
  }

  loadAlbums() {
    this.isLoading = true;
    this.isError = false;
    this.error = null;

    this.catalogService.fetchGalleryAlbums().subscribe({
      next: (res) => {
        this.albums.set(this.normalizeGalleryAlbums(res));
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err;
        this.isError = true;
        this.isLoading = false;
      }
    });
  }

  retry() {
    this.loadAlbums();
  }

  getWebText(key: string, fallback = ''): string {
    return this.webTexts.getWebText(key) || fallback;
  }

  getAlbumCover(album: any): string {
    return album?.cover || album?.photos?.[0]?.src || MEDIA_LIBRARY.fieldworkWide;
  }

  openAlbum(albumId: string) {
    this.activeAlbumId.set(albumId);
    this.visiblePhotosCount.set(24);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden';
  }

  closeAlbum() {
    this.activeAlbumId.set(null);
    this.visiblePhotosCount.set(24);
    document.body.style.overflow = '';
  }

  openLightbox(items: any[], index: number, contextTitle = '') {
    if (!items?.[index]) return;
    this.lightbox.set({ items, index, contextTitle });
    document.body.style.overflow = 'hidden';

    // Scroll thumbnail strip
    setTimeout(() => {
      const container = document.getElementById('lb-thumbnail-strip');
      const activeThumb = document.getElementById(`lb-thumb-${index}`);
      if (container && activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 100);
  }

  closeLightbox() {
    this.lightbox.set({ items: [], index: null, contextTitle: '' });
    if (!this.activeAlbumId()) {
      document.body.style.overflow = '';
    }
  }

  prevPhoto() {
    const lb = this.lightbox();
    if (lb.index === null) return;
    const nextIndex = lb.index === 0 ? lb.items.length - 1 : lb.index - 1;
    this.setLightboxIndex(nextIndex);
  }

  nextPhoto() {
    const lb = this.lightbox();
    if (lb.index === null) return;
    const nextIndex = lb.index === lb.items.length - 1 ? 0 : lb.index + 1;
    this.setLightboxIndex(nextIndex);
  }

  setLightboxIndex(index: number) {
    this.lightbox.update((s) => ({ ...s, index }));
    
    // Scroll thumbnail strip
    setTimeout(() => {
      const container = document.getElementById('lb-thumbnail-strip');
      const activeThumb = document.getElementById(`lb-thumb-${index}`);
      if (container && activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 100);
  }

  isVideoFile(src = ''): boolean {
    return src.toLowerCase().endsWith('.mp4');
  }

  buildGalleryDownloadName(photo: any, index: number): string {
    const extensionMatch = String(photo?.src || '').match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    const extension = extensionMatch?.[1] || 'jpg';
    const titleToken = String(photo?.title || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `imagen-${index + 1}`;

    return `pnmc-galeria-${titleToken}.${extension}`;
  }

  private normalizeText(value: any, fallback = ''): string {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  private normalizeGalleryAlbums(albumsList: any[] = []): any[] {
    if (!Array.isArray(albumsList)) return [];

    return albumsList
      .map((album, albumIndex) => {
        const albumId = this.normalizeText(album?.id, `album-${albumIndex + 1}`);
        const albumTitle = this.normalizeText(album?.title, `Álbum ${albumIndex + 1}`);

        const sourceSections = Array.isArray(album?.sections) && album.sections.length > 0
          ? album.sections
          : [{
              id: 'general',
              title: 'General',
              type: 'general',
              photos: Array.isArray(album?.photos) ? album.photos : [],
            }];

        const sections = sourceSections.map((section: any, sectionIndex: number) => {
          const sectionId = this.normalizeText(section?.id, `${albumId}-section-${sectionIndex + 1}`);
          const sectionTitle = this.normalizeText(section?.title, `Sección ${sectionIndex + 1}`);
          const sectionType = this.normalizeText(section?.type, 'general');
          const sectionPhotos = Array.isArray(section?.photos) ? section.photos : [];

          const photos = sectionPhotos
            .map((photo: any, photoIndex: number) => {
              const src = this.normalizeText(photo?.src);
              if (!src) return null;

              const title = this.normalizeText(photo?.title, `${albumTitle} · ${sectionTitle} · Foto ${photoIndex + 1}`);

              return {
                id: this.normalizeText(photo?.id, `${albumId}-${sectionId}-${photoIndex + 1}`),
                src,
                title,
                alt: this.normalizeText(photo?.alt, title),
                description: this.normalizeText(photo?.description, ''),
                sectionId,
                sectionTitle,
                sectionType,
              };
            })
            .filter(Boolean);

          return {
            id: sectionId,
            title: sectionTitle,
            type: sectionType,
            photos,
          };
        }).filter((section: any) => section.photos.length > 0);

        const photos = sections.flatMap((section: any) => section.photos);
        const cover = this.normalizeText(
          album?.cover,
          photos[0]?.src || '',
        );

        return {
          id: albumId,
          title: albumTitle,
          category: this.normalizeText(album?.category, 'Archivo'),
          description: this.normalizeText(album?.description, ''),
          location: this.normalizeText(album?.location, ''),
          dateLabel: this.normalizeText(album?.dateLabel, ''),
          featured: Boolean(album?.featured),
          cover,
          sections,
          photos,
          photoCount: photos.length,
        };
      })
      .filter((album) => album.photos.length > 0 || album.cover);
  }
}
