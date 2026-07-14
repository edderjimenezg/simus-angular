import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../../core/services/navigation.service';
import { WebTextsService } from '../../../../core/services/web-texts.service';
import { ContentWrapperComponent } from '../../../../shared/components/ui/content-wrapper/content-wrapper.component';
import { TagComponent } from '../../../../shared/components/ui/tag/tag.component';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { STRATEGIES_DATA } from '../../../../core/services/strategies-data.config';

@Component({
  selector: 'app-home-strategies-section',
  standalone: true,
  imports: [
    CommonModule,
    ContentWrapperComponent,
    TagComponent,
    LucideChevronLeft,
    LucideChevronRight
  ],
  templateUrl: './home-strategies-section.component.html',
  styles: []
})
export class HomeStrategiesSectionComponent implements OnInit, OnDestroy {
  private navigationService = inject(NavigationService);
  private webTexts = inject(WebTextsService);

  startIndex = signal<number>(0);
  transitionEnabled = signal<boolean>(true);
  isPaused = signal<boolean>(false);

  private autoScrollIntervalId: any = null;

  // Carga reactiva de textos dinámicos desde CMS
  strategies = computed(() => {
    const keysMap: Record<string, string> = {
      'celebra-la-musica': 'celebra',
      'territorios-sonoros': 'territorios',
      'congreso-nacional': 'congreso',
      'tempos-memorias': 'tempos',
      'voces-saberes': 'voces',
      'red-jazz': 'jazz',
      'mercados-musicales': 'mercados',
      'mesas-participacion': 'mesas'
    };

    return STRATEGIES_DATA.map(card => {
      const shortKey = keysMap[card.id];
      if (shortKey) {
        return {
          ...card,
          tag: this.webTexts.getWebText(`strat_${shortKey}_tag`) || card.tag,
          title: this.webTexts.getWebText(`strat_${shortKey}_title`) || card.title,
          desc: this.webTexts.getWebText(`strat_${shortKey}_desc`) || card.desc
        };
      }
      return card;
    });
  });

  totalCards = computed(() => this.strategies().length);

  // Extendemos el array para un bucle sin fin (clonando las primeras 3 cartas)
  extendedCards = computed(() => {
    const data = this.strategies();
    return [...data, ...data.slice(0, 3)];
  });

  ngOnInit() {
    this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  getWebText(key: string, fallback: string): string {
    return this.webTexts.getWebText(key) || fallback;
  }

  startAutoScroll() {
    this.stopAutoScroll();
    this.autoScrollIntervalId = setInterval(() => {
      if (this.isPaused()) return;
      this.handleNext();
    }, 6000);
  }

  stopAutoScroll() {
    if (this.autoScrollIntervalId) {
      clearInterval(this.autoScrollIntervalId);
      this.autoScrollIntervalId = null;
    }
  }

  handlePrev() {
    this.startAutoScroll(); // reinicia intervalo
    if (!this.transitionEnabled()) return;

    const prevIndex = this.startIndex();
    const total = this.totalCards();

    if (prevIndex === 0) {
      this.transitionEnabled.set(false);
      this.startIndex.set(total);
      setTimeout(() => {
        this.transitionEnabled.set(true);
        this.startIndex.set(total - 1);
      }, 20);
    } else {
      this.startIndex.set(prevIndex - 1);
    }
  }

  handleNext() {
    if (!this.transitionEnabled()) return;

    const prevIndex = this.startIndex();
    const total = this.totalCards();

    if (prevIndex >= total) {
      this.transitionEnabled.set(false);
      this.startIndex.set(0);
      setTimeout(() => {
        this.transitionEnabled.set(true);
        this.startIndex.set(1);
      }, 20);
    } else {
      this.startIndex.set(prevIndex + 1);
    }
  }

  handleTransitionEnd() {
    const idx = this.startIndex();
    const total = this.totalCards();

    if (idx >= total) {
      this.transitionEnabled.set(false);
      this.startIndex.set(0);
      setTimeout(() => {
        this.transitionEnabled.set(true);
      }, 50);
    }
  }

  goToIndex(index: number) {
    this.startAutoScroll();
    this.startIndex.set(index);
  }

  onCardNavigate(navigatePath: string) {
    if (navigatePath.startsWith('comp-')) {
      const compId = navigatePath.substring(5);
      this.navigationService.navigateComponent(compId);
    } else {
      this.navigationService.navigate(navigatePath);
    }
  }

  onTagNavigate(event: MouseEvent, componentId: string) {
    event.stopPropagation();
    const compId = componentId.startsWith('comp-') ? componentId.substring(5) : componentId;
    this.navigationService.navigateComponent(compId);
  }

  setPaused(paused: boolean) {
    this.isPaused.set(paused);
  }
}
