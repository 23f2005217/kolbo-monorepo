'use client';

import { Shell } from "@/components/shell";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { LayoutDashboard, Megaphone, Users, Video, BarChart3, Target } from "lucide-react";
import Link from "next/link";

const modules = [
  { label: 'Campaigns', href: '/ads/campaigns', icon: Megaphone, description: 'Manage active and upcoming ad campaigns.' },
  { label: 'Accounts', href: '/ads/accounts', icon: Users, description: 'Manage advertiser and vendor accounts.' },
  { label: 'Content', href: '/ads/content', icon: Video, description: 'Review and manage uploaded ad creatives.' },
  { label: 'Audience', href: '/ads/audience', icon: Target, description: 'Define and analyze audience segments.' },
  { label: 'Analytics', href: '/ads/analytics', icon: BarChart3, description: 'Analyze platform-wide ad performance.' },
];

export default function AdServerOverviewPage() {
  return (
    <AdminAuthGuard requiredRoles={['super_admin', 'admin', 'ad_manager']}>
      <Shell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ad Server Overview</h1>
              <p className="text-sm text-gray-500 mt-1">
                Central control panel for all advertising operations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module: any) => {
              const Icon = module.icon;
              return (
                <Link key={module.label} href={module.href}>
                  <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full group">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                      <Icon className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">{module.label}</h3>
                    <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">{module.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Shell>
    </AdminAuthGuard>
  );
}
