'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Download, Printer, Hourglass, Rocket, BadgeCheck, CalendarDays, Hash, Star, PieChart, Scissors,
  Sparkles, Target, TrendingUp, Table2, Globe2, Building2, Landmark, Building, ShieldCheck, Flame,
  Lightbulb, Briefcase, FileSpreadsheet, BellRing, Flag, CheckCircle2, Share2, MessageCircle,
  Scale, AlertTriangle, Zap, Calculator, ChevronLeft, Brain, Coffee, Wallet, Gavel, Lock,
} from 'lucide-react'
import SiteShell from '@/components/site/SiteShell'
import { SectionHead, SideTag, Num, Takeaway } from '@/components/report/ui'
import {
  TableOfContents, BudgetDetail, PrioritiesAndDebt, SensitivityGrid, TimeAndRisk, ZakatRetirementProtection,
  MoneyPsychology, KpiReview, GlossaryFaqSources,
} from '@/components/report/ExtendedSections'
import { getUserData, UserData } from '@/lib/store'
import { formatNumber, contributionSplit } from '@/lib/calculator'
import { ReportData, computeExtras, buildLocalReport } from '@/lib/reportFallback'
import {
  GOAL, NEVER, dur, yearsShort, reportId, readiness, cashflow, scenarios, yearTable, requiredMonthly,
  BUCKETS, blendedReturn, trackerCsv, reminderIcs, downloadFile, SIDE_INCOME, BALANCED_RATE,
  sensitivity, delayCost, stressTests, inflationView, saveMoreTomorrow, rule72, budgetLines, priorities,
  debtView, zakatView, kpis,
} from '@/lib/reportModel'

const SAR = 'ر.س'

function Ring({ score }: { score: number }) {
  const r = 70, c = 2 * Math.PI * r
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : score >= 40 ? '#F97316' : '#EF4444'
  return (
    <svg viewBox="0 0 180 180" className="w-40 h-40 lg:w-48 lg:h-48 -rotate-90">
      <circle cx="90" cy="90" r={r} fill="none" stroke="#2E3846" strokeWidth="14" />
      <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={`${(score / 100) * c} ${c}`} />
    </svg>
  )
}

