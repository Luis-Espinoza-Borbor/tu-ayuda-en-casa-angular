import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  imports: [FormsModule],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class PerfilComponent implements OnInit {
  usuario = {
    nombre: '',
    cedula: '',
    correo: '',
    password: ''
  };
  
  fotoPrevia: string | ArrayBuffer | null = null;
  cargando: boolean = false;

  ngOnInit() {
    // Al cargar la página, traemos los datos actuales del usuario
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    if (usuarioLogueado && usuarioLogueado.nombre) {
      this.usuario.nombre = usuarioLogueado.nombre;
      this.usuario.cedula = usuarioLogueado.cedula || '';
      this.usuario.correo = usuarioLogueado.correo || '';
      if (usuarioLogueado.foto) {
        this.fotoPrevia = usuarioLogueado.foto;
      }
    }
  }

  // --- Funciones para Vista Previa de la Foto ---
  onArchivoSeleccionado(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      // Verificamos que sea una imagen
      if (!archivo.type.match(/image\/*/)) {
        Swal.fire('Error', 'Solo se permiten imágenes (JPG, PNG).', 'error');
        return;
      }
      
      const lector = new FileReader();
      lector.readAsDataURL(archivo);
      lector.onload = (_event) => {
        this.fotoPrevia = lector.result;
      };
    }
  }

  // --- Escudos de Teclado ---
  validarSoloLetras(event: KeyboardEvent) {
    const patron = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!patron.test(event.key)) {
      event.preventDefault();
    }
  }

  validarSoloNumeros(event: KeyboardEvent) {
    const patron = /^[0-9]+$/;
    if (!patron.test(event.key)) {
      event.preventDefault();
    }
  }

  // --- Algoritmos Inteligentes ---
  validarCedulaReal(cedula: string): boolean {
    if (!cedula || cedula.length !== 10) return false;
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;
    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito < 0 || tercerDigito > 5) return false;

    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula.charAt(i), 10);
      if (i % 2 === 0) {
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

  validarNombreLogico(nombre: string): boolean {
    if (!nombre) return false;
    const palabras = nombre.trim().split(/\s+/);
    if (palabras.length < 2) return false; 
    
    const tieneVocal = /[aeiouáéíóúAEIOUÁÉÍÓÚ]/;
    const letrasRepetidas = /(.)\1\1/;

    for (let palabra of palabras) {
      if (palabra.length < 2) return false;
      if (!tieneVocal.test(palabra)) return false;
      if (letrasRepetidas.test(palabra)) return false;
    }
    return true;
  }

  // --- Guardado del Perfil ---
  async onSubmit() {
    let errores: string[] = [];

    if (!this.usuario.nombre || this.usuario.nombre.trim() === '') {
      errores.push('<b>Nombre Completo:</b> Es obligatorio.');
    } else if (!this.validarNombreLogico(this.usuario.nombre)) {
      errores.push('<b>Nombre Completo:</b> Ingresa nombre y apellido reales.');
    }

    if (!this.usuario.cedula || this.usuario.cedula.trim() === '') {
      errores.push('<b>Número de Cédula:</b> Es obligatorio.');
    } else if (!this.validarCedulaReal(this.usuario.cedula)) {
      errores.push('<b>Número de Cédula:</b> La cédula ecuatoriana es inválida.');
    }

    if (!this.usuario.correo || !this.usuario.correo.includes('@')) {
      errores.push('<b>Correo Electrónico:</b> Es obligatorio y debe ser válido.');
    }

    if (this.usuario.password && this.usuario.password.length < 6) {
      errores.push('<b>Contraseña:</b> Si deseas cambiarla, debe tener mínimo 6 caracteres.');
    }

    if (errores.length > 0) {
      const listaErrores = errores.map(error => `<li class="mb-1">${error}</li>`).join('');
      Swal.fire({
        icon: 'error',
        title: 'Datos Inválidos',
        html: `<p>Revisa lo siguiente:</p><ul style="text-align: left; font-size: 0.9em;">${listaErrores}</ul>`,
        confirmButtonColor: '#0F265C'
      });
      return;
    }

    this.cargando = true;
    
    // Simulamos un guardado en la base de datos y actualizamos la sesión local
    setTimeout(() => {
      const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
      usuarioLogueado.nombre = this.usuario.nombre;
      usuarioLogueado.cedula = this.usuario.cedula;
      usuarioLogueado.correo = this.usuario.correo;
      if (this.fotoPrevia) {
        usuarioLogueado.foto = this.fotoPrevia;
      }
      
      localStorage.setItem('usuarioActual', JSON.stringify(usuarioLogueado));
      
      Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Tus datos se guardaron correctamente.',
        confirmButtonColor: '#0F265C'
      });
      this.cargando = false;
    }, 1500); // Simulamos el tiempo de carga de red
  }
}
