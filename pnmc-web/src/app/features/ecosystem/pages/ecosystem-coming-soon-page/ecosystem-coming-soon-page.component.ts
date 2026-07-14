import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideArrowRight, LucideConstruction, LucideMap } from '@lucide/angular';
import { NavigationService } from '../../../../core/services/navigation.service';
import { CompactHeroComponent } from '../../../../shared/components/ui/compact-hero/compact-hero.component';

const PAGES: Record<string, { eyebrow: string; title: string; description: string }> = {
  '': { eyebrow: 'SIMUS', title: 'Explora el ecosistema musical', description: 'Estamos preparando directorios y dashboards especializados para cada proceso, actor e infraestructura que compone el mapa ecosistémico.' },
  agrupaciones: { eyebrow: 'SIMUS', title: 'Agrupaciones musicales', description: 'Este directorio está en construcción. Próximamente permitirá explorar procesos colectivos, prácticas musicales y presencia territorial.' },
  agentes: { eyebrow: 'SIMUS', title: 'Agentes del sector', description: 'Este directorio está en construcción. Reunirá perfiles y organizaciones que fortalecen el ecosistema musical.' },
  escenarios: { eyebrow: 'SIMUS', title: 'Escenarios musicales', description: 'Esta página está en construcción. Permitirá consultar espacios e infraestructura para la creación y circulación musical.' },
  festivales: { eyebrow: 'SIMUS', title: 'Festivales', description: 'El directorio especializado está en construcción. Por ahora puedes consultar esta categoría en el Mapa Ecosistémico.' },
  'mercados-musicales': { eyebrow: 'SIMUS', title: 'Mercados musicales', description: 'El directorio especializado está en construcción. Por ahora puedes consultar esta categoría en el Mapa Ecosistémico.' },
  'redes-documentacion': { eyebrow: 'SIMUS', title: 'Redes y documentación', description: 'El directorio especializado está en construcción. Por ahora puedes consultar esta categoría en el Mapa Ecosistémico.' },
  luteria: { eyebrow: 'SIMUS', title: 'Lutería', description: 'El directorio especializado está en construcción. Por ahora puedes consultar esta categoría en el Mapa Ecosistémico.' },
  'acerca-de': { eyebrow: 'SIMUS', title: 'Acerca de SIMUS', description: 'Estamos preparando un espacio para explicar el propósito, el alcance y la forma de participación en el Sistema de Información de la Música.' },
  ayuda: { eyebrow: 'SIMUS', title: 'Ayuda y tutoriales', description: 'Estamos preparando guías para consultar, registrar y actualizar información dentro de SIMUS.' },
  ingresar: { eyebrow: 'SIMUS', title: 'Ingresar a SIMUS', description: 'Estamos preparando la experiencia de acceso para quienes gestionan, actualizan y validan información del ecosistema musical.' },
  participa: { eyebrow: 'SIMUS', title: 'Ser parte del SIMUS', description: 'Estamos preparando el acceso público para registrar tu proceso, organización o infraestructura dentro del Sistema de Información de la Música.' },
};

@Component({ selector: 'app-ecosystem-coming-soon-page', standalone: true, imports: [CommonModule, CompactHeroComponent, LucideArrowRight, LucideConstruction, LucideMap], templateUrl: './ecosystem-coming-soon-page.component.html' })
export class EcosystemComingSoonPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly navigation = inject(NavigationService);
  readonly page = computed(() => PAGES[this.route.snapshot.paramMap.get('module') || this.route.snapshot.paramMap.get('section') || ''] || PAGES['']);
  openMap(): void { this.navigation.navigate('mapa'); }
  openSchools(): void { this.navigation.routerNavigate('simus/escuelas'); }
  goBack(): void { this.navigation.navigate('simus'); }
}
