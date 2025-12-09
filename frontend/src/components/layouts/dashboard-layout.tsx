'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/services/auth.service';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    router.push('/login');
  };

  // Get dashboard home path based on role
  const dashboardHome = user?.role ? `/dashboard/${user.role}` : '/';

  // Check if current path is active
  const isActive = (path: string) => pathname === path;

  // Get role-specific navigation links
  const getRoleNavLinks = () => {
    if (user?.role === 'teacher') {
      return [
        { href: '/dashboard/teacher', label: 'Dashboard' },
        { href: '/dashboard/teacher/lessons', label: 'Lessons' },
        { href: '/dashboard/profile', label: 'Profile' },
      ];
    }
    if (user?.role === 'student') {
      return [
        { href: '/dashboard/student', label: 'Dashboard' },
        { href: '/dashboard/student/lessons', label: 'Lessons' },
        { href: '/dashboard/student/quizzes', label: 'Quizzes' },
        { href: '/dashboard/student/settings', label: 'Settings' },
        { href: '/dashboard/profile', label: 'Profile' },
      ];
    }
    if (user?.role === 'parent') {
      return [
        { href: '/dashboard/parent', label: 'Dashboard' },
        { href: '/dashboard/profile', label: 'Profile' },
      ];
    }
    return [
      { href: dashboardHome, label: 'Dashboard' },
      { href: '/dashboard/profile', label: 'Profile' },
    ];
  };

  const navLinks = getRoleNavLinks();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">LumoLearn</h1>
              <span className="text-sm text-muted-foreground">| {title}</span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive(link.href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {user?.role}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">{children}</main>
    </div>
  );
}
