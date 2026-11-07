'use client'

import { buildLevers, monthsSavedLabel } from '@/lib/calculator'

interface Props {
  netWorth: number
  monthlySaving: number
  annualRate: number
  totalMonths: number
  goal?: number
}

// "أقرب رافعة" — يحوّل النتيجة من رقم ميت إلى خطوة واحدة قابلة للتنفيذ.
// مجاني، يظهر قبل الـ paywall. تصميم احترافي: إطار ذهبي متدرّج، لمعان
// على الرقم، وبطاقة خطوة واضحة.
export default function NearestLever({
  netWorth,
  monthlySaving,
  annualRate,
  totalMonths,
  goal = 1000000,
}: Props) {
  const levers = buildLevers(netWorth, monthlySaving, annualRate, totalMonths, goal)
  if (levers.length === 0) return null

  const top = levers[0]
  const others = levers.length - 1

  return (
    <div className="gold-border-gradient animate-glow rounded-3xl p-6 space-y-5 animate-fade-up overflow-hidden relative">
      <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center text-lg">🎯</div>
        <div>
          <h3 className="text-base font-extrabold text-ink leading-tight">أقرب حركة تقرّبك من المليون</h3>
          <p className="text-[11px] text-ink-muted">خطوة واحدة — أثر فوري</p>
        </div>
      </div>

      <div className="relative text-center py-2">
        <p className="text-sm text-ink-soft mb-3">{top.label}</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-ink-muted text-lg">تقرّبك</span>
          <span className="gold-shimmer text-4xl sm:text-5xl font-extrabold leading-none">
            {monthsSavedLabel(top.monthsSaved)}
          </span>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
          <span className="text-xs text-green-700 font-bold">أقرب لهدفك</span>
        </div>
      </div>

      <div className="relative glass-card rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-l from-gold to-gold-deep flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-lg shadow-gold/20">
          ✓
        </div>
        <div>
          <p className="text-xs text-gold-deep font-bold mb-1">خطوتك هذا الأسبوع</p>
          <p className="text-sm text-ink-soft leading-relaxed">{top.action}</p>
        </div>
      </div>

      {others > 0 && (
        <p className="relative text-xs text-ink-muted text-center leading-relaxed">
          وعندك <span className="text-gold-deep font-bold">{others}</span>{' '}
          {others === 1 ? 'رافعة أخرى' : 'رافعات أخرى'} تقدر تجمعها معاً — التقرير الكامل يحسب لك أثرها مجتمعة
        </p>
      )}
    </div>
  )
}
