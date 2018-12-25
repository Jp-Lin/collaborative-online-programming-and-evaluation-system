import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
      return Promise.resolve(true);
    } else {
      // localStorage.setItem('redirectLoc', state.url);
      this.authService.redirectLoc = state.url;
      // this.router.navigate(['/']);
      this.authService.lock.show();
      return Promise.resolve(false);
    }
  }
}
