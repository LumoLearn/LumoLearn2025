'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { lessonsApi } from '@/lib/api/lessons';

interface DashboardStats {
  totalLessons: number;
  publishedLessons: number;
  unpublishedLessons: number;
  totalQuizzes: number;
  totalStudents: number;
}

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalLessons: 0,
    publishedLessons: 0,
    unpublishedLessons: 0,
    totalQuizzes: 0,
    totalStudents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Fetch all lessons
        const allLessonsResponse = await lessonsApi.getLessons();
        const totalLessons = allLessonsResponse.lessons?.length || 0;

        // Fetch published lessons
        const publishedResponse = await lessonsApi.getLessons({ isPublished: true });
        const publishedLessons = publishedResponse.lessons?.length || 0;

        // Calculate unpublished
        const unpublishedLessons = totalLessons - publishedLessons;

        setStats({
          totalLessons,
          publishedLessons,
          unpublishedLessons,
          totalQuizzes: 0, // TODO: Implement when quiz API is ready
          totalStudents: 0, // TODO: Implement when student API is ready
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, Teacher!
          </h2>
          <p className="text-muted-foreground">
            Manage your lessons and track student progress.
          </p>
        </div>
        <Link href="/dashboard/teacher/lessons/upload">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Lesson
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <p className="text-2xl font-bold">{stats.totalLessons}</p>
                <p className="text-xs text-muted-foreground">Lessons created</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Published</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <p className="text-2xl font-bold">{stats.publishedLessons}</p>
                <p className="text-xs text-muted-foreground">Active lessons</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
            <p className="text-xs text-muted-foreground">Total quizzes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent activity to display.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
