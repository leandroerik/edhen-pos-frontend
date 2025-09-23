import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/serviceAuth/auth.service'; 
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CustomCrudFront';
  isMenuActive = false;
  isSidebarMinimized = false; // <-- Declara esta propiedad
  isDesktop: boolean = window.innerWidth > 768;


    // El método que maneja el evento emitido por el navbar
  onSidebarToggle(minimized: boolean): void {
    this.isSidebarMinimized = minimized;
  }
  constructor(private authService: AuthService) {}

 
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const screenWidth = window.innerWidth;
    if (screenWidth > 768) {
      this.isMenuActive = false;
    }
  }

  expandedIndex: number | null = null;

  toggleService(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}
