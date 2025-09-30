import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductModalComponent } from '../../../../shared/product-modal/product-modal.component';
import { CartSaleReceipt, CartService } from '../../../../services/cart/cart.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartSidebarService } from '../../../../services/cart/cart-sidebar.service';

@Component({
  selector: 'app-ventas-local',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductModalComponent],
  templateUrl: './ventas-local.component.html',
  styleUrls: ['./ventas-local.component.css']
})
export class VentasLocalComponent implements OnInit, OnDestroy {

  // Tu lista completa de productos
  allProducts = [
    {
      id: 1,
      name: 'Remera Deportiva Dry-Fit',
      image: 'https://placehold.co/200x200/cccccc/333333/png?text=Remera+Deportiva',
      price: 5000,
      category: 'Ropa Deportiva',
      barcode: 'REM-DRY-0001',
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
      barcode: 'PAN-JEAN-0002',
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
      barcode: 'CAM-CUER-0003',
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
      barcode: 'ZAP-URB-0004',
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

  totalItems: number = 0;
  showModal: boolean = false;
  selectedProduct: any;

  lastScannedCode: string | null = null;
  scanFeedbackMessage: string | null = null;
  scanFeedbackType: 'success' | 'error' | 'info' = 'info';

  private barcodeBuffer = '';
  private lastKeyTime = 0;
  private feedbackTimeout: any;
  private destroy$ = new Subject<void>();

  constructor(
    private readonly cartService: CartService,
    private readonly cartSidebar: CartSidebarService
  ) {}

  ngOnInit(): void {
    this.categories = ['Todas', ...new Set(this.allProducts.map(p => p.category))];
    this.colors = ['Todos', ...new Set(this.allProducts.flatMap(p => p.colores))];
    this.filterAndSortProducts();
    this.cartService.items$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      });

    this.cartService.saleCompleted$
      .pipe(takeUntil(this.destroy$))
      .subscribe(sale => {
        this.applySaleToInventory(sale);
        this.lastScannedCode = null;
        this.setScanFeedback('success', `Venta ${sale.saleId} generada. Stock actualizado.`);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }
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
    this.cartService.addItem(event.product, event.variant, event.quantity);
    this.setScanFeedback('success', `${event.product.name} agregado al carrito.`);
  }

  openCart(): void {
    this.cartSidebar.open();
  }

  @HostListener('window:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent): void {
    if (this.showModal) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
      return;
    }

    const currentTime = Date.now();
    if (currentTime - this.lastKeyTime > 100) {
      this.barcodeBuffer = '';
    }

    if (event.key === 'Enter') {
      const barcode = this.barcodeBuffer.trim();
      this.barcodeBuffer = '';
      if (barcode) {
        this.processBarcode(barcode);
        event.preventDefault();
      }
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.barcodeBuffer += event.key;
    }

    this.lastKeyTime = currentTime;
  }

  private processBarcode(barcode: string): void {
    const product = this.allProducts.find(p => p.barcode === barcode);
    if (!product) {
      this.setScanFeedback('error', `No se encontró producto para el código ${barcode}.`);
      return;
    }

    const variant = product.variants.find((v: any) => v.stock > 0);
    if (!variant) {
      this.setScanFeedback('error', `El producto ${product.name} no tiene stock disponible.`);
      return;
    }

    this.cartService.addItem(product, variant, 1);
    this.lastScannedCode = barcode;
    this.setScanFeedback('success', `${product.name} agregado por escaneo.`);
  }

  private applySaleToInventory(sale: CartSaleReceipt): void {
    sale.items.forEach(item => {
      const product = this.allProducts.find(p => p.id === item.product.id);
      if (!product) {
        return;
      }

      const variant = product.variants.find((v: any) => v.talla === item.variant.talla && v.color === item.variant.color);
      if (variant) {
        variant.stock = Math.max(0, variant.stock - item.quantity);
      }

      product.stockTotal = Math.max(0, product.stockTotal - item.quantity);
      product.salesCount = (product.salesCount ?? 0) + item.quantity;
    });

    this.filterAndSortProducts();
  }

  private setScanFeedback(type: 'success' | 'error' | 'info', message: string): void {
    this.scanFeedbackType = type;
    this.scanFeedbackMessage = message;

    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }

    this.feedbackTimeout = setTimeout(() => {
      this.scanFeedbackMessage = null;
    }, 4000);
  }
}
