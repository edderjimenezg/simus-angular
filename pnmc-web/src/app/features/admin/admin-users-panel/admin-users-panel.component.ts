import { Component, inject, signal, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideUserCog, 
  LucidePlus, 
  LucideEdit3, 
  LucideX 
} from '@lucide/angular';
import { AdminService } from '../../../core/services/admin.service';
import { ADMIN_ROLES } from '../domain/admin-config';

@Component({
  selector: 'app-admin-users-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideUserCog,
    LucidePlus,
    LucideEdit3,
    LucideX
  ],
  templateUrl: './admin-users-panel.component.html',
  styleUrls: ['./admin-users-panel.component.css']
})
export class AdminUsersPanelComponent {
  private adminService = inject(AdminService);

  @Input() set enabled(val: boolean) {
    this._enabled.set(val);
    if (val) {
      this.loadUsers();
    }
  }
  _enabled = signal<boolean>(false);

  // Users state
  users = signal<any[]>([]);
  formValues = signal({ fullName: '', email: '', role: 'gestor_interno', password: '', isActive: true });
  message = signal<string>('');
  editingUser = signal<string | null>(null);
  showUserModal = signal<boolean>(false);

  // Icon references
  LucideUserCog = LucideUserCog;
  LucidePlus = LucidePlus;
  LucideEdit3 = LucideEdit3;
  LucideX = LucideX;

  adminRoles = Object.values(ADMIN_ROLES);

  ROLE_STYLES: Record<string, string> = {
    webmaster: 'text-violet-700 bg-violet-50 border border-violet-200',
    gestor_interno: 'text-slate-600 bg-slate-100 border border-slate-200',
    aliado_admin: 'text-amber-700 bg-amber-50 border border-amber-200',
    aliado_editor: 'text-blue-700 bg-blue-50 border border-blue-200',
    aliado_lector: 'text-slate-500 bg-slate-100 border border-slate-200',
  };

  loadUsers() {
    this.adminService.fetchAdminUsers().subscribe({
      next: (payload) => {
        this.users.set(payload || []);
      },
      error: (err) => {
        this.message.set(err.message || 'Error al cargar usuarios');
      }
    });
  }

  handleSave(event: Event) {
    event.preventDefault();
    this.message.set('Guardando usuario...');
    
    // Construct payload
    const payload = {
      ...this.formValues(),
      id: this.editingUser() || undefined
    };

    this.adminService.saveAdminUser(payload).subscribe({
      next: (response) => {
        const savedUser = response.user;
        const current = this.users();
        
        // Update user in local array
        const index = current.findIndex(u => u.id === savedUser.id);
        if (index > -1) {
          const updated = [...current];
          updated[index] = savedUser;
          this.users.set(updated);
        } else {
          this.users.set([savedUser, ...current]);
        }
        
        this.resetForm();
        this.showUserModal.set(false);
        this.message.set('Usuario guardado correctamente.');
      },
      error: (err) => {
        this.message.set(err.message || 'Error al guardar el usuario');
      }
    });
  }

  startEdit(user: any) {
    this.editingUser.set(user.id);
    this.formValues.set({
      fullName: user.fullName || '',
      email: user.email || '',
      role: user.role || 'gestor_interno',
      password: '',
      isActive: user.isActive ?? true
    });
    this.message.set('');
    this.showUserModal.set(true);
  }

  startCreate() {
    this.editingUser.set(null);
    this.formValues.set({
      fullName: '',
      email: '',
      role: 'gestor_interno',
      password: '',
      isActive: true
    });
    this.message.set('');
    this.showUserModal.set(true);
  }

  closeModal() {
    this.showUserModal.set(false);
    this.editingUser.set(null);
    this.message.set('');
  }

  resetForm() {
    this.formValues.set({
      fullName: '',
      email: '',
      role: 'gestor_interno',
      password: '',
      isActive: true
    });
    this.editingUser.set(null);
  }

  // Visual Helpers
  getRoleLabel(roleId: string): string {
    return ADMIN_ROLES[roleId]?.shortLabel || roleId;
  }

  getRoleDescription(roleId: string): string {
    return ADMIN_ROLES[roleId]?.description || '';
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
    return '';
  }

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
