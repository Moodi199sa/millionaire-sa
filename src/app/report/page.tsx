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
  savings_behavior?: string
  daily_cost?: number
  coffee_equivalent?: number
  yearly_milestones?: { year: number; amount: number }[]
  expense_analysis?: { category: string; pct: number; amount: number; tip: string }[]
  money_personality?: { type: string; desc: string; advice: string }
  compound_effect?: { year1: number; year5: number; year10: number }
  emergency_fund?: { current: number; needed: number; status: string }
  risk_analysis?: { risk: string; impact: string; mitigation: string }[]
  age_comparison?: { age: string; typical: string; yours: string }[]
  investment_options?: { name: string; return_pct: number; risk: string; min: string; desc: string; pros: string; cons: string; best_for: string; action: string }[]
  saudi_advantages?: { icon: string; title: string; desc: string; value: string }[]
  common_mistakes?: { mistake: string; pct: number; fix: string }[]
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
        { 
          title: 'العمل الحر على المنصات العربية والدولية',
          description: 'سوق العمل الحر في السعودية نما 3 أضعاف منذ 2020. أكثر من 150,000 مستقل مسجل على منصة مستقل وحدها. المستقلون السعوديون يكسبون بين 8,000-15,000 ريال/شهر في المجالات المطلوبة. المستقل العربي يكسب 37-94 ريال/ساعة على المنصات المحلية، وعلى Upwork مع عملاء دوليين يصل الدخل لـ131-281 ريال/ساعة بنفس المهارات. أكثر المهارات طلباً: البرمجة، التصميم، كتابة المحتوى، التسويق الرقمي، وإدخال البيانات. 68% من الشركات الناشئة في السعودية تخطط لاستخدام المستقلين بحلول 2026.',
          potential: '3,000-15,000 ريال/شهر',
          difficulty: 'سهل',
          how_to_start: '1. سجّل في مستقل.com أو خمسات.com مجاناً\n2. اختر تخصص واحد (لا تشتت)\n3. أنشئ معرض أعمال بـ3 نماذج مجانية\n4. قدّم على 5 مشاريع يومياً أول أسبوعين\n5. ابدأ بأسعار أقل لبناء التقييمات\n6. بعد 10 تقييمات ارفع أسعارك تدريجياً'
        },
        { 
          title: 'إدارة حسابات السوشيال ميديا',
          description: 'أكثر من 80% من المحلات والمطاعم في السعودية ليس لديهم شخص متخصص في السوشيال ميديا. المطعم المجاور، صالون الحلاقة، محل العطور — كلهم يحتاجون من يصور منتجاتهم وينشر عنهم. المنافسة منخفضة محلياً لأن معظم المسوقين يركزون على العملاء الكبار. هامش الربح 90%+ لأن التكلفة الوحيدة هي وقتك. عميل واحد = 500-2,000 ريال/شهر. 3 عملاء = 1,500-6,000 ريال دخل ثابت شهري.',
          potential: '1,500-6,000 ريال/شهر (3 عملاء)',
          difficulty: 'سهل',
          how_to_start: '1. صوّر منتجات محل قريب مجاناً كعينة\n2. اعرض النتيجة على صاحب المحل\n3. اعرض باقة شهرية: 15 بوست + ستوريز يومية\n4. ابدأ بـ500 ريال/شهر لأول عميل\n5. استخدم Canva المجاني للتصميم\n6. بعد 3 أشهر ونتائج واضحة ارفع السعر'
        },
        { 
          title: 'متجر إلكتروني بدون مخزون (دروبشيبينغ)',
          description: 'التجارة الإلكترونية في السعودية تنمو بمعدل 25% سنوياً. حجم السوق تجاوز 80 مليار ريال. منصة سلة وزد تخليك تفتح متجر في 30 دقيقة بدون خبرة تقنية. المبدأ: تبيع المنتج أونلاين ← المورد يشحن مباشرة للعميل ← الفرق ربحك. هامش الربح المتوقع: 25-50% حسب المنتج. أكثر المنتجات مبيعاً: العطور، الملابس، الإكسسوارات، منتجات العناية. مفتاح النجاح: التخصص في فئة واحدة بدل بيع كل شيء.',
          potential: '2,000-10,000 ريال/شهر',
          difficulty: 'متوسط',
          how_to_start: '1. اختر نيش واحد (مثل: عطور رجالية فقط)\n2. افتح متجر مجاني على سلة.com\n3. تواصل مع 3 موردين على علي بابا\n4. اطلب عينات واختبر الجودة\n5. صوّر المنتجات بجوالك (إضاءة طبيعية)\n6. ابدأ بإعلان تيك توك بـ50 ريال/يوم\n7. أول 30 طلب ركّز على سرعة التوصيل والتقييمات'
        },
        { 
          title: 'التدريس الخاص والتعليم عن بُعد',
          description: 'سوق التعليم الخاص في السعودية يقدر بمليارات الريالات. الطلب مستمر 12 شهر في السنة — خصوصاً الرياضيات والإنجليزي والقدرات. المعلم الخصوصي يكسب 100-300 ريال/ساعة حضورياً، و75-150 ريال/ساعة أونلاين. 4 طلاب × 4 حصص/أسبوع = 4,800-19,200 ريال/شهر. التعليم أونلاين يوسّع السوق لكل مدن المملكة. يمكنك أيضاً تسجيل دورات وبيعها على يوديمي أو عصارة — تنتجها مرة وتبيعها آلاف المرات.',
          potential: '3,000-15,000 ريال/شهر',
          difficulty: 'سهل',
          how_to_start: '1. حدد مادة واحدة تتقنها فعلاً\n2. أعلن في 5 مجموعات واتساب في حيّك\n3. قدّم أول حصة مجانية لبناء الثقة\n4. استخدم Zoom للحصص أونلاين\n5. اطلب من أولياء الأمور تقييمات مكتوبة\n6. بعد 5 طلاب: ارفع السعر وأضف مجموعات صغيرة'
        },
        { 
          title: 'بيع المنتجات الرقمية',
          description: 'أعلى هامش ربح ممكن — تنتج المنتج مرة وتبيعه آلاف المرات بتكلفة نسخ صفرية. أمثلة: كتاب إلكتروني، قوالب تصميم، ملفات Excel جاهزة، دورة مسجلة، خطط وجبات. السعر المعتاد: 15-200 ريال للمنتج الواحد. 100 عملية بيع × 50 ريال = 5,000 ريال من منتج واحد. المفتاح: اختر مشكلة حقيقية يعاني منها الناس وحلّها في منتج رقمي.',
          potential: '1,000-20,000 ريال/شهر (بعد البناء)',
          difficulty: 'متوسط',
          how_to_start: '1. حدد مهارة أو خبرة عندك فيها ميزة\n2. ابحث: هل الناس تسأل عنها في تويتر/يوتيوب؟\n3. اصنع منتج صغير (PDF أو قالب) بسعر 19-49 ريال\n4. انشره على Gumroad أو لينك في بايو تويتر\n5. سوّق له بمحتوى مجاني يعالج نفس المشكلة\n6. بعد أول 50 مبيعة: اصنع منتج ثاني أعلى سعراً'
        },
        { 
          title: 'تأجير الأصول غير المستخدمة',
          description: 'معظم الناس عندهم أصول لا يستخدمونها: سيارة وقت العمل، غرفة فاضية، معدات تصوير، أدوات. تطبيقات مثل نعناع وحراج تسهّل التأجير. السيارة وحدها ممكن تدرّ 1,500-3,000 ريال/شهر عبر تطبيقات التوصيل في أوقات الذروة. غرفة فاضية على Airbnb: 2,000-5,000 ريال/شهر حسب الموقع. هامش الربح 85%+ لأن الأصل موجود أصلاً.',
          potential: '500-5,000 ريال/شهر',
          difficulty: 'سهل جداً',
          how_to_start: '1. اكتب قائمة بكل ما تملكه ولا تستخدمه\n2. سعّره بـ70% من سعر السوق (تأجير مو بيع)\n3. ضع إعلان في حراج + مجموعات واتساب الحي\n4. للسيارة: سجّل في أوبر/كريم للأوقات الفاضية\n5. للغرفة: سجّل في Airbnb مع صور احترافية'
        },
        { 
          title: 'الحلاقة/التجميل المتنقل',
          description: 'سوق التجميل في السعودية من الأكبر في الشرق الأوسط. الطلب على الخدمات المنزلية يزداد كل سنة. الحلاق المتنقل يكسب أكثر من الثابت — لا إيجار، لا موظفين. حلاقة منزلية: 80-150 ريال. 5 عملاء/يوم في عطلة نهاية الأسبوع = 800-1,500 ريال. رأس المال: أدوات حلاقة احترافية 1,500-3,000 ريال فقط.',
          potential: '3,000-8,000 ريال/شهر (part-time)',
          difficulty: 'متوسط',
          how_to_start: '1. تعلّم من يوتيوب (قنوات حلاقة احترافية)\n2. تمرّن على أصدقائك وعائلتك مجاناً\n3. اشترِ طقم حلاقة احترافي (1,500 ريال)\n4. أعلن في مجموعات واتساب حيّك\n5. ابدأ بسعر 60 ريال (أقل من الصالون)\n6. بعد 20 عميل: ارفع السعر لـ100+ ريال'
        },
        { 
          title: 'تغليف الهدايا والتمور الفاخرة',
          description: 'نفس التمر بعلبة مدروسة وهوية أنيقة يتحول من سلعة بـ30 ريال إلى هدية بـ150 ريال. الطلب مستمر: أعياد، مناسبات، زواجات، رمضان. هامش الربح: 50-70%. مثال: تشتري تمر بـ40 ريال + علبة بـ20 ريال = تكلفة 60 ريال ← تبيع بـ150-200 ريال. 20 صندوق/شهر × 90 ريال ربح = 1,800 ريال. في المواسم (رمضان، العيد) الطلب يتضاعف 5 مرات.',
          potential: '1,500-10,000 ريال/شهر',
          difficulty: 'سهل',
          how_to_start: '1. اشترِ تمر فاخر من المزارع مباشرة (سعر جملة)\n2. اشترِ علب فاخرة من علي بابا (20-30 ريال/علبة)\n3. صمم ستيكر بشعارك على Canva\n4. صوّر المنتج النهائي بشكل احترافي\n5. افتح حساب إنستقرام + واتساب بزنس\n6. ابدأ بـ10 صناديق واختبر السوق'
        },
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
      // أقسام جديدة
      savings_behavior: savingRate >= 30 ? 'ممتاز' : savingRate >= 20 ? 'جيد' : savingRate >= 10 ? 'يحتاج تحسين' : 'ضعيف',
      daily_cost: Math.round((1000000 - d.netWorth) / d.totalMonths / 30),
      coffee_equivalent: Math.round(d.monthlySaving / 18),
      yearly_milestones: [
        { year: 1, amount: d.netWorth + d.monthlySaving * 12 },
        { year: 3, amount: d.netWorth + d.monthlySaving * 36 },
        { year: 5, amount: d.netWorth + d.monthlySaving * 60 },
        { year: 10, amount: Math.min(1000000, d.netWorth + d.monthlySaving * 120) },
      ],
      expense_analysis: [
        { category: 'السكن', pct: 30, amount: Math.round(d.expenses * 0.3), tip: 'لو وفّرت 10% من السكن = ' + Math.round(d.expenses*0.03).toLocaleString('ar-SA') + ' ريال/شهر' },
        { category: 'الطعام', pct: 25, amount: Math.round(d.expenses * 0.25), tip: 'الطبخ في البيت يوفر 40% من ميزانية الأكل' },
        { category: 'المواصلات', pct: 15, amount: Math.round(d.expenses * 0.15), tip: 'المشاركة في التوصيل توفر 500-1000 ريال/شهر' },
        { category: 'الترفيه والاشتراكات', pct: 15, amount: Math.round(d.expenses * 0.15), tip: 'راجع اشتراكاتك — معظم الناس عندهم 2-3 اشتراكات ما يستخدمونها' },
        { category: 'أخرى', pct: 15, amount: Math.round(d.expenses * 0.15), tip: 'المصاريف الصغيرة المتكررة هي القاتل الصامت للادخار' },
      ],
      money_personality: savingRate >= 25 ? { type: 'المدخر الذكي 🧠', desc: 'تعرف قيمة المال وتتحكم في مصاريفك — استمر وركز على الاستثمار', advice: 'وقتك الحين تتعلم عن الاستثمار — الادخار وحده بطيء' }
        : savingRate >= 15 ? { type: 'المتوازن ⚖️', desc: 'تستمتع بحياتك وتدخر — بس ممكن تسرّع أكثر', advice: 'حاول ترفع ادخارك 5% كل 3 أشهر — ما بتحس بالفرق' }
        : savingRate >= 5 ? { type: 'المستمتع 🎉', desc: 'تحب تعيش اللحظة — لكن المستقبل يحتاج اهتمام أكثر', advice: 'ابدأ بادخار تلقائي — حوّل المبلغ أول ما ينزل الراتب' }
        : { type: 'المغامر 🎲', desc: 'تصرف أكثر مما تدخر — تحتاج خطة واضحة', advice: 'ابدأ بتسجيل مصاريفك لمدة أسبوع — ستنصدم بالنتيجة' },
      compound_effect: {
        year1: Math.round(d.monthlySaving * 12),
        year5: Math.round(d.monthlySaving * 60 * (d.rate > 0 ? Math.pow(1 + d.rate/100, 5) / 5 : 1)),
        year10: Math.round(d.monthlySaving * 120 * (d.rate > 0 ? Math.pow(1 + d.rate/100, 10) / 10 : 1)),
      },
      emergency_fund: { current: d.netWorth, needed: d.expenses * 6, status: d.netWorth >= d.expenses * 6 ? 'مكتمل ✅' : d.netWorth >= d.expenses * 3 ? 'جيد — أكمل لـ6 أشهر' : 'تحتاج بناء صندوق طوارئ أولاً' },
      risk_analysis: [
        { risk: 'فقدان الوظيفة', impact: 'عالي', mitigation: `عندك ${Math.round(d.netWorth / d.expenses)} شهر احتياطي — ${d.netWorth >= d.expenses * 6 ? 'وضعك آمن' : 'تحتاج توصل لـ6 أشهر'}` },
        { risk: 'مصروف طارئ كبير', impact: 'متوسط', mitigation: 'صندوق الطوارئ يحميك — لا تلمسه إلا للضرورة' },
        { risk: 'التضخم', impact: 'متوسط', mitigation: d.rate > 0 ? `عائد ${d.rate}% يحميك جزئياً` : 'بدون استثمار فلوسك تخسر قيمتها مع الوقت' },
      ],
      investment_options: [
        { name: 'حساب ادخار بنكي', return_pct: 4, risk: 'صفر', min: '0 ريال', desc: 'حسابات مثل واعد من البنك الأهلي أو مشابهاتها', pros: 'مضمون 100%، سيولة فورية', cons: 'عائد منخفض لا يتفوق على التضخم على المدى البعيد', best_for: 'صندوق الطوارئ والادخار قصير المدى', action: 'افتح حساب ادخار هذا الأسبوع' },
        { name: 'صكوك وسندات', return_pct: 5.5, risk: 'منخفض', min: '1,000 ريال', desc: 'أدوات دين إسلامية تصدرها الحكومة أو الشركات الكبرى', pros: 'عائد ثابت، متوافق مع الشريعة، أمان عالٍ', cons: 'عائد محدود، يحتاج ربط المبلغ لفترة', best_for: 'من يريد عائد ثابت بمخاطرة منخفضة', action: 'تصفح منصة تداول الصكوك عبر بنكك' },
        { name: 'مؤشر السوق السعودي (تداول)', return_pct: 7, risk: 'متوسط', min: '500 ريال', desc: 'تتبع أداء السوق السعودي بالكامل عبر صناديق المؤشر. تاريخياً حقق السوق السعودي 4.9%-7.2% سنوياً', pros: 'تنويع تلقائي، سيولة عالية، رسوم منخفضة (0.23%)', cons: 'تقلبات قصيرة المدى، يتأثر بأسعار النفط', best_for: 'الاستثمار طويل المدى 5-10 سنوات', action: 'افتح محفظة عبر تطبيق بنكك واشترِ ETF تداول 30' },
        { name: 'أسهم قطاع الطاقة والبنوك', return_pct: 8, risk: 'متوسط-عالٍ', min: '1,000 ريال', desc: 'قطاعات الطاقة (أرامكو) والبنوك من أكثر القطاعات استقراراً في السوق السعودي. توزيعات أرامكو 7.3%', pros: 'توزيعات أرباح منتظمة، قطاع محمي حكومياً', cons: 'يحتاج دراسة ومتابعة، تركيز في قطاع واحد', best_for: 'من يفهم الأسواق ويريد توزيعات منتظمة', action: 'ابدأ بـ1000 ريال في أسهم موزعة للأرباح' },
        { name: 'عقار للإيجار', return_pct: 6.5, risk: 'منخفض-متوسط', min: '200,000 ريال', desc: 'أسعار الرياض تراجعت 17% في 2025-2026 مما يخلق فرصة للشراء. الإيجار مثبّت 5 سنوات في الرياض', pros: 'دخل إيجاري ثابت، أصل حقيقي، مضخة للتضخم', cons: 'رأس مال كبير، سيولة منخفضة، صيانة وإدارة', best_for: 'من يملك رأس مال كافٍ ويريد دخلاً ثابتاً', action: 'ابحث في حراج ومواقع العقار عن فرص المرحلة الحالية' },
        { name: 'صناديق ريت (عقار بدون شراء)', return_pct: 7, risk: 'متوسط', min: '1,000 ريال', desc: 'تستثمر في العقارات التجارية والسكنية دون شراء مباشر. متوفرة على تداول كالأسهم', pros: 'توزيعات فصلية، سيولة كالأسهم، تنويع جغرافي', cons: 'تأثر بأسعار الفائدة، يحتاج اختيار صندوق مناسب', best_for: 'من يريد الاستفادة من العقار بمبلغ صغير', action: 'ابحث عن REITs المدرجة على تداول وراجع توزيعاتها' },
      ],
      saudi_advantages: [
        { icon: '🚫', title: 'لا ضريبة دخل شخصية', desc: 'ما تدفع ضريبة على راتبك ولا أرباحك — ميزة ضخمة مقارنة بمعظم دول العالم', value: `${formatNumber(Math.round(d.salary * 0.2 * 12))} ريال/سنة توفرها` },
        { icon: '📈', title: 'تضخم منخفض 1.6%', desc: 'مقارنة بالعالم، التضخم السعودي منخفض — فلوسك تحتفظ بقيمتها أكثر', value: 'عائد 4%+ يتفوق على التضخم' },
        { icon: '🏛️', title: 'صندوق التنمية الوطنية', desc: 'قروض مدعومة للمساكن والمشاريع بأسعار فائدة أقل من السوق بكثير', value: 'وفر فوائد بآلاف الريالات' },
        { icon: '🌍', title: 'اقتصاد نمو 4.6% (2025)', desc: 'الاقتصاد السعودي ينمو بأحد أعلى المعدلات إقليمياً — فرص أكثر للاستثمار', value: 'بيئة مواتية لتنمية الثروة' },
      ],
      common_mistakes: [
        { mistake: 'رفع مستوى المعيشة مع كل زيادة', pct: 73, fix: '"معدل تضخم نمط الحياة" — كل 1000 ريال زيادة، 700 منها تروح على مصاريف أعلى. الحل: الزيادة الأولى تروح للادخار كاملاً' },
        { mistake: 'فلوس في الحساب الجاري (0% عائد)', pct: 68, fix: `عندك ${formatNumber(d.netWorth)} ريال في البنك؟ حوّل ${formatNumber(Math.round(d.netWorth * 0.7))} منها لحساب ادخار = ${formatNumber(Math.round(d.netWorth * 0.7 * 0.04 / 12))} ريال إضافي كل شهر` },
        { mistake: 'مصدر دخل واحد = خطر واحد', pct: 61, fix: 'الشخص الذي دخله من مصدرين أو أكثر يصل للمليون بشكل أسرع بـ40% في المتوسط' },
        { mistake: 'لا خطة مالية مكتوبة', pct: 85, fix: 'الأشخاص الذين يكتبون أهدافهم المالية أكثر احتمالاً لتحقيقها بـ42%. هذا التقرير خطوتك الأولى' },
        { mistake: 'تأجيل الاستثمار لـ"لما الوضع يستقر"', pct: 79, fix: `لو بدأت تستثمر ${formatNumber(d.monthlySaving)} ريال/شهر قبل 5 سنوات بعائد 7% — كنت الآن عندك ${formatNumber(Math.round(d.monthlySaving * 60 * Math.pow(1.07, 5) / 5))} ريال إضافي` },
      ],
      age_comparison: [
        { age: '20-25', typical: '500-2,000 ريال/شهر', yours: d.monthlySaving >= 2000 ? 'أعلى من المتوسط ⭐' : 'ضمن المعدل' },
        { age: '25-30', typical: '2,000-4,000 ريال/شهر', yours: d.monthlySaving >= 4000 ? 'أعلى من المتوسط ⭐' : 'ضمن المعدل' },
        { age: '30-40', typical: '3,000-6,000 ريال/شهر', yours: d.monthlySaving >= 6000 ? 'أعلى من المتوسط ⭐' : 'ضمن المعدل' },
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
                أفكار زيادة الدخل — بأرقام السوق السعودي
              </h2>
              <p className="text-xs text-gray-400 mb-4 mr-10">اضغط على أي فكرة لتشوف التفاصيل والخطوات</p>
              <div className="space-y-2">
                {report.income_ideas.map((idea, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                    <button onClick={() => setOpenIdea(openIdea===i?null:i)}
                      className="w-full flex justify-between items-center p-4 text-right hover:bg-gray-50 transition-all">
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{color:'#0d1b3e'}}>{idea.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(184,134,11,0.1)', color:'#B8860B'}}>{idea.potential}</span>
                          <DiffBadge difficulty={idea.difficulty} />
                        </div>
                      </div>
                      <span className="text-gray-400 mr-3 text-lg">{openIdea===i?'−':'+'}</span>
                    </button>
                    {openIdea===i && (
                      <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                        <div className="p-3 rounded-xl" style={{background:'#f8fbff', border:'1px solid #e8f0fb'}}>
                          <p className="text-xs font-bold mb-2" style={{color:'#3b82f6'}}>📊 نظرة على السوق</p>
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{idea.description}</p>
                        </div>
                        <div className="p-3 rounded-xl"
                          style={{background:'rgba(26,158,107,0.06)', border:'1px solid rgba(26,158,107,0.2)'}}>
                          <p className="text-xs font-bold mb-2" style={{color:'#1a9e6b'}}>⚡ خطوات البدء</p>
                          <div className="space-y-1.5">
                            {idea.how_to_start.split('\n').map((step: string, si: number) => (
                              <div key={si} className="flex gap-2 text-sm text-gray-700">
                                <span className="flex-shrink-0">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-1 p-3 rounded-xl text-center" style={{background:'rgba(184,134,11,0.06)', border:'1px solid rgba(184,134,11,0.15)'}}>
                            <p className="text-xs text-gray-400">الدخل المتوقع</p>
                            <p className="text-sm font-extrabold" style={{color:'#B8860B'}}>{idea.potential}</p>
                          </div>
                          <div className="flex-1 p-3 rounded-xl text-center" style={{background:'rgba(26,158,107,0.06)', border:'1px solid rgba(26,158,107,0.15)'}}>
                            <p className="text-xs text-gray-400">الصعوبة</p>
                            <p className="text-sm font-extrabold" style={{color:'#1a9e6b'}}>{idea.difficulty}</p>
                          </div>
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

            {/* MONEY PERSONALITY — شخصيتك المالية */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#ec4899'}}>🪞</span>
                شخصيتك المالية
              </h2>
              {(report as any).money_personality && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl text-center" style={{background:'rgba(236,72,153,0.06)', border:'1.5px solid rgba(236,72,153,0.2)'}}>
                    <div className="text-3xl mb-2">{(report as any).money_personality.type.split(' ').pop()}</div>
                    <div className="text-xl font-extrabold mb-1" style={{color:'#0d1b3e'}}>{(report as any).money_personality.type}</div>
                    <p className="text-sm text-gray-500">{(report as any).money_personality.desc}</p>
                  </div>
                  <div className="p-4 rounded-2xl" style={{background:'rgba(26,158,107,0.06)', border:'1px solid rgba(26,158,107,0.2)'}}>
                    <p className="text-sm font-bold mb-1" style={{color:'#1a9e6b'}}>💡 نصيحة مخصصة لك</p>
                    <p className="text-sm text-gray-600">{(report as any).money_personality.advice}</p>
                  </div>
                </div>
              )}
            </div>

            {/* EXPENSE ANALYSIS — تحليل مصاريفك */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#ef4444'}}>📊</span>
                تحليل مصاريفك — وين تروح فلوسك؟
              </h2>
              <p className="text-xs text-gray-400 mb-4">تقدير بناءً على متوسطات الإنفاق في السعودية</p>
              <div className="space-y-3">
                {((report as any).expense_analysis || []).map((exp: any, i: number) => (
                  <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{['🏠','🍽️','🚗','🎬','📦'][i]}</span>
                        <div>
                          <p className="text-sm font-bold" style={{color:'#0d1b3e'}}>{exp.category}</p>
                          <p className="text-xs text-gray-400">{exp.pct}% من مصاريفك</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-sm" style={{color:'#ef4444'}}>~{exp.amount.toLocaleString('ar-SA')} ر</span>
                    </div>
                    <div className="px-4 pb-3">
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden mb-2">
                        <div className="h-full rounded-full" style={{width:`${exp.pct}%`, background: i===0?'#ef4444':i===1?'#f97316':i===2?'#f59e0b':i===3?'#8b5cf6':'#6b7280'}} />
                      </div>
                      <p className="text-xs" style={{color:'#1a9e6b'}}>💡 {exp.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-2xl text-center" style={{background:'rgba(26,158,107,0.06)', border:'1px solid rgba(26,158,107,0.2)'}}>
                <p className="text-sm font-bold" style={{color:'#1a9e6b'}}>
                  💡 لو وفّرت 10% فقط من مصاريفك = {formatNumber(Math.round(data.expenses * 0.1))} ريال/شهر إضافي
                </p>
              </div>
            </div>

            {/* DAILY COST — تكلفة المليون يومياً */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#0ea5e9'}}>☕</span>
                المليون بلغة يومية
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 rounded-2xl text-center" style={{background:'rgba(14,165,233,0.06)', border:'1px solid rgba(14,165,233,0.2)'}}>
                  <p className="text-xs text-gray-400 mb-1">تكلفة المليون يومياً</p>
                  <p className="text-2xl font-extrabold" style={{color:'#0ea5e9'}}>{(report as any).daily_cost || Math.round((1000000-data.netWorth)/data.totalMonths/30)} ر</p>
                  <p className="text-xs text-gray-400 mt-1">فقط!</p>
                </div>
                <div className="p-4 rounded-2xl text-center" style={{background:'rgba(184,134,11,0.06)', border:'1px solid rgba(184,134,11,0.2)'}}>
                  <p className="text-xs text-gray-400 mb-1">ادخارك الشهري يعادل</p>
                  <p className="text-2xl font-extrabold" style={{color:'#B8860B'}}>{(report as any).coffee_equivalent || Math.round(data.monthlySaving/18)} ☕</p>
                  <p className="text-xs text-gray-400 mt-1">كوب قهوة</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                لو كل يوم حطيت <span className="font-bold" style={{color:'#0ea5e9'}}>{(report as any).daily_cost || Math.round((1000000-data.netWorth)/data.totalMonths/30)} ريال</span> في صندوق — بتوصل للمليون. هذا أقل من وجبة غداء.
              </p>
            </div>

            {/* MILESTONES — محطات رحلتك */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#10b981'}}>🚩</span>
                محطات رحلتك للمليون
              </h2>
              <div className="relative">
                <div className="absolute right-4 top-0 bottom-0 w-0.5" style={{background:'rgba(16,185,129,0.2)'}} />
                <div className="space-y-4 pr-10">
                  {((report as any).yearly_milestones || []).map((m: any, i: number) => {
                    const pct = Math.min(100, Math.round(m.amount / 1000000 * 100))
                    const isMillionaire = m.amount >= 1000000
                    return (
                      <div key={i} className="relative">
                        <div className="absolute -right-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{background: isMillionaire ? '#B8860B' : '#10b981'}}>
                          {isMillionaire ? '🏆' : m.year}
                        </div>
                        <div className="p-3 rounded-2xl" style={{background:isMillionaire?'rgba(184,134,11,0.06)':'#f8fbff', border:`1px solid ${isMillionaire?'rgba(184,134,11,0.2)':'#e8f0fb'}`}}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold" style={{color:'#0d1b3e'}}>بعد {m.year} {m.year === 1 ? 'سنة' : 'سنوات'}</span>
                            <span className="text-sm font-extrabold" style={{color:isMillionaire?'#B8860B':'#10b981'}}>{formatNumber(m.amount)} ر</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{width:`${pct}%`, background: isMillionaire?'#B8860B':'#10b981'}} />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{pct}% من هدف المليون</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* EMERGENCY FUND — صندوق الطوارئ */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#f59e0b'}}>🛡️</span>
                صندوق الطوارئ — هل أنت محمي؟
              </h2>
              {(report as any).emergency_fund && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl text-center" style={{background:'#f8fbff', border:'1px solid #e8f0fb'}}>
                      <p className="text-xs text-gray-400 mb-1">عندك الآن</p>
                      <p className="text-lg font-extrabold" style={{color:'#0d1b3e'}}>{formatNumber((report as any).emergency_fund.current)} ر</p>
                    </div>
                    <div className="p-4 rounded-2xl text-center" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)'}}>
                      <p className="text-xs text-gray-400 mb-1">تحتاج (6 أشهر مصاريف)</p>
                      <p className="text-lg font-extrabold" style={{color:'#f59e0b'}}>{formatNumber((report as any).emergency_fund.needed)} ر</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl text-center" style={{
                    background: (report as any).emergency_fund.current >= (report as any).emergency_fund.needed ? 'rgba(26,158,107,0.06)' : 'rgba(245,158,11,0.06)',
                    border: `1px solid ${(report as any).emergency_fund.current >= (report as any).emergency_fund.needed ? 'rgba(26,158,107,0.2)' : 'rgba(245,158,11,0.2)'}`}}>
                    <p className="text-sm font-bold" style={{color: (report as any).emergency_fund.current >= (report as any).emergency_fund.needed ? '#1a9e6b' : '#f59e0b'}}>
                      {(report as any).emergency_fund.status}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    قاعدة: احتفظ بمصاريف 6 أشهر في حساب منفصل قبل أي استثمار
                  </p>
                </div>
              )}
            </div>

            {/* RISK ANALYSIS — تحليل المخاطر */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#dc2626'}}>⚠️</span>
                المخاطر المالية وكيف تحمي نفسك
              </h2>
              <div className="space-y-3">
                {((report as any).risk_analysis || []).map((risk: any, i: number) => (
                  <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3" style={{background:'rgba(220,38,38,0.04)'}}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{['💼','🏥','📉'][i]}</span>
                        <span className="text-sm font-bold" style={{color:'#0d1b3e'}}>{risk.risk}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{background: risk.impact === 'عالي' ? 'rgba(220,38,38,0.1)' : 'rgba(245,158,11,0.1)',
                          color: risk.impact === 'عالي' ? '#dc2626' : '#f59e0b'}}>
                        {risk.impact}
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-bold" style={{color:'#1a9e6b'}}>🛡️ الحل: </span>{risk.mitigation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COMPOUND EFFECT — قوة الوقت */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#7c3aed'}}>⏳</span>
                قوة الوقت — كيف فلوسك تنمو
              </h2>
              {(report as any).compound_effect && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    لو بدأت اليوم بادخار {formatNumber(data.monthlySaving)} ريال/شهر:
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {label: 'بعد سنة', amount: (report as any).compound_effect.year1},
                      {label: 'بعد 5 سنوات', amount: (report as any).compound_effect.year5},
                      {label: 'بعد 10 سنوات', amount: (report as any).compound_effect.year10},
                    ].map((p, i) => (
                      <div key={i} className="p-3 rounded-2xl text-center"
                        style={{background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.15)'}}>
                        <p className="text-xs text-gray-400 mb-1">{p.label}</p>
                        <p className="text-base font-extrabold" style={{color:'#7c3aed'}}>{formatNumber(p.amount)}</p>
                        <p className="text-xs text-gray-400">ريال</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    {data.rate > 0 ? `بعائد ${data.rate}% سنوياً — كل سنة إضافية تسرع النمو` : 'بدون استثمار — مع الاستثمار الأرقام تتضاعف'}
                  </p>
                </div>
              )}
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

            {/* INVESTMENT ROADMAP — خارطة الاستثمار */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-1 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#059669'}}>💹</span>
                خارطة الاستثمار في السعودية 2026
              </h2>
              <p className="text-xs text-gray-400 mb-4 mr-10">مرتبة من الأقل مخاطرة للأعلى — اختر حسب وضعك</p>
              {(report as any).investment_options && (
                <div className="space-y-2">
                  {((report as any).investment_options as any[]).map((inv: any, i: number) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                      <button onClick={() => setOpenIdea(openIdea === (100+i) ? null : (100+i))}
                        className="w-full flex justify-between items-center p-4 text-right hover:bg-gray-50 transition-all">
                        <div className="flex-1">
                          <p className="text-sm font-bold" style={{color:'#0d1b3e'}}>{inv.name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(5,150,105,0.1)', color:'#059669'}}>
                              عائد {inv.return_pct}% سنوياً
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'rgba(107,114,128,0.1)', color:'#6b7280'}}>
                              مخاطرة: {inv.risk}
                            </span>
                            <span className="text-xs text-gray-400">من {inv.min}</span>
                          </div>
                        </div>
                        <span className="text-gray-400 mr-3 text-lg">{openIdea===(100+i)?'−':'+'}</span>
                      </button>
                      {openIdea===(100+i) && (
                        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                          <p className="text-sm text-gray-600 leading-relaxed">{inv.desc}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl" style={{background:'rgba(26,158,107,0.06)', border:'1px solid rgba(26,158,107,0.2)'}}>
                              <p className="text-xs font-bold mb-1" style={{color:'#1a9e6b'}}>✅ المزايا</p>
                              <p className="text-xs text-gray-600">{inv.pros}</p>
                            </div>
                            <div className="p-3 rounded-xl" style={{background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.2)'}}>
                              <p className="text-xs font-bold mb-1" style={{color:'#f97316'}}>⚠️ العيوب</p>
                              <p className="text-xs text-gray-600">{inv.cons}</p>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl" style={{background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)'}}>
                            <p className="text-xs font-bold mb-1" style={{color:'#3b82f6'}}>👤 مناسب لـ</p>
                            <p className="text-xs text-gray-600">{inv.best_for}</p>
                          </div>
                          <div className="p-3 rounded-xl" style={{background:'rgba(5,150,105,0.06)', border:'1px solid rgba(5,150,105,0.2)'}}>
                            <p className="text-xs font-bold" style={{color:'#059669'}}>⚡ {inv.action}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="p-3 rounded-2xl text-center text-xs text-gray-500 mt-2"
                    style={{background:'#f8fbff', border:'1px solid #e8f0fb'}}>
                    💡 أفضل استراتيجية: ابدأ بصندوق الطوارئ ← ثم ادخار بنكي ← ثم استثمار تدريجي
                  </div>
                </div>
              )}
            </div>

            {/* SAUDI ADVANTAGES — ميزاتك كساكن في السعودية */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#16a34a'}}>🇸🇦</span>
                ميزاتك كساكن في السعودية
              </h2>
              {(report as any).saudi_advantages && (
                <div className="space-y-3">
                  {((report as any).saudi_advantages as any[]).map((adv: any, i: number) => (
                    <div key={i} className="flex gap-3 p-4 rounded-2xl"
                      style={{background:'rgba(22,163,74,0.05)', border:'1px solid rgba(22,163,74,0.15)'}}>
                      <span className="text-2xl flex-shrink-0">{adv.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{color:'#0d1b3e'}}>{adv.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{adv.desc}</p>
                        <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{background:'rgba(22,163,74,0.1)', color:'#16a34a'}}>
                          {adv.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COMMON MISTAKES — الأخطاء المالية الشائعة */}
            <div className={sectionStyle}>
              <h2 className="text-base font-extrabold mb-1 flex items-center gap-2" style={titleStyle}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{background:'#dc2626'}}>🚨</span>
                الأخطاء التي تؤخر وصولك للمليون
              </h2>
              <p className="text-xs text-gray-400 mb-4 mr-10">مبنية على دراسات السلوك المالي في السعودية</p>
              {(report as any).common_mistakes && (
                <div className="space-y-3">
                  {((report as any).common_mistakes as any[]).map((m: any, i: number) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                      <div className="p-4" style={{background:'rgba(220,38,38,0.04)'}}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold" style={{color:'#dc2626'}}>❌ {m.mistake}</p>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{background:'rgba(220,38,38,0.1)', color:'#dc2626'}}>
                            {m.pct}% يقعون فيه
                          </span>
                        </div>
                        <div className="p-3 rounded-xl" style={{background:'rgba(26,158,107,0.06)', border:'1px solid rgba(26,158,107,0.2)'}}>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            <span className="font-bold" style={{color:'#1a9e6b'}}>✅ الحل: </span>{m.fix}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
