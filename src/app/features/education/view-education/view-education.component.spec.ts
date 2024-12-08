import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEducationComponent } from './view-education.component';

describe('ViewEducationComponent', () => {
  let component: ViewEducationComponent;
  let fixture: ComponentFixture<ViewEducationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEducationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewEducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
