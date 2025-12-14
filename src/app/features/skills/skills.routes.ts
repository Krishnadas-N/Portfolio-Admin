import { Routes } from '@angular/router';
import { ViewSkillsComponent } from './view-skills/view-skills.component';
import { AddSkillComponent } from './add-skill/add-skill.component';

export const SKILL_ROUTES: Routes = [
  {
    path: '',
    component: ViewSkillsComponent,
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: AddSkillComponent,
  },
  {
    path: 'edit/:id',
    component: AddSkillComponent,
  },
];
