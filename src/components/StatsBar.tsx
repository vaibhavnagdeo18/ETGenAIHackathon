"use client";

import { useAppContext } from './AppContext';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-2">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  );
}

export function StatsBar() {
  const { alerts, stocks, signals } = useAppContext();

  const convergenceCount = useCountUp(alerts.length);
  const signalCount = useCountUp(signals.length);
  const stockCount = useCountUp(stocks.length);

  const avgConfidence = alerts.length > 0
    ? Math.round(alerts.reduce((s, a) => s + a.confidenceScore, 0) / alerts.length)
    : 0;

  const stats = [
    {
      label: 'Convergences',
      sublabel: 'Active alerts',
      value: convergenceCount,
      raw: alerts.length,
      suffix: '',
      icon: null,
      imageSrc: '/convergence.png',
      color: 'text-indigo-600',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      bar: 'bg-indigo-500',
      barMax: 10,
      glow: '',
    },
    {
      label: 'Active Signals',
      sublabel: 'Across all stocks',
      value: signalCount,
      raw: signals.length,
      suffix: '',
      icon: null,
      imageSrc: '/averagesignals.png',
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      bar: 'bg-emerald-500',
      barMax: 30,
      glow: '',
    },
    {
      label: 'Monitored',
      sublabel: 'NSE equities',
      value: stockCount,
      raw: stocks.length,
      suffix: '',
      icon: null,
      imageSrc: '/monitored.png',
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      bar: 'bg-blue-500',
      barMax: 60,
      glow: '',
    },
    {
      label: 'Avg Confidence',
      sublabel: alerts.length ? `${alerts.length} active alert${alerts.length > 1 ? 's' : ''}` : 'No active alerts',
      value: avgConfidence,
      raw: avgConfidence,
      suffix: '%',
      icon: null,
      imageSrc: '/confidence.jpg',
      color: 'text-violet-600',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      bar: 'bg-violet-500',
      barMax: 100,
      glow: '',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, staggerChildren: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
          >
            <Card className={`relative overflow-hidden p-5 bg-white/60 border-slate-200/60 backdrop-blur-xl group hover:bg-white/80 transition-all cursor-default`}>
              {/* Top accent stripe */}
              <div className={`absolute top-0 left-0 w-full h-[2px] ${stat.bar} opacity-40 group-hover:opacity-70 transition-opacity`} />

              <div className="flex items-start justify-between mb-1">
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tighter text-slate-900">
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-lg font-bold text-slate-400">{stat.suffix}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{stat.sublabel}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  {stat.imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={stat.imageSrc} alt={stat.label} className="w-8 h-8 object-contain mix-blend-multiply" />
                  ) : (
                    Icon && <Icon className={`w-5 h-5 ${stat.color}`} />
                  )}
                </div>
              </div>

              <MiniBar value={stat.raw} max={stat.barMax} color={stat.bar} />
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
