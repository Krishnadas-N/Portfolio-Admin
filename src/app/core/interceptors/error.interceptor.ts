import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler.service';
import { inject } from '@angular/core';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandlerService = inject(ErrorHandlerService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      errorHandlerService.handleError(error);
      return throwError(() => error);
    })
  );
};
