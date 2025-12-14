import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Clone request and add headers
  let modifiedReq = req;
  
  if (token) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };
    
    // Add Content-Type header for JSON requests (if not multipart/form-data)
    if (!req.headers.has('Content-Type') && !(req.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    modifiedReq = req.clone({
      setHeaders: headers
    });
  } else if (!req.headers.has('Content-Type') && !(req.body instanceof FormData)) {
    // Add Content-Type even without token (for login endpoint)
    modifiedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};

