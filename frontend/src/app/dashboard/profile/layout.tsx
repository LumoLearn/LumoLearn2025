'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { USER_ROLES } from '@/lib/constants/roles';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.PARENT]}>
      {children}
    </ProtectedRoute>
  );
}
