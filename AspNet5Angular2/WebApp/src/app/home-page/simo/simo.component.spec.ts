import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimoComponent } from './simo.component';

describe('SimoComponent', () => {
  let component: SimoComponent;
  let fixture: ComponentFixture<SimoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
