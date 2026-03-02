'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CampaignData {
  id?: string;
  name: string;
  objective: string;
  description: string;
  targeting: {
    regions: string[];
    zipCodes: string[];
    dmaCodes: string[];
    ageGroups: string[];
    genders: string[];
    channelIds: string[];
    categoryIds: string[];
  };
  totalBudget: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  frequencyCap: number;
  frequencyPeriod: string;
  creatives?: any[];
}

interface CampaignContextType {
  campaignData: CampaignData;
  updateCampaignData: (data: Partial<CampaignData>) => void;
  resetCampaignData: () => void;
}

const defaultCampaignData: CampaignData = {
  name: '',
  objective: 'awareness',
  description: '',
  targeting: {
    regions: [],
    zipCodes: [],
    dmaCodes: [],
    ageGroups: [],
    genders: [],
    channelIds: [],
    categoryIds: [],
  },
  totalBudget: 0,
  dailyBudget: 0,
  startDate: '',
  endDate: '',
  frequencyCap: 3,
  frequencyPeriod: 'Day',
};

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ 
  children,
  initialData,
  draftKey = 'campaignDraft'
}: { 
  children: ReactNode;
  initialData?: Partial<CampaignData>;
  draftKey?: string;
}) {
  const [campaignData, setCampaignData] = useState<CampaignData>({
    ...defaultCampaignData,
    ...initialData,
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCampaignData({ ...defaultCampaignData, ...parsed });
      } catch {
        // ignore parse errors
      }
    } else if (initialData) {
      setCampaignData({ ...defaultCampaignData, ...initialData });
    }
    setIsHydrated(true);
  }, [draftKey]); // Initial data dependency removed to prevent overwriting user edits on hot reload, but we rely on initial mount

  const updateCampaignData = (data: Partial<CampaignData>) => {
    setCampaignData((prev) => {
      const newData = { ...prev, ...data };
      localStorage.setItem(draftKey, JSON.stringify(newData));
      return newData;
    });
  };

  const resetCampaignData = () => {
    localStorage.removeItem(draftKey);
    setCampaignData(defaultCampaignData);
  };

  return (
    <CampaignContext.Provider value={{ campaignData, updateCampaignData, resetCampaignData }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}
