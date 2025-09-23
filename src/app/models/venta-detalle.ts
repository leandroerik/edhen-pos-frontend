import { Venta } from './venta';
import { ProductoVariante } from './producto-variante';

export interface VentaDetalle {
  id: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  
  venta: Venta;
  variante: ProductoVariante;
}