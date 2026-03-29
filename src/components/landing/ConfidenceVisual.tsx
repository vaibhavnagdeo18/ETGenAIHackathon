"use client";

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function ConfidenceRingStatic({ score }: { score: number }) {
  const radius = 26;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? '#818cf8' : score >= 70 ? '#60a5fa' : '#94a3b8';
  const label = score >= 85 ? 'High' : score >= 70 ? 'Medium' : 'Low';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="5" />
          <motion.circle
            cx="32" cy="32" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-slate-900 leading-none">{score}</span>
          <span className="text-[8px] text-slate-500 uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color }}>
        {label} Conf.
      </span>
    </div>
  );
}

const BADGES = [
  { label: 'Bulk Deal', color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { label: 'Insider', color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { label: 'Sentiment', color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
];

const FACTORS = [
  { arrow: '→', text: 'Signal strength — deal size, insider rank, volume multiple' },
  { arrow: '→', text: 'Recency — events in the last 48 hours carry more weight' },
  { arrow: '→', text: 'Type diversity — 4 distinct signal types scores higher than 4 of the same' },
];

export function ConfidenceVisual() {
  const cardRef = useRef(null);
  const cardInView = useInView(cardRef, { once: true, margin: '-80px' });

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Centered header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600/70">
            Confidence Scoring
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            A number with a reason.
          </h2>
          <p className="mt-4 text-base text-slate-500 max-w-md mx-auto">
            The confidence score isn&apos;t arbitrary. It&apos;s computed from three observable factors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — factors */}
          <div className="space-y-6">
            {FACTORS.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <span className="text-indigo-500 font-black text-lg mt-0.5 shrink-0">{f.arrow}</span>
                <p className="text-base text-slate-700 leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Right — static alert card mockup */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={cardInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative"
          >
            <div className="absolute -inset-3 bg-gradient-to-br from-indigo-50/50 to-violet-50/30 rounded-3xl blur-xl" />
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden">
              {/* Card header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/70 mb-1">
                      Convergence Alert
                    </div>
                    <div className="text-xl font-black text-slate-900 tracking-tight">ADANIENT</div>
                    <div className="text-sm text-slate-500 mt-0.5">Adani Enterprises Ltd.</div>
                  </div>
                  <ConfidenceRingStatic score={92} />
                </div>
              </div>

              {/* Signal badges */}
              <div className="px-5 py-4 flex flex-wrap gap-2">
                {BADGES.map(b => (
                  <span
                    key={b.label}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${b.bg} ${b.border} ${b.color}`}
                  >
                    {b.label}
                  </span>
                ))}
              </div>

              {/* Annotation */}
              <div className="px-5 pb-5">
                <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3 text-xs text-slate-500 leading-relaxed">
                  3 signal types · 4-day window · Promoter-class insider · Volume 2.8× average
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
