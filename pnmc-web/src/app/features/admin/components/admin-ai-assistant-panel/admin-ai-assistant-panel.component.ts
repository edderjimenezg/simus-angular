import { Component, Input, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideSparkles, 
  LucideUpload, 
  LucideDownload, 
  LucideCheck, 
  LucideAlertCircle, 
  LucideArrowRight, 
  LucideBot, 
  LucideUser, 
  LucideFileSpreadsheet, 
  LucideInfo, 
  LucideSettings, 
  LucideX, 
  LucideFileText, 
  LucideAlertTriangle, 
  LucideRotateCcw, 
  LucideSend,
  LucideRefreshCw
} from '@lucide/angular';
import ExcelJS from 'exceljs';
import { ADMIN_MODULES } from '../../domain/admin-config';

const SYNONYMS: Record<string, string[]> = {
  name: ['nombre', 'name', 'titulo', 'título', 'entidad', 'razon', 'razón', 'denominacion', 'denominación', 'nombre del festival', 'nombre de la escuela', 'nombre del mercado', 'escuela', 'festival', 'mercado'],
  versionsCount: ['versiones', 'ediciones', 'numero de versiones', 'numero de ediciones', 'cantidad versiones', 'cantidad ediciones', 'no versiones', 'no ediciones'],
  lastEditionDate: ['ultimo', 'último', 'ultima edicion', 'última edición', 'fecha ultima', 'fecha última', 'ultima fecha', 'fecha edicion'],
  description: ['descripcion', 'descripción', 'resumen', 'detalle', 'summary', 'about', 'sobre', 'info', 'resumen general'],
  organizer: ['organizador', 'responsable', 'entidad responsable', 'representante', 'entidad', 'organizadores'],
  organizerEmail: ['correo organizador', 'email organizador', 'mail organizador', 'contacto organizador', 'correo de organizacion', 'correo responsable'],
  organizerPhone: ['telefono organizador', 'teléfono organizador', 'celular organizador', 'telefono responsable', 'teléfono responsable'],
  organizerWebsiteUrl: ['web organizador', 'sitio web organizador', 'pagina organizador', 'url organizador', 'web del organizador'],
  contactEmail: ['correo', 'email', 'mail', 'correo contacto', 'email contacto', 'mail contacto', 'correo electronico', 'correo electrónico', 'correo general'],
  contactPhone: ['telefono', 'teléfono', 'celular', 'telefono contacto', 'telefono festival', 'contacto', 'tel', 'phone', 'mobile', 'teléfono contacto', 'celular contacto', 'teléfono general'],
  websiteUrl: ['sitio web', 'pagina web', 'pagina', 'página', 'url', 'web', 'website', 'sitio general'],
  instagramUrl: ['instagram', 'ig', 'insta', 'instagram url', 'perfil instagram'],
  facebookUrl: ['facebook', 'fb', 'facebook url', 'perfil facebook'],
  otherUrl: ['otro enlace', 'otro link', 'red social', 'enlace', 'link', 'otros links', 'enlaces'],
  department: ['departamento', 'depto', 'dpto', 'dept', 'departament', 'provincia', 'estado', 'dep', 'departamento pnmc'],
  municipality: ['municipio', 'muni', 'ciudad', 'pueblo', 'municipality', 'city', 'mun', 'localidad', 'municipio pnmc'],
  specificLocation: ['lugar', 'lugar especifico', 'lugar específico', 'ubicacion', 'ubicación', 'sede', 'lugar fisico', 'donde se realiza'],
  addressText: ['direccion', 'dirección', 'nomenclatura', 'address', 'calle', 'dirección física'],
  latitude: ['latitud', 'lat', 'latitude'],
  longitude: ['longitud', 'lon', 'lng', 'longitude'],
  schoolCategory: ['categoria escuela', 'categoría escuela', 'categoria', 'categoría', 'tipo escuela'],
  schoolType: ['tipo de escuela', 'tipo escuela', 'tipo de proceso', 'modalidad escuela'],
  responsibleEntity: ['entidad responsable', 'responsable', 'entidad', 'quien coordina'],
  directorName: ['director', 'nombre director', 'director escuela', 'coordinador', 'nombre coordinador'],
  trainingCapacity: ['capacidad formativa', 'capacidad', 'cupos', 'capacidad estudiantes'],
  students: ['estudiantes', 'cantidad estudiantes', 'alumnos', 'numero estudiantes', 'no estudiantes'],
  activeGroupsCount: ['grupos activos', 'cantidad grupos', 'grupos', 'agrupaciones', 'no grupos'],
  trainingProcesses: ['procesos formativos', 'procesos', 'formacion', 'formación'],
  musicalPractices: ['practicas musicales', 'prácticas', 'instrumentos enseñados'],
  isActiveSchool: ['activo', 'escuela activa', 'vigente'],
  observations: ['observaciones', 'notas', 'comentarios', 'comentario', 'anotacion'],
  editionsCount: ['ediciones', 'versiones', 'cantidad ediciones', 'no ediciones'],
  periodicity: ['periodicidad', 'frecuencia', 'cada cuanto'],
  associatedFestivalId: ['id festival', 'id festival asociado', 'festival id'],
  associatedFestivalDisplayName: ['nombre festival asociado', 'festival asociado'],
  scopeType: ['alcance', 'cobertura', 'tipo de alcance'],
  marketMode: ['modalidad', 'modalidad mercado', 'tipo mercado'],
  organizationType: ['tipo centro', 'tipo de organizacion', 'tipo organización'],
  territorialScope: ['zona', 'alcance territorial', 'cobertura territorial'],
  actorType: ['tipo lutier', 'lutier tipo', 'categoria lutier'],
  workshopName: ['nombre taller', 'taller', 'nombre del taller', 'taller de lutería'],
  primaryFunction: ['especialidad', 'funcion principal', 'función principal', 'oficio'],
  instruments: ['instrumentos', 'instrumentos que fabrica', 'fabricacion'],
  contactName: ['contacto', 'nombre de contacto', 'atendido por'],
  zone: ['zona', 'sector', 'comuna', 'barrio'],
  title: ['titulo', 'título', 'nombre', 'tema', 'encabezado'],
  shortDescription: ['descripcion corta', 'descripción corta', 'resumen', 'introduccion'],
  category: ['categoria', 'categoría', 'tipo', 'clasificacion'],
  endDate: ['fecha fin', 'fecha terminacion', 'fin', 'finalizacion'],
  timeLabel: ['hora', 'hora inicio', 'inicio hora'],
  endTimeLabel: ['hora fin', 'hora final', 'fin hora'],
  location: ['lugar', 'direccion', 'lugar del evento'],
  imageUrl: ['imagen', 'foto', 'url imagen', 'link imagen', 'url mas informacion', 'url más información'],
  sortOrder: ['orden', 'prioridad', 'secuencia'],
  summary: ['resumen', 'entradilla', 'copete', 'introduccion'],
  contentHtml: ['contenido', 'cuerpo', 'cuerpo noticia', 'texto completo', 'html'],
  quoteText: ['cita', 'frase destacada', 'cita destacada'],
  author: ['autor', 'escrito por', 'redactor'],
  year: ['año', 'anio', 'fecha publicacion', 'fecha'],
  section: ['seccion', 'sección', 'categoria'],
  sectionPath: ['ruta', 'slug', 'path'],
  publicationType: ['tipo publicacion', 'tipo de publicacion', 'recurso tipo'],
  keywords: ['palabras clave', 'keywords', 'tags', 'etiquetas'],
};

