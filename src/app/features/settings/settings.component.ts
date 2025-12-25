import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { TagsComponent } from '../../shared/components/tags/tags.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  tabs = [
    { id: 'general', label: 'General', icon: 'fa-solid fa-sliders' },
    { id: 'social', label: 'Social Media', icon: 'fa-solid fa-share-nodes' },
    { id: 'features', label: 'Features', icon: 'fa-solid fa-toggle-on' },
    { id: 'seo', label: 'SEO', icon: 'fa-solid fa-magnifying-glass' }
  ];

  activeTab = signal('general');
  isLoading = signal(false);

  settingsForm: FormGroup = this.fb.group({
    siteName: [''],
    profileImage: [''],
    siteDescription: [''],
    siteKeywords: [[]],
    contact: this.fb.group({
      email: [''],
      phone: ['']
    }),
    social: this.fb.group({
      github: [''],
      linkedin: [''],
      twitter: [''],
      instagram: ['']
    }),
    seo: this.fb.group({
      metaTitle: [''],
      metaDescription: ['']
    }),
    features: this.fb.group({
      blog: [true],
      projects: [true],
      testimonials: [true],
      contact: [true]
    })
  });

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.adminService.getSettings().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.settingsForm.patchValue(res.data);
        } else {
          this.toastService.error('Failed to load settings');
        }
      },
      error: () => this.toastService.error('Connection error loading settings')
    });
  }

  get keywordsControl(): FormControl {
    return this.settingsForm.get('siteKeywords') as FormControl;
  }

  addKeyword(event: any) {
    const input = event.target;
    const value = input.value?.trim();

    if (value) {
      const currentKeywords = this.keywordsControl.value || [];
      if (!currentKeywords.includes(value)) {
        this.keywordsControl.setValue([...currentKeywords, value]);
        this.settingsForm.markAsDirty();
      }
      input.value = '';
    }
  }

  removeKeyword(index: number) {
    const currentKeywords = this.keywordsControl.value || [];
    currentKeywords.splice(index, 1);
    this.keywordsControl.setValue([...currentKeywords]); // Trigger change detection
    this.settingsForm.markAsDirty();
  }

  onSubmit() {
    if (this.settingsForm.invalid) {
      this.toastService.warning('Please check form for errors');
      return;
    }

    this.isLoading.set(true);
    this.adminService.updateSettings(this.settingsForm.value).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res.success) {
          this.toastService.success('Settings saved successfully');
          this.settingsForm.markAsPristine();
        } else {
          this.toastService.error(res.message || 'Failed to save settings');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastService.error(err.error?.message || 'Failed to save settings');
      }
    });
  }
}
