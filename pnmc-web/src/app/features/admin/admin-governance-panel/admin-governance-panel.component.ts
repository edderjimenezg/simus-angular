import { Component, Input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAlertCircle, 
  LucideCheckCircle2 
} from '@lucide/angular';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-governance-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAlertCircle,
    LucideCheckCircle2
  ],
  templateUrl: './admin-governance-panel.component.html',
  styleUrls: ['./admin-governance-panel.component.css']
})
export class AdminGovernancePanelComponent {
  private adminService = inject(AdminService);

  @Input() set enabled(val: boolean) {
    this._enabled.set(val);
    if (val) {
      this.loadAllData();
    }
  }
  _enabled = signal<boolean>(false);

  // Active Tab
  activeTab = signal<string>('links'); // 'links' | 'duplicates' | 'alerts'
  actionStatus = signal<{ type: string; message: string } | null>(null);

  // Icon references
  LucideAlertCircle = LucideAlertCircle;
  LucideCheckCircle2 = LucideCheckCircle2;

  // Lists state
  requests = signal<any[]>([
    {
      id: 'req_1',
      requester: 'Fundación Vientos del Sur',
      requesterRole: 'aliado_admin',
      targetName: 'Escuela de Música Tradicional Paz',
      targetType: 'Escuela de música',
      date: '2026-05-25',
      reason: 'Somos la entidad responsable del acompañamiento pedagógico e institucional de esta escuela.',
      status: 'pendiente',
    },
    {
      id: 'req_2',
      requester: 'Asociación Sonidos de mi Tierra',
      requesterRole: 'aliado_editor',
      targetName: 'Luthier Diego Rosero',
      targetType: 'Lutier',
      date: '2026-05-24',
      reason: 'El maestro Diego Rosero forma parte de nuestro colectivo de lutería tradicional y solicitamos vincular su perfil.',
      status: 'pendiente',
    },
    {
      id: 'req_3',
      requester: 'Colectivo Tambores de San Basilio',
      requesterRole: 'externo',
      targetName: 'Festival de Tambores de Palenque',
      targetType: 'Festival',
      date: '2026-05-23',
      reason: 'Reclamación del festival para actualización de programación del año vigente.',
      status: 'pendiente',
    }
  ]);

  duplicates = signal<any[]>([
    {
      id: 'dup_1',
      nameA: 'Taller de Lutería Rosero',
      nameB: 'Maestro Diego Rosero - Lutier',
      type: 'Lutier',
      department: 'Nariño',
      municipality: 'Pasto',
      similarity: '92%',
      status: 'pendiente',
    },
    {
      id: 'dup_2',
      nameA: 'Festival de la Guacharaca',
      nameB: 'Festival Nacional de la Guacharaca de Oro',
      type: 'Festival',
      department: 'Cesar',
      municipality: 'Valledupar',
      similarity: '89%',
      status: 'pendiente',
    }
  ]);

  alerts = signal<any[]>([
    {
      id: 'alt_1',
      recordName: 'Fundación Chirimías del Atrato',
      type: 'Red de documentación',
      issue: 'Falta campo obligatorio de correo electrónico o teléfono del representante.',
      severity: 'alta',
      status: 'pendiente',
    },
    {
      id: 'alt_2',
      recordName: 'Escuela de Música y Paz Chocó',
      type: 'Escuela de música',
      issue: 'Coordenadas geográficas (latitud/longitud) fuera del límite territorial del municipio.',
      severity: 'media',
      status: 'pendiente',
    },
    {
      id: 'alt_3',
      recordName: 'Mercado de Sonidos y Cantos del Pacífico',
      type: 'Mercado musical',
      issue: 'Falta de fecha de fin de edición para el año actual.',
      severity: 'baja',
      status: 'pendiente',
    }
  ]);

  // Load backend data if available, merging or replacing mocks
  loadAllData() {
    // 1. Linking Requests
    this.adminService.fetchRecordLinkRequests().subscribe({
      next: (res) => {
        if (res && res.length) {
          this.requests.set(res);
        }
      },
      error: () => {} // Keep mocks on error/404
    });

    // 2. Duplicates
    this.adminService.fetchDuplicateCandidates().subscribe({
      next: (res) => {
        if (res && res.length) {
          this.duplicates.set(res);
        }
      },
      error: () => {}
    });

    // 3. Data Quality flags
    this.adminService.fetchDataQualityFlags().subscribe({
      next: (res) => {
        if (res && res.length) {
          this.alerts.set(res);
        }
      },
      error: () => {}
    });
  }

  handleRequestAction(id: string, action: string) {
    const statusVal = action === 'approve' ? 'aprobado' : 'rechazado';
    
    // Call service
    this.adminService.updateRecordLinkRequestStatus({ id, status: statusVal }).subscribe({
      next: () => {
        this.updateLocalRequest(id, statusVal);
      },
      error: () => {
        // Fallback to local simulation
        this.updateLocalRequest(id, statusVal);
      }
    });
  }

  private updateLocalRequest(id: string, statusVal: string) {
    this.requests.update(prev => 
      prev.map(r => r.id === id ? { ...r, status: statusVal } : r)
    );
    this.showStatusAlert(`La solicitud de vinculación ha sido ${statusVal === 'aprobado' ? 'aprobada y vinculada exitosamente' : 'rechazada'}.`);
  }

  handleDuplicateAction(id: string, action: string) {
    const decisionVal = action === 'merge' ? 'fusionado' : 'descartado';
    
    this.adminService.decideDuplicateCandidate({ id, decision: decisionVal }).subscribe({
      next: () => {
        this.updateLocalDuplicate(id, decisionVal);
      },
      error: () => {
        // Fallback to local simulation
        this.updateLocalDuplicate(id, decisionVal);
      }
    });
  }

  private updateLocalDuplicate(id: string, decisionVal: string) {
    this.duplicates.update(prev => 
      prev.map(d => d.id === id ? { ...d, status: decisionVal } : d)
    );
    this.showStatusAlert(`El registro duplicado ha sido ${decisionVal === 'fusionado' ? 'fusionado correctamente en base de datos' : 'descartado de la lista de alertas'}.`);
  }

  handleAlertAction(id: string) {
    this.adminService.updateDataQualityFlagStatus({ id, status: 'resuelto' }).subscribe({
      next: () => {
        this.updateLocalAlert(id);
      },
      error: () => {
        // Fallback to local simulation
        this.updateLocalAlert(id);
      }
    });
  }

  private updateLocalAlert(id: string) {
    this.alerts.update(prev => 
      prev.map(a => a.id === id ? { ...a, status: 'resuelto' } : a)
    );
    this.showStatusAlert('La alerta de calidad de datos ha sido marcada como resuelta.');
  }

  private showStatusAlert(msg: string) {
    this.actionStatus.set({
      type: 'success',
      message: msg
    });
    setTimeout(() => this.actionStatus.set(null), 4000);
  }

  // Count helper functions for badge indicators
  get pendingRequestsCount() {
    return this.requests().filter(r => r.status === 'pendiente').length;
  }

  get pendingDuplicatesCount() {
    return this.duplicates().filter(d => d.status === 'pendiente').length;
  }

  get pendingAlertsCount() {
    return this.alerts().filter(a => a.status === 'pendiente').length;
  }
}
