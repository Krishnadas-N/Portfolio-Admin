import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  Skill, 
  SkillStats, 
  SearchParams,
  PaginatedResult
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/content/skills`;

  // Get all skills
  getSkills(params?: SearchParams & { category?: string; isActive?: boolean }): Observable<PaginatedResult<Skill[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
    
    return this.http.get<PaginatedResult<Skill[]>>(this.apiUrl, { params: httpParams });
  }

  // Get single skill by ID
  getSkill(id: string): Observable<ApiResponse<Skill>> {
    return this.http.get<ApiResponse<Skill>>(`${this.apiUrl}/${id}`);
  }

  // Create new skill
  createSkill(skill: Partial<Skill>): Observable<ApiResponse<Skill>> {
    return this.http.post<ApiResponse<Skill>>(this.apiUrl, skill);
  }

  // Update skill
  updateSkill(id: string, skill: Partial<Skill>): Observable<ApiResponse<Skill>> {
    return this.http.put<ApiResponse<Skill>>(`${this.apiUrl}/${id}`, skill);
  }

  // Delete skill
  deleteSkill(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Toggle skill active status
  toggleSkill(id: string): Observable<ApiResponse<{ _id: string; isActive: boolean }>> {
    return this.http.patch<ApiResponse<{ _id: string; isActive: boolean }>>(
      `${this.apiUrl}/${id}/toggle`, 
      {}
    );
  }

  // Get skill statistics
  getSkillStats(): Observable<ApiResponse<SkillStats>> {
    return this.http.get<ApiResponse<SkillStats>>(`${this.apiUrl}/stats`);
  }
}
