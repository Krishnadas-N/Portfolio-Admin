import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../../core/services/newsletter.service';
import { ToastService } from '../../core/services/toast.service';
import { NewsletterSubscriber, Campaign, NewsletterParams, PaginationParams } from '../../core/models/api.models';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newsletter.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
      overflow-y: hidden;
    }
  `]
})
export class NewsletterComponent implements OnInit {
  private newsletterService = inject(NewsletterService);
  private toastService = inject(ToastService);

  // Stats / Data Signals
  activeTab = signal<'subscribers' | 'campaigns'>('subscribers');
  subscribers = signal<NewsletterSubscriber[]>([]);
  campaigns = signal<Campaign[]>([]);

  // Pagination & Filters
  subscriberParams = signal<NewsletterParams>({ page: 1, limit: 10, search: '' });
  subscribersPagination = signal({ current: 1, pages: 1, total: 0 });

  campaignParams = signal<PaginationParams>({ page: 1, limit: 10 });
  campaignsPagination = signal({ current: 1, pages: 1, total: 0 });

  isLoading = signal(false);

  // Modal States & Forms
  isSubscribeModalOpen = signal(false);
  isCampaignModalOpen = signal(false);

  subscriberForm = signal({
    email: '',
    firstName: '',
    lastName: ''
  });

  editingCampaignId = signal<string | null>(null);

  campaignForm = signal({
    title: '',
    subject: '',
    content: '',
    tags: '',
    scheduledAt: ''
  });

  updateCampaignForm(field: 'title' | 'subject' | 'content' | 'tags' | 'scheduledAt', value: string) {
    this.campaignForm.update(current => ({ ...current, [field]: value }));
  }

  // --- Campaign Actions ---
  openCampaignModal(campaign?: Campaign) {
    if (campaign) {
      this.editingCampaignId.set(campaign._id);
      this.campaignForm.set({
        title: campaign.title,
        subject: campaign.subject,
        content: campaign.content,
        tags: campaign.tags ? campaign.tags.join(', ') : '',
        scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : ''
      });
    } else {
      this.editingCampaignId.set(null);
      this.campaignForm.set({ title: '', subject: '', content: '', tags: '', scheduledAt: '' });
    }
    this.isCampaignModalOpen.set(true);
  }

  closeCampaignModal() {
    this.isCampaignModalOpen.set(false);
    this.editingCampaignId.set(null);
  }

  saveCampaign() {
    const { title, subject, content, tags, scheduledAt } = this.campaignForm();
    if (!title || !subject) {
      this.toastService.error('Title and Subject are required');
      return;
    }

    const payload: any = {
      title,
      subject,
      content,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      htmlContent: `<h1>${title}</h1><p>${content}</p>` // Simple auto-generation for now
    };

    if (scheduledAt) {
      payload.scheduledAt = new Date(scheduledAt).toISOString();
    }

    const request$ = this.editingCampaignId()
      ? this.newsletterService.updateCampaign(this.editingCampaignId()!, payload)
      : this.newsletterService.createCampaign(payload);

    request$.subscribe({
      next: () => {
        this.toastService.success(`Campaign ${this.editingCampaignId() ? 'updated' : 'created'} successfully`);
        this.closeCampaignModal();
        this.loadCampaigns();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error(`Failed to ${this.editingCampaignId() ? 'update' : 'create'} campaign`);
      }
    });
  }

  updateCampaignStatus(id: string, status: 'draft' | 'scheduled' | 'sent') {
    if (!confirm(`Are you sure you want to change status to ${status}?`)) return;

    this.newsletterService.updateCampaignStatus(id, status).subscribe({
      next: () => {
        this.toastService.success(`Campaign status updated to ${status}`);
        this.loadCampaigns();
      },
      error: () => this.toastService.error('Failed to update status')
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (this.activeTab() === 'subscribers') {
      this.loadSubscribers();
    } else {
      this.loadCampaigns();
    }
  }

  setActiveTab(tab: 'subscribers' | 'campaigns') {
    this.activeTab.set(tab);
    this.loadData();
  }

  loadSubscribers() {
    this.isLoading.set(true);
    this.newsletterService.getSubscribers(this.subscriberParams()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.subscribers.set(res.data.subscribers);
          if (res.data.pagination) {
            this.subscribersPagination.set(res.data.pagination);
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load subscribers', err);
        this.isLoading.set(false);
      }
    });
  }

  loadCampaigns() {
    this.isLoading.set(true);
    this.newsletterService.getCampaigns(this.campaignParams()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const campaigns = (res.data as any).campaigns || (Array.isArray(res.data) ? res.data : []);
          this.campaigns.set(campaigns);
          if ((res.data as any).pagination) {
            this.campaignsPagination.set((res.data as any).pagination);
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load campaigns', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(query: string) {
    this.subscriberParams.update(p => ({ ...p, search: query, page: 1 }));
    this.loadSubscribers();
  }

  changeSubscriberPage(page: number) {
    this.subscriberParams.update(p => ({ ...p, page }));
    this.loadSubscribers();
  }

  // ==================== ACTIONS ====================

  // --- Subscribe Actions ---
  openSubscribeModal() {
    this.subscriberForm.set({ email: '', firstName: '', lastName: '' });
    this.isSubscribeModalOpen.set(true);
  }

  closeSubscribeModal() {
    this.isSubscribeModalOpen.set(false);
  }

  saveSubscriber() {
    const { email, firstName, lastName } = this.subscriberForm();
    if (!email || !email.includes('@')) {
      this.toastService.error('Please enter a valid email address');
      return;
    }

    this.newsletterService.manualSubscribe({ email, firstName, lastName }).subscribe({
      next: () => {
        this.toastService.success('Subscriber added successfully');
        this.closeSubscribeModal();
        this.loadSubscribers();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Failed to add subscriber')
    });
  }

  toggleSubscriberStatus(subscriber: NewsletterSubscriber) {
    let newStatus: 'subscribed' | 'unsubscribed';

    if (subscriber.status === 'pending') {
      newStatus = 'subscribed';
    } else if (subscriber.status === 'subscribed') {
      newStatus = 'unsubscribed';
    } else {
      newStatus = 'subscribed';
    }

    // We can keep a simple confirm for status changes or implement a better one later
    if (confirm(`Change status from ${subscriber.status} to ${newStatus}?`)) {
      this.newsletterService.updateSubscriberStatus(subscriber._id, newStatus).subscribe({
        next: () => {
          this.toastService.success(`Subscriber status updated to ${newStatus}`);
          this.loadSubscribers();
        },
        error: () => this.toastService.error('Failed to update status')
      });
    }
  }

  copyEmail(email: string) {
    navigator.clipboard.writeText(email).then(() => {
      this.toastService.success('Email copied to clipboard');
    }).catch(() => {
      this.toastService.error('Failed to copy email');
    });
  }

  toggleSubscription(email: string) {
    const isUnsubscribing = this.subscribers().find(s => s.email === email)?.status === 'subscribed';
    const action = isUnsubscribing ? 'unsubscribe' : 'reactivate';

    if (confirm(`Are you sure you want to ${action} ${email}?`)) {
      this.newsletterService.toggleSubscription(email).subscribe({
        next: () => {
          this.toastService.success(`Subscriber ${isUnsubscribing ? 'unsubscribed' : 'reactivated'} successfully`);
          this.loadSubscribers();
        },
        error: () => this.toastService.error(`Failed to ${action} subscriber`)
      });
    }
  }

  exportSubscribers() {
    this.isLoading.set(true);
    this.newsletterService.exportSubscribers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // The backend returns the list of subscribers directly in res.data
          const data = Array.isArray(res.data) ? res.data : (res.data as any).subscribers || [];
          this.downloadCSV(data, `subscribers_export_${new Date().toISOString().split('T')[0]}`);
          this.toastService.success('Subscribers exported successfully');
        } else {
          this.toastService.error('No data to export');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Export failed', err);
        this.toastService.error('Failed to export subscribers');
        this.isLoading.set(false);
      }
    });
  }

  private downloadCSV(data: any[], filename: string) {
    if (!data || !data.length) {
      this.toastService.info('No data to export');
      return;
    }

    // Define headers map
    const headersMap = {
      email: 'Email',
      firstName: 'First Name',
      lastName: 'Last Name',
      status: 'Status',
      source: 'Source',
      tags: 'Tags',
      subscribedAt: 'Subscribed At'
    };

    const headers = Object.values(headersMap);
    const keys = Object.keys(headersMap);

    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        return keys.map(key => {
          let value = row[key];

          // Handle specific fields
          if (key === 'tags' && Array.isArray(value)) {
            value = value.join('; ');
          } else if (key === 'subscribedAt' && value) {
            value = new Date(value).toLocaleDateString();
          } else if (value === undefined || value === null) {
            value = '';
          }

          // Escape quotes and wrap in quotes if necessary
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  // Form Helpers
  updateSubscriberForm(field: 'email' | 'firstName' | 'lastName', value: string) {
    this.subscriberForm.update(current => ({ ...current, [field]: value }));
  }



  deleteCampaign(id: string) {
    if (confirm('Delete this campaign?')) {
      this.newsletterService.deleteCampaign(id).subscribe({
        next: () => {
          this.toastService.success('Campaign deleted');
          this.loadCampaigns();
        },
        error: () => this.toastService.error('Failed to delete campaign')
      });
    }
  }
}
