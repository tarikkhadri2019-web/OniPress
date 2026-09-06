import type { Metadata } from 'next';
import { Inter, Playfair_Display, Dancing_Script } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['italic'],
  weight: ['700', '900'],
  variable: '--font-display',
});

const dancing = Dancing_Script({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-cursive',
});

export const metadata: Metadata = {
  title: 'OniPress | AI WordPress Auto-Blogger',
  description: 'Open-source WordPress AI auto-blogging dashboard powered by Gemini AI via Antigravity.',
  icons: {
    icon: '/icon.jpg',
    shortcut: '/icon.jpg',
    apple: '/icon.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} ${dancing.variable} font-sans antialiased h-full overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
