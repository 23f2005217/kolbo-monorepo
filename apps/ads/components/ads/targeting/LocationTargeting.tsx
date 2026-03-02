'use client';

import { useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useCampaign } from '@/components/ads/campaign-context';
import { PREDEFINED_LOCATIONS, type LocationOption } from '@/lib/data/locations';

export function LocationTargeting() {
  const { campaignData, updateCampaignData } = useCampaign();
  const [locationInput, setLocationInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<LocationOption[]>([]);

  const addLocation = (loc?: string) => {
    const value = loc || locationInput.trim();
    if (value && !campaignData.targeting.regions.includes(value)) {
      updateCampaignData({
        targeting: {
          ...campaignData.targeting,
          regions: [...campaignData.targeting.regions, value],
        },
      });
      setLocationInput('');
      setShowSuggestions(false);
    }
  };

  const removeLocation = (loc: string) => {
    updateCampaignData({
      targeting: {
        ...campaignData.targeting,
        regions: campaignData.targeting.regions.filter((l) => l !== loc),
      },
    });
  };

  const handleLocationChange = (val: string) => {
    setLocationInput(val);
    if (val.trim()) {
      const filtered = PREDEFINED_LOCATIONS.filter(loc => 
        (loc.name.toLowerCase().includes(val.toLowerCase()) || 
         loc.type.toLowerCase().includes(val.toLowerCase())) && 
        !campaignData.targeting.regions.includes(loc.name)
      ).slice(0, 10);
      setFilteredLocations(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="bg-(--ads-dark-secondary) border border-white/5 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-2">
        <MapPin className="text-(--ads-cyan)" style={{ width: 22, height: 22 }} />
        <h2 className="text-xl font-bold text-white">Location Targeting</h2>
      </div>
      <p className="text-gray-400 text-sm mb-6">Search and select locations for your campaign targeting.</p>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-white text-xs font-bold uppercase tracking-wider">Search Locations</Label>
          <div className="relative">
            <div className="min-h-12 w-full bg-white/5 border border-white/10 rounded-xl p-2 flex flex-wrap gap-2 focus-within:border-(--ads-cyan)/50 transition-all">
              {campaignData.targeting.regions.map((loc) => {
                const info = PREDEFINED_LOCATIONS.find(p => p.name === loc);
                return (
                  <Badge 
                    key={loc}
                    variant="secondary"
                    className="bg-(--ads-cyan)/10 text-(--ads-cyan) border-(--ads-cyan)/20 hover:bg-(--ads-cyan)/20 px-2 py-1 gap-1.5 rounded-lg flex items-center"
                  >
                    <span className="text-[10px] font-bold opacity-70">{info?.type || 'LOC'}</span>
                    {loc}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLocation(loc);
                      }} 
                      className="hover:text-white transition-colors ml-1"
                    >
                      <X style={{ width: 12, height: 12 }} />
                    </button>
                  </Badge>
                );
              })}
              <input
                value={locationInput}
                onChange={(e) => handleLocationChange(e.target.value)}
                onFocus={() => locationInput.trim() && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="bg-transparent border-none outline-none text-white text-sm placeholder:text-gray-500 flex-1 min-w-[200px] px-2 h-8"
                placeholder={campaignData.targeting.regions.length > 0 ? "" : "Search cities, states, or DMAs..."}
              />
            </div>

            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-(--ads-dark-secondary) border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl backdrop-blur-xl max-h-60 overflow-y-auto custom-scrollbar">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => addLocation(loc.name)}
                    className="w-full px-4 py-3 text-left hover:bg-(--ads-cyan)/5 transition-colors flex items-center justify-between group/item border-b border-white/[0.02] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        loc.type === 'DMA' ? 'bg-purple-500/15 text-purple-400' :
                        loc.type === 'State' ? 'bg-blue-500/15 text-blue-400' :
                        'bg-green-500/15 text-green-400'
                      }`}>
                        {loc.type}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-200 group-hover/item:text-(--ads-cyan)">{loc.name}</p>
                        <p className="text-[10px] text-gray-500">{loc.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400">{loc.reach}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-[10px] text-gray-500 uppercase font-bold self-center mr-1">Popular:</span>
            {PREDEFINED_LOCATIONS.filter(l => ['dma-ny', 'dma-la', 'st-fl', 'cty-chi'].includes(l.id)).map(loc => (
              <button
                key={loc.id}
                onClick={() => addLocation(loc.name)}
                disabled={campaignData.targeting.regions.includes(loc.name)}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 flex items-center gap-1"
              >
                + {loc.name.split(' (')[0].split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
