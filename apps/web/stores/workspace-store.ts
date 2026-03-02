"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Workspace {
  id: string;
  name: string;
  type: 'workspace' | 'organization';
  logo?: string;
  href: string;
}

interface WorkspaceStore {
  currentWorkspace: Workspace;
  availableWorkspaces: Workspace[];
  setCurrentWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => void;
}

const defaultWorkspaces: Workspace[] = [
  { id: '1', name: 'KolBo HQ', type: 'workspace', href: '/hq' },
  { id: '2', name: 'Channels', type: 'workspace', href: '/hq' }, // Placeholder, maps to HQ for now
  { id: '3', name: 'Customers', type: 'workspace', href: '/hq' }, // Placeholder
  { id: '4', name: 'AdServer', type: 'workspace', href: '/hq/ads' },
];

const defaultWorkspace = defaultWorkspaces[0]; // KolBo HQ as default

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      currentWorkspace: defaultWorkspace,
      availableWorkspaces: defaultWorkspaces,
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      addWorkspace: (workspace) => set((state) => ({
        availableWorkspaces: [...state.availableWorkspaces, workspace]
      })),
    }),
    {
      name: 'workspace-storage-v2',
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        availableWorkspaces: state.availableWorkspaces,
      }),
    }
  )
);