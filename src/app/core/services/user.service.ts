import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, User, UsersResponse, UsersParams } from '../models';
import { SettingsService } from './settings.service';

/**
 * @deprecated Use SettingsService for user management operations
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private settingsService = inject(SettingsService);

  // Delegate to SettingsService
  getUsers(params?: UsersParams): Observable<ApiResponse<UsersResponse>> {
    return this.settingsService.getUsers(params);
  }

  getUser(id: string): Observable<ApiResponse<User>> {
    return this.settingsService.getUser(id);
  }

  createUser(userData: Partial<User>): Observable<ApiResponse<User>> {
    return this.settingsService.updateUser('new', userData); // Backend should handle 'new' or this is a POST
  }

  updateUser(id: string, userData: Partial<User>): Observable<ApiResponse<User>> {
    return this.settingsService.updateUser(id, userData);
  }

  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.settingsService.deleteUser(id);
  }

  toggleUserStatus(id: string): Observable<ApiResponse<{ _id: string; isActive: boolean }>> {
    return this.settingsService.toggleUserStatus(id);
  }
}
