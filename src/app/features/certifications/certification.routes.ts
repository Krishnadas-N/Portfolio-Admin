import { Routes } from '@angular/router';
import { ViewCertificationsComponent } from './view-certifications/view-certifications.component';
import { AddCertificationComponent } from './add-certification/add-certification.component';

export const CERTIFICATION_ROUTES: Routes = [
  {
    path: '',
    component: ViewCertificationsComponent,
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: AddCertificationComponent,
  },
  {
    path: 'edit/:id',
    component: AddCertificationComponent,
  },
];
