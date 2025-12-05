import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { ThemeProvider } from '../components/ui/theme-provider';
import './globals.css';

const nunito = Nunito({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Walletize: Simplify your money',
  description: 'The open-source personal finance app that&apos;s simple and modern.',
  manifest: '/manifest.json',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={nunito.className + ' h-full'}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
