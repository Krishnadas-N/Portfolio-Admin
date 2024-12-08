import { Routes } from '@angular/router';
import { ViewEducationComponent } from './view-education/view-education.component';
import { AddEducationComponent } from './add-education/add-education.component';

export const EDUCATION_ROUTES: Routes = [
  {
    path: '',
    component: ViewEducationComponent,
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: AddEducationComponent,
  },
  {
    path: 'edit/:educationId',
    component: AddEducationComponent,
  },
];
