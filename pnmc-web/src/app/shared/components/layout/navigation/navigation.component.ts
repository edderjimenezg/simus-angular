import { Component, Input, inject, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, PAGE_IDS } from '../../../../core/services/navigation.service';
import { WebTextsService } from '../../../../core/services/web-texts.service';
import { ejesDataGlobal } from '../../../../core/services/ejes-data.config';
import { 
  LucideChevronDown, 
  LucideChevronRight, 
  LucideMenu, 
  LucideX, 
  LucideArrowUpRight 
} from '@lucide/angular';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    LucideChevronDown,
    LucideChevronRight,
    LucideMenu,
    LucideX,
    LucideArrowUpRight
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  public navigationService = inject(NavigationService);
  private webTexts = inject(WebTextsService);

  @Input() scrolled = false;
  @Input() forceSolid = false;

  // Reactivo: Observamos signals del servicio
  activePage = this.navigationService.activePage;
  mobileMenuOpen = this.navigationService.mobileMenuOpen;
  activeNavDropdown = this.navigationService.activeNavDropdown;
  activeEjeMenuId = this.navigationService.activeEjeMenuId;

  // Enlaces de navegación traducidos dinámicamente
  resolvedNavigationLinks = computed(() => {
    return this.navigationService.getResolvedNavigationLinks();
  });

  primaryNavigationLinks = computed(() => {
    return this.resolvedNavigationLinks().filter(
      (link) => ![PAGE_IDS.mapa, PAGE_IDS.simus].includes(link.id)
    );
  });

  featuredNavigationLinks = computed(() => {
    return this.resolvedNavigationLinks().filter(
      (link) => [PAGE_IDS.mapa, PAGE_IDS.simus].includes(link.id)
    );
  });

  isDropdownLink(linkId: string): boolean {
    return ['ejes', PAGE_IDS.ecosistema, PAGE_IDS.simus].includes(linkId);
  }

  // Sección expandida dentro del menú móvil (acordeón de submenús)
  mobileExpandedSection = signal<string | null>(null);

  toggleMobileSection(linkId: string): void {
    this.mobileExpandedSection.update((current) => (current === linkId ? null : linkId));
  }

  // Sub-elementos del acordeón móvil según el enlace
  mobileSubItems(linkId: string): { label: string; action: () => void }[] {
    if (linkId === 'ejes') {
      return this.ejeNavigationGroups().map((group) => ({
        label: group.name,
        action: () => this.onNavigateToPageSection('ejes', group.sectionId),
      }));
    }
    if (linkId === PAGE_IDS.ecosistema) {
      return this.ecosystemMenuItems.map((item) => ({
        label: item.label,
        action: () => this.onNavigateToPath(item.page),
      }));
    }
    if (linkId === PAGE_IDS.simus) {
      return this.simusMenuItems.map((item) => ({
        label: item.label,
        action: () => this.onNavigateToPath(item.page),
      }));
    }
    return [];
  }

  // Apertura del mega-menú por foco de teclado (mouse sigue usando hover)
  onDropdownFocusIn(linkId: string): void {
    if (this.isDropdownLink(linkId)) {
      this.setActiveNavDropdown(linkId);
    }
  }

  onDropdownFocusOut(linkId: string, event: FocusEvent): void {
    if (!this.isDropdownLink(linkId)) return;
    const next = event.relatedTarget as Node | null;
    const current = event.currentTarget as HTMLElement | null;
    // Solo cerrar si el foco abandona por completo el contenedor del dropdown
    if (!next || !current || !current.contains(next)) {
      if (this.activeNavDropdown() === linkId) {
        this.setActiveNavDropdown(null);
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.activeNavDropdown()) {
      this.setActiveNavDropdown(null);
    }
    if (this.mobileMenuOpen()) {
      this.navigationService.setMobileMenuOpen(false);
    }
  }

  ecosystemMenuItems = [
    { label: 'Escuelas de música', page: 'ecosistema/escuelas', detail: 'Formación musical, cobertura e indicadores.' },
    { label: 'Agrupaciones', page: 'ecosistema/agrupaciones', detail: 'Procesos colectivos y prácticas musicales.' },
    { label: 'Agentes', page: 'ecosistema/agentes', detail: 'Personas y organizaciones del sector.' },
    { label: 'Escenarios', page: 'ecosistema/escenarios', detail: 'Infraestructura para la música.' },
    { label: 'Festivales', page: 'ecosistema/festivales', detail: 'Circulación y celebración territorial.' },
    { label: 'Mercados musicales', page: 'ecosistema/mercados-musicales', detail: 'Nodos de intercambio y circulación.' },
    { label: 'Redes y documentación', page: 'ecosistema/redes-documentacion', detail: 'Memoria, investigación y archivos.' },
    { label: 'Lutería', page: 'ecosistema/luteria', detail: 'Saberes, oficios e instrumentos.' },
  ];

  simusMenuItems = [
    { label: 'Acerca de SIMUS', page: 'simus/acerca-de', detail: 'Propósito y funcionamiento del sistema.' },
    { label: 'Ayuda y tutoriales', page: 'simus/ayuda', detail: 'Orientación para consultar y participar.' },
    { label: 'Ingresar', page: 'simus/ingresar', detail: 'Acceso a los espacios de gestión de información.' },
    { label: 'Registrar o actualizar', page: 'simus/participa', detail: 'Mantén actualizada la información territorial.' },
  ];

  // Mapeo dinámico de ejes para la barra de navegación con traducción del CMS
  ejeNavigationGroups = computed(() => {
    return ejesDataGlobal.map((group, idx) => {
      const dbTitle = this.webTexts.getWebText(`eje0${idx + 1}_title`);
      const name = dbTitle
        ? (dbTitle.length > 25 ? dbTitle.slice(0, 22) + '...' : dbTitle)
        : group.title;

      return {
        id: group.id,
        name,
        sectionId: idx === 0 ? 'musica-para-la-vida' : idx === 1 ? 'oficios-y-practicas' : 'gobernanza',
        components: group.components.map((comp, cIdx) => ({
          id: comp.id,
          name: this.webTexts.getWebText(`eje0${idx + 1}_c${cIdx + 1}_title`) || comp.name
        }))
      };
    });
  });

  // Eje activo actualmente en la previsualización del menú
  activeEjeGroup = computed(() => {
    const groups = this.ejeNavigationGroups();
    const currentId = this.activeEjeMenuId() || groups[0]?.id || null;
    return groups.find((g) => g.id === currentId) || groups[0];
  });

  isEjesRelatedPage = computed(() => {
    const page = this.activePage();
    return page === PAGE_IDS.ejes || page.startsWith('comp-');
  });

  isActiveLink(linkId: string): boolean {
    if (linkId === 'ejes') {
      return this.isEjesRelatedPage();
    }
    if (linkId === PAGE_IDS.ecosistema) return this.activePage() === PAGE_IDS.ecosistema;
    return this.activePage() === linkId;
  }

  getNavClass(): string {
    const isSolid = this.forceSolid || this.scrolled || this.mobileMenuOpen();
    return isSolid 
      ? 'py-4 bg-[#291242]/95 backdrop-blur-md shadow-lg border-b border-white/5' 
      : 'py-8 bg-transparent';
  }

  getPrimaryLinkClass(linkId: string): string {
    const active = this.isActiveLink(linkId) || this.activeNavDropdown() === linkId;
    return active ? 'text-[#00DA5E]' : 'text-white/72 hover:text-[#00DA5E]';
  }

  getEjeGroupClass(groupId: string): string {
    const isActive = this.activeEjeGroup().id === groupId;
    return isActive 
      ? 'bg-[#00DA5E] text-[#291242] shadow-sm' 
      : 'text-slate-500 hover:bg-white hover:text-[#291242] hover:shadow-sm';
  }

  getFeaturedLinkClass(linkId: string): string {
    const active = this.isActiveLink(linkId);
    if (linkId === 'mapa') {
      return active 
        ? 'bg-[#8BF784] text-[#291242]' 
        : 'bg-[#00DA5E] text-[#291242] hover:bg-[#8BF784]';
    } else {
      return active 
        ? 'bg-white text-[#291242]' 
        : 'border border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20';
    }
  }

  getMobileLinkClass(linkId: string): string {
    return this.isActiveLink(linkId) 
      ? 'text-[#00DA5E]' 
      : 'text-white/60 hover:text-[#00DA5E]';
  }

  getWebText(key: string, fallback: string): string {
    return this.webTexts.getWebText(key) || fallback;
  }

  onPageChange(pageId: string): void {
    this.navigationService.navigate(pageId);
  }

  onNavigateToPath(path: string): void {
    this.navigationService.setActiveNavDropdown(null);
    this.navigationService.setMobileMenuOpen(false);
    this.navigationService.routerNavigate(path);
  }

  onNavigateToPageSection(pageId: string, sectionId: string): void {
    this.navigationService.setActiveNavDropdown(null);
    this.navigationService.setMobileMenuOpen(false);
    this.navigationService.navigate(pageId);
    
    // Simular scroll demorado hacia la sección en la página destino
    setTimeout(() => {
      const targetElement = document.getElementById(sectionId);
      if (targetElement) {
        const offset = 112; // NAVBAR_SCROLL_OFFSET
        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        });
      }
    }, 220);
  }

  onNavigateToComponentFromMenu(componentId: string): void {
    this.navigationService.navigateComponent(componentId);
  }

  toggleMobileMenu(): void {
    this.navigationService.setMobileMenuOpen(!this.mobileMenuOpen());
  }

  setActiveNavDropdown(dropdown: string | null): void {
    this.navigationService.setActiveNavDropdown(dropdown);
  }

  setActiveEjeMenuId(ejeId: string | null): void {
    this.navigationService.setActiveEjeMenuId(ejeId);
  }
}
