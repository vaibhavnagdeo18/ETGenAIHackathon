"use client";

import { usePathname } from 'next/navigation';
import { AppProvider } from '@/components/AppContext';
import { Navbar } from '@/components/Navbar';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';

// Routes that bypass the app shell (no Navbar, no AppProvider, full-bleed)
const LANDING_ROUTES = new Set(['/']);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (LANDING_ROUTES.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <AppProvider>
      <TooltipProvider>
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
          <DisclaimerBanner />
        </div>
        <ServiceWorkerRegistrar />
      </TooltipProvider>
    </AppProvider>
  );
}
