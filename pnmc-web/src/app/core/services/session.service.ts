import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AdminService } from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private _currentUser = signal<any | null>(null);

  currentUser = computed(() => this._currentUser());
  isAuthenticated = computed(() => this._currentUser() !== null);

  constructor(private adminService: AdminService) {}

  checkSession(): Observable<any> {
    return this.adminService.fetchAdminMe().pipe(
      tap((res) => {
        if (res && res.user) {
          this._currentUser.set(res.user);
        } else {
          this._currentUser.set(null);
        }
      }),
      catchError(() => {
        this._currentUser.set(null);
        return of(null);
      })
    );
  }

  login(credentials: { email: string; password?: string }): Observable<any> {
    return this.adminService.loginAdmin(credentials).pipe(
      tap((res) => {
        if (res && res.user) {
          this._currentUser.set(res.user);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.adminService.logoutAdmin().pipe(
      tap(() => {
        this._currentUser.set(null);
      }),
      catchError((err) => {
        this._currentUser.set(null);
        throw err;
      })
    );
  }

  setSession(user: any): void {
    this._currentUser.set(user);
  }
}
