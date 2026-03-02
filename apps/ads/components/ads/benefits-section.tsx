import { Users, Shield, Target, TrendingUp } from 'lucide-react';

interface Benefit {
  icon: React.ElementType;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: Target,
    title: 'Precision Targeting',
    description: 'Reach your ideal audience with advanced demographic and behavioral targeting across all devices.',
  },
  {
    icon: Users,
    title: 'Engaged Audiences',
    description: 'Access a generation of cord-cutters and one of the largest ad-supported streaming audiences.',
  },
  {
    icon: Shield,
    title: 'Brand Safety',
    description: 'Your ads appear alongside premium, brand-safe content from trusted publishers.',
  },
  {
    icon: TrendingUp,
    title: 'Performance Optimization',
    description: 'AI-powered optimization ensures your campaigns deliver maximum ROI and viewability.',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-(--ads-cyan)/10 flex items-center justify-center mb-4">
                  <Icon className="text-(--ads-cyan)" style={{ width: 24, height: 24 }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
