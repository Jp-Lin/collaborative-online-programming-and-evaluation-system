import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';
import { Auth0Lock } from 'auth0-lock';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  clientID = 'pN5bXc-I0YtQbY_4Ldb3Hzib3Q8qeH-K';
  domain = 'cojapp.auth0.com';
  redirectUrl = 'http://localhost:3000';
  // redirectUrl = this.router.url;
  responseType = 'token id_token';
  requestedScopes = 'openid profile email';

  username = '';
  lock = new Auth0Lock(this.clientID, this.domain,
    {
      autoclose: true,
      auth: {
        redirect: true,
        redirectUrl: this.redirectUrl,
        responseType: this.responseType,
        params: {
          scope: this.requestedScopes
        }
      }
    });

  constructor(public router: Router) {
    if (this.isAuthenticated()) {
      this.username = this.getUser().nickname;
    }
    // this.username = this.getUser() ? this.getUser().nickname : '';
  }

  public login(): void {
    this.lock.show();
  }

  public handleAuthentication(): void {
    this.lock.on('authenticated', (authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        // this.router.navigate(['/']);
        this.lock.getUserInfo(authResult.accessToken, (err, profile) => {
          localStorage.setItem('profile', JSON.stringify(profile));
          this.username = profile.nickname;
        });
      }
    });
    this.lock.on('authorization_error', (err) => {
      this.router.navigate(['/']);
      console.log(err);
    });
  }

  private setSession(authResult): void {
    // Set the time that the Access Token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());

    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('profile');
    // Go back to the home route
    // this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  public getUser() {
    return JSON.parse(localStorage.getItem('profile'));
  }
}
