import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SkillService } from '../../../core/services/skill.service';
import { Skill } from '../../../core/models/api.models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-view-skills',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './view-skills.component.html',
  styleUrl: './view-skills.component.scss',
})
export class ViewSkillsComponent implements OnInit {
  private skillService = inject(SkillService);

  skills = signal<Skill[]>([]);

  // Filtering Logic
  categories = signal<string[]>(['All']);
  activeTab = signal<string>('All');
  filteredSkills = signal<Skill[]>([]);

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');

  defaultLogo = 'assets/images/placeholder-skill.png';

  constructor() {
    // React to search term or tab changes
    effect(() => {
      const term = this.searchTerm().toLowerCase();
      const tab = this.activeTab();
      const allSkills = this.skills();

      if (allSkills.length === 0 && !this.isLoading()) {
        this.filteredSkills.set([]);
        return;
      }

      let filtered = allSkills;

      // 1. Filter by Tab
      if (tab !== 'All') {
        filtered = filtered.filter(s => (s.category || 'Other') === tab);
      }

      // 2. Filter by Search
      if (term) {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(term));
      }

      // Prepare list with UI props (ensure proficiency exists)
      const processed = filtered.map(s => ({
        ...s,
        proficiency: s.proficiency || this.getProficiencyFromLevel(s.level)
      }));

      this.filteredSkills.set(processed);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.loadSkills();
  }

  loadSkills() {
    this.isLoading.set(true);
    this.skillService.getSkills({ limit: 100 }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.skills.set(res.data);
          this.extractCategories(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading skills', err);
        this.error.set('Failed to load skills');
      }
    });
  }

  extractCategories(skills: Skill[]) {
    const cats = new Set<string>(['All']);
    skills.forEach(s => {
      if (s.category) cats.add(s.category);
    });
    // Sort: All first, then alphabetically
    const sorted = Array.from(cats).sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
    });
    this.categories.set(sorted);
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  deleteSkill(skill: Skill) {
    if (confirm(`Are you sure you want to delete ${skill.name}?`)) {
      this.skillService.deleteSkill(skill._id).subscribe({
        next: (res) => {
          if (res.success) {
            // Remove from local state to update UI immediately
            this.skills.update(current => current.filter(s => s._id !== skill._id));

            // Re-extract categories in case a category is now empty
            this.extractCategories(this.skills());
          }
        },
        error: (err) => console.error('Error deleting skill', err)
      });
    }
  }

  private getProficiencyFromLevel(level: string): number {
    switch (level?.toLowerCase()) {
      case 'expert': return 100;
      case 'advanced': return 85;
      case 'intermediate': return 60;
      case 'beginner': return 35;
      default: return 50;
    }
  }
}
