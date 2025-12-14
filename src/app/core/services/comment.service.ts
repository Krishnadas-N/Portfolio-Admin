import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  Comment,
  CommentsResponse,
  CommentsParams
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/comments`;

  // Get all comments with filtering
  getComments(params?: CommentsParams): Observable<ApiResponse<CommentsResponse>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.postType) httpParams = httpParams.set('postType', params.postType);
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params?.order) httpParams = httpParams.set('order', params.order);
    
    return this.http.get<ApiResponse<CommentsResponse>>(this.apiUrl, { params: httpParams });
  }

  // Update comment status
  updateCommentStatus(
    id: string, 
    status: 'pending' | 'approved' | 'rejected' | 'spam'
  ): Observable<ApiResponse<{ _id: string; status: string; approvedAt?: string }>> {
    return this.http.patch<ApiResponse<{ _id: string; status: string; approvedAt?: string }>>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }

  // Delete a comment
  deleteComment(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
