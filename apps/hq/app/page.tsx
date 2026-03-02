'use client';

import { Shell } from "@/components/shell";
import { DashboardStats } from "@/components/dashboard-stats";
import { AdminAuthGuard } from "@/components/admin-auth-guard";

export default function HQPage() {
  return (
    <AdminAuthGuard requiredRoles={['super_admin', 'admin']}>
      <Shell>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">KolBo HQ - Master Control</h1>
            <p className="text-muted-foreground">
              Master control panel for managing all channels, content, and platform settings.
            </p>
          </div>

          <DashboardStats />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-2">Content Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage videos, live streams, playlists, and categories across all channels.
              </p>
            </div>
            
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-sm text-muted-foreground">
                Admin users, customer support, and role assignments.
              </p>
            </div>
            
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-2">Platform Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Cross-channel analytics, revenue reports, and performance metrics.
              </p>
            </div>
          </div>
        </div>
      </Shell>
    </AdminAuthGuard>
  );
}