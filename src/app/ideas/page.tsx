'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Idea {
  id: number
  title: string
  category: string
  capital: string
  capital_color: string
  description: string
  monthly_profit: string
  how_to_start: string
  first_step: string
  time_to_profit: string
  day1_steps?: string[]
  day2_steps?: string[]
  week1_plan?: string[]
  required_skills?: string[]
  tools_needed?: string[]
  common_mistakes?: string[]
  books?: { title: string; author: string }[]
  youtube_channels?: string[]
  success_tip?: string
}

const CATEGORIES = ['الكل', 'تقنية', 'تجارة', 'خدمات', 'إبداع', 'تعليم', 'طعام', 'عقارات']
const CAPITALS = ['الكل', 'بدون رأس مال', 'أقل من 5K', '5K-50K', 'أكثر من 50K']

function LoadingIdeas() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCount(c => Math.min(c + Math.floor(Math.random() * 8) + 3, 100)), 400)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-6 animate-pulse">💡</div>
      <h2 className="text-xl font-bold mb-2">يتم تجهيز أفكار المشاريع</h2>
      <p className="text-gray-400 text-sm mb-8">نبحث في أحدث الأسواق والفرص...</p>
      <div className="text-5xl font-extrabold text-gold mb-2">{count}</div>
      <p className="text-gray-400 text-sm mb-6">فكرة مشروع تم توليدها</p>
      <div className="w-full bg-white/10 rounded-full h-3 max-w-xs mx-auto">
        <div className="bg-gold h-3 rounded-full transition-all duration-300" style={{ width: `${count}%` }} />
      </div>
    </div>
  )
}

export default function IdeasPage() {
  const router = useRouter()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('الكل')
  const [activeCapital, setActiveCapital] = useState('الكل')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    // حارس الوصول: دليل الأفكار محتوى مدفوع — نتحقق من التوكن قبل التوليد
    fetch('/api/check-access?product=ideas')
      .then(r => r.json())
      .then(res => {
        if (res.access) generateIdeas()
        else router.push('/ideas-checkout')
      })
      .catch(() => router.push('/ideas-checkout'))
  }, [])

  const generateIdeas = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ideas')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Server error')
      const parsed = JSON.parse(json.result)
      setIdeas(parsed.ideas || [])
    } catch {
      setError('حدث خطأ في التوليد — حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  const capitalColor = (color: string) => {
    if (color === 'green') return 'text-green-400 bg-green-400/10 border-green-400/30'
    if (color === 'yellow') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    if (color === 'orange') return 'text-orange-400 bg-orange-400/10 border-orange-400/30'
    return 'text-red-400 bg-red-400/10 border-red-400/30'
  }

  const filtered = ideas.filter(idea => {
    const matchCat = activeCategory === 'الكل' || idea.category === activeCategory
    const matchCap = activeCapital === 'الكل' || idea.capital === activeCapital
    const matchSearch = search === '' || idea.title.includes(search) || idea.description.includes(search)
    return matchCat && matchCap && matchSearch
  })

  return (
    <main className="min-h-screen bg-dark text-white font-tajawal" dir="rtl">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/report')} className="text-gray-400 text-sm hover:text-white">
            ← التقرير
          </button>
          <div className="text-xs bg-gold/20 text-gold px-3 py-1 rounded-full font-bold border border-gold/30">
            ✓ دليل مدفوع
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold mb-1">💡 100 فكرة مشروع ناجح</h1>
          <p className="text-gray-400 text-sm">محدّث بأحدث فرص السوق السعودي</p>
        </div>

        {loading && <LoadingIdeas />}
        {error && (
          <div className="text-center py-10">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={generateIdeas} className="px-6 py-3 bg-gold text-white rounded-xl font-bold">
              أعد المحاولة
            </button>
          </div>
        )}

        {!loading && !error && ideas.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'إجمالي الأفكار', value: ideas.length },
                { label: 'بدون رأس مال', value: ideas.filter(i => i.capital === 'بدون رأس مال').length },
                { label: 'فئات مختلفة', value: ideas.reduce((acc: string[], i) => acc.includes(i.category) ? acc : [...acc, i.category], []).length },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-2xl font-extrabold text-gold">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن فكرة..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors"
              />
              <span className="absolute left-4 top-3 text-gray-400">🔍</span>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    activeCategory === cat
                      ? 'bg-gold border-gold text-white'
                      : 'border-white/20 text-gray-400 hover:border-white/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Capital Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
              {CAPITALS.map(cap => (
                <button
                  key={cap}
                  onClick={() => setActiveCapital(cap)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    activeCapital === cap
                      ? 'bg-gold border-gold text-white'
                      : 'border-white/20 text-gray-400 hover:border-white/40'
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 mb-4">{filtered.length} فكرة</p>

            {/* Ideas List */}
            <div className="space-y-3">
              {filtered.map((idea) => (
                <div
                  key={idea.id}
                  className="border border-white/10 rounded-2xl overflow-hidden"
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpanded(expanded === idea.id ? null : idea.id)}
                    className="w-full p-4 bg-white/5 hover:bg-white/10 transition-all text-right"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">{idea.category}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${capitalColor(idea.capital_color)}`}>
                            {idea.capital}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-right">{idea.title}</p>
                        <p className="text-xs text-gold mt-1">{idea.monthly_profit}</p>
                      </div>
                      <span className="text-gray-400 text-lg shrink-0">{expanded === idea.id ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {/* Details */}
                  {expanded === idea.id && (
                    <div className="p-4 space-y-3 border-t border-white/10">
                      <p className="text-sm text-gray-300 leading-relaxed">{idea.description}</p>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">⏱️ وقت الربح</p>
                          <p className="text-sm font-bold text-gold">{idea.time_to_profit}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">💰 الربح المتوقع</p>
                          <p className="text-sm font-bold text-green-400">{idea.monthly_profit}</p>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-2">📋 كيف تبدأ</p>
                        <p className="text-sm text-gray-300">{idea.how_to_start}</p>
                      </div>

                      <div className="bg-gold/10 border border-gold/30 rounded-xl p-3">
                        <p className="text-xs text-gold font-bold mb-1">⚡ خطوتك الأولى اليوم</p>
                        <p className="text-sm text-gray-200">{idea.first_step}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                <div className="text-4xl mb-3">🔍</div>
                <p>ما في نتائج — جرب فلتر مختلف</p>
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={generateIdeas}
              className="w-full mt-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10 transition-all"
            >
              🔄 حدّث الأفكار بأحدث السوق
            </button>

          </>
        )}
      </div>
    </main>
  )
}
