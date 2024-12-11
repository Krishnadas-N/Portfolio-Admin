import { CommonModule } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { TagsComponent } from '../../../shared/components';
import {
  imageFileValidator,
  uniqueTagsValidator,
} from '../../../shared/utils/validators';
import { REGEX_PATTERNS } from '../../../shared/constants/regex-patterns';

@Component({
  selector: 'app-add-blog',
  standalone: true,
  imports: [ReactiveFormsModule, NgxEditorModule, TagsComponent],
  templateUrl: './add-blog.component.html',
  styleUrl: './add-blog.component.scss',
})
export class AddBlogComponent {
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
  editorInitialized = false;
  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.editor = new Editor();
      this.editorInitialized = true;
    }

    this.blogForm = this.fb.group({
      title: ['',
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
      ],
      content: ['', Validators.required],
      summary: ['',Validators.required,Validators.maxLength(250)],
      author: ['',Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)],
      tags: this.fb.array([], [Validators.required, uniqueTagsValidator]),
      image: ['', [imageFileValidator]],
      category: ['', [Validators.required]],
      visibility: ['Public', [Validators.required]],
    });
  }
  get tags(): FormArray {
    return this.blogForm.get('tags') as FormArray;
  }

  addTag(tag: string): void {
    const trimmedTag = tag.trim();
    if (trimmedTag && !this.tags.value.includes(trimmedTag)) {
      this.tags.push(
        this.fb.control(trimmedTag, [
          Validators.pattern(REGEX_PATTERNS.ALPHANUMERIC),
        ])
      );
    }
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }
  onSubmit(): void {
    if (this.blogForm.valid) {
      console.log('Form Data:', this.blogForm.value);
      // Perform API call to save the blog
    } else {
      console.error('Form is invalid');
    }
  }
  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }
}
