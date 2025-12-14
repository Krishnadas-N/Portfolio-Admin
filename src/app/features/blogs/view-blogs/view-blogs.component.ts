import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import { Blog, Pagination } from '../../../core/models/api.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
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
    this.blogService.getBlogs({ page, search: this.searchTerm() }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.blogs.set(res.data);
          this.pagination.set(res.pagination);
        }
      },
      error: (err) => {
        console.error('Error loading blogs', err);
        this.error.set('Failed to load blogs');
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
            this.blogs.update(current => current.filter(b => b._id !== id));
            this.loadBlogs(this.pagination()?.page ?? 1);
          }
        },
        error: (err) => console.error('Error deleting blog', err)
      });
    }
  }
}
