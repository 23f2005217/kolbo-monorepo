import { CheckCircle } from 'lucide-react';

const features = [
  'Access 500+ premium channels',
  'AI-powered campaign optimization',
  'Real-time analytics dashboard',
  'No minimum spend required',
];

export function FeaturesPanel() {
  return (
    <div className="flex-1 flex items-center justify-center p-12 lg:p-16" style={{ background: 'linear-gradient(135deg, var(--ads-teal-start) 0%, var(--ads-teal-end) 100%)' }}>
      <div className="max-w-md">
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-12 leading-tight">
          Start Advertising on Streaming TV Today
        </h1>
        
        <div className="space-y-6">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-4">
              <CheckCircle className="text-(--ads-cyan) shrink-0" style={{ width: 24, height: 24 }} />
              <span className="text-white text-lg">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
