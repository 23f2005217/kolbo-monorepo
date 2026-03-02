import { NavHeader } from '@/components/ads/nav-header';
import { HeroSection } from '@/components/ads/hero-section';
import { StatsSection } from '@/components/ads/stats-section';
import { BenefitsSection } from '@/components/ads/benefits-section';
import { HowItWorksSection } from '@/components/ads/how-it-works-section';

export default function AdsLandingPage() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <BenefitsSection />
        <HowItWorksSection />
      </main>
    </div>
  );
}
