"use client";

import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellOff, SlidersHorizontal, RotateCcw, RefreshCw, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { DEFAULT_THRESHOLDS } from '@/lib/types';
import { useState, useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

function SliderRow({
  label,
  description,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-700">{label}</div>
          <div className="text-[11px] text-slate-500">{description}</div>
        </div>
        <span className="text-sm font-black text-indigo-600 min-w-[48px] text-right">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-200 accent-indigo-500"
      />
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export function SettingsModal({ open, onClose }: Props) {
  const { thresholds, updateThresholds, notificationsEnabled, requestNotificationPermission, ingestData, isIngesting, isDemoMode } = useAppContext();
  const [ingestResult, setIngestResult] = useState<{ technicals: number; news: number; bulkDeals: number } | null>(null);
  const [notifyStatus, setNotifyStatus] = useState<{ email: boolean; telegram: boolean; emailTo: string | null } | null>(null);

  useEffect(() => {
    if (open && !notifyStatus) {
      fetch('/api/notify/status').then(r => r.json()).then(setNotifyStatus).catch(() => {});
    }
  }, [open, notifyStatus]);

  const handleIngest = async () => {
    const result = await ingestData();
    setIngestResult(result);
    setTimeout(() => setIngestResult(null), 5000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] z-50 bg-white border-l border-slate-200 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-base font-black text-slate-900">Settings</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">Engine & Preferences</div>
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
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">

              {/* Convergence Engine */}
              <section>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80 mb-4">
                  Convergence Engine
                </div>
                <div className="space-y-6">
                  <SliderRow
                    label="Detection Window"
                    description="Days within which signals must cluster to trigger an alert"
                    value={thresholds.windowDays}
                    min={3}
                    max={14}
                    step={1}
                    unit=" days"
                    onChange={v => updateThresholds({ windowDays: v })}
                  />
                  <SliderRow
                    label="Min Signal Types"
                    description="Minimum distinct signal types required for convergence"
                    value={thresholds.minSignalTypes}
                    min={2}
                    max={4}
                    step={1}
                    unit=""
                    onChange={v => updateThresholds({ minSignalTypes: v })}
                  />
                  <SliderRow
                    label="Min Volume Multiple"
                    description="Breakout signals must exceed this multiple of average volume"
                    value={thresholds.minVolumeMultiple}
                    min={1.0}
                    max={5.0}
                    step={0.5}
                    unit="×"
                    onChange={v => updateThresholds({ minVolumeMultiple: v })}
                  />
                  <SliderRow
                    label="Stale Signal Threshold"
                    description="Signals older than this (in live mode) are filtered out"
                    value={thresholds.staleHours}
                    min={12}
                    max={168}
                    step={12}
                    unit="h"
                    onChange={v => updateThresholds({ staleHours: v })}
                  />
                </div>
              </section>

              {/* Display */}
              <section>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80 mb-4">
                  Display Filter
                </div>
                <SliderRow
                  label="Min Confidence to Show"
                  description="Hide convergence alerts below this confidence score"
                  value={thresholds.minConfidenceToShow}
                  min={0}
                  max={80}
                  step={5}
                  unit="/100"
                  onChange={v => updateThresholds({ minConfidenceToShow: v })}
                />
              </section>

              {/* Live Data Ingestion */}
              <section>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80 mb-4">
                  Live Data Ingestion
                </div>
                <div className="p-4 bg-slate-100/40 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-700">Run Ingestion Cycle</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Fetches technical breakouts (Yahoo Finance OHLC), news sentiment (Google News RSS), and bulk deal signals, then re-runs the convergence engine.
                    </div>
                  </div>
                  {isDemoMode && (
                    <div className="text-[11px] text-amber-600/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      Switch to Live mode to ingest real data
                    </div>
                  )}
                  <button
                    onClick={handleIngest}
                    disabled={isIngesting || isDemoMode}
                    className="flex items-center gap-2 text-xs font-bold px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 rounded-lg hover:bg-indigo-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isIngesting ? 'animate-spin' : ''}`} />
                    {isIngesting ? 'Ingesting…' : 'Run Now'}
                  </button>
                  {ingestResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-[11px] text-emerald-600"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      +{ingestResult.technicals} breakouts · +{ingestResult.news} sentiment · +{ingestResult.bulkDeals} bulk deals
                    </motion.div>
                  )}
                </div>
              </section>

              {/* External Notifications */}
              <section>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80 mb-4">
                  External Notifications
                </div>
                <div className="space-y-3">
                  {/* Email */}
                  <div className={`flex items-start gap-3 p-4 rounded-xl border ${notifyStatus?.email ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-100/40 border-slate-200'}`}>
                    <Mail className={`w-4 h-4 shrink-0 mt-0.5 ${notifyStatus?.email ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-slate-700">Email (Resend)</div>
                        {notifyStatus?.email && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                            <CheckCircle className="w-2.5 h-2.5" /> Configured
                          </span>
                        )}
                      </div>
                      {notifyStatus?.email ? (
                        <div className="text-[11px] text-slate-500 mt-1">
                          Alerts will be sent to <span className="text-slate-700 font-semibold">{notifyStatus.emailTo}</span>
                        </div>
                      ) : (
                        <>
                          <div className="text-[11px] text-slate-500 mt-0.5 mb-2">
                            Set <code className="text-indigo-600 bg-slate-100 px-1 rounded">RESEND_API_KEY</code> and <code className="text-indigo-600 bg-slate-100 px-1 rounded">ALERT_EMAIL_TO</code> in your <code className="text-slate-500">.env</code> file.
                          </div>
                          <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold">
                            Get free API key at resend.com →
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Telegram */}
                  <div className={`flex items-start gap-3 p-4 rounded-xl border ${notifyStatus?.telegram ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-100/40 border-slate-200'}`}>
                    <MessageSquare className={`w-4 h-4 shrink-0 mt-0.5 ${notifyStatus?.telegram ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-slate-700">Telegram</div>
                        {notifyStatus?.telegram && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                            <CheckCircle className="w-2.5 h-2.5" /> Configured
                          </span>
                        )}
                      </div>
                      {notifyStatus?.telegram ? (
                        <div className="text-[11px] text-slate-500 mt-1">
                          Bot connected · alerts firing to your chat
                        </div>
                      ) : (
                        <>
                          <div className="text-[11px] text-slate-500 mt-0.5 mb-2">
                            Set <code className="text-indigo-600 bg-slate-100 px-1 rounded">TELEGRAM_BOT_TOKEN</code> and <code className="text-indigo-600 bg-slate-100 px-1 rounded">TELEGRAM_CHAT_ID</code> in your <code className="text-slate-500">.env</code> file.
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Create a bot via @BotFather · Get your chat ID from @userinfobot
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Browser Notifications */}
              <section>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80 mb-4">
                  Notifications
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-100/40 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    {notificationsEnabled
                      ? <Bell className="w-5 h-5 text-indigo-600" />
                      : <BellOff className="w-5 h-5 text-slate-400" />
                    }
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Browser Notifications</div>
                      <div className="text-[11px] text-slate-500">
                        {notificationsEnabled
                          ? 'You\'ll be alerted when new convergences are detected'
                          : 'Get notified when new convergences are detected'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={requestNotificationPermission}
                    disabled={notificationsEnabled}
                    className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                      notificationsEnabled
                        ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 cursor-default'
                        : 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20'
                    }`}
                  >
                    {notificationsEnabled ? 'Enabled ✓' : 'Enable'}
                  </button>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => updateThresholds(DEFAULT_THRESHOLDS)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to defaults
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
