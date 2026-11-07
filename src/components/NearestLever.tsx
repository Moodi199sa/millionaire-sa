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
          <h3 className="text-base font-extrabold text-white leading-tight">وش أسرع شي يقرّبك من المليون؟</h3>
          <p className="text-[11px] text-gray-400">حركة وحدة… وتفرق معك</p>
        </div>
      </div>

      <div className="relative text-center py-2">
        <p className="text-sm text-gray-300 mb-3">{top.label}</p>
        <p className="text-gray-400 text-sm mb-1">توصل للمليون أبكر بـ</p>
        <span className="gold-shimmer text-4xl sm:text-5xl font-extrabold leading-tight">
          {monthsSavedLabel(top.monthsSaved)}
        </span>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
          <span className="text-xs text-green-400 font-bold">تختصر عليك الطريق</span>
        </div>
      </div>

      <div className="relative glass-card rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-lg shadow-gold/20">
          ✓
        </div>
        <div>
          <p className="text-xs text-gold font-bold mb-1">وش تسوي هالأسبوع؟</p>
          <p className="text-sm text-gray-100 leading-relaxed">{top.action}</p>
        </div>
      </div>

      {others > 0 && (
        <p className="relative text-xs text-gray-400 text-center leading-relaxed">
          وعندك <span className="text-gold font-bold">{others}</span>{' '}
          {others === 1 ? 'حركة ثانية' : 'حركات ثانية'} تقدر تجمعها مع بعض — التقرير الكامل يحسب لك أثرها كلها
        </p>
      )}
    </div>
  )
}
