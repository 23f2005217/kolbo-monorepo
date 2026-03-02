'use client';

import { useRouter, useParams } from 'next/navigation';
import { Logo } from '@/components/ads/logo';
import { CampaignStepper } from '@/components/ads/campaign-stepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCampaign } from '@/components/ads/campaign-context';

const objectives = [
  { value: 'awareness', label: 'Awareness', description: 'Get your brand in front of more people' },
  { value: 'traffic', label: 'Traffic', description: 'Drive viewers to your website or app' },
  { value: 'conversions', label: 'Conversions', description: 'Encourage specific actions or purchases' },
];

export default function EditCampaignDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  const { campaignData, updateCampaignData, resetCampaignData } = useCampaign();

  const handleContinue = () => {
    router.push(`/campaigns/${campaignId}/edit/targeting`);
  };

  const handleCancel = () => {
    resetCampaignData();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen pb-32 bg-(--ads-dark-primary)">
      <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back to Dashboard
          </Link>
        </div>
        <Logo size="sm" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="pt-10 pb-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Campaign</h1>
          <p className="text-gray-400 text-sm">Update your campaign settings.</p>
        </div>

        <CampaignStepper currentStep={0} editMode={true} />

        <div className="space-y-6 mt-8">
          <div className="bg-(--ads-dark-secondary) border border-white/5 rounded-2xl p-8 space-y-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-white text-xs font-bold uppercase tracking-wider">Campaign Name</Label>
              <Input
                id="name"
                value={campaignData.name}
                onChange={(e) => updateCampaignData({ name: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-(--ads-cyan)/50 transition-all"
                placeholder="e.g. Holiday Season Promo"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-white text-xs font-bold uppercase tracking-wider">Campaign Objective</Label>
              <RadioGroup
                value={campaignData.objective}
                onValueChange={(value) => updateCampaignData({ objective: value })}
                className="grid grid-cols-3 gap-4"
               >
                 {objectives.map((objective: any) => (
                   <label
                    key={objective.value}
                    className={`relative flex flex-col p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      campaignData.objective === objective.value
                        ? 'border-(--ads-cyan) bg-(--ads-cyan)/5 ring-2 ring-(--ads-cyan)/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <RadioGroupItem
                        value={objective.value}
                        className="border-white/30 text-(--ads-cyan)"
                      />
                      <span className="text-white font-bold">{objective.label}</span>
                    </div>
                    <span className="text-gray-400 text-xs leading-relaxed">{objective.description}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-white text-xs font-bold uppercase tracking-wider">
                Description <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                value={campaignData.description}
                onChange={(e) => updateCampaignData({ description: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[120px] rounded-xl focus:border-(--ads-cyan)/50 transition-all resize-none p-4"
                placeholder="Describe your campaign goals..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-(--ads-dark-secondary)/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-gray-400 hover:text-white hover:bg-transparent flex items-center gap-2"
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!campaignData.name.trim()}
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
