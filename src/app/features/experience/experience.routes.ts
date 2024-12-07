import { Routes } from '@angular/router';
import { ViewExperiencesComponent } from './view-experiences/view-experiences.component';
import { AddExperiencesComponent } from './add-experiences/add-experiences.component';

export const EXPERIENCE_ROUTES: Routes = [
  {
    path: '',
    component: ViewExperiencesComponent,
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: AddExperiencesComponent,
  },
  {
    path: 'edit/:experienceId',
    component: AddExperiencesComponent,
  },
];
