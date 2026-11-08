// نموذج تقرير تسريع الثروة — كل الأرقام تُحسب محلياً من أرقام المستخدم (بدون AI).
// الـAI يعطي النصوص الشخصية فقط (التشخيص، الأفكار، الخطة)، وهذا الملف يعطي
// كل الأرقام: التسريبات، السيناريوهات، جدول السنوات، توزيع المحفظة، خطة ٩٠ يوم.

import { calcMonthsToGoal, formatNumber } from './calculator'

export const GOAL = 1_000_000
export const NEVER = 99999

export interface ReportInput {
  salary: number
  expenses: number
  savings: number
  investments: number
  rate: number
  monthlySaving: number
  netWorth: number
  totalMonths: number
}

// ─── صياغة المدد باللهجة وبالأرقام: "4 سنين و6 شهور" ─────────────────────
export function dur(months: number): string {
  if (months >= NEVER) return 'ما توصل بهالوضع'
  if (months <= 0) return 'وصلت فعلاً'
  const y = Math.floor(months / 12)
  const m = months % 12
  const yw = y === 1 ? 'سنة' : y === 2 ? 'سنتين' : y <= 10 ? `${y} سنين` : `${y} سنة`
  const mw = m === 1 ? 'شهر' : m === 2 ? 'شهرين' : m <= 10 ? `${m} شهور` : `${m} شهر`
  if (y === 0) return mw
  if (m === 0) return yw
  return `${yw} و${mw}`
}

