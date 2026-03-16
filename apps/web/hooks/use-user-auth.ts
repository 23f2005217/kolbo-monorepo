'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  hasSubscriptions?: boolean;
}

export function useUserAuth() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/auth/session');
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
      } else {
        setUserProfile(null);
      }
    } catch {
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setUserProfile(data.user);
    router.push('/');
    return data.user;
  };

  const signup = async (email: string, password: string, name?: string, dateOfBirth?: string, country?: string) => {
    const res = await fetch('/api/user/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, dateOfBirth, country }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    if (data.user && !data.message?.includes('check your email')) {
      setUserProfile(data.user);
      if (!data.user.hasSubscriptions) {
        router.push('/signup?step=2');
      } else {
        router.push('/');
      }
    }

    return data;
  };

  const logout = async () => {
    await fetch('/api/user/auth/logout', { method: 'POST' });
    setUserProfile(null);
    router.push('/login');
  };

  return {
    userProfile,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!userProfile,
    checkSession,
  };
}

