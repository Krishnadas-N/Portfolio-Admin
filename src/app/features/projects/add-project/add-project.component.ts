import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProjectService } from '../../../core/services';
import {
  NgLabelTemplateDirective,
  NgOptionTemplateDirective,
  NgSelectComponent,
} from '@ng-select/ng-select';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { uniqueTagsValidator } from '../../../shared/utils/validators';
import { TagsComponent } from '../../../shared/components';
@Component({
  selector: 'app-add-project',
  imports: [
    // NgLabelTemplateDirective, NgOptionTemplateDirective,
    TagsComponent,
    NgSelectComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.scss',
})
export class AddProjectComponent implements OnInit {
  projectForm!: FormGroup;
  projects: any[] = [];
  selectedProjects: any[] = [];
  private projectService = inject(ProjectService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initForm();
    this.loadProjects();
  }

  private initForm(): void {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      technologies: [[], [Validators.required]],
      license: ['', [Validators.required]],
      tags: [[], [Validators.required]],
      projectType: [
        '',
        [Validators.required, Validators.pattern('^(main|mini)$')],
      ],
      seoKeywords: [[], [Validators.required]],
      additionalResources: [[], [Validators.required]],
      relatedProjects: [[], [Validators.required]],
      collaborators: [[], [Validators.required]],
      link: ['', [Validators.pattern('https?://.+')]],
      repo: ['', [Validators.pattern('https?://.+')]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      status: [
        '',
        [
          Validators.required,
          Validators.pattern('^(Planning|In Progress|Completed)$'),
        ],
      ],
      current: [false],
      featured: [false],
      archived: [false],
      videoRepresentation: ['', [Validators.pattern('https?://.+')]],
      images: [[], [Validators.required]],
      skills: this.fb.array([], [Validators.required, uniqueTagsValidator]),
      deploymentDetails: this.fb.array([]),
      viewsCount: [0, [Validators.min(0)]],
      likes: [0, [Validators.min(0)]],
      lastUpdatedBy: ['', [Validators.required]],
      documentationLink: ['', [Validators.pattern('https?://.+')]],
    });
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe((data) => {
      this.projects = data;
    });
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      // Handle form submission
      console.log(this.projectForm.value);
    } else {
      console.log('Form is not valid');
    }
  }
  get f() {
    return this.projectForm.controls;
  }
  onReset(): void {
    this.projectForm.reset();
  }
  previewVideo(event: any): void {
    const videoPreview = document.getElementById(
      'videoPreview'
    ) as HTMLVideoElement;
    const videoSource = document.getElementById(
      'videoSource'
    ) as HTMLSourceElement;

    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      videoSource.src = URL.createObjectURL(file);
      videoPreview.load();
      videoPreview.classList.remove('hidden');
    }
  }
  get skills() {
    return this.projectForm.get('skills') as FormArray;
  }
  addSkill(skill: string) {
    if (skill && !this.skills.value.includes(skill)) {
      this.skills.push(this.fb.control(skill));
    }
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }
  previewImage(event: any): void {
    const imagePreview = document.getElementById(
      'imagePreview'
    ) as HTMLImageElement;

    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      imagePreview.src = URL.createObjectURL(file);
      imagePreview.classList.remove('hidden');
    }
  }
  get deploymentDetails() {
    return this.projectForm.get('deploymentDetails') as FormArray;
  }

  // Add a new deployment detail form group
  addDeploymentDetail() {
    this.deploymentDetails.push(
      this.fb.group({
        platform: ['', [Validators.required]],
        url: ['', [Validators.required, Validators.pattern('https?://.+')]],
      })
    );
  }

  // Remove a deployment detail form group
  removeDeploymentDetail(index: number) {
    this.deploymentDetails.removeAt(index);
  }
}
