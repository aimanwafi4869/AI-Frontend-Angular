import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetrosainsComponent } from './petrosains.component';

describe('PetrosainsComponent', () => {
  let component: PetrosainsComponent;
  let fixture: ComponentFixture<PetrosainsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetrosainsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetrosainsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
