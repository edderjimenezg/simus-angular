import { Component, Input, Output, EventEmitter, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideShieldCheck, 
  LucideBell, 
  LucideLock, 
  LucideLogOut, 
  LucideRefreshCw, 
  LucidePlus, 
  LucideChevronRight, 
  LucideCheckCircle2, 
  LucideAlertCircle, 
  LucideX, 
  LucideSave, 
  LucideMail, 
  LucideUser, 
  LucideCheckCircle,
  LucideSend
} from '@lucide/angular';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-external-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideShieldCheck,
    LucideBell,
    LucideLock,
    LucideLogOut,
    LucideRefreshCw,
    LucidePlus,
    LucideChevronRight,
    LucideCheckCircle2,
    LucideAlertCircle,
    LucideX,
    LucideSave,
    LucideMail,
    LucideUser,
    LucideCheckCircle,
    LucideSend
  ],
  templateUrl: './external-user-dashboard.component.html',
  styleUrls: ['./external-user-dashboard.component.css']
})
export class ExternalUserDashboardComponent {
  private adminService = inject(AdminService);

  @Input() session: any = null;
  @Input() divipola: any = {};
  @Input() notifications: any[] = [];

  @Output() onLogout = new EventEmitter<void>();
  @Output() onLocalReviewItem = new EventEmitter<any>();
  @Output() onNotificationRead = new EventEmitter<string>();
  @Output() onPasswordChange = new EventEmitter<any>();
  @Output() onProfileUpdate = new EventEmitter<any>();

  // State Signals
  activeTab = signal<string>('home'); // 'home' | 'characterization' | 'profile'
  characterizationStatus = signal<string>('pendiente');
  wizardStep = signal<number>(1);
  showProcessForm = signal<boolean>(false);
  selectedProcessType = signal<string>('festivals');
  editingProcessId = signal<string | null>(null);
  showNotifications = signal<boolean>(false);

  isScanning = signal<boolean>(false);
  potentialMatches = signal<any[]>([]);
  previewMatch = signal<any | null>(null);

  // Profile Form State
  profileForm = signal({
    fullName: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });
  profileSaving = signal<boolean>(false);
  profileSuccess = signal<boolean>(false);
  profileError = signal<string | null>(null);

  // Characterization Form State
  charForm = signal({
    legalName: '',
    nit: '',
    sector: 'Música',
    description: '',
    email: '',
    phone: '',
    website: '',
    instagram: '',
    coverage: 'municipal',
    department: '',
    municipality: '',
  });

  // Processes state
  myProcesses = signal<any[]>([
    { id: 'ext-proc-1', type: 'festivals', title: 'Festival de Cuerdas y Viento', status: 'aprobado', department: 'Boyacá', municipality: 'Villa de Leyva', updatedAt: '2026-05-10', owner: 'Organización Ecosistema' }
  ]);

  // Proceso Form State
  procForm = signal({
    name: '',
    description: '',
    department: '',
    municipality: '',
    organizer: '',
    contactEmail: '',
    contactPhone: '',
  });

  // Change Password Modal State
  showPasswordModal = signal<boolean>(false);
  passwordModalStep = signal<string>('request'); // 'request' | 'verify' | 'change'
  passwordModalCode = signal<string>('');
  passwordModalNewPassword = signal<string>('');
  passwordModalConfirmPassword = signal<string>('');
  passwordModalVerificationCode = signal<string>('');
  passwordModalMessage = signal<string>('');
  passwordModalStatus = signal<string>('idle');

  // Icons
  LucideShieldCheck = LucideShieldCheck;
  LucideBell = LucideBell;
  LucideLock = LucideLock;
  LucideLogOut = LucideLogOut;
  LucideRefreshCw = LucideRefreshCw;
  LucidePlus = LucidePlus;
  LucideChevronRight = LucideChevronRight;
  LucideCheckCircle2 = LucideCheckCircle2;
  LucideAlertCircle = LucideAlertCircle;
  LucideX = LucideX;
  LucideSave = LucideSave;
  LucideMail = LucideMail;
  LucideUser = LucideUser;
  LucideCheckCircle = LucideCheckCircle;
  LucideSend = LucideSend;

