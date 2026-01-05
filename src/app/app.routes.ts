import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'login', component:  LoginComponent },
  { path:  'register', component: RegisterComponent },

  // Protected routes (require authentication)
  {
    path: 'tasks',
    component: TaskListComponent,
    canActivate: [authGuard]  // 🔒 Protected
  },
  {
    path: 'tasks/:id',
    component: TaskDetailComponent,
    canActivate: [authGuard]  // 🔒 Protected
  },

  // Redirect unknown routes to home
  { path: '**', redirectTo: '' }
];
