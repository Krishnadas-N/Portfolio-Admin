import { HeaderComponent } from './header/header.component';
import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [HeaderComponent,SidebarComponent,FooterComponent,RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection:ChangeDetectionStrategy.Default
})
export class MainLayoutComponent implements OnInit {
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private googleAPIKEY = environment.googleAPIKEY;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // this.loadGoogleMapsScript(); // Call the method to load the script on browser platform
    } else {
      console.log('Not running on the browser. Skipping script loading.');
    }
  }

  loadGoogleMapsScript(): void   {
    if (this.isLoaded) {
      return ; 
    }

    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleAPIKEY}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          this.isLoaded = true;
          console.log('Google Maps script loaded successfully.');
          resolve(); 
        };

        script.onerror = () => {
          console.error('Failed to load Google Maps script');
          reject('Failed to load Google Maps script');
        };

        document.head.appendChild(script); 
      });
    }
  }
}