  constructor() {
    // Keep profile forms in sync with session updates
    effect(() => {
      const sess = this.session;
      if (sess) {
        this.profileForm.set({
          fullName: sess.fullName || '',
          email: sess.email || '',
          telefono: sess.telefono || '',
          password: '',
          confirmPassword: '',
        });
        this.charForm.update(prev => ({
          ...prev,
          email: sess.email || '',
        }));
        this.procForm.update(prev => ({
          ...prev,
          organizer: sess.fullName || '',
          contactEmail: sess.email || '',
        }));
        
        // Sync mock process owner label
        this.myProcesses.update(prev => 
          prev.map(p => ({ ...p, owner: sess.fullName }))
        );
      }
    });
  }

  // DIVIPOLA selection fields
  get departments(): string[] {
    return Object.keys(this.divipola || {});
  }

  get municipalities(): string[] {
    const dept = this.charForm().department;
    return dept ? this.divipola[dept] || [] : [];
  }

  get procMunicipalities(): string[] {
    const dept = this.procForm().department;
    return dept ? this.divipola[dept] || [] : [];
  }

  // Filtered notifications list
  get myNotifications() {
    if (!this.session?.email) return [];
    return (this.notifications || [])
      .filter(item => item.recipientEmail === this.session.email)
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }

  get unreadNotificationsCount(): number {
    return this.myNotifications.filter(item => !item.read).length;
  }

  get currentProcessNotification() {
    const processId = this.editingProcessId();
    if (!processId) return null;
    return this.myNotifications.find(item => item.recordId === processId);
  }

  get currentFieldAdjustments() {
    return this.currentProcessNotification?.fieldAdjustments || {};
  }

  hasFieldAdjustment(fieldName: string): boolean {
    return !!this.currentFieldAdjustments[fieldName];
  }

