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
import { DollarSign, PlayCircle, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const watchTimeData = [
  { day: "1", minutes: 920 },
  { day: "2", minutes: 1040 },
  { day: "3", minutes: 980 },
  { day: "4", minutes: 1120 },
  { day: "5", minutes: 1260 },
  { day: "6", minutes: 1180 },
  { day: "7", minutes: 1320 },
  { day: "8", minutes: 1250 },
  { day: "9", minutes: 1380 },
  { day: "10", minutes: 1440 },
  { day: "11", minutes: 1360 },
  { day: "12", minutes: 1510 },
  { day: "13", minutes: 1580 },
  { day: "14", minutes: 1490 },
  { day: "15", minutes: 1620 },
  { day: "16", minutes: 1700 },
  { day: "17", minutes: 1660 },
  { day: "18", minutes: 1740 },
  { day: "19", minutes: 1680 },
  { day: "20", minutes: 1820 },
  { day: "21", minutes: 1900 },
  { day: "22", minutes: 1850 },
  { day: "23", minutes: 1980 },
  { day: "24", minutes: 2050 },
  { day: "25", minutes: 1990 },
  { day: "26", minutes: 2120 },
  { day: "27", minutes: 2210 },
  { day: "28", minutes: 2140 },
  { day: "29", minutes: 2280 },
  { day: "30", minutes: 2360 },
];

const mostViewed = [
  { rank: 1, title: "The 20-Min Creator Workflow", views: "342,240" },
  { rank: 2, title: "Editing Faster With Templates", views: "281,903" },
  { rank: 3, title: "Lighting Tricks for Small Studios", views: "214,590" },
  { rank: 4, title: "Audio Fixes in 10 Minutes", views: "173,820" },
  { rank: 5, title: "Reels That Actually Convert", views: "119,813" },
];

export function Last30DayPerformance() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-white">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardDescription>Gross Revenue</CardDescription>
              <CardTitle className="mt-2 text-2xl">$200,349.68 USD</CardTitle>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-white">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Button variant="link" size="sm" className="h-auto p-0 text-sm">
              View more
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardDescription>Sign Ups</CardDescription>
              <CardTitle className="mt-2 text-2xl">467</CardTitle>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-white">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-border/60 bg-white">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardDescription>Video Views</CardDescription>
              <CardTitle className="mt-2 text-2xl">1,032,366</CardTitle>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-white">
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="border-border/60 bg-white">
          <CardHeader>
            <CardTitle>Area Chart</CardTitle>
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
      </div>
    </div>
  );
}
