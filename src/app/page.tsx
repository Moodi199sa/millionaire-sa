'use client'

import { useState, useEffect, useRef } from 'react'
import {
  calcMonthsToGoal, monthsToLabel, targetDate, formatNumber, buildChartData,
} from '@/lib/calculator'
import GrowthChart from '@/components/GrowthChart'
import ShareCard from '@/components/ShareCard'
import UpsellCard from '@/components/UpsellCard'
import Footer from '@/components/Footer'
import ReferralCard from '@/components/ReferralCard'
import { saveReferral, getReferralFromURL } from '@/lib/store'

interface Result {
  totalMonths: number
  netWorth: number
  monthlySaving: number
  chartLabels: string[]
  chartData: number[]
  scenarios: { label: string; months: number }[]
}

const AVG_MONTHS = 168
const FASTEST_MONTHS = 72

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const duration = 1000
    const frame = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * ease))
      if (progress < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [value])
  return <>{display.toLocaleString('ar-SA')}</>
}

function formatInput(val: string): string {
  const num = val.replace(/[^\d]/g, '')
  if (!num) return ''
  return Number(num).toLocaleString('ar-SA')
}

function parseInput(val: string): string {
  return val.replace(/[^\d]/g, '')
}

export default function Home() {
  const [step, setStep] = useState(0) // 0=hero
  const [direction, setDirection] = useState<'next'|'prev'>('next')
  const [animating, setAnimating] = useState(false)
  const [salary, setSalary] = useState('')
  const [expenses, setExpenses] = useState('')
  const [hasSavings, setHasSavings] = useState<null|boolean>(null)
  const [savings, setSavings] = useState('')
  const [hasInvestments, setHasInvestments] = useState<null|boolean>(null)
  const [investments, setInvestments] = useState('')
  const [rate, setRate] = useState(7)
  const [result, setResult] = useState<Result|null>(null)
  const [extraSaving, setExtraSaving] = useState(0)
  const [usersCount, setUsersCount] = useState(1247)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const iv = setInterval(() => setUsersCount(p => p + Math.floor(Math.random() * 2)), 9000)
    const ref = getReferralFromURL(); if (ref) saveReferral(ref)
    return () => clearInterval(iv)
  }, [])

  const s = Number(parseInput(salary))
  const e = Number(parseInput(expenses))
  const sv = hasSavings ? Number(parseInput(savings)) : 0
  const inv = hasInvestments ? Number(parseInput(investments)) : 0
  const monthlySaving = s - e

  const navigate = (nextStep: number, dir: 'next'|'prev' = 'next') => {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setStep(nextStep)
      setAnimating(false)
    }, 280)
  }

  const canGoNext = () => {
    if (step === 1) return salary && expenses && s > 0 && s <= 10_000_000 && e >= 0 && e < s
    if (step === 2) {
      if (hasSavings === null) return false
      if (hasSavings === false) return true
      return savings && Number(parseInput(savings)) >= 0
    }
    if (step === 3) {
      if (hasInvestments === null) return false
      if (hasInvestments === false) return true
      return investments && Number(parseInput(investments)) >= 0
    }
    if (step === 4) return true
    return false
  }

  const calculate = () => {
    const r = hasInvestments ? rate : 0
    const goal = 1_000_000
    const netWorth = sv + inv
    const ms = s - e
    if (ms <= 0) {
      setResult({ totalMonths: 99999, netWorth, monthlySaving: ms, chartLabels: [], chartData: [], scenarios: [] })
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      return
    }
    const totalMonths = calcMonthsToGoal(netWorth, ms, r, goal)
    const { labels, data } = buildChartData(netWorth, ms, r, totalMonths)
    const scenarios = [
      { label: 'وضعك الحالي', months: totalMonths },
      { label: '+ ادخار 500 شهرياً', months: calcMonthsToGoal(netWorth, ms + 500, r, goal) },
      { label: '+ ادخار 1,000 شهرياً', months: calcMonthsToGoal(netWorth, ms + 1000, r, goal) },
      { label: '+ دخل إضافي 2,000', months: calcMonthsToGoal(netWorth, ms + 2000, r, goal) },
      { label: '🌟 استثمار بعائد 10%', months: calcMonthsToGoal(netWorth, ms, 10, goal) },
    ]
    setResult({ totalMonths, netWorth, monthlySaving: ms, chartLabels: labels, chartData: data, scenarios })
    navigate(5, 'next')
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 350)
  }

  const whatIfMonths = result
    ? calcMonthsToGoal(result.netWorth, result.monthlySaving + extraSaving, hasInvestments ? rate : 0, 1_000_000)
    : 0

  const stepIcons = ['💰', '🏦', '📈', '✅']
  const stepTitles = ['كم راتبك وكم تصرف؟', 'هل عندك مدخرات؟', 'هل عندك استثمارات؟', 'تأكيد وإطلاق']
  const advisorQuotes = [
    'إدخال راتبك ومصاريفك بدقة يساعدنا في رسم خريطة مخصصة لك نحو المليون.',
    'المدخرات الحالية هي نقطة انطلاقك — كل ريال يعدّ!',
    'الاستثمار المبكر حتى بمبالغ صغيرة يصنع فرقاً هائلاً مع الوقت.',
    'أنت على بعد ضغطة واحدة من معرفة موعد ثروتك. ابدأ!',
  ]

  const salaryChips = [5000, 10000, 15000, 25000]
  const expenseChips = [2000, 4000, 7000, 12000]
  const savingsChips = [10000, 50000, 100000, 250000]
  const investChips = [10000, 50000, 100000, 300000]

  return (
    <main dir="rtl" className="min-h-screen font-tajawal" style={{background:'linear-gradient(135deg,#e2f5ec 0%,#f8fbff 50%,#e8f0fb 100%)'}}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setResult(null); navigate(0) }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{background:'#0d1b3e'}}>💰</div>
            <span className="font-extrabold" style={{color:'#0d1b3e'}}>متى تصير مليونير؟</span>
          </div>
          <div className="hidden sm:flex items-center gap-5 text-sm font-medium" style={{color:'#1a9e6b'}}>
            <a href="#" className="hover:opacity-70">الحاسبة</a>
            <a href="#" className="hover:opacity-70">كيف تبدأ؟</a>
            <a href="#" className="hover:opacity-70">قصص نجاح</a>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">👤</div>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">

        {/* === HERO === */}
        {step === 0 && (
          <div className={`transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <div className="text-center mb-8">
              <div className="w-28 h-28 mx-auto mb-5 rounded-3xl flex items-center justify-center text-5xl shadow-lg" style={{background:'linear-gradient(135deg,#1a9e6b,#0d1b3e)'}}>
                🏆
              </div>
              <h1 className="text-4xl font-extrabold mb-3 leading-tight" style={{color:'#0d1b3e'}}>
                متى تصير <span style={{color:'#B8860B'}}>مليونير</span>؟
              </h1>
              <p className="text-gray-500 text-base leading-relaxed mb-6">
                أجب على 4 أسئلة فقط واعرف متى ستصل<br/>لأول <span className="font-bold" style={{color:'#1a9e6b'}}>مليون ريال</span>
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  {icon:'👥', label:'شاركوا التحدي', value: usersCount.toLocaleString('ar-SA')},
                  {icon:'⚡', label:'أسرع نتيجة', value:'6 سنوات'},
                  {icon:'📊', label:'المتوسط العام', value:'14 سنة'},
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="font-extrabold text-sm" style={{color:'#0d1b3e'}}>{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate(1)}
                className="w-full py-4 text-white font-extrabold text-lg rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{background:'linear-gradient(135deg,#0d1b3e,#1a3a6b)'}}>
                🚀 ابدأ التحدي الآن
              </button>
              <p className="text-xs text-gray-400 mt-3">⏱ يستغرق دقيقة واحدة فقط — مجاناً 100%</p>
            </div>
          </div>
        )}

        {/* === QUIZ STEPS 1-4 === */}
        {step >= 1 && step <= 4 && (
          <div className={`transition-all duration-280 ${animating
            ? direction === 'next' ? 'opacity-0 -translate-x-6' : 'opacity-0 translate-x-6'
            : 'opacity-100 translate-x-0'}`}>

            {/* Progress */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span className="font-semibold" style={{color:'#1a9e6b'}}>{Math.round((step/4)*100)}% مكتمل</span>
                <span>السؤال {step} من 4</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{width:`${(step/4)*100}%`, background:'linear-gradient(90deg,#1a9e6b,#25c97a)'}} />
              </div>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{background:'linear-gradient(135deg,rgba(26,158,107,0.15),rgba(26,158,107,0.05))'}}>
                  {stepIcons[step-1]}
                </div>
                <div>
                  <p className="text-xs text-gray-400">السؤال {step} من 4</p>
                  <h2 className="text-lg font-extrabold" style={{color:'#0d1b3e'}}>{stepTitles[step-1]}</h2>
                </div>
              </div>

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  {[
                    {label:'الراتب الشهري 💰', val:salary, set:(v:string)=>setSalary(formatInput(parseInput(v))), chips:salaryChips},
                    {label:'المصروف الشهري 💳', val:expenses, set:(v:string)=>setExpenses(formatInput(parseInput(v))), chips:expenseChips},
                  ].map(field => (
                    <div key={field.label}>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">{field.label}</label>
                      <div className="relative mb-2">
                        <input type="text" inputMode="numeric" value={field.val}
                          onChange={e => field.set(e.target.value)}
                          placeholder="0"
                          className="w-full border-2 border-gray-100 focus:border-green-400 rounded-xl px-4 py-3.5 text-lg transition-colors outline-none"
                          style={{color:'#0d1b3e', background:'#fafafa'}}
                        />
                        <span className="absolute left-4 top-4 text-gray-400 text-sm">ريال</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {field.chips.map(p => (
                          <button key={p} onClick={() => field.set(p.toLocaleString('ar-SA'))}
                            className="text-xs px-3 py-1.5 rounded-full border-2 transition-all font-medium"
                            style={{
                              borderColor: parseInput(field.val) === String(p) ? '#1a9e6b' : '#e5e7eb',
                              background: parseInput(field.val) === String(p) ? 'rgba(26,158,107,0.08)' : 'white',
                              color: parseInput(field.val) === String(p) ? '#1a9e6b' : '#6b7280'
                            }}>
                            {p >= 25000 ? '+25,000' : p.toLocaleString('ar-SA')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {s > 0 && e >= 0 && (
                    <div className="rounded-xl p-3 text-center"
                      style={{background: s > e ? 'rgba(26,158,107,0.08)' : 'rgba(239,68,68,0.08)',
                        border: `1.5px solid ${s > e ? 'rgba(26,158,107,0.25)' : 'rgba(239,68,68,0.25)'}`}}>
                      <p className="font-bold text-sm" style={{color: s > e ? '#1a9e6b' : '#ef4444'}}>
                        {s > e ? `✅ تدخر ${formatNumber(s-e)} ريال شهرياً` : '⚠️ مصروفك أكثر من راتبك'}
                      </p>
                      {s > e && <p className="text-xs text-gray-400 mt-0.5">نسبة الادخار: {Math.round((s-e)/s*100)}%</p>}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">هل عندك مدخرات في البنك؟</p>
                  <div className="flex gap-3">
                    {[{label:'نعم ✅', val:true},{label:'لا ❌', val:false}].map(opt=>(
                      <button key={String(opt.val)} onClick={()=>{setHasSavings(opt.val);if(!opt.val)setSavings('')}}
                        className="flex-1 py-3.5 rounded-2xl font-bold border-2 transition-all text-base"
                        style={{
                          background:hasSavings===opt.val?'#0d1b3e':'white',
                          color:hasSavings===opt.val?'white':'#374151',
                          borderColor:hasSavings===opt.val?'#0d1b3e':'#e5e7eb'
                        }}>{opt.label}</button>
                    ))}
                  </div>
                  {hasSavings === true && (
                    <div>
                      <div className="relative mb-2">
                        <input type="text" inputMode="numeric" value={savings}
                          onChange={e => setSavings(formatInput(parseInput(e.target.value)))}
                          placeholder="كم عندك في البنك؟" autoFocus
                          className="w-full border-2 border-gray-100 focus:border-green-400 rounded-xl px-4 py-3.5 text-lg transition-colors outline-none"
                          style={{color:'#0d1b3e', background:'#fafafa'}}
                        />
                        <span className="absolute left-4 top-4 text-gray-400 text-sm">ريال</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {savingsChips.map(p=>(
                          <button key={p} onClick={()=>setSavings(p.toLocaleString('ar-SA'))}
                            className="text-xs px-3 py-1.5 rounded-full border-2 transition-all font-medium"
                            style={{borderColor:parseInput(savings)===String(p)?'#1a9e6b':'#e5e7eb',background:parseInput(savings)===String(p)?'rgba(26,158,107,0.08)':'white',color:parseInput(savings)===String(p)?'#1a9e6b':'#6b7280'}}>
                            {p.toLocaleString('ar-SA')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasSavings === false && <p className="text-sm text-gray-400 text-center py-2">لا بأس — الادخار يبدأ من اليوم 💪</p>}
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">هل عندك استثمارات؟ (أسهم، صناديق، عقار...)</p>
                  <div className="flex gap-3">
                    {[{label:'نعم ✅', val:true},{label:'لا ❌', val:false}].map(opt=>(
                      <button key={String(opt.val)} onClick={()=>{setHasInvestments(opt.val);if(!opt.val)setInvestments('')}}
                        className="flex-1 py-3.5 rounded-2xl font-bold border-2 transition-all text-base"
                        style={{background:hasInvestments===opt.val?'#0d1b3e':'white',color:hasInvestments===opt.val?'white':'#374151',borderColor:hasInvestments===opt.val?'#0d1b3e':'#e5e7eb'}}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {hasInvestments === true && (
                    <div className="space-y-4">
                      <div className="relative mb-2">
                        <input type="text" inputMode="numeric" value={investments}
                          onChange={e=>setInvestments(formatInput(parseInput(e.target.value)))}
                          placeholder="قيمة استثماراتك" autoFocus
                          className="w-full border-2 border-gray-100 focus:border-green-400 rounded-xl px-4 py-3.5 text-lg transition-colors outline-none"
                          style={{color:'#0d1b3e', background:'#fafafa'}}
                        />
                        <span className="absolute left-4 top-4 text-gray-400 text-sm">ريال</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {investChips.map(p=>(
                          <button key={p} onClick={()=>setInvestments(p.toLocaleString('ar-SA'))}
                            className="text-xs px-3 py-1.5 rounded-full border-2 transition-all font-medium"
                            style={{borderColor:parseInput(investments)===String(p)?'#1a9e6b':'#e5e7eb',background:parseInput(investments)===String(p)?'rgba(26,158,107,0.08)':'white',color:parseInput(investments)===String(p)?'#1a9e6b':'#6b7280'}}>
                            {p.toLocaleString('ar-SA')}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-gray-600">متوسط العائد السنوي المتوقع:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[{l:'محافظ',s:'ودائع وصكوك',v:4},{l:'متوسط',s:'صناديق استثمار',v:7},{l:'جريء',s:'أسهم وعقارات',v:12}].map(opt=>(
                          <button key={opt.v} onClick={()=>setRate(opt.v)}
                            className="py-3 px-2 rounded-2xl text-center border-2 transition-all"
                            style={{borderColor:rate===opt.v?'#1a9e6b':'#e5e7eb',background:rate===opt.v?'rgba(26,158,107,0.08)':'white'}}>
                            <div className="font-bold text-sm" style={{color:'#0d1b3e'}}>{opt.l}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{opt.s}</div>
                            <div className="text-sm font-extrabold mt-1" style={{color:'#1a9e6b'}}>{opt.v}%</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasInvestments === false && <p className="text-sm text-gray-400 text-center py-2">ممتاز — سنحسب لك أفضل طريقة للبدء 📊</p>}
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="rounded-2xl p-4 space-y-3" style={{background:'#f8fbff', border:'1.5px solid #e8f0fb'}}>
                    {[
                      {l:'الراتب الشهري', v:`${formatNumber(s)} ريال`},
                      {l:'المصروف الشهري', v:`${formatNumber(e)} ريال`},
                      {l:'الادخار الشهري', v:`${formatNumber(s-e)} ريال`, green:true},
                      {l:'نسبة الادخار', v:`${Math.round((s-e)/s*100)}%`, green:true},
                      ...(hasSavings?[{l:'المدخرات', v:`${formatNumber(sv)} ريال`}]:[]),
                      ...(hasInvestments?[{l:'الاستثمارات', v:`${formatNumber(inv)} ريال (${rate}%)`}]:[]),
                    ].map((r,i)=>(
                      <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                        <span className="text-gray-500">{r.l}</span>
                        <span className="font-bold" style={{color:(r as any).green?'#1a9e6b':'#0d1b3e'}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 text-center">✓ النتائج تقديرية وليست استشارة مالية</p>
                </div>
              )}

              {/* Advisor */}
              <div className="flex items-start gap-3 rounded-2xl p-3 mt-5"
                style={{background:'rgba(26,158,107,0.06)', border:'1.5px solid rgba(26,158,107,0.15)'}}>
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                  style={{background:'linear-gradient(135deg,#1a9e6b,#0d6b4a)'}}>م</div>
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{color:'#1a9e6b'}}>المستشار المالي</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{advisorQuotes[step-1]}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className={`flex gap-3 mt-6 ${step > 1 ? 'justify-between' : ''}`}>
                {step > 1 && (
                  <button onClick={() => navigate(step-1,'prev')}
                    className="px-5 py-3.5 rounded-2xl font-bold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                    ← رجوع
                  </button>
                )}
                <button onClick={() => step === 4 ? calculate() : navigate(step+1)}
                  disabled={!canGoNext()}
                  className="flex-1 py-3.5 font-extrabold text-base rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{
                    background: canGoNext() ? 'linear-gradient(135deg,#0d1b3e,#1a3a6b)' : '#e5e7eb',
                    color: canGoNext() ? 'white' : '#9ca3af',
                    cursor: !canGoNext() ? 'not-allowed' : 'pointer'
                  }}>
                  {step === 4 ? '🚀 احسب نتيجتي' : 'التالي ←'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === RESULTS === */}
        {step === 5 && result && (
          <div ref={resultsRef} className={`space-y-4 transition-all duration-300 ${animating?'opacity-0':'opacity-100'}`}>

            {result.monthlySaving <= 0 ? (
              <div className="bg-white rounded-3xl shadow-sm p-6 text-center border-2 border-red-100">
                <div className="text-5xl mb-4">😟</div>
                <h2 className="text-xl font-extrabold mb-3 text-red-500">مصروفك أكثر من راتبك</h2>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                  للأسف لا يمكن الوصول للمليون بهذا الوضع.<br/>
                  الخطوة الأولى: قلل المصاريف أو زد الدخل.
                </p>
                <button onClick={() => { setResult(null); navigate(1,'prev') }}
                  className="w-full py-4 text-white font-extrabold rounded-2xl"
                  style={{background:'linear-gradient(135deg,#0d1b3e,#1a3a6b)'}}>
                  أعد الحساب ←
                </button>
              </div>
            ) : (
              <>
                {/* النتيجة الرئيسية */}
                <div className="bg-white rounded-3xl shadow-sm p-6 text-center border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 rounded-t-3xl" style={{background:'linear-gradient(90deg,#1a9e6b,#B8860B)'}} />
                  <div className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 mt-1"
                    style={{background:'rgba(26,158,107,0.1)', color:'#1a9e6b'}}>
                    🏆 نتيجة تحدي المليون
                  </div>
                  <p className="text-gray-400 text-sm mb-2">ستصل لأول مليون ريال خلال</p>
                  <div className="text-5xl font-extrabold leading-tight mb-2" style={{color:'#B8860B'}}>
                    {monthsToLabel(result.totalMonths)}
                  </div>
                  {result.totalMonths < 99999 && (
                    <div className="text-lg font-bold mb-4" style={{color:'#0d1b3e'}}>
                      📅 بحلول {targetDate(result.totalMonths)}
                    </div>
                  )}

                  {/* مقارنة مع المتوسط */}
                  <div className="flex gap-3 mt-3">
                    {[
                      {label:'نتيجتك', months:result.totalMonths, main:true},
                      {label:'المتوسط العام', months:AVG_MONTHS, main:false},
                      {label:'الأسرع', months:FASTEST_MONTHS, main:false},
                    ].map(c=>(
                      <div key={c.label} className="flex-1 rounded-2xl p-3 border-2 text-center"
                        style={{borderColor:c.main?'#B8860B':'#e5e7eb', background:c.main?'rgba(184,134,11,0.06)':'#fafafa'}}>
                        <div className="text-lg font-extrabold" style={{color:c.main?'#B8860B':'#0d1b3e'}}>
                          {monthsToLabel(c.months)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{c.label}</div>
                        {c.main && result.totalMonths < AVG_MONTHS && (
                          <div className="text-xs font-bold mt-1" style={{color:'#1a9e6b'}}>
                            ⚡ أسرع من المتوسط!
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ملخص مالي */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {label:'ثروتك الحالية', value:formatNumber(result.netWorth)+' ر', green:true},
                    {label:'ادخارك الشهري', value:formatNumber(result.monthlySaving)+' ر', green:false},
                  ].map(m=>(
                    <div key={m.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                      <div className="text-lg font-extrabold" style={{color:m.green?'#1a9e6b':'#0d1b3e'}}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* ماذا لو؟ — سلايدر */}
                <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100">
                  <h3 className="font-extrabold mb-1" style={{color:'#0d1b3e'}}>🎯 ماذا لو ادخرت أكثر؟</h3>
                  <p className="text-sm text-gray-400 mb-4">حرّك السلايدر وشاهد كيف تتغير النتيجة فوراً</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">ادخار إضافي شهرياً</span>
                    <span className="font-extrabold text-sm" style={{color:'#1a9e6b'}}>
                      {extraSaving > 0 ? `+${extraSaving.toLocaleString('ar-SA')} ريال` : 'لا يوجد'}
                    </span>
                  </div>
                  <input type="range" min="0" max="10000" step="500" value={extraSaving}
                    onChange={e=>setExtraSaving(Number(e.target.value))}
                    className="w-full mb-4" style={{accentColor:'#1a9e6b'}}
                  />
                  <div className="rounded-2xl p-4 text-center"
                    style={{background:extraSaving>0?'rgba(26,158,107,0.08)':'#fafafa', border:'1.5px solid', borderColor:extraSaving>0?'rgba(26,158,107,0.3)':'#e5e7eb'}}>
                    <p className="text-sm text-gray-500 mb-1">ستصل للمليون خلال</p>
                    <p className="text-2xl font-extrabold" style={{color:extraSaving>0?'#1a9e6b':'#0d1b3e'}}>
                      {monthsToLabel(whatIfMonths)}
                    </p>
                    {extraSaving > 0 && result.totalMonths < 99999 && whatIfMonths < result.totalMonths && (
                      <p className="text-sm font-bold mt-1" style={{color:'#1a9e6b'}}>
                        ⚡ توفر {monthsToLabel(result.totalMonths - whatIfMonths)}!
                      </p>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    {[500, 1000, 2000, 5000].map(amt=>{
                      const m = calcMonthsToGoal(result!.netWorth, result!.monthlySaving+amt, hasInvestments?rate:0, 1_000_000)
                      return (
                        <button key={amt} onClick={()=>setExtraSaving(amt)}
                          className="w-full flex justify-between items-center px-4 py-2.5 rounded-xl border transition-all text-sm"
                          style={{borderColor:extraSaving===amt?'#1a9e6b':'#e5e7eb', background:extraSaving===amt?'rgba(26,158,107,0.06)':'white'}}>
                          <span className="text-gray-600">+ {amt.toLocaleString('ar-SA')} ريال/شهر</span>
                          <span className="font-bold" style={{color:'#1a9e6b'}}>{monthsToLabel(m)}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* رسم بياني */}
                {result.chartLabels.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100">
                    <h3 className="font-extrabold mb-1" style={{color:'#0d1b3e'}}>📈 رحلة ثروتك</h3>
                    <p className="text-sm text-gray-400 mb-4">كيف تنمو أموالك بمرور الوقت</p>
                    <GrowthChart labels={result.chartLabels} data={result.chartData} goal={1000000} />
                  </div>
                )}

                {/* مشاركة */}
                <ShareCard years={monthsToLabel(result.totalMonths)} totalMonths={result.totalMonths}
                  date={targetDate(result.totalMonths)} goal="مليون ريال" />

                <UpsellCard scenarios={result.scenarios}
                  userData={{salary:s, expenses:e, savings:sv, investments:inv, rate, monthlySaving:result.monthlySaving, netWorth:result.netWorth, totalMonths:result.totalMonths}} />

                <ReferralCard />

                <button onClick={() => { setResult(null); navigate(0) }}
                  className="w-full py-3.5 text-sm text-gray-400 hover:text-gray-600 transition-colors border-2 border-gray-100 rounded-2xl font-medium">
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
