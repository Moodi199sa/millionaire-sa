'use client'

import { formatNumber } from '@/lib/calculator'

interface Props {
  netWorth: number
  monthlySaving: number
  totalMonths: number
  targetDate: string
  goal?: number
}

// لوحة نتيجة أنيقة تحل محل الرسم الخطي — حلقة تقدم + كروت + خط زمني للمحطات
export default function ResultDashboard({
  netWorth,
  monthlySaving,
  totalMonths,
  targetDate,
  goal = 1000000,
}: Props) {
  const yearsToGoal = Math.max(1, Math.round(totalMonths / 12))
  const yearlySaving = monthlySaving * 12
  const targetYear = targetDate ? targetDate.split('/')[0] : ''

  // نسبة ما تحقق من المليون حتى الآن (نقطة الانطلاق)
  const startPct = Math.min(100, Math.round((netWorth / goal) * 100))

  // حلقة التقدم
  const R = 52
  const C = 2 * Math.PI * R
  const dash = (startPct / 100) * C

  // محطات الرحلة على الخط الزمني
  const milestones = [
    { pct: 0, label: 'اليوم', amount: netWorth },
    { pct: 25, label: '¼ الطريق', amount: goal * 0.25 },
    { pct: 50, label: 'نصف المليون', amount: goal * 0.5 },
    { pct: 75, label: '¾ الطريق', amount: goal * 0.75 },
    { pct: 100, label: 'المليون 🏆', amount: goal },
  ]

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-6">
      {/* الحلقة + العنوان */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0" style={{ width: 130, height: 130 }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              cx="65" cy="65" r={R} fill="none"
              stroke="url(#goldGrad)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${dash} ${C}`}
              transform="rotate(-90 65 65)"
            />
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F5C842" />
                <stop offset="100%" stopColor="#D4A017" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-gold leading-none">{startPct}%</span>
            <span className="text-[10px] text-gray-400 mt-1">من المليون</span>
          </div>
        </div>
        <div className="flex-1 text-right">
          <p className="text-sm text-gray-400 mb-1">أنت الآن على بُعد</p>
          <p className="text-2xl font-extrabold text-white leading-tight">{yearsToGoal} {yearsToGoal <= 10 ? 'سنوات' : 'سنة'}</p>
          <p className="text-sm text-gray-400 mt-1">من أول مليون ريال</p>
          {targetYear && (
            <div className="inline-block mt-2 bg-gold/10 border border-gold/20 rounded-full px-3 py-1">
              <span className="text-xs text-gold font-bold">الوصول المتوقع: {targetYear}</span>
            </div>
          )}
        </div>
      </div>

      {/* كروت الأرقام */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'نقطة انطلاقك', value: formatNumber(netWorth), unit: 'ريال' },
          { label: 'تدخر سنوياً', value: formatNumber(yearlySaving), unit: 'ريال' },
          { label: 'ادخارك اليومي', value: formatNumber(Math.round(monthlySaving / 30)), unit: 'ريال/يوم' },
        ].map((c) => (
          <div key={c.label} className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-[10px] text-gray-500 mb-1">{c.label}</div>
            <div className="text-base font-extrabold text-gold leading-none">{c.value}</div>
            <div className="text-[10px] text-gray-500 mt-1">{c.unit}</div>
          </div>
        ))}
      </div>

      {/* الخط الزمني للمحطات */}
      <div>
        <p className="text-xs text-gray-400 mb-4 text-center">محطات رحلتك للمليون</p>
        <div className="relative px-2">
          {/* الخط الخلفي */}
          <div className="absolute top-[7px] right-2 left-2 h-1 rounded-full bg-white/10" />
          {/* الخط المعبّأ حتى نقطة الانطلاق */}
          <div
            className="absolute top-[7px] right-2 h-1 rounded-full"
            style={{
              width: `calc(${startPct}% - 8px)`,
              background: 'linear-gradient(to left, #F5C842, #D4A017)',
            }}
          />
          <div className="relative flex justify-between">
            {milestones.map((m) => {
              const reached = startPct >= m.pct
              return (
                <div key={m.pct} className="flex flex-col items-center" style={{ width: '20%' }}>
                  <div
                    className="w-4 h-4 rounded-full border-2 z-10"
                    style={{
                      background: reached ? '#D4A017' : '#1a2540',
                      borderColor: reached ? '#F5C842' : 'rgba(255,255,255,0.2)',
                    }}
                  />
                  <span className={`text-[9px] mt-2 text-center leading-tight ${reached ? 'text-gold font-bold' : 'text-gray-500'}`}>
                    {m.label}
                  </span>
                  <span className="text-[9px] text-gray-600 mt-0.5">{formatNumber(m.amount / 1000)}ك</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
