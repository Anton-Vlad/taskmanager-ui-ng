import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginRequest: LoginRequest = {
    username: '',
    password: ''
  };

  loading:  boolean = false;
  error:  string = '';
  returnUrl: string = '/tasks';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Get return url from route parameters or default to '/tasks'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tasks';

    // Redirect if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (! this.loginRequest.username || ! this.loginRequest.password) {
      this.error = 'Please enter username and password';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.error = 'Invalid username or password';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Login failed. Please try again.';
        }
        console.error('Login error:', err);
      }
    });
  }
}
