import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCertificationComponent } from './add-certification.component';

describe('AddCertificationComponent', () => {
  let component: AddCertificationComponent;
  let fixture: ComponentFixture<AddCertificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCertificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCertificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
