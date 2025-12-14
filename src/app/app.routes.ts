import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            // ... existing routes
            {
                path: 'blogs',
                loadChildren: () => import('./features/blogs/blog.routes').then(m => m.BLOG_ROUTES)
            },
            {
                path: 'certifications',
                loadChildren: () => import('./features/certifications/certification.routes').then(m => m.CERTIFICATION_ROUTES)
            },
            {
                path: 'experience',
                loadChildren: () => import('./features/experience/experience.routes').then(m => m.EXPERIENCE_ROUTES)
            },
            {
                path: 'skills',
                loadComponent: () => import("./features/skills/view-skills/view-skills.component").then(m => m.ViewSkillsComponent)
            },
            {
                path: 'education',
                loadChildren: () => import('./features/education/education.routes').then(m => m.EDUCATION_ROUTES)
            },
            {
                path: 'projects',
                loadChildren: () => import('./features/projects/project.routes').then(m => m.PROJECT_ROUTES)
            },
            {
                path: 'users',
                loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES)
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
            },
            {
                path: 'media',
                loadComponent: () => import('./features/media/media.component').then(m => m.MediaComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];