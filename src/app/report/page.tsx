'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserData, UserData } from '@/lib/store'
import { monthsToLabel, formatNumber, calcMonthsToGoal } from '@/lib/calculator'

interface ReportData {
  motivational_opener: string
  reality_check: string
  diagnosis: string
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
  const steps = ['نحلل مصاريفك وادخارك...', 'نحسب أفضل الطرق لك...', 'نجهز خطتك الشخصية...', 'لحظات وتقريرك جاهز...']
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1800)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="text-center py-20 px-4">
      <div className="text-6xl mb-6">📊</div>
      <h2 className="text-xl font-bold mb-2" style={{color:'#0d1b3e'}}>يتم تجهيز تقريرك</h2>
      <p className="text-gray-500 text-sm mb-8">{steps[step]}</p>
      <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{width:`${((step+1)/steps.length)*100}%`, background:'#1a9e6b'}} />
      </div>
    </div>
  )
}

// حساب مؤشر الجاهزية
function calcReadinessScore(data: UserData): { score: number; label: string; color: string } {
  let score = 0
  const savingRate = data.salary > 0 ? (data.monthlySaving / data.salary) * 100 : 0

  // نسبة الادخار (40 نقطة)
  if (savingRate >= 30) score += 40
  else if (savingRate >= 20) score += 30
  else if (savingRate >= 10) score += 20
  else if (savingRate >= 5) score += 10
  else score += 0

  // الوقت للهدف (30 نقطة)
  if (data.totalMonths < 60) score += 30
  else if (data.totalMonths < 120) score += 25
  else if (data.totalMonths < 180) score += 20
  else if (data.totalMonths < 240) score += 15
  else score += 8

  // الثروة الحالية (20 نقطة)
  if (data.netWorth >= 200000) score += 20
  else if (data.netWorth >= 100000) score += 16
  else if (data.netWorth >= 50000) score += 12
  else if (data.netWorth >= 10000) score += 8
  else if (data.netWorth > 0) score += 4

  // الفائض الشهري (10 نقطة)
  if (data.monthlySaving >= 5000) score += 10
  else if (data.monthlySaving >= 2000) score += 8
  else if (data.monthlySaving >= 1000) score += 6
  else if (data.monthlySaving > 0) score += 3

  if (score >= 80) return { score, label: 'ممتاز — في المسار الصحيح', color: '#1a9e6b' }
  if (score >= 60) return { score, label: 'جيد — هناك فرص للتسريع', color: '#B8860B' }
  if (score >= 40) return { score, label: 'متوسط — تحتاج تحسينات', color: '#f97316' }
  return { score, label: 'يحتاج تطوير — لكن ممكن', color: '#ef4444' }
}

// حساب كم تحتاج شهرياً لهدف معين
function calcRequiredMonthly(netWorth: number, rate: number, targetYears: number): number {
  const goal = 1_000_000
  if (netWorth >= goal) return 0
  const targetMonths = targetYears * 12
  const monthlyRate = rate / 100 / 12
  if (monthlyRate === 0) return Math.max(0, Math.ceil((goal - netWorth) / targetMonths))
  // FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r
  // solve for PMT
  const factor = Math.pow(1 + monthlyRate, targetMonths)
  const remaining = goal - netWorth * factor
  const pmt = remaining / ((factor - 1) / monthlyRate)
  return Math.max(0, Math.ceil(pmt))
}

function DiffBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, string> = {
    'سهل جداً': '#1a9e6b', 'سهل': '#1a9e6b', 'الوضع الحالي': '#6b7280',
    'ممكن خلال شهر': '#3b82f6', 'متوسط': '#f59e0b',
    'يحتاج جهد': '#f97316', 'يحتاج 3 أشهر': '#f97316',
  }
  const color = map[difficulty] || '#6b7280'
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-bold border"
      style={{color, borderColor: color+'44', background: color+'11'}}>
      {difficulty}
    </span>
  )
}

