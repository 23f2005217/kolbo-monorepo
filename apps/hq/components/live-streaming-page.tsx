"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Radio, 
  Video, 
  MoreHorizontal, 
  Clock, 
  Plus,
  Settings,
  Users,
  Search,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { DataContainer } from "@/components/data/data-container";
import { useLiveStreams, type LiveStream, useDeleteLiveStream } from "@/hooks/use-live-streams";
import { cn } from "@/utils";
import { CreateStreamDialog } from "./live-streaming/create-stream-dialog";
import { Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function LiveStreamingPage() {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>("desc");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [idsToDelete, setIdsToDelete] = React.useState<string[]>([]);
  
  const deferredSearch = React.useDeferredValue(search);
  
  const { liveStreams, loading, error, refetch } = useLiveStreams({
    search: deferredSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
    sortBy,
    sortOrder,
  });
  const { deleteLiveStream, deleteLiveStreams } = useDeleteLiveStream();

  const handleEdit = (id: string) => {
    router.push(`/content/live/${id}`);
  };

  const handleDelete = (id: string) => {
    setIdsToDelete([id]);
    setDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setIdsToDelete(selectedIds);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (idsToDelete.length === 1) {
      await deleteLiveStream(idsToDelete[0]);
    } else {
      await deleteLiveStreams(idsToDelete);
    }
    
    setSelectedIds(prev => prev.filter(id => !idsToDelete.includes(id)));
    setIdsToDelete([]);
    setDeleteConfirmOpen(false);
    refetch();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === liveStreams.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(liveStreams.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a1c21]">Live Streaming</h1>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-10 bg-white border-gray-200 rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="px-3 py-2 rounded-lg flex items-center gap-2 mr-2"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-sm font-medium border-gray-200 text-gray-600 bg-white capitalize">
                {statusFilter === "all" ? "All Statuses" : statusFilter}
                <Filter className="ml-2 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("published")}>Published</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("scheduled")}>Scheduled</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("unpublished")}>Unpublished</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("archived")}>Archived</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-sm font-medium border-gray-200 text-gray-600 bg-white px-3">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort By
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => { setSortBy("createdAt"); setSortOrder("desc"); }}>Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("createdAt"); setSortOrder("asc"); }}>Oldest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("title"); setSortOrder("asc"); }}>Title (A-Z)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("title"); setSortOrder("desc"); }}>Title (Z-A)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("scheduledStartAt"); setSortOrder("desc"); }}>Date (Latest)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("scheduledStartAt"); setSortOrder("asc"); }}>Date (Earliest)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <DataContainer
            loading={loading}
            error={error}
            empty={liveStreams.length === 0}
            emptyMessage="No live streams yet. Create your first stream!"
          >
            <Table>
              <TableHeader className="bg-[#f9fafb]">
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="w-[50px] pl-6 py-4">
                    <Checkbox 
                      className="rounded" 
                      checked={liveStreams.length > 0 && selectedIds.length === liveStreams.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 py-4">Live Streams</TableHead>
                  <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 py-4">Preregistered</TableHead>
                  <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 py-4">Stream Date</TableHead>
                  <TableHead className="text-right pr-6 py-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveStreams.map((stream: LiveStream) => {
                  const isLive = stream.status === "published" && stream.scheduledStartAt && new Date(stream.scheduledStartAt) <= new Date();
                  
                  return (
                    <TableRow key={stream.id} className="border-b border-gray-50 hover:bg-gray-50/50 group transition-colors">
                      <TableCell className="pl-6 py-5">
                        <Checkbox 
                          className="rounded border-gray-300" 
                          checked={selectedIds.includes(stream.id)}
                          onCheckedChange={() => toggleSelect(stream.id)}
                        />
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-20 rounded bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                            <Video className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => handleEdit(stream.id)}>
                            {stream.title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-bold border-none",
                            stream.status === "published" ? "bg-green-100 text-green-700" : 
                            stream.status === "scheduled" ? "bg-blue-100 text-blue-700" : 
                            "bg-gray-100 text-gray-600"
                          )}
                        >
                          {stream.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5">
                        <span className="text-sm font-medium text-blue-600">
                          {Math.floor(Math.random() * 1000)}
                        </span>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-600">
                            {stream.scheduledStartAt
                              ? new Date(stream.scheduledStartAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : "---"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {stream.scheduledStartAt
                              ? new Date(stream.scheduledStartAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                              : ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-5">
                        <div className="flex items-center justify-end gap-4">
                          <Button variant="link" className="text-xs font-bold text-gray-600 hover:text-blue-600 px-0">
                            Attendees
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => handleEdit(stream.id)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Edit Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(stream.id)}>
                                Delete Stream
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DataContainer>
        </CardContent>
      </Card>

      <CreateStreamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {idsToDelete.length === 1 ? "this live stream" : `${idsToDelete.length} live streams`} and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIdsToDelete([])}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
