import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CertificationService } from '../../../core/services/certification.service';
import { MediaService } from '../../../core/services/media.service';
import { ToastService } from '../../../core/services/toast.service';
import { uniqueTagsValidator } from '../../../shared/utils/validators';
import { finalize } from 'rxjs/operators';
import { Certification } from '../../../core/models/api.models';

@Component({
  selector: 'app-add-certification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-certification.component.html',
  styleUrl: './add-certification.component.scss',
})
export class AddCertificationComponent implements OnInit {
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private certificationService = inject(CertificationService);
  private mediaService = inject(MediaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  certificationForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  certificationId: string | null = null;

  ngOnInit() {
    this.initForm();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.certificationId = params['id'];
        this.loadCertification(this.certificationId!);
      }
    });
  }



  private initForm() {
    this.certificationForm = this.fb.group({
      name: ['', Validators.required],
      issuer: ['', Validators.required],
      issueDate: ['', Validators.required],
      expiryDate: [''],
      credentialId: [''],
      credentialUrl: ['', [Validators.pattern('https?://.+')]],
      category: [''],
      level: ['intermediate'],
      skills: this.fb.array([], [uniqueTagsValidator]),
      badgeImage: [''],
      isActive: [true]
    });
  }

  get f() { return this.certificationForm.controls; }
  get skills() { return this.certificationForm.get('skills') as FormArray; }

  loadCertification(id: string) {
    this.isLoading.set(true);
    this.certificationService.getCertification(id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patchForm(res.data);
        }
      },
      error: (err) => console.error('Error loading certification', err)
    });
  }

  patchForm(cert: Certification) {
    this.certificationForm.patchValue({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
      credentialId: cert.credentialId,
      credentialUrl: cert.credentialUrl,
      category: cert.category,
      level: cert.level,
      badgeImage: cert.badgeImage,
      isActive: cert.isActive ?? true
    });

    this.skills.clear();
    if (cert.skills) {
      cert.skills.forEach(skill => this.addSkill(skill));
    }
  }

  addSkill(skillValue: string, input?: HTMLInputElement) {
    const value = (skillValue || '').trim();
    if (value && !this.skills.value.includes(value)) {
      this.skills.push(this.fb.control(value));
      if (input) input.value = '';
    }
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading.set(true);
      this.mediaService.uploadMixedBundle({ images: [file] })
        .pipe(finalize(() => this.isUploading.set(false)))
        .subscribe({
          next: (res: any) => {
            if (res.success && res.data && res.data.images && res.data.images.length > 0) {
              const uploadedUrl = res.data.images[0].original?.url || res.data.images[0].url;
              if (uploadedUrl) {
                this.certificationForm.patchValue({ badgeImage: uploadedUrl });
              }
            }
          },
          error: (err) => {
            console.error('Image upload failed', err);
            this.toastService.error('Failed to upload image');
          }
        });
    }
  }

  onSubmit() {
    if (this.certificationForm.invalid) {
      this.certificationForm.markAllAsTouched();

      const invalidControls: string[] = [];
      Object.keys(this.certificationForm.controls).forEach(key => {
        const control = this.certificationForm.get(key);
        if (control?.invalid) {
          invalidControls.push(key);
        }
      });

      this.toastService.warning(`Please check the following fields: ${invalidControls.join(', ')}`);
      return;
    }

    this.isSubmitting.set(true);
    const formData = this.certificationForm.value;

    const request = this.isEditMode() && this.certificationId
      ? this.certificationService.updateCertification(this.certificationId, formData)
      : this.certificationService.createCertification(formData);

    request.pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(this.isEditMode() ? 'Certification updated' : 'Certification added');
          this.router.navigate(['/certifications']);
        } else {
          this.toastService.error(res.message || 'Operation failed');
        }
      },
      error: (err) => {
        console.error('Error saving certification', err);
        this.toastService.error(err.error?.message || 'Failed to save certification');
      }
    });
  }

  onCancel() {
    this.router.navigate(['/certifications']);
  }
}
