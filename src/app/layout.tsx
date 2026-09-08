import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'OniPress | Autonomous SEO & Orbital Command Bridge',
  description: 'Enterprise-grade autonomous SEO copywriting, multi-site WordPress fleet management, and Google Search Console Fast Indexing engine.',
  icons: {
    icon: '/oni_logo.png',
    shortcut: '/oni_logo.png',
    apple: '/oni_logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${jakarta.variable} ${mono.variable} font-sans antialiased bg-[#f8fafc] text-[#0f172a] min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
