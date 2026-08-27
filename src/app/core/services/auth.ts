import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private firestore: FirestoreService) { }

  // Buscamos al usuario en la base de datos
  async iniciarSesion(correo: string, pass: string): Promise<string> {
    
    // 1. Verificamos Administrador
    if (correo === 'admin@admin.com' && pass === '123456') {
      localStorage.setItem('usuarioActual', JSON.stringify({ nombre: 'Administrador', rol: 'Admin' }));
      return '/admin-dashboard';
    }

    // 2. Buscamos si es un CLIENTE
    const qCliente = query(collection(this.firestore.db, "clientes"), where("correo", "==", correo), where("password", "==", pass));
    const snapCliente = await getDocs(qCliente);

    if (!snapCliente.empty) {
      const docUser = snapCliente.docs[0];
      const datos = docUser.data();
      localStorage.setItem('usuarioActual', JSON.stringify({
        id: docUser.id, nombre: datos['nombre'], correo: datos['correo'], rol: 'Cliente', foto: datos['foto'] || null
      }));
      return '/servicios'; // Ruta destino tras el login
    }

    // 3. Buscamos si es un TRABAJADOR
    const qTrabajador = query(collection(this.firestore.db, "trabajadores"), where("correo", "==", correo), where("password", "==", pass));
    const snapTrabajador = await getDocs(qTrabajador);

    if (!snapTrabajador.empty) {
      const docUser = snapTrabajador.docs[0];
      const datos = docUser.data();

      if (datos['estado'] !== 'Aprobado') {
        throw new Error(`Tu cuenta está en estado: ${datos['estado']}. Un administrador debe aprobar tu perfil.`);
      }

      localStorage.setItem('usuarioActual', JSON.stringify({
        id: docUser.id, nombre: datos['nombre'], correo: datos['correo'], rol: 'Trabajador', foto: datos['foto'] || null
      }));
      return '/panel-trabajador'; // Ruta destino tras el login
    }

    // Si no está en ninguna colección, lanzamos un error
    throw new Error('Correo o contraseña incorrectos.');
  }

  async registrarCliente(datosCliente: any): Promise<void> {
  // 1. Verificamos que el correo no exista ya
  const q = query(collection(this.firestore.db, "clientes"), where("correo", "==", datosCliente.correo));
  const snap = await getDocs(q);

  if (!snap.empty) {
    throw new Error('Este correo electrónico ya está registrado.');
  }

  // 2. Guardamos el nuevo cliente en Firestore
  await addDoc(collection(this.firestore.db, "clientes"), datosCliente);
}

  async registrarTrabajador(datosTrabajador: any): Promise<void> {
    // 1. Verificamos que el correo no exista ya
    const q = query(collection(this.firestore.db, "trabajadores"), where("correo", "==", datosTrabajador.correo));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      throw new Error('Este correo electrónico ya está registrado como trabajador.');
    }

    // 2. Le asignamos el estado pendiente por defecto
    datosTrabajador.estado = 'Pendiente';

    // 3. Guardamos el nuevo trabajador en Firestore
    await addDoc(collection(this.firestore.db, "trabajadores"), datosTrabajador);
  }

  async enviarMensajeContacto(datosMensaje: any): Promise<void> {
    // Le agregamos la fecha exacta en la que se envía el mensaje
    datosMensaje.fecha = new Date().toISOString();
    
    // Lo guardamos en una colección nueva llamada "mensajes"
    await addDoc(collection(this.firestore.db, "mensajes"), datosMensaje);
  }

  // --- Funciones para el Administrador ---

async obtenerTrabajadores() {
     const querySnapshot = await getDocs(collection(this.firestore.db, "trabajadores"));
     const trabajadores: any[] = [];
     querySnapshot.forEach((documento) => {
       trabajadores.push({ id: documento.id, ...documento.data() });
     });
     return trabajadores;
   }

async actualizarEstadoTrabajador(id: string, nuevoEstado: string) {
  const trabajadorRef = doc(this.firestore.db, "trabajadores", id);
  await updateDoc(trabajadorRef, { estado: nuevoEstado });
}

async eliminarTrabajador(id: string) {
  await deleteDoc(doc(this.firestore.db, "trabajadores", id));
}

async obtenerMensajes() {
  const querySnapshot = await getDocs(collection(this.firestore.db, "mensajes"));
  const mensajes: any[] = [];
  querySnapshot.forEach((documento) => {
    mensajes.push({ id: documento.id, ...documento.data() });
  });
  return mensajes;
}

async eliminarMensaje(id: string) {
  await deleteDoc(doc(this.firestore.db, "mensajes", id));
}

  cerrarSesion() {
    localStorage.removeItem('usuarioActual');
  }

// --- Funciones para Reservas ---
  async crearReserva(datosReserva: any): Promise<string> {
    try {
      // Guardamos la reserva en la colección "reservas" de Firestore
      const docRef = await addDoc(collection(this.firestore.db, "reservas"), datosReserva);
      return docRef.id; // Devolvemos el ID generado por Firebase
    } catch (error) {
      console.error("Error al crear la reserva en Firebase:", error);
      throw error;
    }
  }
  
  async obtenerReservasPorProfesional(idProfesional: string) {
    const q = query(
      collection(this.firestore.db, "reservas"), 
      where("idProfesional", "==", idProfesional)
    );
    const querySnapshot = await getDocs(q);
    const reservas: any[] = [];
    
    querySnapshot.forEach((documento) => {
      reservas.push({ id: documento.id, ...documento.data() });
    });
    
    return reservas;
  }
}