import { Component, Input, signal, computed, VERSION, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideCpu, 
  LucideMap, 
  LucideSearch,
  LucideDatabase
} from '@lucide/angular';
import { ADMIN_MODULES, ADMIN_AREAS, ADMIN_ROLES } from '../domain/admin-config';

@Component({
  selector: 'app-admin-system-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideCpu,
    LucideMap,
    LucideSearch,
    LucideDatabase
  ],
  templateUrl: './admin-system-panel.component.html',
  styleUrls: ['./admin-system-panel.component.css']
})
export class AdminSystemPanelComponent {
  // Inputs
  @Input() schemaOnline = false;
  @Input() stats: any = null;
  
  @Input() set divipola(val: any) {
    this._divipola.set(val || {});
  }
  _divipola = signal<any>({});

  // Search state
  divipolaSearch = signal<string>('');

  // Icon references
  LucideCpu = LucideCpu;
  LucideMap = LucideMap;
  LucideSearch = LucideSearch;
  LucideDatabase = LucideDatabase;

  // Metadata references
  ADMIN_MODULES = ADMIN_MODULES;
  ADMIN_AREAS = ADMIN_AREAS;
  ADMIN_ROLES = ADMIN_ROLES;

  // Computed DIVIPOLA counts
  deptCount = computed(() => Object.keys(this._divipola() || {}).length);
  
  munCount = computed(() => {
    return Object.values(this._divipola() || {}).reduce((acc: number, munis: any) => {
      return acc + (Array.isArray(munis) ? munis.length : 0);
    }, 0);
  });

  // Filtered DIVIPOLA department/municipality entries
  filteredDepts = computed(() => {
    const q = this.divipolaSearch().toLowerCase().trim();
    const entries = Object.entries(this._divipola() || {});
    if (!q) {
      return entries.slice(0, 10);
    }
    return entries.filter(([dept]) => dept.toLowerCase().includes(q)).slice(0, 10);
  });

  // Environment variables mock/labels
  envVariables = [
    { label: 'ANGULAR_VERSION', value: VERSION.full },
    { label: 'NODE_ENV', value: (window as any).webpackHotUpdate ? 'development' : 'production' },
    { label: 'Build tool', value: 'Angular CLI' },
    { label: 'API_BASE_URL', value: '/api/v1 (proxy local)' }
  ];

  // Helper arrays
  toArray(val: any): string[] {
    return Array.isArray(val) ? val : [];
  }
}
