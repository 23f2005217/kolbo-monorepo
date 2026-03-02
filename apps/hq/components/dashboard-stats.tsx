"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign, PlayCircle, Users, TrendingUp, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { MostViewedVideos } from "@/components/most-viewed-videos";
import { useStats, useVideos } from "@/hooks";

// Generate 30 days of dummy watch time data (will be replaced with real data later)
const watchTimeData = Array.from({ length: 30 }, (_, i) => ({
  day: (i + 1).toString(),
  minutes: 900 + Math.floor(Math.random() * 1500),
}));

export function DashboardStats() {
  const { stats, loading: statsLoading } = useStats();
  const { videos, loading: videosLoading } = useVideos();

  const metrics = [
    {
      title: "Total Videos",
      value: statsLoading ? "..." : stats?.videos.total.toString() || "0",
      icon: PlayCircle,
    },
    {
      title: "Published Videos",
      value: statsLoading ? "..." : stats?.videos.published.toString() || "0",
      icon: TrendingUp,
    },
    {
      title: "Live Streams",
      value: statsLoading ? "..." : stats?.liveStreams.total.toString() || "0",
      icon: Users,
    },
    {
      title: "Playlists",
      value: statsLoading ? "..." : stats?.playlists.total.toString() || "0",
      subtitle: "collections",
      icon: DollarSign,
    },
  ];

  // Get most recent videos as "most viewed" (placeholder logic)
  const mostViewed = videosLoading 
    ? [] 
    : videos.slice(0, 5).map((video, index) => ({
        rank: index + 1,
        title: video.title,
        views: video.publishedAt 
          ? new Date(video.publishedAt).toLocaleDateString()
          : "Draft",
      }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="border-border/60 bg-white">
          <CardHeader>
            <CardTitle>Watch Time</CardTitle>
            <CardDescription>Watch Time over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-70 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={watchTimeData} margin={{ left: 8, right: 8 }}>
                <defs>
                  <linearGradient id="watchTimeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                  formatter={(value: number) => [`${value} min`, "Watch Time"]}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="var(--primary)"
                  fill="url(#watchTimeFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {videosLoading ? (
          <Card className="border-border/60 bg-white flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </Card>
        ) : (
          <MostViewedVideos mostViewed={mostViewed} />
        )}
      </div>
    </div>
  );
}
