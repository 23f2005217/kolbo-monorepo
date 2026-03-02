import { FeaturesPanel } from '@/components/ads/features-panel';
import { SignUpForm } from '@/components/ads/signup-form';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <FeaturesPanel />
      <SignUpForm />
    </div>
  );
}
