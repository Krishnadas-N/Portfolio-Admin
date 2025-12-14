import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  Certification, 
  CertificationStats, 
  SearchParams,
  PaginatedResult
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CertificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/content/certifications`;

  // Get all certifications
  getCertifications(params?: SearchParams & { isActive?: boolean }): Observable<PaginatedResult<Certification[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
    
    return this.http.get<PaginatedResult<Certification[]>>(this.apiUrl, { params: httpParams });
  }

  // Get single certification by ID
  getCertification(id: string): Observable<ApiResponse<Certification>> {
    return this.http.get<ApiResponse<Certification>>(`${this.apiUrl}/${id}`);
  }

  // Create new certification
  createCertification(certification: Partial<Certification>): Observable<ApiResponse<Certification>> {
    return this.http.post<ApiResponse<Certification>>(this.apiUrl, certification);
  }

  // Update certification
  updateCertification(id: string, certification: Partial<Certification>): Observable<ApiResponse<Certification>> {
    return this.http.put<ApiResponse<Certification>>(`${this.apiUrl}/${id}`, certification);
  }

  // Delete certification
  deleteCertification(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Toggle certification active status
  toggleCertification(id: string): Observable<ApiResponse<{ _id: string; isActive: boolean }>> {
    return this.http.patch<ApiResponse<{ _id: string; isActive: boolean }>>(
      `${this.apiUrl}/${id}/toggle`, 
      {}
    );
  }

  // Get certification statistics
  getCertificationStats(): Observable<ApiResponse<CertificationStats>> {
    return this.http.get<ApiResponse<CertificationStats>>(`${this.apiUrl}/stats`);
  }
}
