import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  DashboardData, 
  AnalyticsData,
  AnalyticsParams,
  VisitorsResponse,
  LegacyStats,
  SystemLog,
  LogsParams,
  PaginatedResponse,
  PaginationParams,
  DateRangeParams
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Get dashboard overview with stats, recent activity, and popular content
  getDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(`${this.apiUrl}/dashboard`);
  }

  // Get detailed analytics data
  getAnalytics(params?: AnalyticsParams): Observable<ApiResponse<AnalyticsData>> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params?.period) httpParams = httpParams.set('period', params.period);
    
    return this.http.get<ApiResponse<AnalyticsData>>(`${this.apiUrl}/analytics`, { params: httpParams });
  }

  // Get visitor insights and demographics
  getVisitors(params?: PaginationParams & DateRangeParams): Observable<ApiResponse<VisitorsResponse>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    
    return this.http.get<ApiResponse<VisitorsResponse>>(`${this.apiUrl}/visitors`, { params: httpParams });
  }

  // Get legacy statistics (backward compatibility)
  getLegacyStats(): Observable<ApiResponse<LegacyStats>> {
    return this.http.get<ApiResponse<LegacyStats>>(`${this.apiUrl}/stats`);
  }

  // Get system logs (Super Admin only)
  getLogs(params?: LogsParams): Observable<PaginatedResponse<{ logs: SystemLog[] }>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.level) httpParams = httpParams.set('level', params.level);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    
    return this.http.get<PaginatedResponse<{ logs: SystemLog[] }>>(`${this.apiUrl}/logs`, { params: httpParams });
  }
}
