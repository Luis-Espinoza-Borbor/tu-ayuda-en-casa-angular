import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-confirmacion',
  styleUrl: './confirmacion.css',
  templateUrl: './confirmacion.html',
})
export class ConfirmacionComponent implements OnInit, OnDestroy {
  nombreProfesional: string = 'tu profesional';
  tiempoRestante: string = 'Calculando...';
  
  private intervaloReloj: any;
  private fechaDestino: Date | null = null;

  // 1. Inyectamos ChangeDetectorRef para obligar a la pantalla a actualizarse
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const reservaGuardada = localStorage.getItem('reservaConfirmada');
    
    if (reservaGuardada) {
      try {
        const reserva = JSON.parse(reservaGuardada);
        this.nombreProfesional = reserva.profesional?.nombre || 'tu profesional';
        
        // 2. Método ultra-seguro para interpretar fechas en JavaScript y evitar errores matemáticos
        if (reserva.fecha && reserva.hora) {
          const [year, month, day] = reserva.fecha.split('-');
          const [hour, minute] = reserva.hora.split(':');
          
          // JavaScript cuenta los meses del 0 al 11, por eso restamos 1 al mes
          this.fechaDestino = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
          this.iniciarTemporizador();
        } else {
          this.tiempoRestante = 'Fecha y hora por confirmar.';
        }
      } catch (e) {
        console.error('Error procesando la fecha:', e);
        this.tiempoRestante = 'Error al calcular la llegada.';
      }
    } else {
      this.tiempoRestante = 'Servicio agendado exitosamente.';
    }
  }

  iniciarTemporizador() {
    if (!this.fechaDestino) return;

    this.intervaloReloj = setInterval(() => {
      const ahora = new Date().getTime();
      const distancia = this.fechaDestino!.getTime() - ahora;

      // Si el tiempo ya pasó o es negativo
      if (distancia < 0) {
        this.tiempoRestante = '¡El profesional debería estar llegando!';
        clearInterval(this.intervaloReloj);
        this.cdr.detectChanges(); // Pellizco a Angular
        return;
      }

      // Matemáticas del reloj
      const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
      const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

      if (dias > 0) {
        this.tiempoRestante = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
      } else {
        this.tiempoRestante = `${horas}h ${minutos}m ${segundos}s`;
      }
      
      // 3. ¡El secreto! En cada segundo, obligamos a la pantalla a repintarse
      this.cdr.detectChanges(); 
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervaloReloj) {
      clearInterval(this.intervaloReloj);
    }
  }
}
