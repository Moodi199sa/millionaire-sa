// تخزين محلي فقط (localStorage) — لا بيانات تُرسل للسيرفر.
// يُستخدم لحلقة الرجوع (مقارنة الزيارة الحالية بالسابقة) وتحدّي ٣٠ يوم.

export interface Snapshot {
  months: number
  netWorth: number
  at: number // timestamp
}

const SNAP_KEY = 'millionaire_snapshot'
const CHALLENGE_KEY = 'millionaire_challenge30'

function safeGet(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value)
  } catch {
    // التخزين غير متاح (وضع خاص مثلاً) — نتجاهل بهدوء
  }
}

export function getPreviousSnapshot(): Snapshot | null {
  const raw = safeGet(SNAP_KEY)
  if (!raw) return null
  try {
    const s = JSON.parse(raw)
    if (typeof s?.months === 'number' && typeof s?.at === 'number') return s
  } catch {}
  return null
}

export function saveSnapshot(s: Snapshot) {
  safeSet(SNAP_KEY, JSON.stringify(s))
}

export interface ChallengeState {
  startedAt: number
  done: boolean[] // ٤ خطوات أسبوعية
}

export function getChallenge(): ChallengeState | null {
  const raw = safeGet(CHALLENGE_KEY)
  if (!raw) return null
  try {
    const c = JSON.parse(raw)
    if (typeof c?.startedAt === 'number' && Array.isArray(c?.done)) return c
  } catch {}
  return null
}

export function saveChallenge(c: ChallengeState) {
  safeSet(CHALLENGE_KEY, JSON.stringify(c))
}
