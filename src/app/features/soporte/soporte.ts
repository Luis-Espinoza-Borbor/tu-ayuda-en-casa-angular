import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  imports: [CommonModule],
  selector: 'app-soporte',
  styleUrl: './soporte.css',
  templateUrl: './soporte.html',
})
export class SoporteComponent {

  enviarSugerencia(event: Event) {
    event.preventDefault();
    Swal.fire({
      icon: 'success',
      title: '¡Sugerencia Enviada!',
      text: 'Gracias por hacernos llegar tus comentarios. Los tomaremos en cuenta para seguir mejorando.',
      confirmButtonColor: '#0F265C'
    });
    
    // Limpiamos el formulario después de enviarlo
    (event.target as HTMLFormElement).reset();
  }
}
