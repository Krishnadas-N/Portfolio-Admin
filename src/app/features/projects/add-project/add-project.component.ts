import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProjectService } from '../../../core/services/project.service';
import { MediaService } from '../../../core/services/media.service';
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
      technologies: [[]], // Array of strings
      license: ['', [Validators.required]],
      tags: [[]], // Array of strings
      projectType: ['main', [Validators.required]],
      seoKeywords: [[]], // Array of strings
      additionalResources: [[]], // Array of strings
      relatedProjects: [[]], // IDs
      collaborators: [[]],
      url: ['', [Validators.pattern('https?://.+')]],
      githubUrl: ['', [Validators.pattern('https?://.+')]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      status: ['Planning', [Validators.required]],
      current: [false],
      featured: [false],
      archived: [false],
      videoRepresentation: [''],
      images: this.fb.array([]), // Array of image URLs
      skills: this.fb.array([]), // Array of strings
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
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load project', err);
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

  // --- Array Manipulation ---
  
  // For controls that are simple arrays (technologies, tags, etc.)
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

  // For FormArrays (skills)
  addSkill(value: string, input: HTMLInputElement) {
    const trimmed = value.trim();
    if (!trimmed) return;
    
    // Check duplicates
    const currentSkills = this.skills.value;
    if (!currentSkills.includes(trimmed)) {
        this.skills.push(this.fb.control(trimmed));
        input.value = '';
    }
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  // Media
  onImageSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files?.length) {
      const files = Array.from(fileInput.files);
      
      this.mediaService.uploadImages(files, 'projects').subscribe({
        next: (res) => {
            if (res.success && res.data) {
                // If it's MediaBatchUploadResponse
                const responseData = res.data as any; // Cast to avoid strict check issues if type definition is slightly off
                if (responseData.data && Array.isArray(responseData.data)) {
                     responseData.data.forEach((f: any) => {
                        this.images.push(this.fb.control(f.url));
                    });
                } else if (Array.isArray(responseData)) {
                     // Fallback if structure is different
                     responseData.forEach((f: any) => {
                        this.images.push(this.fb.control(f.url));
                    });
                }
            }
        },
        error: (err) => console.error('Upload failed', err)
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
      this.mediaService.uploadFiles([file]).subscribe({
          next: (res) => {
              const responseData = res.data as any;
               if (res.success && responseData && responseData.data && responseData.data.length > 0) {
                  this.projectForm.patchValue({
                      videoRepresentation: responseData.data[0].url
                  });
              }
          },
          error: (err) => console.error('Video upload failed', err)
      });
  }
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
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
          this.router.navigate(['/projects']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Save failed', err);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/projects']);
  }
}
