import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-education',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-education.component.html',
  styleUrl: './add-education.component.scss',
})
export class AddEducationComponent {
  educationForm!: FormGroup;
  private fb = inject(FormBuilder);
  // placeSuggestServivce = inject(PlaceSuggestionService);
  ngOnInit(): void {
    this.educationForm = this.fb.group({
      degree: ['', [Validators.required, Validators.minLength(3)]],
      fieldOfStudy: ['', [Validators.required, Validators.minLength(3)]],
      institution: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', [Validators.maxLength(100)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      grade: ['', [Validators.pattern('[A-Za-z0-9 .,+_-]+')]],
      activities: ['', [Validators.maxLength(300)]],
      skills: this.fb.array([], Validators.required),
    });
  }

  get f() {
    return this.educationForm.controls;
  }
  get skills() {
    return this.educationForm.get('skills') as FormArray;
  }
  addSkill(skill: string) {
    if (skill && !this.skills.value.includes(skill)) {
      this.skills.push(this.fb.control(skill));
    }
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }
  onSubmit(): void {
    if (this.educationForm.valid) {
      console.log('Form submitted:', this.educationForm.value);
      // Handle form submission logic here (e.g., send data to the server)
    } else {
      console.log('Form is invalid');
    }
  }
}
