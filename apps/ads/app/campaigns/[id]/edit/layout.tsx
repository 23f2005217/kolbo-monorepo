'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CampaignProvider } from '@/components/ads/campaign-context';
import { Loader2 } from 'lucide-react';

export default function EditCampaignLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const draftKey = `edit_campaign_${campaignId}`;

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const [sessionRes, campaignRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch(`/api/campaigns/${campaignId}`),
        ]);

        if (!sessionRes.ok) {
          router.push('/signin');
          return;
        }

        if (!campaignRes.ok) {
          router.push('/dashboard');
          return;
        }

        const { campaign } = await campaignRes.json();
        setInitialData({
          id: campaign.id,
          name: campaign.name,
          objective: campaign.objective,
          description: campaign.description || '',
          totalBudget: campaign.totalBudget,
          dailyBudget: campaign.dailyBudget || 0,
          status: campaign.status,
          startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
          endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
          frequencyCap: campaign.frequencyCap || 3,
          frequencyPeriod: campaign.frequencyPeriod || 'Day',
          targeting: campaign.targeting || {
            regions: [],
            zipCodes: [],
            dmaCodes: [],
            ageGroups: [],
            genders: [],
            channelIds: [],
            categoryIds: [],
          },
          creatives: campaign.creatives || [],
        });
      } catch (err) {
        console.error('Failed to fetch campaign:', err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    const saved = localStorage.getItem(draftKey);
    if (!saved) {
      fetchCampaign();
    } else {
      setLoading(false);
    }
  }, [campaignId, router, draftKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--ads-dark-primary)">
        <Loader2 className="animate-spin text-(--ads-cyan)" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <CampaignProvider initialData={initialData || undefined} draftKey={draftKey}>
      {children}
    </CampaignProvider>
  );
}
