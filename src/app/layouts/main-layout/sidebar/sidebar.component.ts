import { NgClass } from '@angular/common';
import { Component,  } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink,NgClass,],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  schemas: []
})
export class SidebarComponent {
  openSubmenus: Set<string> = new Set();
  sidebarLinks = [
    {
      title: 'Pinned',
      type: 'header',
      links: [
        {
          title: 'Dashboard',
          icon: 'fa-solid fa-house',
          routerLink: '/dashboard',
          type: 'link',
        },
      ],
    },
    {
      title: 'General',
      type: 'header',
      links: []
    },
    {
      title: 'Dashboard',
      icon: 'fa-solid fa-house',
      routerLink: '/dashboard',
      type: 'link'
    },
    {
      title: 'Certifications',
      icon: 'fa-solid fa-certificate',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'View Certifications', routerLink: '/certifications' },
        { title: 'Add Certification', routerLink: '/certifications/add' }
      ]
    },
    {
      title: 'Experience',
      icon: 'fa-solid fa-briefcase',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'View Experience', routerLink: '/experience' },
        { title: 'Add Experience', routerLink: '/experience/add' }
      ]
    },
    {
      title: 'Skills',
      icon: 'fa-solid fa-laptop-code',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'View Skills', routerLink: '/skills' },
      ]
    },
    {
      title: 'Education',
      icon: 'fa-solid fa-graduation-cap',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'View Education', routerLink: '/education' },
        { title: 'Add Education', routerLink: '/education/add' }
      ]
    },
    {
      title: 'Blog',
      icon: 'fa-solid fa-blog',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'View Blogs', routerLink: '/blogs' },
        { title: 'Add Blog', routerLink: '/blogs/add-blog' }
      ]
    },
    {
      title: 'Projects',
      icon: 'fa-solid fa-project-diagram',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'View Projects', routerLink: '/projects' },
        { title: 'Add Project', routerLink: '/projects/add' }
      ]
    },
    {
      title: 'Testimonials',
      icon: 'fa-solid fa-comments',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'View Testimonials', routerLink: '/testimonials' },
        { title: 'Add Testimonial', routerLink: '/testimonials/add' }
      ]
    },
    {
      title: 'Admin',
      icon: 'fa-solid fa-user-shield',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'Manage Admins', routerLink: '/admin/manage-admins' },
        { title: 'Add Admin', routerLink: '/admin/add-admin' },
        { title: 'RBAC', routerLink: '/admin/roles' },
        { title: 'Admin Settings', routerLink: '/admin/settings' }
      ]
    },
    {
      title: 'Portfolio',
      icon: 'fa-solid fa-briefcase',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'View Portfolio', routerLink: '/portfolio' },
        { title: 'Add Project', routerLink: '/portfolio/add' }
      ]
    },
    {
      title: 'Reports',
      icon: 'fa-solid fa-chart-line',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'View Reports', routerLink: '/reports' },
        { title: 'Generate Report', routerLink: '/reports/generate' }
      ]
    },
    {
      title: 'Contacts',
      icon: 'fa-solid fa-address-book',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'View Contacts', routerLink: '/contacts' },
        { title: 'Add Contact', routerLink: '/contacts/add' }
      ]
    },
    {
      title: 'Notifications',
      icon: 'fa-solid fa-bell',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'View Notifications', routerLink: '/notifications' },
      ]
    },
    {
      title: 'Settings',
      icon: 'fa-solid fa-cogs',
      routerLink: 'javascript:void(0)',
      type: 'link',
      subLinks: [
        { title: 'User Settings', routerLink: '/settings/user' },
        { title: 'App Settings', routerLink: '/settings/app' }
      ]
    }
  ];
  
  
  toggleSubmenu(menu: string): void {
    if (this.openSubmenus.has(menu)) {
      this.openSubmenus.delete(menu);
    } else {
      this.openSubmenus.add(menu);
    }
  }

  isSubmenuOpen(menu: string): boolean {
    return this.openSubmenus.has(menu);
  }
}
