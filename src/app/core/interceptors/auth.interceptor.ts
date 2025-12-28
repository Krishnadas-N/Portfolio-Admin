import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isApiRequest = req.url.startsWith(environment.apiUrl) || !req.url.startsWith('http');
  console.log('Interceptor Debug:', { url: req.url, isApiRequest, hasToken: !!token, isFormData: req.body instanceof FormData });
  let modifiedReq = req;

  if (isApiRequest && token) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };

    if (!req.headers.has('Content-Type') && !(req.body instanceof FormData) && !req.url.includes('/media/')) {
      headers['Content-Type'] = 'application/json';
    }

    modifiedReq = req.clone({
      setHeaders: headers
    });
  } else if (isApiRequest && !req.headers.has('Content-Type') && !(req.body instanceof FormData) && !req.url.includes('/media/')) {
    modifiedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isApiRequest && error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};

