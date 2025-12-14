import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  DashboardData,
  DashboardStats,
  AnalyticsData,
  VisitorsResponse,
  PortfolioSettings,
  MediaFile,
  MediaStatistics,
  User,
  UsersResponse
} from '../models';

/**
 * @deprecated This service is kept for backward compatibility.
 * Use specific services instead:
 * - DashboardService for dashboard & analytics
 * - SettingsService for settings & user management
 * - MediaService for media operations
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Dashboard - Returns flattened data for backward compatibility
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardData>>(`${this.apiUrl}/dashboard`).pipe(
      map(response => {
        if (response.success && response.data) {
          // Flatten the structure for backward compatibility
          const flattened: DashboardStats = {
            ...response.data.overview,
            recentProjects: response.data.recent?.projects || [],
            recentBlogs: response.data.recent?.blogs || [],
            recentContacts: response.data.recent?.contacts || [],
            totalUsers: 0
          };
          return { ...response, data: flattened };
        }
        return response as any;
      })
    );
  }

  // Analytics
  getAnalytics(startDate?: string, endDate?: string, period: string = 'day'): Observable<ApiResponse<AnalyticsData>> {
    let params = new HttpParams().set('period', period);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ApiResponse<AnalyticsData>>(`${this.apiUrl}/analytics`, { params });
  }

  getVisitorStats(): Observable<ApiResponse<VisitorsResponse>> {
    return this.http.get<ApiResponse<VisitorsResponse>>(`${this.apiUrl}/visitors`);
  }

  // Settings
  getSettings(): Observable<ApiResponse<PortfolioSettings>> {
    return this.http.get<ApiResponse<PortfolioSettings>>(`${this.apiUrl}/settings/portfolio`);
  }

  updateSettings(settings: Partial<PortfolioSettings>): Observable<ApiResponse<PortfolioSettings>> {
    return this.http.put<ApiResponse<PortfolioSettings>>(`${this.apiUrl}/settings/portfolio`, settings);
  }

  // Users
  getUsers(page: number = 1, limit: number = 10, search: string = ''): Observable<ApiResponse<UsersResponse>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<UsersResponse>>(`${this.apiUrl}/settings/users`, { params });
  }

  getUser(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/settings/users/${id}`);
  }

  updateUser(id: string, data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/settings/users/${id}`, data);
  }

  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/settings/users/${id}`);
  }

  // Media
  getMediaFiles(page: number = 1, limit: number = 20, type?: string): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (type) params = params.set('type', type);
    return this.http.get<any>(`${this.apiUrl}/media/files`, { params });
  }

  uploadImage(file: File, folder?: string): Observable<ApiResponse<MediaFile>> {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) formData.append('folder', folder);
    return this.http.post<ApiResponse<MediaFile>>(`${this.apiUrl}/media/images`, formData);
  }

  deleteMediaFile(key: string): Observable<ApiResponse<void>> {
    const encodedKey = encodeURIComponent(key);
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/media/files/${encodedKey}`);
  }

  getMediaStats(): Observable<ApiResponse<MediaStatistics>> {
    return this.http.get<ApiResponse<MediaStatistics>>(`${this.apiUrl}/media/statistics`);
  }
}
