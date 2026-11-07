'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Rocket, PlayCircle, Calculator, Zap, MapPin, Lock, Gift, Timer, ShieldCheck,
  ClipboardList, LineChart, Flag, CheckCircle2, ChevronDown, Sparkles, Map as MapIcon,
} from 'lucide-react'
import SiteShell from '@/components/site/SiteShell'
import GrowthSvg from '@/components/site/GrowthSvg'
import { calcMonthsToGoal, monthsToLabel, formatNumber, buildProjection } from '@/lib/calculator'
import { saveReferral, getReferralFromURL } from '@/lib/store'

const RISKS = [
  { v: 4, l: 'محافظ' },
  { v: 7, l: 'متوازن' },
  { v: 12, l: 'جريء' },
]

const FAQS = [
  { q: 'هل الحاسبة دقيقة؟', a: 'الحاسبة تعتمد على معادلة العائد المركب المعيارية. النتائج تقديرية وتفترض ثبات أرقامك، وهي مناسبة للتخطيط المالي الشخصي وليست استشارة مالية.' },
  { q: 'هل لازم أسجّل أو أعطيكم بياناتي؟', a: 'لا. الحساب كله يتم على جهازك بدون تسجيل. أرقامك ما تنحفظ عندنا، وتُستخدم بس لما تطلب التقرير المدفوع عشان نجهّزه لك.' },
  { q: 'وش الفرق بين محافظ ومتوازن وجريء؟', a: 'هو العائد السنوي المتوقع على ادخارك: محافظ (4%) مثل الصكوك والودائع، متوازن (7%) مثل صناديق المؤشرات، وجريء (12%) مثل الأسهم مع تقلبات أعلى.' },
  { q: 'وش يعطيني التقرير بـ 9 ريال؟', a: 'تحليل مخصص لأرقامك: مقارنة سيناريوهات، تشخيص وضعك ودرجة جاهزيتك، أفكار دخل إضافي، وخطة أسبوعية وأهداف واضحة.' },
  { q: 'ما عندي مدخرات، يفيدني الموقع؟', a: 'أكيد. الموقع مصمم للي يبدأ من الصفر — بتعرف متى توصل، ووش أسرع حركة تختصر عليك الطريق.' },
]

