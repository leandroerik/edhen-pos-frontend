import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080';
  private loggedIn = new BehaviorSubject<boolean>(false);

  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {
    this.loggedIn.next(!!this.getToken());
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.setToken(response.token);
          this.loggedIn.next(true);
        }
      })
    );
  }

  setToken(token: string): void {
    sessionStorage.setItem('token', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  // ¡Este es el método que necesitas!
  isLoggedIn(): boolean {
    return this.loggedIn.getValue();
  }

  logout(): void {
    sessionStorage.removeItem('token');
    this.loggedIn.next(false);
  }

}