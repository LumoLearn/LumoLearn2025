import { apiClient } from '@/lib/api/client';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '@/lib/types/auth';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/api/auth/login',
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Failed to login. Please try again.'
      );
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/api/auth/register',
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error ||
          'Failed to register. Please try again.'
      );
    }
  },

  async logout(): Promise<void> {
    // Clear auth storage (zustand persist storage)
    localStorage.removeItem('auth-storage');
  },
};