export default function HomePage() {
  const [saving, setSaving] = useState(3000)
  const [balance, setBalance] = useState(20000)
  const [risk, setRisk] = useState(7)

  useEffect(() => {
    const ref = getReferralFromURL()
    if (ref) saveReferral(ref)
  }, [])

  const months = calcMonthsToGoal(balance, saving, risk, 1000000)
  const years = Math.round((months / 12) * 10) / 10
  const points = buildProjection(balance, saving, risk, months, 30)

  return (
    <SiteShell>
      <main>
        {/* ═══ الواجهة ═══ */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(closest-side,rgba(245,158,11,0.35),transparent)' }} />
          <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-10 lg:pt-16 pb-14 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] gap-10 items-center">
            <div className="text-center lg:text-right">
              <span className="chip bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-5"><Sparkles size={13} /> مجاني بالكامل · بدون تسجيل</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.2] mb-4">
                متى بتصير <span className="text-amber-grad">مليونير؟</span> 💰
              </h1>
              <p className="text-xl lg:text-2xl font-bold text-gray-200 mb-3">اكتشف خطتك المالية للوصول لأول مليون ريال</p>
              <p className="text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                أجب على 4 أسئلة بسيطة، وشوف متى توصل للمليون، ووش أسرع الحركات اللي تختصر عليك سنين — والحساب كله على جهازك.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <Link href="/calculator" className="btn-primary px-8 py-4 text-lg">احسب موعد ثروتك الآن <Rocket size={20} /></Link>
                <a href="#how" className="btn-ghost px-6 py-4"><PlayCircle size={20} /> شوف كيف يشتغل</a>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <div className="card-soft px-4 py-3 text-center min-w-[120px]">
                  <p className="text-xl font-extrabold text-amber-400">14 سنة</p>
                  <p className="text-xs text-gray-400">متوسط الوصول</p>
                </div>
                <div className="card-soft px-4 py-3 text-center min-w-[120px]">
                  <p className="text-xl font-extrabold text-emerald-400">30 ثانية</p>
                  <p className="text-xs text-gray-400">للحصول على النتيجة</p>
                </div>
                <div className="card-soft px-4 py-3 text-center min-w-[120px]">
                  <p className="text-xl font-extrabold">100%</p>
                  <p className="text-xs text-gray-400">مجاني وخاص</p>
                </div>
              </div>
            </div>

            {/* المحاكي الحي */}
            <div className="rounded-3xl border border-white/[0.07] p-5 lg:p-6 shadow-2xl shadow-black/40"
              style={{ background: 'linear-gradient(160deg,#1E2631 0%,#18202A 60%,#152623 100%)' }}>
              <div className="flex items-center justify-between mb-5">
                <p className="font-extrabold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" /> محاكي المليون الحي</p>
                <span className="chip bg-white/[0.05] text-gray-400">جرّب الأرقام</span>
              </div>

              <div className="rounded-2xl bg-ink-950/70 p-4 mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">توصل للمليون بعد</p>
                  <p className="text-sm text-gray-300 font-bold">{monthsToLabel(months)}</p>
                </div>
                <p className="text-4xl font-extrabold text-amber-grad">{months >= 99999 ? '—' : `${years} سنة`}</p>
              </div>

              <Slider label="ادخارك الشهري" value={saving} min={500} max={30000} step={500} onChange={setSaving} />
              <Slider label="رصيدك الحالي (مدخرات + استثمار)" value={balance} min={0} max={500000} step={5000} onChange={setBalance} />

              <p className="text-sm font-bold text-gray-300 mb-2">نوع الاستثمار</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {RISKS.map((r) => (
                  <button key={r.v} onClick={() => setRisk(r.v)}
                    className={`py-2.5 rounded-xl text-sm font-extrabold border transition-all ${risk === r.v ? 'bg-amber-400 text-ink-950 border-amber-400' : 'bg-ink-850 text-gray-300 border-white/[0.06]'}`}>
                    {r.l} ({r.v}%)
                  </button>
                ))}
              </div>

              <div className="rounded-2xl bg-ink-950/50 p-3 mb-5">
                <GrowthSvg points={points} height={150} />
              </div>

              <Link href="/calculator" className="btn-primary w-full py-3.5">خصّص خطتك الكاملة <Rocket size={18} /></Link>
            </div>
          </div>
        </section>

        {/* ═══ شريط الثقة ═══ */}
        <section className="border-y border-white/[0.06] bg-ink-950/60">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Gift, t: 'مجاني 100%', s: 'الحاسبة والخارطة بدون مقابل' },
              { icon: Timer, t: 'نتيجة فورية', s: 'خلال 30 ثانية بس' },
              { icon: MapPin, t: 'مصمم للسعودية', s: 'بالريال ولهجتنا' },
              { icon: ShieldCheck, t: 'خصوصيتك محفوظة', s: 'الحساب على جهازك' },
            ].map((f) => (
              <div key={f.t} className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0"><f.icon size={22} /></span>
                <div><p className="font-extrabold text-sm">{f.t}</p><p className="text-xs text-gray-500">{f.s}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ تجربة رقمية ═══ */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-10">
            <p className="text-sm font-extrabold text-amber-400 mb-2">أدوات تشتغل معك</p>
            <h2 className="text-2xl lg:text-4xl font-extrabold">تجربة ترافقك من أول ريال لين المليون</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FeatureCard icon={Calculator} title="الحاسبة التفاعلية المباشرة" desc="تشوف نتيجتك تتغير لحظياً مع كل رقم تكتبه، مع مقارنة بالمتوسط." href="/calculator">
              <div className="rounded-xl bg-ink-950/70 p-4 text-center">
                <p className="text-xs text-gray-400">توصل لأول مليون خلال</p>
                <p className="text-2xl font-extrabold text-amber-grad">تسع سنوات وشهرين</p>
                <p className="text-xs text-emerald-400 font-bold mt-1">⚡ أسرع من المتوسط بـ 4.8 سنة</p>
              </div>
            </FeatureCard>
            <FeatureCard icon={MapIcon} title="خارطة تسريع الوصول" desc="موعد وصولك بالشهر والسنة، وأقوى 3 حركات تختصر عليك الطريق." href="/result">
              <div className="rounded-xl bg-ink-950/70 p-4 grid grid-cols-3 gap-2 text-center">
                {[['ادخار +500', 'سنة'], ['دخل إضافي', 'سنتين'], ['عائد 10%', '3 سنين']].map(([a, b]) => (
                  <div key={a} className="rounded-lg bg-white/[0.04] p-2"><p className="text-[11px] text-gray-400">{a}</p><p className="text-sm font-extrabold text-emerald-400">−{b}</p></div>
                ))}
              </div>
            </FeatureCard>
          </div>
        </section>

        {/* ═══ كيف يشتغل ═══ */}
        <section id="how" className="max-w-7xl mx-auto px-4 lg:px-8 pb-16 scroll-mt-24">
          <div className="text-center mb-10">
            <p className="text-sm font-extrabold text-emerald-400 mb-2">3 خطوات بس</p>
            <h2 className="text-2xl lg:text-4xl font-extrabold">كيف يشتغل &quot;متى تصير مليونير؟&quot;</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { n: '01', icon: ClipboardList, t: 'اكتب أرقامك', d: 'راتبك، مصروفك، مدخراتك، ونوع استثمارك — 4 أسئلة سريعة.' },
              { n: '02', icon: LineChart, t: 'شوف التحليل والسيناريوهات', d: 'نحسب مسارك بالعائد المركب ونقارنك بالمتوسط لحظياً.' },
              { n: '03', icon: Flag, t: 'خارطة وصولك للمليون', d: 'موعد وصولك، وأسرع الحركات اللي توفّر عليك سنين.' },
            ].map((s) => (
              <div key={s.n} className="card p-6 relative overflow-hidden">
                <span className="absolute top-4 left-5 text-5xl font-extrabold text-white/[0.05]">{s.n}</span>
                <span className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-5"><s.icon size={24} /></span>
                <h3 className="font-extrabold text-lg mb-2">{s.t}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ وش تحصل ═══ */}
        <section className="max-w-5xl mx-auto px-4 lg:px-8 pb-16">
          <div className="text-center mb-10">
            <p className="text-sm font-extrabold text-amber-400 mb-2">بوضوح</p>
            <h2 className="text-2xl lg:text-4xl font-extrabold">وش تحصل عليه؟</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card p-6 lg:p-8 flex flex-col">
              <p className="text-sm text-gray-400 font-bold">الحساب الفوري</p>
              <p className="text-4xl font-extrabold my-3">مجاني</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['موعد وصولك لأول مليون بالشهر والسنة', 'مقارنة نتيجتك بالمتوسط', 'رسم نمو ثروتك بالعائد المركب', 'أسرع 3 حركات تختصر عليك الطريق', 'بطاقة تحدّي تشاركها مع أصدقائك'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> {f}</li>
                ))}
              </ul>
              <Link href="/calculator" className="btn-ghost w-full py-3.5">ابدأ الحساب المجاني</Link>
            </div>
            <div className="rounded-2xl p-6 lg:p-8 flex flex-col border border-amber-400/40 relative"
              style={{ background: 'linear-gradient(160deg,#2A2418 0%,#1A212B 70%)' }}>
              <span className="absolute -top-3 right-6 chip bg-amber-400 text-ink-950">الأكثر فائدة</span>
              <p className="text-sm text-amber-400 font-bold">تقرير تسريع الثروة الشامل</p>
              <p className="text-4xl font-extrabold my-3">9 <span className="text-lg text-gray-300">ريال</span></p>
              <ul className="space-y-3 mb-8 flex-1">
                {['كل مزايا الحساب المجاني', 'مقارنة 5 سيناريوهات مخصصة لأرقامك', 'درجة جاهزيتك المالية وتشخيص وضعك', 'أفكار دخل إضافي تناسبك', 'خطة أسبوعية وأهداف واضحة'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-200"><CheckCircle2 size={18} className="text-amber-400 shrink-0" /> {f}</li>
                ))}
              </ul>
              <Link href="/checkout" className="btn-primary w-full py-3.5">احصل على تقريرك <Rocket size={18} /></Link>
            </div>
          </div>
        </section>

        {/* ═══ الأسئلة ═══ */}
        <section className="max-w-3xl mx-auto px-4 lg:px-8 pb-16">
          <h2 className="text-2xl lg:text-4xl font-extrabold text-center mb-8">الأسئلة الشائعة</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="card group">
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-5 font-extrabold">
                  {f.q}
                  <ChevronDown size={20} className="text-gray-400 transition-transform group-open:rotate-180 shrink-0" />
                </summary>
                <p className="px-5 pb-5 -mt-1 text-sm text-gray-400 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ═══ الدعوة الأخيرة ═══ */}
        <section className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="rounded-3xl border border-white/[0.07] p-8 lg:p-14 text-center"
            style={{ background: 'radial-gradient(120% 120% at 50% 0%,#2A2418 0%,#1A212B 55%,#151B23 100%)' }}>
            <span className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-5"><Zap size={28} /></span>
            <h2 className="text-2xl lg:text-4xl font-extrabold mb-3">رحلة المليون تبدأ بحساب رقم واحد اليوم</h2>
            <p className="text-gray-400 mb-8">30 ثانية بس — وتعرف وين أنت ووين رايح.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/calculator" className="btn-primary px-8 py-4 text-lg">ابدأ الحساب مجاناً <Rocket size={20} /></Link>
              <Link href="/result" className="btn-ghost px-6 py-4">استعرض خارطة ثروتك</Link>
            </div>
            <p className="text-xs text-gray-500 mt-5 flex items-center justify-center gap-1.5"><Lock size={12} /> بدون تسجيل · حساباتك على جهازك</p>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-300">{label}</span>
        <span className="font-extrabold">{formatNumber(value)} <span className="text-xs text-gray-400">ر.س</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="range w-full" style={{ ['--fill' as string]: `${((value - min) / (max - min)) * 100}%` }} aria-label={label} />
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc, href, children }: { icon: React.ElementType; title: string; desc: string; href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="card p-6 hover:border-amber-400/30 transition-colors block">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-11 h-11 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center"><Icon size={22} /></span>
        <h3 className="font-extrabold text-lg">{title}</h3>
      </div>
      <p className="text-sm text-gray-400 mb-5">{desc}</p>
      {children}
    </Link>
  )
}
