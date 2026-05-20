import { UserRole } from '../constants/roles';

export interface Profile {
  firstName: string | null;
  lastName: string | null;
}

export interface StudentData {
  id: string;
  accessibilitySettings: {
    font_family: string;
    font_size: number;
    line_spacing: number;
    letter_spacing: number;
    text_color: string;
    background_color: string;
  };
}

export interface TeacherData {
  id: string;
}

export interface ParentData {
  id: string;
  childrenCount: number;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  profile: Profile;
  student?: StudentData;
  teacher?: TeacherData;
  parent?: ParentData;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  profile: Profile;
  error?: string;
}
