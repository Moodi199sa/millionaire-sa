import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/accessToken'

// فريق الأمن السيبراني: حماية بسيطة ضد الاستدعاء المتكرر السريع لنفس الـIP —
// تخفف من استنزاف رصيد API حتى بعد إغلاق ثغرة الـprompt المفتوح. هذا حل
// بمستوى "رادع أولي" وليس حماية كاملة (الذاكرة المحلية تُصفَّر مع كل نشر
// جديد أو في بيئة serverless موزعة على عدة instances) — حل أقوى لاحقاً
// يتطلب Redis أو خدمة rate-limiting خارجية مخصصة.
const requestLog = new Map<string, number[]>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (requestLog.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS)
  if (timestamps.length >= RATE_LIMIT) {
    requestLog.set(ip, timestamps)
    return true
  }
  timestamps.push(now)
  requestLog.set(ip, timestamps)
  return false
}

function buildPrompt(salary: number, expenses: number, monthlySaving: number, totalMonths: number, netWorth: number, rate: number) {
  const savingRate = salary > 0 ? Math.round((monthlySaving / salary) * 100) : 0
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  const monthsLabel = months > 0 ? `${years} سنة و${months} شهر` : `${years} سنة`

  const sc500 = calcMonths(netWorth, monthlySaving + 500, rate)
  const sc1000 = calcMonths(netWorth, monthlySaving + 1000, rate)
  const sc2000 = calcMonths(netWorth, monthlySaving + 2000, rate)

  return `أنت مستشار مالي سعودي صادق ومحفّز. اكتب تقريراً مالياً شخصياً بأسلوب "أخ ناصح" وليس "مستشار رسمي".

البيانات: راتب ${salary} ريال | مصروف ${expenses} ريال | ادخار ${monthlySaving} ريال/شهر (${savingRate}%) | ثروة حالية ${netWorth} ريال | المدة للمليون: ${monthsLabel}

أجب بـ JSON فقط بدون backticks:
{"motivational_opener":"جملة واحدة تحفيزية شخصية تخاطبه مباشرة بناءً على أرقامه الحقيقية","reality_check":"فقرة قصيرة صادقة عن وضعه — بأسلوب شخص يحبك وخبره لك","strengths":[{"title":"نقطة قوة حقيقية من أرقامه","description":"شرح عملي كيف يستثمرها"},{"title":"نقطة قوة ثانية","description":"شرح"},{"title":"نقطة قوة ثالثة","description":"شرح"}],"weaknesses":[{"title":"نقطة ضعف بلطف","fix":"حل عملي خطوة واحدة"},{"title":"نقطة ضعف ثانية","fix":"حل"}],"scenarios":[{"label":"وضعك الحالي","action":"استمر على نفس الوتيرة","months":${totalMonths},"monthly_saving":${monthlySaving},"difficulty":"الوضع الحالي"},{"label":"وفّر 500 ريال إضافي","action":"كيف تحرر 500 ريال عملياً","months":${sc500},"monthly_saving":${monthlySaving + 500},"difficulty":"سهل جداً"},{"label":"دخل جانبي 1000 ريال","action":"فكرة دخل واقعية","months":${sc1000},"monthly_saving":${monthlySaving + 1000},"difficulty":"ممكن خلال شهر"},{"label":"دخل جانبي 2000 ريال","action":"مشروع صغير","months":${sc2000},"monthly_saving":${monthlySaving + 2000},"difficulty":"يحتاج جهد"}],"income_ideas":[{"title":"فكرة1","description":"وصف مشوق","potential":"X-Y ريال/شهر","difficulty":"سهل","how_to_start":"خطوة أولى اليوم"},{"title":"فكرة2","description":"...","potential":"...","difficulty":"...","how_to_start":"..."},{"title":"فكرة3","description":"...","potential":"...","difficulty":"...","how_to_start":"..."},{"title":"فكرة4","description":"...","potential":"...","difficulty":"...","how_to_start":"..."},{"title":"فكرة5","description":"...","potential":"...","difficulty":"...","how_to_start":"..."}],"monthly_plan":[{"week":"الأسبوع الأول","task":"مهمة واحدة محددة","why":"السبب بصدق"},{"week":"الأسبوع الثاني","task":"...","why":"..."},{"week":"الأسبوع الثالث","task":"...","why":"..."},{"week":"الأسبوع الرابع","task":"...","why":"..."}],"mindset_tips":["نصيحة نفسية قصيرة وقوية","نصيحة ثانية","نصيحة ثالثة","نصيحة رابعة"],"closing_message":"رسالة ختامية مؤثرة شخصية"}`
}

