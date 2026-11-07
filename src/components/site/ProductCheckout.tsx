'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock, ShieldCheck, Zap, FileText, CheckCircle2, ChevronDown, Calculator, Undo2 } from 'lucide-react'
import PaymobButton from '@/components/PaymobButton'
import { getUserData, UserData } from '@/lib/store'
import { formatNumber, monthsToLabel } from '@/lib/calculator'

export interface Feature { icon: React.ElementType; title: string; desc: string }

interface Props {
  product: 'report' | 'ideas'
  price: number
  badge: string
  title: React.ReactNode
  subtitle: string
  productName: string
  features: Feature[]
  faqs: { q: string; a: string }[]
  preview: React.ReactNode
  requiresData?: boolean // التقرير يحتاج أرقام المستخدم عشان يتخصص
}

export default function ProductCheckout({ product, price, badge, title, subtitle, productName, features, faqs, preview, requiresData }: Props) {
  const [data, setData] = useState<UserData | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => { setData(getUserData()); setReady(true) }, [])

  const blocked = requiresData && ready && !data

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6 lg:gap-8 items-start">
      {/* ── الجزء الأول: العنوان والمعاينة ── */}
      <section className="lg:col-start-1 min-w-0">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="chip bg-amber-400/10 text-amber-400 border border-amber-400/20">✨ {badge}</span>
          <span className="chip bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"><Zap size={13} /> وصول فوري بعد الدفع</span>
        </div>
        <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-3">{title}</h1>
        <p className="text-gray-400 leading-relaxed mb-6 max-w-2xl">{subtitle}</p>
        <div className="rounded-3xl border border-white/[0.06] p-5 lg:p-8 overflow-hidden"
          style={{ background: 'radial-gradient(120% 100% at 50% 0%,#222A36 0%,#161C25 70%)' }}>
          {preview}
        </div>
      </section>

      {/* ── الدفع ── */}
      <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 space-y-4">
        <div className="card p-5 lg:p-6">
          <p className="font-extrabold text-lg flex items-center gap-2 mb-5"><Lock size={18} className="text-amber-400" /> الدفع السريع والآمن</p>

          {requiresData && data && (
            <div className="card-soft p-4 mb-4 text-sm space-y-2">
              <p className="text-xs text-gray-500 font-bold">بيتجهز تقريرك على أرقامك:</p>
              <Row l="الادخار الشهري" v={`${formatNumber(data.monthlySaving)} ريال`} />
              <Row l="صافي ثروتك" v={`${formatNumber(data.netWorth)} ريال`} />
              <Row l="توصل للمليون خلال" v={monthsToLabel(data.totalMonths)} amber />
            </div>
          )}

          <div className="flex items-center justify-between py-3 border-b border-white/[0.06] text-sm">
            <span className="text-gray-300">{productName}</span>
            <span className="font-bold">{price} ر.س</span>
          </div>
          <div className="flex items-end justify-between py-4">
            <div>
              <p className="font-extrabold">المجموع المطلوب:</p>
              <p className="text-[11px] text-gray-500">دفعة وحدة · بدون اشتراكات ولا رسوم خفية</p>
            </div>
            <p className="text-4xl font-extrabold text-amber-400">{price} <span className="text-base text-gray-300">ر.س</span></p>
          </div>

          <p className="text-xs font-bold text-gray-400 mb-2">طرق الدفع المتاحة:</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {['مدى', 'Apple Pay', 'VISA', 'Mastercard'].map((m) => (
              <span key={m} className="px-3 py-1.5 rounded-lg bg-ink-900 border border-white/[0.08] text-xs font-bold">{m}</span>
            ))}
          </div>

          {blocked ? (
            <>
              <div className="rounded-xl bg-amber-400/10 border border-amber-400/25 p-4 text-sm text-gray-200 mb-3">
                التقرير يتخصص على أرقامك أنت — احسب خارطتك أول (30 ثانية) وارجع هنا.
              </div>
              <Link href="/calculator" className="btn-primary w-full py-4 text-lg"><Calculator size={20} /> احسب أرقامي أولاً</Link>
            </>
          ) : (
            <PaymobButton amount={price} product={product} label={`ادفع ${price} ريال واستلم ${product === 'report' ? 'تقريرك' : 'الدليل'} فوراً ⚡`}
              className="btn-primary w-full py-4 text-lg" />
          )}

          <div className="mt-4 space-y-2 text-xs text-gray-400">
            <p className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-400" /> الدفع يتم عبر بوابة Paymob، وما نحفظ بيانات بطاقتك</p>
            <p className="flex items-center gap-2"><Undo2 size={14} className="text-emerald-400" /> سياسة استرداد خلال 24 ساعة — <Link href="/terms" className="underline hover:text-amber-400">الشروط</Link></p>
          </div>
        </div>

        <a href="mailto:support@amerniksa.com" className="card-soft p-4 flex items-center justify-between text-sm hover:border-white/20 transition-colors">
          <span><b>تحتاج مساعدة بالدفع؟</b><br /><span className="text-xs text-gray-400">راسلنا ونرد عليك بأسرع وقت</span></span>
          <span className="chip bg-emerald-400/10 text-emerald-400">تواصل</span>
        </a>
      </aside>

      {/* ── الجزء الثاني: المحتوى والأسئلة ── */}
      <section className="lg:col-start-1 min-w-0 space-y-10">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold mb-4">وش بتحصل عليه بعد الدفع؟</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="card p-5">
                <span className="w-11 h-11 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-3"><f.icon size={22} /></span>
                <p className="font-extrabold mb-1">{f.title}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold mb-4">أسئلة شائعة</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="card group">
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-5 font-extrabold">
                  {f.q}<ChevronDown size={20} className="text-gray-400 transition-transform group-open:rotate-180 shrink-0" />
                </summary>
                <p className="px-5 pb-5 -mt-1 text-sm text-gray-400 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function Row({ l, v, amber }: { l: string; v: string; amber?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{l}</span>
      <span className={`font-extrabold ${amber ? 'text-amber-400' : ''}`}>{v}</span>
    </div>
  )
}

// معاينة مصغّرة لصفحات المنتج (رسم توضيحي — مو صورة حقيقية)
export function PreviewPages({ icon: Icon, lines, accent }: { icon: React.ElementType; lines: string[]; accent: string }) {
  return (
    <div className="relative flex items-center justify-center py-4 min-h-[260px]">
      <div className="absolute w-44 h-60 rounded-2xl bg-ink-700 border border-white/[0.06] -rotate-6 translate-x-24 hidden sm:block" />
      <div className="absolute w-44 h-60 rounded-2xl bg-ink-700 border border-white/[0.06] rotate-6 -translate-x-24 hidden sm:block" />
      <div className="relative w-64 rounded-2xl bg-ink-800 border border-white/10 p-5 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${accent}22`, color: accent }}><Icon size={18} /></span>
          <span className="h-2.5 w-24 rounded bg-white/20" />
        </div>
        <div className="space-y-2.5">
          {lines.map((l) => (
            <p key={l} className="flex items-center gap-2 text-[12px] text-gray-300"><CheckCircle2 size={14} style={{ color: accent }} /> {l}</p>
          ))}
        </div>
        <div className="mt-4 h-16 rounded-lg bg-white/[0.04] flex items-end gap-1.5 p-2">
          {[30, 45, 40, 60, 75, 90].map((h, i) => <span key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: accent, opacity: 0.35 + i * 0.1 }} />)}
        </div>
      </div>
      <FileText className="absolute bottom-2 left-3 text-white/10" size={56} />
    </div>
  )
}
