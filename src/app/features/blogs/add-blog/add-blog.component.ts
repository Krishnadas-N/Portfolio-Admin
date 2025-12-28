import { Component, Inject, PLATFORM_ID, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { BlogService } from '../../../core/services/blog.service';
import { MediaService } from '../../../core/services/media.service';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';
import { Blog } from '../../../core/models/api.models';

import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-add-blog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule, NgSelectModule],
  templateUrl: './add-blog.component.html',
  styleUrl: './add-blog.component.scss',
})
export class AddBlogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private blogService = inject(BlogService);
  private mediaService = inject(MediaService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @Inject(PLATFORM_ID) private platformId: Object;

  blogForm!: FormGroup;
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['undo', 'redo'],
  ];

  isEditMode = false;
  isSubmitting = false;
  isLoading = false;
  blogId: string | null = null;
  editorInitialized = false;

  // List of available blogs for "Related Posts" selection
  relatedBlogs = signal<Blog[]>([]);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.platformId = platformId;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.editor = new Editor();
      this.editorInitialized = true;
    }

    this.initForm();
    this.loadRelatedCandidates();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.blogId = params['id'];
        this.loadBlog(this.blogId!);
      }
    });
  }

  loadRelatedCandidates() {
    // Fetch blogs to populate the "Related Posts" dropdown.
    // Fetching 100 most recent for now.
    this.blogService.getBlogs({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Filter out current blog if in edit mode is handled in template or we can filter here if we had the ID early.
          // Since we might not have ID yet, we'll store all.
          this.relatedBlogs.set(res.data);
        }
      }
    });
  }

  private initForm(): void {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      slug: ['', [Validators.pattern('^[a-z0-9-]+$')]], // Auto-generated but editable
      content: ['', Validators.required],
      excerpt: ['', [Validators.required, Validators.maxLength(300)]],
      author: ['Admin', [Validators.required]],
      tags: this.fb.array([]),
      featuredImage: ['', [Validators.pattern('https?://.+')]],
      category: ['', [Validators.required]],
      status: ['draft', [Validators.required]],
      publishedAt: [''],
      seoTitle: ['', [Validators.maxLength(70)]],
      seoDescription: ['', [Validators.maxLength(160)]],
      relatedPosts: [[]],
      readingTime: [0, [Validators.min(0)]],
      featured: [false]
    });

    // Auto-generate slug from title if slug is untouched
    this.blogForm.get('title')?.valueChanges.subscribe(title => {
      if (title && !this.isEditMode && !this.blogForm.get('slug')?.dirty) {
        this.blogForm.patchValue({
          slug: this.generateSlug(title)
        });
      }
    });
  }

  generateSlug(title: string): string {
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  get f() { return this.blogForm.controls; }
  get tags() { return this.blogForm.get('tags') as FormArray; }

  loadBlog(id: string) {
    this.isLoading = true;
    this.blogService.getBlog(id).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patchForm(res.data);
        } else {
          this.toastService.error(res.message || 'Failed to load blog details');
        }
      },
      error: (err) => {
        console.error('Error loading blog', err);
        this.toastService.error('Connection error while loading blog');
      }
    });
  }

  patchForm(blog: Blog) {
    this.blogForm.patchValue({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt,
      author: blog.author?.name || 'Admin',
      featuredImage: blog.featuredImage, // Updated from coverImage
      category: blog.category,
      status: blog.status,
      publishedAt: blog.publishedAt ? new Date(blog.publishedAt).toISOString().split('T')[0] : '',
      seoTitle: blog.seoTitle,
      seoDescription: blog.seoDescription,
      relatedPosts: blog.relatedPosts ? blog.relatedPosts.map(p => (typeof p === 'object' ? p._id : p)) : [],
      readingTime: blog.readingTime || 0,
      featured: blog.isFeatured || false
    });

    this.tags.clear();
    if (blog.tags) {
      blog.tags.forEach(tag => this.addTag(tag));
    }
  }

  addTag(tagValue: string, input?: HTMLInputElement): void {
    const value = (tagValue || '').trim();
    if (value && !this.tags.value.includes(value)) {
      this.tags.push(this.fb.control(value));
      if (input) input.value = '';
    }
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.warning('Image size too large (Max 5MB)');
        return;
      }

      this.mediaService.uploadMixedBundle({ images: [file] }).subscribe({
        next: (res: any) => {
          if (res.success && res.data && res.data.images && res.data.images.length > 0) {
            const uploadedUrl = res.data.images[0].original?.url || res.data.images[0].url;
            if (uploadedUrl) {
              this.blogForm.patchValue({ featuredImage: uploadedUrl });
              this.toastService.success('Cover image uploaded');
            }
          }
        },
        error: (err: any) => this.toastService.error('Failed to upload image')
      });
    }
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      this.toastService.warning('Please fill in all required fields correctly');
      this.blogForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const blogData = {
      ...this.blogForm.value,
      isFeatured: this.blogForm.value.featured
    };
    delete blogData.featured;

    const request = this.isEditMode && this.blogId
      ? this.blogService.updateBlog(this.blogId, blogData)
      : this.blogService.createBlog(blogData);

    request.pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(this.isEditMode ? 'Blog post updated successfully' : 'Blog post published successfully');
          this.router.navigate(['/blogs']);
        } else {
          this.toastService.error(res.message || 'Operation failed');
        }
      },
      error: (err) => {
        console.error('Error saving blog', err);
        this.toastService.error(err.error?.message || 'Failed to save blog post');
      }
    });
  }

  onCancel() {
    this.router.navigate(['/blogs']);
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }
}