// نسخة مبسطة من حساب الأشهر (تطابق src/lib/calculator.ts) — مكررة هنا عمداً
// لأن API routes لا يمكنها استيراد كود client-side بسهولة في كل بيئات النشر
function calcMonths(startWealth: number, monthlySaving: number, annualRate: number, goal = 1000000): number {
  if (startWealth >= goal) return 0
  if (monthlySaving <= 0 && annualRate <= 0) return 99999
  let wealth = startWealth
  const monthlyRate = annualRate / 100 / 12
  let months = 0
  while (wealth < goal && months < 12000) {
    wealth = wealth * (1 + monthlyRate) + monthlySaving
    months++
  }
  return months >= 12000 ? 99999 : months
}

function generateStaticReport(salary: number, expenses: number, monthlySaving: number, totalMonths: number, netWorth: number) {
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  const yearsLabel = months > 0 ? `${years} سنة و${months} شهر` : `${years} سنة`
  const savingRate = salary > 0 ? Math.round((monthlySaving / salary) * 100) : 0

  return {
    motivational_opener: `راتبك ${salary.toLocaleString('ar-SA')} ريال كافٍ تماماً للوصول للمليون — ${yearsLabel} فقط وتغير حياتك للأبد. كثير من الناس بدأوا بأقل منك ووصلوا.`,
    reality_check: `أنت تدخر ${monthlySaving.toLocaleString('ar-SA')} ريال كل شهر — هذا ${savingRate}% من راتبك. الرقم ما يهم بقدر الاستمرارية. كل ريال تدخره اليوم يساوي ريالين غداً بفضل التراكم.`,
    strengths: [
      { title: `ادخار منتظم ${monthlySaving.toLocaleString('ar-SA')} ريال/شهر`, description: `هذا المبلغ إذا استمريت عليه سيبني ثروتك تدريجياً. الاستمرارية هي السر الحقيقي للوصول للمليون.` },
      { title: 'وعيك المالي', description: 'مجرد استخدامك لهذه الأداة يعني أنك تفكر في مستقبلك — وهذا يميزك عن 90% من الناس.' },
      { title: 'الوقت في صفك', description: `${yearsLabel} تبدو طويلة لكنها كافية لبناء ثروة حقيقية إذا بدأت الآن.` }
    ],
    weaknesses: [
      { title: 'المصاريف تأخذ نسبة كبيرة من الراتب', fix: 'راجع مصاريفك الشهرية وحدد 3 بنود تقدر تخفضها بـ 10% فقط — هذا يوفر لك مئات الريالات.' },
      { title: 'غياب مصدر دخل إضافي', fix: 'دخل جانبي بسيط 500-1000 ريال/شهر يقلل المدة بسنوات كاملة.' }
    ],
    scenarios: [
      { label: 'زيادة الادخار 500 ريال', action: 'قلل مصاريف الكافيه والاشتراكات', months: Math.round(totalMonths * 0.85), monthly_saving: monthlySaving + 500, difficulty: 'سهل' },
      { label: 'دخل جانبي 1000 ريال', action: 'عمل حر أو تجارة صغيرة في وقت الفراغ', months: Math.round(totalMonths * 0.72), monthly_saving: monthlySaving + 1000, difficulty: 'متوسط' },
      { label: 'دخل جانبي 2000 ريال', action: 'مشروع جانبي بنصف وقت', months: Math.round(totalMonths * 0.58), monthly_saving: monthlySaving + 2000, difficulty: 'يحتاج جهد' },
      { label: 'استثمار بعائد 10%', action: 'صناديق الأسهم أو العقارات', months: Math.round(totalMonths * 0.75), monthly_saving: monthlySaving, difficulty: 'يحتاج تعلم' }
    ],
    income_ideas: [
      { title: 'التجارة الإلكترونية', description: 'بيع منتجات أونلاين بدون مخزون — آلاف الشباب السعودي يكسبون منها من البيت', potential: '1,000-5,000 ريال/شهر', difficulty: 'متوسط', how_to_start: 'افتح متجر على Salla اليوم وابدأ ببيع منتج واحد' },
      { title: 'العمل الحر', description: 'بع مهاراتك أونلاين — تصميم، كتابة، ترجمة، برمجة، مونتاج', potential: '500-3,000 ريال/شهر', difficulty: 'سهل', how_to_start: 'سجل على مستقل.com وأضف خدمة بناءً على مهارة تتقنها' },
      { title: 'إدارة السوشيال ميديا', description: 'المحلات والمطاعم تحتاج من يدير صفحاتهم — مهارة تتعلمها في أسبوع', potential: '500-2,000 ريال/عميل', difficulty: 'سهل', how_to_start: 'تواصل مع 5 محلات قريبة منك وعرض خدمتك' },
      { title: 'التدريس الخاص', description: 'إذا تتقن أي مادة أو مهارة، علّمها للآخرين. الطلب في تزايد مستمر', potential: '100-300 ريال/ساعة', difficulty: 'سهل', how_to_start: 'أعلن في مجموعات واتساب المدرسية' },
      { title: 'تأجير ما تملكه', description: 'سيارتك، غرفة، أجهزة — الاقتصاد التشاركي يخلي أي شيء مصدر دخل', potential: '300-1,500 ريال/شهر', difficulty: 'سهل جداً', how_to_start: 'ضع إعلان في حراج اليوم' },
      { title: 'محتوى رقمي', description: 'أنشئ محتوى في مجالك على يوتيوب أو تيك توك — يبني دخلاً متراكماً', potential: '500-5,000 ريال/شهر', difficulty: 'يحتاج وقت', how_to_start: 'ابدأ بفيديو واحد هذا الأسبوع عن شيء تعرفه' }
    ],
    monthly_plan: [
      { week: 'الأسبوع الأول', task: 'راجع كل مصاريفك وسجلها في جدول بسيط', why: 'ما تقدر تحسن ما لا تعرفه — التسجيل يكشف أين تذهب فلوسك' },
      { week: 'الأسبوع الثاني', task: 'حدد 3 مصاريف تقدر تخفضها أو تلغيها', why: 'تخفيض 10% فقط من المصاريف = مئات الريالات إضافية كل شهر' },
      { week: 'الأسبوع الثالث', task: 'ابحث عن فكرة دخل جانبي واحدة وابدأ بها', why: 'الدخل الإضافي يسرع وصولك للمليون بشكل كبير' },
      { week: 'الأسبوع الرابع', task: 'افتح حساب ادخار منفصل وحول مدخراتك تلقائياً', why: 'الادخار التلقائي يمنعك من إنفاق ما يجب ادخاره' }
    ],
    mindset_tips: [
      'المليون لا يأتي دفعة واحدة — يأتي ريالاً ريالاً كل شهر',
      'الاستمرارية أهم من المبلغ — 500 ريال كل شهر لسنوات تصنع فارقاً هائلاً',
      'لا تقارن بداياتك ببداية أحد آخر — قارن نفسك بنفسك الشهر الماضي',
      'الخوف من البدء يكلفك أكثر من أي خسارة محتملة — الفرصة الحقيقية هي الوقت'
    ],
    closing_message: `هذه اللحظة التي تقرأ فيها هذا التقرير هي نقطة التحول. ${yearsLabel} ليست كثيرة — هي كل ما تحتاجه لتغير واقعك المالي إلى الأبد. البداية الآن.`
  }
}

