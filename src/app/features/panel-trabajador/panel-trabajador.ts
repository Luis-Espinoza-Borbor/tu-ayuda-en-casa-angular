import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

declare var bootstrap: any;

@Component({
  selector: 'app-panel-trabajador',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, CommonModule, FormsModule],
  styleUrl: './panel-trabajador.css',
  templateUrl: './panel-trabajador.html',
})
export class PanelTrabajadorComponent implements OnInit, OnDestroy {
  nombreTrabajador: string = 'Profesional';
  saldoDisponible: number = 150.50;
  totalRetirado: number = 320.00;
  cargandoReservas: boolean = true;
  misTrabajos: any[] = [];
  usuarioActual: any;

  // --- Variables para el Chat ---
  db: any;
  storage: any;
  reservaActivaChat: string = '';
  mensajesChat: any[] = [];
  nuevoMensajeTexto: string = '';
  suscripcionChat: any = null;
  mediaRecorder: any;
  fragmentosAudio: any[] = [];
  grabandoAudio: boolean = false;
  tiempoInicioGrabacion: number = 0;

  // --- Variables para Evidencias ---
  misEvidencias: any[] = [];
  cargandoEvidencias: boolean = true;

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    this.usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    if (this.usuarioActual && this.usuarioActual.nombre) {
      this.nombreTrabajador = this.usuarioActual.nombre;
    }

    this.inicializarFirebaseLocal();

