export function calcMonthsToGoal(
  startWealth: number,
  monthlySaving: number,
  annualRate: number,
  goal: number
): number {
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

export function monthsToLabel(months: number): string {
  if (months >= 99999) return 'لن تصل بهذا الوضع'
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  const yearsWords: Record<number, string> = {
    1: 'سنة', 2: 'سنتين', 3: 'ثلاث سنوات', 4: 'أربع سنوات',
    5: 'خمس سنوات', 6: 'ست سنوات', 7: 'سبع سنوات', 8: 'ثماني سنوات',
    9: 'تسع سنوات', 10: 'عشر سنوات'
  }

  const monthsWords: Record<number, string> = {
    1: 'شهر', 2: 'شهرين', 3: 'ثلاثة أشهر', 4: 'أربعة أشهر',
    5: 'خمسة أشهر', 6: 'ستة أشهر', 7: 'سبعة أشهر', 8: 'ثمانية أشهر',
    9: 'تسعة أشهر', 10: 'عشرة أشهر', 11: 'أحد عشر شهراً'
  }

  const yearsLabel = yearsWords[years] || `${years} سنة`
  const monthsLabel = monthsWords[remainingMonths] || `${remainingMonths} شهراً`

  if (years === 0) return monthsLabel
  if (remainingMonths === 0) return yearsLabel
  return `${yearsLabel} و${monthsLabel}`
}

export function targetDate(months: number): string {
  if (months >= 99999) return ''
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

// ─── أقرب رافعة: من تنبؤ "ميت" إلى خطوة قابلة للتنفيذ ───────────────────────

export interface Lever {
  key: 'save' | 'income' | 'invest'
  label: string
  action: string
  months: number
  monthsSaved: number
}

function roundTo(n: number, step: number) {
  return Math.max(step, Math.round(n / step) * step)
}

// يحسب أثر كل حركة مالية واقعية على مدة الوصول، ويرتّبها من الأقوى للأضعف.
// كل الحسابات محلية (بدون أي طلب للسيرفر).
export function buildLevers(
  netWorth: number,
  monthlySaving: number,
  annualRate: number,
  totalMonths: number,
  goal = 1000000
): Lever[] {
  if (totalMonths <= 0 || totalMonths >= 99999 || monthlySaving <= 0) return []

  // زيادة الادخار ١٠٪ من الادخار الحالي (بحد أدنى ٢٠٠ ريال) — حركة صغيرة واقعية
  const extraSave = roundTo(Math.max(200, monthlySaving * 0.1), 50)
  const extraIncome = 1500
  const investRate = 10

  const candidates: Omit<Lever, 'monthsSaved'>[] = [
    {
      key: 'save',
      label: `لو زدت ادخارك ${formatNumber(extraSave)} ريال بالشهر`,
      action: `أول ما ينزل راتبك، حوّل ${formatNumber(extraSave)} ريال لحساب ثاني على طول — قبل لا تصرف منه ريال.`,
      months: calcMonthsToGoal(netWorth, monthlySaving + extraSave, annualRate, goal),
    },
    {
      key: 'income',
      label: `لو جبت دخل إضافي ${formatNumber(extraIncome)} ريال بالشهر`,
      action: 'اكتب ٣ أشياء تعرف تسويها (تصميم، تدريس، توصيل، استشارات) واعرض وحدة منها على شخص واحد هالأسبوع.',
      months: calcMonthsToGoal(netWorth, monthlySaving + extraIncome, annualRate, goal),
    },
  ]

  if (annualRate < investRate) {
    candidates.push({
      key: 'invest',
      label: `لو استثمرت فلوسك بعائد ${investRate}٪ بدل ${annualRate}٪`,
      action: 'افتح محفظة استثمارية رسومها قليلة (صندوق مؤشرات أو صكوك) وحط فيها أول مبلغ هالأسبوع.',
      months: calcMonthsToGoal(netWorth, monthlySaving, investRate, goal),
    })
  }

  return candidates
    .map((c) => ({ ...c, monthsSaved: totalMonths - c.months }))
    .filter((c) => c.monthsSaved > 0)
    .sort((a, b) => b.monthsSaved - a.monthsSaved)
}

// صياغة باللهجة للمدة اللي توفّرها الحركة: "سنتين وأربع شهور"
export function monthsSavedLabel(months: number): string {
  const years = Math.floor(months / 12)
  const rem = months % 12
  const m: Record<number, string> = {
    1: 'شهر', 2: 'شهرين', 3: 'ثلاث شهور', 4: 'أربع شهور', 5: 'خمس شهور', 6: 'ست شهور',
    7: 'سبع شهور', 8: 'ثمان شهور', 9: 'تسع شهور', 10: 'عشر شهور', 11: 'إحدعش شهر',
  }
  const y: Record<number, string> = {
    1: 'سنة', 2: 'سنتين', 3: 'ثلاث سنين', 4: 'أربع سنين', 5: 'خمس سنين', 6: 'ست سنين',
    7: 'سبع سنين', 8: 'ثمان سنين', 9: 'تسع سنين', 10: 'عشر سنين',
  }
  const yw = (n: number) => y[n] || `${n} سنة`
  if (years === 0) return m[rem]
  if (rem === 0) return yw(years)
  return `${yw(years)} و${m[rem]}`
}

export function buildChartData(
  startWealth: number,
  monthlySaving: number,
  annualRate: number,
  totalMonths: number
) {
  const monthlyRate = annualRate / 100 / 12
  const capMonths = Math.min(totalMonths + 12, 600)
  const step = Math.max(1, Math.floor(capMonths / 24))

  const labels: string[] = []
  const data: number[] = []

  let wealth = startWealth
  for (let m = 0; m <= capMonths; m += step) {
    labels.push(`${Math.floor(m / 12)}س`)
    data.push(Math.round(wealth))
    for (let i = 0; i < step; i++) {
      wealth = wealth * (1 + monthlyRate) + monthlySaving
    }
  }

  return { labels, data }
}

// ─── أدوات العرض للتصميم الجديد ───────────────────────────────────────────

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

// "سبتمبر 2034" — شهر وسنة الوصول
export function arrivalMonthYear(months: number, from: Date = new Date()): { month: string; year: number } | null {
  if (months >= 99999) return null
  const d = new Date(from)
  d.setMonth(d.getMonth() + months)
  return { month: AR_MONTHS[d.getMonth()], year: d.getFullYear() }
}

export interface ProjectionPoint {
  m: number // الشهر
  compound: number // الثروة مع العائد المركب
  plain: number // الثروة بالادخار فقط (بدون عائد)
}

// مسار نمو الثروة للرسم البياني — عيّنات خفيفة (حوالي ٤٠ نقطة)
export function buildProjection(
  startWealth: number,
  monthlySaving: number,
  annualRate: number,
  totalMonths: number,
  samples = 40
): ProjectionPoint[] {
  const horizon = Math.max(12, Math.min(totalMonths >= 99999 ? 600 : totalMonths, 600))
  const r = annualRate / 100 / 12
  const step = Math.max(1, Math.round(horizon / samples))
  const pts: ProjectionPoint[] = []
  let w = startWealth
  for (let m = 0; m <= horizon; m++) {
    if (m % step === 0 || m === horizon) {
      pts.push({ m, compound: Math.round(w), plain: Math.round(startWealth + monthlySaving * m) })
    }
    w = w * (1 + r) + monthlySaving
  }
  return pts
}

// كم من المليون من جيبك وكم من العائد المركب
export function contributionSplit(startWealth: number, monthlySaving: number, totalMonths: number, goal = 1000000) {
  if (totalMonths >= 99999) return { contributions: 0, gains: 0, contribPct: 0, gainsPct: 0 }
  const contributions = Math.min(goal, Math.round(startWealth + monthlySaving * totalMonths))
  const gains = Math.max(0, goal - contributions)
  const contribPct = Math.round((contributions / goal) * 1000) / 10
  return { contributions, gains, contribPct, gainsPct: Math.round((100 - contribPct) * 10) / 10 }
}

// متوسط الوصول اللي يعرضه الموقع (١٤ سنة)
export const AVERAGE_MONTHS = 14 * 12
