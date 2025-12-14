import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-30 border-b border-base-200 px-4 gap-4 h-16">
      
      <!-- Mobile Toggle -->
      <div class="flex-none lg:hidden">
        <label for="drawer-toggle" class="btn btn-square btn-ghost text-base-content/70">
          <i class="fa-solid fa-bars text-xl"></i>
        </label>
      </div>

      <!-- Search -->
      <div class="flex-1 max-w-md hidden md:flex">
        <div class="relative w-full">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-sm"></i>
          <input type="text" 
                 placeholder="Search..." 
                 class="input input-bordered w-full pl-9 h-10 bg-base-200/50 focus:bg-base-100 focus:border-primary transition-all rounded-xl text-sm" />
        </div>
      </div>

      <!-- Spacer -->
      <div class="flex-1 md:hidden"></div>

      <!-- Right Actions -->
      <div class="flex-none flex items-center gap-1 md:gap-2">
        
        <!-- Theme Toggle -->
        <button (click)="themeService.toggle()" 
                class="btn btn-circle btn-ghost btn-sm text-base-content/70 hover:bg-base-200"
                [title]="themeService.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
          <i [class]="themeService.theme() === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
        </button>

        <!-- Notifications -->
        <button class="btn btn-circle btn-ghost btn-sm text-base-content/70 hover:bg-base-200 relative">
          <i class="fa-regular fa-bell text-lg"></i>
          <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-error border-2 border-base-100"></span>
        </button>

        <div class="w-px h-6 bg-base-300 mx-2 hidden md:block"></div>

        <!-- Profile -->
        <div class="flex items-center gap-3 pl-1 cursor-pointer p-1.5 rounded-xl hover:bg-base-200 transition-colors">
          <div class="avatar online">
            <div class="w-8 h-8 rounded-lg ring ring-base-200 ring-offset-base-100 ring-offset-2">
              <img [src]="user()?.profileImage || 'assets/images/profile.png'" alt="User" />
            </div>
          </div>
          <div class="hidden md:block text-left">
            <p class="text-xs font-bold text-base-content leading-tight">
              {{ user()?.username }}
            </p>
            <p class="text-[10px] text-base-content/60 font-medium uppercase tracking-wide">
              {{ user()?.role || 'Admin' }}
            </p>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  // Output removed as we use label for drawer
  // @Output() toggleSidebar = new EventEmitter<void>();
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  user = this.authService.currentUser;
}
