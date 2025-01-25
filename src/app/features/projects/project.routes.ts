import { Routes } from '@angular/router';
import { ViewProjectsComponent } from './view-projects/view-projects.component';
import { AddProjectComponent } from './add-project/add-project.component';



export const PROJECT_ROUTES: Routes = [
        {
            path:'',
            component:ViewProjectsComponent,
            pathMatch: 'full'
        },
        {
            path:'add',
            component:AddProjectComponent
        },
        {
            path:'edit-blog/:id',
            component:AddProjectComponent
        }
]