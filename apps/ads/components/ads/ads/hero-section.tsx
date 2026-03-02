import { Zap, Tv, Smartphone, Monitor, Play, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const platforms = [
  { icon: Tv, label: 'Streaming TV' },
  { icon: Smartphone, label: 'Mobile' },
  { icon: Monitor, label: 'Connected TV' },
];

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <Badge variant="outline" className="mb-8 border-(--ads-cyan)/30 bg-(--ads-cyan)/10 text-(--ads-cyan) px-4 py-2">
          <Zap style={{ width: 16, height: 16 }} />
          Launch campaigns in minutes
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Your Simple Solution for
          <br />
          <span className="text-(--ads-cyan)">Streaming TV</span> Advertising
        </h1>

        <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
          Access engaged audiences and premium OTT content. Set up, launch, and
          optimize your campaigns all in one easy-to-use platform.
        </p>

        <div className="flex items-center justify-center gap-6 mb-16">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div key={platform.label} className="flex items-center gap-2 text-white">
                <Icon style={{ width: 24, height: 24 }} />
                <span className="text-sm font-medium">{platform.label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-(--ads-cyan) hover:bg-(--ads-cyan)/90 text-white px-8">
            <Link href="/ads/signup">
              Get Started Free
              <ArrowRight style={{ width: 18, height: 18 }} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white px-8">
            <Link href="#demo" className="flex items-center gap-2 text-white">
              <Play style={{ width: 18, height: 18 }} />
              Watch Demo
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
