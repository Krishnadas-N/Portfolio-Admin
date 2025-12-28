import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { ToastService } from '../../../core/services/toast.service';
import { Contact, Pagination, ContactStats } from '../../../core/models/api.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-view-contacts',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
    templateUrl: './view-contacts.component.html',
    styles: [`
    :host { display: block; }
  `]
})
export class ViewContactsComponent implements OnInit {
    private contactService = inject(ContactService);
    private toastService = inject(ToastService);

    contacts = signal<Contact[]>([]);
    pagination = signal<Pagination | null>(null);
    stats = signal<ContactStats | null>(null);
    isLoading = signal<boolean>(false);

    searchTerm = signal<string>('');
    statusFilter = signal<string>('');
    private searchSubject = new Subject<string>();

    ngOnInit() {
        this.loadStats();
        this.loadContacts();

        // Debounce search
        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(term => {
            this.searchTerm.set(term);
            this.loadContacts(1);
        });
    }

    onSearch(term: string) {
        this.searchSubject.next(term);
    }

    loadStats() {
        this.contactService.getContactStats().subscribe({
            next: (res) => {
                if (res.success) this.stats.set(res.data);
            }
        });
    }

    loadContacts(page: number = 1) {
        this.isLoading.set(true);
        const params: any = { page, limit: 10 };
        if (this.searchTerm()) params.search = this.searchTerm();
        if (this.statusFilter()) params.status = this.statusFilter();

        this.contactService.getContacts(params).pipe(
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (res: any) => {
                // Handle response where data is the array directly (PaginatedResult pattern)
                // or where data has contacts property (ApiResponse<ContactsResponse> pattern)
                if (res.success) {
                    if (Array.isArray(res.data)) {
                        this.contacts.set(res.data);
                        this.pagination.set(res.pagination);
                    } else if (res.data?.contacts) {
                        this.contacts.set(res.data.contacts);
                        this.pagination.set(res.data.pagination || res.pagination);
                    } else {
                        // Fallback or empty
                        this.contacts.set([]);
                        this.pagination.set(res.pagination);
                    }
                }
            },
            error: (err) => this.toastService.error('Failed to load contacts')
        });
    }

    onPageChange(page: number) {
        this.loadContacts(page);
    }

    setStatusFilter(status: string) {
        this.statusFilter.set(status);
        this.loadContacts(1);
    }

    markAsSpam(id: string, event: Event) {
        event.stopPropagation();
        if (!confirm('Mark this contact as spam?')) return;

        this.contactService.markAsSpam(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastService.success('Contact marked as spam');
                    this.loadContacts(this.pagination()?.page || 1);
                    this.loadStats();
                }
            },
            error: () => this.toastService.error('Failed to mark as spam')
        });
    }

    deleteContact(id: string, event: Event) {
        event.stopPropagation();
        if (!confirm('Are you sure you want to delete this contact?')) return;

        this.contactService.deleteContact(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastService.success('Contact deleted');
                    this.loadContacts(this.pagination()?.page || 1);
                    this.loadStats();
                }
            },
            error: () => this.toastService.error('Failed to delete contact')
        });
    }
}
