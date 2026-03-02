'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUserAuthContext } from '@/components/user-auth-provider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUserAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b14]">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-0.5 text-2xl font-bold tracking-tight text-white">
            KolB
            <span className="flex size-6 items-center justify-center rounded bg-white/90 text-[#0a0b14]">
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </Link>
          <p className="text-sm text-white/60">Sign in to your account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="flex h-10 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90FF]"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-white">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="flex h-10 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90FF]"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center w-full h-10 rounded-md bg-gradient-to-r from-[#4A90FF] to-[#6B5FFF] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center space-y-3">
          <p className="text-sm text-white/60">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#4A90FF] hover:text-[#6B5FFF] font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
