import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- Importamos ChangeDetectorRef
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth';

@Component({
  imports: [FormsModule, CurrencyPipe, DatePipe],
  selector: 'app-admin-dashboard',
  styleUrl: './admin-dashboard.css',
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent implements OnInit {
  // Estadísticas
  ventasTotales: number = 0; 
  serviciosCompletados: number = 0;
  trabajadoresAprobados: number = 0;

  // Gestión de Profesiones
  profesiones: string[] = [];
  nuevaProfesion: string = '';

  // Arreglos que se llenarán con Firebase
  trabajadores: any[] = [];
  mensajes: any[] = [];

  // Inyectamos el AuthService, Router y ChangeDetectorRef
  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef // <-- Lo inyectamos aquí
  ) {}

  ngOnInit() {
    // --- VALIDACIÓN DE ROL TOLERANTE A MAYÚSCULAS ---
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    const rolUsuario = usuarioActual.rol ? usuarioActual.rol.toLowerCase().trim() : '';

    // Verificamos si contiene 'admin' o 'administrador'
    if (!usuarioActual || (!rolUsuario.includes('admin'))) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para acceder al panel de administración.',
        confirmButtonColor: '#0F265C'
      });
      this.router.navigate(['/']); 
      return;
    }

    this.cargarProfesiones();
    this.cargarDatosFirebase(); 
  }

  async cargarDatosFirebase() {
    try {
      this.trabajadores = await this.authService.obtenerTrabajadores();
      this.mensajes = await this.authService.obtenerMensajes();
      
      // Calculamos cuántos trabajadores están aprobados
      this.trabajadoresAprobados = this.trabajadores.filter(t => t.estado === 'Aprobado').length;

      // FORZAMOS A ANGULAR A REPINTAR LA PANTALLA CON LOS DATOS NUEVOS
      this.cdr.detectChanges(); 

    } catch (error) {
      console.error("Error al cargar datos:", error);
      Swal.fire('Error', 'No se pudieron cargar los datos del servidor.', 'error');
    }
  }

  // --- Lógica de Profesiones ---
  cargarProfesiones() {
    const profesionesGuardadas = JSON.parse(localStorage.getItem('profesiones') || 'null');
    if (profesionesGuardadas) {
      this.profesiones = profesionesGuardadas;
    } else {
      this.profesiones = ['Limpieza', 'Gasfitería', 'Pintura', 'Niñera', 'Electricidad'];
      this.guardarProfesiones();
    }
  }

  guardarProfesiones() {
    localStorage.setItem('profesiones', JSON.stringify(this.profesiones));
  }

  agregarProfesion() {
    if (this.nuevaProfesion.trim() === '') return;
    if (this.profesiones.includes(this.nuevaProfesion.trim())) {
      Swal.fire('Atención', 'Esta profesión ya existe', 'warning');
      return;
    }
    this.profesiones.push(this.nuevaProfesion.trim());
    this.guardarProfesiones();
    this.nuevaProfesion = '';
  }

  eliminarProfesion(index: number) {
    this.profesiones.splice(index, 1);
    this.guardarProfesiones();
  }

  // --- Lógica de Trabajadores y Mensajes conectada a Firebase ---
  
  async cambiarEstado(trabajador: any, nuevoEstado: string) {
    try {
      await this.authService.actualizarEstadoTrabajador(trabajador.id, nuevoEstado);
      trabajador.estado = nuevoEstado; 
      
      this.trabajadoresAprobados = this.trabajadores.filter(t => t.estado === 'Aprobado').length;
      
      // Forzamos actualización visual al cambiar el estado
      this.cdr.detectChanges();

      Swal.fire({
        toast: true, position: 'top-end', icon: 'success', 
        title: `Trabajador ${nuevoEstado.toLowerCase()}`, showConfirmButton: false, timer: 2000
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
    }
  }

  async eliminarMensaje(id: string) {
    try {
      await this.authService.eliminarMensaje(id);
      this.mensajes = this.mensajes.filter(m => m.id !== id);
      
      // Forzamos actualización visual al eliminar mensaje
      this.cdr.detectChanges();

      Swal.fire({
        toast: true, position: 'top-end', icon: 'success', 
        title: 'Mensaje eliminado', showConfirmButton: false, timer: 2000
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el mensaje.', 'error');
    }
  }
}