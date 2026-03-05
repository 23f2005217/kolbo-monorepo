"use client";

import * as React from "react";
import { Search, Check, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVideos } from "@/hooks/use-videos";
import { cn } from "@/utils";

interface VideoSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (videos: any[]) => void;
  selectedIds: string[];
}

export function VideoSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  selectedIds,
}: VideoSelectorDialogProps) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { videos, loading } = useVideos({ search: debouncedSearch, pageSize: 20 });
  const [localSelectedMap, setLocalSelectedMap] = React.useState<Record<string, any>>({});

  // Initialize map from parents data if needed, but the current flow in page.tsx 
  // might be better served by just returning what was checked in the dialog.
  // Actually, let's just keep track of what's checked in this session.
  
  const toggleVideo = (video: any) => {
    setLocalSelectedMap(prev => {
      const newMap = { ...prev };
      if (newMap[video.id]) {
        delete newMap[video.id];
      } else {
        newMap[video.id] = video;
      }
      return newMap;
    });
  };

  const isSelected = (id: string) => !!localSelectedMap[id] || selectedIds.includes(id);

  const handleConfirm = () => {
    onSelect(Object.values(localSelectedMap));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add Videos to Playlist</DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search videos by title..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 min-w-0 p-6">
          <div className="h-full pr-4 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No videos found.</div>
            ) : (
              <div className="grid gap-2">
                {videos.map((video: any) => {
                  const selected = isSelected(video.id);
                  return (
                    <div 
                      key={video.id} 
                      className={cn(
                        "flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                        selected && "border-blue-500 bg-blue-50/50"
                      )}
                      onClick={() => toggleVideo(video)}
                    >
                      <div className="h-10 w-16 rounded bg-muted overflow-hidden flex-shrink-0">
                        {video.thumbnailUrl && <img src={video.thumbnailUrl} className="w-full h-full object-cover" />}
                        {!video.thumbnailUrl && video.muxThumbnailUrl && <img src={video.muxThumbnailUrl} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{video.title}</h4>
                        <p className="text-xs text-muted-foreground">ID: {video.id.slice(0, 8)}...</p>
                      </div>
                      <div className={cn(
                        "h-5 w-5 rounded-full border flex items-center justify-center",
                        selected ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300"
                      )}>
                        {selected && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t flex justify-between items-center bg-gray-50/50">
          <p className="text-sm text-muted-foreground">{Object.keys(localSelectedMap).length} videos selected to add</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">Add Selected</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