// "4.5 سنة" — للعناوين القصيرة
export function yearsShort(months: number): string {
  if (months >= NEVER) return '∞'
  const v = Math.round((months / 12) * 10) / 10
  return `${Number.isInteger(v) ? v : v.toFixed(1)} سنة`
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

// ─── رقم مرجعي للتقرير (ثابت لنفس الأرقام ونفس الشهر) ────────────────────
export function reportId(d: ReportInput, now = new Date()): string {
  const s = `${d.salary}|${d.expenses}|${d.netWorth}|${d.rate}`
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`
  return `SM-${yymm}-${String(h % 10000).padStart(4, '0')}`
}

// ─── مؤشر الجاهزية (نفس المنطق السابق) ─────────────────────────────────
export function readiness(d: ReportInput): { score: number; label: string; tone: 'green' | 'amber' | 'orange' | 'red' } {
  let score = 0
  const sr = d.salary > 0 ? (d.monthlySaving / d.salary) * 100 : 0
  score += sr >= 30 ? 40 : sr >= 20 ? 30 : sr >= 10 ? 20 : sr >= 5 ? 10 : 0
  score += d.totalMonths < 60 ? 30 : d.totalMonths < 120 ? 25 : d.totalMonths < 180 ? 20 : d.totalMonths < 240 ? 15 : 8
  score += d.netWorth >= 200000 ? 20 : d.netWorth >= 100000 ? 16 : d.netWorth >= 50000 ? 12 : d.netWorth >= 10000 ? 8 : d.netWorth > 0 ? 4 : 0
  score += d.monthlySaving >= 5000 ? 10 : d.monthlySaving >= 2000 ? 8 : d.monthlySaving >= 1000 ? 6 : d.monthlySaving > 0 ? 3 : 0
  if (score >= 80) return { score, label: 'جاهزية عالية — أنت على الطريق الصح', tone: 'green' }
  if (score >= 60) return { score, label: 'جاهزية جيدة — فيه مجال تسرّع كثير', tone: 'amber' }
  if (score >= 40) return { score, label: 'جاهزية متوسطة — تحتاج كم تعديل', tone: 'orange' }
  return { score, label: 'البداية — بس الطريق واضح', tone: 'red' }
}

// ─── القسم الأول: التدفقات والتسريبات ─────────────────────────────────────
export interface Leak { title: string; body: string; cost: string; tone: 'red' | 'amber' | 'green' }
export interface RecoveryItem { title: string; amount: number }

export function cashflow(d: ReportInput) {
  const S = Math.max(0, d.salary)
  const E = Math.max(0, d.expenses)
  const M = d.monthlySaving
  const savingPct = S > 0 ? Math.round((M / S) * 100) : 0
  const expensePct = S > 0 ? Math.min(100, Math.round((E / S) * 100)) : 0

  // تحرير تقديري ≈ ١٠٪ من المصاريف، مقسّم على ٣ بنود (بحد أدنى وأعلى منطقي)
  const recovery = roundTo(clamp(E * 0.1, 300, 3000), 50)
  const items: RecoveryItem[] = [
    { title: 'إلغاء الاشتراكات المكررة والمنسية', amount: roundTo(recovery * 0.2, 50) },
    { title: 'سقف شهري لتطبيقات التوصيل والكوفي', amount: roundTo(recovery * 0.5, 50) },
    { title: 'قاعدة الـ48 ساعة قبل أي شراء غير ضروري', amount: 0 },
  ]
  items[2].amount = Math.max(0, recovery - items[0].amount - items[1].amount)

  // النموذج المستهدف: احتياجات / رغبات / ادخار — الادخار المستهدف ما ينزل عن ٢٠٪
  const targetSave = S > 0 ? clamp(Math.round(((Math.max(M, 0) + recovery) / S) * 100), 20, 60) : 20
  const rest = 100 - targetSave
  const target = { needs: Math.round(rest * 0.72), wants: rest - Math.round(rest * 0.72), save: targetSave }

  const leaks: Leak[] = []
  const emergencyNeed = E * 6
  const cash = Math.max(0, d.savings)
  const excessCash = Math.max(0, cash - emergencyNeed)
  if (excessCash >= 5000 && d.rate < 7) {
    leaks.push({
      title: `كاش نايم بالحساب (${formatNumber(excessCash)} ر.س)`,
      body: `صندوق طوارئك يحتاج ${formatNumber(emergencyNeed)} ر.س (6 شهور مصاريف). اللي فوقها جالس بدون شغل، والتضخم ياكل منه كل سنة.`,
      cost: `−${formatNumber(Math.round(excessCash * 0.07))} ر.س / سنوياً`,
      tone: 'red',
    })
  } else if (cash < emergencyNeed) {
    leaks.push({
      title: 'صندوق الطوارئ ناقص',
      body: `تحتاج ${formatNumber(emergencyNeed)} ر.س احتياط (6 شهور مصاريف) وعندك ${formatNumber(cash)} ر.س كاش. أي طارئ بيجبرك تبيع استثماراتك بوقت غلط.`,
      cost: `ناقصك ${formatNumber(emergencyNeed - cash)} ر.س`,
      tone: 'red',
    })
  }
  leaks.push({
    title: 'المصاريف الأوتوماتيكية اللي ما تحس فيها',
    body: `توصيل، كوفي، اشتراكات، عروض. بمصاريفك الحالية (${formatNumber(E)} ر.س) نقدّر تقدر تحرر حوالي ${formatNumber(recovery)} ر.س بالشهر بدون ما تتغير حياتك.`,
    cost: `−${formatNumber(recovery * 12)} ر.س / سنوياً`,
    tone: 'amber',
  })
  if (d.rate < 7 && M > 0) {
    const now = calcMonthsToGoal(d.netWorth, M, d.rate, GOAL)
    const inv = calcMonthsToGoal(d.netWorth, M, 7, GOAL)
    if (now < NEVER && inv < now) {
      leaks.push({
        title: 'فلوسك تدخر بس ما تشتغل',
        body: `ادخارك يمشي على عائد ${d.rate}٪. نفس المبلغ بمحفظة متوازنة (حوالي 7٪ تاريخياً) يوصلك أبكر — بدون ما تدفع ريال زيادة.`,
        cost: `تأخير ${dur(now - inv)}`,
        tone: 'green',
      })
    }
  } else {
    leaks.push({
      title: 'الادخار اللي يجي "بعد الصرف"',
      body: 'لو تنتظر آخر الشهر عشان تشوف وش باقي، دايم بيكون الباقي أقل. التحويل لازم يصير يوم نزول الراتب.',
      cost: 'أكبر سبب لتذبذب الادخار',
      tone: 'green',
    })
  }

  return { S, E, M, savingPct, expensePct, recovery, items, target, leaks, emergencyNeed, cash }
}

// ─── القسم الثاني: السيناريوهات وجدول السنوات ─────────────────────────────
export interface Scenario {
  key: 'A' | 'B' | 'C'
  tag: string
  title: string
  desc: string
  monthly: number
  rate: number
  months: number
  note: string
}

export const SIDE_INCOME = 1500
export const BALANCED_RATE = 7

export function scenarios(d: ReportInput, recovery: number): Scenario[] {
  const M = d.monthlySaving
  const rB = Math.max(d.rate, BALANCED_RATE)
  const A = d.totalMonths
  const mB = Math.max(0, M) + recovery
  const mC = mB + SIDE_INCOME
  const B = calcMonthsToGoal(d.netWorth, mB, rB, GOAL)
  const C = calcMonthsToGoal(d.netWorth, mC, rB, GOAL)
  const saved = (x: number) => (A >= NEVER ? (x < NEVER ? 'تتحول من "ما توصل" إلى موعد واضح' : '') : A - x > 0 ? `توفّر ${dur(A - x)} من عمرك` : '')
  return [
    {
      key: 'A', tag: 'السيناريو أ', title: 'تكمل على نفس الوضع',
      desc: `تدخر ${formatNumber(Math.max(0, M))} ر.س بالشهر بعائد ${d.rate}٪ — بدون أي تغيير.`,
      monthly: Math.max(0, M), rate: d.rate, months: A,
      note: A >= NEVER ? 'بهالأرقام المليون ما يجي' : 'المسار الحالي',
    },
    {
      key: 'B', tag: 'السيناريو ب', title: `تسكّر التسريبات وتستثمر (${rB}٪)`,
      desc: `تضيف ${formatNumber(recovery)} ر.س من التسريبات، وتستثمر كل شهر ${formatNumber(mB)} ر.س بمحفظة متوازنة.`,
      monthly: mB, rate: rB, months: B, note: saved(B),
    },
    {
      key: 'C', tag: 'السيناريو ج (الذهبي)', title: `+ دخل جانبي ${formatNumber(SIDE_INCOME)} ر.س`,
      desc: `نفس السيناريو ب + قناة دخل جانبية صغيرة. المجموع ${formatNumber(mC)} ر.س تستثمرها كل شهر.`,
      monthly: mC, rate: rB, months: C, note: saved(C),
    },
  ]
}

export interface YearRow { year: number; deposits: number; gains: number; total: number; tag: string; final?: boolean; monthLabel?: string }

export function yearTable(start: number, monthly: number, rate: number, months: number): YearRow[] {
  if (months >= NEVER || months <= 0) return []
  const r = rate / 100 / 12
  const rows: YearRow[] = []
  let w = start
  const tags: [number, string][] = [[100000, 'كسرت حاجز الـ100 ألف'], [250000, 'ربع المليون'], [500000, 'نص المليون'], [750000, 'آخر ربع'], [GOAL, 'المليون الأول 🏆']]
  let tagIdx = tags.findIndex(([v]) => start < v)
  if (tagIdx < 0) tagIdx = tags.length
  const fullYears = Math.floor(months / 12)
  for (let m = 1; m <= months; m++) {
    w = w * (1 + r) + monthly
    const isYearEnd = m % 12 === 0
    const isFinal = m === months
    if (isYearEnd || isFinal) {
      const deposits = Math.round(start + monthly * m)
      const total = Math.round(w)
      let tag = ''
      while (tagIdx < tags.length && total >= tags[tagIdx][0]) { tag = tags[tagIdx][1]; tagIdx++ }
      if (!tag) tag = m <= 12 ? 'الانطلاقة' : 'تراكم'
      if (isFinal && !isYearEnd) {
        rows.push({ year: fullYears + 1, deposits, gains: total - deposits, total, tag, final: true, monthLabel: `${dur(m)}` })
      } else {
        rows.push({ year: m / 12, deposits, gains: total - deposits, total, tag, final: isFinal })
      }
    }
  }
  // لو المدة طويلة: أول ٨ سنوات + آخر سنتين
  if (rows.length > 11) return [...rows.slice(0, 8), ...rows.slice(-2)]
  return rows
}

export function requiredMonthly(netWorth: number, rate: number, years: number): number {
  if (netWorth >= GOAL) return 0
  const n = years * 12
  const r = rate / 100 / 12
  if (r === 0) return Math.max(0, Math.ceil((GOAL - netWorth) / n))
  const f = Math.pow(1 + r, n)
  return Math.max(0, Math.ceil((GOAL - netWorth * f) / ((f - 1) / r)))
}

// ─── القسم الثالث: توزيع الأصول ───────────────────────────────────────────
export interface Bucket { name: string; pct: number; range: string; color: string; desc: string; examples: string }

export const BUCKETS: Bucket[] = [
  { name: 'صناديق مؤشرات عالمية متوافقة مع الشريعة', pct: 40, range: '8٪ – 10٪', color: '#F59E0B',
    desc: 'سلة من أكبر الشركات العالمية بصندوق واحد. هذا محرك النمو الأساسي على المدى الطويل.',
    examples: 'أمثلة: SPUS · HLAL (عبر خدمة الأسواق العالمية في وسيطك)' },
  { name: 'أسهم سعودية قيادية وموزعة للأرباح', pct: 25, range: '6٪ – 9٪', color: '#10B981',
    desc: 'شركات كبيرة توزع أرباح بشكل منتظم، أو صندوق مؤشر للسوق السعودي بدل ما تختار أسهم بنفسك.',
    examples: 'أمثلة: صناديق مؤشرات السوق السعودي المدرجة في تداول' },
  { name: 'صكوك وصناديق مرابحة', pct: 20, range: '4.5٪ – 6٪', color: '#FACC15',
    desc: 'الجزء الهادي اللي يمتص الهزات ويعطيك عائد شبه ثابت.',
    examples: 'أمثلة: صكوك الادخار الحكومية «صح» · صناديق المرابحة' },
  { name: 'صناديق ريت العقارية', pct: 15, range: '5٪ – 7٪', color: '#3B82F6',
    desc: 'تملك حصة في عقارات مؤجرة (مستودعات، مولات، مكاتب) وتستلم توزيعات دورية بمبلغ صغير.',
    examples: 'أمثلة: صناديق ريت المدرجة في السوق السعودي' },
]

export function blendedReturn(): number {
  const mid = (r: string) => { const n = r.match(/[\d.]+/g)!.map(Number); return (n[0] + n[1]) / 2 }
  return Math.round(BUCKETS.reduce((s, b) => s + (b.pct / 100) * mid(b.range), 0) * 10) / 10
}

// ─── أدوات قابلة للتحميل ─────────────────────────────────────────────────
export function trackerCsv(d: ReportInput, monthly: number, rate: number): string {
  const r = rate / 100 / 12
  const rows = [['الشهر', 'الادخار المخطط (ر.س)', 'الثروة المتوقعة (ر.س)', 'ادخارك الفعلي', 'ثروتك الفعلية', 'الفرق', 'ملاحظات']]
  let w = d.netWorth
  const now = new Date()
  for (let i = 1; i <= 36; i++) {
    w = w * (1 + r) + monthly
    const dt = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const label = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}`
    const row = i + 1
    rows.push([label, String(monthly), String(Math.round(w)), '', '', `=IF(E${row}="","",E${row}-C${row})`, ''])
  }
  return '﻿' + rows.map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\r\n')
}

