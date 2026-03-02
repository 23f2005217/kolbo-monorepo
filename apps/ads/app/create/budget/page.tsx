'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ads/logo';
import { CampaignStepper } from '@/components/ads/campaign-stepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Calendar, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { CampaignProvider, useCampaign } from '@/components/ads/campaign-context';

const inventoryPercent = 68;

function BudgetScheduleContent() {
  const router = useRouter();
  const { campaignData, updateCampaignData } = useCampaign();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/session').then((r) => {
      if (!r.ok) router.push('/signin');
    });
  }, [router]);

  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, [mounted]);

  const minEndDate = useMemo(() => {
    if (!campaignData.startDate) return today;
    const start = new Date(campaignData.startDate);
    start.setDate(start.getDate() + 1);
    return start.toISOString().split('T')[0];
  }, [campaignData.startDate, today]);

  const campaignDuration = useMemo(() => {
    if (!campaignData.startDate || !campaignData.endDate) return 0;
    const start = new Date(campaignData.startDate);
    const end = new Date(campaignData.endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [campaignData.startDate, campaignData.endDate]);

  const suggestedDailyBudget = useMemo(() => {
    if (!campaignData.totalBudget || campaignDuration <= 0) return 0;
    return Math.round(campaignData.totalBudget / campaignDuration);
  }, [campaignData.totalBudget, campaignDuration]);

  const isContinueDisabled = !campaignData.totalBudget || !campaignData.startDate;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!campaignData.totalBudget || campaignData.totalBudget <= 0) {
      newErrors.totalBudget = 'Total budget must be greater than $0';
    }

    if (campaignData.dailyBudget !== undefined && campaignData.dailyBudget !== null) {
      if (campaignData.dailyBudget <= 0) {
        newErrors.dailyBudget = 'Daily budget must be greater than $0';
      } else if (campaignData.dailyBudget > campaignData.totalBudget) {
        newErrors.dailyBudget = 'Daily budget cannot exceed total budget';
      }
    }

    if (!campaignData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else if (new Date(campaignData.startDate) < new Date(today)) {
      newErrors.startDate = 'Start date cannot be in the past';
    }

    if (campaignData.endDate) {
      if (new Date(campaignData.endDate) <= new Date(campaignData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (campaignData.frequencyCap !== undefined) {
      if (campaignData.frequencyCap < 1) {
        newErrors.frequencyCap = 'Frequency cap must be at least 1';
      } else if (campaignData.frequencyCap > 100) {
        newErrors.frequencyCap = 'Frequency cap cannot exceed 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      router.push('/create/creative');
    }
  };

  const handleStartDateChange = (value: string) => {
    updateCampaignData({ startDate: value });
    if (campaignData.endDate && new Date(value) >= new Date(campaignData.endDate)) {
      updateCampaignData({ startDate: value, endDate: '' });
    }
    setErrors((prev) => ({ ...prev, startDate: '', endDate: '' }));
  };

  const handleEndDateChange = (value: string) => {
    updateCampaignData({ endDate: value });
    setErrors((prev) => ({ ...prev, endDate: '' }));
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
          <h1 className="text-3xl font-bold text-white mb-2">Create New Campaign</h1>
          <p className="text-gray-400 text-sm">Set up your streaming TV ad campaign in just a few steps.</p>
        </div>

        <CampaignStepper currentStep={2} />

        <div className="space-y-6 mt-8">
          <div className="bg-(--ads-dark-secondary) border border-white/5 rounded-2xl p-8">
            <div className="flex gap-10">
              <div className="flex-1">
                <p className="text-gray-400 text-sm mb-4">Impressions and CPM based on current targeting</p>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">Inventory Availability</h2>
                    <p className="text-gray-500 text-xs">-</p>
                  </div>
                </div>
              </div>
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-white/5"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-(--ads-cyan)"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - inventoryPercent / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{inventoryPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-(--ads-dark-secondary) border border-white/5 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Budget & Schedule</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-white text-xs font-bold uppercase tracking-wider">Total Budget *</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <Input
                    type="number"
                    min="1"
                    value={campaignData.totalBudget || ''}
                    onChange={(e) => {
                      updateCampaignData({ totalBudget: parseFloat(e.target.value) || 0 });
                      setErrors((prev) => ({ ...prev, totalBudget: '' }));
                    }}
                    className={`bg-white/5 border-white/10 text-white placeholder:text-gray-500 pl-8 h-12 rounded-xl ${
                      errors.totalBudget ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder="5000"
                  />
                </div>
                {errors.totalBudget && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle style={{ width: 12, height: 12 }} />
                    {errors.totalBudget}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Label className="text-white text-xs font-bold uppercase tracking-wider">
                  Daily Budget
                  {suggestedDailyBudget > 0 && (
                    <span className="text-gray-500 font-normal ml-2">
                      (Suggested: ${suggestedDailyBudget}/day)
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <Input
                    type="number"
                    min="1"
                    max={campaignData.totalBudget || undefined}
                    value={campaignData.dailyBudget || ''}
                    onChange={(e) => {
                      updateCampaignData({ dailyBudget: parseFloat(e.target.value) || 0 });
                      setErrors((prev) => ({ ...prev, dailyBudget: '' }));
                    }}
                    className={`bg-white/5 border-white/10 text-white placeholder:text-gray-500 pl-8 h-12 rounded-xl ${
                      errors.dailyBudget ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder="500"
                  />
                </div>
                {errors.dailyBudget && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle style={{ width: 12, height: 12 }} />
                    {errors.dailyBudget}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Label className="text-white text-xs font-bold uppercase tracking-wider">Start Date *</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar style={{ width: 18, height: 18 }} />
                  </span>
                  <Input
                    type="date"
                    min={mounted ? today : undefined}
                    value={campaignData.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className={`bg-white/5 border-white/10 text-white placeholder:text-gray-500 pl-11 h-12 rounded-xl ${
                      errors.startDate ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.startDate && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle style={{ width: 12, height: 12 }} />
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Label className="text-white text-xs font-bold uppercase tracking-wider">
                  End Date
                  {campaignDuration > 0 && (
                    <span className="text-gray-500 font-normal ml-2">
                      ({campaignDuration} days)
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar style={{ width: 18, height: 18 }} />
                  </span>
                  <Input
                    type="date"
                    min={mounted ? minEndDate : undefined}
                    value={campaignData.endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    disabled={!campaignData.startDate}
                    className={`bg-white/5 border-white/10 text-white placeholder:text-gray-500 pl-11 h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.endDate ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.endDate && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle style={{ width: 12, height: 12 }} />
                    {errors.endDate}
                  </p>
                )}
                {!campaignData.startDate && (
                  <p className="text-gray-500 text-xs">Select a start date first</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-(--ads-dark-secondary) border border-white/5 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2">Delivery</h2>
            <p className="text-gray-400 text-sm mb-4">Control how often viewers see your ad.</p>
            <p className="text-gray-500 text-xs mb-8">
              Frequency capping helps prevent ad fatigue by limiting how many times a viewer sees your ad within a time period.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Label className="text-white text-xs font-bold uppercase tracking-wider">Frequency Cap</Label>
                <div className="group relative">
                  <Info className="text-gray-500 cursor-help" style={{ width: 14, height: 14 }} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-48 z-10 shadow-lg">
                    Maximum times a viewer will see your ad per time period. Lower values reduce ad fatigue.
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="space-y-2">
                  <div className="relative w-24">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={campaignData.frequencyCap}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        updateCampaignData({ frequencyCap: Math.min(100, Math.max(1, val || 1)) });
                        setErrors((prev) => ({ ...prev, frequencyCap: '' }));
                      }}
                      className={`bg-white/5 border-white/10 text-white h-10 rounded-lg px-4 text-center ${
                        errors.frequencyCap ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.frequencyCap && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle style={{ width: 12, height: 12 }} />
                      {errors.frequencyCap}
                    </p>
                  )}
                </div>
                <span className="text-gray-400 text-sm">ads per</span>
                <select 
                  value={campaignData.frequencyPeriod}
                  onChange={(e) => updateCampaignData({ frequencyPeriod: e.target.value })}
                  className="bg-white/5 border border-white/10 text-white h-10 rounded-lg px-4 text-sm focus:outline-none focus:border-(--ads-cyan)/50"
                >
                  <option value="Hour">Hour</option>
                  <option value="Day">Day</option>
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                </select>
              </div>

              <div className="mt-4 p-4 bg-white/5 rounded-xl">
                <p className="text-gray-400 text-xs">
                  {campaignData.frequencyCap && campaignData.frequencyPeriod ? (
                    <>
                      Each viewer will see your ad at most <span className="text-white font-medium">{campaignData.frequencyCap} time{campaignData.frequencyCap > 1 ? 's' : ''}</span> per <span className="text-white font-medium">{campaignData.frequencyPeriod.toLowerCase()}</span>.
                    </>
                  ) : (
                    'Set a frequency cap to limit ad exposure per viewer.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-(--ads-dark-secondary)/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/create/targeting')}
            className="text-gray-400 hover:text-white hover:bg-transparent flex items-center gap-2"
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isContinueDisabled}
            className="bg-(--ads-cyan) hover:bg-(--ads-cyan)/90 text-white px-10 h-11 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight style={{ width: 18, height: 18 }} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BudgetSchedulePage() {
  return (
    <CampaignProvider>
      <BudgetScheduleContent />
    </CampaignProvider>
  );
}
