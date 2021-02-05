import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GhigoComponent } from './ghigo.component';

describe('GhigoComponent', () => {
  let component: GhigoComponent;
  let fixture: ComponentFixture<GhigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GhigoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GhigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
