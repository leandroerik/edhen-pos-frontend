import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ventas-online',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas-online.component.html',
  styleUrls: ['./ventas-online.component.css']
})
export class VentasOnlineComponent implements OnInit {
  items = [
    { name: 'Remera Deportiva', variant: 'Talle M, Color Blanco', quantity: 1, price: 5000 },
    { name: 'Short de Baño', variant: 'Talle L, Color Naranja', quantity: 1, price: 6000 }
  ];

  subtotal: number = 0;
  shippingCost: number = 1000;
  total: number = 0;
  
  customer = {
    name: 'Nombre del Cliente',
    address: 'Calle Falsa 123'
  };

  ngOnInit(): void {
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal + this.shippingCost;
  }
}