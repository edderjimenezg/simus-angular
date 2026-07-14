import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideArrowRight } from '@lucide/angular';
import { NavigationService } from '../../core/services/navigation.service';
import { WebTextsService } from '../../core/services/web-texts.service';
import { HOME_HERO_IMAGES } from '../../core/services/media-library.config';
import { PageHeroComponent } from '../../shared/components/ui/page-hero/page-hero.component';
import { TagComponent } from '../../shared/components/ui/tag/tag.component';
import { FooterComponent } from '../../shared/components/layout/footer/footer.component';

import { PNMCPreviewSectionComponent } from './components/pnmc-preview-section/pnmc-preview-section.component';
import { HomeStrategiesSectionComponent } from './components/home-strategies-section/home-strategies-section.component';
import { HomeMediaBannerComponent } from './components/home-media-banner/home-media-banner.component';
import { MapaEcosistemicoPreviewComponent } from './components/mapa-ecosistemico-preview/mapa-ecosistemico-preview.component';
import { NoticiasAgendaPreviewComponent } from './components/noticias-agenda-preview/noticias-agenda-preview.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    PageHeroComponent,
    TagComponent,
    FooterComponent,
    PNMCPreviewSectionComponent,
    HomeStrategiesSectionComponent,
    HomeMediaBannerComponent,
    MapaEcosistemicoPreviewComponent,
    NoticiasAgendaPreviewComponent,
    LucideArrowRight
  ],
  templateUrl: './home.component.html',
  styles: []
})
export class HomeComponent implements OnInit {
  navigationService = inject(NavigationService);
  webTexts = inject(WebTextsService);

  homeHeroBgImage = '';
  scrollTargetElement: HTMLElement | null = null;

  ngOnInit() {
    const images = HOME_HERO_IMAGES;
    this.homeHeroBgImage = images[Math.floor(Math.random() * images.length)] || '';
  }

  getWebText(key: string, fallback: string): string {
    return this.webTexts.getWebText(key) || fallback;
  }

  navigateTo(pageId: string) {
    this.navigationService.navigate(pageId);
  }

  navigateToArticle(article: any) {
    this.navigationService.navigateToArticle(article);
  }

  navigateToAgendaEvent(eventId: string) {
    this.navigationService.navigateToAgendaEvent(eventId);
  }

  navigateToMapLayer(layerName: string) {
    this.navigationService.navigateToMapLayer(layerName);
  }

  openMapParticipation() {
    this.navigationService.openMapParticipation();
  }

  registerScrollTarget(element: HTMLElement) {
    this.scrollTargetElement = element;
  }
}
