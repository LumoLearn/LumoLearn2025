import { apiClient } from './client';
import type { Child, ChildrenResponse, LinkStudentRequest, LinkStudentResponse } from '../types/parent';
import type { StudentProgress } from '../types/progress';

/**
 * Get all children linked to the current parent
 */
export const getChildren = async (): Promise<Child[]> => {
  try {
    const response = await apiClient.get<ChildrenResponse>('/api/parents/children');
    return response.data.children;
  } catch (error: any) {
    console.error('Failed to fetch children:', error);
    throw new Error(error.response?.data?.error || 'Failed to load children');
  }
};

/**
 * Link a student to the current parent
 */
export const linkStudent = async (studentId: string): Promise<LinkStudentResponse> => {
  try {
    const response = await apiClient.post<LinkStudentResponse>(
      '/api/parents/link-student',
      { studentId } as LinkStudentRequest
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to link student:', error);
    throw new Error(error.response?.data?.error || 'Failed to link student');
  }
};

/**
 * Get progress data for a specific student
 * Parents can only access their linked children's progress
 */
export const getStudentProgress = async (studentId: string): Promise<StudentProgress> => {
  try {
    const response = await apiClient.get(`/api/students/${studentId}/progress`);
    const data = response.data;

    // Map backend response to frontend expected format
    const recentAttempts = (data.recentAttempts || []).map((attempt: any) => ({
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quizTitle,
      score: attempt.score || 0,
      totalQuestions: attempt.totalQuestions || 10, // Default to 10 if not provided
      percentage: attempt.score || 0,
      submittedAt: attempt.submittedAt
    }));

    const performanceDistribution = {
      excellent: data.statistics?.scoreDistribution?.excellent || 0,
      good: data.statistics?.scoreDistribution?.good || 0,
      average: data.statistics?.scoreDistribution?.average || 0,
      needsWork: data.statistics?.scoreDistribution?.needsWork || 0
    };

    const bestPerformance = data.statistics?.bestPerformance ? {
      id: '',
      quizId: '',
      quizTitle: data.statistics.bestPerformance.quizTitle,
      score: data.statistics.bestPerformance.score || 0,
      totalQuestions: 10,
      percentage: data.statistics.bestPerformance.score || 0,
      submittedAt: data.statistics.bestPerformance.date
    } : null;

    const worstPerformance = data.statistics?.worstPerformance ? {
      id: '',
      quizId: '',
      quizTitle: data.statistics.worstPerformance.quizTitle,
      score: data.statistics.worstPerformance.score || 0,
      totalQuestions: 10,
      percentage: data.statistics.worstPerformance.score || 0,
      submittedAt: data.statistics.worstPerformance.date
    } : null;

    const progress: StudentProgress = {
      studentId: data.studentId,
      totalAttempts: data.totalAttempts || 0,
      averageScore: data.averageScore || 0,
      totalQuizzes: data.totalQuizzesTaken || 0,
      recentAttempts,
      performanceDistribution,
      bestPerformance,
      worstPerformance,
      trend: data.statistics?.trend || 'insufficient_data',
      completionRate: data.completionRate || 0
    };

    return progress;
  } catch (error: any) {
    console.error('Failed to fetch student progress:', error);
    throw new Error(error.response?.data?.error || 'Failed to load student progress');
  }
};

const parentService = {
  getChildren,
  linkStudent,
  getStudentProgress,
};

export default parentService;
