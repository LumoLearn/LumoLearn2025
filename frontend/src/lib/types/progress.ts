export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
}

export interface PerformanceDistribution {
  excellent: number; // 90-100%
  good: number;      // 70-89%
  average: number;   // 50-69%
  needsWork: number; // 0-49%
}

export type PerformanceTrend = 'improving' | 'declining' | 'stable' | 'insufficient_data';

export interface StudentProgress {
  studentId: string;
  totalAttempts: number;
  averageScore: number;
  totalQuizzes: number; // Unique quizzes taken
  recentAttempts: QuizAttempt[];
  performanceDistribution: PerformanceDistribution;
  bestPerformance: QuizAttempt | null;
  worstPerformance: QuizAttempt | null;
  trend: PerformanceTrend;
  completionRate: number; // Percentage
}

export interface ProgressResponse {
  success: boolean;
  progress: StudentProgress;
}
