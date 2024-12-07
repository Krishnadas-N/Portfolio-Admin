import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }
  public handleError(error: HttpErrorResponse): void {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      console.error('An error occurred:', error.error.message);
    } else {
      // Backend returned an unsuccessful response code
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
      this.handleServerError(error);
    }
  } 
  private handleServerError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 401:
        // Handle unauthorized error
        break;
      case 403:
        // Handle forbidden error
        break;
      case 404:
        // Handle not found error
        break;
      case 500:
        // Handle internal server error
        break;
      // Add more cases as needed
      default:
        // Handle other errors
        break;
    }
  }
}
