'use client'
import { useRouter } from 'next/navigation'
import PaymobButton from '@/components/PaymobButton'

export default function IdeasCheckout() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-cream text-ink font-tajawal flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-sm w-full">
        <button onClick={() => router.back()} className="text-ink-muted text-sm mb-6 block">← رجوع</button>

        <div className="bg-white/70 border border-gold/20 rounded-3xl p-6 text-center">
          <div className="text-5xl mb-4">💡</div>
          <h1 className="text-2xl font-extrabold mb-2">دليل 100 فكرة مشروع</h1>
          <p className="text-ink-muted text-sm mb-6">محدّث بأحدث فرص السوق السعودي 2026</p>

          <div className="space-y-3 text-right mb-6">
            {['100 فكرة مشروع مع خطوات تنفيذية','تحليل رأس المال والربح لكل فكرة','خطة اليوم الأول لكل مشروع','فلترة حسب رأس المال والتصنيف','تحديث مستمر بأحدث الفرص'].map((f,i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-ink-soft">
                <span className="text-gold-deep">✓</span>{f}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl font-extrabold text-gold-deep">49</span>
            <span className="text-ink-muted">ريال</span>
          </div>

          <PaymobButton
            amount={49}
            product="ideas"
            label="ادفع واحصل على الدليل كاملاً ←"
            className="w-full py-4 bg-gradient-to-l from-gold to-gold-deep hover:brightness-110 text-white font-extrabold rounded-2xl transition-all active:scale-95"
          />
          <p className="text-xs text-ink-muted mt-3">🔒 دفع آمن عبر Paymob — مدى / فيزا / ماستركارد</p>
        </div>
      </div>
    </main>
  )
}
