import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  Project, 
  ProjectStats, 
  PaginationParams,
  SearchParams,
  PaginatedResult
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/content/projects`;

  // Get all projects with optional filters
  getProjects(params?: SearchParams): Observable<PaginatedResult<Project[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    
    return this.http.get<PaginatedResult<Project[]>>(this.apiUrl, { params: httpParams });
  }

  // Get single project by ID
  getProject(id: string): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/${id}`);
  }

  // Create new project
  createProject(project: Partial<Project>): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(this.apiUrl, project);
  }

  // Update project
  updateProject(id: string, project: Partial<Project>): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${this.apiUrl}/${id}`, project);
  }

  // Delete project
  deleteProject(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Archive/Unarchive project
  archiveProject(id: string): Observable<ApiResponse<{ _id: string; archived: boolean }>> {
    return this.http.patch<ApiResponse<{ _id: string; archived: boolean }>>(
      `${this.apiUrl}/${id}/archive`, 
      {}
    );
  }

  // Get project statistics
  getProjectStats(): Observable<ApiResponse<ProjectStats>> {
    return this.http.get<ApiResponse<ProjectStats>>(`${this.apiUrl}/stats`);
  }
}
