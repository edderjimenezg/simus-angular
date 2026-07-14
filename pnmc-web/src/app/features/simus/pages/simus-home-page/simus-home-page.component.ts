import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LucideArrowRight, LucideBookOpen, LucideCircleHelp, LucideLandmark, LucideMap, LucideMusic2, LucideUsersRound } from '@lucide/angular';
import { NavigationService } from '../../../../core/services/navigation.service';
import { PageHeroComponent } from '../../../../shared/components/ui/page-hero/page-hero.component';

@Component({
  selector: 'app-simus-home-page',
  standalone: true,
  imports: [CommonModule, PageHeroComponent, LucideArrowRight, LucideBookOpen, LucideCircleHelp, LucideLandmark, LucideMap, LucideMusic2, LucideUsersRound],
  templateUrl: './simus-home-page.component.html',
})
export class SimusHomePageComponent {
  private readonly navigation = inject(NavigationService);
  readonly accessPaths = [
    { title: 'Explora el ecosistema', description: 'Consulta escuelas, actores, procesos e infraestructuras musicales.', icon: 'ecosystem', action: () => this.go('ecosistema') },
    { title: 'Lee el territorio', description: 'Conecta las categorías y su presencia geográfica en el Mapa Ecosistémico.', icon: 'map', action: () => this.navigation.navigate('mapa') },
    { title: 'Consulta contenidos', description: 'Accede a publicaciones, documentos y recursos desde Editorial.', icon: 'editorial', action: () => this.navigation.navigate('editorial') },
    { title: 'Mantente al día', description: 'Conoce noticias y agenda de la actividad musical del país.', icon: 'news', action: () => this.navigation.navigate('noticias') },
  ];
  readonly simusPaths = [
    { title: 'Acerca de SIMUS', description: 'Conoce el propósito, alcance y principios de este sistema de información.', icon: 'about', path: 'simus/acerca-de' },
    { title: 'Ayuda y tutoriales', description: 'Encuentra orientación para navegar, consultar y participar en SIMUS.', icon: 'help', path: 'simus/ayuda' },
    { title: 'Ingresar', description: 'Accede a los espacios de gestión y actualización de información.', icon: 'login', path: 'simus/ingresar' },
    { title: 'Registrar o actualizar', description: 'Aporta o actualiza los datos de tu proceso, organización o infraestructura.', icon: 'participate', path: 'simus/participa' },
  ];
  go(path: string): void { this.navigation.routerNavigate(path); }
}
