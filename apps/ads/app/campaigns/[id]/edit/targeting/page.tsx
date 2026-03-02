'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ads/logo';
import { CampaignStepper } from '@/components/ads/campaign-stepper';
import { Button } from '@/components/ui/button';
import { useCampaign } from '@/components/ads/campaign-context';

import { LocationTargeting } from '@/components/ads/targeting/LocationTargeting';
import { ZipCodeTargeting } from '@/components/ads/targeting/ZipCodeTargeting';
import { AgeGenderTargeting } from '@/components/ads/targeting/AgeGenderTargeting';
import { ChannelTargeting } from '@/components/ads/targeting/ChannelTargeting';
import { CategoryTargeting } from '@/components/ads/targeting/CategoryTargeting';

interface Subsite {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function EditTargetingPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  
  const [subsites, setSubsites] = useState<Subsite[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subsitesRes, categoriesRes] = await Promise.all([
          fetch('/api/subsites'),
          fetch('/api/categories'),
        ]);

        if (subsitesRes.ok) {
          const data = await subsitesRes.json();
          setSubsites(data.filter((s: Subsite) => s.isActive));
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.filter((c: Category) => c.type === 'video_row'));
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--ads-dark-primary)">
        <Loader2 className="animate-spin text-(--ads-cyan)" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-(--ads-dark-primary)">
      <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back to Dashboard
          </Link>
        </div>
        <Logo size="sm" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <div className="pt-10 pb-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Campaign</h1>
          <p className="text-gray-400 text-sm">Update your campaign settings.</p>
        </div>

        <CampaignStepper currentStep={1} editMode={true} />

        <div className="space-y-6 mt-8">
          <LocationTargeting />
          <ZipCodeTargeting />
          <AgeGenderTargeting />
          <ChannelTargeting subsites={subsites} />
          <CategoryTargeting categories={categories} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-(--ads-dark-secondary)/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
           <Button
             variant="ghost"
             onClick={() => router.push(`/campaigns/${campaignId}/edit`)}
             className="text-gray-400 hover:text-white hover:bg-transparent flex items-center gap-2"
           >
             <ArrowLeft style={{ width: 18, height: 18 }} />
             Back
           </Button>
           <Button
             onClick={() => router.push(`/campaigns/${campaignId}/edit/budget`)}
             className="bg-(--ads-cyan) hover:bg-(--ads-cyan)/90 text-white px-10 h-11 rounded-lg font-bold flex items-center gap-2"
           >
            Continue
            <ArrowRight style={{ width: 18, height: 18 }} />
          </Button>
        </div>
      </div>
    </div>
  );
}
