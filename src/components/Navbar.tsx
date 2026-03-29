"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DemoToggle } from './DemoToggle';
import { SettingsModal } from './SettingsModal';
import { useAppContext } from './AppContext';
import { Activity, Zap, Radio, TrendingUp, Bookmark, BarChart3, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function useISTClock() {
  const [time, setTime] = useState('');
  const [marketStatus, setMarketStatus] = useState<'OPEN' | 'PRE' | 'CLOSED'>('CLOSED');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const h = ist.getHours();
      const m = ist.getMinutes();
      const s = ist.getSeconds();
      const pad = (n: number) => String(n).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      setTime(`${pad(h12)}:${pad(m)}:${pad(s)} ${ampm} IST`);

      const day = ist.getDay();
      const mins = h * 60 + m;
      if (day === 0 || day === 6) {
        setMarketStatus('CLOSED');
      } else if (mins >= 555 && mins < 570) {
        setMarketStatus('PRE');
      } else if (mins >= 570 && mins < 930) {
        setMarketStatus('OPEN');
      } else {
        setMarketStatus('CLOSED');
      }
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return { time, marketStatus };
}

export function Navbar() {
  const pathname = usePathname();
  const { isPriceLive, alerts, watchlist } = useAppContext();
  const { time, marketStatus } = useISTClock();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const links = [
    { href: '/dashboard',  label: 'Overview',     icon: Activity },
    { href: '/alerts',     label: 'Convergences', icon: Zap },
    { href: '/feed',       label: 'Live Feed',    icon: Radio },
    { href: '/watchlist',  label: 'Watchlist',    icon: Bookmark, badge: watchlist.size > 0 ? watchlist.size : null },
    { href: '/backtest',   label: 'Backtest',     icon: BarChart3 },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full border-b border-slate-200/60 bg-white/90 backdrop-blur-xl z-40">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-6">

            {/* Logo + Nav Links */}
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
                <div className="relative flex items-center justify-center w-10 h-10 transition-all group-hover:scale-105">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="SignalOS Logo" className="w-full h-full object-contain mix-blend-multiply" />
                  {alerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center">
                      <span className="text-[7px] font-black text-white">{alerts.length}</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-black text-[1.15rem] leading-none tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-800 bg-clip-text text-transparent">
                    SignalOS
                  </span>
                  <div className="text-[8.5px] text-emerald-600/60 font-semibold tracking-[0.22em] uppercase leading-none mt-0.5">
                    Convergence Engine
                  </div>
                </div>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'text-indigo-700 bg-indigo-500/10 border border-indigo-500/20'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {link.label}
                      {'badge' in link && link.badge != null && (
                        <span className="ml-0.5 text-[9px] font-black bg-indigo-500/10 text-indigo-600 border border-indigo-500/30 px-1.5 py-0 rounded-full">
                          {link.badge}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-500 rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-4">
              <AnimatePresence>
                {isPriceLive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-1.5 rounded-full"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Prices Live
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${
                  marketStatus === 'OPEN'
                    ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30'
                    : marketStatus === 'PRE'
                    ? 'text-amber-600 bg-amber-500/10 border-amber-500/30'
                    : 'text-slate-400 bg-slate-200/50 border-slate-300/50'
                }`}>{marketStatus}</span>
                <div className="text-[11px] font-mono font-semibold text-slate-500 tabular-nums">
                  {time}
                </div>
              </div>

              <DemoToggle />

              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center gap-2">
              <DemoToggle />
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
                <div className="w-5 h-0.5 bg-current mb-1" />
                <div className="w-3 h-0.5 bg-current" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-200 bg-white/95 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        isActive ? 'bg-indigo-500/10 text-indigo-700 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                      {'badge' in link && link.badge != null && (
                        <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-600 border border-indigo-500/30 px-1.5 py-0 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
                <div className="pt-2 border-t border-slate-200 text-center text-[10px] font-mono text-slate-400">{time}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
