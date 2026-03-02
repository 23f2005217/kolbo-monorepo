"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { InfoCard } from "@/components/info-card";
import { SimpleChart } from "@/components/simple-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Download, Loader2 } from "lucide-react";
import { DollarSign, Users, TrendingUp, PlayCircle } from "lucide-react";
import { useStats, useVideos } from "@/hooks";

const revenueData = [
  { name: "Mon", value: 2400 },
  { name: "Tue", value: 1398 },
  { name: "Wed", value: 9800 },
  { name: "Thu", value: 3908 },
  { name: "Fri", value: 4800 },
  { name: "Sat", value: 3800 },
  { name: "Sun", value: 4300 },
];

const viewsData = [
  { name: "Week 1", value: 12000 },
  { name: "Week 2", value: 15600 },
  { name: "Week 3", value: 14200 },
  { name: "Week 4", value: 18900 },
];

interface MuxVideoView {
  id: string;
  video_title?: string;
  view_start: string;
  view_end: string;
  watch_time: number;
  viewer_experience_score?: number;
  country_code?: string;
  playback_failure?: boolean;
}

function MuxDataTab({ period }: { period: string }) {
  const [data, setData] = React.useState<{ data?: MuxVideoView[]; total_row_count?: number } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const timeframe = period === "7d" ? "7:days" : period === "90d" ? "90:days" : "30:days";

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/mux/data/video-views?timeframe=${timeframe}&limit=100`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [timeframe]);

  if (loading) {
    return (
      <Card className="border-border/60 bg-white">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card className="border-border/60 bg-white">
        <CardContent className="py-8 text-center text-muted-foreground">
          Could not load Mux Data. Ensure MUX_TOKEN_ID and MUX_TOKEN_SECRET are set.
        </CardContent>
      </Card>
    );
  }
  const views = data?.data ?? [];

  const totalWatchTime = views.reduce((acc, v) => acc + (v.watch_time || 0), 0);
  const totalWatchMinutes = Math.floor(totalWatchTime / 60);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          label="Total Views"
          value={String(data?.total_row_count ?? views.length)}
          change={undefined}
          changeLabel=""
          icon={<PlayCircle className="h-4 w-4" />}
        />
        <StatCard
          label="Total Watch Time"
          value={`${totalWatchMinutes} min`}
          change={undefined}
          changeLabel=""
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>
      <Card className="border-border/60 bg-white">
        <CardHeader>
          <CardTitle>Video Views (Mux Data)</CardTitle>
        </CardHeader>
        <CardContent>
          {views.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No view data for this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>View Start</TableHead>
                  <TableHead>Watch Time (sec)</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {views.slice(0, 50).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.video_title || "(untitled)"}</TableCell>
                    <TableCell>{new Date(v.view_start).toLocaleString()}</TableCell>
                    <TableCell>{v.watch_time ?? 0}</TableCell>
                    <TableCell>{v.country_code ?? "—"}</TableCell>
                    <TableCell>{v.viewer_experience_score != null ? (v.viewer_experience_score * 100).toFixed(0) + "%" : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = React.useState("30d");
  const [activeTab, setActiveTab] = React.useState("overview");
  const { stats, loading: statsLoading } = useStats();
  const { videos, loading: videosLoading } = useVideos();

  const totalDuration = videos.reduce((acc, video) => {
    return acc + (video.assets?.[0]?.durationSeconds || 0);
  }, 0);

  const totalHours = Math.floor(totalDuration / 3600);
  const totalMinutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track your content performance and growth"
        actions={
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {period === "7d" && "Last 7 days"}
              {period === "30d" && "Last 30 days"}
              {period === "90d" && "Last 90 days"}
              <ArrowUpDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setPeriod("7d")}>Last 7 days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPeriod("30d")}>Last 30 days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPeriod("90d")}>Last 90 days</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mux">Mux Data</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Videos"
          value={statsLoading ? "..." : stats?.videos.total.toString() || "0"}
          change={12}
          changeLabel="vs last period"
          icon={<PlayCircle className="h-4 w-4" />}
        />
        <StatCard
          label="Published Videos"
          value={statsLoading ? "..." : stats?.videos.published.toString() || "0"}
          change={8}
          changeLabel="vs last period"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Total Duration"
          value={videosLoading ? "..." : `${totalHours}h ${totalMinutes}m`}
          change={15}
          changeLabel="vs last period"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Total Content"
          value={statsLoading ? "..." : (stats?.videos.total || 0 + (stats?.liveStreams.total || 0)).toString()}
          change={-3}
          changeLabel="vs last period"
          icon={<DollarSign className="h-4 w-4" />}
          positiveIsGood={false}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-white">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <SimpleChart data={revenueData} type="line" />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white">
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <SimpleChart data={viewsData} type="bar" color="#8b5cf6" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {videosLoading ? (
          <Card className="border-border/60 bg-white flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </Card>
        ) : videos[0] ? (
          <InfoCard
            title="Latest Video"
            value={videos[0].title}
            subtitle={videos[0].status}
            badge={{ text: "#1", variant: "secondary" }}
          />
        ) : (
          <InfoCard
            title="Latest Video"
            value="No videos yet"
            subtitle="Upload your first video"
          />
        )}
        
        <InfoCard
          title="Avg. Duration"
          value={videosLoading ? "..." : videos.length > 0 ? `${Math.floor(totalDuration / videos.length / 60)}m` : "0m"}
          subtitle="per video"
        />
        
        <InfoCard
          title="Content Types"
          value={statsLoading ? "..." : `${stats?.videos.total || 0} Videos, ${stats?.liveStreams.total || 0} Streams`}
          subtitle="in your library"
        />
      </div>
        </TabsContent>
        <TabsContent value="mux" className="space-y-6">
          <MuxDataTab period={period} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
