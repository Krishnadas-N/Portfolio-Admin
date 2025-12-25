import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { MediaFile, MediaStatistics } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media.component.html',
  styles: [`
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }
  `]
})
export class MediaComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  // Data Signals
  files = signal<MediaFile[]>([]);
  stats = signal<MediaStatistics | null>(null);

  // UI Signals
  searchQuery = signal('');
  viewMode = signal<'grid' | 'list'>('grid');
  isSelectMode = signal(false);
  selectedFiles = signal<Set<string>>(new Set());
  previewFile = signal<MediaFile | null>(null);

  currentPage = 1;

  // Computed
  filteredFiles = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allFiles = this.files();
    if (!query) return allFiles;

    return allFiles.filter(f => {
      const key = f.key || f.Key || '';
      return key.toLowerCase().includes(query);
    });
  });

  ngOnInit() {
    this.loadFiles();
    this.loadStats();
  }

  loadFiles(append: boolean = false) {
    this.adminService.getMediaFiles(this.currentPage).subscribe((res: any) => {
      let rawFiles: any[] = [];

      // Handle different response structures
      if (res.success) {
        if (Array.isArray(res.data)) {
          // Case 1: res.data is the array of files (as seen in recent user log)
          rawFiles = res.data;
        } else if (res.data && Array.isArray(res.data.recentUploads)) {
          // Case 2: res.data.recentUploads is the array
          rawFiles = res.data.recentUploads;
        } else if (res.data && Array.isArray(res.data.files)) {
          // Case 3: res.data.files is the array (legacy/old structure)
          rawFiles = res.data.files;
        }
      }

      if (rawFiles.length > 0) {
        // Map to MediaFile - construct URL if missing and map lowercase fields to UpperCase for UI
        const mappedFiles: MediaFile[] = rawFiles.map((f: any) => {
          let url = f.url;
          if (!url && f.key) {
            // Fallback to construction if URL missing
            url = `https://res.cloudinary.com/dpjkuvq1r/image/upload/${f.key}`;
          }

          return {
            key: f.key || f.Key,
            url: url,
            provider: f.provider || 'cloudinary',
            Size: f.size || f.Size, // Map lowercase size to Size
            LastModified: f.lastModified || f.LastModified // Map lowercase lastModified to LastModified
          } as MediaFile;
        });

        if (append) {
          this.files.update(current => [...current, ...mappedFiles]);
        } else {
          this.files.set(mappedFiles);
        }
      } else if (!append) {
        // If no files found and not appending, clear the list
        this.files.set([]);
      }
    });
  }

  loadStats() {
    this.adminService.getMediaStats().subscribe((res: any) => {
      if (res.success) {
        // Map new stats structure to conform to potential UI usages if needed
        // The UI uses 'fileCount' and 'totalSize'
        // New JSON: totalFiles, totalSize.
        // We need to map totalFiles -> fileCount for the template compatibility 
        // or update template. We update the signal with mapped object.
        const data = res.data;
        const stats: MediaStatistics = {
          ...data,
          fileCount: data.totalFiles, // Map totalFiles to fileCount
          imageCount: data.totalFiles // Map totalFiles to imageCount for usage calc
        };
        this.stats.set(stats);
      }
    });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      let completed = 0;
      let errors = 0;
      const total = files.length;

      // Show toast for start? "Uploading x files..."
      this.toastService.info(`Uploading ${total} file(s)...`);

      for (let i = 0; i < files.length; i++) {
        this.adminService.uploadImage(files[i]).subscribe({
          next: (res: any) => {
            if (res.success) {
              // Individual success toast? Maybe too noisy for many files.
              // We'll just count success.
            }
            completed++;
            this.checkUploadCompletion(completed, total, errors);
          },
          error: (err) => {
            console.error('Upload failed', err);
            errors++;
            completed++;
            this.checkUploadCompletion(completed, total, errors);
          }
        });
      }
    }
  }

  checkUploadCompletion(completed: number, total: number, errors: number) {
    if (completed === total) {
      if (errors === 0) {
        this.toastService.success(`Successfully uploaded ${total} file(s)`);
      } else if (errors === total) {
        this.toastService.error(`Failed to upload ${total} file(s)`);
      } else {
        this.toastService.warning(`Uploaded ${total - errors} files, ${errors} failed`);
      }
      this.currentPage = 1;
      this.loadFiles();
      this.loadStats();
    }
  }

  // Interaction Methods
  onFileClick(file: MediaFile) {
    if (this.isSelectMode()) {
      this.toggleFileSelection(file);
    } else {
      this.previewFile.set(file);
    }
  }

  toggleSelectMode() {
    this.isSelectMode.update(v => !v);
    if (!this.isSelectMode()) {
      this.selectedFiles.set(new Set());
    }
  }

  toggleFileSelection(file: MediaFile) {
    const key = file.key || file.Key || '';
    if (!key) return;

    this.selectedFiles.update(set => {
      const newSet = new Set(set);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  }

  deleteFile(key: string) {
    if (confirm('Delete this file permanently?')) {
      this.adminService.deleteMediaFile(key).subscribe(() => {
        this.files.update(files => files.filter(f => (f.key || f.Key) !== key));
        this.toastService.success('File deleted successfully');
        this.loadStats();
      });
    }
  }

  deleteSelected() {
    const keys = Array.from(this.selectedFiles());
    if (keys.length === 0) return;

    if (confirm(`Delete ${keys.length} selected files permanently?`)) {
      // Naive parallel deletion. In production, use backend batch delete or limit concurrency.
      let processed = 0;
      keys.forEach(key => {
        this.adminService.deleteMediaFile(key).subscribe(() => {
          this.files.update(files => files.filter(f => (f.key || f.Key) !== key));
          processed++;
          if (processed === keys.length) {
            this.selectedFiles.set(new Set());
            this.isSelectMode.set(false);
            this.toastService.success('Selected files deleted');
            this.loadStats();
          }
        });
      });
    }
  }

  copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      this.toastService.success('Copied to clipboard');
    });
  }

  downloadFile(file: MediaFile) {
    if (!file.url) return;

    this.toastService.info('Starting download...');

    // Try fetching as blob to force download behavior
    fetch(file.url)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = (file.key || file.Key || 'download').split('/').pop() || 'file';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.toastService.success('Download completed');
      })
      .catch(err => {
        console.error('Download error:', err);
        // Fallback: Open in new tab
        window.open(file.url, '_blank');
        this.toastService.warning('Download failed. Opened in new tab instead.');
      });
  }

  loadMore() {
    this.currentPage++;
    this.loadFiles(true);
  }
}

