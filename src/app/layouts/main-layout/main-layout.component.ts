import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="drawer lg:drawer-open font-sans antialiased text-base-content bg-base-100">
      <input id="drawer-toggle" type="checkbox" class="drawer-toggle" />
      
      <div class="drawer-content flex flex-col min-h-screen bg-base-200/30">
        <!-- Navbar -->
        <app-header />
        
        <!-- Page content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
           <div class="max-w-[1600px] mx-auto w-full animate-fade-in">
              <router-outlet></router-outlet>
           </div>
        </main>
      </div> 
      
      <!-- Added overflow-hidden to prevent double scrollbars since sidebar handles its own scrolling -->
      <div class="drawer-side z-40 overflow-hidden">
        <label for="drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label> 
        <app-sidebar class="h-full" />
      </div>
    </div>
  `,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {}
