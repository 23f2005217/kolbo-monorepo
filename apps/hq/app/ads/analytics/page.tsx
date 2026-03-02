'use client';

import * as React from "react";
import { Shell } from "@/components/shell";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Eye, 
  MousePointer2, 
  ArrowRightLeft, 
  Users, 
  Megaphone, 
  Search, 
  ChevronDown, 
  MoreVertical, 
  Play,
  Download,
  Loader2,
  AlertCircle,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAdAnalytics, AdPerformanceRow } from "@/hooks/use-ad-analytics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const iconMap: Record<string, any> = {
  'Total Spend': DollarSign,
  'Impressions': Eye,
  'Clicks': MousePointer2,
  'Conversions': ArrowRightLeft,
  'Reach': Users,
  'Active Campaigns': Megaphone,
};

export default function AdServerAnalyticsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const { analytics, loading, error } = useAdAnalytics({
    search: searchQuery,
    status: statusFilter || undefined,
  });

  const filteredPerformance = analytics?.performance || [];

  return (
    <AdminAuthGuard requiredRoles={['super_admin', 'admin', 'ad_manager']}>
      <Shell>
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ad Campaign Analytics</h1>
            <p className="text-sm text-gray-500">Performance metrics for all video ad campaigns</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_: any, i: any) => (
                <div key={i} className="bg-white p-5 rounded-xl border shadow-sm animate-pulse h-28" />
              ))}
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {analytics.metrics.map((metric: any) => {
                const Icon = iconMap[metric.label] || BarChart3;
                return (
                  <div key={metric.label} className="bg-white p-5 rounded-xl border shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="text-[11px] font-semibold uppercase tracking-wider">{metric.label}</span>
                      <Icon className="h-4 w-4 opacity-70" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xl font-bold text-gray-900">{metric.value}</div>
                      <div className="text-[10px] text-gray-500 font-medium">{metric.subtext}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-900">Campaign Performance</h2>
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search campaigns..." 
                    className="pl-9 h-10 border-gray-200" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 border-gray-200 text-gray-700 flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'All Status'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter("")}>All Status</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("paused")}>Paused</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" className="h-10 border-gray-200 text-gray-700 flex items-center gap-2">
                  Export
                  <Download className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Campaign</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Duration</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Days Ran</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Impressions</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Clicks</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">CTR</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Spend</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">CPM</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">CPC</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Conversions</th>
                    <th className="w-10 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="py-20 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                        <p className="text-gray-500 mt-2">Loading performance data...</p>
                      </td>
                    </tr>
                  ) : filteredPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-20 text-center text-gray-500">
                        <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="font-bold text-gray-900">No performance data found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPerformance.map((row: any) => (
                      <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-5 px-6">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-gray-900 leading-tight">{row.name}</span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium capitalize">
                              <Play className="h-2.5 w-2.5 fill-gray-400" /> {row.subtitle}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <Badge variant="secondary" className={`text-[10px] font-bold py-0.5 px-2 rounded-full border-none ${
                            row.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                            row.status === 'Active' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {row.status}
                          </Badge>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex flex-col text-[11px] font-medium text-gray-900">
                            {row.duration.includes(' to ') ? (
                              <>
                                <span>{row.duration.split(' to ')[0]}</span>
                                <span className="text-gray-400">to {row.duration.split(' to ')[1]}</span>
                              </>
                            ) : (
                              <span>{row.duration}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-4 text-gray-500 font-medium text-center">
                          {row.daysRan}
                        </td>
                        <td className="py-5 px-4 text-gray-900 font-bold">{row.impressions}</td>
                        <td className="py-5 px-4 text-gray-900 font-medium">{row.clicks}</td>
                        <td className="py-5 px-4 text-gray-900 font-medium">{row.ctr}</td>
                        <td className="py-5 px-4 text-gray-900 font-bold">{row.spend}</td>
                        <td className="py-5 px-4 text-gray-500 font-medium">{row.cpm}</td>
                        <td className="py-5 px-4 text-gray-500 font-medium">{row.cpc}</td>
                        <td className="py-5 px-4">
                          <div className="flex flex-col leading-tight">
                            <span className="font-bold text-gray-900">{row.conversions}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{row.convRate}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Shell>
    </AdminAuthGuard>
  );
}

import { BarChart3 } from "lucide-react";
