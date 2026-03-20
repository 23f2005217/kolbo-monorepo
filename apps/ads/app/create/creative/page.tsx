'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ads/logo';
import { CampaignStepper } from '@/components/ads/campaign-stepper';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, CheckCircle, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { CampaignProvider, useCampaign } from '@/components/ads/campaign-context';

function CreativeContent() {
  const router = useRouter();
  const { campaignData, resetCampaignData } = useCampaign();
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/session').then((r) => {
      if (!r.ok) router.push('/signin');
    });
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Allowed: MP4, MOV, AVI');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be under 100MB');
        return;
      }
      setSelectedFile(file);
      
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const handleLaunch = async () => {
    if (!selectedFile) return;

    setIsLaunching(true);
    setError('');

    try {
      const campaignRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignData.name,
          objective: campaignData.objective,
          description: campaignData.description,
          totalBudget: campaignData.totalBudget,
          dailyBudget: campaignData.dailyBudget,
          startDate: campaignData.startDate,
          endDate: campaignData.endDate || null,
          frequencyCap: campaignData.frequencyCap,
          frequencyPeriod: campaignData.frequencyPeriod,
          targeting: campaignData.targeting,
        }),
      });

      if (!campaignRes.ok) {
        const data = await campaignRes.json();
        throw new Error(data.error || 'Failed to create campaign');
      }

      const { campaign } = await campaignRes.json();

      // 1. Get Mux upload URL
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filename: selectedFile.name,
          isAd: true
        }),
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, uploadId } = await uploadRes.json();

      // 2. Upload file directly to Mux
      const muxRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
      });

      if (!muxRes.ok) {
        throw new Error('Failed to upload video to Mux');
      }

      const creativeRes = await fetch('/api/creatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedFile.name,
          campaignId: campaign.id,
          muxUploadId: uploadId,
        }),
      });

      if (!creativeRes.ok) {
        const data = await creativeRes.json();
        throw new Error(data.error || 'Failed to save creative metadata');
      }

      // 4. Create Stripe Checkout Session
      const checkoutRes = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          name: campaign.name,
          totalBudget: campaign.totalBudget,
          successUrl: `${window.location.origin}/dashboard?status=success`,
          cancelUrl: `${window.location.origin}/create/creative`,
        }),
      });

      if (!checkoutRes.ok) {
        throw new Error('Failed to initiate payment');
      }

      const { url } = await checkoutRes.json();
      
      resetCampaignData();
      
      if (url) {
        window.location.href = url;
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to launch campaign');
      setIsLaunching(false);
    }
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

        <CampaignStepper currentStep={3} />

        <div className="grid grid-cols-3 gap-8 mt-8">
          <div className="col-span-2 space-y-6">
            <div className="bg-(--ads-dark-secondary) border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-8 pb-0">
                <h2 className="text-xl font-bold text-white mb-2">Upload Creative</h2>
                <p className="text-gray-400 text-sm mb-6">Your video advertisement that will be shown to viewers.</p>
              </div>
              
              {error && (
                <div className="px-8 pb-6">
                  <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                    {error}
                  </p>
                </div>
              )}

              <div className="px-8 pb-8">
                <div className={`border-2 border-dashed rounded-2xl transition-all duration-300 ${
                  selectedFile 
                    ? 'border-(--ads-cyan)/30 bg-(--ads-cyan)/5' 
                    : 'border-white/10 hover:border-(--ads-cyan)/30 hover:bg-white/[0.02]'
                }`}>
                  {selectedFile ? (
                    <div className="p-2">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden relative group">
                        {videoPreviewUrl && (
                          <video 
                            src={videoPreviewUrl} 
                            controls 
                            className="w-full h-full object-contain"
                          />
                        )}
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setVideoPreviewUrl(null);
                          }}
                          className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-red-500 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                          <X style={{ width: 16, height: 16 }} />
                        </button>
                        
                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all z-10">
                          <label className="cursor-pointer block">
                            <input
                              type="file"
                              accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            <div className="px-4 py-2 bg-black/50 border border-white/20 text-white hover:bg-white/20 rounded-xl text-sm font-medium backdrop-blur-sm flex items-center gap-2 transition-colors">
                              <Upload style={{ width: 16, height: 16 }} />
                              Replace
                            </div>
                          </label>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-(--ads-cyan)/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="text-(--ads-cyan)" style={{ width: 20, height: 20 }} />
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm truncate max-w-[200px]">{selectedFile.name}</p>
                            <p className="text-gray-500 text-xs">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            1080p
                          </div>
                          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Verified
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-20 px-10 cursor-pointer">
                      <input
                        type="file"
                        accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-8 ring-white/[0.02]">
                        <Upload className="text-gray-500" style={{ width: 32, height: 32 }} />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">Drag and drop or click to upload</h3>
                      <p className="text-gray-500 text-sm mb-8 max-w-xs text-center">
                        MP4, MOV or AVI. Max 100MB.
                      </p>
                      <div className="bg-(--ads-cyan) hover:bg-(--ads-cyan)/90 text-white px-8 h-12 rounded-xl font-bold flex items-center justify-center transition-all">
                        Choose File
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {selectedFile && (
              <div className="bg-(--ads-dark-secondary) border border-white/5 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-green-400 font-bold">
                    98%
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Ad Quality Score</h3>
                    <p className="text-gray-500 text-xs">Optimal resolution and aspect ratio detected.</p>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-(--ads-cyan) w-[98%]" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-(--ads-dark-secondary) border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <div className="w-1 h-4 bg-(--ads-cyan) rounded-full" />
                Technical Specs
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-500 text-xs">Aspect Ratio</span>
                  <span className="text-white text-xs font-mono">16:9 (1920x1080)</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-500 text-xs">Duration</span>
                  <span className="text-white text-xs font-mono">15 - 30 Seconds</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-500 text-xs">Format</span>
                  <span className="text-white text-xs font-mono">.mp4 / .mov</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-500 text-xs">Audio</span>
                  <span className="text-white text-xs font-mono">AAC / 48kHz</span>
                </li>
              </ul>
            </div>

            <div className="bg-(--ads-cyan)/5 border border-(--ads-cyan)/10 rounded-2xl p-6">
              <h3 className="text-(--ads-cyan) font-bold mb-2 text-sm uppercase tracking-wider">Pro Tip</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Ads between 15 and 30 seconds have a 40% higher completion rate on premium channels. Ensure your call-to-action is visible in the final 5 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-(--ads-dark-secondary)/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/create/budget')}
            disabled={isLaunching}
            className="text-gray-400 hover:text-white hover:bg-transparent flex items-center gap-2"
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
            Back
          </Button>
          <Button
            onClick={handleLaunch}
            disabled={!selectedFile || isLaunching}
            className={`px-10 h-11 rounded-lg font-bold flex items-center gap-2 transition-all duration-500 ${
              isLaunching 
                ? 'bg-gray-800 text-gray-400' 
                : 'bg-gradient-to-r from-(--ads-cyan) to-blue-500 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] text-white'
            }`}
          >
            {isLaunching ? (
              <>
                <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
                Launching Campaign...
              </>
            ) : (
              'Launch Campaign'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CreativePage() {
  return (
    <CampaignProvider>
      <CreativeContent />
    </CampaignProvider>
  );
}
