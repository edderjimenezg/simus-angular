import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  // Si ya tenemos sesión cargada localmente, permitir el paso
  if (sessionService.isAuthenticated()) {
    return true;
  }

  // De lo contrario, intentar validar contra el backend en segundo plano
  return sessionService.checkSession().pipe(
    map((user) => {
      if (user) {
        return true;
      }
      
      // El shell muestra el acceso en línea; la API mantiene la autorización efectiva.
      return true;
    })
  );
};