  // Profile submission
  handleSubmitProfile(e: Event) {
    e.preventDefault();
    const form = this.profileForm();
    if (!form.fullName.trim() || !form.email.trim()) {
      this.profileError.set('Nombre y correo electrónico son obligatorios.');
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      this.profileError.set('Las contraseñas no coinciden.');
      return;
    }
    if (form.password && form.password.length < 10) {
      this.profileError.set('La nueva contraseña debe tener mínimo 10 caracteres.');
      return;
    }

    this.profileSaving.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(false);

    // Call service updateProfile
    this.adminService.updateProfile({
      fullName: form.fullName,
      email: form.email,
      telefono: form.telefono,
      password: form.password || undefined,
    }).subscribe({
      next: (res) => {
        this.profileSaving.set(false);
        this.profileSuccess.set(true);
        this.onProfileUpdate.emit({
          fullName: form.fullName,
          email: form.email,
          telefono: form.telefono,
        });
        this.profileForm.update(prev => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
      },
      error: (err) => {
        this.profileSaving.set(false);
        this.profileError.set(err.message || 'Error al actualizar el perfil.');
      }
    });
  }

  // Organization Characterization
  handleCharacterizationSubmit(e: Event) {
    e.preventDefault();
    this.isScanning.set(true);
    this.activeTab.set('home');

    // Simulate standard background scans
    setTimeout(() => {
      this.isScanning.set(false);
      this.characterizationStatus.set('aprobado');

      const muni = this.charForm().municipality || 'su Municipio';
      const dept = this.charForm().department || 'su Departamento';

      this.potentialMatches.set([
        {
          id: 'match-1',
          type: 'musicSchools',
          title: `Escuela de Música Municipal de ${muni}`,
          department: dept,
          municipality: muni,
          directorName: 'Maestro Alejandro Tobar',
          students: 45,
          description: `Escuela formativa de música tradicional, cuerdas y vientos fundada para congregar a los jóvenes de ${muni} bajo directrices del Plan Nacional.`,
          contactEmail: `escuelamusica.${muni.toLowerCase().replace(/\s+/g, '')}@pnmc.gov.co`,
          contactPhone: '315 789 4433',
          trainingProcesses: 'Cuerdas pulsadas, flauta, percusión.',
          source: 'Historial de Mapeos PNMC (2018-2022)'
        },
        {
          id: 'match-2',
          type: 'festivals',
          title: `Festival de Música y Danza de ${muni}`,
          department: dept,
          municipality: muni,
          organizer: 'Colectivo Musical Local',
          description: `Festival regional anual con muestras folclóricas de ${muni} y agrupaciones invitadas de todo el departamento de ${dept}.`,
          contactEmail: `festival.${muni.toLowerCase().replace(/\s+/g, '')}@pnmc-aliados.org`,
          contactPhone: '320 445 6788',
          versionsCount: 8,
          source: 'Registro Nacional de Festivales PNMC (2024)'
        }
      ]);
    }, 3000);
  }

  // Claim match
  handleClaimMatch(match: any) {
    const processId = `claimed-${Date.now()}`;
    const claimedProcess = {
      id: processId,
      type: match.type,
      title: match.title,
      status: 'borrador',
      department: match.department,
      municipality: match.municipality,
      updatedAt: new Date().toISOString().slice(0, 10),
      owner: this.session?.fullName || 'Colaborador',
      description: match.description,
      contactEmail: this.session?.email || '',
      contactPhone: match.contactPhone || '',
      directorName: match.directorName || '',
      students: match.students || '',
      trainingProcesses: match.trainingProcesses || '',
      versionsCount: match.versionsCount || '',
      isClaimed: true
    };

    this.myProcesses.update(prev => [claimedProcess, ...prev]);
    this.potentialMatches.update(prev => prev.filter(item => item.id !== match.id));

    this.onLocalReviewItem.emit({
      id: claimedProcess.id,
      moduleId: claimedProcess.type,
      title: claimedProcess.title,
      owner: this.session?.fullName || 'Colaborador',
      status: 'borrador',
      updatedAt: claimedProcess.updatedAt,
      contactEmail: this.session?.email,
    });

    alert(`¡Registro vinculado con éxito! "${match.title}" ha sido cargado a su panel personal como "Borrador". Ahora puede editarlo para enriquecer la información histórica y volver a enviarlo a publicación.`);
  }

  handleDeclineMatch(id: string) {
    this.potentialMatches.update(prev => prev.filter(item => item.id !== id));
  }

  // Create new Process
  handleCreateProcess(e: Event) {
    e.preventDefault();
    const form = this.procForm();
    if (!form.name || !form.department) {
      alert('Nombre y Departamento son campos requeridos.');
      return;
    }
    const processId = this.editingProcessId() || `ext-proc-${Date.now()}`;
    const newProcess = {
      id: processId,
      type: this.selectedProcessType(),
      title: form.name,
      status: 'en_revision',
      department: form.department,
      municipality: form.municipality,
      updatedAt: new Date().toISOString().slice(0, 10),
      owner: this.session?.fullName || 'Colaborador',
      description: form.description,
      contactPhone: form.contactPhone,
      contactEmail: this.session?.email,
      reviewComments: null,
    };
    
    this.myProcesses.update(prev => [newProcess, ...prev.filter(item => item.id !== processId)]);

    this.onLocalReviewItem.emit({
      id: newProcess.id,
      moduleId: this.selectedProcessType(),
      title: newProcess.title,
      owner: this.session?.fullName || 'Colaborador',
      status: 'en_revision',
      updatedAt: newProcess.updatedAt,
      contactEmail: this.session?.email,
    });
    
    if (this.editingProcessId()) {
      this.onNotificationRead.emit(this.editingProcessId()!);
    }

    this.showProcessForm.set(false);
    this.editingProcessId.set(null);
    this.procForm.set({
      name: '',
      description: '',
      department: '',
      municipality: '',
      organizer: this.session?.fullName || '',
      contactEmail: this.session?.email || '',
      contactPhone: '',
    });
    
    alert(this.editingProcessId() ? 'Su proceso corregido ha sido reenviado a evaluación.' : 'Su proceso ha sido enviado a evaluación. Los administradores verificarán la información.');
  }

  // Visual helper
  statusPillClass(status: string): string {
    const STYLES: Record<string, string> = {
      borrador:            'text-slate-600 bg-slate-100 border border-slate-200',
      en_revision:         'text-blue-700 bg-blue-50 border border-blue-200',
      ajustes_solicitados: 'text-amber-700 bg-amber-50 border border-amber-200',
      aprobado:            'text-emerald-700 bg-emerald-50 border border-emerald-200',
      publicado:           'text-violet-700 bg-violet-50 border border-violet-200',
      rechazado:           'text-red-700 bg-red-50 border border-red-200',
      archivado:           'text-slate-400 bg-slate-50 border border-slate-100',
    };
    return STYLES[status] || STYLES['borrador'];
  }

  statusLabel(status: string): string {
    const LABELS: Record<string, string> = {
      borrador:            'Borrador',
      en_revision:         'En revisión',
      ajustes_solicitados: 'Ajustes solicitados',
      aprobado:            'Aprobado',
      publicado:           'Publicado',
      rechazado:           'Rechazado',
      archivado:           'Archivado',
    };
    return LABELS[status] || status;
  }

  AVATAR_COLORS = [
    'bg-violet-600', 'bg-indigo-600', 'bg-blue-600',
    'bg-teal-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600',
  ];

  getAvatarColor(name = ''): string {
    const hash = String(name).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return this.AVATAR_COLORS[hash % this.AVATAR_COLORS.length];
  }

  getInitials(name = ''): string {
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1 && parts[0]) return parts[0].slice(0, 2).toUpperCase();
    if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return 'U';
  }

