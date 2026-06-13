'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserData, UserData } from '@/lib/store'
import { monthsToLabel, formatNumber, calcMonthsToGoal } from '@/lib/calculator'

interface ReportData {
  motivational_opener: string
  reality_check: string
  strengths: { title: string; description: string }[]
  weaknesses: { title: string; fix: string }[]
  scenarios: { label: string; action: string; months: number; monthly_saving: number; difficulty: string }[]
  income_ideas: { title: string; description: string; potential: string; difficulty: string; how_to_start: string }[]
  monthly_plan: { week: string; task: string; why: string }[]
  mindset_tips: string[]
  closing_message: string
}

function LoadingReport() {
  const [step, setStep] = useState(0)
  const steps = [
    '🔍 نحلل وضعك المالي بعمق...',
    '💡 نبحث عن أفضل الفرص لك...',
    '🎯 نبني خطتك الشخصية...',
    '✨ يتولد تقريرك الآن...',
  ]
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1800)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="text-center py-16 px-4">
      <div className="text-6xl mb-6 animate-bounce">🤖</div>
      <h2 className="text-xl font-bold mb-2">الذكاء الاصطناعي يحلل وضعك</h2>
      <p className="text-gray-400 text-sm mb-6">هذا يأخذ ثوانٍ قليلة...</p>
      <p className="text-gold font-bold text-lg mb-8 min-h-[28px]">{steps[step]}</p>
      <div className="w-full bg-white/10 rounded-full h-2 max-w-xs mx-auto">
        <div
          className="bg-gold h-2 rounded-full transition-all duration-1000"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-6">يستغرق عادةً 10-15 ثانية</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <p className="text-xs text-gray-400 font-bold mb-4 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  )
}

