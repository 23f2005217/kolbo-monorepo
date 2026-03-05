'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminProfile } from '@kolbo/auth';

export function useAdminAuth() {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setAdminProfile(data.user);
      } else {
        setAdminProfile(null);
      }
    } catch {
      setAdminProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setAdminProfile(data.user);
    router.push('/');
    return data.user.role;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAdminProfile(null);
    router.push('/login');
  };

  return {
    adminProfile,
    loading,
    login,
    logout,
    isAuthenticated: !!adminProfile,
    hasRole: (roles: string[]) => {
      if (!adminProfile) return false;
      return roles.includes(adminProfile.role);
    },
  };
}