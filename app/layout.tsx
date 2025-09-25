import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ASCII Raymarcher • Mobile-Optimized',
  description: 'ASCII Raymarcher with SDF ray marching, adaptive resolution and TAA in Next.js + TypeScript',
  themeColor: '#0b0b0f'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}