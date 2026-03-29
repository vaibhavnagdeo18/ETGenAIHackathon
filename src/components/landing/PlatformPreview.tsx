"use client";

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Target, TrendingUp } from 'lucide-react';

const PREVIEW_ALERTS = [
  {
    symbol: 'ADANIENT',
    name: 'Adani Enterprises',
    score: 92,
    color: '#818cf8',
    badges: [
      { label: 'Bulk Deal', color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
      { label: 'Insider', color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
      { label: 'Sentiment', color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    ],
    window: 'Jan 15 – Jan 19',
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    score: 88,
    color: '#818cf8',
    badges: [
      { label: 'Breakout', color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
      { label: 'Insider', color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
      { label: 'Sentiment', color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    ],
    window: 'Feb 05 – Feb 09',
  },
];

function MiniConfRing({ score, color }: { score: number; color: string }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-11 h-11 shrink-0">
      <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-black text-slate-900 leading-none">{score}</span>
      </div>
    </div>
  );
}

export function PlatformPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-12 max-w-lg">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600/70">
            The Platform
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            What you actually get.
          </h2>
          <p className="mt-4 text-base text-slate-500">
            A focused feed of convergence events — not a chart terminal.
          </p>
        </div>

        {/* Browser frame */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ perspective: '1200px' }}
        >
          <div style={{ transform: 'rotateX(3deg)', transformOrigin: 'center top' }} className="rounded-2xl shadow-2xl shadow-slate-300/60 overflow-hidden border border-slate-200">
            {/* Chrome bar */}
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 max-w-xs mx-auto">
                <div className="bg-slate-700/70 rounded-md px-3 py-1 text-[11px] text-slate-400 font-mono text-center">
                  signalos.app/alerts
                </div>
              </div>
            </div>

            {/* App content */}
            <div className="bg-white p-6 min-h-[420px]">
              {/* Page header */}
              <div className="mb-5">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/70 mb-1">
                  Convergence Engine
                </div>
                <h3 className="text-2xl font-black text-slate-900">Convergence Intel</h3>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Zap, label: 'Total Alerts', value: '5', color: 'text-indigo-600', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                  { icon: Target, label: 'Avg Confidence', value: '82/100', color: 'text-violet-600', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
                  { icon: TrendingUp, label: 'High Confidence', value: '3', color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className={`flex items-center gap-2.5 p-3 rounded-xl border ${stat.bg} ${stat.border}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.bg} border ${stat.border}`}>
                        <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</div>
                        <div className={`text-base font-black ${stat.color}`}>{stat.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Alert cards */}
              <div className="space-y-4">
                {PREVIEW_ALERTS.map(alert => (
                  <div
                    key={alert.symbol}
                    className="rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <MiniConfRing score={alert.score} color={alert.color} />
                          <div>
                            <div className="font-black text-slate-900 text-base">{alert.symbol}</div>
                            <div className="text-xs text-slate-500">{alert.name}</div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {alert.badges.map(b => (
                                <span
                                  key={b.label}
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${b.bg} ${b.border} ${b.color}`}
                                >
                                  {b.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 shrink-0">{alert.window}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
