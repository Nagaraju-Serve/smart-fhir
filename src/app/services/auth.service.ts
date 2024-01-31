import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { ReplaySubject, of } from 'rxjs';

/**
 * Service which contains the methods to manage the logged in User
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private _router: Router) { }

    /**
     * Logout the active user. Clears the Session and navigates to the landing page.
     */
  logout() {
    sessionStorage.clear();
    this.loggedIn.next(false);
    this._router.navigate(['/index']);
  }

  /**
   * Flags that a user has logged in to the application
   */
  login() {
    this.loggedIn.next(true);
    this._router.navigate(['/resources/Patient']);
  }

  /**
   * Method called to check if there is an active user logged in to the application.
   * @returns {Observable<boolean>} Subscribers get notified when the state changes.
   */
  get isLoggedIn() {
    if (sessionStorage.getItem('tokenResponse')) {
      this.loggedIn.next(true);
    } else {
      this.loggedIn.next(false);
    }
    return this.loggedIn.asObservable();
  }

  private _error = new ReplaySubject<any>(1);

  /**
   * Method to publish that an application wide error has occured.
   * @param error Error object
   */
  setError(error: any) {
    this._error.next(error);
  }

  setAuthorizationCode() {
    
  }

  getAllClientApps(): Observable<any> {
      return of([
        {
          name: 'CHBase PPE - Sample Standalone and EHR Launch App',
          uniqueName: 'epic',
          clientId: 'f3200124-94ee-4dfd-a91f-014de56174de',
          redirectUri: 'http://localhost:4200/home',
          launchUrl: 'http://localhost:4200/home',
          scopes: 'patient/*.*',
          standalonePatient: true,
          ehrLaunch: true,
          server: 'epic',
          // secret: '5e24b756-9a70-4ea7-a602-150c639280a3'
      }
      ]);
  }
}
