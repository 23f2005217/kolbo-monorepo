"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Radio, Video, Users, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { DataContainer } from "@/components/data/data-container";
import { ActionMenu } from "@/components/data/action-menu";
import { useLiveStreams, useDeleteLiveStream, type LiveStream } from "@/hooks/use-live-streams";
import { formatDistanceToNow } from "@/utils";

const statusConfig = {
  live: { label: "LIVE", color: "bg-red-500 text-white" },
  scheduled: { label: "SCHEDULED", color: "bg-blue-500/10 text-blue-700" },
  ended: { label: "ENDED", color: "bg-gray-500/10 text-gray-700" },
};

function StreamCard({ stream, onEdit, onDelete }: { 
  stream: LiveStream; 
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const isLive = stream.status === "published" && stream.scheduledStartAt && new Date(stream.scheduledStartAt) <= new Date();
  const isScheduled = stream.status === "scheduled" || (stream.status === "published" && stream.scheduledStartAt && new Date(stream.scheduledStartAt) > new Date());
  
  return (
    <div className="flex items-center gap-4 p-4 border border-border/60 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="relative h-20 w-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
        <Video className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold">{stream.title}</h4>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {stream.scheduledStartAt 
                  ? formatDistanceToNow(new Date(stream.scheduledStartAt))
                  : "Not scheduled"
                }
              </span>
            </div>
          </div>
          <Badge className={isLive ? statusConfig.live.color : isScheduled ? statusConfig.scheduled.color : statusConfig.ended.color}>
            {isLive ? statusConfig.live.label : isScheduled ? statusConfig.scheduled.label : statusConfig.ended.label}
          </Badge>
        </div>
        {isLive && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 text-red-600">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="font-medium">Live now</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ActionMenu
          itemId={stream.id}
          itemName={stream.title}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="border-border/60 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LivePage() {
  const { liveStreams, loading, error, refetch } = useLiveStreams();
  const { deleteLiveStream } = useDeleteLiveStream();

  const handleEdit = (id: string) => {
    console.log("Edit stream:", id);
  };

  const handleDelete = async (id: string) => {
    await deleteLiveStream(id);
    refetch();
  };

  const now = new Date();
  const liveCount = liveStreams.filter(s => s.status === "published" && s.scheduledStartAt && new Date(s.scheduledStartAt) <= now).length;
  const scheduledCount = liveStreams.filter(s => s.status === "scheduled" || (s.status === "published" && s.scheduledStartAt && new Date(s.scheduledStartAt) > now)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live!"
        description="Manage your live broadcasts"
        actions={
          <Button>
            <Radio className="h-4 w-4 mr-2" />
            Go Live Now
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Now Streaming"
          value={liveCount}
          icon={Radio}
          color="bg-red-500/10 animate-pulse"
        />
        <StatCard
          title="Scheduled"
          value={scheduledCount}
          icon={Users}
          color="bg-blue-500/10"
        />
        <StatCard
          title="Total Streams"
          value={liveStreams.length}
          icon={Clock}
          color="bg-purple-500/10"
        />
        <StatCard
          title="Active"
          value={liveStreams.filter(s => s.status === "published").length}
          icon={TrendingUp}
          color="bg-green-500/10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DataContainer
            loading={loading}
            error={error}
            empty={liveStreams.length === 0 && !loading}
            emptyMessage="No live streams yet. Create your first stream!"
            onRetry={refetch}
          >
            <Card className="border-border/60 bg-white">
              <CardHeader>
                <CardTitle>Live Streams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liveStreams.map((stream) => (
                    <StreamCard
                      key={stream.id}
                      stream={stream}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </DataContainer>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {liveStreams
                  .filter((s) => s.status === "scheduled" || (s.scheduledStartAt && new Date(s.scheduledStartAt) > now))
                  .slice(0, 5)
                  .map((stream) => (
                    <div
                      key={stream.id}
                      className="p-3 border border-border/60 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <h4 className="font-medium text-sm">{stream.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stream.scheduledStartAt 
                          ? new Date(stream.scheduledStartAt).toLocaleString()
                          : "Not scheduled"
                        }
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Radio className="h-4 w-4 mr-2" />
                Start New Stream
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Video className="h-4 w-4 mr-2" />
                Manage Equipment
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
