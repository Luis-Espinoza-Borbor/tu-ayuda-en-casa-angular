import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  selector: 'app-calificar',
  styleUrl: './calificar.css',
  templateUrl: './calificar.html',
})
export class CalificarComponent implements OnInit {
  estrellas = [1, 2, 3, 4, 5]; // Arreglo para dibujar las 5 estrellas
  calificacionSeleccionada = 0;
  comentario = '';
  
  // Variables simuladas (más adelante las puedes recibir de la base de datos)
  profesionalNombre = 'Profesional del Servicio';
  fechaServicio = new Date();

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // Si quisieras pasar el nombre por la URL (ej. /calificar?nombre=Juan), se leería así:
    this.route.queryParams.subscribe(params => {
      if (params['nombre']) {
        this.profesionalNombre = params['nombre'];
      }
    });
  }

  // Al hacer clic en una estrella, guardamos su número
  seleccionarEstrella(valor: number) {
    this.calificacionSeleccionada = valor;
  }

  enviarResena() {
    // Validaciones
    if (this.calificacionSeleccionada === 0) {
      Swal.fire('Atención', 'Por favor, selecciona una calificación de 1 a 5 estrellas.', 'warning');
      return;
    }
    
    if (!this.comentario.trim()) {
      Swal.fire('Atención', 'Por favor, cuéntanos un poco sobre tu experiencia.', 'warning');
      return;
    }

    // Aquí a futuro enviarás los datos a tu colección "resenas" en Firebase.
    // Por ahora, simulamos el éxito y volveamos al historial.
    Swal.fire({
      icon: 'success',
      title: '¡Gracias por tu opinión!',
      text: 'Tu reseña ha sido enviada y ayudará a otros usuarios.',
      confirmButtonColor: '#0F265C'
    }).then(() => {
      this.router.navigate(['/historial-servicios']);
    });
  }
}
