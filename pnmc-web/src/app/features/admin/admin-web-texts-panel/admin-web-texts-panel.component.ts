import { Component, Input, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideSave, 
  LucideSearch,
  LucideCheckCircle2,
  LucideAlertCircle
} from '@lucide/angular';
import { WebTextsService } from '../../../core/services/web-texts.service';

@Component({
  selector: 'app-admin-web-texts-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideSave,
    LucideSearch,
    LucideCheckCircle2,
    LucideAlertCircle
  ],
  templateUrl: './admin-web-texts-panel.component.html',
  styleUrls: ['./admin-web-texts-panel.component.css']
})
export class AdminWebTextsPanelComponent {
  private webTextsService = inject(WebTextsService);

  @Input() set enabled(val: boolean) {
    this._enabled.set(val);
  }
  _enabled = signal<boolean>(false);

  @Input() session: any = null;

  // Selected State
  selectedPill = signal<string>('Home');
  selectedGroup = signal<string>('home_hero');
  searchQuery = signal<string>('');
  activeEjeSubTab = signal<string>('general');
  saveStatus = signal<{ type: string; message: string } | null>(null);

  // Form State
  formData = signal<Record<string, string>>({});
  originalDetails = signal<Record<string, any>>({});
  openHistoryKeys = signal<Record<string, boolean>>({});

  // Icon references
  LucideSave = LucideSave;
  LucideSearch = LucideSearch;
  LucideCheckCircle2 = LucideCheckCircle2;
  LucideAlertCircle = LucideAlertCircle;

