import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pagination } from '../../../core/models/api.models';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between border-t border-base-200 px-4 py-3 sm:px-6" *ngIf="pagination && pagination.pages > 1">
      <div class="flex flex-1 justify-between sm:hidden">
        <button 
          (click)="onPageChange(pagination.page ? pagination.page - 1 : 1)" 
          [disabled]="pagination.page === 1"
          class="btn btn-sm btn-outline">
          Previous
        </button>
        <button 
          (click)="onPageChange(pagination.page ? pagination.page + 1 : 1)" 
          [disabled]="pagination.page === pagination.pages"
          class="btn btn-sm btn-outline">
          Next
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-base-content/70">
            Showing
            <span class="font-medium">{{ (pagination.page ? pagination.page - 1 : 0) * pagination.limit + 1 }}</span>
            to
            <span class="font-medium">{{ Math.min(pagination.page ? pagination.page * pagination.limit : 0, pagination.total) }}</span>
            of
            <span class="font-medium">{{ pagination.total }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button 
              (click)="onPageChange(pagination.page ? pagination.page - 1 : 1)"
              [disabled]="pagination.page === 1"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-base-content ring-1 ring-inset ring-base-300 hover:bg-base-200 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="sr-only">Previous</span>
              <i class="fa-solid fa-chevron-left h-5 w-5 flex items-center justify-center"></i>
            </button>
            
            <ng-container *ngFor="let page of pages">
              <button 
                *ngIf="page !== -1"
                (click)="onPageChange(page)"
                [class.bg-primary]="page === pagination.page"
                [class.text-primary-content]="page === pagination.page"
                [class.hover:bg-primary-focus]="page === pagination.page"
                [class.hover:bg-base-200]="page !== pagination.page"
                class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-base-300 focus:z-20 focus:outline-offset-0">
                {{ page }}
              </button>
              <span 
                *ngIf="page === -1"
                class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-base-content ring-1 ring-inset ring-base-300 focus:outline-offset-0">
                ...
              </span>
            </ng-container>

            <button 
              (click)="onPageChange(pagination.page ? pagination.page + 1 : 1)"
              [disabled]="pagination.page ? pagination.page === pagination.pages : false"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-base-content ring-1 ring-inset ring-base-300 hover:bg-base-200 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="sr-only">Next</span>
              <i class="fa-solid fa-chevron-right h-5 w-5 flex items-center justify-center"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() pagination!: Pagination;
  @Output() pageChange = new EventEmitter<number>();

  Math = Math;

  get pages(): number[] {
    if (!this.pagination) return [];
    
    const { page, pages } = this.pagination;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= pages; i++) {
      if (page && (i === 1 || i === pages || (i >= page - delta && i <= page + delta))) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(-1);
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

  onPageChange(page: number) {
    if (this.pagination && page >= 1 && page <= this.pagination.pages && page !== this.pagination.page) {
      this.pageChange.emit(page);
    }
  }
}
