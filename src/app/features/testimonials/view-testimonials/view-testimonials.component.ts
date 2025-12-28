import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TestimonialService } from '../../../core/services/testimonial.service';
import { ToastService } from '../../../core/services/toast.service';
import { Testimonial, TestimonialStats } from '../../../core/models/api.models';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-view-testimonials',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './view-testimonials.component.html',
    styles: [`
    :host { display: block; }
  `]
})
export class ViewTestimonialsComponent implements OnInit {
    private testimonialService = inject(TestimonialService);
    private toastService = inject(ToastService);

    testimonials = signal<Testimonial[]>([]);
    stats = signal<TestimonialStats | null>(null);
    isLoading = signal<boolean>(false);

    ngOnInit() {
        this.loadStats();
        this.loadTestimonials();
    }

    loadStats() {
        this.testimonialService.getTestimonialStats().subscribe({
            next: (res) => {
                if (res.success) this.stats.set(res.data);
            }
        });
    }

    loadTestimonials() {
        this.isLoading.set(true);
        this.testimonialService.getTestimonials().pipe(
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (res) => {
                if (res.success) this.testimonials.set(res.data);
            },
            error: () => this.toastService.error('Failed to load testimonials')
        });
    }

    toggleActive(id: string) {
        this.testimonialService.toggleTestimonialStatus(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.updateLocalTestimonial(id, { isActive: res.data.isActive });
                    this.toastService.success(`Testimonial ${res.data.isActive ? 'activated' : 'deactivated'}`);
                }
            },
            error: () => this.toastService.error('Failed to toggle status')
        });
    }

    toggleFeatured(id: string) {
        this.testimonialService.featureTestimonial(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.updateLocalTestimonial(id, { isFeatured: res.data.featured });
                    this.toastService.success(`Testimonial ${res.data.featured ? 'featured' : 'unfeatured'}`);
                }
            },
            error: () => this.toastService.error('Failed to toggle featured')
        });
    }

    verifyTestimonial(id: string) {
        this.testimonialService.verifyTestimonial(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.updateLocalTestimonial(id, { verified: res.data.verified, verifiedAt: res.data.verifiedAt });
                    this.toastService.success('Testimonial verified');
                }
            },
            error: () => this.toastService.error('Failed to verify testimonial')
        });
    }

    deleteTestimonial(id: string) {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;

        this.testimonialService.deleteTestimonial(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastService.success('Testimonial deleted');
                    this.loadTestimonials();
                    this.loadStats();
                }
            },
            error: () => this.toastService.error('Failed to delete testimonial')
        });
    }

    private updateLocalTestimonial(id: string, updates: Partial<Testimonial>) {
        this.testimonials.update(list =>
            list.map(t => t._id === id ? { ...t, ...updates } : t)
        );
    }
}
