import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProjectService } from '../../../core/services/project.service';
import { MediaService } from '../../../core/services/media.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../core/models/api.models';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.scss',
})
export class AddProjectComponent implements OnInit {
  projectForm!: FormGroup;
  isEditMode = false;
  projectId: string | null = null;
  isLoading = false;
  isSubmitting = false;

  private projectService = inject(ProjectService);
  private mediaService = inject(MediaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      technologies: [[]],
      license: [''],
      tags: [[]],
      projectType: ['main', [Validators.required]],
      seoKeywords: [[]],
      additionalResources: [[]],
      relatedProjects: [[]],
      collaborators: [[]],
      link: ['', [Validators.pattern('https?://.+')]],
      repo: ['', [Validators.pattern('https?://.+')]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      status: ['Planning', [Validators.required]],
      current: [false],
      featured: [false],
      archived: [false],
      videoRepresentation: [''],
      images: this.fb.array([]),
      skills: this.fb.array([]),
      deploymentDetails: this.fb.array([]),
      viewsCount: [0],
      likes: [0],
      documentationLink: ['', [Validators.pattern('https?://.+')]]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.projectId = id;
      this.loadProject(id);
    }
  }

  private loadProject(id: string): void {
    this.isLoading = true;
    this.projectService.getProject(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patchForm(res.data);
        } else {
          this.toastService.error(res.message || 'Failed to load project');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load project', err);
        this.toastService.error('Connection error loading project');
        this.isLoading = false;
        this.router.navigate(['/projects']);
      }
    });
  }

  private patchForm(project: Project): void {
    const imagesArray = this.projectForm.get('images') as FormArray;
    imagesArray.clear();
    if (project.images) {
      project.images.forEach(img => imagesArray.push(this.fb.control(img)));
    }

    const skillsArray = this.projectForm.get('skills') as FormArray;
    skillsArray.clear();
    if (project.skills) {
      project.skills.forEach(skill => skillsArray.push(this.fb.control(skill)));
    }

    const deploymentArray = this.projectForm.get('deploymentDetails') as FormArray;
    deploymentArray.clear();
    if (project.deploymentDetails) {
      project.deploymentDetails.forEach(deploy => {
        deploymentArray.push(this.fb.group({
          platform: [deploy.platform, Validators.required],
          url: [deploy.url, [Validators.required, Validators.pattern('https?://.+')]]
        }));
      });
    }

    // Handle tags and seoKeywords as arrays, update main form control with value array if using string arrays logic in backend/frontend
    // Or if handling as FormArray like skills:
    // For this specific case from previous edits, tags/seoKeywords seem to be handled as simple string arrays in the form value (technologies: [[]]),
    // but the `addStringItem` method updates the array value directly on the control.
    // So usually simple patchValue works for these unless they are FormArrays.
    // However, to be safe and consistent with `technologies`, we just patch the array value.

    // NOTE: In initForm, 'tags' is [[]] which means it's a FormControl holding an array.
    // So simple patchValue handles it.

    const formatDate = (date: Date | string | undefined) => {
      if (!date) return '';
      return new Date(date).toISOString().split('T')[0];
    };

    this.projectForm.patchValue({
      ...project,
      startDate: formatDate(project.startDate),
      endDate: formatDate(project.endDate)
    });
  }

  // --- Getters ---
  get f() { return this.projectForm.controls; }
  get images() { return this.projectForm.get('images') as FormArray; }
  get skills() { return this.projectForm.get('skills') as FormArray; }
  get deploymentDetails() { return this.projectForm.get('deploymentDetails') as FormArray; }
  get tags() { return this.projectForm.get('tags') as FormArray; } // Treat as string array
  get seoKeywords() { return this.projectForm.get('seoKeywords') as FormArray; } // Treat as string array

  // --- Array Manipulation ---

  addStringItem(controlName: string, value: string, inputElement: HTMLInputElement) {
    const trimmed = value.trim();
    if (!trimmed) return;

    const control = this.projectForm.get(controlName);
    const currentValues = control?.value || [];

    if (!currentValues.includes(trimmed)) {
      control?.setValue([...currentValues, trimmed]);
      inputElement.value = '';
    }
  }

  removeStringItem(controlName: string, index: number) {
    const control = this.projectForm.get(controlName);
    const currentValues = control?.value || [];
    const newValues = [...currentValues];
    newValues.splice(index, 1);
    control?.setValue(newValues);
  }

  addSkill(value: string, input: HTMLInputElement) {
    const trimmed = value.trim();
    if (!trimmed) return;

    const currentSkills = this.skills.value;
    if (!currentSkills.includes(trimmed)) {
      this.skills.push(this.fb.control(trimmed));
      input.value = '';
    }
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  // Deployment Details Management
  addDeploymentDetail() {
    this.deploymentDetails.push(this.fb.group({
      platform: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('https?://.+')]]
    }));
  }

  removeDeploymentDetail(index: number) {
    this.deploymentDetails.removeAt(index);
  }

  // Media
  onImageSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files?.length) {
      const files = Array.from(fileInput.files);

      // Limit file size (example 5MB)
      if (files.some(f => f.size > 5 * 1024 * 1024)) {
        this.toastService.warning('Some files are too large (Max 5MB)');
        return;
      }

      this.mediaService.uploadImages(files, 'projects').subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const responseData = res.data as any;
            if (responseData.data && Array.isArray(responseData.data)) {
              responseData.data.forEach((f: any) => {
                this.images.push(this.fb.control(f.url));
              });
              this.toastService.success(`${responseData.data.length} images uploaded`);
            } else if (Array.isArray(responseData)) {
              responseData.forEach((f: any) => {
                this.images.push(this.fb.control(f.original.url));
              });
              this.toastService.success(`${responseData.length} images uploaded`);
            }
          }
        },
        error: (err) => this.toastService.error('Upload failed')
      });
    }
  }

  removeImage(index: number) {
    this.images.removeAt(index);
  }

  onVideoSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files?.length) {
      const file = fileInput.files[0];
      if (file.size > 50 * 1024 * 1024) { // Example 50MB limit
        this.toastService.warning('Video file too large (Max 50MB)');
        return;
      }

      this.isLoading = true; // Show listing/loading state
      this.mediaService.uploadMixedBundle({ videos: [file] }, 'projects').subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success && res.data && res.data.videos && res.data.videos.length > 0) {
            const video = res.data.videos[0];
            // Handle both possible structures (direct or nested in original)
            const url = video.original?.url || video.url;

            this.projectForm.patchValue({
              videoRepresentation: url
            });
            this.toastService.success('Video uploaded successfully');
          } else {
            this.toastService.error('Video upload returned no data');
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Video upload error', err);
          this.toastService.error(err.error?.message || 'Video upload failed');
        }
      });
    }
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();

      const invalidControls: string[] = [];
      Object.keys(this.projectForm.controls).forEach(key => {
        const control = this.projectForm.get(key);
        if (control?.invalid) {
          invalidControls.push(key);
        }
      });

      this.toastService.warning(`Please check the following fields: ${invalidControls.join(', ')}`);
      return;
    }

    this.isSubmitting = true;
    const projectData = this.projectForm.value;

    const request$ = this.isEditMode && this.projectId
      ? this.projectService.updateProject(this.projectId, projectData)
      : this.projectService.createProject(projectData);

    request$.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastService.success(this.isEditMode ? 'Project updated' : 'Project created');
          this.router.navigate(['/projects']);
        } else {
          this.toastService.error(res.message || 'Operation failed');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Save failed', err);
        this.toastService.error(err.error?.message || 'Failed to save project');
      }
    });
  }

  onCancel() {
    this.router.navigate(['/projects']);
  }
}
