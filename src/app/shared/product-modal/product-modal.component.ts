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

  readonly brandPalette = [
    { name: 'Negro ónix', hex: '#0B0B0C' },
    { name: 'Blanco marfil', hex: '#F7F5F0' },
    { name: 'Arena suave', hex: '#D8C7B0' },
    { name: 'Grafito', hex: '#3B3A3A' }
  ];

  private readonly colorDictionary: Record<string, string> = {
    negro: '#0B0B0C',
    black: '#0B0B0C',
    blanco: '#FFFFFF',
    white: '#FFFFFF',
    beige: '#D8C7B0',
    arena: '#D8C7B0',
    nude: '#E9DCC7',
    gris: '#B5B5B5',
    grisoscuro: '#3B3A3A',
    grismedio: '#7D7D7D',
    marron: '#9C6B4A',
    camel: '#B89B72'
  };

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

  getColorStyle(color: string): Record<string, string> {
    const swatchColor = this.resolveColorValue(color);
    const contrastColor = this.getContrastColor(swatchColor);
    return {
      '--swatch-color': swatchColor,
      '--swatch-text-color': contrastColor,
      '--swatch-border-color': this.getBorderColor(swatchColor)
    };
  }

  private resolveColorValue(color: string): string {
    if (!color) {
      return '#F0F0F0';
    }

    const normalized = color.trim().toLowerCase().replace(/\s+/g, '');
    if (this.colorDictionary[normalized]) {
      return this.colorDictionary[normalized];
    }

    if (this.isHexColor(color.trim())) {
      return color.trim();
    }

    return '#F0F0F0';
  }

  private isHexColor(value: string): boolean {
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
  }

  private getContrastColor(hexColor: string): string {
    const { r, g, b } = this.hexToRgb(hexColor);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#0B0B0C' : '#F7F5F0';
  }

  private getBorderColor(hexColor: string): string {
    if (hexColor.toLowerCase() === '#ffffff') {
      return '#D7D7D7';
    }
    return this.adjustColorOpacity(hexColor, 0.55);
  }

  private hexToRgb(hexColor: string): { r: number; g: number; b: number } {
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  private adjustColorOpacity(hexColor: string, opacity: number): string {
    const { r, g, b } = this.hexToRgb(hexColor);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}
