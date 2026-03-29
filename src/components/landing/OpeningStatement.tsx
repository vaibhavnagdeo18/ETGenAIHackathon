"use client";

import { motion } from 'framer-motion';
import { ConvergenceEventPlayer } from './ConvergenceEventPlayer';

export function OpeningStatement() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 bg-gradient-to-br from-indigo-50/70 via-stone-50 to-violet-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600/70">
                NSE Convergence Intelligence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.04]"
            >
              When insiders, institutions, and charts agree —
              <span className="text-indigo-600"> at the same time.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 text-lg text-slate-500 max-w-lg leading-relaxed"
            >
              SignalOS detects when 2+ independent signal types hit the same NSE stock within a 7-day window —
              and tells you exactly how confident to be.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Bulk Deals
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Insider Activity
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Technical Breakouts
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                News Sentiment
              </div>
            </motion.div>
          </div>

          {/* Right — Live animation */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-indigo-50/60 to-violet-50/40 rounded-3xl blur-2xl" />
            <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/70">
                  Live Signal Stream
                </span>
              </div>
              <ConvergenceEventPlayer />
            </div>
          </motion.div>

        </div>
      </div>

    </section>
  );
}
