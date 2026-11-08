'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Wallet, PiggyBank, TrendingUp, ClipboardCheck, Check, ArrowRight, ArrowLeft,
  Shield, Scale, Rocket, Timer, Zap, Lightbulb,
} from 'lucide-react'
import SiteShell from '@/components/site/SiteShell'
import GrowthSvg from '@/components/site/GrowthSvg'
import {
  calcMonthsToGoal, monthsToLabel, formatNumber, buildProjection, contributionSplit,
  monthsSavedLabel, AVERAGE_MONTHS,
} from '@/lib/calculator'
import { saveUserData, saveReferral, getReferralFromURL } from '@/lib/store'

const GOAL = 1000000

const STEPS = [
  { key: 'income', short: 'الدخل والمصاريف', title: 'دخلك ومصاريفك', icon: Wallet },
  { key: 'savings', short: 'المدخرات', title: 'مدخراتك الحالية', icon: PiggyBank },
  { key: 'invest', short: 'الاستثمار', title: 'بناء مسارك الاستثماري', icon: TrendingUp },
  { key: 'confirm', short: 'التأكيد النهائي', title: 'التأكيد والمحاكاة', icon: ClipboardCheck },
]
const ORDINAL = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة']

const STRATEGIES = [
  { value: 4, label: 'محافظ', sub: 'صكوك، ودائع مرابحة، وصناديق نقدية منخفضة التقلب.', icon: Shield },
  { value: 7, label: 'متوازن', sub: 'صناديق مؤشرات عالمية (ETFs) ومحافظ استثمارية متنوعة.', icon: Scale, recommended: true },
  { value: 12, label: 'نمو وجريء', sub: 'أسهم قيادية ونمو استثماري نشط مع تقلبات سوقية أعلى.', icon: Rocket },
]

