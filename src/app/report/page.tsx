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
    'نحلل مصاريفك وادخارك...',
    'نحسب أفضل الطرق لك...',
    'نجهز خطتك الشخصية...',
    'لحظات وتقريرك جاهز...',
  ]
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1800)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="text-center py-20 px-4">
      <div className="text-6xl mb-6">📊</div>
      <h2 className="text-xl font-bold mb-2">يتم تجهيز تقريرك</h2>
      <p className="text-gray-400 text-sm mb-8">{steps[step]}</p>
      <div className="w-48 bg-white/10 rounded-full h-1.5 mx-auto">
        <div className="bg-gold h-1.5 rounded-full transition-all duration-1000" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
    </div>
  )
}

function DiffBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, string> = {
    'سهل جداً': 'text-green-400 bg-green-400/10 border-green-400/20',
    'سهل': 'text-green-400 bg-green-400/10 border-green-400/20',
    'ممكن خلال شهر': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'متوسط': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'يحتاج جهد': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    'يحتاج 3 أشهر': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    'يحتاج صبر': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    'يحتاج تعلم': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  }
  const cls = map[difficulty] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${cls}`}>{difficulty}</span>
}

export default function ReportPage() {
  const router = useRouter()
  const [data, setData] = useState<UserData | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openIdea, setOpenIdea] = useState<number | null>(null)

  useEffect(() => {
    const d = getUserData()
    const userData = d || {
      salary: 8000, expenses: 5000, savings: 0,
      investments: 0, rate: 0, monthlySaving: 3000,
      netWorth: 0, totalMonths: 168
    }
    setData(userData)
    generateReport(userData)
  }, [])

  const generateReport = async (d: UserData) => {
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildPrompt(d),
          salary: d.salary,
          expenses: d.expenses,
          monthlySaving: d.monthlySaving,
          totalMonths: d.totalMonths,
          netWorth: d.netWorth,
        }),
      })
      const json = await res.json()
      if (json.result) {
        try {
          setReport(JSON.parse(json.result))
          return
        } catch {}
      }
      throw new Error('fallback')
    } catch {
      setReport(buildLocalReport(d))
    } finally {
      setLoading(false)
    }
  }

  const buildPrompt = (d: UserData) => {
    const savingRate = d.salary > 0 ? Math.round((d.monthlySaving / d.salary) * 100) : 0
    return `أنت مستشار مالي سعودي صادق ومحفّز. اكتب تقريراً مالياً شخصياً بأسلوب "أخ ناصح" وليس "مستشار رسمي".

البيانات: راتب ${d.salary} ريال | مصروف ${d.expenses} ريال | ادخار ${d.monthlySaving} ريال/شهر (${savingRate}%) | ثروة حالية ${d.netWorth} ريال | المدة للمليون: ${monthsToLabel(d.totalMonths)}

