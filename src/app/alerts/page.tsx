"use client";

import { useState, useMemo } from 'react';
import { useAppContext } from '@/components/AppContext';
import { AlertCard } from '@/components/AlertCard';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Download } from 'lucide-react';

function exportAlertsCSV(alerts: import('@/lib/types').ConvergenceAlert[]) {
  const header = ['Stock', 'Symbol', 'Signal Types', 'Signal Count', 'Confidence', 'Window Start', 'Window End', 'Status', 'AI Summary'];
  const rows = alerts.map(a => [
    a.stock,
    a.stockSymbol,
    a.signalTypes.join(' + '),
    a.signals.length,
    a.confidenceScore,
    a.windowStart,
    a.windowEnd,
    a.status,
    `"${a.aiSummary.replace(/"/g, '""')}"`,
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `signalos-alerts-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type ConfFilter = 'all' | 'high' | 'medium';

export default function AlertsPage() {
  const { alerts, isLoading, thresholds } = useAppContext();
  const [confFilter, setConfFilter] = useState<ConfFilter>('all');

  const visibleAlerts = useMemo(
    () => alerts.filter(a => a.confidenceScore >= thresholds.minConfidenceToShow),
    [alerts, thresholds.minConfidenceToShow]
  );

  const filtered = useMemo(() => {
    if (confFilter === 'high')   return visibleAlerts.filter(a => a.confidenceScore >= 80);
    if (confFilter === 'medium') return visibleAlerts.filter(a => a.confidenceScore >= 60 && a.confidenceScore < 80);
    return visibleAlerts;
  }, [visibleAlerts, confFilter]);

  const avgConf = visibleAlerts.length
    ? Math.round(visibleAlerts.reduce((s, a) => s + a.confidenceScore, 0) / visibleAlerts.length)
    : 0;

  const highCount = visibleAlerts.filter(a => a.confidenceScore >= 80).length;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-12 w-64 bg-slate-200/60 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-200/40 rounded-xl animate-pulse" />)}
        </div>
        {[...Array(2)].map((_, i) => <div key={i} className="h-72 bg-slate-200/30 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24">

      {/* ── Header ───────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80">
            Convergence Engine
          </span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
            Convergence Intel
          </h1>
          {alerts.length > 0 && (
            <button
              onClick={() => exportAlertsCSV(alerts)}
              className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 bg-slate-100/40 hover:bg-slate-200/50 px-3 py-1.5 rounded-lg transition-all"
              title="Export alerts as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          )}
        </div>
        <p className="text-sm text-slate-500 max-w-2xl">
          High-probability opportunities where <span className="text-slate-700 font-semibold">2+ independent signals</span> overlap
          on the same stock within a 7-day window. Each alert includes a Gemini-generated 3-sentence analysis.
        </p>
      </div>

      {/* ── Stats strip ───────────────────────────────── */}
      {visibleAlerts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: null,       imageSrc: '/alerts.jpg',        iconSize: 'w-6 h-6',   label: 'Total Alerts',    value: `${alerts.length}`,  color: 'text-indigo-600', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
            { icon: null,       imageSrc: '/avgconfidence.jpg', iconSize: 'w-7 h-7',   label: 'Avg Confidence',  value: `${avgConf}/100`,     color: 'text-violet-600', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
            { icon: null,       imageSrc: '/highconfidence.jpg', iconSize: 'w-7 h-7',   label: 'High Confidence', value: `${highCount}`,       color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-4 rounded-xl border ${stat.bg} ${stat.border} backdrop-blur-sm`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg} border ${stat.border}`}>
                  {stat.imageSrc
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={stat.imageSrc} alt={stat.label} className={`${stat.iconSize} object-contain mix-blend-multiply`} />
                    : Icon && <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
                  }
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</div>
                  <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Confidence Filter Tabs ─────────────────────── */}
      {visibleAlerts.length > 0 && (
        <div className="flex items-center gap-2">
          {([
            { key: 'all',    label: `All  (${visibleAlerts.length})` },
            { key: 'high',   label: `High ≥80  (${highCount})` },
            { key: 'medium', label: `Medium 60–79  (${visibleAlerts.length - highCount})` },
          ] as { key: ConfFilter; label: string }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setConfFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                confFilter === tab.key
                  ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600'
                  : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Alert Cards ───────────────────────────────── */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((alert, idx) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCard alert={alert} delay={idx * 0.08} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-16 bg-slate-100/30 rounded-2xl border border-slate-200/50 backdrop-blur-sm"
            >
              <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-500">
                {confFilter === 'all' ? 'No Convergences Detected' : `No ${confFilter === 'high' ? 'High' : 'Medium'} Confidence Alerts`}
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">
                {confFilter === 'all'
                  ? 'The convergence engine has not found multi-signal overlaps in the current active window.'
                  : 'Try the "All" filter to see alerts at other confidence levels.'}
              </p>
              {confFilter !== 'all' && (
                <button
                  onClick={() => setConfFilter('all')}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-bold transition-colors"
                >
                  Show all alerts
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
