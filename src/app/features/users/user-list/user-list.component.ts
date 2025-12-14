import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/api.models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">A list of all users in your account including their name, title, email and role.</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a routerLink="new" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
            Add user
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
         <div class="relative flex-1">
             <input 
               type="text" 
               [(ngModel)]="searchTerm" 
               (ngModelChange)="onSearch()"
               placeholder="Search users..." 
               class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white pl-4 pr-12 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
             >
         </div>
      </div>

      <!-- Table -->
      <div class="flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Name</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  <tr *ngFor="let user of users()">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0">
                          <img class="h-10 w-10 rounded-full" [src]="user.profileImage || 'assets/images/profile.png'" alt="">
                        </div>
                        <div class="ml-4">
                          <div class="font-medium text-gray-900 dark:text-white">{{ user.username }}</div>
                          <div class="text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                        [ngClass]="{
                            'bg-green-100 text-green-800': user.role === 'super_admin',
                            'bg-blue-100 text-blue-800': user.role === 'admin',
                            'bg-gray-100 text-gray-800': user.role === 'user'
                        }">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                       [ngClass]="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                        {{ user.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <a [routerLink]="[user._id]" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">Edit</a>
                      <button (click)="deleteUser(user._id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                  <tr *ngIf="users().length === 0">
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">No users found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination (Simple) -->
       <div class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 rounded-lg shadow" *ngIf="pagination()">
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Showing
              <span class="font-medium">{{ (pagination()!.page - 1) * pagination()!.limit + 1 }}</span>
              to
              <span class="font-medium">{{ Math.min(pagination()!.page * pagination()!.limit, pagination()!.total) }}</span>
              of
              <span class="font-medium">{{ pagination()!.total }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button 
                [disabled]="pagination()!.page === 1"
                (click)="changePage(pagination()!.page - 1)"
                class="relative inline-flex items-center rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:z-20 disabled:opacity-50">
                <span class="sr-only">Previous</span>
                <i class="fa-solid fa-chevron-left h-5 w-5"></i>
              </button>
              <button 
                [disabled]="pagination()!.page === pagination()!.pages"
                (click)="changePage(pagination()!.page + 1)"
                class="relative inline-flex items-center rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:z-20 disabled:opacity-50">
                <span class="sr-only">Next</span>
                <i class="fa-solid fa-chevron-right h-5 w-5"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  private adminService = inject(AdminService);
  Math = Math; // Make Math available in template
  
  users = signal<User[]>([]);
  pagination = signal<any>(null);
  searchTerm = '';
  currentPage = 1;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers(this.currentPage, 10, this.searchTerm).subscribe(res => {
      if(res.success) {
          this.users.set(res.data.users || []);
          this.pagination.set(res.data.pagination);
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadUsers();
  }

  changePage(page: number) {
      this.currentPage = page;
      this.loadUsers();
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }
}
