'use client';

import { Check, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCampaign } from '@/components/ads/campaign-context';

interface Subsite {
  id: string;
  name: string;
  isActive: boolean;
}

interface ChannelTargetingProps {
  subsites: Subsite[];
}

export function ChannelTargeting({ subsites }: ChannelTargetingProps) {
  const { campaignData, updateCampaignData } = useCampaign();

  const toggleChannel = (id: string) => {
    const newChannels = campaignData.targeting.channelIds.includes(id)
      ? campaignData.targeting.channelIds.filter((c) => c !== id)
      : [...campaignData.targeting.channelIds, id];
    updateCampaignData({
      targeting: { ...campaignData.targeting, channelIds: newChannels },
    });
  };

  const selectAllChannels = () => {
    updateCampaignData({
      targeting: { ...campaignData.targeting, channelIds: subsites.map((s) => s.id) },
    });
  };

  const clearAllChannels = () => {
    updateCampaignData({
      targeting: { ...campaignData.targeting, channelIds: [] },
    });
  };

  return (
    <div className="bg-(--ads-dark-secondary) border border-white/5 rounded-2xl p-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Monitor className="text-(--ads-cyan)" style={{ width: 22, height: 22 }} />
          <h2 className="text-xl font-bold text-white">Channels</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={selectAllChannels} className="text-xs text-gray-400 hover:text-white">
            Select All
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAllChannels} className="text-xs text-gray-400 hover:text-white">
            Clear
          </Button>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-6">Select which channels your ads will appear on.</p>

      {subsites.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No channels available</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {subsites.map((subsite) => {
              const isSelected = campaignData.targeting.channelIds.includes(subsite.id);
              return (
                <button
                  key={subsite.id}
                  onClick={() => toggleChannel(subsite.id)}
                  className={`relative h-16 rounded-xl border text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-(--ads-dark-primary) border-(--ads-cyan) text-white shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                      : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 left-2 w-4 h-4 bg-(--ads-cyan) rounded flex items-center justify-center">
                      <Check style={{ width: 12, height: 12 }} className="text-white" />
                    </div>
                  )}
                  {subsite.name}
                </button>
              );
            })}
          </div>
          <p className="text-gray-500 text-xs">{campaignData.targeting.channelIds.length} of {subsites.length} channels selected</p>
        </div>
      )}
    </div>
  );
}
