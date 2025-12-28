import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EducationService } from '../../../core/services/education.service';
import { MediaService } from '../../../core/services/media.service';
import { CompanyLogoService } from '../../../core/services/company-logo.service';
import { ToastService } from '../../../core/services/toast.service';
import { TagsComponent } from '../../../shared/components';
import { uniqueTagsValidator } from '../../../shared/utils/validators';
import { finalize, debounceTime, switchMap } from 'rxjs/operators';
import { Education } from '../../../core/models/api.models';
import { CompanyDetails } from '../../../core/models';

@Component({
  selector: 'app-add-education',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-education.component.html',
  styleUrl: './add-education.component.scss',
})
export class AddEducationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private educationService = inject(EducationService);
  private mediaService = inject(MediaService);
  private companyLogoService = inject(CompanyLogoService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  educationForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  educationId: string | null = null;

  instituteSuggestions: CompanyDetails[] = [];
  showSuggestions = false;

  ngOnInit() {
    this.initForm();
    this.setupInstituteSuggestions();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.educationId = params['id'];
        this.loadEducation(this.educationId!);
      }
    });
  }

  private initForm() {
    this.educationForm = this.fb.group({
      institution: ['', [Validators.required, Validators.minLength(2)]],
      degree: ['', [Validators.required, Validators.minLength(2)]],
      fieldOfStudy: ['', [Validators.required]],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false],
      grade: [''], // Will map to gpa
      description: ['', [Validators.maxLength(1000)]],
      location: [''],
      website: [''],
      logo: [''],
      skills: this.fb.array([], [uniqueTagsValidator]),
      activities: this.fb.array([]),
      achievements: this.fb.array([])
    });
  }

  get f() { return this.educationForm.controls; }
  get skills() { return this.educationForm.get('skills') as FormArray; }
  get activities() { return this.educationForm.get('activities') as FormArray; }
  get achievements() { return this.educationForm.get('achievements') as FormArray; }

  setupInstituteSuggestions() {
    this.educationForm.get('institution')?.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => this.companyLogoService.fetchCompanySuggestions(value))
    ).subscribe(suggestions => {
      this.instituteSuggestions = suggestions;
      this.showSuggestions = true;
    });
  }

  selectInstitute(institute: CompanyDetails) {
    this.educationForm.patchValue({
      institution: institute.name,
      logo: institute.logo_url
    });
    this.showSuggestions = false;
  }

  loadEducation(id: string) {
    this.isLoading.set(true);
    this.educationService.getEducationById(id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patchForm(res.data);
        }
      },
      error: (err) => console.error('Error loading education', err)
    });
  }

  patchForm(edu: Education) {
    this.educationForm.patchValue({
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy,
      startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
      endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
      current: edu.isCurrent || false, // Mapped from isCurrent
      grade: edu.gpa?.toString() || '', // Mapped from gpa
      description: edu.description,
      location: edu.location,
      website: edu.website,
      logo: edu.logo
    });

    this.skills.clear();
    if (edu.skills && (edu.skills as string[]).length > 0) (edu.skills as string[]).forEach(s => this.addSkill(s));

    this.activities.clear();
    if (edu.activities && (edu.activities as string[]).length > 0) (edu.activities as string[]).forEach(a => this.addActivity(a));

    this.achievements.clear();
    if (edu.achievements && (edu.achievements as string[]).length > 0) (edu.achievements as string[]).forEach(a => this.addAchievement(a));
  }

  // Skills
  addSkill(value: string, input?: HTMLInputElement) {
    const val = (value || '').trim();
    if (val && !this.skills.value.includes(val)) {
      this.skills.push(this.fb.control(val));
      if (input) input.value = '';
    }
  }
  removeSkill(index: number) { this.skills.removeAt(index); }

  // Activities
  addActivity(value: string, input?: HTMLInputElement) {
    const val = (value || '').trim();
    if (val && !this.activities.value.includes(val)) {
      this.activities.push(this.fb.control(val));
      if (input) input.value = '';
    }
  }
  removeActivity(index: number) { this.activities.removeAt(index); }

  // Achievements
  addAchievement(value: string, input?: HTMLInputElement) {
    const val = (value || '').trim();
    if (val && !this.achievements.value.includes(val)) {
      this.achievements.push(this.fb.control(val));
      if (input) input.value = '';
    }
  }
  removeAchievement(index: number) { this.achievements.removeAt(index); }

  onLogoSelected(event: any) {
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
                this.educationForm.patchValue({ logo: uploadedUrl });
                this.toastService.success('Logo uploaded');
              }
            }
          },
          error: (err: any) => {
            console.error('Logo upload failed', err);
            this.toastService.error('Upload failed');
          }
        });
    }
  }

  onSubmit() {
    console.log(this.educationForm.value);
    if (this.educationForm.invalid) {
      const invalidControls: string[] = [];
      Object.keys(this.educationForm.controls).forEach(key => {
        const control = this.educationForm.get(key);
        if (control?.invalid) {
          invalidControls.push(key);
          console.log(`Validation error in ${key}:`, control.errors);
        }
      });

      this.educationForm.markAllAsTouched();
      this.toastService.error(`Please fix validation errors in: ${invalidControls.join(', ')}`);
      return;
    }

    this.isSubmitting.set(true);
    const formData = this.educationForm.value;

    // Map form values to model
    const eduData: Partial<Education> = {
      ...formData,
      isCurrent: formData.current,
      gpa: formData.grade ? parseFloat(formData.grade) : undefined
    };

    if (eduData.isCurrent) {
      delete eduData.endDate;
    }

    delete (eduData as any).current;
    delete (eduData as any).grade;

    const request = this.isEditMode() && this.educationId
      ? this.educationService.updateEducation(this.educationId, eduData)
      : this.educationService.createEducation(eduData);

    request.pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/education']);
        }
      },
      error: (err) => {
        console.error('Error saving education', err);
        const backendMessage = err.error?.errors?.[0]?.msg || err.error?.message || 'Failed to save education';
        this.toastService.error(backendMessage);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/education']);
  }

  onBlur() {
    setTimeout(() => this.showSuggestions = false, 200);
  }
}
