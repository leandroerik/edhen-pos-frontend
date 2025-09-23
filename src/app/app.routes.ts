import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth';
import { LoginGuard } from './auth/guards/login';

import { ScannerComponent } from './scanner/scanner.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { VentasComponent } from './features/ventas/ventas.component';
import { VentasLocalComponent } from './features/ventas/components/ventas-local/ventas-local.component';
import { VentasOnlineComponent } from './features/ventas/components/ventas-online/ventas-online.component';

export const routes: Routes = [
  // Authentication Routes
  {
    path: 'login',
    loadComponent: () => import('./auth/componentLogin/login.component').then(c => c.LoginComponent),
    canActivate: [LoginGuard]
  },

  // Main Application Routes (protected by AuthGuard)
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'scanner', component: ScannerComponent, canActivate: [AuthGuard] },
  {
    path: 'ventas',
    component: VentasComponent,
    canActivate: [AuthGuard], // Protect the entire 'ventas' section
    children: [
      { path: '', redirectTo: 'local', pathMatch: 'full' }, // Redirect /ventas to /ventas/local
      { path: 'local', component: VentasLocalComponent },
      { path: 'online', component: VentasOnlineComponent }
    ]
  },
  {
    path: 'users',
    loadComponent: () => import('./components/users/user.component').then(c => c.UserComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./components/form-user/form-user.component').then(c => c.FormUserComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/form-user/form-user.component').then(c => c.FormUserComponent),
    canActivate: [AuthGuard]
  },

  // Fallback route: This must be the LAST route in the array.
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];