'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  BookOpen,
  Brain,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Users,
} from 'lucide-react';

import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/lib/services/auth.service';
import { getThemeVariantClass } from '@/lib/themes';
import type { UserRole } from '@/lib/constants/roles';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function getNavItems(role: UserRole | undefined): NavItem[] {
  if (role === 'teacher') {
    return [
      { href: '/dashboard/teacher', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/teacher/lessons', label: 'Lekcije', icon: BookOpen },
    ];
  }
  if (role === 'student') {
    return [
      { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/student/lessons', label: 'Lekcije', icon: BookOpen },
      { href: '/dashboard/student/quizzes', label: 'Kvizovi', icon: Brain },
      { href: '/dashboard/student/settings', label: 'Podešavanja', icon: Settings },
    ];
  }
  if (role === 'parent') {
    return [
      { href: '/dashboard/parent', label: 'Dashboard', icon: LayoutDashboard },
    ];
  }
  return [];
}

function getRoleIcon(role: UserRole | undefined) {
  if (role === 'teacher') return GraduationCap;
  if (role === 'student') return BookOpen;
  if (role === 'parent') return Users;
  return User;
}

function getRoleLabel(role: UserRole | undefined): string {
  if (role === 'teacher') return 'Nastavnik';
  if (role === 'student') return 'Učenik';
  if (role === 'parent') return 'Roditelj';
  return 'Profil';
}

function getInitials(email: string | undefined): string {
  if (!email) return '?';
  const local = email.split('@')[0];
  return local.slice(0, 2).toUpperCase();
}

interface SidebarLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function SidebarLayout({ children, title }: SidebarLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  const role = user?.role as UserRole | undefined;
  const navItems = getNavItems(role);
  const RoleIcon = getRoleIcon(role);
  const themeVariantClass = getThemeVariantClass(role);

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === `/dashboard/${role}`) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className={themeVariantClass}>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-1 py-0.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <RoleIcon className="size-4" />
              </div>
              <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold">LumoLearn</span>
                <span className="truncate text-xs text-muted-foreground">
                  {getRoleLabel(role)}
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigacija</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.href)}
                          tooltip={item.label}
                        >
                          <Link href={item.href}>
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="size-8 rounded-md">
                        <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xs font-semibold">
                          {getInitials(user?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user?.email ?? 'Korisnik'}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {getRoleLabel(role)}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56"
                    side="right"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="truncate font-normal">
                      {user?.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Odjavi se
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {title && (
              <h1 className="text-sm font-medium text-foreground">{title}</h1>
            )}
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="Odjavi se"
              >
                <LogOut className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
