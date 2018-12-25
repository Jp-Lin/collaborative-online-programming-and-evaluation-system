import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth0Lock } from 'auth0-lock';
import { Response, Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  clientID = 'pN5bXc-I0YtQbY_4Ldb3Hzib3Q8qeH-K';
  domain = 'cojapp.auth0.com';
  redirectUrl = 'http://localhost:3000/';
  // redirectUrl = this.router.url;
  responseType = 'token id_token';
  requestedScopes = 'openid profile email roles';
  _lock = new Auth0Lock(this.clientID, this.domain, {
    autoclose: true,
    auth: {
      redirect: false,
      redirectUrl: this.redirectUrl,
      responseType: this.responseType,
      params: {
        scope: this.requestedScopes
      }
    }
  });
  username = '';
  redirectLoc = '';
  nameSpaceAuth0Role = 'https://localhost/roles';

  get lock() {
    return this._lock;
  }

  constructor(private router: Router, private http: Http) {
    if (this.isAuthenticated()) {
      this.username = this.getProfile().nickname;
    }
    // this.username = this.getUser() ? this.getUser().nickname : '';
  }

  public login(): void {
    // localStorage.setItem('redirectLoc', this.router.url);
    this.redirectLoc = this.router.url;
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
        // const redirectLoc: string = localStorage.getItem('redirectLoc');
        this.router.navigate([this.redirectLoc]);

        // this.router.navigate([this.router.url]);
      }
    });

    this.lock.on('authorization_error', (err) => {
      this.router.navigate(['/']);
      console.log(err);
    });

    this.lock.on('hide', () => {
      // const redirectLoc = localStorage.getItem('redirectLoc');
      if (this.redirectLoc === '/profile') {
        this.router.navigate(['/']);
      } else {
        this.router.navigate([this.router.url]);
      }
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
    localStorage.removeItem('redirectUrl');
    // const redirectLoc: string = localStorage.getItem('redirectLoc');
    this.router.navigate([this.router.url]);
    // Go back to the home route
    // this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }
  public isAdmin(): boolean {
    if (this.isAuthenticated()
        && this.getProfile()
        && this.getProfile()[this.nameSpaceAuth0Role].includes('Admin')) {
      return true;
    } else {
      return false;
    }
  }

  public getProfile() {
    return JSON.parse(localStorage.getItem('profile'));
  }

  resetPassword(): Observable<Response> {
    const profile = this.getProfile();
    const url = `https://${this.domain}/dbconnections/change_password`;
    const headers = new Headers({ 'content-type': 'application/json' });
    const options: RequestOptions = new RequestOptions({ headers: headers });

    const body = {
      client_id: this.clientID,
      email: profile.email,
      connection: 'Username-Password-Authentication'
    };
    return this.http.post(url, body, options);
  }

  handleError(error: any): Promise<any> {
    console.error('Error occurred', error);
    return Promise.reject(error.message || error);
  }
}
