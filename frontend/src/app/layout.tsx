import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Manrope, Noto_Sans_Bengali } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-sans' });
const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-bengali',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Agriqon ERP | Multi-Tenant Agriculture ERP SaaS',
  description:
    'Production-grade multi-tenant ERP platform for agricultural logistics, stock tracking, and financial ledgers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn('h-full antialiased', 'font-sans', manrope.variable, notoBengali.variable)}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <TooltipProvider>
          <AuthProvider>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <Toaster position="bottom-right" />
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
