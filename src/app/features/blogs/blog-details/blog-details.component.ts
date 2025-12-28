import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import { Blog } from '../../../core/models/api.models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss'
})
export class BlogDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);

  blog = signal<Blog | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Safely retrieve related posts ensuring they are Blog objects
  relatedPosts = computed(() => {
    const currentBlog = this.blog();
    if (!currentBlog || !currentBlog.relatedPosts) return [];

    // Filter and type guard to ensure we only return Blog objects, not string IDs
    return currentBlog.relatedPosts.filter((post): post is Blog => {
      return typeof post !== 'string' && post !== null && typeof post === 'object';
    });
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadBlog(params['id']);
      }
    });
  }

  loadBlog(id: string) {
    this.isLoading.set(true);
    this.error.set(null);
    this.blogService.getBlog(id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.blog.set(res.data);
        } else {
          this.error.set('Blog not found');
        }
      },
      error: (err) => {
        console.error('Error loading blog', err);
        this.error.set('Failed to load blog details');
      }
    });
  }

  deleteBlog() {
    const id = this.blog()?._id;
    if (id && confirm('Are you sure you want to delete this blog post?')) {
      this.blogService.deleteBlog(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.router.navigate(['/blogs']);
          }
        },
        error: (err) => console.error(err)
      });
    }
  }
}
