🏡🛠️ Tu Ayuda en Casa — Plataforma E-Commerce de Servicios Domésticos Integrados

📌 Información Académica y del Proyecto

Institución: Instituto Superior Tecnológico Liceo Cristiano (ISTLC)

Carrera: Desarrollo de Software

Asignatura: Lenguaje de Programación Front-End

Semestre / Nivel: 4to Semestre

Docente: Ing. Richard Suárez Jácome

Equipo de Desarrollo:

Luis Alberto Espinoza Borbor — Desarrollador Frontend & Firebase Architecture

Danny Javier Oleas Potes — Desarrollador Frontend & UI/UX Design

URL en Vivo: https://tu-ayuda-en-casa.web.app

📖 Descripción General

Tu Ayuda en Casa es una Single Page Application (SPA) e-commerce moderna diseñada para conectar a clientes que requieren servicios del hogar (limpieza, gasfitería, niñeras, pintura, electricidad, lavandería) con profesionales calificados de manera rápida, transparente y segura.

El proyecto representa la evolución tecnológica completa de un prototipo inicial (desarrollado con HTML/CSS/Vanilla JS y LocalStorage) hacia una plataforma robusta construida con Angular 17, TypeScript y respaldada por la infraestructura en la nube de Google Firebase (Firestore Cloud DB y Firebase Hosting).

🚀 Principales Mejoras y Evolución Técnica

A continuación se detallan los avances y diferencias clave entre la versión inicial (prototipo MVP) y la arquitectura actual:

Persistencia de Datos:

Versión Anterior (Prototipo MVP): Almacenamiento local (LocalStorage atado únicamente al navegador).

Nueva Versión (Angular + Firebase): Base de datos NoSQL en la nube con sincronización en tiempo real (Firestore Cloud DB).

Arquitectura de Navegación:

Versión Anterior (Prototipo MVP): 20 archivos HTML aislados con recarga completa de página al navegar.

Nueva Versión (Angular + Firebase): Single Page Application (Angular Router) con navegación fluida e instantánea sin recargas.

Renderizado Visual:

Versión Anterior (Prototipo MVP): Manipulación manual del DOM mediante innerHTML y cadenas de texto (Template Literals).

Nueva Versión (Angular + Firebase): Directivas reactivas modernas del motor de flujo de Angular (@for, @if, [(ngModel)]).

Tipado y Estructura de Código:

Versión Anterior (Prototipo MVP): JavaScript ES6 estándar sin verificación estricta de tipos.

Nueva Versión (Angular + Firebase): TypeScript con tipado estricto, interfaces estructuradas y detección previa de errores.

Seguridad y Control de Acceso:

Versión Anterior (Prototipo MVP): Sin protección de rutas ni restricción de perfiles de usuario.

Nueva Versión (Angular + Firebase): Control RBAC (Cliente, Trabajador, Admin) con guardias de navegación y expulsión de URLs no autorizadas.

Despliegue y Alojamiento:

Versión Anterior (Prototipo MVP): Ejecución únicamente en entorno local.

Nueva Versión (Angular + Firebase): Producción global distribuida con certificado de seguridad SSL HTTPS mediante Firebase Hosting.

🔑 Características Principales

Catálogo Integrado de Servicios: Categorías dinámicas con tarifas parametrizadas por hora y filtros interactivos.

Motor de Liquidación y Facturación: Cálculo automático de Subtotal, desglose del 15% de IVA y emisión de comprobantes digitales.

Control de Acceso Basado en Roles (RBAC):

Cliente: Exploración, contratación de servicios, simulación de pago, calificaciones y consulta de historial.

Trabajador: Registro de perfil técnico, recepción de solicitudes y gestión de panel laboral (/features/panel-trabajador).

Administrador (/features/admin-dashboard): Panel restringido para aprobación de profesionales, gestión de solicitudes, monitoreo de métricas y buzón de consultas.

Sistema de Calificaciones: Reseñas y puntuación (1 a 5 estrellas) para evaluar el desempeño de cada proveedor de servicios.

🛠️ Tecnologías y Librerías Utilizadas

Framework Core: Angular v17 (Sintaxis moderna de control de flujo @for, @if)

