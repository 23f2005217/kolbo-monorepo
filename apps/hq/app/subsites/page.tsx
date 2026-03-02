"use client";

import { Shell } from "@/components/shell";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import SubsitesManagementPage from "@/components/subsites-management-page";

export default function HQSubsitesPage() {
  return (
    <AdminAuthGuard requiredRoles={["super_admin", "admin"]}>
      <Shell>
        <SubsitesManagementPage />
      </Shell>
    </AdminAuthGuard>
  );
}
