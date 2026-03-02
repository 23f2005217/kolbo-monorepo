"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ChartData {
  day: string;
  minutes: number;
}

interface WatchTimeChartProps {
  data: ChartData[];
  title?: string;
  description?: string;
}

export function WatchTimeChart({ 
  data, 
  title = "Watch Time",
  description = "Watch Time over the last 30 days" 
}: WatchTimeChartProps) {
  return (
    <div className="h-70">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 8, right: 8 }}>
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
    </div>
  );
}
