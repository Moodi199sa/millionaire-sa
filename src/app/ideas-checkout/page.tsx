'use client'
import { useRouter } from 'next/navigation'
import PaymobButton from '@/components/PaymobButton'

export default function IdeasCheckout() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-dark text-white font-tajawal flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-sm w-full">
        <button onClick={() => router.back()} className="text-gray-400 text-sm mb-6 block">← رجوع</button>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
          <div className="text-5xl mb-4">💡</div>
          <h1 className="text-2xl font-extrabold mb-2">دليل 100 فكرة مشروع</h1>
          <p className="text-gray-400 text-sm mb-6">محدّث بأحدث فرص السوق السعودي 2026</p>

          <div className="space-y-3 text-right mb-6">
            {['100 فكرة مشروع مع خطوات تنفيذية','تحليل رأس المال والربح لكل فكرة','خطة اليوم الأول لكل مشروع','فلترة حسب رأس المال والتصنيف','تحديث مستمر بأحدث الفرص'].map((f,i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-gold">✓</span>{f}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl font-extrabold text-gold">49</span>
            <span className="text-gray-400">ريال</span>
          </div>

          <PaymobButton
            amount={49}
            product="ideas"
            label="ادفع واحصل على الدليل كاملاً ←"
            className="w-full py-4 bg-gold hover:bg-yellow-600 text-white font-extrabold rounded-2xl transition-all active:scale-95"
          />
          <p className="text-xs text-gray-500 mt-3">🔒 دفع آمن عبر Paymob — مدى / فيزا / ماستركارد</p>
        </div>
      </div>
    </main>
  )
}
