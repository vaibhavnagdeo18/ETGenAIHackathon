"use client";

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

const OUTCOMES = [
  {
    stock: 'Adani Enterprises',
    symbol: 'ADANIENT',
    conf: 92,
    hit: true,
    move: '+23.1%',
    period: 'in 30d',
  },
  {
    stock: 'Tata Motors',
    symbol: 'TATAMOTORS',
    conf: 88,
    hit: true,
    move: '+20.1%',
    period: 'in 30d',
  },
  {
    stock: 'HDFC Bank',
    symbol: 'HDFCBANK',
    conf: 61,
    hit: false,
    move: '−1.3%',
    period: 'in 30d',
  },
] as const;

function CountUp({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 1400;

    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [inView, target]);

  return <span ref={ref}>{value}</span>;
}

export function BacktestProof() {
  const rowsRef = useRef(null);
  const rowsInView = useInView(rowsRef, { once: true, margin: '-60px' });

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-slate-100/80">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-14">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600/70">
            Backtest Results
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Does it actually work?
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — big stat */}
          <div>
            <div className="text-8xl sm:text-9xl font-black text-indigo-600 leading-none tabular-nums">
              <CountUp target={67} />%
            </div>
            <p className="mt-4 text-base text-slate-700 font-semibold leading-snug max-w-xs">
              of alerts with confidence ≥ 80 moved 5%+ within 30 days
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Across 145 tracked NSE events. Including misses.
            </p>
          </div>

          {/* Right — outcome rows */}
          <div ref={rowsRef} className="space-y-3">
            {OUTCOMES.map((o, i) => (
              <motion.div
                key={o.symbol}
                initial={{ opacity: 0, x: -16 }}
                animate={rowsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  o.hit
                    ? 'bg-emerald-50/60 border-emerald-200/60'
                    : 'bg-rose-50/40 border-rose-200/40'
                }`}
              >
                {o.hit
                  ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  : <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                }

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm">{o.stock}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{o.symbol}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-sm font-black ${o.hit ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {o.move} <span className="text-xs font-semibold opacity-70">{o.period}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Confidence: {o.conf}</div>
                </div>
              </motion.div>
            ))}

            <p className="text-xs text-slate-400 pt-2 leading-relaxed">
              We show the misses too. A confidence score below 70 means the system is uncertain — and it says so.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
