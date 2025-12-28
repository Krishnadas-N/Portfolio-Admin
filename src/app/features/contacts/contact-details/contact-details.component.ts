import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { ToastService } from '../../../core/services/toast.service';
import { Contact } from '../../../core/models/api.models';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-contact-details',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './contact-details.component.html',
    styles: [`
    :host { display: block; }
  `]
})
export class ContactDetailsComponent implements OnInit {
    private contactService = inject(ContactService);
    private toastService = inject(ToastService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    contact = signal<Contact | null>(null);
    isLoading = signal<boolean>(false);
    isSending = signal<boolean>(false);

    replyMessage = signal<string>('');
    replySubject = signal<string>('');
    statusOptions: ('new' | 'read' | 'replied' | 'closed')[] = ['new', 'read', 'replied', 'closed'];

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.loadContact(params['id']);
            }
        });
    }

    loadContact(id: string) {
        this.isLoading.set(true);
        this.contactService.getContact(id).pipe(
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.contact.set(res.data);
                    // Pre-fill reply subject
                    this.replySubject.set(`Re: ${res.data.subject}`);
                } else {
                    this.toastService.error('Contact not found');
                    this.router.navigate(['/contacts']);
                }
            },
            error: () => {
                this.toastService.error('Failed to load contact');
                this.router.navigate(['/contacts']);
            }
        });
    }

    updateStatus(status: 'new' | 'read' | 'replied' | 'closed') {
        const current = this.contact();
        if (!current) return;

        this.contactService.updateContactStatus(current._id, status).subscribe({
            next: (res) => {
                if (res.success) {
                    this.contact.set({ ...current, status });
                    this.toastService.success(`Status updated to ${status}`);
                }
            },
            error: () => this.toastService.error('Failed to update status')
        });
    }

    sendReply() {
        const current = this.contact();
        if (!current || !this.replyMessage().trim()) return;

        this.isSending.set(true);
        const replyData = {
            message: this.replyMessage(),
            subject: this.replySubject(),
            ccToSelf: true
        };

        this.contactService.replyToContact(current._id, replyData).pipe(
            finalize(() => this.isSending.set(false))
        ).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastService.success('Reply sent successfully');
                    this.contact.set({ ...current, status: 'replied', repliedAt: new Date().toISOString() });
                    this.replyMessage.set('');
                }
            },
            error: () => this.toastService.error('Failed to send reply')
        });
    }

    markAsSpam() {
        const current = this.contact();
        if (!current) return;

        if (!confirm('Mark this message as spam?')) return;

        this.contactService.markAsSpam(current._id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastService.success('Marked as spam');
                    this.router.navigate(['/contacts']);
                }
            },
            error: () => this.toastService.error('Failed to mark as spam')
        });
    }

    deleteContact() {
        const current = this.contact();
        if (!current) return;

        if (!confirm('Permanently delete this message?')) return;

        this.contactService.deleteContact(current._id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastService.success('Message deleted');
                    this.router.navigate(['/contacts']);
                }
            },
            error: () => this.toastService.error('Failed to delete message')
        });
    }
}
