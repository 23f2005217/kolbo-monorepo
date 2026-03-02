'use client';

import type { AdminRole } from './session';

export interface AdminProfile {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
}