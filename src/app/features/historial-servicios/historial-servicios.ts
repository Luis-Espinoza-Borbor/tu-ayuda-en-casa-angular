import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

declare var bootstrap: any;

@Component({
  selector: 'app-historial-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './historial-servicios.html',
  styleUrls: ['./historial-servicios.css']
})
export class HistorialServiciosComponent implements OnInit, OnDestroy {
  reservas: any[] = [];
  reservaSeleccionada: any = null;
  usuarioActual: any;
  cargandoReservas: boolean = true;

  // Variables para el Chat
  db: any;
  storage: any;
  reservaActivaChat: string = '';
  mensajesChat: any[] = [];
  nuevoMensajeTexto: string = '';
  suscripcionChat: any = null;

  // Variables para el Micrófono
  mediaRecorder: any;
  fragmentosAudio: any[] = [];
  grabandoAudio: boolean = false;
  tiempoInicioGrabacion: number = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    this.inicializarFirebaseLocal();
    this.cargarReservasReales();
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

  // --- BUSCAMOS LAS RESERVAS REALES DEL CLIENTE ---
  async cargarReservasReales() {
    try {
      const q = query(
        collection(this.db, "reservas"), 
        where("idCliente", "==", this.usuarioActual.cedula || 'desconocido')
      );
      const querySnapshot = await getDocs(q);
      
      this.reservas = [];
      querySnapshot.forEach((doc) => {
        this.reservas.push({ id: doc.id, ...doc.data() });
      });
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      this.cargandoReservas = false;
      this.cdr.detectChanges();
    }
  }

  // --- LÓGICA DE LA FACTURA ---
  abrirFactura(reserva: any) {
    this.reservaSeleccionada = reserva;
    const modalFactura = new bootstrap.Modal(document.getElementById('modalFactura'));
    modalFactura.show();
  }

  imprimirFactura() {
    window.print();
  }

  // --- LÓGICA DEL CHAT EN TIEMPO REAL ---
  abrirChat(reservaId: string) {
    this.reservaActivaChat = reservaId;
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
        emisorNombre: this.usuarioActual.nombre || 'Cliente',
        timestamp: new Date()
      });
    } catch (e) {
      Swal.fire('Error', 'No se pudo enviar el mensaje', 'error');
    }
  }

  // --- LÓGICA DE IMÁGENES AL CHAT ---
  async subirImagenChat(event: any) {
    const file = event.target.files[0];
    if (!file || !this.reservaActivaChat) return;

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
        emisorNombre: this.usuarioActual.nombre || 'Cliente',
        timestamp: new Date()
      });

      Swal.close();
      event.target.value = ''; 
    } catch (error) {
      Swal.fire('Error', 'No se pudo enviar la imagen al chat.', 'error');
      event.target.value = ''; 
    }
  }

  // --- LÓGICA DEL MICRÓFONO ---
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
        if (duracion < 1000) return; 

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
        emisorNombre: this.usuarioActual.nombre || 'Cliente',
        timestamp: new Date()
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo enviar la nota de voz.', 'error');
    }
  }
}