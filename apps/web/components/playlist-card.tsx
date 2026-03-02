"use client";

import { MoreVertical, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";

export interface PlaylistData {
  id: string;
  name: string;
  videoCount: number;
  thumbnail?: string;
  description?: string;
  createdAt: string;
}

interface PlaylistCardProps {
  playlist: PlaylistData;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PlaylistCard({ playlist, onEdit, onDelete }: PlaylistCardProps) {
  return (
    <Card className="border-border/60 bg-white overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-muted">
        {playlist.thumbnail ? (
          <img
            src={playlist.thumbnail}
            alt={playlist.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-background">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(playlist.id)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(playlist.id)}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{playlist.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {playlist.videoCount} videos
        </p>
        {playlist.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {playlist.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          Created {playlist.createdAt}
        </p>
      </CardContent>
    </Card>
  );
}
