import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import { Blog, Pagination } from '../../../core/models/api.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../core/services/toast.service';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-view-blogs',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, FormsModule],
  templateUrl: './view-blogs.component.html',
  styleUrl: './view-blogs.component.scss'
})
export class ViewBlogsComponent implements OnInit {
  private blogService = inject(BlogService);
  private toastService = inject(ToastService);

  blogs = signal<Blog[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');

  ngOnInit() {
    this.loadBlogs();
  }

  loadBlogs(page: number = 1) {
    this.isLoading.set(true);
    this.error.set(null);
    this.blogService.getBlogs({ page, search: this.searchTerm() }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.blogs.set(res.data);
          this.pagination.set(res.pagination);
        } else {
          this.toastService.error(res.data?.message || 'Failed to load blogs');
        }
      },
      error: (err) => {
        console.error('Error loading blogs', err);
        this.error.set('Failed to load blogs');
        this.toastService.error('Connection error loading blogs');
      }
    });
  }

  onSearch() {
    this.loadBlogs(1);
  }

  onPageChange(page: number) {
    this.loadBlogs(page);
  }

  deleteBlog(id: string) {
    if (confirm('Are you sure you want to delete this blog post?')) {
      this.blogService.deleteBlog(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success('Blog post deleted successfully');
            this.blogs.update(current => current.filter(b => b._id !== id));
            if (this.blogs().length === 0 && (this.pagination()?.page || 1) > 1) {
              this.loadBlogs((this.pagination()?.page || 1) - 1);
            } else {
              this.loadBlogs(this.pagination()?.page ?? 1);
            }
          } else {
            this.toastService.error(res.message || 'Failed to delete blog');
          }
        },
        error: (err) => {
          console.error('Error deleting blog', err);
          this.toastService.error(err.error?.message || 'Failed to delete blog');
        }
      });
    }
  }
}
