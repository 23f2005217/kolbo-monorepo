"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Users,
  DollarSign,
  Percent,
  TrendingUp,
  Clock,
  Plus,
  Download,
  FileText,
} from "lucide-react";
import { cn } from "@/utils";
import { DataContainer } from "@/components/data/data-container";
import { useArtists, useRevShareAgreements } from "@/hooks/use-revshare";

interface Artist {
  id: string;
  name: string;
  email: string;
  bio: string;
  subscription_split: number;
  is_active: boolean;
  created_at: string;
  agreement_count: string;
}

interface RevShareAgreement {
  id: string;
  artist_id: string;
  artist_name: string;
  artist_email: string;
  agreement_type: string;
  duration_months: number;
  revenue_share_percent: number;
  listing_fee: number;
  is_active: boolean;
  created_at: string;
  end_date: string;
}

const statusColors = {
  active: "bg-green-500/10 text-green-700",
  inactive: "bg-gray-500/10 text-gray-700",
  expiring: "bg-yellow-500/10 text-yellow-700",
  expired: "bg-red-500/10 text-red-700",
};

function getAgreementStatus(agreement: RevShareAgreement): string {
  if (!agreement.is_active) return "inactive";
  if (agreement.end_date) {
    const endDate = new Date(agreement.end_date);
    const now = new Date();
    const daysUntilExpiry = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry < 30) return "expiring";
  }
  return "active";
}

export default function RevSharePage() {
  const [activeTab, setActiveTab] = React.useState("artists");
  const { data: artists, loading: artistsLoading, error: artistsError } = useArtists();
  const { data: agreements, loading: agreementsLoading, error: agreementsError } = useRevShareAgreements();

  const totalRevenue = 96047.4; // Mock total for now
  const totalStreams = 2315087; // Mock total for now

  const activeArtists = (artists || []).filter((a: Artist) => a.is_active).length;
  const avgSplit = artists?.length 
    ? Math.round((artists as Artist[]).reduce((sum: number, a: Artist) => sum + Number(a.subscription_split), 0) / artists.length)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue Share"
        description="Manage artist revenue share agreements and payouts"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Artist
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/60 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Artists</p>
                <p className="text-2xl font-bold">{artists?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Artists</p>
                <p className="text-2xl font-bold">{activeArtists}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agreements</p>
                <p className="text-2xl font-bold">{agreements?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                <Percent className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Split</p>
                <p className="text-2xl font-bold">{avgSplit}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="artists" className="space-y-4">
          <Card className="border-border/60 bg-white">
            <CardContent className="p-6">
              <DataContainer
                loading={artistsLoading}
                error={artistsError}
                empty={!artists?.length}
                emptyMessage="No artists found. Add your first artist to get started."
              >
                <div className="space-y-4">
                  {(artists || []).map((artist: Artist) => (
                    <div
                      key={artist.id}
                      className="flex items-center justify-between p-4 border border-border/60 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{artist.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{artist.email}</span>
                            <span>•</span>
                            <span>{artist.subscription_split}% split</span>
                            <span>•</span>
                            <span>{artist.agreement_count} agreements</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={cn("text-xs", statusColors[artist.is_active ? "active" : "inactive"])}
                        >
                          {artist.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </DataContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreements" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Agreement
            </Button>
          </div>

          <Card className="border-border/60 bg-white">
            <CardContent className="p-6">
              <DataContainer
                loading={agreementsLoading}
                error={agreementsError}
                empty={!agreements?.length}
                emptyMessage="No agreements found. Create your first agreement to get started."
              >
                <div className="space-y-4">
                  {(agreements || []).map((agreement: RevShareAgreement) => {
                    const status = getAgreementStatus(agreement);
                    return (
                      <div
                        key={agreement.id}
                        className="flex items-center justify-between p-4 border border-border/60 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{agreement.artist_name}</h4>
                            <Badge
                              className={cn("text-xs", statusColors[status as keyof typeof statusColors])}
                            >
                              {status}
                            </Badge>
                            {agreement.agreement_type === 'exclusive' && (
                              <Badge variant="outline" className="text-xs">
                                Exclusive
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Percent className="h-4 w-4" />
                              {agreement.revenue_share_percent}% revenue share
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {agreement.duration_months} months
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {agreement.listing_fee > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Fee: ${agreement.listing_fee}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DataContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <DollarSign className="h-4 w-4 mr-2" />
              Process Payouts
            </Button>
          </div>

          <Card className="border-border/60 bg-white">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Pending Payouts</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  All pending payouts have been processed
                </p>
                <Button variant="outline" className="mt-4">
                  View Payout History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