  // Static Group Definitions
  GROUPS = [
    {
      id: 'home_hero',
      label: 'Home - Encabezado Principal (Hero)',
      section: 'Home',
      keys: ['home_tag', 'home_title', 'home_title_accent', 'home_description']
    },
    {
      id: 'home_ctas',
      label: 'Home - Botones de Llamado a la Acción',
      section: 'Home',
      keys: ['home_btn_about', 'home_btn_ejes']
    },
    {
      id: 'home_about',
      label: 'Home - Sección Identidad',
      section: 'Home',
      keys: ['home_about_bg_word', 'home_about_title', 'home_about_quote', 'home_about_desc']
    },
    {
      id: 'home_ejes',
      label: 'Home - Estructura Ejes Base',
      section: 'Home',
      keys: ['home_ejes_tag', 'home_ejes_title']
    },
    {
      id: 'home_bulletin',
      label: 'Home - Boletín y Redes',
      section: 'Home',
      keys: ['home_bulletin_title', 'home_bulletin_desc', 'home_bulletin_placeholder', 'home_bulletin_btn', 'home_social_title', 'home_social_desc']
    },
    {
      id: 'home_strategies_title',
      label: 'Home - Cabecera del Carrusel de Rutas',
      section: 'Home',
      keys: ['home_strat_tag', 'home_strat_title', 'home_strat_desc']
    },
    {
      id: 'home_strategies_cards',
      label: 'Home - Tarjetas del Carrusel de Rutas',
      section: 'Home',
      keys: [
        'strat_celebra_tag', 'strat_celebra_title', 'strat_celebra_desc',
        'strat_territorios_tag', 'strat_territorios_title', 'strat_territorios_desc',
        'strat_congreso_tag', 'strat_congreso_title', 'strat_congreso_desc',
        'strat_tempos_tag', 'strat_tempos_title', 'strat_tempos_desc',
        'strat_voces_tag', 'strat_voces_title', 'strat_voces_desc',
        'strat_jazz_tag', 'strat_jazz_title', 'strat_jazz_desc',
        'strat_mercados_tag', 'strat_mercados_title', 'strat_mercados_desc',
        'strat_mesas_tag', 'strat_mesas_title', 'strat_mesas_desc'
      ]
    },
    {
      id: 'agenda_hero',
      label: 'Agenda - Introducción de Sección',
      section: 'Agenda',
      keys: ['agenda_description']
    },
    {
      id: 'agenda_ui',
      label: 'Agenda - Interfaz y Filtros (UI)',
      section: 'Agenda',
      keys: [
        'agenda_filter_title', 'agenda_filter_fixed', 'agenda_filter_fixed_note', 'agenda_filter_date_exact', 'agenda_filter_date_month',
        'agenda_filter_day_label', 'agenda_filter_month_label', 'agenda_filter_all_months', 'agenda_filter_activity_type',
        'agenda_filter_department_label', 'agenda_filter_all_departments', 'agenda_filter_city_label', 'agenda_filter_city_select_dept',
        'agenda_filter_city_all_mun', 'agenda_filter_city_no_mun', 'agenda_filter_clear_btn', 'agenda_loading_title',
        'agenda_loading_desc', 'agenda_empty_title', 'agenda_empty_desc'
      ]
    },
    {
      id: 'news_hero',
      label: 'Noticias - Introducción de Sección',
      section: 'Noticias',
      keys: ['news_description']
    },
    {
      id: 'gallery_hero',
      label: 'Galería - Introducción de Sección',
      section: 'Galería',
      keys: ['gallery_description']
    },
    {
      id: 'gallery_ui',
      label: 'Galería - Interfaz y Buscador (UI)',
      section: 'Galería',
      keys: [
        'gallery_hero_title', 'gallery_search_placeholder', 'gallery_filter_category', 'gallery_filter_all_cats',
        'gallery_collection_title', 'gallery_explore_all', 'gallery_loading_title', 'gallery_loading_desc'
      ]
    },
    {
      id: 'editorial_hero',
      label: 'Editorial - Introducción de Sección',
      section: 'Editorial',
      keys: ['editorial_description']
    },
    {
      id: 'map_hero',
      label: 'Mapa Ecosistémico - Introducción del Geovisor',
      section: 'Mapa Ecosistémico',
      keys: ['map_description']
    },
    {
      id: 'eje1_details',
      label: 'Eje 1 - Música para la Vida',
      section: 'Ejes',
      keys: ['eje01_title', 'eje01_desc1', 'eje01_desc2', 'eje01_purpose', 'eje01_c1_title', 'eje01_c1_desc', 'eje01_c2_title', 'eje01_c2_desc']
    },
    {
      id: 'eje2_details',
      label: 'Eje 2 - Prácticas y Oficios',
      section: 'Ejes',
      keys: ['eje02_title', 'eje02_desc1', 'eje02_desc2', 'eje02_purpose', 'eje02_c1_title', 'eje02_c1_desc', 'eje02_c2_title', 'eje02_c2_desc', 'eje02_c3_title', 'eje02_c3_desc', 'eje02_c4_title', 'eje02_c4_desc', 'eje02_c5_title', 'eje02_c5_desc', 'eje02_c6_title', 'eje02_c6_desc']
    },
    {
      id: 'eje3_details',
      label: 'Eje 3 - Gobernanza',
      section: 'Ejes',
      keys: ['eje03_title', 'eje03_desc1', 'eje03_desc2', 'eje03_purpose', 'eje03_c1_title', 'eje03_c1_desc', 'eje03_c2_title', 'eje03_c2_desc']
    },
    {
      id: 'strategy_celebra_details',
      label: 'Estrategia - Celebra la Música',
      section: 'Estrategias',
      keys: ['strategy_celebra_hero_desc', 'strategy_celebra_section_title', 'strategy_celebra_intro', 'strategy_celebra_mission', 'strategy_celebra_edition_intro', 'strategy_celebra_edition_vision', 'strategy_celebra_edition_closing']
    },
    {
      id: 'general_nav_footer',
      label: 'Navegación y Footer - Enlaces y Contacto',
      section: 'Navegación y Footer',
      keys: [
        'nav_pnmc', 'nav_ejes', 'nav_editorial', 'nav_galeria', 'nav_noticias', 'nav_agenda', 'nav_mapa', 'nav_components_title',
        'footer_col2_title', 'footer_col2_address', 'footer_col2_schedule', 'footer_col2_phone', 'footer_col2_free_line',
        'footer_col3_title', 'footer_col3_address', 'footer_col3_schedule', 'footer_col3_email_label', 'footer_col3_email',
        'footer_col3_email_note', 'footer_col3_corruption_title', 'footer_col3_corruption_email', 'footer_col3_legal_title',
        'footer_col3_legal_email', 'footer_col4_services_title', 'footer_col4_about_title', 'footer_credits_text', 'footer_credits_tagline'
      ]
    }
  ];

  keysList = this.webTextsService.getWebTextsKeysList();

  constructor() {
    // Reactively load and sync the editor form data
    effect(() => {
      this.loadFormData();
    });

    // Reset axis sub-tab on group change
    effect(() => {
      this.selectedGroup();
      this.activeEjeSubTab.set('general');
    });
  }

  loadFormData() {
    const data: Record<string, string> = {};
    const details: Record<string, any> = {};
    this.keysList.forEach(k => {
      const detail = this.webTextsService.getWebTextDetails(k.key);
      data[k.key] = detail.content || '';
      details[k.key] = detail;
    });
    this.formData.set(data);
    this.originalDetails.set(details);
  }

  handleInputChange(key: string, val: string) {
    this.formData.update(prev => ({
      ...prev,
      [key]: val
    }));
  }