export default function ReportPage() {
  const router = useRouter()
  const [data, setData] = useState<UserData | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const d = getUserData()
    if (!d) { router.push('/'); return }
    setData(d)
    generateReport(d)
  }, [router])

  const generateReport = async (d: UserData) => {
    try {
      const savingRate = d.salary > 0 ? Math.round((d.monthlySaving / d.salary) * 100) : 0
      const prompt = `أنت مستشار مالي سعودي خبير ومحفّز. مهمتك الأساسية: تحفيز شخص بدخل بسيط وتعريفه أن المليون ممكن.

البيانات المالية:
- الراتب: ${d.salary} ريال/شهر
- المصروف: ${d.expenses} ريال/شهر  
- الادخار الشهري: ${d.monthlySaving} ريال (${savingRate}% من الراتب)
- المدخرات: ${d.savings} ريال
- الاستثمارات: ${d.investments} ريال
- صافي الثروة: ${d.netWorth} ريال
- المدة الحالية للوصول للمليون: ${monthsToLabel(d.totalMonths)}

اكتب تقريراً شاملاً بصيغة JSON فقط بدون أي نص إضافي أو backticks:
{
  "motivational_opener": "جملة تحفيزية قوية تخاطب وضعه مباشرة وتقول له ان المليون ممكن من راتبه، تكون شخصية ومؤثرة وليست عامة",
  "reality_check": "فقرة صادقة عن وضعه الحالي، تعترف بالصعوبة لكن تفتح الأمل، بأسلوب أخ ناصح لا محاضر",
  "strengths": [
    {"title": "عنوان نقطة قوة", "description": "شرح مشجع كيف يستثمر هذه النقطة"},
    {"title": "نقطة قوة ثانية", "description": "شرح مشجع"}
  ],
  "weaknesses": [
    {"title": "نقطة ضعف بأسلوب لطيف", "fix": "حل عملي واضح وبسيط"},
    {"title": "نقطة ضعف ثانية", "fix": "حل عملي"}
  ],
  "scenarios": [
    {"label": "زيادة الادخار 500 ريال", "action": "كيف تحرر 500 ريال من مصاريفك بخطوة واحدة", "months": ${calcMonthsToGoal(d.netWorth, d.monthlySaving + 500, d.rate, 1000000)}, "monthly_saving": ${d.monthlySaving + 500}, "difficulty": "سهل"},
    {"label": "دخل جانبي 1000 ريال", "action": "فكرة دخل جانبي واقعية تناسب وضعه", "months": ${calcMonthsToGoal(d.netWorth, d.monthlySaving + 1000, d.rate, 1000000)}, "monthly_saving": ${d.monthlySaving + 1000}, "difficulty": "متوسط"},
    {"label": "دخل جانبي 2000 ريال", "action": "فكرة دخل جانبي أكبر قليلاً", "months": ${calcMonthsToGoal(d.netWorth, d.monthlySaving + 2000, d.rate, 1000000)}, "monthly_saving": ${d.monthlySaving + 2000}, "difficulty": "يحتاج جهد"},
    {"label": "استثمار ذكي بعائد 10%", "action": "أين يضع فلوسه عشان تشتغل له", "months": ${calcMonthsToGoal(d.netWorth, d.monthlySaving, 10, 1000000)}, "monthly_saving": ${d.monthlySaving}, "difficulty": "يحتاج تعلم"}
  ],
  "income_ideas": [
    {
      "title": "اسم الفكرة",
      "description": "وصف مشوق للفكرة يخلي القارئ يتحمس",
      "potential": "الدخل المتوقع مثل 500-2000 ريال/شهر",
      "difficulty": "سهل/متوسط/يحتاج وقت",
      "how_to_start": "خطوة أولى واحدة يقدر يسويها اليوم"
    },
    {
      "title": "التجارة الإلكترونية",
      "description": "بيع منتجات أونلاين بدون مخزون — dropshipping أو منتجات رقمية. آلاف الشباب السعودي يكسبون منها من البيت",
      "potential": "1000-5000 ريال/شهر",
      "difficulty": "متوسط",
      "how_to_start": "افتح متجر على Zid أو Salla اليوم ب 99 ريال وابدأ ببيع منتج واحد"
    },
    {
      "title": "العمل الحر (Freelancing)",
      "description": "بع مهاراتك على الإنترنت — تصميم، كتابة، ترجمة، برمجة، مونتاج. السوق السعودي يبحث عن مواهب",
      "potential": "500-3000 ريال/شهر",
      "difficulty": "سهل",
      "how_to_start": "سجل على مستقل.com أو Fiverr وأضف خدمة واحدة بناءً على مهارة تتقنها"
    },
    {
      "title": "إدارة السوشيال ميديا",
      "description": "المحلات والمطاعم تبحث عن شخص يدير صفحاتهم. مهارة تقدر تتعلمها خلال أسبوع",
      "potential": "500-2000 ريال/عميل",
      "difficulty": "سهل",
      "how_to_start": "تواصل مع 5 محلات قريبة منك وعرض عليهم خدمتك"
    },
    {
      "title": "تأجير شيء تملكه",
      "description": "سيارتك، غرفة، أجهزة، حتى كاميرا — الاقتصاد التشاركي يخلي أي شيء تملكه مصدر دخل",
      "potential": "300-1500 ريال/شهر",
      "difficulty": "سهل جداً",
      "how_to_start": "ضع إعلان في حراج أو أبشر اليوم"
    },
    {
      "title": "التدريس والتعليم",
      "description": "إذا تتقن أي مادة أو مهارة، علّمها للآخرين. الطلب على التدريس الخاص في تزايد مستمر",
      "potential": "100-300 ريال/ساعة",
      "difficulty": "سهل",
      "how_to_start": "أعلن في مجموعات واتساب المدرسية أو على حسابك في تويتر"
    }
  ],
  "monthly_plan": [
    {"week": "الأسبوع الأول", "task": "مهمة واحدة محددة وقابلة للتنفيذ", "why": "لماذا هذه المهمة مهمة جداً"},
    {"week": "الأسبوع الثاني", "task": "مهمة الأسبوع الثاني", "why": "سبب أهميتها"},
    {"week": "الأسبوع الثالث", "task": "مهمة الأسبوع الثالث", "why": "سبب أهميتها"},
    {"week": "الأسبوع الرابع", "task": "مهمة الأسبوع الرابع", "why": "سبب أهميتها"}
  ],
  "mindset_tips": [
    "حكمة أو نصيحة نفسية تحفيزية مختصرة",
    "حكمة ثانية عن الصبر والاستمرار",
    "حكمة ثالثة عن البدء الصغير",
    "حكمة رابعة عن الخوف والمجازفة الحسابة"
  ],
  "closing_message": "رسالة ختامية مؤثرة تخاطبه مباشرة وتقول له ان هذه اللحظة هي نقطة التحول في حياته المالية"
}`

      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Server error')
      const parsed = JSON.parse(json.result)
      setReport(parsed)
    } catch (e) {
      setError('حدث خطأ في توليد التقرير — يرجى المحاولة مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  if (!data) return null

  const difficultyColor = (d: string) => {
    if (d === 'سهل' || d === 'سهل جداً') return 'text-green-400 bg-green-400/10'
    if (d === 'متوسط') return 'text-yellow-400 bg-yellow-400/10'
    return 'text-orange-400 bg-orange-400/10'
  }

  return (
    <main className="min-h-screen bg-[#0A0F1C] text-white font-tajawal" dir="rtl">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/')} className="text-gray-400 text-sm hover:text-white transition-colors">
            ← الرئيسية
          </button>
          <div className="text-xs bg-gold/20 text-gold px-3 py-1 rounded-full font-bold border border-gold/30">
            ✓ تقرير مدفوع
          </div>
        </div>

        {loading && <LoadingReport />}

        {error && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => { setLoading(true); setError(''); generateReport(data) }}
              className="px-6 py-3 bg-gold text-white rounded-xl font-bold">
              أعد المحاولة
            </button>
          </div>
        )}

        {report && !loading && (
          <div className="space-y-5">

            {/* الافتتاحية التحفيزية */}
            <div className="bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/40 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🌟</div>
              <p className="text-lg font-bold text-gold leading-relaxed">{report.motivational_opener}</p>
            </div>

            {/* الواقع بصدق */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-gray-400 font-bold mb-3">📌 وضعك بصراحة</p>
              <p className="text-sm text-gray-200 leading-relaxed">{report.reality_check}</p>
            </div>

            {/* نقاط القوة */}
            <Section title="💪 نقاط قوتك — ركّز عليها">
              <div className="space-y-3">
                {report.strengths.map((s, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <span className="text-green-400 text-lg shrink-0">✓</span>
                    <div>
                      <p className="text-sm font-bold text-green-400">{s.title}</p>
                      <p className="text-xs text-gray-300 mt-1">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* نقاط الضعف */}
            <Section title="🔧 فرص التحسين — وكيف تصلحها">
              <div className="space-y-3">
                {report.weaknesses.map((w, i) => (
                  <div key={i} className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <p className="text-sm font-bold text-orange-400 mb-1">⚡ {w.title}</p>
                    <p className="text-xs text-gray-300">الحل: {w.fix}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* السيناريوهات */}
            <Section title="🎯 مقارنة السيناريوهات — وين تذهب فلوسك">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div>
                    <p className="text-sm font-bold">وضعك الحالي بدون تغيير</p>
                    <p className="text-xs text-gray-500">ادخار {formatNumber(data.monthlySaving)} ريال/شهر</p>
                  </div>
                  <span className="text-red-400 font-extrabold">{monthsToLabel(data.totalMonths)}</span>
                </div>
                {report.scenarios.map((s, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${i === report.scenarios.length - 1 ? 'border-gold bg-gold/10' : 'border-white/10 bg-white/5'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className={`text-sm font-bold ${i === report.scenarios.length - 1 ? 'text-gold' : 'text-white'}`}>{s.label}</p>
                      <div className="text-left">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${difficultyColor(s.difficulty)}`}>{s.difficulty}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">💡 {s.action}</p>
                      <span className={`font-extrabold text-sm ${i === report.scenarios.length - 1 ? 'text-gold' : 'text-green-400'}`}>
                        {monthsToLabel(s.months)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* أفكار زيادة الدخل */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wide">💰 أفكار زيادة دخلك — مقدور عليها</p>
              <p className="text-xs text-gray-500 mb-4">مناسبة للسوق السعودي الحالي</p>
              <div className="space-y-4">
                {report.income_ideas.map((idea, i) => (
                  <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-white/5">
                      <div>
                        <p className="text-sm font-bold">{idea.title}</p>
                        <p className="text-xs text-gold mt-0.5">{idea.potential}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold shrink-0 mr-2 ${difficultyColor(idea.difficulty)}`}>
                        {idea.difficulty}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-sm text-gray-300">{idea.description}</p>
                      <div className="flex items-start gap-2 bg-gold/10 border border-gold/20 rounded-lg p-3 mt-2">
                        <span className="text-gold shrink-0">⚡</span>
                        <p className="text-xs text-gray-200"><span className="text-gold font-bold">ابدأ اليوم:</span> {idea.how_to_start}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* الخطة الشهرية */}
            <Section title="📅 خطتك للشهر القادم — أسبوع بأسبوع">
              <div className="space-y-3">
                {report.monthly_plan.map((item, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-white/5 rounded-xl">
                    <div className="shrink-0 text-center">
                      <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-xs text-gold font-bold">
                        {i + 1}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gold font-bold">{item.week}</p>
                      <p className="text-sm text-white mt-0.5">{item.task}</p>
                      <p className="text-xs text-gray-500 mt-1">لماذا؟ {item.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* نصائح العقلية */}
            <Section title="🧠 عقلية المليونير — نصائح تغير طريقة تفكيرك">
              <div className="space-y-3">
                {report.mindset_tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-gold text-lg shrink-0">{['💎', '⏰', '🌱', '🎯'][i] || '💡'}</span>
                    <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* الرسالة الختامية */}
            <div className="bg-gradient-to-br from-gold/20 to-transparent border border-gold/30 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <p className="text-base text-gray-200 leading-relaxed font-medium">{report.closing_message}</p>
            </div>

            {/* ====== UPSELL: 100 فكرة مشروع ====== */}
            <div className="border-2 border-gold rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gold p-5 text-center">
                <div className="text-3xl mb-2">🚀</div>
                <h3 className="text-xl font-extrabold text-[#0A0F1C]">100 فكرة مشروع ناجح</h3>
                <p className="text-[#0A0F1C]/80 text-sm mt-1">دليلك الشامل لبدء مشروعك الخاص</p>
              </div>

              <div className="p-5 space-y-4">
                {/* ما تحصله */}
                <div className="space-y-2">
                  {[
                    { icon: '📋', text: '100 فكرة مشروع مجربة وناجحة في السوق السعودي' },
                    { icon: '💡', text: 'شرح كامل لكل فكرة: كيف تبدأ، كم تكلف، كم تربح' },
                    { icon: '📊', text: 'تصنيف حسب رأس المال: بدون رأس مال / صغير / متوسط' },
                    { icon: '🔄', text: 'يتحدث دائماً بأحدث الأفكار في السوق' },
                    { icon: '⚡', text: 'خطوات تنفيذ واضحة لكل مشروع' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-gray-300">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* معاينة أفكار */}
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-3">معاينة — أمثلة من الأفكار</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['☕ كافيه متنقل', '📱 تطبيقات الجوال', '🎨 تصميم جرافيك', '🚗 تطبيق توصيل',
                      '👕 ملابس مخصصة', '📸 تصوير مناسبات', '🏋️ تدريب رياضي', '🍕 مطبخ من البيت'].map((idea, i) => (
                      <div key={i} className="text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2">{idea}</div>
                    ))}
                  </div>
                  <p className="text-xs text-gold text-center mt-3">+ 92 فكرة أخرى في الدليل الكامل</p>
                </div>

                {/* السعر */}
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-gold">20 ريال</div>
                  <p className="text-xs text-gray-500">دفعة واحدة · وصول فوري · يتحدث مجاناً</p>
                </div>

                <button
                  onClick={() => router.push('/ideas-checkout')}
                  className="w-full py-4 bg-gold hover:bg-yellow-600 text-white font-extrabold text-lg rounded-xl transition-all active:scale-95 shadow-lg shadow-gold/20"
                >
                  اشتر الدليل الآن — 20 ريال 🚀
                </button>

                <p className="text-center text-xs text-gray-500">
                  💳 دفع آمن · استرداد مضمون خلال 24 ساعة
                </p>
              </div>
            </div>

            {/* زر مشاركة */}
            <button
              onClick={() => {
                const text = `💰 حصلت على تقريري المالي!\nسأصل للمليون خلال ${monthsToLabel(data.totalMonths)}\nتحدي للمشاركة: millionaire-sa.netlify.app`
                if (navigator.share) navigator.share({ text })
                else navigator.clipboard.writeText(text)
              }}
              className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10 transition-all"
            >
              📤 شارك نتيجتك مع أصدقائك
            </button>

          </div>
        )}
      </div>
    </main>
  )
}
