import { Producto } from './producto';
import { Color } from './color';
import { Talla } from './talla';

export interface ProductoVariante {
  id: number;
  sku: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  activo: boolean;

  producto: Producto;
  color: Color;
  talla: Talla;
}