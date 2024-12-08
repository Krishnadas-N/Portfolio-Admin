import { Injectable } from '@angular/core';
/// <reference types=”@types/googlemaps” />
// import {
//   AutocompletePrediction,
//   AutocompleteService,
//   PlacesServiceStatus,
// }from '@types/googlemaps';

@Injectable({
  providedIn: 'root',
})
export class PlaceSuggestionService {
  constructor() {}

  // getAutocomplete(query: string): Promise<AutocompletePrediction[]> {
  //   return new Promise((resolve, reject) => {
  //     const service = new google.maps.places.AutocompleteService();
  //     service.getPlacePredictions(
  //       { input: query },
  //       (
  //         predictions: AutocompletePrediction[] | null,
  //         status: PlacesServiceStatus
  //       ) => {
  //         if (status === google.maps.places.PlacesServiceStatus.OK) {
  //           resolve(predictions || []);
  //         } else {
  //           reject(status);
  //         }
  //       }
  //     );
  //   });
  // }
}
