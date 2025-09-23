import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.css']
})
export class ProductModalComponent implements OnChanges {
  @Input() product: any;
  @Output() productAdded = new EventEmitter<any>();
  @Output() closeModal = new EventEmitter<void>();

  selectedTalla: string | null = null;
  selectedColor: string | null = null;
  quantity: number = 1;
  stockDisponible: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.selectedTalla = null;
      this.selectedColor = null;
      this.quantity = 1;
      this.stockDisponible = 0;
    }
  }

  updateStock(): void {
    if (this.selectedTalla && this.selectedColor) {
      const selectedVariant = this.product.variants.find(
        (v: any) => v.talla === this.selectedTalla && v.color === this.selectedColor
      );
      this.stockDisponible = selectedVariant ? selectedVariant.stock : 0;
      this.quantity = 1;
    } else {
      this.stockDisponible = 0;
    }
  }

  isTallaInStock(talla: string): boolean {
    return this.product.variants.some((v: any) => v.talla === talla && v.stock > 0);
  }

  isColorInStock(color: string): boolean {
    return this.product.variants.some((v: any) => v.color === color && v.stock > 0);
  }

  incrementQuantity(): void {
    if (this.quantity < this.stockDisponible) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onAddToCart(): void {
    if (!this.selectedTalla || !this.selectedColor) {
      alert('Por favor, selecciona una talla y un color.');
      return;
    }

    if (this.quantity > 0 && this.quantity <= this.stockDisponible) {
      const selectedVariant = this.product.variants.find(
        (v: any) => v.talla === this.selectedTalla && v.color === this.selectedColor
      );

      this.productAdded.emit({
        product: this.product,
        variant: selectedVariant,
        quantity: this.quantity
      });
      this.onClose();
    } else {
      alert('La cantidad no es válida o supera el stock.');
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }
}