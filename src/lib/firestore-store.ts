// ──────────────────────────────────────────
// SignalOS — Firestore Persistence Layer
// Falls back to in-memory store when Firebase is not configured.
// ──────────────────────────────────────────

import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Signal, ConvergenceAlert } from './types';

const isFirebaseConfigured =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'mock-project';

// Circuit breaker: disabled after a NOT_FOUND (database not created yet)
let firestoreAvailable = true;

function isAvailable() {
  return isFirebaseConfigured && firestoreAvailable;
}

function handleFirestoreError(err: unknown, label: string) {
  // Code 5 = NOT_FOUND — Firestore database doesn't exist in the project yet
  if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 5) {
    firestoreAvailable = false;
    console.warn(`[Firestore] Database not found — disabling Firestore. Create it at https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore`);
  } else {
    console.warn(`[Firestore] ${label}:`, err);
  }
}

// ── Signals ──────────────────────────────────────────────────────────────

export async function persistSignals(signals: Signal[]): Promise<void> {
  if (!isAvailable()) return;
  try {
    const col = collection(db, 'signals');
    await Promise.all(
      signals.map(signal =>
        setDoc(doc(col, signal.id), {
          ...signal,
          _savedAt: serverTimestamp(),
        })
      )
    );
  } catch (err) {
    handleFirestoreError(err, 'Failed to persist signals');
  }
}

export async function fetchSignals(limitCount = 200): Promise<Signal[]> {
  if (!isAvailable()) return [];
  try {
    const q = query(
      collection(db, 'signals'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Signal);
  } catch (err) {
    handleFirestoreError(err, 'Failed to fetch signals');
    return [];
  }
}

// ── Alerts ───────────────────────────────────────────────────────────────

export async function persistAlerts(alerts: ConvergenceAlert[]): Promise<void> {
  if (!isAvailable()) return;
  try {
    const col = collection(db, 'alerts');
    await Promise.all(
      alerts.map(alert =>
        setDoc(doc(col, alert.id), {
          ...alert,
          _savedAt: serverTimestamp(),
        })
      )
    );
  } catch (err) {
    handleFirestoreError(err, 'Failed to persist alerts');
  }
}

export async function fetchAlerts(limitCount = 50): Promise<ConvergenceAlert[]> {
  if (!isAvailable()) return [];
  try {
    const q = query(
      collection(db, 'alerts'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as ConvergenceAlert);
  } catch (err) {
    handleFirestoreError(err, 'Failed to fetch alerts');
    return [];
  }
}

// ── Insights ─────────────────────────────────────────────────────────────

export async function persistInsight(symbol: string, insight: string): Promise<void> {
  if (!isAvailable()) return;
  try {
    await setDoc(doc(db, 'insights', symbol), {
      symbol,
      insight,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, 'Failed to persist insight');
  }
}

export async function fetchInsights(): Promise<Record<string, string>> {
  if (!isAvailable()) return {};
  try {
    const snap = await getDocs(collection(db, 'insights'));
    const result: Record<string, string> = {};
    snap.docs.forEach(d => {
      const data = d.data();
      result[data.symbol] = data.insight;
    });
    return result;
  } catch (err) {
    handleFirestoreError(err, 'Failed to fetch insights');
    return {};
  }
}

// ── Historical Outcomes ──────────────────────────────────────────────────

export async function persistOutcome(outcome: import('./types').HistoricalOutcome): Promise<void> {
  if (!isAvailable()) return;
  try {
    await addDoc(collection(db, 'outcomes'), {
      ...outcome,
      _savedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, 'Failed to persist outcome');
  }
}

export async function fetchOutcomes(): Promise<import('./types').HistoricalOutcome[]> {
  if (!isAvailable()) return [];
  try {
    const q = query(collection(db, 'outcomes'), orderBy('alertDate', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as import('./types').HistoricalOutcome);
  } catch (err) {
    handleFirestoreError(err, 'Failed to fetch outcomes');
    return [];
  }
}
