import { apiClient } from './client';
import type { AccessibilitySettings } from '@/lib/types/accessibility';

interface StudentSettingsResponse {
  success: boolean;
  settings: AccessibilitySettings;
}

export const studentService = {
  /**
   * Get accessibility settings for a student
   * @param studentId - The student's ID
   * @returns The student's accessibility settings
   */
  async getAccessibilitySettings(studentId: string): Promise<AccessibilitySettings> {
    try {
      const response = await apiClient.get<StudentSettingsResponse>(
        `/api/students/${studentId}/settings`
      );
      return response.data.settings;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch accessibility settings'
      );
    }
  },

  /**
   * Update accessibility settings for a student
   * @param studentId - The student's ID
   * @param settings - The new accessibility settings
   * @returns The updated accessibility settings
   */
  async updateAccessibilitySettings(
    studentId: string,
    settings: AccessibilitySettings
  ): Promise<AccessibilitySettings> {
    try {
      const response = await apiClient.put<StudentSettingsResponse>(
        `/api/students/${studentId}/settings`,
        settings
      );
      return response.data.settings;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Failed to update accessibility settings'
      );
    }
  },
};
