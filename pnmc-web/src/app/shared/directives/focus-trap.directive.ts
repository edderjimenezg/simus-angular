import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

/**
 * Atrapa el foco del teclado dentro del elemento anfitrión mientras está montado
 * (patrón de diálogo modal). Al inicializarse mueve el foco al primer elemento
 * enfocable y, al destruirse, lo devuelve al elemento que lo tenía antes de abrir.
 *
 * Uso: <div appFocusTrap role="dialog" aria-modal="true"> ... </div>
 * El cierre con Escape debe manejarlo el componente contenedor.
 */
@Directive({
  selector: '[appFocusTrap]',
  standalone: true,
})
export class FocusTrapDirective implements AfterViewInit, OnDestroy {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private previouslyFocused: HTMLElement | null = null;

  private readonly focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  ngAfterViewInit(): void {
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    // Enfocar el primer elemento enfocable dentro del modal.
    queueMicrotask(() => {
      const focusables = this.getFocusable();
      (focusables[0] ?? this.host.nativeElement).focus?.();
    });
    this.host.nativeElement.addEventListener('keydown', this.onKeydown, true);
  }

  ngOnDestroy(): void {
    this.host.nativeElement.removeEventListener('keydown', this.onKeydown, true);
    // Restaurar el foco al abridor si sigue en el documento.
    if (this.previouslyFocused && document.contains(this.previouslyFocused)) {
      this.previouslyFocused.focus?.();
    }
  }

  private getFocusable(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(this.focusableSelector),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  private onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;
    const focusables = this.getFocusable();
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    } else if (active && !this.host.nativeElement.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  };
}
