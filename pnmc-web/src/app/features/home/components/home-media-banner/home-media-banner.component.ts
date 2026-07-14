import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, PAGE_IDS } from '../../../../core/services/navigation.service';
import { HOME_BANNER_IMAGES } from '../../../../core/services/media-library.config';
import { LucideArrowRight } from '@lucide/angular';

interface Slide {
  url: string;
  tag: string;
  title: string;
  desc: string;
  cta: string;
  actionId: string;
}

@Component({
  selector: 'app-home-media-banner',
  standalone: true,
  imports: [CommonModule, LucideArrowRight],
  templateUrl: './home-media-banner.component.html',
  styles: []
})
export class HomeMediaBannerComponent implements OnInit, OnDestroy {
  private navigationService = inject(NavigationService);

  activeIndex = signal<number>(0);
  progress = signal<number>(0);

  private intervalId: any = null;

  slides: Slide[] = [
    {
      url: HOME_BANNER_IMAGES[0] || '',
      tag: 'SIMUS',
      title: 'Sé parte del SIMUS',
      desc: 'Registra tu proceso, organización, festival, mercado, colectivo, espacio o perfil individual en el Sistema de Información de la Música y haz parte de esta lectura territorial.',
      cta: 'Ser parte del SIMUS',
      actionId: 'mapa'
    },
    {
      url: HOME_BANNER_IMAGES[1] || '',
      tag: 'Celebra la Música',
      title: 'Activa la circulación musical en tu territorio',
      desc: 'Conoce la estrategia, los recursos y las rutas de participación de Celebra la Música como movimiento nacional de circulación y encuentro.',
      cta: 'Explorar estrategia',
      actionId: 'estrategia-circulacion'
    },
    {
      url: HOME_BANNER_IMAGES[2] || '',
      tag: 'Territorios Sonoros',
      title: 'Explora turismo cultural y músicas regionales',
      desc: 'Descubre cómo esta línea articula circulación, turismo cultural, saberes locales y experiencias territoriales en torno a la música.',
      cta: 'Ver territorios sonoros',
      actionId: 'estrategia-investigacion'
    }
  ];

  ngOnInit() {
    this.startBannerLoop();
  }

  ngOnDestroy() {
    this.stopBannerLoop();
  }

  startBannerLoop() {
    this.stopBannerLoop();
    this.intervalId = setInterval(() => {
      const current = this.progress();
      if (current >= 100) {
        this.activeIndex.set((this.activeIndex() + 1) % this.slides.length);
        this.progress.set(0);
      } else {
        this.progress.set(current + 1);
      }
    }, 60);
  }

  stopBannerLoop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  selectSlide(index: number) {
    this.activeIndex.set(index);
    this.progress.set(0);
    this.startBannerLoop(); // reinicia intervalo
  }

  onAction(actionId: string) {
    if (actionId === 'mapa') {
      // Navegar al mapa, activando la pestaña de participar
      this.navigationService.navigate(PAGE_IDS.mapa);
      // Podemos simular un trigger de participación después de la navegación
      setTimeout(() => {
        const joinBtn = document.querySelector('[data-open-participation="true"]') as HTMLButtonElement;
        if (joinBtn) joinBtn.click();
      }, 500);
    } else {
      this.navigationService.navigate(actionId);
    }
  }
}
