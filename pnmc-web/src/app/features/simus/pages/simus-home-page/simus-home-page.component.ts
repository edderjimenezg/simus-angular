import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { LucideArrowRight, LucideBookOpen, LucideBuilding2, LucideCircleHelp, LucideLandmark, LucideLibrary, LucideMap, LucideMapPin, LucideMusic2, LucideUsers2, LucideUsersRound } from '@lucide/angular';
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
  selector: 'app-simus-home-page',
  standalone: true,
  imports: [CommonModule, PageHeroComponent, LucideArrowRight, LucideBookOpen, LucideBuilding2, LucideCircleHelp, LucideLandmark, LucideLibrary, LucideMap, LucideMapPin, LucideMusic2, LucideUsers2, LucideUsersRound],
  templateUrl: './simus-home-page.component.html',
})
export class SimusHomePageComponent implements OnInit {
  private readonly navigation = inject(NavigationService);
  private readonly mapData = inject(MapDataService);

  readonly accessPaths = [
    { title: 'Lee el territorio', description: 'Conecta las categorías y su presencia geográfica en el Mapa Ecosistémico.', icon: 'map', action: () => this.navigation.navigate('mapa') },
    { title: 'Consulta contenidos', description: 'Accede a publicaciones, documentos y recursos desde Editorial.', icon: 'editorial', action: () => this.navigation.navigate('editorial') },
    { title: 'Mantente al día', description: 'Conoce noticias y agenda de la actividad musical del país.', icon: 'news', action: () => this.navigation.navigate('noticias') },
  ];
  readonly simusPaths = [
    { title: 'Acerca de SIMUS', description: 'Conoce el propósito, alcance y principios de este sistema de información.', icon: 'about', path: 'simus/acerca-de' },
    { title: 'Ayuda y tutoriales', description: 'Encuentra orientación para navegar, consultar y participar en SIMUS.', icon: 'help', path: 'simus/ayuda' },
    { title: 'Ingresar', description: 'Accede a los espacios de gestión y actualización de información.', icon: 'login', path: 'simus/ingresar' },
    { title: 'Ser parte del SIMUS', description: 'Registra o actualiza los datos de tu proceso, organización o infraestructura.', icon: 'participate', path: 'simus/participa' },
  ];

  // Ecosistema musical: antes una sección aparte, ahora vive dentro de SIMUS.
  readonly recordsByType = signal<Record<string, number>>({});
  readonly isLoadingEcosystem = signal(true);

  readonly ecosystemCategories: EcosystemCategory[] = [
    { title: 'Escuelas de música', route: 'simus/escuelas', layer: 'Escuelas de Música', description: 'Procesos formativos, capacidades pedagógicas y presencia territorial.', status: 'Disponible', icon: 'school', countKey: 'schools', group: 'actors' },
    { title: 'Agrupaciones', route: 'simus/agrupaciones', layer: 'General', description: 'Procesos colectivos, formatos y prácticas musicales.', status: 'Próximamente', icon: 'groups', group: 'actors' },
    { title: 'Agentes', route: 'simus/agentes', layer: 'General', description: 'Personas, organizaciones y oficios que articulan el sector.', status: 'Próximamente', icon: 'agents', group: 'actors' },
    { title: 'Escenarios', route: 'simus/escenarios', layer: 'General', description: 'Infraestructura y lugares para creación y circulación.', status: 'Próximamente', icon: 'spaces', group: 'actors' },
    { title: 'Festivales', route: 'simus/festivales', layer: 'Festivales', description: 'Celebraciones, encuentros y circuitos de circulación.', status: 'Próximamente', icon: 'festivals', countKey: 'festivals', group: 'processes' },
    { title: 'Mercados musicales', route: 'simus/mercados-musicales', layer: 'Mercados Musicales', description: 'Nodos de intercambio, visibilización y profesionalización.', status: 'Próximamente', icon: 'markets', countKey: 'markets', group: 'processes' },
    { title: 'Redes y documentación', route: 'simus/redes-documentacion', layer: 'Redes de Documentación', description: 'Memoria, archivos, investigación y redes de conocimiento.', status: 'Próximamente', icon: 'networks', countKey: 'networks', group: 'processes' },
    { title: 'Lutería', route: 'simus/luteria', layer: 'Lutieres', description: 'Saberes, construcción y reparación de instrumentos.', status: 'Próximamente', icon: 'luthier', countKey: 'lutiers', group: 'processes' },
  ];

  readonly actorCategories = computed(() => this.ecosystemCategories.filter(category => category.group === 'actors'));
  readonly processCategories = computed(() => this.ecosystemCategories.filter(category => category.group === 'processes'));

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
        this.isLoadingEcosystem.set(false);
      },
      error: () => this.isLoadingEcosystem.set(false),
    });
  }

  count(category: EcosystemCategory): number { return category.countKey ? this.recordsByType()[category.countKey] || 0 : 0; }
  openCategory(category: EcosystemCategory): void { this.navigation.routerNavigate(category.route); }
  openMapLayer(layer = 'General'): void { this.navigation.navigateToMapLayer(layer, { targetView: 'map' }); }
  openParticipation(): void { this.navigation.routerNavigate('simus/participa'); }

  go(path: string): void { this.navigation.routerNavigate(path); }
}
