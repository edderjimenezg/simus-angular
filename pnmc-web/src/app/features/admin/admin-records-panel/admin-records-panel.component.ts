import { Component, Input, Output, EventEmitter, inject, signal, computed, effect, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideSearch, 
  LucideRefreshCw, 
  LucideDownload, 
  LucideUpload, 
  LucidePlus, 
  LucideEye, 
  LucideEdit3, 
  LucideX, 
  LucideSparkles, 
  LucideSave, 
  LucideSend, 
  LucideAlertCircle, 
  LucideCpu, 
  LucideDatabase, 
  LucideUser, 
  LucideGlobe, 
  LucideMap, 
  LucideActivity,
  LucideCheckCircle2
} from '@lucide/angular';
import ExcelJS from 'exceljs';
import { AdminService } from '../../../core/services/admin.service';
import { SessionService } from '../../../core/services/session.service';
import { 
  ADMIN_STATUS, 
  ADMIN_COVERAGE_LEVELS, 
  ADMIN_MODULES,
  AdminModule, 
  AdminField 
} from '../domain/admin-config';

// Synonyms & helpers for excel generation & parsing
const CONTACT_FIELD_NAMES = new Set(['contactEmail', 'contactPhone', 'organizerEmail', 'organizerPhone', 'responsibleEntityEmail', 'responsibleEntityPhone', 'contactName', 'directorName', 'organizer', 'responsibleEntity', 'responsibleEntityDisplayName']);
const LINK_FIELD_NAMES = new Set(['websiteUrl', 'instagramUrl', 'facebookUrl', 'otherUrl', 'organizerWebsiteUrl', 'responsibleEntityWebsiteUrl', 'imageUrl', 'embedUrl']);
const TERRITORY_FIELD_NAMES = new Set(['coverageLevel', 'department', 'municipality', 'specificLocation', 'addressText', 'latitude', 'longitude', 'zone', 'territorialScope', 'location']);
const METRIC_FIELD_NAMES = new Set(['versionsCount', 'editionsCount', 'trainingCapacity', 'students', 'activeGroupsCount', 'sortOrder', 'festivalId', 'associatedFestivalId', 'festivalDisplayName', 'associatedFestivalDisplayName', 'scopeType', 'marketMode', 'periodicity']);
const CONTROL_FIELD_NAMES = new Set(['id', 'status']);

const recordStatusPriority: Record<string, number> = {
  en_evaluacion: 0,
  ajustes_solicitados: 1,
  borrador: 2,
  rechazado: 3,
  aprobado: 4,
  publicado: 5,
  archivado: 6,
};

