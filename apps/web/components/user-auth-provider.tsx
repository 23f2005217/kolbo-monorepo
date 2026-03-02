'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUserAuth as useUserAuthHook } from '@/hooks/use-user-auth';

const UserAuthContext = createContext<ReturnType<typeof useUserAuthHook> | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const auth = useUserAuthHook();

  return (
    <UserAuthContext.Provider value={auth}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuthContext() {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuthContext must be used within a UserAuthProvider');
  }
  return context;
}
