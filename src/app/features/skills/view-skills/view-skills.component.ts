import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SkillService } from '../../../core/services/skill.service';
import { Skill } from '../../../core/models/api.models';
import { finalize } from 'rxjs/operators';

interface SkillCategory {
  name: string;
  skills: (Skill & { showMenu?: boolean })[];
}

@Component({
  selector: 'app-view-skills',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-skills.component.html',
  styleUrl: './view-skills.component.scss',
})
export class ViewSkillsComponent implements OnInit {
  private skillService = inject(SkillService);

  skills = signal<Skill[]>([]);
  groupedSkills = signal<SkillCategory[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  defaultLogo = 'assets/images/placeholder-skill.png';

  ngOnInit(): void {
    this.loadSkills();
  }

  loadSkills() {
    this.isLoading.set(true);
    this.skillService.getSkills({ limit: 100 }).pipe( // Fetch all for grouping
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.skills.set(res.data);
          this.groupSkills(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading skills', err);
        this.error.set('Failed to load skills');
      }
    });
  }

  groupSkills(skills: Skill[]) {
    const groups: Record<string, Skill[]> = {};
    
    skills.forEach(skill => {
      const category = skill.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push({ ...skill });
    });

    const categories: SkillCategory[] = Object.keys(groups).map(name => ({
      name,
      skills: groups[name]
    }));

    this.groupedSkills.set(categories);
  }

  toggleMenu(skill: any) {
    // Close other menus
    this.groupedSkills().forEach(cat => {
      cat.skills.forEach(s => {
        if (s !== skill) s.showMenu = false;
      });
    });
    skill.showMenu = !skill.showMenu;
  }

  deleteSkill(skill: Skill) {
    if (confirm(`Are you sure you want to delete ${skill.name}?`)) {
      this.skillService.deleteSkill(skill._id).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadSkills(); // Reload to refresh groups
          }
        },
        error: (err) => console.error('Error deleting skill', err)
      });
    }
  }
}
