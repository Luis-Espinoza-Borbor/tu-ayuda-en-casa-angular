import { Component, DoCheck, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class NavbarComponent implements OnInit, DoCheck {
  // Variables que el HTML leerá automáticamente
  usuarioActual: any = null; 
  esModoOscuro: boolean = false;

  // Inyectamos el Router para poder navegar al cerrar sesión
  constructor(private router: Router) {}

  ngOnInit() {
    // Al cargar el menú, revisamos el tema (ya no revisamos la sesión aquí, de eso se encarga DoCheck)
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado === 'dark') {
      this.esModoOscuro = true;
    }
  }

  // Angular ejecuta esto automáticamente cuando detecta cambios en la app (como un inicio de sesión)
  ngDoCheck() {
    const guardado = localStorage.getItem('usuarioActual');
    if (guardado) {
      this.usuarioActual = JSON.parse(guardado);
    } else {
      this.usuarioActual = null;
    }
  }

  toggleModoOscuro() {
    this.esModoOscuro = !this.esModoOscuro;
    const htmlElement = document.documentElement;
    
    if (this.esModoOscuro) {
      htmlElement.setAttribute('data-bs-theme', 'dark');
      localStorage.setItem('tema', 'dark');
    } else {
      htmlElement.setAttribute('data-bs-theme', 'light');
      localStorage.setItem('tema', 'light');
    }
  }

  cerrarSesion() {
    this.usuarioActual = null;
    localStorage.removeItem('usuarioActual');
    
    // Alerta de confirmación
    Swal.fire({
      toast: true, position: 'top-end', icon: 'info', 
      title: 'Sesión cerrada correctamente', showConfirmButton: false, timer: 2500
    });

    // Redirigimos a la pantalla de inicio
    this.router.navigate(['/']); 
  }
}
