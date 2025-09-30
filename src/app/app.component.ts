import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/serviceAuth/auth.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { filter } from 'rxjs/operators';

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
  showSidebar = false;
  private readonly routesWithoutSidebar = ['/login'];

    // El método que maneja el evento emitido por el navbar
  onSidebarToggle(minimized: boolean): void {
    this.isSidebarMinimized = minimized;
  }
  constructor(private authService: AuthService, private router: Router) {
    this.updateSidebarVisibility(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.updateSidebarVisibility(event.urlAfterRedirects));
  }

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

  private updateSidebarVisibility(url: string): void {
    const normalizedUrl = this.normalizeUrl(url);
    this.showSidebar = this.isLoggedIn && !this.routesWithoutSidebar.includes(normalizedUrl);
  }

  private normalizeUrl(url: string): string {
    const cleanedUrl = url.split('?')[0];
    return cleanedUrl.startsWith('/') ? cleanedUrl : `/${cleanedUrl}`;
  }
}