export default function ReportPage() {
  const router = useRouter()
  const [data, setData] = useState<UserData | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openIdea, setOpenIdea] = useState<number | null>(null)
  const [targetYears, setTargetYears] = useState(10)

  useEffect(() => {
    const d = getUserData() || { salary:8000, expenses:5000, savings:0, investments:0, rate:0, monthlySaving:3000, netWorth:0, totalMonths:168 }
    setData(d)
    generateReport(d)
  }, [])

  const generateReport = async (d: UserData) => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salary:d.salary, expenses:d.expenses, monthlySaving:d.monthlySaving, totalMonths:d.totalMonths, netWorth:d.netWorth, rate:d.rate }),
      })
      const json = await res.json()
      if (json.result) { try { setReport(JSON.parse(json.result)); return } catch {} }
      throw new Error('fallback')
    } catch {
      setReport(buildLocalReport(d))
    } finally {
      setLoading(false)
    }
  }

  const buildLocalReport = (d: UserData): ReportData => {
    const savingRate = d.salary > 0 ? Math.round((d.monthlySaving / d.salary) * 100) : 0
    const sc500 = calcMonthsToGoal(d.netWorth, d.monthlySaving+500, d.rate, 1000000)
    const sc1000 = calcMonthsToGoal(d.netWorth, d.monthlySaving+1000, d.rate, 1000000)
    const sc2000 = calcMonthsToGoal(d.netWorth, d.monthlySaving+2000, d.rate, 1000000)
    const diff500 = d.totalMonths - sc500
    const diff1000 = d.totalMonths - sc1000

    const diagnosisText = savingRate < 10
      ? 'التحدي الأكبر هو معدل الادخار المنخفض. رفعه حتى 15% سيغير كل شيء.'
      : d.monthlySaving < 2000
      ? 'الادخار الشهري لازال منخفضاً نسبياً — رفعه 500 ريال يوفر لك سنوات.'
      : d.netWorth < 50000
      ? 'الثروة الحالية في البداية — كل شهر تضيف إليها يسرع الوصول.'
      : 'وضعك الادخاري جيد — الفرصة الكبيرة في تحسين العائد أو زيادة الادخار.'

    return {
      motivational_opener: `${d.monthlySaving.toLocaleString('ar-SA')} ريال تدخرها كل شهر — هذا يكفي. مو كلام، الحاسبة أثبتته.`,
      reality_check: `تدخر ${savingRate}% من راتبك — أي ${Math.round(d.monthlySaving/30)} ريال يومياً. معظم الناس لا يصلون لهذا الرقم. المشكلة عادةً ليست في الراتب، بل في المصاريف التي نضيفها دون أن نلاحظ.`,
      diagnosis: diagnosisText,
      strengths: [
        { title: `${d.monthlySaving.toLocaleString('ar-SA')} ريال ادخار منتظم`, description: 'الانتظام هو السر الحقيقي للثروة — وأنت تفعله.' },
        { title: 'تعرف على وضعك المالي', description: 'معظم الناس لا يعرفون أرقامهم. أنت في موقع أفضل.' },
        { title: 'الوقت في صفك', description: `${monthsToLabel(d.totalMonths)} ستمر سواء ادخرت أو لا. الفرق هو أين ستكون.` },
      ],
      weaknesses: [
        { title: 'المصاريف تأخذ أكثر مما تلاحظ', fix: 'سجّل كل ريال لأسبوع واحد — ستكتشف 20-30% يذهب على أشياء لن تتذكرها.' },
        { title: 'دخل واحد = خطر واحد', fix: `500 ريال دخل إضافي يوفر لك ${monthsToLabel(diff500)} من المدة.` },
      ],
      scenarios: [
        { label: 'وضعك الحالي', action: 'استمر على نفس الوتيرة', months: d.totalMonths, monthly_saving: d.monthlySaving, difficulty: 'الوضع الحالي' },
        { label: 'وفّر 500 ريال إضافي', action: 'ألغِ اشتراكين غير مستخدمين', months: sc500, monthly_saving: d.monthlySaving+500, difficulty: 'سهل جداً' },
        { label: 'دخل جانبي 1000 ريال', action: 'خدمة في وقت الفراغ', months: sc1000, monthly_saving: d.monthlySaving+1000, difficulty: 'ممكن خلال شهر' },
        { label: 'دخل جانبي 2000 ريال', action: 'مشروع صغير بجانب العمل', months: sc2000, monthly_saving: d.monthlySaving+2000, difficulty: 'يحتاج جهد' },
      ],
      income_ideas: [
        { title: 'بيع خدمة على مستقل', description: 'تصميم، كتابة، ترجمة، إدخال بيانات — الطلب موجود الآن.', potential: '500-3,000 ريال/شهر', difficulty: 'سهل', how_to_start: 'اكتب 3 مهارات، اختر الأقوى، أنشئ حساباً على مستقل.com' },
        { title: 'إدارة سوشيال ميديا لمحل', description: 'المطعم المجاور يحتاج من يصور منتجاته وينشر عنه.', potential: '500-1,500 ريال/عميل', difficulty: 'سهل', how_to_start: 'صوّر منتجاً لمحل قريب مجاناً — هذا أفضل portfolio' },
        { title: 'متجر إلكتروني بدون مخزون', description: 'تبيع أونلاين بدون أن تلمس المنتج — المورد يوصّل والفرق ربحك.', potential: '1,000-5,000 ريال/شهر', difficulty: 'متوسط', how_to_start: 'افتح متجراً على Salla، ابحث عن منتج طلبه عالٍ' },
        { title: 'تدريس خاص', description: 'رياضيات، إنجليزي، قرآن، برمجة — الطلب لا يتوقف أبداً.', potential: '100-300 ريال/ساعة', difficulty: 'سهل', how_to_start: 'أرسل رسالة لـ5 مجموعات واتساب تعلن خدمتك' },
        { title: 'تأجير ما لا تستخدم', description: 'سيارتك وقت العمل، غرفة فاضية، أدوات، كاميرا.', potential: '300-1,500 ريال/شهر', difficulty: 'سهل جداً', how_to_start: 'ضع إعلاناً في حراج اليوم' },
      ],
      monthly_plan: [
        { week: 'الأسبوع الأول', task: 'سجّل كل ريال تصرفه — حتى ريال الكافيه', why: 'ناس جربوا وصُدِموا: ربع مصاريفهم ذهبت على أشياء لم يتذكروها.' },
        { week: 'الأسبوع الثاني', task: 'ألغِ أو خفّض 3 بنود لن تفتقدها', why: 'المطلوب مو تعذيب النفس — فقط تلغي ما لا تشعر بفقدانه.' },
        { week: 'الأسبوع الثالث', task: 'اختر فكرة دخل جانبي واحدة وخذ خطوة أولى', why: 'الخطوة الأولى هي الأصعب. بعدها كل شيء يصبح أسهل.' },
        { week: 'الأسبوع الرابع', task: 'افتح حساب ادخار منفصل وفعّل تحويل تلقائي', why: '"اصرف ما يتبقى بعد الادخار" — وليس العكس.' },
      ],
      mindset_tips: [
        'الفقر والغنى عادتان — وكلتاهما تبدأ بقرار اليوم',
        'كل مليونير بدأ بادخار شهري منتظم مثلك',
        'أخطر جملة: "لما راتبي يزيد ادخر" — الوقت المثالي هو الآن',
        'كل ريال توفره اليوم يتضاعف مع الوقت',
      ],
      closing_message: `${monthsToLabel(d.totalMonths)} ستمر سواء بدأت أو لم تبدأ. الفرق الوحيد: أين ستكون في نهايتها.`,
    }
  }

  if (!data) return null

  const readiness = calcReadinessScore(data)
  const savingRate = data.salary > 0 ? Math.round((data.monthlySaving/data.salary)*100) : 0
  const annualSaving = data.monthlySaving * 12
  const requiredMonthly = calcRequiredMonthly(data.netWorth, data.rate, targetYears)
  const extraNeeded = Math.max(0, requiredMonthly - data.monthlySaving)
  const today = new Date().toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric' })

  const downloadPDF = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { default: jsPDF } = await import('jspdf')
      
      const element = document.getElementById('report-content')
      if (!element) return
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fbff',
        logging: false,
        windowWidth: 600,
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = imgWidth / imgHeight
      const pageImgHeight = pdfWidth / ratio
      
      let heightLeft = pageImgHeight
      let position = 0
      
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pageImgHeight)
      heightLeft -= pdfHeight
      
      while (heightLeft > 0) {
        position = heightLeft - pageImgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pageImgHeight)
        heightLeft -= pdfHeight
      }
      
      pdf.save('تقريري-المالي-saudimillion.pdf')
    } catch (e) {
      console.error(e)
      window.print()
    }
  }

  const sectionStyle = 'bg-white rounded-3xl border border-gray-100 shadow-sm p-6 print-page'
  const titleStyle = { color:'#0d1b3e' }

  return (
    <main className="min-h-screen font-tajawal" dir="rtl"
      style={{background:'linear-gradient(135deg,#e2f5ec 0%,#f8fbff 50%,#e8f0fb 100%)'}}>

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← الرئيسية
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{background:'rgba(26,158,107,0.1)', color:'#1a9e6b', border:'1px solid rgba(26,158,107,0.3)'}}>
              ✓ تقريرك الشخصي
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6">

        {loading && <LoadingReport />}

        {error && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => data && generateReport(data)}
              className="px-6 py-3 text-white font-bold rounded-xl"
              style={{background:'#0d1b3e'}}>
              أعد المحاولة
            </button>
          </div>
        )}

        {report && !loading && (
          <div>
          {/* Download buttons */}
          <div className="flex gap-3 mb-4 no-print">
            <button onClick={downloadPDF}
              className="flex-1 py-3.5 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
              style={{background:'linear-gradient(135deg,#0d1b3e,#1a3a6b)'}}>
              📥 تحميل التقرير PDF
            </button>
            <button onClick={() => window.print()}
              className="px-4 py-3.5 font-bold rounded-2xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-sm">
              🖨️ طباعة
            </button>
          </div>

          <div id="report-content">
          <div className="space-y-4">

            {/* COVER — غلاف التقرير */}
            <div className="rounded-3xl p-6 relative overflow-hidden text-center"
              style={{background:'linear-gradient(135deg,#0d1b3e,#1a3a6b)'}}>
              <div className="absolute inset-0 opacity-5 text-9xl flex items-center justify-center pointer-events-none">💰</div>
              <div className="relative">
                <div className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
                  style={{background:'rgba(184,134,11,0.3)', color:'#fbbf24', border:'1px solid rgba(184,134,11,0.5)'}}>
                  تقرير شخصي مخصص
                </div>
                <h1 className="text-2xl font-extrabold text-white mb-1">رحلتك إلى أول مليون ريال</h1>
                <p className="text-sm mb-6" style={{color:'rgba(255,255,255,0.5)'}}>{today}</p>

                <p className="text-sm mb-2" style={{color:'rgba(255,255,255,0.6)'}}>وصولك المتوقع للمليون</p>
                <div className="text-4xl font-extrabold mb-2" style={{color:'#fbbf24'}}>
                  {monthsToLabel(data.totalMonths)}
                </div>
                <div className="text-sm" style={{color:'rgba(255,255,255,0.5)'}}>
                  ✦ {report.motivational_opener}
                </div>
              </div>
            </div>

            {/* زبدة التقرير */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#1a9e6b'}}>⚡</span>
                الزبدة — أهم 5 نقاط
              </h2>
              <div className="space-y-2.5">
                {[
                  {point:`معدل ادخارك الحالي: ${savingRate}%`, sub: savingRate >= 20 ? 'جيد — استمر عليه' : 'أقل من المثالي — رفعه لـ20% يغير كثيراً'},
                  {point:`تدخر ${formatNumber(data.monthlySaving)} ريال شهرياً`, sub:`أي ${formatNumber(annualSaving)} ريال سنوياً`},
                  {point:`وضعك الحالي يوصلك للمليون خلال ${monthsToLabel(data.totalMonths)}`, sub:'بدون أي تغيير'},
                  {point:`إذا زدت ادخارك 1,000 ريال/شهر توفر ${monthsToLabel(data.totalMonths - calcMonthsToGoal(data.netWorth, data.monthlySaving+1000, data.rate, 1000000))}`, sub:'هذا الفرق يصنعه تغيير واحد'},
                  {point:`أكبر فرصة: ${savingRate < 15 ? 'رفع نسبة الادخار' : data.netWorth < 50000 ? 'بناء احتياطي أقوى' : 'استثمار الفائض'}`, sub:'هذا ما سيسرع رحلتك'},
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 rounded-2xl"
                    style={{background:'rgba(26,158,107,0.05)', border:'1px solid rgba(26,158,107,0.12)'}}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                      style={{background:'rgba(26,158,107,0.15)', color:'#1a9e6b'}}>{i+1}</div>
                    <div>
                      <p className="text-sm font-bold" style={{color:'#0d1b3e'}}>{item.point}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* READINESS SCORE — مؤشر الجاهزية */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#B8860B'}}>🎯</span>
                مؤشر رحلتك للمليون
              </h2>
              <div className="text-center mb-4">
                <div className="text-6xl font-extrabold mb-1" style={{color: readiness.color}}>
                  {readiness.score}
                </div>
                <div className="text-sm" style={{color: readiness.color}}>{readiness.label}</div>
              </div>
              <div className="w-full h-4 rounded-full bg-gray-100 overflow-hidden mb-3">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{width:`${readiness.score}%`, background: readiness.color}} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {label:'معدل الادخار', value:`${savingRate}%`, max:40},
                  {label:'المدة للهدف', value:monthsToLabel(data.totalMonths), max:30},
                  {label:'الثروة الحالية', value:`${formatNumber(data.netWorth)} ر`, max:20},
                  {label:'الفائض الشهري', value:`${formatNumber(data.monthlySaving)} ر`, max:10},
                ].map(m => (
                  <div key={m.label} className="p-3 rounded-2xl text-center"
                    style={{background:'#f8fbff', border:'1px solid #e8f0fb'}}>
                    <p className="text-xs text-gray-400 mb-0.5">{m.label}</p>
                    <p className="text-sm font-bold" style={{color:'#0d1b3e'}}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* WHERE ARE YOU NOW — أين أنت الآن؟ */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#3b82f6'}}>📍</span>
                أين أنت الآن؟
              </h2>
              <div className="space-y-2">
                {[
                  {l:'الراتب الشهري', v:`${formatNumber(data.salary)} ريال`},
                  {l:'المصروف الشهري', v:`${formatNumber(data.expenses)} ريال`},
                  {l:'الادخار الشهري', v:`${formatNumber(data.monthlySaving)} ريال`, green:true},
                  {l:'نسبة الادخار', v:`${savingRate}%`, green:true},
                  {l:'الادخار السنوي', v:`${formatNumber(annualSaving)} ريال`, green:true},
                  {l:'ثروتك الحالية', v:`${formatNumber(data.netWorth)} ريال`},
                  {l:'الهدف', v:'1,000,000 ريال'},
                  {l:'المدة المتوقعة', v:monthsToLabel(data.totalMonths), gold:true},
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 text-sm">
                    <span className="text-gray-500">{row.l}</span>
                    <span className="font-bold" style={{color:(row as any).green?'#1a9e6b':(row as any).gold?'#B8860B':'#0d1b3e'}}>{row.v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-2xl text-sm"
                style={{background:'rgba(26,158,107,0.06)', border:'1px solid rgba(26,158,107,0.2)', color:'#374151'}}>
                {report.reality_check}
              </div>
            </div>

            {/* DIAGNOSIS — التشخيص */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-3 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#f97316'}}>🔍</span>
                ما الذي يؤخرك؟
              </h2>
              <div className="p-4 rounded-2xl" style={{background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.2)'}}>
                <p className="text-sm text-gray-700 leading-relaxed">{report.diagnosis}</p>
              </div>
            </div>

            {/* SCENARIOS — ماذا لو؟ */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#8b5cf6'}}>⚡</span>
                كيف تصل أسرع؟ — مقارنة السيناريوهات
              </h2>
              <div className="space-y-3">
                {report.scenarios.map((s, i) => {
                  const saved = i === 0 ? 0 : data.totalMonths - s.months
                  const isCurrent = i === 0
                  const isBest = i === report.scenarios.length - 1
                  const barWidth = Math.min(100, Math.max(10, (1 - s.months/Math.max(...report.scenarios.map(sc=>sc.months)))*80 + 20))
                  return (
                    <div key={i} className="p-4 rounded-2xl border-2 transition-all"
                      style={{borderColor: isBest?'#1a9e6b':isCurrent?'#e5e7eb':'#e5e7eb',
                        background: isBest?'rgba(26,158,107,0.04)':isCurrent?'#fafafa':'white'}}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold" style={{color:isBest?'#1a9e6b':'#0d1b3e'}}>{s.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{s.action}</p>
                          <div className="mt-1"><DiffBadge difficulty={s.difficulty} /></div>
                        </div>
                        <div className="text-left">
                          <p className="text-base font-extrabold" style={{color:isCurrent?'#6b7280':isBest?'#1a9e6b':'#0d1b3e'}}>
                            {monthsToLabel(s.months)}
                          </p>
                          {saved > 0 && (
                            <p className="text-xs font-bold" style={{color:'#1a9e6b'}}>↗ وفر {monthsToLabel(saved)}</p>
                          )}
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{width:`${barWidth}%`, background:isBest?'#1a9e6b':isCurrent?'#9ca3af':'#B8860B'}} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* REVERSE CALCULATOR — كم تحتاج شهرياً؟ */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#0d1b3e'}}>🧮</span>
                تريد تصل أسرع؟ احسب المطلوب
              </h2>
              <p className="text-sm text-gray-500 mb-4">إذا أردت الوصول للمليون خلال:</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {[5,7,10,15,20].map(y => (
                  <button key={y} onClick={() => setTargetYears(y)}
                    className="px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all"
                    style={{
                      borderColor: targetYears===y ? '#1a9e6b' : '#e5e7eb',
                      background: targetYears===y ? 'rgba(26,158,107,0.08)' : 'white',
                      color: targetYears===y ? '#1a9e6b' : '#6b7280'
                    }}>
                    {y} سنوات
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl text-center" style={{background:'#f8fbff', border:'1px solid #e8f0fb'}}>
                  <p className="text-xs text-gray-400 mb-1">تحتاج شهرياً</p>
                  <p className="text-xl font-extrabold" style={{color:'#0d1b3e'}}>
                    {formatNumber(requiredMonthly)} ر
                  </p>
                </div>
                <div className="p-4 rounded-2xl text-center"
                  style={{background: extraNeeded > 0 ? 'rgba(249,115,22,0.06)' : 'rgba(26,158,107,0.06)',
                    border: `1px solid ${extraNeeded > 0 ? 'rgba(249,115,22,0.2)' : 'rgba(26,158,107,0.2)'}`}}>
                  <p className="text-xs text-gray-400 mb-1">
                    {extraNeeded > 0 ? 'إضافي على ادخارك' : 'ادخارك كافٍ ✅'}
                  </p>
                  <p className="text-xl font-extrabold"
                    style={{color: extraNeeded > 0 ? '#f97316' : '#1a9e6b'}}>
                    {extraNeeded > 0 ? `+${formatNumber(extraNeeded)} ر` : '0 ر'}
                  </p>
                </div>
              </div>
              {extraNeeded > 0 && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  تحتاج {formatNumber(extraNeeded)} ريال إضافي شهرياً للوصول خلال {targetYears} سنوات
                </p>
              )}
            </div>

            {/* STRENGTHS */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#1a9e6b'}}>💪</span>
                نقاط قوتك
              </h2>
              <div className="space-y-3">
                {report.strengths.map((s, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-2xl"
                    style={{background:'rgba(26,158,107,0.04)', border:'1px solid rgba(26,158,107,0.12)'}}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{background:'rgba(26,158,107,0.2)'}}>
                      <span style={{color:'#1a9e6b', fontSize:12}}>✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{color:'#0d1b3e'}}>{s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WEAKNESSES */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#f97316'}}>🔧</span>
                فرص التحسين — وكيف بالضبط
              </h2>
              <div className="space-y-3">
                {report.weaknesses.map((w, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                    <div className="px-4 py-3" style={{background:'rgba(249,115,22,0.06)'}}>
                      <p className="text-sm font-bold" style={{color:'#f97316'}}>{w.title}</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        <span className="font-bold" style={{color:'#1a9e6b'}}>الحل: </span>{w.fix}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* INCOME IDEAS */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-1 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#B8860B'}}>💡</span>
                أفكار زيادة الدخل
              </h2>
              <p className="text-xs text-gray-400 mb-4 mr-10">اضغط لتشوف كيف تبدأ</p>
              <div className="space-y-2">
                {report.income_ideas.map((idea, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                    <button onClick={() => setOpenIdea(openIdea===i?null:i)}
                      className="w-full flex justify-between items-center p-4 text-right hover:bg-gray-50 transition-all">
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{color:'#0d1b3e'}}>{idea.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold" style={{color:'#B8860B'}}>{idea.potential}</span>
                          <DiffBadge difficulty={idea.difficulty} />
                        </div>
                      </div>
                      <span className="text-gray-400 mr-3 text-sm">{openIdea===i?'▲':'▼'}</span>
                    </button>
                    {openIdea===i && (
                      <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                        <p className="text-sm text-gray-600 leading-relaxed">{idea.description}</p>
                        <div className="p-3 rounded-xl"
                          style={{background:'rgba(26,158,107,0.06)', border:'1px solid rgba(26,158,107,0.2)'}}>
                          <p className="text-sm text-gray-700">
                            <span className="font-bold" style={{color:'#1a9e6b'}}>⚡ ابدأ اليوم: </span>
                            {idea.how_to_start}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* MONTHLY PLAN */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#3b82f6'}}>📅</span>
                خطتك هذا الشهر — أسبوع بأسبوع
              </h2>
              <div className="space-y-3">
                {report.monthly_plan.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-extrabold text-white"
                      style={{background:'#0d1b3e'}}>
                      {i+1}
                    </div>
                    <div className="flex-1 pb-3 border-b border-gray-50 last:border-0">
                      <p className="text-xs font-bold mb-0.5" style={{color:'#1a9e6b'}}>{item.week}</p>
                      <p className="text-sm font-bold" style={{color:'#0d1b3e'}}>{item.task}</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GOALS SECTION */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#8b5cf6'}}>🏆</span>
                أهدافك الواضحة
              </h2>
              <div className="space-y-2">
                {[
                  {label:'هدفك الشهري', value:`ادخر ${formatNumber(data.monthlySaving)} ريال`, color:'#1a9e6b'},
                  {label:'هدفك السنوي', value:`${formatNumber(annualSaving)} ريال`, color:'#B8860B'},
                  {label:'هدفك النهائي', value:'1,000,000 ريال', color:'#8b5cf6'},
                  {label:'موعدك المتوقع', value:monthsToLabel(data.totalMonths), color:'#0d1b3e'},
                ].map((goal, i) => (
                  <div key={i} className="flex justify-between items-center p-4 rounded-2xl"
                    style={{background:'#f8fbff', border:'1px solid #e8f0fb'}}>
                    <span className="text-sm text-gray-500">{goal.label}</span>
                    <span className="text-sm font-extrabold" style={{color:goal.color}}>{goal.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MINDSET */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#6366f1'}}>🧠</span>
                حقائق يعرفها أصحاب الثروات
              </h2>
              <div className="space-y-3">
                {report.mindset_tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 rounded-2xl"
                    style={{background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.1)'}}>
                    <span className="text-xl flex-shrink-0">{['💎','⏰','🚫','📈'][i]}</span>
                    <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CLOSING */}
            <div className="rounded-3xl p-6 text-center"
              style={{background:'linear-gradient(135deg,#0d1b3e,#1a3a6b)'}}>
              <div className="text-4xl mb-3">🏆</div>
              <p className="text-white font-bold text-base leading-relaxed">{report.closing_message}</p>
              <div className="mt-4 text-xs" style={{color:'rgba(255,255,255,0.4)'}}>
                ✦ النتائج تقديرية وليست استشارة مالية
              </div>
            </div>

            {/* مشاركة */}
            <button onClick={() => {
              const text = `💰 حصلت على تقريري المالي!\nسأصير مليونير خلال ${monthsToLabel(data.totalMonths)}\n\naحسب هدفك المالي:\nwww.saudimillion.com`
              if (navigator.share) navigator.share({text})
              else navigator.clipboard.writeText(text)
            }}
              className="w-full py-4 font-bold rounded-2xl text-sm transition-all active:scale-95"
              style={{background:'rgba(26,158,107,0.08)', color:'#1a9e6b', border:'2px solid rgba(26,158,107,0.2)'}}>
              📤 شارك تقريرك مع أصدقائك
            </button>

            <button onClick={() => router.push('/')}
              className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors no-print">
              ← أعد الحساب بأرقام مختلفة
            </button>

          </div>
          </div>
          </div>

        )}
      </div>
    </main>
  )
}
