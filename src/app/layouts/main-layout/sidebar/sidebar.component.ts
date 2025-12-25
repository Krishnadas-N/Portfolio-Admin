import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  authService = inject(AuthService);
  user = this.authService.currentUser;

  openGroups = signal<Set<string>>(new Set(['Portfolio']));
  isCollapsed = signal(false); // Desktop state
  isMobileOpen = signal(false); // Mobile state

  menuItems = [
    { type: 'link', title: 'Dashboard', icon: 'fa-solid fa-chart-line', path: '/dashboard' },
    { type: 'header', title: 'Management' },
    // { type: 'link', title: 'Users', icon: 'fa-solid fa-users', path: '/users' },
    { type: 'link', title: 'Media Library', icon: 'fa-solid fa-images', path: '/media' },
    { type: 'header', title: 'Content' },
    {
      type: 'group', title: 'Portfolio', icon: 'fa-solid fa-briefcase',
      children: [
        { title: 'Projects', icon: 'fa-solid fa-layer-group', path: '/projects' },
        { title: 'Blogs', icon: 'fa-solid fa-newspaper', path: '/blogs' },
        { title: 'Certifications', icon: 'fa-solid fa-certificate', path: '/certifications' },
        { title: 'Experience', icon: 'fa-solid fa-briefcase', path: '/experience' },
        { title: 'Education', icon: 'fa-solid fa-graduation-cap', path: '/education' },
        { title: 'Skills', icon: 'fa-solid fa-bolt', path: '/skills' }
      ]
    },
    { type: 'header', title: 'System' },
    { type: 'link', title: 'Settings', icon: 'fa-solid fa-gear', path: '/settings' },
  ];

  toggleGroup(title: string) {
    const current = new Set(this.openGroups());
    if (current.has(title)) current.delete(title);
    else current.add(title);
    this.openGroups.set(current);
  }

  isGroupOpen(title: string) {
    return this.openGroups().has(title);
  }

  toggleSidebar() {
    // If screen is small, toggle the mobile drawer
    if (window.innerWidth < 1024) {
      this.isMobileOpen.update(v => !v);
    } else {
      this.isCollapsed.update(v => !v);
    }
  }

  logout() {
    this.authService.logout();
  }

  // Close mobile sidebar on route change
  closeMobile() {
    this.isMobileOpen.set(false);
  }

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }
}