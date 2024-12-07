import { TestBed } from '@angular/core/testing';

import { CompanyLogoService } from './company-logo.service';

describe('CompanyLogoService', () => {
  let service: CompanyLogoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyLogoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
