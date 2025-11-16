import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickdrawComponent } from './quickdraw.component';

describe('QuickdrawComponent', () => {
  let component: QuickdrawComponent;
  let fixture: ComponentFixture<QuickdrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickdrawComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickdrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
