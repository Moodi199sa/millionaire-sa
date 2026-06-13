'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserData, UserData, saveEmail, saveUserData } from '@/lib/store'
import { monthsToLabel, formatNumber } from '@/lib/calculator'

export default function CheckoutPage() {
  const router = useRouter()
  const [data, setData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    const d = getUserData()
    if (!d) router.push('/')
    else setData(d)
  }, [router])

  const handlePay = async () => {
    if (!email || !email.includes('@')) {
      setEmailError('أدخل بريدك الإلكتروني لإرسال التقرير لك')
      return
    }
    setLoading(true)
    saveEmail(email)
    // مؤقتاً — بدون دفع حقيقي — نروح مباشرة للتقرير
    setTimeout(() => {
      router.push('/report')
    }, 1500)
  }

  if (!data) return null

  const bestMonths = Math.min(
    data.totalMonths,
    Math.floor(data.totalMonths * 0.6)
  )

  return (
    <main className="min-h-screen bg-[#0A0F1C] text-white font-tajawal" dir="rtl">
      <div className="max-w-md mx-auto px-4 py-10">

        {/* Header */}
        <button onClick={() => router.back()} className="text-gray-400 text-sm mb-6 hover:text-white transition-colors flex items-center gap-2">
          ← رجوع
        </button>

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📊</div>
          <h1 className="text-2xl font-extrabold mb-2">تقرير تسريع الثروة</h1>
          <p className="text-gray-400 text-sm">مخصص لوضعك المالي الحالي</p>
        </div>

        {/* ملخص الوضع */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
          <p className="text-xs text-gray-500 mb-3 font-bold">وضعك الحالي</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">الادخار الشهري</span>
              <span className="font-bold">{formatNumber(data.monthlySaving)} ريال</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">صافي الثروة</span>
              <span className="font-bold">{formatNumber(data.netWorth)} ريال</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
              <span className="text-gray-400">ستصل للمليون خلال</span>
              <span className="font-bold text-red-400">{monthsToLabel(data.totalMonths)}</span>
            </div>
          </div>
        </div>

        {/* وعد التقرير */}
        <div className="bg-gold/10 border border-gold/30 rounded-2xl p-5 mb-6 text-center">
          <p className="text-sm text-gray-300 mb-2">بعد التقرير يمكنك الوصول خلال</p>
          <div className="text-3xl font-extrabold text-gold">{monthsToLabel(bestMonths)}</div>
          <p className="text-xs text-gray-400 mt-1">بناءً على أفضل سيناريو لوضعك</p>
        </div>

        {/* ما يشمله التقرير */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <p className="text-sm font-bold mb-3">التقرير يشمل:</p>
          <div className="space-y-2.5">
            {[
              { icon: '🎯', text: 'مقارنة 5 سيناريوهات مخصصة لك' },
              { icon: '💡', text: 'أفضل طريقة لتقليل المدة' },
              { icon: '📅', text: 'خطة ادخار شهرية واضحة' },
              { icon: '💪', text: 'نقاط قوتك المالية' },
              { icon: '🚀', text: 'الخطوات العملية للبدء غداً' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-lg">{item.icon}</span>
                <span className="text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* السعر والدفع */}
        <div className="text-center mb-4">
          <div className="text-4xl font-extrabold text-gold mb-1">9 ريال</div>
          <p className="text-xs text-gray-500 mb-5">دفعة واحدة · بدون اشتراك</p>

          {/* الإيميل */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">📧 أرسل التقرير لبريدك الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError('') }}
              placeholder="بريدك الإلكتروني"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-gold transition-colors text-right"
            />
            {emailError && <p className="text-red-400 text-xs mt-2">{emailError}</p>}
            <p className="text-xs text-gray-600 mt-1">لن نشارك إيميلك مع أحد</p>
          </div>

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
              '💳 ادفع وشوف التقرير الآن'
            )}
          </button>

          <p className="mt-3 text-xs text-gray-500">
            🔒 دفع آمن · استرداد خلال 24 ساعة لو ما عجبك
          </p>
        </div>

        {/* Trust signals */}
        <div className="flex justify-center gap-6 mt-6">
          {[
            { icon: '🔒', text: 'دفع آمن' },
            { icon: '⚡', text: 'فوري' },
            { icon: '↩️', text: 'استرداد مضمون' },
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
