import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentWrapperComponent } from '../../../../shared/components/ui/content-wrapper/content-wrapper.component';
import { WebTextsService } from '../../../../core/services/web-texts.service';
import { RANDOM_GALLERY_IMAGES } from '../../../../core/services/media-library.config';
import { LucideChevronRight, LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'app-pnmc-preview-section',
  standalone: true,
  imports: [
    CommonModule,
    ContentWrapperComponent,
    LucideChevronRight,
    LucideArrowRight
  ],
  templateUrl: './pnmc-preview-section.component.html',
  styles: []
})
export class PNMCPreviewSectionComponent {
  private webTexts = inject(WebTextsService);

  @Input() scrollTargetElement: HTMLElement | null = null;
  @Output() onNavigate = new EventEmitter<string>();

  artistsImage = RANDOM_GALLERY_IMAGES[5] || '';

  getWebText(key: string, fallback: string): string {
    return this.webTexts.getWebText(key) || fallback;
  }

  navigateToSection(page: string, sectionId: string): void {
    this.onNavigate.emit(page);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        const offset = 112; // NAVBAR_SCROLL_OFFSET
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        });
      }
    }, 150);
  }

  navigateToPage(page: string): void {
    this.onNavigate.emit(page);
  }
}
