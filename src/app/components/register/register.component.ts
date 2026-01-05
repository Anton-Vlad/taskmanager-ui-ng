import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth-request';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerRequest: RegisterRequest = {
    username: '',
    email: '',
    password: ''
  };

  confirmPassword: string = '';
  loading: boolean = false;
  error: string = '';
  validationErrors: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Redirect if already logged in
    if (this. authService.isLoggedIn) {
      this.router.navigate(['/tasks']);
    }
  }

  onSubmit(): void {
    // Clear previous errors
    this.error = '';
    this.validationErrors = [];

    // Client-side validation
    if (!this.registerRequest.username || !this.registerRequest.email || !this.registerRequest.password) {
      this.error = 'All fields are required';
      return;
    }

    if (this.registerRequest.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.registerRequest.password. length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;

    this.authService.register(this. registerRequest).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.loading = false;

        // Handle different error types
        if (err. error?.validationErrors) {
          // Validation errors from backend
          this.validationErrors = err.error.validationErrors;
          this.error = 'Please fix the validation errors';
        } else if (err.error?.message) {
          // Custom error message from backend
          this.error = err.error.message;
        } else if (err.status === 409) {
          // Conflict - username or email already exists
          this. error = 'Username or email already exists';
        } else {
          this.error = 'Registration failed.  Please try again.';
        }

        console.error('Registration error:', err);
      }
    });
  }
}
