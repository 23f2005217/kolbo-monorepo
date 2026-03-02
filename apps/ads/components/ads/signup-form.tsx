'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    contactName: '',
    companyName: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-(--ads-dark-secondary)">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <Logo size="md" className="mb-12" />

          <h2 className="text-3xl font-bold text-white mb-3">
            Create your account
          </h2>
          <p className="text-gray-400 text-sm">
            Get started with streaming TV advertising in minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-white text-sm">
                Full name
              </Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                placeholder="Chaim Hershkov"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-white text-sm">
                Company
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                placeholder="Torah Treasure"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm">
              Work email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              placeholder="chaim@torahtreasure.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-sm">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 pr-10"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff style={{ width: 18, height: 18 }} />
                ) : (
                  <Eye style={{ width: 18, height: 18 }} />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-(--ads-cyan) hover:bg-(--ads-cyan)/90 text-white h-11"
          >
            {loading ? 'Creating account...' : 'Create account'}
            {!loading && <ArrowRight style={{ width: 18, height: 18 }} />}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-(--ads-cyan) hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-(--ads-cyan) hover:underline">
              Privacy Policy
            </Link>
          </p>

          <p className="text-sm text-center text-gray-400">
            Already have an account?{' '}
            <Link href="/signin" className="text-(--ads-cyan) hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
