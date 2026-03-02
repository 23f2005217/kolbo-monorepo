"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Video {
  rank: number;
  title: string;
  views: string;
}

interface MostViewedVideosProps {
  mostViewed: Video[];
}

export function MostViewedVideos({ mostViewed }: MostViewedVideosProps) {
  return (
    <Card className="border-border/60 bg-white">
      <CardHeader>
        <CardTitle>Most Viewed Videos</CardTitle>
        <CardDescription>Top content ranked by views</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[40px_1fr_120px] gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <span>Rank</span>
          <span>Title</span>
          <span className="text-right">Views</span>
        </div>
        <div className="mt-4 space-y-4">
          {mostViewed.map((video) => (
            <div
              key={video.rank}
              className="grid grid-cols-[40px_1fr_120px] items-center gap-2 border-b border-border/60 pb-4 text-sm last:border-b-0 last:pb-0"
            >
              <span className="font-semibold text-foreground">{video.rank}</span>
              <span className="text-foreground">{video.title}</span>
              <span className="text-right font-medium text-foreground">
                {video.views}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
