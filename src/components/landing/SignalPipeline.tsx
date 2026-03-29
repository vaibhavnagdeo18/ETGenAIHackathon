"use client";

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SIGNAL_CONFIG } from '@/lib/types';
import { Zap, ArrowRight } from 'lucide-react';

const PIPELINE_ITEMS = [
  {
    key: 'bulk_deal' as const,
    source: 'NSE Bulk Deals portal',
    detail: 'Trades ≥ 0.5% of equity in a single session',
    stat: '14 events · last 30 days',
  },
  {
    key: 'insider_trading' as const,
    source: 'SEBI / BSE disclosures',
    detail: 'Promoter + executive transactions',
    stat: '9 events · last 30 days',
  },
  {
    key: 'technical_breakout' as const,
    source: 'Price + volume data',
    detail: '200-day MA cross · volume spike above 2× avg',
    stat: '21 events · last 30 days',
  },
  {
    key: 'news_sentiment' as const,
    source: 'Google News + Gemini AI',
    detail: 'AI-classified sentiment score per article',
    stat: '47 events · last 30 days',
  },
] as const;

export function SignalPipeline() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: '-80px' });

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-slate-100/80">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-14 max-w-xl">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600/70">
            Signal Layers
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Four sources that don&apos;t know each other.
          </h2>
          <p className="mt-4 text-base text-slate-500 leading-relaxed">
            When institutional, regulatory, technical, and news signals all fire on the same stock —
            that&apos;s not noise.
          </p>
        </div>

        {/* Pipeline */}
        <div
          ref={containerRef}
          className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-0"
        >
          {PIPELINE_ITEMS.map((item, i) => {
            const cfg = SIGNAL_CONFIG[item.key];
            const Icon = cfg.icon;
            return (
              <div key={item.key} className="flex flex-col lg:flex-row items-stretch flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: i * 0.12 }}
                  className={`flex-1 p-5 rounded-2xl lg:rounded-none ${i === 0 ? 'lg:rounded-l-2xl' : ''} ${i === 3 ? 'lg:rounded-r-2xl' : ''} border bg-white ${cfg.borderColor} hover:shadow-md transition-shadow`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bgColor} border ${cfg.borderColor} mb-4`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${cfg.color}`}>
                    {cfg.label}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">{item.source}</div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">{item.detail}</p>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    {item.stat}
                  </span>
                </motion.div>

                {/* Arrow connector between cards */}
                {i < 3 && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={inView ? { opacity: 1, scaleX: 1 } : {}}
                    transition={{ duration: 0.3, delay: i * 0.12 + 0.3 }}
                    style={{ transformOrigin: 'left' }}
                    className="hidden lg:flex items-center justify-center w-8 shrink-0 z-10"
                  >
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </motion.div>
                )}
              </div>
            );
          })}

          {/* Arrow to Convergence Engine */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={inView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.6 }}
            style={{ transformOrigin: 'left' }}
            className="hidden lg:flex items-center justify-center w-8 shrink-0"
          >
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </motion.div>

          {/* Convergence Engine node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.7, type: 'spring', stiffness: 200, damping: 18 }}
            className="lg:w-44 shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg shadow-indigo-500/10"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 text-center">
              Convergence
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 text-center">
              Engine
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
