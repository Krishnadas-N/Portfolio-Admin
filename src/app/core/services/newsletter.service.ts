import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  NewsletterSubscribersResponse,
  CampaignsResponse,
  NewsletterParams,
  PaginationParams
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/newsletter`;

  // Get all newsletter subscribers
  getSubscribers(params?: NewsletterParams): Observable<ApiResponse<NewsletterSubscribersResponse>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params?.order) httpParams = httpParams.set('order', params.order);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<ApiResponse<NewsletterSubscribersResponse>>(
      `${this.apiUrl}/subscribers`,
      { params: httpParams }
    );
  }

  // Get newsletter campaigns
  getCampaigns(params?: PaginationParams & { status?: 'draft' | 'scheduled' | 'sent' | 'failed' }): Observable<ApiResponse<CampaignsResponse>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<ApiResponse<CampaignsResponse>>(
      `${this.apiUrl}/campaigns`,
      { params: httpParams }
    );
  }
  // Manual Subscribe
  manualSubscribe(data: { email: string; firstName?: string; lastName?: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/subscribe`, data);
  }

  // Manual Unsubscribe
  toggleSubscription(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/toggle-status`, { email });
  }

  // Update Subscriber Status
  updateSubscriberStatus(id: string, status: 'pending' | 'subscribed' | 'unsubscribed'): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/subscribers/${id}/status`, { status });
  }

  // Export Subscribers
  exportSubscribers(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/subscribers/export`);
  }

  // Create Campaign
  createCampaign(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/campaigns`, data);
  }

  // Get Single Campaign
  getCampaign(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/campaigns/${id}`);
  }

  // Update Campaign
  updateCampaign(id: string, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/campaigns/${id}`, data);
  }

  // Update Campaign Status
  updateCampaignStatus(id: string, status: 'draft' | 'scheduled' | 'sent'): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/campaigns/${id}/status`, { status });
  }

  // Delete Campaign
  deleteCampaign(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/campaigns/${id}`);
  }
}
