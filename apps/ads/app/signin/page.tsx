import { FeaturesPanel } from '@/components/ads/features-panel';
import { SignInForm } from '@/components/ads/signin-form';

export const metadata = {
  title: 'Sign In - KolBo Ads',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <FeaturesPanel />
      <SignInForm />
    </div>
  );
}
