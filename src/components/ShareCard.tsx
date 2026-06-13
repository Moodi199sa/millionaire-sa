'use client'

import { useRef, useState } from 'react'

interface Props {
  years: string
  totalMonths: number
  date: string
  goal: string
}

export default function ShareCard({ years, totalMonths, date, goal }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const days = totalMonths * 30
  const weeks = Math.round(totalMonths * 4.3)

  // عبارات تحفيزية عشوائية
  const motivations = [
    `🔥 ${totalMonths} شهر فقط تفصلك عن المليون الأول!`,
    `⚡ ${days.toLocaleString('ar-SA')} يوم وتصير مليونير!`,
    `🚀 ${weeks.toLocaleString('ar-SA')} أسبوع وتغير حياتك!`,
    `💎 المليون الأول في ${years} — هل تقبل التحدي؟`,
  ]
  const motivation = motivations[totalMonths % motivations.length]

  const challengeText = `🏆 تحدي المليونير!\n\nأنا سأصير مليونير خلال:\n${years} (${totalMonths} شهر فقط!)\n\nوأنت؟ كم شهر عندك؟\nاحسب نتيجتك الحين 👇\nmillionaire-sa.netlify.app`

  const copyChallenge = () => {
    navigator.clipboard.writeText(challengeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsapp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(challengeText)}`, '_blank')

  const shareX = () =>
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(challengeText)}`, '_blank')

  const downloadCard = async () => {
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      if (!cardRef.current) return
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0A0F1C',
        scale: 3,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = 'تحدي-المليون.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error(e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* البطاقة */}
      <div
        ref={cardRef}
        style={{
          background: '#0A0F1C',
          border: '2px solid #D4A017',
          borderRadius: '20px',
          padding: '28px 24px',
          textAlign: 'center',
          fontFamily: 'Tajawal, sans-serif',
          direction: 'rtl',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* خلفية زخرفية */}
        <div style={{ position: 'absolute', fontSize: '140px', opacity: 0.04, top: '-20px', right: '-15px', lineHeight: 1 }}>💰</div>
        <div style={{ position: 'absolute', fontSize: '140px', opacity: 0.04, bottom: '-20px', left: '-15px', lineHeight: 1 }}>🏆</div>

        {/* شعار التحدي */}
        <div style={{
          display: 'inline-block',
          background: '#D4A017',
          color: '#0A0F1C',
          fontSize: '11px',
          fontWeight: 900,
          padding: '5px 16px',
          borderRadius: '20px',
          marginBottom: '16px',
          letterSpacing: '1px',
        }}>
          🔥 تحدي المليونير
        </div>

        {/* العبارة التحفيزية */}
        <div style={{
          color: '#F5C842',
          fontSize: '13px',
          fontWeight: 700,
          marginBottom: '12px',
          padding: '0 8px',
        }}>
          {motivation}
        </div>

        {/* خط فاصل */}
        <div style={{ height: '1px', background: 'rgba(212,160,23,0.3)', margin: '0 16px 16px' }} />

        {/* النتيجة الرئيسية */}
        <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '6px' }}>
          أنا سأصير مليونير خلال
        </div>
        <div style={{ color: '#D4A017', fontSize: '44px', fontWeight: 900, lineHeight: 1.1, marginBottom: '4px' }}>
          {years}
        </div>

        {/* الأرقام التحفيزية */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '14px 0' }}>
          <div style={{ textAlign: 'center', background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: '10px', padding: '8px 14px' }}>
            <div style={{ color: '#D4A017', fontSize: '20px', fontWeight: 900 }}>{totalMonths}</div>
            <div style={{ color: '#6B7280', fontSize: '10px' }}>شهر</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: '10px', padding: '8px 14px' }}>
            <div style={{ color: '#D4A017', fontSize: '20px', fontWeight: 900 }}>{days.toLocaleString('ar-SA')}</div>
            <div style={{ color: '#6B7280', fontSize: '10px' }}>يوم</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: '10px', padding: '8px 14px' }}>
            <div style={{ color: '#D4A017', fontSize: '20px', fontWeight: 900 }}>{weeks.toLocaleString('ar-SA')}</div>
            <div style={{ color: '#6B7280', fontSize: '10px' }}>أسبوع</div>
          </div>
        </div>

        {/* خط فاصل */}
        <div style={{ height: '1px', background: 'rgba(212,160,23,0.3)', margin: '0 16px 14px' }} />

        {/* التحدي */}
        <div style={{
          background: 'rgba(212,160,23,0.08)',
          border: '1px solid rgba(212,160,23,0.25)',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '14px',
        }}>
          <div style={{ color: '#F5C842', fontSize: '15px', fontWeight: 900, marginBottom: '3px' }}>
            وأنت؟ كم شهر عندك؟ 🤔
          </div>
          <div style={{ color: '#6B7280', fontSize: '11px' }}>
            تحدّ أصدقائك — من يصير مليونير أول؟
          </div>
        </div>

        {date && (
          <div style={{ color: '#9CA3AF', fontSize: '11px', marginBottom: '10px' }}>
            📅 التاريخ المتوقع: {date}
          </div>
        )}

        {/* الرابط */}
        <div style={{
          background: 'rgba(212,160,23,0.15)',
          borderRadius: '8px',
          padding: '6px 14px',
          display: 'inline-block',
        }}>
          <span style={{ color: '#D4A017', fontSize: '11px', fontWeight: 700 }}>
            millionaire-sa.netlify.app
          </span>
        </div>


      </div>

      {/* عنوان */}
      <div className="text-center">
        <p className="text-sm font-bold text-white mb-1">🔥 تحدّ أصدقائك الحين!</p>
        <p className="text-xs text-gray-400">شارك نتيجتك — من يصير مليونير أول؟</p>
      </div>

      {/* أزرار المشاركة */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={downloadCard}
          disabled={downloading}
          className="py-3 bg-gold/20 border border-gold/40 text-gold text-sm font-bold rounded-xl hover:bg-gold/30 transition-all disabled:opacity-50"
        >
          {downloading ? '⏳ جاري...' : '📥 حمّل الصورة'}
        </button>
        <button
          onClick={copyChallenge}
          className="py-3 bg-white/5 border border-white/20 text-gray-300 text-sm font-bold rounded-xl hover:bg-white/10 transition-all"
        >
          {copied ? '✅ تم النسخ!' : '📋 نسخ التحدي'}
        </button>
        <button
          onClick={shareWhatsapp}
          className="py-3 bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold rounded-xl hover:bg-green-500/30 transition-all"
        >
          📱 تحدّ على واتساب
        </button>
        <button
          onClick={shareX}
          className="py-3 bg-white/10 border border-white/20 text-gray-300 text-sm font-bold rounded-xl hover:bg-white/20 transition-all"
        >
          𝕏 تحدّ على X
        </button>
      </div>



    </div>
  )
}
