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

const advisorQuotes = [
  'لنبدأ بخطواتك الأولى نحو الثراء. إدخال راتبك يساعدنا في رسم خريطة مخصصة لك.',
  'معرفة ادخارك الحالي هي نقطة البداية لأي خطة مالية ناجحة.',
  'الاستثمار المبكر، حتى بمبالغ صغيرة، يصنع فرقاً هائلاً على المدى البعيد.',
  'أنت على بعد خطوة واحدة من معرفة موعد ثروتك. كل بيانات تم إدخالها تساعدنا!',
]

const salaryPresets = [5000, 10000, 15000, 25000]
const expensePresets = [2000, 4000, 7000, 12000]
const savingsPresets = [5000, 20000, 50000, 100000]
const investPresets = [10000, 50000, 100000, 250000]

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

    if (monthlySaving <= 0) {
      setResult({ totalMonths: 99999, netWorth, monthlySaving, chartLabels: [], chartData: [], scenarios: [] })
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100)
      return
    }

    setResult({ totalMonths, netWorth, monthlySaving, chartLabels: labels, chartData: data, scenarios })
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const canGoNext = () => {
    if (step === 1) {
      const s = Number(salary), e = Number(expenses)
      return salary !== '' && expenses !== '' && s > 0 && s <= 10_000_000 && e >= 0 && e <= 10_000_000
    }
    if (step === 2) {
      if (hasSavings === null) return false
      if (hasSavings === false) return true
      return savings !== '' && Number(savings) >= 0
    }
    if (step === 3) {
      if (hasInvestments === null) return false
      if (hasInvestments === false) return true
      return investments !== '' && Number(investments) >= 0
    }
    if (step === 4) return true
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

  const stepIcons = ['💰', '🏦', '📈', '🎯']
  const stepTitles = ['كم راتبك الشهري؟', 'عندك مدخرات؟', 'عندك استثمارات؟', 'تأكيد النتيجة']

  return (
    <main className="min-h-screen font-tajawal" dir="rtl" style={{background: 'linear-gradient(135deg, #e2f5ec 0%, #f8fbff 50%, #e8f0fb 100%)'}}>

      {/* Navbar */}
      <nav className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{background: '#0d1b3e'}}>
              💰
            </div>
            <span className="font-bold text-lg" style={{color: '#0d1b3e'}}>متى تصير مليونير؟</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm" style={{color: '#1a9e6b'}}>
            <span className="cursor-pointer hover:underline font-medium">الحاسبة</span>
            <span className="cursor-pointer hover:underline">كيف تبدأ؟</span>
            <span className="cursor-pointer hover:underline">قصص نجاح</span>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
            <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
          </div>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">

        {!result && (
          <>
            {/* Hero */}
            {step === 1 && (
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-5xl" style={{background: 'rgba(26,158,107,0.1)'}}>
                  🏆
                </div>
                <h1 className="text-3xl font-extrabold mb-2" style={{color: '#0d1b3e'}}>
                  متى تصير <span style={{color: '#B8860B'}}>مليونير</span>؟
                </h1>
                <p className="text-gray-500 text-sm mb-4">
                  أجب على 4 أسئلة بسيطة واعرف متى ستصل لأول مليون ريال
                </p>
                <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm text-sm text-gray-500">
                  <div className="flex -space-x-1">
                    {['👨','👩','👨🏻','👩🏻'].map((e, i) => <span key={i}>{e}</span>)}
                  </div>
                  <span><span className="font-bold" style={{color:'#1a9e6b'}}>{usersCount.toLocaleString('ar-SA')}</span> شخص قبلوا التحدي</span>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span className="font-medium" style={{color:'#1a9e6b'}}>{Math.round(progressPercent)}% مكتمل</span>
                <span>الخطوة {step} من 4</span>
              </div>
              <div className="w-full rounded-full h-2" style={{background: '#e5e7eb'}}>
                <div className="h-2 rounded-full transition-all duration-500" style={{width: `${progressPercent}%`, background: '#1a9e6b'}} />
              </div>
            </div>

            {/* Quiz Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">

              {/* Step Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{background: 'rgba(26,158,107,0.1)'}}>
                  {stepIcons[step - 1]}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">السؤال {step} من 4</p>
                  <h2 className="text-lg font-bold" style={{color: '#0d1b3e'}}>{stepTitles[step - 1]}</h2>
                </div>
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">الراتب الشهري</label>
                    <div className="relative">
                      <input
                        type="number" min="0" max="10000000"
                        value={salary}
                        onChange={e => setSalary(e.target.value)}
                        placeholder="0"
                        autoFocus
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-green-400 transition-colors"
                        style={{color: '#0d1b3e', background: '#fafafa'}}
                      />
                      <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ريال</span>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {salaryPresets.map(p => (
                        <button key={p} onClick={() => setSalary(String(p))}
                          className="text-xs px-3 py-1.5 rounded-full border transition-all"
                          style={{
                            borderColor: salary === String(p) ? '#1a9e6b' : '#e5e7eb',
                            background: salary === String(p) ? 'rgba(26,158,107,0.1)' : 'white',
                            color: salary === String(p) ? '#1a9e6b' : '#6b7280'
                          }}>
                          {p >= 25000 ? '+25,000' : p.toLocaleString('ar-SA')} ريال
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">المصروف الشهري</label>
                    <div className="relative">
                      <input
                        type="number" min="0" max="10000000"
                        value={expenses}
                        onChange={e => setExpenses(e.target.value)}
                        placeholder="0"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-green-400 transition-colors"
                        style={{color: '#0d1b3e', background: '#fafafa'}}
                      />
                      <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ريال</span>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {expensePresets.map(p => (
                        <button key={p} onClick={() => setExpenses(String(p))}
                          className="text-xs px-3 py-1.5 rounded-full border transition-all"
                          style={{
                            borderColor: expenses === String(p) ? '#1a9e6b' : '#e5e7eb',
                            background: expenses === String(p) ? 'rgba(26,158,107,0.1)' : 'white',
                            color: expenses === String(p) ? '#1a9e6b' : '#6b7280'
                          }}>
                          {p.toLocaleString('ar-SA')} ريال
                        </button>
                      ))}
                    </div>
                    {salary && expenses && Number(salary) > Number(expenses) && (
                      <p className="text-sm mt-2 font-medium" style={{color: '#1a9e6b'}}>
                        ✅ تدخر {formatNumber(Number(salary) - Number(expenses))} ريال شهرياً
                      </p>
                    )}
                    {salary && expenses && Number(salary) <= Number(expenses) && (
                      <p className="text-sm mt-2 text-red-500 font-medium">⚠️ مصروفك أكثر من راتبك</p>
                    )}
                  </div>

                  {/* Advisor */}
                  <div className="flex items-start gap-3 rounded-xl p-3" style={{background: 'rgba(26,158,107,0.06)', border: '1px solid rgba(26,158,107,0.15)'}}>
                    <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden" style={{background: '#1a9e6b'}}>
                      <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">م</div>
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-0.5" style={{color: '#1a9e6b'}}>المستشار المالي</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{advisorQuotes[0]}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">هل عندك مدخرات حالية في البنك؟</p>
                  <div className="flex gap-3">
                    {[{label: 'نعم ✅', val: true}, {label: 'لا ❌', val: false}].map(opt => (
                      <button key={String(opt.val)} onClick={() => { setHasSavings(opt.val); if (!opt.val) setSavings('') }}
                        className="flex-1 py-3.5 rounded-xl font-bold text-base transition-all border"
                        style={{
                          background: hasSavings === opt.val ? '#0d1b3e' : 'white',
                          color: hasSavings === opt.val ? 'white' : '#374151',
                          borderColor: hasSavings === opt.val ? '#0d1b3e' : '#e5e7eb'
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {hasSavings === true && (
                    <div>
                      <div className="relative">
                        <input type="number" min="0" value={savings}
                          onChange={e => setSavings(e.target.value)}
                          placeholder="أكتب قيمة مدخراتك" autoFocus
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-green-400"
                          style={{color: '#0d1b3e', background: '#fafafa'}}
                        />
                        <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ريال</span>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {savingsPresets.map(p => (
                          <button key={p} onClick={() => setSavings(String(p))}
                            className="text-xs px-3 py-1.5 rounded-full border transition-all"
                            style={{
                              borderColor: savings === String(p) ? '#1a9e6b' : '#e5e7eb',
                              background: savings === String(p) ? 'rgba(26,158,107,0.1)' : 'white',
                              color: savings === String(p) ? '#1a9e6b' : '#6b7280'
                            }}>
                            {p.toLocaleString('ar-SA')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasSavings === false && (
                    <p className="text-sm text-gray-400 text-center">لا بأس — الادخار يبدأ من اليوم 💪</p>
                  )}
                  <div className="flex items-start gap-3 rounded-xl p-3" style={{background: 'rgba(26,158,107,0.06)', border: '1px solid rgba(26,158,107,0.15)'}}>
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{background: '#1a9e6b'}}>م</div>
                    <div>
                      <p className="text-xs font-bold mb-0.5" style={{color: '#1a9e6b'}}>المستشار المالي</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{advisorQuotes[1]}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">هل عندك استثمارات؟ (أسهم، صناديق، عقار...)</p>
                  <div className="flex gap-3">
                    {[{label: 'نعم ✅', val: true}, {label: 'لا ❌', val: false}].map(opt => (
                      <button key={String(opt.val)} onClick={() => { setHasInvestments(opt.val); if (!opt.val) setInvestments('') }}
                        className="flex-1 py-3.5 rounded-xl font-bold text-base transition-all border"
                        style={{
                          background: hasInvestments === opt.val ? '#0d1b3e' : 'white',
                          color: hasInvestments === opt.val ? 'white' : '#374151',
                          borderColor: hasInvestments === opt.val ? '#0d1b3e' : '#e5e7eb'
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {hasInvestments === true && (
                    <div className="space-y-3">
                      <div className="relative">
                        <input type="number" min="0" value={investments}
                          onChange={e => setInvestments(e.target.value)}
                          placeholder="قيمة استثماراتك" autoFocus
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-green-400"
                          style={{color: '#0d1b3e', background: '#fafafa'}}
                        />
                        <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ريال</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {investPresets.map(p => (
                          <button key={p} onClick={() => setInvestments(String(p))}
                            className="text-xs px-3 py-1.5 rounded-full border transition-all"
                            style={{
                              borderColor: investments === String(p) ? '#1a9e6b' : '#e5e7eb',
                              background: investments === String(p) ? 'rgba(26,158,107,0.1)' : 'white',
                              color: investments === String(p) ? '#1a9e6b' : '#6b7280'
                            }}>
                            {p.toLocaleString('ar-SA')}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm font-medium text-gray-600">ما متوسط العائد السنوي؟</p>
                      <div className="grid grid-cols-3 gap-2">
                        {rateOptions.map(opt => (
                          <button key={opt.value} onClick={() => setRate(opt.value)}
                            className="py-2.5 px-2 rounded-xl text-center transition-all border"
                            style={{
                              borderColor: rate === opt.value ? '#1a9e6b' : '#e5e7eb',
                              background: rate === opt.value ? 'rgba(26,158,107,0.1)' : 'white',
                            }}>
                            <div className="font-bold text-sm" style={{color: '#0d1b3e'}}>{opt.label}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
                            <div className="text-xs font-bold mt-1" style={{color: '#1a9e6b'}}>{opt.value}%</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasInvestments === false && (
                    <p className="text-sm text-gray-400 text-center">ممتاز — سنحسب لك أفضل طريقة للبدء 📊</p>
                  )}
                  <div className="flex items-start gap-3 rounded-xl p-3" style={{background: 'rgba(26,158,107,0.06)', border: '1px solid rgba(26,158,107,0.15)'}}>
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{background: '#1a9e6b'}}>م</div>
                    <div>
                      <p className="text-xs font-bold mb-0.5" style={{color: '#1a9e6b'}}>المستشار المالي</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{advisorQuotes[2]}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 text-center">راجع بياناتك وتأكد قبل الحساب</p>
                  <div className="rounded-xl p-4 space-y-3" style={{background: '#f8fbff', border: '1px solid #e8f0fb'}}>
                    {[
                      {label: 'الراتب الشهري', value: formatNumber(Number(salary)) + ' ريال'},
                      {label: 'المصروف الشهري', value: formatNumber(Number(expenses)) + ' ريال'},
                      {label: 'الادخار الشهري', value: formatNumber(Number(salary) - Number(expenses)) + ' ريال', green: true},
                      ...(hasSavings ? [{label: 'المدخرات', value: formatNumber(Number(savings)) + ' ريال'}] : []),
                      ...(hasInvestments ? [{label: 'الاستثمارات', value: formatNumber(Number(investments)) + ' ريال (' + rate + '%)'}] : []),
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{row.label}</span>
                        <span className="font-bold" style={{color: (row as any).green ? '#1a9e6b' : '#0d1b3e'}}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-3 rounded-xl p-3" style={{background: 'rgba(26,158,107,0.06)', border: '1px solid rgba(26,158,107,0.15)'}}>
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{background: '#1a9e6b'}}>م</div>
                    <div>
                      <p className="text-xs font-bold mb-0.5" style={{color: '#1a9e6b'}}>المستشار المالي</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{advisorQuotes[3]}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className={`flex gap-3 mt-6 ${step > 1 ? 'justify-between' : ''}`}>
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)}
                    className="px-5 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                    ← رجوع
                  </button>
                )}
                <button
                  onClick={step === 4 ? calculate : nextStep}
                  disabled={step !== 4 && !canGoNext()}
                  className="flex-1 py-3.5 font-bold text-base rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{
                    background: (step === 4 || canGoNext()) ? '#0d1b3e' : '#e5e7eb',
                    color: (step === 4 || canGoNext()) ? 'white' : '#9ca3af',
                    cursor: (step !== 4 && !canGoNext()) ? 'not-allowed' : 'pointer'
                  }}>
                  {step === 4 ? '🚀 احسب النتيجة' : 'التالي'} {(step === 4 || canGoNext()) && step !== 4 && '←'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Results */}
        {result && (
          <div id="results" className="space-y-4">
            {result.monthlySaving <= 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-red-100">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-extrabold mb-3" style={{color: '#dc2626'}}>مصروفك أكثر من راتبك</h2>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                  للأسف لا يمكن الوصول للمليون بهذا الوضع. الخطوة الأولى هي تقليل المصاريف أو زيادة الدخل.
                </p>
                <button onClick={() => { setResult(null); setStep(1) }}
                  className="w-full py-3 text-white font-bold rounded-xl"
                  style={{background: '#0d1b3e'}}>
                  أعد الحساب بأرقام مختلفة ←
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
                  <div className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3" style={{background: 'rgba(26,158,107,0.1)', color: '#1a9e6b'}}>
                    🏆 نتيجة تحدي المليون
                  </div>
                  <p className="text-gray-400 text-sm mb-2">ستصل لأول مليون ريال خلال</p>
                  <div className="text-5xl font-extrabold leading-tight" style={{color: '#B8860B'}}>
                    {monthsToLabel(result.totalMonths)}
                  </div>
                  {result.totalMonths < 99999 && (
                    <div className="text-lg font-bold mt-3" style={{color: '#0d1b3e'}}>📅 {targetDate(result.totalMonths)}</div>
                  )}
                  <div className="mt-4 rounded-xl p-3" style={{background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.2)'}}>
                    <p className="text-sm font-bold" style={{color: '#B8860B'}}>تحدّ أصدقائك — من يصل أسرع؟ 🏆</p>
                    <p className="text-xs text-gray-400 mt-1">شارك نتيجتك وشوف ردودهم</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {label: 'صافي ثروتك الآن', value: formatNumber(result.netWorth) + ' ريال', green: true},
                    {label: 'الادخار الشهري', value: formatNumber(result.monthlySaving) + ' ريال', green: false},
                  ].map(m => (
                    <div key={m.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                      <div className="text-base font-bold" style={{color: m.green ? '#1a9e6b' : '#0d1b3e'}}>{m.value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                  <p className="text-sm text-gray-400 mb-4">نمو ثروتك بمرور الوقت</p>
                  <GrowthChart labels={result.chartLabels} data={result.chartData} goal={1000000} />
                </div>

                <ShareCard
                  years={monthsToLabel(result.totalMonths)}
                  totalMonths={result.totalMonths}
                  date={targetDate(result.totalMonths)}
                  goal="مليون ريال"
                />

                <UpsellCard
                  scenarios={result.scenarios}
                  userData={{salary: Number(salary), expenses: Number(expenses), savings: Number(savings), investments: Number(investments), rate, monthlySaving: result.monthlySaving, netWorth: result.netWorth, totalMonths: result.totalMonths}}
                />

                <ReferralCard />

                <button onClick={() => { setResult(null); setStep(1) }}
                  className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  ← أعد الحساب بأرقام مختلفة
                </button>
              </>
            )}
          </div>
        )}

        <Footer />
      </div>
    </main>
  )
}
