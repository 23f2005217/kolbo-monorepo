"use client";

import * as React from "react";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/shell";
import { usePlaylists, useDeletePlaylist, type Playlist } from "@/hooks/use-playlists";
import { formatDate, cn } from "@/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { DataContainer } from "@/components/data/data-container";

export default function PlaylistsPageRoute() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");
  const { playlists, loading, error, refetch } = usePlaylists();
  const { deletePlaylist } = useDeletePlaylist();

  const handleEdit = (id: string) => {
    router.push(`/playlists/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      await deletePlaylist(id);
      refetch();
    }
  };

  const handleCreatePlaylist = () => {
    router.push("/playlists/new");
  };

  const filteredPlaylists = React.useMemo(() => {
    return playlists
      .filter((playlist) => {
        const matchesSearch = playlist.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || playlist.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "position") return (a.position || 0) - (b.position || 0);
        return 0;
      });
  }, [playlists, search, statusFilter, sortBy]);

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Playlists</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-[300px] rounded-md border border-input bg-background pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="outline" className="h-10">Status</Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent>
                   <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setStatusFilter("published")}>Published</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setStatusFilter("unpublished")}>Unpublished</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setStatusFilter("archived")}>Archived</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>

               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="outline" className="h-10">Sort</Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent>
                   <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest first</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest first</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setSortBy("title")}>Title A-Z</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setSortBy("position")}>Position</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="grid grid-cols-[40px_80px_1fr_150px_200px_40px] items-center px-4 py-3 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Checkbox className="h-4 w-4" />
            <div className="px-2 text-center">Position</div>
            <div className="px-2">Playlists</div>
            <div className="px-2 text-center">Status</div>
            <div className="px-2">Created</div>
            <div></div>
          </div>

          <DataContainer
            loading={loading}
            error={error}
            empty={filteredPlaylists.length === 0 && !loading}
            emptyMessage={search ? "No playlists match your search" : "No playlists yet. Create your first playlist!"}
            onRetry={refetch}
          >
            <div className="mt-2 p-2 divide-y">
              {filteredPlaylists.map((playlist, index) => (
                <div
                  key={playlist.id}
                  className="grid grid-cols-[40px_80px_1fr_150px_200px_40px] items-center px-4 py-4 hover:bg-muted/50 transition-colors group rounded-md cursor-pointer"
                  onClick={() => handleEdit(playlist.id)}
                >
                  <Checkbox className="h-4 w-4" onClick={(e) => e.stopPropagation()} />
                  <div className="text-sm text-center font-medium">
                    {playlist.position || index + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-20 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center text-[10px] text-white font-bold leading-tight uppercase p-1 text-center">
                      {playlist.thumbnailUrl ? (
                        <img src={playlist.thumbnailUrl} className="h-full w-full object-cover rounded" />
                      ) : (
                        <>
                          <div className="w-full h-8 flex items-center justify-center bg-blue-600 rounded mb-1">
                            PLAY ALL
                          </div>
                          <div className="truncate w-full px-1">{playlist.title}</div>
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">{playlist.title}</h3>
                    </div>
                  </div>
                  <div className="flex justify-center px-2">
                    <Badge 
                      className={cn(
                        "text-[10px] font-bold uppercase py-0.5 px-2",
                        playlist.status === 'published' ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"
                      )}
                      variant="outline"
                    >
                      {playlist.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground px-2">
                    {formatDate(new Date(playlist.createdAt))}
                  </div>
                  <div className="flex justify-end pr-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleEdit(playlist.id)}>Edit collection</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(playlist.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </DataContainer>
        </div>

        <div className="fixed bottom-8 right-8">
          <Button size="lg" className="rounded-full shadow-lg" onClick={handleCreatePlaylist}>
            <Plus className="h-5 w-5 mr-1" />
            Create Playlist
          </Button>
        </div>
      </div>
    </Shell>
  );
}