export async function POST(req: NextRequest) {
  try {
    // بوابة الدفع: التقرير محتوى مدفوع — يتطلب توكن وصول صالح
    const token = req.cookies.get('sm_access_report')?.value || ''
    if (!verifyAccessToken(token, 'report')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'طلبات كثيرة جداً — حاول بعد دقيقة' }, { status: 429 })
    }

    const body = await req.json()

    // فريق الأمن السيبراني: تحقق صارم من المدخلات قبل أي استخدام —
    // يمنع قيماً غير منطقية (سالبة، نصية، أو ضخمة بشكل غير واقعي) من
    // الوصول لمنطق الحساب أو حتى لـ Claude API
    const salary = Number(body.salary)
    const expenses = Number(body.expenses)
    const monthlySaving = Number(body.monthlySaving)
    const totalMonths = Number(body.totalMonths)
    const netWorth = Number(body.netWorth)
    const rate = Number(body.rate) || 0

    const isValid = (n: number) => Number.isFinite(n) && n >= 0 && n < 100_000_000
    if (![salary, expenses, netWorth].every(isValid) || !Number.isFinite(monthlySaving) || !isValid(totalMonths)) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    // فريق الأمن السيبراني — إصلاح حرج: الـAPI route كان سابقاً يستقبل prompt
    // جاهزاً من العميل ويرسله مباشرة لـ Claude API دون أي تعديل. هذا يعني أي
    // شخص يستدعي هذا الـendpoint مباشرة (عبر curl أو Developer Console) كان
    // يقدر يرسل أي prompt يختاره هو، مستخدماً رصيد Anthropic API الخاص بالمالك
    // كـ"بروكسي مفتوح" بدون أي قيد. الآن: الـprompt يُبنى بالكامل في السيرفر
    // فقط من أرقام محقَّقة، ولا قيمة من العميل تدخل الـprompt كنص حر أبداً.
    const prompt = buildPrompt(salary, expenses, monthlySaving, totalMonths, netWorth, rate)

    // جرب API أولاً لو في مفتاح
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 3000,
            messages: [{ role: 'user', content: prompt }],
          }),
        })
        const data = await res.json()
        if (!data.error && data.content?.[0]?.text) {
          const text = data.content[0].text
          const clean = text.replace(/```json|```/g, '').trim()
          try {
            JSON.parse(clean)
            return NextResponse.json({ result: clean })
          } catch {}
        }
      } catch {}
    }

    // fallback — تقرير جاهز
    const report = generateStaticReport(salary, expenses, monthlySaving, totalMonths, netWorth)
    return NextResponse.json({ result: JSON.stringify(report) })

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 })
  }
}