    try {
      const idProfesional = this.usuarioActual.id; 
      if (idProfesional) {
        this.misTrabajos = await this.authService.obtenerReservasPorProfesional(idProfesional);
        this.cargarEvidenciasGlobales(idProfesional); // Cargamos las fotos al iniciar
      }
    } catch (error) {
      console.error("Error al cargar los trabajos:", error);
    } finally {
      this.cargandoReservas = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.suscripcionChat) this.suscripcionChat();
  }

  inicializarFirebaseLocal() {
    const firebaseConfig = {
      apiKey: "AIzaSyClSWONQshY4jjzlFKe73bCbK_CIeA33qo",
      authDomain: "tu-ayuda-en-casa.firebaseapp.com",
      projectId: "tu-ayuda-en-casa",
      storageBucket: "tu-ayuda-en-casa.firebasestorage.app",
      messagingSenderId: "911650981248",
      appId: "1:911650981248:web:ca8ce41238fde4fed06d65"
    };
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    this.storage = getStorage(app);
  }

  registrarCuentaBancaria() {
    Swal.fire({ icon: 'info', title: 'Cuenta Bancaria', text: 'Módulo en construcción.', confirmButtonColor: '#0F265C' });
  }

  retirarGanancias() {
    Swal.fire({ icon: 'success', title: 'Retiro Solicitado', text: 'Tu solicitud está siendo procesada.', confirmButtonColor: '#0F265C' });
  }

  // --- LÓGICA DEL CHAT ---
  abrirChatModal(idTrabajo: string) {
    this.reservaActivaChat = idTrabajo;
    this.cargarMensajes();
    const modalChat = new bootstrap.Modal(document.getElementById('modalChatFirebase'));
    modalChat.show();
  }

  cargarMensajes() {
    const q = query(collection(this.db, "conversaciones", this.reservaActivaChat, "mensajes"), orderBy("timestamp", "asc"));
    if (this.suscripcionChat) this.suscripcionChat(); 

    this.suscripcionChat = onSnapshot(q, (snapshot) => {
      this.mensajesChat = [];
      snapshot.forEach((doc) => {
        const msg = doc.data();
        msg['fechaFormateada'] = msg['timestamp'] ? msg['timestamp'].toDate() : new Date();
        this.mensajesChat.push(msg);
      });
      setTimeout(() => {
        const caja = document.getElementById('cajaMensajes');
        if (caja) caja.scrollTop = caja.scrollHeight;
      }, 100);
      this.cdr.detectChanges(); 
    });
  }

  async enviarMensajeTexto() {
    if (!this.nuevoMensajeTexto.trim() || !this.reservaActivaChat) return;
    const texto = this.nuevoMensajeTexto.trim();
    this.nuevoMensajeTexto = ''; 
    try {
      await addDoc(collection(this.db, "conversaciones", this.reservaActivaChat, "mensajes"), {
        texto: texto,
        tipoMensaje: 'texto',
        emisorRol: this.usuarioActual.rol,
        emisorNombre: this.usuarioActual.nombre || 'Profesional',
        timestamp: new Date()
      });
    } catch (e) {
      Swal.fire('Error', 'No se pudo enviar el mensaje', 'error');
    }
  }

  async iniciarGrabacion(event: Event) {
    event.preventDefault();
    if (!this.reservaActivaChat) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.fragmentosAudio = [];
      this.mediaRecorder.ondataavailable = (e: any) => {
        if (e.data.size > 0) this.fragmentosAudio.push(e.data);
      };
      
      this.mediaRecorder.start();
      this.grabandoAudio = true;
      this.tiempoInicioGrabacion = Date.now(); 

    } catch (err) {
      Swal.fire('Error', 'Debes dar permisos de micrófono al navegador.', 'warning');
    }
  }

  detenerGrabacionYSubir(event: Event) {
    event.preventDefault();
    
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
      this.grabandoAudio = false;
      
      const duracion = Date.now() - this.tiempoInicioGrabacion;

      this.mediaRecorder.onstop = async () => {
        if (duracion < 1000) {
          console.log("Audio muy corto, descartado.");
          return; 
        }

        const audioBlob = new Blob(this.fragmentosAudio, { type: 'audio/webm' });
        await this.enviarNotaDeVoz(audioBlob);
      };
    }
  }

  async enviarNotaDeVoz(audioBlob: Blob) {
    try {
      const nombreArchivo = `chats/${this.reservaActivaChat}/audio_${Date.now()}.webm`;
      const audioRef = ref(this.storage, nombreArchivo);
      await uploadBytes(audioRef, audioBlob);
      const urlAudio = await getDownloadURL(audioRef);

      await addDoc(collection(this.db, "conversaciones", this.reservaActivaChat, "mensajes"), {
        texto: urlAudio,
        tipoMensaje: 'audio',
        emisorRol: this.usuarioActual.rol,
        emisorNombre: this.usuarioActual.nombre || 'Profesional',
        timestamp: new Date()
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo enviar la nota de voz.', 'error');
    }
  }

  async subirImagenChat(event: any) {
    const file = event.target.files[0];
    if (!file || !this.reservaActivaChat) return;

    // Spinner de carga
    Swal.fire({ title: 'Enviando imagen...', text: 'Por favor espera', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const nombreArchivo = `chats/${this.reservaActivaChat}/img_${Date.now()}_${file.name}`;
      const imgRef = ref(this.storage, nombreArchivo);
      await uploadBytes(imgRef, file);
      const urlImg = await getDownloadURL(imgRef);

      await addDoc(collection(this.db, "conversaciones", this.reservaActivaChat, "mensajes"), {
        texto: urlImg,
        tipoMensaje: 'imagen', 
        emisorRol: this.usuarioActual.rol,
        emisorNombre: this.usuarioActual.nombre || 'Profesional',
        timestamp: new Date()
      });

      Swal.close();
      event.target.value = ''; 

    } catch (error) {
      Swal.fire('Error', 'No se pudo enviar la imagen al chat.', 'error');
      event.target.value = ''; 
    }
  }

  // --- LÓGICA DE FOTOS Y EVIDENCIAS ---
  cargarEvidenciasGlobales(idProfesional: string) {
    const q = query(collection(this.db, "evidencias"), where("idProfesional", "==", idProfesional));
    
    onSnapshot(q, (snapshot) => {
      this.misEvidencias = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Retrocompatibilidad con fechas antiguas
        let fechaVisual = new Date();
        if (data['timestamp'] && data['timestamp'].toDate) {
          fechaVisual = data['timestamp'].toDate();
        } else if (data['fecha']) {
          fechaVisual = new Date(data['fecha']);
        }
        this.misEvidencias.push({ id: doc.id, fechaVisual: fechaVisual, ...data });
      });
      // Ordenamos las más recientes primero
      this.misEvidencias.sort((a, b) => b.fechaVisual.getTime() - a.fechaVisual.getTime());
      this.cargandoEvidencias = false;
      this.cdr.detectChanges();
    });
  }

  async subirFotoEvidencia(event: any, trabajo: any) {
    const file = event.target.files[0];
    if (!file) return;

    Swal.fire({ title: 'Subiendo...', text: 'Guardando tu evidencia', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const nombreArchivo = `evidencias/${trabajo.id}/${Date.now()}_${file.name}`;
      const imgRef = ref(this.storage, nombreArchivo);
      await uploadBytes(imgRef, file);
      const urlImg = await getDownloadURL(imgRef);

      // Guardamos la referencia en Firestore
      await addDoc(collection(this.db, "evidencias"), {
        url: urlImg,
        idProfesional: this.usuarioActual.id,
        idTrabajo: trabajo.id,
        servicioNombre: trabajo.clienteNombre,
        timestamp: new Date()
      });

      Swal.fire('¡Éxito!', 'La foto de evidencia ha sido guardada en tu galería.', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo subir la foto.', 'error');
    }
  }
}