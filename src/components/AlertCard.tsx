"use client";

import React, { useState } from 'react';
import { ConvergenceAlert, Signal, SIGNAL_CONFIG } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { SignalBadge } from './SignalBadge';
import { TimelineView } from './TimelineView';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, ChevronDown, Database, TrendingUp, FileText } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

// ── Radial confidence ring ───────────────────────────────────────────────
function ConfidenceRing({ score }: { score: number }) {
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

// ── Signal detail row ─────────────────────────────────────────────────────
function SignalRow({ signal }: { signal: Signal }) {
  const cfg = SIGNAL_CONFIG[signal.signalType];
  const meta = signal.metadata;

  const keyDetail =
    meta.dealSize         ? `Deal: ${meta.dealSize}` :
    meta.insiderName      ? `${meta.insiderName} (${meta.insiderDesignation ?? 'Insider'})` :
    meta.volumeMultiple   ? `${meta.volumeMultiple}× avg volume` :
    meta.sentiment        ? `Sentiment: ${meta.sentiment}` :
    (meta.newsHeadline ? meta.newsHeadline.slice(0, 60) + '…' : '');

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bgColor} ${cfg.borderColor} group`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${cfg.bgColor} border ${cfg.borderColor}`}>
        <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
          <span className="text-[10px] text-slate-500">{format(signal.timestamp, 'MMM d, yyyy')}</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed truncate">{meta.description}</p>
        {keyDetail && (
          <span className="inline-block mt-1 text-[9px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
            {keyDetail}
          </span>
        )}
      </div>
    </div>
  );
}

// ── AI sentence icons ────────────────────────────────────────────────────
const SENTENCE_META = [
  { icon: FileText,   label: 'What Happened',    color: 'text-slate-700', labelColor: 'text-slate-500' },
  { icon: TrendingUp, label: 'Why It Matters',   color: 'text-indigo-700', labelColor: 'text-indigo-600' },
  { icon: Database,   label: 'Historical Edge',  color: 'text-violet-700', labelColor: 'text-violet-600' },
];

// ── Main AlertCard ──────────────────────────────────────────────────────
export function AlertCard({ alert, delay = 0 }: { alert: ConvergenceAlert; delay?: number }) {
  const [expanded, setExpanded] = useState(false);
  const isHighConfidence = alert.confidenceScore >= 80;
  const daySpan = Math.ceil(
    (new Date(alert.windowEnd).getTime() - new Date(alert.windowStart).getTime()) / 86400000
  ) || 1;

  // Split AI summary into sentences (max 3)
  const sentences = alert.aiSummary
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group"
    >
      <Card className={`relative overflow-hidden bg-white/80 backdrop-blur-xl border transition-all duration-300 ${
        isHighConfidence
          ? 'border-indigo-500/25 hover:border-indigo-500/45 shadow-[0_0_15px_rgba(99,102,241,0.06)] hover:shadow-[0_0_25px_rgba(99,102,241,0.10)]'
          : 'border-slate-200 hover:border-slate-300'
      }`}>

        {/* Top gradient accent */}
        {isHighConfidence && (
          <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/70 to-violet-500/0" />
        )}
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/2 blur-[120px] rounded-full pointer-events-none group-hover:bg-indigo-500/4 transition-colors duration-700" />

        <div className="relative z-10 p-6 sm:p-8">

          {/* ── Header Row ─────────────────────────────── */}
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600/70">
                  Convergence Alert
                </span>
                <span className="text-slate-300">·</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isHighConfidence
                    ? 'text-indigo-600 bg-indigo-500/10 border-indigo-500/30'
                    : 'text-slate-500 bg-slate-200/50 border-slate-300'
                }`}>
                  {alert.signals.length} signals · {daySpan} days
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
                {alert.stock}
              </h2>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold text-slate-700 tracking-wider">{alert.stockSymbol}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(alert.timestamps[alert.timestamps.length - 1], { addSuffix: true })}
                </span>
              </div>

              {/* Signal badges row */}
              <div className="flex flex-wrap gap-2 mt-3">
                {alert.signals.map(sig => (
                  <SignalBadge key={sig.id} type={sig.signalType} size="sm" />
                ))}
              </div>
            </div>

            {/* Confidence Ring */}
            <ConfidenceRing score={alert.confidenceScore} />
          </div>

          {/* ── AI Synthesis Block ──────────────────────── */}
          <div className="relative bg-slate-50/80 rounded-2xl border border-slate-200/50 overflow-hidden mb-5">
            <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-slate-200/50">
              <div className="p-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                AI Synthesis · Gemini
              </span>
            </div>

            <div className="p-5 space-y-4">
              {sentences.length > 0 ? sentences.map((sentence, idx) => {
                const meta = SENTENCE_META[idx] ?? SENTENCE_META[0];
                const Icon = meta.icon;
                return (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-5 h-5 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center`}>
                        <Icon className={`w-2.5 h-2.5 ${meta.labelColor}`} />
                      </div>
                    </div>
                    <div>
                      <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${meta.labelColor}`}>
                        {meta.label}
                      </div>
                      <p className={`text-sm leading-relaxed ${meta.color}`}>
                        {sentence}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-slate-500 italic">Generating AI summary…</p>
              )}
            </div>
          </div>

          {/* ── Timeline ────────────────────────────────── */}
          <div className="bg-slate-100/60 rounded-xl border border-slate-200/40 px-5 pt-3 pb-1 mb-4">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0">
              Convergence Window · {format(new Date(alert.windowStart), 'MMM d')} → {format(new Date(alert.windowEnd), 'MMM d, yyyy')}
            </div>
            <TimelineView
              signals={alert.signals}
              windowStart={alert.windowStart}
              windowEnd={alert.windowEnd}
            />
          </div>

          {/* ── Expandable Signal Details ──────────────── */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/40 transition-all border border-slate-200/60 group/btn"
          >
            <span>Signal Details ({alert.signals.length})</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2">
                  {alert.signals.map(sig => (
                    <SignalRow key={sig.id} signal={sig} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </Card>
    </motion.div>
    </motion.div>
  );
}
