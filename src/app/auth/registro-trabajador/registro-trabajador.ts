import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth';

@Component({
  imports: [FormsModule],
  selector: 'app-registro-trabajador',
  styleUrl: './registro-trabajador.css',
  templateUrl: './registro-trabajador.html',
})
export class RegistroTrabajadorComponent implements OnInit {
  trabajador = {
    nombre: '',
    correo: '',
    password: '',
    cedula: '',
    fechaNacimiento: '',
    especialidad: '',
    tarifa: null,
    experiencia: ''
  };

  categorias: string[] = [];
  cargando: boolean = false;
  edadValida: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Cargamos las profesiones dinámicas para el select
    const profesionesGuardadas = JSON.parse(localStorage.getItem('profesiones') || 'null');
    if (profesionesGuardadas) {
      this.categorias = profesionesGuardadas;
    }
  }

  verificarEdad() {
    if (!this.trabajador.fechaNacimiento) return;
    const hoy = new Date();
    const fechaNac = new Date(this.trabajador.fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    
    this.edadValida = edad >= 18;
  }

  validarSoloLetras(event: KeyboardEvent) {
    const patron = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    // Si la tecla presionada no coincide con el patrón de letras, bloqueamos la acción
    if (!patron.test(event.key)) {
      event.preventDefault();
    }
  }

  // Escudo 2: Bloquea cualquier tecla que no sea un número (0-9)
  validarSoloNumeros(event: KeyboardEvent) {
    const patron = /^[0-9]+$/;
    // Si la tecla presionada no es un número, bloqueamos la acción
    if (!patron.test(event.key)) {
      event.preventDefault();
    }
  }

  // Algoritmo Oficial de Cédula Ecuatoriana (Módulo 10)
  validarCedulaReal(cedula: string): boolean {
    if (!cedula || cedula.length !== 10) return false;
    
    // Los dos primeros dígitos corresponden a la provincia (01 a 24)
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;
    
    // El tercer dígito es menor a 6 para personas naturales
    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito < 0 || tercerDigito > 5) return false;

    // Cálculo del dígito verificador
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula.charAt(i), 10);
      if (i % 2 === 0) { // Posiciones impares se multiplican por 2
        valor = valor * 2;
        if (valor > 9) valor -= 9;
      }
      suma += valor;
    }
    const decenaSuperior = Math.ceil(suma / 10) * 10;
    let digitoVerificador = decenaSuperior - suma;
    if (digitoVerificador === 10) digitoVerificador = 0;

    return digitoVerificador === parseInt(cedula.charAt(9), 10);
  }

  // Verificador lógico de nombres
  validarNombreLogico(nombre: string): boolean {
    if (!nombre) return false;
    const palabras = nombre.trim().split(/\s+/);
    
    // 1. Debe tener al menos dos palabras (Nombre y Apellido)
    if (palabras.length < 2) return false; 
    
    const tieneVocal = /[aeiouáéíóúAEIOUÁÉÍÓÚ]/;
    const letrasRepetidas = /(.)\1\1/; // Detecta 3 letras iguales seguidas (ej. kkk)

    for (let palabra of palabras) {
      if (palabra.length < 2) return false; // No hay nombres de 1 sola letra
      if (!tieneVocal.test(palabra)) return false; // Todo nombre real tiene al menos una vocal
      if (letrasRepetidas.test(palabra)) return false; // Bloquea teclazos como "hjjj"
    }
    
    return true;
  }

  async onSubmit() {
    this.verificarEdad();
    let errores: string[] = [];
    
    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const regexNumeros = /^[0-9]{10}$/;

    // Validaciones del Nombre
    if (!this.trabajador.nombre || this.trabajador.nombre.trim() === '') {
      errores.push('<b>Nombre Completo:</b> Es un campo obligatorio.');
    } else if (!regexLetras.test(this.trabajador.nombre)) {
      errores.push('<b>Nombre Completo:</b> Solo debe contener letras (no números).');
    }

    // Validaciones de la Cédula
    if (!this.trabajador.cedula || this.trabajador.cedula.trim() === '') {
      errores.push('<b>Número de Cédula:</b> Es un campo obligatorio.');
    } else if (!regexNumeros.test(this.trabajador.cedula)) {
      errores.push('<b>Número de Cédula:</b> Debe ser de 10 dígitos numéricos exactos.');
    }

    // Validaciones de Contacto y Acceso
    if (!this.trabajador.correo || !this.trabajador.correo.includes('@')) {
      errores.push('<b>Correo Electrónico:</b> Formato no válido.');
    }
    if (!this.trabajador.password || this.trabajador.password.length < 6) {
      errores.push('<b>Contraseña:</b> Mínimo 6 caracteres requeridos.');
    }

    // Validaciones Profesionales y Edad
    if (!this.trabajador.fechaNacimiento) {
      errores.push('<b>Fecha de Nacimiento:</b> Es obligatoria.');
    } else if (!this.edadValida) {
      errores.push('<b>Edad:</b> Debes ser mayor de 18 años para postularte.');
    }
    if (!this.trabajador.especialidad || this.trabajador.especialidad === '') {
      errores.push('<b>Especialidad:</b> Debes elegir una categoría.');
    }
    if (!this.trabajador.tarifa || this.trabajador.tarifa <= 0) {
      errores.push('<b>Tarifa:</b> Debe ser un valor mayor a cero.');
    }
    if (!this.trabajador.experiencia || this.trabajador.experiencia.trim() === '') {
      errores.push('<b>Experiencia:</b> Debes redactar un breve resumen.');
    }

    // Mostrar alerta si hay fallos
    if (errores.length > 0) {
      const listaErrores = errores.map(error => `<li class="mb-1">${error}</li>`).join('');
      
      Swal.fire({
        icon: 'error',
        title: 'Formulario Inválido',
        html: `<p>Hemos detectado errores en tu solicitud:</p>
               <ul style="text-align: left; font-size: 0.9em;">${listaErrores}</ul>`,
        confirmButtonColor: '#0F265C'
      });
      return;
    }

    // Guardado en Firebase
    this.cargando = true;
    try {
      await this.authService.registrarTrabajador(this.trabajador);
      
      Swal.fire({
        icon: 'success',
        title: '¡Solicitud enviada!',
        text: 'Un administrador revisará tu perfil pronto.',
        confirmButtonColor: '#0F265C'
      }).then(() => {
        this.router.navigate(['/']);
      });

    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      this.cargando = false;
    }
  }
}
