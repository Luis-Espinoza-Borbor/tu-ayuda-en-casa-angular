import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  imports: [FormsModule, CurrencyPipe],
  selector: 'app-servicios',
  styleUrl: './servicios.css',
  templateUrl: './servicios.html',
})
export class ServiciosComponent implements OnInit {
  textoBusqueda: string = '';
  categoriaSeleccionada: string = '';
  categorias: string[] = [];
  trabajadores: any[] = [];
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      const profesionesGuardadas = JSON.parse(localStorage.getItem('profesiones') || 'null');
      if (profesionesGuardadas) {
        this.categorias = profesionesGuardadas;
      }
    } catch(e) {}

    this.route.queryParams.subscribe(params => {
      if (params['q']) this.textoBusqueda = params['q'];
      if (params['cat']) this.categoriaSeleccionada = params['cat'];
    });

    try {
      const todosTrabajadores = await this.authService.obtenerTrabajadores();
      this.trabajadores = todosTrabajadores.filter((t: any) => t.estado === 'Aprobado');
    } catch (error) {
      console.error("Error al cargar profesionales:", error);
    } finally {
      this.cargando = false;
    }

    try {
      console.log("1. Llamando a Firebase...");
      const todosTrabajadores = await this.authService.obtenerTrabajadores();
      
      console.log("2. Firebase respondió! Trabajadores encontrados:", todosTrabajadores.length);
      this.trabajadores = todosTrabajadores.filter((t: any) => t.estado === 'Aprobado');
      
    } catch (error) {
      console.error("Error al cargar profesionales:", error);
    } finally {
      console.log("3. Apagando el círculo de carga...");
      this.cargando = false;
      this.cdr.detectChanges();
    }

  }

  get trabajadoresFiltrados() {
    return this.trabajadores.filter(t => {
      // Protegemos por si algún trabajador antiguo no tiene categoría
      const categoriaTrabajador = t.categoria || ''; 
      
      const coincideTexto = t.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
                            categoriaTrabajador.toLowerCase().includes(this.textoBusqueda.toLowerCase());
                            
      const coincideCat = this.categoriaSeleccionada === '' || categoriaTrabajador === this.categoriaSeleccionada;
      
      return coincideTexto && coincideCat;
    });
  }

  irAAgendar(idProfesional: string) {
    this.router.navigate(['/agendamiento'], { queryParams: { prof: idProfesional } });
  }
}