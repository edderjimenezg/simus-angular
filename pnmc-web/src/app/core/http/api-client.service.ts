import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const API_BASE_URL = environment.apiBaseUrl.replace(/\/$/, '');

const HTTP_STATUS_LABELS: Record<number, string> = {
  400: 'Solicitud inválida',
  401: 'No autenticado',
  403: 'Acceso denegado',
  404: 'Recurso no encontrado',
  409: 'Conflicto de datos',
  422: 'Validación fallida',
  429: 'Demasiadas solicitudes',
  500: 'Error interno del servidor',
  502: 'Backend no disponible',
  503: 'Servicio no disponible',
  504: 'Tiempo de espera del servidor',
};

export class ApiError extends Error {
  override name = 'ApiError';
  code: string;
  status: number | null;
  path: string;
  payload: any;
  requestId: string;
  technicalMessage: string;

  constructor(
    message: string,
    options: {
      code?: string;
      status?: number | null;
      path?: string;
      payload?: any;
      requestId?: string;
      technicalMessage?: string;
    } = {}
  ) {
    super(message);
    this.code = options.code || 'API_ERROR';
    this.status = options.status !== undefined ? options.status : null;
    this.path = options.path || '';
    this.payload = options.payload || null;
    this.requestId = options.requestId || '';
    this.technicalMessage = options.technicalMessage || '';
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  constructor(private http: HttpClient) {}

  private generateCorrelationId(): string {
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
    } catch {
      // fallback
    }
    return `req-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  private normalizeMessagePart(value: any): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private extractValidationMessage(errors: any = {}): string {
    return Object.entries(errors)
      .flatMap(([field, value]) => {
        const messages = Array.isArray(value) ? value : [value];
        return messages
          .map((msg) => this.normalizeMessagePart(msg))
          .filter(Boolean)
          .map((msg) => `${field}: ${msg}`);
      })
      .join(' ');
  }

  private extractPayloadMessage(payload: any): string {
    if (!payload || typeof payload !== 'object') return '';

    const validationMessage = payload.errors && typeof payload.errors === 'object'
      ? this.extractValidationMessage(payload.errors)
      : '';

    return (
      validationMessage ||
      this.normalizeMessagePart(payload.detail) ||
      this.normalizeMessagePart(payload.message) ||
      this.normalizeMessagePart(payload.title)
    );
  }

  private extractRequestId(payload: any): string {
    return (
      this.normalizeMessagePart(payload?.traceId) ||
      this.normalizeMessagePart(payload?.requestId) ||
      this.normalizeMessagePart(payload?.correlationId) ||
      this.normalizeMessagePart(payload?.extensions?.traceId)
    );
  }

  private buildErrorMessage(options: {
    code: string;
    fallback: string;
    status?: number | null;
    detail?: string;
    path?: string;
    requestId?: string;
  }): string {
    const statusLabel = options.status ? HTTP_STATUS_LABELS[options.status] : '';
    const parts = [`[${options.code}] ${options.fallback}`];

    if (options.status) {
      parts.push(`Estado HTTP: ${options.status}${statusLabel ? ` ${statusLabel}` : ''}`);
    }
    if (options.detail) {
      parts.push(`Detalle: ${options.detail}`);
    }
    if (options.path) {
      parts.push(`Ruta: ${options.path}`);
    }
    if (options.requestId) {
      parts.push(`ID de solicitud: ${options.requestId}`);
    }

    return parts.join(' | ');
  }

  private buildUserErrorMessage(options: {
    code: string;
    fallback: string;
    detail?: string;
  }): string {
    const cleanFallback = this.normalizeMessagePart(options.fallback).replace(/[.!?]+$/, '');
    const cleanDetail = this.normalizeMessagePart(options.detail).replace(/[.!?]+$/, '');
    const parts = [cleanFallback || 'Ocurrió un error inesperado'];

    if (cleanDetail) {
      parts.push(cleanDetail);
    }

    return `${parts.join('. ')}. Código: ${options.code}.`;
  }

  private getFullUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  }

  private getRequestHeaders(customHeaders: Record<string, string> = {}): HttpHeaders {
    let headers = new HttpHeaders({
      'Accept': 'application/json',
      'X-Correlation-ID': this.generateCorrelationId()
    });

    Object.entries(customHeaders).forEach(([key, val]) => {
      headers = headers.set(key, val);
    });

    return headers;
  }

  private handleError(error: any, fallbackMessage: string, url: string): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      const status = error.status;
      const code = `HTTP_${status}`;
      const payload = error.error;
      const requestId = this.extractRequestId(payload);
      const detail = this.extractPayloadMessage(payload);

      const technicalMessage = this.buildErrorMessage({
        code,
        fallback: fallbackMessage,
        status,
        detail,
        path: url,
        requestId
      });

      return throwError(() => new ApiError(
        this.buildUserErrorMessage({
          code,
          fallback: fallbackMessage,
          detail
        }),
        {
          code,
          status,
          path: url,
          payload,
          requestId,
          technicalMessage
        }
      ));
    }

    // Timeout o problemas de conexión
    if (error.name === 'TimeoutError') {
      const detail = 'La solicitud tardó demasiado en responder';
      const technicalMessage = this.buildErrorMessage({
        code: 'TIMEOUT',
        fallback: fallbackMessage,
        detail,
        path: url
      });

      return throwError(() => new ApiError(
        this.buildUserErrorMessage({
          code: 'TIMEOUT',
          fallback: fallbackMessage,
          detail
        }),
        {
          code: 'TIMEOUT',
          path: url,
          technicalMessage
        }
      ));
    }

    // Errores de red normales
    const detail = 'No fue posible conectar con el servidor. Verifica que la API esté activa.';
    const technicalMessage = this.buildErrorMessage({
      code: 'NETWORK',
      fallback: fallbackMessage,
      detail,
      path: url
    });

    return throwError(() => new ApiError(
      this.buildUserErrorMessage({
        code: 'NETWORK',
        fallback: fallbackMessage,
        detail: 'No fue posible conectar con el servidor'
      }),
      {
        code: 'NETWORK',
        path: url,
        technicalMessage
      }
    ));
  }

  get<T>(
    path: string,
    options: {
      params?: HttpParams | Record<string, string | number | boolean>;
      headers?: Record<string, string>;
      timeoutMs?: number;
      errorFallback?: string;
    } = {}
  ): Observable<T> {
    const url = this.getFullUrl(path);
    const headers = this.getRequestHeaders(options.headers);
    const timeoutMs = options.timeoutMs ?? 20000;
    const fallback = options.errorFallback ?? 'Error al consultar backend';

    return this.http.get<T>(url, { headers, params: options.params, withCredentials: true }).pipe(
      timeout(timeoutMs),
      catchError((err) => this.handleError(err, fallback, url))
    );
  }

  post<T>(
    path: string,
    body: any,
    options: {
      headers?: Record<string, string>;
      timeoutMs?: number;
      errorFallback?: string;
    } = {}
  ): Observable<T> {
    const url = this.getFullUrl(path);
    const headers = this.getRequestHeaders({
      'Content-Type': 'application/json',
      ...options.headers
    });
    const timeoutMs = options.timeoutMs ?? 20000;
    const fallback = options.errorFallback ?? 'Error al enviar datos al backend';

    return this.http.post<T>(url, body, { headers, withCredentials: true }).pipe(
      timeout(timeoutMs),
      catchError((err) => this.handleError(err, fallback, url))
    );
  }

  put<T>(
    path: string,
    body: any,
    options: {
      headers?: Record<string, string>;
      timeoutMs?: number;
      errorFallback?: string;
    } = {}
  ): Observable<T> {
    const url = this.getFullUrl(path);
    const headers = this.getRequestHeaders({
      'Content-Type': 'application/json',
      ...options.headers
    });
    const timeoutMs = options.timeoutMs ?? 20000;
    const fallback = options.errorFallback ?? 'Error al actualizar datos en el backend';

    return this.http.put<T>(url, body, { headers, withCredentials: true }).pipe(
      timeout(timeoutMs),
      catchError((err) => this.handleError(err, fallback, url))
    );
  }

  delete<T>(
    path: string,
    options: {
      headers?: Record<string, string>;
      timeoutMs?: number;
      errorFallback?: string;
    } = {}
  ): Observable<T> {
    const url = this.getFullUrl(path);
    const headers = this.getRequestHeaders(options.headers);
    const timeoutMs = options.timeoutMs ?? 20000;
    const fallback = options.errorFallback ?? 'Error al eliminar datos en el backend';

    return this.http.delete<T>(url, { headers, withCredentials: true }).pipe(
      timeout(timeoutMs),
      catchError((err) => this.handleError(err, fallback, url))
    );
  }
}
