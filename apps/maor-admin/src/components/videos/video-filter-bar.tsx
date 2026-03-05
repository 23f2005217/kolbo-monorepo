import * as React from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVideosStore, SortOption, StatusFilter } from "@/stores/videos-store";

const VideoFilterBar = React.memo(function VideoFilterBar() {
  const searchQuery = useVideosStore((state) => state.searchQuery);
  const setSearchQuery = useVideosStore((state) => state.setSearchQuery);
  const statusFilter = useVideosStore((state) => state.statusFilter);
  const setStatusFilter = useVideosStore((state) => state.setStatusFilter);
  const sortBy = useVideosStore((state) => state.sortBy);
  const setSortBy = useVideosStore((state) => state.setSortBy);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full max-w-sm">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Status
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter("all" as StatusFilter)}>
              <Checkbox checked={statusFilter === "all"} className="mr-2" />
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("published" as StatusFilter)}>
              <Checkbox checked={statusFilter === "published"} className="mr-2" />
              Published
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("draft" as StatusFilter)}>
              <Checkbox checked={statusFilter === "draft"} className="mr-2" />
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("scheduled" as StatusFilter)}>
              <Checkbox checked={statusFilter === "scheduled"} className="mr-2" />
              Scheduled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Sort
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortBy("newest" as SortOption)}>
              <Checkbox checked={sortBy === "newest"} className="mr-2" />
              Newest first
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("oldest" as SortOption)}>
              <Checkbox checked={sortBy === "oldest"} className="mr-2" />
              Oldest first
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("title" as SortOption)}>
              <Checkbox checked={sortBy === "title"} className="mr-2" />
              Title (A-Z)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="icon" className="h-9 w-9">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

export default VideoFilterBar;
