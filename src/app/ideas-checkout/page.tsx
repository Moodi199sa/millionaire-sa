'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function IdeasCheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePay = () => {
    setLoading(true)
    setTimeout(() => router.push('/ideas'), 1500)
  }

  return (
    <main className="min-h-screen bg-dark text-white font-tajawal" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10">

        <button onClick={() => router.back()} className="text-gray-400 text-sm mb-6 hover:text-white transition-colors">
          ← رجوع
        </button>

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚀</div>
          <h1 className="text-2xl font-extrabold mb-2">دليل 100 فكرة مشروع ناجح</h1>
          <p className="text-gray-400 text-sm">يتحدث دائماً بأحدث أفكار السوق</p>
        </div>

        {/* ما تحصله */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <p className="text-sm font-bold mb-4">ما تحصله فوراً بعد الدفع:</p>
          <div className="space-y-3">
            {[
              { icon: '📋', title: '100 فكرة مشروع مجربة', desc: 'في السوق السعودي والخليجي' },
              { icon: '💡', title: 'شرح كامل لكل فكرة', desc: 'كيف تبدأ، التكلفة، الربح المتوقع' },
              { icon: '📊', title: 'تصنيف ذكي', desc: 'بدون رأس مال / صغير / متوسط / كبير' },
              { icon: '⚡', title: 'خطوات تنفيذ واضحة', desc: 'ابدأ خلال أسبوع واحد' },
              { icon: '🔄', title: 'يتحدث مجاناً', desc: 'دائماً محدّث بأحدث الأفكار' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* تصنيفات الأفكار */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <p className="text-sm font-bold mb-3">الأفكار مقسمة حسب رأس المال:</p>
          <div className="space-y-2">
            {[
              { label: '🟢 بدون رأس مال', count: '25 فكرة', desc: 'تبدأ بصفر ريال' },
              { label: '🟡 رأس مال صغير', count: '35 فكرة', desc: 'أقل من 5,000 ريال' },
              { label: '🟠 رأس مال متوسط', count: '25 فكرة', desc: '5,000 - 50,000 ريال' },
              { label: '🔴 رأس مال كبير', count: '15 فكرة', desc: 'أكثر من 50,000 ريال' },
            ].map((cat, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <div>
                  <p className="text-sm font-bold">{cat.label}</p>
                  <p className="text-xs text-gray-400">{cat.desc}</p>
                </div>
                <span className="text-gold text-sm font-bold">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* السعر والدفع */}
        <div className="text-center mb-5">
          <div className="inline-block bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold px-4 py-1.5 rounded-full mb-3">
            🎁 مجاني لفترة الإطلاق
          </div>
          <div className="line-through text-gray-500 text-sm mb-1">السعر الأصلي: 99 ريال</div>
          <div className="text-2xl text-gray-500 line-through mb-1">20 ريال</div>
          <div className="text-3xl font-extrabold text-gold mb-1">مجاناً</div>
          <p className="text-xs text-gray-500 mb-5">احصل على الدليل الكامل الآن بدون أي رسوم</p>

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full py-4 bg-gold hover:bg-yellow-600 text-white font-bold text-xl rounded-xl transition-all active:scale-95 shadow-lg shadow-gold/20 disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> جاري التحضير...
              </span>
            ) : (
              '🚀 احصل على الدليل مجاناً'
            )}
          </button>

          <p className="mt-3 text-xs text-gray-500">
            لا حاجة لبطاقة دفع — وصول فوري بالكامل
          </p>
        </div>

        <div className="flex justify-center gap-6">
          {[
            { icon: '⚡', text: 'وصول فوري' },
            { icon: '🔒', text: 'بياناتك محمية' },
            { icon: '🎁', text: 'بدون مقابل' },
          ].map((t, i) => (
            <div key={i} className="text-center">
              <div className="text-xl">{t.icon}</div>
              <div className="text-xs text-gray-500 mt-1">{t.text}</div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
