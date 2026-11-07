'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CalendarClock, Hourglass, Flag, Printer, Zap, PiggyBank, Briefcase, TrendingUp,
  CheckCircle2, Lock, SlidersHorizontal, Info, Calculator, AlertTriangle, Lightbulb,
} from 'lucide-react'
import SiteShell from '@/components/site/SiteShell'
import GrowthSvg from '@/components/site/GrowthSvg'
import ShareCard from '@/components/ShareCard'
import PaymobButton from '@/components/PaymobButton'
import ReturnTracker from '@/components/ReturnTracker'
import Challenge30 from '@/components/Challenge30'
import ReferralCard from '@/components/ReferralCard'
import { getUserData, UserData } from '@/lib/store'
import {
  monthsToLabel, formatNumber, targetDate, arrivalMonthYear, buildProjection,
  contributionSplit, buildLevers, monthsSavedLabel, calcMonthsToGoal,
} from '@/lib/calculator'

const GOAL = 1000000

export default function ResultPage() {
  const [data, setData] = useState<UserData | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setData(getUserData())
    setReady(true)
  }, [])

  if (!ready) return <SiteShell><div className="min-h-[60vh]" /></SiteShell>

  if (!data) {
    return (
      <SiteShell>
        <main className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-5"><Calculator size={30} /></div>
          <h1 className="text-2xl font-extrabold mb-2">خارطتك ما انرسمت للحين</h1>
          <p className="text-gray-400 mb-8">جاوب على 4 أسئلة سريعة (30 ثانية) ونرسم لك خارطة وصولك لأول مليون.</p>
          <Link href="/calculator" className="btn-primary px-8 py-4 text-lg">احسب خارطتي الآن</Link>
        </main>
      </SiteShell>
    )
  }

  if (data.monthlySaving <= 0) {
    return (
      <SiteShell>
        <main className="max-w-xl mx-auto px-4 py-14">
          <div className="card p-6 lg:p-8 text-center border-red-500/30">
            <AlertTriangle size={44} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-red-400 mb-3">مصروفك أكثر من راتبك</h1>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">بهالوضع ما تقدر توصل للمليون. أول خطوة: تقلل مصاريفك أو تزيد دخلك.</p>
            <div className="space-y-3 text-right mb-6">
              {['قلّل مصاريفك ولو 200 ريال كل شهر', 'دوّر مصدر دخل إضافي ولو صغير', 'راجع اشتراكاتك الشهرية وألغِ اللي ما تحتاجه'].map((tip) => (
                <div key={tip} className="card-soft flex items-center gap-3 p-3 text-sm"><Lightbulb size={18} className="text-amber-400" /><span className="text-gray-300">{tip}</span></div>
              ))}
            </div>
            <Link href="/calculator" className="btn-primary w-full py-3.5">عدّل أرقامك واحسب من جديد</Link>
          </div>
        </main>
      </SiteShell>
    )
  }

  const months = data.totalMonths
  const rate = data.rate || 4
  const arrival = arrivalMonthYear(months)
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  const progressPct = Math.min(100, Math.round((data.netWorth / GOAL) * 1000) / 10)
  const points = buildProjection(data.netWorth, data.monthlySaving, rate, months)
  const split = contributionSplit(data.netWorth, data.monthlySaving, months)
  const levers = buildLevers(data.netWorth, data.monthlySaving, rate, months, GOAL)
  const maxSaved = levers.length ? Math.max(...levers.map((l) => l.monthsSaved)) : 0
  const startYear = new Date().getFullYear()
  const xLabels = [String(startYear), String(startYear + Math.round(years / 3)), String(startYear + Math.round((2 * years) / 3)), arrival ? String(arrival.year) : '']
  const scenarios = [
    { label: 'وضعك الحالي', months },
    { label: '+ ادخار 500 ريال/شهر', months: calcMonthsToGoal(data.netWorth, data.monthlySaving + 500, rate, GOAL) },
    { label: '+ ادخار 1000 ريال/شهر', months: calcMonthsToGoal(data.netWorth, data.monthlySaving + 1000, rate, GOAL) },
    { label: '+ دخل إضافي 2000 ريال', months: calcMonthsToGoal(data.netWorth, data.monthlySaving + 2000, rate, GOAL) },
    { label: '🌟 استثمار بعائد 10%', months: calcMonthsToGoal(data.netWorth, data.monthlySaving, 10, GOAL) },
  ]
  const alreadyThere = months === 0

  return (
    <SiteShell>
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10 space-y-6">
        {/* العنوان */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="chip bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 mb-3"><CheckCircle2 size={13} /> تم حساب مسارك المالي</p>
            <h1 className="text-2xl lg:text-4xl font-extrabold">خارطة تراكم المليون الأول الخاصة بك</h1>
          </div>
          <div className="flex gap-2 no-print">
            <button onClick={() => window.print()} className="btn-ghost px-4 py-2.5 text-sm"><Printer size={16} /> طباعة</button>
            <a href="#levers" className="btn-primary px-4 py-2.5 text-sm"><Zap size={16} /> سرّع خطتك</a>
          </div>
        </div>

        {/* موعد الوصول + الإحصائيات */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
          <div className="rounded-3xl p-6 lg:p-8 border border-white/[0.06] relative overflow-hidden"
            style={{ background: 'linear-gradient(150deg,#1E2631 0%,#18202A 60%,#16272A 100%)' }}>
            <div className="flex items-center justify-between mb-5">
              <span className="chip bg-amber-400/10 text-amber-400 border border-amber-400/20">🎯 لحظة الوصول التاريخية</span>
              <span className="text-xs text-gray-400">الهدف: <b className="text-white">1,000,000 ر.س</b></span>
            </div>
            {alreadyThere ? (
              <p className="text-4xl lg:text-6xl font-extrabold text-amber-grad">أنت مليونير أصلاً 🎉</p>
            ) : (
              <>
                <p className="text-gray-300 mb-2">بإذن الله بتوصل لأول مليون ريال في:</p>
                <p className="text-5xl lg:text-7xl font-extrabold text-amber-grad leading-tight">{arrival?.month} {arrival?.year}</p>
                <p className="text-emerald-400 font-extrabold text-lg mt-2">خلال {monthsToLabel(months)}</p>
              </>
            )}
            <div className="mt-8 rounded-2xl bg-ink-950/60 p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">وين أنت اليوم من المليون</span>
                <span className="font-extrabold text-emerald-400">{progressPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-ink-600 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.max(progressPct, 1.5)}%`, background: 'linear-gradient(to left,#F59E0B,#34D399)' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>عندك الحين: <b className="text-white">{formatNumber(data.netWorth)} ر.س</b></span>
                <span>باقي: <b className="text-white">{formatNumber(Math.max(0, GOAL - data.netWorth))} ر.س</b></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
            {[
              { icon: CalendarClock, v: months, l: 'شهر', sub: 'إجمالي الأشهر المتبقية' },
              { icon: Hourglass, v: Math.round(months * 4.345), l: 'أسبوع', sub: 'من الالتزام والادخار' },
              { icon: Flag, v: Math.round(months * 30.44), l: 'يوم', sub: 'تفصلك عن الهدف' },
            ].map((s) => (
              <div key={s.l} className="card p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                <s.icon size={22} className="text-amber-400 order-first lg:order-last" />
                <div>
                  <p className="text-2xl lg:text-4xl font-extrabold">{formatNumber(s.v)}</p>
                  <p className="text-xs text-gray-400"><b className="text-gray-200">{s.l}</b> <span className="hidden sm:inline">· {s.sub}</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* المقارنة مع آخر زيارة */}
        <ReturnTracker currentMonths={months} netWorth={data.netWorth} />

        {/* الرسم + بطاقة المشاركة */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-5 items-start">
          <div className="card p-5 lg:p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-extrabold text-lg flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" /> قوة الأرباح المركبة</h2>
              <div className="flex gap-3 text-[11px] text-gray-400">
                <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-emerald-400" /> مع الاستثمار</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 border-t-2 border-dashed border-gray-400" /> ادخار فقط</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">مقارنة ثروتك مع عائد {rate}% سنوياً مقابل الادخار بدون استثمار</p>
            <GrowthSvg points={points} showPlain height={260} xLabels={xLabels} />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="card-soft p-4">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><PiggyBank size={14} /> من جيبك (ادخارك)</p>
                <p className="text-xl font-extrabold">{formatNumber(split.contributions)} <span className="text-xs text-gray-400">ر.س</span></p>
                <p className="text-xs text-gray-400">{split.contribPct}%</p>
              </div>
              <div className="card-soft p-4">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><TrendingUp size={14} /> أرباح العائد المركب</p>
                <p className="text-xl font-extrabold text-emerald-400">{formatNumber(split.gains)} <span className="text-xs text-gray-400">ر.س</span></p>
                <p className="text-xs text-emerald-400/80">{split.gainsPct}%</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-extrabold text-lg mb-1">شارك إنجازك وتحدّ أصدقائك</h2>
            <p className="text-xs text-gray-400 mb-4">نزّل البطاقة أو شاركها على واتساب وX بضغطة وحدة</p>
            <ShareCard years={monthsToLabel(months)} totalMonths={months} date={targetDate(months)} goal="مليون ريال" />
          </div>
        </section>

        {/* الحركات اللي تختصر الطريق */}
        {levers.length > 0 && (
          <section id="levers" className="scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
              <div>
                <p className="text-sm font-extrabold text-emerald-400 mb-1">⚡ التسريع الذكي للمسار</p>
                <h2 className="text-2xl lg:text-3xl font-extrabold">كيف تختصر {monthsSavedLabel(maxSaved)} وتوصل للمليون أسرع؟</h2>
                <p className="text-sm text-gray-400 mt-1">ما تحتاج تضاعف راتبك — تعديلات بسيطة ومحسوبة توفّر عليك سنين.</p>
              </div>
              <span className="chip bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 self-start sm:self-auto">⚡ وفّر لين {monthsSavedLabel(maxSaved)}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {levers.map((l) => {
                const Icon = l.key === 'save' ? PiggyBank : l.key === 'income' ? Briefcase : TrendingUp
                const a = arrivalMonthYear(l.months)
                return (
                  <div key={l.key} className="card p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-11 h-11 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center"><Icon size={22} /></span>
                      <span className="chip bg-amber-400/10 text-amber-400">توفّر {monthsSavedLabel(l.monthsSaved)}</span>
                    </div>
                    <h3 className="font-extrabold text-lg mb-2">{l.label}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed flex-1">{l.action}</p>
                    <div className="mt-4 rounded-xl bg-ink-900 border border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">موعد وصولك الجديد:</span>
                      <span className="font-extrabold text-amber-400">{a?.month} {a?.year}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* عرض التقرير */}
        <section className="rounded-3xl border border-amber-400/25 p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-center"
          style={{ background: 'linear-gradient(135deg,#1E2631 0%,#1A212B 60%,#2A2418 100%)' }}>
          <div>
            <span className="chip bg-amber-400/15 text-amber-400 mb-4">⭐ التقرير الشامل</span>
            <h2 className="text-2xl lg:text-4xl font-extrabold leading-tight mb-3">احصل على &quot;تقرير تسريع الثروة الشامل&quot; وخطة التنفيذ</h2>
            <p className="text-gray-400 leading-relaxed mb-6">تحليل مخصص لأرقامك أنت: يقارن السيناريوهات، ويطلع لك الطريق الأسرع للمليون، مع خطة أسبوعية تبدأ فيها بكرة.</p>
            <div className="grid sm:grid-cols-2 gap-3 mb-7">
              {['مقارنة 5 سيناريوهات لوضعك', 'درجة جاهزيتك المالية وتشخيص وضعك', 'أفكار دخل إضافي تناسبك', 'خطة أسبوعية وأهداف واضحة'].map((f) => (
                <p key={f} className="flex items-center gap-2 text-sm"><CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> {f}</p>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-amber-400">9</span>
                <span className="text-gray-300 font-bold">ريال فقط</span>
              </div>
              <PaymobButton amount={9} product="report" label="احصل على تقريرك المخصص الآن 🚀" className="btn-primary px-8 py-4 text-lg flex-1 sm:flex-none" />
            </div>
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5"><Lock size={12} /> دفع آمن عبر Paymob — مدى / فيزا / ماستركارد / Apple Pay</p>
          </div>

          {/* معاينة مموّهة */}
          <div className="rounded-2xl bg-ink-950/70 border border-white/[0.06] p-4" aria-hidden="true">
            <p className="text-xs text-gray-400 mb-3 font-bold">لمحة من تقريرك</p>
            <div className="space-y-2">
              {scenarios.map((s, i) => (
                <div key={s.label} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-sm">
                  <span className="text-gray-300">{s.label}</span>
                  <span className={`font-bold ${i >= 2 ? 'blur-[6px] select-none' : 'text-white'}`}>{i >= 2 ? 'X سنوات' : monthsToLabel(s.months)}</span>
                </div>
              ))}
            </div>
            <div className="relative mt-3 rounded-xl overflow-hidden">
              <div className="p-3 space-y-2 select-none">
                <div className="h-2 w-full bg-white/10 rounded" /><div className="h-2 w-5/6 bg-white/10 rounded" /><div className="h-2 w-2/3 bg-white/10 rounded" />
              </div>
              <div className="absolute inset-0 backdrop-blur-[3px] bg-ink-950/40 flex items-center justify-center gap-2 text-sm font-bold">
                <Lock size={16} className="text-amber-400" /> افتحه بـ 9 ريال
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <Challenge30 monthlySaving={data.monthlySaving} />
          <div className="space-y-5">
            <ReferralCard />
            <Link href="/ideas-checkout" className="card p-5 flex items-center justify-between gap-4 hover:border-amber-400/30 transition-colors">
              <div>
                <p className="font-extrabold">💡 دليل 100 فكرة مشروع</p>
                <p className="text-sm text-gray-400">أفكار عملية تزيد دخلك وتقرّبك من المليون</p>
              </div>
              <span className="chip bg-amber-400 text-ink-950 shrink-0">49 ريال</span>
            </Link>
          </div>
        </div>

        <div className="card-soft px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <p className="text-sm text-gray-400 flex items-center gap-2"><Info size={16} className="text-amber-400" /> تغيّرت أرقامك؟ عدّلها ونحدّث خارطتك فوراً.</p>
          <Link href="/calculator" className="btn-ghost px-5 py-2.5 text-sm"><SlidersHorizontal size={16} /> تعديل المدخلات</Link>
        </div>
      </main>
    </SiteShell>
  )
}
