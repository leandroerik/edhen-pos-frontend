import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  // Ahora usamos un Set para almacenar múltiples menús abiertos
  expandedMenus: Set<string> = new Set<string>();

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Esto asegura que el menú correcto se abra al cargar la página
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const activeMenu = this.findActiveParentMenu();
      if (activeMenu) {
        this.expandedMenus.add(activeMenu);
      }
    });
  }

  // Permite que el menú se expanda y colapse
  toggleMenu(menuName: string): void {
    if (this.expandedMenus.has(menuName)) {
      this.expandedMenus.delete(menuName); // Si está abierto, lo cierra
    } else {
      this.expandedMenus.add(menuName); // Si está cerrado, lo abre
    }
  }

  // Verifica si un menú está abierto para aplicar la clase CSS
  isMenuOpen(menuName: string): boolean {
    return this.expandedMenus.has(menuName);
  }

  // Busca el menú padre activo basado en la URL
  private findActiveParentMenu(): string | null {
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/ventas')) return 'ventas';
    if (currentUrl.startsWith('/inventario')) return 'inventario';
    if (currentUrl.startsWith('/clientes')) return 'clientes';
    if (currentUrl.startsWith('/envios')) return 'envios';
    if (currentUrl.startsWith('/reportes')) return 'reportes';
    return null;
  }
}