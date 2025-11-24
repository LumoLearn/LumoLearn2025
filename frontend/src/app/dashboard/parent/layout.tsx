'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { USER_ROLES } from '@/lib/constants/roles';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.PARENT]}>
      <DashboardLayout title="Parent Dashboard">{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
