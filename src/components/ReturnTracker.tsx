'use client'

import { useEffect, useRef, useState } from 'react'
import { monthsSavedLabel } from '@/lib/calculator'
import { getPreviousSnapshot, saveSnapshot, Snapshot } from '@/lib/progress'

interface Props {
  currentMonths: number
  netWorth: number
}

// "الرفيق المتابع" — يقارن نتيجة اليوم بآخر زيارة (محلياً على جهاز المستخدم)
// ويحوّل الحاسبة من أداة تُستخدم مرة إلى شي يرجع له.
export default function ReturnTracker({ currentMonths, netWorth }: Props) {
  const [prev, setPrev] = useState<Snapshot | null>(null)
  const [ready, setReady] = useState(false)
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    setPrev(getPreviousSnapshot())
    saveSnapshot({ months: currentMonths, netWorth, at: Date.now() })
    setReady(true)
  }, [currentMonths, netWorth])

  if (!ready) return null

  // زيارة أولى (أو نفس الجلسة خلال دقائق) — ما نعرض شي، بس نحفظ النتيجة بصمت
  const minutesAgo = prev ? (Date.now() - prev.at) / 60000 : Infinity
  if (!prev || minutesAgo < 10) return null

  const diff = prev.months - currentMonths // موجب = تقدّم
  const days = Math.max(1, Math.round((Date.now() - prev.at) / 86400000))
  const since = days === 1 ? 'أمس' : days < 30 ? `${days} يوم` : `${Math.round(days / 30)} شهر`

  const tone =
    diff > 0
      ? { icon: '🚀', color: 'text-green-400', border: 'border-green-500/30', title: `قرّبت ${monthsSavedLabel(diff)} من المليون!` }
      : diff < 0
      ? { icon: '⚠️', color: 'text-orange-400', border: 'border-orange-500/30', title: `تأخّرت ${monthsSavedLabel(-diff)} عن آخر مرة` }
      : { icon: '⏸️', color: 'text-gold', border: 'border-gold/30', title: 'نفس مكانك من آخر مرة' }

  return (
    <div className={`glass-card border ${tone.border} rounded-2xl p-5 animate-fade-up`}>
      <p className="text-xs text-gray-400 mb-2">مقارنة مع زيارتك قبل {since}</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">{tone.icon}</div>
        <p className={`text-lg font-extrabold ${tone.color}`}>{tone.title}</p>
      </div>
      {diff <= 0 && (
        <p className="text-xs text-gray-400 mt-2">جرّب &quot;أقرب حركة&quot; فوق — خطوة وحدة ترجّعك للمسار.</p>
      )}
    </div>
  )
}
