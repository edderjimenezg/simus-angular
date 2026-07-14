import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationService, PAGE_IDS } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-strategy-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './strategy-page.component.html',
})
export class StrategyPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly navigation = inject(NavigationService);
  readonly strategy = computed(() => {
    const kind = this.route.snapshot.data['strategy'];
    return kind === 'investigacion' ? {
      eyebrow: 'Estrategia de investigación',
      title: 'Territorios Sonoros',
      description: 'Una ruta para reconocer, documentar y fortalecer la diversidad musical desde los territorios de Colombia.',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1600&auto=format&fit=crop',
      pillars: ['Investigación situada', 'Memoria y documentación', 'Conocimiento colaborativo'],
      text: 'Territorios Sonoros conecta comunidades, investigadores, portadores de saberes e instituciones para comprender las prácticas musicales en su contexto y convertir ese conocimiento en acciones de política pública.'
    } : {
      eyebrow: 'Estrategia de circulación',
      title: 'Celebra la Música',
      description: 'Un movimiento nacional que articula escenarios, agentes y comunidades para hacer visible la diversidad sonora del país.',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1600&auto=format&fit=crop',
      pillars: ['Circulación nacional', 'Encuentro comunitario', 'Diversidad sonora'],
      text: 'Celebra la Música promueve encuentros, conciertos y procesos de circulación que conectan las músicas de Colombia con públicos, territorios y nuevas oportunidades de colaboración.'
    };
  });
  readonly mapPage = PAGE_IDS.mapa;
}
