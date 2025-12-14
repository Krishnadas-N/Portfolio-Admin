import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ExperienceService } from '../../../core/services/experience.service';
import { MediaService } from '../../../core/services/media.service';
import { CompanyLogoService } from '../../../core/services/company-logo.service';
import { TagsComponent } from '../../../shared/components';
import { uniqueTagsValidator } from '../../../shared/utils/validators';
import { finalize, debounceTime, switchMap } from 'rxjs/operators';
import { Experience } from '../../../core/models/api.models';
import { CompanyDetails } from '../../../core/models';

@Component({
  selector: 'app-add-experiences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-experiences.component.html',
  styleUrl: './add-experiences.component.scss',
})
export class AddExperiencesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private experienceService = inject(ExperienceService);
  private mediaService = inject(MediaService);
  private companyLogoService = inject(CompanyLogoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  experienceForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  experienceId: string | null = null;
  
  companySuggestions: CompanyDetails[] = [];
  showSuggestions = false;

  ngOnInit() {
    this.initForm();
    this.setupCompanySuggestions();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.experienceId = params['id'];
        this.loadExperience(this.experienceId!);
      }
    });
  }

  private initForm() {
    this.experienceForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]], // position in model
      company: ['', [Validators.required, Validators.minLength(2)]],
      logo: [''],
      location: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false],
      workType: ['Full-time', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      skills: this.fb.array([], [uniqueTagsValidator]),
      responsibilities: this.fb.array([])
    });
  }

  get f() { return this.experienceForm.controls; }
  get skills() { return this.experienceForm.get('skills') as FormArray; }
  get responsibilities() { return this.experienceForm.get('responsibilities') as FormArray; }

  setupCompanySuggestions() {
    this.experienceForm.get('company')?.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => this.companyLogoService.fetchCompanySuggestions(value))
    ).subscribe(suggestions => {
      this.companySuggestions = suggestions;
      this.showSuggestions = true;
    });
  }

  selectCompany(company: CompanyDetails) {
    this.experienceForm.patchValue({
      company: company.name,
      logo: company.logo_url
    });
    this.showSuggestions = false;
  }

  loadExperience(id: string) {
    this.isLoading.set(true);
    this.experienceService.getExperience(id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patchForm(res.data);
        }
      },
      error: (err) => console.error('Error loading experience', err)
    });
  }

  patchForm(exp: Experience) {
    this.experienceForm.patchValue({
      title: exp.position,
      company: exp.company,
      logo: exp.logo,
      location: exp.location,
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
      current: exp.isCurrent || false,
      workType: exp.employmentType || 'Full-time',
      description: exp.description
    });

    this.skills.clear();
    if (exp.skills) exp.skills.forEach(s => this.addSkill(s));

    this.responsibilities.clear();
    if (exp.responsibilities) exp.responsibilities.forEach(r => this.addResponsibility(r));
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

  // Responsibilities
  addResponsibility(value: string, input?: HTMLInputElement) {
    const val = (value || '').trim();
    if (val && !this.responsibilities.value.includes(val)) {
      this.responsibilities.push(this.fb.control(val));
      if (input) input.value = '';
    }
  }
  removeResponsibility(index: number) { this.responsibilities.removeAt(index); }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.mediaService.uploadFiles([file]).subscribe({
        next: (res) => {
          if (res.success && res.data) {
             const uploadedUrl = (res.data as any)[0]?.url || (res.data as any).data?.[0]?.url;
             if (uploadedUrl) {
               this.experienceForm.patchValue({ logo: uploadedUrl });
             }
          }
        },
        error: (err) => console.error('Logo upload failed', err)
      });
    }
  }

  onSubmit() {
    if (this.experienceForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.experienceForm.value;
    
    // Map form 'title' to model 'position'
    const experienceData: Partial<Experience> = {
      ...formValue,
      position: formValue.title,
      isCurrent: formValue.current,
      employmentType: formValue.workType
    };
    delete (experienceData as any).title;
    delete (experienceData as any).current;
    delete (experienceData as any).workType;

    const request = this.isEditMode() && this.experienceId
      ? this.experienceService.updateExperience(this.experienceId, experienceData)
      : this.experienceService.createExperience(experienceData);

    request.pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/experience']);
        }
      },
      error: (err) => console.error('Error saving experience', err)
    });
  }

  onCancel() {
    this.router.navigate(['/experience']);
  }

  onBlur() {
    setTimeout(() => this.showSuggestions = false, 200);
  }
}
