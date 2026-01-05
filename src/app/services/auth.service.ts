import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response';
import { LoginRequest, RegisterRequest } from '../models/auth-request';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject:  BehaviorSubject<User | null>;
  public currentUser:  Observable<User | null>;

  constructor(private http: HttpClient) {
    // Load user from localStorage on service initialization
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject. asObservable();
  }

  // Get current user value
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user is logged in
  public get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Register new user
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  // Login user
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  // Logout user
  logout(): void {
    // Remove user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');

    // Update current user subject
    this.currentUserSubject. next(null);
  }

  // Get JWT token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Handle auth response (save token and user)
  private handleAuthResponse(response: AuthResponse): void {
    // Save token
    localStorage.setItem('token', response.token);

    // Save user info
    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email
    };
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Update current user subject
    this.currentUserSubject.next(user);
  }
}
