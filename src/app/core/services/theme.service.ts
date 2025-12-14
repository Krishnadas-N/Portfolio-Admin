import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'portfolio-admin-theme';
  private platformId = inject(PLATFORM_ID);
  theme = signal<'light' | 'dark'>('light');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Load saved theme
      const saved = localStorage.getItem(this.THEME_KEY) as 'light' | 'dark' | null;
      if (saved) {
        this.theme.set(saved);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.theme.set(prefersDark ? 'dark' : 'light');
      }

      // Apply theme changes
      effect(() => {
        const currentTheme = this.theme();
        if (isPlatformBrowser(this.platformId)) {
          document.documentElement.setAttribute('data-theme', currentTheme);
          localStorage.setItem(this.THEME_KEY, currentTheme);
        }
      });

      // Initial apply
      document.documentElement.setAttribute('data-theme', this.theme());
    }
  }

  toggle() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: 'light' | 'dark') {
    this.theme.set(theme);
  }
}

