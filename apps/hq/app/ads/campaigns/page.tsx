'use client';

import * as React from "react";
import { Shell } from "@/components/shell";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Trash2, 
  Loader2, 
  AlertCircle,
  MoreVertical,
  Megaphone,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAdCampaigns, AdCampaign } from "@/hooks/use-ad-campaigns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdServerCampaignsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const { campaigns, loading, deleteCampaigns, refetch, updateCampaign } = useAdCampaigns({
    search: searchQuery,
    status: statusFilter || undefined,
  });
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [idsToDelete, setIdsToDelete] = React.useState<string[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const filteredCampaigns = campaigns;

  const handleToggleStatus = async (campaign: AdCampaign) => {
    try {
      const newStatus = campaign.status.toLowerCase() === 'paused' ? 'active' : 'paused';
      await updateCampaign(campaign.id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCampaigns.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCampaigns.map((c: any) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteClick = (ids: string[]) => {
    setIdsToDelete(ids);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCampaigns(idsToDelete);
      setSelectedIds(new Set());
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setIsDeleting(false);
      setIdsToDelete([]);
    }
  };

  const statusStyles = {
    active: 'bg-green-100 text-green-700 hover:bg-green-100',
    paused: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    draft: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
    scheduled: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    completed: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  };

  return (
    <AdminAuthGuard requiredRoles={['super_admin', 'admin', 'ad_manager']}>
      <Shell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Campaigns</h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor and manage all advertising campaigns.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeleteClick(Array.from(selectedIds))}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedIds.size})
                </Button>
              )}
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search campaigns..." 
                  className="pl-9 h-10 border-gray-200 bg-white" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-gray-600">
                      <Filter className="h-4 w-4" />
                      {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'All Status'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter("")}>All Status</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("paused")}>Paused</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("draft")}>Draft</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("scheduled")}>Scheduled</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="w-12 py-3.5 px-6">
                      <Checkbox 
                        checked={filteredCampaigns.length > 0 && selectedIds.size === filteredCampaigns.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="text-left py-3.5 px-6 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">Campaign Name</th>
                    <th className="text-left py-3.5 px-6 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                    <th className="text-left py-3.5 px-6 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">Impressions</th>
                    <th className="text-left py-3.5 px-6 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">Clicks</th>
                    <th className="text-left py-3.5 px-6 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">Budget</th>
                    <th className="text-right py-3.5 px-6 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <p className="font-medium">Loading campaigns...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Megaphone className="h-10 w-10 text-gray-300" />
                          <p className="font-bold text-gray-900">No campaigns found</p>
                          <p className="text-sm">Try adjusting your search query or filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((campaign: any) => (
                      <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-5 px-6">
                          <Checkbox 
                            checked={selectedIds.has(campaign.id)}
                            onCheckedChange={() => toggleSelect(campaign.id)}
                          />
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{campaign.name}</span>
                            <span className="text-[11px] text-gray-400 font-medium">{campaign.advertiserName}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <Badge className={statusStyles[campaign.status.toLowerCase() as keyof typeof statusStyles] || 'bg-gray-100 text-gray-700'}>
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="py-5 px-6 text-gray-600 font-medium">{campaign.impressions}</td>
                        <td className="py-5 px-6 text-gray-600 font-medium">{campaign.clicks}</td>
                        <td className="py-5 px-6 text-gray-900 font-bold">{campaign.budget}</td>
                        <td className="py-5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                              Edit
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer">View Analytics</DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => handleToggleStatus(campaign)}
                                >
                                  {campaign.status.toLowerCase() === 'paused' ? 'Resume Campaign' : 'Pause Campaign'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive cursor-pointer"
                                  onClick={() => handleDeleteClick([campaign.id])}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Campaign
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {idsToDelete.length === 1 ? "this campaign" : `${idsToDelete.length} campaigns`} and all associated analytics data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} onClick={() => setIdsToDelete([])}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete} 
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Shell>
    </AdminAuthGuard>
  );
}
