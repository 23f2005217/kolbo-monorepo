import { Shell } from "@/components/shell";
import { DashboardStats } from "@/components/dashboard-stats";

export default function OverviewPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Welcome to your dashboard. Here's what's happening with your content.
          </p>
        </div>

        <DashboardStats />
      </div>
    </Shell>
  );
}
