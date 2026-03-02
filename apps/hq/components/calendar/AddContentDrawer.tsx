"use client";

import * as React from "react";
import { X, Search, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useVideos } from "@/hooks/use-videos";
import { useLiveStreams } from "@/hooks/use-live-streams";
import { cn } from "@/utils";

interface AddContentDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (selectedItems: any[], scheduledAt: string) => void;
}

export function AddContentDrawer({ open, onClose, onSave }: AddContentDrawerProps) {
  const [search, setSearch] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = React.useState("12:00");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [tab, setTab] = React.useState<"video" | "live">("video");

  const { videos, loading: loadingVideos } = useVideos({ search: tab === "video" ? search : "" });
  const { liveStreams, loading: loadingLive } = useLiveStreams({ search: tab === "live" ? search : "" });

  const items = tab === "video" ? videos : liveStreams;
  const loading = tab === "video" ? loadingVideos : loadingLive;

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handleSave = () => {
    const selectedItems = items.filter((i) => selectedIds.includes(i.id));
    onSave(selectedItems, `${selectedDate}T${selectedTime}:00`);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-40 transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">Select content</h2>
          </div>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex border-b">
            <button
              onClick={() => { setTab("video"); setSelectedIds([]); }}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                tab === "video" ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Videos
            </button>
            <button
              onClick={() => { setTab("live"); setSelectedIds([]); }}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                tab === "live" ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Live Streams
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <button 
                onClick={handleSelectAll}
                className="text-xs font-bold text-blue-600 hover:underline uppercase"
              >
                {selectedIds.length === items.length ? "DESELECT ALL" : "SELECT ALL"}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer",
                      selectedIds.includes(item.id) && "bg-blue-50/50"
                    )}
                    onClick={() => handleToggle(item.id)}
                  >
                    <Checkbox 
                      checked={selectedIds.includes(item.id)} 
                      onCheckedChange={() => handleToggle(item.id)}
                    />
                    <span className="text-sm">{item.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground">
              Displaying 1 - {items.length} of {items.length} in total
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled className="h-8 text-xs">Prev</Button>
              <Button variant="outline" size="sm" disabled className="h-8 text-xs">Next</Button>
            </div>
          </div>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
            disabled={selectedIds.length === 0}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </>
  );
}
