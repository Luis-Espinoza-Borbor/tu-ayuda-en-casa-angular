import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink, FormsModule],
  selector: 'app-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class InicioComponent implements OnInit {
  // Variables conectadas al buscador del HTML
  textoBusqueda: string = '';
  categoriaSeleccionada: string = '';
  categorias: string[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Migramos la lógica de tu app.js para cargar las categorías base
    let profesionesGuardadas = JSON.parse(localStorage.getItem('profesiones') || 'null');
    
    if (!profesionesGuardadas) {
      profesionesGuardadas = ['Limpieza', 'Gasfitería', 'Pintura', 'Niñera', 'Electricidad'];
      localStorage.setItem('profesiones', JSON.stringify(profesionesGuardadas));
    }
    
    this.categorias = profesionesGuardadas;
  }

  buscarProfesional() {
    // Redirigimos a la ruta de servicios pasando los parámetros por la URL
    this.router.navigate(['/servicios'], {
      queryParams: {
        q: this.textoBusqueda,
        cat: this.categoriaSeleccionada
      }
    });
  }
}
