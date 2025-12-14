import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service'; 

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <!-- Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button 
              *ngFor="let tab of tabs"
              (click)="activeTab.set(tab.id)"
              [class.border-indigo-500]="activeTab() === tab.id"
              [class.text-indigo-600]="activeTab() === tab.id"
              [class.border-transparent]="activeTab() !== tab.id"
              [class.text-gray-500]="activeTab() !== tab.id"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Form -->
        <div class="p-6">
          <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- General Settings -->
            <div *ngIf="activeTab() === 'general'" class="space-y-6">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Name</label>
                  <input type="text" formControlName="siteName" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                </div>
                
                <div class="sm:col-span-6">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea formControlName="siteDescription" rows="3" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"></textarea>
                </div>

                <div class="sm:col-span-3">
                   <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email</label>
                   <input type="email" formControlName="email" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                </div>

                <div class="sm:col-span-3">
                   <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                   <input type="text" formControlName="phone" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                </div>
              </div>
            </div>

            <!-- Social Media -->
            <div *ngIf="activeTab() === 'social'" formGroupName="social" class="space-y-6">
               <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                 <div class="sm:col-span-6">
                   <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
                   <div class="mt-1 flex rounded-md shadow-sm">
                     <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                       <i class="fa-brands fa-github"></i>
                     </span>
                     <input type="url" formControlName="github" class="flex-1 block w-full min-w-0 rounded-none rounded-r-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                   </div>
                 </div>

                 <div class="sm:col-span-6">
                   <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</label>
                   <div class="mt-1 flex rounded-md shadow-sm">
                     <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                       <i class="fa-brands fa-linkedin"></i>
                     </span>
                     <input type="url" formControlName="linkedin" class="flex-1 block w-full min-w-0 rounded-none rounded-r-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                   </div>
                 </div>
                 
                 <div class="sm:col-span-6">
                   <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Twitter URL</label>
                   <div class="mt-1 flex rounded-md shadow-sm">
                     <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                       <i class="fa-brands fa-twitter"></i>
                     </span>
                     <input type="url" formControlName="twitter" class="flex-1 block w-full min-w-0 rounded-none rounded-r-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                   </div>
                 </div>
               </div>
            </div>
            
            <!-- Features -->
            <div *ngIf="activeTab() === 'features'" formGroupName="features" class="space-y-6">
                <div class="space-y-4">
                    <div class="relative flex items-start">
                        <div class="flex h-5 items-center">
                            <input id="blog" formControlName="blog" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="blog" class="font-medium text-gray-700 dark:text-gray-300">Enable Blog</label>
                            <p class="text-gray-500">Allow creating and publishing blog posts.</p>
                        </div>
                    </div>
                     <div class="relative flex items-start">
                        <div class="flex h-5 items-center">
                            <input id="projects" formControlName="projects" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="projects" class="font-medium text-gray-700 dark:text-gray-300">Enable Projects</label>
                            <p class="text-gray-500">Showcase your portfolio projects.</p>
                        </div>
                    </div>
                     <div class="relative flex items-start">
                        <div class="flex h-5 items-center">
                            <input id="testimonials" formControlName="testimonials" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="testimonials" class="font-medium text-gray-700 dark:text-gray-300">Enable Testimonials</label>
                            <p class="text-gray-500">Display client testimonials.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Actions -->
            <div class="flex justify-end pt-5 border-t border-gray-200 dark:border-gray-700">
              <button type="submit" [disabled]="isLoading()" 
                 class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {{ isLoading() ? 'Saving...' : 'Save Settings' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  tabs = [
    { id: 'general', label: 'General' },
    { id: 'social', label: 'Social Media' },
    { id: 'features', label: 'Features' },
    { id: 'seo', label: 'SEO' }
  ];

  activeTab = signal('general');
  isLoading = signal(false);

  settingsForm: FormGroup = this.fb.group({
    siteName: [''],
    siteDescription: [''],
    siteUrl: [''],
    email: [''],
    phone: [''],
    social: this.fb.group({
        github: [''],
        linkedin: [''],
        twitter: ['']
    }),
    seo: this.fb.group({
        title: [''],
        description: [''],
        keywords: ['']
    }),
    features: this.fb.group({
        blog: [true],
        projects: [true],
        testimonials: [true]
    })
  });

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.adminService.getSettings().subscribe((res: any) => {
      if(res.success && res.data) {
        this.settingsForm.patchValue(res.data);
      }
    });
  }

  onSubmit() {
    this.isLoading.set(true);
    this.adminService.updateSettings(this.settingsForm.value).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if(res.success) {
            // Show toast
            alert('Settings saved successfully');
        }
      },
      error: () => {
        this.isLoading.set(false);
        alert('Failed to save settings');
      }
    });
  }
}
