"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/40">
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SignalOS Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-[1.15rem] leading-none tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-800 bg-clip-text text-transparent">
                SignalOS
              </span>
              <div className="text-[8.5px] text-emerald-600/60 font-semibold tracking-[0.22em] uppercase leading-none mt-0.5">
                Convergence Engine
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            Open Platform
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