Lenguaje: TypeScript v5

Backend como Servicio (BaaS): Google Firebase

Cloud Firestore: Base de datos NoSQL para usuarios, servicios, reservas y facturas.

Firebase Hosting: Alojamiento web de alta disponibilidad con certificado SSL.

Estilos y Layout: Tailwind CSS + Font Awesome (Iconografía Web)

Notificaciones y Modal UI: SweetAlert2

📂 Estructura Real del Proyecto

tu-ayuda-en-casa-angular/

public/ — Archivos estáticos públicos y favicon

src/

app/

auth/ — Módulo de Autenticación

login/ — Inicio de sesión de usuarios

registro/ — Registro de clientes

registro-trabajador/ — Registro de profesionales

core/

services/ — Servicios globales de comunicación con Firebase

auth.ts — Gestión de sesiones y autenticación

firestore.ts — Operaciones CRUD con Firestore Cloud DB

features/ — Vistas y funcionalidades principales

admin-dashboard/ — Panel de Administración (Control RBAC)

agendamiento/ — Reserva y selección de fecha/hora

calificar/ — Sistema de valoraciones e historias

checkout/ — Pasarela de pago y desglose IVA 15%

confirmacion/ — Comprobante de orden procesada

contacto/ — Formulario de contacto y soporte

historial-servicios/ — Historial de compras del cliente

inicio/ — Página principal / Landing page

nosotros/ — Información institucional y misión

panel-trabajador/ — Panel de gestión para proveedores

perfil/ — Perfil de usuario y datos personales

privacidad/ — Políticas de privacidad

servicios/ — Catálogo dinámico de servicios

soporte/ — Centro de ayuda e inquietudes

terminos/ — Términos y condiciones del servicio

shared/ — Componentes compartidos

footer/ — Pie de página global

navbar/ — Barra de navegación principal

app.config.ts — Configuración global de la app Angular

app.routes.ts — Definición de rutas SPA y guards

app.ts — Lógica del componente raíz

app.html — Plantilla principal contenedora

app.css — Estilos del componente raíz

environments/ — Variables de entorno y llaves de Firebase

environment.development.ts

environment.ts

index.html — Punto de entrada HTML5

main.ts — Bootstrap de inicio de la app

styles.css — Estilos globales (Tailwind CSS)

angular.json — Configuración del CLI de Angular

firebase.json — Configuración de despliegue en Firebase Hosting

package.json — Lista de dependencias del proyecto

tsconfig.json — Configuración del compilador TypeScript

⚙️ Instrucciones de Instalación y Ejecución Local

Requisitos Previos

Node.js (v18.x o superior)

npm (v9.x o superior)

Angular CLI instalado globalmente: npm install -g @angular/cli

Pasos de Instalación

Clonar el Repositorio:
git clone https://github.com/Luis-Espinoza-Borbor/tu-ayuda-en-casa-angular.git
cd tu-ayuda-en-casa-angular/tu-ayuda-en-casa-angular

Instalar Dependencias:
npm install

Ejecutar el Servidor de Desarrollo:
ng serve

Abrir la aplicación en el navegador: http://localhost:4200

🔒 Credenciales de Prueba (Demo)

Para evaluar los permisos y la navegación segura según los distintos roles:

Panel de Administración (/features/admin-dashboard):

Correo: admin@admin.com

Contraseña: 123456

Privilegios: Modificación de servicios, revisión de solicitudes de empleo, aprobación de trabajadores y métricas generales.

Modo Cliente / Trabajador:

Se pueden registrar nuevos perfiles desde los formularios en la interfaz (/auth/registro y /auth/registro-trabajador).

📦 Compilación y Despliegue en Firebase Hosting

Compilar el Paquete de Producción:
ng build

Iniciar Sesión e Iniciar Despliegue:
firebase login
firebase deploy

URL de Producción: https://tu-ayuda-en-casa.web.app

📜 Licencia y Reconocimientos

Proyecto desarrollado con fines estrictamente académicos para el Instituto Superior Tecnológico Liceo Cristiano (ISTLC).

Quedan reservados todos los derechos de autoría a favor de los estudiantes Luis Alberto Espinoza Borbor y Danny Javier Oleas Potes.
