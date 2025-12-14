import { Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailsComponent } from './user-details/user-details.component';

export const USERS_ROUTES: Routes = [
    {
        path: '',
        component: UserListComponent
    },
    {
        path: 'new',
        component: UserDetailsComponent
    },
    {
        path: ':id',
        component: UserDetailsComponent
    }
];

