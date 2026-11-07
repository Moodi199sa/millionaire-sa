'use client'

import { useState } from 'react'
import { saveEmail, generateReferralCode } from '@/lib/store'

interface Props {
  onSubmit: (email: string) => void
  previewYears: string
}

export default function EmailGate({ onSubmit, previewYears }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setError('أدخل إيميل صحيح')
      return
    }
    setLoading(true)
    saveEmail(email)
    // نحفظ الإيميل — يمكن لاحقاً نرسله لـ Resend أو Mailchimp
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    onSubmit(email)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
      {/* تيزر */}
      <div className="text-4xl mb-3">🔒</div>
      <h2 className="text-xl font-extrabold mb-2">نتيجتك جاهزة!</h2>
      <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-5">
        <p className="text-sm text-gray-400 mb-1">ستصل للمليون خلال تقريباً</p>
        <div className="text-3xl font-extrabold text-gold">{previewYears}</div>
        <p className="text-xs text-gray-500 mt-1">أدخل إيميلك لتشوف التفاصيل الكاملة</p>
      </div>

      {/* الفوائد */}
      <div className="text-right space-y-2 mb-5">
        {[
          '✅ النتيجة الكاملة بالسنوات والأشهر والتاريخ',
          '✅ رسم بياني لنمو ثروتك',
          '✅ مقارنة السيناريوهات',
          '✅ نصائح أسبوعية مجانية على إيميلك',
        ].map((item, i) => (
          <div key={i} className="text-sm text-gray-300">{item}</div>
        ))}
      </div>

      {/* الإيميل */}
      <input
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setError('') }}
        placeholder="بريدك الإلكتروني"
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-gold transition-colors mb-3 text-right"
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3.5 bg-gold hover:bg-yellow-600 text-white font-bold text-lg rounded-xl transition-all active:scale-95 disabled:opacity-70"
      >
        {loading ? '⏳ جاري التحقق...' : 'شوف نتيجتك الكاملة 🎯'}
      </button>

      <p className="text-xs text-gray-600 mt-3">
        🔒 لن نشارك إيميلك مع أحد · إلغاء الاشتراك في أي وقت
      </p>
    </div>
  )
}
