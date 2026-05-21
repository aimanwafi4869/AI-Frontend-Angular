import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RlDemoComponent } from './rl-demo.component';

describe('RlDemoComponent', () => {
  let component: RlDemoComponent;
  let fixture: ComponentFixture<RlDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RlDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RlDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
