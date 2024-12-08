/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PlaceSuggestionService } from './place-suggestion.service';

describe('Service: PlaceSuggestion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlaceSuggestionService]
    });
  });

  it('should ...', inject([PlaceSuggestionService], (service: PlaceSuggestionService) => {
    expect(service).toBeTruthy();
  }));
});
