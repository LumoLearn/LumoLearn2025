import { ProtectedRoute } from '@/components/auth/protected-route';

export default function StudentSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      {children}
    </ProtectedRoute>
  );
}
