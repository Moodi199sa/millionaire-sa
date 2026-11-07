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
  return Math.round(n).toLocaleString('ar-SA')
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
      label: `ادخر ${formatNumber(extraSave)} ريال زيادة كل شهر`,
      action: `حوّل ${formatNumber(extraSave)} ريال تلقائياً يوم نزول الراتب لحساب منفصل — قبل ما تصرف أي شي.`,
      months: calcMonthsToGoal(netWorth, monthlySaving + extraSave, annualRate, goal),
    },
    {
      key: 'income',
      label: `دخل إضافي ${formatNumber(extraIncome)} ريال شهرياً`,
      action: 'اكتب ٣ مهارات تقدر تبيعها (تصميم، تدريس، توصيل، استشارة) واعرض وحدة منها على شخص واحد هذا الأسبوع.',
      months: calcMonthsToGoal(netWorth, monthlySaving + extraIncome, annualRate, goal),
    },
  ]

  if (annualRate < investRate) {
    candidates.push({
      key: 'invest',
      label: `استثمر ادخارك بعائد ${investRate}٪ بدل ${annualRate}٪`,
      action: 'افتح محفظة استثمارية منخفضة التكلفة (صندوق مؤشرات أو صكوك) وحوّل لها أول دفعة هذا الأسبوع.',
      months: calcMonthsToGoal(netWorth, monthlySaving, investRate, goal),
    })
  }

  return candidates
    .map((c) => ({ ...c, monthsSaved: totalMonths - c.months }))
    .filter((c) => c.monthsSaved > 0)
    .sort((a, b) => b.monthsSaved - a.monthsSaved)
}

// "٣ سنوات و٤ أشهر" — صياغة قصيرة للمدة اللي توفّرها الرافعة
export function monthsSavedLabel(months: number): string {
  const years = Math.floor(months / 12)
  const rem = months % 12
  const monthsWord = (m: number) => (m === 1 ? 'شهر' : m === 2 ? 'شهرين' : m <= 10 ? `${m} أشهر` : `${m} شهراً`)
  const yearsWord = (y: number) => (y === 1 ? 'سنة' : y === 2 ? 'سنتين' : y <= 10 ? `${y} سنوات` : `${y} سنة`)
  if (years === 0) return monthsWord(rem)
  if (rem === 0) return yearsWord(years)
  return `${yearsWord(years)} و${monthsWord(rem)}`
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
