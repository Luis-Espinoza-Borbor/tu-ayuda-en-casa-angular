import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialServicios } from './historial-servicios';

describe('HistorialServicios', () => {
  let component: HistorialServicios;
  let fixture: ComponentFixture<HistorialServicios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialServicios],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialServicios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
