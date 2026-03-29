"use client";

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function LandingCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/50 via-stone-100/60 to-stone-50">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600/70">
          Ready to explore
        </span>

        <h2 className="mt-4 text-5xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          50 stocks.
          <br />
          4 signal layers.
          <br />
          <span className="text-indigo-600">One platform.</span>
        </h2>

        <motion.div
          className="mt-10"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold rounded-xl shadow-xl shadow-indigo-500/25 transition-colors"
          >
            Open Platform
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        <p className="mt-5 text-xs text-slate-400">
          No login required · Demo mode active by default · NSE equities only
        </p>
      </motion.div>
    </section>
  );
}
