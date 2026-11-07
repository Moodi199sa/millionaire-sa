'use client'

import { useRouter } from 'next/navigation'
import { monthsToLabel } from '@/lib/calculator'
import { saveUserData, UserData } from '@/lib/store'
import PaymobButton from './PaymobButton'

interface Scenario {
  label: string
  months: number
}

interface Props {
  scenarios: Scenario[]
  userData: UserData
}

export default function UpsellCard({ scenarios, userData }: Props) {
  const router = useRouter()

  const handleBuy = () => {
    saveUserData(userData)
    router.push('/report')
  }

  return (
    <div className="bg-white/70 border-2 border-gold rounded-2xl p-6 text-center">
      <div className="text-4xl mb-2">🚀</div>
      <h2 className="text-xl font-bold mb-1">كيف تصل للمليون أسرع؟</h2>
      <p className="text-ink-muted text-sm mb-4">
        قارن سيناريوهات مختلفة واعرف أفضل خطة لتقليل المدة
      </p>

      {/* السيناريوهات — أول اثنين واضحين (تيزر)، الباقي مموّه خلف القفل */}
      <div className="flex flex-col gap-2 mb-5 text-right">
        {scenarios.map((s, i) => {
          const locked = i >= 2
          const best = i === scenarios.length - 1
          return (
            <div
              key={i}
              className={`relative flex justify-between items-center px-4 py-2.5 rounded-xl text-sm overflow-hidden ${
                i === 0 ? 'bg-white/70 border border-gold/20' : best ? 'bg-gold/5 border border-gold/40' : 'bg-white/70'
              }`}
            >
              <span className={best ? 'text-gold-deep' : 'text-ink-soft'}>{s.label}</span>
              <span
                className={`font-bold ${best ? 'text-gold-deep' : 'text-ink'} ${locked ? 'blur-[6px] select-none' : ''}`}
                aria-hidden={locked}
              >
                {locked ? 'X سنوات و X أشهر' : monthsToLabel(s.months)}
              </span>
              {locked && <span className="absolute left-3 text-xs">🔒</span>}
            </div>
          )
        })}
      </div>

      {/* معاينة التقرير مموّهة — تعرض القيمة قبل الطلب */}
      <div className="relative mb-5 rounded-xl overflow-hidden border border-gold/20" aria-hidden="true">
        <div className="p-4 space-y-3 text-right select-none">
          <div className="bg-white/70 rounded-lg p-3">
            <div className="text-xs text-gold-deep font-bold mb-2">الزبدة 🧈</div>
            <div className="h-2 w-full bg-white rounded mb-1.5" />
            <div className="h-2 w-5/6 bg-white rounded" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/70 rounded-lg p-3 text-center">
              <div className="text-xs text-ink-muted mb-1">جاهزيتك</div>
              <div className="text-xl font-extrabold text-gold-deep">٧٢/١٠٠</div>
            </div>
            <div className="bg-white/70 rounded-lg p-3 text-center">
              <div className="text-xs text-ink-muted mb-1">خطتك الأسبوعية</div>
              <div className="text-xl font-extrabold text-gold-deep">٤ خطوات</div>
            </div>
          </div>
          <div className="bg-white/70 rounded-lg p-3">
            <div className="h-2 w-full bg-white rounded mb-1.5" />
            <div className="h-2 w-2/3 bg-white rounded" />
          </div>
        </div>
        <div className="absolute inset-0 backdrop-blur-[5px] bg-cream/60 flex flex-col items-center justify-center">
          <div className="text-3xl mb-1">🔒</div>
          <p className="text-sm font-bold text-ink">تقريرك الكامل جاهز</p>
          <p className="text-xs text-ink-soft mt-0.5">افتحه بـ 9 ريال فقط</p>
        </div>
      </div>

      {/* السعر */}
      <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-4">
        <div className="inline-block bg-green-500/20 border border-green-500/40 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
          📊 تقرير شخصي مدفوع
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold text-gold-deep">9 ريال</span>
          <span className="text-sm text-ink-muted">فقط</span>
        </div>
        <p className="text-xs text-ink-muted mt-1">تبي تعرف كيف توصل للمليون الأول بسرعة؟ 💡</p>
      </div>

      {/* ما يشمله التقرير */}
      <div className="text-right space-y-2 mb-5">
        {[
          '✅ مقارنة 5 سيناريوهات مختلفة',
          '✅ أفضل طريقة لتقليل المدة',
          '✅ خطة ادخار شهرية مخصصة',
          '✅ نقاط قوتك المالية وكيف تستثمرها',
          '✅ الخطوات العملية للبدء غداً',
        ].map((item, i) => (
          <div key={i} className="text-sm text-ink-soft">{item}</div>
        ))}
      </div>

      <PaymobButton
        amount={9}
        product="report"
        label="احصل على تقريرك — 9 ريال 🚀"
        className="w-full py-4 bg-gradient-to-l from-gold to-gold-deep hover:brightness-110 text-white font-bold text-lg rounded-xl transition-all active:scale-95 shadow-lg shadow-gold/20"
      />

      <p className="mt-3 text-xs text-ink-muted">
        🔒 دفع آمن عبر Paymob — مدى / فيزا / ماستركارد
      </p>

      <div className="mt-5 pt-5 border-t border-gold/20 text-center">
        <p className="text-xs text-ink-muted mb-2">تبي أفكار عملية تزيد دخلك؟</p>
        <button
          onClick={() => router.push('/ideas-checkout')}
          className="text-gold-deep text-sm font-bold hover:underline"
        >
          💡 دليل 8 أفكار دخل مربحة — 49 ريال ←
        </button>
      </div>
    </div>
  )
}
