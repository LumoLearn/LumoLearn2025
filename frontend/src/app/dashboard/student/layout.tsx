'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout title="Student Dashboard">{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
