"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, User, Newspaper, Zap } from 'lucide-react';

const BEATS = [
  {
    type: 'bulk_deal',
    icon: Package,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    label: 'Bulk Deal',
    detail: 'GQG Partners acquired 1.2 Cr shares',
    meta: '₹3,216 Cr · Jan 15',
  },
  {
    type: 'insider',
    icon: User,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    label: 'Insider',
    detail: 'S.B. Adani Family Trust acquired 45L shares',
    meta: 'Promoter · Jan 17',
  },
  {
    type: 'sentiment',
    icon: Newspaper,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    label: 'Sentiment',
    detail: 'Adani Green bags 2 GW solar deal',
    meta: 'Positive · Jan 19',
  },
];

const STEP_DELAYS = [0, 1200, 2400, 3600]; // ms between steps
const LOOP_PAUSE = 5000; // pause at step 4 before resetting

export function ConvergenceEventPlayer() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (step < 4) {
      const delay = step === 0 ? 400 : 1200;
      timeout = setTimeout(() => setStep(s => s + 1), delay);
    } else {
      // At step 4, pause then reset
      timeout = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setStep(0);
          setVisible(true);
        }, 600);
      }, LOOP_PAUSE);
    }

    return () => clearTimeout(timeout);
  }, [step]);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <AnimatePresence>
        {visible && (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            {/* Stock label */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tracking</span>
                  <span className="text-sm font-black text-slate-900 tracking-tight bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                    ADANIENT
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Signal beats */}
            <div className="relative pl-6">
              {/* Timeline line */}
              <AnimatePresence>
                {step >= 3 && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    style={{ transformOrigin: 'top' }}
                    className="absolute left-[5px] top-4 bottom-4 w-px bg-gradient-to-b from-slate-300 to-indigo-300"
                  />
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {BEATS.map((beat, idx) => {
                  const Icon = beat.icon;
                  return (
                    <AnimatePresence key={beat.type}>
                      {step >= idx + 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                          className="relative"
                        >
                          {/* Timeline dot */}
                          <div className={`absolute -left-6 top-3.5 w-2.5 h-2.5 rounded-full border-2 border-white ${beat.bg.replace('/10', '')} shadow-sm`} />

                          <div className={`flex items-start gap-3 p-3 rounded-xl border ${beat.bg} ${beat.border}`}>
                            <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${beat.bg} border ${beat.border}`}>
                              <Icon className={`w-3.5 h-3.5 ${beat.color}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${beat.color}`}>
                                  {beat.label}
                                </span>
                                <span className="text-[10px] text-slate-400">{beat.meta.split('·')[1]?.trim()}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5 leading-snug">{beat.detail}</p>
                              <span className="inline-block mt-1 text-[9px] text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                                {beat.meta.split('·')[0]?.trim()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>
            </div>

            {/* Convergence fires */}
            <AnimatePresence>
              {step >= 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    boxShadow: [
                      '0 0 0px rgba(99,102,241,0)',
                      '0 0 32px rgba(99,102,241,0.45)',
                      '0 0 16px rgba(99,102,241,0.2)',
                    ],
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-50/90 to-violet-50/70 p-4 mt-2"
                >
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-indigo-500/60 via-violet-500/40 to-transparent" />
                  <div className="flex items-center gap-4">
                    {/* Ring */}
                    <div className="relative w-14 h-14 shrink-0">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <motion.circle
                          cx="28" cy="28" r="22"
                          fill="none"
                          stroke="#818cf8"
                          strokeWidth="4"
                          strokeDasharray={2 * Math.PI * 22}
                          initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - 0.92) }}
                          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-base font-black text-slate-900 leading-none">92</span>
                        <span className="text-[7px] text-slate-500 uppercase tracking-wider">/100</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-black text-slate-900">Convergence Alert</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                        High Confidence
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">3 signals · 4-day window · ADANIENT</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
