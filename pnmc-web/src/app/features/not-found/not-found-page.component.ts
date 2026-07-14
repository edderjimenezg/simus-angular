import { Component, inject } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  template: `
    <main
      class="min-h-screen flex flex-col items-center justify-center bg-[#291242] px-6 py-32 text-center text-white"
      role="main"
    >
      <p class="font-alternate text-[0.7rem] font-bold uppercase tracking-[0.35em] text-[#00DA5E]">
        Error 404
      </p>
      <h1 class="mt-4 font-gregor text-6xl sm:text-7xl md:text-8xl leading-none">
        Página no encontrada
      </h1>
      <p class="mt-6 max-w-xl font-nunito text-sm sm:text-base text-white/70 leading-relaxed">
        La página que buscas no existe o fue movida. Verifica la dirección o vuelve al
        inicio para seguir explorando el Plan Nacional de Música para la Convivencia.
      </p>

      <div class="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          (click)="goHome()"
          class="rounded-xl bg-[#00DA5E] px-7 py-3 font-alternate text-[0.72rem] font-bold uppercase tracking-widest text-[#291242] transition-all hover:bg-[#8BF784] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#291242] cursor-pointer"
        >
          Volver al inicio
        </button>
        <button
          type="button"
          (click)="goToMap()"
          class="rounded-xl border border-white/25 bg-white/10 px-7 py-3 font-alternate text-[0.72rem] font-bold uppercase tracking-widest text-white transition-all hover:border-white/40 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DA5E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#291242] cursor-pointer"
        >
          Ir al mapa ecosistémico
        </button>
      </div>
    </main>
  `,
})
export class NotFoundPageComponent {
  private navigationService = inject(NavigationService);

  goHome(): void {
    this.navigationService.navigate('home');
  }

  goToMap(): void {
    this.navigationService.navigate('mapa');
  }
}