export default function CalculatorPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [salary, setSalary] = useState('')
  const [expenses, setExpenses] = useState('')
  const [hasSavings, setHasSavings] = useState<null | boolean>(null)
  const [savings, setSavings] = useState('')
  const [hasInvestments, setHasInvestments] = useState<null | boolean>(null)
  const [investments, setInvestments] = useState('')
  // العائد الافتراضي 4% (محافظ) لمن ما عنده استثمار، و7% لمن عنده — نفس منطق
  // الحاسبة السابق بالضبط، مع إمكانية تغييره يدوياً.
  const [rate, setRate] = useState<number>(4)
  const [rateTouched, setRateTouched] = useState(false)

  useEffect(() => {
    const ref = getReferralFromURL()
    if (ref) saveReferral(ref)
  }, [])

  const chooseInvestments = (v: boolean) => {
    setHasInvestments(v)
    if (!v) setInvestments('')
    if (!rateTouched) setRate(v ? 7 : 4)
  }
  const chooseRate = (v: number) => { setRate(v); setRateTouched(true) }

  // ─── الحساب اللحظي ───
  const live = useMemo(() => {
    const s = Number(salary) || 0
    const e = Number(expenses) || 0
    if (!salary || !expenses || s <= 0) return null
    const monthlySaving = s - e
    const netWorth = (hasSavings ? Number(savings) || 0 : 0) + (hasInvestments ? Number(investments) || 0 : 0)
    if (monthlySaving <= 0) return { monthlySaving, netWorth, months: 99999 }
    const months = calcMonthsToGoal(netWorth, monthlySaving, rate, GOAL)
    return { monthlySaving, netWorth, months }
  }, [salary, expenses, hasSavings, savings, hasInvestments, investments, rate])

  const canGoNext = () => {
    if (step === 1) {
      const s = Number(salary), e = Number(expenses)
      return salary !== '' && expenses !== '' && s > 0 && s <= 10_000_000 && e >= 0 && e <= 10_000_000
    }
    if (step === 2) {
      if (hasSavings === null) return false
      if (hasSavings === false) return true
      const sv = Number(savings)
      return savings !== '' && sv >= 0 && sv <= 100_000_000
    }
    if (step === 3) {
      if (hasInvestments === null) return false
      if (hasInvestments === false) return true
      const inv = Number(investments)
      return investments !== '' && inv >= 0 && inv <= 100_000_000
    }
    return true
  }

  const calculate = () => {
    const s = Number(salary) || 0
    const e = Number(expenses) || 0
    const sv = hasSavings ? Number(savings) || 0 : 0
    const inv = hasInvestments ? Number(investments) || 0 : 0
    const netWorth = sv + inv
    const monthlySaving = s - e
    const totalMonths = monthlySaving <= 0 ? 99999 : calcMonthsToGoal(netWorth, monthlySaving, rate, GOAL)
    saveUserData({ salary: s, expenses: e, savings: sv, investments: inv, rate, monthlySaving, netWorth, totalMonths })
    // لو جاي من التقرير المدفوع (ما كان فيه أرقام)، يرجع للتقرير مباشرة
    const next = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null
    router.push(next === 'report' ? '/report' : '/result')
  }

  const next = () => {
    if (step < 4) { setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    else calculate()
  }

  const progress = Math.round(((step - 1) / 4) * 100 + 25)
  const current = STEPS[step - 1]
  const StepIcon = current.icon

  return (
    <SiteShell>
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        <h1 className="sr-only">احسب متى تصير مليونير</h1>

        {step === 1 && (
          <div className="text-center lg:text-right mb-6">
            <p className="text-gray-400">المتوسط يحتاج <span className="text-amber-400 font-extrabold">14 سنة</span> عشان يوصل لأول مليون…</p>
            <p className="text-2xl lg:text-3xl font-extrabold mt-1">وأنت؟ <span className="text-gray-400 text-base lg:text-lg font-bold">اكتب راتبك وشوف فوراً 👇</span></p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] gap-6 items-start">
          {/* ═══ النموذج ═══ */}
          <div className="space-y-5 min-w-0">
            {/* شريط المراحل */}
            <section className="card p-5 lg:p-6">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 font-extrabold flex items-center justify-center">0{step}</span>
                  <div>
                    <p className="text-[11px] text-gray-500">المرحلة الحالية</p>
                    <p className="font-extrabold text-amber-400 text-lg leading-tight">{current.title}</p>
                  </div>
                </div>
                <span className="chip bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {progress}% مكتمل
                </span>
              </div>
              <div className="h-2 rounded-full bg-ink-600 overflow-hidden mb-4">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: 'linear-gradient(to left,#34D399,#F59E0B)', marginInlineStart: 0 }} />
              </div>
              <ol className="grid grid-cols-4 gap-1 text-center">
                {STEPS.map((s, i) => {
                  const n = i + 1
                  const done = n < step
                  const active = n === step
                  return (
                    <li key={s.key} className="flex flex-col items-center gap-1.5">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                        done ? 'bg-emerald-400 text-ink-950' : active ? 'bg-amber-400 text-ink-950' : 'bg-ink-600 text-gray-400'
                      }`}>
                        {done ? <Check size={15} strokeWidth={3} /> : n}
                      </span>
                      <span className={`text-[11px] sm:text-xs font-bold ${done ? 'text-emerald-400' : active ? 'text-white' : 'text-gray-500'}`}>{s.short}</span>
                    </li>
                  )
                })}
              </ol>
            </section>

            {/* محتوى الخطوة */}
            <section className="card p-5 lg:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-extrabold text-amber-400 mb-1">الخطوة {ORDINAL[step - 1]}</p>
                  <h2 className="text-xl lg:text-2xl font-extrabold">
                    {step === 1 && 'كم راتبك وكم تصرف بالشهر؟'}
                    {step === 2 && 'عندك مدخرات حالية؟'}
                    {step === 3 && 'عندك استثمارات؟ ووش استراتيجيتك؟'}
                    {step === 4 && 'جاهز تشوف خارطتك؟'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {step === 1 && 'صافي راتبك الشهري ومصاريفك التقريبية — الحساب يتم على جهازك.'}
                    {step === 2 && 'أي مبلغ مدّخر عندك اليوم (حساب ادخار، كاش، ودائع).'}
                    {step === 3 && 'حدد نوع العائد المتوقع على ادخارك حسب تحمّلك للمخاطر.'}
                    {step === 4 && 'راجع أرقامك، وإذا كل شي تمام احسب خارطة وصولك للمليون.'}
                  </p>
                </div>
                <span className="hidden sm:flex w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 items-center justify-center shrink-0">
                  <StepIcon size={28} />
                </span>
              </div>

              {step === 1 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <MoneyField label="💰 راتبك الشهري" value={salary} onChange={setSalary} autoFocus />
                  <MoneyField label="🛒 مصروفك الشهري" value={expenses} onChange={setExpenses} />
                  <div className="sm:col-span-2">
                    {salary && expenses && Number(salary) > Number(expenses) && (
                      <p className="text-emerald-400 text-sm font-bold">✅ تدّخر {formatNumber(Number(salary) - Number(expenses))} ريال بالشهر</p>
                    )}
                    {salary && expenses && Number(salary) <= Number(expenses) && (
                      <p className="text-red-400 text-sm font-bold">⚠️ مصروفك أكثر من راتبك</p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <YesNo value={hasSavings} onChange={(v) => { setHasSavings(v); if (!v) setSavings('') }} />
                  {hasSavings === true && <MoneyField label="كم مدخراتك؟" value={savings} onChange={setSavings} autoFocus max={100000000} />}
                  {hasSavings === false && <p className="text-gray-400 text-sm">ولا يهمك — الادخار يبدأ من اليوم 💪</p>}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <YesNo value={hasInvestments} onChange={chooseInvestments} />
                  {hasInvestments === true && <MoneyField label="كم قيمة استثماراتك الحالية؟" value={investments} onChange={setInvestments} autoFocus max={100000000} />}

                  {hasInvestments !== null && (
                    <>
                      <div>
                        <p className="font-extrabold mb-3">{hasInvestments ? 'نوع استراتيجيتك الاستثمارية' : 'وين بتستثمر ادخارك؟'}</p>
                        <div className="grid sm:grid-cols-3 gap-3">
                          {STRATEGIES.map((st) => {
                            const Icon = st.icon
                            const active = rate === st.value
                            return (
                              <button key={st.value} type="button" onClick={() => chooseRate(st.value)}
                                className={`text-right rounded-2xl p-4 border transition-all ${
                                  active ? 'bg-amber-400/[0.08] border-amber-400/60 shadow-[0_0_0_1px_rgba(245,158,11,0.3)]' : 'bg-ink-850 border-white/[0.06] hover:border-white/20'
                                }`}>
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-amber-400 text-ink-950' : 'bg-ink-700 text-gray-300'}`}>
                                    <Icon size={20} />
                                  </span>
                                  <span className={`font-extrabold ${active ? 'text-amber-400' : 'text-emerald-400'}`}>{st.value}% سنوياً</span>
                                </div>
                                <p className="font-extrabold text-lg flex items-center gap-2">
                                  {st.label}
                                  {st.recommended && <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-400">الموصى به</span>}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{st.sub}</p>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold text-gray-300">تخصيص معدل العائد السنوي بدقة:</p>
                          <span className="text-2xl font-extrabold text-amber-400">{rate}%</span>
                        </div>
                        <input type="range" min={2} max={15} step={0.5} value={rate}
                          onChange={(e) => chooseRate(Number(e.target.value))}
                          className="range w-full" style={{ ['--fill' as string]: `${((rate - 2) / 13) * 100}%` }}
                          aria-label="معدل العائد السنوي" />
                        <div className="flex justify-between text-[11px] text-gray-500 mt-2">
                          <span>تحفظ شديد (2%)</span><span>الأسواق العالمية (8–10%)</span><span>نمو هجومي (15%)</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { l: 'الراتب الشهري', v: `${formatNumber(Number(salary))} ريال` },
                    { l: 'المصروف الشهري', v: `${formatNumber(Number(expenses))} ريال` },
                    { l: 'الادخار الشهري', v: `${formatNumber(Number(salary) - Number(expenses))} ريال`, green: true },
                    { l: 'المدخرات', v: hasSavings ? `${formatNumber(Number(savings))} ريال` : 'ما فيه' },
                    { l: 'الاستثمارات', v: hasInvestments ? `${formatNumber(Number(investments))} ريال` : 'ما فيه' },
                    { l: 'العائد المتوقع', v: `${rate}% سنوياً` },
                  ].map((r) => (
                    <div key={r.l} className="card-soft px-4 py-3 flex items-center justify-between">
                      <span className="text-sm text-gray-400">{r.l}</span>
                      <span className={`font-extrabold ${r.green ? 'text-emerald-400' : ''}`}>{r.v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* نتيجة لحظية مختصرة للجوال */}
              {live && (
                <div className="lg:hidden mt-6 rounded-2xl bg-ink-900 border border-amber-400/20 p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">توصل لأول مليون خلال</p>
                  <p className="text-2xl font-extrabold text-amber-grad">{monthsToLabel(live.months)}</p>
                  {live.months < 99999 && <AvgCompare months={live.months} />}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 mt-8">
                {step > 1 ? (
                  <button onClick={() => setStep(step - 1)} className="btn-ghost px-5 py-3.5">
                    <ArrowRight size={18} /> السابق
                  </button>
                ) : <span />}
                <button onClick={next} disabled={!canGoNext()} className="btn-primary px-6 py-3.5 text-base flex-1 sm:flex-none sm:min-w-[260px]">
                  {step === 4 ? <>احسب خارطتي للمليون <Rocket size={18} /></> : <>التالي: {STEPS[step].short} <ArrowLeft size={18} /></>}
                </button>
              </div>
            </section>
          </div>

          {/* ═══ لوحة التوقع اللحظي ═══ */}
          <aside className="lg:sticky lg:top-24 min-w-0">
            <LivePanel live={live} rate={rate} onTip={() => {
              const e = Number(expenses) || 0
              if (e >= 500) setExpenses(String(e - 500))
            }} />
          </aside>
        </div>
      </main>
    </SiteShell>
  )
}

function AvgCompare({ months }: { months: number }) {
  const diffYears = Math.round(((AVERAGE_MONTHS - months) / 12) * 10) / 10
  if (diffYears > 0) return <p className="text-emerald-400 text-sm font-bold mt-1 flex items-center justify-center lg:justify-start gap-1"><Zap size={15} /> أسرع من المتوسط بـ {diffYears} سنة!</p>
  if (diffYears < 0) return <p className="text-orange-400 text-sm font-bold mt-1">أبطأ من المتوسط بـ {Math.abs(diffYears)} سنة — كمّل نشوف وش يسرّعك</p>
  return <p className="text-gray-400 text-sm mt-1">نفس المتوسط بالضبط</p>
}

function LivePanel({ live, rate, onTip }: { live: { monthlySaving: number; netWorth: number; months: number } | null; rate: number; onTip: () => void }) {
  const ok = live && live.months < 99999
  const points = ok ? buildProjection(live!.netWorth, live!.monthlySaving, rate, live!.months) : []
  const split = ok ? contributionSplit(live!.netWorth, live!.monthlySaving, live!.months) : null
  const tipSaved = ok ? live!.months - calcMonthsToGoal(live!.netWorth, live!.monthlySaving + 500, rate, GOAL) : 0

  return (
    <div className="rounded-3xl p-5 lg:p-6 border border-white/[0.06] space-y-4"
      style={{ background: 'linear-gradient(160deg,#1E2631 0%,#18202A 55%,#152623 100%)' }}>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-extrabold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" /> لوحة التوقع اللحظي
        </p>
        <span className="chip bg-white/[0.05] text-gray-400">تحديث فوري</span>
      </div>

      <div className="rounded-2xl bg-ink-950/70 p-5">
        <p className="flex items-center gap-1.5 text-sm text-gray-400 mb-2"><Timer size={15} className="text-amber-400" /> توصل لأول مليون خلال:</p>
        {live ? (
          <>
            <p className="text-3xl lg:text-4xl font-extrabold text-amber-grad leading-tight">{monthsToLabel(live.months)}</p>
            {ok && <AvgCompare months={live.months} />}
          </>
        ) : (
          <p className="text-gray-500 text-sm leading-relaxed">اكتب راتبك ومصروفك وتطلع لك النتيجة هنا فوراً ⚡</p>
        )}
      </div>

      <div className="rounded-2xl bg-ink-950/50 p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-400">مسار نمو رأس المال مع العائد المركب</span>
          <span className="font-extrabold text-emerald-400">1,000,000 ر.س</span>
        </div>
        {ok ? <GrowthSvg points={points} height={200} /> : (
          <div className="h-[150px] flex items-center justify-center text-gray-600 text-sm">الرسم يظهر بعد إدخال أرقامك</div>
        )}
        {ok && (
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>البداية: <b className="text-white">{formatNumber(live!.netWorth)} ر.س</b></span>
            <span>العائد المتراكم: <b className="text-emerald-400">+{formatNumber(split!.gains)} ر.س</b></span>
          </div>
        )}
      </div>

      {ok && split && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-ink-950/50 p-4">
            <p className="text-[11px] text-gray-400 mb-1">من جيبك (ادخارك)</p>
            <p className="text-lg font-extrabold">{formatNumber(split.contributions)} <span className="text-xs text-gray-400">ر.س</span></p>
            <p className="text-[11px] text-emerald-400 mt-0.5">{split.contribPct}% من المليون</p>
          </div>
          <div className="rounded-2xl bg-ink-950/50 p-4">
            <p className="text-[11px] text-gray-400 mb-1">أرباح العائد المركب</p>
            <p className="text-lg font-extrabold text-amber-400">{formatNumber(split.gains)} <span className="text-xs text-gray-400">ر.س</span></p>
            <p className="text-[11px] text-amber-400/80 mt-0.5">{split.gainsPct}% تصنعها الفائدة</p>
          </div>
        </div>
      )}

      {ok && tipSaved > 0 && (
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4 flex items-center gap-3">
          <Lightbulb size={22} className="text-amber-400 shrink-0" />
          <p className="text-sm text-gray-300 flex-1">لو وفّرت <b className="text-white">500 ر.س</b> زيادة، توصل أبكر بـ <b className="text-amber-400">{monthsSavedLabel(tipSaved)}</b>.</p>
          <button onClick={onTip} className="chip bg-amber-400 text-ink-950 shrink-0 hover:brightness-105">جرّبها</button>
        </div>
      )}
    </div>
  )
}

function MoneyField({ label, value, onChange, autoFocus, max = 10000000 }: { label: string; value: string; onChange: (v: string) => void; autoFocus?: boolean; max?: number }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-gray-200 mb-2">{label}</span>
      <span className="relative block">
        <input type="number" inputMode="numeric" min={0} max={max} value={value} autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)} className="field pl-14" />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">ريال</span>
      </span>
    </label>
  )
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[{ v: true, l: 'إيه، عندي' }, { v: false, l: 'لا، ما عندي' }].map((o) => (
        <button key={String(o.v)} type="button" onClick={() => onChange(o.v)}
          className={`py-4 rounded-xl font-extrabold transition-all border ${
            value === o.v ? 'bg-amber-400 text-ink-950 border-amber-400' : 'bg-ink-850 text-gray-300 border-white/[0.06] hover:border-white/20'
          }`}>
          {o.l}
        </button>
      ))}
    </div>
  )
}
