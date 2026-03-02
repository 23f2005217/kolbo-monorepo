"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCreatePlaylist } from "@/hooks/use-playlists";
import { Shell } from "@/components/shell";

export default function NewPlaylistPage() {
  const router = useRouter();
  const { createPlaylist, loading } = useCreatePlaylist();
  const createdRef = React.useRef(false);

  React.useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;

    const createInitial = async () => {
      try {
        const newPlaylist = await createPlaylist({
          title: "Untitled Collection",
          status: "unpublished",
        });
        if (newPlaylist?.id) {
          router.replace(`/content/playlists/${newPlaylist.id}`);
        }
      } catch (error) {
        console.error("Failed to create playlist:", error);
      }
    };

    createInitial();
  }, []);

  return (
    <Shell>
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-muted-foreground">Creating your new collection...</p>
      </div>
    </Shell>
  );
}
