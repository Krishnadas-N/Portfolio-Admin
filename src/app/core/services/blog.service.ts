import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  Blog, 
  BlogStats, 
  SearchParams,
  PaginatedResult
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/content/blogs`;

  // Get all blogs with optional filters
  getBlogs(params?: SearchParams & { category?: string; published?: boolean }): Observable<PaginatedResult<Blog[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.published !== undefined) httpParams = httpParams.set('published', params.published.toString());
    
    return this.http.get<PaginatedResult<Blog[]>>(this.apiUrl, { params: httpParams });
  }

  // Get single blog by ID
  getBlog(id: string): Observable<ApiResponse<Blog>> {
    return this.http.get<ApiResponse<Blog>>(`${this.apiUrl}/${id}`);
  }

  // Create new blog
  createBlog(blog: Partial<Blog>): Observable<ApiResponse<Blog>> {
    return this.http.post<ApiResponse<Blog>>(this.apiUrl, blog);
  }

  // Update blog
  updateBlog(id: string, blog: Partial<Blog>): Observable<ApiResponse<Blog>> {
    return this.http.put<ApiResponse<Blog>>(`${this.apiUrl}/${id}`, blog);
  }

  // Delete blog
  deleteBlog(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Publish/Unpublish blog
  publishBlog(id: string): Observable<ApiResponse<{ _id: string; published: boolean; publishedAt: string }>> {
    return this.http.patch<ApiResponse<{ _id: string; published: boolean; publishedAt: string }>>(
      `${this.apiUrl}/${id}/publish`, 
      {}
    );
  }

  // Get blog statistics
  getBlogStats(): Observable<ApiResponse<BlogStats>> {
    return this.http.get<ApiResponse<BlogStats>>(`${this.apiUrl}/stats`);
  }
}
