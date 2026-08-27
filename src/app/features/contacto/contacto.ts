import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  imports: [FormsModule],
  selector: 'app-contacto',
  styleUrl: './contacto.css',
  templateUrl: './contacto.html',
})
export class ContactoComponent {
  mensaje = {
    nombre: '',
    correo: '',
    texto: ''
  };

  cargando: boolean = false;

  constructor(private authService: AuthService) {}

  async onSubmit() {
    this.cargando = true;
    try {
      await this.authService.enviarMensajeContacto(this.mensaje);
      
      Swal.fire({
        icon: 'success',
        title: '¡Mensaje enviado!',
        text: 'Nuestro equipo te responderá pronto.',
        confirmButtonColor: '#0F265C'
      });

      // Limpiamos el formulario después de enviarlo
      this.mensaje = { nombre: '', correo: '', texto: '' };

    } catch (error: any) {
      Swal.fire('Error', 'Hubo un problema al enviar tu mensaje. Intenta de nuevo.', 'error');
    } finally {
      this.cargando = false;
    }
  }
}
