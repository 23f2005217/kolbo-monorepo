'use client';

import Link from 'next/link';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function NavHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-(--ads-dark-primary)/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-white hover:text-white">
              <Link href="/signin">Log In</Link>
            </Button>
            <Button asChild className="bg-(--ads-cyan) hover:bg-(--ads-cyan)/90 text-white">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
