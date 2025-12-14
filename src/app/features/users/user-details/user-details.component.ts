import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/api.models';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {{ isEditMode() ? 'Edit User' : 'Create User' }}
        </h2>

        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input type="text" formControlName="username" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" formControlName="email" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border">
          </div>

          <div *ngIf="!isEditMode()">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" formControlName="password" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select formControlName="role" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border">
              <option value="admin">Admin</option>
              <option value="super-admin">Super Admin</option>
            </select>
          </div>

          <div class="flex justify-end space-x-3">
            <button type="button" (click)="onCancel()"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
              Cancel
            </button>
            <button type="submit" [disabled]="userForm.invalid || isLoading()"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {{ isLoading() ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class UserDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  userForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''], // Required only for create
    role: ['admin', Validators.required]
  });

  isEditMode = signal(false);
  isLoading = signal(false);
  userId: string | null = null;

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId && this.userId !== 'new') {
      this.isEditMode.set(true);
      this.loadUser(this.userId);
    } else {
      this.userForm.get('password')?.addValidators(Validators.required);
    }
  }

  loadUser(id: string) {
    this.userService.getUser(id).subscribe(user => {
      this.userForm.patchValue(user);
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isLoading.set(true);
      const userData = this.userForm.value;

      const request = this.isEditMode() && this.userId
        ? this.userService.updateUser(this.userId, userData)
        : this.userService.createUser(userData);

      request.subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/users']);
        },
        error: () => {
          this.isLoading.set(false);
          // Handle error
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/users']);
  }
}

