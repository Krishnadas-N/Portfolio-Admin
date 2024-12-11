import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';


export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
     provideClientHydration(),
     provideHttpClient(withFetch()),
       provideAnimationsAsync(),
        providePrimeNG({ 
            theme: {
                preset: Aura
            }
        })]
};
