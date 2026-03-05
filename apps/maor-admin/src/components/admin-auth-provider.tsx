'use client';

import { createContext, useContext } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';

const AdminAuthContext = createContext<ReturnType<typeof useAdminAuth> | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAdminAuth();

  return (
    <AdminAuthContext.Provider value={auth}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuthContext() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuthContext must be used within an AdminAuthProvider');
  }
  return context;
}