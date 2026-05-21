import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChessUiComponent } from './chess-ui.component';

describe('ChessUiComponent', () => {
  let component: ChessUiComponent;
  let fixture: ComponentFixture<ChessUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChessUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChessUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
