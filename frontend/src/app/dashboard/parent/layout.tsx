'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <DashboardLayout title="Parent Dashboard">{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
