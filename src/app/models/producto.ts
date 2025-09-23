import { Categoria } from './categoria';
import { ProductoVariante } from './producto-variante';

export interface Producto {
  id: number;
  codigoBarras: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  imagenUrl: string;
  activo: boolean;
  
  categoria: Categoria;
  variantes: ProductoVariante[];
}