'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarLayout } from '@/components/layouts/sidebar-layout';
import { USER_ROLES } from '@/lib/constants/roles';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]}>
      <SidebarLayout title="Nastavnik">{children}</SidebarLayout>
    </ProtectedRoute>
  );
}
