import { Tv } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 28 : 24;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <Link href="/ads" className={`flex items-center gap-2 ${className}`}>
      <Tv className="text-(--ads-cyan)" style={{ width: iconSize, height: iconSize }} />
      <span className={`font-semibold ${textSize}`}>
        KolBo <span className="text-(--ads-cyan)">Ads</span>
      </span>
    </Link>
  );
}
