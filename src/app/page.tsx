'use client'

import { useState } from 'react'
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

interface Result {
  totalMonths: number
  netWorth: number
  monthlySaving: number
  chartLabels: string[]
  chartData: number[]
  scenarios: { label: string; months: number }[]
}

export default function Home() {
  const [salary, setSalary] = useState('')
  const [expenses, setExpenses] = useState('')
  const [hasSavings, setHasSavings] = useState<null | boolean>(null)
  const [savings, setSavings] = useState('')
  const [hasInvestments, setHasInvestments] = useState<null | boolean>(null)
  const [investments, setInvestments] = useState('')
  const [rate, setRate] = useState<number>(7)
  const [result, setResult] = useState<Result | null>(null)

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

    setResult({ totalMonths, netWorth, monthlySaving, chartLabels: labels, chartData: data, scenarios })
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const isReady =
    salary &&
    expenses &&
    hasSavings !== null &&
    (hasSavings === false || savings) &&
    hasInvestments !== null &&
    (hasInvestments === false || investments)

  const rateOptions = [
    { label: 'محافظ', sub: 'ودائع وصكوك', value: 4 },
    { label: 'متوسط', sub: 'صناديق استثمار', value: 7 },
    { label: 'جريء', sub: 'أسهم وعقارات', value: 12 },
  ]

  return (
    <main className="min-h-screen bg-[#0A0F1C] text-white font-tajawal" dir="rtl">
      <div className="max-w-xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            متى تصبح <span className="text-gold">مليونير</span>؟
          </h1>
          <p className="text-gray-400 text-base">
            أجب على الأسئلة واعرف متى ستصل لأول مليون ريال 🎯
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 space-y-6">

          {/* Q1 - الراتب */}
          <div>
            <label className="block text-base font-bold mb-2">💰 كم راتبك الشهري؟</label>
            <div className="relative">
              <input
                type="number"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                placeholder=""
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-gold transition-colors"
              />
              <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ريال</span>
            </div>
          </div>

          {/* Q2 - المصروف */}
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
                ⚠️ مصروفك أكثر من راتبك — صعب توصل للمليون بهذا الوضع
              </p>
            )}
          </div>

          {/* Q3 - المدخرات */}
          <div>
            <label className="block text-base font-bold mb-3">🏦 عندك مدخرات حالية؟</label>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setHasSavings(true)}
                className={`flex-1 py-3 rounded-xl font-bold text-base transition-all ${
                  hasSavings === true ? 'bg-gold text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                نعم ✅
              </button>
              <button
                onClick={() => { setHasSavings(false); setSavings('') }}
                className={`flex-1 py-3 rounded-xl font-bold text-base transition-all ${
                  hasSavings === false ? 'bg-gold text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                لا ❌
              </button>
            </div>
            {hasSavings === true && (
              <div className="relative">
                <input
                  type="number"
                  value={savings}
                  onChange={e => setSavings(e.target.value)}
                  placeholder=""
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-gold transition-colors"
                  autoFocus
                />
                <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ريال</span>
              </div>
            )}
          </div>

          {/* Q4 - الاستثمارات */}
          <div>
            <label className="block text-base font-bold mb-3">📈 عندك استثمارات حالية؟</label>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setHasInvestments(true)}
                className={`flex-1 py-3 rounded-xl font-bold text-base transition-all ${
                  hasInvestments === true ? 'bg-gold text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                نعم ✅
              </button>
              <button
                onClick={() => { setHasInvestments(false); setInvestments('') }}
                className={`flex-1 py-3 rounded-xl font-bold text-base transition-all ${
                  hasInvestments === false ? 'bg-gold text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                لا ❌
              </button>
            </div>
            {hasInvestments === true && (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="number"
                    value={investments}
                    onChange={e => setInvestments(e.target.value)}
                    placeholder=""
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-gold transition-colors"
                    autoFocus
                  />
                  <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ريال</span>
                </div>
                {/* نسبة العائد */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">ما نوع استثمارك؟</p>
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
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={calculate}
            disabled={!isReady}
            className={`w-full py-4 font-bold text-lg rounded-xl transition-all active:scale-95 ${
              isReady
                ? 'bg-gold hover:bg-yellow-600 text-white'
                : 'bg-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            احسب متى تصبح مليونير 🚀
          </button>
        </div>

        {/* Results */}
        {result && (
          <div id="results" className="space-y-4">

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">إذا استمريت بنفس وضعك ستصل للهدف خلال</p>
              <div className="text-5xl font-extrabold text-gold leading-tight">
                {monthsToLabel(result.totalMonths)}
              </div>
              {result.totalMonths < 99999 && (
                <div className="text-lg font-bold mt-3">
                  📅 {targetDate(result.totalMonths)}
                </div>
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

            <UpsellCard scenarios={result.scenarios} />
          </div>
        )}
      </div>
    </main>
  )
}
