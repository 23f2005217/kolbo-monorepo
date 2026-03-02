'use client';

import * as React from "react";
import { Shell } from "@/components/shell";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Play, 
  MoreVertical, 
  Search, 
  ChevronDown, 
  ListFilter,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAdCreatives, AdCreative } from "@/hooks/use-ad-creatives";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function AdServerContentPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  
  const { creatives, loading, deleteCreatives, refetch } = useAdCreatives({
    search: searchQuery,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy,
    sortOrder,
  });
  
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [idsToDelete, setIdsToDelete] = React.useState<string[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const filteredCreatives = creatives;

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCreatives.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCreatives.map((c: any) => c.id)));
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
      await deleteCreatives(idsToDelete);
      setSelectedIds(new Set());
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setIsDeleting(false);
      setIdsToDelete([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'published':
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] font-bold py-0.5 px-2 tracking-wider uppercase border-none flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5" /> Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-[10px] font-bold py-0.5 px-2 tracking-wider uppercase border-none flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[10px] font-bold py-0.5 px-2 tracking-wider uppercase border-none flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5" /> Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 text-[10px] font-bold py-0.5 px-2 tracking-wider uppercase border-none">{status}</Badge>;
    }
  };

  return (
    <AdminAuthGuard requiredRoles={['super_admin', 'admin', 'ad_manager']}>
      <Shell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ad Content</h1>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2">
                    More actions
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => refetch()} className="cursor-pointer">Refresh List</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive cursor-pointer"
                    disabled={selectedIds.size === 0}
                    onClick={() => handleDeleteClick(Array.from(selectedIds))}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload videos
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search ad creatives..." 
                  className="pl-9 h-10 border-gray-200 bg-white" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 border-gray-200 bg-white text-gray-700 flex items-center gap-2 px-4">
                      Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("approved")}>Approved</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>Rejected</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 border-gray-200 bg-white text-gray-700 flex items-center gap-2 px-4">
                      Sort: {sortBy === 'createdAt' && sortOrder === 'desc' ? 'Newest' : sortBy === 'createdAt' && sortOrder === 'asc' ? 'Oldest' : 'Name'}
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSortBy("createdAt"); setSortOrder("desc"); }}>Newest first</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy("createdAt"); setSortOrder("asc"); }}>Oldest first</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy("name"); setSortOrder("asc"); }}>Name (A-Z)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="icon" className="h-10 w-10 border-gray-200 bg-white">
                  <ListFilter className="h-4 w-4 text-gray-700" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="w-12 py-3.5 px-6 text-left">
                      <Checkbox 
                        checked={filteredCreatives.length > 0 && selectedIds.size === filteredCreatives.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="text-left py-3.5 px-2 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">AD CREATIVE</th>
                    <th className="text-left py-3.5 px-6 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">ADVERTISER</th>
                    <th className="text-right py-3.5 px-6 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">STATUS</th>
                    <th className="text-right py-3.5 px-6 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">UPLOADED ON</th>
                    <th className="w-24 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <p className="font-medium">Loading ad creatives...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCreatives.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-10 w-10 text-gray-300" />
                          <p className="font-bold text-gray-900">No ad creatives found</p>
                          <p className="text-sm">Try adjusting your search or filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCreatives.map((video: any) => (
                      <tr key={video.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-5 px-6">
                          <Checkbox 
                            checked={selectedIds.has(video.id)}
                            onCheckedChange={() => toggleSelect(video.id)}
                          />
                        </td>
                        <td className="py-5 px-2">
                          <div className="flex items-center gap-4">
                            <div className="w-[60px] h-[34px] rounded bg-gray-900 flex items-center justify-center overflow-hidden border border-gray-100">
                              {video.url ? (
                                <video src={video.url} className="w-full h-full object-cover" />
                              ) : (
                                <Play className="h-4 w-4 text-white/50 fill-white/20" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{video.name}</span>
                              <span className="text-[10px] text-gray-400 font-medium">{video.campaign?.name || 'No campaign'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className="font-medium text-gray-700">{video.advertiser?.companyName || 'Unknown'}</span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="flex justify-end">
                            {getStatusBadge(video.status)}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-right text-gray-500 font-medium">
                          {format(new Date(video.createdAt), 'MMMM d, yyyy')}
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600"
                              onClick={() => video.url && window.open(video.url, '_blank')}
                            >
                              <Play className="h-4 w-4" />
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer">Review / Approve</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">Edit Details</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive cursor-pointer"
                                  onClick={() => handleDeleteClick([video.id])}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
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
                This action cannot be undone. This will permanently delete {idsToDelete.length === 1 ? "this ad creative" : `${idsToDelete.length} ad creatives`} and remove the associated video files.
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
