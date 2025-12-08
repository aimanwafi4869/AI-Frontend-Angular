import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandDetectionComponent } from './hand-detection.component';

describe('HandDetectionComponent', () => {
  let component: HandDetectionComponent;
  let fixture: ComponentFixture<HandDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HandDetectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