export function reminderIcs(amount: number): string {
  const now = new Date()
  const y = now.getFullYear()
  const mo = now.getMonth() + (now.getDate() >= 27 ? 1 : 0)
  const start = new Date(y, mo, 27)
  const ymd = (dt: Date) => `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}`
  const next = new Date(start); next.setDate(next.getDate() + 1)
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//saudimillion//report//AR', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:sm-${stamp}@saudimillion.com`, `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(start)}`, `DTEND;VALUE=DATE:${ymd(next)}`,
    'RRULE:FREQ=MONTHLY;BYMONTHDAY=27',
    `SUMMARY:يوم المليون: حوّل ${formatNumber(amount)} ر.س للادخار`,
    'DESCRIPTION:نزل الراتب؟ حوّل مبلغ الادخار للحساب الثاني قبل لا تصرف أي ريال. saudimillion.com',
    'BEGIN:VALARM', 'TRIGGER:PT9H', 'ACTION:DISPLAY', 'DESCRIPTION:يوم تحويل الادخار', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadFile(name: string, content: string, type: string, existing?: Blob) {
  const blob = existing || new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ═══════════════════════════════════════════════════════════════════════
// الإضافات الموسّعة: الحساسية، التأجيل، اختبار الضغط، التضخم، الميزانية
// التفصيلية، الأولويات، الديون، الزكاة، ومؤشرات المتابعة.
// ═══════════════════════════════════════════════════════════════════════

export const INFLATION = 2 // متوسط التضخم السعودي 2025 = 2٪ (الهيئة العامة للإحصاء)

interface SimOpts { shockAt?: number; shockPct?: number; pauseFrom?: number; pauseLen?: number; goalGrowth?: number }

// محاكاة شهرية عامة مع صدمة سوق أو توقف مساهمات أو هدف يكبر مع التضخم
export function simulate(start: number, monthly: number, rate: number, o: SimOpts = {}): number {
  const r = rate / 100 / 12
  const g = (o.goalGrowth || 0) / 100 / 12
  if (start >= GOAL) return 0
  let w = start
  let goal = GOAL
  for (let m = 1; m <= 1200; m++) {
    const paused = o.pauseFrom !== undefined && m > o.pauseFrom && m <= o.pauseFrom + (o.pauseLen || 0)
    w = w * (1 + r) + (paused ? 0 : monthly)
    if (o.shockAt && m === o.shockAt) w *= 1 - (o.shockPct || 0) / 100
    goal *= 1 + g
    if (w >= goal) return m
  }
  return NEVER
}

export function growFor(start: number, monthly: number, rate: number, months: number): number {
  const r = rate / 100 / 12
  let w = start
  for (let m = 0; m < months; m++) w = w * (1 + r) + monthly
  return w
}

// مصفوفة الحساسية: زيادة الادخار × العائد
export const SENS_EXTRA = [0, 500, 1000, 2000, 3000]
export const SENS_RATES = [4, 6, 7, 8, 10]
export function sensitivity(d: ReportInput): number[][] {
  const M = Math.max(0, d.monthlySaving)
  return SENS_EXTRA.map((e) => SENS_RATES.map((r) => calcMonthsToGoal(d.netWorth, M + e, r, GOAL)))
}

// تكلفة التأجيل: لو أجّلت تطبيق الخطة سنة/٣/٥ وبقيت على وضعك
export function delayCost(d: ReportInput, monthly: number, rate: number, base: number) {
  return [1, 3, 5].map((y) => {
    const wk = growFor(d.netWorth, Math.max(0, d.monthlySaving), d.rate, y * 12)
    const after = calcMonthsToGoal(wk, monthly, rate, GOAL)
    const total = after >= NEVER ? NEVER : y * 12 + after
    const remaining = base - y * 12
    const needed = remaining > 12 ? requiredMonthly(wk, rate, remaining / 12) : 0
    return { years: y, total, lost: total >= NEVER || base >= NEVER ? 0 : total - base, needed: remaining > 12 ? needed : 0 }
  })
}

// اختبار الضغط على المسار المسرّع
export function stressTests(d: ReportInput, monthly: number, rate: number, base: number) {
  const at = Math.min(36, Math.max(6, Math.floor(base / 2)))
  const t = [
    { key: 'crash', title: 'السوق ينزل 30٪ فجأة', when: `في الشهر ${at}`, months: simulate(d.netWorth, monthly, rate, { shockAt: at, shockPct: 30 }),
      fix: 'لا تبيع وقت النزول. كمّل استثمارك الشهري — أنت فعلياً تشتري بسعر مخفّض، وهذا اللي يرجّعك أسرع.' },
    { key: 'job', title: 'تفقد دخلك 6 شهور', when: 'بدون أي مساهمة', months: simulate(d.netWorth, monthly, rate, { pauseFrom: Math.min(24, at), pauseLen: 6 }),
      fix: 'صندوق الطوارئ هو اللي يغطي مصاريفك هنا — عشان كذا ما تلمس استثماراتك.' },
    { key: 'pause', title: 'توقف عن الاستثمار سنة', when: '"بس هالسنة"', months: simulate(d.netWorth, monthly, rate, { pauseFrom: 12, pauseLen: 12 }),
      fix: 'التحويل التلقائي يوم 27 يحميك من قرار "أوقف شوي". خله أوتوماتيك وانساه.' },
    { key: 'lowret', title: 'العائد أقل بـ2٪ من المتوقع', when: `${Math.max(0, rate - 2)}٪ بدل ${rate}٪`, months: calcMonthsToGoal(d.netWorth, monthly, Math.max(0, rate - 2), GOAL),
      fix: 'ما تتحكم بالسوق، لكن تتحكم بالمبلغ. +500 ريال بالشهر تعوّض جزء كبير من فرق العائد.' },
  ]
  return t.map((x) => ({ ...x, delay: x.months >= NEVER || base >= NEVER ? NEVER : Math.max(0, x.months - base) }))
}

// التضخم: قيمة المليون الحقيقية + متى توصل لمليون "بفلوس اليوم"
export function inflationView(d: ReportInput, monthly: number, rate: number, base: number) {
  const real = base >= NEVER ? 0 : Math.round(GOAL / Math.pow(1 + INFLATION / 100, base / 12))
  const realMonths = simulate(d.netWorth, monthly, rate, { goalGrowth: INFLATION })
  return { real, realMonths }
}

// زيادة الادخار التلقائية (Save More Tomorrow): نص كل زيادة راتب تروح للاستثمار
export function saveMoreTomorrow(d: ReportInput, monthly: number, rate: number, raisePct = 3, share = 0.5): number {
  const r = rate / 100 / 12
  let w = d.netWorth
  if (w >= GOAL) return 0
  for (let m = 1; m <= 1200; m++) {
    const y = Math.floor((m - 1) / 12)
    const extra = share * d.salary * (Math.pow(1 + raisePct / 100, y) - 1)
    w = w * (1 + r) + monthly + extra
    if (w >= GOAL) return m
  }
  return NEVER
}

export function rule72(rate: number) { return rate > 0 ? Math.round((72 / rate) * 10) / 10 : 0 }

// الميزانية التفصيلية المقترحة بالريال
export interface BudgetLine { group: 'needs' | 'wants' | 'save'; name: string; amount: number; tip: string }
export function budgetLines(S: number, target: { needs: number; wants: number; save: number }): BudgetLine[] {
  const N = S * target.needs / 100, W = S * target.wants / 100, V = S * target.save / 100
  const r = (n: number) => Math.round(n / 50) * 50
  return [
    { group: 'needs', name: 'السكن (إيجار أو قسط)', amount: r(N * 0.45), tip: 'المريح ما يتعدى 25–30٪ من الراتب' },
    { group: 'needs', name: 'الأكل والبقالة', amount: r(N * 0.2), tip: 'قائمة مشتريات أسبوعية + الشراء بالجملة للأساسيات' },
    { group: 'needs', name: 'المواصلات والبنزين والصيانة', amount: r(N * 0.15), tip: 'خصص مبلغ صيانة سنوي وقسّمه على 12' },
    { group: 'needs', name: 'الفواتير والجوال والإنترنت', amount: r(N * 0.1), tip: 'راجع باقتك كل 6 شهور — غالباً فيه عرض أرخص' },
    { group: 'needs', name: 'التزامات عائلية', amount: r(N * 0.1), tip: 'حددها مسبقاً بدل ما تفاجئك آخر الشهر' },
    { group: 'wants', name: 'المطاعم والكوفي والتوصيل', amount: r(W * 0.4), tip: 'سقف أسبوعي ثابت — لما يخلص، يخلص' },
    { group: 'wants', name: 'التسوق والملابس', amount: r(W * 0.25), tip: 'قاعدة الـ48 ساعة قبل أي شراء فوق 200 ريال' },
    { group: 'wants', name: 'الترفيه والسفر والمناسبات', amount: r(W * 0.25), tip: 'حساب فرعي للسفر تحوّل له شهرياً' },
    { group: 'wants', name: 'الاشتراكات الرقمية', amount: r(W * 0.1), tip: 'اشتراكين بالكثير — والباقي بالتناوب' },
    { group: 'save', name: 'الاستثمار + صندوق الطوارئ', amount: r(V), tip: 'يتحول يوم نزول الراتب — قبل أي صرف' },
  ]
}

// سلّم الأولويات المالية (الترتيب المعتمد عالمياً، مكيّف للسعودية)
export type StepStatus = 'done' | 'now' | 'next' | 'check'
export function priorities(d: ReportInput, emergencyNeed: number) {
  const cash = Math.max(0, d.savings)
  const sr = d.salary > 0 ? d.monthlySaving / d.salary : 0
  const E = Math.max(1, d.expenses)
  const raw: { title: string; desc: string; status: StepStatus }[] = [
    { title: 'ميزانية مكتوبة وفائض شهري موجب', desc: 'تعرف وين يروح كل ريال، ودخلك أكبر من مصروفك.', status: d.monthlySaving > 0 ? 'done' : 'now' },
    { title: 'احتياط مبدئي = شهر مصاريف', desc: `${formatNumber(E)} ر.س بحساب منفصل — يمنعك من الدين عند أول طارئ.`, status: cash >= E ? 'done' : 'now' },
    { title: 'سداد الديون الاستهلاكية الغالية', desc: 'بطاقات ائتمانية وقروض شخصية — سدادها عائد مضمون أعلى من أغلب الاستثمارات.', status: 'check' },
    { title: 'صندوق طوارئ كامل = 6 شهور', desc: `${formatNumber(emergencyNeed)} ر.س بمكان سهل السحب (حساب ادخار أو مرابحة).`, status: cash >= emergencyNeed ? 'done' : 'now' },
    { title: 'استثمار 20٪ أو أكثر من الراتب', desc: 'بمحفظة متنوعة وبتحويل تلقائي شهري.', status: sr >= 0.2 && d.rate >= 7 ? 'done' : 'now' },
    { title: 'قناة دخل ثانية', desc: 'تسرّع الوصول وتقلل خطر الاعتماد على راتب واحد.', status: 'next' },
    { title: 'الاستقلال المالي', desc: 'ثروة عوائدها تغطي مصاريفك بدون راتب.', status: 'next' },
  ]
  // أول خطوة غير مكتملة = "الحين"، وما بعدها "التالي"
  let found = false
  return raw.map((s) => {
    if (s.status === 'done' || s.status === 'check') return s
    if (!found) { found = true; return { ...s, status: 'now' as StepStatus } }
    return { ...s, status: 'next' as StepStatus }
  })
}

// الديون: سقف ساما + مثال تمويل سيارة وتكلفة الفرصة
export function debtView(d: ReportInput) {
  const S = Math.max(0, d.salary)
  const samaCap = Math.round(S / 3)
  const comfy = Math.round(S * 0.15)
  const car = Math.max(40000, Math.round((S * 6) / 5000) * 5000)
  const flat = 5, years = 5
  const profit = Math.round(car * flat / 100 * years)
  const installment = Math.round((car + profit) / (years * 12))
  const fv = Math.round(growFor(0, installment, BALANCED_RATE, years * 12))
  return { samaCap, comfy, car, flat, years, profit, installment, fv }
}

// الزكاة التقديرية
export function zakatView(d: ReportInput) {
  const cash = Math.max(0, d.savings)
  const inv = Math.max(0, d.investments)
  return { onCash: Math.round(cash * 0.025), upper: Math.round((cash + inv) * 0.025), cash, inv }
}

// مؤشرات المتابعة
export function kpis(d: ReportInput, emergencyNeed: number) {
  const sr = d.salary > 0 ? Math.round((d.monthlySaving / d.salary) * 100) : 0
  const cushion = d.expenses > 0 ? Math.round((Math.max(0, d.savings) / d.expenses) * 10) / 10 : 0
  const invShare = d.netWorth > 0 ? Math.round((Math.max(0, d.investments) / d.netWorth) * 100) : 0
  const runway = d.expenses > 0 ? Math.round((d.netWorth / (d.expenses * 12)) * 10) / 10 : 0
  const progress = Math.min(100, Math.round((d.netWorth / GOAL) * 1000) / 10)
  return [
    { name: 'نسبة الادخار', now: `${sr}٪`, target: '20٪ فأكثر', ok: sr >= 20 },
    { name: 'تغطية الطوارئ', now: `${cushion} شهر`, target: '6 شهور', ok: cushion >= 6 },
    { name: 'نسبة المستثمر من ثروتك', now: `${invShare}٪`, target: '70٪+ بعد الطوارئ', ok: invShare >= 70 || (d.netWorth > 0 && Math.max(0, d.savings) <= emergencyNeed && invShare > 0) },
    { name: 'كم سنة تعيش من ثروتك', now: `${runway} سنة`, target: '25 سنة = استقلال', ok: runway >= 25 },
    { name: 'التقدم نحو المليون', now: `${progress}٪`, target: '100٪', ok: progress >= 100 },
    { name: 'نسبة الأقساط من الراتب', now: 'سجّلها', target: 'أقل من 15٪', ok: false },
  ]
}
