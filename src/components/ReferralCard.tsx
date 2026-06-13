'use client'

import { useState, useEffect } from 'react'
import { getEmail, generateReferralCode } from '@/lib/store'

export default function ReferralCard() {
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const email = getEmail()
    if (email) setCode(generateReferralCode(email))
  }, [])

  if (!code) return null

  const referralLink = `https://millionaire-sa.netlify.app?ref=${code}`

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsapp = () => {
    const text = `💰 جربت حاسبة "متى تصير مليونير؟" وعرفت متى أوصل لأول مليون ريال!\n\nجربها مجاناً: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareX = () => {
    const text = `💰 اكتشفت متى سأصبح مليونير بهذه الأداة المجانية! جربها أنت أيضاً`
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`, '_blank')
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🎁</span>
        <div>
          <p className="text-sm font-bold">شارك واحصل على خصم</p>
          <p className="text-xs text-gray-400">كل صديق يسجل عبر رابطك = خصم 20% على تقريرك القادم</p>
        </div>
      </div>

      {/* الرابط */}
      <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex justify-between items-center mb-3 gap-2">
        <span className="text-xs text-gray-400 truncate flex-1">{referralLink}</span>
        <button
          onClick={copyLink}
          className="text-xs text-gold font-bold shrink-0 hover:text-yellow-400 transition-colors"
        >
          {copied ? '✓ تم' : 'نسخ'}
        </button>
      </div>

      {/* أزرار المشاركة */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={shareWhatsapp}
          className="py-2.5 bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold rounded-xl hover:bg-green-500/30 transition-all"
        >
          📱 واتساب
        </button>
        <button
          onClick={shareX}
          className="py-2.5 bg-white/10 border border-white/20 text-gray-300 text-sm font-bold rounded-xl hover:bg-white/20 transition-all"
        >
          𝕏 تويتر
        </button>
      </div>

      <p className="text-xs text-gray-600 text-center mt-3">
        كودك: <span className="text-gold font-bold">{code}</span>
      </p>
    </div>
  )
}
