'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCampaign } from '@/components/ads/campaign-context';

export function ZipCodeTargeting() {
  const { campaignData, updateCampaignData } = useCampaign();
  const [zipInput, setZipInput] = useState('');

  const addZip = () => {
    if (zipInput.trim() && !campaignData.targeting.zipCodes.includes(zipInput.trim())) {
      updateCampaignData({
        targeting: {
          ...campaignData.targeting,
          zipCodes: [...campaignData.targeting.zipCodes, zipInput.trim()],
        },
      });
      setZipInput('');
    }
  };

  const removeZip = (zip: string) => {
    updateCampaignData({
      targeting: {
        ...campaignData.targeting,
        zipCodes: campaignData.targeting.zipCodes.filter((z) => z !== zip),
      },
    });
  };

  return (
    <div className="bg-(--ads-dark-secondary) border border-white/5 rounded-2xl p-8">
      <h2 className="text-xl font-bold text-white mb-6">Zip Code Targeting</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addZip()}
            className="bg-white/5 border-white/10 text-white h-12 rounded-xl flex-1 focus:border-(--ads-cyan)/50"
            placeholder="Enter zip codes (e.g. 10001)..."
          />
          <Button
            onClick={addZip}
            className="bg-(--ads-cyan) text-white hover:bg-(--ads-cyan)/90 h-12 px-8 rounded-xl font-bold"
          >
            Add
          </Button>
        </div>
        {campaignData.targeting.zipCodes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {campaignData.targeting.zipCodes.map((zip) => (
              <Badge key={zip} variant="outline" className="border-white/10 text-gray-400 pl-3 pr-1 py-1 gap-1 rounded-lg">
                {zip}
                <button onClick={() => removeZip(zip)} className="hover:text-red-400 p-0.5">
                  <X style={{ width: 12, height: 12 }} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
