import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CertificationService } from '../../../core/services/certification.service';
import { Certification, Pagination } from '../../../core/models/api.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';
import { CertificationStats } from '../../../core/models/api.models';

@Component({
  selector: 'app-view-certifications',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, FormsModule],
  templateUrl: './view-certifications.component.html',
  styleUrl: './view-certifications.component.scss'
})
export class ViewCertificationsComponent implements OnInit {
  private certificationService = inject(CertificationService);
  private toastService = inject(ToastService);

  certifications = signal<Certification[]>([]);
  stats = signal<CertificationStats | null>(null);
  pagination = signal<Pagination | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');

  ngOnInit() {
    this.loadCertifications();
    this.loadStats();
  }

  loadStats() {
    this.certificationService.getCertificationStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats.set(res.data);
        }
      },
      error: (err) => console.error('Error loading stats', err)
    });
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
        this.toastService.error('Connection error loading certifications');
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
            this.toastService.success('Certification deleted successfully');
            this.certifications.update(current => current.filter(c => c._id !== id));
            this.loadCertifications(this.pagination()?.page ?? 1);
            this.loadStats();
          } else {
            this.toastService.error(res.message || 'Failed to delete certification');
          }
        },
        error: (err) => {
          console.error('Error deleting certification', err);
          this.toastService.error('Failed to delete certification');
        }
      });
    }
  }

  toggleStatus(id: string, currentStatus: boolean | undefined) {
    this.certificationService.toggleCertification(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`Certification is now ${res.data.isActive ? 'Active' : 'Inactive'}`);

          // Optimistic update
          this.certifications.update(current =>
            current.map(c => c._id === id ? { ...c, isActive: res.data.isActive } : c)
          );
          this.loadStats();
        } else {
          this.toastService.error(res.message || 'Failed to toggle status');
        }
      },
      error: (err) => {
        console.error('Error toggling status', err);
        this.toastService.error('Failed to toggle status');
      }
    });
  }
}
