'use client'

import { useState, useEffect } from 'react'
import {
  calcMonthsToGoal,
  monthsToLabel,
  targetDate,
  formatNumber,
  buildChartData,
} from '@/lib/calculator'
import GrowthChart from '@/components/GrowthChart'
import ShareCard from '@/components/ShareCard'
import UpsellCard from '@/components/UpsellCard'
import Footer from '@/components/Footer'
import EmailGate from '@/components/EmailGate'
import ReferralCard from '@/components/ReferralCard'
import { saveReferral, getReferralFromURL } from '@/lib/store'
import { UserData } from '@/lib/store'

interface Result {
  totalMonths: number
  netWorth: number
  monthlySaving: number
  chartLabels: string[]
  chartData: number[]
  scenarios: { label: string; months: number }[]
}

// نتيجة تيزر فورية
function QuickPreview({ salary, expenses }: { salary: string; expenses: string }) {
  const s = Number(salary) || 0
  const e = Number(expenses) || 0
  if (!salary || !expenses || s <= e) return null
  const saving = s - e
  const rough = calcMonthsToGoal(0, saving, 0, 1000000)
  return (
    <div className="mt-3 p-3 bg-gold/10 border border-gold/30 rounded-xl text-sm text-center">
      💡 بناءً على ادخارك <span className="text-gold font-bold">{formatNumber(saving)} ريال/شهر</span> — ستصل تقريباً خلال{' '}
      <span className="text-gold font-bold">{monthsToLabel(rough)}</span> — أكمل لنعرف بالدقة
    </div>
  )
}

