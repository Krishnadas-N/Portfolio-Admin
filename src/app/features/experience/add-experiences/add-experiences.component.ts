import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { CompanyLogoService } from '../../../core/services';
import { CompanyDetails } from '../../../core/models';
import { Subscription } from 'rxjs';
import { NgStyle } from '@angular/common';
@Component({
    selector: 'app-add-experiences',
    imports: [ReactiveFormsModule,NgStyle],
    templateUrl: './add-experiences.component.html',
    styleUrl: './add-experiences.component.scss'
})
export class AddExperiencesComponent  implements OnInit, OnDestroy{
  experienceForm!: FormGroup;
  fb = inject(FormBuilder);
  companyLogoService = inject(CompanyLogoService)
  companySuggestions: CompanyDetails[] = [];
  logoUrl: string = '';
  selectedCompany: string = '';
  showSuggestions: boolean = false;
  private companySubscription: Subscription | undefined = undefined;
  ngOnInit(): void {
    this.experienceForm = this.fb.group({
      title: ['', Validators.required],
      companyLogo:['', Validators.required],
      company: ['', Validators.required],
      location: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false],
      technologies: this.fb.array([], Validators.required),
      workType: ['Full-time', Validators.required],
      locationType: ['Remote', Validators.required],
      description: ['', Validators.required],
    });
    this.fetchCompanySuggestions();
  }

  get technologies() {
    return this.experienceForm.get('technologies') as FormArray;
  }

  addTechnology(technology: string) {
    if (technology && !this.technologies.value.includes(technology)) {
      this.technologies.push(this.fb.control(technology));
    }
  }

  removeTechnology(index: number) {
    this.technologies.removeAt(index);
  }
  fetchCompanySuggestions() {
    this.companySubscription = this.experienceForm
      .get('company')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((companyName) => this.companyLogoService.fetchCompanySuggestions(companyName))
      )
      .subscribe((suggestions: CompanyDetails[]) => {
        this.companySuggestions = suggestions;
      });
  }

  // Select a company from the suggestions
  selectCompany(company: CompanyDetails): void {
    this.selectedCompany = company.name;
    this.logoUrl = company.logo_url;
    this.experienceForm.get('company')?.setValue(this.selectedCompany);
    this.experienceForm.get('companyLogo')?.setValue(this.logoUrl);
    this.companySuggestions = [];
    this.showSuggestions = false; 
  }

  clearSelection(): void {
    this.selectedCompany = '';
    this.logoUrl = '';
    this.experienceForm.get('company')?.setValue('');
    this.companySuggestions = [];
  }
  onSubmit() {
    if (this.experienceForm.valid) {
      console.log(this.experienceForm.value);
    } else {
      console.log('Form is invalid');
    }
  }
  onBlur() {
    setTimeout(() => {
      this.showSuggestions = false; // Hide suggestions after input loses focus
    }, 200);
  }
  ngOnDestroy(): void {
    if (this.companySubscription) {
      this.companySubscription.unsubscribe();
    }
  }
}
