import { Component, inject, OnInit } from '@angular/core';
import { AddSkillComponent } from '../add-skill/add-skill.component';
@Component({
  selector: 'app-view-skills',
  imports: [AddSkillComponent],
  templateUrl: './view-skills.component.html',
  styleUrl: './view-skills.component.scss',
})
export class ViewSkillsComponent implements OnInit {
  ngOnInit(): void {}
  categories = [
    {
      name: 'Frontend',
      skills: [
        {
          name: 'Angular',
          level: 'Advanced',
          category: 'Frontend Development',
          logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angularjs/angularjs-original.svg',
          showMenu: false,
        },
        {
          name: 'React',
          level: 'Intermediate',
          category: 'Frontend Development',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
          showMenu: false,
        },
      ],
    },
    {
      name: 'Backend',
      skills: [
        {
          name: 'Node.js',
          level: 'Advanced',
          category: 'Backend Development',
          logo: 'https://nodejs.org/static/images/logo.svg',
          showMenu: false,
        },
        {
          name: 'Express.js',
          level: 'Intermediate',
          category: 'Backend Development',
          logo: 'https://expressjs.com/images/express-facebook-share.png',
          showMenu: false,
        },
      ],
    },
    {
      name: 'Database',
      skills: [
        {
          name: 'MongoDB',
          level: 'Beginner',
          category: 'Database',
          logo: 'https://www.mongodb.com/favicon.ico',
          showMenu: false,
        },
      ],
    },
  ];

  defaultLogo = 'https://via.placeholder.com/150';

  toggleMenu(skill: any) {
    skill.showMenu = !skill.showMenu;
  }

  editSkill(skill: any) {
    console.log('Editing', skill.name);
    // Add edit logic here
  }

  hideSkill(skill: any) {
    console.log('Hiding', skill.name);
    // Add hide logic here (could set a property or remove it from the array)
  }

  deleteSkill(skill: any) {
    console.log('Deleting', skill.name);
    const index = this.findSkillIndex(skill);
    if (index > -1) {
      this.categories.forEach((category) => {
        category.skills.splice(index, 1);
      });
    }
  }

  findSkillIndex(skill: any) {
    for (let i = 0; i < this.categories.length; i++) {
      const index = this.categories[i].skills.indexOf(skill);
      if (index > -1) {
        return index;
      }
    }
    return -1;
  }
}
