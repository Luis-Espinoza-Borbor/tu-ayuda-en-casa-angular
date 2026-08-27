import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelTrabajador } from './panel-trabajador';

describe('PanelTrabajador', () => {
  let component: PanelTrabajador;
  let fixture: ComponentFixture<PanelTrabajador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelTrabajador],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelTrabajador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
