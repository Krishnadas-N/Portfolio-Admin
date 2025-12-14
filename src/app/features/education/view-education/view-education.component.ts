import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EducationService } from '../../../core/services/education.service';
import { Education, Pagination } from '../../../core/models/api.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-view-education',
    standalone: true,
    imports: [CommonModule, RouterLink, PaginationComponent, FormsModule],
    templateUrl: './view-education.component.html',
    styleUrl: './view-education.component.scss'
})
export class ViewEducationComponent implements OnInit {
  private educationService = inject(EducationService);

  educations = signal<Education[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');

  ngOnInit() {
    this.loadEducation();
  }

  loadEducation(page: number = 1) {
    this.isLoading.set(true);
    this.educationService.getEducation({ page, search: this.searchTerm() }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.educations.set(res.data);
          this.pagination.set(res.pagination);
        }
      },
      error: (err) => {
        console.error('Error loading education', err);
        this.error.set('Failed to load education details');
      }
    });
  }

  onSearch() {
    this.loadEducation(1);
  }

  onPageChange(page: number) {
    this.loadEducation(page);
  }

  deleteEducation(id: string) {
    if (confirm('Are you sure you want to delete this education entry?')) {
      this.educationService.deleteEducation(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.educations.update(current => current.filter(e => e._id !== id));
            this.loadEducation(this.pagination()?.page ?? 1);
          }
        },
        error: (err) => console.error('Error deleting education', err)
      });
    }
  }
}
