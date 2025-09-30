import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface CartVariant {
  talla: string;
  color: string;
  stock: number;
}

export interface CartItem {
  product: any;
  name: string;
  variant: CartVariant;
  quantity: number;
  price: number;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  total: number;
  totalItems: number;
}

export interface CartSaleReceipt extends CartTotals {
  saleId: string;
  createdAt: string;
  items: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'pos-cart-items';
  private readonly discountKey = 'pos-cart-discount';
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.loadInitialItems());
  private discountSubject = new BehaviorSubject<number>(this.loadInitialDiscount());
  private saleSubject = new Subject<CartSaleReceipt>();

  readonly items$ = this.itemsSubject.asObservable();
  readonly discount$ = this.discountSubject.asObservable();
  readonly saleCompleted$ = this.saleSubject.asObservable();

  addItem(product: any, variant: CartVariant, quantity: number): void {
    const items = [...this.itemsSubject.value];
    const existingIndex = items.findIndex(item =>
      item.product.id === product.id &&
      item.variant.talla === variant.talla &&
      item.variant.color === variant.color
    );

    if (existingIndex > -1) {
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: items[existingIndex].quantity + quantity
      };
    } else {
      items.push({
        product,
        name: product.name,
        variant,
        quantity,
        price: product.price
      });
    }

    this.updateItems(items);
  }

  removeItem(index: number): void {
    const items = [...this.itemsSubject.value];
    items.splice(index, 1);
    this.updateItems(items);
  }

  updateQuantity(index: number, quantity: number): void {
    const items = [...this.itemsSubject.value];
    if (!items[index]) {
      return;
    }

    if (quantity <= 0) {
      items.splice(index, 1);
    } else {
      items[index] = {
        ...items[index],
        quantity
      };
    }

    this.updateItems(items);
  }

  clearCart(): void {
    this.updateItems([]);
    this.setDiscount(0);
  }

  getSubtotal(): number {
    return this.getSubtotalFromItems(this.itemsSubject.value);
  }

  getDiscount(): number {
    return this.discountSubject.value;
  }

  setDiscount(value: number): void {
    const sanitized = Math.max(0, value);
    const subtotal = this.getSubtotalFromItems(this.itemsSubject.value);
    const clamped = Math.min(sanitized, subtotal);
    this.discountSubject.next(clamped);
    this.persistDiscount(clamped);
  }

  getTotalsSnapshot(): CartTotals {
    const items = this.itemsSubject.value;
    const subtotal = this.getSubtotalFromItems(items);
    const discount = Math.min(this.discountSubject.value, subtotal);
    const total = subtotal - discount;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, discount, total, totalItems };
  }

  completeSale(): CartSaleReceipt | null {
    const items = this.itemsSubject.value;
    if (!items.length) {
      return null;
    }

    const totals = this.getTotalsSnapshot();
    const sale: CartSaleReceipt = {
      ...totals,
      saleId: this.generateSaleId(),
      createdAt: new Date().toISOString(),
      items: items.map(item => ({ ...item }))
    };

    this.updateItems([]);
    this.setDiscount(0);
    this.saleSubject.next(sale);

    return sale;
  }

  private updateItems(items: CartItem[]): void {
    this.itemsSubject.next(items);
    this.persistItems(items);
    this.syncDiscountWithSubtotal(items);
  }

  private loadInitialItems(): CartItem[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('No se pudo cargar el carrito desde el almacenamiento local.', error);
      return [];
    }
  }

  private loadInitialDiscount(): number {
    if (typeof window === 'undefined') {
      return 0;
    }

    const stored = window.localStorage.getItem(this.discountKey);
    if (!stored) {
      return 0;
    }

    const parsed = Number(stored);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  private persistItems(items: CartItem[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.warn('No se pudo guardar el carrito en el almacenamiento local.', error);
    }
  }

  private persistDiscount(discount: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.discountKey, String(discount));
  }

  private syncDiscountWithSubtotal(items: CartItem[]): void {
    const subtotal = this.getSubtotalFromItems(items);
    const discount = Math.min(this.discountSubject.value, subtotal);
    if (discount !== this.discountSubject.value) {
      this.discountSubject.next(discount);
      this.persistDiscount(discount);
    }
  }

  private getSubtotalFromItems(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  private generateSaleId(): string {
    const timestamp = Date.now();
    const randomSegment = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `POS-${timestamp}-${randomSegment}`;
  }
}