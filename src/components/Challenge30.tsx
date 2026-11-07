'use client'

import { useEffect, useState } from 'react'
import { getChallenge, saveChallenge, ChallengeState } from '@/lib/progress'
import { formatNumber } from '@/lib/calculator'

interface Props {
  monthlySaving: number
}

// تحدّي ٣٠ يوم — ٤ خطوات أسبوعية، التقدّم محفوظ محلياً على جهاز المستخدم.
export default function Challenge30({ monthlySaving }: Props) {
  const [state, setState] = useState<ChallengeState | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setState(getChallenge())
    setMounted(true)
  }, [])

  if (!mounted || monthlySaving <= 0) return null

  const weekly = Math.max(50, Math.round((monthlySaving * 0.1) / 4 / 10) * 10)
  const steps = [
    { title: 'الأسبوع ١', text: 'اكتب كل مصاريفك ٧ أيام — بدون ما تغيّر شي' },
    { title: 'الأسبوع ٢', text: 'ألغِ اشتراك ما تستخدمه' },
    { title: 'الأسبوع ٣', text: `حوّل ${formatNumber(weekly)} ريال لحساب الادخار` },
    { title: 'الأسبوع ٤', text: 'ارجع للحاسبة بأرقامك الجديدة وشوف الفرق' },
  ]

  const start = () => {
    const s = { startedAt: Date.now(), done: [false, false, false, false] }
    saveChallenge(s)
    setState(s)
  }

  const toggle = (i: number) => {
    if (!state) return
    const done = [...state.done]
    done[i] = !done[i]
    const s = { ...state, done }
    saveChallenge(s)
    setState(s)
  }

  const completed = state ? state.done.filter(Boolean).length : 0
  const day = state ? Math.min(30, Math.floor((Date.now() - state.startedAt) / 86400000) + 1) : 0

  return (
    <div className="gold-border-gradient rounded-3xl p-5 space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗓️</span>
          <h3 className="text-base font-extrabold text-white">تحدّي ٣٠ يوم</h3>
        </div>
        {state && <span className="text-xs text-gold font-bold">اليوم {day} من ٣٠</span>}
      </div>

      {!state ? (
        <>
          <p className="text-sm text-gray-300 leading-relaxed">
            ٤ خطوات صغيرة، وحدة كل أسبوع. نهاية الشهر بتشوف كم قرّبت من المليون.
          </p>
          <button
            onClick={start}
            className="w-full py-3 bg-gradient-to-l from-gold-light to-gold text-white font-bold rounded-xl shadow-lg shadow-gold/20 hover:brightness-105 transition-all active:scale-95"
          >
            ابدأ التحدّي 💪
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0" style={{ width: 76, height: 76 }}>
              <svg width="76" height="76" viewBox="0 0 76 76">
                <circle cx="38" cy="38" r="31" fill="none" stroke="rgba(212,160,23,0.15)" strokeWidth="7" />
                <circle
                  cx="38" cy="38" r="31" fill="none" stroke="url(#c30Grad)" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={`${(completed / 4) * 2 * Math.PI * 31} ${2 * Math.PI * 31}`}
                  transform="rotate(-90 38 38)"
                  style={{ transition: 'stroke-dasharray .6s ease' }}
                />
                <defs>
                  <linearGradient id="c30Grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F5C842" />
                    <stop offset="100%" stopColor="#D4A017" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-extrabold text-gold">{completed}/4</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {completed === 0 ? 'بداية قوية — علّم كل خطوة لما تخلّصها.' : completed < 4 ? 'كمّل — كل خطوة تقرّبك.' : 'خلّصت الأربع خطوات 👏'}
            </p>
          </div>
          <div className="space-y-2">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`w-full flex items-center gap-3 text-right p-3 rounded-xl border transition-all ${
                  state.done[i] ? 'bg-green-500/10 border-green-500/30' : 'glass-card hover:bg-white/10'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    state.done[i] ? 'bg-green-500 text-white' : 'border border-white/20 text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span className="flex-1">
                  <span className="block text-xs text-gold font-bold">{s.title}</span>
                  <span className={`block text-sm ${state.done[i] ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{s.text}</span>
                </span>
              </button>
            ))}
          </div>
          {completed === 4 && (
            <p className="text-center text-sm font-bold text-green-400">🏆 خلّصت التحدّي! احسب من جديد وشوف تقدّمك</p>
          )}
        </>
      )}
    </div>
  )
}