  // Change Password Modal Actions
  openPasswordModal() {
    this.passwordModalStep.set(this.session?.role === 'webmaster' ? 'change' : 'request');
    this.passwordModalCode.set('');
    this.passwordModalNewPassword.set('');
    this.passwordModalConfirmPassword.set('');
    this.passwordModalVerificationCode.set('');
    this.passwordModalMessage.set('');
    this.passwordModalStatus.set('idle');
    this.showPasswordModal.set(true);
  }

  handleSendPasswordCode() {
    this.passwordModalStatus.set('sending');
    this.passwordModalMessage.set('Enviando código de verificación...');
    setTimeout(() => {
      const simulatedCode = '123456';
      this.passwordModalVerificationCode.set(simulatedCode);
      this.passwordModalStatus.set('code_sent');
      this.passwordModalMessage.set('Código de verificación "123456" enviado a su correo.');
      this.passwordModalStep.set('verify');
    }, 1200);
  }

  handleVerifyPasswordCode(e: Event) {
    e.preventDefault();
    const code = this.passwordModalCode();
    const expected = this.passwordModalVerificationCode();
    if (code === expected || code === '123456') {
      this.passwordModalStep.set('change');
      this.passwordModalMessage.set('Código verificado con éxito.');
    } else {
      this.passwordModalMessage.set('Código de verificación incorrecto. Intente de nuevo.');
    }
  }

  handleChangePasswordSubmit(e: Event) {
    e.preventDefault();
    const newPwd = this.passwordModalNewPassword();
    const confirmPwd = this.passwordModalConfirmPassword();
    if (!newPwd || newPwd.length < 5) {
      this.passwordModalMessage.set('La contraseña debe tener al menos 5 caracteres.');
      return;
    }
    if (newPwd !== confirmPwd) {
      this.passwordModalMessage.set('Las contraseñas no coinciden.');
      return;
    }
    this.passwordModalStatus.set('saving');
    this.passwordModalMessage.set('Guardando contraseña...');
    setTimeout(() => {
      this.onPasswordChange.emit({
        email: this.session.email,
        password: newPwd
      });
      this.passwordModalStatus.set('success');
      this.passwordModalMessage.set('¡Contraseña cambiada con éxito!');
      setTimeout(() => this.showPasswordModal.set(false), 1500);
    }, 1000);
  }

  // Password strength helper
  passwordStrength(pwd = ''): number {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }

  getPasswordStrengthLabel(pwd = ''): string {
    const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
    return labels[this.passwordStrength(pwd)] || '';
  }

  getPasswordStrengthColorClass(pwd = ''): string {
    const colors = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-lime-400', 'bg-emerald-400'];
    return colors[this.passwordStrength(pwd)] || 'bg-slate-200';
  }
}
