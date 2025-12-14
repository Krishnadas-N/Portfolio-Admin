import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service'; 
import { MediaFile, MediaStatistics } from '../../core/models/api.models';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h1>
        <div>
           <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden" multiple accept="image/*">
           <button (click)="fileInput.click()" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
             <i class="fa-solid fa-cloud-upload-alt mr-2"></i>
             Upload
           </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-4" *ngIf="stats()">
          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
             <dt class="text-sm font-medium text-gray-500 truncate">Total Files</dt>
             <dd class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{{ stats()!.fileCount }}</dd>
          </div>
          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
             <dt class="text-sm font-medium text-gray-500 truncate">Total Size</dt>
             <dd class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{{ stats()!.totalSize }}</dd>
          </div>
           <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
             <dt class="text-sm font-medium text-gray-500 truncate">Images</dt>
             <dd class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{{ stats()!.imageCount }}</dd>
          </div>
      </div>

      <!-- Gallery -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div *ngFor="let file of files()" class="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700">
          <img [src]="file.url" class="object-cover w-full h-full" alt="">
          
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100">
             <div class="flex justify-between items-center text-white">
                <span class="text-xs truncate">{{ ((file.Size || 0) / 1024).toFixed(1) }} KB</span>
                <button (click)="deleteFile(file.key || file.Key || '')" class="p-1 hover:text-red-400">
                  <i class="fa-solid fa-trash"></i>
                </button>
             </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="files().length === 0" class="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
            <i class="fa-regular fa-image text-4xl mb-4"></i>
            <p>No media files found</p>
        </div>
      </div>
      
      <!-- Load More -->
      <div class="text-center" *ngIf="files().length > 0">
          <button (click)="loadMore()" class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">Load More</button>
      </div>
    </div>
  `
})
export class MediaComponent implements OnInit {
  private adminService = inject(AdminService);
  
  files = signal<MediaFile[]>([]);
  stats = signal<MediaStatistics | null>(null);
  currentPage = 1;

  ngOnInit() {
    this.loadFiles();
    this.loadStats();
  }

  loadFiles(append: boolean = false) {
    this.adminService.getMediaFiles(this.currentPage).subscribe((res: any) => {
      if(res.success) {
          if (append) {
              this.files.update(current => [...current, ...res.data.files]);
          } else {
              this.files.set(res.data.files || []);
          }
      }
    });
  }
  
  loadStats() {
      this.adminService.getMediaStats().subscribe((res: any) => {
          if(res.success) this.stats.set(res.data);
      });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      // Basic implementation for single file upload repeated
      // Real app should use the batch endpoint
      for (let i = 0; i < files.length; i++) {
        this.adminService.uploadImage(files[i]).subscribe(() => {
             if (i === files.length - 1) {
                 this.currentPage = 1;
                 this.loadFiles();
                 this.loadStats();
             }
        });
      }
    }
  }

  deleteFile(key: string) {
    if (confirm('Delete this file?')) {
      this.adminService.deleteMediaFile(key).subscribe(() => {
        this.files.update(files => files.filter(f => (f.key || f.Key) !== key));
        this.loadStats();
      });
    }
  }
  
  loadMore() {
      this.currentPage++;
      this.loadFiles(true);
  }
}
