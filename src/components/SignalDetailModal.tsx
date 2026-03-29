"use client";

import { Signal, SIGNAL_CONFIG } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Database, Tag, Info } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  signal: Signal | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-200/60 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 shrink-0 mt-0.5">
        {label}
      </span>
      <span className="text-xs text-slate-700 text-right font-medium leading-relaxed">
        {String(value)}
      </span>
    </div>
  );
}

export function SignalDetailModal({ signal, onClose }: Props) {
  if (!signal) return null;
  const cfg = SIGNAL_CONFIG[signal.signalType];
  const Icon = cfg.icon;
  const meta = signal.metadata;

  return (
    <AnimatePresence>
      {signal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-x-4 bottom-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-8 sm:w-[480px] z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className={`flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200/70 ${cfg.bgColor}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.bgColor} border ${cfg.borderColor}`}>
                  <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                </div>
                <div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                    {cfg.label}
                  </div>
                  <div className="text-sm font-bold text-slate-900">{signal.stock}</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-1">
              {/* Description */}
              <div className="flex gap-2.5 mb-3 p-3 bg-slate-100/40 rounded-xl border border-slate-200/60">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">{meta.description}</p>
              </div>

              <Row label="Symbol" value={signal.stockSymbol} />
              <Row label="Source" value={signal.source} />
              <Row label="Date" value={format(signal.timestamp, 'MMM d, yyyy · h:mm a')} />
              <Row label="Price at Signal" value={meta.priceAtSignal != null ? `₹${meta.priceAtSignal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : undefined} />
              <Row label="Deal Size" value={meta.dealSize} />
              <Row label="Buyer / Seller" value={meta.buyerSeller} />
              <Row label="Insider" value={meta.insiderName} />
              <Row label="Designation" value={meta.insiderDesignation} />
              <Row label="Transaction" value={meta.transactionType ? (meta.transactionType === 'buy' ? '▲ BUY' : '▼ SELL') : undefined} />
              <Row label="Volume" value={meta.volume != null ? `${(meta.volume / 1_000_000).toFixed(2)}M shares` : undefined} />
              <Row label="Volume Multiple" value={meta.volumeMultiple != null ? `${meta.volumeMultiple.toFixed(1)}× avg` : undefined} />
              <Row label="200-day MA" value={meta.maValue != null ? `₹${meta.maValue.toFixed(2)}` : undefined} />
              <Row label="Sentiment" value={meta.sentiment} />
              <Row label="Headline" value={meta.newsHeadline} />
              <Row label="News Source" value={meta.newsSource} />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-200/60 flex items-center gap-2">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-400 font-mono">
                Signal ID: {signal.id}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <Database className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] text-slate-400">{cfg.description}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
