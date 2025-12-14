import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  Experience, 
  ExperienceStats, 
  SearchParams,
  PaginatedResult
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/content/experiences`;

  // Get all experiences
  getExperiences(params?: SearchParams): Observable<PaginatedResult<Experience[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    
    return this.http.get<PaginatedResult<Experience[]>>(this.apiUrl, { params: httpParams });
  }

  // Get single experience by ID
  getExperience(id: string): Observable<ApiResponse<Experience>> {
    return this.http.get<ApiResponse<Experience>>(`${this.apiUrl}/${id}`);
  }

  // Create new experience
  createExperience(experience: Partial<Experience>): Observable<ApiResponse<Experience>> {
    return this.http.post<ApiResponse<Experience>>(this.apiUrl, experience);
  }

  // Update experience
  updateExperience(id: string, experience: Partial<Experience>): Observable<ApiResponse<Experience>> {
    return this.http.put<ApiResponse<Experience>>(`${this.apiUrl}/${id}`, experience);
  }

  // Delete experience
  deleteExperience(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Get experience statistics
  getExperienceStats(): Observable<ApiResponse<ExperienceStats>> {
    return this.http.get<ApiResponse<ExperienceStats>>(`${this.apiUrl}/stats`);
  }
}
