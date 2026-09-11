'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  years: string
  totalMonths: number
  date: string
  goal: string
}

export default function ShareCard({ years, totalMonths, date, goal }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const ogCardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const days = totalMonths * 30
  const weeks = Math.round(totalMonths * 4.3)

  // عبارات تحفيزية عشوائية
  const motivations = [
    `🔥 على بُعد ${totalMonths} شهراً من المليون الأول`,
    `⚡ رحلتك للمليون تستغرق ${years}`,
    `🚀 كل شهر يقربك أكثر من المليون`,
    `💎 المليون الأول ليس بعيداً — ${years} وتصله`,
  ]
  const motivation = motivations[totalMonths % motivations.length]

  const arDigits = (n: number) => String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d])
  const fallbackLink = `https://saudimillion.com/s/${totalMonths}`
  const buildText = (link: string) =>
    `🏆 تحدي المليونير\n\nأنا بكون مليونير خلال ${years}\nيعني ${arDigits(totalMonths)} شهر فقط 🔥\n\nوأنت؟ احسب متى بتصير مليونير 👇\n${link}`

  // رابط المشاركة الجاهز (يُرفع تلقائياً في الخلفية عند ظهور الكرت) — بحيث تكون
  // أزرار المشاركة متزامنة تماماً عند الضغط، بلا أي await قبل window.open، تجنّباً
  // لحظر النوافذ المنبثقة الذي تفرضه Safari على أي فتح نافذة يأتي بعد انتظار غير متزامن.
  const [shareLink, setShareLink] = useState(fallbackLink)

  // يلتقط نفس الكرت المعروض فعلياً (html-to-image) — هذا يضمن تطابق الصورة المشارَكة
  // مع ما يراه المستخدم بالضبط، بدون أي إعادة بناء للتصميم على السيرفر.
  const generateCardPng = async () => {
    const { toPng } = await import('html-to-image')
    if (!cardRef.current) return null
    await document.fonts.ready
    await new Promise((r) => setTimeout(r, 150))
    return toPng(cardRef.current, { backgroundColor: '#0A0F1C', pixelRatio: 3, cacheBust: true })
  }

  // نسخة أفقية بنفس الألوان والنصوص والعناصر بالضبط (نفس عناصر DOM حقيقية عبر
  // html-to-image، بلا أي محرّك رسم بديل) — تُستخدم فقط لصورة مشاركة تويتر/X،
  // لأن تويتر يرفض عرض معاينة لصورة عمودية طويلة كصورة "summary_large_image"
  // ويستبدلها بأيقونة عامة. الكرت الأصلي الطويل يبقى كما هو لزر "حمّل الصورة".
  const generateOgPng = async () => {
    const { toPng } = await import('html-to-image')
    if (!ogCardRef.current) return null
    await document.fonts.ready
    await new Promise((r) => setTimeout(r, 150))
    return toPng(ogCardRef.current, { backgroundColor: '#070b14', pixelRatio: 2, cacheBust: true })
  }

  // رفع الصورة في الخلفية بمجرد جهوزية الكرت — لا ينتظره أي زر مشاركة لاحقاً.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const dataUrl = await generateOgPng()
        if (!dataUrl || cancelled) return
        const res = await fetch('/api/share-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl, months: totalMonths }),
        })
        if (!res.ok || cancelled) return
        const { id } = await res.json()
        if (id && !cancelled) setShareLink(`https://saudimillion.com/c/${id}`)
      } catch {
        // يبقى الرابط الاحتياطي /s/{months} كما هو — المشاركة تظل تعمل
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalMonths])

  const copyChallenge = () => {
    navigator.clipboard.writeText(buildText(shareLink))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // الرابط والنص جاهزان مسبقاً (shareLink) فالفتح هنا متزامن تماماً مع الضغطة —
  // هذا هو الشرط الذي يمنع Safari من حظر النافذة.
  const shareWhatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildText(shareLink))}`, '_blank')
  }

  const shareX = () => {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildText(shareLink))}`, '_blank')
  }

  const downloadCard = async () => {
    setDownloading(true)
    try {
      const dataUrl = await generateCardPng()
      if (!dataUrl) return
      const link = document.createElement('a')
      link.download = 'تحدي-المليون.png'
      link.href = dataUrl
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
        }}>
          تحدي المليونير 🔥
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
          أنا بكون مليونير خلال
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
            وأنت؟ احسب متى بتصير مليونير 👇
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
            saudimillion.com
          </span>
        </div>


      </div>

      {/* نسخة أفقية مخفية بنفس الألوان والنصوص — تُستخدم فقط كصورة مشاركة تويتر/X
          (تويتر يرفض معاينة صورة عمودية طويلة كصورة كبيرة). موجودة في الصفحة فعلياً
          (مو display:none) عشان html-to-image يقدر يرسمها، لكن خارج الشاشة المرئية. */}
      <div
        ref={ogCardRef}
        style={{
          position: 'fixed',
          top: 0,
          left: '-99999px',
          width: '1200px',
          height: '630px',
          background: '#070b14',
          padding: '28px',
          fontFamily: 'Tajawal, sans-serif',
          direction: 'rtl',
        }}
      >
        <div style={{
          width: '100%', height: '100%', position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
          background: '#0A0F1C', border: '2px solid #D4A017', borderRadius: '24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '55px 44px', gap: '9px', textAlign: 'center',
        }}>
          <div style={{ position: 'absolute', fontSize: '150px', opacity: 0.05, top: '-10px', right: '20px', lineHeight: 1 }}>💰</div>
          <div style={{ position: 'absolute', fontSize: '150px', opacity: 0.05, bottom: '-20px', left: '20px', lineHeight: 1 }}>🏆</div>

          <div style={{ background: '#D4A017', color: '#0A0F1C', fontSize: '20px', fontWeight: 800, padding: '5px 20px', borderRadius: '18px' }}>
            تحدي المليونير 🔥
          </div>
          <div style={{ color: '#F5C842', fontSize: '19px', fontWeight: 700, maxWidth: '1020px' }}>
            {motivation}
          </div>
          <div style={{ width: '520px', height: '1px', background: 'rgba(212,160,23,0.3)', margin: '4px 0' }} />
          <div style={{ color: '#9CA3AF', fontSize: '20px' }}>أنا بكون مليونير خلال</div>
          <div style={{ color: '#D4A017', fontSize: '54px', fontWeight: 800, lineHeight: 1.15, maxWidth: '1080px' }}>{years}</div>

          <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '16px', margin: '6px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.25)', borderRadius: '14px', padding: '10px 24px' }}>
              <div style={{ color: '#D4A017', fontSize: '30px', fontWeight: 800 }}>{totalMonths.toLocaleString('ar-SA')}</div>
              <div style={{ color: '#8b93a1', fontSize: '15px' }}>شهر</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.25)', borderRadius: '14px', padding: '10px 24px' }}>
              <div style={{ color: '#D4A017', fontSize: '30px', fontWeight: 800 }}>{days.toLocaleString('ar-SA')}</div>
              <div style={{ color: '#8b93a1', fontSize: '15px' }}>يوم</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.25)', borderRadius: '14px', padding: '10px 24px' }}>
              <div style={{ color: '#D4A017', fontSize: '30px', fontWeight: 800 }}>{weeks.toLocaleString('ar-SA')}</div>
              <div style={{ color: '#8b93a1', fontSize: '15px' }}>أسبوع</div>
            </div>
          </div>

          <div style={{ width: '520px', height: '1px', background: 'rgba(212,160,23,0.3)', margin: '4px 0' }} />
          <div style={{ color: '#F5C842', fontSize: '24px', fontWeight: 800 }}>وأنت؟ احسب متى بتصير مليونير 👇</div>
          <div style={{ color: '#6B7280', fontSize: '16px' }}>تحدّ أصدقائك — من يصير مليونير أول؟</div>
          {date && <div style={{ color: '#9CA3AF', fontSize: '15px' }}>📅 التاريخ المتوقع: {date}</div>}
          <div style={{ background: 'rgba(212,160,23,0.15)', borderRadius: '9px', padding: '5px 18px', color: '#D4A017', fontSize: '18px', fontWeight: 700 }}>
            saudimillion.com
          </div>
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
// force 1781390792
