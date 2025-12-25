import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SkillService } from '../../../core/services/skill.service';
import { MediaService } from '../../../core/services/media.service';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';
import { Skill } from '../../../core/models/api.models';

@Component({
  selector: 'app-add-skill',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-skill.component.html',
  styleUrl: './add-skill.component.scss',
})
export class AddSkillComponent implements OnInit {
  private fb = inject(FormBuilder);
  private skillService = inject(SkillService);
  private mediaService = inject(MediaService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  skillForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  skillId: string | null = null;

  ngOnInit() {
    this.initForm();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.skillId = params['id'];
        this.loadSkill(this.skillId!);
      }
    });
  }

  private initForm() {
    this.skillForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      level: ['intermediate', Validators.required],
      proficiency: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      icon: [''],
      yearsOfExperience: [0],
      description: [''],
      color: ['#000000'],
      isActive: [true]
    });
  }

  get f() { return this.skillForm.controls; }

  loadSkill(id: string) {
    this.isLoading.set(true);
    this.skillService.getSkill(id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patchForm(res.data);
        } else {
          this.toastService.error(res.message || 'Failed to load skill');
        }
      },
      error: (err) => {
        console.error('Error loading skill', err);
        this.toastService.error('Failed to load skill details');
      }
    });
  }

  patchForm(skill: Skill) {
    this.skillForm.patchValue({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      proficiency: skill.proficiency ?? 50,
      icon: skill.icon,
      yearsOfExperience: skill.yearsOfExperience,
      description: skill.description,
      color: skill.color,
      isActive: skill.isActive ?? true
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.toastService.warning('Image size too large (Max 2MB)');
        return;
      }
      this.mediaService.uploadFiles([file]).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const uploadedUrl = (res.data as any)[0]?.url || (res.data as any).data?.[0]?.url;
            if (uploadedUrl) {
              this.skillForm.patchValue({ icon: uploadedUrl });
              this.toastService.success('Icon uploaded');
            }
          }
        },
        error: (err) => this.toastService.error('Icon upload failed')
      });
    }
  }

  onSubmit() {
    if (this.skillForm.invalid) {
      this.toastService.warning('Please check form inputs');
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.skillForm.value;

    const skillData: Partial<Skill> = {
      ...formValue
    };

    const request = this.isEditMode() && this.skillId
      ? this.skillService.updateSkill(this.skillId, skillData)
      : this.skillService.createSkill(skillData);

    request.pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(this.isEditMode() ? 'Skill updated' : 'Skill created');
          this.router.navigate(['/skills']);
        } else {
          this.toastService.error(res.message || 'Operation failed');
        }
      },
      error: (err) => {
        console.error('Error saving skill', err);
        this.toastService.error(err.error?.message || 'Failed to save skill');
      }
    });
  }

  onCancel() {
    this.router.navigate(['/skills']);
  }
}
