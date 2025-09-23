import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductModalComponent } from '../../../../shared/product-modal/product-modal.component';

@Component({
  selector: 'app-ventas-local',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductModalComponent],
  templateUrl: './ventas-local.component.html',
  styleUrls: ['./ventas-local.component.css']
})
export class VentasLocalComponent implements OnInit {

  // Tu lista completa de productos
  allProducts = [
    {
      id: 1,
      name: 'Remera Deportiva Dry-Fit',
      image: 'https://placehold.co/200x200/cccccc/333333/png?text=Remera+Deportiva',
      price: 5000,
      category: 'Ropa Deportiva',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Negro', 'Blanco', 'Gris'],
      stockTotal: 80,
      salesCount: 150, // Ejemplo de conteo de ventas
      variants: [
        { talla: 'S', color: 'Negro', stock: 10 },
        { talla: 'M', color: 'Negro', stock: 15 },
        { talla: 'L', color: 'Negro', stock: 10 },
        { talla: 'S', color: 'Blanco', stock: 5 },
        { talla: 'M', color: 'Blanco', stock: 12 },
        { talla: 'L', color: 'Blanco', stock: 8 },
        { talla: 'M', color: 'Gris', stock: 20 },
        { talla: 'L', color: 'Gris', stock: 15 },
        { talla: 'XL', color: 'Gris', stock: 0 }
      ]
    },
    {
      id: 2,
      name: 'Pantalón de Jean Clásico',
      image: 'https://placehold.co/200x200/cccccc/333333/png?text=Pantalón+Jean',
      price: 8500,
      category: 'Pantalones',
      tallas: ['30', '32', '34', '36'],
      colores: ['Azul', 'Celeste'],
      stockTotal: 47,
      salesCount: 50,
      variants: [
        { talla: '30', color: 'Azul', stock: 12 },
        { talla: '32', color: 'Azul', stock: 20 },
        { talla: '34', color: 'Azul', stock: 15 },
        { talla: '32', color: 'Celeste', stock: 5 },
        { talla: '34', color: 'Celeste', stock: 10 }
      ]
    },
    {
      id: 3,
      name: 'Campera de Cuero Sintético',
      image: 'https://placehold.co/200x200/cccccc/333333/png?text=Campera+Cuero',
      price: 15000,
      category: 'Camperas',
      tallas: ['S', 'M', 'L'],
      colores: ['Negro', 'Marrón'],
      stockTotal: 30,
      salesCount: 200,
      variants: [
        { talla: 'S', color: 'Negro', stock: 8 },
        { talla: 'M', color: 'Negro', stock: 12 },
        { talla: 'L', color: 'Negro', stock: 7 },
        { talla: 'S', color: 'Marrón', stock: 3 }
      ]
    },
    {
      id: 4,
      name: 'Zapatillas Urbanas',
      image: 'https://placehold.co/200x200/cccccc/333333/png?text=Zapatillas+Urbanas',
      price: 12000,
      category: 'Calzado',
      tallas: ['38', '39', '40', '41', '42'],
      colores: ['Negro', 'Blanco'],
      stockTotal: 5,
      salesCount: 10,
      variants: [
        { talla: '38', color: 'Negro', stock: 1 },
        { talla: '39', color: 'Negro', stock: 2 },
        { talla: '40', color: 'Negro', stock: 2 },
        { talla: '41', color: 'Blanco', stock: 0 },
        { talla: '42', color: 'Blanco', stock: 0 }
      ]
    }
  ];

  products: any[] = []; 
  
  categories: string[] = [];
  colors: string[] = [];

  selectedCategory: string = 'Todas';
  selectedColor: string = 'Todos';
  selectedSort: string = 'name-asc';
  selectedStockFilter: string = 'all';

  items: any[] = [];
  subtotal: number = 0;
  discount: number = 0;
  total: number = 0;
  showModal: boolean = false;
  selectedProduct: any;

  ngOnInit(): void {
    this.categories = ['Todas', ...new Set(this.allProducts.map(p => p.category))];
    this.colors = ['Todos', ...new Set(this.allProducts.flatMap(p => p.colores))];
    this.filterAndSortProducts();
    this.calculateTotals();
  }

  // Método unificado para filtrar y ordenar
  filterAndSortProducts(): void {
    // 1. Filtrar
    let filtered = this.allProducts.filter(product => {
      const categoryMatch = this.selectedCategory === 'Todas' || product.category === this.selectedCategory;
      const colorMatch = this.selectedColor === 'Todos' || product.colores.includes(this.selectedColor);
      
      let stockMatch = true;
      if (this.selectedStockFilter === 'low') {
        stockMatch = product.stockTotal <= 10; // Ejemplo: stock bajo si es <= 10
      } else if (this.selectedStockFilter === 'high') {
        stockMatch = product.stockTotal > 50; // Ejemplo: stock alto si es > 50
      }

      return categoryMatch && colorMatch && stockMatch;
    });

    // 2. Ordenar
    if (this.selectedSort === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.selectedSort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (this.selectedSort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (this.selectedSort === 'most-sold') {
      filtered.sort((a, b) => b.salesCount - a.salesCount);
    }

    this.products = filtered;
  }

  openModal(product: any): void {
    this.selectedProduct = product;
    this.showModal = true;
  }
  
  closeProductModal(): void {
    this.showModal = false;
    this.selectedProduct = null;
  }

  addItemToCart(event: { product: any, variant: any, quantity: number }): void {
    const existingItem = this.items.find(
      cartItem => cartItem.product.id === event.product.id && 
      cartItem.variant.talla === event.variant.talla && 
      cartItem.variant.color === event.variant.color
    );
    
    if (existingItem) {
      existingItem.quantity += event.quantity;
    } else {
      this.items.push({
        product: event.product,
        name: event.product.name,
        variant: event.variant,
        quantity: event.quantity,
        price: event.product.price
      });
    }
    this.calculateTotals();
  }

  removeFromCart(index: number): void {
    this.items.splice(index, 1);
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal - this.discount;
  }
}
