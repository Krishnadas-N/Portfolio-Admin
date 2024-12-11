import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';
import { CompanyLogoService } from '../../../core/services';
import { CompanyDetails } from '../../../core/models';
import { debounceTime, Subscription, switchMap } from 'rxjs';
import { TagsComponent } from '../../../shared/components';
import {
  IMAGE_URL_VALIDATOR,
  uniqueTagsValidator,
} from '../../../shared/utils/validators';

@Component({
  selector: 'app-add-education',
  imports: [ReactiveFormsModule, TagsComponent],
  templateUrl: './add-education.component.html',
  styleUrl: './add-education.component.scss',
})
export class AddEducationComponent implements OnInit, OnDestroy {
  educationForm!: FormGroup;
  private fb = inject(FormBuilder);
  // placeSuggestServivce = inject(PlaceSuggestionService);
  instituteLogoService = inject(CompanyLogoService);
  instituteSuggestions: CompanyDetails[] = [];
  logoUrl: string = '';
  selectedInstitute: string = '';
  showSuggestions: boolean = false;
  private instituteSubscription: Subscription | undefined = undefined;
  ngOnInit(): void {
    this.educationForm = this.fb.group({
      degree: ['', [Validators.required, Validators.minLength(3)]],
      fieldOfStudy: ['', [Validators.required, Validators.minLength(3)]],
      institution: ['', [Validators.required, Validators.minLength(3)]],
      institutionLogo: ['', [Validators.required, IMAGE_URL_VALIDATOR]],
      location: ['', [Validators.maxLength(100)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      grade: ['', [Validators.pattern('[A-Za-z0-9 .,+_-]+')]],
      activities: ['', [Validators.maxLength(300)]],
      skills: this.fb.array([], [Validators.required, uniqueTagsValidator]),
    });
    this.fetchInstituteSuggestions();
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
  fetchInstituteSuggestions() {
    this.instituteSubscription = this.educationForm
      .get('institution')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((instituteName) =>
          this.instituteLogoService.fetchCompanySuggestions(instituteName)
        )
      )
      .subscribe((suggestions: CompanyDetails[]) => {
        this.instituteSuggestions = suggestions;
      });
  }

  // Select a company from the suggestions
  selectCompany(institute: CompanyDetails): void {
    this.selectedInstitute = institute.name;
    this.logoUrl = institute.logo_url;
    this.educationForm.get('institution')?.setValue(this.selectedInstitute);
    this.educationForm.get('institutionLogo')?.setValue(this.logoUrl);
    this.instituteSuggestions = [];
    this.showSuggestions = false;
  }
  onBlur() {
    setTimeout(() => {
      this.showSuggestions = false; // Hide suggestions after input loses focus
    }, 200);
  }
  onSubmit(): void {
    if (this.educationForm.valid) {
      console.log('Form submitted:', this.educationForm.value);
      // Handle form submission logic here (e.g., send data to the server)
    } else {
      console.log('Form is invalid');
    }
  }
  ngOnDestroy(): void {
    if (this.instituteSubscription) {
      this.instituteSubscription.unsubscribe();
    }
  }
}
