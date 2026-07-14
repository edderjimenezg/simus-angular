import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, PAGE_IDS } from '../../../../core/services/navigation.service';
import { LucidePartyPopper } from '@lucide/angular';

@Component({
  selector: 'app-floating-button',
  standalone: true,
  imports: [CommonModule, LucidePartyPopper],
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.css']
})
export class FloatingButtonComponent {
  private navigationService = inject(NavigationService);
  activePage = this.navigationService.activePage;

  shouldShow = computed(() => {
    const page = this.activePage();
    // No mostrar en estrategia, administración, colaboradores o mapa.
    return page !== PAGE_IDS.estrategiaCirculacion && 
           page !== PAGE_IDS.admin && 
           page !== PAGE_IDS.colaboradores && 
           page !== PAGE_IDS.mapa;
  });

  navigateToStrategy() {
    this.navigationService.navigate(PAGE_IDS.estrategiaCirculacion);
  }
}
