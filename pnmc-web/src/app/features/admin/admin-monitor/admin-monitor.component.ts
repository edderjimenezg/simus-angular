import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideDatabase, 
  LucideBuilding2, 
  LucideUsersRound, 
  LucideMap, 
  LucideRefreshCw, 
  LucideServer, 
  LucideGlobe, 
  LucideClock, 
  LucideClipboardList,
  LucideFileText
} from '@lucide/angular';
import { ADMIN_STATUS } from '../domain/admin-config';

const STATUS_BAR_COLORS: Record<string, string> = {
  borrador:            '#94a3b8',
  en_evaluacion:       '#3b82f6',
  ajustes_solicitados: '#f59e0b',
  aprobado:            '#10b981',
  publicado:           '#8b5cf6',
  rechazado:           '#ef4444',
  archivado:           '#e2e8f0',
};

@Component({
  selector: 'app-admin-monitor',
  standalone: true,
  imports: [
    CommonModule,
    LucideDatabase,
    LucideBuilding2,
    LucideUsersRound,
    LucideMap,
    LucideRefreshCw,
    LucideServer,
    LucideGlobe,
    LucideClock,
    LucideClipboardList,
    LucideFileText
  ],
  templateUrl: './admin-monitor.component.html',
  styleUrls: ['./admin-monitor.component.css']
})
export class AdminMonitorComponent {
  @Input() monitor: any = null;
  @Input() apiStatus = '';
  @Input() divipola: any = {};
  @Input() userRole = 'webmaster';
  @Output() refresh = new EventEmitter<void>();

  // Icons for templates
  LucideDatabase = LucideDatabase;
  LucideBuilding2 = LucideBuilding2;
  LucideUsersRound = LucideUsersRound;
  LucideMap = LucideMap;
  LucideRefreshCw = LucideRefreshCw;
  LucideServer = LucideServer;
  LucideGlobe = LucideGlobe;
  LucideClock = LucideClock;
  LucideClipboardList = LucideClipboardList;
  LucideFileText = LucideFileText;

  get modules() {
    return this.monitor?.modules || [];
  }

  get totals() {
    return this.monitor?.totals || {};
  }

  get api() {
    return this.monitor?.api || {};
  }

  get database() {
    return this.monitor?.database || {};
  }

  get apiOk() {
    return this.api.status === 'ok';
  }

  get dbOk() {
    return this.database.status === 'ok';
  }

  get groupedModules() {
    const acc: Record<string, any[]> = {};
    for (const mod of this.modules) {
      const area = mod.area || 'General';
      if (!acc[area]) acc[area] = [];
      acc[area].push(mod);
    }
    return acc;
  }

  get kpis() {
    return [
      { label: 'Registros totales', value: this.totals.records ?? 0, detail: 'Suma de módulos operativos', icon: LucideDatabase, accent: '#6366f1' },
      { label: 'Entidades base', value: this.totals.entities ?? 0, detail: 'Modelo central Entidades', icon: LucideBuilding2, accent: '#0ea5e9' },
      { label: 'Usuarios admin', value: this.totals.users ?? 0, detail: 'Cuentas administrativas activas', icon: LucideUsersRound, accent: '#00DA5E' },
      { label: 'Territorios', value: this.totals.territories ?? 0, detail: 'DIVIPOLA: depts. y municipios', icon: LucideMap, accent: '#f59e0b' },
    ];
  }

  get leaderKpis() {
    return [
      { label: 'Registros Totales', value: this.totals.records ?? 93, detail: 'Suma de módulos', icon: LucideDatabase, accent: '#6366f1' },
      { label: 'En evaluación', value: this.totals.pendingReview ?? 8, detail: 'Requieren análisis del equipo', icon: LucideClipboardList, accent: '#f59e0b' },
      { label: 'Borradores', value: 12, detail: 'Guardados por colaboradores', icon: LucideFileText, accent: '#94a3b8' },
      { label: 'Departamentos Activos', value: Object.keys(this.divipola || {}).length || 32, detail: 'Cobertura DIVIPOLA', icon: LucideMap, accent: '#00DA5E' },
    ];
  }

  get departmentStats() {
    return [
      { name: 'Cundinamarca', count: 24, percentage: 80, accent: '#6366f1' },
      { name: 'Antioquia', count: 18, percentage: 60, accent: '#0ea5e9' },
      { name: 'Valle del Cauca', count: 15, percentage: 50, accent: '#00DA5E' },
      { name: 'Atlántico', count: 12, percentage: 40, accent: '#f59e0b' },
      { name: 'Bolívar', count: 9, percentage: 30, accent: '#ef4444' },
      { name: 'Santander', count: 7, percentage: 23, accent: '#ec4899' },
      { name: 'Nariño', count: 5, percentage: 16, accent: '#8b5cf6' },
      { name: 'Boyacá', count: 3, percentage: 10, accent: '#14b8a6' },
    ];
  }

  get recentAudit() {
    return this.monitor?.recentAudit || [];
  }

  statusText(status: string): string {
    return ADMIN_STATUS[status]?.label || status || 'Sin estado';
  }

  relativeTime(dateStr: string): string {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs} h`;
    const days = Math.floor(hrs / 24);
    return `hace ${days} d`;
  }

  getSegments(statuses: any[] = [], total = 0) {
    if (total === 0) return [];
    const segments: any[] = [];
    let currentX = 0;
    
    for (const s of statuses) {
      if (s.count > 0) {
        const width = (s.count / total) * 100;
        segments.push({
          code: s.code,
          x: currentX,
          width,
          color: STATUS_BAR_COLORS[s.code] || '#94a3b8'
        });
        currentX += width;
      }
    }
    return segments;
  }

  getApprovedCount(mod: any): number {
    return mod.statuses?.find((s: any) => s.code === 'aprobado')?.count || 0;
  }

  getPendingReviewCount(mod: any): number {
    const enEval = mod.statuses?.find((s: any) => s.code === 'en_evaluacion')?.count || 0;
    const ajustSol = mod.statuses?.find((s: any) => s.code === 'ajustes_solicitados')?.count || 0;
    return enEval + ajustSol;
  }

  getHealthColor(ok: boolean, latency: number): string {
    if (!ok) return 'bg-red-400';
    if (latency > 500) return 'bg-amber-400';
    if (latency > 200) return 'bg-yellow-400';
    return 'bg-emerald-400';
  }

  getHealthLabel(ok: boolean, latency: number): string {
    if (!ok) return 'Error';
    if (latency > 500) return 'Lento';
    if (latency > 200) return 'Regular';
    return 'OK';
  }
}
