import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  MediaUploadResponse,
  MediaBatchUploadResponse,
  MediaFilesListResponse,
  SignedUrlResponse,
  MediaStatistics
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/media`;

  // Upload a single image
  uploadImage(file: File, folder?: string): Observable<ApiResponse<MediaUploadResponse>> {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) formData.append('folder', folder);
    
    return this.http.post<ApiResponse<MediaUploadResponse>>(`${this.apiUrl}/images`, formData);
  }

  // Upload multiple images
  uploadImages(files: File[], folder?: string, maxCount?: number): Observable<ApiResponse<MediaBatchUploadResponse>> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    if (folder) formData.append('folder', folder);
    if (maxCount) formData.append('maxCount', maxCount.toString());
    
    return this.http.post<ApiResponse<MediaBatchUploadResponse>>(`${this.apiUrl}/images/batch`, formData);
  }

  // Upload mixed files (images, videos, documents)
  uploadFiles(files: File[]): Observable<ApiResponse<MediaBatchUploadResponse>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    return this.http.post<ApiResponse<MediaBatchUploadResponse>>(`${this.apiUrl}/files`, formData);
  }

  // List all media files
  getMediaFiles(folder?: string, prefix?: string): Observable<ApiResponse<MediaFilesListResponse>> {
    let httpParams = new HttpParams();
    if (folder) httpParams = httpParams.set('folder', folder);
    if (prefix) httpParams = httpParams.set('prefix', prefix);
    
    return this.http.get<ApiResponse<MediaFilesListResponse>>(`${this.apiUrl}/files`, { params: httpParams });
  }

  // Get signed URL for a file
  getSignedUrl(key: string, expiresIn?: number): Observable<ApiResponse<SignedUrlResponse>> {
    let httpParams = new HttpParams();
    if (expiresIn) httpParams = httpParams.set('expiresIn', expiresIn.toString());
    
    return this.http.get<ApiResponse<SignedUrlResponse>>(`${this.apiUrl}/files/${key}/signed-url`, { params: httpParams });
  }

  // Delete a media file
  deleteFile(key: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/files/${key}`);
  }

  // Get media storage statistics
  getStatistics(): Observable<ApiResponse<MediaStatistics>> {
    return this.http.get<ApiResponse<MediaStatistics>>(`${this.apiUrl}/statistics`);
  }
}
