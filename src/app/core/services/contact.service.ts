import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  Contact,
  ContactsResponse,
  ContactStats,
  ContactDetailsResponse,
  ContactsParams
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/contacts`;

  // Get all contact form submissions
  getContacts(params?: ContactsParams): Observable<ApiResponse<ContactsResponse>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.priority) httpParams = httpParams.set('priority', params.priority);
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params?.order) httpParams = httpParams.set('order', params.order);
    
    return this.http.get<ApiResponse<ContactsResponse>>(this.apiUrl, { params: httpParams });
  }

  // Get contact statistics
  getContactStats(): Observable<ApiResponse<ContactStats>> {
    return this.http.get<ApiResponse<ContactStats>>(`${this.apiUrl}/stats`);
  }

  // Get single contact with details
  getContact(id: string): Observable<ApiResponse<ContactDetailsResponse>> {
    return this.http.get<ApiResponse<ContactDetailsResponse>>(`${this.apiUrl}/${id}`);
  }

  // Update contact status
  updateContactStatus(
    id: string, 
    status: 'new' | 'read' | 'replied' | 'archived' | 'spam'
  ): Observable<ApiResponse<Contact>> {
    return this.http.patch<ApiResponse<Contact>>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }

  // Reply to a contact
  replyToContact(
    id: string, 
    reply: { message: string; ccToSelf?: boolean; subject?: string }
  ): Observable<ApiResponse<{ contactId: string; reply: any; emailSent: boolean }>> {
    return this.http.post<ApiResponse<{ contactId: string; reply: any; emailSent: boolean }>>(
      `${this.apiUrl}/${id}/reply`,
      reply
    );
  }

  // Mark contact as spam
  markAsSpam(id: string): Observable<ApiResponse<Contact>> {
    return this.http.patch<ApiResponse<Contact>>(`${this.apiUrl}/${id}/spam`, {});
  }

  // Assign contact to an admin
  assignContact(id: string, assignedTo: string): Observable<ApiResponse<Contact>> {
    return this.http.patch<ApiResponse<Contact>>(
      `${this.apiUrl}/${id}/assign`,
      { assignedTo }
    );
  }

  // Delete a contact
  deleteContact(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
