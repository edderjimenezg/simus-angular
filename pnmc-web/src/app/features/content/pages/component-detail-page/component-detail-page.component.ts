import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { LucideArrowUpRight, LucideBookOpen, LucideCalendar, LucideMapPin } from '@lucide/angular';
import { ejesDataGlobal, EjeComponent } from '../../../../core/services/ejes-data.config';
import { NavigationService, PAGE_IDS } from '../../../../core/services/navigation.service';
import { CatalogService } from '../../../../core/services/catalog.service';
import { STRATEGIES_DATA } from '../../../../core/services/strategies-data.config';
import { TagComponent } from '../../../../shared/components/ui/tag/tag.component';
import { CompactHeroComponent } from '../../../../shared/components/ui/compact-hero/compact-hero.component';

@Component({
  selector: 'app-component-detail-page',
  standalone: true,
  imports: [CommonModule, TagComponent, CompactHeroComponent, LucideArrowUpRight, LucideBookOpen, LucideCalendar, LucideMapPin],
  templateUrl: './component-detail-page.component.html',
})
export class ComponentDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  readonly navigation = inject(NavigationService);
  readonly pageId = PAGE_IDS.ejes;

  // Reactivo a los parámetros de ruta: al navegar entre componentes (misma ruta,
  // distinto parámetro) Angular reutiliza la instancia, por lo que leer el snapshot
  // una sola vez dejaba la vista congelada. Con un signal se actualiza en cada cambio.
  private readonly paramMap = toSignal(this.route.paramMap);
  readonly componentId = computed(() => this.paramMap()?.get('componentId') ?? '');

  // Catálogo editorial para vincular productos relacionados con el componente.
  readonly editorialResources = signal<any[]>([]);
  readonly editorialLoading = signal<boolean>(true);
  readonly editorialError = signal<boolean>(false);

  // Agenda para vincular eventos relacionados con el componente.
  readonly agendaEvents = signal<any[]>([]);
  readonly agendaLoading = signal<boolean>(true);
  readonly agendaError = signal<boolean>(false);

  readonly match = computed(() => {
    for (const eje of ejesDataGlobal) {
      const component = eje.components.find(item => item.id === this.componentId());
      if (component) return { eje, component };
    }
    return null;
  });

  // Productos del acervo editorial cuya etiqueta/categoría coincide con el componente.
  readonly relatedResources = computed(() => {
    const current = this.match();
    if (!current) return [];
    const tokens = this.matchTokens(current.component);
    if (!tokens.length) return [];

    return this.editorialResources()
      .filter((resource) => {
        const tagText = this.normalize(
          [
            ...(resource.keywords || []),
            resource.section,
            resource.sectionPath,
            resource.category,
            resource.subcategory,
            resource.practice,
          ]
            .filter(Boolean)
            .join(' '),
        );
        return tokens.some((token) => tagText.includes(token));
      })
      .slice(0, 6);
  });

  // Eventos de agenda cuya etiqueta/categoría coincide con el componente.
  readonly relatedAgenda = computed(() => {
    const current = this.match();
    if (!current) return [];
    const tokens = this.matchTokens(current.component);
    if (!tokens.length) return [];

    return this.agendaEvents()
      .filter((event) => {
        const tagText = this.normalize(
          [...(event.tags || []), event.category].filter(Boolean).join(' '),
        );
        return tokens.some((token) => tagText.includes(token));
      })
      .slice(0, 5);
  });

  // Estrategias del PNMC vinculadas a este componente (mismo estilo que el home).
  readonly relatedStrategies = computed(() => {
    const target = `comp-${this.componentId()}`;
    return STRATEGIES_DATA.filter((strategy) => strategy.componentId === target);
  });

  onStrategyNavigate(navigatePath: string): void {
    if (navigatePath.startsWith('comp-')) {
      this.navigation.navigateComponent(navigatePath.substring(5));
    } else {
      this.navigation.navigate(navigatePath);
    }
  }

  ngOnInit(): void {
    this.catalog.fetchEditorialCatalog().subscribe({
      next: (res) => {
        this.editorialResources.set(Array.isArray(res?.items) ? res.items : []);
        this.editorialLoading.set(false);
      },
      error: () => {
        this.editorialError.set(true);
        this.editorialLoading.set(false);
      },
    });

    this.catalog.fetchAgendaEvents().subscribe({
      next: (res) => {
        this.agendaEvents.set(Array.isArray(res?.items) ? res.items : []);
        this.agendaLoading.set(false);
      },
      error: () => {
        this.agendaError.set(true);
        this.agendaLoading.set(false);
      },
    });
  }

  openAgendaEvent(event: any): void {
    if (event?.id) {
      this.navigation.navigateToAgendaEvent(event.id);
    } else {
      this.navigation.navigate('agenda');
    }
  }

  goToAgenda(): void {
    this.navigation.navigate('agenda');
  }

  openEditorialResource(resource: any): void {
    if (resource?.id) {
      this.navigation.navigateToEditorialResource(resource.id);
    } else {
      this.navigation.navigate('editorial');
    }
  }

  goToEditorial(): void {
    this.navigation.navigate('editorial');
  }

  // Palabras/etiquetas con las que se busca el vínculo editorial.
  private readonly genericTokens = new Set([
    'musica', 'musicas', 'musical', 'musicales', 'musicos', 'cultura', 'cultural',
    'culturales', 'plan', 'nacional', 'convivencia', 'sonora', 'sonoro', 'derechos',
  ]);

  private matchTokens(component: EjeComponent): string[] {
    const tags = component.relatedTags ?? [];
    if (tags.length) {
      return tags.map((tag) => this.normalize(tag)).filter(Boolean);
    }
    return this.normalize(component.name)
      .split(' ')
      .filter((word) => word.length >= 6 && !this.genericTokens.has(word));
  }

  private normalize(value: string): string {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
}
