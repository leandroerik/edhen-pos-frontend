import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasLocalComponent } from './ventas-local.component';

describe('VentasLocalComponent', () => {
  let component: VentasLocalComponent;
  let fixture: ComponentFixture<VentasLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasLocalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentasLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
