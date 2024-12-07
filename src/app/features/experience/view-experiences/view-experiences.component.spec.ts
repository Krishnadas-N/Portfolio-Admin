import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExperiencesComponent } from './view-experiences.component';

describe('ViewExperiencesComponent', () => {
  let component: ViewExperiencesComponent;
  let fixture: ComponentFixture<ViewExperiencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewExperiencesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewExperiencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
