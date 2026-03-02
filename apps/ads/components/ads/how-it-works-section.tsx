import { UserPlus, Settings, Rocket, BarChart3 } from 'lucide-react';

interface Step {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up in seconds with your email. No credit card required to get started.',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Build Campaign',
    description: 'Set your budget, define your audience, and upload your creative assets.',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Launch & Optimize',
    description: 'Go live instantly and let AI optimize your campaign for best performance.',
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'Track Results',
    description: 'Monitor real-time analytics and measure your campaign success.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-(--ads-cyan)">Works</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Get your streaming TV ads live in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-(--ads-cyan)/30 flex items-center justify-center mx-auto mb-6">
                  <Icon className="text-(--ads-cyan)" style={{ width: 32, height: 32 }} />
                </div>
                <div className="text-(--ads-cyan) text-sm font-semibold mb-3">
                  STEP {step.number}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
