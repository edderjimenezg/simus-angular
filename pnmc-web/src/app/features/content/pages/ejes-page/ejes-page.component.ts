import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { LucideArrowUpRight, LucidePlay, LucideTarget } from '@lucide/angular';
import { EjeGroup, ejesDataGlobal } from '../../../../core/services/ejes-data.config';
import { NavigationService } from '../../../../core/services/navigation.service';
import { PageHeroComponent } from '../../../../shared/components/ui/page-hero/page-hero.component';
import { TagComponent } from '../../../../shared/components/ui/tag/tag.component';

@Component({
  selector: 'app-ejes-page',
  standalone: true,
  imports: [
    CommonModule,
    PageHeroComponent,
    TagComponent,
    LucideArrowUpRight,
    LucidePlay,
    LucideTarget,
  ],
  templateUrl: './ejes-page.component.html',
})
export class EjesPageComponent {
  readonly ejes = ejesDataGlobal;
  readonly expandedComponents = signal<Record<string, number>>(
    Object.fromEntries(ejesDataGlobal.map(eje => [eje.id, 0])),
  );
  private readonly navigation = inject(NavigationService);

  isExpanded(eje: EjeGroup, index: number): boolean {
    return this.expandedComponents()[eje.id] === index;
  }

  expandComponent(eje: EjeGroup, index: number): void {
    this.expandedComponents.update(expanded => ({ ...expanded, [eje.id]: index }));
  }

  openComponent(id: string): void {
    this.navigation.navigateComponent(id);
  }

  goHome(): void {
    this.navigation.navigate('home');
  }
}
