import { Routes } from '@angular/router';
import { ViewContactsComponent } from './view-contacts/view-contacts.component';
import { ContactDetailsComponent } from './contact-details/contact-details.component';

export const CONTACT_ROUTES: Routes = [
    { path: '', component: ViewContactsComponent },
    { path: ':id', component: ContactDetailsComponent }
];
