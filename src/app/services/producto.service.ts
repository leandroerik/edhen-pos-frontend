import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoVariante } from '../models/producto-variante'; // Importa el modelo

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/api/productos/variantes';

  constructor(private http: HttpClient) {}

  // Especificamos el tipo de retorno
  getProductoBySku(sku: string): Observable<ProductoVariante> {
    const url = `${this.apiUrl}/${sku}`;
    return this.http.get<ProductoVariante>(url); // ¡Aquí también!
  }
}