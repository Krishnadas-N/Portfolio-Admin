import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  Education, 
  EducationStats, 
  SearchParams,
  PaginatedResult
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class EducationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/content/education`;

  // Get all education entries
  getEducation(params?: SearchParams): Observable<PaginatedResult<Education[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    
    return this.http.get<PaginatedResult<Education[]>>(this.apiUrl, { params: httpParams });
  }

  // Get single education entry by ID
  getEducationById(id: string): Observable<ApiResponse<Education>> {
    return this.http.get<ApiResponse<Education>>(`${this.apiUrl}/${id}`);
  }

  // Create new education entry
  createEducation(education: Partial<Education>): Observable<ApiResponse<Education>> {
    return this.http.post<ApiResponse<Education>>(this.apiUrl, education);
  }

  // Update education entry
  updateEducation(id: string, education: Partial<Education>): Observable<ApiResponse<Education>> {
    return this.http.put<ApiResponse<Education>>(`${this.apiUrl}/${id}`, education);
  }

  // Delete education entry
  deleteEducation(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Get education statistics
  getEducationStats(): Observable<ApiResponse<EducationStats>> {
    return this.http.get<ApiResponse<EducationStats>>(`${this.apiUrl}/stats`);
  }
}
