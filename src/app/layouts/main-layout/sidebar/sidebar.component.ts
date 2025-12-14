import { Component, inject, signal } from '@angular/core';
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
  
  // Removed isOpen signal as it's handled by parent layout now
  openGroups = signal<Set<string>>(new Set(['Portfolio']));
  isCollapsed = signal(false);

  menuItems = [
    { type: 'link', title: 'Dashboard', icon: 'fa-solid fa-chart-line', path: '/dashboard' },
    
    { type: 'header', title: 'Management' },
    { type: 'link', title: 'Users', icon: 'fa-solid fa-users', path: '/users' },
    { type: 'link', title: 'Media Library', icon: 'fa-solid fa-images', path: '/media' },
    
    { type: 'header', title: 'Content' },
    { 
      type: 'group', title: 'Portfolio', icon: 'fa-solid fa-briefcase', 
      children: [
        { title: 'Projects', path: '/projects' },
        { title: 'Blogs', path: '/blogs' },
        { title: 'Certifications', path: '/certifications' },
        { title: 'Experience', path: '/experience' },
        { title: 'Education', path: '/education' },
        { title: 'Skills', path: '/skills' }
      ]
    },
    
    { type: 'header', title: 'System' },
    { type: 'link', title: 'Settings', icon: 'fa-solid fa-gear', path: '/settings' },
  ];

  toggleGroup(title: string) {
    const current = this.openGroups();
    if (current.has(title)) {
      current.delete(title);
    } else {
      current.add(title);
    }
    this.openGroups.set(new Set(current));
  }

  isGroupOpen(title: string) {
    return this.openGroups().has(title);
  }

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }
}
