'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthContext } from '@/components/admin-auth-provider';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function AdminAuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const { isAuthenticated, loading, adminProfile } = useAdminAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRoles && adminProfile) {
      if (!requiredRoles.includes(adminProfile.role)) {
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, adminProfile, requiredRoles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}