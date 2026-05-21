import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvDemoComponent } from './cv-demo.component';

describe('CvDemoComponent', () => {
  let component: CvDemoComponent;
  let fixture: ComponentFixture<CvDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