function Donut({ center }: { center: string }) {
  const r = 70, c = 2 * Math.PI * r
  let acc = 0
  return (
    <div className="relative w-52 h-52 mx-auto">
      <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
        {BUCKETS.map((b) => {
          const len = (b.pct / 100) * c
          const el = <circle key={b.name} cx="90" cy="90" r={r} fill="none" stroke={b.color} strokeWidth="26"
            strokeDasharray={`${len - 2} ${c - len + 2}`} strokeDashoffset={-acc} />
          acc += len
          return el
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-amber-300 tabular-nums">{center}</span>
        <span className="text-[10px] text-gray-400 leading-tight text-center">عائد سنوي<br />تاريخي تقريبي</span>
      </div>
    </div>
  )
}

function LoadingReport() {
  const [step, setStep] = useState(0)
  const steps = ['نحلل مصاريفك وادخارك...', 'نكشف التسريبات ونحسب السيناريوهات...', 'نوزّع محفظتك ونجهز خطة الـ90 يوم...', 'لحظات وتقريرك جاهز...']
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1800)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="text-center py-28 px-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-6 animate-glow"><BadgeCheck size={30} /></div>
      <h2 className="text-xl font-extrabold mb-2">نجهز تقريرك الشخصي</h2>
      <p className="text-gray-400 text-sm mb-8">{steps[step]}</p>
      <div className="w-56 h-2 bg-ink-700 rounded-full mx-auto overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 bg-amber-400" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
    </div>
  )
}

const NAV = [
  { id: 'flows', label: 'الميزانية' },
  { id: 'scenarios', label: 'المسار التراكمي' },
  { id: 'risk', label: 'اختبار الضغط' },
  { id: 'assets', label: 'توزيع الأصول' },
  { id: 'income', label: 'الدخل الجانبي' },
  { id: 'plan', label: 'خطة 90 يوم' },
  { id: 'kpi', label: 'المؤشرات' },
]

const TOC = [
  { id: 'flows', n: '01', title: 'الهندسة العكسية للميزانية', desc: 'توزيع راتبك، التسريبات، وميزانية بند بند' },
  { id: 'priorities', n: '02', title: 'سلّم الأولويات والديون', desc: 'وش تسوي أول، وحدود الأقساط الصحية' },
  { id: 'scenarios', n: '03', title: 'محاكاة التراكم المركب', desc: '3 سيناريوهات، جدول سنوي، ومصفوفة حساسية' },
  { id: 'risk', n: '04', title: 'الوقت والتضخم والمخاطر', desc: 'اختبار الضغط وتكلفة التأجيل' },
  { id: 'assets', n: '05', title: 'توزيع الأصول', desc: 'محفظة 4 فئات بالمبالغ ووين تنفذ' },
  { id: 'protect', n: '06', title: 'الزكاة والتقاعد والحماية', desc: 'الأشياء اللي أغلب الخطط تنساها' },
  { id: 'income', n: '07', title: 'محرك الدخل الجانبي', desc: 'أفكار تناسبك مع خطة انطلاق' },
  { id: 'mind', n: '08', title: 'علم النفس المالي', desc: '6 فخاخ سلوكية وحلولها' },
  { id: 'tools', n: '09', title: 'صندوق الأدوات', desc: 'شيت تتبّع، تذكير شهري، رقم الاستقلال' },
  { id: 'plan', n: '10', title: 'خطة أول 90 يوم', desc: '3 مراحل وتفصيل أسبوعي' },
  { id: 'kpi', n: '11', title: 'لوحة المؤشرات', desc: '6 أرقام تراقبها كل 3 شهور' },
  { id: 'glossary', n: '12', title: 'المرجع', desc: 'المسرد، الأسئلة، ومصادر الأرقام' },
]

// يقص الصفوف الفاضية (لون الخلفية) من أسفل اللقطة
function trimBottom(c: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = c.getContext('2d')
  if (!ctx) return c
  const { width, height } = c
  const data = ctx.getImageData(0, 0, width, height).data
  const isBg = (i: number) => Math.abs(data[i] - 18) < 6 && Math.abs(data[i + 1] - 23) < 6 && Math.abs(data[i + 2] - 31) < 6
  let last = height - 1
  outer: for (; last > 0; last--) {
    const row = last * width * 4
    for (let x = 0; x < width; x += 3) if (!isBg(row + x * 4)) break outer
  }
  const h = Math.min(height, last + 8)
  if (h >= height) return c
  const out = document.createElement('canvas')
  out.width = width; out.height = h
  out.getContext('2d')!.drawImage(c, 0, 0, width, h, 0, 0, width, h)
  return out
}

// ─── الصفحة ─────────────────────────────────────────────────────────────
export default function ReportPage() {
  const router = useRouter()
  const [data, setData] = useState<UserData | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [targetYears, setTargetYears] = useState(10)
  const [calcRate, setCalcRate] = useState(BALANCED_RATE)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [pdfMode, setPdfMode] = useState(false)

  useEffect(() => {
    // وضع توليد الـPDF داخل إطار مخفي (للجوال): البيانات تجي من الصفحة الأم بدون طلب جديد
    try {
      const parent = window.parent as unknown as { __smPdfPayload?: { data: UserData; report: ReportData } }
      if (new URLSearchParams(window.location.search).get('pdf') === '1' && window.parent !== window && parent.__smPdfPayload) {
        setData(parent.__smPdfPayload.data)
        setReport(parent.__smPdfPayload.report)
        setLoading(false)
        setPdfMode(true)
        return
      }
    } catch {}
    // حارس الوصول: التقرير محتوى مدفوع — نتحقق من توكن الوصول قبل عرض أي شيء
    fetch('/api/check-access?product=report')
      .then((r) => r.json())
      .then((res) => {
        if (res.access) {
          const d = getUserData() || { salary: 8000, expenses: 5000, savings: 0, investments: 0, rate: 0, monthlySaving: 3000, netWorth: 0, totalMonths: 168 }
          setData(d)
          generateReport(d)
        } else {
          router.push('/checkout')
        }
      })
      .catch(() => router.push('/checkout'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateReport = async (d: UserData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salary: d.salary, expenses: d.expenses, monthlySaving: d.monthlySaving, totalMonths: d.totalMonths, netWorth: d.netWorth, rate: d.rate }),
      })
      const json = await res.json()
      if (json.result) {
        try {
          const ai = JSON.parse(json.result)
          // الـAI يعطي النصوص الإبداعية، والحقول الحسابية تُحسب محلياً دائماً
          setReport({ ...ai, ...computeExtras(d) })
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

  const m = useMemo(() => {
    if (!data) return null
    const flow = cashflow(data)
    const sc = scenarios(data, flow.recovery)
    const best = sc[2]
    const table = yearTable(data.netWorth, best.monthly, best.rate, best.months)
    const split = contributionSplit(data.netWorth, best.monthly, best.months)
    const ext = {
      grid: sensitivity(data),
      delay: delayCost(data, best.monthly, best.rate, best.months),
      stress: stressTests(data, best.monthly, best.rate, best.months),
      infl: inflationView(data, best.monthly, best.rate, best.months),
      smt: saveMoreTomorrow(data, best.monthly, best.rate),
      budget: budgetLines(flow.S, flow.target),
      steps: priorities(data, flow.emergencyNeed),
      debt: debtView(data),
      zakat: zakatView(data),
      kpi: kpis(data, flow.emergencyNeed),
    }
    return { flow, sc, best, table, split, ext, ready: readiness(data), id: reportId(data) }
  }, [data])

  const [pdfProgress, setPdfProgress] = useState(0)

  // على الجوال: نولّد الـPDF من نسخة بعرض الكمبيوتر داخل إطار مخفي، عشان يطلع بنفس تنسيق التقرير الكامل
  const downloadViaFrame = () => {
    const w = window as unknown as Record<string, unknown>
    setPdfBusy(true); setPdfProgress(0)
    w.__smPdfPayload = { data, report }
    const frame = document.createElement('iframe')
    frame.setAttribute('aria-hidden', 'true')
    frame.style.cssText = 'position:fixed;top:0;left:-20000px;width:1280px;height:900px;border:0;opacity:0;pointer-events:none'
    let finished = false
    const cleanup = () => { finished = true; clearTimeout(timer); frame.remove(); setPdfBusy(false); delete w.__smPdfPayload }
    w.__smPdfProgress = (p: number) => setPdfProgress(p)
    w.__smPdfResolve = (buf: ArrayBuffer) => {
      downloadFile('تقرير-تسريع-الثروة-saudimillion.pdf', '', 'application/pdf', new Blob([buf], { type: 'application/pdf' }))
      cleanup()
    }
    w.__smPdfReject = () => { if (!finished) { cleanup(); window.print() } }
    const timer = setTimeout(() => (w.__smPdfReject as () => void)(), 120000)
    frame.src = '/report?pdf=1'
    document.body.appendChild(frame)
  }

  const downloadPDF = async (inFrame = false) => {
    if (!inFrame && window.innerWidth < 1024) return downloadViaFrame()
    const parentApi = window.parent as unknown as { __smPdfProgress?: (p: number) => void; __smPdfResolve?: (b: ArrayBuffer) => void; __smPdfReject?: () => void }
    setPdfBusy(true); setPdfProgress(0)
    try {
      const { toCanvas, getFontEmbedCSS } = await import('html-to-image')
      const { default: jsPDF } = await import('jspdf')
      const root = document.getElementById('report-content')
      if (!root) return
      await document.fonts.ready
      await new Promise((r) => setTimeout(r, 150))
      // نلتقط بعرض ثابت مناسب للورق (A4) عشان الخط يطلع مقروء والصفحات ممتلئة
      const prevW = root.style.width, prevMax = root.style.maxWidth
      if (window.innerWidth >= 1024) { root.style.width = '900px'; root.style.maxWidth = '900px' }
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)))
      const restore = () => { root.style.width = prevW; root.style.maxWidth = prevMax }
      const sections = Array.from(root.children) as HTMLElement[]
      let fontEmbedCSS: string | undefined
      try { fontEmbedCSS = await getFontEmbedCSS(root) } catch {}
      const opts = {
        pixelRatio: 2, backgroundColor: '#12171F', cacheBust: true, fontEmbedCSS,
        filter: (node: HTMLElement) => !(node instanceof HTMLElement && node.classList.contains('no-print')),
      }
      // تقسيم احترافي: كل قسم رئيسي يبدأ بصفحة جديدة، والأقسام ما تنقص من النص
      const pdf = new jsPDF('p', 'mm', 'a4')
      const PW = pdf.internal.pageSize.getWidth(), PH = pdf.internal.pageSize.getHeight()
      const M = 8, TOP = 10, BOTTOM = 12, GAP = 6
      const CW = PW - M * 2, CH = PH - TOP - BOTTOM
      let y = TOP, pageHasContent = false
      const paint = () => { pdf.setFillColor(18, 23, 31); pdf.rect(0, 0, PW, PH, 'F') }
      const newPage = () => { pdf.addPage(); paint(); y = TOP; pageHasContent = false }
      paint()
      // نقسم الأقسام الطويلة لوحدات (عنوان، بطاقات، خلاصة...) عشان ما ينقص كرت بنص صفحة
      const pxPerMm = root.getBoundingClientRect().width / CW
      const maxPx = CH * pxPerMm
      const isStack = (el: HTMLElement) => {
        const kids = Array.from(el.children) as HTMLElement[]
        if (kids.length < 2) return false
        const w = el.getBoundingClientRect().width
        return kids.every((k) => k.getBoundingClientRect().width >= w * 0.9)
      }
      const units: { el: HTMLElement; brk: boolean }[] = []
      const expand = (el: HTMLElement, brk: boolean, depth: number) => {
        if (el.classList.contains('no-print') || el.offsetHeight === 0) return
        if (el.offsetHeight > maxPx * 0.92 && depth < 3 && isStack(el)) {
          (Array.from(el.children) as HTMLElement[]).forEach((k, idx) => expand(k, brk && idx === 0, depth + 1))
        } else units.push({ el, brk })
      }
      sections.forEach((sec) => expand(sec, sec.hasAttribute('data-pdf-break'), 0))
      for (let i = 0; i < units.length; i++) {
        const { el: sec, brk } = units[i]
        // نعطي مساحة إضافية تحت (لو الخط في النسخة الملتقطة لفّ أكثر) ثم نقص الفراغ
        const raw = await toCanvas(sec, { ...opts, height: Math.ceil(sec.offsetHeight * 1.3) + 40, style: { height: 'auto' } })
        const canvas = trimBottom(raw)
        setPdfProgress(Math.round(((i + 1) / units.length) * 100))
        if (inFrame) parentApi.__smPdfProgress?.(Math.round(((i + 1) / units.length) * 100))
        const mmPerPx = CW / (canvas.width * (root.getBoundingClientRect().width / sec.getBoundingClientRect().width))
        const wMm = canvas.width * mmPerPx
        const hMm = canvas.height * mmPerPx
        const x = PW - M - wMm // محاذاة يمين (RTL)
        if (brk && pageHasContent) newPage()
        if (hMm <= CH - (y - TOP)) {
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', x, y, wMm, hMm)
          y += hMm + GAP; pageHasContent = true
          continue
        }
        if (hMm <= CH) {
          if (pageHasContent) newPage()
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', x, y, wMm, hMm)
          y += hMm + GAP; pageHasContent = true
          continue
        }
        // وحدة أطول من صفحة: نقسمها على عدة صفحات
        if (pageHasContent) newPage()
        const slicePx = Math.floor(CH / mmPerPx)
        for (let off = 0; off < canvas.height; off += slicePx) {
          const h = Math.min(slicePx, canvas.height - off)
          const part = document.createElement('canvas')
          part.width = canvas.width; part.height = h
          part.getContext('2d')!.drawImage(canvas, 0, off, canvas.width, h, 0, 0, canvas.width, h)
          if (off > 0) newPage()
          pdf.addImage(part.toDataURL('image/jpeg', 0.9), 'JPEG', x, y, wMm, h * mmPerPx)
          y += h * mmPerPx + GAP; pageHasContent = true
        }
      }
      restore()
      // ترقيم الصفحات
      const total = pdf.getNumberOfPages()
      for (let p = 1; p <= total; p++) {
        pdf.setPage(p)
        pdf.setFontSize(8); pdf.setTextColor(120, 130, 145)
        pdf.text(`saudimillion.com  |  ${m?.id || ''}`, M, PH - 5)
        pdf.text(`${p} / ${total}`, PW - M, PH - 5, { align: 'right' })
      }
      if (inFrame) parentApi.__smPdfResolve?.(pdf.output('arraybuffer'))
      else pdf.save('تقرير-تسريع-الثروة-saudimillion.pdf')
    } catch (e) {
      console.error(e)
      if (inFrame) { parentApi.__smPdfReject?.(); return }
      const root = document.getElementById('report-content')
      if (root) { root.style.width = ''; root.style.maxWidth = '' }
      window.print()
    } finally {
      setPdfBusy(false)
    }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (pdfMode && report && m) {
      const t = setTimeout(() => downloadPDF(true), 400)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfMode, report, m])

  if (!data || !m || loading || !report) {
    return <SiteShell><LoadingReport /></SiteShell>
  }

  const { flow, sc, best, table, split, ext, ready: rd, id } = m
  const A = data.totalMonths
  const C = best.months
  const alreadyMillion = data.netWorth >= GOAL
  const today = new Date().toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })
  const blended = blendedReturn()
  const investMonthly = sc[1].monthly
  const emergencyGap = Math.max(0, flow.emergencyNeed - flow.cash)
  const fireNumber = Math.round(flow.E * 12 * 25)
  const fireMonths = fireNumber > data.netWorth && best.monthly > 0
    ? (() => { let w = data.netWorth, k = 0; const r = best.rate / 100 / 12; while (w < fireNumber && k < 1200) { w = w * (1 + r) + best.monthly; k++ } return k >= 1200 ? NEVER : k })()
    : 0
  const req = requiredMonthly(data.netWorth, calcRate, targetYears)
  const reqGap = req - Math.max(0, data.monthlySaving)
  const ideas = (report.income_ideas || []).slice(0, 6)
  const strengths = report.strengths || []
  const cushion = flow.E > 0 ? Math.floor(flow.cash / flow.E) : 0
  const risks = (report.risk_analysis || []).map((r, i) => i === 0
    ? { ...r, mitigation: `عندك كاش يغطي ${cushion} ${cushion === 1 ? 'شهر' : cushion === 2 ? 'شهرين' : 'شهور'} مصاريف — ${cushion >= 6 ? 'وضعك آمن' : 'الهدف توصل 6 شهور'}` }
    : r)
  const weaknesses = report.weaknesses || []

  const headline = alreadyMillion
    ? 'تجاوزت المليون الأول — الحين وقت تكبيره وحمايته'
    : A >= NEVER && C < NEVER ? `من "ما توصل" إلى مليونك خلال ${yearsShort(C)}`
    : C < A ? `نختصر طريقك للمليون من ${yearsShort(A)} إلى ${yearsShort(C)}`
    : 'نبني لك أساس متين يوصلك للمليون'

  const weekStep = emergencyGap > 0
    ? `افتح حساب ادخار منفصل اليوم، وفعّل تحويل تلقائي بمبلغ ${formatNumber(Math.max(500, data.monthlySaving))} ${SAR} يوم 27 من كل شهر. أول هدف: تكمّل صندوق الطوارئ (ناقصك ${formatNumber(emergencyGap)} ${SAR}).`
    : `افتح محفظة استثمارية عند وسيط مرخّص هالأسبوع، وحط أول دفعة ${formatNumber(investMonthly)} ${SAR} موزعة حسب القسم الخامس. وفعّل تحويل تلقائي يوم 27.`

  const zubda = [
    { t: `نسبة ادخارك ${flow.savingPct}٪`, s: flow.savingPct >= 20 ? 'فوق القاعدة الذهبية (20٪) — أساسك قوي' : `تحت القاعدة الذهبية (20٪) بـ${20 - flow.savingPct} نقاط — وهذا أسهل شي نصلحه` },
    { t: `تقدر تحرر ${formatNumber(flow.recovery)} ${SAR} بالشهر`, s: 'من مصاريف أوتوماتيكية ما تحس فيها — بدون تقشف' },
    alreadyMillion
      ? { t: 'المليون الأول خلفك ✅', s: 'الهدف الحين: حمايته وتنميته لين يغطي مصاريفك (رقم الاستقلال المالي)' }
      : { t: A >= NEVER ? `المسار المسرّع يوصلك خلال ${dur(C)}` : `${dur(A)} ← ${dur(C)}`, s: 'من وضعك الحالي إلى المسار المسرّع في هالتقرير' },
    { t: emergencyGap > 0 ? `صندوق الطوارئ ناقصه ${formatNumber(emergencyGap)} ${SAR}` : 'صندوق طوارئك مكتمل ✅', s: emergencyGap > 0 ? 'هذا أول شي نسكّره قبل أي استثمار' : 'تقدر توجّه كل فائضك للاستثمار مباشرة' },
    { t: split.gainsPct > 0 ? `${split.gainsPct}٪ من مليونك يجي من العائد المركب` : 'العائد المركب هو سلاحك الأكبر', s: 'يعني فلوسك تشتغل عنك — مو بس أنت اللي تشتغل' },
  ]

  const shareText = `💰 طلعت تقرير تسريع الثروة حقي — ${A < NEVER && C < A ? `اختصرت طريقي للمليون من ${yearsShort(A)} إلى ${yearsShort(C)}` : `خطتي للمليون الأول جاهزة`}.\nاحسب متى تصير مليونير:\nhttps://saudimillion.com/s/${data.totalMonths}`

  return (
    <SiteShell>
      {/* شريط التقرير */}
      <div className="sticky top-[72px] z-30 bg-ink-900/90 backdrop-blur-md border-b border-white/[0.06] no-print">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between gap-3">
          <nav className="hidden lg:flex items-center gap-5 text-sm font-bold text-gray-400">
            {NAV.map((n) => <a key={n.id} href={`#${n.id}`} className="hover:text-white transition-colors">{n.label}</a>)}
          </nav>
          <span className="lg:hidden text-sm font-extrabold">تقريرك <span className="text-amber-400">الشامل</span></span>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="btn-ghost px-3 py-2 text-xs"><Printer size={15} /> طباعة</button>
            <button onClick={() => downloadPDF()} disabled={pdfBusy} className="btn-primary px-4 py-2 text-xs"><Download size={15} /> {pdfBusy ? `يجهز ${pdfProgress}٪` : 'تحميل PDF'}</button>
          </div>
        </div>
      </div>

      <main id="report-content" className="report-print max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-16 lg:space-y-24">

        {/* ═══ الغلاف ═══ */}
        <section className="relative rounded-3xl border border-amber-400/15 p-5 lg:p-10 overflow-hidden"
          style={{ background: 'radial-gradient(120% 90% at 100% 0%, rgba(245,158,11,0.10), transparent 55%), radial-gradient(90% 80% at 0% 100%, rgba(16,185,129,0.08), transparent 60%), #161C25' }}>
          <div className="flex flex-wrap items-center gap-2 pb-5 mb-6 border-b border-white/[0.06]">
            <span className="chip bg-amber-400/10 text-amber-300 border border-amber-400/25"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot" />ملف تنفيذي شخصي</span>
            <span className="chip bg-white/[0.04] text-gray-300 border border-white/10"><Hash size={12} />رقم التقرير: <Num>{id}</Num></span>
            <span className="chip bg-white/[0.04] text-gray-300 border border-white/10"><CalendarDays size={12} />{today}</span>
            <span className="chip bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 lg:mr-auto"><BadgeCheck size={13} />مبني على أرقامك أنت — مو قالب عام</span>
          </div>

          <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
            <div>
              <p className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-3"><Star size={16} />خطة العمل للوصول لأول <Num>1,000,000</Num> ريال</p>
              <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-2">تقرير تسريع الثروة الشامل</h1>
              <p className="text-xl lg:text-3xl font-extrabold text-amber-grad leading-snug mb-5">{headline}</p>
              {report.motivational_opener && <p className="text-base lg:text-lg text-white/90 font-bold mb-3 leading-relaxed">{report.motivational_opener}</p>}
              <p className="text-sm lg:text-base text-gray-300 leading-loose mb-6">
                هالتقرير (12 قسم) مبني على أرقامك بالريال، ويشغّل لك ٣ محركات مع بعض:{' '}
                <b className="text-amber-300">تسكير التسريبات</b>، <b className="text-emerald-400">استثمار تلقائي كل شهر</b>، و<b className="text-amber-300">قناة دخل جانبية تضيف +{formatNumber(SIDE_INCOME)} {SAR}</b> بالشهر.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="card-soft p-4 flex items-center gap-4">
                  <span className="w-12 h-12 rounded-xl bg-red-400/10 text-red-300 flex items-center justify-center shrink-0"><Hourglass size={22} /></span>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">المسار الحالي (بدون تغيير)</p>
                    <p className="text-lg font-extrabold">{dur(A)}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] p-4 flex items-center gap-4">
                  <span className="w-12 h-12 rounded-xl bg-emerald-400/15 text-emerald-400 flex items-center justify-center shrink-0"><Rocket size={22} /></span>
                  <div>
                    <p className="text-xs text-emerald-300/80 mb-0.5">المسار المسرّع اللي نوصي فيه</p>
                    <p className="text-lg font-extrabold text-emerald-400">{dur(C)}{A < NEVER && C < A && <span className="text-xs text-emerald-300/80 font-bold mr-2">(−{dur(A - C)})</span>}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 text-center">
              <p className="text-sm text-gray-400 font-bold mb-3">مؤشر جاهزيتك المالية</p>
              <div className="relative w-fit mx-auto">
                <Ring score={rd.score} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold tabular-nums">{rd.score}</span>
                  <span className="text-xs text-gray-400">من 100</span>
                </div>
              </div>
              <p className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold border ${rd.tone === 'green' ? 'text-emerald-400 border-emerald-400/25 bg-emerald-400/10' : rd.tone === 'amber' ? 'text-amber-300 border-amber-400/25 bg-amber-400/10' : rd.tone === 'orange' ? 'text-orange-300 border-orange-400/25 bg-orange-400/10' : 'text-red-300 border-red-400/25 bg-red-400/10'}`}><CheckCircle2 size={13} />{rd.label}</p>
              <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">يقيس نسبة ادخارك، ومدة وصولك، وثروتك الحالية، وفائضك الشهري.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-8 pt-6 border-t border-white/[0.06]">
            {[
              { l: 'الراتب الشهري', v: formatNumber(flow.S), cls: 'card-soft' },
              { l: `المصاريف الشهرية (${flow.expensePct}٪)`, v: formatNumber(flow.E), cls: 'card-soft' },
              { l: `الادخار الشهري (${flow.savingPct}٪)`, v: formatNumber(Math.max(0, flow.M)), cls: 'rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06]', vc: 'text-emerald-400' },
              { l: 'الثروة الحالية', v: formatNumber(data.netWorth), cls: 'card-soft' },
              { l: 'العائد المفترض حالياً', v: `${data.rate}٪`, cls: 'rounded-2xl border border-amber-400/25 bg-amber-400/[0.07]', vc: 'text-amber-300', noSar: true },
            ].map((t, i) => (
              <div key={i} className={`${t.cls} p-4 ${i === 4 ? 'col-span-2 lg:col-span-1' : ''}`}>
                <p className="text-[11px] lg:text-xs text-gray-400 mb-1">{t.l}</p>
                <p className={`text-lg lg:text-xl font-extrabold tabular-nums ${t.vc || ''}`}>{t.v}{!t.noSar && <span className="text-xs text-gray-500 font-bold mr-1">{SAR}</span>}</p>
              </div>
            ))}
          </div>
        </section>

        <TableOfContents items={TOC} />

        {/* ═══ الزبدة ═══ */}
        <section className="grid lg:grid-cols-[1fr_1.1fr] gap-5">
          <div className="rounded-3xl border border-amber-400/30 p-6 lg:p-8 flex flex-col"
            style={{ background: 'linear-gradient(160deg, rgba(245,158,11,0.14), rgba(245,158,11,0.03) 60%), #1A212B' }}>
            <span className="chip bg-amber-400 text-ink-950 w-fit mb-4"><Zap size={13} />ابدأ من هنا</span>
            <h2 className="text-2xl font-extrabold mb-3">خطوتك هالأسبوع</h2>
            <p className="text-base lg:text-lg text-white/90 leading-loose font-bold">{weekStep}</p>
            <p className="text-xs text-gray-400 mt-auto pt-5">↓ باقي التقرير يشرح لك ليش، وكم بتوفر، وش الخطوة اللي بعدها.</p>
          </div>
          <div className="card p-6 lg:p-8">
            <h2 className="text-xl font-extrabold mb-5 flex items-center gap-2"><Sparkles size={20} className="text-amber-400" />الزبدة — أهم 5 نقاط بتقريرك</h2>
            <ol className="space-y-3">
              {zubda.map((z, i) => (
                <li key={i} className="flex items-start gap-3 card-soft p-3.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-400/15 text-amber-300 text-sm font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div><p className="font-extrabold text-[15px]">{z.t}</p><p className="text-xs text-gray-400 mt-0.5">{z.s}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══ قراءة صريحة ═══ */}
        <section data-pdf-break>
          <SectionHead icon={Brain} kicker="تشخيصك" title="قراءة صريحة لوضعك المالي" sub="بدون مجاملة وبدون تخويف — وين أنت قوي، ووين تحتاج تشتغل." />
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="card p-6 lg:col-span-2">
              {report.reality_check && <p className="text-base text-gray-200 leading-loose mb-4">{report.reality_check}</p>}
              {report.diagnosis && <p className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm text-amber-100 font-bold leading-relaxed mb-5">🎯 {report.diagnosis}</p>}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-extrabold text-emerald-400 mb-2.5">💪 نقاط قوتك</p>
                  <div className="space-y-2.5">
                    {strengths.map((s, i) => (
                      <div key={i} className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-3.5">
                        <p className="text-sm font-extrabold mb-1">{s.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-amber-300 mb-2.5">🔧 وش تحتاج تصلح</p>
                  <div className="space-y-2.5">
                    {weaknesses.map((w, i) => (
                      <div key={i} className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-3.5">
                        <p className="text-sm font-extrabold mb-1">{w.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed"><b className="text-amber-300">الحل: </b>{w.fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              {report.money_personality && (
                <div className="card p-6">
                  <p className="text-xs text-gray-400 font-bold mb-1">شخصيتك المالية</p>
                  <p className="text-2xl font-extrabold text-amber-300 mb-2">{report.money_personality.type}</p>
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">{report.money_personality.desc}</p>
                  <p className="text-xs rounded-lg bg-white/[0.04] p-3 text-gray-200 leading-relaxed">💡 {report.money_personality.advice}</p>
                </div>
              )}
              {!alreadyMillion && report.daily_cost ? (
                <div className="card p-6">
                  <p className="text-xs text-gray-400 font-bold mb-2 flex items-center gap-1.5"><Coffee size={14} />المليون بلغة يومية</p>
                  <p className="text-3xl font-extrabold tabular-nums text-emerald-400">{formatNumber(report.daily_cost)} <span className="text-sm text-gray-400">{SAR} باليوم</span></p>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">هذا اللي تحتاج "تحطه جانب" كل يوم على وضعك الحالي عشان توصل. أقل من وجبة غدا.</p>
                </div>
              ) : null}
              {risks.length > 0 && (
                <div className="card p-6">
                  <p className="text-sm font-extrabold mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-red-400" />المخاطر وكيف تحمي نفسك</p>
                  <div className="space-y-3">
                    {risks.map((r, i) => (
                      <div key={i}>
                        <p className="text-sm font-bold flex items-center gap-2">{r.risk}<span className={`text-[10px] px-2 py-0.5 rounded-full ${r.impact === 'عالي' ? 'bg-red-400/15 text-red-300' : 'bg-amber-400/15 text-amber-300'}`}>{r.impact}</span></p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.mitigation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══ القسم الأول: التدفقات ═══ */}
        <section id="flows" data-pdf-break className="scroll-mt-36">
          <SectionHead icon={PieChart} kicker="القسم الأول: الهندسة العكسية للميزانية"
            title="تشخيص التدفقات وقاعدة الادخار المعدّلة لك"
            sub={`نقارن توزيع راتبك الحالي بالنموذج المستهدف، ونكشف التسريبات اللي تاكل من ثروتك بهدوء.`}
            side={<SideTag icon={Scissors}>الهدف: تحرير {formatNumber(flow.recovery)} {SAR} بالشهر بدون ما تحس</SideTag>} />
          <div className="grid lg:grid-cols-[1.25fr_1fr] gap-5">
            <div className="card p-5 lg:p-7">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h3 className="text-lg font-extrabold">وضعك الحالي مقابل النموذج المستهدف</h3>
                <span className="text-xs text-gray-400">الراتب: <Num>{formatNumber(flow.S)}</Num> {SAR}</span>
              </div>
              <p className="text-sm text-gray-400 mb-2">توزيع راتبك الحين</p>
              <div className="flex h-9 rounded-xl overflow-hidden text-[11px] lg:text-xs font-extrabold mb-1">
                <div className="bg-amber-500 text-ink-950 flex items-center justify-center" style={{ width: `${Math.max(flow.expensePct, 8)}%` }}>مصاريف {flow.expensePct}٪</div>
                <div className="bg-emerald-500 text-ink-950 flex items-center justify-center" style={{ width: `${Math.max(100 - flow.expensePct, 8)}%` }}>ادخار {Math.max(0, 100 - flow.expensePct)}٪</div>
              </div>
              <p className="text-[11px] text-gray-500 mb-6">مصاريف <Num>{formatNumber(flow.E)}</Num> {SAR} · ادخار <Num>{formatNumber(Math.max(0, flow.M))}</Num> {SAR}</p>

              <p className="text-sm text-gray-400 mb-2">النموذج المستهدف لك (احتياجات / رغبات / ادخار)</p>
              <div className="flex h-9 rounded-xl overflow-hidden text-[11px] lg:text-xs font-extrabold mb-1">
                <div className="bg-blue-500 text-white flex items-center justify-center" style={{ width: `${flow.target.needs}%` }}>أساسيات {flow.target.needs}٪</div>
                <div className="bg-amber-400 text-ink-950 flex items-center justify-center" style={{ width: `${Math.max(flow.target.wants, 10)}%` }}>رغبات {flow.target.wants}٪</div>
                <div className="bg-emerald-500 text-ink-950 flex items-center justify-center" style={{ width: `${flow.target.save}%` }}>استثمار {flow.target.save}٪</div>
              </div>
              <p className="text-[11px] text-gray-500 mb-5">
                أساسيات <Num>{formatNumber(flow.S * flow.target.needs / 100)}</Num> · رغبات <Num>{formatNumber(flow.S * flow.target.wants / 100)}</Num> · استثمار <Num>{formatNumber(flow.S * flow.target.save / 100)}</Num> {SAR}
              </p>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                القاعدة المشهورة 50/30/20 تقول ادخر 20٪ على الأقل. بس اللي يبي يوصل أسرع لازم يخلط أقل بين <b className="text-white">"اللي أحتاجه"</b> و<b className="text-white">"اللي أبيه"</b>. هالنموذج مفصّل على راتبك: نرفع الاستثمار لـ{flow.target.save}٪ من نفس المصاريف — بدون حرمان.
              </p>

              <div className="rounded-2xl border border-white/[0.08] bg-ink-900/60 p-4 lg:p-5">
                <p className="font-extrabold text-amber-300 mb-3 flex items-center gap-2"><Sparkles size={16} />معادلة استرداد الـ{formatNumber(flow.recovery)} {SAR} خطوة بخطوة</p>
                <div className="grid sm:grid-cols-3 gap-2.5">
                  {flow.items.map((it, i) => (
                    <div key={i} className="card-soft p-3.5">
                      <p className="text-xs text-gray-300 mb-1.5 leading-relaxed">{i + 1}. {it.title}</p>
                      <p className="text-sm font-extrabold text-emerald-400 tabular-nums">+{formatNumber(it.amount)} {SAR} / شهرياً</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-5 lg:p-7">
              <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2"><Scissors size={18} className="text-red-400" />تقرير تسريبات السيولة</h3>
              <p className="text-xs text-gray-400 mb-5">من أرقامك، هذي أكثر الأشياء اللي تبطّئك:</p>
              <div className="space-y-3">
                {flow.leaks.map((l, i) => (
                  <div key={i} className={`rounded-2xl border p-4 ${l.tone === 'red' ? 'border-red-400/20 bg-red-400/[0.04]' : l.tone === 'amber' ? 'border-amber-400/20 bg-amber-400/[0.04]' : 'border-emerald-400/20 bg-emerald-400/[0.04]'}`}>
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <p className={`text-sm font-extrabold ${l.tone === 'red' ? 'text-red-300' : l.tone === 'amber' ? 'text-amber-300' : 'text-emerald-300'}`}>{i + 1}. {l.title}</p>
                      <span className={`text-[11px] font-extrabold shrink-0 tabular-nums ${l.tone === 'red' ? 'text-red-300' : l.tone === 'amber' ? 'text-amber-300' : 'text-emerald-300'}`}>{l.cost}</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{l.body}</p>
                  </div>
                ))}
              </div>
              {report.expense_analysis && (
                <div className="mt-5 pt-5 border-t border-white/[0.06]">
                  <p className="text-sm font-extrabold mb-3">وين تروح مصاريفك عادة؟ <span className="text-[11px] text-gray-500 font-bold">(تقدير بالنسب الشائعة)</span></p>
                  <div className="space-y-2.5">
                    {report.expense_analysis.map((e, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1"><span className="font-bold">{e.category}</span><Num className="text-gray-400">~{formatNumber(e.amount)} {SAR}</Num></div>
                        <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden"><div className="h-full bg-amber-400/80 rounded-full" style={{ width: `${e.pct * 2.5}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <BudgetDetail lines={ext.budget} S={flow.S} />
        </section>

        <PrioritiesAndDebt steps={ext.steps} debt={ext.debt} S={flow.S} />

        {/* ═══ القسم الثالث: السيناريوهات ═══ */}
        <section id="scenarios" data-pdf-break className="scroll-mt-36">
          <SectionHead icon={TrendingUp} tone="green" kicker="القسم الثالث: محاكاة التراكم المركب"
            title="مصفوفة السيناريوهات وجدول التدفق السنوي"
            sub="٣ طرق توصلك للمليون — وكم سنة من عمرك توفرها كل وحدة."
            side={<SideTag icon={Calculator} tone="gray">مبنية على الفائدة المركبة شهرياً</SideTag>} />
          <div className="grid lg:grid-cols-3 gap-4 mb-5">
            {sc.map((s) => {
              const gold = s.key === 'C'
              return (
                <div key={s.key} className={`relative rounded-3xl p-5 lg:p-6 flex flex-col ${gold ? 'border-2 border-amber-400/70 lg:order-none' : s.key === 'B' ? 'border border-emerald-400/20 bg-ink-800' : 'card'}`}
                  style={gold ? { background: 'linear-gradient(170deg, rgba(245,158,11,0.16), rgba(245,158,11,0.02) 55%), #1A212B' } : undefined}>
                  {gold && <span className="absolute -top-3 right-1/2 translate-x-1/2 chip bg-amber-400 text-ink-950 whitespace-nowrap">الخيار الأسرع اللي نوصي فيه</span>}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`chip border ${gold ? 'bg-amber-400/15 text-amber-200 border-amber-400/30' : 'bg-white/[0.04] text-gray-300 border-white/10'}`}>{s.tag}</span>
                    <span className={`text-xs font-bold ${gold ? 'text-amber-300' : s.key === 'B' ? 'text-emerald-400' : 'text-red-300'}`}>{gold ? '⚡ خارق' : s.key === 'B' ? 'المسار الذكي' : 'بطيء ومستهلك'}</span>
                  </div>
                  <h3 className={`text-lg font-extrabold mb-2 ${gold ? 'text-amber-200' : ''}`}>{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-5">{s.desc}</p>
                  <div className={`mt-auto rounded-2xl p-4 text-center ${gold ? 'bg-amber-400/15' : 'bg-ink-950/60'}`}>
                    <p className="text-xs text-gray-400 mb-1">الزمن للوصول</p>
                    <p className={`text-2xl lg:text-[28px] font-extrabold ${gold ? 'text-amber-300' : s.key === 'B' ? 'text-emerald-400' : 'text-white'}`}>{dur(s.months)}</p>
                  </div>
                  {s.note && <p className={`text-xs font-bold text-center mt-3 ${s.key === 'A' ? 'text-red-300/80' : 'text-emerald-400'}`}>{s.note}</p>}
                </div>
              )
            })}
          </div>

          {table.length > 0 && (
            <div className="card p-4 lg:p-7 mb-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-lg font-extrabold flex items-center gap-2"><Table2 size={18} className="text-amber-400" />جدول التدفق السنوي للمسار المسرّع</h3>
                <span className="text-xs text-gray-500">استثمار <Num>{formatNumber(best.monthly)}</Num> {SAR}/شهر بعائد {best.rate}٪</span>
              </div>
              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs border-b border-white/[0.08]">
                      <th className="text-right font-bold py-3">المرحلة</th>
                      <th className="text-right font-bold py-3">من جيبك</th>
                      <th className="text-right font-bold py-3">أرباح التراكم</th>
                      <th className="text-right font-bold py-3">صافي الثروة</th>
                      <th className="text-center font-bold py-3">الإنجاز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.map((r, i) => (
                      <tr key={i} className={`border-b border-white/[0.05] ${r.final ? 'bg-amber-400/[0.08]' : ''}`}>
                        <td className={`py-3 font-extrabold ${r.final ? 'text-amber-300' : ''}`}>
                          <span className={`inline-block w-2 h-2 rounded-full ml-2 ${r.final ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          {r.final && r.monthLabel ? `بعد ${r.monthLabel}` : `نهاية السنة ${r.year}`}
                        </td>
                        <td className="py-3 text-gray-300"><Num>{formatNumber(r.deposits)}</Num></td>
                        <td className="py-3 text-emerald-400 font-bold"><Num>+{formatNumber(r.gains)}</Num></td>
                        <td className={`py-3 font-extrabold ${r.final ? 'text-emerald-400 text-base' : ''}`}><Num>{formatNumber(r.total)}</Num></td>
                        <td className="py-3 text-center">
                          <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${r.final ? 'bg-amber-400 text-ink-950' : r.tag === 'تراكم' || r.tag === 'الانطلاقة' ? 'bg-white/[0.05] text-gray-400' : 'bg-emerald-400/10 text-emerald-400'}`}>{r.tag}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {split.gains > 0 && (
                <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                  * لاحظ: من المليون، <b className="text-white"><Num>{formatNumber(split.contributions)}</Num> {SAR}</b> من جيبك و<b className="text-emerald-400"><Num>{formatNumber(split.gains)}</Num> {SAR}</b> أرباح تراكمية. وكل ما تقدمت السنين، العائد يشتغل أكثر منك — هذي القوة الحقيقية للفائدة المركبة.
                </p>
              )}
            </div>
          )}

          <SensitivityGrid grid={ext.grid} userRate={data.rate} bestExtra={best.monthly - Math.max(0, data.monthlySaving)} bestRate={best.rate} />

          {/* الحاسبة العكسية */}
          <div className="h-5" />
          <div className="card p-5 lg:p-7 grid lg:grid-cols-[1fr_1fr] gap-6 items-center">
            <div>
              <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2"><Target size={18} className="text-amber-400" />الحاسبة العكسية: حدد متى تبي توصل</h3>
              <p className="text-sm text-gray-400 mb-5">حرّك المؤشر ونقولك كم لازم تستثمر بالشهر.</p>
              <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">أبي أوصل خلال</span><span className="font-extrabold text-amber-300">{targetYears} سنة</span></div>
              <input type="range" min={3} max={25} value={targetYears} onChange={(e) => setTargetYears(Number(e.target.value))}
                className="range w-full mb-5" style={{ ['--fill' as string]: `${((targetYears - 3) / 22) * 100}%` } as React.CSSProperties} aria-label="عدد السنوات" />
              <p className="text-sm text-gray-400 mb-2">بعائد سنوي</p>
              <div className="flex gap-2">
                {[4, 7, 9].map((r) => (
                  <button key={r} onClick={() => setCalcRate(r)} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${calcRate === r ? 'bg-amber-400 text-ink-950 border-amber-400' : 'border-white/10 text-gray-300'}`}>
                    {r}٪ {r === 4 ? 'ادخار' : r === 7 ? 'متوازن' : 'نمو'}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-ink-950/60 border border-white/[0.06] p-6 text-center">
              <p className="text-sm text-gray-400 mb-1">تحتاج تستثمر شهرياً</p>
              <p className="text-4xl font-extrabold text-amber-grad tabular-nums mb-2">{formatNumber(req)} <span className="text-base">{SAR}</span></p>
              {alreadyMillion ? <p className="text-sm text-emerald-400 font-bold">أنت فعلاً فوق المليون 🎉</p>
                : reqGap > 0 ? <p className="text-sm text-gray-300">يعني <b className="text-amber-300 tabular-nums">{formatNumber(reqGap)} {SAR}</b> فوق ادخارك الحالي — قناة دخل جانبية تسد جزء كبير منها.</p>
                : <p className="text-sm text-emerald-400 font-bold">ادخارك الحالي يكفي — بس لازم يتحول من ادخار إلى استثمار.</p>}
            </div>
          </div>
          <Takeaway>الفرق بين السيناريو أ وج مو راتب أعلى — هو {formatNumber(flow.recovery)} {SAR} تحررها + {formatNumber(SIDE_INCOME)} {SAR} دخل جانبي + استثمار تلقائي. ثلاث قرارات تاخذها مرة وحدة، والفائدة المركبة تكمل الباقي.</Takeaway>
        </section>

        <TimeAndRisk delay={ext.delay} doubleYears={rule72(best.rate)} rate={best.rate} stress={ext.stress} inflation={ext.infl} base={best.months} smt={ext.smt} netWorth={data.netWorth} />

        {/* ═══ القسم الخامس: توزيع الأصول ═══ */}
        <section id="assets" data-pdf-break className="scroll-mt-36">
          <SectionHead icon={Wallet} kicker="القسم الخامس: توزيع الأصول ومنصات التنفيذ"
            title="استراتيجية توزيع محفظتك في السوق السعودي"
            sub="محفظة نمو متوازنة متوافقة مع الضوابط الشرعية، موزعة على ٤ فئات — بالمبالغ من استثمارك الشهري."
            side={<SideTag icon={ShieldCheck}>تأكد إن أي منصة مرخصة من هيئة السوق المالية قبل ما تفتح حساب</SideTag>} />

          {emergencyGap > 0 && (
            <div className="rounded-2xl border border-red-400/25 bg-red-400/[0.05] p-4 lg:p-5 mb-5 flex items-start gap-3">
              <ShieldCheck size={22} className="text-red-300 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-200 leading-relaxed"><b className="text-red-300">قبل أي استثمار:</b> كمّل صندوق الطوارئ (<Num>{formatNumber(flow.emergencyNeed)}</Num> {SAR} = 6 شهور مصاريف) بحساب ادخار أو صندوق مرابحة سهل السحب. ناقصك <b className="tabular-nums">{formatNumber(emergencyGap)} {SAR}</b> — بمعدل {formatNumber(investMonthly)} {SAR} بالشهر تخلصه خلال {dur(Math.ceil(emergencyGap / Math.max(1, investMonthly)))}، وبعدها تبدأ التوزيع اللي تحت.</p>
            </div>
          )}

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
            <div className="space-y-3">
              {BUCKETS.map((b, i) => {
                const Icon = [Globe2, Building2, Landmark, Building][i]
                return (
                  <div key={b.name} className="card p-5">
                    <div className="flex items-start gap-4">
                      <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: b.color + '22', color: b.color }}><Icon size={20} /></span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                          <h3 className="font-extrabold">{i + 1}. {b.name} ({b.pct}٪)</h3>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg tabular-nums" style={{ background: b.color + '18', color: b.color }}>عائد تاريخي: {b.range}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">نصيبه من خطتك: <b className="text-white tabular-nums">{formatNumber(Math.round(investMonthly * b.pct / 100))} {SAR}</b> شهرياً</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{b.desc}</p>
                        <p className="text-[11px] text-gray-500 mt-2">{b.examples}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-extrabold text-center mb-1">الوزن النسبي لمحفظتك</h3>
              <p className="text-xs text-gray-400 text-center mb-5">استثمار شهري <Num>{formatNumber(investMonthly)}</Num> {SAR}</p>
              <Donut center={`${blended}٪`} />
              <div className="space-y-2 mt-6">
                {BUCKETS.map((b) => (
                  <div key={b.name} className="flex items-center justify-between gap-2 card-soft px-3 py-2.5 text-xs">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: b.color }} />{b.name}</span>
                    <b className="tabular-nums" style={{ color: b.color }}>{b.pct}٪</b>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <p className="text-sm font-extrabold mb-3">وين تنفّذ؟ (أمثلة لمنصات سعودية)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    ['دراية / الراجحي المالية', 'أسهم وصناديق محلية وعالمية'],
                    ['سهم كابيتال', 'تداول أسهم أمريكية وسعودية'],
                    ['أبيان المالية', 'استثمار آلي (روبو أدفايزر)'],
                    ['صكوك «صح»', 'ادخار حكومي بعائد ثابت'],
                  ].map(([n, d]) => (
                    <div key={n} className="card-soft p-2.5 flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" /><span><b>{n}</b><br /><span className="text-gray-400">{d}</span></span></div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">أمثلة للتوضيح مو توصية. تحقق من الترخيص على موقع هيئة السوق المالية cma.org.sa، وقارن الرسوم قبل ما تختار.</p>
              </div>
            </div>
          </div>
          <Takeaway>ابدأ بالبسيط: صندوق مؤشر عالمي متوافق + صندوق مؤشر سعودي + صكوك. أعد التوازن مرة بالسنة، ولا تغيّر الأوزان بسبب الأخبار.</Takeaway>
        </section>

        <ZakatRetirementProtection zakat={ext.zakat} S={flow.S} />

        {/* ═══ القسم السابع: الدخل الجانبي ═══ */}
        {ideas.length > 0 && (
          <section id="income" data-pdf-break className="scroll-mt-36">
            <SectionHead icon={Rocket} kicker="القسم السابع: محرك تسريع الدخل"
              title="أفكار دخل جانبي تناسب وضعك"
              sub="أفكار عملية تقدر تبدأها جنب وظيفتك برأس مال صغير — مع أول خطوة لكل وحدة."
              side={<SideTag icon={Target} tone="green">الهدف: +{formatNumber(SIDE_INCOME)} {SAR} بالشهر تنضاف لمحفظتك</SideTag>} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea, i) => {
                const steps = (idea.how_to_start || '').split('\n').map((s) => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean).slice(0, 4)
                const easy = /سهل/.test(idea.difficulty)
                return (
                  <div key={i} className={`rounded-3xl p-5 flex flex-col border ${i === 0 ? 'border-amber-400/30 bg-ink-800' : easy ? 'border-emerald-400/15 bg-ink-800' : 'card'}`}>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`chip ${i === 0 ? 'bg-amber-400/15 text-amber-300' : easy ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/[0.05] text-gray-300'}`}>{i === 0 ? '🔥 أنسب بداية لك' : idea.difficulty}</span>
                      <Lightbulb size={16} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-extrabold mb-2 leading-snug">{idea.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-5">{idea.description}</p>
                    <div className="rounded-xl bg-ink-950/60 border border-white/[0.06] p-3 mb-4 text-xs space-y-1.5">
                      <div className="flex justify-between gap-2"><span className="text-gray-400">العائد المتوقع</span><b className="text-emerald-400 text-left">{idea.potential}</b></div>
                      <div className="flex justify-between gap-2"><span className="text-gray-400">الصعوبة</span><b>{idea.difficulty}</b></div>
                    </div>
                    {steps.length > 0 && (
                      <div className="mt-auto pt-3 border-t border-white/[0.06]">
                        <p className="text-xs font-extrabold text-amber-300 mb-2">خطة الانطلاق:</p>
                        <ol className="space-y-1 text-xs text-gray-300">
                          {steps.map((s, j) => <li key={j} className="leading-relaxed">{j + 1}. {s}</li>)}
                        </ol>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* عرض الدليل */}
            <div className="mt-6 rounded-3xl border-2 border-amber-400/50 p-6 lg:p-10 no-print"
              style={{ background: 'radial-gradient(100% 120% at 100% 0%, rgba(245,158,11,0.16), transparent 55%), #1A212B' }}>
              <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
                <div>
                  <span className="chip bg-amber-400/15 text-amber-300 border border-amber-400/30 mb-4"><Briefcase size={13} />الخطوة اللي بعد التقرير</span>
                  <h3 className="text-2xl lg:text-4xl font-extrabold leading-tight mb-3">دليل الـ100 فكرة مشروع للسوق السعودي</h3>
                  <p className="text-sm lg:text-base text-gray-300 leading-relaxed mb-5">التقرير عطاك الاتجاه. الدليل يعطيك الفكرة اللي تناسب ميزانيتك ووقتك — مع رأس المال، والربح المتوقع، وخطة اليوم الأول لكل فكرة.</p>
                  <div className="grid sm:grid-cols-2 gap-2.5 mb-6">
                    {['100 فكرة مع خطوات تنفيذ', 'رأس المال والربح لكل فكرة', 'خطة اليوم الأول', 'فلترة حسب رأس المال'].map((f) => (
                      <div key={f} className="card-soft px-3 py-2.5 text-sm font-bold flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400 shrink-0" />{f}</div>
                    ))}
                  </div>
                  <Link href="/ideas-checkout" className="btn-primary px-6 py-3.5 text-base">افتح الدليل الكامل — 49 {SAR} <ChevronLeft size={18} /></Link>
                  <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5"><Lock size={12} />دفع آمن عبر Paymob · وصول فوري</p>
                </div>
                <div className="card p-5">
                  <p className="text-xs text-gray-400 mb-2">ليش يستاهل؟</p>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    لو الدليل ساعدك تطلع بس <b className="text-amber-300">{formatNumber(SIDE_INCOME)} {SAR}</b> بالشهر، هذا يختصر طريقك للمليون{' '}
                    <b className="text-emerald-400">{sc[1].months < NEVER && C < sc[1].months ? dur(sc[1].months - C) : 'سنين'}</b> — مقابل 49 ريال مرة وحدة.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <MoneyPsychology />

        {/* ═══ القسم التاسع: الأدوات ═══ */}
        <section id="tools" data-pdf-break className="scroll-mt-36">
          <SectionHead icon={Briefcase} kicker="القسم التاسع: الحزمة المرفقة"
            title="صندوق أدواتك لتسريع الثروة"
            sub="أدوات جاهزة مفصّلة على أرقامك — حمّلها وابدأ التطبيق اليوم."
            side={<SideTag icon={Sparkles} tone="amber">مضمّنة مع تقريرك بدون أي تكلفة إضافية</SideTag>} />
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="card p-6 flex flex-col">
              <span className="w-12 h-12 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center mb-4"><FileSpreadsheet size={22} /></span>
              <h3 className="text-lg font-extrabold mb-2">شيت تتبّع ثروتك (36 شهر)</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">ملف Excel فيه خطتك شهر بشهر: الادخار المخطط والثروة المتوقعة. تعبّي الفعلي كل شهر والشيت يحسب لك الفرق تلقائياً.</p>
              <button onClick={() => downloadFile('متتبع-الثروة-saudimillion.csv', trackerCsv(data, investMonthly, best.rate), 'text/csv;charset=utf-8')}
                className="mt-auto no-print w-full py-3 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-400/10 transition-colors">
                <Download size={16} /> حمّل الشيت (Excel)
              </button>
            </div>
            <div className="card p-6 flex flex-col">
              <span className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-4"><BellRing size={22} /></span>
              <h3 className="text-lg font-extrabold mb-2">تذكير "يوم المليون" الشهري</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">تذكير يتكرر يوم 27 من كل شهر في تقويم جوالك: "حوّل {formatNumber(investMonthly)} {SAR} قبل لا تصرف". أكثر شي يفرّق بين اللي يوصل واللي ما يوصل هو الاستمرار.</p>
              <button onClick={() => downloadFile('تذكير-يوم-المليون.ics', reminderIcs(investMonthly), 'text/calendar;charset=utf-8')}
                className="mt-auto no-print w-full py-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] text-amber-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-400/10 transition-colors">
                <CalendarDays size={16} /> أضفه لتقويمي
              </button>
            </div>
            <div className="card p-6 flex flex-col">
              <span className="w-12 h-12 rounded-xl bg-blue-400/10 text-blue-400 flex items-center justify-center mb-4"><Flame size={22} /></span>
              <h3 className="text-lg font-extrabold mb-2">رقم استقلالك المالي (FIRE)</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">المبلغ اللي لو وصلته، عوائده تغطي مصاريفك (<Num>{formatNumber(flow.E)}</Num> {SAR}/شهر) بدون ما تحتاج راتب — حسب قاعدة السحب الآمن 4٪.</p>
              <div className="mt-auto rounded-xl bg-ink-950/60 border border-white/[0.06] p-4 text-center">
                <p className="text-3xl font-extrabold text-blue-300 tabular-nums">{formatNumber(fireNumber)} <span className="text-sm">{SAR}</span></p>
                <p className="text-xs text-gray-400 mt-1">{fireMonths === 0 ? 'وصلته فعلاً 🎉' : fireMonths >= NEVER ? 'تحتاج ترفع استثمارك الشهري' : `بالمسار المسرّع توصله خلال ${dur(fireMonths)}`}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ القسم السادس: خطة ٩٠ يوم ═══ */}
        <section id="plan" data-pdf-break className="scroll-mt-36">
          <SectionHead icon={Flag} tone="green" kicker="القسم العاشر: خارطة التنفيذ"
            title="خطة العمل لأول 90 يوم (خطوة بخطوة)"
            sub="٣ مراحل شهرية واضحة — مهمة وحدة بكل مرة عشان ما تتشتت."
            side={<SideTag icon={Zap} tone="gray">ابدأ من بكرة</SideTag>} />
          <div className="grid lg:grid-cols-3 gap-4 mb-5">
            {[
              { badge: 'الشهر الأول (الأيام 1–30)', icon: ShieldCheck, color: 'emerald', title: 'وقف النزيف وابنِ الأساس', goal: 'تحرير السيولة الضايعة وتأمين الطوارئ',
                items: [
                  `افتح حساب ادخار منفصل وفعّل أمر تحويل دائم يوم 27 بمبلغ ${formatNumber(Math.max(0, data.monthlySaving))} ${SAR}`,
                  `راجع كشف آخر 3 شهور وألغِ اشتراكات بقيمة ${formatNumber(flow.items[0].amount)} ${SAR}+`,
                  `حط سقف للتوصيل والكوفي يحرر ${formatNumber(flow.items[1].amount)} ${SAR} بالشهر`,
                  emergencyGap > 0 ? `وجّه الفائض لصندوق الطوارئ (ناقصه ${formatNumber(emergencyGap)} ${SAR})` : 'صندوق طوارئك مكتمل — خله بحساب منفصل وما تلمسه',
                ] },
              { badge: 'الشهر الثاني (الأيام 31–60)', icon: PieChart, color: 'amber', title: 'أتمتة الاستثمار', goal: 'تشغيل محرك الفائدة المركبة رسمياً',
                items: [
                  'افتح محفظة استثمارية عند وسيط مرخص (قارن الرسوم أول)',
                  `ضخ أول دفعة ${formatNumber(investMonthly)} ${SAR} حسب أوزان المحفظة (40/25/20/15)`,
                  flow.cash > flow.emergencyNeed ? `انقل الكاش الزايد (${formatNumber(flow.cash - flow.emergencyNeed)} ${SAR}) لصكوك أو صندوق مرابحة` : 'فعّل الاستثمار الدوري الشهري التلقائي إن كانت المنصة تدعمه',
                  'حمّل شيت التتبّع وسجّل أول شهر',
                ] },
              { badge: 'الشهر الثالث (الأيام 61–90)', icon: Rocket, color: 'amber', title: 'إطلاق أول قناة دخل جانبي', goal: `أول ${formatNumber(SIDE_INCOME)} ${SAR} إضافية للمحفظة`,
                items: [
                  `اختر فكرة وحدة من القسم السابع${ideas[0] ? ` (مثل: ${ideas[0].title})` : ''}`,
                  'جهّز عرض بسيط أو نموذج تجريبي وكلّم أول 10 عملاء محتملين',
                  'كل ريال من الدخل الجانبي يروح للمحفظة مباشرة — مو للمصاريف',
                  'راجع شيت التتبّع: كم سبقت الخطة أو تأخرت؟',
                ] },
            ].map((p, i) => {
              const Icon = p.icon
              const green = p.color === 'emerald'
              return (
                <div key={i} className={`rounded-3xl p-5 lg:p-6 border ${green ? 'border-emerald-400/20' : 'border-amber-400/20'} bg-ink-800`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`chip ${green ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-300'}`}>{p.badge}</span>
                    <Icon size={20} className={green ? 'text-emerald-400' : 'text-amber-400'} />
                  </div>
                  <h3 className="text-xl font-extrabold mb-1">{p.title}</h3>
                  <p className="text-xs text-gray-400 mb-4">الهدف: {p.goal}</p>
                  <ul className="space-y-2.5">
                    {p.items.map((it, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-200 leading-relaxed"><CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${green ? 'text-emerald-400' : 'text-amber-400'}`} />{it}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {report.monthly_plan && report.monthly_plan.length > 0 && (
            <div className="card p-5 lg:p-7">
              <h3 className="text-lg font-extrabold mb-4">تفصيل الشهر الأول — أسبوع بأسبوع</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {report.monthly_plan.map((w, i) => (
                  <div key={i} className="card-soft p-4">
                    <p className="text-xs font-extrabold text-amber-300 mb-1.5">{w.week}</p>
                    <p className="text-sm font-bold mb-1.5 leading-relaxed">{w.task}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{w.why}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Takeaway>لا تحاول تسوي كل شي بأسبوع. مهمة وحدة بكل مرة، وعلّم عليها. بعد 90 يوم بتكون سبقت أغلب الناس اللي حولك.</Takeaway>
        </section>

        {/* ═══ عقلية المليون ═══ */}
        {report.mindset_tips && report.mindset_tips.length > 0 && (
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {report.mindset_tips.map((t, i) => (
              <div key={i} className="card-soft p-4 text-sm text-gray-200 leading-relaxed font-bold"><span className="text-amber-400 ml-1">❝</span>{t}</div>
            ))}
          </section>
        )}

        <KpiReview items={ext.kpi} />

        <GlossaryFaqSources />

        {/* ═══ الختام ═══ */}
        <section data-pdf-break className="rounded-3xl border border-amber-400/25 p-6 lg:p-10 grid lg:grid-cols-[1fr_340px] gap-8 items-center"
          style={{ background: 'radial-gradient(90% 100% at 100% 0%, rgba(16,185,129,0.08), transparent 60%), #1A212B' }}>
          <div>
            <p className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-3"><span className="w-2 h-2 rounded-full bg-emerald-400" />وثيقة خطتك المالية</p>
            <h2 className="text-2xl lg:text-4xl font-extrabold leading-tight mb-4">الحين عندك الخارطة اللي أغلب الناس ما يرسمونها أبداً</h2>
            <p className="text-sm lg:text-base text-gray-300 leading-loose mb-6">{report.closing_message}</p>
            <div className="flex flex-wrap gap-3 no-print">
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"><MessageCircle size={17} />شارك إنجازك عبر واتساب</a>
              <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
                className="btn-ghost px-5 py-3 text-sm"><Share2 size={17} />شارك على X</a>
              <Link href="/calculator" className="btn-ghost px-5 py-3 text-sm"><Calculator size={17} />أعد الحساب بأرقام ثانية</Link>
            </div>
          </div>
          <div className="card p-6 text-center">
            <span className="w-16 h-16 rounded-full border-2 border-amber-400/60 bg-amber-400/10 text-amber-300 flex items-center justify-center mx-auto mb-4 animate-glow"><BadgeCheck size={30} /></span>
            <p className="text-lg font-extrabold">تقرير شخصي مخصص</p>
            <p className="text-xs text-gray-400 tracking-widest mt-1 tabular-nums" dir="ltr">{id}</p>
            <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-white/[0.06] leading-relaxed">ارجع له كل 3 شهور وحدّث أرقامك — كل ما زاد استثمارك، تقصر المدة.</p>
          </div>
        </section>

        {/* إخلاء المسؤولية */}
        <section className="card-soft p-5 lg:p-6 flex items-start gap-3">
          <Gavel size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-amber-300 mb-1.5 flex items-center gap-2"><Scale size={14} />إخلاء المسؤولية</p>
            <p className="text-xs text-gray-400 leading-loose">
              هالتقرير للتخطيط المالي والتوعية فقط، ومبني على الأرقام اللي دخلتها وافتراضات عوائد تاريخية تقريبية. ما يعتبر توصية بشراء أو بيع أي ورقة مالية، والعوائد الماضية ما تضمن العوائد المستقبلية. الأمثلة على المنصات والصناديق للتوضيح فقط. استشر مستشار مالي مرخّص قبل أي قرار استثماري كبير.
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
