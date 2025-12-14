import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  PortfolioSettings,
  AdminProfile,
  User,
  UsersResponse,
  UsersParams,
  ChangePasswordRequest
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/settings`;

  // ==================== Portfolio Settings ====================
  
  // Get portfolio settings
  getPortfolioSettings(): Observable<ApiResponse<PortfolioSettings>> {
    return this.http.get<ApiResponse<PortfolioSettings>>(`${this.apiUrl}/portfolio`);
  }

  // Update portfolio settings (can update partially)
  updatePortfolioSettings(settings: Partial<PortfolioSettings>): Observable<ApiResponse<PortfolioSettings>> {
    return this.http.put<ApiResponse<PortfolioSettings>>(`${this.apiUrl}/portfolio`, settings);
  }

  // ==================== Admin Profile ====================
  
  // Get admin profile
  getProfile(): Observable<ApiResponse<AdminProfile>> {
    return this.http.get<ApiResponse<AdminProfile>>(`${this.apiUrl}/profile`);
  }

  // Update admin profile
  updateProfile(profile: Partial<AdminProfile>): Observable<ApiResponse<AdminProfile>> {
    return this.http.put<ApiResponse<AdminProfile>>(`${this.apiUrl}/profile`, profile);
  }

  // Change admin password
  changePassword(passwordData: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/profile/password`, passwordData);
  }

  // ==================== User Management ====================
  
  // Get all users
  getUsers(params?: UsersParams): Observable<ApiResponse<UsersResponse>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    
    return this.http.get<ApiResponse<UsersResponse>>(`${this.apiUrl}/users`, { params: httpParams });
  }

  // Get single user details
  getUser(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${id}`);
  }

  // Update user
  updateUser(id: string, userData: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/${id}`, userData);
  }

  // Delete user
  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/users/${id}`);
  }

  // Toggle user active status
  toggleUserStatus(id: string): Observable<ApiResponse<{ _id: string; isActive: boolean }>> {
    return this.http.patch<ApiResponse<{ _id: string; isActive: boolean }>>(
      `${this.apiUrl}/users/${id}/toggle`,
      {}
    );
  }
}
