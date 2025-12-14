import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExperienceService } from '../../../core/services/experience.service';
import { Experience, Pagination } from '../../../core/models/api.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-view-experiences',
    standalone: true,
    imports: [CommonModule, RouterLink, PaginationComponent, FormsModule],
    templateUrl: './view-experiences.component.html',
    styleUrl: './view-experiences.component.scss'
})
export class ViewExperiencesComponent implements OnInit {
  private experienceService = inject(ExperienceService);

  experiences = signal<Experience[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');

  ngOnInit() {
    this.loadExperiences();
  }

  loadExperiences(page: number = 1) {
    this.isLoading.set(true);
    this.experienceService.getExperiences({ page, search: this.searchTerm() }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.experiences.set(res.data);
          this.pagination.set(res.pagination);
        }
      },
      error: (err) => {
        console.error('Error loading experiences', err);
        this.error.set('Failed to load experiences');
      }
    });
  }

  onSearch() {
    this.loadExperiences(1);
  }

  onPageChange(page: number) {
    this.loadExperiences(page);
  }

  deleteExperience(id: string) {
    if (confirm('Are you sure you want to delete this experience?')) {
      this.experienceService.deleteExperience(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.experiences.update(current => current.filter(e => e._id !== id));
            this.loadExperiences(this.pagination()?.page ?? 1);
          }
        },
        error: (err) => console.error('Error deleting experience', err)
      });
    }
  }

  calculateDuration(startDate: string, endDate: string | undefined, current: boolean | undefined): string {
    const start = new Date(startDate);
    const end = current ? new Date() : (endDate ? new Date(endDate) : new Date());

    const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    let duration = '';
    if (years > 0) {
      duration += `${years} yr${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      duration += (years > 0 ? ' ' : '') + `${months} mo${months > 1 ? 's' : ''}`;
    }
    return duration || '0 mos';
  }
}
