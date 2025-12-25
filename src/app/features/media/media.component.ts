import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { MediaFile, MediaStatistics } from '../../core/models/api.models';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media.component.html',
  styles: [`
    :host {
        display: block;
        height: 100%;
        overflow: hidden;
    }
  `]
})
export class MediaComponent implements OnInit {
  private adminService = inject(AdminService);

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
      if (res.success) {
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
      if (res.success) this.stats.set(res.data);
    });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      // Basic loop upload - usually you'd want a proper queue management
      // For now, this suffices for small batches
      let completed = 0;
      for (let i = 0; i < files.length; i++) {
        this.adminService.uploadImage(files[i]).subscribe({
          next: () => {
            completed++;
            if (completed === files.length) {
              this.currentPage = 1;
              this.loadFiles();
              this.loadStats();
            }
          },
          error: (err) => console.error('Upload failed', err)
        });
      }
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
            this.loadStats();
          }
        });
      });
    }
  }

  copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      // Ideally show a toast here
      // alert('Copied to clipboard'); 
    });
  }

  loadMore() {
    this.currentPage++;
    this.loadFiles(true);
  }
}
