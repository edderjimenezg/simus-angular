import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideClipboardList, 
  LucideCheckCircle2, 
  LucideAlertTriangle 
} from '@lucide/angular';
import { ADMIN_STATUS } from '../domain/admin-config';

@Component({
  selector: 'app-admin-review-queue',
  standalone: true,
  imports: [
    CommonModule,
    LucideClipboardList,
    LucideCheckCircle2,
    LucideAlertTriangle
  ],
  templateUrl: './admin-review-queue.component.html',
  styleUrls: ['./admin-review-queue.component.css']
})
export class AdminReviewQueueComponent {
  @Input() records: any[] = [];
  @Input() modules: any[] = [];
  @Input() canApprove = false;
  @Output() onStatusChange = new EventEmitter<{ id: string; status: string }>();
  @Output() onReviewClick = new EventEmitter<any>();

  // Icons
  LucideClipboardList = LucideClipboardList;
  LucideCheckCircle2 = LucideCheckCircle2;
  LucideAlertTriangle = LucideAlertTriangle;

  get moduleMap() {
    const map = new Map<string, any>();
    for (const m of this.modules) {
      map.set(m.id, m);
    }
    return map;
  }

  get reviewRecords() {
    return this.records.filter((r) => ['borrador', 'en_evaluacion', 'ajustes_solicitados'].includes(r.status));
  }

  statusText(status: string): string {
    return ADMIN_STATUS[status]?.label || status || 'Sin estado';
  }

  statusPillClass(status: string): string {
    const STYLES: Record<string, string> = {
      borrador:            'text-slate-600 bg-slate-100 border border-slate-200',
      en_evaluacion:       'text-blue-700 bg-blue-50 border border-blue-200',
      ajustes_solicitados: 'text-amber-700 bg-amber-50 border border-amber-200',
      aprobado:            'text-emerald-700 bg-emerald-50 border border-emerald-200',
      publicado:           'text-violet-700 bg-violet-50 border border-violet-200',
      rechazado:           'text-red-700 bg-red-50 border border-red-200',
      archivado:           'text-slate-400 bg-slate-50 border border-slate-100',
    };
    return STYLES[status] || STYLES['borrador'];
  }

  getModuleName(moduleId: string): string {
    const m = this.moduleMap.get(moduleId);
    return m ? m.label : moduleId;
  }

  getJoinedLocations(importedData: any): string {
    if (!importedData) return '';
    return [importedData.department, importedData.municipality].filter(Boolean).join(' / ');
  }

  getDuplicateCandidateTitle(candidates: any[]): string {
    if (!candidates || !candidates.length) return 'Registro similar';
    const first = candidates[0];
    return first.record?.title || first.record?.name || 'Registro similar';
  }

  getDuplicateCandidateReason(candidates: any[]): string {
    if (!candidates || !candidates.length) return 'Requiere comparación campo a campo.';
    return candidates[0].reason || 'Requiere comparación campo a campo.';
  }
}
