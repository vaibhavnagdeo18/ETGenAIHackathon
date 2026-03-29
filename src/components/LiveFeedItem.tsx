import React from 'react';
import { Signal, SIGNAL_CONFIG } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

export function LiveFeedItem({ signal }: { signal: Signal }) {
  const config = SIGNAL_CONFIG[signal.signalType];
  const meta = signal.metadata;

  // Build key chips from metadata
  const chips: string[] = [];
  if (meta.dealSize)       chips.push(meta.dealSize);
  if (meta.insiderName)    chips.push(meta.insiderName);
  if (meta.volumeMultiple) chips.push(`${meta.volumeMultiple}× volume`);
  if (meta.sentiment)      chips.push(meta.sentiment.toUpperCase());
  if (meta.transactionType) chips.push(meta.transactionType === 'buy' ? '▲ BUY' : '▼ SELL');

  return (
    <motion.div
      initial={{ opacity: 0, x: -24, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.95 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      layout
    >
      <Card className={`relative overflow-hidden flex items-start gap-4 p-4 bg-white/80 border-slate-200 backdrop-blur-xl transition-all duration-300 group`}>
        {/* Left accent stripe */}
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${config.bgColor.replace('/10', '')} opacity-60 group-hover:opacity-100 transition-opacity`} />

        {/* Signal icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${config.bgColor} border ${config.borderColor} shadow-inner`}>
          <config.icon className={`w-5 h-5 ${config.color}`} />
        </div>

        <div className="flex-1 min-w-0 pl-1">
          {/* Top row: stock + time */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{signal.stock}</h4>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                {signal.stockSymbol}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium shrink-0">
              {formatDistanceToNow(signal.timestamp, { addSuffix: true })}
            </span>
          </div>

          {/* Signal type + source */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${config.color} ${config.bgColor} px-2 py-0.5 rounded-full border ${config.borderColor}`}>
              {config.label}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ExternalLink className="w-2.5 h-2.5" />
              {signal.source}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 leading-relaxed mb-2">{meta.description}</p>

          {/* Key data chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip, i) => (
                <span
                  key={i}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    chip.includes('BUY')  ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' :
                    chip.includes('SELL') ? 'text-rose-600 bg-rose-500/10 border-rose-500/20' :
                    chip.includes('POSITIVE') ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' :
                    chip.includes('NEGATIVE') ? 'text-rose-600 bg-rose-500/10 border-rose-500/20' :
                    'text-slate-500 bg-slate-200/60 border-slate-300/50'
                  }`}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
