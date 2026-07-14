import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { LucideArrowRight, LucideBookOpen, LucideBuilding2, LucideLibrary, LucideMap, LucideMapPin, LucideMusic2, LucideUsers2 } from '@lucide/angular';
import { MapDataService } from '../../../../core/services/map-data.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { PageHeroComponent } from '../../../../shared/components/ui/page-hero/page-hero.component';

type EcosystemCategory = {
  title: string;
  route: string;
  layer: string;
  description: string;
  status: 'Disponible' | 'Próximamente';
  icon: 'school' | 'groups' | 'agents' | 'spaces' | 'festivals' | 'markets' | 'networks' | 'luthier';
  countKey?: 'schools' | 'festivals' | 'markets' | 'networks' | 'lutiers';
  group: 'actors' | 'processes';
};

@Component({
  selector: 'app-ecosystem-page',
  standalone: true,
  imports: [CommonModule, PageHeroComponent, LucideArrowRight, LucideBookOpen, LucideBuilding2, LucideLibrary, LucideMap, LucideMapPin, LucideMusic2, LucideUsers2],
  templateUrl: './ecosystem-page.component.html',
})
export class EcosystemPageComponent implements OnInit {
  private readonly mapData = inject(MapDataService);
  private readonly navigation = inject(NavigationService);
  readonly recordsByType = signal<Record<string, number>>({});
  readonly isLoading = signal(true);

  readonly categories: EcosystemCategory[] = [
    { title: 'Escuelas de música', route: 'ecosistema/escuelas', layer: 'Escuelas de Música', description: 'Procesos formativos, capacidades pedagógicas y presencia territorial.', status: 'Disponible', icon: 'school', countKey: 'schools', group: 'actors' },
    { title: 'Agrupaciones', route: 'ecosistema/agrupaciones', layer: 'General', description: 'Procesos colectivos, formatos y prácticas musicales.', status: 'Próximamente', icon: 'groups', group: 'actors' },
    { title: 'Agentes', route: 'ecosistema/agentes', layer: 'General', description: 'Personas, organizaciones y oficios que articulan el sector.', status: 'Próximamente', icon: 'agents', group: 'actors' },
    { title: 'Escenarios', route: 'ecosistema/escenarios', layer: 'General', description: 'Infraestructura y lugares para creación y circulación.', status: 'Próximamente', icon: 'spaces', group: 'actors' },
    { title: 'Festivales', route: 'ecosistema/festivales', layer: 'Festivales', description: 'Celebraciones, encuentros y circuitos de circulación.', status: 'Próximamente', icon: 'festivals', countKey: 'festivals', group: 'processes' },
    { title: 'Mercados musicales', route: 'ecosistema/mercados-musicales', layer: 'Mercados Musicales', description: 'Nodos de intercambio, visibilización y profesionalización.', status: 'Próximamente', icon: 'markets', countKey: 'markets', group: 'processes' },
    { title: 'Redes y documentación', route: 'ecosistema/redes-documentacion', layer: 'Redes de Documentación', description: 'Memoria, archivos, investigación y redes de conocimiento.', status: 'Próximamente', icon: 'networks', countKey: 'networks', group: 'processes' },
    { title: 'Lutería', route: 'ecosistema/luteria', layer: 'Lutieres', description: 'Saberes, construcción y reparación de instrumentos.', status: 'Próximamente', icon: 'luthier', countKey: 'lutiers', group: 'processes' },
  ];

  readonly totalRecords = computed(() => Object.values(this.recordsByType()).reduce((sum, value) => sum + value, 0));
  readonly categoriesWithRecords = computed(() => Object.values(this.recordsByType()).filter(value => value > 0).length);
  readonly actorCategories = computed(() => this.categories.filter(category => category.group === 'actors'));
  readonly processCategories = computed(() => this.categories.filter(category => category.group === 'processes'));

  ngOnInit(): void {
    this.mapData.fetchMapCountsBundle().subscribe({
      next: data => {
        this.recordsByType.set({
          schools: data.schoolRecords?.length || 0,
          festivals: data.festivalRecords?.length || 0,
          markets: data.marketRecords?.length || 0,
          networks: data.redesRecords?.length || 0,
          lutiers: data.luthierRecords?.length || 0,
        });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  goHome(): void { this.navigation.navigate('home'); }
  count(category: EcosystemCategory): number { return category.countKey ? this.recordsByType()[category.countKey] || 0 : 0; }
  openCategory(category: EcosystemCategory): void { this.navigation.routerNavigate(category.route); }
  openMap(layer = 'General'): void { this.navigation.navigateToMapLayer(layer, { targetView: 'map' }); }
  openParticipation(): void { this.navigation.routerNavigate('simus/participa'); }
}
