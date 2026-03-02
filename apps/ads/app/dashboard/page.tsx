'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ads/logo';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Plus, MoreHorizontal, Loader2, Edit, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Advertiser {
  id: string;
  email: string;
  companyName: string;
  contactName: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalBudget: number;
  dailyBudget: number | null;
  startDate: string;
  endDate: string | null;
  stats: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  };
}

interface Analytics {
  totals: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  };
  ctr: number;
  cpm: number;
  cpc: number;
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  draft: 'bg-gray-500/20 text-gray-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-purple-500/20 text-purple-400',
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function AdsDashboard() {
  const router = useRouter();
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string) => {
    setCampaignToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/campaigns/${campaignToDelete}`, {
        method: 'DELETE',
      });
       if (res.ok) {
         setCampaigns(campaigns.filter((c: any) => c.id !== campaignToDelete));
       }
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [sessionRes, campaignsRes, analyticsRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/campaigns'),
          fetch('/api/analytics'),
        ]);

        if (!sessionRes.ok) {
          router.push('/signin');
          return;
        }

        const sessionData = await sessionRes.json();
        setAdvertiser(sessionData.advertiser);

        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json();
          setCampaigns(campaignsData.campaigns);
        }

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData.analytics);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <Logo size="md" />
            <div className="h-10 w-24 bg-white/5 rounded-lg animate-pulse" />
          </div>

          <div className="mb-12">
            <div className="h-9 w-80 bg-white/5 rounded-lg mb-2 animate-pulse" />
            <div className="h-5 w-96 bg-white/5 rounded-lg animate-pulse" />
          </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
             {[...Array(4)].map((_, i: any) => (
               <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-2" />
                <div className="h-8 w-32 bg-white/10 rounded mb-2" />
                <div className="h-4 w-16 bg-white/10 rounded" />
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-7 w-48 bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-40 bg-white/10 rounded animate-pulse" />
            </div>
             <div className="space-y-4">
               {[...Array(3)].map((_, i: any) => (
                 <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const metrics = analytics
    ? [
        { label: 'Total Spend', value: `$${(analytics.totals.spend || 0).toLocaleString()}`, trend: '+0%', positive: true },
        { label: 'Impressions', value: formatNumber(analytics.totals.impressions || 0), trend: '+0%', positive: true },
        { label: 'Click-Through Rate', value: `${(analytics.ctr || 0).toFixed(2)}%`, trend: '+0%', positive: true },
        { label: 'Conversions', value: analytics.totals.conversions?.toLocaleString() || '0', trend: '+0%', positive: true },
      ]
    : [];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <Logo size="md" />
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
          >
            Sign out
          </Button>
        </div>

        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">Campaign Dashboard</h1>
          <p className="text-gray-400">
            {advertiser ? `Welcome back, ${advertiser.contactName}` : 'Monitor and manage your streaming TV ad campaigns'}
          </p>
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
           {metrics.map((metric: any) => (
             <div
              key={metric.label}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
              <p className="text-3xl font-bold text-white mb-2">{metric.value}</p>
              <div className="flex items-center gap-1">
                {metric.positive ? (
                  <TrendingUp className="text-green-400" style={{ width: 16, height: 16 }} />
                ) : (
                  <TrendingDown className="text-red-400" style={{ width: 16, height: 16 }} />
                )}
                <span className={metric.positive ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                  {metric.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Your Campaigns</h2>
            <Button
              onClick={() => router.push('/create')}
              className="bg-(--ads-cyan) hover:bg-(--ads-cyan)/90 text-white"
            >
              <Plus style={{ width: 18, height: 18 }} />
              Create Campaign
            </Button>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">You have no campaigns yet.</p>
              <Button
                onClick={() => router.push('/create')}
                className="bg-(--ads-cyan) hover:bg-(--ads-cyan)/90 text-white"
              >
                Create your first campaign
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Name</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Budget</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Stats</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm"></th>
                  </tr>
                </thead>
                 <tbody>
                   {campaigns.map((campaign: any) => (
                     <tr key={campaign.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-4 text-white font-medium">{campaign.name}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[campaign.status] || statusStyles.draft}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white">${campaign.totalBudget.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-400">
                        {campaign.stats?.impressions ? `${formatNumber(campaign.stats.impressions)} Impressions` : '-'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:text-white">
                              <MoreHorizontal style={{ width: 18, height: 18 }} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-(--ads-dark-secondary) border-white/10 text-white">
                            <DropdownMenuItem 
                              className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                              onClick={() => router.push(`/campaigns/${campaign.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Campaign
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem 
                              className="text-red-400 cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-red-400"
                              onClick={() => handleDeleteClick(campaign.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Campaign
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-(--ads-dark-secondary) border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete this campaign and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
              disabled={isDeleting} 
              onClick={() => setCampaignToDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
