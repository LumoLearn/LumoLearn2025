import { apiClient } from './client';
import type {
  UserProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '@/lib/types/user';

/**
 * User API Service
 * Handles user profile operations
 */
export const userService = {
  /**
   * Get current user's profile
   * GET /api/users/profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>('/api/users/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch profile. Please try again.'
      );
    }
  },

  /**
   * Update current user's profile
   * PUT /api/users/profile
   *
   * @param data - Profile data to update (firstName, lastName)
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      const response = await apiClient.put<UpdateProfileResponse>(
        '/api/users/profile',
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Failed to update profile. Please try again.'
      );
    }
  },
};
