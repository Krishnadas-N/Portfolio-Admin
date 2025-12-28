import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TestimonialService } from '../../../core/services/testimonial.service';
import { MediaService } from '../../../core/services/media.service';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';
import { Testimonial } from '../../../core/models/api.models';

@Component({
    selector: 'app-add-testimonial',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './add-testimonial.component.html',
    styles: [`
    :host { display: block; }
  `]
})
export class AddTestimonialComponent implements OnInit {
    private fb = inject(FormBuilder);
    private testimonialService = inject(TestimonialService);
    private mediaService = inject(MediaService);
    private toastService = inject(ToastService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    testimonialForm!: FormGroup;
    isEditMode = false;
    testimonialId: string | null = null;
    isLoading = signal<boolean>(false);
    isSubmitting = signal<boolean>(false);
    isUploading = signal<boolean>(false);

    ngOnInit() {
        this.initForm();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.testimonialId = params['id'];
                this.loadTestimonial(params['id']);
            }
        });
    }

    projectTitle = signal<string>('');

    private initForm() {
        this.testimonialForm = this.fb.group({
            clientName: ['', [Validators.required]],
            clientPosition: ['', [Validators.required]],
            clientCompany: ['', [Validators.required]],
            clientImage: [''],
            content: ['', [Validators.required, Validators.minLength(10)]],
            rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
            clientEmail: ['', [Validators.email]],
            clientLinkedIn: [''],
            project: [null],
            isActive: [true],
            isFeatured: [false],
            verified: [false]
        });
    }

    get f() { return this.testimonialForm.controls; }

    loadTestimonial(id: string) {
        this.isLoading.set(true);
        this.testimonialService.getTestimonial(id).pipe(
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.patchForm(res.data);
                    if (res.data.project) {
                        this.projectTitle.set(typeof res.data.project === 'object' ? res.data.project.title : '');
                    }
                } else {
                    this.toastService.error('Failed to load testimonial');
                    this.router.navigate(['/testimonials']);
                }
            },
            error: () => {
                this.toastService.error('Connection error');
                this.router.navigate(['/testimonials']);
            }
        });
    }

    patchForm(data: Testimonial) {
        this.testimonialForm.patchValue({
            clientName: data.clientName,
            clientPosition: data.clientPosition,
            clientCompany: data.clientCompany,
            clientImage: data.clientImage,
            content: data.content,
            rating: data.rating,
            clientEmail: data.clientEmail,
            clientLinkedIn: data.clientLinkedIn,
            project: typeof data.project === 'object' ? data.project._id : data.project,
            isActive: data.isActive,
            isFeatured: data.isFeatured,
            verified: data.verified
        });
    }

    onImageSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                this.toastService.warning('Image size too large (Max 5MB)');
                return;
            }

            this.isUploading.set(true);
            this.mediaService.uploadMixedBundle({ images: [file] }).pipe(
                finalize(() => this.isUploading.set(false))
            ).subscribe({
                next: (res: any) => {
                    if (res.success && res.data?.images?.length > 0) {
                        const url = res.data.images[0].original?.url || res.data.images[0].url;
                        this.testimonialForm.patchValue({ clientImage: url });
                        this.toastService.success('Image uploaded');
                    }
                },
                error: () => this.toastService.error('Image upload failed')
            });
        }
    }

    setRating(stars: number) {
        this.testimonialForm.patchValue({ rating: stars });
    }

    onSubmit() {
        if (this.testimonialForm.invalid) {
            this.testimonialForm.markAllAsTouched();
            this.toastService.warning('Please check the form for errors');
            return;
        }

        this.isSubmitting.set(true);
        const data = this.testimonialForm.value;

        const request = this.isEditMode && this.testimonialId
            ? this.testimonialService.updateTestimonial(this.testimonialId, data)
            : this.testimonialService.createTestimonial(data);

        request.pipe(
            finalize(() => this.isSubmitting.set(false))
        ).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastService.success(this.isEditMode ? 'Testimonial updated' : 'Testimonial added');
                    this.router.navigate(['/testimonials']);
                }
            },
            error: (err) => {
                const msg = err.error?.message || 'Failed to save testimonial';
                this.toastService.error(msg);
            }
        });
    }
}
