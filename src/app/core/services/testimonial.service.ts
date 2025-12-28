import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  Testimonial,
  TestimonialStats,
  SearchParams
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/content/testimonials`;

  // Get all testimonials
  getTestimonials(params?: SearchParams & { verified?: boolean; featured?: boolean; isActive?: boolean }): Observable<ApiResponse<Testimonial[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.verified !== undefined) httpParams = httpParams.set('verified', params.verified.toString());
    if (params?.featured !== undefined) httpParams = httpParams.set('featured', params.featured.toString());
    if (params?.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());

    return this.http.get<ApiResponse<Testimonial[]>>(this.apiUrl, { params: httpParams });
  }

  // Get single testimonial by ID
  getTestimonial(id: string): Observable<ApiResponse<Testimonial>> {
    return this.http.get<ApiResponse<Testimonial>>(`${this.apiUrl}/${id}`);
  }

  // Create new testimonial
  createTestimonial(testimonial: Partial<Testimonial>): Observable<ApiResponse<Testimonial>> {
    return this.http.post<ApiResponse<Testimonial>>(this.apiUrl, testimonial);
  }

  // Update testimonial
  updateTestimonial(id: string, testimonial: Partial<Testimonial>): Observable<ApiResponse<Testimonial>> {
    return this.http.put<ApiResponse<Testimonial>>(`${this.apiUrl}/${id}`, testimonial);
  }

  // Delete testimonial
  deleteTestimonial(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Verify testimonial
  verifyTestimonial(id: string): Observable<ApiResponse<{ _id: string; verified: boolean; verifiedAt: string }>> {
    return this.http.patch<ApiResponse<{ _id: string; verified: boolean; verifiedAt: string }>>(
      `${this.apiUrl}/${id}/verify`,
      {}
    );
  }

  // Toggle featured status
  featureTestimonial(id: string): Observable<ApiResponse<{ _id: string; featured: boolean }>> {
    return this.http.patch<ApiResponse<{ _id: string; featured: boolean }>>(
      `${this.apiUrl}/${id}/feature`,
      {}
    );
  }

  // Toggle active status
  toggleTestimonialStatus(id: string): Observable<ApiResponse<{ _id: string; isActive: boolean }>> {
    return this.http.patch<ApiResponse<{ _id: string; isActive: boolean }>>(
      `${this.apiUrl}/${id}/toggle`,
      {}
    );
  }

  // Get testimonial statistics
  getTestimonialStats(): Observable<ApiResponse<TestimonialStats>> {
    return this.http.get<ApiResponse<TestimonialStats>>(`${this.apiUrl}/stats`);
  }
}
