'use client';

import * as React from "react";
import { Shell } from "@/components/shell";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Users, 
  Target, 
  LayoutGrid, 
  Globe, 
  DollarSign, 
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useDataFetch } from "@/hooks/use-data-fetch";
import { Badge } from "@/components/ui/badge";

interface InventoryItem {
  id: string;
  subsite: {
    name: string;
    slug: string;
  };
  isAvailable: boolean;
  cpmCents: number;
}

export default function AdServerAudiencePage() {
  const { data: inventory, loading } = useDataFetch<InventoryItem[]>({
    url: "/api/ads/inventory", // I'll need to create this API
  });

  return (
    <AdminAuthGuard requiredRoles={['super_admin', 'admin', 'ad_manager']}>
      <Shell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ad Inventory & Audience</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage ad placements and pricing across the network.
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Placement
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(3)].map((_: any, i: any) => (
                <div key={i} className="bg-white p-6 rounded-xl border shadow-sm animate-pulse h-40" />
              ))
            ) : inventory?.map((item: any) => (
              <div key={item.id} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <Badge className={item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {item.isAvailable ? 'Available' : 'Paused'}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{item.subsite.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">/{item.subsite.slug}</p>
                </div>
                <div className="pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-600 font-bold">
                    <DollarSign className="h-4 w-4" />
                    <span>${(item.cpmCents / 100).toFixed(2)} <span className="text-[10px] text-gray-400 font-medium">CPM</span></span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-50">
                    Edit Rates
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-dashed p-12 text-center bg-white shadow-sm mt-8">
             <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-blue-600" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">Custom Audience Segments</h3>
             <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto font-medium leading-relaxed">
               Advanced demographic and interest-based segmentation is currently being calculated from platform viewership data.
             </p>
             <Button variant="outline" className="mt-6 border-gray-200 text-gray-600">
               Configure Segments
             </Button>
          </div>
        </div>
      </Shell>
    </AdminAuthGuard>
  );
}
