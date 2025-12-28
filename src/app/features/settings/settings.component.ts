import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { MediaService } from '../../core/services/media.service';
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
  private mediaService = inject(MediaService); // Inject MediaService

  tabs = [
    { id: 'general', label: 'General', icon: 'fa-solid fa-sliders' },
    { id: 'profile', label: 'Admin Profile', icon: 'fa-solid fa-user-shield' },
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
      contact: [true],
      analytics: [true],
      chatBot: [true],
      newsletter: [false]
    })
  });

  profileForm: FormGroup = this.fb.group({
    username: [''],
    email: [''],
    bio: [''],
    phone: [''],
    profileImage: [''],
    role: [''],
    lastLogin: ['']
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  ngOnInit() {
    this.loadSettings();
    this.loadProfile();
  }

  loadSettings() {
    this.adminService.getSettings().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const data = res.data;
          // Map socialMedia array to form group
          if (data.socialMedia && Array.isArray(data.socialMedia)) {
            const socialGroup: any = {};
            data.socialMedia.forEach((sm: any) => {
              if (sm.platform) socialGroup[sm.platform.toLowerCase()] = sm.url;
            });
            this.settingsForm.get('social')?.patchValue(socialGroup);
          }
          // Patch other fields
          this.settingsForm.patchValue(data);
        }
      },
      error: () => this.toastService.error('Connection error loading settings')
    });
  }

  loadProfile() {
    this.adminService.getProfile().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.profileForm.patchValue(res.data);
        }
      }
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

  // Media Upload
  onFileSelected(event: any, formName: 'settings' | 'profile') {
    const file = event.target.files[0];
    if (!file) return;

    this.isLoading.set(true);
    this.mediaService.uploadImage(file).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res.success) {
          const items = Array.isArray(res.data) ? res.data : [res.data];
          const url = items[0]?.original.url;
          if (url) {
            if (formName === 'profile') {
              this.profileForm.patchValue({ profileImage: url });
              this.profileForm.markAsDirty();
            } else {
              this.settingsForm.patchValue({ profileImage: url });
              this.settingsForm.markAsDirty();
            }
            this.toastService.success('Image uploaded successfully');
          }
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to upload image');
      }
    });
  }

  onSubmit() {
    if (this.activeTab() === 'profile') {
      this.onProfileSubmit();
      return;
    }

    if (this.settingsForm.invalid) {
      this.toastService.warning('Please check form for errors');
      return;
    }

    const formValue = this.settingsForm.value;

    // Map social group back to socialMedia array
    const socialMedia = [];
    const socialGroup = formValue.social;
    if (socialGroup.github) socialMedia.push({ platform: 'Github', url: socialGroup.github, icon: 'fa-brands fa-github' });
    if (socialGroup.linkedin) socialMedia.push({ platform: 'LinkedIn', url: socialGroup.linkedin, icon: 'fa-brands fa-linkedin' });
    if (socialGroup.twitter) socialMedia.push({ platform: 'Twitter', url: socialGroup.twitter, icon: 'fa-brands fa-twitter' });
    if (socialGroup.instagram) socialMedia.push({ platform: 'Instagram', url: socialGroup.instagram, icon: 'fa-brands fa-instagram' });

    const payload = { ...formValue, socialMedia };
    delete payload.social; // Remove the internal social group

    this.isLoading.set(true);
    this.adminService.updateSettings(payload).subscribe({
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

  onProfileSubmit() {
    // 1. Update Profile Logic
    if (this.profileForm.dirty && this.profileForm.valid) {
      this.isLoading.set(true);
      this.adminService.updateProfile(this.profileForm.value).subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          if (res.success) {
            this.toastService.success('Profile updated');
            this.profileForm.markAsPristine();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toastService.error(err.error?.message || 'Failed to update profile');
        }
      });
    }

    // 2. Change Password Logic
    if (this.passwordForm.dirty && this.passwordForm.valid) {
      if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
        this.toastService.error('Passwords do not match');
        return;
      }

      this.isLoading.set(true);
      this.adminService.changePassword(this.passwordForm.value).subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          if (res.success) {
            this.toastService.success('Password changed successfully');
            this.passwordForm.reset();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toastService.error(err.error?.message || 'Failed to change password');
        }
      });
    }
  }
}