  handleRestoreVersion(key: string, content: string) {
    this.handleInputChange(key, content);
    this.saveStatus.set({
      type: 'info',
      message: 'Versión del historial restaurada en el editor. Recuerde hacer clic en Guardar para conservar los cambios.'
    });
    setTimeout(() => this.saveStatus.set(null), 4000);
  }

  handleSaveAllGroup(publish = true) {
    const author = this.session?.fullName || 'Webmaster';
    const group = this.GROUPS.find(g => g.id === this.selectedGroup());
    if (!group) return;

    let hasError = false;
    group.keys.forEach(key => {
      const limit = this.keysList.find(k => k.key === key)?.limit || 999;
      if ((this.formData()[key] || '').length > limit) {
        hasError = true;
      }
    });

    if (hasError) {
      this.saveStatus.set({
        type: 'error',
        message: 'No se puede guardar el grupo de textos porque uno o más campos exceden el límite de caracteres.'
      });
      setTimeout(() => this.saveStatus.set(null), 4000);
      return;
    }

    group.keys.forEach(key => {
      const status = publish ? 'publicado' : 'borrador';
      this.webTextsService.saveWebText(key, this.formData()[key] || '', status, author);
    });

    this.saveStatus.set({
      type: 'success',
      message: `El grupo de textos "${group.label}" ha sido ${publish ? 'guardado y publicado con éxito' : 'guardado en borrador'}.`
    });
    this.loadFormData(); // Reload to refresh details history
    setTimeout(() => this.saveStatus.set(null), 4000);
  }

  // Filter groups according to active horizontal pill and search query
  filteredGroups = computed(() => {
    const pill = this.selectedPill();
    const query = this.searchQuery().toLowerCase().trim();
    return this.GROUPS.filter(g => {
      const matchesPill = g.section === (pill === 'Mapa' ? 'Mapa Ecosistémico' : pill);
      const matchesSearch = g.label.toLowerCase().includes(query) || 
                            g.keys.some(k => k.toLowerCase().includes(query));
      return matchesPill && matchesSearch;
    });
  });

  activeGroupObj = computed(() => {
    return this.GROUPS.find(g => g.id === this.selectedGroup());
  });

  ejeSubTabsList = computed(() => {
    const activeGroup = this.activeGroupObj();
    if (!activeGroup || activeGroup.section !== 'Ejes') return [];

    let ejeId = '01';
    if (activeGroup.id === 'eje2_details') ejeId = '02';
    if (activeGroup.id === 'eje3_details') ejeId = '03';

    const tabs = [{ id: 'general', label: 'Información General' }];

    activeGroup.keys.forEach(k => {
      const match = k.match(new RegExp(`eje${ejeId}_c(\\d+)_title`));
      if (match) {
        const compNum = match[1];
        const compTitle = this.formData()[k] || `Componente ${compNum}`;
        tabs.push({
          id: `c${compNum}`,
          label: compTitle.length > 25 ? compTitle.slice(0, 23) + '...' : compTitle
        });
      }
    });

    return tabs;
  });

  filteredEjeKeys = computed(() => {
    const activeGroup = this.activeGroupObj();
    const subTab = this.activeEjeSubTab();
    if (!activeGroup || activeGroup.section !== 'Ejes') return [];

    let ejeId = '01';
    if (activeGroup.id === 'eje2_details') ejeId = '02';
    if (activeGroup.id === 'eje3_details') ejeId = '03';

    if (subTab === 'general') {
      return activeGroup.keys.filter(k => k.endsWith('_title') ? k === `eje${ejeId}_title` : !k.includes('_c'));
    } else {
      const compNum = subTab.replace('c', '');
      return activeGroup.keys.filter(k => k.includes(`_c${compNum}_`));
    }
  });

  keysToRender = computed(() => {
    const activeGroup = this.activeGroupObj();
    if (!activeGroup) return [];
    if (activeGroup.section === 'Ejes') {
      return this.filteredEjeKeys();
    }
    return activeGroup.keys;
  });

  // Pill Selection helper
  selectPill(pill: string) {
    this.selectedPill.set(pill);
    const firstGroup = this.GROUPS.find(g => g.section === (pill === 'Mapa' ? 'Mapa Ecosistémico' : pill));
    if (firstGroup) {
      this.selectedGroup.set(firstGroup.id);
    }
  }

  // Character limit lookups
  getCharLimit(key: string): number {
    return this.keysList.find(k => k.key === key)?.limit || 300;
  }

  getFieldLabel(key: string): string {
    return this.keysList.find(k => k.key === key)?.label || key;
  }

  getHistory(key: string): any[] {
    return this.originalDetails()[key]?.history || [];
  }

  toggleHistoryCollapse(key: string) {
    this.openHistoryKeys.update(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  isHistoryOpen(key: string): boolean {
    return !!this.openHistoryKeys()[key];
  }
}
