"use client";

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { OpeningStatement } from '@/components/landing/OpeningStatement';
import { ConvergenceConcept } from '@/components/landing/ConvergenceConcept';
import { SignalPipeline } from '@/components/landing/SignalPipeline';
import { ConfidenceVisual } from '@/components/landing/ConfidenceVisual';
import { BacktestProof } from '@/components/landing/BacktestProof';
import { PlatformPreview } from '@/components/landing/PlatformPreview';
import { LandingCTA } from '@/components/landing/LandingCTA';

export default function LandingPage() {
  return (
    <div className="relative overflow-x-hidden bg-stone-50">
      <LandingNavbar />

      <main>
        <OpeningStatement />

        <div className="border-t border-slate-300/40" />
        <ConvergenceConcept />

        <div className="border-t border-slate-300/40" />
        <SignalPipeline />

        <div className="border-t border-slate-300/40" />
        <ConfidenceVisual />

        <div className="border-t border-slate-300/40" />
        <BacktestProof />

        <div className="border-t border-slate-300/40" />
        <PlatformPreview />

        <div className="border-t border-slate-300/40" />
        <LandingCTA />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/40 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-slate-400">
            SignalOS is a research tool. Not financial advice. Past convergence patterns do not guarantee future performance.
          </p>
          <p className="text-xs text-slate-400">NSE equities · India · Demo mode</p>
        </div>
      </footer>
    </div>
  );
}
