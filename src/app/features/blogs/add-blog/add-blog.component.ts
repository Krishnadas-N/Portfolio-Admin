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

@Component({
  selector: 'app-add-blog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule],
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

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.platformId = platformId;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.editor = new Editor();
      this.editorInitialized = true;
    }

    this.initForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.blogId = params['id'];
        this.loadBlog(this.blogId!);
      }
    });
  }

  private initForm(): void {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      content: ['', Validators.required],
      excerpt: ['', [Validators.required, Validators.maxLength(300)]],
      author: ['Admin', [Validators.required]], // Default or fetch from user
      tags: this.fb.array([]),
      coverImage: ['', [Validators.pattern('https?://.+')]],
      category: ['', [Validators.required]],
      status: ['published', [Validators.required]], // 'published' or 'draft'
      featured: [false]
    });
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
      content: blog.content,
      excerpt: blog.excerpt,
      author: blog.author?.name || 'Admin',
      coverImage: blog.coverImage,
      category: blog.category,
      status: blog.status,
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

      this.mediaService.uploadFiles([file]).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const uploadedUrl = (res.data as any)[0]?.url || (res.data as any).data?.[0]?.url;
            if (uploadedUrl) {
              this.blogForm.patchValue({ coverImage: uploadedUrl });
              this.toastService.success('Cover image uploaded');
            }
          }
        },
        error: (err) => this.toastService.error('Failed to upload image')
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
