'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const features = [
  { icon: '📊', title: 'تحديث شهري لثروتك', desc: 'نحسب تقدمك كل شهر ونرسله لك' },
  { icon: '💡', title: 'أفكار دخل جديدة', desc: 'كل شهر 5 أفكار مشاريع محدثة' },
  { icon: '📈', title: 'تحديث خطتك', desc: 'الخطة تتكيف مع تغييرات وضعك' },
  { icon: '🔔', title: 'تذكيرات الادخار', desc: 'رسائل تحفيزية أسبوعية على إيميلك' },
  { icon: '🤖', title: 'مساعد مالي ذكي', desc: 'اسأل أي سؤال مالي واحصل على إجابة' },
  { icon: '🏆', title: 'تقارير متقدمة', desc: 'تقرير ربع سنوي شامل' },
]

export default function SubscribePage() {
  const router = useRouter()
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <main className="min-h-screen bg-dark text-white font-tajawal" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10">

        <button onClick={() => router.back()} className="text-gray-400 text-sm mb-6 hover:text-white transition-colors">
          ← رجوع
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🤖</div>
          <h1 className="text-2xl font-extrabold mb-2">مساعد الثروة الشخصي</h1>
          <p className="text-gray-400 text-sm">رفيقك المالي الشهري للوصول للمليون أسرع</p>
        </div>

        {/* Plan Toggle */}
        <div className="flex bg-white/10 rounded-xl p-1 mb-6">
          <button
            onClick={() => setPlan('monthly')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              plan === 'monthly' ? 'bg-gold text-white' : 'text-gray-400'
            }`}
          >
            شهري
          </button>
          <button
            onClick={() => setPlan('yearly')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all relative ${
              plan === 'yearly' ? 'bg-gold text-white' : 'text-gray-400'
            }`}
          >
            سنوي
            <span className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              وفر 30%
            </span>
          </button>
        </div>

        {/* Price */}
        <div className="text-center bg-gold/10 border border-gold/30 rounded-2xl p-6 mb-6">
          <div className="text-5xl font-extrabold text-gold mb-1">
            {plan === 'monthly' ? '29' : '19'}
            <span className="text-2xl"> ريال</span>
          </div>
          <p className="text-gray-400 text-sm">
            {plan === 'monthly' ? 'شهرياً · إلغاء في أي وقت' : 'شهرياً · يُدفع سنوياً (228 ريال)'}
          </p>
          {plan === 'yearly' && (
            <p className="text-green-400 text-xs mt-2 font-bold">✅ توفر 120 ريال سنوياً</p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-2xl shrink-0">{f.icon}</span>
              <div>
                <p className="text-sm font-bold">{f.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm font-bold text-green-400 mb-1">🛡️ ضمان استرداد 7 أيام</p>
          <p className="text-xs text-gray-400">لو ما عجبك خلال 7 أيام، نرجع لك الفلوس بدون أسئلة</p>
        </div>

        <button
          onClick={() => alert('قريباً! سنتواصل معك لتفعيل الاشتراك')}
          className="w-full py-4 bg-gold hover:bg-yellow-600 text-white font-extrabold text-lg rounded-xl transition-all active:scale-95 shadow-lg shadow-gold/20 mb-3"
        >
          اشترك الآن — {plan === 'monthly' ? '29' : '19'} ريال/شهر 🚀
        </button>

        <p className="text-center text-xs text-gray-500">
          🔒 دفع آمن · إلغاء في أي وقت · بدون التزام
        </p>

      </div>
    </main>
  )
}
