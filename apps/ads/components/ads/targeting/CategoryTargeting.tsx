'use client';

import { useCampaign } from '@/components/ads/campaign-context';

interface Category {
  id: string;
  name: string;
}

interface CategoryTargetingProps {
  categories: Category[];
}

export function CategoryTargeting({ categories }: CategoryTargetingProps) {
  const { campaignData, updateCampaignData } = useCampaign();

  const toggleCategory = (id: string) => {
    const newCategories = campaignData.targeting.categoryIds.includes(id)
      ? campaignData.targeting.categoryIds.filter((c) => c !== id)
      : [...campaignData.targeting.categoryIds, id];
    updateCampaignData({
      targeting: { ...campaignData.targeting, categoryIds: newCategories },
    });
  };

  return (
    <div className="bg-(--ads-dark-secondary) border border-white/5 rounded-2xl p-8">
      <h2 className="text-xl font-bold text-white mb-2">Content Categories</h2>
      <p className="text-gray-400 text-sm mb-6">Select the content categories you want your ads to appear in.</p>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No categories available</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`h-14 rounded-xl text-sm font-bold transition-all border ${
                campaignData.targeting.categoryIds.includes(cat.id)
                  ? 'bg-(--ads-dark-primary) border-(--ads-cyan) text-(--ads-cyan) ring-2 ring-(--ads-cyan)/20'
                  : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
