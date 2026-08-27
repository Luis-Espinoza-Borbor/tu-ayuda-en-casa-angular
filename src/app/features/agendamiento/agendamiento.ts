import { CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth';
import { ActivatedRoute, Router } from '@angular/router';

declare var L: any;

@Component({
  imports: [FormsModule, CurrencyPipe],
  selector: 'app-agendamiento',
  styleUrl: './agendamiento.css',
  templateUrl: './agendamiento.html',
})
export class AgendamientoComponent implements OnInit, AfterViewInit {
  profesionales: any[] = [];
  profesionalSeleccionadoId: string = '';
  
  reserva = {
    fecha: '',
    hora: '',
    horas: 1,
    direccion: '',
    latitud: -2.19616, 
    longitud: -79.88621
  };

  private mapa: any;
  private marcador: any;

  // <- Añadimos private route: ActivatedRoute dentro de los paréntesis
  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute 
  ) {}

  async ngOnInit() {
    try {
      // Reutilizamos la función que creaste para el panel de admin
      const todosTrabajadores = await this.authService.obtenerTrabajadores();
      // Solo mostramos a los trabajadores que ya fueron aprobados
      this.profesionales = todosTrabajadores.filter((t: any) => t.estado === 'Aprobado');
    } catch (error) {
      Swal.fire('Error', 'No pudimos cargar la lista de profesionales', 'error');
    }

    // <- Agregamos esto para leer la URL y autoseleccionar al profesional
    this.route.queryParams.subscribe(params => {
      if (params['prof']) {
        this.profesionalSeleccionadoId = params['prof'];
      }
    });
  }

  ngAfterViewInit() {
    this.iniciarMapa();
  }

  // Obtenemos los datos completos del profesional seleccionado en el <select>
  get profesionalSeleccionado() {
    return this.profesionales.find(p => p.id === this.profesionalSeleccionadoId);
  }

  // Angular calculará esto automáticamente cada vez que cambien las horas o el profesional
  get totalPagar() {
    const tarifa = this.profesionalSeleccionado ? this.profesionalSeleccionado.tarifa : 0;
    return tarifa * this.reserva.horas;
  }

  iniciarMapa() {
    this.mapa = L.map('mapaAgendamiento').setView([this.reserva.latitud, this.reserva.longitud], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.mapa);

    this.marcador = L.marker([this.reserva.latitud, this.reserva.longitud], { draggable: true }).addTo(this.mapa);

    this.marcador.on('dragend', () => {
      const posicion = this.marcador.getLatLng();
      this.reserva.latitud = posicion.lat;
      this.reserva.longitud = posicion.lng;
    });
  }

  obtenerUbicacionGPS() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((posicion) => {
        this.reserva.latitud = posicion.coords.latitude;
        this.reserva.longitud = posicion.coords.longitude;
        
        this.mapa.setView([this.reserva.latitud, this.reserva.longitud], 16);
        this.marcador.setLatLng([this.reserva.latitud, this.reserva.longitud]);
        
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Ubicación obtenida', showConfirmButton: false, timer: 2000 });
      }, () => {
        Swal.fire('Error', 'No pudimos acceder a tu GPS. Verifica los permisos de tu navegador.', 'error');
      });
    }
  }

  onSubmit() {
    // Si no ha elegido a nadie, detenemos el proceso
    if (!this.profesionalSeleccionadoId) {
      Swal.fire('Atención', 'Debes elegir un profesional de la lista.', 'warning');
      return;
    }

    // Empaquetamos toda la información de la reserva
    const datosReserva = {
      ...this.reserva,
      profesional: this.profesionalSeleccionado,
      totalPagar: this.totalPagar
    };

    // Guardamos los datos temporalmente para que la página de Checkout pueda leerlos
    localStorage.setItem('reservaPendiente', JSON.stringify(datosReserva));
    
    // Lo enviamos a la pasarela de pago
    this.router.navigate(['/checkout']);
  }
}
