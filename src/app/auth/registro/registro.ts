import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import Swal from 'sweetalert2';

declare var L: any;

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class RegistroComponent implements AfterViewInit {
  cliente = {
    nombre: '',
    cedula: '',
    correo: '',
    password: '',
    passwordConfirm: '',
    latitud: -2.19616, 
    longitud: -79.88621,
    direccion: ''
  };

  cargando: boolean = false;
  private mapa: any;
  private marcador: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngAfterViewInit() {
    this.iniciarMapa();
  }

  iniciarMapa() {
    // Inicializamos el mapa centrado en las coordenadas por defecto
    this.mapa = L.map('mapaRegistro').setView([this.cliente.latitud, this.cliente.longitud], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.mapa);

    this.marcador = L.marker([this.cliente.latitud, this.cliente.longitud], { draggable: true }).addTo(this.mapa);

    // Actualizar coordenadas al mover el pin manualmente
    this.marcador.on('dragend', () => {
      const posicion = this.marcador.getLatLng();
      this.cliente.latitud = posicion.lat;
      this.cliente.longitud = posicion.lng;
    });
  }

  obtenerUbicacionGPS() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((posicion) => {
        this.cliente.latitud = posicion.coords.latitude;
        this.cliente.longitud = posicion.coords.longitude;
        
        // Movemos el mapa y el pin a la ubicación real
        this.mapa.setView([this.cliente.latitud, this.cliente.longitud], 16);
        this.marcador.setLatLng([this.cliente.latitud, this.cliente.longitud]);
        
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success', 
          title: 'Ubicación obtenida', showConfirmButton: false, timer: 2000
        });
      }, () => {
        Swal.fire('Error', 'No pudimos acceder a tu GPS. Verifica los permisos de tu navegador.', 'error');
      });
    }
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
    let errores: string[] = [];
    
    // Reglas estrictas:
    // Solo letras (incluyendo acentos y ñ) y espacios.
    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/; 
    // Exactamente 10 números, nada de letras.
    const regexNumeros = /^[0-9]{10}$/; 

    // Validaciones del Nombre
    if (!this.cliente.nombre || this.cliente.nombre.trim() === '') {
      errores.push('<b>Nombre Completo:</b> Es un campo obligatorio.');
    } else if (!regexLetras.test(this.cliente.nombre)) {
      errores.push('<b>Nombre Completo:</b> Solo debe contener letras (no números ni símbolos).');
    }

    // Validaciones de la Cédula
    if (!this.cliente.cedula || this.cliente.cedula.trim() === '') {
      errores.push('<b>Cédula o RUC:</b> Es un campo obligatorio.');
    } else if (!regexNumeros.test(this.cliente.cedula)) {
      errores.push('<b>Cédula o RUC:</b> Debe contener exactamente 10 números (sin letras).');
    }

    // Otras validaciones obligatorias
    if (!this.cliente.correo || !this.cliente.correo.includes('@')) {
      errores.push('<b>Correo Electrónico:</b> Debes ingresar un correo válido.');
    }
    if (!this.cliente.password || this.cliente.password.length < 6) {
      errores.push('<b>Contraseña:</b> Es obligatoria y debe tener mínimo 6 caracteres.');
    }
    if (this.cliente.password !== this.cliente.passwordConfirm) {
      errores.push('<b>Confirmación:</b> Las contraseñas no coinciden.');
    }
    if (!this.cliente.direccion || this.cliente.direccion.trim() === '') {
      errores.push('<b>Ubicación:</b> La dirección de referencia es obligatoria.');
    }

    // Si hay errores, bloqueamos y mostramos la alerta detallada
    if (errores.length > 0) {
      const listaErrores = errores.map(error => `<li>${error}</li>`).join('');
      
      Swal.fire({
        icon: 'error',
        title: 'Datos Incorrectos',
        html: `<p>Por favor, corrige lo siguiente para continuar:</p>
               <ul style="text-align: left; font-size: 0.9em;">${listaErrores}</ul>`,
        confirmButtonColor: '#0F265C'
      });
      return; 
    }

    // Si todo es correcto, guardamos
    this.cargando = true;
    try {
      const { passwordConfirm, ...datosParaGuardar } = this.cliente;
      await this.authService.registrarCliente(datosParaGuardar);
      
      Swal.fire({
        icon: 'success',
        title: '¡Cuenta creada!',
        text: 'Ahora puedes iniciar sesión',
        confirmButtonColor: '#0F265C'
      }).then(() => {
        this.router.navigate(['/login']);
      });

    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      this.cargando = false;
    }
  }
}
