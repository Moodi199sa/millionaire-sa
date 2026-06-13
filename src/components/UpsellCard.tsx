'use client'

import { useRouter } from 'next/navigation'
import { monthsToLabel } from '@/lib/calculator'
import { saveUserData, UserData } from '@/lib/store'

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
    router.push('/checkout')
  }

  return (
    <div className="bg-white/5 border-2 border-gold rounded-2xl p-6 text-center">
      <div className="text-4xl mb-2">🚀</div>
      <h2 className="text-xl font-bold mb-1">كيف تصل للمليون أسرع؟</h2>
      <p className="text-gray-400 text-sm mb-4">
        قارن سيناريوهات مختلفة واعرف أفضل خطة لتقليل المدة
      </p>

      {/* السيناريوهات */}
      <div className="flex flex-col gap-2 mb-5 text-right">
        {scenarios.map((s, i) => (
          <div
            key={i}
            className={`flex justify-between items-center px-4 py-2.5 rounded-xl text-sm ${
              i === 0
                ? 'bg-white/5 border border-white/10'
                : i === scenarios.length - 1
                ? 'bg-yellow-50/10 border border-gold/40'
                : 'bg-white/5'
            }`}
          >
            <span className={i === scenarios.length - 1 ? 'text-gold' : 'text-gray-300'}>
              {s.label}
            </span>
            <span className={`font-bold ${i === scenarios.length - 1 ? 'text-gold' : 'text-white'}`}>
              {monthsToLabel(s.months)}
            </span>
          </div>
        ))}
      </div>

      {/* السعر */}
      <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-4">
        <div className="text-3xl font-extrabold text-gold mb-1">
          9 <span className="text-xl">ريال فقط</span>
        </div>
        <p className="text-xs text-gray-400">تبي تعرف كيف توصل للمليون الأول بسرعة؟ 💡</p>
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
          <div key={i} className="text-sm text-gray-300">{item}</div>
        ))}
      </div>

      <button
        onClick={handleBuy}
        className="w-full py-4 bg-gold hover:bg-yellow-600 text-white font-bold text-lg rounded-xl transition-all active:scale-95 shadow-lg shadow-gold/20"
      >
        اشتر التقرير الآن — 9 ريال 🚀
      </button>

      <p className="mt-3 text-xs text-gray-500">
        💳 دفع آمن · استرداد خلال 24 ساعة لو ما عجبك
      </p>

      <div className="mt-5 pt-5 border-t border-white/10 text-center">
        <p className="text-xs text-gray-500 mb-2">تبي متابعة شهرية لثروتك؟</p>
        <button
          onClick={() => router.push('/subscribe')}
          className="text-gold text-sm font-bold hover:underline"
        >
          🤖 اشترك في مساعد الثروة الشخصي — 29 ريال/شهر ←
        </button>
      </div>
    </div>
  )
}
