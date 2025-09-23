import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Datos de ejemplo para el dashboard
  totalSales: number = 254800;
  totalItemsSold: number = 78;
  newCustomers: number = 5;
  pendingShipments: number = 12;

  bestSellers = [
    { name: 'Remera Deportiva', sales: 25 },
    { name: 'Pantalón de Jean', sales: 18 },
    { name: 'Campera de Cuero', sales: 12 },
    { name: 'Buzo con Capucha', sales: 10 }
  ];

  lowStockItems = [
    { name: 'Remera Deportiva', variant: 'Talle L, Negra', stock: 3 },
    { name: 'Zapatillas Urbanas', variant: 'Talle 42, Blancas', stock: 5 },
    { name: 'Short de Baño', variant: 'Talle M, Azul', stock: 2 }
  ];

  constructor() { }

  ngOnInit(): void {
    // Aquí se cargarían los datos reales desde un servicio al iniciar el componente
  }
}