import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth';

@Component({
  imports: [FormsModule, CurrencyPipe, DatePipe],
  selector: 'app-checkout',
  styleUrl: './checkout.css',
  templateUrl: './checkout.html',
})
export class CheckoutComponent implements OnInit {
  reserva: any = null;
  cargando: boolean = false;

  tarjeta = {
    nombre: '',
    numero: '',
    expiracion: '',
    cvv: ''
  };

  // Inyectamos el AuthService en el constructor
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const datosGuardados = localStorage.getItem('reservaPendiente');
    if (datosGuardados) {
      this.reserva = JSON.parse(datosGuardados);
    } else {
      Swal.fire('Atención', 'No tienes ningún servicio pendiente de pago.', 'warning');
      this.router.navigate(['/servicios']);
    }
  }

  validarSoloNumeros(event: KeyboardEvent) {
    const patron = /^[0-9]+$/;
    if (!patron.test(event.key)) {
      event.preventDefault();
    }
  }

  validarSoloLetras(event: KeyboardEvent) {
    const patron = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!patron.test(event.key)) {
      event.preventDefault();
    }
  }

  formatearExpiracion(event: any) {
    let valor = event.target.value.replace(/\D/g, ''); 
    if (valor.length > 2) {
      valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
    }
    this.tarjeta.expiracion = valor;
  }

  onSubmit() {
    if (this.tarjeta.numero.length < 16) {
      Swal.fire('Error', 'El número de tarjeta debe tener 16 dígitos.', 'error');
      return;
    }
    if (this.tarjeta.cvv.length < 3) {
      Swal.fire('Error', 'El CVV debe tener al menos 3 dígitos.', 'error');
      return;
    }

    this.cargando = true;

    // Simulamos el tiempo de validación bancaria
    setTimeout(async () => {
      try {
        // 1. Obtenemos los datos del cliente que está conectado
        const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');

        // 2. Preparamos el paquete de datos respetando tu estructura existente de Firebase
        const reservaFinal: any = {
          // Datos del servicio (adaptados a tu BD)
          fecha: this.reserva.fecha,
          hora: this.reserva.hora,
          horasContratadas: this.reserva.horas.toString(), // En tu BD anterior era un string ("3")
          totalPagar: this.reserva.totalPagar,
          
          // Datos del profesional que se está contratando
          profesional: this.reserva.profesional, 
          idProfesional: this.reserva.profesional.id,
          
          // Datos del cliente (usamos idCliente como en tu captura)
          idCliente: usuarioActual.cedula || 'desconocido',
          clienteNombre: usuarioActual.nombre || 'Cliente Anónimo',
          
          // Estados y auditoría
          estado: 'Pendiente', // Nace como pendiente
          fechaCreacion: new Date(),
          fechaPago: new Date()
        };

        // 3. ¡Lo enviamos a Firebase!
        const idGeneradoFirebase = await this.authService.crearReserva(reservaFinal);
        
        // 4. Le asignamos el ID real para el recibo (opcional: puedes guardarlo también dentro del doc si quieres)
        reservaFinal['idReserva'] = idGeneradoFirebase;
        reservaFinal.id = idGeneradoFirebase; 
        
        this.cargando = false;
        
        Swal.fire({
          icon: 'success',
          title: '¡Pago Aprobado!',
          text: 'Tu reserva ha sido confirmada con éxito.',
          confirmButtonColor: '#0F265C'
        }).then(() => {
          // Guardamos con el ID real y borramos el pendiente
          localStorage.setItem('reservaConfirmada', JSON.stringify(reservaFinal));
          localStorage.removeItem('reservaPendiente');
          this.router.navigate(['/confirmacion']); 
        });

      } catch (error) {
        this.cargando = false;
        console.error("Error al guardar reserva:", error);
        Swal.fire('Error', 'El pago se procesó, pero hubo un problema guardando tu reserva. Contacta a soporte.', 'error');
      }
    }, 2000);
  }
}