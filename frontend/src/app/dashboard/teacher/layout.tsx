'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout title="Teacher Dashboard">{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
