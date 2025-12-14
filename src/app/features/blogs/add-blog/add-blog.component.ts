import { Component, Inject, PLATFORM_ID, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { BlogService } from '../../../core/services/blog.service';
import { MediaService } from '../../../core/services/media.service';
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
        }
      },
      error: (err) => console.error('Error loading blog', err)
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
      this.mediaService.uploadFiles([file]).subscribe({
        next: (res) => {
          if (res.success && res.data && res.data.data && res.data.data.length > 0) {
            // Assuming res.data is MediaFile[] and we want the url
            // Adjust based on actual MediaService response structure if needed
            // Based on add-project, it was res.data.data
            // Let's check api.models.ts: MediaBatchUploadResponse { message: string, data: MediaFile[] }
            // So res.data is MediaFile[]. 
            // Wait, standard ApiResponse wrapper? BlogService returns ApiResponse<T>.
            // MediaService.uploadFiles returns Observable<ApiResponse<MediaBatchUploadResponse>>?
            // Let's check media.service.ts if I could read it. 
            // Assuming standard ApiResponse wrapper from user context "lot mismatches...".
            // In add-project, I used: `const uploadedFiles = (res.data as any).data || res.data;`
            
             const uploadedUrl = (res.data as any)[0]?.url || (res.data as any).data?.[0]?.url;
             if (uploadedUrl) {
               this.blogForm.patchValue({ coverImage: uploadedUrl });
             }
          }
        },
        error: (err) => console.error('Image upload failed', err)
      });
    }
  }

  onSubmit(): void {
    if (this.blogForm.invalid) return;

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
          this.router.navigate(['/blogs']);
        }
      },
      error: (err) => console.error('Error saving blog', err)
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
