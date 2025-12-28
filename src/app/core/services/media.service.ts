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
  uploadMixedBundle(bundle: { images?: File[], videos?: File[], documents?: File[] }, folder?: string): Observable<ApiResponse<any>> {
    const formData = new FormData();
    if (bundle.images) bundle.images.forEach(f => formData.append('images', f));
    if (bundle.videos) bundle.videos.forEach(f => formData.append('videos', f));
    if (bundle.documents) bundle.documents.forEach(f => formData.append('documents', f));

    if (folder) formData.append('folder', folder);

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/files`, formData);
  }

  // List all media files (Paginated)
  getMediaFiles(page: number = 1, limit: number = 20, prefix?: string): Observable<ApiResponse<MediaFilesListResponse>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (prefix) params = params.set('prefix', prefix);

    return this.http.get<ApiResponse<MediaFilesListResponse>>(`${this.apiUrl}/files`, { params });
  }

  // Get signed URL for a file
  getSignedUrl(key: string, expiresIn?: number): Observable<ApiResponse<SignedUrlResponse>> {
    let httpParams = new HttpParams();
    if (expiresIn) httpParams = httpParams.set('expiresIn', expiresIn.toString());

    return this.http.get<ApiResponse<SignedUrlResponse>>(`${this.apiUrl}/files/${key}/signed-url`, { params: httpParams });
  }

  // Delete a media file
  deleteMediaFile(key: string): Observable<ApiResponse<void>> {
    // Determine if we need to encode or if API handles it. Usually safer to encode if key contains slashes.
    // However, looking at previous deleteMediaFile implementations, they sometimes encoded.
    const encodedKey = encodeURIComponent(key);
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/files/${encodedKey}`);
  }

  // Get media storage statistics
  getMediaStats(): Observable<ApiResponse<MediaStatistics>> {
    return this.http.get<ApiResponse<MediaStatistics>>(`${this.apiUrl}/statistics`);
  }
}