أجب بـ JSON فقط بدون backticks:
{"motivational_opener":"جملة واحدة تحفيزية شخصية تخاطبه مباشرة بناءً على أرقامه الحقيقية","reality_check":"فقرة قصيرة صادقة عن وضعه — بأسلوب شخص يحبك وخبره لك","strengths":[{"title":"نقطة قوة حقيقية من أرقامه","description":"شرح عملي كيف يستثمرها"},{"title":"نقطة قوة ثانية","description":"شرح"},{"title":"نقطة قوة ثالثة","description":"شرح"}],"weaknesses":[{"title":"نقطة ضعف بلطف","fix":"حل عملي خطوة واحدة"},{"title":"نقطة ضعف ثانية","fix":"حل"}],"scenarios":[{"label":"وضعك الحالي","action":"استمر على نفس الوتيرة","months":${d.totalMonths},"monthly_saving":${d.monthlySaving},"difficulty":"الوضع الحالي"},{"label":"وفّر 500 ريال إضافي","action":"كيف تحرر 500 ريال عملياً","months":${calcMonthsToGoal(d.netWorth,d.monthlySaving+500,d.rate,1000000)},"monthly_saving":${d.monthlySaving+500},"difficulty":"سهل جداً"},{"label":"دخل جانبي 1000 ريال","action":"فكرة دخل واقعية","months":${calcMonthsToGoal(d.netWorth,d.monthlySaving+1000,d.rate,1000000)},"monthly_saving":${d.monthlySaving+1000},"difficulty":"ممكن خلال شهر"},{"label":"دخل جانبي 2000 ريال","action":"مشروع صغير","months":${calcMonthsToGoal(d.netWorth,d.monthlySaving+2000,d.rate,1000000)},"monthly_saving":${d.monthlySaving+2000},"difficulty":"يحتاج جهد"}],"income_ideas":[{"title":"فكرة1","description":"وصف مشوق","potential":"X-Y ريال/شهر","difficulty":"سهل","how_to_start":"خطوة أولى اليوم"},{"title":"فكرة2","description":"...","potential":"...","difficulty":"...","how_to_start":"..."},{"title":"فكرة3","description":"...","potential":"...","difficulty":"...","how_to_start":"..."},{"title":"فكرة4","description":"...","potential":"...","difficulty":"...","how_to_start":"..."},{"title":"فكرة5","description":"...","potential":"...","difficulty":"...","how_to_start":"..."}],"monthly_plan":[{"week":"الأسبوع الأول","task":"مهمة واحدة محددة","why":"السبب بصدق"},{"week":"الأسبوع الثاني","task":"...","why":"..."},{"week":"الأسبوع الثالث","task":"...","why":"..."},{"week":"الأسبوع الرابع","task":"...","why":"..."}],"mindset_tips":["نصيحة نفسية قصيرة وقوية","نصيحة ثانية","نصيحة ثالثة","نصيحة رابعة"],"closing_message":"رسالة ختامية مؤثرة شخصية"}`
  }

  const buildLocalReport = (d: UserData): ReportData => {
    const daily = Math.round(d.monthlySaving / 30)
    const savingRate = d.salary > 0 ? Math.round((d.monthlySaving / d.salary) * 100) : 0
    const saving500months = calcMonthsToGoal(d.netWorth, d.monthlySaving + 500, d.rate, 1000000)
    const saving1000months = calcMonthsToGoal(d.netWorth, d.monthlySaving + 1000, d.rate, 1000000)
    const saving2000months = calcMonthsToGoal(d.netWorth, d.monthlySaving + 2000, d.rate, 1000000)
    const diffMonths500 = d.totalMonths - saving500months
    const diffMonths1000 = d.totalMonths - saving1000months

    return {
      motivational_opener: `${d.salary.toLocaleString('ar-SA')} ريال راتبك — وهذا كافٍ لتصير مليونير. مو تشجيع فارغ، الحاسبة أثبتته بأرقامك أنت.`,
      reality_check: `تدخر ${d.monthlySaving.toLocaleString('ar-SA')} ريال كل شهر — يعني ${daily} ريال يومياً فقط. ${savingRate}% من راتبك. هذا الرقم يكفي للبداية. المشكلة مو في الراتب أبداً — المشكلة في أننا نصرف بدون أن نلاحظ. كل ريال توفره اليوم يساوي أكثر غداً.`,
      strengths: [
        { title: `${d.monthlySaving.toLocaleString('ar-SA')} ريال ادخار شهري منتظم`, description: 'معظم الناس ما يوصلون للمليون لأنهم ما يدخرون بانتظام. أنت تعمل الشيء الصح — وهذا الفرق الحقيقي.' },
        { title: 'اتخذت قراراً بمعرفة وضعك', description: 'الشخص العادي يعيش سنوات بدون ما يعرف إلى أين تذهب فلوسه. أنت في موقع أفضل منهم الآن.' },
        { title: 'الوقت في صفك — ليس ضدك', description: `${monthsToLabel(d.totalMonths)} تبدو كثيرة لكنها ستمر سواء ادخرت أو لم تدخر. الفرق هو أين ستكون في نهايتها.` }
      ],
      weaknesses: [
        { title: 'مصاريفك تأكل أكثر مما تلاحظ', fix: 'سجّل كل ريال تصرفه لأسبوع واحد فقط — 7 أيام. ستكتشف أن 20-30% من مصاريفك ذهبت على أشياء لن تتذكرها بعد شهر.' },
        { title: 'دخل واحد = خطر واحد', fix: `500 ريال دخل إضافي شهرياً يوفر لك ${monthsToLabel(diffMonths500)} من المدة. ليس مطلوباً مشروع كبير — خدمة صغيرة في وقت فراغك تكفي.` }
      ],
      scenarios: [
        { label: 'وضعك الحالي', action: 'استمر على نفس الوتيرة', months: d.totalMonths, monthly_saving: d.monthlySaving, difficulty: 'الوضع الحالي' },
        { label: 'وفّر 500 ريال إضافي', action: 'ألغِ اشتراكين + قلل طلبات الطعام مرتين', months: saving500months, monthly_saving: d.monthlySaving + 500, difficulty: 'سهل جداً' },
        { label: 'دخل جانبي 1000 ريال', action: 'خدمة في وقت فراغك — تصميم أو تدريس أو توصيل', months: saving1000months, monthly_saving: d.monthlySaving + 1000, difficulty: 'ممكن خلال شهر' },
        { label: 'دخل جانبي 2000 ريال', action: 'مشروع صغير بجانب عملك', months: saving2000months, monthly_saving: d.monthlySaving + 2000, difficulty: 'يحتاج جهد' }
      ],
      income_ideas: [
        { title: 'بيع خدمة تتقنها أونلاين', description: 'تصميم، كتابة، ترجمة، مونتاج، إدخال بيانات — في ناس تبحث عنك الآن على مستقل.com. ما تحتاج رأس مال، فقط مهارة تتقنها ووقت فراغ.', potential: '500-3,000 ريال/شهر', difficulty: 'سهل', how_to_start: 'اكتب 3 مهارات تتقنها، اختر الأقوى، وأنشئ حساباً على مستقل.com اليوم' },
        { title: 'إدارة سوشيال ميديا لمحل', description: 'المطعم اللي تحت بيتك أو المحل في الحي يحتاج شخص يصور منتجاته وينشر عنه. هذه مهنة كاملة يمارسها شباب كثيرون بدأوا من الصفر.', potential: '500-1,500 ريال/عميل', difficulty: 'سهل', how_to_start: 'صوّر منتجاً لمحل قريب مجاناً وأرسله لهم — هذا أفضل CV في العالم' },
        { title: 'متجر إلكتروني بدون مخزون', description: 'تبيع منتجات أونلاين بدون ما تلمسها. تستقبل الطلب وتحوله للمورد، المورد يوصّل، وأنت تربح الفرق. آلاف الشباب السعودي يفعل هذا من غرفته.', potential: '1,000-5,000 ريال/شهر', difficulty: 'متوسط', how_to_start: 'ابحث عن منتج طلبه عالٍ، افتح متجراً على Salla بـ99 ريال، وابدأ بالتسويق عبر سناب' },
        { title: 'تدريس أو تعليم خاص', description: 'رياضيات، إنجليزي، قرآن، برمجة، حتى مهارة يدوية — الطلب على التدريس لم يتوقف يوماً. ساعتان يومياً بعد العمل تحوّل مهارتك لدخل ثابت.', potential: '100-300 ريال/ساعة', difficulty: 'سهل', how_to_start: 'أرسل رسالة لـ5 مجموعات واتساب في منطقتك تعلن فيها خدمتك اليوم' },
        { title: 'تأجير شيء لا تستخدمه', description: 'سيارتك نايمة وقت العمل؟ غرفة فاضية؟ كاميرا أو أدوات؟ كل شيء لا تستخدمه يومياً يمكن أن يكون مصدر دخل بدون أي تعب.', potential: '300-1,500 ريال/شهر', difficulty: 'سهل جداً', how_to_start: 'اكتب قائمة بما تملكه ولا تستخدم، ضع إعلاناً في حراج اليوم' }
      ],
      monthly_plan: [
        { week: 'الأسبوع الأول', task: 'سجّل كل ريال تصرفه — حتى ريال الكافيه', why: 'ناس جربوا هذا وصُدِموا: ربع مصاريفهم ذهبت على أشياء لم يتذكروها. لما تشوف، تتغير.' },
        { week: 'الأسبوع الثاني', task: 'من قائمتك، ألغِ أو خفّض 3 بنود لن تفتقدها', why: 'المطلوب مو تعذيب النفس. المطلوب تلغي ما لا تشعر بفقدانه — وغالباً هذا كثير.' },
        { week: 'الأسبوع الثالث', task: 'اختر فكرة دخل جانبي واحدة وخذ خطوة أولى', why: 'الخطوة الأولى هي الأصعب دائماً. بعدها كل شيء يصبح أسهل. لا تنتظر الوقت المثالي.' },
        { week: 'الأسبوع الرابع', task: 'افتح حساب ادخار منفصل وفعّل تحويل تلقائي أول الشهر', why: '"ادخر ما يتبقى بعد الصرف" لا يعمل أبداً. "اصرف ما يتبقى بعد الادخار" يعمل دائماً.' }
      ],
      mindset_tips: [
        'الفقر والغنى عادتان — وكلتاهما تبدأ بقرار تتخذه اليوم لا غداً',
        'ما في شخص وصل للمليون دفعة واحدة — لكن كل مليونير بدأ بادخار شهري منتظم مثلك',
        'أخطر جملة تقولها لنفسك: "لما راتبي يزيد ادخر" — الوقت المثالي هو الآن بما عندك',
        'كل ريال توفره اليوم يتضاعف مع الوقت — الزمن هو أقوى أداة مالية في يدك'
      ],
      closing_message: `اللي قرأته الآن مو مجرد كلام. هذا طريق حقيقي موجود أمامك. ${monthsToLabel(d.totalMonths)} ستمر سواء بدأت أو لم تبدأ. الفرق الوحيد هو أين ستكون في نهايتها. القرار الآن — لا بعد.`
    }
  }

  if (!data) return null

  return (
    <main className="min-h-screen bg-[#0A0F1C] text-white font-tajawal" dir="rtl">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/')} className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-1">
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
            <button onClick={() => { setLoading(true); setError(''); if (data) generateReport(data) }}
              className="px-6 py-3 bg-gold text-white rounded-xl font-bold">
              أعد المحاولة
            </button>
          </div>
        )}

        {report && !loading && (
          <div className="space-y-4">

            {/* 1. الافتتاحية */}
            <div className="bg-gradient-to-br from-gold/15 to-transparent border border-gold/30 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">💰</div>
              <p className="text-lg font-bold text-gold leading-relaxed">{report.motivational_opener}</p>
            </div>

            {/* 2. الواقع بصدق */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">👀</span>
                <p className="text-sm font-bold text-white">وضعك بصراحة</p>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{report.reality_check}</p>
            </div>

            {/* 3. السيناريوهات — أهم قسم */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">⏱️</span>
                <p className="text-sm font-bold text-white">كم يتغير الوقت لو غيّرت شيئاً بسيطاً؟</p>
              </div>
              <div className="space-y-2">
                {report.scenarios.map((s, i) => {
                  const isCurrent = i === 0
                  const isBest = i === report.scenarios.length - 1
                  const saved = isCurrent ? 0 : data.totalMonths - s.months
                  return (
                    <div key={i} className={`rounded-xl p-3.5 ${
                      isBest ? 'bg-gold/10 border border-gold/40' :
                      isCurrent ? 'bg-white/5 border border-white/10' :
                      'bg-white/5 border border-white/10'
                    }`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${isBest ? 'text-gold' : 'text-white'}`}>{s.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{s.action}</p>
                        </div>
                        <div className="text-left shrink-0">
                          <p className={`text-sm font-extrabold ${isCurrent ? 'text-gray-400' : isBest ? 'text-gold' : 'text-green-400'}`}>
                            {monthsToLabel(s.months)}
                          </p>
                          {saved > 0 && (
                            <p className="text-xs text-green-400 font-bold">توفر {monthsToLabel(saved)} ✨</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 4. نقاط القوة */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">💪</span>
                <p className="text-sm font-bold text-white">ما يميزك — ركّز عليه</p>
              </div>
              <div className="space-y-3">
                {report.strengths.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{s.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. نقاط الضعف + الحل */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">🔧</span>
                <p className="text-sm font-bold text-white">وين تقدر تتحسن — وكيف بالضبط</p>
              </div>
              <div className="space-y-3">
                {report.weaknesses.map((w, i) => (
                  <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="bg-orange-500/10 px-4 py-2.5">
                      <p className="text-sm font-bold text-orange-300">{w.title}</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-xs text-gray-300 leading-relaxed">
                        <span className="text-gold font-bold">الحل: </span>{w.fix}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. أفكار زيادة الدخل */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">💡</span>
                <p className="text-sm font-bold text-white">أفكار زيادة دخلك — مقدور عليها</p>
              </div>
              <p className="text-xs text-gray-500 mb-4 mr-6">اضغط على أي فكرة لتشوف كيف تبدأ</p>
              <div className="space-y-2">
                {report.income_ideas.map((idea, i) => (
                  <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenIdea(openIdea === i ? null : i)}
                      className="w-full flex justify-between items-center p-4 text-right hover:bg-white/5 transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold">{idea.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gold font-bold">{idea.potential}</span>
                          <DiffBadge difficulty={idea.difficulty} />
                        </div>
                      </div>
                      <span className="text-gray-500 mr-3">{openIdea === i ? '▲' : '▼'}</span>
                    </button>
                    {openIdea === i && (
                      <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                        <p className="text-sm text-gray-300 leading-relaxed">{idea.description}</p>
                        <div className="bg-gold/10 border border-gold/20 rounded-lg p-3">
                          <p className="text-xs text-gray-200">
                            <span className="text-gold font-bold">⚡ ابدأ اليوم: </span>
                            {idea.how_to_start}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 7. الخطة الشهرية */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">📅</span>
                <p className="text-sm font-bold text-white">خطتك — أسبوع بأسبوع هذا الشهر</p>
              </div>
              <div className="space-y-3">
                {report.monthly_plan.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0 text-xs text-gold font-extrabold mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs text-gold font-bold mb-0.5">{item.week}</p>
                      <p className="text-sm text-white font-medium">{item.task}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. عقلية المليونير */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">🧠</span>
                <p className="text-sm font-bold text-white">حقائق يعرفها المليونيرية</p>
              </div>
              <div className="space-y-3">
                {report.mindset_tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-lg shrink-0">{['💎','⏰','🚫','📈'][i]}</span>
                    <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 9. الرسالة الختامية */}
            <div className="bg-gradient-to-br from-gold/15 to-transparent border border-gold/30 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">🏆</div>
              <p className="text-sm text-gray-200 leading-relaxed font-medium">{report.closing_message}</p>
            </div>

            {/* 10. Upsell PDF */}
            <div className="border-2 border-gold/40 rounded-2xl overflow-hidden">
              <div className="bg-gold/10 p-5 text-center">
                <div className="text-3xl mb-2">📄</div>
                <h3 className="text-lg font-extrabold mb-1">تقرير PDF متكامل</h3>
                <p className="text-gray-400 text-xs mb-3">خطة استثمار مفصلة + أهداف سنوية + تحليل أعمق</p>
                <div className="text-3xl font-extrabold text-gold mb-3">49 ريال</div>
                <button
                  onClick={() => alert('قريباً! سنتواصل معك')}
                  className="w-full py-3 bg-gold text-white font-bold rounded-xl hover:bg-yellow-600 transition-all"
                >
                  اطلب التقرير المتكامل
                </button>
              </div>
            </div>

            {/* 11. Upsell أفكار */}
            <div className="border border-white/10 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="text-base font-bold mb-1">100 فكرة مشروع ناجح</h3>
              <p className="text-gray-400 text-xs mb-3">دليل شامل بأفضل المشاريع في السوق السعودي — محدّث باستمرار</p>
              <div className="text-2xl font-extrabold text-gold mb-3">20 ريال</div>
              <button
                onClick={() => router.push('/ideas-checkout')}
                className="w-full py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/15 transition-all"
              >
                شوف الأفكار الـ100
              </button>
            </div>

            {/* زر مشاركة */}
            <button
              onClick={() => {
                const text = `💰 حصلت على تقريري المالي!\nسأصير مليونير خلال ${monthsToLabel(data.totalMonths)}\n\nاحسب هدفك المالي:\nmillionaire-sa.netlify.app`
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
