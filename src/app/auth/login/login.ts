import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth';

@Component({
  imports: [FormsModule, RouterLink,],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class LoginComponent {
  // Variables conectadas al HTML
  correo: string = '';
  password: string = '';
  cargando: boolean = false;

  // Inyectamos nuestro servicio de Auth y el Router para navegar entre páginas
  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.correo || !this.password) return; // Validación básica

    this.cargando = true;

    try {
      // Llamamos al servicio que creamos anteriormente
      const rutaDestino = await this.authService.iniciarSesion(this.correo, this.password);
      
      // Si el login es exitoso, navegamos a la ruta correspondiente (Admin, Cliente o Trabajador)
      this.router.navigate([rutaDestino]).then(() => {
        window.location.reload(); // Recargamos rápido para que el Navbar actualice el avatar
      });

    } catch (error: any) {
      // Si Firebase rechaza el acceso, mostramos la alerta
      Swal.fire({
        icon: 'error',
        title: 'Error de acceso',
        text: error.message,
        confirmButtonColor: '#0F265C'
      });
    } finally {
      this.cargando = false;
    }
  }
}
