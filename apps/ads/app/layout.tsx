import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KolBo Ads - Advertising Platform',
  description: 'Reach your audience with KolBo Ads.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="dark min-h-screen bg-(--ads-dark-primary) text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
