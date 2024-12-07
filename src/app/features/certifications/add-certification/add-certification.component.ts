import { NgFor, NgIf } from '@angular/common';
import { inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
@Component({
  selector: 'app-add-certification',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './add-certification.component.html',
  styleUrl: './add-certification.component.scss',
})
export class AddCertificationComponent implements OnInit {
  certificationForm!: FormGroup;
  fb = inject(FormBuilder);
  imagePreview: string | ArrayBuffer | null = null;
  ngOnInit() {
    this.certificationForm = this.fb.group({
      title: ['', Validators.required],
      issuer: ['', Validators.required],
      issueDate: ['', Validators.required],
      expirationDate: [''],
      credentialId: [''],
      credentialUrl: [''],
      description: [''],
      skillsGained: this.fb.array([], Validators.required),
      imageUrl: ['', Validators.pattern(/https?:\/\/.+\.(jpg|jpeg|png)$/)],
    });
  }
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input?.files?.length) {
      const file = input.files[0];
      if (file && !file.type.startsWith('image/')) {
        alert('Please upload a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file); // Read the file as a data URL (image preview)
    }
  }

  get skillsGained() {
    return this.certificationForm.get('skillsGained') as FormArray;
  }
  addSkill(skill: string) {
    if (skill && !this.skillsGained.value.includes(skill)) {
      this.skillsGained.push(this.fb.control(skill));
    }
  }

  removeSkill(index: number) {
    this.skillsGained.removeAt(index);
  }

  onSubmit() {
    if (this.certificationForm.valid) {
      console.log(this.certificationForm.value);
    } else {
      console.log('Form is invalid');
    }
  }
}