export default function Home() {
  const [step, setStep] = useState(1)
  const [salary, setSalary] = useState('')
  const [expenses, setExpenses] = useState('')
  const [hasSavings, setHasSavings] = useState<null | boolean>(null)
  const [savings, setSavings] = useState('')
  const [hasInvestments, setHasInvestments] = useState<null | boolean>(null)
  const [investments, setInvestments] = useState('')
  const [rate, setRate] = useState<number>(7)
  const [result, setResult] = useState<Result | null>(null)
  const [pendingResult, setPendingResult] = useState<Result | null>(null)
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [usersCount, setUsersCount] = useState(1247)

  useEffect(() => {
    const interval = setInterval(() => {
      setUsersCount(prev => prev + Math.floor(Math.random() * 3))
    }, 8000)
    const ref = getReferralFromURL()
    if (ref) saveReferral(ref)
    return () => clearInterval(interval)
  }, [])

  const handleEmailSubmit = (email: string) => {
    setEmailSubmitted(true)
    if (pendingResult) {
      setResult(pendingResult)
      setPendingResult(null)
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  const calculate = () => {
    const s = Number(salary) || 0
    const e = Number(expenses) || 0
    const sv = hasSavings ? (Number(savings) || 0) : 0
    const inv = hasInvestments ? (Number(investments) || 0) : 0
    const r = hasInvestments ? rate : 0
    const goal = 1000000
    const netWorth = sv + inv
    const monthlySaving = s - e

    const totalMonths = calcMonthsToGoal(netWorth, monthlySaving, r, goal)
    const { labels, data } = buildChartData(netWorth, monthlySaving, r, totalMonths)

    const scenarios = [
      { label: 'وضعك الحالي', months: totalMonths },
      { label: '+ ادخار 500 ريال/شهر', months: calcMonthsToGoal(netWorth, monthlySaving + 500, r, goal) },
      { label: '+ ادخار 1000 ريال/شهر', months: calcMonthsToGoal(netWorth, monthlySaving + 1000, r, goal) },
      { label: '+ دخل إضافي 2000 ريال', months: calcMonthsToGoal(netWorth, monthlySaving + 2000, r, goal) },
      { label: '🌟 استثمار بعائد 10%', months: calcMonthsToGoal(netWorth, monthlySaving, 10, goal) },
    ]

    const newResult = { totalMonths, netWorth, monthlySaving, chartLabels: labels, chartData: data, scenarios }
    setResult(newResult)
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const canGoNext = () => {
    if (step === 1) return salary !== '' && expenses !== '' && Number(salary) > 0
    if (step === 2) return hasSavings !== null && (hasSavings === false || savings !== '')
    if (step === 3) return hasInvestments !== null && (hasInvestments === false || investments !== '')
    return false
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
    else calculate()
  }

  const rateOptions = [
    { label: 'محافظ', sub: 'ودائع وصكوك', value: 4 },
    { label: 'متوسط', sub: 'صناديق استثمار', value: 7 },
    { label: 'جريء', sub: 'أسهم وعقارات', value: 12 },
  ]

  const progressPercent = (step / 4) * 100

  return (
    <main className="min-h-screen bg-[#0A0F1C] text-white font-tajawal" dir="rtl">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex -space-x-2">
            {['👨','👩','👨🏻','👩🏻','👨🏽'].map((e, i) => (
              <span key={i} className="text-lg">{e}</span>
            ))}
          </div>
          <span className="text-sm text-gray-400">
            <span className="text-gold font-bold">{usersCount.toLocaleString('ar-SA')}</span> شخص استخدموا الحاسبة
          </span>
        </div>

        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
            متى تصبح <span className="text-gold">مليونير</span>؟
          </h1>
          <p className="text-gray-400 text-base">
            أجب على {4} أسئلة بسيطة واعرف متى ستصل لأول مليون ريال
          </p>
        </div>

        {/* Progress Bar */}
        {!result && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>السؤال {step} من 4</span>
              <span>{Math.round(progressPercent)}٪</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gold h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Steps */}
        {!result && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">

            {/* Step 1 - الراتب والمصروف */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-base font-bold mb-2">💰 كم راتبك الشهري؟</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={salary}
                      onChange={e => setSalary(e.target.value)}
                      placeholder=""
                      autoFocus
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-gold transition-colors"
                    />
                    <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ريال</span>
                  </div>
                </div>
                <div>
                  <label className="block text-base font-bold mb-2">🛒 كم مصروفك الشهري؟</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={expenses}
                      onChange={e => setExpenses(e.target.value)}
                      placeholder=""
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-gold transition-colors"
                    />
                    <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ريال</span>
                  </div>
                  {salary && expenses && Number(salary) > Number(expenses) && (
                    <p className="text-green-400 text-sm mt-2">
                      ✅ تدخر {formatNumber(Number(salary) - Number(expenses))} ريال شهرياً
                    </p>
                  )}
                  {salary && expenses && Number(salary) <= Number(expenses) && (
                    <p className="text-red-400 text-sm mt-2">
                      ⚠️ مصروفك أكثر من راتبك
                    </p>
                  )}
                </div>
                {/* تيزر فوري */}
                <QuickPreview salary={salary} expenses={expenses} />
              </div>
            )}

            {/* Step 2 - المدخرات */}
            {step === 2 && (
              <div className="space-y-4">
                <label className="block text-base font-bold mb-3">🏦 عندك مدخرات حالية؟</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setHasSavings(true)}
                    className={`flex-1 py-4 rounded-xl font-bold text-base transition-all ${
                      hasSavings === true ? 'bg-gold text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >نعم ✅</button>
                  <button
                    onClick={() => { setHasSavings(false); setSavings('') }}
                    className={`flex-1 py-4 rounded-xl font-bold text-base transition-all ${
                      hasSavings === false ? 'bg-gold text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >لا ❌</button>
                </div>
                {hasSavings === true && (
                  <div className="relative">
                    <input
                      type="number"
                      value={savings}
                      onChange={e => setSavings(e.target.value)}
                      placeholder="أكتب قيمة مدخراتك"
                      autoFocus
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-gold transition-colors"
                    />
                    <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ريال</span>
                  </div>
                )}
                {hasSavings === false && (
                  <p className="text-gray-500 text-sm text-center">لا بأس — الادخار يبدأ من اليوم 💪</p>
                )}
              </div>
            )}

            {/* Step 3 - الاستثمارات */}
            {step === 3 && (
              <div className="space-y-4">
                <label className="block text-base font-bold mb-3">📈 عندك استثمارات حالية؟</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setHasInvestments(true)}
                    className={`flex-1 py-4 rounded-xl font-bold text-base transition-all ${
                      hasInvestments === true ? 'bg-gold text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >نعم ✅</button>
                  <button
                    onClick={() => { setHasInvestments(false); setInvestments('') }}
                    className={`flex-1 py-4 rounded-xl font-bold text-base transition-all ${
                      hasInvestments === false ? 'bg-gold text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >لا ❌</button>
                </div>
                {hasInvestments === true && (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="number"
                        value={investments}
                        onChange={e => setInvestments(e.target.value)}
                        placeholder="أكتب قيمة استثماراتك"
                        autoFocus
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-gold transition-colors"
                      />
                      <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ريال</span>
                    </div>
                    <p className="text-sm text-gray-400">ما نوع استثمارك؟</p>
                    <div className="grid grid-cols-3 gap-2">
                      {rateOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setRate(opt.value)}
                          className={`py-2.5 px-2 rounded-xl text-center transition-all border ${
                            rate === opt.value
                              ? 'border-gold bg-gold/20 text-gold'
                              : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-bold text-sm">{opt.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
                          <div className="text-xs font-bold mt-1 text-gold">{opt.value}%</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {hasInvestments === false && (
                  <p className="text-gray-500 text-sm text-center">ممتاز — سنحسب لك أفضل طريقة للبدء 📊</p>
                )}
              </div>
            )}

            {/* Step 4 - تأكيد */}
            {step === 4 && (
              <div className="text-center space-y-4">
                <div className="text-5xl mb-2">🎯</div>
                <h2 className="text-xl font-bold">جاهز لتعرف النتيجة؟</h2>
                <div className="text-right bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">الراتب</span>
                    <span className="font-bold">{formatNumber(Number(salary))} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">المصروف</span>
                    <span className="font-bold">{formatNumber(Number(expenses))} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">الادخار الشهري</span>
                    <span className="font-bold text-green-400">{formatNumber(Number(salary) - Number(expenses))} ريال</span>
                  </div>
                  {hasSavings && <div className="flex justify-between">
                    <span className="text-gray-400">المدخرات</span>
                    <span className="font-bold">{formatNumber(Number(savings))} ريال</span>
                  </div>}
                  {hasInvestments && <div className="flex justify-between">
                    <span className="text-gray-400">الاستثمارات</span>
                    <span className="font-bold">{formatNumber(Number(investments))} ريال ({rate}%)</span>
                  </div>}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className={`flex gap-3 mt-6 ${step > 1 ? 'justify-between' : ''}`}>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-3 rounded-xl bg-white/10 text-gray-300 font-bold hover:bg-white/20 transition-all"
                >
                  ← رجوع
                </button>
              )}
              <button
                onClick={nextStep}
                disabled={!canGoNext()}
                className={`flex-1 py-3.5 font-bold text-lg rounded-xl transition-all active:scale-95 ${
                  canGoNext()
                    ? 'bg-gold hover:bg-yellow-600 text-white'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                {step === 4 ? '🚀 احسب النتيجة' : 'التالي →'}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div id="results" className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">إذا استمريت بنفس وضعك ستصل للهدف خلال</p>
              <div className="text-5xl font-extrabold text-gold leading-tight">
                {monthsToLabel(result.totalMonths)}
              </div>
              {result.totalMonths < 99999 && (
                <div className="text-lg font-bold mt-3">📅 {targetDate(result.totalMonths)}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'صافي ثروتك الآن', value: formatNumber(result.netWorth) + ' ريال', gold: true },
                { label: 'الادخار الشهري', value: formatNumber(result.monthlySaving) + ' ريال', gold: false },
              ].map((m) => (
                <div key={m.label} className="bg-white/5 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">{m.label}</div>
                  <div className={`text-lg font-bold ${m.gold ? 'text-gold' : 'text-white'}`}>{m.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-sm text-gray-400 mb-4">نمو ثروتك بمرور الوقت</p>
              <GrowthChart labels={result.chartLabels} data={result.chartData} goal={1000000} />
            </div>

            <ShareCard
              years={monthsToLabel(result.totalMonths)}
              date={targetDate(result.totalMonths)}
              netWorth={formatNumber(result.netWorth)}
              saving={formatNumber(result.monthlySaving)}
              goal="مليون ريال"
            />

            <UpsellCard scenarios={result.scenarios} userData={{ salary: Number(salary), expenses: Number(expenses), savings: Number(savings), investments: Number(investments), rate, monthlySaving: result.monthlySaving, netWorth: result.netWorth, totalMonths: result.totalMonths }} />

            <ReferralCard />

            <button
              onClick={() => { setResult(null); setStep(1) }}
              className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors"
            >
              ← أعد الحساب بأرقام مختلفة
            </button>
          </div>
        )}

        <Footer />
      </div>
    </main>
  )
}
