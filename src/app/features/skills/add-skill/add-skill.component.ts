import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IMAGE_URL_VALIDATOR } from '../../../shared/utils/validators';
@Component({
  selector: 'app-add-skill',
  imports: [ReactiveFormsModule],
  templateUrl: './add-skill.component.html',
  styleUrl: './add-skill.component.scss',
})
export class AddSkillComponent {
  skillForm!: FormGroup;
  private fb = inject(FormBuilder);
  ngOnInit() {
    this.skillForm = this.fb.group({
      skillName: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s]+$/)],
      ],
      skillLevel: ['', Validators.required],
      category: ['', Validators.required],
      logoUrl: ['', [IMAGE_URL_VALIDATOR]],
    });
  }
  onSubmit() {
    if (this.skillForm.valid) {
      console.log(this.skillForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  get skillName() {
    return this.skillForm.get('skillName');
  }

  get skillLevel() {
    return this.skillForm.get('skillLevel');
  }

  get category() {
    return this.skillForm.get('category');
  }

  get logoUrl() {
    return this.skillForm.get('logoUrl');
  }
}
