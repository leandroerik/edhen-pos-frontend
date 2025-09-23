import { Cliente } from './cliente';
import { VentaDetalle } from './venta-detalle';

export interface Venta {
  id: number;
  fechaVenta: Date;
  metodoPago: string; // O podrías usar un enum en TypeScript
  tipoCompra: string;
  estadoVenta: string;
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  
  cliente: Cliente;
  detalles: VentaDetalle[];
}