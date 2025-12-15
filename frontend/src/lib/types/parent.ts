export interface Child {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  accessibilitySettings?: {
    font_family: string;
    font_size: number;
    line_spacing: number;
    letter_spacing: number;
    text_color: string;
    background_color: string;
  };
}

export interface ChildrenResponse {
  children: Child[];
}

export interface LinkStudentRequest {
  studentId: string;
}

export interface LinkStudentResponse {
  success: boolean;
  message: string;
}
