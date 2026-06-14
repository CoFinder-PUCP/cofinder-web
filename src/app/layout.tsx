import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/layout/query-provider';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CoFinder — Encuentra tu cofounder PUCP',
  description: 'Conecta con estudiantes y alumni de la PUCP para co-emprender',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={geist.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