const cleanText = (str = '') => {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

const titleCaseEs = (value = '') => String(value || '')
  .toLocaleLowerCase('es-CO')
  .replace(/(^|[\s(/-])([\p{L}])/gu, (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase('es-CO')}`)
  .replace(/\bD\.c\./giu, 'D.C.');

@Component({
  selector: 'app-admin-ai-assistant-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideSparkles,
    LucideUpload,
    LucideDownload,
    LucideCheck,
    LucideAlertCircle,
    LucideArrowRight,
    LucideBot,
    LucideUser,
    LucideFileSpreadsheet,
    LucideInfo,
    LucideSettings,
    LucideX,
    LucideFileText,
    LucideAlertTriangle,
    LucideRotateCcw,
    LucideSend,
    LucideRefreshCw
  ],
  templateUrl: './admin-ai-assistant-panel.component.html',
  styleUrls: ['./admin-ai-assistant-panel.component.css']
})
export class AdminAIAssistantPanelComponent implements OnInit {
  @Input() divipola: any = {};
  @ViewChild('chatEndRef') chatEndRef!: ElementRef;
  @ViewChild('sourceInputRef') sourceInputRef!: ElementRef;

  // Icons
  LucideSparkles = LucideSparkles;
  LucideUpload = LucideUpload;
  LucideDownload = LucideDownload;
  LucideCheck = LucideCheck;
  LucideAlertCircle = LucideAlertCircle;
  LucideArrowRight = LucideArrowRight;
  LucideBot = LucideBot;
  LucideUser = LucideUser;
  LucideFileSpreadsheet = LucideFileSpreadsheet;
  LucideInfo = LucideInfo;
  LucideSettings = LucideSettings;
  LucideX = LucideX;
  LucideFileText = LucideFileText;
  LucideAlertTriangle = LucideAlertTriangle;
  LucideRotateCcw = LucideRotateCcw;
  LucideSend = LucideSend;

  step = signal<number>(1);
  selectedModuleId = signal<string>('');
  
  sourceFile = signal<File | null>(null);
  sourceHeaders = signal<string[]>([]);
  sourceRows = signal<any[][]>([]);
  
  mappings = signal<Record<string, number>>({});
  mappingSuggestions = signal<Record<string, any>>({});

  processing = signal<boolean>(false);
  processedRows = signal<any[]>([]);
  observations = signal<any[]>([]);
  stats = signal<{ total: number; warnings: number; corrections: number; clean: number }>({ total: 0, warnings: 0, corrections: 0, clean: 0 });

  chatMessages = signal<Array<{ sender: string; text: string }>>([
    {
      sender: 'ai',
      text: '¡Hola! Soy tu asistente de consulta de datos local. Sube tu archivo Excel o CSV de base de datos externa y selecciona a qué módulo quieres adaptar la información.\n\nUna vez procesada, podré responder preguntas rápidas sobre tus registros (ej. "cuántos registros se procesaron", "cuántas advertencias hay" o buscar algún nombre o lugar específico).'
    }
  ]);
  chatInput = signal<string>('');

  adminModules = ADMIN_MODULES.filter(m => ['festivals', 'musicSchools', 'musicMarkets', 'organizations', 'spacesInfrastructure'].includes(m.id));

  activeModule = computed(() => {
    return ADMIN_MODULES.find(m => m.id === this.selectedModuleId()) || null;
  });

  ngOnInit() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatEndRef?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  addAiMessage(text: string) {
    this.chatMessages.update(prev => [...prev, { sender: 'ai', text }]);
    this.scrollToBottom();
  }

  handleSendMessage() {
    const msg = this.chatInput().trim();
    if (!msg) return;

    this.chatMessages.update(prev => [...prev, { sender: 'user', text: msg }]);
    this.chatInput.set('');
    this.scrollToBottom();

    setTimeout(() => {
      let response = '';
      const normMsg = cleanText(msg);

      if (this.sourceRows().length === 0) {
        response = 'Aún no has cargado ninguna base de datos externa. Por favor, sube tu archivo en el Paso 1 y selecciona el módulo de destino para que pueda analizar tus registros.';
      } else {
        if (normMsg.includes('registros') || normMsg.includes('filas') || normMsg.includes('cantidad') || normMsg.includes('cuantos') || normMsg.includes('cuantas')) {
          if (this.step() < 3) {
            response = `Actualmente tienes cargados **${this.sourceRows().length} registros** en espera de ser mapeados y procesados. Avanza al Paso 3 para ver la limpieza de datos detallada.`;
          } else {
            response = `He procesado **${this.stats().total} registros** con éxito para el módulo **${this.activeModule()?.label}**.\n- Mapeados: ${this.stats().clean}\n- Correcciones automáticas aplicadas: ${this.stats().corrections}\n- Advertencias/Avisos: ${this.stats().warnings}`;
          }
        } 
        else if (normMsg.includes('error') || normMsg.includes('advertencia') || normMsg.includes('alerta') || normMsg.includes('fallo') || normMsg.includes('problema')) {
          if (this.step() < 3) {
            response = 'El análisis de advertencias y errores se ejecuta en el Paso 3, una vez finalizado el mapeo de columnas. ¡Continúa con el flujo para verlo!';
          } else if (this.stats().warnings === 0) {
            response = '¡Excelente noticia! No he encontrado ninguna advertencia en el archivo procesado. Todos los campos obligatorios están diligenciados y el mapeo está completo.';
          } else {
            const warningSamples = this.observations().filter(o => o.type === 'warning').slice(0, 3);
            response = `Encontré un total de **${this.stats().warnings} advertencias**. Aquí tienes algunas muestras:\n\n` + 
              warningSamples.map(o => `• ${o.message}`).join('\n') + 
              (this.stats().warnings > 3 ? `\n\n...y otras ${this.stats().warnings - 3} advertencias adicionales que puedes consultar en la sección inferior de observaciones.` : '');
          }
        }
        else if (normMsg.includes('correccion') || normMsg.includes('limpi') || normMsg.includes('cambio') || normMsg.includes('normaliz')) {
          if (this.step() < 3) {
            response = 'Las correcciones de formato de correos, teléfonos y normalización DIVIPOLA se aplicarán en el Paso 3 tras definir el mapeo.';
          } else if (this.stats().corrections === 0) {
            response = 'No se requirió realizar ninguna corrección automática. Los datos de teléfonos, correos y departamentos venían con el formato correcto.';
          } else {
            const correctionSamples = this.observations().filter(o => o.type === 'correction').slice(0, 3);
            response = `He aplicado **${this.stats().corrections} correcciones automáticas** para limpiar los datos. Algunos ejemplos:\n\n` +
              correctionSamples.map(o => `• ${o.message}`).join('\n') +
              (this.stats().corrections > 3 ? `\n\n...y otras ${this.stats().corrections - 3} modificaciones automáticas registradas.` : '');
          }
        }
        else if (normMsg.length >= 3) {
          const searchWord = normMsg;
          const matches: any[] = [];

          if (this.step() === 3 && this.processedRows().length > 0) {
            this.processedRows().forEach((row, idx) => {
              const matchedFields: string[] = [];
              Object.entries(row).forEach(([key, val]) => {
                if (cleanText(String(val)).includes(searchWord)) {
                  const fieldLabel = this.activeModule()?.fields.find(f => f.name === key)?.label || key;
                  matchedFields.push(`**${fieldLabel}**: "${val}"`);
                }
              });

              if (matchedFields.length > 0) {
                const nameVal = row.name || row.title || `Fila ${idx + 2}`;
                matches.push({
                  rowNum: idx + 2,
                  name: nameVal,
                  details: matchedFields.join(', ')
                });
              }
            });
          } else {
            this.sourceRows().forEach((row, idx) => {
              const matchedVals: string[] = [];
              row.forEach((val, colIdx) => {
                if (cleanText(String(val)).includes(searchWord)) {
                  matchedVals.push(`**Columna ${this.sourceHeaders()[colIdx]}**: "${val}"`);
                }
              });
              if (matchedVals.length > 0) {
                matches.push({
                  rowNum: idx + 2,
                  name: `Fila ${idx + 2}`,
                  details: matchedVals.join(', ')
                });
              }
            });
          }

          if (matches.length === 0) {
            response = `No encontré ninguna fila que contenga el término "${msg}" en los datos cargados.`;
          } else {
            const count = matches.length;
            const samples = matches.slice(0, 4);
            response = `Encontré **${count} coincidencias** para "${msg}":\n\n` +
              samples.map(m => `• [Fila ${m.rowNum}] **${m.name}** (${m.details})`).join('\n') +
              (count > 4 ? `\n\n...y otras ${count - 4} filas coincidentes.` : '');
          }
        }
        else {
          response = 'Entiendo. Recuerda que puedes preguntarme sobre las estadísticas (ej. "cuántos registros", "qué errores hay") o buscar términos específicos dentro de tu Excel escribiendo su nombre.';
        }
      }

      this.addAiMessage(response);
    }, 700);
  }

  async handleDownloadEmptyTemplate() {
    const mod = this.activeModule();
    if (!mod) return;
    try {
      const fields = mod.fields.filter(f => f.name !== 'id' && f.name !== 'status');
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Entorno Virtual PNMC';
      workbook.created = new Date();

      const templateSheet = workbook.addWorksheet('Plantilla', {
        views: [{ state: 'frozen', ySplit: 1 }],
      });

      templateSheet.addRow(fields.map(f => f.label));
      templateSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      templateSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF291242' } };
      templateSheet.getRow(1).alignment = { vertical: 'middle', wrapText: true };
      templateSheet.getRow(1).height = 30;

      templateSheet.columns = fields.map(f => ({ width: Math.max(18, String(f.label || '').length + 4) }));

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plantilla_${mod.id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error al descargar la plantilla vacía.');
    }
  }

  handleSourceUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    this.sourceFile.set(file);
    const isCsv = file.name.endsWith('.csv');
    const reader = new FileReader();

    reader.onload = async (evt: any) => {
      try {
        let rawLines: any[][] = [];
        if (isCsv) {
          const text = evt.target.result || '';
          rawLines = this.parseCSV(text);
        } else {
          const buffer = evt.target.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          const worksheet = workbook.worksheets[0];
          worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            const values = Array.isArray(row.values) 
              ? row.values.slice(1).map(val => val === null || val === undefined ? '' : String(val)) 
              : [];
            rawLines.push(values);
          });
        }

        if (rawLines.length === 0) {
          alert('El archivo origen de base de datos está vacío.');
          return;
        }

        const headers = rawLines[0].map(h => String(h || '').trim());
        const rows = rawLines.slice(1);

        this.sourceHeaders.set(headers);
        this.sourceRows.set(rows);

        // Fuzzy match automatic mappings trigger
        this.runFuzzyColumnMapping(headers);

        this.addAiMessage(`Cargada la base de datos Externa "${file.name}" con **${rows.length} registros** y **${headers.length} columnas**.`);
      } catch (err: any) {
        console.error(err);
        alert('Error al leer el archivo origen: ' + err.message);
      }
    };

    if (isCsv) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  parseCSV(text: string): any[][] {
    const lines: any[][] = [];
    let row: string[] = [""];
    let insideQuote = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push("");
      } else if ((char === '\r' || char === '\n') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        lines.push(row);
        row = [""];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || row[0] !== "") {
      lines.push(row);
    }
    return lines;
  }

  runFuzzyColumnMapping(headers: string[]) {
    const mod = this.activeModule();
    if (!mod) return;

    const newMappings: Record<string, number> = {};
    const suggestions: Record<string, any> = {};
    const fields = mod.fields.filter(f => !f.system && !['id', 'status'].includes(f.name));

    fields.forEach(field => {
      const fName = field.name;
      const fLabel = field.label;
      const cleanFName = cleanText(fName);
      const cleanFLabel = cleanText(fLabel);
      
      let bestIndex = -1;
      let highestScore = 0;
      let matchType = 'Sin asignar';

      headers.forEach((header, index) => {
        const cleanHeader = cleanText(header);
        let score = 0;

        if (cleanHeader === cleanFName || cleanHeader === cleanFLabel) {
          score = 100;
        }
        else if (SYNONYMS[fName]?.some(syn => cleanText(syn) === cleanHeader)) {
          score = 90;
        }
        else if (cleanHeader.includes(cleanFName) || cleanFName.includes(cleanHeader) ||
                 cleanHeader.includes(cleanFLabel) || cleanFLabel.includes(cleanHeader)) {
          score = 60;
        }
        else if (SYNONYMS[fName]?.some(syn => cleanHeader.includes(cleanText(syn)) || cleanText(syn).includes(cleanHeader))) {
          score = 50;
        }

        if (score > highestScore) {
          highestScore = score;
          bestIndex = index;
        }
      });

      if (highestScore >= 90) {
        matchType = 'Coincidencia exacta';
      } else if (highestScore >= 50) {
        matchType = 'Sugerencia';
      }

      newMappings[fName] = bestIndex;
      suggestions[fName] = { score: highestScore, label: bestIndex !== -1 ? headers[bestIndex] : '', type: matchType };
    });

    this.mappings.set(newMappings);
    this.mappingSuggestions.set(suggestions);
  }

  handleMappingChange(fieldName: string, headerIndex: number) {
    this.mappings.update(prev => ({
      ...prev,
      [fieldName]: headerIndex
    }));
  }

  getSuggestion(fieldName: string): { score: number; label: string; type: string } {
    return this.mappingSuggestions()[fieldName] || { score: 0, label: '', type: 'Sin asignar' };
  }

  handleReset() {
    this.step.set(1);
    this.sourceFile.set(null);
    this.sourceHeaders.set([]);
    this.sourceRows.set([]);
    this.mappings.set({});
    this.selectedModuleId.set('');
    this.processedRows.set([]);
    this.observations.set([]);
    this.addAiMessage('Se han restablecido los datos. Por favor, selecciona el módulo y carga el archivo para comenzar de nuevo.');
  }

  handleGoToStep2() {
    if (!this.selectedModuleId()) {
      alert('Por favor selecciona un módulo de destino.');
      return;
    }
    if (this.sourceHeaders().length === 0) {
      alert('Por favor carga un archivo de base de datos origen.');
      return;
    }
    this.step.set(2);
    // Refresh fuzzy matching just in case
    this.runFuzzyColumnMapping(this.sourceHeaders());
    this.addAiMessage(`Hemos avanzado al Paso 2: Mapeo de Columnas. He enlazado las columnas sugeridas para el módulo **${this.activeModule()?.label}**. Puedes revisar los campos abajo y ajustar lo que requieras.`);
  }

  handleProcessData() {
    this.processing.set(true);
    this.step.set(3);

    setTimeout(() => {
      const mod = this.activeModule();
      if (!mod) return;

      const fields = mod.fields.filter(f => !f.system && !['id', 'status'].includes(f.name));
      const results: any[] = [];
      const newObs: any[] = [];
      let totalWarnings = 0;
      let totalCorrections = 0;

      const canonicalDepts: Record<string, string> = {};
      const canonicalMunis: Record<string, Set<string>> = {};
      const cleanDeptToOriginal: Record<string, string> = {};
      const cleanMuniToOriginal: Record<string, string> = {};

      Object.entries(this.divipola || {}).forEach(([dept, munis]) => {
        const cleanDept = cleanText(dept);
        canonicalDepts[cleanDept] = dept;
        cleanDeptToOriginal[cleanDept] = dept;

        canonicalMunis[cleanDept] = new Set((munis as string[] || []).map(cleanText));
        (munis as string[] || []).forEach(muni => {
          const cleanM = cleanText(muni);
          cleanMuniToOriginal[`${cleanDept}::${cleanM}`] = muni;
        });
      });

      this.sourceRows().forEach((row, rowIndex) => {
        const recordIndex = rowIndex + 2;
        const mappedRow: Record<string, string> = {};
        const rowObs: any[] = [];

        // Apply column mappings
        fields.forEach(field => {
          const sourceIdx = this.mappings()[field.name];
          let value = sourceIdx !== undefined && sourceIdx !== -1 ? row[sourceIdx] : '';
          
          if (value === undefined || value === null) {
            value = '';
          }
          
          mappedRow[field.name] = String(value).trim();
        });

        // 1. Cleansing emails
        fields.forEach(field => {
          if (field.type === 'email' && mappedRow[field.name]) {
            const rawVal = mappedRow[field.name];
            let cleanVal = rawVal.toLowerCase().replace(/\s+/g, '');
            if (rawVal !== cleanVal) {
              mappedRow[field.name] = cleanVal;
              totalCorrections++;
              rowObs.push({
                type: 'correction',
                message: `Fila ${recordIndex}: Se depuraron espacios/mayúsculas del correo en "${field.label}" ("${rawVal}" ➔ "${cleanVal}").`
              });
            }
            if (!cleanVal.includes('@') || !cleanVal.includes('.')) {
              totalWarnings++;
              rowObs.push({
                type: 'warning',
                message: `Fila ${recordIndex}: El correo en "${field.label}" ("${cleanVal}") no tiene un formato válido.`
              });
            }
          }
        });

        // 2. Cleansing phones
        fields.forEach(field => {
          const isPhone = field.name.toLowerCase().includes('phone') || field.name.toLowerCase().includes('tel');
          if (isPhone && mappedRow[field.name]) {
            const rawVal = mappedRow[field.name];
            let cleanVal = rawVal.replace(/[\s\-\.\(\)]/g, '');
            if (rawVal !== cleanVal) {
              mappedRow[field.name] = cleanVal;
              totalCorrections++;
              rowObs.push({
                type: 'correction',
                message: `Fila ${recordIndex}: Se limpiaron caracteres especiales del teléfono "${field.label}" ("${rawVal}" ➔ "${cleanVal}").`
              });
            }
          }
        });

        // 3. DIVIPOLA Department & Municipality validation
        let hasDept = 'department' in mappedRow;
        let hasMuni = 'municipality' in mappedRow;

        if (hasDept && mappedRow['department']) {
          const rawDept = mappedRow['department'];
          const normDept = cleanText(rawDept);
          const matchedDept = canonicalDepts[normDept];

          if (matchedDept) {
            if (rawDept !== matchedDept) {
              mappedRow['department'] = matchedDept;
              totalCorrections++;
              rowObs.push({
                type: 'correction',
                message: `Fila ${recordIndex}: Se normalizó el departamento a DIVIPOLA ("${rawDept}" ➔ "${matchedDept}").`
              });
            }

            if (hasMuni && mappedRow['municipality']) {
              const rawMuni = mappedRow['municipality'];
              const normMuni = cleanText(rawMuni);
              const deptMunis = canonicalMunis[normDept];

              if (deptMunis && deptMunis.has(normMuni)) {
                const matchedMuni = cleanMuniToOriginal[`${normDept}::${normMuni}`];
                if (rawMuni !== matchedMuni) {
                  mappedRow['municipality'] = matchedMuni;
                  totalCorrections++;
                  rowObs.push({
                    type: 'correction',
                    message: `Fila ${recordIndex}: Se normalizó el municipio a DIVIPOLA ("${rawMuni}" ➔ "${matchedMuni}").`
                  });
                }
              } else {
                totalWarnings++;
                rowObs.push({
                  type: 'warning',
                  message: `Fila ${recordIndex}: El municipio "${rawMuni}" no se encontró en DIVIPOLA para el departamento "${matchedDept}".`
                });
              }
            }
          } else {
            totalWarnings++;
            rowObs.push({
              type: 'warning',
              message: `Fila ${recordIndex}: El departamento "${rawDept}" no coincide con ningún departamento de DIVIPOLA Colombia.`
            });
          }
        }

        // 4. Missing required fields check
        fields.forEach(field => {
          if (field.required && !mappedRow[field.name]) {
            totalWarnings++;
            rowObs.push({
              type: 'warning',
              message: `Fila ${recordIndex}: El campo requerido "${field.label}" está vacío.`
            });
          }
        });

        // 5. Checkboxes conversion
        fields.forEach(field => {
          if (field.type === 'checkbox') {
            const rawVal = cleanText(mappedRow[field.name]);
            if (['si', 'sí', 's', 'yes', 'y', '1', 'true', 'activo'].includes(rawVal)) {
              mappedRow[field.name] = 'Sí';
            } else if (rawVal) {
              mappedRow[field.name] = 'No';
            } else {
              mappedRow[field.name] = field.defaultValue === true ? 'Sí' : 'No';
            }
          }
        });

        // Add defaults for empty fields
        fields.forEach(field => {
          if (!mappedRow[field.name] && field.defaultValue !== undefined) {
            mappedRow[field.name] = String(field.defaultValue);
          }
        });

        results.push(mappedRow);
        if (rowObs.length > 0) {
          newObs.push(...rowObs);
        }
      });

      this.processedRows.set(results);
      this.observations.set(newObs);
      this.stats.set({
        total: this.sourceRows().length,
        warnings: newObs.filter(o => o.type === 'warning').length,
        corrections: newObs.filter(o => o.type === 'correction').length,
        clean: results.length
      });
      this.processing.set(false);

      this.addAiMessage(`¡Limpieza y mapeo completados! He procesado **${this.sourceRows().length} registros**. Encontré **${newObs.filter(o => o.type === 'correction').length} correcciones automáticas** (DIVIPOLA, correos) y **${newObs.filter(o => o.type === 'warning').length} advertencias**. El archivo está listo para su descarga.`);
    }, 1200);
  }

  async handleDownloadExcel() {
    const mod = this.activeModule();
    if (this.processedRows().length === 0 || !mod) return;

    try {
      const fields = mod.fields.filter(f => f.name !== 'id' && f.name !== 'status');
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Entorno Virtual PNMC - Asistente IA';
      workbook.created = new Date();

      const templateSheet = workbook.addWorksheet('Plantilla', {
        views: [{ state: 'frozen', ySplit: 1 }],
      });

      // Add Headers Row
      templateSheet.addRow(fields.map(f => f.label));

      // Add Processed Rows
      this.processedRows().forEach(row => {
        const rowData = fields.map(field => row[field.name] || '');
        templateSheet.addRow(rowData);
      });

      // Style Header
      templateSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      templateSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF291242' } };
      templateSheet.getRow(1).alignment = { vertical: 'middle', wrapText: true };
      templateSheet.getRow(1).height = 30;

      // Auto-fit Columns
      templateSheet.columns = fields.map((f, idx) => {
        const labelLen = String(f.label || '').length;
        let maxValLen = 0;
        this.processedRows().forEach(row => {
          const valLen = String(row[f.name] || '').length;
          if (valLen > maxValLen) maxValLen = valLen;
        });
        return { width: Math.min(45, Math.max(16, Math.max(labelLen, maxValLen) + 3)) };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pnmc_importado_${mod.id}_ia.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      this.addAiMessage(`¡El archivo "pnmc_importado_${mod.id}_ia.xlsx" ha sido generado y descargado! Puedes subirlo directamente en la sección del módulo de ${mod.label}.`);
    } catch (err: any) {
      console.error(err);
      alert('Error al generar el archivo Excel: ' + err.message);
    }
  }
}
