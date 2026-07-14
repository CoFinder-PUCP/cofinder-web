import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/layout/query-provider';
import { PwaRegister } from '@/components/layout/pwa-register';
import { ShellWrapper } from '@/components/layout/shell-wrapper';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CoFinder — Encuentra tu cofounder PUCP',
  description: 'Conecta con estudiantes y alumni de la PUCP para co-emprender',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={geist.className}>
        <QueryProvider>
          <ShellWrapper>{children}</ShellWrapper>
        </QueryProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
