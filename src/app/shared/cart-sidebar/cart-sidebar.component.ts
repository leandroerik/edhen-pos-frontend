import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CartItem, CartSaleReceipt, CartService } from '../../services/cart/cart.service';
import { CartSidebarService } from '../../services/cart/cart-sidebar.service';

interface CartFeedback {
  type: 'success' | 'info' | 'error';
  message: string;
}

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.css']
})
export class CartSidebarComponent implements OnInit, OnDestroy {
  private readonly cartService = inject(CartService);
  private readonly sidebarService = inject(CartSidebarService);

  readonly isOpen$ = this.sidebarService.isOpen$;
  readonly items$ = this.cartService.items$;
  readonly totals$ = combineLatest([
    this.cartService.items$,
    this.cartService.discount$
  ]).pipe(map(() => this.cartService.getTotalsSnapshot()));

  discount = 0;
  feedback: CartFeedback | null = null;

  private feedbackTimeout: any;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.cartService.discount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.discount = value;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  closeSidebar(): void {
    this.sidebarService.close();
  }

  openSidebar(): void {
    this.sidebarService.open();
  }

  onDiscountChange(value: number): void {
    const normalized = Number(value);
    this.cartService.setDiscount(Number.isFinite(normalized) ? normalized : 0);
  }

  removeItem(index: number): void {
    this.cartService.removeItem(index);
    this.setFeedback('info', 'Producto eliminado del carrito.');
  }

  increment(index: number, item: CartItem): void {
    const maxStock = item.variant.stock ?? Number.MAX_SAFE_INTEGER;
    const newQuantity = Math.min(item.quantity + 1, maxStock);
    this.cartService.updateQuantity(index, newQuantity);
  }

  decrement(index: number, item: CartItem): void {
    const newQuantity = item.quantity - 1;
    this.cartService.updateQuantity(index, newQuantity);
  }

  onQuantityInput(event: Event, index: number, item: CartItem): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    if (Number.isNaN(value)) {
      return;
    }

    const maxStock = item.variant.stock ?? Number.MAX_SAFE_INTEGER;
    const sanitizedValue = Math.max(0, Math.min(value, maxStock));
    this.cartService.updateQuantity(index, sanitizedValue);
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.setFeedback('info', 'El carrito se vació correctamente.');
  }

  finalizeSale(): void {
    const sale = this.cartService.completeSale();
    if (!sale) {
      this.setFeedback('error', 'Necesitas agregar productos antes de generar una venta.');
      return;
    }

    this.openSalePreview(sale);
    this.setFeedback('success', `Venta generada (#${sale.saleId}).`);
    this.sidebarService.close();
  }

  trackByIndex(index: number): number {
    return index;
  }

  private openSalePreview(sale: CartSaleReceipt): void {
    if (typeof window === 'undefined') {
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) {
      this.setFeedback('error', 'No se pudo abrir la vista previa del comprobante.');
      return;
    }

    const rows = sale.items.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>
          <strong>${item.name}</strong><br>
          <small>Talle ${item.variant.talla} · Color ${item.variant.color}</small>
        </td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const documentContent = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Comprobante de Venta ${sale.saleId}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 2rem; color: #111; background: #fff; }
            h1 { text-align: center; margin-bottom: 1.5rem; font-size: 1.6rem; letter-spacing: 0.02em; }
            .meta { margin-bottom: 1.5rem; font-size: 0.95rem; }
            .meta span { display: block; margin-bottom: 0.25rem; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
            th, td { border: 1px solid #d1d5db; padding: 0.75rem; text-align: left; font-size: 0.9rem; }
            th { background: #f3f4f6; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.08em; }
            tfoot td { font-weight: 600; }
            .totals { max-width: 300px; margin-left: auto; border: 1px solid #d1d5db; border-radius: 10px; overflow: hidden; }
            .totals div { display: flex; justify-content: space-between; padding: 0.75rem 1rem; font-weight: 600; }
            .totals div:nth-child(odd) { background: #f9fafb; }
            .totals div.total { background: #111; color: #fff; font-size: 1.05rem; }
          </style>
        </head>
        <body>
          <h1>Comprobante de Venta</h1>
          <div class="meta">
            <span><strong>N° de venta:</strong> ${sale.saleId}</span>
            <span><strong>Fecha:</strong> ${new Date(sale.createdAt).toLocaleString()}</span>
            <span><strong>Artículos:</strong> ${sale.totalItems}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="totals">
            <div><span>Subtotal</span><span>$${sale.subtotal.toFixed(2)}</span></div>
            <div><span>Descuento</span><span>$${sale.discount.toFixed(2)}</span></div>
            <div class="total"><span>Total</span><span>$${sale.total.toFixed(2)}</span></div>
          </div>
          <script>window.addEventListener('load', () => { window.print(); });</script>
        </body>
      </html>
    `;

    printWindow.document.write(documentContent);
    printWindow.document.close();
  }

  private setFeedback(type: CartFeedback['type'], message: string): void {
    this.feedback = { type, message };

    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }

    this.feedbackTimeout = setTimeout(() => {
      this.feedback = null;
    }, 3500);
  }
}
