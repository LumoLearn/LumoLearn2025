'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { USER_ROLES } from '@/lib/constants/roles';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]}>
      <DashboardLayout title="Student Dashboard">{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
