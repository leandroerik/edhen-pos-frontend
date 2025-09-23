import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';
import { ProductoService } from '../services/producto.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scanner',
    standalone: true, // Si usas componentes standalone
  imports: [CommonModule], // <-- ¡Añade CommonModule aquí!
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})
export class ScannerComponent implements OnInit, AfterViewInit, OnDestroy {
  private codeReader: BrowserMultiFormatReader;
  private scannerControls: IScannerControls | null = null;
  public result: string | null = null;
  public loading: boolean = true;
  public errorMessage: string | null = null;

  @ViewChild('interactive', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;

  constructor(private productoService: ProductoService) {
    this.codeReader = new BrowserMultiFormatReader();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.startScanning();
  }

  startScanning(): void {
    // La promesa resuelve con el objeto de control del escáner.
    this.codeReader.decodeFromVideoDevice(undefined, this.videoElement.nativeElement, (result, err) => {
      // Esta función de callback se ejecuta por cada escaneo
      if (result) {
        this.handleScan(result);
      } else if (err) {
        this.handleError(err);
      }
    })
    .then((controls: IScannerControls) => {
        // Almacenamos el objeto de control para detener el escáner más tarde.
        this.scannerControls = controls;
        console.log('Escáner iniciado. Apunta a un código de barras.');
        this.loading = false;
    })
    .catch((err) => {
      this.errorMessage = 'Error al iniciar el escáner: ' + err;
      this.loading = false;
    });
  }

  private handleScan(result: Result): void {
      this.result = result.getText();
      console.log('Código escaneado:', this.result);
      
      this.stopScanning(); // Detenemos el escaneo inmediatamente
      
      // Lógica para la llamada a la API
      this.productoService.getProductoBySku(this.result).subscribe({
          next: (data) => {
              console.log('Datos del producto:', data);
              // Aquí puedes mostrar los datos del producto en tu UI
          },
          error: (apiErr) => {
              console.error('Error al obtener el producto:', apiErr);
              this.errorMessage = 'Producto no encontrado o error en la API.';
          }
      });
  }

  private handleError(err: any): void {
    // Lógica para manejar errores en el callback
    this.errorMessage = 'Error en el escaneo: ' + err;
  }

  stopScanning(): void {
    if (this.scannerControls) {
      this.scannerControls.stop(); // Usa el método 'stop' del objeto de control
      this.scannerControls = null;
    }
  }

  ngOnDestroy(): void {
    this.stopScanning();
  }
}