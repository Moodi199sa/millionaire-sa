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
// مجاني، يظهر قبل الـ paywall. يعرض أقوى حركة + خطوة هذا الأسبوع،
// ثم تلميح بوجود رافعات أخرى (يغذّي الفضول نحو التقرير الكامل).
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
    <div className="bg-gradient-to-br from-green-500/10 to-gold/10 border border-green-500/30 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🎯</span>
        <h3 className="text-base font-extrabold text-white">أقرب حركة تقرّبك من المليون</h3>
      </div>

      <div className="bg-black/20 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-300 mb-2">{top.label}</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-gray-400 text-sm">تقرّبك</span>
          <span className="text-3xl font-extrabold text-green-400 leading-none">
            {monthsSavedLabel(top.monthsSaved)}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">أقرب لهدفك ⚡</p>
      </div>

      <div className="bg-white/5 rounded-xl p-4">
        <p className="text-xs text-gold font-bold mb-1">✅ خطوتك هذا الأسبوع</p>
        <p className="text-sm text-gray-200 leading-relaxed">{top.action}</p>
      </div>

      {others > 0 && (
        <p className="text-xs text-gray-400 text-center">
          وعندك <span className="text-gold font-bold">{others}</span>{' '}
          {others === 1 ? 'رافعة أخرى' : 'رافعات أخرى'} تقدر تجمعها معاً — التقرير الكامل يحسب لك أثرها مجتمعة
        </p>
      )}
    </div>
  )
}
