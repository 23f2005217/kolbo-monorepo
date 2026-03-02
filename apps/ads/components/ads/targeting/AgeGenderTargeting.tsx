'use client';

import { Label } from '@/components/ui/label';
import { useCampaign } from '@/components/ads/campaign-context';

const ageGroups = ['18-24', '25-34', '35-49', '50+'];
const genders = ['Male', 'Female', 'All Genders'];

export function AgeGenderTargeting() {
  const { campaignData, updateCampaignData } = useCampaign();

  const toggleAge = (age: string) => {
    const newAges = campaignData.targeting.ageGroups.includes(age)
      ? campaignData.targeting.ageGroups.filter((a) => a !== age)
      : [...campaignData.targeting.ageGroups, age];
    updateCampaignData({
      targeting: { ...campaignData.targeting, ageGroups: newAges },
    });
  };

  return (
    <div className="bg-(--ads-dark-secondary) border border-white/5 rounded-2xl p-8">
      <h2 className="text-xl font-bold text-white mb-6">Age & Gender</h2>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <Label className="text-white text-xs font-bold uppercase tracking-wider">Age Groups</Label>
          <div className="grid grid-cols-4 gap-4">
            {ageGroups.map((age) => (
              <button
                key={age}
                onClick={() => toggleAge(age)}
                className={`h-14 rounded-xl text-sm font-bold transition-all border ${
                  campaignData.targeting.ageGroups.includes(age)
                    ? 'bg-(--ads-dark-primary) border-(--ads-cyan) text-(--ads-cyan) ring-2 ring-(--ads-cyan)/20'
                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-white text-xs font-bold uppercase tracking-wider">Gender</Label>
          <div className="grid grid-cols-3 gap-4">
            {genders.map((gender) => (
              <button
                key={gender}
                onClick={() => updateCampaignData({
                  targeting: { ...campaignData.targeting, genders: [gender === 'All Genders' ? '' : gender.toLowerCase()] },
                })}
                className={`h-14 rounded-xl text-sm font-bold transition-all border ${
                  (gender === 'All Genders' && campaignData.targeting.genders.length === 0) ||
                  campaignData.targeting.genders.includes(gender.toLowerCase())
                    ? 'bg-(--ads-dark-primary) border-(--ads-cyan) text-(--ads-cyan) ring-2 ring-(--ads-cyan)/20'
                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
