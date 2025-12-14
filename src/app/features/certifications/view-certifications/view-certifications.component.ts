import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CertificationService } from '../../../core/services/certification.service';
import { Certification, Pagination } from '../../../core/models/api.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-view-certifications',
    standalone: true,
    imports: [CommonModule, RouterLink, PaginationComponent, FormsModule],
    templateUrl: './view-certifications.component.html',
    styleUrl: './view-certifications.component.scss'
})
export class ViewCertificationsComponent implements OnInit {
  private certificationService = inject(CertificationService);

  certifications = signal<Certification[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');

  ngOnInit() {
    this.loadCertifications();
  }

  loadCertifications(page: number = 1) {
    this.isLoading.set(true);
    this.certificationService.getCertifications({ page, search: this.searchTerm() }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.certifications.set(res.data);
          this.pagination.set(res.pagination);
        }
      },
      error: (err) => {
        console.error('Error loading certifications', err);
        this.error.set('Failed to load certifications');
      }
    });
  }

  onSearch() {
    this.loadCertifications(1);
  }

  onPageChange(page: number) {
    this.loadCertifications(page);
  }

  deleteCertification(id: string) {
    if (confirm('Are you sure you want to delete this certification?')) {
      this.certificationService.deleteCertification(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.certifications.update(current => current.filter(c => c._id !== id));
            this.loadCertifications(this.pagination()?.page ?? 1);
          }
        },
        error: (err) => console.error('Error deleting certification', err)
      });
    }
  }
}
