import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';




export const routes: Routes = [
    {
        path:'',
        component:MainLayoutComponent,
        children:[
            {
                path:'dashboard',
                loadComponent: ()=>import('./features/dashboard/dashboard.component').then(m=>m.DashboardComponent)
            },
            {
                path:'blogs',
                loadChildren:()=>import('./features/blogs/blog.routes').then(m=>m.BLOG_ROUTES)
            },
            {
                path:'certifications',
                loadChildren:()=>import('./features/certifications/certification.routes').then(m=>m.CERTIFICATION_ROUTES)
            },
            {
                path:'experience',
                loadChildren:()=>import('./features/experience/experience.routes').then(m=>m.EXPERIENCE_ROUTES)
            },
            {
                path:'skills',
                loadComponent:()=>import("./features/skills/view-skills/view-skills.component").then(m=>m.ViewSkillsComponent)
            },
            {
                path:'education',
                loadChildren:()=>import('./features/education/education.routes').then(m=>m.EDUCATION_ROUTES)
            }
        ]
    }
];