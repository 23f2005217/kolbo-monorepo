import type { Metadata } from 'next';
import { Geist, Geist_Mono, Roboto } from 'next/font/google';
import { UserAuthProvider } from '@/components/user-auth-provider';
import { SpatialNavigationProvider } from '@/contexts/spatial-navigation-provider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Kolbo',
  description: 'Kolbo — Watch, discover, and subscribe.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased`}
      >
        <SpatialNavigationProvider>
          <UserAuthProvider>
            {children}
          </UserAuthProvider>
        </SpatialNavigationProvider>
      </body>
    </html>
  );
}
