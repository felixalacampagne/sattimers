import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerEditComponent } from './timer-edit.component';

describe('TimerEditComponent', () => {
  let component: TimerEditComponent;
  let fixture: ComponentFixture<TimerEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimerEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