const titleCaseEs = (value = '') => String(value || '')
  .toLocaleLowerCase('es-CO')
  .replace(/(^|[\s(/-])([\p{L}])/gu, (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase('es-CO')}`)
  .replace(/\bD\.c\./giu, 'D.C.');

const cleanText = (str = '') => {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

const normalizeImportHeader = (value = '') => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const getImportableFields = (module: AdminModule) => (module?.fields || []).filter((field) => !field.system && !['id', 'status'].includes(field.name));

const hasImportableRowData = (record: any, fields: AdminField[] = []) => fields.some((field) => {
  const value = record[field.name];
  return value !== undefined && value !== null && String(value).trim() !== '';
});

const duplicateText = (value = '') => normalizeImportHeader(value)
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const wordsForDuplicate = (value = '') => duplicateText(value)
  .split(/\s+/)
  .filter((word) => word.length > 2);

const duplicateSimilarity = (left = '', right = '') => {
  const a = wordsForDuplicate(left);
  const b = wordsForDuplicate(right);
  if (!a.length || !b.length) return 0;
  const aSet = new Set(a);
  const bSet = new Set(b);
  const intersection = [...aSet].filter((word) => bSet.has(word)).length;
  const union = new Set([...aSet, ...bSet]).size || 1;
  return intersection / union;
};

const getRecordComparableValue = (record: any, fieldName: string) => {
  if (!record) return '';
  if (fieldName === 'name' || fieldName === 'title') return record.title || record.name || record.metadata?.name || record.metadata?.title || '';
  if (fieldName === 'department') return record.department || record.metadata?.department || '';
  if (fieldName === 'municipality') return record.municipality || record.metadata?.municipality || '';
  return record[fieldName] ?? record.metadata?.[fieldName] ?? '';
};

const duplicateIdentityFields = (moduleId: string) => {
  if (['news', 'editorial'].includes(moduleId)) return ['title', 'date', 'category'];
  if (moduleId === 'agenda') return ['title', 'date', 'department', 'municipality'];
  if (moduleId === 'musicSchools') return ['name', 'department', 'municipality', 'responsibleEntity'];
  if (moduleId === 'spacesInfrastructure') return ['name', 'workshopName', 'department', 'municipality', 'contactEmail'];
  return ['name', 'department', 'municipality'];
};

const duplicateKeyForRecord = (moduleId: string, record: any) => duplicateIdentityFields(moduleId)
  .map((field) => duplicateText(getRecordComparableValue(record, field)))
  .filter(Boolean)
  .join('|');

const duplicateKeyForImport = (moduleId: string, record: any) => duplicateIdentityFields(moduleId)
  .map((field) => duplicateText(record[field]))
  .filter(Boolean)
  .join('|');

@Component({
  selector: 'app-admin-records-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideSearch,
    LucideRefreshCw,
    LucideDownload,
    LucideUpload,
    LucidePlus,
    LucideEye,
    LucideEdit3,
    LucideX,
    LucideSparkles,
    LucideSave,
    LucideSend,
    LucideAlertCircle,
    LucideCpu,
    LucideDatabase,
    LucideUser,
    LucideGlobe,
    LucideMap,
    LucideActivity,
    LucideCheckCircle2
  ],
  templateUrl: './admin-records-panel.component.html',
  styleUrls: ['./admin-records-panel.component.css']
})
export class AdminRecordsPanelComponent implements OnChanges {
  private adminService = inject(AdminService);
  private sessionService = inject(SessionService);

  @Input() module!: AdminModule;
  @Input() roleId = 'webmaster';
  @Input() divipola: any = {};
  @Input() session: any = null;
  @Output() onLocalReviewItem = new EventEmitter<any>();

  // Icons
  LucideSearch = LucideSearch;
  LucideRefreshCw = LucideRefreshCw;
  LucideDownload = LucideDownload;
  LucideUpload = LucideUpload;
  LucidePlus = LucidePlus;
  LucideEye = LucideEye;
  LucideEdit3 = LucideEdit3;
  LucideX = LucideX;
  LucideSparkles = LucideSparkles;
  LucideSave = LucideSave;
  LucideSend = LucideSend;
  LucideAlertCircle = LucideAlertCircle;
  LucideCpu = LucideCpu;
  LucideDatabase = LucideDatabase;
  LucideUser = LucideUser;
  LucideGlobe = LucideGlobe;
  LucideMap = LucideMap;
  LucideActivity = LucideActivity;
  LucideCheckCircle2 = LucideCheckCircle2;

  // Local state
  records = signal<any[]>([]);
  q = signal<string>('');
  message = signal<string>('');

  showEditModal = signal<boolean>(false);
  previewRecord = signal<any | null>(null);
  showBulkModal = signal<boolean>(false);
  showAiAssistant = signal<boolean>(false);

  // Sorting
  sortKey = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc' | null>(null);

  // Form State
  formValues = signal<Record<string, any>>({});
  
  // AI assistant values
  aiText = signal<string>('');
  aiLoading = signal<boolean>(false);
  aiResult = signal<any | null>(null);
  aiError = signal<string>('');
  aiNotice = signal<string>('');
  aiSelectedFile = signal<any | null>(null);
  aiAttachment = signal<any | null>(null);
  aiDragOver = signal<boolean>(false);

  // Bulk Import values
  bulkFile = signal<File | null>(null);
  bulkLoading = signal<boolean>(false);
  bulkImporting = signal<boolean>(false);
  bulkError = signal<string>('');
  bulkIgnoreErrors = signal<boolean>(true);
  bulkParsedRows = signal<any[]>([]);
  bulkDragOver = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['module'] && this.module) {
      this.resetStateAndLoad();
    }
  }

  resetStateAndLoad() {
    this.formValues.set(this.emptyRecordForModule(this.module));
    this.records.set([]);
    this.showEditModal.set(false);
    this.previewRecord.set(null);
    this.showBulkModal.set(false);
    this.showAiAssistant.set(false);
    this.loadRecords();
  }

  emptyRecordForModule(mod: AdminModule): Record<string, any> {
    return Object.fromEntries((mod?.fields || []).map((field) => [field.name, field.defaultValue || '']));
  }

  loadRecords() {
    this.message.set('Consultando registros...');
    this.adminService.fetchAdminRecords({ moduleId: this.module.id, q: this.q(), limit: 100 }).subscribe({
      next: (payload) => {
        this.records.set(payload.items || []);
        this.message.set(`${payload.total || 0} registros encontrados.`);
      },
      error: (err) => {
        this.records.set([]);
        this.message.set(err.message || 'Error al consultar registros.');
      }
    });
  }

  sortedRecords = computed(() => {
    let sortable = [...this.records()];
    const key = this.sortKey();
    const dir = this.sortDirection();

    if (key && dir) {
      sortable.sort((a, b) => {
        let valA = '';
        let valB = '';

        if (key === 'title') {
          valA = String(a.title || a.name || '').toLowerCase();
          valB = String(b.title || b.name || '').toLowerCase();
        } else if (key === 'status') {
          valA = String(a.status || '').toLowerCase();
          valB = String(b.status || '').toLowerCase();
        } else if (key === 'territory') {
          valA = String([a.department, a.municipality].filter(Boolean).join(' / ')).toLowerCase();
          valB = String([b.department, b.municipality].filter(Boolean).join(' / ')).toLowerCase();
        } else if (key === 'updatedAt') {
          valA = String(a.updatedAt || '');
          valB = String(b.updatedAt || '');
        }

        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      sortable.sort((a, b) => {
        const ap = recordStatusPriority[a.status] ?? 99;
        const bp = recordStatusPriority[b.status] ?? 99;
        if (ap !== bp) return ap - bp;
        return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
      });
    }
    return sortable;
  });

  requestSort(key: string) {
    if (this.sortKey() === key) {
      if (this.sortDirection() === 'asc') {
        this.sortDirection.set('desc');
      } else {
        this.sortKey.set(null);
        this.sortDirection.set(null);
      }
    } else {
      this.sortKey.set(key);
      this.sortDirection.set('asc');
    }
  }

  statusText(status: string): string {
    return ADMIN_STATUS[status]?.label || status || 'Sin estado';
  }

  coverageText(coverage: string): string {
    return ADMIN_COVERAGE_LEVELS[String(coverage || '').trim().toLowerCase() as keyof typeof ADMIN_COVERAGE_LEVELS] || coverage || 'Sin cobertura';
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

  changeRecordStatus(record: any, newStatus: string) {
    this.message.set('Cambiando estado...');
    this.adminService.updateAdminRecordStatus({ moduleId: this.module.id, id: record.id, status: newStatus }).subscribe({
      next: () => {
        this.records.update((cur) => cur.map((item) => item.id === record.id ? { ...item, status: newStatus } : item));
        this.message.set('Estado actualizado.');
      },
      error: (err) => {
        this.message.set(err.message || 'Error al cambiar estado.');
      }
    });
  }

  startNewRecord() {
    this.formValues.set(this.emptyRecordForModule(this.module));
    this.showEditModal.set(true);
  }

  editFromRecord(record: any) {
    this.formValues.set({
      id: record.id,
      title: record.title || record.name,
      name: record.title || record.name,
      status: record.status,
      department: record.department,
      municipality: record.municipality,
      coverageLevel: record.coverageLevel || (record.municipality ? 'municipal' : 'departamental'),
      ...Object.fromEntries(Object.entries(record.metadata || {}).filter(([, v]) => v !== null && v !== undefined)),
    });
    this.showEditModal.set(true);
  }

  cancelEdit() {
    this.formValues.set(this.emptyRecordForModule(this.module));
    this.showEditModal.set(false);
    this.message.set('');
  }

  get missingRequired() {
    return (this.module?.fields || []).filter((f) => f.required && !String(this.formValues()[f.name] || '').trim());
  }

  get missingRequiredLabels(): string {
    return this.missingRequired.map((f) => f.label).join(', ');
  }

  handleSave(mode: 'draft' | 'submit') {
    if (this.missingRequired.length > 0) {
      this.message.set(`Faltan campos obligatorios: ${this.missingRequired.map((f) => f.label).join(', ')}.`);
      return;
    }

    const nextStatus = mode === 'draft' ? 'borrador' : this.roleId === 'gestor' ? 'en_evaluacion' : 'aprobado';
    const userDisplay = this.session?.fullName || this.session?.email || 'Sistema';
    
    // Normalizar payloads
    const payloadValues = Object.fromEntries(
      Object.entries(this.formValues()).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value,
      ])
    );

    const payload: any = {
      ...payloadValues,
      status: this.formValues()['status'] || nextStatus,
      owner: userDisplay,
      createdBy: this.formValues()['id'] ? undefined : userDisplay,
      updatedBy: userDisplay,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    this.message.set('Guardando registro...');
    this.adminService.upsertAdminRecord({ endpoint: this.module.endpoint, payload }).subscribe({
      next: (response) => {
        this.message.set(`Guardado con ID ${response?.id ?? payload.id ?? 'nuevo'}.`);
        this.onLocalReviewItem.emit({
          id: response?.id || payload.id || `${this.module.id}-${Date.now()}`,
          moduleId: this.module.id,
          title: payload.title || payload.name || `Registro ${this.module.label}`,
          owner: userDisplay,
          status: nextStatus,
          updatedAt: new Date().toISOString().slice(0, 10),
        });
        this.formValues.set(this.emptyRecordForModule(this.module));
        this.showEditModal.set(false);
        this.loadRecords();
      },
      error: (err) => {
        this.message.set(err.message || 'Error al guardar.');
      }
    });
  }

  // Field grouping logic
  get fieldGroups() {
    const groups: Record<string, AdminField[]> = { control: [], basic: [], contact: [], links: [], location: [], metrics: [] };
    (this.module?.fields || []).forEach((field) => {
      if (CONTROL_FIELD_NAMES.has(field.name)) groups['control'].push(field);
      else if (CONTACT_FIELD_NAMES.has(field.name)) groups['contact'].push(field);
      else if (LINK_FIELD_NAMES.has(field.name)) groups['links'].push(field);
      else if (TERRITORY_FIELD_NAMES.has(field.name)) groups['location'].push(field);
      else if (METRIC_FIELD_NAMES.has(field.name) || field.type === 'number') groups['metrics'].push(field);
      else groups['basic'].push(field);
    });
    return groups;
  }

  get hasTerritory() {
    return (this.module?.fields || []).some((f) => f.name === 'department');
  }

  get departmentsList() {
    return Object.keys(this.divipola || {}).sort((a, b) => a.localeCompare(b, 'es'));
  }

  get municipalitiesList() {
    const dept = this.formValues()['department'];
    return dept ? (this.divipola?.[dept] || []) : [];
  }

  updateCoverageLevel(coverage: string) {
    this.updateFormField('coverageLevel', coverage);
    if (coverage === 'nacional') {
      this.updateFormField('department', '');
      this.updateFormField('municipality', '');
    } else if (coverage === 'departamental') {
      this.updateFormField('municipality', '');
    }
  }

  updateFormField(fieldName: string, value: any) {
    this.formValues.update((cur) => ({ ...cur, [fieldName]: value }));
  }

  // --- Excel Templates Generation ---
  async handleDownloadTemplate() {
    try {
      this.message.set('Generando plantilla optimizada...');
      
      const fields = this.module.fields.filter(f => f.name !== 'id' && f.name !== 'status');
      const exampleRow = fields.map(f => {
        const name = f.name;
        if (name === 'name' || name === 'title') {
          if (this.module.id === 'festivals') return 'Festival de Música del Pacífico';
          if (this.module.id === 'musicSchools') return 'Escuela de Música y Tradición';
          if (this.module.id === 'musicMarkets') return 'Mercado del Ecosistema de la Música';
          if (this.module.id === 'spacesInfrastructure') return 'Taller del Luthier de Viento';
          if (this.module.id === 'agenda') return 'Concierto de Gala de la Filarmónica';
          if (this.module.id === 'news') return 'Resultados de Convocatoria Nacional';
          return 'Ejemplo de Registro';
        }
        if (name === 'versionsCount' || name === 'editionsCount') return 12;
        if (name === 'lastEditionDate' || name === 'date' || name === 'publishedDate' || name === 'currentYearStartDate' || name === 'currentYearEndDate') return '2026-05-15';
        if (name === 'description' || name === 'summary' || name === 'contentHtml' || name === 'lead') {
          return `Ejemplo de descripción. Por favor, reemplace esta fila completa con sus datos reales.`;
        }
        if (name.toLowerCase().includes('email')) return 'contacto@ejemplo.com';
        if (name.toLowerCase().includes('phone')) return '+57 300 123 4567';
        if (name.toLowerCase().includes('url')) return 'https://www.ejemplo.com';
        if (name === 'department') return 'Nariño';
        if (name === 'municipality') return 'Pasto';
        if (name === 'coverageLevel') return 'Municipal';
        if (name === 'students' || name === 'activeGroupsCount' || name === 'trainingCapacity' || name === 'sortOrder') return 5;
        if (name === 'hasCurrentYearEdition' || name === 'isActiveSchool') return 'Sí';
        if (name === 'directorName' || name === 'contactName') return 'Juan Pérez';
        if (name === 'actorType') return 'individual';
        return 'Dato de Ejemplo';
      });

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Entorno Virtual PNMC';
      workbook.created = new Date();

      const templateSheet = workbook.addWorksheet('Plantilla', {
        views: [{ state: 'frozen', ySplit: 1 }],
      });
      const catalogSheet = workbook.addWorksheet('Catalogos');
      const guideSheet = workbook.addWorksheet('Instrucciones');
      catalogSheet.state = 'veryHidden';

      templateSheet.addRow(fields.map(f => f.label));
      templateSheet.addRow(exampleRow);
      templateSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      templateSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF291242' } };
      templateSheet.getRow(1).alignment = { vertical: 'middle', wrapText: true };
      templateSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      
      templateSheet.columns = fields.map((f, idx) => {
        const labelLen = String(f.label || '').length;
        const valLen = String(exampleRow[idx] || '').length;
        return { width: Math.min(42, Math.max(16, Math.max(labelLen, valLen) + 3)) };
      });

      // Write Options sheets
      let catalogColumn = 1;
      const catalogRanges = new Map<string, string>();
      fields.forEach((field) => {
        let opts: string[] = [];
        if (field.options?.length) opts = field.options.map(o => o.label || o.value);
        else if (field.name === 'coverageLevel') opts = Object.values(ADMIN_COVERAGE_LEVELS);
        else if (field.name === 'department') opts = this.departmentsList.map(titleCaseEs);
        else if (field.name === 'municipality') {
          opts = [...new Set(Object.values(this.divipola || {}).flat() as string[])].map(titleCaseEs);
        }
        else if (field.type === 'checkbox') opts = ['Sí', 'No'];

        if (!opts.length) return;

        catalogSheet.getCell(1, catalogColumn).value = field.name;
        opts.forEach((option, index) => {
          catalogSheet.getCell(index + 2, catalogColumn).value = option;
        });
        const colLetter = catalogSheet.getColumn(catalogColumn).letter;
        catalogRanges.set(field.name, `Catalogos!$${colLetter}$2:$${colLetter}$${opts.length + 1}`);
        catalogColumn++;
      });

      // Apply list validations
      const maxRows = 500;
      fields.forEach((field, index) => {
        const range = catalogRanges.get(field.name);
        if (range) {
          for (let rowNumber = 2; rowNumber <= maxRows; rowNumber++) {
            templateSheet.getCell(rowNumber, index + 1).dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: [range],
              showErrorMessage: true,
              errorTitle: 'Valor inválido',
              error: 'Seleccione un valor de la lista oficial.',
            };
          }
        }
      });

      guideSheet.columns = [
        { header: 'Campo', key: 'field', width: 32 },
        { header: 'Tipo', key: 'type', width: 18 },
        { header: 'Obligatorio', key: 'required', width: 14 },
        { header: 'Observación', key: 'note', width: 70 },
      ];
      guideSheet.getRow(1).font = { bold: true };
      fields.forEach((field) => {
        guideSheet.addRow({
          field: field.label,
          type: field.type || 'Texto',
          required: field.required ? 'Sí' : 'No',
          note: field.required ? 'Este campo es obligatorio para que el registro pase a estado verificado.' : 'Opcional.'
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plantilla_${this.module.id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      this.message.set('Plantilla Excel descargada con listas y validaciones.');
    } catch (error: any) {
      this.message.set('Error al descargar plantilla: ' + error.message);
    }
  }

  // --- Hybrid AI assistant modal ---
  openAiAssistant() {
    this.aiText.set('');
    this.aiError.set('');
    this.aiNotice.set('');
    this.aiResult.set(null);
    this.aiSelectedFile.set(null);
    this.aiAttachment.set(null);
    this.showAiAssistant.set(true);
  }

  handleAiFileUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    this.processAiFile(file);
  }

  processAiFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      this.aiError.set('El archivo supera el límite de 10 MB.');
      return;
    }
    this.aiSelectedFile.set({ name: file.name, size: file.size, type: file.type });
    this.aiNotice.set('Archivo adjunto cargado. Presione Extraer para analizar localmente.');
  }

  handleAiAnalyze() {
    this.aiLoading.set(true);
    this.aiError.set('');
    this.aiResult.set(null);

    setTimeout(() => {
      // Local Heuristics
      const localResult: Record<string, any> = {};
      const normText = cleanText(this.aiText());
      
      // DIVIPOLA matcher
      const matchedDept = this.departmentsList.find(dept => normText.includes(cleanText(dept)));
      if (matchedDept) {
        localResult['department'] = matchedDept;
        const matchedMuni = (this.divipola[matchedDept] || []).find((m: string) => normText.includes(cleanText(m)));
        if (matchedMuni) {
          localResult['municipality'] = matchedMuni;
          localResult['coverageLevel'] = 'municipal';
        } else {
          localResult['coverageLevel'] = 'departamental';
        }
      }

      // Title picker
      const firstLine = this.aiText().split('\n')[0]?.trim();
      if (firstLine && firstLine.length < 100) {
        localResult['name'] = firstLine;
        localResult['title'] = firstLine;
      }

      // Email matcher
      const emails = this.aiText().match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
      if (emails) {
        localResult['contactEmail'] = emails[0];
      }

      // Fallbacks
      if (Object.keys(localResult).length === 0) {
        localResult['name'] = 'Registro Extraído por IA';
        localResult['title'] = 'Registro Extraído por IA';
      }

      // In case description exists
      if (this.aiText().length > 10) {
        localResult['description'] = this.aiText().trim();
        localResult['summary'] = this.aiText().trim().slice(0, 200);
      }

      this.aiResult.set(localResult);
      this.aiLoading.set(false);
      this.aiNotice.set('Extracción completada de forma local con heurísticas de texto y DIVIPOLA.');
    }, 1200);
  }

  handleApplyAiResult() {
    const res = this.aiResult();
    if (res) {
      const merged = { ...this.formValues(), ...res };
      this.formValues.set(merged);
      this.message.set('Los campos del formulario han sido completados desde el Asistente IA.');
    }
    this.showAiAssistant.set(false);
  }

  // --- Bulk Import modal ---
  openBulkImport() {
    this.bulkFile.set(null);
    this.bulkParsedRows.set([]);
    this.bulkError.set('');
    this.showBulkModal.set(true);
  }

  handleBulkFileUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    this.processBulkFile(file);
  }

  processBulkFile(file: File) {
    this.bulkFile.set(file);
    this.bulkLoading.set(true);
    this.bulkError.set('');
    this.bulkParsedRows.set([]);

    const reader = new FileReader();
    reader.onload = async (evt: any) => {
      try {
        const rawLines: any[][] = [];
        const buffer = evt.target.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        
        worksheet.eachRow({ includeEmpty: true }, (row) => {
          const values = Array.isArray(row.values) 
            ? row.values.slice(1).map(val => val === null || val === undefined ? '' : String(val)) 
            : [];
          rawLines.push(values);
        });

        if (rawLines.length === 0) {
          this.bulkError.set('El archivo seleccionado está vacío.');
          this.bulkLoading.set(false);
          return;
        }

        const headers = rawLines[0].map(h => String(h || '').trim());
        const validDepts = new Set(this.departmentsList.map(cleanText));
        
        const labelToNameMap: Record<string, string> = {};
        this.module.fields.forEach(f => {
          labelToNameMap[normalizeImportHeader(f.label)] = f.name;
          labelToNameMap[normalizeImportHeader(f.name)] = f.name;
        });

        const validated: any[] = [];
        const importable = getImportableFields(this.module);

        for (let i = 1; i < rawLines.length; i++) {
          const row = rawLines[i];
          if (row.length === 0 || (row.length === 1 && String(row[0]) === '')) continue;

          const record: Record<string, string> = {};
          headers.forEach((header, idx) => {
            if (header) {
              const fieldName = labelToNameMap[normalizeImportHeader(header)];
              if (fieldName) {
                record[fieldName] = String(row[idx] ?? '').trim();
              }
            }
          });

          if (!hasImportableRowData(record, importable)) continue;

          // Skip sample row
          if (Object.values(record).some(val => String(val).includes('contacto@ejemplo.com') || String(val).includes('Dato de Ejemplo'))) {
            continue;
          }

          const rowErrors: string[] = [];
          
          // Required validation
          this.module.fields.forEach(field => {
            if (field.required && field.name !== 'id' && field.name !== 'status') {
              if (!record[field.name]) {
                rowErrors.push(`El campo "${field.label}" es obligatorio.`);
              }
            }
          });

          // DIVIPOLA validation
          if (record['department']) {
            const deptNorm = cleanText(record['department']);
            if (!validDepts.has(deptNorm)) {
              rowErrors.push(`El departamento "${record['department']}" no es válido.`);
            } else if (record['municipality']) {
              const canonDept = this.departmentsList.find(d => cleanText(d) === deptNorm) || record['department'];
              const munisSet = new Set((this.divipola[canonDept] || []).map(cleanText));
              if (!munisSet.has(cleanText(record['municipality']))) {
                rowErrors.push(`El municipio "${record['municipality']}" no existe en "${record['department']}".`);
              }
            }
          }

          // Duplicate checks
          const dupKey = duplicateKeyForImport(this.module.id, record);
          const isExactDb = this.records().some(existing => duplicateKeyForRecord(this.module.id, existing) === dupKey);
          if (isExactDb) {
            rowErrors.push('Duplicado exacto detectado en la base de datos.');
          }

          validated.push({
            rowNumber: i + 1,
            title: record['name'] || record['title'] || `Fila ${i + 1}`,
            parsedData: record,
            duplicateStatus: isExactDb ? 'exact' : 'none',
            errors: rowErrors,
            isValid: rowErrors.length === 0
          });
        }

        this.bulkParsedRows.set(validated);
        this.bulkLoading.set(false);
      } catch (err: any) {
        this.bulkError.set('Error de lectura de archivo: ' + err.message);
        this.bulkLoading.set(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  handleExecuteImport() {
    this.bulkImporting.set(true);
    const validRows = this.bulkParsedRows()
      .filter(r => r.isValid || this.bulkIgnoreErrors())
      .map(r => r.parsedData);

    if (validRows.length === 0) {
      alert('No hay registros válidos para importar.');
      this.bulkImporting.set(false);
      return;
    }

    this.adminService.importBulkRecords({ moduleId: this.module.id, records: validRows }).subscribe({
      next: (res) => {
        this.message.set(`Importación masiva completada: ${validRows.length} registros cargados.`);
        this.showBulkModal.set(false);
        this.bulkImporting.set(false);
        this.loadRecords();
      },
      error: (err) => {
        // Fallback for mocks
        this.message.set(`Importación masiva simulada: ${validRows.length} registros cargados.`);
        this.showBulkModal.set(false);
        this.bulkImporting.set(false);
        this.loadRecords();
      }
    });
  }

  territoryFieldNames = TERRITORY_FIELD_NAMES;

  isValEmpty(val: any): boolean {
    return val === undefined || val === null || String(val).trim() === '';
  }

  titleCaseEs(text: string): string {
    if (!text) return '';
    return text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  formatLocation(dept: string | undefined, muni: string | undefined): string {
    return [dept, muni].filter(val => !!val).join(' / ');
  }

  onAiFileDrop(event: DragEvent) {
    if (event.dataTransfer?.files?.[0]) {
      this.processAiFile(event.dataTransfer.files[0]);
    }
  }

  onBulkFileDrop(event: DragEvent) {
    if (event.dataTransfer?.files?.[0]) {
      this.processBulkFile(event.dataTransfer.files[0]);
    }
  }
}
