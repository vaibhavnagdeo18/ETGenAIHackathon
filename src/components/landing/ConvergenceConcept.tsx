"use client";

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, User, Newspaper, Zap } from 'lucide-react';

const TIMELINE_EVENTS = [
  {
    day: 'Day 1 · Feb 05',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    label: 'Technical Breakout',
    text: 'TATAMOTORS broke 200-day MA at ₹895 on 3.2× average volume — highest volume in 6 months.',
  },
  {
    day: 'Day 3 · Feb 07',
    icon: User,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    dotColor: 'bg-purple-500',
    label: 'Insider',
    text: 'CFO P.B. Balaji purchased 50,000 shares at ₹940. SEBI disclosure filed same day.',
  },
  {
    day: 'Day 5 · Feb 09',
    icon: Newspaper,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    dotColor: 'bg-amber-500',
    label: 'News Sentiment',
    text: 'JLR quarterly earnings beat analyst estimates by 18%. Positive AI sentiment score: 0.87.',
  },
];

function TimelineNode({ event, index }: { event: typeof TIMELINE_EVENTS[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const Icon = event.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -32 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
      className="relative pl-10"
    >
      {/* Dot */}
      <div className={`absolute left-0 top-4 w-3 h-3 rounded-full ${event.dotColor} border-2 border-white shadow-sm`} />

      <div className={`p-4 rounded-xl border ${event.bg} ${event.border}`}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${event.bg} border ${event.border}`}>
              <Icon className={`w-3 h-3 ${event.color}`} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${event.color}`}>
              {event.label}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">{event.day}</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{event.text}</p>
      </div>
    </motion.div>
  );
}

export function ConvergenceConcept() {
  const lineRef = useRef(null);
  const lineInView = useInView(lineRef, { once: true, margin: '-60px' });

  const alertRef = useRef(null);
  const alertInView = useInView(alertRef, { once: true, margin: '-60px' });

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-14">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600/70">
            How it works
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Three independent sources.
            <br />
            <span className="text-slate-400">Five days apart.</span>
            <br />
            One stock.
          </h2>
        </div>

        {/* Timeline */}
        <div ref={lineRef} className="relative">
          {/* Vertical connecting line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={lineInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.0, ease: 'easeInOut', delay: 0.2 }}
            style={{ transformOrigin: 'top' }}
            className="absolute left-[5px] top-4 bottom-16 w-px bg-gradient-to-b from-emerald-300 via-purple-300 to-amber-300"
          />

          <div className="space-y-6">
            {TIMELINE_EVENTS.map((event, i) => (
              <TimelineNode key={event.label} event={event} index={i} />
            ))}
          </div>
        </div>

        {/* Convergence fires */}
        <motion.div
          ref={alertRef}
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={alertInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="relative mt-8 ml-10 overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-50/90 to-violet-50/70 p-5"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-indigo-500/60 via-violet-500/40 to-transparent" />

          <div className="flex items-center gap-5">
            {/* Confidence ring */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                <motion.circle
                  cx="32" cy="32" r="26"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 26}
                  initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                  animate={alertInView ? { strokeDashoffset: 2 * Math.PI * 26 * (1 - 0.88) } : {}}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-slate-900 leading-none">88</span>
                <span className="text-[8px] text-slate-500 uppercase tracking-wider">/100</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-black text-slate-900">Convergence Alert Fired</span>
              </div>
              <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-1">High Confidence</div>
              <div className="text-xs text-slate-500">3 signal types · 5-day window · TATAMOTORS</div>
            </div>
          </div>
        </motion.div>

        <p className="mt-6 text-sm text-slate-400 ml-10">
          This is a convergence. SignalOS detects these automatically across 50 NSE equities.
        </p>
      </div>
    </section>
  );
}
