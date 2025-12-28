import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PortfolioSettings
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Settings
  getSettings(): Observable<ApiResponse<PortfolioSettings>> {
    return this.http.get<ApiResponse<PortfolioSettings>>(`${this.apiUrl}/settings/portfolio`);
  }

  updateSettings(settings: Partial<PortfolioSettings>): Observable<ApiResponse<PortfolioSettings>> {
    return this.http.put<ApiResponse<PortfolioSettings>>(`${this.apiUrl}/settings/portfolio`, settings);
  }

  // Admin Profile
  getProfile(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/settings/profile`);
  }

  updateProfile(profile: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/settings/profile`, profile);
  }

  changePassword(data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/settings/profile/password`, data);
  }

}
