// Login Credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Change Password Request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
