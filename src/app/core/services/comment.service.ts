import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResult, PortfolioComment, CommentStats, CommentQuery, CommentStatus } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  // Using the admin route as specified: baseurl/admin/comments/
  private apiUrl = `${environment.apiUrl}/comments`;

  getComments(params?: CommentQuery): Observable<ApiResponse<{ comments: PortfolioComment[], pagination: any, stats: CommentStats }>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.postType) httpParams = httpParams.set('postType', params.postType);
      if (params.postId) httpParams = httpParams.set('postId', params.postId);
    }

    return this.http.get<ApiResponse<{ comments: PortfolioComment[], pagination: any, stats: CommentStats }>>(this.apiUrl, { params: httpParams });
  }

  updateCommentStatus(id: string, status: CommentStatus): Observable<ApiResponse<PortfolioComment>> {
    return this.http.patch<ApiResponse<PortfolioComment>>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteComment(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
